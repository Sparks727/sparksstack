# SparksStack Business Profile Manager

A Next.js application for managing your Google Business Profiles.

## Google Business API Strategy

This application uses the Google My Business API (Legacy API) for all business profile operations. We've chosen this approach for the following reasons:

1. **Simplicity**: One API to manage instead of 5-6 different specialized APIs
2. **Comprehensive Coverage**: The legacy API covers most basic business profile management functions
3. **Better Documentation**: As an older API, it has more examples and community support
4. **Less Quota Management**: Only need to increase quotas for a single API

While Google does offer newer specialized APIs (Business Information API, Reviews API, Performance API, etc.), we've found that the legacy API provides the most reliable and comprehensive access to business profile data.

## Google Cloud Console Setup

To use this application, you need to:

1. Enable the following APIs in Google Cloud Console:
   - Google My Business API (Legacy API)
   - My Business Account Management API

2. Request quota increases for the Google My Business API in Google Cloud Console:
   - Navigate to: Google Cloud Console > APIs & Services > Quotas & System Limits
   - Filter for "Google My Business API" 
   - Request increases for both read and write operations

3. Ensure your OAuth consent screen is configured with the following scopes:
   - https://www.googleapis.com/auth/business.manage

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Diagnostics

The application includes a built-in API diagnostics tool that tests connectivity to the Google Business APIs. Access it at `/dashboard/api-direct-test` to see detailed results and recommendations.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
