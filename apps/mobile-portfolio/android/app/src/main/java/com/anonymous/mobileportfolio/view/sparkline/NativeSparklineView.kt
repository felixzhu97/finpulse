package com.anonymous.mobileportfolio.view.sparkline

import android.content.Context
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
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
        strokeWidth = 2.5f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val baselinePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 1.5f
        pathEffect = DashPathEffect(floatArrayOf(3f, 3f), 0f)
    }

    private val gradientPaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.FILL
    }

    private val path = Path()
    private val gradientPath = Path()

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

        val pts = dataPoints ?: SparklinePoints.generatePlaceholder(trend)
        if (pts.size < 2) return

        val resolvedTrend = SparklinePoints.resolveTrend(dataValues, trend)
        val lineColor = SparklineTheme.lineColorForTrend(resolvedTrend)

        drawGradient(canvas, w, h, pts, resolvedTrend)
        drawBaseline(canvas, w, h, resolvedTrend)
        drawLine(canvas, w, h, pts, lineColor)
    }

    private fun drawGradient(canvas: Canvas, width: Float, height: Float, points: List<Pair<Float, Float>>, trend: String) {
        gradientPath.reset()
        gradientPath.moveTo(0f, height)
        gradientPath.lineTo(points[0].first * width, points[0].second * height)
        
        for (i in 1 until points.size) {
            gradientPath.lineTo(points[i].first * width, points[i].second * height)
        }
        
        gradientPath.lineTo(width, height)
        gradientPath.close()

        val minY = points.minOfOrNull { it.second * height } ?: 0f
        val startColor = SparklineTheme.gradientStartColor(trend)
        val endColor = SparklineTheme.gradientEndColor(trend)
        val gradient = LinearGradient(
            width / 2, minY,
            width / 2, height,
            startColor,
            endColor,
            Shader.TileMode.CLAMP
        )
        gradientPaint.shader = gradient
        canvas.drawPath(gradientPath, gradientPaint)
    }

    private fun drawBaseline(canvas: Canvas, width: Float, height: Float, trend: String) {
        val midY = height / 2
        baselinePaint.color = SparklineTheme.baselineColor(trend)
        path.reset()
        path.moveTo(0f, midY)
        path.lineTo(width, midY)
        canvas.drawPath(path, baselinePaint)
    }

    private fun drawLine(canvas: Canvas, width: Float, height: Float, points: List<Pair<Float, Float>>, lineColor: Int) {
        linePaint.color = lineColor
        path.reset()
        path.moveTo(points[0].first * width, points[0].second * height)
        for (i in 1 until points.size) {
            path.lineTo(points[i].first * width, points[i].second * height)
        }
        canvas.drawPath(path, linePaint)
    }
}
