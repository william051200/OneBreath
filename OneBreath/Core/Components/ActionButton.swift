import SwiftUI

struct ActionButton: View {
    enum Style { case primary, secondary, destructive }

    let title: String
    var systemImage: String? = nil
    var style: Style = .primary
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            withAnimation(Theme.Anim.tap) { isPressed = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(Theme.Anim.tap) { isPressed = false }
            }
            action()
        }) {
            HStack(spacing: 10) {
                if let systemImage { Image(systemName: systemImage) }
                Text(title).font(.headline)
            }
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(background)
            .foregroundStyle(foreground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Layout.cornerRadius, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .shadow(color: shadow, radius: 16, y: 6)
        }
        .buttonStyle(.plain)
    }

    private var background: some View {
        Group {
            switch style {
            case .primary:
                LinearGradient(
                    colors: [Theme.orbCore.opacity(0.85), Theme.orbHalo.opacity(0.85)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            case .secondary:
                Theme.text.opacity(0.06)
            case .destructive:
                Theme.accent.opacity(0.85)
            }
        }
    }

    private var foreground: Color {
        switch style {
        case .primary, .destructive: return Theme.bgDeep
        case .secondary: return Theme.text
        }
    }

    private var borderColor: Color {
        switch style {
        case .secondary: return Theme.text.opacity(0.15)
        default: return .clear
        }
    }

    private var shadow: Color {
        switch style {
        case .primary: return Theme.orbCore.opacity(0.35)
        case .destructive: return Theme.accent.opacity(0.35)
        case .secondary: return .clear
        }
    }
}

#Preview {
    ZStack {
        GradientBackground()
        VStack(spacing: 16) {
            ActionButton(title: "Start", systemImage: "play.fill") {}
            ActionButton(title: "Cancel", style: .secondary) {}
            ActionButton(title: "Release", systemImage: "hand.tap.fill", style: .destructive) {}
        }
        .padding()
    }
}
