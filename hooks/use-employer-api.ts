import { useState, useEffect, useCallback, useMemo } from "react";
import { Job } from "@/lib/db/db.types";
import { useAuthContext } from "@/app/hire/authctx";

// Fake Google job listings data
const FAKE_GOOGLE_JOBS: Job[] = [
  {
    id: "google-job-1",
    title: "Software Engineering Intern",
    description: `# Software Engineering Intern - Google

Join Google's world-class engineering team and work on products used by billions of people worldwide.

## What you'll do:
- Develop and maintain large-scale distributed systems
- Collaborate with senior engineers on cutting-edge projects
- Write clean, efficient, and well-tested code
- Participate in code reviews and design discussions
- Learn from the best engineers in the industry

## Technologies you'll work with:
- Python, Java, C++, JavaScript
- Google Cloud Platform
- Kubernetes and Docker
- Machine Learning frameworks
- Big Data processing tools

This is an excellent opportunity to gain hands-on experience with technologies that power Google's products and services.`,
    location: "Mountain View, CA",
    salary: "$8,000",
    salary_freq: 1, // Monthly
    mode: 1, // Hybrid
    type: 0, // Internship
    requirements: [
      "Currently pursuing a Bachelor's or Master's degree in Computer Science or related field",
      "Strong programming skills in at least one language (Python, Java, C++)",
      "Understanding of data structures and algorithms",
      "Experience with version control systems (Git)",
      "Strong problem-solving and analytical skills"
    ],
    keywords: ["software engineering", "internship", "programming", "python", "java"],
    created_at: "2024-05-15T10:00:00Z",
    updated_at: "2024-06-01T14:30:00Z",
    employer: {
      id: "google-employer-1",
      name: "Google",
      industry: "Technology",
      description: "Google LLC is a multinational technology company"
    }
  },
  {
    id: "google-job-2",
    title: "Data Science Intern",
    description: `# Data Science Intern - Google

Work with Google's massive datasets and cutting-edge machine learning technologies to solve real-world problems.

## What you'll do:
- Analyze large datasets to extract meaningful insights
- Build and deploy machine learning models
- Create data visualizations and reports
- Collaborate with product teams to influence decision-making
- Present findings to stakeholders

## Required Skills:
- Python, R, SQL
- Machine Learning frameworks (TensorFlow, PyTorch)
- Statistical analysis and hypothesis testing
- Data visualization tools
- Big data technologies

Join us in shaping the future of data-driven decision making at Google!`,
    location: "Makati City, Philippines",
    salary: "₱45,000",
    salary_freq: 1, // Monthly
    mode: 2, // Remote
    type: 0, // Internship
    requirements: [
      "Currently pursuing a degree in Data Science, Statistics, Computer Science, or related field",
      "Proficiency in Python or R for data analysis",
      "Experience with SQL and database management",
      "Knowledge of machine learning algorithms and statistical methods",
      "Strong analytical and problem-solving skills"
    ],
    keywords: ["data science", "machine learning", "python", "analytics", "internship"],
    created_at: "2024-05-20T08:00:00Z",
    updated_at: "2024-06-05T16:45:00Z",
    employer: {
      id: "google-employer-1",
      name: "Google",
      industry: "Technology",
      description: "Google LLC is a multinational technology company"
    }
  },
  {
    id: "google-job-3",
    title: "Product Management Intern",
    description: `# Product Management Intern - Google

Join Google's product team and help shape the next generation of products that impact billions of users worldwide.

## Responsibilities:
- Conduct market research and competitive analysis
- Work with engineering teams to define product requirements
- Analyze user feedback and product metrics
- Assist in product roadmap planning
- Collaborate with cross-functional teams

## What we're looking for:
- Strong analytical and strategic thinking skills
- Excellent communication and presentation abilities
- Interest in technology and user experience
- Data-driven approach to problem-solving
- Leadership potential and teamwork skills

This role offers exposure to product strategy, user research, and product development processes at one of the world's leading tech companies.`,
    location: "Singapore",
    salary: "S$4,500",
    salary_freq: 1, // Monthly
    mode: 1, // Hybrid
    type: 0, // Internship
    requirements: [
      "Currently pursuing a degree in Business, Engineering, Computer Science, or related field",
      "Strong analytical and problem-solving skills",
      "Excellent written and verbal communication skills",
      "Interest in technology products and user experience",
      "Previous internship or project experience preferred"
    ],
    keywords: ["product management", "strategy", "analytics", "internship", "technology"],
    created_at: "2024-05-25T12:00:00Z",
    updated_at: "2024-06-08T11:20:00Z",
    employer: {
      id: "google-employer-1",
      name: "Google",
      industry: "Technology",
      description: "Google LLC is a multinational technology company"
    }
  },
  {
    id: "google-job-4",
    title: "UX Design Intern",
    description: `# UX Design Intern - Google

Create intuitive and delightful user experiences for Google's products used by billions of people around the world.

## What you'll do:
- Design user interfaces for web and mobile applications
- Conduct user research and usability testing
- Create wireframes, prototypes, and high-fidelity designs
- Collaborate with product managers and engineers
- Present design concepts to stakeholders

## Tools you'll use:
- Figma, Sketch, Adobe Creative Suite
- Prototyping tools (InVision, Principle)
- User research methodologies
- Design systems and component libraries
- HTML/CSS for implementation

Join our design team and help make technology more accessible and enjoyable for everyone!`,
    location: "Mountain View, CA",
    salary: "$7,500",
    salary_freq: 1, // Monthly
    mode: 0, // In-person
    type: 0, // Internship
    requirements: [
      "Currently pursuing a degree in Design, HCI, or related field",
      "Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)",
      "Understanding of user-centered design principles",
      "Portfolio demonstrating design process and thinking",
      "Basic knowledge of HTML/CSS is a plus"
    ],
    keywords: ["ux design", "ui design", "user experience", "figma", "internship"],
    created_at: "2024-06-01T09:30:00Z",
    updated_at: "2024-06-10T13:15:00Z",
    employer: {
      id: "google-employer-1",
      name: "Google",
      industry: "Technology",
      description: "Google LLC is a multinational technology company"
    }
  },
  {
    id: "google-job-5",
    title: "Marketing Analyst Intern",
    description: `# Marketing Analyst Intern - Google

Help Google understand market trends and optimize marketing strategies for our products and services.

## Key Responsibilities:
- Analyze marketing campaign performance and ROI
- Create reports and dashboards for marketing teams
- Conduct market research and competitive analysis
- Support digital marketing initiatives
- Work with large datasets to identify trends and insights

## Skills & Requirements:
- Google Analytics, Google Ads, and marketing tools
- Excel/Google Sheets proficiency
- Basic knowledge of SQL and data analysis
- Understanding of digital marketing concepts
- Strong attention to detail and analytical mindset

This is a great opportunity to gain experience in digital marketing and data analysis at one of the world's most innovative companies.`,
    location: "Makati City, Philippines",
    salary: "₱35,000",
    salary_freq: 1, // Monthly
    mode: 2, // Remote
    type: 0, // Internship
    requirements: [
      "Currently pursuing a degree in Marketing, Business, Economics, or related field",
      "Experience with Google Analytics and digital marketing tools",
      "Proficiency in Excel/Google Sheets",
      "Basic SQL knowledge preferred",
      "Strong analytical and communication skills"
    ],
    keywords: ["marketing", "analytics", "digital marketing", "google analytics", "internship"],
    created_at: "2024-06-03T14:00:00Z",
    updated_at: "2024-06-09T10:30:00Z",
    employer: {
      id: "google-employer-1",
      name: "Google",
      industry: "Technology",
      description: "Google LLC is a multinational technology company"
    }
  }
];

/**
 * Fake hook for dealing with jobs owned by employer.
 * This replaces the backend API calls with static fake data.
 */
export function useOwnedJobs(
  params: {
    category?: string;
    type?: string;
    mode?: string;
    search?: string;
    location?: string;
    industry?: string;
  } = {}
) {
  const { is_authenticated } = useAuthContext();
  const [ownedJobs, setOwnedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnedJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (is_authenticated()) {
        setOwnedJobs(FAKE_GOOGLE_JOBS);
      } else {
        setOwnedJobs([]);
      }
    } catch (err) {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [is_authenticated]);

  const update_job = async (job_id: string, job: Partial<Job>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find and update the job in our fake data
    const jobIndex = ownedJobs.findIndex(j => j.id === job_id);
    if (jobIndex !== -1) {
      const updatedJob = { ...ownedJobs[jobIndex], ...job, updated_at: new Date().toISOString() };
      const newJobs = [...ownedJobs];
      newJobs[jobIndex] = updatedJob;
      setOwnedJobs(newJobs);
      
      return { success: true, job: updatedJob };
    }
    
    return { success: false, error: "Job not found" };
  };

  useEffect(() => {
    if (is_authenticated()) {
      fetchOwnedJobs();
    } else {
      setLoading(false);
    }
  }, [fetchOwnedJobs, is_authenticated]);

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    let filtered = [...ownedJobs];
    const { type, mode, search, location, industry } = params;

    // Apply type filter
    if (type && type !== "All types") {
      filtered = filtered.filter((job) => {
        if (type === "Internships") return job.type === 0;
        if (type === "Full-time") return job.type === 1;
        if (type === "Part-time") return job.type === 2;
        return false;
      });
    }

    // Apply mode filter
    if (mode && mode !== "Any location") {
      filtered = filtered.filter((job) => {
        if (mode === "In-Person") return job.mode === 0;
        return job.mode === 1 || job.mode === 2;
      });
    }

    // Apply industry filter
    if (industry && industry !== "All industries") {
      filtered = filtered.filter((job) => {
        return job.employer?.industry
          ?.toLowerCase()
          .includes(industry.toLowerCase());
      });
    }

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((job) => {
        // Search in multiple fields
        const searchableText = [
          job.title,
          job.description,
          job.employer?.name,
          job.employer?.industry,
          job.location,
          ...(job.keywords || []),
          ...(job.requirements || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    // Apply location filter
    if (location && location.trim()) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    return filtered;
  }, [ownedJobs, params]);

  return {
    ownedJobs: filteredJobs,
    update_job,
    loading,
    error,
    refetch: fetchOwnedJobs,
  };
}
