import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ClerkOrganizationClient } from '@/lib/clerk-client';

// Input validation schemas
const AddMemberSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'member']).default('member'),
});

const UpdateMemberSchema = z.object({
  organizationId: z.string().min(1),
  memberId: z.string().min(1),
  role: z.enum(['admin', 'member']),
});

/**
 * POST /api/organizations/members
 * Add a new member to an organization in Clerk
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = AddMemberSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { organizationId, email, role } = validationResult.data;

    // Check if user has admin access to this organization
    const hasAdminAccess = await ClerkOrganizationClient.hasAdminAccess(userId, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Add member to organization
    await ClerkOrganizationClient.addMember({
      organizationId,
      email,
      role,
    });

    return NextResponse.json({ 
      message: 'Member added successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/organizations/members
 * Update member role in Clerk
 */
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = UpdateMemberSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { organizationId, memberId, role } = validationResult.data;

    // Check if user has admin access to this organization
    const hasAdminAccess = await ClerkOrganizationClient.hasAdminAccess(userId, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Get current organization members to check admin count
    const members = await ClerkOrganizationClient.getOrganizationMembers(organizationId);
    const memberToUpdate = members.find(m => m.id === memberId);
    
    if (!memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent changing own role to non-admin if they're the only admin
    if (memberToUpdate.userId === userId && role !== 'admin') {
      const adminCount = members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin from the organization' }, { status: 400 });
      }
    }

    // Update member role in Clerk
    await ClerkOrganizationClient.updateMemberRole(organizationId, memberId, role);

    return NextResponse.json({ 
      message: 'Member role updated successfully' 
    });

  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/members
 * Remove a member from an organization in Clerk
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const memberId = searchParams.get('memberId');

    if (!organizationId || !memberId) {
      return NextResponse.json({ error: 'Organization ID and Member ID are required' }, { status: 400 });
    }

    // Check if user has admin access to this organization
    const hasAdminAccess = await ClerkOrganizationClient.hasAdminAccess(userId, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Get current organization members to check admin count
    const members = await ClerkOrganizationClient.getOrganizationMembers(organizationId);
    const memberToRemove = members.find(m => m.id === memberId);
    
    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent removing the last admin
    if (memberToRemove.role === 'admin') {
      const adminCount = members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin from the organization' }, { status: 400 });
      }
    }

    // Prevent removing yourself
    if (memberToRemove.userId === userId) {
      return NextResponse.json({ error: 'Cannot remove yourself from the organization' }, { status: 400 });
    }

    // Remove member from organization in Clerk
    await ClerkOrganizationClient.removeMember(organizationId, memberId);

    return NextResponse.json({ 
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
