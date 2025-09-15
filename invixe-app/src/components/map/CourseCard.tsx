import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import theme from '../../theme';

export type CourseCardProps = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number }>;
  levelChip?: string; // e.g., 'מתחילים', 'ביניים'
  durationChip?: string; // e.g., 'כ-60 דק'
  levelEmphasis?: 'light' | 'filled'; // filled => blue filled chip
  badgeText?: string; // e.g., 'מומלץ להתחלה'
  disabled?: boolean;
  onPress?: () => void;
};

export default function CourseCard({ title, subtitle, Icon, levelChip, durationChip, levelEmphasis = 'light', badgeText, disabled, onPress }: CourseCardProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.cardDisabled]}
    >
      {badgeText ? (
        <View style={styles.badge}><Text style={styles.badgeText}>{badgeText}</Text></View>
      ) : null}
      <View style={styles.iconCircle}>
        <Icon size={64} />
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      <View style={styles.chipsRow}>
        {durationChip ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{durationChip}</Text>
          </View>
        ) : null}
        {levelChip ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{levelChip}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    width: '48%',
    marginBottom: 12,
    // alignItems: 'stretch',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E9EEF7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    minHeight: 200,
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: -14,
    right: 30,
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 16,
    width: 117,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: theme.font.bold,
    fontSize: 12,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 32,
    // backgroundColor: '#F3F8FF',
    // borderWidth: 1,
    borderColor: '#DCEBFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#0F172A',
    textAlign: 'right',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: '#E5E9EF',
    marginLeft: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: '#314152',
  },
});


