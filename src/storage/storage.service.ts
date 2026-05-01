import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import * as Multer from 'multer';

@Injectable()
export class StorageService {
  constructor(private readonly storageProvider: StorageProvider) {}

  async uploadFile(file: Express.Multer.File, folder: string = ''): Promise<string> {
    return this.storageProvider.save(file, folder);
  }

  async deleteFile(filePath: string): Promise<void> {
    return this.storageProvider.delete(filePath);
  }
}
