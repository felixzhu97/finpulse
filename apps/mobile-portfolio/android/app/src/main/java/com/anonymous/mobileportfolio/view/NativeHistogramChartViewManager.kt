package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeHistogramChartViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeHistogramChartView>() {

    override fun getName() = "NativeHistogramChart"

    override fun createViewInstance(reactContext: ThemedReactContext) = NativeHistogramChartView(reactContext)

    @ReactProp(name = "data")
    fun setData(view: NativeHistogramChartView, data: ReadableArray?) {
        if (data == null) {
            view.setChartData(null)
            return
        }
        view.setChartData(DoubleArray(data.size()) { data.getDouble(it) })
    }

    @ReactProp(name = "theme")
    fun setTheme(view: NativeHistogramChartView, theme: String?) {
        view.setTheme(theme)
    }
}
