import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type ResponseCookie = Parameters<NextResponse['cookies']['set']>[2];

const PUBLIC_PATHS = ['/', '/auth'];
const ONBOARDING_PATH = '/onboarding';
const DASHBOARD_PATH = '/dashboard';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: ResponseCookie }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => p === pathname || pathname.startsWith(p + '/'));
  const isOnboarding = pathname === ONBOARDING_PATH || pathname.startsWith(ONBOARDING_PATH + '/');
  const isAuthPage = pathname === '/auth' || pathname.startsWith('/auth/');

  if (user) {
    if (isAuthPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_complete) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
      return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
    }

  } else {
    if (isOnboarding || pathname === DASHBOARD_PATH || pathname.startsWith(DASHBOARD_PATH + '/')) {
      const signInUrl = new URL('/auth', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
