# URL Shortener

A simple full-stack URL shortener built for the WedigTech Full Stack Developer assignment.

Paste a long URL, get a short link, and opening the short link redirects to the original URL.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js 24, Express.js
- **Database:** MongoDB (Mongoose)

## Project Structure

```
url-shortener/
├── backend/
│   ├── controllers/urlShortenerController.js   # shorten + redirect logic
│   ├── models/Url.js                           # Url schema
│   ├── routes/urlRoutes.js                     # API routes
│   ├── server.js                               # Express app + MongoDB connection
│   └── .env.example
├── frontend/
│   ├── src/App.jsx                             # UI
│   └── .env.example
├── README.md
└── AI_LOG.md
```

## Prerequisites

- Node.js 24
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas connection string)

## Setup and Run

### 1. Clone

```bash
git clone <repo-url>
cd url-shortener
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows (cmd): copy .env.example .env
npm run dev
```

The backend runs on `http://localhost:5000`. You should see `MongoDB connected` in the terminal.

`backend/.env`:

| Variable    | Description                          | Example                                      |
|-------------|--------------------------------------|----------------------------------------------|
| `PORT`      | Port for the backend                 | `5000`                                       |
| `MONGO_URI` | MongoDB connection string            | `mongodb://127.0.0.1:27017/url-shortener`    |
| `BASE_URL`  | Backend address used in short links  | `http://localhost:5000`                      |

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # Windows (cmd): copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

`frontend/.env`:

| Variable        | Description           | Example                     |
|-----------------|-----------------------|-----------------------------|
| `VITE_API_BASE` | Backend API base URL  | `http://localhost:5000/api` |

## API

### `POST /api/shorten`

Creates a short URL.

Request:

```json
{ "originalUrl": "https://example.com/some/long/path" }
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/some/long/path",
    "shortCode": "aB3dE9",
    "shortUrl": "http://localhost:5000/aB3dE9",
    "createdAt": "2026-10-03T08:25:52.024Z"
  }
}
```

Response `400` (invalid or missing URL):

```json
{ "success": false, "message": "Please provide a valid http or https URL" }
```

### `GET /:code`

Redirects (`302`) to the original URL. Returns `404` if the short code does not exist:

```json
{ "success": false, "message": "Short URL not found" }
```

### `GET /`

Health check. Returns `{ "success": true, "message": "URL Shortener API is running" }`.

## How It Works

- **Validation:** only `http://` and `https://` URLs are accepted, checked on both the frontend and the backend.
- **Short code:** 6 random characters from `A–Z`, `a–z`, `0–9`.
- **Uniqueness:** `shortCode` has a unique index in MongoDB. If a generated code already exists, a new one is generated (up to 5 attempts).
- **Redirect:** `GET /:code` looks up the code and responds with a `302` redirect.
