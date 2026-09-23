export type FormErrors = Partial<Record<string, string>>;

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
  const firstName = (values.firstName || "").trim();
  if (!firstName) {
    errors.firstName = "First name is required.";
  } else if (!/^[A-Za-z\s.]{2,50}$/.test(firstName)) {
    errors.firstName = "First name should contain only letters (min 2 characters).";
  }

  // 4. Last Name
  const lastName = (values.lastName || "").trim();
  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (!/^[A-Za-z\s.]{1,50}$/.test(lastName)) {
    errors.lastName = "Last name should contain only letters.";
  }

  // 5. Father's Name
  const fatherName = (values.fatherName || "").trim();
  if (!fatherName) {
    errors.fatherName = "Father’s name is required.";
  } else if (!/^[A-Za-z\s.]{2,100}$/.test(fatherName)) {
    errors.fatherName = "Father’s name should contain only letters (min 2 characters).";
  }

  // 6. Mother's Name
  const motherName = (values.motherName || "").trim();
  if (!motherName) {
    errors.motherName = "Mother’s name is required.";
  } else if (!/^[A-Za-z\s.]{2,100}$/.test(motherName)) {
    errors.motherName = "Mother’s name should contain only letters (min 2 characters).";
  }

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
  }

  // 12. State
  const state = (values.state || "").trim();
  if (!state) {
    errors.state = "State is required.";
  } else if (!/^[A-Za-z\s]{2,50}$/.test(state)) {
    errors.state = "Enter a valid state name.";
  }

  // 13. City
  const city = (values.city || "").trim();
  if (!city) {
    errors.city = "City is required.";
  } else if (!/^[A-Za-z\s]{2,50}$/.test(city)) {
    errors.city = "Enter a valid city name.";
  }

  // 14. Pin Code
  const pinCode = (values.pinCode || "").trim();
  if (!pinCode) {
    errors.pinCode = "Pin code is required.";
  } else if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
    errors.pinCode = "Enter a valid 6-digit pin code (e.g. 503111).";
  }

  // 15. Phone
  const phone = (values.phone || "").trim().replace(/[\s-]/g, "");
  if (!phone) {
    errors.phone = "Contact number is required.";
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
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
  const school = (values.classXSchool || "").trim();
  if (!school) {
    errors.classXSchool = "School name is required.";
  } else if (school.length < 3) {
    errors.classXSchool = "Enter a valid school name (at least 3 characters).";
  }

  // 19. Educational Qualification - Class X Board
  const board = (values.classXBoard || "").trim();
  if (!board) {
    errors.classXBoard = "Board name is required (e.g. State Board, CBSE).";
  } else if (board.length < 2) {
    errors.classXBoard = "Enter a valid board name.";
  }

  // 20. Educational Qualification - Class X Year
  const yearStr = (values.classXYear || "").trim();
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();
  if (!yearStr) {
    errors.classXYear = "Passing year is required.";
  } else if (!/^\d{4}$/.test(yearStr) || isNaN(year) || year < 1990 || year > currentYear) {
    errors.classXYear = `Enter a valid 4-digit passing year (1990 - ${currentYear}).`;
  }

  // 21. Educational Qualification - Class X Percentage
  const pctStr = (values.classXPercentage || "").trim();
  const pct = parseFloat(pctStr);
  if (!pctStr) {
    errors.classXPercentage = "Percentage is required.";
  } else if (!/^\d+(\.\d+)?$/.test(pctStr) || isNaN(pct) || pct < 0 || pct > 100) {
    errors.classXPercentage = "Enter a valid percentage (0 - 100).";
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
