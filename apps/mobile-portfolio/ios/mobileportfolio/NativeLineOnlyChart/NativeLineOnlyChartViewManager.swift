import React
import UIKit

@objc(NativeLineOnlyChart)
class NativeLineOnlyChart: RCTViewManager {

    override func view() -> UIView! {
        return NativeLineOnlyChartView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
