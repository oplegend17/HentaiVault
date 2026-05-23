"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError("");
    setEmail("");
    setPassword("");
    setUsername("");
  };

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
      handleClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl p-8 transition-all duration-300 animate-scaleIn"
        style={{
          background: "linear-gradient(135deg, rgba(30, 20, 45, 0.85) 0%, rgba(15, 10, 25, 0.95) 100%)",
          border: "1px solid rgba(255, 141, 138, 0.15)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-tertiary/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-outline transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-white mb-2">
            {isSignUp ? "Join the Vault" : "Welcome Back"}
          </h2>
          <p className="text-sm font-body text-outline">
            {isSignUp ? "Create an account to start logging and saving your favorites" : "Access your favorited images, gifs, and video logs"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-6 rounded-lg px-4 py-3 text-sm font-medium text-red-200 border animate-shake"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-headline font-semibold text-outline uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="HentaiLover"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl py-3 pl-11 pr-4 bg-white/5 border border-white/10 font-body text-white placeholder-outline-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-headline font-semibold text-outline uppercase tracking-wider">
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
                className="w-full rounded-xl py-3 pl-11 pr-4 bg-white/5 border border-white/10 font-body text-white placeholder-outline-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-headline font-semibold text-outline uppercase tracking-wider">
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
                className="w-full rounded-xl py-3 pl-11 pr-4 bg-white/5 border border-white/10 font-body text-white placeholder-outline-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center rounded-xl py-3 px-4 bg-primary text-on-primary font-headline font-bold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm font-body text-outline">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-primary hover:underline font-semibold"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
