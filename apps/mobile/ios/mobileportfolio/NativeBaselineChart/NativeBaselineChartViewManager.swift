import React
import UIKit

@objc(NativeBaselineChart)
class NativeBaselineChart: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeBaselineChartView()
    }
}
