import SidebarContent, {
  SidebarPromptProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

// mockando o useRouter do next para realizarmos o teste
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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

      expect(screen.getByRole('complementary')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Novo prompt' })).toBeVisible();
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

  describe('Colapsar / Expandir', () => {
    it('should start expanded and display minimize button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i, //i -> insensitivo, sem case sensitive
      });
      expect(collapseButton).toBeVisible();

      // queryByRole -> retorna null se não há um nó correspondente
      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
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

      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('/?q=A%20B');

      await user.clear(searchInput);
      const lastClearCall = pushMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('/');
    });
  });
});
