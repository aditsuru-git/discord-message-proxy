### API Documentation for Frontend Dashboard

This document outlines the Socket.IO events and data structures required to build the Discord dashboard. The backend is an event-driven API that allows you to fetch data and send commands to a Discord bot.

---

## 1. Core Concepts

- **Socket.IO Connection:** The dashboard connects to the backend server via Socket.IO. All communication is handled through events.
- **Events:** Messages sent between the client (dashboard) and the server (backend). Emit events to request actions and listen for events to receive data updates.
- **Data Structures:** Data is sent in a structured format as defined by the interfaces below.

---

## 2. Events and Payloads

### Events Emitted by the Frontend (Client)

#### `fetchGuilds`

- **Description:** Requests a list of all guilds (servers) the bot is a member of. This is the first step before fetching channels.
- **Payload:** None
- **Example:**
  ```javascript
  socket.emit("fetchGuilds");
  ```

#### `fetchChannels`

- **Description:** Requests a list of all text channels for a specified guild.
- **Payload:** An object with a single property: **`guildId`** (string).
- **Example:**
  ```javascript
  socket.emit("fetchChannels", { guildId: "1234567890" });
  ```

#### `fetchMessages`

- **Description:** Requests the most recent messages from a specified channel.
- **Payload:** An object with a single property: `channelId` (string).
- **Example:**
  ```javascript
  socket.emit("fetchMessages", { channelId: "9876543210" });
  ```

---

### 3\. Message and Reaction CRUD Events

This section details the new events for creating, updating, and deleting messages and reactions.

#### `sendMessage`

- **Description:** Sends a new message to a specific channel.
- **Payload:**
  ```typescript
  interface SendMessagePayload {
  	channelId: string; // The ID of the channel to send the message to
  	content: string; // The message content
  }
  ```
- **Example:**
  ```javascript
  socket.emit("sendMessage", {
  	channelId: "9876543210",
  	content: "Hello, world!",
  });
  ```

#### `replyMessage`

- **Description:** Replies to an existing message in a channel.
- **Payload:**
  ```typescript
  interface ReplyMessagePayload {
  	channelId: string; // The ID of the channel the message is in
  	messageId: string; // The ID of the message to reply to
  	content: string; // The reply message content
  }
  ```
- **Example:**
  ```javascript
  socket.emit("replyMessage", {
  	channelId: "9876543210",
  	messageId: "1122334455",
  	content: "This is a reply.",
  });
  ```

#### `editMessage`

- **Description:** Edits the content of an existing message.
- **Payload:**
  ```typescript
  interface EditMessagePayload {
  	channelId: string; // The ID of the channel the message is in
  	messageId: string; // The ID of the message to edit
  	content: string; // The new message content
  }
  ```
- **Example:**
  ```javascript
  socket.emit("editMessage", {
  	channelId: "9876543210",
  	messageId: "1122334455",
  	content: "This message has been edited.",
  });
  ```

#### `deleteMessage`

- **Description:** Deletes a specific message from a channel.
- **Payload:**
  ```typescript
  interface DeleteMessagePayload {
  	channelId: string; // The ID of the channel the message is in
  	messageId: string; // The ID of the message to delete
  }
  ```
- **Example:**
  ```javascript
  socket.emit("deleteMessage", {
  	channelId: "9876543210",
  	messageId: "1122334455",
  });
  ```

#### `addReaction`

- **Description:** Adds an emoji reaction to a message.
- **Payload:**
  ```typescript
  interface AddReactionPayload {
  	channelId: string; // The ID of the channel the message is in
  	messageId: string; // The ID of the message to react to
  	emoji: string; // The emoji to add (e.g., "👍" or a custom emoji ID)
  }
  ```
- **Example:**
  ```javascript
  socket.emit("addReaction", {
  	channelId: "9876543210",
  	messageId: "1122334455",
  	emoji: "👍",
  });
  ```

#### `removeReaction`

- **Description:** Removes a reaction from a message. Note: this will remove the bot's reaction.
- **Payload:**
  ```typescript
  interface RemoveReactionPayload {
  	channelId: string; // The ID of the channel the message is in
  	messageId: string; // The ID of the message
  	emoji: string; // The emoji to remove
  }
  ```
- **Example:**
  ```javascript
  socket.emit("removeReaction", {
  	channelId: "9876543210",
  	messageId: "1122334455",
  	emoji: "👍",
  });
  ```

---

### 4\. Data Structures

#### `SimpleGuild`

The format for a simplified guild object, used in the `guildsFetched` event.

```typescript
interface SimpleGuild {
	id: string; // The Discord guild ID
	name: string; // The name of the guild
	icon: string | null; // The guild icon hash
}
```

### `SimpleChannel`

The format for a simplified channel object, used in the `channelsFetched` event.

```typescript
interface SimpleChannel {
	id: string; // The Discord channel ID
	name: string; // The name of the channel
}
```

### `SimpleMessage`

The format for a simplified message object, used in the `messagesFetched` event.

```typescript
interface SimpleMessage {
	id: string; // The message ID
	channelId: string; // The ID of the channel this message belongs to
	content: string; // The message content
	author: {
		// Details of the message author
		id: string;
		username: string;
		discriminator: string;
		avatar: string | null;
	};
	timestamp: number; // The creation timestamp
	editedTimestamp: number | null; // The edit timestamp, if edited
	reactions: {
		// An array of reactions on the message
		emoji: string;
		count: number;
	}[];
	attachments: {
		// An array of message attachments
		url: string;
		name: string;
		size: number;
	}[];
}
```

### Other Real-Time Event Payloads

- **`newMessage` Payload:** A detailed object with properties including `content`, `author`, `id`, `timestamp`, `channelId`, `attachments`, `embeds`, `replyTo`, and `reactions`.
- **`messageUpdated` Payload:** An object with `id`, `channelId`, `content`, `editedTimestamp`, and `author` information.
- **`messageDeleted` Payload:** An object with `id`, `channelId`, and `guildId`.
- **`reactionAdded` / `reactionRemoved` Payload:** An object with `messageId`, `channelId`, `emoji` details, `user...`
