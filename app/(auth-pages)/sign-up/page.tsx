import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Sign up</h1>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
            />
          </div>
          
          <SubmitButton 
            className="w-full"
            formAction={signUpAction} 
            pendingText="Signing up..."
          >
            Sign up
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
          
          <GoogleAuthButton />
          
          <FormMessage message={searchParams} />
        </div>
      </form>
      <div className="mt-8">
        <SmtpMessage />
      </div>
    </>
  );
}
