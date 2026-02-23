import React
import UIKit

@objc(NativeLineOnlyChart)
class NativeLineOnlyChart: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeLineOnlyChartView()
    }
}
