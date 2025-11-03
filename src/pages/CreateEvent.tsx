import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateEvent = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    venue: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Événement créé !",
      description: "Votre événement a été publié avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <div className="mx-auto max-w-md animate-zoom-smooth">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-12 pb-8">
          <Link to="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-foreground/70">
              ← Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Créer un événement</h1>
          <p className="text-muted-foreground">Partagez votre événement avec la communauté</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Image Upload */}
          <Card className="p-6 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Ajouter une image</h3>
              <p className="text-sm text-muted-foreground">Cliquez pour télécharger une photo</p>
            </div>
          </Card>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Titre de l'événement *</Label>
            <Input
              id="title"
              placeholder="Ex: Festival de musique Jazz"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concerts">🎵 Concerts</SelectItem>
                <SelectItem value="sports">🏆 Sports</SelectItem>
                <SelectItem value="food">🍔 Food</SelectItem>
                <SelectItem value="arts">🎨 Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue" className="text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lieu *
            </Label>
            <Input
              id="venue"
              placeholder="Ex: Central Park, Abidjan"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Heure *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="h-11"
              />
            </div>
          </div>

          {/* Price and Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Prix
              </Label>
              <Input
                id="price"
                placeholder="Gratuit"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Places
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre événement..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12 text-base font-semibold">
            Publier l'événement
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
