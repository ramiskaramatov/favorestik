import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VisitedRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number) => void;
  currentRating: number;
}

export const VisitedRatingDialog = ({
  open,
  onOpenChange,
  onSubmit,
  currentRating,
}: VisitedRatingDialogProps) => {
  const [rating, setRating] = useState(currentRating);

  useEffect(() => {
    if (open) {
      setRating(currentRating);
    }
  }, [open, currentRating]);

  const handleSubmit = () => {
    onSubmit(rating);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your visit? Give it a star rating!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Your Rating</Label>
            <div className="flex gap-2 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} className="flex-1">
            Save Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
