import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LISTINGS_KEY = 'askneo_p2p_listings';

export interface UserListing {
  id: string;
  name: string;
  description: string;
  condition: 'like-new' | 'good' | 'fair';
  images: string[];           // local URIs from image picker
  listedAt: string;           // ISO timestamp
  ownerName: string;
  ownerLocation: string;      // sender location; delivery cost calculated at checkout
}

export function useP2PListings() {
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    AsyncStorage.getItem(LISTINGS_KEY).then(val => {
      setListings(val ? JSON.parse(val) : []);
      setLoaded(true);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const addListing = useCallback((listing: UserListing) => {
    setListings(prev => {
      const next = [listing, ...prev];
      AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeListing = useCallback((id: string) => {
    setListings(prev => {
      const next = prev.filter(l => l.id !== id);
      AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { listings, loaded, addListing, removeListing };
}
