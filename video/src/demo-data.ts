// DEMO DATA ONLY. Every name, email, and code in this file is fabricated for
// the video. The codes match the product format (12 characters, uppercase
// letters and digits, no lookalike characters) and authenticate nothing.
// Never replace these with values from a real account or a real screenshot.

export type DemoStudent = { name: string; email: string; code: string };

export const DEMO_TEACHER = {
  name: "Mr. O",
  footer: "Mr. O at UnpackMath",
  initials: "MO",
  plan: "FOUNDER",
};

export const DEMO_CLASS = {
  name: "1st period",
  joinCode: "R7MK4T",
  students: 9,
  attempts: 1,
};

export const DEMO_STUDENTS: DemoStudent[] = [
  { name: "James Smith", email: "james.smith@district.edu", code: "H4PW7NKR3TQ2" },
  { name: "Maria D. Garcia", email: "maria.garcia@district.edu", code: "M8ZC5VXD9BEP" },
  { name: "Belen Ramirez", email: "belen.ramirez@district.edu", code: "R2GT6HJF4YKN" },
  { name: "Benjamin K. Florez", email: "benjamin.florez@district.edu", code: "W9QN3PSA8DVX" },
];

// The student who signs in during scene 6.
export const SIGN_IN_STUDENT = DEMO_STUDENTS[0];

// What the teacher pastes, one student per line.
export const PASTED_LINES = DEMO_STUDENTS.map((s) => `${s.name}, ${s.email}`);
