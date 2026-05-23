"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const setUserProfile = useStore((s) => s.setUserProfile);
  const setAuthLoading = useStore((s) => s.setAuthLoading);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Listen to Firestore profile document in real-time
        const userDocRef = doc(db, "users", user.uid);
        
        const unsubscribeProfile = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserProfile({
              uid: user.uid,
              email: user.email || data.email || "",
              username: data.username || "User",
              role: data.role || "user",
            });
          } else {
            // Fallback: If auth exists but Firestore doc is missing, create it
            const fallbackProfile = {
              uid: user.uid,
              email: user.email || "",
              username: user.email ? user.email.split("@")[0] : "user_" + user.uid.substring(0, 5),
              role: "user" as const,
            };
            try {
              await setDoc(userDocRef, fallbackProfile, { merge: true });
              setUserProfile(fallbackProfile);
            } catch (err) {
              console.error("Error creating fallback user profile:", err);
            }
          }
          setAuthLoading(false);
        }, (err) => {
          console.error("Error listening to user profile:", err);
          setAuthLoading(false);
        });

        return () => {
          unsubscribeProfile();
        };
      } else {
        setUserProfile(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [setCurrentUser, setUserProfile, setAuthLoading]);

  return <>{children}</>;
}
