import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-100 dark:bg-stone-950">
      {/* Map Background with blur effect */}
      <div 
        className="absolute inset-0 blur-sm scale-105 opacity-30" 
        style={{
          backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/2.3522,48.8566,11,0/1200x800@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Content Card */}
      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <div className="bg-background/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative">
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mt-8 mb-12">
            <h1 className="text-3xl font-bold font-heading mb-3">
              {isLogin ? "Bienvenue" : "Rejoignez-nous"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isLogin 
                ? "Découvrez votre ville autrement" 
                : "Vivez chaque instant qui compte"}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 mb-8">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-6 py-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full px-6 py-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                className="w-full px-6 py-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-full text-base font-medium border-2"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </Button>
            <Button
              className="flex-1 h-14 rounded-full text-base font-medium bg-foreground text-background hover:bg-foreground/90"
              onClick={() => {
                // TODO: Handle authentication
                console.log(isLogin ? "Login" : "Signup");
              }}
            >
              {isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin 
              ? "Explorez les événements près de chez vous" 
              : "Partagez vos moments avec la communauté"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
