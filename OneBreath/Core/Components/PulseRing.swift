import SwiftUI

/// A ring that emits outward from the orb to convey a slow heartbeat while holding.
struct PulseRing: View {
    var isActive: Bool
    var baseSize: CGFloat = Theme.Layout.orbSize

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var scale: CGFloat = 1.0
    @State private var opacity: Double = 0.0

    var body: some View {
        Circle()
            .stroke(Theme.orbHalo.opacity(0.6), lineWidth: 2)
            .frame(width: baseSize, height: baseSize)
            .scaleEffect(scale)
            .opacity(opacity)
            .onChange(of: isActive) { _, active in
                if active { startPulsing() } else { stopPulsing() }
            }
            .onAppear { if isActive { startPulsing() } }
    }

    private func startPulsing() {
        guard !reduceMotion else { opacity = 0; return }
        scale = 1.0
        opacity = 0.7
        withAnimation(Theme.Anim.pulse.repeatForever(autoreverses: false)) {
            scale = 2.4
            opacity = 0.0
        }
    }

    private func stopPulsing() {
        withAnimation(.easeOut(duration: 0.3)) { opacity = 0 }
    }
}
