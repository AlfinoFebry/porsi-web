import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordGate } from '@/components/password-gate';
import { AdminGuard } from '@/components/admin-guard';
import { useUser } from '@/components/user-provider';

// Mock the user provider
jest.mock('@/components/user-provider', () => ({
    useUser: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('PasswordGate Component', () => {
    const mockOnSuccess = jest.fn();
    const correctPassword = 'TestPassword123';

    beforeEach(() => {
        mockOnSuccess.mockClear();
    });

    test('renders password input form', () => {
        render(
            <PasswordGate
                onSuccess={mockOnSuccess}
                correctPassword={correctPassword}
            />
        );

        expect(screen.getByText('Akses Admin')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /lanjutkan/i })).toBeInTheDocument();
    });

    test('shows error message for incorrect password', async () => {
        render(
            <PasswordGate
                onSuccess={mockOnSuccess}
                correctPassword={correctPassword}
            />
        );

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /lanjutkan/i });

        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Password salah. Silakan coba lagi.')).toBeInTheDocument();
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test('calls onSuccess for correct password', async () => {
        render(
            <PasswordGate
                onSuccess={mockOnSuccess}
                correctPassword={correctPassword}
            />
        );

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /lanjutkan/i });

        fireEvent.change(passwordInput, { target: { value: correctPassword } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        });
    });

    test('disables submit button when password is empty', () => {
        render(
            <PasswordGate
                onSuccess={mockOnSuccess}
                correctPassword={correctPassword}
            />
        );

        const submitButton = screen.getByRole('button', { name: /lanjutkan/i });
        expect(submitButton).toBeDisabled();
    });

    test('enables submit button when password is entered', () => {
        render(
            <PasswordGate
                onSuccess={mockOnSuccess}
                correctPassword={correctPassword}
            />
        );

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /lanjutkan/i });

        fireEvent.change(passwordInput, { target: { value: 'somepassword' } });

        expect(submitButton).not.toBeDisabled();
    });
});

describe('AdminGuard Component', () => {
    const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

    beforeEach(() => {
        mockUseUser.mockClear();
    });

    test('shows loading state while checking authentication', () => {
        mockUseUser.mockReturnValue({
            user: null,
            profile: null,
            userType: null,
            isLoading: true,
            isProfileLoading: false,
        });

        render(
            <AdminGuard>
                <div>Admin Content</div>
            </AdminGuard>
        );

        expect(screen.getByText('Verifying Access')).toBeInTheDocument();
        expect(screen.getByText('Checking admin permissions...')).toBeInTheDocument();
    });

    test('shows access denied for non-admin users', () => {
        mockUseUser.mockReturnValue({
            user: { id: '123', email: 'user@test.com' } as any,
            profile: { id: '123', email: 'user@test.com', tipe_user: 'siswa' } as any,
            userType: 'siswa',
            isLoading: false,
            isProfileLoading: false,
        });

        render(
            <AdminGuard>
                <div>Admin Content</div>
            </AdminGuard>
        );

        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByText("You don't have admin permissions to access this page.")).toBeInTheDocument();
    });

    test('renders children for admin users', () => {
        mockUseUser.mockReturnValue({
            user: { id: '123', email: 'admin@test.com' } as any,
            profile: { id: '123', email: 'admin@test.com', tipe_user: 'admin' } as any,
            userType: 'admin',
            isLoading: false,
            isProfileLoading: false,
        });

        render(
            <AdminGuard>
                <div>Admin Content</div>
            </AdminGuard>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    test('shows authentication required for unauthenticated users', () => {
        mockUseUser.mockReturnValue({
            user: null,
            profile: null,
            userType: null,
            isLoading: false,
            isProfileLoading: false,
        });

        render(
            <AdminGuard>
                <div>Admin Content</div>
            </AdminGuard>
        );

        expect(screen.getByText('Authentication Required')).toBeInTheDocument();
        expect(screen.getByText('You need to be logged in to access this page.')).toBeInTheDocument();
    });
});

describe('Score Validation', () => {
    test('validates score range 0-100', () => {
        const validateScore = (score: string): boolean => {
            const numValue = parseInt(score);
            return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
        };

        // Valid scores
        expect(validateScore('0')).toBe(true);
        expect(validateScore('50')).toBe(true);
        expect(validateScore('100')).toBe(true);

        // Invalid scores
        expect(validateScore('-1')).toBe(false);
        expect(validateScore('101')).toBe(false);
        expect(validateScore('abc')).toBe(false);
        expect(validateScore('')).toBe(false);
    });

    test('handles score input validation', () => {
        const handleScoreChange = (value: string): string => {
            const numValue = parseInt(value);
            if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                return value;
            }
            return ''; // Return empty string for invalid input
        };

        expect(handleScoreChange('50')).toBe('50');
        expect(handleScoreChange('0')).toBe('0');
        expect(handleScoreChange('100')).toBe('100');
        expect(handleScoreChange('101')).toBe('');
        expect(handleScoreChange('-1')).toBe('');
        expect(handleScoreChange('abc')).toBe('');
    });
});

describe('User Type Detection', () => {
    test('correctly identifies admin users', () => {
        const isAdmin = (userType: string | null): boolean => {
            return userType === 'admin';
        };

        expect(isAdmin('admin')).toBe(true);
        expect(isAdmin('siswa')).toBe(false);
        expect(isAdmin('alumni')).toBe(false);
        expect(isAdmin(null)).toBe(false);
    });

    test('handles conditional navigation rendering', () => {
        const shouldShowAdminNav = (userType: string | null): boolean => {
            return userType === 'admin';
        };

        const shouldShowStudentNav = (userType: string | null): boolean => {
            return userType === 'siswa' || userType === 'alumni';
        };

        // Admin user
        expect(shouldShowAdminNav('admin')).toBe(true);
        expect(shouldShowStudentNav('admin')).toBe(false);

        // Student user
        expect(shouldShowAdminNav('siswa')).toBe(false);
        expect(shouldShowStudentNav('siswa')).toBe(true);

        // Alumni user
        expect(shouldShowAdminNav('alumni')).toBe(false);
        expect(shouldShowStudentNav('alumni')).toBe(true);

        // Unknown user
        expect(shouldShowAdminNav(null)).toBe(false);
        expect(shouldShowStudentNav(null)).toBe(false);
    });
});