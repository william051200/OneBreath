import SwiftUI
import SwiftData

struct TimerScreen: View {
    @Environment(\.modelContext) private var context
    @State private var vm = TimerViewModel()
    @Query(sort: \SessionRecord.holdDuration, order: .reverse) private var allSessions: [SessionRecord]

    private var personalBest: TimeInterval { allSessions.first?.holdDuration ?? 0 }

    var body: some View {
        ZStack {
            GradientBackground()

            VStack(spacing: 32) {
                header
                Spacer()
                orbArea
                Spacer()
                actionArea
                    .padding(.bottom, 32)
            }
            .padding(.horizontal, Theme.Layout.pad)
        }
        .animation(Theme.Anim.screen, value: phaseKey)
    }

    // MARK: - Sections

    private var header: some View {
        VStack(spacing: 4) {
            Text("OneBreath")
                .font(.title2.weight(.semibold))
                .foregroundStyle(Theme.text)
            if personalBest > 0 {
                Text("Personal best · \(TimeFormatter.compact(personalBest))")
                    .font(.caption)
                    .foregroundStyle(Theme.textDim)
            }
        }
        .padding(.top, 8)
    }

    @ViewBuilder
    private var orbArea: some View {
        ZStack {
            PulseRing(isActive: vm.isHolding)
            BreathingOrb(state: vm.orbState)
            overlayLabel
        }
        .frame(height: 320)
    }

    @ViewBuilder
    private var overlayLabel: some View {
        switch vm.phase {
        case .idle:
            VStack(spacing: 6) {
                Text("Ready when you are")
                    .font(.headline)
                    .foregroundStyle(Theme.text)
                Text("Tap Start to begin")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textDim)
            }

        case let .breatheUp(round, total, action):
            VStack(spacing: 6) {
                Text(action == .inhale ? "Breathe in" : "Breathe out")
                    .font(.title3.weight(.medium))
                    .foregroundStyle(Theme.text)
                    .contentTransition(.opacity)
                Text("Round \(round) of \(total)")
                    .font(.caption)
                    .foregroundStyle(Theme.textDim)
            }

        case .ready:
            Text("Take a deep breath")
                .font(.title3.weight(.medium))
                .foregroundStyle(Theme.text)

        case .holding:
            TimelineView(.animation(minimumInterval: 0.05)) { ctx in
                AnimatedCounter(text: TimeFormatter.liveDisplay(vm.currentElapsed(now: ctx.date)))
            }
            .accessibilityLabel("Hold timer")
            .accessibilityValue(TimeFormatter.compact(vm.currentElapsed()))

        case let .finished(duration):
            VStack(spacing: 8) {
                Text("Held for")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textDim)
                AnimatedCounter(text: TimeFormatter.compact(duration))
                if duration > personalBest && personalBest > 0 {
                    Label("New personal best", systemImage: "sparkles")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.accent)
                }
            }
        }
    }

    @ViewBuilder
    private var actionArea: some View {
        switch vm.phase {
        case .idle:
            ActionButton(title: "Start", systemImage: "play.fill") {
                vm.startBreatheUp()
            }
        case .breatheUp:
            ActionButton(title: "Skip warm-up", style: .secondary) {
                vm.skipToReady()
            }
        case .ready:
            ActionButton(title: "Hold", systemImage: "hand.raised.fill") {
                vm.beginHold()
            }
        case .holding:
            ActionButton(title: "Release", systemImage: "hand.tap.fill", style: .destructive) {
                vm.releaseHold()
            }
        case let .finished(duration):
            HStack(spacing: 12) {
                ActionButton(title: "Discard", style: .secondary) {
                    vm.reset()
                }
                ActionButton(title: "Save", systemImage: "checkmark") {
                    save(duration: duration)
                }
            }
        }
    }

    private func save(duration: TimeInterval) {
        let isNewPB = duration > personalBest
        let record = SessionRecord(
            holdDuration: duration,
            breatheUpRounds: vm.breatheUpRoundsConfig
        )
        context.insert(record)
        try? context.save()
        if isNewPB { Haptics.success() }
        vm.reset()
    }

    private var phaseKey: String {
        switch vm.phase {
        case .idle: return "idle"
        case .breatheUp(let r, _, let a): return "breathe-\(r)-\(a)"
        case .ready: return "ready"
        case .holding: return "holding"
        case .finished: return "finished"
        }
    }
}

#Preview {
    TimerScreen()
        .modelContainer(for: SessionRecord.self, inMemory: true)
        .preferredColorScheme(.dark)
}
