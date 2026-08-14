import { app } from './app.js';
import { env } from './config/env.js';

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Schooler API disponible en http://localhost:${env.PORT}`);
  });
}

export default app;
