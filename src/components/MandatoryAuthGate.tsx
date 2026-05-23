"use client";

import { useState } from "react";
import { Mail, Lock, User, Loader2, Flame, ShieldAlert } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

interface MandatoryAuthGateProps {
  children: React.ReactNode;
}

export default function MandatoryAuthGate({ children }: MandatoryAuthGateProps) {
  const { currentUser, authLoading } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Initial Loading State
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0714] text-white">
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-tertiary/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Flame className="h-12 w-12 text-primary animate-bounce duration-1000" style={{ filter: "drop-shadow(0 0 16px rgba(255,141,138,0.6))" }} />
          <Loader2 className="h-6 w-6 animate-spin text-outline mt-2" />
          <span className="font-headline font-bold text-xs tracking-widest uppercase text-outline mt-1">Initializing Vault...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Mandatory Gate)
  if (!currentUser) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        if (isSignUp) {
          if (!username.trim()) {
            throw new Error("Username is required");
          }
          if (username.length < 3) {
            throw new Error("Username must be at least 3 characters");
          }

          // Register user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const normalizedEmail = email.toLowerCase().trim();
          const role = normalizedEmail === "admin@admin.com" ? "admin" : "user";

          // Create Firestore profile document
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: normalizedEmail,
            username: username.trim(),
            role,
            createdAt: new Date(),
          });
        } else {
          // Sign In
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (err: any) {
        console.error(err);
        let errMsg = "An unexpected error occurred";
        if (err.code === "auth/email-already-in-use") {
          errMsg = "This email is already in use.";
        } else if (err.code === "auth/weak-password") {
          errMsg = "Password should be at least 6 characters.";
        } else if (err.code === "auth/invalid-email") {
          errMsg = "Invalid email address.";
        } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          errMsg = "Invalid email or password.";
        } else if (err.code === "auth/configuration-not-found" || err.message?.includes("configuration-not-found")) {
          errMsg = "Email/Password sign-in provider is not enabled in Firebase. Please go to your Firebase Console under Authentication > Sign-in method and enable 'Email/Password'.";
        } else if (err.message) {
          errMsg = err.message;
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09040d] px-4 overflow-y-auto py-12 custom-scrollbar">
        {/* Glow Effects */}
        <div className="fixed -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="fixed -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-tertiary/10 blur-[120px] pointer-events-none" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#ff8d8a]/03 blur-[140px] pointer-events-none" />

        {/* Modal Card */}
        <div
          className="relative w-full max-w-md overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-500 animate-scaleIn shadow-2xl border"
          style={{
            background: "linear-gradient(135deg, rgba(30, 20, 45, 0.7) 0%, rgba(15, 10, 25, 0.9) 100%)",
            borderColor: "rgba(255, 141, 138, 0.12)",
            boxShadow: "0 32px 80px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex items-center gap-2 mb-3">
              <Flame
                className="h-8 w-8 text-primary animate-pulse"
                style={{ filter: "drop-shadow(0 0 10px rgba(255,141,138,0.4))" }}
              />
              <span
                className="font-headline font-extrabold text-2xl tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                HentaiVault
              </span>
            </div>
            <h2 className="font-headline font-extrabold text-2xl tracking-tight text-white mb-2">
              {isSignUp ? "Create an Account" : "Access the Vault"}
            </h2>
            <p className="text-xs font-body text-outline max-w-xs leading-normal">
              {isSignUp
                ? "Sign up with email and a custom username to unlock infinite scrolls, loops, and saves."
                : "This platform is restricted to registered members only. Please sign in to browse."}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 rounded-xl px-4 py-3 text-xs font-medium text-red-200 border animate-shake flex items-start gap-2.5"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                borderColor: "rgba(239, 68, 68, 0.15)",
              }}
            >
              <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-headline font-bold text-outline uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl py-3 pl-11 pr-4 bg-white/5 border border-white/8 font-body text-white placeholder-outline-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-headline font-bold text-outline uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl py-3 pl-11 pr-4 bg-white/5 border border-white/8 font-body text-white placeholder-outline-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-headline font-bold text-outline uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl py-3 pl-11 pr-4 bg-white/5 border border-white/8 font-body text-white placeholder-outline-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center rounded-xl py-3 px-4 bg-primary text-on-primary font-headline font-bold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm shadow-lg shadow-primary/10"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? "Register Account" : "Access Vault"}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-sm font-body text-outline">
            {isSignUp ? "Already a member? " : "Not a member? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-primary hover:underline font-bold transition-colors"
            >
              {isSignUp ? "Sign In" : "Register Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated State: render app content normally
  return <>{children}</>;
}
