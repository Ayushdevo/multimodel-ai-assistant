import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ generate: vi.fn(), read: vi.fn() }));
vi.mock('./lib/gemini', () => ({
  getGeminiClient: () => ({ getGenerativeModel: () => ({ generateContent: mocks.generate }) }),
  fileToGenerativePart: mocks.read,
}));
vi.mock('./components/Message', () => ({ Message: ({ message }: { message: { content: string } }) => <p>{message.content}</p> }));
vi.mock('./components/InputArea', () => ({ InputArea: ({ onSendMessage }: { onSendMessage: (text: string, file: File | null) => void }) => <>
  <button onClick={() => { onSendMessage('hello', null); onSendMessage('duplicate', null); }}>Send twice</button>
  <button onClick={() => onSendMessage('image', new File(['x'], 'a.png', { type: 'image/png' }))}>Image</button>
  <button onClick={() => onSendMessage('followup', null)}>Follow up</button>
</> }));
import App from './App';
beforeEach(() => {
  mocks.generate.mockReset(); mocks.read.mockReset();
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:chat') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  mocks.read.mockResolvedValue({ inlineData: { data: 'eA==', mimeType: 'image/png' } });
});
afterEach(cleanup);
it('admits only one request in the same event and unlocks after failure', async () => {
  let reject!: (error: Error) => void;
  mocks.generate.mockReturnValue(new Promise((_resolve, fail) => { reject = fail; }));
  render(<App />);
  fireEvent.click(screen.getByText('Send twice'));
  expect(mocks.generate).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('duplicate')).toBeNull();
  await act(async () => reject(new Error('secret detail')));
  expect(screen.getByText(/Request failed/).textContent).not.toContain('secret');
  mocks.generate.mockResolvedValue({ response: { text: () => 'response' } });
  fireEvent.click(screen.getByText('Follow up'));
  await screen.findByText('response');
  expect(mocks.generate).toHaveBeenCalledTimes(2);
});
it('releases message image URLs on unmount and ignores late completion', async () => {
  let resolve!: (result: unknown) => void;
  mocks.generate.mockReturnValue(new Promise((done) => { resolve = done; }));
  const { unmount } = render(<App />);
  fireEvent.click(screen.getByText('Image'));
  await act(async () => {});
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:chat');
  await act(async () => resolve({ response: { text: () => 'late' } }));
});
