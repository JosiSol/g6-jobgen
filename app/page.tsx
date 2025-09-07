// app/page.tsx or wherever you want to use it

import JobDetails from "@/components/JobDetails";

export default function Page() {
  const jobId = "68bd7fec7eb25e27bf5efee5"; 

  return (
    <div>
      <JobDetails jobId={jobId} />
    </div>
  );
}
