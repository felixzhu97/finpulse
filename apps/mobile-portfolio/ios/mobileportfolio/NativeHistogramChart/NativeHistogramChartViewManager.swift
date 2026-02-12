import React
import UIKit

@objc(NativeHistogramChart)
class NativeHistogramChart: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeHistogramChartView()
    }
}
