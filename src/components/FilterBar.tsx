import { SortOption, FilterOption } from '@/types/restaurant';
import { useRestaurantStore } from '@/store/restaurantStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Filter } from 'lucide-react';

export const FilterBar = () => {
  const { sortBy, setSortBy, filterBy, setFilterBy, cuisineFilter, setCuisineFilter, getCuisines } = useRestaurantStore();
  const cuisines = getCuisines();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter:</span>
        </div>
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unvisited">Unvisited</SelectItem>
            <SelectItem value="visited">Visited</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
          </SelectContent>
        </Select>

        {cuisines.length > 0 && (
          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All cuisines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All cuisines</SelectItem>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Sort:</span>
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest first</SelectItem>
            <SelectItem value="date-asc">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="rating-desc">Highest rated</SelectItem>
            <SelectItem value="rating-asc">Lowest rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
