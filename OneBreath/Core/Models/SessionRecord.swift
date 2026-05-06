import Foundation
import SwiftData

@Model
final class SessionRecord {
    @Attribute(.unique) var id: UUID
    var date: Date
    var holdDuration: TimeInterval
    var breatheUpRounds: Int
    var notes: String?

    init(
        id: UUID = UUID(),
        date: Date = .now,
        holdDuration: TimeInterval,
        breatheUpRounds: Int = 0,
        notes: String? = nil
    ) {
        self.id = id
        self.date = date
        self.holdDuration = holdDuration
        self.breatheUpRounds = breatheUpRounds
        self.notes = notes
    }
}
