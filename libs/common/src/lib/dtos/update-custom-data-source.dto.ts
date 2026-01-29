import { ScraperConfiguration } from '@ghostfolio/common/interfaces';

import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  scraperConfiguration?: ScraperConfiguration;
}
