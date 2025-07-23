import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is an admin registration from OAuth
      // We'll create a client-side script to handle this since we can't access localStorage on server
      const response = NextResponse.redirect(
        redirectTo ? `${origin}${redirectTo}` : `${origin}/dashboard`
      );

      // Add a script to handle admin profile creation on the client side
      response.headers.set('X-Admin-Profile-Check', 'true');

      return response;
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Redirect to the dashboard instead of the protected page
  return NextResponse.redirect(`${origin}/dashboard`);
}
