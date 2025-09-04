import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/organizations(.*)',
  '/api/upload(.*)',
]);

// Create route matcher for public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/auth(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes
  if (isProtectedRoute(req)) {
    return auth().protect();
  }
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