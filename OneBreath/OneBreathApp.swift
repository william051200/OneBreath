import SwiftUI
import SwiftData

@main
struct OneBreathApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(.dark)
        }
        .modelContainer(for: SessionRecord.self)
    }
}
