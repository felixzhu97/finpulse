package com.anonymous.mobileportfolio.view

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import com.anonymous.mobileportfolio.view.chart.ChartGl
import com.anonymous.mobileportfolio.view.chart.HistogramChartThemes
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import android.opengl.GLES30

class NativeHistogramChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : GLSurfaceView(context, attrs) {

    private var lastData: DoubleArray? = null
    private val renderer = HistogramRenderer()

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

    private class HistogramRenderer : GLSurfaceView.Renderer {
        private var barsBuffer: FloatBuffer? = null
        private var barsCount = 0
        private var program = 0
        private var posLoc = 0
        private var colorLoc = 0
        private var isDark = false
        private var gridBuffer: FloatBuffer? = null

        fun setDark(dark: Boolean) {
            isDark = dark
            gridBuffer = ChartGl.buildGridBuffer(HistogramChartThemes.theme(isDark).grid)
        }

        fun setData(values: DoubleArray?) {
            if (values == null || values.isEmpty()) {
                barsCount = 0
                return
            }
            val t = HistogramChartThemes.theme(isDark)
            val min = values.minOrNull() ?: 0.0
            val max = values.maxOrNull() ?: 1.0
            val range = (max - min).coerceAtLeast(1e-9)
            val n = values.size
            val barW = (1f / n).coerceAtLeast(0.001f) * 0.7f
            val barVerts = FloatArray(n * 6 * ChartGl.FLOATS_PER_VERTEX)
            for (i in values.indices) {
                val x0 = i.toFloat() / n
                val x1 = x0 + barW
                val y = ((values[i] - min) / range).toFloat()
                val o = i * 6 * ChartGl.FLOATS_PER_VERTEX
                ChartGl.putVertex(barVerts, o, x0, 0f, t.bar)
                ChartGl.putVertex(barVerts, o + 6, x1, 0f, t.bar)
                ChartGl.putVertex(barVerts, o + 12, x0, y, t.bar)
                ChartGl.putVertex(barVerts, o + 18, x0, y, t.bar)
                ChartGl.putVertex(barVerts, o + 24, x1, 0f, t.bar)
                ChartGl.putVertex(barVerts, o + 30, x1, y, t.bar)
            }
            barsCount = n * 6
            barsBuffer = ChartGl.toFloatBuffer(barVerts)
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            if (gridBuffer == null) gridBuffer = ChartGl.buildGridBuffer(HistogramChartThemes.theme(isDark).grid)
            program = ChartGl.loadProgram(ChartGl.VERTEX_SHADER, ChartGl.FRAGMENT_SHADER)
            posLoc = GLES30.glGetAttribLocation(program, "a_position")
            colorLoc = GLES30.glGetAttribLocation(program, "a_color")
            val t = HistogramChartThemes.theme(isDark)
            GLES30.glClearColor(t.r, t.g, t.b, 1f)
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
        }

        override fun onDrawFrame(gl: GL10?) {
            val t = HistogramChartThemes.theme(isDark)
            GLES30.glClearColor(t.r, t.g, t.b, 1f)
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            GLES30.glUseProgram(program)
            gridBuffer?.let { ChartGl.drawLines(it, 8, 1f, posLoc, colorLoc) }
            barsBuffer?.let {
                ChartGl.bindBuffer(it, posLoc, colorLoc)
                GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, barsCount)
            }
        }
    }
}
