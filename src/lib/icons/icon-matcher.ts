// Icon matching utilities for auto-suggesting devicons based on skill names
// Uses cascading strategy: exact match -> alias match -> partial match

import { DEVICON_REGISTRY, type DeviconEntry, type IconCategory } from "./devicon-registry";

/**
 * Find a matching devicon for a given skill name.
 * Uses cascading matching strategy:
 * 1. Exact match on icon name or id (case-insensitive)
 * 2. Alias match (e.g., "reactjs" matches React)
 * 3. Partial match on name or id (e.g., "type" matches TypeScript)
 *
 * @param skillName - The skill name to find a matching icon for
 * @returns Matching DeviconEntry or null if no match found
 */
export function findMatchingIcon(skillName: string): DeviconEntry | null {
  if (!skillName || skillName.trim() === "") {
    return null;
  }

  const normalized = skillName.toLowerCase().trim();

  // 1. Exact match on name or id
  const exactMatch = DEVICON_REGISTRY.find(
    (icon) =>
      icon.name.toLowerCase() === normalized ||
      icon.id.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;

  // 2. Alias match
  const aliasMatch = DEVICON_REGISTRY.find((icon) =>
    icon.aliases.some((alias) => alias.toLowerCase() === normalized)
  );
  if (aliasMatch) return aliasMatch;

  // 3. Partial match on name or id (must start with query)
  const partialMatch = DEVICON_REGISTRY.find(
    (icon) =>
      icon.name.toLowerCase().startsWith(normalized) ||
      icon.id.toLowerCase().startsWith(normalized)
  );
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * Search devicons by query string.
 * Returns icons whose name, id, or aliases match the query.
 * When query is empty, returns all icons.
 *
 * @param query - Search query string
 * @param category - Optional category filter
 * @returns Array of matching DeviconEntry items
 */
export function searchDevicons(
  query: string,
  category?: IconCategory | "all"
): DeviconEntry[] {
  const normalized = query.toLowerCase().trim();

  // Filter by category first if specified
  const filtered = category && category !== "all"
    ? DEVICON_REGISTRY.filter((icon) => icon.category === category)
    : [...DEVICON_REGISTRY];

  // If no query, return all (filtered by category if applicable)
  if (!normalized) {
    return filtered;
  }

  // Search in name, id, and aliases
  return filtered.filter((icon) => {
    const nameMatch = icon.name.toLowerCase().includes(normalized);
    const idMatch = icon.id.toLowerCase().includes(normalized);
    const aliasMatch = icon.aliases.some((alias) =>
      alias.toLowerCase().includes(normalized)
    );
    return nameMatch || idMatch || aliasMatch;
  });
}

/**
 * Get icons by category.
 *
 * @param category - The category to filter by
 * @returns Array of DeviconEntry items in that category
 */
export function getIconsByCategory(category: IconCategory): DeviconEntry[] {
  return DEVICON_REGISTRY.filter((icon) => icon.category === category);
}
