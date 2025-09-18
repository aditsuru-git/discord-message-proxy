# API Documentation for Frontend Dashboard

This document outlines the Socket.IO events and data structures required to build the Discord dashboard. The backend is an event-driven API that allows you to fetch data and send commands to a Discord bot.

---

## 1. Core Concepts

- **Socket.IO Connection:** The dashboard connects to the backend server via Socket.IO. All communication is handled through events.
- **Events:** Messages sent between the client (dashboard) and the server (backend). Emit events to request actions and listen for events to receive data updates.
- **Data Structures:** Data is sent in a structured format as defined by the interfaces below.

---

## 2. Events and Payloads

### Events Emitted by the Frontend (Client)

#### `fetchChannels`

- **Description:** Requests a list of all text channels the bot has access to.
- **Payload:** None
- **Example:**

```javascript
socket.emit("fetchChannels");
```
