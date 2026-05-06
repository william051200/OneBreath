import SwiftUI
import SwiftData
import Charts

struct StatsScreen: View {
    @Query(sort: \SessionRecord.date, order: .forward) private var sessions: [SessionRecord]

    private var personalBest: TimeInterval { sessions.map(\.holdDuration).max() ?? 0 }
    private var average: TimeInterval {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.holdDuration).reduce(0, +) / Double(sessions.count)
    }
    private var totalSessions: Int { sessions.count }

    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                content
            }
            .navigationTitle("Stats")
            .toolbarBackground(.hidden, for: .navigationBar)
        }
    }

    @ViewBuilder
    private var content: some View {
        if sessions.count < 2 {
            EmptyStateView(
                title: "Not enough data yet",
                subtitle: "Save at least two sessions to see your trends.",
                systemImage: "chart.xyaxis.line"
            )
        } else {
            ScrollView {
                VStack(spacing: 20) {
                    statsRow
                    chartCard
                }
                .padding(Theme.Layout.pad)
            }
        }
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            StatCard(label: "Best", value: TimeFormatter.compact(personalBest))
            StatCard(label: "Average", value: TimeFormatter.compact(average))
            StatCard(label: "Sessions", value: "\(totalSessions)")
        }
    }

    private var chartCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Trend")
                .font(.headline)
                .foregroundStyle(Theme.text)

            Chart(sessions) { session in
                LineMark(
                    x: .value("Date", session.date),
                    y: .value("Seconds", session.holdDuration)
                )
                .interpolationMethod(.monotone)
                .foregroundStyle(
                    LinearGradient(colors: [Theme.orbCore, Theme.orbHalo],
                                   startPoint: .leading, endPoint: .trailing)
                )

                AreaMark(
                    x: .value("Date", session.date),
                    y: .value("Seconds", session.holdDuration)
                )
                .interpolationMethod(.monotone)
                .foregroundStyle(
                    LinearGradient(
                        colors: [Theme.orbCore.opacity(0.35), Theme.orbCore.opacity(0.0)],
                        startPoint: .top, endPoint: .bottom
                    )
                )

                PointMark(
                    x: .value("Date", session.date),
                    y: .value("Seconds", session.holdDuration)
                )
                .foregroundStyle(Theme.accent)
                .symbolSize(40)
            }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisGridLine().foregroundStyle(Theme.text.opacity(0.1))
                    AxisValueLabel {
                        if let secs = value.as(Double.self) {
                            Text(TimeFormatter.compact(secs))
                                .foregroundStyle(Theme.textDim)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisGridLine().foregroundStyle(Theme.text.opacity(0.05))
                    AxisValueLabel().foregroundStyle(Theme.textDim)
                }
            }
            .frame(height: 240)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.cornerRadius)
                .fill(Theme.text.opacity(0.05))
        )
    }
}

private struct StatCard: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 6) {
            Text(value)
                .font(.title2.weight(.semibold).monospacedDigit())
                .foregroundStyle(Theme.text)
            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.textDim)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.cornerRadius)
                .fill(Theme.text.opacity(0.05))
        )
    }
}

#Preview {
    StatsScreen()
        .modelContainer(for: SessionRecord.self, inMemory: true)
        .preferredColorScheme(.dark)
}
