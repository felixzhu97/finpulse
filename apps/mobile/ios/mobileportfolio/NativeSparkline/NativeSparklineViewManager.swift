import React
import UIKit

@objc(NativeSparkline)
class NativeSparkline: BaseChartViewManager {
    
    override func createView() -> UIView {
        return NativeSparklineView()
    }
}
