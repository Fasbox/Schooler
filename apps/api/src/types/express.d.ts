declare global {
  namespace Express {
    interface Request {
      auth: { userId: string; token: string; email?: string };
    }
  }
}

export {};
