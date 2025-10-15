import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { RestaurantCard } from '@/components/RestaurantCard';
import { AddRestaurantDialog } from '@/components/AddRestaurantDialog';
import { VisitedRatingDialog } from '@/components/VisitedRatingDialog';
import { RandomPicker } from '@/components/RandomPicker';
import { ActionButtons } from '@/components/ActionButtons';
import { EmptyState } from '@/components/EmptyState';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Restaurant } from '@/types/restaurant';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Index = () => {
  const { getFilteredRestaurants, updateRestaurant, toggleVisited } = useRestaurantStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingRestaurant, setRatingRestaurant] = useState<Restaurant | null>(null);

  const filteredRestaurants = getFilteredRestaurants();

  const handleAddClick = () => {
    setEditingRestaurant(null);
    setDialogOpen(true);
  };

  const handleEditClick = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingRestaurant(null);
    }
  };

  const handleVisitedToggle = (restaurant: Restaurant) => {
    if (!restaurant.visited) {
      setRatingRestaurant(restaurant);
      setRatingDialogOpen(true);
    } else {
      toggleVisited(restaurant.id);
      toast.success('Marked as unvisited');
    }
  };

  const handleRatingSubmit = (newRating: number) => {
    if (ratingRestaurant) {
      updateRestaurant(ratingRestaurant.id, { rating: newRating, visited: true });
      toast.success('Rated and marked as visited!');
      setRatingRestaurant(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container py-8 px-4 md:px-6 lg:px-8">
        <div className="mb-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RandomPicker />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <ActionButtons onAddClick={handleAddClick} />
            <div className="grid gap-4 md:grid-cols-2">
              <SearchBar />
              <FilterBar />
            </div>
          </motion.div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <EmptyState onAddClick={handleAddClick} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onEdit={handleEditClick}
                onVisitedToggle={handleVisitedToggle}
              />
            ))}
          </div>
        )}

        {filteredRestaurants.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Showing {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </motion.p>
        )}
      </main>

      <AddRestaurantDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingRestaurant={editingRestaurant}
      />
      
      <VisitedRatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        onSubmit={handleRatingSubmit}
        currentRating={ratingRestaurant?.rating || 3}
      />
    </div>
  );
};

export default Index;
