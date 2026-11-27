export interface PublicMovie {
  id: string;
  title: string;
  year: number;
  description: string;
  duration: string;
  videoUrl: string;
  source: string;
  sourceUrl: string;
  license: string;
}

export const publicMovies: PublicMovie[] = [
  {
    id: "duck-and-cover",
    title: "Duck and Cover",
    year: 1951,
    description:
      "A historical civil-defence educational film showing the safety advice taught to American schoolchildren during the Cold War.",
    duration: "9 minutes",
    videoUrl:
      "https://archive.org/download/ArcherProductionsInc/DuckandC1951.mp4",
    source: "Internet Archive",
    sourceUrl: "https://archive.org/details/ArcherProductionsInc",
    license: "Verify the rights for this specific recording before redistribution.",
  },
];