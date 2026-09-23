import { pool } from "./lib/db.js"; // Note: this might fail since ts execution needs tsx, I'll use tsx

const sql = `
CREATE TABLE IF NOT EXISTS public.colleges (
  "collegeId" serial not null,
  "collegeName" character varying(200) not null,
  "collegeCode" character varying(255) null,
  address character varying(255) not null,
  "collegeEmail" character varying(150) not null,
  "countryCode" character varying(5) not null default '+91'::character varying,
  "phoneNumber" character varying(20) not null,
  country character varying(100) not null,
  state character varying(100) not null,
  city character varying(100) not null,
  pincode character varying(10) not null,
  "collegePublicId" character varying(30) null,
  "verificationProofUrl" character varying(255) null,
  is_active boolean null default true,
  is_verified boolean null default false,
  "createdAt" timestamp with time zone not null,
  "updatedAt" timestamp with time zone not null,
  "deletedAt" timestamp with time zone null,
  "alternateMobile" character varying(20) null default null::character varying,
  constraint colleges_pkey primary key ("collegeId")
);

CREATE TABLE IF NOT EXISTS public.college_education (
  "collegeEducationId" serial not null,
  "collegeEducationType" character varying(255) not null,
  "collegeId" integer not null,
  "createdBy" integer not null,
  "isActive" boolean null default true,
  "createdAt" timestamp with time zone not null,
  "updatedAt" timestamp with time zone not null,
  "deletedAt" timestamp with time zone null,
  constraint college_education_pkey primary key ("collegeEducationId")
);

CREATE TABLE IF NOT EXISTS public.college_branch (
  "collegeBranchId" serial not null,
  "collegeId" integer not null,
  "branchName" character varying(100) not null,
  "deletedAt" timestamp with time zone null,
  constraint college_branch_pkey primary key ("collegeBranchId")
);

CREATE TABLE IF NOT EXISTS public.college_course_admissions (
  "courseAdmissionId" serial not null,
  "collegeId" integer not null,
  "collegeBranchId" integer not null,
  "isAdmissionsOpen" boolean not null default false,
  "admissionFee" numeric(10, 2) not null default 0,
  "createdBy" integer not null,
  "createdAt" timestamp with time zone not null,
  "updatedAt" timestamp with time zone not null,
  "deletedAt" timestamp with time zone null,
  constraint college_course_admissions_pkey primary key ("courseAdmissionId")
);

CREATE TABLE IF NOT EXISTS public.college_admission_settings (
  "collegeAdmissionSettingsId" serial not null,
  "collegeId" integer not null,
  "isAdmissionsOpen" boolean not null default false,
  "createdBy" integer not null,
  "createdAt" timestamp with time zone not null,
  "updatedAt" timestamp with time zone not null,
  "deletedAt" timestamp with time zone null,
  constraint college_admission_settings_pkey primary key ("collegeAdmissionSettingsId")
);
`;

async function run() {
  try {
    await pool.query(sql);
    console.log("Tables created successfully");
    
    // Insert mock branch data since the user didn't provide college_branch inserts
    await pool.query(`
      INSERT INTO public.college_branch ("collegeBranchId", "collegeId", "branchName")
      VALUES 
      (81, 40, 'MPC'),
      (83, 40, 'BiPC'),
      (85, 40, 'MEC'),
      (87, 40, 'CEC'),
      (89, 40, 'ACE')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO public.college_course_admissions ("courseAdmissionId", "collegeId", "collegeBranchId", "isAdmissionsOpen", "admissionFee", "createdBy", "createdAt", "updatedAt")
      VALUES 
      (1, 40, 83, false, 500.00, 36, NOW(), NOW()),
      (2, 40, 81, false, 500.00, 36, NOW(), NOW()),
      (3, 40, 85, true, 500.00, 36, NOW(), NOW()),
      (4, 40, 87, true, 1000.00, 36, NOW(), NOW()),
      (5, 40, 89, true, 1000.00, 36, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO public.college_admission_settings ("collegeAdmissionSettingsId", "collegeId", "isAdmissionsOpen", "createdBy", "createdAt", "updatedAt")
      VALUES (1, 40, true, 36, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    console.log("Mock data inserted");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
