import PromptForm, { PromptFormProps } from '@/components/prompts/prompt-form';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const createActionMock = jest.fn();
const updateActionMock = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  createPromptAction: (...args: unknown[]) => createActionMock(...args),
  updatePromptAction: (...args: unknown[]) => updateActionMock(...args),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const makeSut = ({ prompt }: PromptFormProps = {} as PromptFormProps) => {
  return render(<PromptForm prompt={prompt} />);
};

describe('PromptForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    createActionMock.mockReset();
    refreshMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it('deve criar um novo prompt com sucesso', async () => {
    const successMessage = 'success';
    createActionMock.mockResolvedValueOnce({
      success: true,
      message: successMessage,
    });
    makeSut();

    const titleInput = screen.getByPlaceholderText(
      'Digite aqui o título do prompt...'
    );
    await user.type(titleInput, 'title');
    const contentInput = screen.getByPlaceholderText(
      'Digite aqui o conteúdo do prompt...'
    );
    await user.type(contentInput, 'content');

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(createActionMock).toHaveBeenCalledWith({
      title: 'title',
      content: 'content',
    });
    expect(toast.success).toHaveBeenCalledWith(successMessage);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('deve exibir um erro quando a action de criação falhar', async () => {
    const errorMessage = 'error';
    createActionMock.mockResolvedValueOnce({
      success: false,
      message: errorMessage,
    });
    makeSut();

    const titleInput = screen.getByPlaceholderText(
      'Digite aqui o título do prompt...'
    );
    await user.type(titleInput, 'title');
    const contentInput = screen.getByPlaceholderText(
      'Digite aqui o conteúdo do prompt...'
    );
    await user.type(contentInput, 'content');

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('should display error messages when form is empty and user tries to save it', async () => {
    makeSut();

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(screen.getByText('Título é obrigatório')).toBeVisible();
    expect(screen.getByText('Conteúdo é obrigatório')).toBeVisible();
    expect(createActionMock).not.toHaveBeenCalled();
  });

  it('should update an existing prompt successfully', async () => {
    updateActionMock.mockResolvedValueOnce({
      success: true,
      message: 'Prompt atualizado com sucesso',
    });
    const now = new Date();
    const prompt = {
      id: '1',
      title: 'old',
      content: 'old',
      createdAt: now,
      updatedAt: now,
    };
    makeSut({ prompt });
    const titleInput = screen.getByPlaceholderText(
      'Digite aqui o título do prompt...'
    );
    await user.clear(titleInput);
    await user.type(titleInput, 'new title');
    const contentInput = screen.getByPlaceholderText(
      'Digite aqui o conteúdo do prompt...'
    );
    await user.clear(contentInput);
    await user.type(contentInput, 'new content');
    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(updateActionMock).toHaveBeenCalledWith({
      id: prompt.id,
      title: 'new title',
      content: 'new content',
    });
    expect(toast.success).toHaveBeenCalledWith('Prompt atualizado com sucesso');
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
