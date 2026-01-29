import { ScraperConfiguration } from '@ghostfolio/common/interfaces';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomDataSourceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  scraperConfiguration: ScraperConfiguration;
}
