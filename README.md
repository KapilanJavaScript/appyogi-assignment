# Remote Keyboard Application

## Overview

Remote Keyboard is a real-time collaborative keyboard system where **two users**, using **different browsers or machines**, share a **2×5 keyboard grid**. Only **one user can control the keyboard at a time**, and control is automatically released after a **single key action** or **120 seconds of inactivity**.

The project is built with:

* **Backend**: Node.js, Express, MySQL, Socket.IO
* **Frontend**: React (Vite)
* **Realtime sync**: Socket.IO

The system enforces strict control rules on the **server**, while the client reacts to updates in real time.

---

## Core Features

### Keyboard

* 10 keys (2 × 5 grid)
* Each key is **50px × 50px**
* Initial color: **White**
* User 1 color: **Red**
* User 2 color: **Yellow**
* Clicking a lit key toggles it back to white

### Control Rules

* Only **one user** can control the keyboard at a time
* User must **acquire control** before toggling a key
* Control is **automatically released**:

  * After **one key toggle**, or
  * After **120 seconds of inactivity**
* Control state is stored in the database and enforced by the backend

### Real-Time Sync

* All key and control updates are broadcast using **Socket.IO**
* No page refresh is required
* Multiple clients stay in sync instantly

---

## Architecture

### Backend Layers

* **Controller**: Handles HTTP + Socket.IO emits
* **BLL (Business Logic Layer)**: Business rules and validation
* **DAL (Data Access Layer)**: Database queries
* **Middleware**: Control validation, response handling

### Database Design

#### `keyboard_keys`

| Column | Description                    |
| ------ | ------------------------------ |
| key_id | Key number (1–10)              |
| is_lit | 0 / 1                          |
| lit_by | User who lit the key           |
| color  | 1 = White, 2 = Red, 3 = Yellow |

#### `keyboard_control` (Singleton Table)

| Column      | Description              |
| ----------- | ------------------------ |
| id          | Always 1                 |
| acquired_by | Current controller       |
| acquired_on | Timestamp of acquisition |

---

## API Endpoints

### Get Keyboard State

```
GET /keyboard
```

Returns all keys and current control state.

### Acquire Control

```
POST /keyboard/control
```

Acquires control if no active (non-expired) control exists.

### Toggle Key

```
POST /keyboard/toggle/:keyId
```

Toggles a key. Requires valid control.

Headers:

```
X-User-Id: 1 | 2
```

Body:

```json
{
  "color": "red" | "yellow"
}
```

---

## Socket.IO Events

### Server → Client

| Event             | Payload             | Description                 |
| ----------------- | ------------------- | --------------------------- |
| `keyboard:update` | `{ key_id, color }` | Key toggled                 |
| `control:update`  | `{ acquired_by }`   | Control acquired / released |

### Client → Server

* User identity is sent during connection using `socket.handshake.auth`

---

## Idle Timeout Handling

* Control timeout is enforced using **timestamps**, not client timers
* Server periodically checks for expired control
* When expired:

  * Control is released in DB
  * `control:update` event is emitted

Timers are used only as **optimizations**, timestamps are the **source of truth**.

---

## Client Behavior

* User is determined via query param:

```
?user=1
?user=2
```

* If missing or invalid, client redirects to `?user=1`
* UI updates automatically on Socket.IO events
* Control button is disabled when control is not available

---

## Environment Variables

### Backend (.env)

```
PORT=5100
APP_URL=http://localhost:3000
DB_HOST=XXXX
DB_USER=XXXX
DB_PASSWORD=XXXX
DB_NAME=XXXX
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5100
```

---

## Running the Project

### Backend

```
npm install
npm run dev
```

### Frontend

```
npm install
npm run dev
```

Open in two browsers:

```
http://localhost:3000/?user=1
http://localhost:3000/?user=2
```

---

## Design Principles

* Database is the **single source of truth**
* Socket.IO only **broadcasts**, never decides state
* Controllers handle transport concerns
* Business logic is reusable and transport-agnostic
* Control logic is deterministic and restart-safe

---

## Summary

This project demonstrates:

* Real-time synchronization
* Safe concurrency control
* Clean backend architecture
* Production-grade control and timeout handling

It is designed to be **predictable, scalable, and easy to extend**.
