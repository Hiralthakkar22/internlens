// Fills the database with demo data so the app doesn't look empty.
// Run: npm run seed   (it deletes old InternLens data first)
//
// All company names are made up, so the demo numbers can't be mistaken
// for real information about real companies.

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../modules/users/user.model.js";
import { Company } from "../modules/companies/company.model.js";
import { Experience } from "../modules/experiences/experience.model.js";
import { slugify } from "../utils/slugify.js";

// Small seeded random generator: same seed -> same "random" data every time
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rand = makeRandom(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.floor(min + rand() * (max - min + 1));
const chance = (p) => rand() < p;
const pickSome = (arr, min, max) => {
  const copy = [...arr].sort(() => rand() - 0.5);
  return copy.slice(0, between(min, max));
};

// Each company has a "personality" so its report card tells a clear story
const COMPANIES = [
  { name: "Nexora Labs", city: "Ahmedabad", stipend: [20000, 30000], bond: 0, rounds: ["Online Test", "Technical", "Technical", "HR"], topics: ["DSA", "JavaScript", "React", "System Design"], difficulty: "Hard", roles: ["Full Stack", "Frontend"], select: 0.25 },
  { name: "Brightwave Technologies", city: "Ahmedabad", stipend: [8000, 12000], bond: 0.85, bondMonths: [18, 24], rounds: ["Online Test", "Technical", "HR"], topics: ["Aptitude", "SQL", "OOP", "Java"], difficulty: "Easy", roles: ["SDE", "QA / Testing"], select: 0.6 },
  { name: "Codecraft Infosystems", city: "Surat", stipend: [10000, 15000], bond: 0.5, bondMonths: [12, 12], rounds: ["Technical", "Machine Coding", "HR"], topics: ["JavaScript", "React", "Node.js", "MongoDB"], difficulty: "Medium", roles: ["Full Stack", "Backend"], select: 0.45 },
  { name: "Pixelmint Studio", city: "Surat", stipend: [12000, 18000], bond: 0, rounds: ["Machine Coding", "Technical", "Managerial"], topics: ["HTML/CSS", "JavaScript", "React", "Projects"], difficulty: "Medium", roles: ["Frontend"], select: 0.4 },
  { name: "Quantiva Systems", city: "Pune", stipend: [25000, 40000], bond: 0, rounds: ["Online Test", "Technical", "Technical", "Managerial", "HR"], topics: ["DSA", "Operating Systems", "Computer Networks", "System Design", "DBMS"], difficulty: "Hard", roles: ["SDE", "Backend"], select: 0.15 },
  { name: "Orbitstack Solutions", city: "Vadodara", stipend: [6000, 10000], bond: 0.7, bondMonths: [24, 36], rounds: ["Group Discussion", "Technical", "HR"], topics: ["Aptitude", "Java", "DBMS", "OOP"], difficulty: "Easy", roles: ["SDE", "Other"], select: 0.7 },
  { name: "Greenleaf Software", city: "Gandhinagar", stipend: [15000, 20000], bond: 0, rounds: ["Online Test", "Technical", "HR"], topics: ["DSA", "Python", "SQL", "Projects"], difficulty: "Medium", roles: ["Data / ML", "Backend"], select: 0.35 },
  { name: "Hexagon Byte", city: "Ahmedabad", stipend: [10000, 14000], bond: 0.3, bondMonths: [12, 18], rounds: ["Technical", "Technical", "HR"], topics: ["Node.js", "MongoDB", "JavaScript", "Git"], difficulty: "Medium", roles: ["Backend", "Full Stack"], select: 0.5 },
  { name: "Lumen Analytics", city: "Bengaluru", stipend: [30000, 45000], bond: 0, rounds: ["Online Test", "Technical", "Technical", "Managerial"], topics: ["DSA", "Python", "SQL", "Puzzles"], difficulty: "Hard", roles: ["Data / ML", "SDE"], select: 0.12 },
  { name: "Tidewater Digital", city: "Surat", stipend: [5000, 8000], bond: 0.9, bondMonths: [24, 24], rounds: ["Technical", "HR"], topics: ["HTML/CSS", "JavaScript", "SQL"], difficulty: "Easy", roles: ["Frontend", "Full Stack"], select: 0.75 },
  { name: "Vertex Cloudworks", city: "Pune", stipend: [20000, 25000], bond: 0, rounds: ["Online Test", "Machine Coding", "Technical", "HR"], topics: ["JavaScript", "React", "Node.js", "System Design", "Git"], difficulty: "Medium", roles: ["Full Stack", "Frontend"], select: 0.3 },
  { name: "Saffron Apps", city: "Ahmedabad", stipend: [10000, 15000], bond: 0.2, bondMonths: [6, 12], rounds: ["Technical", "Managerial", "HR"], topics: ["Projects", "JavaScript", "React", "OOP"], difficulty: "Medium", roles: ["Mobile", "Frontend"], select: 0.45 },
  { name: "Ironclad QA", city: "Vadodara", stipend: [7000, 10000], bond: 0.4, bondMonths: [12, 12], rounds: ["Online Test", "Technical", "HR"], topics: ["Aptitude", "SQL", "OOP"], difficulty: "Easy", roles: ["QA / Testing"], select: 0.55 },
  { name: "Northstar Fintech", city: "Gandhinagar", stipend: [25000, 35000], bond: 0, rounds: ["Online Test", "Technical", "Technical", "HR"], topics: ["DSA", "Java", "DBMS", "Computer Networks"], difficulty: "Hard", roles: ["Backend", "SDE"], select: 0.18 },
  { name: "Kitepath Edtech", city: "Remote", stipend: [12000, 16000], bond: 0, rounds: ["Machine Coding", "Technical"], topics: ["React", "JavaScript", "HTML/CSS", "Projects"], difficulty: "Medium", roles: ["Frontend", "Full Stack"], select: 0.4 },
  { name: "Marigold Infotech", city: "Surat", stipend: [0, 5000], bond: 0.6, bondMonths: [12, 24], rounds: ["Technical", "HR"], topics: ["Java", "SQL", "OOP"], difficulty: "Easy", roles: ["SDE", "Other"], select: 0.8 },
  { name: "Cobalt Robotics", city: "Bengaluru", stipend: [35000, 50000], bond: 0, rounds: ["Online Test", "Technical", "Technical", "Technical", "HR"], topics: ["DSA", "Operating Systems", "Python", "System Design", "Puzzles"], difficulty: "Hard", roles: ["SDE", "Data / ML"], select: 0.1 },
  { name: "Bluepine Web", city: "Ahmedabad", stipend: [8000, 12000], bond: 0, rounds: ["Machine Coding", "HR"], topics: ["HTML/CSS", "JavaScript", "React"], difficulty: "Easy", roles: ["Frontend"], select: 0.55 },
];

const ROUND_DETAILS = {
  "Online Test": [
    "60 min test on HackerRank. 20 aptitude MCQs and 2 coding questions (one array, one string).",
    "MCQs on output of JS code, SQL queries and 2 DSA problems. Camera was on the whole time.",
    "45 minutes, 3 coding questions. Easy one on two pointers, medium on hashing, hard one on DP. I solved 2.",
  ],
  Technical: [
    "Started with my resume projects. Asked how JWT login works in my project and where I store the token.",
    "Reverse a linked list, then find the first non-repeating character. Asked time and space complexity for both.",
    "Questions on event loop, promises vs async/await, closures. Then wrote a debounce function.",
    "DBMS: normalization, indexes, difference between SQL and NoSQL. One SQL query with GROUP BY and HAVING.",
    "OOP pillars with real examples. Difference between abstract class and interface. Then a simple design question.",
    "React: useEffect dependency array, why keys in lists, controlled vs uncontrolled inputs. Built a small counter with props.",
    "OS and CN basics: process vs thread, deadlock, what happens when you type a URL in the browser.",
  ],
  "Machine Coding": [
    "Build a todo app with filter (all / done / pending) in 90 minutes. They checked folder structure and naming.",
    "Make a REST API for a notes app with Express and MongoDB. Bonus for validation and error handling.",
    "Clone a given UI (product card grid) in React, responsive. Then asked me to add search.",
  ],
  "Group Discussion": [
    "Topic was 'Is AI replacing freshers?'. 8 people, 15 minutes. They wanted clear points, not loud ones.",
  ],
  Managerial: [
    "Talked about a time I was stuck in a project and how I solved it. Asked why this company and where I see myself.",
    "Discussion on how I would plan a feature with a deadline. Very friendly round.",
  ],
  HR: [
    "Basic HR: introduce yourself, strengths, relocation, stipend expectation. They explained the bond clearly here.",
    "Short round about joining date and documents. Asked if I am fine with onsite work.",
  ],
};

const TIPS = [
  "Know your own projects end to end. Most questions came from what I wrote on my resume.",
  "Practice JS output questions, they love closures and hoisting.",
  "Ask about the bond in the HR round itself, it was mentioned only in the offer letter otherwise.",
  "Revise SQL joins and GROUP BY. Easy marks if you are ready.",
  "Do at least 50 easy/medium problems on arrays and strings before the online test.",
  "Be honest when you don't know something. The interviewer gave hints when I said I was not sure.",
  "Keep your GitHub clean, they opened it during the interview.",
  "",
];

const ROLE_TITLES = {
  "Full Stack": ["MERN Stack Intern", "Full Stack Developer Intern"],
  Frontend: ["React Developer Intern", "Frontend Intern"],
  Backend: ["Node.js Intern", "Backend Developer Intern"],
  SDE: ["Software Engineer Intern", "SDE Intern"],
  Mobile: ["Flutter Intern", "React Native Intern"],
  "Data / ML": ["Data Analyst Intern", "ML Intern"],
  "QA / Testing": ["QA Intern", "Automation Testing Intern"],
  Other: ["Trainee Engineer", "IT Intern"],
};

const MEMBERS = [
  { name: "Riya Shah", college: "VNSGU, Surat" },
  { name: "Aarav Mehta", college: "Gujarat University" },
  { name: "Diya Patel", college: "SVNIT, Surat" },
  { name: "Kabir Desai", college: "Nirma University" },
  { name: "Ishita Joshi", college: "MSU Baroda" },
  { name: "Yash Rana", college: "VNSGU, Surat" },
  { name: "Nisha Trivedi", college: "LD College of Engineering" },
  { name: "Harsh Vora", college: "DAIICT, Gandhinagar" },
];

function buildExperience(profile, companyId, authorId, monthsAgo) {
  const roleType = pick(profile.roles);
  const hasBond = chance(profile.bond);
  const outcomeRoll = rand();
  const outcome =
    outcomeRoll < profile.select ? "Selected" : outcomeRoll < 0.85 ? "Rejected" : pick(["Waiting", "No response"]);

  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - monthsAgo);

  // most people follow the usual process, a few skip or add a round
  let roundTypes = [...profile.rounds];
  if (chance(0.2) && roundTypes.length > 2) roundTypes.splice(between(1, roundTypes.length - 2), 1);

  const difficulties = ["Easy", "Medium", "Hard"];
  const base = difficulties.indexOf(profile.difficulty);
  const diffIndex = Math.min(2, Math.max(0, base + (chance(0.25) ? pick([-1, 1]) : 0)));

  const [minS, maxS] = profile.stipend;
  const stipend = chance(0.1) ? null : Math.round(between(minS, maxS) / 1000) * 1000;

  const createdAt = new Date(date.getTime() + between(5, 25) * 24 * 60 * 60 * 1000);

  return {
    company: companyId,
    author: authorId,
    anonymous: chance(0.25),
    roleTitle: pick(ROLE_TITLES[roleType]),
    roleType,
    location: profile.city,
    workMode: profile.city === "Remote" ? "Remote" : pick(["Onsite", "Onsite", "Onsite", "Hybrid"]),
    source: pick(["Off-campus", "Off-campus", "On-campus", "Referral"]),
    interviewDate: date,
    rounds: roundTypes.map((type) => ({ type, details: pick(ROUND_DETAILS[type]) })),
    topics: pickSome(profile.topics, 2, profile.topics.length),
    difficulty: difficulties[diffIndex],
    tips: pick(TIPS),
    stipend,
    hasBond,
    bondMonths: hasBond ? between(...profile.bondMonths) : 0,
    outcome,
    daysToResult: outcome === "Waiting" || outcome === "No response" ? null : between(3, 25),
    createdAt: createdAt > new Date() ? new Date() : createdAt,
  };
}

async function seed() {
  await connectDB();

  console.log("Clearing old data...");
  await Promise.all([User.deleteMany({}), Company.deleteMany({}), Experience.deleteMany({})]);

  const admin = await User.create({
    name: "Admin",
    email: "admin@internlens.dev",
    password: "Admin@1234",
    college: "InternLens",
    role: "admin",
  });
  const demo = await User.create({
    name: "Demo Student",
    email: "demo@internlens.dev",
    password: "Demo@1234",
    college: "VNSGU, Surat",
  });
  const members = await User.create(
    MEMBERS.map((m, i) => ({ ...m, email: `${slugify(m.name)}${i}@example.com`, password: "Member@1234" }))
  );
  const authors = [demo, ...members];
  console.log(`${authors.length + 1} users created`);

  const companies = await Company.create(
    COMPANIES.map((c) => ({ name: c.name, city: c.city, slug: slugify(c.name), createdBy: admin._id }))
  );
  console.log(`${companies.length} companies created`);

  const experiences = [];
  COMPANIES.forEach((profile, i) => {
    const count = between(3, 8);
    for (let n = 0; n < count; n++) {
      experiences.push({
        ...buildExperience(profile, companies[i]._id, pick(authors)._id, between(0, 11)),
        status: "approved",
      });
    }
  });

  // a few posts waiting in the admin queue
  for (let n = 0; n < 4; n++) {
    const i = between(0, COMPANIES.length - 1);
    experiences.push({
      ...buildExperience(COMPANIES[i], companies[i]._id, pick(authors)._id, between(0, 2)),
      status: "pending",
      createdAt: new Date(),
    });
  }

  // random upvotes from members
  for (const e of experiences) {
    if (e.status !== "approved") continue;
    const voters = pickSome(authors, 0, Math.min(6, authors.length)).map((u) => u._id);
    e.upvotes = voters;
    e.upvoteCount = voters.length;
  }

  // insertMany keeps our createdAt dates (create() would overwrite them)
  await Experience.insertMany(experiences);
  const approved = experiences.filter((e) => e.status === "approved").length;
  console.log(`${approved} approved and ${experiences.length - approved} pending experiences created`);

  console.log("\nLogin with:");
  console.log("  admin@internlens.dev / Admin@1234  (admin)");
  console.log("  demo@internlens.dev  / Demo@1234   (student)");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
