"use client";

import { useState } from "react";

export default function PortfolioPage() {
  // Mock data - would be fetched from Supabase in a real implementation
  const [userData] = useState({
    name: "John Doe",
    grade: "12",
    school: "SMA 1",
    avgScore: 85,
  });

  const [academicRecords] = useState([
    { id: 1, subject: "Mathematics", score: 90, grade: "A", semester: "1" },
    { id: 2, subject: "Physics", score: 85, grade: "B+", semester: "1" },
    { id: 3, subject: "Chemistry", score: 80, grade: "B", semester: "1" },
    { id: 4, subject: "Biology", score: 88, grade: "B+", semester: "1" },
    { id: 5, subject: "English", score: 92, grade: "A", semester: "1" },
    { id: 6, subject: "History", score: 78, grade: "B-", semester: "1" },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your academic records.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="border rounded-lg p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Student Profile</h2>
              <p className="text-muted-foreground text-sm">Your academic information</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">{userData.name}</p>
                <p className="text-sm text-muted-foreground">Grade {userData.grade} - {userData.school}</p>
              </div>
              
              {/* Circle diagram for average score */}
              <div className="flex justify-center pt-4">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="10" 
                      strokeOpacity="0.1" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="10" 
                      className="text-blue-500"
                      strokeDasharray={`${userData.avgScore * 2.51} 251`} 
                      strokeDashoffset="62.75" 
                      transform="rotate(-90 50 50)" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{userData.avgScore}</span>
                    <span className="text-xs text-muted-foreground">Average Score</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-sm flex justify-between">
                  <span>Class Rank</span>
                  <span className="font-medium">5 / 30</span>
                </div>
                <div className="text-sm flex justify-between mt-2">
                  <span>Attendance</span>
                  <span className="font-medium">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Academic Records</h2>
              <p className="text-muted-foreground text-sm">Semester 1, 2023/2024</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Subject</th>
                    <th className="text-center py-3 px-2 font-medium">Score</th>
                    <th className="text-center py-3 px-2 font-medium">Grade</th>
                    <th className="text-center py-3 px-2 font-medium">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {academicRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="py-3 px-2">{record.subject}</td>
                      <td className="py-3 px-2 text-center">{record.score}</td>
                      <td className="py-3 px-2 text-center">{record.grade}</td>
                      <td className="py-3 px-2 text-center">{record.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 