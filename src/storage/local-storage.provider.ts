import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageProvider extends StorageProvider {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    super();
    this.ensureDirExists(this.uploadDir);
  }

  private async ensureDirExists(dir: string) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async save(file: Express.Multer.File, folder: string = ''): Promise<string> {
    const targetDir = path.join(this.uploadDir, folder);
    await this.ensureDirExists(targetDir);

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(targetDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    // Return the relative path from the uploads root
    return path.join(folder, fileName).replace(/\\/g, '/');
  }

  async delete(filePath: string): Promise<void> {
    const absolutePath = path.join(this.uploadDir, filePath);
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      // If file doesn't exist, we don't care much, but log it if it's something else
      console.error(`Error deleting file ${absolutePath}:`, error);
    }
  }
}
