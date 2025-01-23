import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/database.types';

type ProfileInsert = Database['public']['Tables']['Profile']['Insert'];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const baseUrl = process.env.NODE_ENV === 'development' ? origin : `https://${forwardedHost || origin}`;
  const redirectPath = next;

  return NextResponse.redirect(`${baseUrl}${redirectPath}`);
}
