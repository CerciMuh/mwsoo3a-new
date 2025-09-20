import { Request, Response } from 'express';
import { fetchAllUniversities, clearUniversitiesCache, updateExternalDataset, getDatasetStatus } from '../externalUniversities';

export async function listUniversities(req: Request, res: Response) {
  const limitParam = Number(req.query.limit);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
  try {
    const list = await fetchAllUniversities({ limit });
    return res.json({ source: 'file-or-remote', universities: list });
  } catch (err) {
    console.error('Error fetching universities:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export function refreshUniversitiesCache(_req: Request, res: Response) {
  clearUniversitiesCache();
  res.json({ message: 'External universities cache cleared' });
}

export async function searchUniversities(req: Request, res: Response) {
  const name = typeof req.query.name === 'string' ? req.query.name : undefined;
  const country = typeof req.query.country === 'string' ? req.query.country : undefined;
  const limitParam = Number(req.query.limit);
  const offsetParam = Number(req.query.offset);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : undefined;

  const toPublic = (u: any) => ({
    web_page: `http://${u.domain}/`,
    country: u.country,
    domain: u.domain,
    name: u.name,
  });

  try {
    const results = await fetchAllUniversities({ name, country, limit, offset });
    return res.json(results.map(toPublic));
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUniversities(_req: Request, res: Response) {
  try {
    const result = await updateExternalDataset().catch(() => ({ status: 'ok', message: 'Cache cleared; external update not supported' }));
    clearUniversitiesCache();
    return res.json(result);
  } catch (err) {
    console.error('Update endpoint error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update dataset' });
  }
}

export function getUniversitiesStatus(_req: Request, res: Response) {
  res.json(getDatasetStatus());
}
