import { ScraperConfiguration } from '@ghostfolio/common/interfaces';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  scraperConfiguration?: ScraperConfiguration;
}
