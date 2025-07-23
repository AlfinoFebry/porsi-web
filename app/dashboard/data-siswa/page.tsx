"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Edit3,
  Save,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/components/user-provider";
import { useToast } from "@/hooks/use-toast";

interface StudentProfile {
  id: string;
  nama: string;
  email: string;
  nama_sekolah: string;
  jurusan: "IPA" | "IPS";
  kelas: string;
}

interface AcademicRecord {
  id: string;
  user_id: string;
  mapel: string;
  semester: string;
  nilai: number;
}

interface StudentWithRecords extends StudentProfile {
  academic_records: AcademicRecord[];
}

export default function DataSiswaPage() {
  const [students, setStudents] = useState<StudentWithRecords[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<
    StudentWithRecords[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingScore, setEditingScore] = useState<{
    studentId: string;
    recordId: string;
    value: string;
  } | null>(null);
  const [savingScores, setSavingScores] = useState<Set<string>>(new Set());
  const [userType, setUserType] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Expandable cards state
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { user } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    checkUserTypeAndFetchData();
  }, [user]);

  const checkUserTypeAndFetchData = async () => {
    if (!user) return;

    try {
      // Check user type first
      const { data: profileData, error } = await supabase
        .from("profil")
        .select("tipe_user")
        .eq("id", user.id)
        .single();

      if (error || !profileData) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserType(profileData.tipe_user);

      // Only fetch student data if user is admin
      if (profileData.tipe_user === "admin") {
        await fetchStudentData();
      }
    } catch (error) {
      console.error("Error checking user type:", error);
    }
  };

  useEffect(() => {
    // Filter students based on search term and reset to first page
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, students]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      if (!user) return;

      // First, get the admin's school name
      const { data: adminProfile, error: adminError } = await supabase
        .from("profil")
        .select("nama_sekolah")
        .eq("id", user.id)
        .single();

      if (adminError || !adminProfile?.nama_sekolah) {
        console.error("Error fetching admin profile:", adminError);
        toast({
          title: "Error",
          description: "Tidak dapat mengambil data sekolah admin.",
          variant: "destructive",
        });
        return;
      }

      const adminSchool = adminProfile.nama_sekolah;
      console.log("Admin school name:", adminSchool);

      // First, let's check if there are any students at all
      const { data: allStudents, error: allStudentsError } = await supabase
        .from("profil")
        .select("id, nama, email, nama_sekolah, jurusan, kelas, tipe_user")
        .eq("tipe_user", "siswa");

      console.log("All students query error:", allStudentsError);
      console.log("All students in database:", allStudents);

      // Let's also check if we can see our own admin profile
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from("profil")
        .select("id, nama, email, nama_sekolah, tipe_user")
        .eq("id", user.id)
        .single();

      console.log("Admin profile check error:", adminCheckError);
      console.log("Admin profile check result:", adminCheck);

      // Fetch students from the same school (case-insensitive)
      const { data: studentsData, error: studentsError } = await supabase
        .from("profil")
        .select("id, nama, email, nama_sekolah, jurusan, kelas")
        .eq("tipe_user", "siswa")
        .ilike("nama_sekolah", `%${adminSchool.trim()}%`) // Case-insensitive match with wildcards
        .order("nama");

      console.log("Filtered students by school:", studentsData);

      if (studentsError) {
        throw studentsError;
      }

      // Fetch academic records for all students
      const { data: recordsData, error: recordsError } = await supabase
        .from("data_akademik")
        .select("id, user_id, mapel, semester, nilai")
        .order("mapel, semester");

      if (recordsError) {
        throw recordsError;
      }

      // Combine students with their academic records
      const studentsWithRecords: StudentWithRecords[] = (
        studentsData || []
      ).map((student) => ({
        ...student,
        academic_records: (recordsData || []).filter(
          (record) => record.user_id === student.id
        ),
      }));

      setStudents(studentsWithRecords);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreEdit = (
    studentId: string,
    recordId: string,
    currentValue: number
  ) => {
    setEditingScore({
      studentId,
      recordId,
      value: currentValue.toString(),
    });
  };

  const handleScoreChange = (value: string) => {
    if (editingScore) {
      // Only allow numbers between 0-100
      const numValue = parseInt(value);
      if (
        value === "" ||
        (!isNaN(numValue) && numValue >= 0 && numValue <= 100)
      ) {
        setEditingScore({
          ...editingScore,
          value: value,
        });
      }
    }
  };

  const handleScoreSave = async () => {
    if (!editingScore) return;

    const numValue = parseInt(editingScore.value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      toast({
        title: "Error",
        description: "Nilai harus berupa angka antara 0-100.",
        variant: "destructive",
      });
      return;
    }

    setSavingScores((prev) => new Set(prev).add(editingScore.recordId));

    try {
      const { error } = await supabase
        .from("data_akademik")
        .update({
          nilai: numValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingScore.recordId);

      if (error) {
        throw error;
      }

      // Update local state
      setStudents((prev) =>
        prev.map((student) => ({
          ...student,
          academic_records: student.academic_records.map((record) =>
            record.id === editingScore.recordId
              ? { ...record, nilai: numValue }
              : record
          ),
        }))
      );

      toast({
        title: "Berhasil",
        description: "Nilai berhasil diperbarui.",
      });

      setEditingScore(null);
    } catch (error) {
      console.error("Error updating score:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui nilai. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setSavingScores((prev) => {
        const newSet = new Set(prev);
        newSet.delete(editingScore.recordId);
        return newSet;
      });
    }
  };

  const handleScoreCancel = () => {
    setEditingScore(null);
  };

  const createTestData = async () => {
    if (!user) return;

    try {
      // Get admin's school name first
      const { data: adminProfile, error: adminError } = await supabase
        .from("profil")
        .select("nama_sekolah")
        .eq("id", user.id)
        .single();

      if (adminError || !adminProfile?.nama_sekolah) {
        toast({
          title: "Error",
          description: "Tidak dapat mengambil data sekolah admin.",
          variant: "destructive",
        });
        return;
      }

      const adminSchool = adminProfile.nama_sekolah;

      toast({
        title: "Info",
        description: `Admin school: "${adminSchool}". To test this feature, please register some students with the exact same school name through the regular registration process at /register.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating test data:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat data test.",
        variant: "destructive",
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Expandable cards logic
  const toggleCardExpansion = (studentId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 70)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (score >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
        <p className="text-muted-foreground mt-2">
          Kelola data dan nilai akademik siswa
        </p>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari siswa berdasarkan nama, email, atau sekolah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {filteredStudents.length} siswa
          </Badge> */}
          <Button onClick={fetchStudentData} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada data siswa</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Tidak ada siswa yang sesuai dengan pencarian."
                : "Belum ada siswa yang terdaftar dalam sistem."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pagination Info */}
          <div className="flex items-center justify-between">
            {/* <p className="text-sm text-muted-foreground">
                            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} dari {filteredStudents.length} siswa
                        </p> */}
            <div className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </div>
          </div>

          {/* Students Cards */}
          <div className="space-y-4">
            {currentStudents.map((student) => {
              const isExpanded = expandedCards.has(student.id);
              return (
                <Card key={student.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleCardExpansion(student.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {student.nama}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{student.email}</Badge>
                          <Badge variant="secondary">
                            {student.nama_sekolah}
                          </Badge>
                          <Badge>{student.jurusan}</Badge>
                          <Badge variant="outline">Kelas {student.kelas}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">
                          Nilai Akademik
                        </h4>

                        {student.academic_records.length === 0 ? (
                          <p className="text-muted-foreground">
                            Belum ada data nilai akademik.
                          </p>
                        ) : (
                          <div className="grid gap-3">
                            {student.academic_records.map((record) => (
                              <div
                                key={record.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {record.mapel}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Semester {record.semester}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {editingScore?.recordId === record.id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editingScore.value}
                                        onChange={(e) =>
                                          handleScoreChange(e.target.value)
                                        }
                                        className="w-20 text-center"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        onClick={handleScoreSave}
                                        disabled={savingScores.has(record.id)}
                                      >
                                        {savingScores.has(record.id) ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Save className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleScoreCancel}
                                        disabled={savingScores.has(record.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={getScoreColor(record.nilai)}
                                      >
                                        {record.nilai}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleScoreEdit(
                                            student.id,
                                            record.id,
                                            record.nilai
                                          )
                                        }
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current page
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
