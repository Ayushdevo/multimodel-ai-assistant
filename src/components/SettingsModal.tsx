import React, { useState } from 'react';
import { X, Key, Save } from 'lucide-react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const SettingsForm: React.FC<Omit<SettingsModalProps, 'isOpen'>> = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('gemini_api_key') || ''; }
    catch { return ''; }
  });
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } catch {
      setError('Browser storage is unavailable. Your key could not be saved.');
      return;
    }
    onSave(apiKey.trim());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <div className="modal-header">
          <h2><Key size={20} /> Settings</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="modal-body">
          {error && <p role="alert">{error}</p>}
          <div className="input-group">
            <label htmlFor="apiKey">Gemini API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key..."
              required
            />
            <p className="help-text">
              Your key is stored in this browser's local storage. Other scripts on this origin can access it; use a restricted key on a trusted device.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Save size={16} /> Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) =>
  isOpen ? <SettingsForm onClose={onClose} onSave={onSave} /> : null;
