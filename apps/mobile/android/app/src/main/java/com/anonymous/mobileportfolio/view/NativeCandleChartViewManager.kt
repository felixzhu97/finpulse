package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeCandleChartViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeCandleChartView>() {

    override fun getName() = "NativeCandleChart"

    override fun createViewInstance(reactContext: ThemedReactContext) = NativeCandleChartView(reactContext)

    @ReactProp(name = "data")
    fun setData(view: NativeCandleChartView, data: ReadableArray?) {
        if (data == null) {
            view.setData(null)
            return
        }
        view.setData(DoubleArray(data.size()) { data.getDouble(it) })
    }

    @ReactProp(name = "theme")
    fun setTheme(view: NativeCandleChartView, theme: String?) {
        view.setTheme(theme)
    }
}
