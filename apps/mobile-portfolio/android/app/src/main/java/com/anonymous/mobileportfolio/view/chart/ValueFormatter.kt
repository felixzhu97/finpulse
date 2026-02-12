package com.anonymous.mobileportfolio.view.chart

object ValueFormatter {
    fun format(value: Double): String {
        return when {
            kotlin.math.abs(value) >= 1e9 -> String.format("%.2fB", value / 1e9)
            kotlin.math.abs(value) >= 1e6 -> String.format("%.2fM", value / 1e6)
            kotlin.math.abs(value) >= 1e3 -> String.format("%.2fK", value / 1e3)
            kotlin.math.abs(value) >= 1 -> String.format("%.2f", value)
            kotlin.math.abs(value) >= 0.01 -> String.format("%.4f", value)
            else -> String.format("%.6f", value)
        }
    }
}
