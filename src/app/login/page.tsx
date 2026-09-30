"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  ArrowRight,
} from "@phosphor-icons/react";
import { loginUser } from "@/lib/helpers/authentication/loginUser";
import { saveTokens } from "@/lib/helpers/authentication/tokenStorage";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isFormFilled = Boolean(email.trim() && password.trim());

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await loginUser(trimmedEmail, password);

      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Store access token and refresh token securely in localStorage
      if (result.session) {
        saveTokens(result.session);
      }

      toast.success("Welcome back!");
      router.push("/");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err?.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Remove the body padding used for the fixed Navbar
    const originalPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = originalPadding;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-2 sm:p-3 lg:p-4">
      {/* Main Container */}
      <div className="w-full max-w-[1536px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden min-h-[650px]">
        
        {/* Left Section - Image/Banner */}
        <div className="relative w-full md:w-[50%] bg-[#081225] hidden md:block shrink-0">
          <Image
            src="/registration_image.png"
            alt="Login Graphic"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 p-12 lg:p-[60px] flex flex-col justify-start pt-[100px] lg:pt-[120px] text-white z-10 bg-gradient-to-t from-[#050B14]/80 via-transparent to-transparent">
            <p className="text-[10px] tracking-[0.2em] font-semibold text-[#8eb0f0] mb-8 uppercase flex items-center gap-3">
              <span className="w-6 h-[1.5px] bg-[#2865ef]"></span>
              Manage &bull; Connect &bull; Empower
            </p>
            <h1 className="text-[48px] lg:text-[54px] font-bold leading-[1.05] tracking-tight mb-6">
              Welcome<br />
              <span className="text-[#8eb0f0]">Back</span>
            </h1>
            <p className="text-[#a4b4cb] text-[15px] leading-relaxed max-w-[320px]">
              Access your admin dashboard and manage your campus operations securely.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-[50%] p-8 lg:p-14 flex flex-col justify-center">
          <div className="max-w-[500px] w-full mx-auto">
            <p className="text-[11px] font-bold tracking-widest text-[#2865ef] mb-3 uppercase flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[#2865ef]"></span>
              Admin Portal
            </p>
            <h2 className="text-[32px] font-extrabold text-[#081D36] tracking-tight leading-tight mb-2">
              Login to Your Account
            </h2>
            <p className="text-[#64748b] text-[14px] mb-8">
              Sign in to continue to the admin portal
            </p>

            <form className="space-y-4" onSubmit={handleLogin} noValidate>
              {/* Email */}
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be]">
                  <EnvelopeSimple size={18} weight="regular" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-4 pt-[22px] pb-[6px] focus:outline-none focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef] transition-colors peer"
                />
                <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                  Email Address <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
              </div>

              {/* Password */}
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be]">
                  <Lock size={18} weight="regular" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-10 pt-[22px] pb-[6px] focus:outline-none focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef] transition-colors peer"
                />
                <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                  Password <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea3be] hover:text-[#475569] p-1 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end pt-1">
                <Link href="/forgot-password" className="text-[13px] font-semibold text-[#2865ef] hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormFilled || isLoading}
                  className="w-full bg-[#081225] hover:bg-[#0c1a35] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors mt-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "Logging in..." : "Login"} <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-[#f1f5f9] pt-6">
              <p className="text-[13px] text-[#64748b]">
                Don&apos;t have an account?{" "}
                <Link href="/registration" className="text-[#2865ef] font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
