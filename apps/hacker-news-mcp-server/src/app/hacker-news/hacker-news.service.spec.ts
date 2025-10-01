import { Test, TestingModule } from '@nestjs/testing';
import { HackerNewsService } from './hacker-news.service';
import { HttpModule } from '@nestjs/axios';

describe('HackerNewsService', () => {
  let service: HackerNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [HackerNewsService],
    }).compile();

    service = module.get<HackerNewsService>(HackerNewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Additional tests can be added here
  describe('getTopStories', () => {
    it('should return an array of story IDs', async () => {
      const result = await service.getTopStories();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getStory', () => {
    it('should return a story object for a valid ID', async () => {
      const result = await service.getStory({ id: 1 });
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });

    it('should return null for an invalid ID', async () => {
      const result = await service.getStory({ id: -1 });
      expect(result).toBeNull();
    });
  });
});
