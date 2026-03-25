import { CopyButtonProps } from '@/components/button-actions';
import CopyButton from '@/components/button-actions/copy-button';
import { act, render, screen, waitFor } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));
const writeTextMock = jest.fn();

const makeSut = ({ content = '' }: CopyButtonProps = {} as CopyButtonProps) => {
  return render(<CopyButton content={content} />);
};

describe('CopyButton', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    writeTextMock.mockReset();
    Object.defineProperty(global.navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
    jest.useFakeTimers({ legacyFakeTimers: true });
  });

  it('should disable button when content is empty', async () => {
    const content = '    ';
    makeSut({ content });

    const button = screen.getByRole('button', { name: /copiar/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it(`should copy and change label to "Copiado" and go back to "Copiar"`, async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    const content = 'text';
    makeSut({ content });

    const button = screen.getByRole('button', { name: /copiar/i });
    await user.click(button);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /copiado/i })
      ).toBeInTheDocument()
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /copiar/i })
      ).toBeInTheDocument();
    });
  });

  it('should clean latest timer before copy again', async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    const clearSpy = jest.spyOn(window, 'clearTimeout');
    const content = 'text';
    makeSut({ content });

    const button = screen.getByRole('button', { name: /copiar/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /copiado/i })
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /copiado/i }));

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('should display error toast when copy fails', async () => {
    const errorMessage = 'falha ao copiar';
    const error = new Error(errorMessage);
    jest
      .spyOn(global.navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(error);
    const content = 'text';
    makeSut({ content });

    const button = screen.getByRole('button', { name: /copiar/i });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Erro ao copiar o texto: ${errorMessage}`
      );
    });
    expect(screen.getByRole('button', { name: /copiar/i })).toBeVisible();
  });
});
