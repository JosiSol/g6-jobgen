"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileSetup() {
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhiZDQ2ZGU2MTA2OTdmMTNlNTk2M2Q0IiwiZW1haWwiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJ0eXBlIjoiYWNjZXNzIiwiaXNzIjoiam9iZ2VuLWFwaSIsInN1YiI6IjY4YmQ0NmRlNjEwNjk3ZjEzZTU5NjNkNCIsImV4cCI6MTc1NzM0OTkyMiwibmJmIjoxNzU3MjYzNTIyLCJpYXQiOjE3NTcyNjM1MjIsImp0aSI6IjJiODA2NTczLTk1NTktNGI2YS04YTM0LTBmMTA1OTY3NjExOSJ9.0iZ9k9AoI4vGUu8MwLpepigRzGh8650nUPj0YUPrL8Y"; 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const user = response.data?.data?.user;
        if (user?.skills) {
          setSkills(user.skills);
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
        setMessage("Failed to load user profile");
      }
    };

    fetchProfile();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const maxSizeMB = 5;
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setMessage(`File too large (max ${maxSizeMB}MB).`);
        return;
      }

      setFile(selectedFile);
      setMessage(null);
    }
  };

  const uploadCV = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("http://localhost:8080/api/v1/cv", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        maxRedirects: 0,
      });

      setMessage("✅ CV parsing job started successfully!");
      console.log("CV parsing response:", response.data);
    } catch (error: any) {
      console.error("CV parsing error:", error.response?.data || error.message);

      if (error.response?.status === 307) {
        console.warn("Redirect detected. Backend may be redirecting your request.");
      }

      setMessage(
        error.response?.data?.error?.message || "CV parsing failed."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-8">
      <h1 className="text-2xl font-bold text-teal-700 mb-6 text-center">
        Set Up Your Profile
      </h1>

      <label
        htmlFor="cv-upload"
        className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-600 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
        <p className="text-gray-600 text-sm text-center px-2 truncate">
          {file ? file.name : "Upload your CV"}
        </p>
        <input
          id="cv-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      <button
        className="mt-4 w-full max-w-md bg-teal-600 text-white py-2 rounded-lg shadow hover:bg-teal-700 transition"
        onClick={uploadCV}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "+ Upload CV"}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.startsWith("✅") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      {jobId && (
        <div className="mt-2 text-sm text-center text-gray-700">
          <strong>Job ID:</strong> {jobId}
        </div>
      )}

      <div className="mt-6 w-full max-w-md">
        <h2 className="font-semibold text-gray-800 mb-3">Skills</h2>
        <div className="flex flex-wrap gap-3">
          {skills.length === 0 ? (
            <p className="text-gray-500 text-sm">No skills found</p>
          ) : (
            skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-1 border rounded-full text-sm font-medium text-teal-700 border-teal-600 bg-teal-50"
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      <button className="mt-8 text-teal-600 font-semibold hover:underline">
        Next →
      </button>
    </div>
  );
}
