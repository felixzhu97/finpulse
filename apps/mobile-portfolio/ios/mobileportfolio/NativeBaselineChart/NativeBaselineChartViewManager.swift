import React
import UIKit

@objc(NativeBaselineChart)
class NativeBaselineChart: RCTViewManager {

    override func view() -> UIView! {
        return NativeBaselineChartView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
