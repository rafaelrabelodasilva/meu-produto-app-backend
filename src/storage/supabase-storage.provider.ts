import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class SupabaseStorageProvider extends StorageProvider {
  private supabase: SupabaseClient<any, any, any>;
  private bucketName: string;

  constructor() {
    super();
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.bucketName = process.env.SUPABASE_BUCKET || 'meu-produto-images';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_KEY must be defined in environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async save(file: Express.Multer.File, folder: string = ''): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase: ${error.message}`);
    }

    // Retornamos apenas o caminho relativo (path) para manter compatibilidade com o que é salvo no banco
    return data.path;
  }

  async delete(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Failed to delete file from Supabase: ${error.message}`);
    }
  }
}
