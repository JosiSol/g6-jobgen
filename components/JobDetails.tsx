// app/components/JobDetails.tsx
"use client";

import { useState, useEffect } from "react";
import JobCard from "./JobCard";

interface JobData {
  id: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  salary: string;
  posted_at: string;
  tags: string[];
  applicants?: number;
}

const JobDetails = ({ jobId }: { jobId: string }) => {
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}`);
        const data = await response.json();

        if (data.success && data.data && data.data.job) {
          setJob(data.data.job);  
        } else {
          console.error("Failed to load job data");
          setJob(null);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  if (loading) return <p>Loading...</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <JobCard
      title={job.title}
      company={job.company_name}
      location={job.location}
      tags={job.tags}
      salary={job.salary}
      posted={new Date(job.posted_at).toLocaleDateString()}
      deadline={"N/A"} 
      applicants={job.applicants ?? 0}
      description={job.description}
    />
  );
};

export default JobDetails;
