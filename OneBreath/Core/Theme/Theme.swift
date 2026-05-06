import SwiftUI

enum Theme {
    static let bgDeep  = Color(hex: 0x0B1A2E)
    static let bgMid   = Color(hex: 0x143C5E)
    static let bgGlow  = Color(hex: 0x3A2E7A)
    static let orbCore = Color(hex: 0x8BD3E6)
    static let orbHalo = Color(hex: 0xB5A8FF)
    static let accent  = Color(hex: 0x7FE7C4)
    static let text    = Color(hex: 0xEDEFF7)
    static let textDim = Color(hex: 0x9AA3B8)

    enum Anim {
        static let breath: Animation   = .easeInOut(duration: 4.0)
        static let bgShift: Animation  = .easeInOut(duration: 12.0)
        static let pulse: Animation    = .easeOut(duration: 2.0)
        static let digitRoll: Animation = .spring(response: 0.30, dampingFraction: 0.80)
        static let tap: Animation      = .spring(response: 0.25, dampingFraction: 0.60)
        static let screen: Animation   = .easeInOut(duration: 0.5)
    }

    enum Layout {
        static let orbSize: CGFloat = 240
        static let cornerRadius: CGFloat = 20
        static let pad: CGFloat = 20
    }
}

extension Color {
    init(hex: UInt32, opacity: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8)  & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self = Color(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}
