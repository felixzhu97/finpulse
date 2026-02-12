package com.anonymous.mobileportfolio.view.chart

object ChartLayoutCalculator {
    const val CHART_PADDING = 0f
    const val BOTTOM_PADDING = 0f
    
    fun calculateChartAreaHeight(totalHeight: Float): Float {
        return totalHeight - CHART_PADDING - BOTTOM_PADDING
    }
    
    fun calculateYPosition(normalizedY: Float, chartAreaHeight: Float): Float {
        return CHART_PADDING + (1.0f - normalizedY) * chartAreaHeight
    }
    
    fun calculateBottomSeparatorY(chartAreaHeight: Float): Float {
        return CHART_PADDING + chartAreaHeight
    }
}
