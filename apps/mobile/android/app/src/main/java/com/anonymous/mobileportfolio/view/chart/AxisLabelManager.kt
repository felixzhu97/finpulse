package com.anonymous.mobileportfolio.view.chart

import android.content.Context
import android.graphics.Color
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView

class AxisLabelManager(
    private val parentView: ViewGroup,
    private val context: Context,
    private var isDark: Boolean
) {
    private val labels = mutableListOf<TextView>()
    
    val labelColor: Int
        get() = if (isDark) Color.argb(230, 255, 255, 255) else Color.argb(179, 0, 0, 0)
    
    fun updateTheme(isDark: Boolean) {
        this.isDark = isDark
        labels.forEach { it.setTextColor(labelColor) }
    }
    
    fun updateLabels(count: Int) {
        while (labels.size < count) {
            val label = createLabel()
            parentView.addView(label)
            labels.add(label)
        }
        
        while (labels.size > count) {
            val label = labels.removeAt(labels.size - 1)
            parentView.removeView(label)
        }
    }
    
    fun getLabel(index: Int): TextView? {
        return if (index >= 0 && index < labels.size) labels[index] else null
    }
    
    fun clearLabels() {
        labels.forEach { parentView.removeView(it) }
        labels.clear()
    }
    
    private fun createLabel(): TextView {
        return TextView(context).apply {
            textSize = 12f
            setTypeface(null, android.graphics.Typeface.MEDIUM)
            setTextColor(labelColor)
            isClickable = false
            isFocusable = false
        }
    }
}
