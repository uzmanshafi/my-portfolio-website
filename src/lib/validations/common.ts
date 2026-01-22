// Common validation types and helpers for server actions and forms

/**
 * Standard result type for server actions.
 * Used consistently across all CRUD operations.
 */
export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Creates a successful action result.
 */
export function success<T>(data?: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Creates a failed action result.
 */
export function failure(error: string): ActionResult<never> {
  return { success: false, error };
}

/**
 * Validates that a file size is within the specified limit.
 * @param file - File to validate
 * @param maxBytes - Maximum allowed size in bytes
 * @returns Error message if invalid, undefined if valid
 */
export function validateFileSize(
  file: File,
  maxBytes: number
): string | undefined {
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File size (${fileMB}MB) exceeds maximum allowed (${maxMB}MB)`;
  }
  return undefined;
}

/**
 * Validates that a file type is in the allowed list.
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types (e.g., ['image/jpeg', 'image/png'])
 * @returns Error message if invalid, undefined if valid
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): string | undefined {
  if (!allowedTypes.includes(file.type)) {
    const allowed = allowedTypes
      .map((t) => t.split("/")[1]?.toUpperCase() || t)
      .join(", ");
    return `File type "${file.type}" not allowed. Accepted: ${allowed}`;
  }
  return undefined;
}

/**
 * Validates a file against both size and type constraints.
 * @param file - File to validate
 * @param options - Validation options
 * @returns Error message if invalid, undefined if valid
 */
export function validateFile(
  file: File,
  options: {
    maxBytes: number;
    allowedTypes: string[];
  }
): string | undefined {
  const sizeError = validateFileSize(file, options.maxBytes);
  if (sizeError) return sizeError;

  const typeError = validateFileType(file, options.allowedTypes);
  if (typeError) return typeError;

  return undefined;
}

// Common file validation presets
export const FILE_LIMITS = {
  IMAGE: {
    maxBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  RESUME: {
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["application/pdf"],
  },
} as const;
