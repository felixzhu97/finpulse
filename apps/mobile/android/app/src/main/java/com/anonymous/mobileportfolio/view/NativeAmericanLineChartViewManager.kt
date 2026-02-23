package com.anonymous.mobileportfolio.view

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeAmericanLineChartViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeAmericanLineChartView>() {

    override fun getName() = "NativeAmericanLineChart"

    override fun createViewInstance(reactContext: ThemedReactContext) = NativeAmericanLineChartView(reactContext)

    @ReactProp(name = "data")
    fun setData(view: NativeAmericanLineChartView, data: ReadableArray?) {
        if (data == null) {
            view.setData(null)
            return
        }
        view.setData(DoubleArray(data.size()) { data.getDouble(it) })
    }

    @ReactProp(name = "theme")
    fun setTheme(view: NativeAmericanLineChartView, theme: String?) {
        view.setTheme(theme)
    }
}
