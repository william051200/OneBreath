import XCTest
@testable import OneBreath

@MainActor
final class TimerViewModelTests: XCTestCase {
    func test_initialPhaseIsIdle() {
        let vm = TimerViewModel()
        if case .idle = vm.phase { /* ok */ } else { XCTFail("Expected idle") }
    }

    func test_beginHold_setsHoldingPhase() {
        let vm = TimerViewModel()
        vm.beginHold()
        XCTAssertTrue(vm.isHolding)
        XCTAssertNotNil(vm.startedAt)
    }

    func test_releaseHold_setsFinished() {
        let vm = TimerViewModel()
        vm.beginHold()
        vm.releaseHold()
        if case .finished = vm.phase { /* ok */ } else { XCTFail("Expected finished") }
    }

    func test_reset_returnsToIdle() {
        let vm = TimerViewModel()
        vm.beginHold()
        vm.releaseHold()
        vm.reset()
        if case .idle = vm.phase { /* ok */ } else { XCTFail("Expected idle") }
        XCTAssertNil(vm.startedAt)
    }

    func test_skipToReady_movesToReady() {
        let vm = TimerViewModel()
        vm.skipToReady()
        if case .ready = vm.phase { /* ok */ } else { XCTFail("Expected ready") }
    }
}
