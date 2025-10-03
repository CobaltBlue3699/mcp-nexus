import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { HackmdService, HackmdUser, HackmdNote, HackmdNotePublishType, HackmdNotePermissionRole } from './hackmd.service';

// Mock data matching the interfaces
const mockUser: HackmdUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  userPath: 'testuser',
  photo: 'https://example.com/photo.jpg',
  teams: [],
  upgraded: false,
};

const mockSingleNote: HackmdNote = {
  id: 'note-123',
  title: 'Test Note',
  tags: ['test', 'mock'],
  createdAt: Date.now(),
  titleUpdatedAt: Date.now(),
  tagsUpdatedAt: null,
  publishType: HackmdNotePublishType.view,
  publishedAt: Date.now(),
  permalink: 'test-note-permalink',
  publishLink: 'https://hackmd.io/@testuser/test-note-permalink',
  shortId: 'shortId123',
  content: 'This is an updated test note.',
  lastChangedAt: Date.now(),
  lastChangeUser: {
    name: 'Test User',
    userPath: 'testuser',
    photo: 'https://example.com/photo.jpg',
    biography: null,
  },
  userPath: 'testuser',
  teamPath: null,
  readPermission: HackmdNotePermissionRole.owner,
  writePermission: HackmdNotePermissionRole.owner,
  folderPaths: [],
};

describe('HackmdService', () => {
  let service: HackmdService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackmdService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            patch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HackmdService>(HackmdService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user data on successful API call', async () => {
      const response: AxiosResponse<HackmdUser> = {
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(response));

      const result = await service.getUser();

      expect(result).toEqual(mockUser);
      expect(httpService.get).toHaveBeenCalledWith('/v1/me');
    });

    it('should throw an error on API failure', async () => {
      const error = new AxiosError('Request failed');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      await expect(service.getUser()).rejects.toThrow(
        'Error fetching user data from HackMD: Request failed',
      );
    });
  });

  // Assuming listNotes and getNoteById tests exist and are correct

  describe('updateNote', () => {
    const noteId = 'note-123';
    const updatePayload = { content: 'new content' };

    it('should successfully patch and then get the note', async () => {
      // Arrange
      const patchResponse: AxiosResponse = { data: '', status: 204, statusText: 'No Content', headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } };
      const getResponse: AxiosResponse<HackmdNote> = { data: mockSingleNote, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } };

      (httpService.patch as jest.Mock).mockReturnValue(of(patchResponse));
      (httpService.get as jest.Mock).mockReturnValue(of(getResponse));

      // Act
      const result = await service.updateNote({ noteId, ...updatePayload });

      // Assert
      expect(httpService.patch).toHaveBeenCalledWith(`/v1/notes/${noteId}`, updatePayload);
      expect(httpService.get).toHaveBeenCalledWith(`/v1/notes/${noteId}`);
      expect(result).toEqual(mockSingleNote);
    });

    it('should throw an error if the patch call fails', async () => {
      // Arrange
      const error = new AxiosError('Update failed');
      (httpService.patch as jest.Mock).mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.updateNote({ noteId, ...updatePayload })).rejects.toThrow(
        'Error updating note in HackMD: Update failed'
      );
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should throw an error if the subsequent get call fails', async () => {
      // Arrange
      const patchResponse: AxiosResponse = { data: '', status: 204, statusText: 'No Content', headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } };
      const getError = new AxiosError('Get after update failed');

      (httpService.patch as jest.Mock).mockReturnValue(of(patchResponse));
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => getError));

      // Act & Assert
      await expect(service.updateNote({ noteId, ...updatePayload })).rejects.toThrow(
        'Error fetching note from HackMD: Get after update failed'
      );
    });
  });
});