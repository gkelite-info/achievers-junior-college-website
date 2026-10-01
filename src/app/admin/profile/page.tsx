"use client";

import { useEffect, useState } from "react";
import { getAdminAuthUserById, AuthUser } from "@/lib/helpers/admin/adminAuthUsersHelper";

export default function AdminProfilePage() {
  const [profileData, setProfileData] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const stored = localStorage.getItem("admin_user");
        if (stored) {
          const user = JSON.parse(stored);
          const userId = user?.authUserId || user?.id;
          if (userId) {
            const data = await getAdminAuthUserById(userId);
            setProfileData(data);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const initials = profileData
    ? `${profileData.firstName?.charAt(0) || ""}${profileData.lastName?.charAt(0) || ""}`.toUpperCase()
    : "AD";
  const fullName = profileData ? `${profileData.firstName} ${profileData.lastName}` : "Admin User";
  const role = profileData?.role || "Administrator";
  const email = profileData?.email || "admin@achievers.in";
  const mobile = profileData?.mobile || "Not Provided";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xl flex items-center justify-center border border-gray-200">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
            <p className="text-xs text-[#0E1528] font-semibold uppercase tracking-wider mt-0.5">
              {role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Email Address</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Mobile Number</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{mobile}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
