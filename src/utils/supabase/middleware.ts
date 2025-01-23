import { Database } from '@/database.types'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Skip middleware for public routes and static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Create response first
  const response = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't need authentication
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/auth')

  // Handle authentication redirect
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Only check profile if user is authenticated and not already on profile update page
  if (user && !request.nextUrl.pathname.startsWith('/profile/update')) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError?.code === 'PGRST116') {
        const url = request.nextUrl.clone()
        url.pathname = '/profile/update'
        return NextResponse.redirect(url)
      }

      if (!profileData) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/auth-code-error'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // Handle any unexpected errors without redirecting
      console.error('Profile check error:', error)
    }
  }

  return response
}