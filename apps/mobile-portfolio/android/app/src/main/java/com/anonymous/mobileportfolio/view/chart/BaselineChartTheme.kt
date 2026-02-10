package com.anonymous.mobileportfolio.view.chart

data class BaselineChartTheme(
    val r: Float, val g: Float, val b: Float,
    val line: FloatArray,
    val grid: FloatArray,
    val fillAbove: FloatArray,
    val fillBelow: FloatArray
) {
    override fun equals(other: Any?): Boolean = other is BaselineChartTheme &&
        r == other.r && g == other.g && b == other.b &&
        line.contentEquals(other.line) && grid.contentEquals(other.grid) &&
        fillAbove.contentEquals(other.fillAbove) && fillBelow.contentEquals(other.fillBelow)
    override fun hashCode(): Int = arrayOf(r, g, b).hashCode() + line.hashCode() + grid.hashCode() + fillAbove.hashCode() + fillBelow.hashCode()
}

object BaselineChartThemes {
    fun theme(dark: Boolean): BaselineChartTheme = if (dark)
        BaselineChartTheme(0f, 0f, 0f, floatArrayOf(0.9f, 0.9f, 0.92f, 1f), floatArrayOf(0.22f, 0.22f, 0.26f, 1f), floatArrayOf(0.2f, 0.72f, 0.45f, 0.5f), floatArrayOf(1f, 0.3f, 0.25f, 0.5f))
    else
        BaselineChartTheme(0.97f, 0.97f, 0.98f, floatArrayOf(0.2f, 0.2f, 0.2f, 1f), floatArrayOf(0.85f, 0.85f, 0.88f, 1f), floatArrayOf(0.2f, 0.7f, 0.4f, 0.4f), floatArrayOf(1f, 0.2f, 0.2f, 0.4f))
}
