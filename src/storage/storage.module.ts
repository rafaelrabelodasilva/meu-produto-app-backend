import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageProvider } from './storage.provider';
import { LocalStorageProvider } from './local-storage.provider';

@Module({
  providers: [
    StorageService,
    {
      provide: StorageProvider,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
