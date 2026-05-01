import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import * as Multer from 'multer';
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
    const parentDir = path.dirname(absolutePath);

    try {
      // Deletar o arquivo físico
      await fs.unlink(absolutePath);

      // Verificar se a pasta pai (ex: uploads/products/{productId}) ficou vazia
      // Mas apenas se for uma subpasta (evitar deletar o 'uploads' raiz)
      if (parentDir !== this.uploadDir) {
        const files = await fs.readdir(parentDir);
        if (files.length === 0) {
          await fs.rmdir(parentDir);
        }
      }
    } catch (error) {
      // Se o arquivo não existir, ignoramos silenciosamente
      // Caso contrário, logamos o erro (ex: erro de permissão)
      if (error.code !== 'ENOENT') {
        console.error(
          `Erro ao deletar arquivo ou pasta em ${absolutePath}:`,
          error,
        );
      }
    }
  }
}
