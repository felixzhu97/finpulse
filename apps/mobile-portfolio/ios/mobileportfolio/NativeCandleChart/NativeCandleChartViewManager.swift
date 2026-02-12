import React
import UIKit

@objc(NativeCandleChart)
class NativeCandleChart: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeCandleChartView()
    }
}
