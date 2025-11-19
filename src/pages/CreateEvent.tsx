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
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    venue: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    description: ''
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Événement créé !",
      description: "Votre événement a été publié avec succès."
    });
  };
  return <div className="min-h-screen bg-background pb-32 animate-fade-in">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10">
          <Link to="/" className="inline-block mb-8">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2">
              ← Retour
            </Button>
          </Link>
          <h1 className="text-4xl font-light text-foreground mb-3 text-center">Créer un événement</h1>
          <p className="text-muted-foreground font-light text-center">Partagez votre événement avec la communauté</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-6 space-y-6 sm:space-y-8">
          {/* Image Upload */}
          <div className="border border-dashed border-border/50 rounded-2xl p-8 hover:border-border transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" strokeWidth={1.5} />
              <h3 className="font-light text-foreground mb-1">Ajouter une image</h3>
              <p className="text-sm text-muted-foreground font-light">Cliquez pour télécharger</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm text-muted-foreground font-normal">Titre de l'événement *</Label>
            <Input id="title" placeholder="Festival de musique Jazz" value={formData.title} onChange={e => setFormData({
            ...formData,
            title: e.target.value
          })} required className="h-12 border-border/50 bg-transparent" />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label htmlFor="category" className="text-sm text-muted-foreground font-normal">Catégorie *</Label>
            <Select value={formData.category} onValueChange={value => setFormData({
            ...formData,
            category: value
          })}>
              <SelectTrigger className="h-12 border-border/50 bg-transparent">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-background/95 border-border/50">
                <SelectItem value="concerts">🎵 Concerts</SelectItem>
                <SelectItem value="sports">🏆 Sports</SelectItem>
                <SelectItem value="food">🍔 Restauration</SelectItem>
                <SelectItem value="arts">🎨 Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue */}
          <div className="space-y-3">
            <Label htmlFor="venue" className="text-sm text-muted-foreground font-normal flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
              Lieu *
            </Label>
            <Input id="venue" placeholder="Centre culturel de Dakar" value={formData.venue} onChange={e => setFormData({
            ...formData,
            venue: e.target.value
          })} required className="h-12 border-border/50 bg-transparent" />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                Date *
              </Label>
              <Input id="date" type="date" value={formData.date} onChange={e => setFormData({
              ...formData,
              date: e.target.value
            })} required className="h-12 border-border/50 bg-transparent" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="time" className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                Heure *
              </Label>
              <Input id="time" type="time" value={formData.time} onChange={e => setFormData({
              ...formData,
              time: e.target.value
            })} required className="h-12 border-border/50 bg-transparent" />
            </div>
          </div>

          {/* Price and Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" strokeWidth={1.5} />
                Prix
              </Label>
              <Input id="price" placeholder="Gratuit" value={formData.price} onChange={e => setFormData({
              ...formData,
              price: e.target.value
            })} className="h-12 border-border/50 bg-transparent" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="capacity" className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                Capacité
              </Label>
              <Input id="capacity" type="number" placeholder="100" value={formData.capacity} onChange={e => setFormData({
              ...formData,
              capacity: e.target.value
            })} className="h-12 border-border/50 bg-transparent" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm text-muted-foreground font-normal">Description</Label>
            <Textarea id="description" placeholder="Décrivez votre événement..." value={formData.description} onChange={e => setFormData({
            ...formData,
            description: e.target.value
          })} rows={5} className="border-border/50 bg-transparent resize-none" />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12 text-base font-normal mt-10">
            Publier l'événement
          </Button>
        </form>
      </div>
    </div>;
};
export default CreateEvent;