import React
import UIKit

@objc(NativeSparkline)
class NativeSparkline: RCTViewManager {

    override func view() -> UIView! {
        return NativeSparklineView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
