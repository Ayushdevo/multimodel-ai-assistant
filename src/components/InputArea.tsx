import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import './InputArea.css';
import { IMAGE_TYPES, validateImage } from '../lib/attachments';

interface InputAreaProps {
  onSendMessage: (text: string, imageFile: File | null) => void;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const previewUrl = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const removeImage = () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;
    try {
      validateImage(file);
      const url = URL.createObjectURL(file);
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = url;
      setImageFile(file);
      setImagePreview(url);
      setImageError('');
    } catch (error) {
      removeImage();
      setImageError(error instanceof Error ? error.message : 'Could not attach image.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || imageFile) && !disabled) {
      onSendMessage(text, imageFile);
      setText('');
      setImageError('');
      removeImage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="input-area-container glass" onSubmit={handleSubmit}>
      {imageError && <p role="alert">{imageError}</p>}
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button type="button" className="remove-image-btn" onClick={removeImage} disabled={disabled} aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      )}
      <div className="input-row">
        <button
          type="button"
          className="icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Upload image"
        >
          <ImageIcon size={20} />
        </button>
        <input
          type="file"
          accept={IMAGE_TYPES.join(',')}
          disabled={disabled}
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message"
          placeholder="Ask a coding question or upload an image..."
          disabled={disabled}
          rows={1}
          className="text-input"
        />
        <button
          aria-label="Send message"
          type="submit"
          className="send-btn"
          disabled={disabled || (!text.trim() && !imageFile)}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};
