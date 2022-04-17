import { readFileSync } from 'fs';
import { logger } from '../utils/logger';
import path from 'path';

const getContentOf = async (filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const file = path.join(process.cwd(), `static/${filename}`);
    try {
      const pageContent = readFileSync(file, 'utf-8');
      resolve(pageContent.toString());
    } catch (error) {
      logger.error(`profileService - couln't read file: ${file}`);
      reject(error);
    }
  });
};

const getUI = async (): Promise<string> => {
  return getContentOf('ui.html');
};

export const staticService = {
  getContentOf, getUI
};