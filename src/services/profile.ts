import { readFileSync } from 'fs';

export class ProfileService {
  static async getPageContent(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const pageContent = readFileSync(`${__dirname}/../html/ui.html`, 'utf-8');
        resolve(pageContent.toString());
      } catch (error) {
        reject(error);
      }
    });
  }
}
