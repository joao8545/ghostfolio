import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';
import { ScraperConfiguration } from '@ghostfolio/common/interfaces';

import { Injectable } from '@nestjs/common';
import { CustomDataSource, Prisma } from '@prisma/client';

@Injectable()
export class CustomDataSourceService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(data: {
    name: string;
    scraperConfiguration: ScraperConfiguration;
    userId?: string;
  }): Promise<CustomDataSource> {
    return this.prismaService.customDataSource.create({
      data: {
        name: data.name,
        scraperConfiguration: data.scraperConfiguration as Prisma.JsonObject,
        userId: data.userId
      }
    });
  }

  public async delete(id: string): Promise<CustomDataSource> {
    return this.prismaService.customDataSource.delete({
      where: { id }
    });
  }

  public async get(id: string): Promise<CustomDataSource | null> {
    return this.prismaService.customDataSource.findUnique({
      where: { id }
    });
  }

  public async getByName(name: string): Promise<CustomDataSource | null> {
    return this.prismaService.customDataSource.findUnique({
      where: { name }
    });
  }

  public async getAll(userId?: string): Promise<CustomDataSource[]> {
    const where: Prisma.CustomDataSourceWhereInput = userId
      ? {
          OR: [{ userId }, { userId: null }]
        }
      : { userId: null };

    return this.prismaService.customDataSource.findMany({
      orderBy: { name: 'asc' },
      where
    });
  }

  public async update(
    id: string,
    data: {
      name?: string;
      scraperConfiguration?: ScraperConfiguration;
    }
  ): Promise<CustomDataSource> {
    return this.prismaService.customDataSource.update({
      data: {
        name: data.name,
        scraperConfiguration: data.scraperConfiguration as Prisma.JsonObject
      },
      where: { id }
    });
  }
}
