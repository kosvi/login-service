// import utilities and CONSTANTS
import { PORT } from './utils/config';
import { logger } from './utils/logger';

// Database stuff
import { db } from './services/database';
import { migrations } from './migrations/migrations';

// Import createServer so we can start taking in requests
import { createServer as HttpCreateServer } from 'http';

// and finally import the app itself
import { app } from './app';

const server = HttpCreateServer(app);

const start = async (): Promise<void> => {
  // run database migrations
  if (!(await db.runMigrations(migrations))) {
    // migrations failed
    logger.error('Database migrations failed, exiting...');
    process.exit(1);
  }
  // Start server
  server.listen(PORT, () => {
    logger.log(`server started on port ${PORT}`);
  });
};

void start();
