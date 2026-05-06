import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { GradientBackground } from '../../src/components/GradientBackground';
import { EmptyState } from '../../src/components/EmptyState';
import { useSessions } from '../../src/storage/useSessions';
import { compact } from '../../src/timer/format';
import { Colors, Layout } from '../../src/theme/theme';

export default function StatsScreen() {
  const { sessions } = useSessions();

  const ordered = useMemo(() => [...sessions].reverse(), [sessions]);

  const stats = useMemo(() => {
    if (ordered.length === 0) return { best: 0, avg: 0, total: 0 };
    const best = ordered.reduce((m, s) => Math.max(m, s.holdDuration), 0);
    const avg = ordered.reduce((sum, s) => sum + s.holdDuration, 0) / ordered.length;
    return { best, avg, total: ordered.length };
  }, [ordered]);

  const chartData = useMemo(
    () =>
      ordered.map((s) => ({
        value: Math.round(s.holdDuration),
        label: '',
      })),
    [ordered]
  );

  const width = Dimensions.get('window').width - Layout.pad * 4;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <GradientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Text style={styles.heading}>Stats</Text>
        {ordered.length < 2 ? (
          <EmptyState
            title="Not enough data yet"
            subtitle="Save at least two sessions to see your trends."
            icon="bar-chart-outline"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.row}>
              <StatCard label="Best" value={compact(stats.best)} />
              <StatCard label="Average" value={compact(stats.avg)} />
              <StatCard label="Sessions" value={`${stats.total}`} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trend</Text>
              <LineChart
                data={chartData}
                width={width}
                height={220}
                isAnimated
                animationDuration={900}
                curved
                color={Colors.orbCore}
                thickness={3}
                hideDataPoints={false}
                dataPointsColor={Colors.accent}
                dataPointsRadius={4}
                yAxisColor={Colors.surfaceBorder}
                xAxisColor={Colors.surfaceBorder}
                yAxisTextStyle={{ color: Colors.textDim, fontSize: 11 }}
                xAxisLabelTextStyle={{ color: Colors.textDim, fontSize: 11 }}
                rulesColor={Colors.surfaceBorder}
                rulesType="solid"
                noOfSections={4}
                areaChart
                startFillColor={Colors.orbCore}
                endFillColor={Colors.orbCore}
                startOpacity={0.35}
                endOpacity={0}
                yAxisLabelTexts={undefined}
                formatYLabel={(v) => compact(Number(v))}
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: Layout.pad,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scroll: { padding: Layout.pad, gap: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.cornerRadius,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statLabel: { color: Colors.textDim, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.cornerRadius,
    padding: 16,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
