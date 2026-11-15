import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { InputArea } from './InputArea';

beforeEach(() => {
  let count = 0;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => `blob:${++count}`) });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});
afterEach(cleanup);
it('ignores composing Enter and Shift Enter, then submits completed text', () => {
  const send = vi.fn();
  render(<InputArea onSendMessage={send} disabled={false} />);
  const textarea = screen.getByRole('textbox');
  fireEvent.change(textarea, { target: { value: 'नमस्ते' } });
  fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });
  fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
  expect(send).not.toHaveBeenCalled();
  fireEvent.keyDown(textarea, { key: 'Enter' });
  expect(send).toHaveBeenCalledWith('नमस्ते', null);
});
it('revokes replaced, removed and unmounted previews', () => {
  const { container, unmount } = render(<InputArea onSendMessage={vi.fn()} disabled={false} />);
  const input = container.querySelector('input')!;
  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
  fireEvent.change(input, { target: { files: [file] } });
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1');
  fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:2');
  fireEvent.change(input, { target: { files: [file] } });
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:3');
});
it('rejects invalid images without submitting them', () => {
  const send = vi.fn();
  const { container } = render(<InputArea onSendMessage={send} disabled={false} />);
  fireEvent.change(container.querySelector('input')!, { target: { files: [new File(['x'], 'bad.svg', { type: 'image/svg+xml' })] } });
  expect(screen.getByRole('alert').textContent).toContain('Choose');
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(send).not.toHaveBeenCalled();
});
