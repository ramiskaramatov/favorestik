import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { toast } from 'sonner';

interface AddRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRestaurant?: Restaurant | null;
}

export const AddRestaurantDialog = ({
  open,
  onOpenChange,
  editingRestaurant,
}: AddRestaurantDialogProps) => {
  const { addRestaurant, updateRestaurant } = useRestaurantStore();
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    rating: 3,
    notes: '',
    photoUrl: '',
    website: '',
    hours: '',
    location: '',
  });
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);

  useEffect(() => {
    if (editingRestaurant) {
      setFormData({
        name: editingRestaurant.name,
        cuisine: editingRestaurant.cuisine,
        rating: editingRestaurant.rating,
        notes: editingRestaurant.notes,
        photoUrl: editingRestaurant.photoUrl || '',
        website: editingRestaurant.website || '',
        hours: editingRestaurant.hours || '',
        location: editingRestaurant.location || '',
      });
    } else {
      setFormData({
        name: '',
        cuisine: '',
        rating: 3,
        notes: '',
        photoUrl: '',
        website: '',
        hours: '',
        location: '',
      });
    }
  }, [editingRestaurant, open]);

  const handleLoadFromGoogleMaps = async () => {
    if (!googleMapsUrl) {
      toast.error('Please enter a Google Maps URL');
      return;
    }

    setIsLoadingMaps(true);
    try {
      // Extract place name from URL if possible
      const urlMatch = googleMapsUrl.match(/place\/([^/]+)/);
      const placeName = urlMatch ? decodeURIComponent(urlMatch[1].replace(/\+/g, ' ')) : '';
      
      if (placeName) {
        setFormData(prev => ({ ...prev, name: placeName }));
        toast.success('Extracted name from URL! Please fill in remaining details.');
      } else {
        toast.info('Could not extract data. Please fill in the details manually.');
      }
    } catch (error) {
      console.error('Error extracting from Google Maps:', error);
      toast.error('Could not load data from URL');
    } finally {
      setIsLoadingMaps(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.cuisine) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingRestaurant) {
      updateRestaurant(editingRestaurant.id, formData);
      toast.success('Restaurant updated!');
    } else {
      addRestaurant({
        ...formData,
        visited: false,
        favorite: false,
      });
      toast.success('Restaurant added!');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
          </DialogTitle>
          <DialogDescription>
            {editingRestaurant
              ? 'Update restaurant details'
              : 'Add a new restaurant to your wishlist'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingRestaurant && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <Label htmlFor="googleMapsUrl">Quick Add from Google Maps</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Paste a Google Maps URL to auto-fill the name
              </p>
              <div className="flex gap-2">
                <Input
                  id="googleMapsUrl"
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
                <Button
                  type="button"
                  onClick={handleLoadFromGoogleMaps}
                  disabled={isLoadingMaps}
                  variant="secondary"
                >
                  {isLoadingMaps ? 'Loading...' : 'Load'}
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Padella"
              required
            />
          </div>

          <div>
            <Label htmlFor="cuisine">
              Cuisine <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cuisine"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              placeholder="e.g., Italian"
              required
            />
          </div>

          <div>
            <Label>Excitement Level (How bad you want to try it!)</Label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: i + 1 })}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {i < formData.rating ? '🔥' : '⚪'}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This becomes the star rating once you mark it as visited
            </p>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Borough Market, London"
            />
          </div>

          <div>
            <Label htmlFor="hours">Opening Hours</Label>
            <Input
              id="hours"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="e.g., 12:00 PM - 10:00 PM"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              id="photoUrl"
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Why you want to try this place..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingRestaurant ? 'Update' : 'Add Restaurant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
