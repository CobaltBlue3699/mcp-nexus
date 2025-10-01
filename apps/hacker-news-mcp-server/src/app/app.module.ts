import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { HackerNewsService } from './hacker-news/hacker-news.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    McpModule.forRoot({
      name: 'hacker-news-mcp',
      version: '1.0.0',
      instructions: 'This MCP server provides access to Hacker News data.',
      transport: [McpTransportType.SSE, McpTransportType.STREAMABLE_HTTP],
      sseEndpoint: 'sse',
      apiPrefix: '/',
    }),
  ],
  controllers: [],
  providers: [HackerNewsService],
})
export class AppModule {}
