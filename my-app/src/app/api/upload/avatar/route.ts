import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Allowed file types and their MIME types
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload/avatar
 * Upload and validate user avatar
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Additional security: Check file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const allowedExtensions = Object.values(ALLOWED_TYPES);
    
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'File extension not allowed' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
    const fileNameSafe = `avatar_${userId}_${timestamp}_${randomString}${extension}`;
    const filePath = join(uploadsDir, fileNameSafe);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Additional security: Validate file content (basic magic number check)
    const isValidImage = validateImageContent(buffer, file.type);
    if (!isValidImage) {
      return NextResponse.json({ 
        error: 'Invalid image file content' 
      }, { status: 400 });
    }

    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/avatars/${fileNameSafe}`;

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Validate image file content using magic numbers
 */
function validateImageContent(buffer: Buffer, mimeType: string): boolean {
  const header = buffer.subarray(0, 8);
  
  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && 
           header[3] === 0x47 && header[4] === 0x0D && header[5] === 0x0A && 
           header[6] === 0x1A && header[7] === 0x0A;
  }
  
  // GIF: 47 49 46 38 (GIF8)
  if (mimeType === 'image/gif') {
    return header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38;
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (mimeType === 'image/webp') {
    return header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
           header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  }
  
  return false;
}
