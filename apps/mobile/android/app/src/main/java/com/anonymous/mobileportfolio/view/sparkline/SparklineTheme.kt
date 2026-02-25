package com.anonymous.mobileportfolio.view.sparkline

import android.graphics.Color

object SparklineTheme {

    private const val UP_COLOR = "#00C805"
    private const val DOWN_COLOR = "#FF3B30"
    private const val FLAT_COLOR = "#8e8e93"

    fun lineColorForTrend(trend: String): Int = when (trend) {
        "up" -> Color.parseColor(UP_COLOR)
        "down" -> Color.parseColor(DOWN_COLOR)
        else -> Color.parseColor(FLAT_COLOR)
    }

    fun baselineColor(trend: String): Int {
        val baseColor = lineColorForTrend(trend)
        return Color.argb(
            (Color.alpha(baseColor) * 0.3).toInt(),
            Color.red(baseColor),
            Color.green(baseColor),
            Color.blue(baseColor)
        )
    }

    fun gradientStartColor(trend: String): Int {
        val baseColor = lineColorForTrend(trend)
        return Color.argb(
            (Color.alpha(baseColor) * 0.15).toInt(),
            Color.red(baseColor),
            Color.green(baseColor),
            Color.blue(baseColor)
        )
    }

    fun gradientEndColor(trend: String): Int {
        val baseColor = lineColorForTrend(trend)
        return Color.argb(
            0,
            Color.red(baseColor),
            Color.green(baseColor),
            Color.blue(baseColor)
        )
    }
}
