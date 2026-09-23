"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarBlank,
  CurrencyInr,
  EnvelopeSimple,
  FileText,
  FloppyDisk,
  Globe,
  GraduationCap,
  ImageSquare,
  MapPin,
  Phone,
  User,
  UsersThree,
  ArrowCounterClockwise,
  WarningCircle,
} from "@phosphor-icons/react";
import ApplicationSummary from "./ApplicationSummary";
import ApplicationSuccessModal from "./ApplicationSuccessModal";
import { validateApplication, type FormErrors } from "./validation";
import { applicationToDetails, useSubmitApplication, type ApplicationInputPayload } from "@/lib/helpers/applicationsAPI";
import { useAdmissions } from "@/lib/helpers/admissionsAPI";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { withDemoDefaults } from "./demoApplication";

const draftKey = "achievers-application-draft-v1";

function Field({
  label,
  icon,
  children,
  wide = false,
  error,
  isTextarea = false,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  wide?: boolean;
  error?: string;
  isTextarea?: boolean;
}) {
  return (
    <div className={`flex flex-col min-w-0 gap-1.5 text-[11px] font-medium text-[#35465e] ${wide ? "md:col-span-2" : ""}`}>
      <span>
        {label}: <b className="text-red-500 font-medium">*</b>
      </span>
      <div className="relative flex items-center min-w-0">
        <span
          className={`absolute left-3 ${isTextarea ? "top-3" : "top-1/2 -translate-y-1/2"} text-[#8ea3be] pointer-events-none [&>svg]:w-3.5 [&>svg]:h-3.5`}
          aria-hidden="true"
        >
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 mt-1" role="alert">
          <WarningCircle size={13} weight="fill" />
          {error}
        </span>
      )}
    </div>
  );
}

function Select({
  name,
  placeholder,
  options,
  error,
  onChange,
}: {
  name: string;
  placeholder: string;
  options: string[];
  error?: boolean;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      name={name}
      defaultValue=""
      className={`w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[12px] pl-[37px] pr-3 h-[40px] focus:outline-none focus:ring-2 transition-colors cursor-pointer ${
        error
          ? "border-red-500 bg-red-50/40 focus:ring-red-500"
          : "border-[#e1e9f2] focus:ring-[#2865ef]"
      }`}
      onChange={onChange}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option} className="cursor-pointer">
          {option}
        </option>
      ))}
    </select>
  );
}

export default function ApplicationForm({
  startAtSummary = false,
  initialDetails,
}: {
  startAtSummary?: boolean;
  initialDetails?: Record<string, string>;
}) {
  const form = useRef<HTMLFormElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [review, setReview] = useState<Record<string, string> | null>(() =>
    startAtSummary ? withDemoDefaults({}) : null
  );
  const [attachments, setAttachments] = useState<Record<string, string>>((): Record<string, string> =>
    startAtSummary ? { profileImage: "/sample-student-profile.png" } : {}
  );
  const [successModalData, setSuccessModalData] = useState<{
    applicationId: string;
    details: Record<string, string>;
  } | null>(null);
  const attachmentUrls = useRef<string[]>([]);
  const submissionId = useRef<string | null>(null);
  const hydratedApplication = useRef<string | null>(null);
  const [savedDetails, setSavedDetails] = useState<Record<string, string> | null>(null);
  const existingDetails = savedDetails || initialDetails;
  const submitMutation = useSubmitApplication();
  const searchParams = useSearchParams();
  const { data: admissionsData } = useAdmissions();
  const defaultCourse = searchParams.get("course") || "";
  const defaultFee = searchParams.get("fee") || "0";

  // Name capitalization helper
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      e.target.value = val.charAt(0).toUpperCase() + val.slice(1);
    }
  };

  useEffect(() => () => {
    attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    const identity = initialDetails?.applicationId || "new";
    // Query refreshes must not replace values the applicant is currently editing.
    if (hydratedApplication.current === identity) return;
    try {
      const saved = initialDetails ? null : localStorage.getItem(draftKey);
      if ((!initialDetails && !saved) || !form.current) return;
      const values: unknown = initialDetails || JSON.parse(saved!);
      if (!values || typeof values !== "object" || Array.isArray(values)) return;
      hydratedApplication.current = identity;
      for (const [name, value] of Object.entries(values)) {
        if (typeof value !== "string") continue;
        const input = form.current.elements.namedItem(name);
        if (input instanceof RadioNodeList) input.value = value;
        else if (input instanceof HTMLInputElement && input.type !== "file" && !input.readOnly) input.value = value;
        else if (input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) input.value = value;
      }
    } catch {
      /* The form remains usable when browser storage is unavailable. */
    }
  }, [initialDetails]);

  useEffect(() => {
    if (review) {
      reviewHeading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [review]);

  function values() {
    const result: Record<string, string> = {};
    if (!form.current) return result;
    new FormData(form.current).forEach((value, name) => {
      if (typeof value === "string") result[name] = value;
    });
    return result;
  }

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify(values()));
      setStatus("Draft saved on this browser. Reattach your profile image and certificate when you return.");
      toast.success("Draft saved successfully!");
    } catch {
      setStatus("The draft could not be saved in this browser. Keep this page open to retain your details.");
      toast.error("Could not save draft. Local storage may be disabled.");
    }
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitMutation.isPending) return;
    const formElement = event.currentTarget;
    const currentValues = values();
    const details = { ...existingDetails, ...currentValues };

    const profileInput = formElement.elements.namedItem("profileImage") as HTMLInputElement | null;
    const certInput = formElement.elements.namedItem("classXCertificate") as HTMLInputElement | null;

    const filesToValidate = {
      profileImage: profileInput?.files?.[0],
      classXCertificate: certInput?.files?.[0],
    };

    // Run comprehensive validations for every single field
    const validationErrors = validateApplication(details, existingDetails, filesToValidate);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted errors in the form.");

      // Smooth scroll to the first invalid field
      const firstField = Object.keys(validationErrors)[0];
      const targetElement = formElement.elements.namedItem(firstField);
      if (targetElement instanceof HTMLElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (targetElement instanceof RadioNodeList && targetElement[0] instanceof HTMLElement) {
        targetElement[0].focus();
        targetElement[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});

    attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url));
    attachmentUrls.current = [];
    const files: Record<string, string> = {};
    new FormData(formElement).forEach((value, name) => {
      if (value instanceof File && value.size > 0) {
        details[name] = value.name;
        files[name] = URL.createObjectURL(value);
        attachmentUrls.current.push(files[name]);
      }
    });
    setAttachments({ profileImage: existingDetails?.profilePreview || "", classXCertificate: existingDetails?.certificatePreview || "", ...files });
    try {
      localStorage.setItem(draftKey, JSON.stringify(currentValues));
    } catch {
      /* Review does not require browser storage. */
    }

    submissionId.current ||= crypto.randomUUID();
    setStatus("Uploading documents and saving your application...");
    toast.loading("Submitting application...", { id: "submitApp" });

    const payload: ApplicationInputPayload = {
      submissionId: submissionId.current,
      profileImage: filesToValidate.profileImage,
      classXCertificate: filesToValidate.classXCertificate,
      applicationFor: details.applicationFor || "Intermediate First Year",
      course: details.course || "MPC",
      registrationFee: details.registrationFee || defaultFee || 500,
      academicYear: details.academicYear || "2026-2027",
      firstName: details.firstName || "",
      lastName: details.lastName || "",
      fatherName: details.fatherName || "",
      motherName: details.motherName || "",
      gender: details.gender || "Male",
      dateOfBirth: details.dateOfBirth || "",
      nationality: details.nationality || "Indian",
      category: details.category || "General",
      address: details.address || "",
      state: details.state || "Telangana",
      city: details.city || "",
      pinCode: details.pinCode || "",
      mobileNumber: details.phone || "",
      email: details.email || "",
      applicationNumber: existingDetails?.applicationId,
      classXSchool: details.classXSchool || "",
      classXBoard: details.classXBoard || "",
      classXYear: details.classXYear || "",
      classXPercentage: details.classXPercentage || "",
      classXMedium: details.classXMedium || "",
    };

    submitMutation.mutate(payload, {
      onSuccess: (result) => {
        const appNum = result.user.applicationNumber;
        const updated = applicationToDetails(result);
        setSavedDetails(updated);
        setAttachments(result.attachments || {});
        try { localStorage.removeItem(draftKey); } catch { /* Saving does not depend on browser storage. */ }
        setSuccessModalData({ applicationId: appNum, details: updated });
        setStatus(`Application saved successfully. Application Number: ${appNum}.`);
        toast.success(`Application saved successfully!`, { id: "submitApp" });
      },
      onError: (err) => {
        setStatus(err.message || "Application could not be saved. Please try again.");
        toast.error(err.message || "Failed to submit application", { id: "submitApp" });
      },
    });
  }

  function handleProceedFromModal() {
    if (successModalData) {
      setReview(successModalData.details);
      setSuccessModalData(null);
    }
  }

  function downloadSlipFromModal() {
    if (!successModalData) return;
    const blob = new Blob([JSON.stringify(successModalData.details, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `achievers-application-${successModalData.applicationId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function reset() {
    if (submitMutation.isPending) return;
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* Reset the visible form even without storage. */
    }
    form.current?.reset();
    setErrors({});
    setReview(null);
    setSavedDetails(null);
    submissionId.current = null;
    setAttachments({});
    setSuccessModalData(null);
    setStatus("Application form reset.");
  }

  function download() {
    const blob = new Blob([JSON.stringify(review, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `achievers-application-${review?.applicationId || "record"}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const inputClass = (hasError?: boolean) =>
    `w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[12px] pl-[37px] pr-3 h-[40px] focus:outline-none focus:ring-2 placeholder:text-[#8ea3be] transition-colors ${
      hasError
        ? "border-red-500 bg-red-50/40 focus:ring-red-500"
        : "border-[#e1e9f2] focus:ring-[#2865ef]"
    }`;

  const tableInputClass = (hasError?: boolean) =>
    `w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[11px] px-2.5 h-[36px] focus:outline-none focus:ring-2 placeholder:text-[#8ea3be] transition-colors ${
      hasError
        ? "border-red-500 bg-red-50/40 focus:ring-red-500"
        : "border-[#e1e9f2] focus:ring-[#2865ef]"
    }`;

  return (
    <div className="bg-[#f2f5fa] py-12 px-4 sm:px-6 text-[#182336] min-h-screen">
      <section className="max-w-[980px] mx-auto p-6 sm:p-10 bg-[#ededed] rounded-[14px] shadow-[0_4px_14px_rgba(15,23,42,0.07)]" aria-labelledby="application-heading" hidden={review !== null}>
        <header className="flex items-center gap-4 pb-7 border-b border-[#e4e8ee] mb-6">
          <span className="flex items-center justify-center w-[60px] h-[60px] shrink-0 rounded-full bg-[#ff9000] text-white shadow-sm">
            <FileText size={27} aria-hidden="true" />
          </span>
          <div>
            <h1 id="application-heading" className="text-[22px] sm:text-[25px] font-bold tracking-tight text-[#081D36] m-0">
              Intermediate Application Form
            </h1>
            <p className="mt-1 text-xs text-[#71849f] leading-relaxed">
              Fill in your details carefully. All fields marked with <b className="text-red-500 font-medium">*</b> are required.
            </p>
          </div>
        </header>

        <form ref={form} onSubmit={next} noValidate hidden={review !== null}>
          <fieldset disabled={submitMutation.isPending} className="min-w-0 border-0 p-0 m-0">
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3.5 mb-5 text-[12.5px] font-medium flex items-start gap-2 max-h-[160px] overflow-y-auto" role="alert">
              <WarningCircle size={18} weight="fill" className="shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="mb-2 text-[13.5px]">Please correct the {Object.keys(errors).length} highlighted field(s) below to continue:</p>
                <ul className="list-disc pl-4 space-y-1 text-red-700">
                  {Object.entries(errors).map(([field, err]) => (
                    <li key={field}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {initialDetails && (
            <div className="mb-6 flex items-center gap-4 rounded-lg border border-[#dce3ed] bg-white p-4">
              <Image
                src={initialDetails.profilePreview || "/sample-student-profile.png"}
                unoptimized
                alt="Current student profile"
                width={60}
                height={75}
                className="rounded object-contain"
              />
              <div className="text-xs leading-6">
                <p className="font-semibold text-[#081D36]">
                  Editing {initialDetails.firstName} {initialDetails.lastName} — {initialDetails.applicationId}
                </p>
                <p>Current certificate: {initialDetails.classXCertificate || "None"}</p>
                <p>Choose new files below only if you want to replace them.</p>
              </div>
            </div>
          )}

          <h2 className="flex items-center gap-2.5 bg-[#eef3f9] border-l-4 border-[#0047A9] rounded-md px-4 py-2.5 mb-6 text-[13.5px] font-bold text-[#081D36]">
            <FileText size={15} aria-hidden="true" className="text-[#0047A9]" />
            Personal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-9">
            <Field label="Application For" icon={<GraduationCap />} error={errors.applicationFor}>
              <Select
                name="applicationFor"
                placeholder="Select Application For"
                options={["Intermediate First Year", "Intermediate Second Year"]}
                error={Boolean(errors.applicationFor)}
                onChange={() => clearError("applicationFor")}
              />
            </Field>

            <Field label="Course" icon={<BookOpen />} error={errors.course}>
              {defaultCourse ? (
                (() => {
                  let code = "";
                  const lower = defaultCourse.toLowerCase();
                  if (lower.includes("biology")) code = "BiPC";
                  else if (lower.includes("math") && lower.includes("phys") && lower.includes("chem")) code = "MPC";
                  else if (lower.includes("math") && lower.includes("econ")) code = "MEC";
                  else if (lower.includes("civics") && lower.includes("econ") && lower.includes("com")) code = "CEC";
                  else if (lower.includes("hist") && lower.includes("econ") && lower.includes("civics")) code = "HEC";
                  const displayValue = code ? `${defaultCourse} (${code})` : defaultCourse;
                  return (
                    <input
                      name="course"
                      value={displayValue}
                      readOnly
                      className="w-full min-w-0 border border-[#e1e9f2] rounded-[7px] bg-[#eaf1f7] text-[#465875] text-[12px] pl-[37px] pr-3 h-[40px] cursor-not-allowed font-semibold"
                    />
                  );
                })()
              ) : (
                <select
                  name="course"
                  defaultValue=""
                  className={`w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[12px] pl-[37px] pr-3 h-[40px] focus:outline-none focus:ring-2 transition-colors cursor-pointer ${
                    errors.course
                      ? "border-red-500 bg-red-50/40 focus:ring-red-500"
                      : "border-[#e1e9f2] focus:ring-[#2865ef]"
                  }`}
                  onChange={() => clearError("course")}
                >
                  <option value="" disabled>Select Course</option>
                  {admissionsData?.courses
                    .filter(c => c.isAdmissionsOpen && admissionsData.globalAdmissionsOpen)
                    .map((option) => (
                      <option key={option.collegeBranchId} value={option.courseName} className="cursor-pointer">{option.courseName}</option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="First Name" icon={<User />} error={errors.firstName}>
              <input
                name="firstName"
                autoComplete="given-name"
                placeholder="Enter first name"
                maxLength={50}
                className={inputClass(Boolean(errors.firstName))}
                onChange={(e) => {
                  clearError("firstName");
                  handleNameChange(e);
                }}
              />
            </Field>

            <Field label="Last Name" icon={<User />} error={errors.lastName}>
              <input
                name="lastName"
                autoComplete="family-name"
                placeholder="Enter last name"
                maxLength={50}
                className={inputClass(Boolean(errors.lastName))}
                onChange={(e) => {
                  clearError("lastName");
                  handleNameChange(e);
                }}
              />
            </Field>

            <Field label="Father’s Name" icon={<User />} error={errors.fatherName}>
              <input
                name="fatherName"
                placeholder="Enter father’s name"
                maxLength={100}
                className={inputClass(Boolean(errors.fatherName))}
                onChange={(e) => {
                  clearError("fatherName");
                  handleNameChange(e);
                }}
              />
            </Field>

            <Field label="Mother’s Name" icon={<User />} error={errors.motherName}>
              <input
                name="motherName"
                placeholder="Enter mother’s name"
                maxLength={100}
                className={inputClass(Boolean(errors.motherName))}
                onChange={(e) => {
                  clearError("motherName");
                  handleNameChange(e);
                }}
              />
            </Field>

            <fieldset className="border-0 p-0 m-0 text-[11px] text-[#35465e]">
              <legend className="mb-1.5 font-medium">
                Gender: <b className="text-red-500 font-medium">*</b>
              </legend>
              <div className="flex items-center min-h-[40px] gap-5 text-[12px]">
                {["Female", "Male", "Other"].map((gender) => (
                  <label key={gender} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      defaultChecked={gender === "Female"}
                      className="accent-[#2865ef] w-4 h-4 cursor-pointer"
                      onChange={() => clearError("gender")}
                    />
                    {gender}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 mt-1" role="alert">
                  <WarningCircle size={13} weight="fill" />
                  {errors.gender}
                </span>
              )}
            </fieldset>

            <Field label="Date of Birth" icon={<CalendarBlank />} error={errors.dateOfBirth}>
              <input
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                className={inputClass(Boolean(errors.dateOfBirth))}
                onChange={() => clearError("dateOfBirth")}
              />
            </Field>

            <Field label="Nationality" icon={<Globe />} error={errors.nationality}>
              <Select
                name="nationality"
                placeholder="Select Nationality"
                options={["Indian", "Other"]}
                error={Boolean(errors.nationality)}
                onChange={() => clearError("nationality")}
              />
            </Field>

            <Field label="Category" icon={<UsersThree />} error={errors.category}>
              <Select
                name="category"
                placeholder="Select Category"
                options={["General", "EWS", "OBC", "SC", "ST", "Other"]}
                error={Boolean(errors.category)}
                onChange={() => clearError("category")}
              />
            </Field>

            <Field label="Postal Address" icon={<MapPin />} wide error={errors.address} isTextarea>
              <textarea
                name="address"
                autoComplete="street-address"
                placeholder="Enter your complete address"
                rows={2}
                maxLength={500}
                className={`w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[12px] pl-[37px] pr-3 h-[60px] py-2.5 resize-y focus:outline-none focus:ring-2 placeholder:text-[#8ea3be] transition-colors ${
                  errors.address
                    ? "border-red-500 bg-red-50/40 focus:ring-red-500"
                    : "border-[#e1e9f2] focus:ring-[#2865ef]"
                }`}
                onChange={() => clearError("address")}
              />
            </Field>

            <Field label="State" icon={<BookOpen />} error={errors.state}>
              <input
                name="state"
                autoComplete="address-level1"
                placeholder="Enter state"
                maxLength={50}
                className={inputClass(Boolean(errors.state))}
                onChange={(e) => {
                  clearError("state");
                  handleNameChange(e);
                }}
              />
            </Field>

            <Field label="City" icon={<MapPin />} error={errors.city}>
              <input
                name="city"
                autoComplete="address-level2"
                placeholder="Enter city"
                maxLength={50}
                className={inputClass(Boolean(errors.city))}
                onChange={() => clearError("city")}
              />
            </Field>

            <Field label="Pin Code" icon={<MapPin />} error={errors.pinCode}>
              <input
                name="pinCode"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit pin code"
                className={inputClass(Boolean(errors.pinCode))}
                onChange={() => clearError("pinCode")}
              />
            </Field>

            <Field label="Contact No." icon={<Phone />} error={errors.phone}>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                className={inputClass(Boolean(errors.phone))}
                onChange={() => clearError("phone")}
              />
            </Field>

            <Field label="Email-id" icon={<EnvelopeSimple />} error={errors.email}>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email address"
                className={inputClass(Boolean(errors.email))}
                onChange={() => clearError("email")}
              />
            </Field>

            <Field label="Profile Image (jpg only)" icon={<ImageSquare />} error={errors.profileImage}>
              <input
                name="profileImage"
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                className={`w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[10px] pl-[34px] pr-2 py-2 focus:outline-none focus:ring-2 transition-colors file:mr-2.5 file:py-1 file:px-2.5 file:border file:border-[#dde6f0] file:rounded file:bg-[#f7f9fc] file:text-[#33465e] file:text-[11px] file:cursor-pointer ${
                  errors.profileImage
                    ? "border-red-500 bg-red-50/40 focus:ring-red-500"
                    : "border-[#e1e9f2] focus:ring-[#2865ef]"
                }`}
                onChange={() => clearError("profileImage")}
              />
            </Field>

            <Field label="Admission Registration Fee" icon={<CurrencyInr />}>
              <input
                name="registrationFee"
                value={defaultFee}
                readOnly
                className="w-full min-w-0 border border-[#e1e9f2] rounded-[7px] bg-[#eaf1f7] text-[#465875] text-[12px] pl-[37px] pr-3 h-[40px] cursor-not-allowed"
              />
            </Field>
          </div>

          <h2 className="flex items-center gap-2.5 bg-[#eef3f9] border-l-4 border-[#0047A9] rounded-md px-4 py-2.5 mb-6 text-[13.5px] font-bold text-[#081D36]">
            <BookOpen size={16} aria-hidden="true" className="text-[#0047A9]" />
            Educational Qualification
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-x-1.5 border-spacing-y-3.5">
              <thead>
                <tr>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2 w-[68px]">
                    Class
                  </th>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2">
                    School Name <b className="text-red-500 font-medium">*</b>
                  </th>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2">
                    Board <b className="text-red-500 font-medium">*</b>
                  </th>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2">
                    Passing Year <b className="text-red-500 font-medium">*</b>
                  </th>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2 w-[17%]">
                    Grade/Percentage (%) <b className="text-red-500 font-medium">*</b>
                  </th>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2 w-[11%]">
                    Medium <b className="text-red-500 font-medium">*</b>
                  </th>
                  <th scope="col" className="text-left text-[10.5px] font-semibold text-[#35465e] pb-2 w-[20%]">
                    Certificate (pdf only) <b className="text-red-500 font-medium">*</b>
                  </th>
                </tr>
              </thead>
              <tbody>
                {["X"].map((level) => (
                  <tr key={level}>
                    <th scope="row" className="text-[13px] font-semibold text-[#081D36] whitespace-nowrap align-middle pr-2">
                      Class X
                    </th>
                    <td>
                      <input
                        name={`class${level}School`}
                        aria-label={`Class ${level} school`}
                        placeholder="Enter school name"
                        className={tableInputClass(Boolean(errors.classXSchool))}
                        onChange={() => clearError("classXSchool")}
                      />
                      {errors.classXSchool && (
                        <span className="block text-[10px] font-medium text-red-600 mt-1 leading-tight" role="alert">
                          {errors.classXSchool}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        name={`class${level}Board`}
                        aria-label={`Class ${level} board`}
                        placeholder="Enter board (e.g. SSC / CBSE)"
                        className={tableInputClass(Boolean(errors.classXBoard))}
                        onChange={() => clearError("classXBoard")}
                      />
                      {errors.classXBoard && (
                        <span className="block text-[10px] font-medium text-red-600 mt-1 leading-tight" role="alert">
                          {errors.classXBoard}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        name={`class${level}Year`}
                        aria-label={`Class ${level} passing year`}
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        pattern="\d{4}"
                        placeholder="YYYY"
                        className={tableInputClass(Boolean(errors.classXYear))}
                        onChange={() => clearError("classXYear")}
                      />
                      {errors.classXYear && (
                        <span className="block text-[10px] font-medium text-red-600 mt-1 leading-tight" role="alert">
                          {errors.classXYear}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        name={`class${level}Percentage`}
                        aria-label={`Class ${level} percentage`}
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        placeholder="Enter %"
                        className={tableInputClass(Boolean(errors.classXPercentage))}
                        onChange={() => clearError("classXPercentage")}
                      />
                      {errors.classXPercentage && (
                        <span className="block text-[10px] font-medium text-red-600 mt-1 leading-tight" role="alert">
                          {errors.classXPercentage}
                        </span>
                      )}
                    </td>
                    <td>
                      <select
                        name={`class${level}Medium`}
                        aria-label={`Class ${level} medium`}
                        defaultValue=""
                        className={`w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[11px] px-2 h-[36px] focus:outline-none focus:ring-2 cursor-pointer ${
                          errors.classXMedium
                            ? "border-red-500 bg-red-50/40 focus:ring-red-500"
                            : "border-[#e1e9f2] focus:ring-[#2865ef]"
                        }`}
                        onChange={() => clearError("classXMedium")}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {["English", "Telugu", "Hindi", "Urdu", "Other"].map((medium) => (
                          <option key={medium} value={medium} className="cursor-pointer">
                            {medium}
                          </option>
                        ))}
                      </select>
                      {errors.classXMedium && (
                        <span className="block text-[10px] font-medium text-red-600 mt-1 leading-tight" role="alert">
                          {errors.classXMedium}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        name={`class${level}Certificate`}
                        aria-label={`Class ${level} certificate`}
                        type="file"
                        accept=".pdf,application/pdf"
                        className={`w-full min-w-0 border rounded-[7px] bg-white text-[#465875] text-[9px] p-1.5 focus:outline-none focus:ring-2 file:mr-1.5 file:py-0.5 file:px-1.5 file:border file:border-[#dde6f0] file:rounded file:bg-[#f7f9fc] file:text-[#33465e] file:text-[10px] ${
                          errors.classXCertificate
                            ? "border-red-500 bg-red-50/40 focus:ring-red-500"
                            : "border-[#e1e9f2] focus:ring-[#2865ef]"
                        }`}
                        onChange={() => clearError("classXCertificate")}
                      />
                      {errors.classXCertificate && (
                        <span className="block text-[10px] font-medium text-red-600 mt-1 leading-tight" role="alert">
                          {errors.classXCertificate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end flex-wrap gap-3 mt-10">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] rounded-[7px] px-5 py-2.5 border border-[#ccd8e7] bg-white text-[#35465e] text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowCounterClockwise size={15} />
              Reset
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] rounded-[7px] px-5 py-2.5 bg-[#475569] text-white text-xs font-medium hover:bg-[#334155] transition cursor-pointer"
            >
              <FloppyDisk size={15} />
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] rounded-[7px] px-5 py-2.5 bg-[#ff7810] text-white text-xs font-medium hover:bg-[#e66606] transition shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Application...
                </>
              ) : (
                <>
                  Save and Next <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
          </fieldset>
        </form>
      </section>

      {successModalData && (
        <ApplicationSuccessModal
          applicationId={successModalData.applicationId}
          details={successModalData.details}
          onProceed={handleProceedFromModal}
          onDownload={downloadSlipFromModal}
          onClose={() => setSuccessModalData(null)}
        />
      )}

      {review && (
        <ApplicationSummary
          details={review}
          attachments={attachments}
          headingRef={reviewHeading}
          onEdit={() => setReview(null)}
          onDownload={download}
        />
      )}
    </div>
  );
}
