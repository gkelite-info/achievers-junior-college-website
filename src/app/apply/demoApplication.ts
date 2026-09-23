// Sample values for the UI preview; these are not a submitted application.
export const demoApplication: Record<string, string> = {
  applicationFor: "Intermediate First Year", course: "MEC",
  firstName: "Ramu", lastName: "Kumar", fatherName: "Raju", motherName: "Rani",
  gender: "Male", dateOfBirth: "2010-06-18", nationality: "Indian", category: "OBC",
  address: "H.No. 1-89, Teachers Colony", city: "Kamareddy", state: "Telangana",
  pinCode: "503111", phone: "9000000000", email: "ramu.kumar@example.com",
  registrationFee: "500", profileImage: "sample-student-profile.png",
  classXSchool: "Achievers High School", classXBoard: "State Board", classXYear: "2025",
  classXPercentage: "90", classXMedium: "English", classXCertificate: "Class-X-Certificate.pdf",
};

export function withDemoDefaults(details: Record<string, string>) {
  return { ...demoApplication, ...Object.fromEntries(Object.entries(details).filter(([, value]) => value.trim() !== "")) };
}
