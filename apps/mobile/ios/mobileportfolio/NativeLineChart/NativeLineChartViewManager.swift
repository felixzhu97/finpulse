import React
import UIKit

@objc(NativeLineChart)
class NativeLineChart: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeLineChartView()
    }
}
