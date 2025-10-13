import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Restaurant, SortOption, FilterOption } from '@/types/restaurant';

interface RestaurantStore {
  restaurants: Restaurant[];
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  cuisineFilter: string;
  
  // Actions
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt'>) => void;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  toggleVisited: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearAll: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  setCuisineFilter: (cuisine: string) => void;
  importRestaurants: (restaurants: Restaurant[]) => void;
  
  // Computed
  getFilteredRestaurants: () => Restaurant[];
  getCuisines: () => string[];
}

const initialRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Padella',
    cuisine: 'Italian',
    rating: 5,
    visited: false,
    favorite: true,
    notes: 'Fresh pasta heaven',
    photoUrl: '',
    website: 'https://padella.co',
    hours: '12:00 PM - 10:00 PM',
    location: 'Borough Market, London',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dishoom',
    cuisine: 'Indian',
    rating: 4,
    visited: false,
    favorite: false,
    notes: 'Bombay-style café',
    photoUrl: '',
    website: 'https://dishoom.com',
    hours: '8:00 AM - 11:00 PM',
    location: 'Shoreditch, London',
    createdAt: new Date().toISOString(),
  },
];

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      restaurants: initialRestaurants,
      searchQuery: '',
      sortBy: 'date-desc',
      filterBy: 'all',
      cuisineFilter: '',

      addRestaurant: (restaurant) =>
        set((state) => ({
          restaurants: [
            {
              ...restaurant,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.restaurants,
          ],
        })),

      updateRestaurant: (id, updates) =>
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRestaurant: (id) =>
        set((state) => ({
          restaurants: state.restaurants.filter((r) => r.id !== id),
        })),

      toggleVisited: (id) =>
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id ? { ...r, visited: !r.visited } : r
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id ? { ...r, favorite: !r.favorite } : r
          ),
        })),

      clearAll: () => set({ restaurants: [] }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterBy: (filter) => set({ filterBy: filter }),
      setCuisineFilter: (cuisine) => set({ cuisineFilter: cuisine }),

      importRestaurants: (restaurants) => set({ restaurants }),

      getFilteredRestaurants: () => {
        const { restaurants, searchQuery, sortBy, filterBy, cuisineFilter } = get();
        
        let filtered = [...restaurants];

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((r) =>
            r.name.toLowerCase().includes(query) ||
            r.cuisine.toLowerCase().includes(query) ||
            r.notes.toLowerCase().includes(query) ||
            r.location?.toLowerCase().includes(query)
          );
        }

        // Visited/Favorite filter
        if (filterBy === 'visited') {
          filtered = filtered.filter((r) => r.visited);
        } else if (filterBy === 'unvisited') {
          filtered = filtered.filter((r) => !r.visited);
        } else if (filterBy === 'favorites') {
          filtered = filtered.filter((r) => r.favorite);
        }

        // Cuisine filter
        if (cuisineFilter) {
          filtered = filtered.filter((r) => r.cuisine === cuisineFilter);
        }

        // Sort
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'name-asc':
              return a.name.localeCompare(b.name);
            case 'name-desc':
              return b.name.localeCompare(a.name);
            case 'rating-asc':
              return a.rating - b.rating;
            case 'rating-desc':
              return b.rating - a.rating;
            case 'date-asc':
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'date-desc':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default:
              return 0;
          }
        });

        return filtered;
      },

      getCuisines: () => {
        const { restaurants } = get();
        return [...new Set(restaurants.map((r) => r.cuisine))].sort();
      },
    }),
    {
      name: 'favorestik-storage',
    }
  )
);
