package com.anonymous.mobileportfolio.view.chart

data class HistogramChartTheme(
    val r: Float, val g: Float, val b: Float,
    val grid: FloatArray,
    val bar: FloatArray
) {
    override fun equals(other: Any?): Boolean = other is HistogramChartTheme &&
        r == other.r && g == other.g && b == other.b &&
        grid.contentEquals(other.grid) && bar.contentEquals(other.bar)
    override fun hashCode(): Int = arrayOf(r, g, b).hashCode() + grid.hashCode() + bar.hashCode()
}

object HistogramChartThemes {
    fun theme(dark: Boolean): HistogramChartTheme = if (dark)
        HistogramChartTheme(0f, 0f, 0f, floatArrayOf(0.22f, 0.22f, 0.26f, 1f), floatArrayOf(0.25f, 0.41f, 0.88f, 0.9f))
    else
        HistogramChartTheme(0.97f, 0.97f, 0.98f, floatArrayOf(0.85f, 0.85f, 0.88f, 1f), floatArrayOf(0.2f, 0.4f, 0.85f, 0.9f))
}
