import { readFileSync } from 'fs';
import { logger } from '../utils/logger';
import path from 'path';

const getPageContent = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const file = path.join(process.cwd(), 'static/ui.html');
    try {
      const pageContent = readFileSync(file, 'utf-8');
      resolve(pageContent.toString());
    } catch (error) {
      logger.error(`profileService - couln't read file: ${file}`);
      reject(error);
    }
  });
};

export const profileService = {
  getPageContent
};