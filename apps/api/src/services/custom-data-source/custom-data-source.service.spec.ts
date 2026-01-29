import { Test, TestingModule } from '@nestjs/testing';
import { CustomDataSourceService } from './custom-data-source.service';
import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';

describe('CustomDataSourceService', () => {
  let service: CustomDataSourceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomDataSourceService,
        {
          provide: PrismaService,
          useValue: {
            customDataSource: {
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn()
            }
          }
        }
      ]
    }).compile();

    service = module.get<CustomDataSourceService>(CustomDataSourceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a custom data source', async () => {
      const mockCustomDataSource = {
        id: 'test-id',
        name: 'Card Market',
        scraperConfiguration: {
          url: 'https://example.com',
          selector: '.price'
        },
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest
        .spyOn(prismaService.customDataSource, 'create')
        .mockResolvedValue(mockCustomDataSource as any);

      const result = await service.create({
        name: 'Card Market',
        scraperConfiguration: {
          url: 'https://example.com',
          selector: '.price'
        },
        userId: 'user-id'
      });

      expect(result).toEqual(mockCustomDataSource);
      expect(prismaService.customDataSource.create).toHaveBeenCalledWith({
        data: {
          name: 'Card Market',
          scraperConfiguration: {
            url: 'https://example.com',
            selector: '.price'
          },
          userId: 'user-id'
        }
      });
    });
  });

  describe('getAll', () => {
    it('should return all custom data sources for a user', async () => {
      const mockDataSources = [
        {
          id: 'test-id-1',
          name: 'Card Market',
          scraperConfiguration: {},
          userId: 'user-id',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-id-2',
          name: 'Steam Market',
          scraperConfiguration: {},
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      jest
        .spyOn(prismaService.customDataSource, 'findMany')
        .mockResolvedValue(mockDataSources as any);

      const result = await service.getAll('user-id');

      expect(result).toEqual(mockDataSources);
      expect(prismaService.customDataSource.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        where: {
          OR: [{ userId: 'user-id' }, { userId: null }]
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete a custom data source', async () => {
      const mockCustomDataSource = {
        id: 'test-id',
        name: 'Card Market',
        scraperConfiguration: {},
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest
        .spyOn(prismaService.customDataSource, 'delete')
        .mockResolvedValue(mockCustomDataSource as any);

      const result = await service.delete('test-id');

      expect(result).toEqual(mockCustomDataSource);
      expect(prismaService.customDataSource.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });
  });
});
