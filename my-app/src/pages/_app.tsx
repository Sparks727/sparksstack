// pages/_app.js
import { ClerkProvider } from '@clerk/nextjs';
import type { AppProps } from 'next/app';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ClerkProvider publishableKey={publishableKey}>
            <Component {...pageProps} />
        </ClerkProvider>
    );
}

export default MyApp;