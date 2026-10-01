import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSiteUrl } from "@/lib/siteUrl";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { t } = useLanguage();
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
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (!isLogin && !acceptTerms) {
      toast.error(t('auth.acceptTermsRequired'));
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
      toast.error(t('auth.enterEmail'));
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth`,
    });

    if (error) {
      toast.error(t('auth.resetSendError'));
    } else {
      toast.success(t('auth.resetSent'));
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden overscroll-none bg-parchment animate-fade-in">

      {/* Content Card with 3D flip */}
      <div
        className="relative z-10 flex items-center justify-center min-h-screen w-full p-4 -mt-8 sm:mt-0"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full max-w-md h-auto transition-all duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: isLogin ? "rotateY(0deg)" : "rotateY(180deg)",
          }}
        >
          {/* Login Face (Front) */}
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 pt-5 w-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: isLogin ? "relative" : "absolute",
              inset: 0,
              // Certains navigateurs (Safari iOS) laissent passer les boutons de la face cachée :
              // on masque la face inactive à mi-rotation.
              visibility: isLogin ? "visible" : "hidden",
              transition: "visibility 0s linear 350ms",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => navigate("/")}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-parchment hover:bg-stone-200 flex items-center justify-center active:scale-95 transition-all duration-200 z-10"
              aria-label={t('close')}
            >
              <X className="w-4 h-4 text-ink" strokeWidth={1.75} />
            </button>

            {/* Header */}
            <div className="mt-1 mb-7 pr-12">
              <p className="eyebrow text-stone-500 mb-4">VIBE · Abidjan</p>
              <h1 className="text-[40px] leading-[0.95] font-medium tracking-tighter text-ink mb-3">{t('auth.welcome')}</h1>
              <p className="text-stone-500 text-[15px]">
                {t('auth.discoverCity')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 mb-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-white border border-stone-300 focus:outline-none transition-all text-[15px]"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 pr-11 rounded-xl bg-white border border-stone-300 focus:outline-none transition-all text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-stone-600 hover:text-ink transition-colors link-underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-full text-[15px] font-medium bg-white text-ink border border-stone-300 hover:border-ink"
                onClick={() => {
                  setIsLogin(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                disabled={loading}
              >
                {t('auth.signup')}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-full text-[15px] font-medium bg-lime text-ink hover:bg-lime-deep"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "..." : t('auth.login')}
              </Button>
            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-stone-500 pt-4 border-t border-stone-200">
              {t('auth.exploreNearby')}
            </p>
          </div>

          {/* Signup Face (Back) */}
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 pt-5 w-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              position: isLogin ? "absolute" : "relative",
              inset: 0,
              visibility: isLogin ? "hidden" : "visible",
              transition: "visibility 0s linear 350ms",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => navigate("/")}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-parchment hover:bg-stone-200 flex items-center justify-center active:scale-95 transition-all duration-200 z-10"
              aria-label={t('close')}
            >
              <X className="w-4 h-4 text-ink" strokeWidth={1.75} />
            </button>

            {/* Header */}
            <div className="mt-1 mb-7 pr-12">
              <p className="eyebrow text-stone-500 mb-4">VIBE · Abidjan</p>
              <h1 className="text-[40px] leading-[0.95] font-medium tracking-tighter text-ink mb-3">{t('auth.joinUs')}</h1>
              <p className="text-stone-500 text-[15px]">
                {t('auth.liveEveryMoment')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 mb-6">
              <input
                type="text"
                placeholder={t('auth.fullName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white border border-stone-300 focus:outline-none transition-all text-[15px]"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-white border border-stone-300 focus:outline-none transition-all text-[15px]"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 pr-11 rounded-xl bg-white border border-stone-300 focus:outline-none transition-all text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('auth.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 pr-11 rounded-xl bg-white border border-stone-300 focus:outline-none transition-all text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Terms and Conditions */}
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
                  {t('auth.acceptTerms')}{" "}
                  <a href="/terms" className="text-foreground underline hover:opacity-80">
                    {t('auth.termsOfUse')}
                  </a>{" "}
                  {t('auth.andThe')}{" "}
                  <a href="/privacy" className="text-foreground underline hover:opacity-80">
                    {t('auth.privacyPolicy')}
                  </a>
                </label>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-full text-[15px] font-medium bg-white text-ink border border-stone-300 hover:border-ink"
                onClick={() => {
                  setIsLogin(true);
                  setPassword("");
                  setConfirmPassword("");
                }}
                disabled={loading}
              >
                {t('auth.login')}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-full text-[15px] font-medium bg-lime text-ink hover:bg-lime-deep"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "..." : t('auth.signup')}
              </Button>
            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-stone-500 pt-4 border-t border-stone-200">
              {t('auth.shareWithCommunity')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
