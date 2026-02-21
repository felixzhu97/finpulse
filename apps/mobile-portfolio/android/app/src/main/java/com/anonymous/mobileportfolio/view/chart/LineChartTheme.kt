package com.anonymous.mobileportfolio.view.chart

data class LineChartTheme(
    val r: Float, val g: Float, val b: Float,
    val line: FloatArray,
    val fillTop: FloatArray,
    val fillBottom: FloatArray,
    val grid: FloatArray,
    val bottomSeparator: FloatArray
) {
    override fun equals(other: Any?): Boolean = other is LineChartTheme &&
        r == other.r && g == other.g && b == other.b &&
        line.contentEquals(other.line) && fillTop.contentEquals(other.fillTop) &&
        fillBottom.contentEquals(other.fillBottom) && grid.contentEquals(other.grid) &&
        bottomSeparator.contentEquals(other.bottomSeparator)
    override fun hashCode(): Int = arrayOf(r, g, b).hashCode() + line.hashCode() + fillTop.hashCode() + fillBottom.hashCode() + grid.hashCode() + bottomSeparator.hashCode()
}

object LineChartThemes {
    fun theme(dark: Boolean, trend: String = "flat"): LineChartTheme {
        val lineColor: FloatArray
        val fillTop: FloatArray
        val fillBottom: FloatArray
        
        val fillAlpha = if (dark) 0.15f else 0.55f
        when (trend) {
            "up" -> {
                lineColor = floatArrayOf(255f/255f, 59f/255f, 48f/255f, 1f)
                fillTop = floatArrayOf(255f/255f, 59f/255f, 48f/255f, fillAlpha)
                fillBottom = floatArrayOf(255f/255f, 59f/255f, 48f/255f, 0f)
            }
            "down" -> {
                lineColor = floatArrayOf(52f/255f, 199f/255f, 89f/255f, 1f)
                fillTop = floatArrayOf(52f/255f, 199f/255f, 89f/255f, fillAlpha)
                fillBottom = floatArrayOf(52f/255f, 199f/255f, 89f/255f, 0f)
            }
            else -> {
                lineColor = floatArrayOf(142f/255f, 142f/255f, 147f/255f, 1f)
                fillTop = floatArrayOf(142f/255f, 142f/255f, 147f/255f, fillAlpha)
                fillBottom = floatArrayOf(142f/255f, 142f/255f, 147f/255f, 0f)
            }
        }
        
        val grid = if (dark) floatArrayOf(0.25f, 0.25f, 0.28f, 0.6f) else floatArrayOf(0.6f, 0.6f, 0.65f, 0.5f)
        val bottomSeparator = if (dark) floatArrayOf(0.5f, 0.5f, 0.55f, 0.9f) else floatArrayOf(0.75f, 0.75f, 0.8f, 0.9f)
        val clear = floatArrayOf(0f, 0f, 0f)
        
        return LineChartTheme(clear[0], clear[1], clear[2], lineColor, fillTop, fillBottom, grid, bottomSeparator)
    }
}
