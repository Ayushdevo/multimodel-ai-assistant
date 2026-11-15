import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';
afterEach(() => { cleanup(); localStorage.clear(); });
it('discards cancelled edits when reopened', () => {
  localStorage.setItem('gemini_api_key', 'saved');
  const props = { onClose: vi.fn(), onSave: vi.fn() };
  const { rerender } = render(<SettingsModal {...props} isOpen />);
  fireEvent.change(screen.getByLabelText('Gemini API Key'), { target: { value: 'unsaved' } });
  rerender(<SettingsModal {...props} isOpen={false} />);
  rerender(<SettingsModal {...props} isOpen />);
  expect((screen.getByLabelText('Gemini API Key') as HTMLInputElement).value).toBe('saved');
});
it('reports unavailable browser storage instead of throwing or claiming saved', () => {
  const save = vi.fn();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
  render(<SettingsModal isOpen onClose={vi.fn()} onSave={save} />);
  fireEvent.change(screen.getByLabelText('Gemini API Key'), { target: { value: 'key' } });
  fireEvent.click(screen.getByText('Save Settings'));
  expect(screen.getByRole('alert').textContent).toContain('could not be saved');
  expect(save).not.toHaveBeenCalled();
});
