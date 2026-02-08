package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeBaselineChartViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeBaselineChartView>() {

    override fun getName() = "NativeBaselineChart"

    override fun createViewInstance(reactContext: ThemedReactContext) = NativeBaselineChartView(reactContext)

    @ReactProp(name = "data")
    fun setData(view: NativeBaselineChartView, data: ReadableArray?) {
        if (data == null) {
            view.setChartData(null)
            return
        }
        view.setChartData(DoubleArray(data.size()) { data.getDouble(it) })
    }

    @ReactProp(name = "baselineValue")
    fun setBaselineValue(view: NativeBaselineChartView, value: Double?) {
        view.setBaselineValue(value)
    }

    @ReactProp(name = "theme")
    fun setTheme(view: NativeBaselineChartView, theme: String?) {
        view.setTheme(theme)
    }
}
