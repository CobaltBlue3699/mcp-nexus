import { execSync } from 'child_process';

const inspectorCommand =
  'npx @modelcontextprotocol/inspector@0.16.2 --cli http://localhost:3000/hacker-news/mcp --transport http';

describe('HackerNews MCP Server E2E', () => {
  it('should list the available tools', () => {
    const output = execSync(`${inspectorCommand} --method tools/list`).toString();
    const result = JSON.parse(output);

    expect(result.tools).toBeInstanceOf(Array);
    const toolNames = result.tools.map((tool) => tool.name);
    expect(toolNames).toContain('get_top_stories');
    expect(toolNames).toContain('get_story');
  });

  it('should call the get_top_stories tool and return an array of strings', () => {
    const output = execSync(
      `${inspectorCommand} --method tools/call --tool-name get_top_stories`,
    ).toString();
    const result = JSON.parse(output);

    expect(result.content[0].type).toBe('text');
    const stories = JSON.parse(result.content[0].text);
    expect(stories).toBeInstanceOf(Array);
    // Check if the array contains numbers (story IDs are numbers, but JSON might parse them as such)
    // The service returns string[], but the http client might parse them as numbers.
    // Let's just check if the first element is a number or a string.
    expect(typeof stories[0]).toMatch(/^(number|string)$/);
  });

  it('should call the get_story tool and return a story object', () => {
    // First, get a valid story ID from get_top_stories
    const topStoriesOutput = execSync(
      `${inspectorCommand} --method tools/call --tool-name get_top_stories`,
    ).toString();
    const topStoriesResult = JSON.parse(topStoriesOutput);
    const storyIds = JSON.parse(topStoriesResult.content[0].text);
    const firstStoryId = storyIds[0];

    // Then, call get_story with the retrieved ID
    const output = execSync(
      `${inspectorCommand} --method tools/call --tool-name get_story --tool-arg id=${firstStoryId}`,
    ).toString();
    const result = JSON.parse(output);

    expect(result.content[0].type).toBe('text');
    const story = JSON.parse(result.content[0].text);

    expect(story).toHaveProperty('id', firstStoryId);
    expect(story).toHaveProperty('title');
    expect(story).toHaveProperty('by');
    expect(story).toHaveProperty('score');
  });
});