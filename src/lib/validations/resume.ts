// Resume file validation
// Validates PDF files for resume upload

import { FILE_LIMITS } from "./common";

export type ResumeValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validates a file for resume upload.
 * Checks that file is a PDF and under 10MB.
 *
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateResumeFile(file: File): ResumeValidationResult {
  // Check file type - must be PDF
  if (
    !(FILE_LIMITS.RESUME.allowedTypes as readonly string[]).includes(file.type)
  ) {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  // Check file size - must be under 10MB
  if (file.size > FILE_LIMITS.RESUME.maxBytes) {
    return { valid: false, error: "File size must be under 10MB" };
  }

  return { valid: true };
}
