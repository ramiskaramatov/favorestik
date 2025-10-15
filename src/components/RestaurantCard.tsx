import { Restaurant } from '@/types/restaurant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Star,
  MapPin,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  Check,
  Share2,
} from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { VisitedRatingDialog } from './VisitedRatingDialog';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit: (restaurant: Restaurant) => void;
}

export const RestaurantCard = ({ restaurant, onEdit }: RestaurantCardProps) => {
  const { toggleVisited, toggleFavorite, deleteRestaurant, updateRestaurant } = useRestaurantStore();
  const [imageError, setImageError] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  const handleVisitedToggle = () => {
    console.log('handleVisitedToggle clicked for:', restaurant.name);
    if (!restaurant.visited) {
      // Opening rating dialog when marking as visited
      setRatingDialogOpen(true);
    } else {
      // Unmark as visited
      toggleVisited(restaurant.id);
      toast.success('Marked as unvisited');
    }
  };

  const handleRatingSubmit = (newRating: number) => {
    updateRestaurant(restaurant.id, { rating: newRating, visited: true });
    toast.success('Rated and marked as visited!');
  };

  const handleShare = async () => {
    console.log('handleShare clicked for:', restaurant.name);
    const text = `${restaurant.name} - ${restaurant.cuisine} cuisine (${restaurant.rating}⭐)\n${restaurant.location || ''}\n${restaurant.website || ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant.name, text });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  const handleDelete = () => {
    console.log('handleDelete clicked for:', restaurant.name);
    if (window.confirm(`Delete ${restaurant.name}?`)) {
      deleteRestaurant(restaurant.id);
      toast.success('Restaurant deleted');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-2 transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-primary/20">
        {restaurant.photoUrl && !imageError && (
          <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            <img
              src={restaurant.photoUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {restaurant.name}
              </h3>
              <Badge variant="secondary" className="mt-1 text-xs font-medium px-3 py-1">
                {restaurant.cuisine}
              </Badge>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                console.log('toggleFavorite clicked for:', restaurant.name);
                toggleFavorite(restaurant.id);
              }}
              className="shrink-0"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  restaurant.favorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
          </div>

          {restaurant.visited ? (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 transition-all ${
                    i < restaurant.rating
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: restaurant.rating }).map((_, i) => (
                  <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>🔥</span>
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground">Excitement Level</span>
            </div>
          )}

          {restaurant.location && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{restaurant.location}</span>
            </div>
          )}

          {restaurant.hours && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{restaurant.hours}</span>
            </div>
          )}

          {restaurant.notes && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {restaurant.notes}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={restaurant.visited ? 'default' : 'secondary'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleVisitedToggle}
            >
              {restaurant.visited ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Visited
                </>
              ) : (
                'Mark as Visited'
              )}
            </Badge>

            {restaurant.favorite && (
              <Badge variant="outline" className="border-red-500 text-red-500">
                Favorite
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {restaurant.website && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="flex-1"
              >
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Website
                </a>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('onEdit clicked for:', restaurant.name);
                onEdit(restaurant);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>

        <VisitedRatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          onSubmit={handleRatingSubmit}
          currentRating={restaurant.rating}
        />
      </Card>
    </motion.div>
  );
};
