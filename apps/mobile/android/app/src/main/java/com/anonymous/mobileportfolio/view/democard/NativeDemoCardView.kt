package com.anonymous.mobileportfolio.view.democard

import android.content.Context
import android.graphics.Typeface
import android.widget.LinearLayout
import android.widget.TextView

class NativeDemoCardView(context: Context) : LinearLayout(context) {

    private val label = TextView(context).apply {
        setTextColor(0xFF000000.toInt())
        textSize = 16f
        setTypeface(null, Typeface.BOLD)
    }

    init {
        setBackgroundColor(0xFFE5E5E5.toInt())
        setPadding(24, 24, 24, 24)
        orientation = VERTICAL
        addView(label, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
    }

    fun setTitle(title: String) {
        label.text = if (title.isEmpty()) "Native Demo Card (Android)" else title
    }
}
