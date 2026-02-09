package com.anonymous.mobileportfolio.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View
import kotlin.math.PI
import kotlin.math.sin

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
        color = android.graphics.Color.argb(102, 156, 163, 175)
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
            dataPoints = value?.let { scaleToPoints(it) }
            invalidate()
        }

    private var dataPoints: List<Pair<Float, Float>>? = null

    private fun scaleToPoints(values: DoubleArray): List<Pair<Float, Float>> {
        if (values.size < 2) return emptyList()
        val min = values.minOrNull() ?: 0.0
        val max = values.maxOrNull() ?: 1.0
        val range = max - min
        val pad = 0.06f
        val height = 1 - pad * 2
        val n = (values.size - 1).toFloat()
        val scale = if (range >= 1e-9) 1f / range.toFloat() else 0f
        return values.mapIndexed { i, v ->
            val x = i.toFloat() / n
            val y = if (scale > 0) 1 - pad - ((v - min) * scale).toFloat() * height else 0.5f
            x to y
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        val midY = h / 2
        path.reset()
        path.moveTo(0f, midY)
        path.lineTo(w, midY)
        canvas.drawPath(path, baselinePaint)

        val pts = dataPoints ?: generatePoints(trend, 10)
        if (pts.size < 2) return
        val resolvedTrend = if (dataValues != null && dataValues!!.size >= 2) {
            val first = dataValues!!.first()
            val last = dataValues!!.last()
            when { last > first -> "up"; last < first -> "down"; else -> "flat" }
        } else trend
        linePaint.color = when (resolvedTrend) {
            "up" -> android.graphics.Color.parseColor("#ef4444")
            "down" -> android.graphics.Color.parseColor("#22c55e")
            else -> android.graphics.Color.parseColor("#6b7280")
        }
        path.reset()
        path.moveTo(pts[0].first * w, pts[0].second * h)
        for (i in 1 until pts.size) {
            path.lineTo(pts[i].first * w, pts[i].second * h)
        }
        canvas.drawPath(path, linePaint)
    }

    private fun generatePoints(trend: String, count: Int): List<Pair<Float, Float>> {
        val n = (count - 1).coerceAtLeast(1).toFloat()
        val amp = 0.35f
        val slope = when (trend) {
            "up" -> -1f
            "down" -> 1f
            else -> 0f
        }
        return (0 until count).map { i ->
            val t = i.toFloat() / n
            val noise = sin(t * PI.toFloat() * 2) * amp * 0.5f
            val y = 0.5f + slope * t * amp + noise
            t to y
        }
    }
}
