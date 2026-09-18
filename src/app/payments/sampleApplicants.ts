import { withDemoDefaults } from "../apply/demoApplication";

export const applicants = [
  { firstName: "Ramu", lastName: "Kumar", course: "MEC", city: "Kamareddy" },
  { firstName: "Arjun", lastName: "Reddy", course: "MPC", city: "Hyderabad" },
  { firstName: "Kiran", lastName: "Sharma", course: "BiPC", city: "Warangal" },
  { firstName: "Rahul", lastName: "Rao", course: "CEC", city: "Karimnagar" },
  { firstName: "Aditya", lastName: "Varma", course: "ACE", city: "Nizamabad" },
  { firstName: "Sai", lastName: "Krishna", course: "MPC", city: "Siddipet" },
].map((person, index) => withDemoDefaults({
  ...person,
  applicationId: `AJC-INTER-2026-${String(19 + index).padStart(5, "0")}`,
  email: `${person.firstName}.${person.lastName}@example.com`.toLowerCase(),
  phone: `900000000${index}`,
}));
