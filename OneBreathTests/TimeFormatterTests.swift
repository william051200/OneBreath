import XCTest
@testable import OneBreath

final class TimeFormatterTests: XCTestCase {
    func test_liveDisplay_formatsZero() {
        XCTAssertEqual(TimeFormatter.liveDisplay(0), "0:00.0")
    }

    func test_liveDisplay_formatsSecondsAndTenths() {
        XCTAssertEqual(TimeFormatter.liveDisplay(7.4), "0:07.4")
    }

    func test_liveDisplay_formatsMinutes() {
        XCTAssertEqual(TimeFormatter.liveDisplay(102.3), "1:42.3")
    }

    func test_compact_roundsAndFormats() {
        XCTAssertEqual(TimeFormatter.compact(102.4), "1:42")
        XCTAssertEqual(TimeFormatter.compact(59.6), "1:00")
    }

    func test_negativeClampedToZero() {
        XCTAssertEqual(TimeFormatter.liveDisplay(-3), "0:00.0")
        XCTAssertEqual(TimeFormatter.compact(-3), "0:00")
    }
}
