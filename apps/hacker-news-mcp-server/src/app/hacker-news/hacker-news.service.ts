import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import z from 'zod';

export interface Story {
  by: string;
  descendants: number; // number of comments
  id: number;
  kids?: number[]; // array of comment IDs
  score: number; // points
  time: number;
  title: string;
  type: string;
  url?: string; // URL of the story
}

@Injectable()
export class HackerNewsService {
  // inject HttpService
  constructor(private readonly httpService: HttpService) {}

  @Tool({
    name: 'get_top_stories',
    description: 'Get the top stories from Hacker News.',
  })
  async getTopStories(): Promise<string[]> {
    const response = await this.httpService
      .get<string[]>(`https://hacker-news.firebaseio.com/v0/topstories.json`)
      .toPromise();
    // console.log('Fetched top stories:', response?.data);
    return response ? response.data : []; // return the array of story IDs
  }

  @Tool({
    name: 'get_story',
    description:
      'Get the details of a story from Hacker News by its ID. The ID should be provided as a parameter.',
    parameters: z.object({
      id: z.number().describe('The ID of the story to retrieve.'),
    }),
  })
  async getStory({ id }: { id: number }): Promise<Story | null> {
    const response = await this.httpService
      .get<Story>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .toPromise();
    // console.log('Fetched story:', response?.data);
    return response ? response.data : null;
  }
}
