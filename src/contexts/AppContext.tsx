import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
 
import { useToast } from "../hooks/use-toast";
import { UserType } from "../../../shared/types";


type ToastMessage = {
  title: string;
  description?: string;
  type: "SUCCESS" | "ERROR" | "INFO";
};

export type AppContextType = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  user: UserType | null;
  userRole: "user" | "hotel_owner" | "admin" | null;
  showGlobalLoading: (message?: string) => void;
  hideGlobalLoading: () => void;
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
  logout: () => void;
};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined
);

// Stripe removed in favor of Razorpay integration

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState(
    "Hotel room is getting ready..."
  );
  const [user, setUser] = useState<UserType | null>(null);
  const [userRole, setUserRole] = useState<"user" | "hotel_owner" | "admin" | null>(null);
  const { toast } = useToast();

  // Simple check for stored tokens without API calls
  const checkStoredAuth = () => {
    const localToken = localStorage.getItem("session_id");
    const userId = localStorage.getItem("user_id");

    // Check if we have both token and user ID
    const hasToken = !!localToken;
    const hasUserId = !!userId;

    if (hasToken && hasUserId) {
      console.log("JWT authentication detected - token and user ID found");
    }

    return hasToken;
  };

  // Always run validation query - let it handle token checking internally
  const { isError, isLoading, data } = useQuery(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      staleTime: 30 * 60 * 1000, // 30 minutes - extended from 5 for longer token duration
      refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour to keep token fresh
      // Always enabled - let validateToken handle missing tokens
      enabled: true,
      // Add fallback for JWT authentication
      onError: async (error: any) => {
        // If validateToken fails, attempt to recover by fetching the current user
        const storedToken = localStorage.getItem("session_id");
        const storedUserId = localStorage.getItem("user_id");

        console.warn("validateToken failed:", error?.message || error);

        if (storedToken && storedUserId) {
          try {
            console.log("Attempting fallback: fetching current user with stored token");
            const me = await apiClient.fetchCurrentUser();
            if (me) {
              setUser(me);
              setUserRole(me.role || "user");
              console.log("Fallback user fetched and applied to context");
            }
          } catch (fetchErr) {
            console.warn("Fallback fetchCurrentUser failed:", fetchErr);
          }
        }
      },
      onSuccess: (validatedData: any) => {
        if (validatedData?.user) {
          setUser(validatedData.user);
          setUserRole(validatedData.user.role || "user");
        }
      },
    }
  );

  // Debug logging to understand the state
  console.log("Auth Debug:", {
    isLoading,
    isError,
    hasData: !!data,
    hasStoredToken: checkStoredAuth(),
    hasUserId: !!localStorage.getItem("user_id"),
    data,
  });

  // Simple logic: logged in if we have valid data OR stored token as fallback
  const isLoggedIn =
    (!isLoading && !isError && !!data) || (checkStoredAuth() && isError); // Use stored token only if validation failed

  // Additional fallback: if we just logged in and have a token, consider logged in
  const justLoggedIn = checkStoredAuth() && !isLoading && !data && !isError;

  // Enhanced JWT authentication detection and fallback
  const isJWTFallback = () => {
    // Check if we have a token but validation failed (typical JWT fallback behavior)
    const hasStoredToken = checkStoredAuth();
    const hasUserId = !!localStorage.getItem("user_id");
    const isFallback = hasStoredToken && isError && !data && hasUserId;

    if (isFallback) {
      console.log(
        "JWT fallback mode detected - using localStorage authentication"
      );
    }

    return isFallback;
  };

  const finalIsLoggedIn = isLoggedIn || justLoggedIn || isJWTFallback();

  console.log(
    "Final isLoggedIn:",
    finalIsLoggedIn,
    "JWT Fallback:",
    isJWTFallback(),
    "User Role:",
    userRole
  );

  const showToast = (toastMessage: ToastMessage) => {
    const variant =
      toastMessage.type === "SUCCESS"
        ? "success"
        : toastMessage.type === "ERROR"
        ? "destructive"
        : "info";

    toast({
      variant,
      title: toastMessage.title,
      description: toastMessage.description,
    });
  };

  const showGlobalLoading = (message?: string) => {
    if (message) {
      setGlobalLoadingMessage(message);
    }
    setIsGlobalLoading(true);
  };

  const hideGlobalLoading = () => {
    setIsGlobalLoading(false);
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("session_id");
    localStorage.removeItem("user_id");
    
    // Clear state
    setUser(null);
    setUserRole(null);
    
    // Show toast
    showToast({
      title: "Logged out successfully",
      type: "SUCCESS",
    });
  };

  return (
    <AppContext.Provider
      value={{
        showToast,
        isLoggedIn: finalIsLoggedIn,
        user: user || null,
        userRole: userRole || null,
        // stripePromise removed
        showGlobalLoading,
        hideGlobalLoading,
        isGlobalLoading,
        globalLoadingMessage,
        logout,
      }}
    >
      {isGlobalLoading && <LoadingSpinner message={globalLoadingMessage} />}
      {children}
    </AppContext.Provider>
  );
};

// ...existing code...
