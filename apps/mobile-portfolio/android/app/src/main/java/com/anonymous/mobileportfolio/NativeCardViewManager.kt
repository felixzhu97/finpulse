package com.anonymous.mobileportfolio

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeCardViewManager(reactContext: ReactApplicationContext) :
  SimpleViewManager<NativeCardView>() {

  override fun getName() = "NativeCard"

  override fun createViewInstance(reactContext: ThemedReactContext): NativeCardView {
    return NativeCardView(reactContext).apply {
      setTitle("Native Card (Android)")
    }
  }

  @ReactProp(name = "title")
  fun setTitle(view: NativeCardView, title: String?) {
    view.setTitle(title ?: "Native Card (Android)")
  }
}
