import { create } from 'zustand';
import { Restaurant, SortOption, FilterOption } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RestaurantStore {
  restaurants: Restaurant[];
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  cuisineFilter: string;
  loading: boolean;
  
  // Actions
  fetchRestaurants: () => Promise<void>;
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt'>) => Promise<void>;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  toggleVisited: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  setCuisineFilter: (cuisine: string) => void;
  
  // Computed
  getFilteredRestaurants: () => Restaurant[];
  getCuisines: () => string[];
}

export const useRestaurantStore = create<RestaurantStore>()((set, get) => ({
  restaurants: [],
  searchQuery: '',
  sortBy: 'date-desc',
  filterBy: 'all',
  cuisineFilter: '',
  loading: false,

  fetchRestaurants: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      set({ restaurants: [], loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load restaurants');
      set({ loading: false });
      return;
    }

    const restaurants: Restaurant[] = (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      visited: r.visited,
      favorite: r.favorite,
      notes: r.notes,
      photoUrl: r.photo_url,
      website: r.website,
      hours: r.hours,
      location: r.location,
      createdAt: r.created_at,
    }));

    set({ restaurants, loading: false });
  },

  addRestaurant: async (restaurant) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        user_id: user.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        visited: restaurant.visited,
        favorite: restaurant.favorite,
        notes: restaurant.notes,
        photo_url: restaurant.photoUrl,
        website: restaurant.website,
        hours: restaurant.hours,
        location: restaurant.location,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add restaurant');
      return;
    }

    const newRestaurant: Restaurant = {
      id: data.id,
      name: data.name,
      cuisine: data.cuisine,
      rating: data.rating,
      visited: data.visited,
      favorite: data.favorite,
      notes: data.notes,
      photoUrl: data.photo_url,
      website: data.website,
      hours: data.hours,
      location: data.location,
      createdAt: data.created_at,
    };

    set((state) => ({
      restaurants: [newRestaurant, ...state.restaurants],
    }));
  },

  updateRestaurant: async (id, updates) => {
    const { error } = await supabase
      .from('restaurants')
      .update({
        name: updates.name,
        cuisine: updates.cuisine,
        rating: updates.rating,
        visited: updates.visited,
        favorite: updates.favorite,
        notes: updates.notes,
        photo_url: updates.photoUrl,
        website: updates.website,
        hours: updates.hours,
        location: updates.location,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update restaurant');
      return;
    }

    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },

  deleteRestaurant: async (id) => {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete restaurant');
      return;
    }

    set((state) => ({
      restaurants: state.restaurants.filter((r) => r.id !== id),
    }));
  },

  toggleVisited: async (id) => {
    const restaurant = get().restaurants.find((r) => r.id === id);
    if (!restaurant) return;

    const { error } = await supabase
      .from('restaurants')
      .update({ visited: !restaurant.visited })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update restaurant');
      return;
    }

    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? { ...r, visited: !r.visited } : r
      ),
    }));
  },

  toggleFavorite: async (id) => {
    const restaurant = get().restaurants.find((r) => r.id === id);
    if (!restaurant) return;

    const { error } = await supabase
      .from('restaurants')
      .update({ favorite: !restaurant.favorite })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update restaurant');
      return;
    }

    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? { ...r, favorite: !r.favorite } : r
      ),
    }));
  },

  clearAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to clear restaurants');
      return;
    }

    set({ restaurants: [] });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterBy: (filter) => set({ filterBy: filter }),
  setCuisineFilter: (cuisine) => set({ cuisineFilter: cuisine }),

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
}));
