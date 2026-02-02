import { ScraperConfiguration } from '@ghostfolio/common/interfaces';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomDataSourceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  scraperConfiguration: ScraperConfiguration;
}
