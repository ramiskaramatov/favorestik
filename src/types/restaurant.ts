export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  visited: boolean;
  favorite: boolean;
  notes: string;
  photoUrl?: string;
  website?: string;
  hours?: string;
  location?: string;
  createdAt: string;
}

export type SortOption = 'name-asc' | 'name-desc' | 'rating-asc' | 'rating-desc' | 'date-asc' | 'date-desc';
export type FilterOption = 'all' | 'visited' | 'unvisited' | 'favorites';
