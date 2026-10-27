# Practical 11 — Docker Compose (React + Express + MongoDB)

This project containerizes the existing Task Management application and its Practical 10 EventEmitter backend.

## Services and ports

- **Frontend:** React/Vite production build served by Nginx; host port `5173` → container port `80`.
- **Backend:** Node.js/Express; host port `5000` → container port `5000`.
- **MongoDB:** MongoDB 7; reachable by the backend at `mongodb://mongo:27017/taskmanagement` on the Docker network.
- **Network:** `task-network` is a private Docker bridge network shared by all services.
- **Persistence:** `mongo_data` named volume preserves database contents across container restarts.

## Requirements

Install and start Docker Desktop (Windows/macOS) or Docker Engine with the Compose plugin (Linux).

## Start the whole application

Open a terminal in the folder containing `docker-compose.yml` and run this single command:

```bash
docker compose up --build
```

Compose builds the frontend and backend images, starts MongoDB, waits for MongoDB's health check before starting the backend, then waits for the backend health check before starting the frontend. No manual `.env` file or database setup is required for this local practical.

Open:
- Frontend: http://localhost:5173
- Backend health/root route: http://localhost:5000

Stop the application with `Ctrl+C`. To stop and remove containers/network while retaining database data, run:

```bash
docker compose down
```

To also remove the saved MongoDB volume (this permanently deletes the demo database), run:

```bash
docker compose down -v
```

## API routing inside Docker

The browser calls `/api/...` on the frontend origin. Nginx proxies `/api/tasks` to `http://backend:5000/tasks` and `/api/auth/login` to `http://backend:5000/auth/login`. The hostname `backend` is resolved only inside the Compose network; the browser never needs to know container hostnames.

## JWT secret

Compose supplies a development-only fallback JWT secret so this practical starts without manual configuration. Do not use the fallback secret in production. For production, provide a strong secret through your environment or a secrets manager.

## Screenshots for submission

1. Terminal showing `docker compose up --build` and all three services running.
2. Browser showing the frontend at `http://localhost:5173`.
3. `frontend/Dockerfile`.
4. `backend/Dockerfile`.
5. `docker-compose.yml`, showing all services, port mappings, network, health checks, and volume.

## Troubleshooting

- If a port is already in use, stop the application currently using port `5173` or `5000`, then run Compose again.
- To view logs: `docker compose logs -f`.
- To rebuild after Dockerfile or source changes: `docker compose up --build`.
- Check status: `docker compose ps`.

