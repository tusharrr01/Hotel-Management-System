import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldAlert, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";

export type AdminLoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

const AdminLogin = () => {
  const { showToast, user, isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isLoggedIn && user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<AdminLoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutationWithLoading(apiClient.signIn, {
    onSuccess: async (data) => {
      // Check if user is admin
      if (data?.user?.role !== "admin") {
        showToast({
          title: "Access Denied",
          description:
            "This account does not have admin privileges. Only administrators can access this portal.",
          type: "ERROR",
        });
        // Clear auth data
        localStorage.removeItem("session_id");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");
        return;
      }

      showToast({
        title: "Welcome Admin",
        description: "You have been successfully logged in to the admin dashboard.",
        type: "SUCCESS",
      });

      // Invalidate and refetch queries
      await queryClient.invalidateQueries("validateToken");
      await queryClient.refetchQueries("validateToken");

      // Redirect to admin dashboard
      navigate("/admin/dashboard", { replace: true });
    },
    onError: (error: Error) => {
      showToast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        type: "ERROR",
      });
    },
    loadingMessage: "Verifying admin credentials...",
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    mutation.mutate(data, {
      onSettled: () => setIsLoading(false),
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center text-slate-300 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Main Card */}
        <Card className="relative overflow-hidden border border-slate-700 shadow-2xl bg-slate-800/50 backdrop-blur-xl">
          {/* Decorative top border gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

          {/* Header */}
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-slate-400">
              Restricted access - Admin credentials required
            </CardDescription>
          </CardHeader>

          {/* Form Content */}
          <CardContent className="space-y-6">
            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-200">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 text-red-600 border-slate-600 rounded focus:ring-red-500 cursor-pointer bg-slate-700"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  Remember me for 7 days
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || mutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-red-950/40 border border-red-900/50 rounded-lg">
              <p className="text-sm text-red-300 leading-relaxed">
                <strong>⚠️ Security Notice:</strong> This is a restricted admin portal.
                Only use your admin credentials. Do not share your login credentials
                with anyone.
              </p>
            </div>

            {/* Regular Login Link */}
            <div className="text-center text-slate-400">
              <p className="text-sm">
                Not an admin?{" "}
                <Link
                  to="/sign-in"
                  className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                >
                  Sign in as regular user
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-slate-500 text-xs">
          <p>© 2026 Hotel Booking System. All rights reserved.</p>
          <p className="mt-1">Admin Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
