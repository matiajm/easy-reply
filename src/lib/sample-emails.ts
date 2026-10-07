import type { StudentEmail } from "./types";

/** Fake students only. Never paste real student emails into the repo (FERPA). */
export const SAMPLE_EMAILS: StudentEmail[] = [
  {
    id: "e1",
    from: { name: "Maria Gonzalez", email: "maria.g@student.example" },
    course: "COP 2800",
    subject: "Extension on Lab 4?",
    receivedAt: "2026-10-06T15:20:00Z",
    body: "Hi Professor, I was sick with the flu most of last week and fell behind on Lab 4. Would it be possible to turn it in Monday instead of Thursday? Thank you so much, Maria.",
  },
  {
    id: "e2",
    from: { name: "Jordan Lee", email: "jordan.l@student.example" },
    course: "MAC 1105",
    subject: "Midterm question 7 grade",
    receivedAt: "2026-10-06T13:05:00Z",
    body: "Hi Professor Rivera, I think my answer on question 7 deserved full credit. I set up the problem correctly and only made a small mistake. Could you change my midterm to an 80? Thanks, Jordan.",
  },
  {
    id: "e3",
    from: { name: "Aaliyah Brown", email: "aaliyah.b@student.example" },
    course: "STA 2023",
    subject: "Missed Tuesday's exam, hospital note attached",
    receivedAt: "2026-10-05T09:40:00Z",
    body: "Professor, I was in the ER Tuesday and couldn't take the exam. My discharge paperwork is attached. Can I take a makeup? Thank you, Aaliyah.",
  },
  {
    id: "e4",
    from: { name: "Carlos Mendes", email: "carlos.m@student.example" },
    course: "MAC 1105",
    subject: "Please extend homework 5",
    receivedAt: "2026-10-05T08:10:00Z",
    body: "Hey professor, my work schedule has been crazy. Can I get more time for HW5? Same as last time. This is the third time I ask, sorry.",
  },
  {
    id: "e5",
    from: { name: "Tyler Nguyen", email: "tyler.n@student.example" },
    course: "CGS 1060",
    subject: "When are your office hours?",
    receivedAt: "2026-10-05T07:55:00Z",
    body: "Hi, what time are your office hours and where? I can't find it. Tyler",
  },
  {
    id: "e6",
    from: { name: "Mr. Daniels", email: "daniels@parent.example" },
    course: "STA 2023",
    subject: "My son's grade in your class",
    receivedAt: "2026-10-07T11:15:00Z",
    body: "Hello, I'm Marcus Daniels's father. He received a C on the last quiz and I think that's unfair. Please explain how it was graded and raise it.",
  },
  {
    id: "e7",
    from: { name: "Devon Clarke", email: "devon.c@student.example" },
    course: "MAC 1105",
    subject: "I can't keep doing this",
    receivedAt: "2026-10-07T11:42:00Z",
    body: "Hi professor, I'm sorry to write like this. I haven't been to class in a while and I honestly can't keep doing this. Everything is just too much right now.",
  },
];
