jest.mock('@/lib/prisma', () => ({ prisma: {} }));
const mockedSearchExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}));

import { searchPromptAction } from '@/app/actions/prompt.actions';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
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
});
