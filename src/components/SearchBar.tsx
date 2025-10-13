import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRestaurantStore } from '@/store/restaurantStore';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useRestaurantStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search restaurants..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
