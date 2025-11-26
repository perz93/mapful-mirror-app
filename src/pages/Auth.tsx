import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mapBackground from "@/assets/map-background.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!isLogin && !acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);
    
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, fullName);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error("Erreur lors de l'envoi de l'email");
    } else {
      toast.success("Email de réinitialisation envoyé !");
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-100 dark:bg-stone-950">
      {/* Map Background with blur effect */}
      <div 
        className="absolute inset-0 blur-sm scale-105 opacity-50" 
        style={{
          backgroundImage: `url(${mapBackground})`,
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
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            {!isLogin && (
              <input
                type="text"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-6 py-4 pr-12 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-6 py-4 pr-12 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}

            {/* Terms and Conditions - Only for signup */}
            {!isLogin && (
              <div className="flex items-start gap-3 px-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-tight cursor-pointer"
                >
                  J'accepte les{" "}
                  <a href="/terms" className="text-foreground underline hover:opacity-80">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="/privacy" className="text-foreground underline hover:opacity-80">
                    politique de confidentialité
                  </a>
                </label>
              </div>
            )}

            {/* Forgot Password - Only for login */}
            {isLogin && (
              <div className="flex justify-end px-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-14 rounded-full text-base font-medium border-2"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
                setConfirmPassword("");
              }}
              disabled={loading}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 rounded-full text-base font-medium bg-foreground text-background hover:bg-foreground/90"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "..." : isLogin ? "Se connecter" : "S'inscrire"}
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
