package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeLineChartViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeLineChartView>() {

    override fun getName() = "NativeLineChart"

    override fun createViewInstance(reactContext: ThemedReactContext): NativeLineChartView {
        return NativeLineChartView(reactContext)
    }

    @ReactProp(name = "data")
    fun setData(view: NativeLineChartView, data: ReadableArray?) {
        if (data == null) {
            view.setChartData(null)
            return
        }
        val arr = DoubleArray(data.size())
        for (i in 0 until data.size()) {
            arr[i] = data.getDouble(i)
        }
        view.setChartData(arr)
    }

    @ReactProp(name = "theme")
    fun setTheme(view: NativeLineChartView, theme: String?) {
        view.setTheme(theme)
    }

    @ReactProp(name = "trend")
    fun setTrend(view: NativeLineChartView, trend: String?) {
        view.setTrend(trend)
    }

    @ReactProp(name = "timestamps")
    fun setTimestamps(view: NativeLineChartView, timestamps: ReadableArray?) {
        if (timestamps == null) {
            view.setTimestamps(null)
            return
        }
        val arr = DoubleArray(timestamps.size())
        for (i in 0 until timestamps.size()) {
            arr[i] = timestamps.getDouble(i)
        }
        view.setTimestamps(arr)
    }

    @ReactProp(name = "baselineValue")
    fun setBaselineValue(view: NativeLineChartView, baselineValue: Double?) {
        view.setBaselineValue(baselineValue)
    }
}
