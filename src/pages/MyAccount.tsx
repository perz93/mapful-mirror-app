import { User, Settings, Bell, Heart, Calendar, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MyAccount = () => {
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
          
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Jean Dupont</h1>
              <p className="text-sm text-muted-foreground">jean.dupont@email.com</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 -mt-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Événements</p>
            </Card>
            <Card className="p-4 text-center">
              <Heart className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">28</p>
              <p className="text-xs text-muted-foreground">Favoris</p>
            </Card>
            <Card className="p-4 text-center">
              <User className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Amis</p>
            </Card>
          </div>
        </div>

        {/* Menu Options */}
        <div className="px-6 space-y-3">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Profil</h3>
                <p className="text-sm text-muted-foreground">Modifier vos informations</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Mes événements</h3>
                <p className="text-sm text-muted-foreground">Événements créés et rejoints</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Favoris</h3>
                <p className="text-sm text-muted-foreground">Événements sauvegardés</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">Gérer vos notifications</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Paramètres</h3>
                <p className="text-sm text-muted-foreground">Préférences et confidentialité</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Déconnexion</h3>
                <p className="text-sm text-muted-foreground">Se déconnecter du compte</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
