import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, KeyRound, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { loginAsGuest, getUserId } = useAuth();

  // If already authenticated, redirect
  if (getUserId()) {
    setLocation("/");
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setStep("otp");
    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      setError("Wprowadź 6-cyfrowy kod");
      return;
    }
    
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      setError("Nieprawidłowy kod. Spróbuj ponownie.");
      setIsLoading(false);
      return;
    }

    // Success - useAuth effect will pick it up and redirect
    setLocation("/");
  };

  const handleGuest = () => {
    loginAsGuest();
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-background">
      {/* Decorative background matching requested image prompt */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="Abstract decorative background"
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Cortical AI</h1>
            <p className="text-muted-foreground mt-2 text-center">
              Zaloguj się, aby uzyskać dostęp do najpotężniejszych modeli Prime.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Adres E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nazwa@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? "Wysyłanie..." : "Kontynuuj z Email"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm text-center space-y-1">
                  <p className="font-medium">Sprawdź skrzynkę mailową</p>
                  <p className="text-xs text-muted-foreground">
                    Wysłaliśmy wiadomość na <span className="text-foreground font-medium">{email}</span>.<br />
                    Kliknij link w e-mailu <span className="text-muted-foreground">lub wpisz 6-cyfrowy kod poniżej</span>.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Kod weryfikacyjny (opcjonalnie)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all tracking-widest font-mono text-lg"
                    />
                  </div>
                </div>

                {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || token.length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? "Weryfikacja..." : "Potwierdź kod"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("email"); setToken(""); setError(""); }}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Wróć i zmień e-mail
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-3">Nie chcesz się logować?</p>
            <button
              onClick={handleGuest}
              className="w-full py-2.5 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
            >
              Kontynuuj jako Gość
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
