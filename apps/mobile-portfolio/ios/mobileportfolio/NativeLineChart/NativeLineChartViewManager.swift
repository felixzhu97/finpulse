import React
import UIKit

@objc(NativeLineChart)
class NativeLineChart: RCTViewManager {

    override func view() -> UIView! {
        return NativeLineChartView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
