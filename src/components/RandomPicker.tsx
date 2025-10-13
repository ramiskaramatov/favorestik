import { useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dices, Sparkles, MapPin, Star, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const RandomPicker = () => {
  const { restaurants } = useRestaurantStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handlePick = () => {
    const unvisited = restaurants.filter((r) => !r.visited);
    
    if (unvisited.length === 0) {
      toast.error('All restaurants visited! Add more or unmark some as visited.');
      return;
    }

    setIsSpinning(true);
    setSelectedRestaurant(null);

    // Simulate spinning animation
    setTimeout(() => {
      const random = unvisited[Math.floor(Math.random() * unvisited.length)];
      setSelectedRestaurant(random);
      setIsSpinning(false);
      toast.success(`How about ${random.name}?`, {
        icon: '🎉',
      });
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <Button
          onClick={handlePick}
          disabled={isSpinning}
          size="lg"
          className="relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:shadow-lg"
        >
          <AnimatePresence mode="wait">
            {isSpinning ? (
              <motion.div
                key="spinning"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                exit={{ rotate: 0 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
              >
                <Dices className="mr-2 h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
          {isSpinning ? 'Picking...' : 'Pick Random Restaurant'}
        </Button>
      </div>

      <AnimatePresence>
        {selectedRestaurant && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Card className="relative border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  <span className="sr-only">Close</span>
                  ✕
                </Button>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Your pick for today:
                  </p>
                </div>

                <h3 className="mb-2 text-2xl font-bold">{selectedRestaurant.name}</h3>
                <p className="mb-3 text-muted-foreground">{selectedRestaurant.cuisine}</p>

                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < selectedRestaurant.rating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                {selectedRestaurant.location && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedRestaurant.location}</span>
                  </div>
                )}

                {selectedRestaurant.notes && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {selectedRestaurant.notes}
                  </p>
                )}

                {selectedRestaurant.website && (
                  <Button asChild size="sm" className="w-full">
                    <a
                      href={selectedRestaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
