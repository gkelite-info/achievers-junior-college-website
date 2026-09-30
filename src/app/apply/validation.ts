export type FormErrors = Partial<Record<string, string>>;

/**
 * Formats a name field (First Name, Last Name, Father's Name, Mother's Name):
 * - Starts with a capital letter
 * - If user types small letter, converted to capital
 * - Accepts only English letters, dots (.), and spaces
 * - No digits, no special characters
 * - After space or dot, 1st letter will be capital
 */
export function formatName(val: string): string {
  // Strip leading spaces and dots
  let res = val.replace(/^[\s.]+/, "");
  // Allow only letters, dots, and spaces
  res = res.replace(/[^A-Za-z. ]/g, "");
  // Prevent consecutive dots or spaces
  res = res.replace(/\.{2,}/g, ".");
  res = res.replace(/ {2,}/g, " ");
  // Capitalize first letter of string and any letter after space or dot
  return res.replace(/(^|[\s.])([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
}

/**
 * Formats State and City:
 * - Starts with a capital letter
 * - Accepts only English letters and spaces
 * - After space, 1st letter will be capital
 * - No digits, no special characters, no dots
 */
export function formatTitleCase(val: string): string {
  let res = val.replace(/^\s+/, "");
  res = res.replace(/[^A-Za-z ]/g, "");
  res = res.replace(/ {2,}/g, " ");
  return res.replace(/(^|\s)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
}

/**
 * Formats School Name and Board:
 * - Starts with a capital letter
 * - After space or dot, 1st letter will be capital
 * - Accepts only English letters, dots, and spaces
 * - No integers, no digits, no special characters
 */
export function formatSchoolOrBoard(val: string): string {
  let res = val.replace(/^[\s.]+/, "");
  res = res.replace(/[^A-Za-z. ]/g, "");
  res = res.replace(/\.{2,}/g, ".");
  res = res.replace(/ {2,}/g, " ");
  return res.replace(/(^|[\s.])([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
}

/**
 * Formats Address:
 * - Accepts only letters, numbers, spaces, hyphens, commas, and dots
 */
export function formatAddress(val: string): string {
  return val.replace(/[^A-Za-z0-9\s.,-]/g, "");
}

/**
 * Formats numeric/digit inputs (Phone: 10, Passing Year: 4, Percentage: 2, PinCode: 6):
 * - Strips all non-digit characters
 * - Limits to maxLength
 */
export function formatDigitsOnly(val: string, maxLength: number): string {
  return val.replace(/\D/g, "").slice(0, maxLength);
}

/**
 * Validates a name string:
 * - Must start with a capital letter
 * - Must contain only letters, dots, and spaces (no digits, no special characters)
 * - Must contain at least one letter
 * - Length between minLen and maxLen
 * - Every word after space must start with a capital letter
 */
function validateNameField(val: string | undefined, fieldName: string, minLen = 2, maxLen = 50): string | null {
  const trimmed = (val || "").trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLen) {
    return `${fieldName} must be at least ${minLen} characters.`;
  }
  if (trimmed.length > maxLen) {
    return `${fieldName} cannot exceed ${maxLen} characters.`;
  }
  // Check for digits or special characters
  if (!/^[A-Za-z.\s]+$/.test(trimmed) || !/[A-Za-z]/.test(trimmed)) {
    return `${fieldName} should contain only letters and dots (no numbers or special characters).`;
  }
  // Must start with capital letter
  if (!/^[A-Z]/.test(trimmed)) {
    return `${fieldName} must start with a capital letter.`;
  }
  // After space, 1st letter must be capital
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordsValid = words.every((w) => /^[A-Z]/.test(w) || /^\.[A-Z]/.test(w));
  if (!wordsValid) {
    return `Words in ${fieldName.toLowerCase()} must start with a capital letter.`;
  }
  return null;
}

/**
 * Validates State or City:
 * - Must start with a capital letter
 * - Only letters and spaces allowed
 * - Min 2 chars
 * - Every word after space must start with a capital letter
 */
function validatePlaceField(val: string | undefined, fieldName: string, minLen = 2, maxLen = 50): string | null {
  const trimmed = (val || "").trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLen) {
    return `${fieldName} must be at least ${minLen} characters.`;
  }
  if (trimmed.length > maxLen) {
    return `${fieldName} cannot exceed ${maxLen} characters.`;
  }
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return `${fieldName} should contain only letters (no numbers or special characters).`;
  }
  if (!/^[A-Z]/.test(trimmed)) {
    return `${fieldName} must start with a capital letter.`;
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordsValid = words.every((w) => /^[A-Z]/.test(w));
  if (!wordsValid) {
    return `Words in ${fieldName.toLowerCase()} must start with a capital letter.`;
  }
  return null;
}

/**
 * Validates School Name or Board:
 * - Starts with a capital letter
 * - Letters, dots, and spaces only (no digits, no special characters)
 * - Words after space start with capital letter
 */
function validateSchoolOrBoardField(val: string | undefined, fieldName: string, minLen = 2, maxLen = 100): string | null {
  const trimmed = (val || "").trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLen) {
    return `${fieldName} must be at least ${minLen} characters.`;
  }
  if (trimmed.length > maxLen) {
    return `${fieldName} cannot exceed ${maxLen} characters.`;
  }
  if (!/^[A-Za-z.\s]+$/.test(trimmed) || !/[A-Za-z]/.test(trimmed)) {
    return `${fieldName} should contain only letters (no numbers or special characters).`;
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

export function validateApplication(
  values: Record<string, string>,
  initialDetails?: Record<string, string>,
  files?: { profileImage?: File; classXCertificate?: File }
): FormErrors {
  const errors: FormErrors = {};

  // 1. Application For
  if (!values.applicationFor || !values.applicationFor.trim()) {
    errors.applicationFor = "Please select Application For.";
  }

  // 2. Course
  if (!values.course || !values.course.trim()) {
    errors.course = "Please select a Course.";
  }

  // 3. First Name
  const fnErr = validateNameField(values.firstName, "First name", 2, 50);
  if (fnErr) errors.firstName = fnErr;

  // 4. Last Name
  const lnErr = validateNameField(values.lastName, "Last name", 1, 50);
  if (lnErr) errors.lastName = lnErr;

  // 5. Father's Name
  const fatErr = validateNameField(values.fatherName, "Father’s name", 2, 100);
  if (fatErr) errors.fatherName = fatErr;

  // 6. Mother's Name
  const motErr = validateNameField(values.motherName, "Mother’s name", 2, 100);
  if (motErr) errors.motherName = motErr;

  // 7. Gender
  if (!values.gender || !values.gender.trim()) {
    errors.gender = "Please select a gender.";
  }

  // 8. Date of Birth
  const dob = (values.dateOfBirth || "").trim();
  if (!dob) {
    errors.dateOfBirth = "Date of birth is required.";
  } else {
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    } else if (dobDate.getTime() > Date.now()) {
      errors.dateOfBirth = "Date of birth cannot be in the future.";
    } else {
      const ageYears = (Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageYears < 13) {
        errors.dateOfBirth = "Applicant must be at least 13 years old for admission.";
      } else if (ageYears > 35) {
        errors.dateOfBirth = "Please enter a valid date of birth.";
      }
    }
  }

  // 9. Nationality
  if (!values.nationality || !values.nationality.trim()) {
    errors.nationality = "Please select nationality.";
  }

  // 10. Category
  if (!values.category || !values.category.trim()) {
    errors.category = "Please select caste category.";
  }

  // 11. Address
  const address = (values.address || "").trim();
  if (!address) {
    errors.address = "Postal address is required.";
  } else if (address.length < 8) {
    errors.address = "Address must be at least 8 characters long.";
  } else if (/[^A-Za-z0-9\s.,-]/.test(address)) {
    errors.address = "Address can only contain letters, numbers, spaces, hyphens (-), commas (,), and dots (.).";
  }

  // 12. State
  const stErr = validatePlaceField(values.state, "State", 2, 50);
  if (stErr) errors.state = stErr;

  // 13. City
  const ctErr = validatePlaceField(values.city, "City", 2, 50);
  if (ctErr) errors.city = ctErr;

  // 14. Pin Code
  const pinCode = (values.pinCode || "").trim();
  if (!pinCode) {
    errors.pinCode = "Pin code is required.";
  } else if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
    errors.pinCode = "Enter a valid 6-digit pin code (e.g. 503111).";
  }

  // 15. Phone (10 digits only)
  const rawPhone = (values.phone || "").trim().replace(/[\s-]/g, "");
  const digitsOnlyPhone = rawPhone.replace(/\D/g, "");
  if (!rawPhone) {
    errors.phone = "Contact number is required.";
  } else if (rawPhone.length !== 10 || !/^\d{10}$/.test(digitsOnlyPhone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  // 16. Email
  const email = (values.email || "").trim();
  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address (e.g. student@example.com).";
  }

  // 17. Profile Image
  const hasProfile = Boolean(files?.profileImage && files.profileImage.size > 0) || Boolean(initialDetails?.profileImage);
  if (!hasProfile) {
    errors.profileImage = "Profile photo (JPG/JPEG) is required.";
  } else if (files?.profileImage && files.profileImage.size > 0) {
    const file = files.profileImage;
    if (!/\.(jpe?g)$/i.test(file.name) || (file.type && file.type !== "image/jpeg")) {
      errors.profileImage = "Choose a JPG or JPEG image.";
    } else if (file.size > 5 * 1024 * 1024) {
      errors.profileImage = "Profile image must be smaller than 5 MB.";
    }
  }

  // 18. Educational Qualification - Class X School
  const schErr = validateSchoolOrBoardField(values.classXSchool, "School name", 3, 100);
  if (schErr) errors.classXSchool = schErr;

  // 19. Educational Qualification - Class X Board
  const brdErr = validateSchoolOrBoardField(values.classXBoard, "Board name", 2, 50);
  if (brdErr) errors.classXBoard = brdErr;

  // 20. Educational Qualification - Class X Year (4 digits only)
  const rawYear = (values.classXYear || "").trim();
  if (!rawYear) {
    errors.classXYear = "Passing year is required.";
  } else if (!/^\d{4}$/.test(rawYear)) {
    errors.classXYear = "Enter a valid 4-digit passing year.";
  }

  // 21. Educational Qualification - Class X Percentage (only 2 digits)
  const rawPct = (values.classXPercentage || "").trim();
  const pctStr = rawPct.replace(/%/g, "").trim();
  if (!rawPct) {
    errors.classXPercentage = "Percentage is required.";
  } else if (!/^\d{2}$/.test(pctStr)) {
    errors.classXPercentage = "Enter a valid 2-digit percentage.";
  }

  // 22. Educational Qualification - Class X Medium
  if (!values.classXMedium || !values.classXMedium.trim()) {
    errors.classXMedium = "Select medium of instruction.";
  }

  // 23. Educational Qualification - Class X Certificate
  const hasCertificate = Boolean(files?.classXCertificate && files.classXCertificate.size > 0) || Boolean(initialDetails?.classXCertificate);
  if (!hasCertificate) {
    errors.classXCertificate = "Class X certificate (PDF) is required.";
  } else if (files?.classXCertificate && files.classXCertificate.size > 0) {
    const file = files.classXCertificate;
    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
      errors.classXCertificate = "Choose a PDF certificate file.";
    } else if (file.size > 5 * 1024 * 1024) {
      errors.classXCertificate = "Certificate must be smaller than 5 MB.";
    }
  }

  return errors;
}
