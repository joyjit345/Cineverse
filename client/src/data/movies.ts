
export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  poster: string;
  description: string;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    rating: 8.8,
    genre: "Sci-Fi",
    poster:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    description:
      "A skilled thief enters people's dreams to steal secrets."
  },
  {
    id: 2,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    genre: "Sci-Fi",
    poster:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxdXBaq.jpg",
    description:
      "Explorers travel beyond Earth to find a new home for humanity."
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    genre: "Action",
    poster:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    description:
      "Batman faces the Joker, a criminal mastermind."
  },
  {
    id: 4,
    title: "Dune",
    year: 2021,
    rating: 8.0,
    genre: "Sci-Fi",
    poster:
      "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    description:
      "A young nobleman travels to a dangerous desert planet."
  },
  {
    id: 5,
    title: "Oppenheimer",
    year: 2023,
    rating: 8.3,
    genre: "Drama",
    poster:
      "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    description:
      "The story of the scientist behind the atomic bomb."
  },
  {
    id: 6,
    title: "Avengers: Endgame",
    year: 2019,
    rating: 8.4,
    genre: "Action",
    poster:
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "The Avengers unite for one final battle to restore the universe."
  },
  {
    id: 7,
    title: "Joker",
    year: 2019,
    rating: 8.4,
    genre: "Drama",
    poster:
      "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    description:
      "A struggling comedian descends into a life of crime."
  },
  {
    id: 8,
    title: "Spider-Man: No Way Home",
    year: 2021,
    rating: 8.2,
    genre: "Action",
    poster:
      "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    description:
      "Peter Parker faces unexpected visitors from other universes."
  }
];
