import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format category name by removing prefixes like "en:" and formatting for display
 * @param category The raw category string from the API
 * @returns A formatted category name for display
 */
export function formatCategoryName(category: string): string {
  return category
    .replace(/-/g, ' ')
    .replace(/^en:/i, '') // Remove "en:" prefix at the beginning, case-insensitive
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param text The text to truncate
 * @param maxLength The maximum length of the text
 * @returns The truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength).trim() + "..." : text;
}

/**
 * Format ingredient text for better readability
 * @param ingredientsText The raw ingredients text
 * @returns Formatted ingredients text
 */
export function formatIngredientsText(ingredientsText: string): string {
  if (!ingredientsText) return "No ingredients listed";
  // Clean up common formatting issues
  return ingredientsText
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/__/g, '')   // Remove underline markers
    .replace(/\*/g, '')   // Remove single asterisks
    .replace(/_/g, '')    // Remove underscores
    .trim();
}