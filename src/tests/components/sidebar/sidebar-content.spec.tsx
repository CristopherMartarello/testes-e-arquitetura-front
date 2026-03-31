import SidebarContent, {
  SidebarPromptProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen, waitFor } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// mockando o useRouter do next para realizarmos o teste
const pushMock = jest.fn();
const setQueryMock = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('nuqs', () => ({
  useQueryState: (key: string) => {
    const [value, setValue] = useState(mockSearchParams.get(key) ?? '');

    const setQuery = (nextValue: string) => {
      setQueryMock(nextValue);
      setValue(nextValue);
    };

    return [value, setQuery] as const;
  },
}));

const initialPrompts = [
  {
    id: '1',
    title: 'Title 01',
    content: 'Content 01',
  },
];

// quem estamos testando nesse teste? Sut = System under test
const makeSut = (
  { prompts = initialPrompts }: SidebarPromptProps = {} as SidebarPromptProps
) => {
  return render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('Base', () => {
    it('should render a new prompt button', () => {
      makeSut();

      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Novo prompt' })
      ).toBeInTheDocument();
    });

    it('should render prompts list', () => {
      makeSut();

      expect(screen.getByText(initialPrompts[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(
        initialPrompts.length
      );
    });

    it('should update search field when typing', async () => {
      makeSut();

      const text = 'AI';
      const searchInput = screen.getByPlaceholderText('Buscar prompts...');
      await user.type(searchInput, text);

      expect(searchInput).toHaveValue(text);
    });
  });

  describe('SidebarContent - Mobile', () => {
    it('should open/close mobile menu correctly', async () => {
      makeSut();

      // Default
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('-translate-x-full');

      // Open Button
      const openButton = screen.getByRole('button', { name: 'Abrir menu' });
      await user.click(openButton);
      expect(aside.className).toContain('translate-x-0');

      // Close Button
      const closeButton = screen.getByRole('button', { name: 'Fechar menu' });
      await user.click(closeButton);
      expect(aside.className).toContain('-translate-x-full');
    });
  });

  describe('Colapsar / Expandir', () => {
    it('should start expanded and display minimize button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeInTheDocument();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i, //i -> insensitivo, sem case sensitive
      });
      expect(collapseButton).toBeInTheDocument();

      // queryByRole -> retorna null se não há um nó correspondente
      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });

    it('should expand when clicking in expand button', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i, //i -> insensitivo, sem case sensitive
      });
      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      await user.click(expandButton);

      expect(
        screen.getByRole('button', { name: /minimizar sidebar/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: 'Lista de prompts' })
      ).toBeInTheDocument();
    });

    it('should collapse and show expand button', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i, //i -> insensitivo, sem case sensitive
      });

      await user.click(collapseButton);

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).toBeInTheDocument();
      expect(collapseButton).not.toBeInTheDocument();
    });

    it('should display new prompt button in sidebar when it is collapsed', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const newPromptButton = screen.getByRole('button', {
        name: /novo prompt/i,
      });
      expect(newPromptButton).toBeInTheDocument();
    });

    it('should not display prompts list in sidebar when it is collapsed', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const nav = screen.queryByRole('navigation', {
        name: 'Lista de prompts',
      });
      expect(nav).not.toBeInTheDocument();
    });
  });

  describe('New prompt', () => {
    it('should navigate to new prompt page /new', async () => {
      makeSut();
      const newPromptButton = screen.getByRole('button', {
        name: 'Novo prompt',
      });

      await user.click(newPromptButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });

  describe('Search prompt', () => {
    it('should navigate with encoded URL when typing', async () => {
      makeSut();
      const text = 'A B';
      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, text);

      expect(setQueryMock).toHaveBeenCalled();
      const lastCall = setQueryMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(text);

      await user.clear(searchInput);
      const lastClearCall = setQueryMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('');
    });

    it('should render search field with the search param', async () => {
      const text = 'inicial';
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;

      makeSut();

      const searchInput = screen.getByPlaceholderText('Buscar prompts...');
      await waitFor(() => expect(searchInput).toHaveValue(text));
    });

    it('should submit form when typing in search field', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      makeSut();

      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, 'AI');

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });

    it('should auto submit when mouting and have initial query', () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      const text = 'text';
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;
      makeSut();

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
  });
});
