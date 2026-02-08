import React
import UIKit

@objc(NativeCandleChart)
class NativeCandleChart: RCTViewManager {

    override func view() -> UIView! {
        return NativeCandleChartView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
