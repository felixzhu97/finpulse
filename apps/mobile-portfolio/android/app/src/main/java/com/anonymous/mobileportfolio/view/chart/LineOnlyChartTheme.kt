package com.anonymous.mobileportfolio.view.chart

data class LineOnlyChartTheme(
    val r: Float, val g: Float, val b: Float,
    val line: FloatArray,
    val grid: FloatArray
) {
    override fun equals(other: Any?): Boolean = other is LineOnlyChartTheme &&
        r == other.r && g == other.g && b == other.b &&
        line.contentEquals(other.line) && grid.contentEquals(other.grid)
    override fun hashCode(): Int = arrayOf(r, g, b).hashCode() + line.hashCode() + grid.hashCode()
}

object LineOnlyChartThemes {
    fun theme(dark: Boolean): LineOnlyChartTheme = if (dark)
        LineOnlyChartTheme(0f, 0f, 0f, floatArrayOf(1f, 0.25f, 0.25f, 1f), floatArrayOf(0.22f, 0.22f, 0.26f, 1f))
    else
        LineOnlyChartTheme(0.97f, 0.97f, 0.98f, floatArrayOf(0.2f, 0.4f, 0.9f, 1f), floatArrayOf(0.85f, 0.85f, 0.88f, 1f))
}
