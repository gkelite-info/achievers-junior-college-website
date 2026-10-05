"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  PencilSimple,
  X,
  CheckCircle,
  User,
  EnvelopeSimple,
  Phone,
  GenderIntersex,
  CircleNotch,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import {
  getAdminAuthUserById,
  updateAdminAuthUser,
  AuthUser,
} from "@/lib/helpers/admin/adminAuthUsersHelper";
import { useUser } from "@/context/UserContext";

export default function AdminProfilePage() {
  const { refreshUserContext } = useUser();
  const [profileData, setProfileData] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "Male",
  });

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

  const handleOpenEdit = () => {
    if (!profileData) return;
    setFormData({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      email: profileData.email || "",
      mobile: profileData.mobile || "",
      gender: profileData.gender || "Male",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    if (isSaving) return;
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData?.authUserId) {
      toast.error("User ID not found");
      return;
    }

    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }

    if (!formData.mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateAdminAuthUser(profileData.authUserId, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        gender: formData.gender,
      });

      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to update profile");
        return;
      }

      const updatedUser = result.data;
      setProfileData(updatedUser);

      // Update localStorage so entire app stays synced
      localStorage.setItem("admin_user", JSON.stringify(updatedUser));

      // Re-sync UserContext so header navbar name and initials update immediately
      await refreshUserContext();

      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

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
  const gender = profileData?.gender || "Not Specified";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4">
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

          {/* Edit Profile Button */}
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0E1528] text-white hover:bg-[#1a2542] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer hover:shadow-sm"
            title="Edit Profile"
          >
            <PencilSimple size={15} weight="bold" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Email Address</p>
            <p className="text-sm font-semibold text-gray-800 mt-1 break-all">{email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Mobile Number</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{mobile}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Gender</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{gender}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[10000]" onClose={handleCloseEdit}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 sm:p-7 text-left shadow-2xl transition-all border border-gray-100">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                        Edit Profile
                      </Dialog.Title>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Update your personal details in the auth users table.
                      </p>
                    </div>
                    <button
                      onClick={handleCloseEdit}
                      disabled={isSaving}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <X size={18} weight="bold" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="e.g. Ramu"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="e.g. Gundugolu"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="e.g. name@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.mobile}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="e.g. 9876543210"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, gender: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Role (Read only) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        Role (Assigned)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={role}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleCloseEdit}
                        disabled={isSaving}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#0E1528] text-white hover:bg-[#1a2542] rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <CircleNotch size={14} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
