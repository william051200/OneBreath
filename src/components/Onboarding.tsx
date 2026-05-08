import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from './GradientBackground';
import { Colors, Layout } from '../theme/theme';

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'leaf-outline',
    title: 'Welcome to OneBreath',
    body: 'A calm, distraction-free space to train your breath hold and find a moment of stillness.',
  },
  {
    icon: 'pulse-outline',
    title: 'How a session flows',
    body: 'A few guided breathe-up rounds warm you up. Then hold for as long as feels right. Release whenever you need to.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Yours, and only yours',
    body: 'Every hold is stored on your device. No account, no tracking, nothing leaves your browser.',
  },
];

type Props = { onDone: () => void };

export function Onboarding({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const [width, setWidth] = useState(Dimensions.get('window').width);

  const isLast = index === SLIDES.length - 1;

  const goTo = (next: number) => {
    Haptics.selectionAsync().catch(() => {});
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    setIndex(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
    if (next !== index) setIndex(next);
  };

  const onNext = () => {
    if (isLast) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onDone();
    } else {
      goTo(index + 1);
    }
  };

  return (
    <View
      style={styles.root}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <GradientBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          {!isLast ? (
            <Pressable
              onPress={onDone}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(s) => s.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={56} color={Colors.accent} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>

          <Pressable
            onPress={onNext}
            style={styles.cta}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Next slide'}
          >
            <Text style={styles.ctaText}>{isLast ? 'Get started' : 'Next'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgDeep },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: Layout.pad,
    paddingTop: 8,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skip: { color: Colors.textDim, fontSize: 15, fontWeight: '500' },
  slide: {
    paddingHorizontal: Layout.pad * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    color: Colors.textDim,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 360,
  },
  bottom: {
    paddingHorizontal: Layout.pad,
    paddingBottom: 16,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceBorder,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 22,
  },
  cta: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: Layout.cornerRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: Colors.bgDeep,
    fontSize: 17,
    fontWeight: '600',
  },
});
