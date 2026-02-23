package com.anonymous.mobileportfolio.view

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import com.anonymous.mobileportfolio.view.chart.CandleChartThemes
import com.anonymous.mobileportfolio.view.chart.ChartGl
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import android.opengl.GLES30

class NativeCandleChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : GLSurfaceView(context, attrs) {

    private var lastData: DoubleArray? = null
    private val renderer = CandleRenderer()

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8, 8, 8, 8, 0, 0)
        setZOrderOnTop(false)
        holder.setFormat(android.graphics.PixelFormat.TRANSLUCENT)
        setRenderer(renderer)
    }

    fun setData(flatOHLC: DoubleArray?) {
        lastData = flatOHLC
        renderer.setData(flatOHLC)
        requestRender()
    }

    fun setTheme(theme: String?) {
        renderer.setDark(theme == "dark")
        lastData?.let { renderer.setData(it) }
        requestRender()
    }

    private class CandleRenderer : GLSurfaceView.Renderer {
        private var bodiesBuffer: FloatBuffer? = null
        private var wicksBuffer: FloatBuffer? = null
        private var bodiesCount = 0
        private var wicksCount = 0
        private var program = 0
        private var posLoc = 0
        private var colorLoc = 0
        private var isDark = false
        private var gridBuffer: FloatBuffer? = null

        fun setDark(dark: Boolean) {
            isDark = dark
            gridBuffer = ChartGl.buildGridBuffer(CandleChartThemes.theme(isDark).grid)
        }

        fun setData(flatOHLC: DoubleArray?) {
            if (flatOHLC == null || flatOHLC.size < 4) {
                bodiesCount = 0
                wicksCount = 0
                return
            }
            val t = CandleChartThemes.theme(isDark)
            val n = flatOHLC.size / 4
            var minH = flatOHLC[1]
            var maxH = flatOHLC[1]
            for (i in 0 until n) {
                minH = minOf(minH, flatOHLC[i * 4 + 2])
                maxH = maxOf(maxH, flatOHLC[i * 4 + 1])
            }
            val range = (maxH - minH).coerceAtLeast(1e-9)
            val barW = (1f / n).coerceAtLeast(0.001f) * 0.6f
            val bodyVerts = FloatArray(n * 6 * ChartGl.FLOATS_PER_VERTEX)
            val wickVerts = FloatArray(n * 2 * ChartGl.FLOATS_PER_VERTEX)
            for (i in 0 until n) {
                val o = flatOHLC[i * 4]
                val h = flatOHLC[i * 4 + 1]
                val l = flatOHLC[i * 4 + 2]
                val c = flatOHLC[i * 4 + 3]
                val x = i.toFloat() / (n - 1).coerceAtLeast(1)
                val yO = ((o - minH) / range).toFloat()
                val yC = ((c - minH) / range).toFloat()
                val yH = ((h - minH) / range).toFloat()
                val yL = ((l - minH) / range).toFloat()
                val (yLo, yHi) = if (c >= o) yO to yC else yC to yO
                val color = if (c >= o) t.up else t.down
                val x0 = x - barW / 2
                val x1 = x + barW / 2
                val bo = i * 6 * ChartGl.FLOATS_PER_VERTEX
                ChartGl.putVertex(bodyVerts, bo, x0, yLo, color)
                ChartGl.putVertex(bodyVerts, bo + 6, x1, yLo, color)
                ChartGl.putVertex(bodyVerts, bo + 12, x0, yHi, color)
                ChartGl.putVertex(bodyVerts, bo + 18, x0, yHi, color)
                ChartGl.putVertex(bodyVerts, bo + 24, x1, yLo, color)
                ChartGl.putVertex(bodyVerts, bo + 30, x1, yHi, color)
                ChartGl.putVertex(wickVerts, i * 12, x, yL, color)
                ChartGl.putVertex(wickVerts, i * 12 + 6, x, yH, color)
            }
            bodiesCount = n * 6
            wicksCount = n * 2
            bodiesBuffer = ChartGl.toFloatBuffer(bodyVerts)
            wicksBuffer = ChartGl.toFloatBuffer(wickVerts)
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            if (gridBuffer == null) gridBuffer = ChartGl.buildGridBuffer(CandleChartThemes.theme(isDark).grid)
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
            bodiesBuffer?.let {
                ChartGl.bindBuffer(it, posLoc, colorLoc)
                GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, bodiesCount)
            }
            wicksBuffer?.takeIf { wicksCount >= 2 }?.let { ChartGl.drawLines(it, wicksCount, 2f, posLoc, colorLoc) }
        }
    }
}
