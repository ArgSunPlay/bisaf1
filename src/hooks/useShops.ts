import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Shop } from '../types';

export function useShops() {
  const [data, setData] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const shops = StorageService.getShops();
    setData(shops);
    setIsLoading(false);
  }, []);

  return { data, isLoading };
}
