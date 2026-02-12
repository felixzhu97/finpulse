import React
import UIKit

@objc(NativeAmericanLineChart)
class NativeAmericanLineChart: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeAmericanLineChartView()
    }
}
