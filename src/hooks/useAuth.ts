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
      const { user: u } = res.data;

      if (u.role === 'instrutor') {
        setUser(
          {
            id: u.id,
            nome: u.nome,
            email: u.email,
            role: 'instrutor',
            cref: u.cref,
            pixChave: u.pix_chave,
            codigoConvite: u.codigo_convite,
            avatarInitials: u.nome.slice(0, 2).toUpperCase(),
          },
          savedToken,
        );
      } else {
        setUser(
          {
            id: u.id,
            nome: u.nome,
            email: u.email,
            role: 'aluno',
            instrutorId: u.instrutor_id,
            instrutorNome: u.instrutor_nome,
            nivel: u.nivel_gamif,
            xp: u.xp,
            peso: u.peso,
            altura: u.altura,
            objetivo: u.objetivo,
            avatarInitials: u.avatar_initials,
          },
          savedToken,
        );
      }
      return true;
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      return false;
    }
  }, [setUser]);

  return { user, token, isAuthenticated, logout, restoreSession };
};
