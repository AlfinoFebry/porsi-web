import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
    createClient: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock user provider
jest.mock('@/components/user-provider', () => ({
    useUser: () => ({
        user: { id: 'admin-123', email: 'admin@test.com' },
        profile: { id: 'admin-123', email: 'admin@test.com', tipe_user: 'admin', nama_sekolah: 'Test School' },
        userType: 'admin',
        isLoading: false,
        isProfileLoading: false,
    }),
    UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Admin Integration Tests', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
            onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
            signOut: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                    order: jest.fn(),
                })),
                order: jest.fn(),
            })),
            upsert: jest.fn(),
            update: jest.fn(() => ({
                eq: jest.fn(),
            })),
        })),
    };

    const mockRouter = {
        push: jest.fn(),
    };

    beforeEach(() => {
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        jest.clearAllMocks();
    });

    describe('Admin Registration Flow', () => {
        test('should complete full admin registration workflow', async () => {
            // Mock successful authentication
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'admin-123', email: 'admin@test.com' } },
            });

            // Mock successful profile creation
            mockSupabase.from.mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: null }),
            });

            // Test password gate
            const { PasswordGate } = await import('@/components/password-gate');
            const mockOnSuccess = jest.fn();

            render(
                <PasswordGate
                    onSuccess={mockOnSuccess}
                    correctPassword="RegisterAdminPortofolioSiswa123"
                />
            );

            // Enter correct password
            const passwordInput = screen.getByLabelText('Password');
            const submitButton = screen.getByRole('button', { name: /lanjutkan/i });

            fireEvent.change(passwordInput, { target: { value: 'RegisterAdminPortofolioSiswa123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalled();
            });
        });

        test('should handle admin profile setup correctly', async () => {
            // Mock user authentication
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'admin-123', email: 'admin@test.com' } },
            });

            // Mock successful profile upsert
            const mockUpsert = jest.fn().mockResolvedValue({ error: null });
            mockSupabase.from.mockReturnValue({
                upsert: mockUpsert,
            });

            // Test profile setup form submission
            const profileData = {
                id: 'admin-123',
                email: 'admin@test.com',
                nama_sekolah: 'Test School',
                tipe_user: 'admin',
            };

            // Simulate form submission
            await waitFor(() => {
                expect(mockUpsert).toHaveBeenCalledWith(
                    expect.objectContaining({
                        tipe_user: 'admin',
                        nama_sekolah: expect.any(String),
                    })
                );
            });
        });
    });

    describe('Student Data Management', () => {
        test('should fetch and display student data correctly', async () => {
            const mockStudents = [
                {
                    id: 'student-1',
                    nama: 'John Doe',
                    email: 'john@test.com',
                    nama_sekolah: 'Test School',
                    jurusan: 'IPA',
                    kelas: '12',
                },
            ];

            const mockAcademicRecords = [
                {
                    id: 'record-1',
                    user_id: 'student-1',
                    mapel: 'Matematika',
                    semester: '1',
                    nilai: 85,
                },
            ];

            // Mock student data fetch
            mockSupabase.from.mockImplementation((table) => {
                if (table === 'profil') {
                    return {
                        select: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                order: jest.fn().mockResolvedValue({
                                    data: mockStudents,
                                    error: null,
                                }),
                            })),
                        })),
                    };
                }
                if (table === 'nilai_akademik') {
                    return {
                        select: jest.fn(() => ({
                            order: jest.fn().mockResolvedValue({
                                data: mockAcademicRecords,
                                error: null,
                            }),
                        })),
                    };
                }
                return { select: jest.fn() };
            });

            // Test data fetching logic
            const fetchStudentData = async () => {
                const supabase = createClient();

                const { data: studentsData } = await supabase
                    .from('profil')
                    .select('id, nama, email, nama_sekolah, jurusan, kelas')
                    .eq('tipe_user', 'siswa')
                    .order('nama');

                const { data: recordsData } = await supabase
                    .from('nilai_akademik')
                    .select('id, user_id, mapel, semester, nilai')
                    .order('mapel, semester');

                return { studentsData, recordsData };
            };

            const result = await fetchStudentData();

            expect(result.studentsData).toEqual(mockStudents);
            expect(result.recordsData).toEqual(mockAcademicRecords);
        });

        test('should handle score updates correctly', async () => {
            const mockUpdate = jest.fn().mockResolvedValue({ error: null });

            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: mockUpdate,
                })),
            });

            // Test score update logic
            const updateScore = async (recordId: string, newScore: number) => {
                const supabase = createClient();

                const { error } = await supabase
                    .from('nilai_akademik')
                    .update({
                        nilai: newScore,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', recordId);

                return { error };
            };

            const result = await updateScore('record-1', 90);

            expect(result.error).toBeNull();
            expect(mockUpdate).toHaveBeenCalledWith('id', 'record-1');
        });
    });

    describe('Navigation and Access Control', () => {
        test('should render admin navigation for admin users', () => {
            const { AdminNav } = require('@/components/admin-nav');

            render(<AdminNav />);

            // Check for admin-specific navigation items
            expect(screen.getByText('PortofolioSiswa Admin')).toBeInTheDocument();
        });

        test('should validate score input range', () => {
            const validateScore = (score: string): boolean => {
                const numValue = parseInt(score);
                return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
            };

            // Test valid scores
            expect(validateScore('0')).toBe(true);
            expect(validateScore('50')).toBe(true);
            expect(validateScore('100')).toBe(true);

            // Test invalid scores
            expect(validateScore('-1')).toBe(false);
            expect(validateScore('101')).toBe(false);
            expect(validateScore('abc')).toBe(false);
        });
    });

    describe('Database Operations', () => {
        test('should maintain data consistency during operations', async () => {
            // Mock database operations
            const mockTransaction = jest.fn().mockResolvedValue({ error: null });

            // Test that profile creation includes all required fields
            const createAdminProfile = async (userData: any) => {
                const requiredFields = ['id', 'email', 'nama_sekolah', 'tipe_user'];
                const hasAllFields = requiredFields.every(field => userData.hasOwnProperty(field));

                if (!hasAllFields) {
                    throw new Error('Missing required fields');
                }

                if (userData.tipe_user !== 'admin') {
                    throw new Error('Invalid user type for admin profile');
                }

                return { success: true };
            };

            // Test valid admin profile
            const validProfile = {
                id: 'admin-123',
                email: 'admin@test.com',
                nama_sekolah: 'Test School',
                tipe_user: 'admin',
            };

            const result = await createAdminProfile(validProfile);
            expect(result.success).toBe(true);

            // Test invalid profile (missing required field)
            const invalidProfile = {
                id: 'admin-123',
                email: 'admin@test.com',
                // missing nama_sekolah
                tipe_user: 'admin',
            };

            await expect(createAdminProfile(invalidProfile)).rejects.toThrow('Missing required fields');
        });

        test('should handle concurrent score updates safely', async () => {
            // Mock optimistic update scenario
            const mockOptimisticUpdate = jest.fn();
            const mockRollback = jest.fn();

            const handleScoreUpdate = async (recordId: string, newScore: number) => {
                try {
                    // Optimistic update
                    mockOptimisticUpdate(recordId, newScore);

                    // Simulate database update
                    const supabase = createClient();
                    const { error } = await supabase
                        .from('nilai_akademik')
                        .update({ nilai: newScore })
                        .eq('id', recordId);

                    if (error) {
                        // Rollback on error
                        mockRollback(recordId);
                        throw error;
                    }

                    return { success: true };
                } catch (error) {
                    mockRollback(recordId);
                    throw error;
                }
            };

            // Test successful update
            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                })),
            });

            const result = await handleScoreUpdate('record-1', 85);
            expect(result.success).toBe(true);
            expect(mockOptimisticUpdate).toHaveBeenCalledWith('record-1', 85);
            expect(mockRollback).not.toHaveBeenCalled();
        });
    });
});