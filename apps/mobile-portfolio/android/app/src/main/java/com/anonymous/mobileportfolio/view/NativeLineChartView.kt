package com.anonymous.mobileportfolio.view

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import android.opengl.GLES30
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

private object ChartTheme {
    const val CLEAR_R = 0.97f
    const val CLEAR_G = 0.97f
    const val CLEAR_B = 0.98f
    val LINE_COLOR = floatArrayOf(1f, 0.2f, 0.2f, 1f)
    val FILL_TOP = floatArrayOf(1f, 0.2f, 0.2f, 0.35f)
    val FILL_BOTTOM = floatArrayOf(1f, 0.2f, 0.2f, 0f)
    val GRID_COLOR = floatArrayOf(0.85f, 0.85f, 0.88f, 1f)
}

private const val FLOATS_PER_VERTEX = 6
private const val STRIDE_BYTES = 24

private fun putVertex(arr: FloatArray, offset: Int, x: Float, y: Float, color: FloatArray) {
    arr[offset] = x
    arr[offset + 1] = y
    System.arraycopy(color, 0, arr, offset + 2, 4)
}

private class ChartData {
    var lineBuffer: FloatBuffer? = null
    var fillBuffer: FloatBuffer? = null
    var lineCount = 0
    var fillCount = 0

    fun setData(values: DoubleArray?) {
        if (values == null || values.size < 2) {
            lineCount = 0
            fillCount = 0
            return
        }
        val min = values.minOrNull() ?: 0.0
        val max = values.maxOrNull() ?: 1.0
        val range = (max - min).coerceAtLeast(1e-9)
        val n = values.size
        val lineCoords = FloatArray(n * FLOATS_PER_VERTEX)
        val fillCoords = FloatArray(n * 2 * FLOATS_PER_VERTEX)
        for (i in values.indices) {
            val x = i.toFloat() / (n - 1).coerceAtLeast(1)
            val y = ((values[i] - min) / range).toFloat()
            putVertex(lineCoords, i * FLOATS_PER_VERTEX, x, y, ChartTheme.LINE_COLOR)
            putVertex(fillCoords, i * 12, x, y, ChartTheme.FILL_TOP)
            putVertex(fillCoords, i * 12 + 6, x, 0f, ChartTheme.FILL_BOTTOM)
        }
        lineCount = n
        fillCount = n * 2
        lineBuffer = toFloatBuffer(lineCoords)
        fillBuffer = toFloatBuffer(fillCoords)
    }

    private fun toFloatBuffer(arr: FloatArray): FloatBuffer =
        ByteBuffer.allocateDirect(arr.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply { put(arr); position(0) }
}

class NativeLineChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : GLSurfaceView(context, attrs, defStyle) {

    private val renderer = ChartRenderer()

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8, 8, 8, 8, 16, 0)
        setRenderer(renderer)
    }

    fun setChartData(values: DoubleArray?) {
        renderer.setData(values)
        requestRender()
    }

    private class ChartRenderer : GLSurfaceView.Renderer {
        private val chartData = ChartData()
        private var program = 0
        private var posLoc = 0
        private var colorLoc = 0

        private val gridBuffer = FloatArray(8 * FLOATS_PER_VERTEX).apply {
            for (i in 1..4) {
                val y = -i / 5f * 2f + 1f
                putVertex(this, (i - 1) * 12, -1f, y, ChartTheme.GRID_COLOR)
                putVertex(this, (i - 1) * 12 + 6, 1f, y, ChartTheme.GRID_COLOR)
            }
        }.let { ByteBuffer.allocateDirect(it.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply { put(it); position(0) } }

        private val vertexShader = """
            #version 300 es
            in vec2 a_position;
            in vec4 a_color;
            out vec4 v_color;
            void main() {
                vec2 clip = a_position * 2.0 - 1.0;
                clip.y = -clip.y;
                gl_Position = vec4(clip, 0.0, 1.0);
                v_color = a_color;
            }
        """.trimIndent()

        private val fragmentShader = """
            #version 300 es
            precision mediump float;
            in vec4 v_color;
            out vec4 fragColor;
            void main() { fragColor = v_color; }
        """.trimIndent()

        fun setData(values: DoubleArray?) {
            chartData.setData(values)
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            program = loadProgram(vertexShader, fragmentShader)
            posLoc = GLES30.glGetAttribLocation(program, "a_position")
            colorLoc = GLES30.glGetAttribLocation(program, "a_color")
            GLES30.glClearColor(ChartTheme.CLEAR_R, ChartTheme.CLEAR_G, ChartTheme.CLEAR_B, 1f)
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
        }

        override fun onDrawFrame(gl: GL10?) {
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            GLES30.glUseProgram(program)
            drawLines(gridBuffer, 8, 1f)
            chartData.fillBuffer?.let { drawTriangles(it, chartData.fillCount) }
            chartData.lineBuffer?.takeIf { chartData.lineCount >= 2 }?.let { drawLines(it, chartData.lineCount, 2f) }
        }

        private fun drawLines(buffer: FloatBuffer, count: Int, lineWidth: Float) {
            GLES30.glLineWidth(lineWidth)
            bindBuffer(buffer)
            GLES30.glDrawArrays(GLES30.GL_LINES, 0, count)
        }

        private fun drawTriangles(buffer: FloatBuffer, count: Int) {
            bindBuffer(buffer)
            GLES30.glDrawArrays(GLES30.GL_TRIANGLE_STRIP, 0, count)
        }

        private fun bindBuffer(buffer: FloatBuffer) {
            GLES30.glEnableVertexAttribArray(posLoc)
            GLES30.glEnableVertexAttribArray(colorLoc)
            GLES30.glVertexAttribPointer(posLoc, 2, GLES30.GL_FLOAT, false, STRIDE_BYTES, buffer)
            GLES30.glVertexAttribPointer(colorLoc, 4, GLES30.GL_FLOAT, false, STRIDE_BYTES, buffer.duplicate().apply { position(2) })
        }

        private fun loadProgram(vertexSource: String, fragmentSource: String): Int {
            val vs = compileShader(GLES30.GL_VERTEX_SHADER, vertexSource)
            val fs = compileShader(GLES30.GL_FRAGMENT_SHADER, fragmentSource)
            val prog = GLES30.glCreateProgram()
            GLES30.glAttachShader(prog, vs)
            GLES30.glAttachShader(prog, fs)
            GLES30.glLinkProgram(prog)
            GLES30.glDeleteShader(vs)
            GLES30.glDeleteShader(fs)
            return prog
        }

        private fun compileShader(type: Int, source: String): Int {
            val shader = GLES30.glCreateShader(type)
            GLES30.glShaderSource(shader, source)
            GLES30.glCompileShader(shader)
            return shader
        }
    }

}
