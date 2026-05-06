import SwiftUI

/// Displays a numeric string with per-character roll/fade transitions.
struct AnimatedCounter: View {
    let text: String
    var font: Font = .system(size: 72, weight: .semibold, design: .rounded).monospacedDigit()
    var color: Color = Theme.text

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(text.enumerated()), id: \.offset) { _, ch in
                Text(String(ch))
                    .font(font)
                    .foregroundStyle(color)
                    .contentTransition(.numericText())
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .move(edge: .top)),
                        removal: .opacity.combined(with: .move(edge: .bottom))
                    ))
            }
        }
        .animation(Theme.Anim.digitRoll, value: text)
    }
}

#Preview {
    ZStack {
        GradientBackground()
        AnimatedCounter(text: "1:23.4")
    }
}
