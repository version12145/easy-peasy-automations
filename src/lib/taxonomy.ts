/**
 * Fixed content taxonomy for VEducate Academy.
 *
 * Categories = a small, stable set of content pillars.
 * Tags       = dynamic (technologies, frameworks, companies, tools, skills).
 *
 * The frontend enforces this pillar list: only WordPress categories whose
 * slug matches one of the pillars below appear in the primary navigation,
 * homepage sections, and the /categories browser. Editors add tags freely
 * in WordPress and they surface through search, filtering, and article pages.
 */

export type Pillar = {
  /** Canonical WordPress category slug and accepted aliases. */
  slugs: string[];
  name: string;
  description: string;
  /** Sub-topics used as chips on category / pillar detail views. */
  subtopics: string[];
};

export const PILLARS: Pillar[] = [
  {
    slugs: ["artificial-intelligence", "ai"],
    name: "Artificial Intelligence",
    description:
      "Generative AI, machine learning, LLMs, prompt engineering, AI tools and research.",
    subtopics: [
      "Generative AI",
      "Machine Learning",
      "Deep Learning",
      "LLMs",
      "Prompt Engineering",
      "AI Tools",
      "AI Research",
    ],
  },
  {
    slugs: ["programming"],
    name: "Programming",
    description:
      "Software development across backend, frontend, mobile, algorithms and best practices.",
    subtopics: [
      "Software Development",
      "Backend",
      "Frontend",
      "Mobile Development",
      "Algorithms",
      "Data Structures",
      "Best Practices",
    ],
  },
  {
    slugs: ["cloud-devops", "cloud-and-devops", "cloud", "devops"],
    name: "Cloud & DevOps",
    description:
      "AWS, Azure, GCP, Docker, Kubernetes, CI/CD and modern infrastructure workflows.",
    subtopics: [
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Infrastructure",
      "DevOps",
    ],
  },
  {
    slugs: ["cybersecurity", "security"],
    name: "Cybersecurity",
    description:
      "Ethical hacking, network security, SOC operations, forensics and secure engineering.",
    subtopics: [
      "Ethical Hacking",
      "Network Security",
      "SOC",
      "Penetration Testing",
      "Digital Forensics",
      "Security Best Practices",
    ],
  },
  {
    slugs: ["data-science", "data"],
    name: "Data Science",
    description:
      "Analytics, visualization, big data, data engineering, statistics and BI.",
    subtopics: [
      "Analytics",
      "Visualization",
      "Big Data",
      "Data Engineering",
      "Statistics",
      "Business Intelligence",
    ],
  },
  {
    slugs: ["engineering"],
    name: "Engineering",
    description:
      "Software and systems engineering, electronics, mechanical, civil, IoT and robotics.",
    subtopics: [
      "Software Engineering",
      "System Design",
      "Electronics",
      "Mechanical",
      "Civil",
      "IoT",
      "Robotics",
    ],
  },
  {
    slugs: ["education-edtech", "education-and-edtech", "edtech", "education"],
    name: "Education & EdTech",
    description:
      "Learning, AI in education, digital classrooms, teaching and educational technology.",
    subtopics: [
      "Learning",
      "AI in Education",
      "Digital Learning",
      "Teaching",
      "Online Education",
      "Educational Technology",
    ],
  },
  {
    slugs: ["careers-placements", "careers-and-placements", "careers", "placements"],
    name: "Careers & Placements",
    description:
      "On-campus and off-campus placements, interview prep, resumes and career guidance.",
    subtopics: [
      "On-Campus Placements",
      "Off-Campus Placements",
      "Placement Preparation",
      "Interview Experience",
      "Resume Building",
      "Career Guidance",
    ],
  },
  {
    slugs: ["internships"],
    name: "Internships",
    description:
      "Opportunities, application prep, experiences and virtual & summer internships.",
    subtopics: [
      "Internship Opportunities",
      "Internship Preparation",
      "Internship Experience",
      "Virtual Internships",
      "Summer Internships",
    ],
  },
  {
    slugs: ["industry-news", "news"],
    name: "Industry News",
    description:
      "Technology news, company announcements, product launches and startup updates.",
    subtopics: [
      "Technology News",
      "Company Announcements",
      "Product Launches",
      "AI Industry Updates",
      "Startup News",
      "Enterprise Technology",
    ],
  },
  {
    slugs: ["events-hackathons", "events-and-hackathons", "events", "hackathons"],
    name: "Events & Hackathons",
    description:
      "Hackathons, workshops, conferences, competitions and community tech events.",
    subtopics: [
      "Hackathons",
      "Workshops",
      "Conferences",
      "Tech Events",
      "Competitions",
    ],
  },
];

const SLUG_TO_PILLAR = new Map<string, Pillar>();
for (const p of PILLARS) for (const s of p.slugs) SLUG_TO_PILLAR.set(s, p);

export function isPillarSlug(slug: string): boolean {
  return SLUG_TO_PILLAR.has(slug);
}

export function getPillarForSlug(slug: string): Pillar | undefined {
  return SLUG_TO_PILLAR.get(slug);
}

export function pillarOrder(slug: string): number {
  const p = SLUG_TO_PILLAR.get(slug);
  if (!p) return 999;
  return PILLARS.indexOf(p);
}

/**
 * Keep only WP categories that match a pillar slug (or alias), and sort them
 * according to the taxonomy order above.
 */
export function filterAndOrderPillarCategories<T extends { slug: string }>(cats: T[]): T[] {
  return cats
    .filter((c) => isPillarSlug(c.slug))
    .sort((a, b) => pillarOrder(a.slug) - pillarOrder(b.slug));
}
