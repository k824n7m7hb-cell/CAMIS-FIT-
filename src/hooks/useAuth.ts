// src/hooks/useAuth.ts
// Centraliza lógica de autenticação: restaurar sessão, logout, refresh.
// Evita duplicar código de auth no App.tsx e nas screens.

import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useStore } from '../services/store';
import { authAPI } from '../services/api';
import { TOKEN_KEY } from '../constants';

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, logout } = useStore();

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!savedToken) return false;

      const res = await authAPI.me();
      const { user: restoredUser } = res.data || {};

      if (!restoredUser?.id || !restoredUser?.role) {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        return false;
      }

      if (restoredUser.role === 'instrutor') {
        setUser(
          {
            id: restoredUser.id,
            nome: restoredUser.nome,
            email: restoredUser.email,
            role: 'instrutor',
            cref: restoredUser.cref,
            pixChave: restoredUser.pix_chave,
            codigoConvite: restoredUser.codigo_convite,
            avatarInitials: restoredUser.nome?.slice?.(0, 2)?.toUpperCase?.() || 'IN',
          },
          savedToken,
        );
        return true;
      }

      setUser(
        {
          id: restoredUser.id,
          nome: restoredUser.nome,
          email: restoredUser.email,
          role: 'aluno',
          instrutorId: restoredUser.instrutor_id,
          instrutorNome: restoredUser.instrutor_nome,
          nivel: restoredUser.nivel_gamif,
          xp: restoredUser.xp,
          peso: restoredUser.peso,
          altura: restoredUser.altura,
          objetivo: restoredUser.objetivo,
          avatarInitials: restoredUser.avatar_initials,
        },
        savedToken,
      );
      return true;
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      return false;
    }
  }, [setUser]);

  return { user, token, isAuthenticated, logout, restoreSession };
};
