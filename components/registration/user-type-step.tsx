"use client";

import { Button } from "@/components/ui/button";
import { UserType } from "@/lib/types";
import { GraduationCap, School } from "lucide-react";

interface UserTypeStepProps {
  onSelect: (type: UserType) => void;
}

export function UserTypeStep({ onSelect }: UserTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Pilih yang mendeskripsikan Anda</h2>
        <p className="text-sm text-muted-foreground">
          Pilih status pendidikan Anda saat ini
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center space-y-4 hover:bg-primary/5 border-2 hover:border-primary/20 transition-all"
          onClick={() => onSelect("siswa")}
        >
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <School className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">Siswa SMA</div>
            <div className="text-sm text-muted-foreground">
              Sedang bersekolah di SMA
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-center space-y-4 hover:bg-primary/5 border-2 hover:border-primary/20 transition-all"
          onClick={() => onSelect("alumni")}
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">Alumni</div>
            <div className="text-sm text-muted-foreground">
              Sudah lulus SMA atau kuliah
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
} 