import SwiftUI
import SwiftData

struct HistoryScreen: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \SessionRecord.date, order: .reverse) private var sessions: [SessionRecord]

    private var personalBest: TimeInterval {
        sessions.map(\.holdDuration).max() ?? 0
    }

    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                content
            }
            .navigationTitle("History")
            .toolbarBackground(.hidden, for: .navigationBar)
        }
    }

    @ViewBuilder
    private var content: some View {
        if sessions.isEmpty {
            EmptyStateView(
                title: "No holds yet",
                subtitle: "Your saved breath holds will appear here.",
                systemImage: "lungs"
            )
        } else {
            List {
                Section {
                    ForEach(sessions) { session in
                        HistoryRow(session: session, isPersonalBest: session.holdDuration == personalBest)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                    }
                    .onDelete(perform: delete)
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
        }
    }

    private func delete(at offsets: IndexSet) {
        for idx in offsets { context.delete(sessions[idx]) }
        try? context.save()
    }
}

private struct HistoryRow: View {
    let session: SessionRecord
    let isPersonalBest: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(TimeFormatter.compact(session.holdDuration))
                    .font(.title3.weight(.semibold).monospacedDigit())
                    .foregroundStyle(Theme.text)
                Text(session.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(Theme.textDim)
            }
            Spacer()
            if isPersonalBest {
                Image(systemName: "sparkles")
                    .foregroundStyle(Theme.accent)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.cornerRadius)
                .fill(Theme.text.opacity(0.05))
        )
    }
}

#Preview {
    HistoryScreen()
        .modelContainer(for: SessionRecord.self, inMemory: true)
        .preferredColorScheme(.dark)
}
