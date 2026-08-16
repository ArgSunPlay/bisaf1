import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

export const useDynamicText = (key: string, defaultValue: string) => {
  const [text, setText] = useState<string>(() => StorageService.getDynamicText(key, defaultValue));

  useEffect(() => {
    const handleStorageChange = () => {
      setText(StorageService.getDynamicText(key, defaultValue));
    };

    window.addEventListener('local-storage', handleStorageChange);
    // Also listen to native storage event for cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('local-storage', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return text;
};
