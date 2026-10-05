"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { clearTokens } from "@/lib/helpers/authentication/tokenStorage";
import { logoutUser } from "@/lib/helpers/authentication/loginUser";
import { getAdminAuthUserById, AuthUser } from "@/lib/helpers/admin/adminAuthUsersHelper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type UserContextType = {
  user: AuthUser | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserContext: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  refreshUserContext: async () => {},
  logout: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Initial fast local hydration via state initializer (No setState in effect)
  const [authUserId, setAuthUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("admin_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.authUserId || parsed?.id || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [cachedUser, setCachedUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 2. Fetch authoritative profile from Supabase with React Query
  const {
    data: fetchedUser,
    isLoading: isQueryLoading,
    refetch,
  } = useQuery<AuthUser | null>({
    queryKey: ["authUserProfile", authUserId],
    queryFn: async () => {
      if (!authUserId) return null;
      return await getAdminAuthUserById(authUserId);
    },
    enabled: !!authUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Keep localStorage updated when fresh user profile is received
  useEffect(() => {
    if (fetchedUser) {
      localStorage.setItem("admin_user", JSON.stringify(fetchedUser));
    }
  }, [fetchedUser]);

  // 3. Listen to Supabase Auth State changes in real time
  useEffect(() => {
    // Check initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user?.id) {
          setAuthUserId(session.user.id);
          queryClient.invalidateQueries({ queryKey: ["authUserProfile"] });
        }
      } else if (event === "SIGNED_OUT") {
        setAuthUserId(null);
        setCachedUser(null);
        clearTokens();
        localStorage.removeItem("admin_user");
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const refreshUserContext = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setAuthUserId(session.user.id);
      await refetch();
    }
  }, [refetch]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      clearTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_user");
      }
      setAuthUserId(null);
      setCachedUser(null);
      queryClient.clear();
      toast.success("Logged out successfully");
      router.replace("/login");
    }
  }, [queryClient, router]);

  const activeUser = fetchedUser ?? cachedUser;
  const isLoading = !!authUserId && isQueryLoading && !cachedUser;
  const isAuthenticated = !!activeUser && activeUser.isActive;

  const value = useMemo(
    () => ({
      user: activeUser,
      role: activeUser?.role || null,
      loading: isLoading,
      isAuthenticated,
      refreshUserContext,
      logout,
    }),
    [activeUser, isLoading, isAuthenticated, refreshUserContext, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
