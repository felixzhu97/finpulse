package com.anonymous.mobileportfolio.view.sparkline

import kotlin.math.PI
import kotlin.math.sin

object SparklinePoints {

    private const val PAD = 0.06f
    private const val AMP = 0.35f
    private const val PLACEHOLDER_COUNT = 10

    fun scaleToPoints(values: DoubleArray): List<Pair<Float, Float>> {
        if (values.size < 2) return emptyList()
        val min = values.minOrNull() ?: 0.0
        val max = values.maxOrNull() ?: 1.0
        val range = max - min
        val height = 1 - PAD * 2
        val n = (values.size - 1).toFloat()
        val scale = if (range >= 1e-9) 1f / range.toFloat() else 0f
        return values.mapIndexed { i, v ->
            val x = i.toFloat() / n
            val y = if (scale > 0) 1 - PAD - ((v - min) * scale).toFloat() * height else 0.5f
            x to y
        }
    }

    fun resolveTrend(dataValues: DoubleArray?, fallbackTrend: String): String {
        if (dataValues == null || dataValues.size < 2) return fallbackTrend
        val first = dataValues.first()
        val last = dataValues.last()
        return when {
            last > first -> "up"
            last < first -> "down"
            else -> "flat"
        }
    }

    fun generatePlaceholder(trend: String, count: Int = PLACEHOLDER_COUNT): List<Pair<Float, Float>> {
        val n = (count - 1).coerceAtLeast(1).toFloat()
        val slope = when (trend) {
            "up" -> -1f
            "down" -> 1f
            else -> 0f
        }
        return (0 until count).map { i ->
            val t = i.toFloat() / n
            val noise = sin(t * PI.toFloat() * 2) * AMP * 0.5f
            val y = 0.5f + slope * t * AMP + noise
            t to y
        }
    }
}
