// src/components/AppHeader.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

const logo = require('../../assets/logo.png');

interface AppHeaderProps {
  greeting?: string;
  title: string;
  rightContent?: React.ReactNode;
  paddingTop?: number;
}

export const AppHeader = ({ greeting, title, rightContent, paddingTop = 50 }: AppHeaderProps) => (
  <View style={{
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
      <Image source={logo} style={{ width: 36, height: 36, borderRadius: 10 }} resizeMode="contain" />
      <View>
        {greeting ? (
          <>
            <Text style={{ fontSize: 11, color: Colors.textSub }}>{greeting}</Text>
            <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.text }}>{title}</Text>
          </>
        ) : (
          <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.text }}>{title}</Text>
        )}
      </View>
    </View>
    {rightContent ? <View>{rightContent}</View> : null}
  </View>
);
