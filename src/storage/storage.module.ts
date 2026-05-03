import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageProvider } from './storage.provider';
import { SupabaseStorageProvider } from './supabase-storage.provider';

@Module({
  providers: [
    StorageService,
    {
      provide: StorageProvider,
      useClass: SupabaseStorageProvider,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
