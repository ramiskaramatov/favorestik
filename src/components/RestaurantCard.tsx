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

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit: (restaurant: Restaurant) => void;
}

export const RestaurantCard = ({ restaurant, onEdit }: RestaurantCardProps) => {
  const { toggleVisited, toggleFavorite, deleteRestaurant } = useRestaurantStore();
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
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
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border-2 transition-all hover:shadow-lg">
        {restaurant.photoUrl && !imageError && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={restaurant.photoUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-lg font-bold">{restaurant.name}</h3>
              <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => toggleFavorite(restaurant.id)}
              className="shrink-0"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  restaurant.favorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
          </div>

          <div className="mb-3 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < restaurant.rating
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>

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

          <div className="mb-3 flex flex-wrap gap-2">
            <Badge
              variant={restaurant.visited ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => toggleVisited(restaurant.id)}
            >
              {restaurant.visited ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Visited
                </>
              ) : (
                'Not visited'
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
              onClick={() => onEdit(restaurant)}
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
      </Card>
    </motion.div>
  );
};
