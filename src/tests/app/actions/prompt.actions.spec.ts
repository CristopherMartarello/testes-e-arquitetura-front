import {
  createPromptAction,
  searchPromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';
import { success } from 'zod';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}));

jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedCreateExecute })),
}));

jest.mock('@/core/application/prompts/update-prompt.use-case', () => ({
  UpdatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedUpdateExecute })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
  });

  describe('searchPromptAction', () => {
    it('should return success when search term is not empty', async () => {
      const input = [{ id: '1', title: 'AI Title', content: 'AI Content' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return success and list all prompts when search term is empty', async () => {
      const input = [
        { id: '1', title: 'Title 01', content: 'Content 01' },
        { id: '2', title: 'Title 02', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('should return a generic error when failed to fetch', async () => {
      const error = new Error('UNKNOWN');
      mockedSearchExecute.mockRejectedValue(error);

      const formData = new FormData();
      formData.append('q', 'error');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBe(undefined);
      expect(result.message).toBe('Falha ao buscar prompts.');
    });

    it('should remove blank spaces from term before execute', async () => {
      const input = [{ id: '1', title: 'Title 01', content: 'Content 01' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', 'title 01  ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should treat query abscence with empty term', async () => {
      const input = [
        { id: '1', title: 'first title', content: 'Content 01' },
        { id: '2', title: 'second title', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });

  describe('createPromptAction', () => {
    it('should create a new prompt with success', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);
      const data = {
        title: 'Title',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso');
    });

    it('should return validation error when fields are empty', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação do prompt');
      expect(result?.errors).toBeDefined();
    });

    it('should return error when PROMPT_ALREADY_EXISTS happens', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));

      const data = {
        title: 'duplicado',
        content: 'duplicado',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe(
        'Erro ao criar prompt: Este prompt já existe!'
      );
    });

    it('should return generic error when creation fails', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOW_ERROR'));

      const data = {
        title: 'title',
        content: 'content',
      };

      const result = await createPromptAction(data);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao criar o prompt.');
    });
  });

  describe('updatePromptAction', () => {
    it('should update correctly', async () => {
      mockedUpdateExecute.mockResolvedValue({});
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'new title',
        content: 'new content',
      };

      const result = await updatePromptAction(data);

      expect(result).toMatchObject({
        success: true,
        message: 'Prompt atualizado com sucesso',
      });
    });

    it('should return validation error when fields are empty', async () => {
      const data = {
        id: '1',
        title: '',
        content: '',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro de validação do prompt');
      expect(result.errors).toBeDefined();
    });

    it('should return PROMPT_NOT_FOUND error when prompt does not exist', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'novo',
        content: 'content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });

    it('should throw a generic error when it fails to update prompt', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'new title',
        content: 'new content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao atualizar prompt');
    });
  });
});
