package com.anonymous.mobileportfolio.view.chart

data class LineChartTheme(
    val r: Float, val g: Float, val b: Float,
    val line: FloatArray,
    val fillTop: FloatArray,
    val fillBottom: FloatArray,
    val grid: FloatArray
) {
    override fun equals(other: Any?): Boolean = other is LineChartTheme &&
        r == other.r && g == other.g && b == other.b &&
        line.contentEquals(other.line) && fillTop.contentEquals(other.fillTop) &&
        fillBottom.contentEquals(other.fillBottom) && grid.contentEquals(other.grid)
    override fun hashCode(): Int = arrayOf(r, g, b).hashCode() + line.hashCode() + fillTop.hashCode() + fillBottom.hashCode() + grid.hashCode()
}

object LineChartThemes {
    fun theme(dark: Boolean): LineChartTheme = if (dark)
        LineChartTheme(0f, 0f, 0f, floatArrayOf(1f, 0.25f, 0.25f, 1f), floatArrayOf(1f, 0.25f, 0.25f, 0.4f), floatArrayOf(1f, 0.25f, 0.25f, 0f), floatArrayOf(0.22f, 0.22f, 0.26f, 1f))
    else
        LineChartTheme(0.97f, 0.97f, 0.98f, floatArrayOf(0.2f, 0.4f, 0.9f, 1f), floatArrayOf(0.2f, 0.4f, 0.9f, 0.4f), floatArrayOf(0.2f, 0.4f, 0.9f, 0f), floatArrayOf(0.85f, 0.85f, 0.88f, 1f))
}
