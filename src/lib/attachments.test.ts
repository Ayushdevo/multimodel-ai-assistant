import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_BYTES, readImage, validateImage } from './attachments';

afterEach(() => vi.unstubAllGlobals());
describe('image attachments', () => {
  it.each(['text/plain', 'image/svg+xml', 'image/gif'])('rejects unsupported %s before reading', (type) => {
    expect(() => validateImage(new File(['data'], 'image', { type }))).toThrow('Choose');
  });
  it('rejects empty and oversized images', () => {
    expect(() => validateImage(new File([], 'empty.png', { type: 'image/png' }))).toThrow('empty');
    const file = new File(['x'], 'large.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: MAX_IMAGE_BYTES + 1 });
    expect(() => validateImage(file)).toThrow('10 MB');
  });
  it.each(['error', 'abort', 'invalid', 'ok'])('settles on %s', async (mode) => {
    class Reader {
      result = mode === 'invalid' ? null : 'data:image/png;base64,eA==';
      onerror?: () => void; onabort?: () => void; onload?: () => void;
      readAsDataURL() { if (mode === 'error') this.onerror?.(); else if (mode === 'abort') this.onabort?.(); else this.onload?.(); }
    }
    vi.stubGlobal('FileReader', Reader);
    const promise = readImage(new File(['x'], 'test.png', { type: 'image/png' }));
    if (mode === 'ok') await expect(promise).resolves.toContain('eA==');
    else await expect(promise).rejects.toThrow();
  });
});
