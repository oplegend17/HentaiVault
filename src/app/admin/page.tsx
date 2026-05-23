"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  Shield,
  Users,
  Eye,
  Heart,
  Play,
  Clock,
  ArrowRight,
  ChevronRight,
  Loader2,
  Lock,
  UserCheck,
  UserX,
  ExternalLink,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  const { currentUser, userProfile, setUserProfile } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "click" | "play" | "favorite">("all");
  const [loadingUsers, setLoadingUsers] = useState(true);

  // 1. Listen to all users in real-time
  useEffect(() => {
    if (!currentUser) return;
    
    // Even if not admin yet, let them listen so they can self-promote during testing
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        setUsers(usersList);
        setLoadingUsers(false);
        
        // Auto select current user if none selected
        if (usersList.length > 0 && !selectedUser) {
          const current = usersList.find((u) => u.id === currentUser.uid);
          if (current) {
            setSelectedUser(current);
          } else {
            setSelectedUser(usersList[0]);
          }
        }
      },
      (err) => {
        console.error("Error listening to users:", err);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  // 2. Listen to logs for selected user
  useEffect(() => {
    if (!selectedUser) return;
    setLogsLoading(true);

    const logsQuery = query(
      collection(db, "users", selectedUser.id, "logs"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp || Date.now()),
          };
        }) as any[];
        setLogs(logsList);
        setLogsLoading(false);
      },
      (err) => {
        console.error("Error listening to logs:", err);
        setLogsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedUser]);

  // 3. Promote self option for dev speed
  const handlePromoteSelf = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        role: "admin",
      });
      // Force update state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          role: "admin",
        });
      }
    } catch (err) {
      console.error("Failed to self promote:", err);
    }
  };

  // Toggle other user roles
  const handleToggleRole = async (user: any) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        role: newRole,
      });

      // Update selected user view if it's the one we just toggled
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }

      // If toggled ourselves, update local store profile
      if (user.id === currentUser?.uid && userProfile) {
        setUserProfile({
          ...userProfile,
          role: newRole,
        });
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  // Filtering logs
  const filteredLogs = logs.filter((log) => {
    if (activeTab === "all") return true;
    return log.actionType === activeTab;
  });

  const getActionBadgeStyle = (action: string) => {
    switch (action) {
      case "click":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#93c5fd", icon: Eye, label: "Viewed Card" };
      case "play":
        return { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", icon: Play, label: "Hover Play" };
      case "favorite":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#fca5a5", icon: Heart, label: "Favorited" };
      default:
        return { bg: "rgba(255, 255, 255, 0.1)", text: "#ffffff", icon: Eye, label: "Action" };
    }
  };

  // Check if logged in & is Admin
  const isUserAdmin = userProfile?.role === "admin";

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 max-w-md mx-auto text-center">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-outline">
          <Lock className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-white mb-2">
            Access Restricted
          </h1>
          <p className="font-body text-sm text-outline mb-6">
            Please sign in to access the administrator controls and dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Access Denied (Logged in but not Admin)
  if (!isUserAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 max-w-xl mx-auto text-center">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
          <Shield className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-headline font-extrabold text-3xl tracking-tight text-white mb-3">
            Admin Privileges Required
          </h1>
          <p className="font-body text-base text-outline mb-8 max-w-md mx-auto leading-relaxed">
            Logged in as <span className="text-white font-semibold">@{userProfile?.username}</span>, but you do not have administrative credentials to view user interaction histories.
          </p>
          
          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 max-w-md mx-auto space-y-4">
            <h2 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
              Developer Quick-Start
            </h2>
            <p className="font-body text-xs text-outline leading-normal">
              You can instantly promote this account to <span className="text-white">Admin</span> using the database shortcut button below.
            </p>
            <button
              onClick={handlePromoteSelf}
              className="w-full flex items-center justify-center rounded-xl py-3 px-4 bg-primary text-on-primary font-headline font-bold hover:bg-primary-hover active:scale-[0.98] transition-all text-sm shadow-lg shadow-primary/20"
            >
              Promote Myself to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-headline font-bold text-xs uppercase tracking-widest mb-1.5">
            <Shield className="h-4 w-4" />
            Control Center
          </div>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight text-white">
            Administrative Panel
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/8 px-4 py-2.5 rounded-2xl backdrop-blur-md">
          <Users className="h-4 w-4 text-outline" />
          <span className="font-headline font-bold text-sm text-white">
            {users.length} Active Profiles
          </span>
        </div>
      </div>

      {/* Main Grid: User List & Interaction Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: User Directory */}
        <div
          className="lg:col-span-1 rounded-2xl overflow-hidden border border-white/5 flex flex-col h-[700px]"
          style={{
            background: "rgba(20, 15, 30, 0.6)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="p-4 border-b border-white/5 bg-white/2">
            <h3 className="font-headline font-extrabold text-base text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              User Directory
            </h3>
            <p className="font-body text-xs text-outline mt-0.5">
              Select a user profile to load their logs
            </p>
          </div>

          {/* User List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-xs font-body text-outline">Loading database directory...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-outline">
                <p className="text-sm font-semibold">No registered users</p>
              </div>
            ) : (
              users.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                const isAdmin = user.role === "admin";
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-white/3"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-sm text-white truncate block">
                          @{user.username || "User"}
                        </span>
                        {isAdmin && (
                          <span className="flex items-center gap-0.5 text-[9px] font-headline font-bold text-primary bg-primary/15 border border-primary/20 rounded-full px-1.5 py-0.2">
                            <Shield className="h-2 w-2" />
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="font-body text-xs text-outline truncate block">
                        {user.email || "No email"}
                      </span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 text-outline transition-transform duration-200 ${
                        isSelected ? "translate-x-1 text-primary" : ""
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: User Profile Details & Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedUser ? (
            <>
              {/* Selected User Header Card */}
              <div
                className="rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                style={{
                  background: "linear-gradient(135deg, rgba(30, 20, 45, 0.7) 0%, rgba(15, 10, 25, 0.8) 100%)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-headline font-black text-xl shadow-lg shadow-primary/10 uppercase">
                    {selectedUser.username ? selectedUser.username[0] : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-headline font-extrabold text-2xl text-white">
                        @{selectedUser.username || "User"}
                      </h2>
                      <span
                        className={`text-xs font-headline font-bold rounded-full px-2.5 py-0.5 border ${
                          selectedUser.role === "admin"
                            ? "bg-primary/15 border-primary/20 text-primary"
                            : "bg-white/5 border-white/10 text-outline"
                        }`}
                      >
                        {selectedUser.role === "admin" ? "Administrator" : "Standard User"}
                      </span>
                    </div>
                    <p className="font-body text-xs text-outline mt-1">
                      UID: <span className="font-mono text-[10px] select-all">{selectedUser.id}</span>
                    </p>
                    <p className="font-body text-xs text-outline mt-0.5">
                      Email: <span className="text-white">{selectedUser.email}</span>
                    </p>
                  </div>
                </div>

                {/* Role Switch Action */}
                <button
                  onClick={() => handleToggleRole(selectedUser)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-headline font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.97] border ${
                    selectedUser.role === "admin"
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      : "bg-primary text-on-primary border-primary hover:bg-primary-hover shadow-lg shadow-primary/15"
                  }`}
                >
                  {selectedUser.role === "admin" ? (
                    <>
                      <UserX className="h-4 w-4" />
                      Demote to User
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Promote to Admin
                    </>
                  )}
                </button>
              </div>

              {/* Interaction Logs Container */}
              <div
                className="rounded-2xl overflow-hidden border border-white/5 flex flex-col h-[520px]"
                style={{
                  background: "rgba(20, 15, 30, 0.6)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Tabs & Search */}
                <div className="p-4 border-b border-white/5 bg-white/2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                        activeTab === "all" ? "bg-primary text-on-primary" : "text-outline hover:text-white"
                      }`}
                    >
                      All ({logs.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("click")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1 ${
                        activeTab === "click" ? "bg-primary text-on-primary" : "text-outline hover:text-white"
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      Views ({logs.filter((l) => l.actionType === "click").length})
                    </button>
                    <button
                      onClick={() => setActiveTab("play")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1 ${
                        activeTab === "play" ? "bg-primary text-on-primary" : "text-outline hover:text-white"
                      }`}
                    >
                      <Play className="h-3 w-3" />
                      Plays ({logs.filter((l) => l.actionType === "play").length})
                    </button>
                    <button
                      onClick={() => setActiveTab("favorite")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1 ${
                        activeTab === "favorite" ? "bg-primary text-on-primary" : "text-outline hover:text-white"
                      }`}
                    >
                      <Heart className="h-3 w-3" />
                      Favorites ({logs.filter((l) => l.actionType === "favorite").length})
                    </button>
                  </div>

                  <span className="font-headline font-bold text-xs text-outline uppercase tracking-wider">
                    Interaction Log Feed
                  </span>
                </div>

                {/* Logs Feed List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white/[0.01]">
                  {logsLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs font-body text-outline">Fetching interactions...</span>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20 text-outline">
                      <Clock className="h-8 w-8 mb-3 text-outline-variant" />
                      <p className="text-sm font-semibold">No activity logs recorded</p>
                      <p className="text-xs mt-1">Interactions will be logged in real-time as they browse.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredLogs.map((log) => {
                        const styleInfo = getActionBadgeStyle(log.actionType);
                        const ActionIcon = styleInfo.icon;
                        const isVideo = log.fileType === "video" || !!log.videoUrl;
                        return (
                          <div
                            key={log.id}
                            className="group p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 flex items-start gap-4"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                            }}
                          >
                            {/* Visual Thumbnail */}
                            <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                              <Image
                                src={log.previewUrl || log.imageUrl}
                                alt="Activity thumbnail"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="48px"
                                unoptimized
                              />
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Film className="h-3.5 w-3.5 text-white drop-shadow" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-[10px] font-headline font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                                  style={{
                                    backgroundColor: styleInfo.bg,
                                    color: styleInfo.text,
                                  }}
                                >
                                  <ActionIcon className="h-2.5 w-2.5" />
                                  {styleInfo.label}
                                </span>
                                
                                <span className="text-[10px] font-headline font-semibold text-outline-variant bg-white/5 rounded-full px-2 py-0.5 border border-white/5 uppercase">
                                  {log.source}
                                </span>

                                <span className="text-[10px] font-body text-outline flex items-center gap-1 ml-auto">
                                  <Clock className="h-3 w-3 text-outline-variant" />
                                  {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {" "}•{" "}
                                  {log.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              {/* Target Details */}
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-body text-xs text-outline truncate max-w-sm">
                                  ID: <span className="font-mono text-[10px] select-all text-white">{log.imageId}</span>
                                  {log.tags && log.tags.length > 0 && (
                                    <>
                                      <span className="mx-1.5">•</span>
                                      <span className="italic text-outline-variant">
                                        Tags: {log.tags.slice(0, 4).join(", ")}
                                      </span>
                                    </>
                                  )}
                                </p>

                                <a
                                  href={log.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] font-headline font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                >
                                  Source file
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div
              className="rounded-2xl p-16 border border-white/5 flex flex-col items-center justify-center text-center gap-4 h-[600px]"
              style={{
                background: "rgba(20, 15, 30, 0.6)",
                backdropFilter: "blur(16px)",
              }}
            >
              <Users className="h-10 w-10 text-outline-variant" />
              <div>
                <p className="font-headline font-bold text-lg text-white">Select a profile</p>
                <p className="font-body text-sm text-outline mt-1">
                  Choose a user account from the directory list to examine logs
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
