package com.anonymous.mobileportfolio.view.chart

data class CandleChartTheme(
    val r: Float, val g: Float, val b: Float,
    val grid: FloatArray,
    val up: FloatArray,
    val down: FloatArray
) {
    override fun equals(other: Any?): Boolean = other is CandleChartTheme &&
        r == other.r && g == other.g && b == other.b &&
        grid.contentEquals(other.grid) && up.contentEquals(other.up) && down.contentEquals(other.down)
    override fun hashCode(): Int = arrayOf(r, g, b).hashCode() + grid.hashCode() + up.hashCode() + down.hashCode()
}

object CandleChartThemes {
    fun theme(dark: Boolean): CandleChartTheme = if (dark)
        CandleChartTheme(0f, 0f, 0f, floatArrayOf(0.22f, 0.22f, 0.26f, 1f), floatArrayOf(0.2f, 0.75f, 0.85f, 1f), floatArrayOf(1f, 0.3f, 0.25f, 1f))
    else
        CandleChartTheme(0f, 0f, 0f, floatArrayOf(0.85f, 0.85f, 0.88f, 1f), floatArrayOf(0.2f, 0.6f, 0.85f, 1f), floatArrayOf(0.9f, 0.25f, 0.2f, 1f))
}
