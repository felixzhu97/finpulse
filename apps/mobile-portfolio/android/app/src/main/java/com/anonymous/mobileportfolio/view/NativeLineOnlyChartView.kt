package com.anonymous.mobileportfolio.view

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import com.anonymous.mobileportfolio.view.chart.ChartCurve
import com.anonymous.mobileportfolio.view.chart.ChartGl
import com.anonymous.mobileportfolio.view.chart.LineOnlyChartThemes
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import android.opengl.GLES30

class NativeLineOnlyChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : GLSurfaceView(context, attrs) {

    private var lastData: DoubleArray? = null
    private val renderer = LineOnlyRenderer()

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8, 8, 8, 8, 16, 0)
        setRenderer(renderer)
    }

    fun setChartData(values: DoubleArray?) {
        lastData = values
        renderer.setData(values)
        requestRender()
    }

    fun setTheme(theme: String?) {
        renderer.setDark(theme == "dark")
        lastData?.let { renderer.setData(it) }
        requestRender()
    }

    private class LineOnlyRenderer : GLSurfaceView.Renderer {
        private var lineBuffer: FloatBuffer? = null
        private var lineCount = 0
        private var program = 0
        private var posLoc = 0
        private var colorLoc = 0
        private var isDark = false
        private var gridBuffer: FloatBuffer? = null

        fun setDark(dark: Boolean) {
            isDark = dark
            gridBuffer = ChartGl.buildGridBuffer(LineOnlyChartThemes.theme(isDark).grid)
        }

        fun setData(values: DoubleArray?) {
            if (values == null || values.size < 2) {
                lineCount = 0
                return
            }
            val t = LineOnlyChartThemes.theme(isDark)
            val min = values.minOrNull() ?: 0.0
            val max = values.maxOrNull() ?: 1.0
            val range = (max - min).coerceAtLeast(1e-9)
            val n = values.size
            val xIn = FloatArray(n) { it.toFloat() / (n - 1).coerceAtLeast(1) }
            val yIn = FloatArray(n) { ((values[it] - min) / range).toFloat() }
            val (xOut, yOut) = ChartCurve.smoothPoints(xIn, yIn)
            val pts = xOut.size
            val lineCoords = FloatArray(pts * ChartGl.FLOATS_PER_VERTEX)
            for (i in 0 until pts) {
                ChartGl.putVertex(lineCoords, i * ChartGl.FLOATS_PER_VERTEX, xOut[i], yOut[i], t.line)
            }
            lineCount = pts
            lineBuffer = ChartGl.toFloatBuffer(lineCoords)
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            if (gridBuffer == null) gridBuffer = ChartGl.buildGridBuffer(LineOnlyChartThemes.theme(isDark).grid)
            program = ChartGl.loadProgram(ChartGl.VERTEX_SHADER, ChartGl.FRAGMENT_SHADER)
            posLoc = GLES30.glGetAttribLocation(program, "a_position")
            colorLoc = GLES30.glGetAttribLocation(program, "a_color")
            val t = LineOnlyChartThemes.theme(isDark)
            GLES30.glClearColor(t.r, t.g, t.b, 1f)
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
        }

        override fun onDrawFrame(gl: GL10?) {
            val t = LineOnlyChartThemes.theme(isDark)
            GLES30.glClearColor(t.r, t.g, t.b, 1f)
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            GLES30.glUseProgram(program)
            gridBuffer?.let { ChartGl.drawLines(it, 8, 1f, posLoc, colorLoc) }
            lineBuffer?.takeIf { lineCount >= 2 }?.let {
                GLES30.glLineWidth(2f)
                ChartGl.bindBuffer(it, posLoc, colorLoc)
                GLES30.glDrawArrays(GLES30.GL_LINE_STRIP, 0, lineCount)
            }
        }
    }
}
