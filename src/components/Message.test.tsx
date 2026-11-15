import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Message } from './Message';
afterEach(cleanup);
it('shows copied only after clipboard success and reports rejected access', async () => {
  let done!: () => void;
  const writeText = vi.fn(() => new Promise<void>((resolve) => { done = resolve; }));
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(<Message message={{ id: '1', role: 'model', content: '```python\nprint(1)\n```' }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
  expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
  await act(async () => done());
  expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  writeText.mockRejectedValueOnce(new Error('denied'));
  fireEvent.click(screen.getByRole('button', { name: 'Copied' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('alert').textContent).toContain('Copy failed');
});
