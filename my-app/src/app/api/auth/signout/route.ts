import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
    }

    // Redirect to Clerk's sign-out page which handles the sign-out process
    return NextResponse.redirect(new URL('/sign-out', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'https://accounts.sparksstack.com'));
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
  }
} 