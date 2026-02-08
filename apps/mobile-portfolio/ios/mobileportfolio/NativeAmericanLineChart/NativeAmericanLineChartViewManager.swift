import React
import UIKit

@objc(NativeAmericanLineChart)
class NativeAmericanLineChart: RCTViewManager {

    override func view() -> UIView! {
        return NativeAmericanLineChartView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
