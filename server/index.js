
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

// --------------------------------------------------
// 1. LOAD ENVIRONMENT VARIABLES
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");

const envResult = dotenv.config({
  path: envPath,
});

console.log("Environment file:", envPath);

if (envResult.error) {
  console.error("Error loading .env file:", envResult.error.message);
}

// Environment check (does not print secret values)
console.log("Environment check:", {
  MONGO_URI: Boolean(process.env.MONGO_URI),
  JWT_SECRET: Boolean(process.env.JWT_SECRET),
  TMDB_TOKEN: Boolean(process.env.TMDB_READ_ACCESS_TOKEN),
  PORT: Boolean(process.env.PORT),
});

// --------------------------------------------------
// 2. INITIALIZE APP AND ENVIRONMENT VARIABLES
// --------------------------------------------------

const app = express();

const PORT = process.env.PORT || 5000;
const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// --------------------------------------------------
// 3. CHECK REQUIRED ENVIRONMENT VARIABLES
// --------------------------------------------------

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from environment variables.");
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

// --------------------------------------------------
// 4. MIDDLEWARE AND CORS
// --------------------------------------------------

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://cineverse-omega-seven.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------------
// 5. ROOT HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CineVerse API!",
    status: "Running successfully",
    frontend: "https://cineverse-omega-seven.vercel.app",
  });
});

// --------------------------------------------------
// 6. USER MODEL
// --------------------------------------------------

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// --------------------------------------------------
// 7. WATCHLIST MODEL
// --------------------------------------------------

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    movies: [
      {
        id: { type: Number, required: true },
        title: { type: String, required: true },
        year: { type: Number, required: true },
        rating: { type: Number, required: true },
        genre: { type: String, required: true },
        poster: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

// --------------------------------------------------
// 8. JWT TOKEN GENERATOR
// --------------------------------------------------

function generateToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// --------------------------------------------------
// 9. AUTHENTICATION MIDDLEWARE
// --------------------------------------------------

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
}

// --------------------------------------------------
// 10. USER REGISTRATION
// --------------------------------------------------

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Please provide name, email and password.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 80) {
      return res.status(400).json({
        message: "Name must contain between 1 and 80 characters.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and no more than 72 UTF-8 bytes.",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
});

// --------------------------------------------------
// 11. USER LOGIN
// --------------------------------------------------

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

// --------------------------------------------------
// 12. GET LOGGED-IN USER PROFILE
// --------------------------------------------------

app.get("/api/auth/me", authenticateToken, (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

// --------------------------------------------------
// 13. WATCHLIST API ROUTES
// --------------------------------------------------

// GET USER WATCHLIST

app.get("/api/watchlist", authenticateToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      user: req.user._id,
    }).lean();

    return res.json({
      movies: watchlist?.movies || [],
    });
  } catch (error) {
    console.error("Get watchlist error:", error);

    return res.status(500).json({
      message: "Failed to retrieve watchlist.",
    });
  }
});

// ADD MOVIE TO WATCHLIST

app.post("/api/watchlist", authenticateToken, async (req, res) => {
  try {
    const movie = req.body?.movie;

    if (!movie || typeof movie !== "object" || Array.isArray(movie)) {
      return res.status(400).json({
        message: "Please provide valid movie details.",
      });
    }

    const {
      id,
      title,
      year,
      rating,
      genre,
      poster,
      description,
    } = movie;

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 300 ||
      !Number.isInteger(year) ||
      !Number.isFinite(rating) ||
      typeof genre !== "string" ||
      typeof poster !== "string" ||
      typeof description !== "string" ||
      genre.length > 200 ||
      poster.length > 2048 ||
      description.length > 5000
    ) {
      return res.status(400).json({
        message: "Invalid movie details.",
      });
    }

    const cleanMovie = {
      id,
      title: title.trim(),
      year,
      rating,
      genre: genre.trim(),
      poster,
      description,
    };

    let watchlist = await Watchlist.findOne({
      user: req.user._id,
    });

    if (!watchlist) {
      watchlist = new Watchlist({
        user: req.user._id,
        movies: [],
      });
    }

    const alreadySaved = watchlist.movies.some(
      (savedMovie) => savedMovie.id === id
    );

    if (alreadySaved) {
      return res.status(409).json({
        message: "Movie is already in your watchlist.",
        movies: watchlist.movies,
      });
    }

    watchlist.movies.push(cleanMovie);
    await watchlist.save();

    return res.status(201).json({
      message: "Movie added to watchlist successfully!",
      movies: watchlist.movies,
    });
  } catch (error) {
    console.error("Add watchlist movie error:", error);

    return res.status(500).json({
      message: "Failed to add movie to watchlist.",
    });
  }
});

// REMOVE MOVIE FROM WATCHLIST

app.delete(
  "/api/watchlist/:movieId",
  authenticateToken,
  async (req, res) => {
    try {
      const movieId = Number(req.params.movieId);

      if (!Number.isInteger(movieId) || movieId <= 0) {
        return res.status(400).json({
          message: "Invalid movie ID.",
        });
      }

      const watchlist = await Watchlist.findOneAndUpdate(
        { user: req.user._id },
        {
          $pull: {
            movies: { id: movieId },
          },
        },
        { new: true }
      );

      return res.json({
        message: "Watchlist updated successfully.",
        movies: watchlist?.movies || [],
      });
    } catch (error) {
      console.error("Remove watchlist movie error:", error);

      return res.status(500).json({
        message: "Failed to remove movie from watchlist.",
      });
    }
  }
);

// --------------------------------------------------
// 14. TMDB CONFIGURATION
// --------------------------------------------------

const allowedGenres = [28, 878, 18];

async function fetchFromTMDB(apiPath, res) {
  try {
    if (!TMDB_TOKEN) {
      return res.status(500).json({
        message: "TMDB token is missing from environment variables.",
      });
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/${apiPath}`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.error("TMDB API Error:", errorData);

      return res.status(response.status).json({
        message: "Failed to fetch data from TMDB.",
        details: errorData,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("TMDB Error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}

// --------------------------------------------------
// 15. POPULAR MOVIES
// --------------------------------------------------

app.get("/api/movies/popular", async (req, res) => {
  return fetchFromTMDB(
    "movie/popular?language=en-US&page=1",
    res
  );
});

// --------------------------------------------------
// 16. TRENDING MOVIES
// --------------------------------------------------

app.get("/api/movies/trending", async (req, res) => {
  return fetchFromTMDB(
    "trending/movie/week?language=en-US",
    res
  );
});

// --------------------------------------------------
// 17. MOVIES BY GENRE
// --------------------------------------------------

app.get("/api/movies/genre/:genreId", async (req, res) => {
  const genreId = Number(req.params.genreId);

  if (!allowedGenres.includes(genreId)) {
    return res.status(400).json({
      message: "Invalid or unsupported genre ID.",
    });
  }

  return fetchFromTMDB(
    `discover/movie?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreId}`,
    res
  );
});

// --------------------------------------------------
// 18. SEARCH MOVIES
// --------------------------------------------------

app.get("/api/movies/search", async (req, res) => {
  const query = req.query.query;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({
      message: "Please provide a movie search query.",
    });
  }

  const searchParams = new URLSearchParams({
    query: query.trim(),
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  return fetchFromTMDB(
    `search/movie?${searchParams.toString()}`,
    res
  );
});

// --------------------------------------------------
// 19. MOVIE DETAILS
// --------------------------------------------------

app.get("/api/movies/:movieId", async (req, res) => {
  const movieId = Number(req.params.movieId);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({
      message: "Invalid movie ID.",
    });
  }

  return fetchFromTMDB(
    `movie/${movieId}?language=en-US`,
    res
  );
});

// --------------------------------------------------
// 20. MOVIE VIDEOS AND TRAILERS
// --------------------------------------------------

app.get("/api/movies/:movieId/videos", async (req, res) => {
  const movieId = Number(req.params.movieId);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({
      message: "Invalid movie ID.",
    });
  }

  return fetchFromTMDB(
    `movie/${movieId}/videos?language=en-US`,
    res
  );
});

// --------------------------------------------------
// 21. MOVIE RECOMMENDATIONS
// --------------------------------------------------

app.get("/api/movies/:movieId/recommendations", async (req, res) => {
  const movieId = Number(req.params.movieId);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({
      message: "Invalid movie ID.",
    });
  }

  return fetchFromTMDB(
    `movie/${movieId}/recommendations?language=en-US&page=1`,
    res
  );
});

// --------------------------------------------------
// 22. MOVIE WATCH PROVIDERS
// --------------------------------------------------

app.get("/api/movies/:movieId/providers", async (req, res) => {
  const movieId = Number(req.params.movieId);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({
      message: "Invalid movie ID.",
    });
  }

  return fetchFromTMDB(
    `movie/${movieId}/watch/providers`,
    res
  );
});

// --------------------------------------------------
// 23. START SERVER AFTER MONGODB CONNECTION
// --------------------------------------------------

async function startServer() {
  try {
    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Atlas connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CineVerse API running on port ${PORT}`);
      console.log(`Local API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
