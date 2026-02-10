package com.anonymous.mobileportfolio.view.sparkline

import android.graphics.Color

object SparklineTheme {

    private const val UP_COLOR = "#ef4444"
    private const val DOWN_COLOR = "#22c55e"
    private const val FLAT_COLOR = "#6b7280"
    private const val BASELINE_ALPHA = 102
    private const val BASELINE_RED = 156
    private const val BASELINE_GREEN = 163
    private const val BASELINE_BLUE = 175

    fun lineColorForTrend(trend: String): Int = when (trend) {
        "up" -> Color.parseColor(UP_COLOR)
        "down" -> Color.parseColor(DOWN_COLOR)
        else -> Color.parseColor(FLAT_COLOR)
    }

    fun baselineColor(): Int = Color.argb(
        BASELINE_ALPHA,
        BASELINE_RED,
        BASELINE_GREEN,
        BASELINE_BLUE
    )
}
