import SwiftUI

/// A radial gradient orb that scales between two values to evoke breathing.
struct BreathingOrb: View {
    enum State { case idle, inhale, exhale, holding, released }

    var state: State = .idle
    var size: CGFloat = Theme.Layout.orbSize

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @SwiftUI.State private var scale: CGFloat = 0.85

    private var targetScale: CGFloat {
        switch state {
        case .idle:     return 0.85
        case .inhale:   return 1.10
        case .exhale:   return 0.75
        case .holding:  return 1.05
        case .released: return 0.90
        }
    }

    private var brightness: Double { Double(scale) * 0.4 }

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Theme.orbCore.opacity(0.95), Theme.orbHalo.opacity(0.0)],
                        center: .center,
                        startRadius: 0,
                        endRadius: size / 2
                    )
                )
                .blur(radius: 6)

            Circle()
                .stroke(Theme.orbHalo.opacity(0.5), lineWidth: 1.5)
                .blur(radius: 1)
        }
        .frame(width: size, height: size)
        .scaleEffect(scale)
        .brightness(brightness * 0.25)
        .shadow(color: Theme.orbCore.opacity(0.4), radius: 30 * scale)
        .onAppear { animateToTarget() }
        .onChange(of: state) { _, _ in animateToTarget() }
    }

    private func animateToTarget() {
        let anim: Animation = reduceMotion ? .easeInOut(duration: 0.4) : breathingAnimation
        withAnimation(anim) { scale = targetScale }
    }

    private var breathingAnimation: Animation {
        switch state {
        case .idle:
            return Theme.Anim.breath.repeatForever(autoreverses: true)
        case .inhale:
            return .easeInOut(duration: 4.0)
        case .exhale:
            return .easeInOut(duration: 6.0)
        case .holding:
            return .easeInOut(duration: 1.5)
        case .released:
            return .easeOut(duration: 0.6)
        }
    }
}

#Preview {
    ZStack {
        GradientBackground()
        BreathingOrb(state: .idle)
    }
}
