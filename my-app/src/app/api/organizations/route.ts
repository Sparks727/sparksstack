import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Input validation schemas
const CreateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid organization name format'),
});

const AddMemberSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'member']).default('member'),
});

const UpdateOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid organization name format'),
});

// In-memory storage (replace with database in production)
let organizations: any[] = [];

/**
 * GET /api/organizations
 * Get all organizations for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter organizations to only show those where user is a member
    const userOrganizations = organizations.filter(org => 
      org.members.some((member: any) => member.userId === userId)
    );

    return NextResponse.json({ organizations: userOrganizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/organizations
 * Create a new organization
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
    const existingOrg = organizations.find(org => 
      org.name.toLowerCase() === name.toLowerCase() && 
      org.members.some((member: any) => member.userId === userId)
    );

    if (existingOrg) {
      return NextResponse.json({ error: 'Organization with this name already exists' }, { status: 409 });
    }

    // Create new organization
    const newOrg = {
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      members: [
        { 
          id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          email: '', // Will be fetched from Clerk
          role: 'admin', 
          status: 'active',
          joinedAt: new Date().toISOString()
        }
      ]
    };

    organizations.push(newOrg);

    return NextResponse.json({ 
      organization: newOrg,
      message: 'Organization created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/organizations
 * Update organization details
 */
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Find organization and check if user is admin
    const orgIndex = organizations.findIndex(org => 
      org.id === organizationId && 
      org.members.some((member: any) => member.userId === userId && member.role === 'admin')
    );

    if (orgIndex === -1) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Check if new name conflicts with existing organizations
    const nameConflict = organizations.find(org => 
      org.id !== organizationId && 
      org.name.toLowerCase() === name.toLowerCase() &&
      org.members.some((member: any) => member.userId === userId)
    );

    if (nameConflict) {
      return NextResponse.json({ error: 'Organization with this name already exists' }, { status: 409 });
    }

    // Update organization
    organizations[orgIndex] = {
      ...organizations[orgIndex],
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      organization: organizations[orgIndex],
      message: 'Organization updated successfully' 
    });

  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations
 * Delete an organization
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

    // Find organization and check if user is admin
    const orgIndex = organizations.findIndex(org => 
      org.id === organizationId && 
      org.members.some((member: any) => member.userId === userId && member.role === 'admin')
    );

    if (orgIndex === -1) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Remove organization
    const deletedOrg = organizations.splice(orgIndex, 1)[0];

    return NextResponse.json({ 
      message: 'Organization deleted successfully',
      deletedOrganization: deletedOrg
    });

  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
