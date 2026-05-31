# Findash — AI-Powered Financial Dashboard

Findash is a full-stack AI-powered financial dashboard that provides real-time financial data, intelligent insights, and an interactive AI agent to help users make informed financial decisions. Built with a React frontend and a Node.js/Express backend, it integrates Groq AI for natural language financial analysis and Firebase for authentication and data storage.

---

## Features

- **Real-time Financial Data** — Fetches and displays live market and financial data
- **AI Financial Agent** — Powered by Groq AI for intelligent financial analysis and Q&A
- **Firebase Authentication** — Secure user login and registration
- **Firestore Database** — Persistent user data and history
- **Firebase Storage** — File and asset management
- **Fast & Responsive UI** — Built with React, Vite, and Tailwind CSS

---

## Project Structure

```
Findash/
├── backend/
│   ├── server.js            # Express server entry point
│   ├── aiAgent.js           # Groq AI agent logic
│   ├── dataFetchers.js      # Financial data fetching logic
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Environment variable template
│   └── .gitignore
│
├── frontend/
│   ├── src/                 # React source code
│   ├── public/              # Static assets
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── package.json         # Frontend dependencies
│   ├── .env.example         # Environment variable template
│   └── .gitignore
│
└── README.md
```

---

## Prerequisites

- **Node.js** v18+
- **npm** v9+
- **Firebase** project (for Auth, Firestore, Storage)
- **Groq API Key** — [console.groq.com](https://console.groq.com)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hassanbabar78/findash.git
cd findash
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=port_number
```

Start the backend server:

```bash
# Development
npm run dev

# Production
npm start
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Running the Full Application

Open **two terminals** and run both servers simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| Groq SDK | AI language model integration |
| Axios | HTTP data fetching |
| dotenv | Environment variable management |
| cors | Cross-origin resource sharing |
| nodemon | Development auto-restart |

### Frontend
| Technology | Purpose |
|------------|---------|
| React | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Firebase Auth | User authentication |
| Firestore | NoSQL database |
| Firebase Storage | File storage |

---

## Environment Variables

### Backend `.env`
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq AI API key |
| `PORT` | Server port (default: 5000) |

### Frontend `.env`
| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `VITE_BACKEND_URL` | Backend server URL |

> Never commit `.env` files to version control. Use `.env.example` as a template.

---

## Security Notes

- All sensitive credentials are stored in `.env` files
- `.env` files are excluded via `.gitignore`
- Firebase security rules should be configured for production
- Restrict Firebase API key usage to your domain in the Firebase Console

---

## Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Production Deployment

### Backend
Deploy to any Node.js hosting platform:
- **Railway**, **Render**, **Heroku**, **DigitalOcean**, **AWS**

### Frontend
Deploy the built frontend:
```bash
cd frontend
npm run build
```
Deploy the `dist/` folder to:
- **Vercel**, **Netlify**, **Firebase Hosting**

---

## License

This project is for educational purposes.