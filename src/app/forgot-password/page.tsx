"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EnvelopeSimple,
  ArrowRight,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("step") === "otp") return "otp";
    }
    return "email";
  });
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(600); // 10 minutes timer
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Password reset fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // References for OTP inputs
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Body padding reset for fixed Navbar, exactly identical to login and registration pages
  useEffect(() => {
    const originalPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = originalPadding;
    };
  }, []);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP (10-minute expiry like Payments tab)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password?action=request_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      toast.success("Verification code sent! Valid for 10 minutes.");
      setStep("otp");
      setTimer(600);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Unable to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP box input
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const updated = [...otp];

    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (index + i < 6) updated[index + i] = d;
      });
      setOtp(updated);
      const nextIdx = Math.min(index + digits.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    updated[index] = cleaned;
    setOtp(updated);

    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const updated = [...otp];
    pastedData.split("").forEach((char, idx) => {
      updated[idx] = char;
    });
    setOtp(updated);

    const focusIdx = Math.min(pastedData.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/forgot-password?action=request_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP.");
      }

      toast.success("A new verification code has been sent!");
      setTimer(600);
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("").trim();
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password?action=verify_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      toast.success("Code verified successfully!");
      setStep("reset");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password?action=reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.join("").trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      toast.success("Password reset successfully!");
      setStep("success");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-2 sm:p-3 lg:p-4">
      {/* Main Container - Exact dimensions as Login and Registration */}
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

            {step === "email" ? (
              <>
                <h1 className="text-[48px] lg:text-[54px] font-bold leading-[1.05] tracking-tight mb-6">
                  Reset<br />
                  <span className="text-[#8eb0f0]">Access</span>
                </h1>
                <p className="text-[#a4b4cb] text-[15px] leading-relaxed max-w-[320px]">
                  Recover your account access securely and get back to managing your campus.
                </p>
              </>
            ) : step === "otp" ? (
              <>
                <h1 className="text-[48px] lg:text-[54px] font-bold leading-[1.05] tracking-tight mb-6">
                  Verify Your<br />
                  <span className="text-[#8eb0f0]">Access</span>
                </h1>
                <p className="text-[#a4b4cb] text-[15px] leading-relaxed max-w-[320px]">
                  Secure your admin account with quick email verification.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-[48px] lg:text-[54px] font-bold leading-[1.05] tracking-tight mb-6">
                  New<br />
                  <span className="text-[#8eb0f0]">Password</span>
                </h1>
                <p className="text-[#a4b4cb] text-[15px] leading-relaxed max-w-[320px]">
                  Create a strong and secure password for your administrative credentials.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-[50%] p-8 lg:p-14 flex flex-col justify-center">
          <div className="max-w-[500px] w-full mx-auto">
            <p className="text-[11px] font-bold tracking-widest text-[#2865ef] mb-3 uppercase flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[#2865ef]"></span>
              Admin Portal
            </p>

            {/* SCREEN 1: FORGOT PASSWORD */}
            {step === "email" && (
              <div>
                <h2 className="text-[32px] font-extrabold text-[#101631] tracking-tight leading-tight mb-2">
                  Forgot Password
                </h2>
                <p className="text-[#64748b] text-[14px] mb-8">
                  Enter your registered email address to receive an OTP.
                </p>

                <form className="space-y-4" onSubmit={handleSendOtp}>
                  {/* Email with floating label - exact match with Login input */}
                  <div className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be]">
                      <EnvelopeSimple size={18} weight="regular" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-4 pt-[22px] pb-[6px] focus:outline-none focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef] transition-colors peer"
                    />
                    <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                      Email Address <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!email.trim() || isLoading}
                      className="w-full bg-[#081225] hover:bg-[#0c1a35] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors mt-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      {isLoading ? "Sending..." : "Send OTP"} <ArrowRight size={16} weight="bold" />
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center border-t border-[#f1f5f9] pt-6">
                  <p className="text-[13px] text-[#64748b]">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="text-[#2865ef] font-semibold hover:underline"
                    >
                      Back to Login
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 2: OTP VERIFICATION */}
            {step === "otp" && (
              <div>
                <h2 className="text-[32px] font-extrabold text-[#101631] tracking-tight leading-tight mb-2">
                  OTP Verification
                </h2>
                <p className="text-[#64748b] text-[14px] mb-8">
                  We sent a 6-digit verification code to your email.
                </p>

                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  {/* 6 OTP Inputs */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3 my-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpInputsRef.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[22px] font-bold text-[#101631] border border-[#e2e8f0] rounded-[10px] bg-white focus:outline-none focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef] transition-colors"
                      />
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length < 6}
                      className="w-full bg-[#081225] hover:bg-[#0c1a35] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors mt-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"} <ArrowRight size={16} weight="bold" />
                    </button>
                  </div>
                </form>

                {/* Resend Area */}
                <div className="mt-8 text-center space-y-1 border-t border-[#f1f5f9] pt-6">
                  <div>
                    <button
                      type="button"
                      disabled={timer > 0 || isResending}
                      onClick={handleResendOtp}
                      className="text-[14px] font-semibold text-[#2865ef] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline cursor-pointer"
                    >
                      {isResending ? "Resending..." : "Resend OTP"}
                    </button>
                  </div>
                  <p className="text-[13px] text-[#64748b]">
                    {timer > 0 ? `Resend OTP in ${formatTimer(timer)}` : "Didn't receive the code?"}
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 3: SET NEW PASSWORD */}
            {step === "reset" && (
              <div>
                <h2 className="text-[32px] font-extrabold text-[#101631] tracking-tight leading-tight mb-2">
                  Create New Password
                </h2>
                <p className="text-[#64748b] text-[14px] mb-8">
                  Enter your new password to restore account access.
                </p>

                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <div className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be]">
                      <Lock size={18} weight="regular" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-10 pt-[22px] pb-[6px] focus:outline-none focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef] transition-colors peer"
                    />
                    <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                      New Password <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea3be] hover:text-[#475569] p-1 transition-colors"
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be]">
                      <Lock size={18} weight="regular" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full border border-[#e2e8f0] rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-10 pt-[22px] pb-[6px] focus:outline-none focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef] transition-colors peer"
                    />
                    <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                      Confirm Password <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea3be] hover:text-[#475569] p-1 transition-colors"
                    >
                      {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!newPassword.trim() || !confirmPassword.trim() || isLoading}
                      className="w-full bg-[#081225] hover:bg-[#0c1a35] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors mt-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      {isLoading ? "Updating..." : "Update Password"} <ArrowRight size={16} weight="bold" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SCREEN 4: SUCCESS STATE */}
            {step === "success" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} weight="fill" />
                </div>
                <h2 className="text-[28px] font-extrabold text-[#101631] tracking-tight mb-2">
                  Password Updated!
                </h2>
                <p className="text-[#64748b] text-[14px] mb-8">
                  Your password has been reset successfully. You can now login with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#081225] hover:bg-[#0c1a35] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Proceed to Login <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
