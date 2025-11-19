import { User, Settings, Bell, Heart, Calendar, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MyAccount = () => {
  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="px-6 pt-16 pb-12">
          <Link to="/" className="inline-block mb-8">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2">
              ← Retour
            </Button>
          </Link>
          
          <div className="flex items-center gap-5">
            <Avatar className="h-24 w-24 border border-border/50">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-light text-foreground mb-1">Jean Dupont</h1>
              <p className="text-sm text-muted-foreground font-light">jean.dupont@email.com</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 mb-12">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-6 border border-border/30 rounded-2xl hover:border-border/50 transition-colors">
              <p className="text-3xl font-light text-foreground mb-1">12</p>
              <p className="text-xs text-muted-foreground font-light">Événements</p>
            </div>
            <div className="text-center p-6 border border-border/30 rounded-2xl hover:border-border/50 transition-colors">
              <p className="text-3xl font-light text-foreground mb-1">28</p>
              <p className="text-xs text-muted-foreground font-light">Favoris</p>
            </div>
            <div className="text-center p-6 border border-border/30 rounded-2xl hover:border-border/50 transition-colors">
              <p className="text-3xl font-light text-foreground mb-1">5</p>
              <p className="text-xs text-muted-foreground font-light">Amis</p>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="px-6 space-y-1">
          <div className="py-5 border-b border-border/30 hover:border-border/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <div>
                  <h3 className="font-normal text-foreground">Profil</h3>
                  <p className="text-sm text-muted-foreground font-light">Modifier vos informations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-border/30 hover:border-border/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <div>
                  <h3 className="font-normal text-foreground">Mes événements</h3>
                  <p className="text-sm text-muted-foreground font-light">Événements créés et rejoints</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-border/30 hover:border-border/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Heart className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <div>
                  <h3 className="font-normal text-foreground">Favoris</h3>
                  <p className="text-sm text-muted-foreground font-light">Événements sauvegardés</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-border/30 hover:border-border/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <div>
                  <h3 className="font-normal text-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground font-light">Gérer vos notifications</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-border/30 hover:border-border/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <div>
                  <h3 className="font-normal text-foreground">Paramètres</h3>
                  <p className="text-sm text-muted-foreground font-light">Préférences et confidentialité</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 hover:border-border/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LogOut className="h-5 w-5 text-destructive/70 group-hover:text-destructive transition-colors" strokeWidth={1.5} />
                <div>
                  <h3 className="font-normal text-destructive">Déconnexion</h3>
                  <p className="text-sm text-muted-foreground font-light">Se déconnecter du compte</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
