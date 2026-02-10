package com.anonymous.mobileportfolio.view.chart

object ChartCurve {

    private const val SMOOTH_STEPS = 12

    fun catmullRom(p0: Float, p1: Float, p2: Float, p3: Float, t: Float): Float {
        val t2 = t * t
        val t3 = t2 * t
        return 0.5f * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    }

    fun smoothPoints(xIn: FloatArray, yIn: FloatArray): Pair<FloatArray, FloatArray> {
        if (xIn.size < 2) return xIn to yIn
        val out = mutableListOf<Pair<Float, Float>>()
        val n = xIn.size
        for (i in 0 until n - 1) {
            val p0x = if (i > 0) xIn[i - 1] else xIn[i]
            val p0y = if (i > 0) yIn[i - 1] else yIn[i]
            val p1x = xIn[i]
            val p1y = yIn[i]
            val p2x = xIn[i + 1]
            val p2y = yIn[i + 1]
            val p3x = if (i + 2 < n) xIn[i + 2] else xIn[i + 1]
            val p3y = if (i + 2 < n) yIn[i + 2] else yIn[i + 1]
            for (s in 0 until SMOOTH_STEPS) {
                val t = s.toFloat() / SMOOTH_STEPS
                out.add(catmullRom(p0x, p1x, p2x, p3x, t) to catmullRom(p0y, p1y, p2y, p3y, t))
            }
        }
        out.add(xIn.last() to yIn.last())
        return out.map { it.first }.toFloatArray() to out.map { it.second }.toFloatArray()
    }
}
