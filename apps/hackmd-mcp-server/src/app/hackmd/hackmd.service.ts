import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import z from 'zod';

export enum HackmdNotePermissionRole {
  owner = 'owner',
  signed_in = 'signed_in',
  guest = 'guest',
}

export enum HackmdNotePublishType {
  edit = 'edit',
  view = 'view',
  slide = 'slide',
  book = 'book'
}

export enum HackmdCommentPermissionType {
  disabled = 'disabled',
  forbidden = 'forbidden',
  owners = 'owners',
  signed_in_users = 'signed_in_users',
  everyone = 'everyone',
}

export enum HackmdSuggestEditPermissionType {
  disabled = 'disabled',
  forbidden = 'forbidden',
  owners = 'owners',
  signed_in_users = 'signed_in_users',
}

export interface HackmdTeam {
  id: string;
  ownerId: string;
  name: string;
  logo: string;
  path: string;
  description: string;
  visibility: 'public' | 'private';
  upgraded: boolean;
  createdAt: number;
}

export interface HackmdUser {
  id: string;
  name: string;
  email: string;
  userPath: string;
  photo: string;
  teams: HackmdTeam[];
  upgraded: boolean;
}

export interface HackmdNote {
  id: string;
  title: string;
  tags: string[];
  createdAt: number;
  titleUpdatedAt: number;
  tagsUpdatedAt: number | null;
  publishType: HackmdNotePublishType;
  publishedAt: number | null;
  permalink: string | null;
  publishLink: string;
  shortId: string;
  content: string;
  lastChangedAt: number;
  lastChangeUser: {
    name: string;
    userPath: string;
    photo: string;
    biography: string | null;
  };
  userPath: string;
  teamPath: string | null;
  readPermission: HackmdNotePermissionRole;
  writePermission: HackmdNotePermissionRole;
  folderPaths: Array<{
    id: string;
    name: string;
    icon: string;
    parentId: string | null;
    color: string;
    clientId: string;
  }>;
}

const noteSchema = z.object({
      id: z.string().describe('The unique identifier of the updated note.'),
      title: z.string().describe('The title of the updated note.'),
      tags: z.array(z.string()).describe('Tags associated with the updated note.'),
      createdAt: z.number().describe('The creation timestamp of the updated note.'),
      titleUpdatedAt: z.number().nullable().describe('The timestamp when the title was last updated.'),
      tagsUpdatedAt: z.number().nullable().describe('The timestamp when the tags were last updated, or null if never updated.'),
      publishType: z.enum([HackmdNotePublishType.edit, HackmdNotePublishType.view, HackmdNotePublishType.slide, HackmdNotePublishType.book]).describe('The publish type of the updated note.'),
      publishedAt: z.number().nullable().describe('The timestamp when the note was published, or null if not published.'),
      permalink: z.string().nullable().describe('The permalink of the updated note, or null if not available.'),
      publishLink: z.string().describe('The publish link of the updated note.'),
      shortId: z.string().describe('The short identifier of the updated note.'),
      content: z.string().describe('The content of the updated note.'),
      lastChangedAt: z.number().describe('The timestamp when the note was last changed.'),
      lastChangeUser: z.object({
        name: z.string().describe('The name of the user who last changed the note.'),
        userPath: z.string().describe('The user path of the user who last changed the note.'),
        photo: z.string().url().describe('The photo URL of the user who last changed the note.'),
        biography: z.string().nullable().describe('The biography of the user who last changed the note, or null if not available.'),
      }).describe('Information about the user who last changed the note.'),
      userPath: z.string().describe('The user path of the note owner.'),
      teamPath: z.string().nullable().describe('The team path if the note belongs to a team, or null if it does not.'),
      readPermission: z.enum([HackmdNotePermissionRole.owner, HackmdNotePermissionRole.signed_in, HackmdNotePermissionRole.guest]).describe('The read permission level of the note.'),
      writePermission: z.enum([HackmdNotePermissionRole.owner, HackmdNotePermissionRole.signed_in, HackmdNotePermissionRole.guest]).describe('The write permission level of the note.'),
      folderPaths: z.array(z.object({
        id: z.string().describe('The unique identifier of the folder.'),
        name: z.string().describe('The name of the folder.'),
        icon: z.string().describe('The icon associated with the folder.'),
        parentId: z.string().nullable().describe('The unique identifier of the parent folder, or null if it is a root folder.'),
        color: z.string().describe('The color associated with the folder.'),
        clientId: z.string().describe('The client identifier associated with the folder.'),
      })).optional().describe('An array of folders the note belongs to.'),
    });

const postNoteOutputSchema = noteSchema.omit({ folderPaths: true });

@Injectable()
export class HackmdService {
  // inject HttpService
  constructor(private readonly httpService: HttpService) { }

  @Tool({
    name: 'get_user',
    description: 'Get user information from HackMD.',
    outputSchema: z.object({
      id: z.string().describe('The unique identifier of the user.'),
      name: z.string().describe('The name of the user.'),
      email: z.string().describe('The email of the user.'),
      userPath: z.string().describe('The user path or username.'),
      photo: z.string().url().describe('The URL of the user\'s photo.'),
      teams: z.array(z.object({
        id: z.string().describe('The unique identifier of the team.'),
        ownerId: z.string().describe('The unique identifier of the team owner.'),
        name: z.string().describe('The name of the team.'),
        logo: z.string().url().describe('The URL of the team logo.'),
        path: z.string().describe('The team path.'),
        description: z.string().describe('The description of the team.'),
        visibility: z.enum(['public', 'private']).describe('The visibility of the team.'),
        upgraded: z.boolean().describe('Indicates if the team has an upgraded account.'),
        createdAt: z.number().describe('The creation timestamp of the team.'),
      })),
      upgraded: z.boolean().describe('Indicates if the user has an upgraded account.'),
    }),
  })
  async getUser(): Promise<HackmdUser> {
    // Implement the logic to call HackMD API to get user information
    const { data } = await firstValueFrom(
      this.httpService.get<HackmdUser>('/v1/me').pipe(
        catchError((error: AxiosError) => {
          throw new Error('Error fetching user data from HackMD: ' + error.message);
        }),
      ),
    );
    return data;
  }

  @Tool({
    name: 'list_notes',
    description: 'List all notes the user has access to in HackMD.',
    outputSchema: z.object({
      notes: z.array(noteSchema).describe('An array of note objects.'),
    }),
  })
  async listNotes(): Promise<{ notes: HackmdNote[] }> {
    const { data } = await firstValueFrom(
      this.httpService.get<HackmdNote[]>('/v1/notes').pipe(
        catchError((error: AxiosError) => {
          throw new Error('Error fetching notes from HackMD: ' + error.message);
        }),
      ),
    );
    return { notes: data };
  }

  @Tool({
    name: 'get_note',
    description: 'Get a specific note by its ID from HackMD.',
    parameters: z.object({
      id: z.string().describe('The unique identifier of the note to retrieve.'),
    }),
    outputSchema: noteSchema.describe('The note object corresponding to the provided ID.'),
  })
  async getNoteById({id}: {id: string}): Promise<HackmdNote> {
    const { data } = await firstValueFrom(
      this.httpService.get<HackmdNote>(`/v1/notes/${id}`).pipe(
        catchError((error: AxiosError) => {
          throw new Error('Error fetching note from HackMD: ' + error.message);
        }),
      ),
    );
    return data;
  }

  @Tool({
    name: 'post_note',
    description: 'Post a new note to HackMD.',
    parameters: z.object({
      parentFolderId: z.string().optional().describe('The ID of the parent folder to place the note in. If not provided, the note will be created in the root directory.'),
      permalink: z.string().optional().describe('The permalink for the note. If not provided, a default permalink will be generated.'),
      suggestEditPermission: z.enum([HackmdSuggestEditPermissionType.disabled, HackmdSuggestEditPermissionType.forbidden, HackmdSuggestEditPermissionType.owners, HackmdSuggestEditPermissionType.signed_in_users]).optional().describe('The suggest edit permission level for the note. Default is disabled.'),
      commentPermission: z.enum([HackmdCommentPermissionType.disabled, HackmdCommentPermissionType.forbidden, HackmdCommentPermissionType.owners, HackmdCommentPermissionType.signed_in_users, HackmdCommentPermissionType.everyone]).optional().describe('The comment permission level for the note. Default is disabled.'),
      content: z.string().describe('The content of the note in Markdown format.'),
      readPermission: z.enum([HackmdNotePermissionRole.owner, HackmdNotePermissionRole.signed_in, HackmdNotePermissionRole.guest]).optional().describe('The read permission level for the note. Default is owner.'),
      writePermission: z.enum([HackmdNotePermissionRole.owner, HackmdNotePermissionRole.signed_in, HackmdNotePermissionRole.guest]).optional().describe('The write permission level for the note. Default is owner.'),
    }),
    outputSchema: postNoteOutputSchema.describe('The created note object.'),
  })
  async postNote(params: {
    parentFolderId?: string;
    permalink?: string;
    suggestEditPermission?: HackmdSuggestEditPermissionType;
    commentPermission?: HackmdCommentPermissionType;
    readPermission?: HackmdNotePermissionRole;
    writePermission?: HackmdNotePermissionRole;
    content: string;
  }): Promise<HackmdNote> {

    const { data } = await firstValueFrom(
      this.httpService.post('/v1/notes', {
        ...params
      }).pipe(
        catchError((error: AxiosError) => {
          throw new Error('Error posting note to HackMD: ' + error.message);
        }),
      ),
    );

    // console.log('Posted note, response data:', data);

    return data;
  }

  @Tool({
    name: 'update_note',
    description: `Update a note's content or permissions from HackMD for the current user`,
    parameters: z.object({
      noteId: z.string().describe('The unique identifier of the note to update.'),
      content: z.string().optional().describe('The new content for the note in Markdown format. If not provided, the content will remain unchanged.'),
      readPermission: z.enum([HackmdNotePermissionRole.owner, HackmdNotePermissionRole.signed_in, HackmdNotePermissionRole.guest]).optional().describe('The new read permission level for the note. If not provided, the read permission will remain unchanged.'),
      writePermission: z.enum([HackmdNotePermissionRole.owner, HackmdNotePermissionRole.signed_in, HackmdNotePermissionRole.guest]).optional().describe('The new write permission level for the note. If not provided, the write permission will remain unchanged.'),
    }),
    outputSchema: noteSchema.describe('The updated note object.'),
  })
  async updateNote(params: {
    noteId: string;
    content?: string;
    readPermission?: HackmdNotePermissionRole;
    writePermission?: HackmdNotePermissionRole;
  }): Promise<HackmdNote> {
    const { noteId, ...rest } = params
    await firstValueFrom(
      this.httpService.patch<HackmdNote>(`/v1/notes/${noteId}`, {
        ...rest
      }).pipe(
        catchError((error: AxiosError) => {
          throw new Error('Error updating note in HackMD: ' + error.message);
        }),
      ),
    );

    // Return the updated note
    const { data } = await firstValueFrom(
      this.httpService.get<HackmdNote>(`/v1/notes/${noteId}`).pipe(
        catchError((error: AxiosError) => {
          throw new Error('Error fetching note from HackMD: ' + error.message);
        }),
      ),
    );

    return data;
  }
}
