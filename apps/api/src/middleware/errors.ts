import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Ruta no encontrada.' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Datos inválidos.', issues: error.issues });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.code, message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' });
};
