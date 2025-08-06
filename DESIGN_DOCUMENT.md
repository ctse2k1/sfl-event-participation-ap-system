# Design Document - SFL Event Participation AP System

## Architecture Overview
![System Architecture Diagram] 
*(Diagram placeholder - to be rendered during implementation)*

The SFL Event Participation AP System follows a three-layer architecture:
1. **Presentation Layer**: Discord.js command handlers
2. **Business Logic**: Event/points processing engines  
3. **Data Layer**: JSON file storage

Built using TypeScript and Discord.js v14 with:
- Strict type checking
- Modular component design
- Ephemeral response patterns
- Automated backup system

## System Components

### 1. Command Structure

The bot uses Discord.js's slash command system with a hierarchical command structure:

```
/event
  ├── start [event_id]
  ├── join [code]
  ├── stop
  ├── kick [member]
  ├── list
  ├── me
  ├── id
  ├── summary
  ├── records
  └── reset
```

All commands are implemented as subcommands under the main `/event` command, providing a unified interface for users.

### 2. Directory Structure

```
src/
├── commands/
│   ├── event.ts                # Main command definition
│   └── subcommands/            # Individual subcommand implementations
│       ├── id.ts
│       ├── join.ts
│       ├── kick.ts
│       ├── list.ts
│       ├── me.ts
│       ├── records.ts
│       ├── reset.ts
│       ├── start.ts
│       ├── stop.ts
│       └── summary.ts
├── utils/
│   ├── dataManager.ts          # Data persistence utilities
│   ├── eventUtils.ts           # Event-related helper functions
│   └── userUtils.ts            # User-related helper functions
├── types/
│   └── index.ts                # TypeScript type definitions
├── config.ts                   # Configuration loading
├── deploy-commands.ts          # Command registration script
└── index.ts                    # Main bot entry point
```

### 3. Data Models

#### 3.1 Event Configuration

```typescript
interface EventConfig {
  event_type: string;
  points_per_minute: number;
}
```

#### 3.2 Active Event

```typescript
interface ActiveEvent {
  event_id: string;
  event_type: string;
  host_id: string;
  join_code: string;
  start_time: number;
  participants: Record<string, {
    join_time: number;
  }>;
}
```

#### 3.3 Event Record

```typescript
interface EventRecord {
  event_id: string;
  event_type: string;
  host_id: string;
  start_time: number;
  end_time: number;
  duration_minutes: number;
  points_earned: number;
  // Legacy format support
  username?: string;
  // New format with display name
  display_name?: string;
}
```

### 4. Data Persistence

Data is stored in JSON files organized by guild ID:

- `data/{guild_id}/active_events.json` - Currently running events
- `data/{guild_id}/event_records.json` - Historical event records
- `data/{guild_id}/user_points.json` - Accumulated user points

The system uses a simple file-based storage system with atomic write operations to prevent data corruption.

## Key Technical Decisions

### 1. Command Response Visibility

All command responses use the `MessageFlags.Ephemeral` flag to make them only visible to the command user. This reduces channel clutter and provides a more personalized experience.

```typescript
await interaction.reply({ 
  content: "Your message here", 
  flags: MessageFlags.Ephemeral 
});
```

### 2. User Identification

The system uses server display names (nicknames) instead of usernames for better user identification:

```typescript
// From userUtils.ts
export function getDisplayName(interaction: CommandInteraction): string {
  if (interaction.member instanceof GuildMember) {
    return interaction.member.displayName;
  }
  return interaction.user.username;
}
```

### 3. Embed Messages

Structured data is presented using Discord embed messages for better readability and visual appeal:

```typescript
const embed = new EmbedBuilder()
  .setTitle('Event Summary')
  .setDescription('Details about the event')
  .setColor(0x00FF00)
  .addFields({ name: 'Field Name', value: 'Field Value' })
  .setTimestamp();

await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
```

### 4. Error Handling

The system implements comprehensive error handling with user-friendly error messages:

```typescript
try {
  // Operation that might fail
} catch (error) {
  console.error('Error details:', error);
  await interaction.reply({ 
    content: '❌ An error occurred: ' + error.message, 
    flags: MessageFlags.Ephemeral 
  });
}
```

## Deployment Architecture

The bot is designed to be deployed as a standalone Node.js application. It requires:

1. A Discord bot token with appropriate permissions
2. Node.js runtime environment (v16.9.0+)
3. File system access for data persistence

## Security Considerations

1. **Token Security**: The Discord token is stored in an environment variable, not in the code
2. **Permission Model**: Commands that modify data require appropriate checks
3. **Input Validation**: All user inputs are validated before processing

## Performance Considerations

1. **Memory Usage**: The bot keeps active events in memory for quick access
2. **File I/O**: Data is persisted to disk only when necessary
3. **Command Processing**: Commands are processed asynchronously to prevent blocking

## Future Enhancements

1. **Database Integration**: Replace file-based storage with a proper database
2. **Web Dashboard**: Add a web interface for event management and statistics
3. **Role Integration**: Automatically assign roles based on activity points
4. **Event Templates**: Allow creation of custom event templates
5. **Scheduled Events**: Support for scheduling events in advance

## Testing Strategy

1. **Unit Tests**: Test individual utility functions and commands
2. **Integration Tests**: Test command interactions with the Discord API
3. **Manual Testing**: Verify user experience and edge cases

## Maintenance Considerations

1. **Logging**: Comprehensive logging for troubleshooting
2. **Version Control**: All changes are tracked in Git with semantic versioning
3. **Documentation**: Code is documented with JSDoc comments
4. **Error Monitoring**: Errors are logged for later analysis