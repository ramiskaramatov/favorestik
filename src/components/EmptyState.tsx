import { UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddClick: () => void;
}

export const EmptyState = ({ onAddClick }: EmptyStateProps) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <UtensilsCrossed className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No restaurants yet</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Start building your wishlist of amazing places to eat! Add your first restaurant to get started.
      </p>
      <Button onClick={onAddClick} size="lg">
        Add Your First Restaurant
      </Button>
    </div>
  );
};
