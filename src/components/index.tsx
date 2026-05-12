// src/components/index.tsx
// Biblioteca de componentes reutilizáveis do CamisFIT
import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

// ── NeonButton ─────────────────────────
interface NeonButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'ghost' | 'danger' | 'purple';
  icon?: React.ReactNode;
  loading?: boolean;
  style?: ViewStyle;
  small?: boolean;
  disabled?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  label, onPress, variant = 'solid', icon, loading,
  style, small, disabled,
}) => {
  const styles = btnStyles(variant, small, disabled);
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? Colors.text : Colors.neon} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = (variant: string, small?: boolean, disabled?: boolean) => {
  const base: ViewStyle = {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.lg, paddingVertical: small ? 10 : 14,
    paddingHorizontal: small ? 14 : 16, opacity: disabled ? 0.5 : 1,
  };
  const variants: Record<string, { btn: ViewStyle; label: TextStyle }> = {
    solid: {
      btn: { ...base, backgroundColor: Colors.neon, ...Shadows.neon },
      label: { color: Colors.text, fontWeight: Typography.weights.black, fontSize: small ? 12 : 14 },
    },
    ghost: {
      btn: { ...base, backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, ...Shadows.neonSm },
      label: { color: Colors.neon, fontWeight: Typography.weights.bold, fontSize: small ? 12 : 14 },
    },
    danger: {
      btn: { ...base, backgroundColor: Colors.redDim, borderWidth: 1.5, borderColor: Colors.red + '60' },
      label: { color: '#ff7a8a', fontWeight: Typography.weights.bold, fontSize: small ? 12 : 14 },
    },
    purple: {
      btn: { ...base, backgroundColor: Colors.purpleDim, borderWidth: 1.5, borderColor: Colors.purple + '60' },
      label: { color: '#cc88ff', fontWeight: Typography.weights.bold, fontSize: small ? 12 : 14 },
    },
  };
  return StyleSheet.create(variants[variant] || variants.solid);
};

// ── Card ───────────────────────────────
interface CardProps {
  children: React.ReactNode;
  neon?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, neon, style, onPress }) => {
  const cardStyle: ViewStyle[] = [{
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: neon ? Colors.neonBorder : Colors.border,
    marginBottom: Spacing.sm,
    ...(neon ? Shadows.neonSm : {}),
  }, style as ViewStyle];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

// ── StatCard ───────────────────────────
interface StatCardProps {
  value: string;
  label: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => (
  <View style={{
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, alignItems: 'center', flex: 1,
  }}>
    <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: color || Colors.neon }}>
      {value}
    </Text>
    <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Text>
  </View>
);

// ── SectionTitle ───────────────────────
export const SectionTitle: React.FC<{ title: string; style?: TextStyle }> = ({ title, style }) => (
  <Text style={[{
    fontSize: 10, fontWeight: Typography.weights.black,
    color: Colors.textSub, textTransform: 'uppercase',
    letterSpacing: 1.2, marginTop: 14, marginBottom: 8,
  }, style]}>
    {title}
  </Text>
);

// ── Input ──────────────────────────────
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, style, autoCapitalize, autoFocus,
  multiline, numberOfLines, editable = true,
}) => (
  <View style={[{ marginBottom: 8 }, style]}>
    {label ? (
      <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </Text>
    ) : null}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textFaint}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize || 'sentences'}
      autoFocus={autoFocus}
      multiline={multiline}
      numberOfLines={numberOfLines}
      editable={editable}
      style={{
        backgroundColor: editable ? Colors.card : Colors.card2,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: editable ? Colors.border : Colors.border2,
        paddingHorizontal: 13,
        paddingVertical: 11,
        color: editable ? Colors.text : Colors.textSub,
        fontSize: 13,
        textAlignVertical: multiline ? 'top' : 'auto',
        minHeight: multiline ? 80 : undefined,
      }}
    />
  </View>
);

// ── StatusBadge ────────────────────────
interface StatusBadgeProps {
  status: 'pago' | 'pendente' | 'vencido' | 'ativo' | 'inativo';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const map: Record<string, { bg: string; border: string; text: string; label: string }> = {
    pago:     { bg: Colors.pagoDim,     border: Colors.pago + '55',     text: Colors.pago,     label: 'Pago' },
    pendente: { bg: Colors.pendenteDim, border: Colors.pendente + '55', text: Colors.pendente, label: 'Pendente' },
    vencido:  { bg: Colors.vencidoDim,  border: Colors.vencido + '55', text: '#ff7a8a',        label: 'Vencido' },
    ativo:    { bg: Colors.pagoDim,     border: Colors.pago + '55',     text: Colors.pago,     label: 'Ativo' },
    inativo:  { bg: Colors.vencidoDim,  border: Colors.vencido + '55', text: '#ff7a8a',        label: 'Inativo' },
  };
  const c = map[status];
  return (
    <View style={{ backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: c.text }}>{c.label}</Text>
    </View>
  );
};

// ── Tag ────────────────────────────────
interface TagProps { label: string; color?: 'green' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' }

export const Tag: React.FC<TagProps> = ({ label, color = 'green' }) => {
  const map: Record<string, { bg: string; border: string; text: string }> = {
    green:  { bg: Colors.neonDim,    border: Colors.neon + '50',    text: Colors.neon },
    blue:   { bg: Colors.blueDim,    border: Colors.blue + '60',    text: '#80c0ff' },
    purple: { bg: Colors.purpleDim,  border: Colors.purple + '60',  text: '#cc88ff' },
    amber:  { bg: Colors.amberDim,   border: Colors.amber + '60',   text: '#ffd080' },
    red:    { bg: Colors.redDim,     border: Colors.red + '60',     text: '#ff7a8a' },
    teal:   { bg: Colors.tealDim,    border: Colors.teal + '60',    text: Colors.teal },
  };
  const c = map[color] || map.green;
  return (
    <View style={{ backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: c.text }}>{label}</Text>
    </View>
  );
};

// ── ProgressBar ────────────────────────
interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress, color, height = 5, backgroundColor,
}) => (
  <View style={{ height, backgroundColor: backgroundColor || Colors.card2, borderRadius: height / 2, overflow: 'hidden' }}>
    <View style={{ height, width: `${Math.min(Math.max(progress * 100, 0), 100)}%`, backgroundColor: color || Colors.neon, borderRadius: height / 2 }} />
  </View>
);

// ── Divider ────────────────────────────
export const Divider: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[{ height: 1, backgroundColor: Colors.border, marginVertical: 12 }, style]} />
);

// ── Avatar ─────────────────────────────
interface AvatarProps { initials: string; color?: string; size?: number }

export const Avatar: React.FC<AvatarProps> = ({ initials, color, size = 36 }) => (
  <View style={{
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: color || Colors.neon,
    alignItems: 'center', justifyContent: 'center',
  }}>
    <Text style={{ fontSize: size * 0.35, fontWeight: Typography.weights.black, color: Colors.text }}>
      {initials}
    </Text>
  </View>
);

// ── LoadingScreen ──────────────────────
export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color={Colors.neon} size="large" />
    <Text style={{ fontSize: 12, color: Colors.textSub, marginTop: 12 }}>{message}</Text>
  </View>
);

// ── EmptyState ─────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, subtitle, action }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
    <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
    <Text style={{ fontSize: 16, fontWeight: Typography.weights.bold, color: Colors.text, textAlign: 'center', marginBottom: 8 }}>
      {title}
    </Text>
    {subtitle ? (
      <Text style={{ fontSize: 13, color: Colors.textSub, textAlign: 'center', lineHeight: 20 }}>
        {subtitle}
      </Text>
    ) : null}
    {action ? (
      <NeonButton label={action.label} onPress={action.onPress} style={{ marginTop: 20 }} />
    ) : null}
  </View>
);

// ── PaymentBadge ───────────────────────
// Preparação para integração com Stripe / PIX / Iugu
interface PaymentBadgeProps {
  method: 'pix' | 'cartao' | 'boleto' | 'stripe';
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ method }) => {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pix:    { label: 'PIX',    bg: Colors.pixDim,    text: Colors.pix },
    cartao: { label: 'Cartão', bg: Colors.blueDim,   text: Colors.blue },
    boleto: { label: 'Boleto', bg: Colors.amberDim,  text: Colors.amber },
    stripe: { label: 'Stripe', bg: Colors.stripeDim, text: Colors.stripe },
  };
  const c = map[method] || map.pix;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: c.text }}>{c.label}</Text>
    </View>
  );
};

export { AppHeader } from './AppHeader';
