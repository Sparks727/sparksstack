import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

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

const RemoveMemberSchema = z.object({
  organizationId: z.string().min(1),
  memberId: z.string().min(1),
});

// In-memory storage (replace with database in production)
let organizations: any[] = [];

/**
 * POST /api/organizations/members
 * Add a new member to an organization
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

    // Find organization and check if user is admin
    const orgIndex = organizations.findIndex(org => 
      org.id === organizationId && 
      org.members.some((member: any) => member.userId === userId && member.role === 'admin')
    );

    if (orgIndex === -1) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    const organization = organizations[orgIndex];

    // Check if member already exists
    const existingMember = organization.members.find((member: any) => 
      member.email === email || member.userId === userId
    );

    if (existingMember) {
      return NextResponse.json({ error: 'Member already exists in this organization' }, { status: 409 });
    }

    // Add new member
    const newMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: '', // Will be set when user accepts invitation
      email: email.trim().toLowerCase(),
      role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedBy: userId
    };

    organization.members.push(newMember);
    organizations[orgIndex] = organization;

    return NextResponse.json({ 
      member: newMember,
      message: 'Member invited successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/organizations/members
 * Update member role
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

    // Find organization and check if user is admin
    const orgIndex = organizations.findIndex(org => 
      org.id === organizationId && 
      org.members.some((member: any) => member.userId === userId && member.role === 'admin')
    );

    if (orgIndex === -1) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    const organization = organizations[orgIndex];

    // Find member to update
    const memberIndex = organization.members.findIndex((member: any) => member.id === memberId);
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent changing own role to non-admin if they're the only admin
    if (organization.members[memberIndex].userId === userId && role !== 'admin') {
      const adminCount = organization.members.filter((m: any) => m.role === 'admin' && m.status === 'active').length;
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin from the organization' }, { status: 400 });
      }
    }

    // Update member role
    organization.members[memberIndex] = {
      ...organization.members[memberIndex],
      role,
      updatedAt: new Date().toISOString()
    };

    organizations[orgIndex] = organization;

    return NextResponse.json({ 
      member: organization.members[memberIndex],
      message: 'Member role updated successfully' 
    });

  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/members
 * Remove a member from an organization
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

    // Find organization and check if user is admin
    const orgIndex = organizations.findIndex(org => 
      org.id === organizationId && 
      org.members.some((member: any) => member.userId === userId && member.role === 'admin')
    );

    if (orgIndex === -1) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    const organization = organizations[orgIndex];

    // Find member to remove
    const memberIndex = organization.members.findIndex((member: any) => member.id === memberId);
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent removing the last admin
    if (organization.members[memberIndex].role === 'admin') {
      const adminCount = organization.members.filter((m: any) => m.role === 'admin' && m.status === 'active').length;
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin from the organization' }, { status: 400 });
      }
    }

    // Prevent removing yourself
    if (organization.members[memberIndex].userId === userId) {
      return NextResponse.json({ error: 'Cannot remove yourself from the organization' }, { status: 400 });
    }

    // Remove member
    const removedMember = organization.members.splice(memberIndex, 1)[0];
    organizations[orgIndex] = organization;

    return NextResponse.json({ 
      message: 'Member removed successfully',
      removedMember
    });

  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
