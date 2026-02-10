package com.anonymous.mobileportfolio.view.sparkline

import android.content.Context
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View

class NativeSparklineView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : View(context, attrs, defStyle) {

    private val linePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 2f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val baselinePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 1.5f
        color = SparklineTheme.baselineColor()
        pathEffect = DashPathEffect(floatArrayOf(3f, 3f), 0f)
    }

    private val path = Path()

    var trend: String = "flat"
        set(value) {
            field = value
            invalidate()
        }

    var dataValues: DoubleArray? = null
        set(value) {
            field = value
            dataPoints = value?.let { SparklinePoints.scaleToPoints(it) }
            invalidate()
        }

    private var dataPoints: List<Pair<Float, Float>>? = null

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        drawBaseline(canvas, w, h)
        drawLine(canvas, w, h)
    }

    private fun drawBaseline(canvas: Canvas, width: Float, height: Float) {
        val midY = height / 2
        path.reset()
        path.moveTo(0f, midY)
        path.lineTo(width, midY)
        canvas.drawPath(path, baselinePaint)
    }

    private fun drawLine(canvas: Canvas, width: Float, height: Float) {
        val pts = dataPoints ?: SparklinePoints.generatePlaceholder(trend)
        if (pts.size < 2) return

        val resolvedTrend = SparklinePoints.resolveTrend(dataValues, trend)
        linePaint.color = SparklineTheme.lineColorForTrend(resolvedTrend)

        path.reset()
        path.moveTo(pts[0].first * width, pts[0].second * height)
        for (i in 1 until pts.size) {
            path.lineTo(pts[i].first * width, pts[i].second * height)
        }
        canvas.drawPath(path, linePaint)
    }
}
