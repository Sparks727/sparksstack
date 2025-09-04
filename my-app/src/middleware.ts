import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  const path = req.nextUrl.pathname;
  
  // Allow public routes
  const publicPaths = ['/', '/sign-in', '/sign-up', '/api/auth'];
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return;
  }
  
  // For protected routes, Clerk will automatically handle authentication
  // If user is not authenticated, they'll be redirected to sign-in
  return;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 