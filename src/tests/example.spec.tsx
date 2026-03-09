import { render, screen } from '@/lib/test-utils';

describe('Example', () => {
  it('should pass', () => {
    render(<div>Teste</div>);

    expect(screen.getByText('Teste')).toBeInTheDocument();
  });
});
