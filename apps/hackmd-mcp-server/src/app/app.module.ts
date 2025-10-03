import { Module } from '@nestjs/common';
import { HackmdModule } from './hackmd/hackmd.module';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'hackmd-mcp-server',
      version: '1.0.0',
      instructions: 'This MCP server provides access to HackMD data and posting notes capabilities.',
      transport: [McpTransportType.SSE, McpTransportType.STREAMABLE_HTTP],
      sseEndpoint: 'sse',
      apiPrefix: '/',
    }),
    HackmdModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
