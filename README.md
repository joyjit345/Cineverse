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
## ⭐ Support

If you find this project interesting or useful, consider giving the repository a ⭐ on GitHub!
