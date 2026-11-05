# FlowBoard — Real-Time Kanban Board (MERN Stack)

A modern, minimal, premium SaaS Kanban web application built with the **MERN stack** (MongoDB, Express.js, React, Node.js), featuring **real-time synchronization via Socket.io** and **fluid drag-and-drop powered by `@hello-pangea/dnd`**.

Designed with inspiration from tools like **Linear**, **Notion**, and **Trello**, FlowBoard delivers a focused productivity experience with clean typography, subtle borders, refined status indicators, and zero generic AI clutter.

---

## ⚡ Key Features

- **Fluid Drag-and-Drop**: Drag tasks smoothly between columns (`To Do`, `In Progress`, `Done`) and reorder cards within columns with optimistic UI updates and instant database persistence.
- **Real-Time Cross-Tab Synchronization**: Powered by Socket.io — new tasks, edits, deletions, and card movements reflect across all connected clients and browser tabs instantaneously.
- **Full CRUD Capabilities**: Create, read, edit, and delete tasks with comprehensive form validation and confirmation modals.
- **Filter & Search Controls**:
  - Live search across task titles, descriptions, and assignees.
  - Priority filter (`All`, `High`, `Medium`, `Low`).
  - Due date sorting (`Earliest Due`, `Latest Due`, `Default`).
- **Resilient MongoDB Backend**:
  - Automatically connects to standard MongoDB (`mongodb://127.0.0.1:27017/flowboard` or MongoDB Atlas URI).
  - Includes an automatic fallback to `mongodb-memory-server` if a local MongoDB daemon is not running, ensuring zero-configuration execution.
  - Pre-seeds realistic sample tasks on initial startup.
- **Responsive SaaS Interface**:
  - **Desktop**: Fixed left navigation sidebar, workspace switcher, and side-by-side three-column board.
  - **Mobile & Tablet**: Collapsible navigation drawer, horizontally scrollable board lanes, and touch-friendly drag handles.
- **Design System Details**:
  - Neutral palette with indigo accent styling.
  - Custom priority badges (Low: muted green, Medium: amber, High: muted red).
  - Task identifier tags (e.g. `FB-101`, `FB-102`).
  - Subtle hover actions, custom scrollbars, and toast notifications.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom SaaS typography (`Inter`)
- **Drag-and-Drop**: `@hello-pangea/dnd`
- **Routing**: `react-router-dom`
- **Icons**: `lucide-react`
- **HTTP Client**: Axios with centralized API layer & Vite proxy
- **Real-Time Client**: `socket.io-client`

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Real-Time Server**: Socket.io
- **Configuration & Security**: dotenv, cors
- **In-Memory Fallback**: mongodb-memory-server

---

## 📂 Project Structure

```text
Trello Clone/
├── client/                           # React + Vite Frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── board/                # Board, Column, TaskCard, EmptyColumn
│   │   │   │   ├── Column.jsx
│   │   │   │   ├── EmptyColumn.jsx
│   │   │   │   ├── KanbanBoard.jsx
│   │   │   │   └── TaskCard.jsx
│   │   │   ├── layout/               # Header, Sidebar, MainLayout
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── modals/               # Create/Edit Task & Delete Confirmation
│   │   │   │   ├── ConfirmDeleteModal.jsx
│   │   │   │   └── TaskModal.jsx
│   │   │   └── ui/                   # Badges, Toasts, Containers
│   │   │       ├── Badge.jsx
│   │   │       ├── Toast.jsx
│   │   │       └── ToastContainer.jsx
│   │   ├── context/
│   │   │   ├── TaskContext.jsx       # Tasks state & Socket.io handlers
│   │   │   └── ToastContext.jsx      # Notifications system
│   │   ├── services/
│   │   │   ├── api.js                # Axios REST endpoints
│   │   │   └── socket.js             # Socket.io connection instance
│   │   ├── utils/
│   │   │   └── dateUtils.js          # Dates, initials & colors
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                           # Express + MongoDB Backend
│   ├── config/
│   │   └── db.js                     # MongoDB & in-memory connection logic
│   ├── controllers/
│   │   └── taskController.js         # Task CRUD & batch reorder handlers
│   ├── middleware/
│   │   ├── errorHandler.js           # 404 & centralized error handling
│   │   └── validateTask.js           # Input validation middleware
│   ├── models/
│   │   └── Task.js                   # Mongoose Task schema & taskCode virtual
│   ├── routes/
│   │   └── taskRoutes.js             # REST API route mapping
│   ├── utils/
│   │   └── seedData.js               # Initial sample task seeder
│   ├── socket.js                     # Socket.io server instance & events
│   ├── server.js                     # Server entrypoint
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── package.json                      # Monorepo root with concurrent scripts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB** *(optional)*: Local MongoDB instance or MongoDB Atlas connection string. If omitted or not running, the application will automatically initialize an in-memory database fallback.

### 2. Installation

Clone or open the project folder in your terminal, then install all dependencies:

```bash
# Option A: One-line install for root, server, and client
npm run install:all

# Option B: Install individually
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Environment Variables

The server configuration file is located at `server/.env`. A `.env.example` template is provided:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/flowboard
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **Note**: If you want to connect to a cloud database (MongoDB Atlas), replace `MONGODB_URI` with your connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/flowboard?retryWrites=true&w=majority`

### 4. Running the Application

To run both backend and frontend concurrently in development mode:

```bash
npm run dev
```

This launches:
- **Client (Vite)** at: `http://localhost:5173`
- **Backend API Server** at: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

Alternatively, you can run them in separate terminals:

```bash
# Terminal 1 - Backend:
npm run dev:server

# Terminal 2 - Frontend:
npm run dev:client
```

---

## 📡 REST API Reference

All task endpoints are prefixed with `/api/tasks`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/tasks` | Fetch all tasks (supports `?search=`, `?priority=`, `?status=`) |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Fetch a single task by ID |
| `PUT` | `/api/tasks/:id` | Update task details or column status |
| `PUT` | `/api/tasks/batch/reorder` | Batch update task orders & statuses during drag-and-drop |
| `DELETE` | `/api/tasks/:id` | Permanently delete a task |

### Example Create Task Payload:

```json
POST /api/tasks
Content-Type: application/json

{
  "title": "Build dark mode color tokens",
  "description": "Harmonize slate background values and contrast ratios.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-11-15T00:00:00.000Z",
  "assignee": "Sarah Lin"
}
```

---

## 🔄 Real-Time WebSocket Events

FlowBoard uses Socket.io to broadcast events across clients:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `task:created` | Server -> Clients | `Task` object | Emitted when a new task is created |
| `task:updated` | Server -> Clients | `Task` object | Emitted when task fields or status are modified |
| `task:deleted` | Server -> Clients | `{ id: string }` | Emitted when a task is removed |
| `tasks:reordered` | Server -> Clients | `{ updates, tasks }` | Emitted when tasks are reordered or moved |

---

## 🏗️ Production Build

To build the client for production:

```bash
npm run build
```

This generates an optimized static bundle in `client/dist`.

---

## 📄 License

MIT License. Designed and developed for modern productivity teams.

