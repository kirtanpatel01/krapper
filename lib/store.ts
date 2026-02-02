import { create } from 'zustand';
import { ScrapedJob } from './scraper-logic';

interface ScraperState {
  jobs: ScrapedJob[];
  loading: boolean;
  query: string;
  usage: {
    count: number;
    limit: number;
  };
  

  setJobs: (jobs: ScrapedJob[]) => void;
  addJobs: (newJobs: ScrapedJob[]) => void;
  setLoading: (loading: boolean) => void;
  setQuery: (query: string) => void;
  setUsage: (usage: Partial<{ count: number; limit: number }>) => void;
  reset: () => void;
}

export const useScraperStore = create<ScraperState>((set) => ({
  jobs: [],
  loading: false,
  query: "",
  usage: {
    count: 0,
    limit: 3,
  },

  setJobs: (jobs) => set({ jobs }),
  addJobs: (newJobs) => set((state) => {
    const existingKeys = new Set(state.jobs.map(j => j.jobUrl));
    const uniqueNewJobs = newJobs.filter(j => !existingKeys.has(j.jobUrl));
    return { jobs: [...state.jobs, ...uniqueNewJobs] };
  }),
  setLoading: (loading) => set({ loading }),
  setQuery: (query) => set({ query }),
  setUsage: (usageUpdate) => set((state) => ({
    usage: { ...state.usage, ...usageUpdate }
  })),
  reset: () => set({
    jobs: [],
    loading: false,
    query: "",
  }),
}));
