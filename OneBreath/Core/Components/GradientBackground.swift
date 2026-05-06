import SwiftUI

/// Slowly-shifting full-screen gradient. Honors Reduce Motion by pinning to a single state.
struct GradientBackground: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var phase: Bool = false

    var body: some View {
        LinearGradient(
            colors: phase
                ? [Theme.bgDeep, Theme.bgMid, Theme.bgGlow]
                : [Theme.bgGlow, Theme.bgDeep, Theme.bgMid],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
        .onAppear {
            guard !reduceMotion else { return }
            withAnimation(Theme.Anim.bgShift.repeatForever(autoreverses: true)) {
                phase.toggle()
            }
        }
    }
}

#Preview {
    GradientBackground()
}
