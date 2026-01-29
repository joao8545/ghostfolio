import { PrismaModule } from '@ghostfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

import { CustomDataSourceService } from './custom-data-source.service';

@Module({
  imports: [PrismaModule],
  providers: [CustomDataSourceService],
  exports: [CustomDataSourceService]
})
export class CustomDataSourceModule {}
