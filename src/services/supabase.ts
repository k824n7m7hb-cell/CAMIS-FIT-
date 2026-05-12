// src/services/supabase.ts
// Client Supabase para uso no frontend (realtime, storage, future auth migration).
// A autenticação principal do app usa JWT customizado (api/auth.js).
// Este client usa a anon key pública — seguro para o frontend.

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// expo-secure-store tem limite de 2048 bytes por chave.
// Para tokens Supabase (que podem ser maiores), usamos prefixo com split por chunks.
const CHUNK_SIZE = 1800;

const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const count = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!count) return SecureStore.getItemAsync(key);
    const chunks: string[] = [];
    for (let i = 0; i < parseInt(count, 10); i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
      if (chunk) chunks.push(chunk);
    }
    return chunks.join('');
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks));
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(
        `${key}_chunk_${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
  },

  removeItem: async (key: string): Promise<void> => {
    const count = await SecureStore.getItemAsync(`${key}_chunks`);
    if (count) {
      for (let i = 0; i < parseInt(count, 10); i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {});
      }
      await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
    }
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
