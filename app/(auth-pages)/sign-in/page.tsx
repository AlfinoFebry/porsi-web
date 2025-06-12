import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default async function Login(props: { 
  searchParams: Promise<Message & { returnTo?: string }>
}) {
  const searchParams = await props.searchParams;
  const returnTo = searchParams.returnTo || '/dashboard';
  
  const formAction = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const result = await signInAction(formData);
    
    // If there's a returnTo parameter, we'll use it after successful sign-in
    if (!email || !password) {
      return;
    }
    
    return result;
  };
  
  return (
    <form className="w-full space-y-6" action={formAction}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link className="text-primary font-medium hover:underline" href="/register">
            Sign up
          </Link>
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
        </div>
        
        {/* Hidden input to store the returnTo value */}
        <input type="hidden" name="returnTo" value={returnTo} />
        
        <SubmitButton 
          className="w-full" 
          pendingText="Signing In..."
        >
          Sign in
        </SubmitButton>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted-foreground/20"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <GoogleAuthButton returnTo={returnTo} />
        
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
