import { supabase } from "@/lib/supabaseClient";

export type AchieversApplication = {
  id: string;
  applicationId: number;
  name: string;
  course: string;
  submitted: string;
  rawDate: string;
  payment: "Success" | "Pending" | "Failed";
  admission: "Pending" | "Verification" | "Selected" | "Regret";
  email: string;
  mobile: string;
  score: string;
  raw: any;
};

// --- Grade Percentage Parser (for Class X / SSC 10th marks) ---
export function parseGradeToPercentage(gradeStr: string | null | undefined): number {
  if (!gradeStr) return 0;
  const str = String(gradeStr).trim().toLowerCase();

  const match = str.match(/[\d.]+/);
  if (!match) return 0;

  const num = parseFloat(match[0]);
  if (isNaN(num)) return 0;

  if (str.includes("cgpa")) {
    return num <= 10 ? num * 9.5 : num;
  }

  if (num <= 10 && num > 0) {
    return num * 9.5;
  }

  return num;
}

// --- Format Course With Code (e.g. "Biology, Physics, Chemistry (BiPC)") ---
export function formatCourseWithCode(courseName?: string): string {
  if (!courseName) return "N/A";
  const str = courseName.trim();
  if (/\([A-Za-z]+\)/.test(str)) return str;

  const lower = str.toLowerCase().replace(/,/g, " ");

  if (lower.includes("bipc") || (lower.includes("biolog") && lower.includes("chem"))) {
    return "Biology, Physics, Chemistry (BiPC)";
  }
  if (lower.includes("mpc") || (lower.includes("math") && lower.includes("phys") && lower.includes("chem"))) {
    return "Mathematics, Physics, Chemistry (MPC)";
  }
  if (lower.includes("cec") || (lower.includes("commer") && lower.includes("civic"))) {
    return "Commerce, Economics, Civics (CEC)";
  }
  if (lower.includes("mec") || (lower.includes("math") && lower.includes("econom") && lower.includes("commer"))) {
    return "Mathematics, Economics, Commerce (MEC)";
  }
  if (lower.includes("hec")) {
    return "History, Economics, Civics (HEC)";
  }
  return str;
}

// --- Format User Record to AchieversApplication ---
export function formatUserToApplication(user: any, tx?: any, eduList?: any[]): AchieversApplication {
  const dateObj = new Date(user.createdAt || Date.now());
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();

  let dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateObj);
  if (isToday) dateStr = "Today";
  else if (isYesterday) dateStr = "Yesterday";

  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  let paymentStatus: AchieversApplication["payment"] = "Pending";
  if (tx) {
    const s = (tx.status || "").toLowerCase();
    if (s === "success") paymentStatus = "Success";
    else if (s === "failed") paymentStatus = "Failed";
    else paymentStatus = "Pending";
  } else if (user.applicationStatus && user.applicationStatus.toLowerCase().includes("paid")) {
    paymentStatus = "Success";
  }

  const rawStatus = (user.admissionStatus || "").toLowerCase();
  let admissionStatus: AchieversApplication["admission"] = "Pending";
  if (rawStatus) {
    if (rawStatus.includes("selected")) admissionStatus = "Selected";
    else if (rawStatus.includes("verification")) admissionStatus = "Verification";
    else if (rawStatus.includes("regret") || rawStatus.includes("rejected")) admissionStatus = "Regret";
  }

  let numericAppId = 1;
  const match = (user.applicationNumber || "").match(/\d+$/);
  if (match) {
    numericAppId = parseInt(match[0], 10);
  }

  const imageRef = user.profileImageRef || user.profileImage;
  const profileImageUrl = imageRef
    ? supabase.storage.from("application-documents").getPublicUrl(imageRef).data.publicUrl
    : null;

  const rawEdu = eduList || user.education_qualifications || [];
  const mappedEdu = rawEdu.map((edu: any) => {
    const certUrl = edu.certificateRef
      ? supabase.storage.from("application-documents").getPublicUrl(edu.certificateRef).data.publicUrl
      : edu.certificateUrl || null;

    return {
      educationId: edu.educationId,
      level: edu.qualificationLevel || edu.level || "Class X",
      schoolOrCollege: edu.schoolName || edu.schoolOrCollege,
      boardOrUniversity: edu.board || edu.boardOrUniversity,
      passingYear: edu.passingYear,
      gradeOrPercentage: edu.gradeOrPercentage
        ? String(edu.gradeOrPercentage).includes("%")
          ? String(edu.gradeOrPercentage)
          : `${edu.gradeOrPercentage}%`
        : "N/A",
      certificateUrl: certUrl,
      certificateRef: edu.certificateRef,
    };
  });

  return {
    id: user.applicationNumber || `AJC-2026-${String(numericAppId).padStart(4, "0")}`,
    applicationId: numericAppId,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Applicant",
    course: formatCourseWithCode(user.course || user.applicationFor || "Inter"),
    submitted: `${dateStr}, ${timeStr}`,
    rawDate: user.createdAt || new Date().toISOString(),
    payment: paymentStatus,
    admission: admissionStatus,
    email: user.email || user.emailId || "",
    mobile: user.mobileNumber || user.contactNo || "",
    score: mappedEdu[0]?.gradeOrPercentage || "90%",
    raw: {
      ...user,
      fatherName: user.fatherName || user.fathersName,
      fathersName: user.fatherName || user.fathersName,
      motherName: user.motherName || user.mothersName,
      mothersName: user.motherName || user.mothersName,
      address: user.address || user.postalAddress,
      postalAddress: user.address || user.postalAddress,
      pinCode: user.pinCode,
      pincode: user.pinCode,
      city: user.city,
      state: user.state,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      nationality: user.nationality || "Indian",
      category: user.category,
      contactNo: user.mobileNumber || user.contactNo,
      mobileNumber: user.mobileNumber || user.contactNo,
      emailId: user.email || user.emailId,
      email: user.email || user.emailId,
      applicationId: numericAppId,
      profileImageUrl: profileImageUrl,
      education_qualifications: mappedEdu,
      transaction: tx || null,
      lead_payments: tx
        ? [
            {
              paymentStatus: tx.status,
              createdAt: tx.createdAt,
              amount: tx.amount,
              transactionId: tx.gatewayTransactionId || tx.transactionId,
              paymentMethod: "Online / Gateway",
            },
          ]
        : [],
    },
  };
}

// --- KPI Counts: Website Visitors, Admissions Opened, Forms Submitted ---
export async function getAchieversKpiCounts() {
  try {
    // 1. Visitors who opened the website
    const visitorsQuery = supabase
      .from("application_analytics_logs")
      .select("visitorId")
      .in("eventType", ["SITE_VISIT", "page_view"]);

    // 2. Members who opened the admission application form
    const opensQuery = supabase
      .from("application_analytics_logs")
      .select("visitorId")
      .in("eventType", ["FORM_OPEN", "admission_open"]);

    // 3. Forms submitted for Achievers: count of users
    const submissionsQuery = supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false);

    const [
      { data: visitorsData, error: vErr },
      { data: opensData, error: oErr },
      { count: submissions, error: sErr },
    ] = await Promise.all([visitorsQuery, opensQuery, submissionsQuery]);

    if (vErr) console.error("Achievers KPI visitors error:", vErr);
    if (oErr) console.error("Achievers KPI opens error:", oErr);
    if (sErr) console.error("Achievers KPI submissions error:", sErr);

    const distinctVisitors = new Set(visitorsData?.map((v) => v.visitorId)).size;
    const distinctOpens = new Set(opensData?.map((o) => o.visitorId)).size;

    return {
      visitors: distinctVisitors || 0,
      opens: distinctOpens || 0,
      submissions: submissions ?? 0,
      visitorIds: new Set(visitorsData?.map((v) => v.visitorId)),
      openIds: new Set(opensData?.map((o) => o.visitorId)),
    };
  } catch (err) {
    console.error("Failed to fetch Achievers KPI data:", err);
    return { visitors: 0, opens: 0, submissions: 0, visitorIds: new Set(), openIds: new Set() };
  }
}

// --- Recent Applications: Joining users, application_transactions, and user_education ---
export async function getAchieversRecentApplications(limit = 5): Promise<AchieversApplication[]> {
  try {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("is_deleted", false)
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (usersError || !usersData?.length) {
      if (usersError) console.error("Error fetching recent applications:", usersError);
      return [];
    }

    const appNumbers = usersData.map((u) => u.applicationNumber).filter(Boolean);
    const userIds = usersData.map((u) => u.userId).filter(Boolean);

    // Transactions
    let txMap = new Map<string, any>();
    if (appNumbers.length > 0) {
      const { data: txData } = await supabase
        .from("application_transactions")
        .select("*")
        .in("applicationNumber", appNumbers)
        .order("createdAt", { ascending: false });

      txData?.forEach((tx) => {
        if (!txMap.has(tx.applicationNumber)) {
          txMap.set(tx.applicationNumber, tx);
        }
      });
    }

    // Education
    let eduMap = new Map<string, any[]>();
    if (userIds.length > 0) {
      const { data: eduData } = await supabase
        .from("user_education")
        .select("*")
        .in("userId", userIds)
        .eq("is_deleted", false);

      eduData?.forEach((edu) => {
        const list = eduMap.get(edu.userId) || [];
        list.push(edu);
        eduMap.set(edu.userId, list);
      });
    }

    return usersData.map((u) =>
      formatUserToApplication(u, txMap.get(u.applicationNumber), eduMap.get(u.userId))
    );
  } catch (err) {
    console.error("Failed in getAchieversRecentApplications:", err);
    return [];
  }
}

// --- All Applications ---
export async function getAchieversAllApplications(): Promise<AchieversApplication[]> {
  try {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("is_deleted", false)
      .order("createdAt", { ascending: false });

    if (usersError || !usersData?.length) {
      if (usersError) console.error("Error fetching all applications:", usersError);
      return [];
    }

    const appNumbers = usersData.map((u) => u.applicationNumber).filter(Boolean);
    const userIds = usersData.map((u) => u.userId).filter(Boolean);

    // Transactions
    let txMap = new Map<string, any>();
    if (appNumbers.length > 0) {
      const { data: txData } = await supabase
        .from("application_transactions")
        .select("*")
        .in("applicationNumber", appNumbers)
        .order("createdAt", { ascending: false });

      txData?.forEach((tx) => {
        if (!txMap.has(tx.applicationNumber)) {
          txMap.set(tx.applicationNumber, tx);
        }
      });
    }

    // Education
    let eduMap = new Map<string, any[]>();
    if (userIds.length > 0) {
      const { data: eduData } = await supabase
        .from("user_education")
        .select("*")
        .in("userId", userIds)
        .eq("is_deleted", false);

      eduData?.forEach((edu) => {
        const list = eduMap.get(edu.userId) || [];
        list.push(edu);
        eduMap.set(edu.userId, list);
      });
    }

    return usersData.map((u) =>
      formatUserToApplication(u, txMap.get(u.applicationNumber), eduMap.get(u.userId))
    );
  } catch (err) {
    console.error("Failed in getAchieversAllApplications:", err);
    return [];
  }
}

// --- Monthly Applications Trend for a given Year ---
export async function getAchieversApplicationsByYear(year: number): Promise<number[]> {
  try {
    const startOfYear = `${year}-01-01T00:00:00.000Z`;
    const endOfYear = `${year}-12-31T23:59:59.999Z`;

    const { data, error } = await supabase
      .from("users")
      .select("createdAt")
      .eq("is_deleted", false)
      .gte("createdAt", startOfYear)
      .lte("createdAt", endOfYear);

    const counts = new Array(12).fill(0);
    if (error || !data) {
      if (error) console.error("Error fetching applications by year:", error);
      return counts;
    }

    data.forEach((row) => {
      if (row.createdAt) {
        const month = new Date(row.createdAt).getMonth();
        if (month >= 0 && month <= 11) {
          counts[month]++;
        }
      }
    });

    return counts;
  } catch (err) {
    console.error("Failed in getAchieversApplicationsByYear:", err);
    return new Array(12).fill(0);
  }
}

// --- Rank Applications by Score ---
export function getAchieversTopApplications(apps: AchieversApplication[], limit = 5): AchieversApplication[] {
  return [...apps]
    .sort((a, b) => parseGradeToPercentage(b.score) - parseGradeToPercentage(a.score))
    .slice(0, limit);
}

// --- Update Admission Status ---
export async function updateApplicationAdmissionStatus(
  applicationNumber: string,
  newStatus: "Pending" | "Verification" | "Selected" | "Regret"
) {
  const { data, error } = await supabase
    .from("users")
    .update({ admissionStatus: newStatus, updatedAt: new Date().toISOString() })
    .eq("applicationNumber", applicationNumber)
    .select();

  if (error) {
    console.error("Error updating admission status:", error);
    throw error;
  }
  return data;
}

// --- Realtime Subscriptions ---
export function subscribeAchieversSubmissions(callback: () => void) {
  try {
    const channel = supabase
      .channel("admin-users-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        callback();
      })
      .subscribe();
    return channel;
  } catch {
    return null;
  }
}

export function subscribeAchieversAnalytics(callback: () => void) {
  try {
    const channel = supabase
      .channel("admin-analytics-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "application_analytics_logs" }, () => {
        callback();
      })
      .subscribe();
    return channel;
  } catch {
    return null;
  }
}

export function subscribeAchieversPayments(callback: () => void) {
  try {
    const channel = supabase
      .channel("admin-payments-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "application_transactions" }, () => {
        callback();
      })
      .subscribe();
    return channel;
  } catch {
    return null;
  }
}

export function unsubscribeAchieversChannel(channel: any) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}
