import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
};

// CSRF token configuration
export const CSRF_CONFIG = {
  tokenLength: 32,
  headerName: 'X-CSRF-Token',
  cookieName: 'csrf-token',
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Input sanitization patterns
export const SANITIZATION_PATTERNS = {
  // Remove potentially dangerous HTML tags and attributes
  html: /<[^>]*>/g,
  // Remove JavaScript protocol
  javascript: /javascript:/gi,
  // Remove event handlers
  eventHandlers: /on\w+\s*=/gi,
  // Remove data URLs (potential for XSS)
  dataUrls: /data:\s*[^;]*;base64,/gi,
};

// File upload security configuration
export const FILE_UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
  },
  // Magic numbers for file validation
  magicNumbers: {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    gif: [0x47, 0x49, 0x46, 0x38],
    webp: [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
  },
};

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
};

// Session security configuration
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

// API security configuration
export const API_SECURITY_CONFIG = {
  // Maximum request body size
  maxBodySize: '10mb',
  // Allowed origins for CORS
  allowedOrigins: process.env.NODE_ENV === 'production' 
    ? ['https://sparksstack.com', 'https://www.sparksstack.com']
    : ['http://localhost:3000'],
  // Rate limiting for different endpoints
  rateLimits: {
    default: { windowMs: 15 * 60 * 1000, max: 100 },
    auth: { windowMs: 15 * 60 * 1000, max: 5 },
    upload: { windowMs: 15 * 60 * 1000, max: 10 },
    organizations: { windowMs: 15 * 60 * 1000, max: 50 },
  },
};

// Security utility functions
export class SecurityUtils {
  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Validate and sanitize input
   */
  static sanitizeInput(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(SANITIZATION_PATTERNS.html, '')
      .replace(SANITIZATION_PATTERNS.javascript, '')
      .replace(SANITIZATION_PATTERNS.eventHandlers, '')
      .replace(SANITIZATION_PATTERNS.dataUrls, '')
      .substring(0, maxLength);
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    const fileType = file.type;
    if (!FILE_UPLOAD_CONFIG.allowedTypes[fileType as keyof typeof FILE_UPLOAD_CONFIG.allowedTypes]) {
      return {
        isValid: false,
        error: 'File type not allowed'
      };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const allowedExtensions = FILE_UPLOAD_CONFIG.allowedTypes[fileType as keyof typeof FILE_UPLOAD_CONFIG.allowedTypes];
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File extension not allowed'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }
    
    if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
      errors.push(`Password must be less than ${PASSWORD_REQUIREMENTS.maxLength} characters`);
    }
    
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if request is from allowed origin
   */
  static isAllowedOrigin(origin: string): boolean {
    return API_SECURITY_CONFIG.allowedOrigins.includes(origin);
  }

  /**
   * Add security headers to response
   */
  static addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}
