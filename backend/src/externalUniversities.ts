import fs from 'fs';
import path from 'path';

export interface ExternalUniversity {
  name: string;
  country: string;
  domains?: string[];
  domain?: string;
  web_pages?: string[];
}

export interface MappedUniversity {
  id: number;
  name: string;
  country: string;
  domain: string;
}

export interface FetchParams {
  name?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

// In-memory dataset cache (full list), plus TTL
let datasetCache: { data: MappedUniversity[]; ts: number } | null = null;
const TTL_MS = 1000 * 60 * 60; // 1 hour

function resolveUniversitiesJsonPath(): string {
  const envPath = process.env.UNIVERSITIES_JSON_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    path.resolve(process.cwd(), 'world_universities.json'),
    path.resolve(__dirname, '..', '..', 'world_universities.json'),
    path.resolve(__dirname, '..', 'world_universities.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  // Fall back to process.cwd even if not present; fs.readFile will throw which we catch upstream
  return path.resolve(process.cwd(), 'world_universities.json');
}

function mapAndDedupe(raw: ExternalUniversity[]): MappedUniversity[] {
  const prelim = raw
    .map((u) => {
      const domain = u.domain || (Array.isArray(u.domains) ? u.domains[0] : undefined);
      if (!domain) return null;
      return { name: u.name, country: u.country, domain };
    })
    .filter(Boolean) as Array<Omit<MappedUniversity, 'id'>>;

  const seen = new Set<string>();
  const deduped: Array<Omit<MappedUniversity, 'id'>> = [];
  for (const u of prelim) {
    if (!seen.has(u.domain)) {
      seen.add(u.domain);
      deduped.push(u);
    }
  }

  return deduped.map((u, idx) => ({ id: 100000 + idx, ...u }));
}

async function loadDataset(): Promise<MappedUniversity[]> {
  if (datasetCache && Date.now() - datasetCache.ts < TTL_MS) {
    return datasetCache.data;
  }
  const filePath = resolveUniversitiesJsonPath();
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const json = JSON.parse(content) as unknown;
  if (!Array.isArray(json)) {
    throw new Error('Local universities JSON is not an array');
  }
  const data = mapAndDedupe(json as ExternalUniversity[]);
  datasetCache = { data, ts: Date.now() };
  return data;
}

export async function fetchAllUniversities(params: FetchParams = {}): Promise<MappedUniversity[]> {
  const all = await loadDataset();
  const name = params.name?.toLowerCase() || '';
  const country = params.country?.toLowerCase();

  let filtered = all;
  if (name) {
    filtered = filtered.filter((u) => u.name.toLowerCase().includes(name));
  }
  if (country) {
    filtered = filtered.filter((u) => u.country.toLowerCase() === country);
  }

  const offset = params.offset ?? 0;
  const limit = params.limit ?? filtered.length;
  return filtered.slice(offset, offset + limit);
}

export function clearUniversitiesCache() {
  datasetCache = null;
}

export async function updateExternalDataset(): Promise<{ status: string; message: string }> {
  // For file-based data, updating means clearing cache and attempting to reload to validate
  try {
    datasetCache = null;
    await loadDataset();
    return { status: 'ok', message: 'Dataset reloaded from local JSON' };
  } catch (err: any) {
    datasetCache = null;
    return { status: 'error', message: 'Failed to reload dataset; check JSON path and format' };
  }
}
