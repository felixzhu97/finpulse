package com.anonymous.mobileportfolio.view.democard

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeDemoCardViewManager(reactContext: ReactApplicationContext) :
    SimpleViewManager<NativeDemoCardView>() {

    override fun getName() = "NativeDemoCard"

    override fun createViewInstance(reactContext: ThemedReactContext): NativeDemoCardView {
        return NativeDemoCardView(reactContext).apply {
            setTitle("Native Demo Card (Android)")
        }
    }

    @ReactProp(name = "title")
    fun setTitle(view: NativeDemoCardView, title: String?) {
        view.setTitle(title ?: "Native Demo Card (Android)")
    }
}
