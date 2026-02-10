package com.anonymous.mobileportfolio.view.sparkline

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeSparklineViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeSparklineView>() {

    override fun getName() = "NativeSparkline"

    override fun createViewInstance(reactContext: ThemedReactContext) = NativeSparklineView(reactContext)

    @ReactProp(name = "trend")
    fun setTrend(view: NativeSparklineView, trend: String?) {
        view.trend = trend ?: "flat"
    }

    @ReactProp(name = "data")
    fun setData(view: NativeSparklineView, data: ReadableArray?) {
        if (data == null) {
            view.dataValues = null
            return
        }
        view.dataValues = DoubleArray(data.size()) { data.getDouble(it) }
    }
}
