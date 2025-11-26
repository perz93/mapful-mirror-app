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
      {/* Map Background - animation permanente */}
      <div 
        className="absolute inset-0 opacity-40 animate-pan" 
        style={{
          backgroundImage: `url(${mapBackground})`,
          backgroundSize: '150% 150%',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Content Card */}
      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <div 
          className="bg-background/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 relative transition-all duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mt-6 mb-6">
            <h1 className="text-2xl font-bold font-heading mb-2">
              {isLogin ? "Bienvenue" : "Rejoignez-nous"}
            </h1>
            <p className="text-muted-foreground text-base">
              {isLogin 
                ? "Découvrez votre ville autrement" 
                : "Vivez chaque instant qui compte"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            {!isLogin && (
              <input
                type="text"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-3 pr-11 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  className="w-full px-5 py-3 pr-11 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* Terms and Conditions - Only for signup */}
            {!isLogin && (
              <div className="flex items-start gap-2 px-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-tight cursor-pointer"
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
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <Button
              type="button"
              variant="outline"
              className={`flex-1 h-12 rounded-full text-sm font-medium border-2 transition-all ${
                !isLogin 
                  ? "bg-background text-foreground border-border" 
                  : "bg-foreground text-background border-foreground hover:bg-foreground/90"
              }`}
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
              className={`flex-1 h-12 rounded-full text-sm font-medium transition-all ${
                isLogin 
                  ? "bg-background text-foreground border-2 border-border hover:bg-muted" 
                  : "bg-foreground text-background hover:bg-foreground/90"
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-muted-foreground">
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
