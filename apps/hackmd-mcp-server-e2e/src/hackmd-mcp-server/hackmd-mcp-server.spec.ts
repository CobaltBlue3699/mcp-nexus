import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  ListToolsRequest,
  ListToolsResultSchema,
} from '@modelcontextprotocol/sdk/types.js';

const mcpEndpoint = 'http://localhost:3001/hackmd/mcp';

describe('HackMD MCP Server E2E with SDK', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ name: 'e2e-sdk-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(mcpEndpoint));
    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('should list the available tools', async () => {
    const request: ListToolsRequest = { method: 'tools/list', params: {} };
    const result = await client.request(request, ListToolsResultSchema);

    expect(result.tools).toBeInstanceOf(Array);
    const toolNames = result.tools.map((tool) => tool.name);
    expect(toolNames).toContain('get_user');
    expect(toolNames).toContain('list_notes');
    expect(toolNames).toContain('get_note');
    expect(toolNames).toContain('post_note');
    expect(toolNames).toContain('update_note');
  });

  it('should perform a full lifecycle: post, update, and get a note', async () => {
    const uniqueTitle = `My E2E Test Note - ${Date.now()}`;
    const initialContent = `# ${uniqueTitle}\nThis is the initial content.`;
    const updatedContent = `# ${uniqueTitle}\nThis is the updated content.`;

    // 1. Post a new note
    const postResult = await client.callTool({
      name: 'post_note',
      arguments: {
        content: initialContent,
      },
    }) as any;
    const newNoteInWrapper = JSON.parse(postResult.content[0].text);
    const newNoteId = newNoteInWrapper.note.id;

    expect(newNoteId).toBeDefined();

    // 2. Update the note
    const updateResult = await client.callTool({
      name: 'update_note',
      arguments: {
        noteId: newNoteId,
        content: updatedContent,
      },
    }) as any;
    expect(updateResult.content[0].type).toBe('text');

    const updatedNote = JSON.parse(updateResult.content[0].text);
    expect(updatedNote.content).toBe(updatedContent);

    // 3. Get the note to finally verify the content
    const getResult = await client.callTool({
      name: 'get_note',
      arguments: {
        id: newNoteId,
      },
    }) as any;
    expect(getResult.content[0].type).toBe('text');
    const finalNote = JSON.parse(getResult.content[0].text);

    expect(finalNote.id).toBe(newNoteId);
    expect(finalNote.title).toBe(uniqueTitle);
    expect(finalNote.content).toBe(updatedContent);
  });
});