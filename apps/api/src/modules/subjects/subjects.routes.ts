import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../lib/http-error.js';
import { createUserClient } from '../../lib/supabase.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createSubject, listSubjects, updateSubject } from './subjects.repository.js';
import { createSubjectSchema, subjectIdSchema, updateSubjectSchema } from './subjects.schema.js';

export const subjectsRouter = Router();
subjectsRouter.use(authenticate);
subjectsRouter.get('/', async (req, res) => {
  const query = z.object({ periodId: z.uuid().optional(), includeArchived: z.enum(['true', 'false']).optional() }).parse(req.query);
  res.json({ subjects: await listSubjects(createUserClient(req.auth.token), query.periodId, query.includeArchived === 'true') });
});
subjectsRouter.post('/', async (req, res) => res.status(201).json({ subject: await createSubject(createUserClient(req.auth.token), req.auth.userId, createSubjectSchema.parse(req.body)) }));
subjectsRouter.patch('/:id', async (req, res) => {
  const subject = await updateSubject(createUserClient(req.auth.token), subjectIdSchema.parse(req.params.id), updateSubjectSchema.parse(req.body));
  if (!subject) throw new HttpError(404, 'NOT_FOUND', 'Materia no encontrada.');
  res.json({ subject });
});
for (const [path, status] of [['archive', 'archived'], ['restore', 'active']] as const) {
  subjectsRouter.patch(`/:id/${path}`, async (req, res) => {
    const subject = await updateSubject(createUserClient(req.auth.token), subjectIdSchema.parse(req.params.id), { status });
    if (!subject) throw new HttpError(404, 'NOT_FOUND', 'Materia no encontrada.');
    res.json({ subject });
  });
}
