import { Request, Response } from 'express';
import { findUniversityByEmailDomain, getUniversityById } from '../universityUtils';
import { createUserQueries } from '../database';

// We create queries once per module load. If needed, this can be refactored into a factory.
const queries = createUserQueries();

export async function getMyUniversity(req: Request, res: Response) {
  try {
    let user: any = null;
    const ru: any = (req as any).user;
    if (ru?.source === 'cognito' && ru?.email) {
      user = queries.findUserByEmail.get(ru.email);
      if (!user) {
        const domainMatch = await findUniversityByEmailDomain(ru.email).catch(() => null);
        const uniId = domainMatch ? domainMatch.id : null;
        queries.createUser.run(ru.email, uniId);
        user = queries.findUserByEmail.get(ru.email);
      }
    } else if (ru?.userId) {
      user = queries.findUserById.get(ru.userId) as any;
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.universityId) {
      return res.json({ university: null, message: 'No university assigned' });
    }

    const university = await getUniversityById(user.universityId);
    return res.json({ university });
  } catch (error) {
    console.error('Error fetching user university:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
