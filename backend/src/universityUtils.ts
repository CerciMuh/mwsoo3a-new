// University utilities now backed by local JSON dataset (no DB usage)
import { fetchAllUniversities } from './externalUniversities';

// Extract domain from email
export const extractDomain = (email: string): string => {
  return email.split('@')[1]?.toLowerCase() || '';
};

// Find university by email domain (from JSON dataset)
export const findUniversityByEmailDomain = async (email: string): Promise<any> => {
  const emailDomain = extractDomain(email);
  if (!emailDomain) return null;
  const domain = emailDomain.toLowerCase();
  const list = await fetchAllUniversities();

  // Fast exact match map
  const byDomain = new Map<string, any>(list.map(u => [u.domain.toLowerCase(), u]));
  if (byDomain.has(domain)) return byDomain.get(domain);

  // Longest suffix match (handles subdomains like student.example.edu -> example.edu)
  let best: { uni: any; len: number } | null = null;
  for (const u of list) {
    const d = u.domain.toLowerCase();
    if (domain === d || domain.endsWith(`.${d}`)) {
      if (!best || d.length > best.len) {
        best = { uni: u, len: d.length };
      }
    }
  }
  if (best) return best.uni;

  // Strip common email subdomain prefixes and retry exact match
  const commonPrefixes = [
    'student','students',
    'postgrad','postgraduate','pg','grad','graduate','research',
    'undergrad','undergraduate','ug',
    'phd','doctoral','doctorate',
    'mail','email','mx','smtp','imap','webmail',
    'my','portal','campus','uni','alumni'
  ];
  const labels = domain.split('.');
  // Try removing 1 up to 3 left-most labels, prioritizing known prefixes
  for (let removeCount = 1; removeCount <= Math.min(3, labels.length - 2); removeCount++) {
    const chopped = labels.slice(removeCount).join('.');
    const removedLabel = labels[removeCount - 1];
    // Prefer chopping if the removed label is a common prefix; still try others up to 3 levels
    if (removeCount === 1 && !commonPrefixes.includes(removedLabel)) continue;
    if (byDomain.has(chopped)) return byDomain.get(chopped);
  }

  // Last resort: fuzzy contains on dot boundaries (very conservative)
  for (const u of list) {
    const d = u.domain.toLowerCase();
    if (domain.includes(`.${d}`) || d.includes(`.${domain}`)) {
      return u;
    }
  }

  return null;
};

// Get all universities (from JSON dataset)
export const getAllUniversities = async () => {
  return fetchAllUniversities();
};

// Get university by ID (from JSON dataset)
export const getUniversityById = async (id: number) => {
  const list = await fetchAllUniversities();
  return list.find(u => u.id === id) || null;
};