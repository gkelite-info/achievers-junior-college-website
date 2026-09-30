"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  EnvelopeSimple,
  Phone,
  GenderIntersex,
  Lock,
  Eye,
  EyeSlash,
  ArrowRight,
  WarningCircle,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import { upsertUser } from "@/lib/helpers/authentication/upsertUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatName } from "@/app/apply/validation";

/**
 * Format phone to max 10 digits, trimming country codes if pasted
 */
function formatPhoneInput(val: string): string {
  let cleaned = val.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length > 10) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.slice(0, 10);
}

/**
 * Validates a name string according to standard requirements:
 * - Must start with a capital letter
 * - Only letters, dots, and spaces (no digits, no special characters)
 * - Words after space/dot must start with a capital letter
 */
function validateName(val: string, fieldName: string, minLen = 2, maxLen = 50): string | null {
  const trimmed = val.trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLen) {
    return `${fieldName} must be at least ${minLen} character${minLen > 1 ? "s" : ""}.`;
  }
  if (trimmed.length > maxLen) {
    return `${fieldName} cannot exceed ${maxLen} characters.`;
  }
  if (!/^[A-Za-z.\s]+$/.test(trimmed) || !/[A-Za-z]/.test(trimmed)) {
    return `${fieldName} should contain only letters and dots (no numbers or special characters).`;
  }
  if (!/^[A-Z]/.test(trimmed)) {
    return `${fieldName} must start with a capital letter.`;
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordsValid = words.every((w) => /^[A-Z]/.test(w) || /^\.[A-Z]/.test(w));
  if (!wordsValid) {
    return `Words in ${fieldName.toLowerCase()} must start with a capital letter.`;
  }
  return null;
}

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const isFormFilled = Boolean(
    values.firstName.trim() &&
    values.lastName.trim() &&
    values.email.trim() &&
    values.phone.trim() &&
    values.gender.trim() &&
    values.password &&
    values.confirmPassword
  );

  const handleFieldChange = (field: keyof typeof values, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    clearError(field);
  };

  // Real-time input formatting helper that sanitizes values and preserves cursor position
  const applyInputFormat = (
    e: React.ChangeEvent<HTMLInputElement>,
    formatter: (val: string) => string
  ) => {
    const input = e.target;
    const start = input.selectionStart;
    const oldVal = input.value;
    const newVal = formatter(oldVal);

    if (oldVal !== newVal) {
      input.value = newVal;
      if (start !== null) {
        const diff = newVal.length - oldVal.length;
        const newPos = Math.max(0, Math.min(newVal.length, start + diff));
        input.setSelectionRange(newPos, newPos);
      }
    }
  };

  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });
  };

  const validateForm = (vals: typeof values): Record<string, string> => {
    const errs: Record<string, string> = {};

    // 1. First Name
    const fnErr = validateName(vals.firstName, "First name", 2, 50);
    if (fnErr) errs.firstName = fnErr;

    // 2. Last Name
    const lnErr = validateName(vals.lastName, "Last name", 1, 50);
    if (lnErr) errs.lastName = lnErr;

    // 3. Email Address
    const email = vals.email.trim();
    if (!email) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errs.email = "Enter a valid email address (e.g. you@college.edu).";
    }

    // 4. Phone Number (10 digits starting with 6-9)
    const phoneDigits = vals.phone.replace(/\D/g, "");
    if (!vals.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      errs.phone = "Enter a valid 10-digit mobile number (starting with 6-9).";
    }

    // 5. Gender
    if (!vals.gender.trim()) {
      errs.gender = "Please select your gender.";
    }

    // 6. Password
    if (!vals.password) {
      errs.password = "Password is required.";
    } else if (vals.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    // 7. Confirm Password
    if (!vals.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (vals.password && vals.confirmPassword !== vals.password) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formElement = e.currentTarget;
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const gender = values.gender.trim();
    const password = values.password;
    const confirmPassword = values.confirmPassword;

    const newErrors = validateForm({
      firstName,
      lastName,
      email,
      phone,
      gender,
      password,
      confirmPassword,
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorMessage = Object.values(newErrors)[0];
      toast.error(firstErrorMessage || "Please correct the highlighted fields.");
      
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = formElement.elements.namedItem(firstErrorKey) as HTMLElement;
      if (el && typeof el.focus === "function") {
        el.focus();
      }
      return;
    }

    setIsLoading(true);

    try {
      // 1. Supabase Auth Creation
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Could not create user account");

      // When email is already registered, Supabase returns a dummy user with empty identities
      if (authData.user.identities && authData.user.identities.length === 0) {
        throw new Error("An account with this email address already exists. Please log in.");
      }

      // 2. Custom Profile Creation (upsertUser)
      const result = await upsertUser({
        authUserId: authData.user.id,
        email,
        firstName,
        lastName,
        mobile: phone,
        gender,
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err?.message || "An unexpected error occurred");
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
            alt="Registration Graphic"
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
              Let&apos;s Get<br />Started
            </h1>
            <p className="text-[#a4b4cb] text-[15px] leading-relaxed max-w-[300px]">
              Create your admin account and get access to a smarter way to manage your campus operations.
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
              Create Your Admin Account
            </h2>
            <p className="text-[#64748b] text-[14px] mb-8">
              Register to access the admin portal
            </p>

            <form className="space-y-4" onSubmit={handleRegister} noValidate>
              {/* Name Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                      <User size={18} weight="regular" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter your first name"
                      maxLength={50}
                      value={values.firstName}
                      onChange={(e) => {
                        applyInputFormat(e, formatName);
                        handleFieldChange("firstName", e.target.value);
                      }}
                      className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-4 pt-[22px] pb-[6px] focus:outline-none transition-colors peer ${
                        errors.firstName
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                      }`}
                    />
                    <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                      First Name <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                  </div>
                  {errors.firstName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                      <WarningCircle size={13} weight="fill" />
                      {errors.firstName}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                      <User size={18} weight="regular" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter your last name"
                      maxLength={50}
                      value={values.lastName}
                      onChange={(e) => {
                        applyInputFormat(e, formatName);
                        handleFieldChange("lastName", e.target.value);
                      }}
                      className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-4 pt-[22px] pb-[6px] focus:outline-none transition-colors peer ${
                        errors.lastName
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                      }`}
                    />
                    <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                      Last Name <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                  </div>
                  {errors.lastName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                      <WarningCircle size={13} weight="fill" />
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="w-full flex flex-col">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                    <EnvelopeSimple size={18} weight="regular" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@college.edu"
                    value={values.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-4 pt-[22px] pb-[6px] focus:outline-none transition-colors peer ${
                      errors.email
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                    }`}
                  />
                  <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                    Email Address <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                </div>
                {errors.email && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                    <WarningCircle size={13} weight="fill" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div className="w-full flex flex-col">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                    <Phone size={18} weight="regular" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    maxLength={10}
                    value={values.phone}
                    onChange={(e) => {
                      applyInputFormat(e, formatPhoneInput);
                      handleFieldChange("phone", e.target.value);
                    }}
                    className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-4 pt-[22px] pb-[6px] focus:outline-none transition-colors peer ${
                      errors.phone
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                    }`}
                  />
                  <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                    Phone Number <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                </div>
                {errors.phone && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                    <WarningCircle size={13} weight="fill" />
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div className="w-full flex flex-col">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                    <GenderIntersex size={18} weight="regular" />
                  </div>
                  <select
                    name="gender"
                    value={values.gender}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                    className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-10 pt-[22px] pb-[6px] focus:outline-none transition-colors appearance-none cursor-pointer ${
                      errors.gender
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                    }`}
                  >
                    <option value="" disabled className="text-gray-400">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                    Gender <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                </div>
                {errors.gender && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                    <WarningCircle size={13} weight="fill" />
                    {errors.gender}
                  </span>
                )}
              </div>

              {/* Password Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                      <Lock size={18} weight="regular" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={values.password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-10 pt-[22px] pb-[6px] focus:outline-none transition-colors peer ${
                        errors.password
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                      }`}
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
                  {errors.password && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                      <WarningCircle size={13} weight="fill" />
                      {errors.password}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea3be] pointer-events-none">
                      <Lock size={18} weight="regular" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={values.confirmPassword}
                      onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                      className={`w-full border rounded-[10px] bg-white text-[#1e293b] text-[13px] pl-11 pr-10 pt-[22px] pb-[6px] focus:outline-none transition-colors peer ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#e2e8f0] focus:border-[#2865ef] focus:ring-1 focus:ring-[#2865ef]"
                      }`}
                    />
                    <label className="absolute left-11 top-[7px] text-[10px] font-bold text-[#64748b] uppercase tracking-wider pointer-events-none transition-all">
                      Confirm Password <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea3be] hover:text-[#475569] p-1 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1" role="alert">
                      <WarningCircle size={13} weight="fill" />
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormFilled || isLoading}
                  className="w-full bg-[#081225] hover:bg-[#0c1a35] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors mt-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"} <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-[#f1f5f9] pt-6">
              <p className="text-[13px] text-[#64748b]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2865ef] font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
