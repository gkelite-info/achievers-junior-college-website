"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface AdminLoadingContextType {
  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
  triggerTabShimmer: (durationMs?: number) => void;
}

const AdminLoadingContext = createContext<AdminLoadingContextType>({
  isPageLoading: true,
  setIsPageLoading: () => {},
  triggerTabShimmer: () => {},
});

function AdminLoadingProviderInner({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTabShimmer = useCallback((durationMs: number = 600) => {
    setIsPageLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, durationMs);
  }, []);

  // Trigger shimmer whenever route or tab query changes
  useEffect(() => {
    setIsPageLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, searchParams]);

  const value = useMemo(
    () => ({ isPageLoading, setIsPageLoading, triggerTabShimmer }),
    [isPageLoading, triggerTabShimmer]
  );

  return (
    <AdminLoadingContext.Provider value={value}>
      {children}
    </AdminLoadingContext.Provider>
  );
}

export function AdminLoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminLoadingProviderInner>{children}</AdminLoadingProviderInner>
    </Suspense>
  );
}

export function useAdminLoading() {
  return useContext(AdminLoadingContext);
}
