# PhysioForge — Developer Quick-Start

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (optional — app runs in Demo Mode without it)

## 1. Install dependencies

```bash
# From the project root
npm run install:all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

## 2. Start both servers

```bash
# From root — starts backend on :5000 and frontend on :5173
npm run dev
```

Or separately in two terminals:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## 3. Open the app

http://localhost:5173

## Demo accounts (password: `password123`)

| Email                  | Role      | Notes              |
|------------------------|-----------|--------------------|
| patient@demo.com       | patient   |                    |
| doctor@demo.com        | doctor    |                    |
| caretaker@demo.com     | caretaker |                    |
| elder@demo.com         | patient   | Elder Mode (age 62)|

Demo mode works **without MongoDB** — data is not persisted between server restarts.

## How the API connection works

- Frontend (Vite dev server on `:5173`) proxies all `/api/*` requests to `http://localhost:5000`
- This is configured in `client/vite.config.js` under `server.proxy`
- No `VITE_API_URL` is needed in development
- For production builds, set `VITE_API_URL` in `client/.env` to your deployed backend URL

## Troubleshooting

**"Cannot reach server" on login/register**
→ Make sure the backend is running: `cd server && npm run dev`
→ Check it's on port 5000: visit http://localhost:5000/api/health

**MongoDB connection errors**
→ These are non-fatal — the app runs in Demo Mode automatically
→ Demo accounts always work regardless of MongoDB status

**Port already in use**
→ Backend: change `PORT` in `server/.env`
→ Frontend: change `port` in `client/vite.config.js` and update the proxy target accordingly
