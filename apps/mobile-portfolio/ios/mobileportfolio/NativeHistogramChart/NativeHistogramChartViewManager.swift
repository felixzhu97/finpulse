import React
import UIKit

@objc(NativeHistogramChart)
class NativeHistogramChart: RCTViewManager {

    override func view() -> UIView! {
        return NativeHistogramChartView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
