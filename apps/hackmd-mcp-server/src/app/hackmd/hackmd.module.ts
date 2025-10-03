import { Module } from '@nestjs/common';
import { HackmdService } from './hackmd.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import hackmdConfig from './hackmd.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forFeature(hackmdConfig),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          baseURL: configService.get('HACKMD_API_URL'),
          headers: {
            Authorization: `Bearer ${configService.get('HACKMD_API_TOKEN')}`,
          },
          timeout: 5000,
          maxRedirects: 5,
          global: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [HackmdService],
  exports: [HackmdService],
})
export class HackmdModule {}
