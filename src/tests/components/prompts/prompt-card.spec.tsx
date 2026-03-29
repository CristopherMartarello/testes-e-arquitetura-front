import {
  PromptCard,
  type PromptCardProps,
} from '@/components/prompts/prompt-card';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};

describe('PromptCard', () => {
  const user = userEvent.setup();
  const prompt = {
    id: '1',
    title: 'A',
    content: 'X',
  };

  it('should render link with href correctly', () => {
    makeSut({ prompt });
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${prompt.id}`);
  });

  it('should open prompt deletion dialog', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);

    expect(
      screen.getByRole('alertdialog', { name: /remover prompt/i })
    ).toBeInTheDocument();
  });

  it('should remove with success and show toast', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.success).toHaveBeenCalledWith('Prompt removido com sucesso!');
  });
});
