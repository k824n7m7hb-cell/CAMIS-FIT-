// src/utils/formatters.ts
// Funções de formatação reutilizáveis — evita lógica duplicada nos screens

export const formatCurrency = (value: number): string =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
};

export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export const formatDelta = (a: number, b: number): string => {
  const diff = b - a;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}kg`;
};
