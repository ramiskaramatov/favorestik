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
import { Star, Loader2 } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Fetching place details from Google Maps...');
      
      const { data, error } = await supabase.functions.invoke('google-places-autofill', {
        body: { mapsUrl: googleMapsUrl }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      console.log('Received data:', data);

      // Update form with all extracted data
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        cuisine: data.cuisine || prev.cuisine,
        location: data.location || prev.location,
        hours: data.hours || prev.hours,
        website: data.website || prev.website,
        photoUrl: data.photoUrl || prev.photoUrl,
        rating: data.rating || prev.rating,
      }));

      toast.success('Successfully loaded restaurant details from Google Maps!');
    } catch (error) {
      console.error('Error loading from Google Maps:', error);
      toast.error(error.message || 'Failed to load data from Google Maps');
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
            <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
              <Label htmlFor="googleMapsUrl" className="text-base font-semibold">
                🗺️ Quick Add from Google Maps
              </Label>
              <p className="mb-3 text-xs text-muted-foreground">
                Paste any Google Maps restaurant link to auto-fill all details
              </p>
              <div className="flex gap-2">
                <Input
                  id="googleMapsUrl"
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="flex-1"
                  disabled={isLoadingMaps}
                />
                <Button
                  type="button"
                  onClick={handleLoadFromGoogleMaps}
                  disabled={isLoadingMaps || !googleMapsUrl}
                  variant="default"
                  className="min-w-[100px]"
                >
                  {isLoadingMaps ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading
                    </>
                  ) : (
                    'Auto-Fill'
                  )}
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
