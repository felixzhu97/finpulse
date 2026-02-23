import React
import UIKit

@objc
public class BaseChartViewManager: RCTViewManager {
    
    override public static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    public func createView() -> UIView {
        fatalError("Subclasses must implement createView()")
    }
    
    override public func view() -> UIView! {
        return createView()
    }
}
