package com.anonymous.mobileportfolio.view

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import com.anonymous.mobileportfolio.view.chart.BaselineChartThemes
import com.anonymous.mobileportfolio.view.chart.ChartCurve
import com.anonymous.mobileportfolio.view.chart.ChartGl
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import android.opengl.GLES30

class NativeBaselineChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : GLSurfaceView(context, attrs) {

    private var lastValues: DoubleArray? = null
    private var lastBaseline: Double? = null
    private val renderer = BaselineRenderer()

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8, 8, 8, 8, 0, 0)
        setZOrderOnTop(false)
        holder.setFormat(android.graphics.PixelFormat.TRANSLUCENT)
        setRenderer(renderer)
    }

    fun setChartData(values: DoubleArray?) {
        lastValues = values
        renderer.setData(values)
        requestRender()
    }

    fun setBaselineValue(value: Double?) {
        lastBaseline = value
        renderer.setBaseline(value)
        requestRender()
    }

    fun setTheme(theme: String?) {
        renderer.setDark(theme == "dark")
        lastValues?.let { renderer.setData(it) }
        requestRender()
    }

    private class BaselineRenderer : GLSurfaceView.Renderer {
        private var lineBuffer: FloatBuffer? = null
        private var fillBuffer: FloatBuffer? = null
        private var lineCount = 0
        private var fillCount = 0
        private var baseline: Double? = null
        private var lastValues: DoubleArray? = null
        private var program = 0
        private var posLoc = 0
        private var colorLoc = 0
        private var isDark = false
        private var gridBuffer: FloatBuffer? = null

        fun setDark(dark: Boolean) {
            isDark = dark
            gridBuffer = ChartGl.buildGridBuffer(BaselineChartThemes.theme(isDark).grid)
        }

        fun setData(values: DoubleArray?) {
            lastValues = values
            updateBuffers()
        }

        fun setBaseline(b: Double?) {
            baseline = b
            updateBuffers()
        }

        private fun updateBuffers() {
            val values = lastValues ?: return
            if (values.size < 2) {
                lineCount = 0
                fillCount = 0
                return
            }
            val t = BaselineChartThemes.theme(isDark)
            val min = values.minOrNull() ?: 0.0
            val max = values.maxOrNull() ?: 1.0
            val range = (max - min).coerceAtLeast(1e-9)
            val base = baseline ?: values.average()
            val baseNorm = ((base - min) / range).toFloat()
            val n = values.size
            val xIn = FloatArray(n) { it.toFloat() / (n - 1).coerceAtLeast(1) }
            val yIn = FloatArray(n) { ((values[it] - min) / range).toFloat() }
            val (xOut, yOut) = ChartCurve.smoothPoints(xIn, yIn)
            val pts = xOut.size
            val lineCoords = FloatArray(pts * ChartGl.FLOATS_PER_VERTEX)
            val fillList = mutableListOf<Float>()
            for (i in 0 until pts) {
                val x = xOut[i]
                val y = yOut[i]
                ChartGl.putVertex(lineCoords, i * ChartGl.FLOATS_PER_VERTEX, x, y, t.line)
                val color = if (y >= baseNorm) t.fillAbove else t.fillBelow
                fillList.addAll(floatArrayOf(x, y, color[0], color[1], color[2], color[3]).toList())
                fillList.addAll(floatArrayOf(x, baseNorm, color[0], color[1], color[2], color[3]).toList())
            }
            lineCount = pts
            fillCount = fillList.size / ChartGl.FLOATS_PER_VERTEX
            lineBuffer = ChartGl.toFloatBuffer(lineCoords)
            fillBuffer = ChartGl.toFloatBuffer(fillList.toFloatArray())
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            if (gridBuffer == null) gridBuffer = ChartGl.buildGridBuffer(BaselineChartThemes.theme(isDark).grid)
            program = ChartGl.loadProgram(ChartGl.VERTEX_SHADER, ChartGl.FRAGMENT_SHADER)
            posLoc = GLES30.glGetAttribLocation(program, "a_position")
            colorLoc = GLES30.glGetAttribLocation(program, "a_color")
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
            GLES30.glClearColor(0f, 0f, 0f, 0f)
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
            GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
        }

        override fun onDrawFrame(gl: GL10?) {
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
            GLES30.glClearColor(0f, 0f, 0f, 0f)
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            GLES30.glUseProgram(program)
            gridBuffer?.let { ChartGl.drawLines(it, 8, 1f, posLoc, colorLoc) }
            fillBuffer?.let {
                ChartGl.bindBuffer(it, posLoc, colorLoc)
                GLES30.glDrawArrays(GLES30.GL_TRIANGLE_STRIP, 0, fillCount)
            }
            lineBuffer?.takeIf { lineCount >= 2 }?.let { ChartGl.drawLines(it, lineCount, 2f, posLoc, colorLoc) }
        }
    }
}
