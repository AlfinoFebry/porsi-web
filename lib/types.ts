export type UserType = "siswa" | "alumni";
export type Jurusan = "IPA" | "IPS";

export interface BiodataForm {
    name: string;
    dateOfBirth: string;
    gender: "male" | "female";
    // For siswa SMA
    namaSekolah?: string;
    jurusan?: Jurusan;
    class?: string;
    // For alumni
    namaPerguruanTinggi?: string;
    tahunLulusSMA?: string;
    tahunMasukKuliah?: string;
    jurusanKuliah?: string;
}

export interface ReportData {
    [subject: string]: {
        semester1?: number;
        semester2?: number;
        semester3?: number;
        semester4?: number;
        semester5?: number;
        semester6?: number;
    };
} 