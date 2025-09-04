import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ClerkOrganizationClient } from '@/lib/clerk-client';

// Input validation schemas
const CreateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid organization name format'),
});

const UpdateOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid organization name format'),
});

/**
 * GET /api/organizations
 * Get all organizations for the authenticated user from Clerk
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organizations from Clerk
    const organizations = await ClerkOrganizationClient.getUserOrganizations(userId);
    
    // Get full organization details for each
    const organizationDetails = await Promise.all(
      organizations.map(async (membership) => {
        try {
          const org = await ClerkOrganizationClient.getOrganization(membership.organizationId);
          return {
            ...membership,
            organization: org,
          };
        } catch (error) {
          console.error(`Error fetching organization ${membership.organizationId}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed organization fetches
    const validOrganizations = organizationDetails.filter(org => org !== null);

    return NextResponse.json({ organizations: validOrganizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/organizations
 * Create a new organization in Clerk
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = CreateOrganizationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { name } = validationResult.data;

    // Check if organization name already exists for this user
    const existingOrganizations = await ClerkOrganizationClient.getUserOrganizations(userId);
    
    // Get full organization details to check names
    const organizationDetails = await Promise.all(
      existingOrganizations.map(async (membership) => {
        try {
          return await ClerkOrganizationClient.getOrganization(membership.organizationId);
        } catch (error) {
          return null;
        }
      })
    );
    
    const nameConflict = organizationDetails.some(org => 
      org && org.name.toLowerCase() === name.toLowerCase()
    );

    if (nameConflict) {
      return NextResponse.json({ error: 'Organization with this name already exists' }, { status: 409 });
    }

    // Create new organization in Clerk
    const organization = await ClerkOrganizationClient.createOrganization({
      name: name.trim(),
      createdBy: userId,
    });

    return NextResponse.json({ 
      organization,
      message: 'Organization created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/organizations
 * Update organization details in Clerk
 */
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = UpdateOrganizationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { organizationId, name } = validationResult.data;

    // Check if user has admin access to this organization
    const hasAdminAccess = await ClerkOrganizationClient.hasAdminAccess(userId, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 400 });
    }

    // Check if new name conflicts with existing organizations
    const existingOrganizations = await ClerkOrganizationClient.getUserOrganizations(userId);
    
    // Get full organization details to check names
    const organizationDetails = await Promise.all(
      existingOrganizations.map(async (membership) => {
        try {
          return await ClerkOrganizationClient.getOrganization(membership.organizationId);
        } catch (error) {
          return null;
        }
      })
    );
    
    const nameConflict = organizationDetails.some(org => 
      org && org.id !== organizationId && org.name.toLowerCase() === name.toLowerCase()
    );

    if (nameConflict) {
      return NextResponse.json({ error: 'Organization with this name already exists' }, { status: 400 });
    }

    // Update organization in Clerk
    const updatedOrg = await ClerkOrganizationClient.updateOrganization(organizationId, {
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
    });

    return NextResponse.json({ 
      organization: updatedOrg,
      message: 'Organization updated successfully' 
    });

  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations
 * Delete an organization from Clerk
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Check if user has admin access to this organization
    const hasAdminAccess = await ClerkOrganizationClient.hasAdminAccess(userId, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Delete organization from Clerk
    await ClerkOrganizationClient.deleteOrganization(organizationId);

    return NextResponse.json({ 
      message: 'Organization deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
