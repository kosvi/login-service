import { readFileSync } from 'fs';

const getPageContent = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const pageContent = readFileSync(`${__dirname}/../html/ui.html`, 'utf-8');
      resolve(pageContent.toString());
    } catch (error) {
      reject(error);
    }
  });
};

export const profileService = {
  getPageContent
};