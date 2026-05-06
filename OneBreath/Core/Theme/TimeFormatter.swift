import Foundation

enum TimeFormatter {
    /// Formats elapsed seconds as `M:SS.t` (e.g., 1:42.3).
    static func liveDisplay(_ seconds: TimeInterval) -> String {
        let total = max(0, seconds)
        let minutes = Int(total) / 60
        let secs = Int(total) % 60
        let tenths = Int((total - floor(total)) * 10)
        return String(format: "%d:%02d.%d", minutes, secs, tenths)
    }

    /// Formats final hold duration as `M:SS` (e.g., 1:42).
    static func compact(_ seconds: TimeInterval) -> String {
        let total = max(0, Int(seconds.rounded()))
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}
