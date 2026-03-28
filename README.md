<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</div>

<h1 align="center">🧠 ThinkBoard</h1>

<p align="center">
  A modern, full-stack brainstorming and idea-tracking application built with the MERN stack.
</p>

## ✨ Features

- **Dynamic Interface**: Beautiful and responsive UI powered by React, TailwindCSS, and DaisyUI.
- **RESTful API**: Robust backend built with Node.js and Express.
- **Data Persistence**: Secure and scalable database operations using MongoDB and Mongoose.
- **Rate Limiting**: Integrated Upstash Redis for intelligent request rate limiting.
- **Modern Build Tools**: Blazing fast development server and optimized production builds with Vite.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & DaisyUI
- **Routing**: React Router
- **Icons**: Lucide React
- **Network Actions**: Axios
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Rate Limiting**: Upstash Redis
- **Security & Utils**: CORS, Dotenv

## 📂 Project Structure

```bash
thinkboard/
├── backend/          # Express.js REST API
│   ├── src/
│   │   ├── server.js # Entry point
│   │   └── ...       # Controllers, Models, Routes
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── package.json      # Root package (Monorepo scripts)
```

## 🛠️ Getting Started

### Prerequisites

You need to have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Upstash Redis credentials (for rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/thinkboard.git
   cd thinkboard
   ```

2. **Install dependencies**
   ```bash
   # Install all backend and frontend dependencies
   npm run build
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

### Running the Application

To start the backend and frontend simultaneously, you can run them in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Alternatively, from the root:
```bash
npm start # Starts the backend
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

