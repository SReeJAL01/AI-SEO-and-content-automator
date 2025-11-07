import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import { PaintBrushIcon } from './icons/PaintBrushIcon';

interface Props {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const themes: { name: Theme, label: string }[] = [
  { name: 'dark', label: 'Dark' },
  { name: 'light', label: 'Light' },
  { name: 'synthwave', label: 'Synthwave' },
  { name: 'forest', label: 'Forest' },
];

const ThemeSwitcher: React.FC<Props> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (theme: Theme) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary p-2 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Select Theme"
      >
        <PaintBrushIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 glass-card rounded-lg shadow-2xl z-50 overflow-hidden">
          <ul className="py-1">
            {themes.map(theme => (
              <li key={theme.name}>
                <button
                  onClick={() => handleThemeSelect(theme.name)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    currentTheme === theme.name
                      ? 'font-bold'
                      : 'hover:bg-white/10'
                  }`}
                  style={{ color: currentTheme === theme.name ? 'var(--accent-primary)' : 'var(--text-primary)'}}
                >
                  {theme.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
