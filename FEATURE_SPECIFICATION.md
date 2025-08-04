# Feature Specification - SFL Event Participation AP System

## Overview

The SFL Event Participation AP System is a Discord bot designed to track participation in community events and award activity points (AP) based on attendance duration. This document outlines the features and functionality of the system.

## Core Features

### 1. Event Management

#### 1.1 Event Creation
- Event hosts can start events using predefined event types
- Each event has a unique ID and join code
- Events track start time, participants, and duration

#### 1.2 Event Participation
- Members can join events using a join code
- System tracks join time for each participant
- Participants can be removed by the event host

#### 1.3 Event Completion
- Event hosts can stop events at any time
- System calculates participation duration for each member
- Activity points are awarded based on duration and event type

### 2. Point System

#### 2.1 Point Calculation
- Points are calculated using the formula: `duration_in_minutes × points_per_minute`
- Different event types have different point rates
- Points are rounded to two decimal places

#### 2.2 Point Tracking
- System maintains a persistent record of all awarded points
- Points are associated with user IDs and persist across sessions
- Historical records include event type, duration, and points earned

### 3. User Interface

#### 3.1 Command Structure
- All functionality is accessed through Discord slash commands
- All commands are subcommands under the main `/event` command
- Command responses are ephemeral (only visible to the command user)

#### 3.2 User Identification
- System uses server display names (nicknames) instead of usernames
- This ensures users are properly identified even if they change their username

## Command Specifications

### `/event start [event_id]`
- **Purpose**: Start a new event and generate a join code
- **Parameters**: 
  - `event_id`: The ID of the event type to start
- **Behavior**:
  - Creates a new event with the specified type
  - Generates a random 6-character join code
  - Adds the command user as the host
  - Returns the join code for sharing with participants

### `/event join [code]`
- **Purpose**: Join an active event using a code
- **Parameters**:
  - `code`: The join code for the event
- **Behavior**:
  - Validates the join code against active events
  - Records the user's join time
  - Prevents users from joining multiple events simultaneously

### `/event stop`
- **Purpose**: Stop an event and calculate points
- **Parameters**: None
- **Behavior**:
  - Verifies the user is hosting an active event
  - Calculates participation duration for all participants
  - Awards points based on duration and event type
  - Saves participation records
  - Removes the event from active events

### `/event kick [member]`
- **Purpose**: Remove a participant from an event
- **Parameters**:
  - `member`: The Discord member to remove
- **Behavior**:
  - Verifies the user is hosting an active event
  - Calculates partial points for the kicked member
  - Removes the member from the event
  - Notifies the kicked member

### `/event list`
- **Purpose**: List all participants in the current event
- **Parameters**: None
- **Behavior**:
  - Verifies the user is hosting an active event
  - Displays all participants with their join times
  - Shows current participation duration

### `/event me`
- **Purpose**: Show personal activity points and event history
- **Parameters**: None
- **Behavior**:
  - Retrieves the user's total activity points
  - Shows recent event participation history
  - Displays points earned per event

### `/event id`
- **Purpose**: List all available event codes and their types
- **Parameters**: None
- **Behavior**:
  - Displays all configured event types
  - Shows event codes in a copy-friendly format
  - Provides event descriptions

### `/event summary`
- **Purpose**: Display the point leaderboard for the server
- **Parameters**: None
- **Behavior**:
  - Retrieves all user points in the server
  - Sorts users by total points
  - Displays a leaderboard with rankings

### `/event records`
- **Purpose**: Show all event participation records
- **Parameters**: None
- **Behavior**:
  - Retrieves the user's event participation history
  - Shows event type, date, duration, and points for each record
  - Limits display to recent events with pagination

### `/event reset`
- **Purpose**: Reset all event data and points
- **Parameters**: None
- **Behavior**:
  - Restricted to users with administrator permissions
  - Clears all event records and points
  - Requires confirmation to prevent accidental resets

## Data Persistence

- All event records and points are stored in JSON files
- Data is organized by guild (server) ID
- Records include user IDs, event types, timestamps, and points

## User Experience Considerations

- All command responses are ephemeral to reduce channel clutter
- Error messages are clear and actionable
- Embed messages are used for structured data presentation
- Code blocks are used for easy copying of event codes