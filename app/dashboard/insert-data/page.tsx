"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  score: z.coerce.number().min(0).max(100),
  semester: z.string().min(1, { message: "Semester is required" }),
  schoolYear: z.string().min(1, { message: "School year is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function InsertDataPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      score: 0,
      semester: "",
      schoolYear: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      // In a real app, this would send data to Supabase
      console.log("Form data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      reset();
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insert Academic Record</h1>
        <p className="text-muted-foreground mt-2">
          Add a new academic record to your portfolio.
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <input
              {...register("subject")}
              id="subject"
              className="w-full p-2 rounded-md border border-input bg-background"
              placeholder="e.g. Mathematics"
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="score" className="text-sm font-medium">
              Score (0-100)
            </label>
            <input
              {...register("score")}
              id="score"
              type="number"
              min="0"
              max="100"
              className="w-full p-2 rounded-md border border-input bg-background"
            />
            {errors.score && (
              <p className="text-sm text-red-500">{errors.score.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="semester" className="text-sm font-medium">
              Semester
            </label>
            <select
              {...register("semester")}
              id="semester"
              className="w-full p-2 rounded-md border border-input bg-background"
            >
              <option value="">Select semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            {errors.semester && (
              <p className="text-sm text-red-500">{errors.semester.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="schoolYear" className="text-sm font-medium">
              School Year
            </label>
            <input
              {...register("schoolYear")}
              id="schoolYear"
              className="w-full p-2 rounded-md border border-input bg-background"
              placeholder="e.g. 2023/2024"
            />
            {errors.schoolYear && (
              <p className="text-sm text-red-500">{errors.schoolYear.message}</p>
            )}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none w-full flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Record"}
            </button>
          </div>
          
          {submitSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-green-600 dark:text-green-400 text-sm mt-4">
              Academic record submitted successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 