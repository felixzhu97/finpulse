package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.anonymous.mobileportfolio.view.democard.NativeDemoCardViewManager
import com.anonymous.mobileportfolio.view.sparkline.NativeSparklineViewManager

class NativeViewsPackage : com.facebook.react.ReactPackage {

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(
            NativeDemoCardViewManager(reactContext),
            NativeLineChartViewManager(reactContext),
            NativeCandleChartViewManager(reactContext),
            NativeAmericanLineChartViewManager(reactContext),
            NativeBaselineChartViewManager(reactContext),
            NativeHistogramChartViewManager(reactContext),
            NativeLineOnlyChartViewManager(reactContext),
            NativeSparklineViewManager(reactContext)
        )
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return emptyList()
    }
}
