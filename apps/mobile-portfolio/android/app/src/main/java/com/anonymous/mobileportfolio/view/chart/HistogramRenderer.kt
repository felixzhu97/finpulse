package com.anonymous.mobileportfolio.view.chart

import android.opengl.GLES30
import com.anonymous.mobileportfolio.view.chart.ChartGl
import com.anonymous.mobileportfolio.view.chart.HistogramChartThemes
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class HistogramRenderer {
    private var barsBuffer: FloatBuffer? = null
    private var barsCount = 0
    private var program = 0
    private var posLoc = 0
    private var colorLoc = 0
    private var isDark = false

    fun setDark(dark: Boolean) {
        isDark = dark
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
            val x1 = (i + 1).toFloat() / n
            val x0 = x1 - barW
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

    fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        program = ChartGl.loadProgram(ChartGl.VERTEX_SHADER, ChartGl.FRAGMENT_SHADER)
        posLoc = GLES30.glGetAttribLocation(program, "a_position")
        colorLoc = GLES30.glGetAttribLocation(program, "a_color")
        GLES30.glEnable(GLES30.GL_BLEND)
        GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
        GLES30.glClearColor(0f, 0f, 0f, 0f)
    }

    fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
        GLES30.glEnable(GLES30.GL_BLEND)
        GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
        GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
    }

    fun onDrawFrame(gl: GL10?) {
        GLES30.glEnable(GLES30.GL_BLEND)
        GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
        GLES30.glClearColor(0f, 0f, 0f, 0f)
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
        GLES30.glUseProgram(program)
        barsBuffer?.let {
            ChartGl.bindBuffer(it, posLoc, colorLoc)
            GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, barsCount)
        }
    }
}
