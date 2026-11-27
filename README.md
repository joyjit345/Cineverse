# 🎬 CineVerse — Discover Movies. Explore Stories.

**CineVerse** is a full-stack movie discovery platform built with React, TypeScript, Node.js, Express.js, MongoDB, and The Movie Database (TMDB) API.

Explore trending movies, discover popular films, browse movies by genre, search for your favourites, watch trailers, explore streaming availability, and manage your personal watchlist.

🌐 **Live Demo:** [https://cineverse-omega-seven.vercel.app](https://cineverse-omega-seven.vercel.app)

💻 **GitHub Repository:** [https://github.com/joyjit345/Cineverse](https://github.com/joyjit345/Cineverse)

---

## 📸 Project Overview

CineVerse provides a centralized platform for discovering and exploring movies through an interactive and responsive user interface.

The application uses a React-based frontend to communicate with an Express.js REST API. The backend integrates with TMDB to retrieve movie information and uses MongoDB Atlas to persist user accounts and watchlists.

### ✨ Key Features

- **Trending Movies:** Explore currently trending movies.
- **Popular Movies:** Discover popular movies from TMDB.
- **Genre-Based Discovery:** Browse Action, Sci-Fi, and Drama collections.
- **Movie Search:** Search for movies by title.
- **Movie Details:** Explore descriptions, ratings, release dates, genres, and other movie information.
- **Movie Recommendations:** Discover related movies.
- **Movie Trailers:** Find official YouTube trailers when available.
- **Streaming Availability:** Explore available streaming, rental, and purchase providers by region.
- **User Authentication:** Register and log in using JWT-based authentication.
- **Personal Watchlist:** Add movies to your watchlist and remove them when needed.
- **Persistent Storage:** Store user information and watchlists in MongoDB Atlas.
- **Responsive Interface:** Access the application across desktop and mobile devices.

---

## 🛠️ Tech Stack

### Frontend

| Technology   | Purpose                                |
| ------------ | -------------------------------------- |
| React.js     | User interface development             |
| TypeScript   | Type safety and maintainable code      |
| Vite         | Frontend development and build tooling |
| CSS          | Styling and responsive layouts         |
| Lucide React | Icons                                  |
| Fetch API    | Backend communication                  |

### Backend

| Technology           | Purpose                         |
| -------------------- | ------------------------------- |
| Node.js              | JavaScript runtime              |
| Express.js           | REST API development            |
| MongoDB Atlas        | Cloud database                  |
| Mongoose             | MongoDB object modelling        |
| JSON Web Token (JWT) | User authentication             |
| bcryptjs             | Password hashing                |
| CORS                 | Cross-origin request handling   |
| dotenv               | Environment variable management |

### External APIs and Services

| Service       | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| TMDB API      | Movie information, ratings, posters, trailers and providers |
| MongoDB Atlas | Cloud database hosting                                      |
| Google Vercel | Frontend deployment                                         |
| Render        | Backend deployment                                          |

---

## 🏗️ System Architecture

CineVerse follows a client-server architecture.

```text
                  USER
                   |
                   v
          React + TypeScript
             (Vite Client)
                   |
                   | HTTP Requests
                   v
           Express.js REST API
                   |
          +--------+--------+
          |                 |
          v                 v
      MongoDB Atlas       TMDB API
          |                 |
          v                 v
    User Accounts       Movie Data
    Watchlists          Trailers
                        Recommendations
                        Streaming Providers
```

### Application Workflow

1. The user interacts with the React frontend.
2. The frontend sends HTTP requests to the Express backend.
3. The backend validates requests and processes application logic.
4. MongoDB stores and retrieves user-specific information.
5. The backend communicates with TMDB to retrieve movie information.
6. The frontend displays the returned data.

---

## 📁 Project Structure

```text
CineVerse/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   └── tmdb.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── ...
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── index.js
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Installation and Setup

Follow these steps to run CineVerse locally.

### 1. Clone the Repository

```bash
git clone https://github.com/joyjit345/Cineverse.git
```

### 2. Navigate to the Project

```bash
cd Cineverse
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
```

### 4. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

## 🔐 Environment Variables

CineVerse requires environment variables to configure its frontend and backend.

### Backend Configuration

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret

JWT_EXPIRES_IN=7d

TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
```

**Environment variable explanation:**

| Variable               | Description                     |
| ---------------------- | ------------------------------- |
| PORT                   | Backend server port             |
| MONGO_URI              | MongoDB Atlas connection string |
| JWT_SECRET             | Secret used to sign JWT tokens  |
| JWT_EXPIRES_IN         | JWT token expiration duration   |
| TMDB_READ_ACCESS_TOKEN | TMDB API read access token      |

### Frontend Configuration

Create a `.env` file inside the `client` directory.

```env
VITE_API_URL=http://localhost:5000/api
```

For production, configure:

```env
VITE_API_URL=https://cineverse-backend-kb8h.onrender.com/api
```

**Important:** Never expose MongoDB credentials, JWT secrets, or private API credentials through frontend environment variables.

---

## ▶️ Running the Application

### Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

### Start the Frontend

From the `client` directory:

```bash
npm run dev
```

The frontend will run at the local Vite development URL, normally:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

---

## 🔌 Backend API Endpoints

The Express backend exposes REST API endpoints for authentication, movie discovery, and watchlist management.

### Authentication APIs

| Method | Endpoint             | Description                     |
| ------ | -------------------- | ------------------------------- |
| POST   | `/api/auth/register` | Register a new user             |
| POST   | `/api/auth/login`    | Authenticate an existing user   |
| GET    | `/api/auth/me`       | Retrieve the authenticated user |

### Movie APIs

| Method | Endpoint                              | Description             |
| ------ | ------------------------------------- | ----------------------- |
| GET    | `/api/movies/popular`                 | Get popular movies      |
| GET    | `/api/movies/trending`                | Get trending movies     |
| GET    | `/api/movies/genre/:id`               | Get movies by genre     |
| GET    | `/api/movies/search?query=`           | Search movies           |
| GET    | `/api/movies/:id`                     | Get movie details       |
| GET    | `/api/movies/:id/videos`              | Get movie videos        |
| GET    | `/api/movies/:id/recommendations`     | Get recommendations     |
| GET    | `/api/movies/:id/providers?region=IN` | Get streaming providers |

### Watchlist APIs

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/watchlist`          | Retrieve the user's watchlist     |
| POST   | `/api/watchlist`          | Add a movie to the watchlist      |
| DELETE | `/api/watchlist/:movieId` | Remove a movie from the watchlist |

**Authentication:** Protected endpoints require a valid JWT token in the Authorization header.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🗄️ Database

CineVerse uses MongoDB Atlas as its cloud database.

The backend uses Mongoose to define schemas and interact with MongoDB.

### Main Data Models

**User Model**

Stores user account information, including:

- Name
- Email
- Hashed password

**Watchlist Model**

Stores movies associated with users.

The watchlist supports adding, retrieving, and removing movies.

---

## 🌍 Deployment

CineVerse is deployed using separate frontend and backend hosting services.

### Frontend — Vercel

Live URL:

[https://cineverse-omega-seven.vercel.app](https://cineverse-omega-seven.vercel.app)

Deployment configuration:

| Setting              | Value           |
| -------------------- | --------------- |
| Framework            | Vite            |
| Root Directory       | `client`        |
| Build Command        | `npm run build` |
| Output Directory     | `dist`          |
| Environment Variable | `VITE_API_URL`  |

### Backend — Render

Backend URL:

[https://cineverse-backend-kb8h.onrender.com](https://cineverse-backend-kb8h.onrender.com)

Deployment configuration:

| Setting        | Value         |
| -------------- | ------------- |
| Root Directory | `server`      |
| Build Command  | `npm install` |
| Start Command  | `npm start`   |
| Runtime        | Node.js       |

Configure backend environment variables in the Render dashboard.

### Database — MongoDB Atlas

MongoDB Atlas provides cloud database hosting for user accounts and watchlists.

---

## 🔒 Security Considerations

CineVerse uses several security practices:

- JWT-based authentication.
- Password hashing before database storage.
- Environment variables for sensitive backend credentials.
- CORS configuration for approved frontend origins.
- Backend-side validation of protected requests.
- Separation of frontend and backend configuration.

**Never commit `.env` files or publish private API credentials to GitHub.**

---

## 🚀 Future Improvements

The following features are planned for future development:

- [ ] Gemini-powered AI movie assistant.
- [ ] Conversational AI memory.
- [ ] Personalized movie recommendations.
- [ ] Persistent AI chat history.
- [ ] Advanced movie filtering and sorting.
- [ ] User reviews and ratings.
- [ ] User profile customization.
- [ ] Advanced recommendation engine.
- [ ] More movie genres and discovery categories.

---

## 🎯 Learning Outcomes

Building CineVerse provides practical experience with:

- Full-stack application development.
- React and TypeScript.
- REST API architecture.
- Express.js backend development.
- MongoDB database integration.
- Authentication using JWT.
- Third-party API integration.
- Environment variable management.
- Git and GitHub version control.
- Frontend and backend deployment.
- Production debugging and troubleshooting.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Submit a Pull Request.

---

## 👨‍💻 Author

**Joyjit Das**

Computer Science Engineering — Artificial Intelligence and Machine Learning

- GitHub: [@joyjit345](https://github.com/joyjit345)
- Project: [CineVerse](https://github.com/joyjit345/Cineverse)

---

## 📜 Disclaimer

CineVerse is a movie discovery project built for educational and portfolio purposes.

Movie metadata, images, ratings, and related information are provided through [The Movie Database (TMDB)](https://www.themoviedb.org/).

This product uses the TMDB API but is not endorsed or certified by TMDB.

---

\<p align="center">   \<b>🎬 CineVerse — Your Universe of Movies.\</b> \</p>
