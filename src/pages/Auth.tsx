import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Eye, EyeOff, Check, Loader2, ArrowLeft, MailCheck, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSiteUrl } from "@/lib/siteUrl";

type Mode = "login" | "signup" | "forgot" | "reset";

const MIN_PASSWORD = 8;

/** Traduit les erreurs Supabase (en anglais) en messages compréhensibles. */
const errorKey = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error ?? "");
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials")) return "auth.errInvalid";
  if (msg.includes("email not confirmed")) return "auth.errNotConfirmed";
  if (msg.includes("already registered") || msg.includes("already been registered")) return "auth.errExists";
  if (msg.includes("password should be") || msg.includes("weak password")) return "auth.errWeak";
  if (msg.includes("rate limit") || msg.includes("security purposes") || msg.includes("too many")) return "auth.errRate";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "auth.errNetwork";
  if (msg.includes("invalid email") || msg.includes("unable to validate email")) return "auth.errEmail";
  return "auth.errGeneric";
};

/** Score 0–4 : longueur, chiffre, majuscule, caractère spécial. */
const passwordScore = (pw: string) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= MIN_PASSWORD) score++;
  if (/\d/.test(pw)) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  return score;
};

const inputClass =
  "w-full h-12 px-4 rounded-xl bg-white border border-stone-300 text-ink placeholder:text-stone-400 text-[15px] focus:outline-none transition-colors";

interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  visible: boolean;
  onToggle: () => void;
  onKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  minLength?: number;
  enterKeyHint: "next" | "go";
}

/** Défini hors de la page : sinon recréé à chaque frappe (perte du focus). */
const PasswordField = ({ id, value, onChange, placeholder, autoComplete, visible, onToggle, onKey, minLength, enterKeyHint }: PasswordFieldProps) => (
  <div className="relative">
    <input
      id={id}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyUp={onKey}
      onKeyDown={onKey}
      autoComplete={autoComplete}
      enterKeyHint={enterKeyHint}
      required
      minLength={minLength}
      className={`${inputClass} pr-12`}
    />
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      aria-pressed={visible}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full text-stone-500 hover:text-ink hover:bg-parchment transition-colors"
    >
      {visible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
    </button>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signUp, signIn, user } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>(params.get("mode") === "reset" ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null); // écran « vérifiez votre boîte mail »
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Arrivée via le lien de réinitialisation
  useEffect(() => {
    if (params.get("mode") === "reset") setMode("reset");
  }, [params]);

  // Déjà connecté → accueil (sauf pendant la saisie d'un nouveau mot de passe)
  useEffect(() => {
    if (user && mode !== "reset") navigate("/");
  }, [user, mode, navigate]);

  // Changement d'onglet : on nettoie l'état et on place le curseur
  useEffect(() => {
    setError(null);
    setSentTo(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    const id = window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(id);
  }, [mode]);

  const score = useMemo(() => passwordScore(password), [password]);
  const needsStrongPassword = mode === "signup" || mode === "reset";
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const rules = [
    { ok: password.length >= MIN_PASSWORD, label: t("auth.pwRuleLength") },
    { ok: /\d/.test(password), label: t("auth.pwRuleNumber") },
    { ok: /[A-Z]/.test(password), label: t("auth.pwRuleCase") },
  ];
  const strengthLabel = [t("auth.pwWeak"), t("auth.pwWeak"), t("auth.pwFair"), t("auth.pwGood"), t("auth.pwStrong")][score];

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (needsStrongPassword) {
      if (password.length < MIN_PASSWORD) return setError(t("auth.errWeak"));
      if (password !== confirmPassword) return setError(t("auth.passwordMismatch"));
    }
    if (mode === "signup" && !acceptTerms) return setError(t("auth.acceptTermsRequired"));

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email.trim(), password);
        if (error) setError(t(errorKey(error)));
      } else if (mode === "signup") {
        const { error, needsConfirmation } = await signUp(email.trim(), password, fullName.trim());
        if (error) setError(t(errorKey(error)));
        else if (needsConfirmation) setSentTo(email.trim());
      } else if (mode === "forgot") {
        if (!email.trim()) return setError(t("auth.enterEmail"));
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${getSiteUrl()}/auth?mode=reset`,
        });
        if (error) setError(t(errorKey(error)));
        else setSentTo(email.trim());
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setError(t(errorKey(error)));
        else {
          toast.success(t("auth.resetDone"));
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, { title: string; desc: string }> = {
    login: { title: t("auth.welcome"), desc: t("auth.discoverCity") },
    signup: { title: t("auth.joinUs"), desc: t("auth.liveEveryMoment") },
    forgot: { title: t("auth.forgotTitle"), desc: t("auth.forgotDesc") },
    reset: { title: t("auth.resetTitle"), desc: t("auth.resetDesc") },
  };

  const submitLabel: Record<Mode, string> = {
    login: t("auth.login"),
    signup: t("auth.signup"),
    forgot: t("auth.sendLink"),
    reset: t("auth.resetSave"),
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-y-auto overscroll-none bg-parchment animate-fade-in">
      <div
        className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-8"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <div className="relative w-full rounded-3xl bg-white p-6 pt-5 shadow-2xl">
          {/* Fermer */}
          <button
            onClick={() => navigate("/")}
            aria-label={t("close")}
            className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-parchment text-ink hover:bg-stone-200 active:scale-95 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {/* Onglets Connexion / Inscription */}
          {(mode === "login" || mode === "signup") && !sentTo && (
            <div role="tablist" className="mb-6 inline-flex rounded-full bg-parchment p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
                    mode === m ? "bg-ink text-parchment" : "text-stone-600 hover:text-ink"
                  }`}
                >
                  {m === "login" ? t("auth.tabLogin") : t("auth.tabSignup")}
                </button>
              ))}
            </div>
          )}

          {(mode === "forgot" || (sentTo && mode !== "reset")) && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-ink"
            >
              <ArrowLeft size={16} strokeWidth={1.75} /> {t("auth.backToLogin")}
            </button>
          )}

          {sentTo ? (
            /* Écran de confirmation : email envoyé */
            <div className="pr-12" aria-live="polite">
              <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-lime">
                <MailCheck size={24} strokeWidth={1.75} className="text-ink" />
              </span>
              <h1 className="text-[32px] leading-[0.95] tracking-tighter text-ink">{t("auth.checkInbox")}</h1>
              <p className="mt-3 text-[15px] text-stone-600">
                {t("auth.linkSentTo")} <span className="font-medium text-ink">{sentTo}</span>.
                {mode === "signup" && <> {t("auth.confirmSignup")}</>}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 pr-12">
                <p className="eyebrow mb-3 text-stone-500">VIBE · Abidjan</p>
                <h1 className="text-[40px] leading-[0.95] tracking-tighter text-ink">{titles[mode].title}</h1>
                <p className="mt-3 text-[15px] text-stone-500">{titles[mode].desc}</p>
              </div>

              <form onSubmit={handleSubmit} noValidate={false} className="space-y-3">
                {mode === "signup" && (
                  <input
                    ref={firstFieldRef}
                    type="text"
                    placeholder={t("auth.fullName")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    className={inputClass}
                  />
                )}

                {mode !== "reset" && (
                  <input
                    ref={mode === "signup" ? undefined : firstFieldRef}
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete={mode === "login" ? "username" : "email"}
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={mode === "forgot" ? "send" : "next"}
                    required
                    className={inputClass}
                  />
                )}

                {mode !== "forgot" && (
                  <PasswordField
                    id="password"
                    value={password}
                    onChange={setPassword}
                    placeholder={mode === "reset" ? t("auth.resetTitle") : t("auth.password")}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    onKey={handleKey}
                    minLength={needsStrongPassword ? MIN_PASSWORD : undefined}
                    enterKeyHint={needsStrongPassword ? "next" : "go"}
                  />
                )}

                {capsLock && mode !== "forgot" && (
                  <p className="flex items-center gap-1.5 px-1 text-xs font-medium text-stone-600">
                    <AlertCircle size={14} strokeWidth={1.75} /> {t("auth.capsLock")}
                  </p>
                )}

                {/* Force du mot de passe */}
                {needsStrongPassword && password.length > 0 && (
                  <div className="space-y-2 px-1" aria-live="polite">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              score >= i ? (score <= 1 ? "bg-destructive" : score === 2 ? "bg-stone-500" : "bg-lime-deep") : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="w-12 text-right text-xs font-medium text-stone-600">{strengthLabel}</span>
                    </div>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1">
                      {rules.map((r) => (
                        <li key={r.label} className={`flex items-center gap-1 text-xs ${r.ok ? "text-ink" : "text-stone-400"}`}>
                          <Check size={12} strokeWidth={2.5} className={r.ok ? "text-lime-deep" : "text-stone-300"} />
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {needsStrongPassword && (
                  <>
                    <PasswordField
                      id="confirm"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder={t("auth.confirmPassword")}
                      autoComplete="new-password"
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      onKey={handleKey}
                      minLength={MIN_PASSWORD}
                      enterKeyHint="go"
                    />
                    {confirmPassword.length > 0 && (
                      <p className={`flex items-center gap-1.5 px-1 text-xs font-medium ${passwordsMatch ? "text-ink" : "text-stone-500"}`}>
                        {passwordsMatch ? (
                          <><Check size={14} strokeWidth={2.5} className="text-lime-deep" /> {t("auth.pwMatch")}</>
                        ) : (
                          <><AlertCircle size={14} strokeWidth={1.75} /> {t("auth.passwordMismatch")}</>
                        )}
                      </p>
                    )}
                  </>
                )}

                {mode === "login" && (
                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-stone-600 hover:text-ink transition-colors link-underline"
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  </div>
                )}

                {mode === "signup" && (
                  <label htmlFor="terms" className="flex items-start gap-2.5 px-1 pt-1 cursor-pointer">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <span className="text-xs leading-relaxed text-stone-600">
                      {t("auth.acceptTerms")}{" "}
                      <a href="/settings" className="text-ink link-underline">{t("auth.termsOfUse")}</a>{" "}
                      {t("auth.andThe")}{" "}
                      <a href="/settings" className="text-ink link-underline">{t("auth.privacyPolicy")}</a>
                    </span>
                  </label>
                )}

                {/* Erreur lisible, dans le formulaire */}
                {error && (
                  <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full h-12 items-center justify-center gap-2 rounded-full bg-lime text-ink text-[15px] font-medium hover:bg-lime-deep transition-colors active:scale-[0.98] disabled:opacity-60"
                >
                  {loading && <Loader2 size={18} strokeWidth={2} className="animate-spin" />}
                  {submitLabel[mode]}
                </button>
              </form>

              {(mode === "login" || mode === "signup") && (
                <p className="mt-5 border-t border-stone-200 pt-4 text-center text-xs text-stone-500">
                  {mode === "login" ? t("auth.exploreNearby") : t("auth.shareWithCommunity")}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
