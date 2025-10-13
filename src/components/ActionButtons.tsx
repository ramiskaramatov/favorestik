import { Plus, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRestaurantStore } from '@/store/restaurantStore';
import { toast } from 'sonner';
import { useRef } from 'react';

interface ActionButtonsProps {
  onAddClick: () => void;
}

export const ActionButtons = ({ onAddClick }: ActionButtonsProps) => {
  const { restaurants, importRestaurants, clearAll } = useRestaurantStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(restaurants, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favorestik-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Restaurants exported!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          importRestaurants(data);
          toast.success(`Imported ${data.length} restaurants!`);
        } else {
          toast.error('Invalid file format');
        }
      } catch (error) {
        toast.error('Failed to import file');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    if (restaurants.length === 0) {
      toast.error('No restaurants to clear');
      return;
    }

    if (window.confirm(`Delete all ${restaurants.length} restaurants? This cannot be undone!`)) {
      clearAll();
      toast.success('All restaurants deleted');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onAddClick} className="flex-1 sm:flex-none">
        <Plus className="mr-2 h-4 w-4" />
        Add Restaurant
      </Button>

      <Button onClick={handleExport} variant="outline" disabled={restaurants.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
      >
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <Button
        onClick={handleClearAll}
        variant="outline"
        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        disabled={restaurants.length === 0}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clear All
      </Button>
    </div>
  );
};
