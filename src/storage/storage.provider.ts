import * as Multer from 'multer';

export abstract class StorageProvider {
  abstract save(file: Express.Multer.File, folder?: string): Promise<string>;
  abstract delete(path: string): Promise<void>;
}
