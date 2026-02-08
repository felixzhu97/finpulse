package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeLineOnlyChartViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeLineOnlyChartView>() {

    override fun getName() = "NativeLineOnlyChart"

    override fun createViewInstance(reactContext: ThemedReactContext) = NativeLineOnlyChartView(reactContext)

    @ReactProp(name = "data")
    fun setData(view: NativeLineOnlyChartView, data: ReadableArray?) {
        if (data == null) {
            view.setChartData(null)
            return
        }
        view.setChartData(DoubleArray(data.size()) { data.getDouble(it) })
    }

    @ReactProp(name = "theme")
    fun setTheme(view: NativeLineOnlyChartView, theme: String?) {
        view.setTheme(theme)
    }
}
