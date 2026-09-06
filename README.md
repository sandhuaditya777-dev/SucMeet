# SucMeet 🎥

> Video conferencing application inspired by [La Suite Meet](https://github.com/suitenumerique/meet). Built with **Next.js 14**, **Express.js**, **MongoDB**, **Auth0**, and **LiveKit**.

---

## ✨ Features

- 🎥 HD video & audio conferencing via LiveKit
- 🚪 Lobby waiting room (hosts admit/deny guests)
- 💬 Real-time in-room chat (data channels)
- 😄 Emoji reactions with floating animations
- 🔇 Admin mute & kick participants
- 📧 Room invitations via email
- 🔒 Auth0 authentication
- 🎭 Three room access levels: public, trusted, restricted

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Auth0 account (free)

### 1. Clone & install
```bash
git clone <your-repo>
cd SucMeet
npm install
```

### 2. Start infrastructure
```bash
docker-compose up -d
```
This starts MongoDB, Redis, LiveKit (dev mode), and MinIO.

### 3. Configure environment

**Backend** (`apps/api/.env`):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sucmeet
REDIS_URL=redis://localhost:6379
AUTH0_AUDIENCE=https://sucmeet-api
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT.auth0.com
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
AUTH0_SECRET=<32-char-random-string>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT.auth0.com
AUTH0_CLIENT_ID=YOUR_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_CLIENT_SECRET
AUTH0_AUDIENCE=https://sucmeet-api
```

### 4. Set up Auth0
1. Create a **Regular Web App** in Auth0
2. Add callback URL: `http://localhost:3000/api/auth/callback`
3. Add logout URL: `http://localhost:3000`
4. Create an **API** with identifier `https://sucmeet-api`
5. Copy credentials to your `.env.local` file

### 5. Run development servers
```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| LiveKit | ws://localhost:7880 |
| MinIO Console | http://localhost:9001 |

---

## 🏗 Project Structure

```
SucMeet/
├── apps/
│   ├── web/          ← Next.js 14 frontend
│   └── api/          ← Express.js backend
├── packages/
│   └── shared/       ← Shared TypeScript types
├── docker-compose.yml
└── turbo.json
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/me` | Current user profile |
| `GET` | `/api/v1/rooms` | List user's rooms |
| `POST` | `/api/v1/rooms` | Create room |
| `GET` | `/api/v1/rooms/:slug` | Get room + LiveKit token |
| `PATCH` | `/api/v1/rooms/:id` | Update room |
| `DELETE` | `/api/v1/rooms/:id` | Delete room |
| `GET` | `/api/v1/rooms/:id/members` | List members |
| `POST` | `/api/v1/rooms/:id/lobby` | Knock on lobby |
| `GET` | `/api/v1/rooms/:id/lobby` | List waiting (admin) |
| `POST` | `/api/v1/rooms/:id/lobby/:pid/accept` | Admit participant |
| `POST` | `/api/v1/rooms/:id/lobby/:pid/deny` | Deny participant |
| `POST` | `/api/v1/rooms/:id/participants/:id/mute` | Mute participant |
| `DELETE` | `/api/v1/rooms/:id/participants/:id` | Kick participant |
| `GET` | `/api/v1/invitations/:token` | Get invitation details |
| `POST` | `/api/v1/invitations/:token/accept` | Accept invitation |
| `POST` | `/api/v1/webhooks/livekit` | LiveKit webhook handler |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| State | Zustand |
| Server State | TanStack Query |
| Auth | Auth0 + @auth0/nextjs-auth0 |
| Real-time media | LiveKit + @livekit/components-react |
| Animations | Framer Motion |
| Backend | Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Cache / Lobby | Redis (ioredis) |
| LiveKit SDK | livekit-server-sdk |
| Validation | Zod |
| Logging | Winston |
| Monorepo | Turborepo |
