import SwiftUI

struct RootView: View {
    var body: some View {
        TabView {
            TimerScreen()
                .tabItem { Label("Hold", systemImage: "lungs.fill") }

            HistoryScreen()
                .tabItem { Label("History", systemImage: "clock.arrow.circlepath") }

            StatsScreen()
                .tabItem { Label("Stats", systemImage: "chart.xyaxis.line") }
        }
        .tint(Theme.accent)
    }
}

#Preview {
    RootView()
        .modelContainer(for: SessionRecord.self, inMemory: true)
        .preferredColorScheme(.dark)
}
