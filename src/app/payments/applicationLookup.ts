export function findApplication(applicants: Record<string, string>[], applicationNumber: string, mobileNumber: string, dateOfBirth: string) {
  const id = applicationNumber.trim().toUpperCase();
  const phone = mobileNumber.replace(/[\s()-]/g, "");
  if ((!id && !phone) || !dateOfBirth) return undefined;
  return applicants.find((person) =>
    (!id || person.applicationId.toUpperCase() === id) &&
    (!phone || person.phone === phone) &&
    person.dateOfBirth === dateOfBirth
  );
}
