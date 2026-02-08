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

private fun baselineTheme(dark: Boolean): BaselineThemeColors {
    return if (dark) BaselineThemeColors(0f, 0f, 0f, floatArrayOf(0.9f, 0.9f, 0.92f, 1f), floatArrayOf(0.22f, 0.22f, 0.26f, 1f), floatArrayOf(0.2f, 0.72f, 0.45f, 0.5f), floatArrayOf(1f, 0.3f, 0.25f, 0.5f))
    else BaselineThemeColors(0.97f, 0.97f, 0.98f, floatArrayOf(0.2f, 0.2f, 0.2f, 1f), floatArrayOf(0.85f, 0.85f, 0.88f, 1f), floatArrayOf(0.2f, 0.7f, 0.4f, 0.4f), floatArrayOf(1f, 0.2f, 0.2f, 0.4f))
}
private data class BaselineThemeColors(val r: Float, val g: Float, val b: Float, val line: FloatArray, val grid: FloatArray, val fillAbove: FloatArray, val fillBelow: FloatArray)

private const val FLOATS_PER_VERTEX = 6
private const val STRIDE_BYTES = 24
private const val SMOOTH_STEPS = 12

private fun putVertex(arr: FloatArray, offset: Int, x: Float, y: Float, color: FloatArray) {
    arr[offset] = x
    arr[offset + 1] = y
    System.arraycopy(color, 0, arr, offset + 2, 4)
}

private fun catmullRom(p0: Float, p1: Float, p2: Float, p3: Float, t: Float): Float {
    val t2 = t * t
    val t3 = t2 * t
    return 0.5f * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
}

private fun smoothPoints(xIn: FloatArray, yIn: FloatArray): Pair<FloatArray, FloatArray> {
    if (xIn.size < 2) return xIn to yIn
    val out = mutableListOf<Pair<Float, Float>>()
    val n = xIn.size
    for (i in 0 until n - 1) {
        val p0x = if (i > 0) xIn[i - 1] else xIn[i]
        val p0y = if (i > 0) yIn[i - 1] else yIn[i]
        val p1x = xIn[i]; val p1y = yIn[i]
        val p2x = xIn[i + 1]; val p2y = yIn[i + 1]
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

private fun toFloatBuffer(arr: FloatArray): FloatBuffer =
    ByteBuffer.allocateDirect(arr.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply { put(arr); position(0) }

class NativeBaselineChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : GLSurfaceView(context, attrs, defStyle) {

    private var lastValues: DoubleArray? = null
    private var lastBaseline: Double? = null
    private val renderer = BaselineRenderer()

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8, 8, 8, 8, 16, 0)
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
            rebuildGrid()
        }

        private fun rebuildGrid() {
            val t = baselineTheme(isDark)
            val arr = FloatArray(8 * FLOATS_PER_VERTEX)
            for (i in 1..4) {
                val y = -i / 5f * 2f + 1f
                putVertex(arr, (i - 1) * 12, -1f, y, t.grid)
                putVertex(arr, (i - 1) * 12 + 6, 1f, y, t.grid)
            }
            gridBuffer = toFloatBuffer(arr)
        }

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
            val t = baselineTheme(isDark)
            val min = values.minOrNull() ?: 0.0
            val max = values.maxOrNull() ?: 1.0
            val range = (max - min).coerceAtLeast(1e-9)
            val base = baseline ?: values.average()
            val baseNorm = ((base - min) / range).toFloat()
            val n = values.size
            val xIn = FloatArray(n) { it.toFloat() / (n - 1).coerceAtLeast(1) }
            val yIn = FloatArray(n) { ((values[it] - min) / range).toFloat() }
            val (xOut, yOut) = smoothPoints(xIn, yIn)
            val pts = xOut.size
            val lineCoords = FloatArray(pts * FLOATS_PER_VERTEX)
            val fillList = mutableListOf<Float>()
            for (i in 0 until pts) {
                val x = xOut[i]
                val y = yOut[i]
                putVertex(lineCoords, i * FLOATS_PER_VERTEX, x, y, t.line)
                val color = if (y >= baseNorm) t.fillAbove else t.fillBelow
                fillList.addAll(floatArrayOf(x, y, color[0], color[1], color[2], color[3]).toList())
                fillList.addAll(floatArrayOf(x, baseNorm, color[0], color[1], color[2], color[3]).toList())
            }
            lineCount = pts
            fillCount = fillList.size / FLOATS_PER_VERTEX
            lineBuffer = toFloatBuffer(lineCoords)
            fillBuffer = toFloatBuffer(fillList.toFloatArray())
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            if (gridBuffer == null) rebuildGrid()
            program = loadProgram(vertexShader, fragmentShader)
            posLoc = GLES30.glGetAttribLocation(program, "a_position")
            colorLoc = GLES30.glGetAttribLocation(program, "a_color")
            val t = baselineTheme(isDark)
            GLES30.glClearColor(t.r, t.g, t.b, 1f)
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
        }

        override fun onDrawFrame(gl: GL10?) {
            val t = baselineTheme(isDark)
            GLES30.glClearColor(t.r, t.g, t.b, 1f)
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            GLES30.glUseProgram(program)
            gridBuffer?.let { drawLines(it, 8, 1f) }
            fillBuffer?.let { bindBuffer(it); GLES30.glDrawArrays(GLES30.GL_TRIANGLE_STRIP, 0, fillCount) }
            lineBuffer?.takeIf { lineCount >= 2 }?.let { drawLines(it, lineCount, 2f) }
        }

        private fun drawLines(buffer: FloatBuffer, count: Int, lineWidth: Float) {
            GLES30.glLineWidth(lineWidth)
            bindBuffer(buffer)
            GLES30.glDrawArrays(GLES30.GL_LINES, 0, count)
        }

        private fun bindBuffer(buffer: FloatBuffer) {
            GLES30.glEnableVertexAttribArray(posLoc)
            GLES30.glEnableVertexAttribArray(colorLoc)
            GLES30.glVertexAttribPointer(posLoc, 2, GLES30.GL_FLOAT, false, STRIDE_BYTES, buffer)
            GLES30.glVertexAttribPointer(colorLoc, 4, GLES30.GL_FLOAT, false, STRIDE_BYTES, buffer.duplicate().apply { position(2) })
        }

        private fun loadProgram(vs: String, fs: String): Int {
            val v = GLES30.glCreateShader(GLES30.GL_VERTEX_SHADER).also { GLES30.glShaderSource(it, vs); GLES30.glCompileShader(it) }
            val f = GLES30.glCreateShader(GLES30.GL_FRAGMENT_SHADER).also { GLES30.glShaderSource(it, fs); GLES30.glCompileShader(it) }
            val p = GLES30.glCreateProgram()
            GLES30.glAttachShader(p, v)
            GLES30.glAttachShader(p, f)
            GLES30.glLinkProgram(p)
            GLES30.glDeleteShader(v)
            GLES30.glDeleteShader(f)
            return p
        }
    }
}
