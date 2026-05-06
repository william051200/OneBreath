import Foundation
import SwiftUI
import Observation

@Observable
final class TimerViewModel {
    enum Phase: Equatable {
        case idle
        case breatheUp(round: Int, total: Int, action: BreatheAction)
        case ready
        case holding
        case finished(duration: TimeInterval)
    }

    enum BreatheAction { case inhale, exhale }

    var phase: Phase = .idle
    var breatheUpRoundsConfig: Int = 3

    private(set) var startedAt: Date?
    private(set) var finalDuration: TimeInterval = 0
    private var breatheUpTask: Task<Void, Never>?

    // MARK: - Computed

    func currentElapsed(now: Date = .now) -> TimeInterval {
        guard let startedAt else { return 0 }
        return now.timeIntervalSince(startedAt)
    }

    var orbState: BreathingOrb.State {
        switch phase {
        case .idle:                          return .idle
        case .breatheUp(_, _, .inhale):      return .inhale
        case .breatheUp(_, _, .exhale):      return .exhale
        case .ready:                         return .inhale
        case .holding:                       return .holding
        case .finished:                      return .released
        }
    }

    var isHolding: Bool {
        if case .holding = phase { return true }
        return false
    }

    // MARK: - Actions

    func startBreatheUp() {
        cancelBreatheUp()
        breatheUpTask = Task { @MainActor in
            for round in 1...self.breatheUpRoundsConfig {
                phase = .breatheUp(round: round, total: breatheUpRoundsConfig, action: .inhale)
                try? await Task.sleep(nanoseconds: 4_000_000_000)
                if Task.isCancelled { return }
                phase = .breatheUp(round: round, total: breatheUpRoundsConfig, action: .exhale)
                try? await Task.sleep(nanoseconds: 6_000_000_000)
                if Task.isCancelled { return }
            }
            phase = .ready
        }
    }

    func skipToReady() {
        cancelBreatheUp()
        phase = .ready
    }

    func beginHold() {
        startedAt = .now
        phase = .holding
        Haptics.soft()
        UIApplication.shared.isIdleTimerDisabled = true
    }

    func releaseHold() {
        let duration = currentElapsed()
        finalDuration = duration
        phase = .finished(duration: duration)
        Haptics.medium()
        UIApplication.shared.isIdleTimerDisabled = false
    }

    func reset() {
        cancelBreatheUp()
        startedAt = nil
        finalDuration = 0
        phase = .idle
        UIApplication.shared.isIdleTimerDisabled = false
    }

    private func cancelBreatheUp() {
        breatheUpTask?.cancel()
        breatheUpTask = nil
    }
}
