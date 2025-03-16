import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the App Router home page
    router.push('/');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Redirecting...</p>
    </div>
  );
} 