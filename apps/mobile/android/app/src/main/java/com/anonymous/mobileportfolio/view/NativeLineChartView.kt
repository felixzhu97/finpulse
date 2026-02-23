package com.anonymous.mobileportfolio.view

import android.content.Context
import android.graphics.Color
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.TextView
import com.anonymous.mobileportfolio.view.chart.ChartCurve
import com.anonymous.mobileportfolio.view.chart.ChartGl
import com.anonymous.mobileportfolio.view.chart.LineChartThemes
import com.anonymous.mobileportfolio.view.chart.ChartLayoutCalculator
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import android.opengl.GLES30

class NativeLineChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0
) : FrameLayout(context, attrs, defStyle) {
    
    private val glView: ChartGLSurfaceView
    private var baselineView: BaselineView? = null
    private var currentData: DoubleArray? = null
    private var currentTimestamps: DoubleArray? = null
    private var currentBaselineValue: Double? = null
    private var isDark = false
    
    private class BaselineView(context: Context) : android.view.View(context) {
        var baselineY: Float = 0f
            set(value) {
                field = value
                invalidate()
            }
        
        var isDarkMode: Boolean = false
            set(value) {
                field = value
                invalidate()
            }
        
        override fun onDraw(canvas: android.graphics.Canvas) {
            super.onDraw(canvas)
            val paint = android.graphics.Paint().apply {
                color = if (isDarkMode) Color.argb(38, 255, 255, 255) else Color.argb(26, 0, 0, 0)
                strokeWidth = 1f
                pathEffect = android.graphics.DashPathEffect(floatArrayOf(4f, 4f), 0f)
            }
            canvas.drawLine(0f, baselineY, width.toFloat(), baselineY, paint)
        }
    }

    init {
        setClipToPadding(false)
        setClipChildren(false)
        glView = ChartGLSurfaceView(context).apply {
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        }
        addView(glView)
    }
    
    private inner class ChartGLSurfaceView(context: Context) : GLSurfaceView(context) {
        private val renderer = ChartRenderer()
        private var lastData: DoubleArray? = null
        private var currentTrend: String = "flat"
        var isDark: Boolean = false
            private set

        init {
            setEGLContextClientVersion(3)
            setEGLConfigChooser(8, 8, 8, 8, 0, 0)
            setZOrderOnTop(false)
            holder.setFormat(android.graphics.PixelFormat.TRANSLUCENT)
            setRenderer(renderer)
        }
        
        fun setChartData(values: DoubleArray?) {
            lastData = values
            renderer.setData(values, currentTrend)
            requestRender()
            this@NativeLineChartView.currentData = values
        }

        fun setTheme(theme: String?) {
            isDark = theme == "dark"
            renderer.setDark(isDark)
            lastData?.let { renderer.setData(it, currentTrend) }
            requestRender()
            this@NativeLineChartView.isDark = isDark
        }

        fun setTrend(trend: String?) {
            currentTrend = trend ?: "flat"
            lastData?.let { renderer.setData(it, currentTrend) }
            requestRender()
        }
        

    fun setChartData(values: DoubleArray?) {
        currentData = values
        glView.setChartData(values)
    }

    fun setTheme(theme: String?) {
        isDark = theme == "dark"
        glView.setTheme(theme)
    }

    fun setTrend(trend: String?) {
        glView.setTrend(trend)
    }
    
    fun setTimestamps(timestamps: DoubleArray?) {
        currentTimestamps = timestamps
    }
    
    fun setBaselineValue(baselineValue: Double?) {
        currentBaselineValue = baselineValue
        updateBaseline()
    }
    
    private fun updateBaseline() {
        val baseline = currentBaselineValue ?: run {
            baselineView?.let { removeView(it) }
            baselineView = null
            return
        }
        
        val values = currentData
        if (values == null || values.isEmpty()) {
            baselineView?.let { removeView(it) }
            baselineView = null
            return
        }
        
        val minVal = values.minOrNull() ?: 0.0
        val maxVal = values.maxOrNull() ?: 1.0
        val range = (maxVal - minVal).coerceAtLeast(1e-9)
        
        val chartAreaHeight = ChartLayoutCalculator.calculateChartAreaHeight(height.toFloat())
        val normalizedY = (baseline - minVal) / range
        val yPosition = ChartLayoutCalculator.calculateYPosition(normalizedY.toFloat(), chartAreaHeight)
        
        if (baselineView == null) {
            val view = BaselineView(context)
            view.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null)
            addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
            baselineView = view
        }
        baselineView?.let { view ->
            view.baselineY = yPosition
            view.isDarkMode = isDark
        }
    }
    
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        if (changed) {
            updateBaseline()
        }
    }

        private inner class ChartRenderer : GLSurfaceView.Renderer {
        private val chartData = LineChartData()
        private var program = 0
        private var posLoc = 0
        private var colorLoc = 0
        private var minLineYLoc = 0
        private var gradientTopColorLoc = 0
        private var isDark = false
        private var currentTrend: String = "flat"
        private var gridBuffer: FloatBuffer? = null
        private var bottomSeparatorBuffer: FloatBuffer? = null
        private val horizontalDivisions = 4
        private val verticalDivisions = 6
        private var minLineY: Float = -1.0f
        private var gradientTopColor: FloatArray = floatArrayOf(0f, 0f, 0f, 0f)

        fun setDark(dark: Boolean) {
            this@ChartGLSurfaceView.isDark = dark
            val theme = LineChartThemes.theme(dark, currentTrend)
            val (grid, separator) = ChartGl.buildGridBuffer(theme.grid, theme.bottomSeparator)
            gridBuffer = grid
            bottomSeparatorBuffer = separator
        }

        fun setData(values: DoubleArray?, trend: String = "flat") {
            currentTrend = trend
            val t = LineChartThemes.theme(isDark, trend)
            chartData.setData(values, t.line, t.fillTop, t.fillBottom, this)
            gradientTopColor = t.fillTop
            val (grid, separator) = ChartGl.buildGridBuffer(t.grid, t.bottomSeparator)
            gridBuffer = grid
            bottomSeparatorBuffer = separator
        }
        
        fun setMinLineY(y: Float) {
            minLineY = y
        }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            if (gridBuffer == null) {
                val t = LineChartThemes.theme(this@ChartGLSurfaceView.isDark, currentTrend)
                val (grid, separator) = ChartGl.buildGridBuffer(t.grid, t.bottomSeparator)
                gridBuffer = grid
                bottomSeparatorBuffer = separator
            }
            program = ChartGl.loadProgram(ChartGl.VERTEX_SHADER, ChartGl.FRAGMENT_SHADER)
            posLoc = GLES30.glGetAttribLocation(program, "a_position")
            colorLoc = GLES30.glGetAttribLocation(program, "a_color")
            minLineYLoc = GLES30.glGetUniformLocation(program, "u_minLineY")
            gradientTopColorLoc = GLES30.glGetUniformLocation(program, "u_gradientTopColor")
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
            val t = LineChartThemes.theme(this@ChartGLSurfaceView.isDark, currentTrend)
            GLES30.glClearColor(0f, 0f, 0f, 0f)
        }

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES30.glEnable(GLES30.GL_BLEND)
            GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)
            GLES30.glViewport(0, 0, w.coerceAtLeast(1), h.coerceAtLeast(1))
        }

        override fun onDrawFrame(gl: GL10?) {
            val t = LineChartThemes.theme(this@ChartGLSurfaceView.isDark, currentTrend)
            GLES30.glClearColor(0f, 0f, 0f, 0f)
            GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT)
            GLES30.glUseProgram(program)
            val extensionLines = 6
            val horizontalGridLines = horizontalDivisions - 1
            val verticalGridLines = verticalDivisions - 1
            val totalGridLines = horizontalGridLines + verticalGridLines + extensionLines
            val gridLineCount = totalGridLines * 2
            gridBuffer?.let { ChartGl.drawLines(it, gridLineCount, 1f, posLoc, colorLoc) }
            bottomSeparatorBuffer?.let { ChartGl.drawLines(it, 6, 2f, posLoc, colorLoc) }
            chartData.fillBuffer?.let {
                GLES30.glUniform1f(minLineYLoc, minLineY)
                GLES30.glUniform4f(gradientTopColorLoc, gradientTopColor[0], gradientTopColor[1], gradientTopColor[2], gradientTopColor[3])
                ChartGl.bindBuffer(it, posLoc, colorLoc)
                GLES30.glDrawArrays(GLES30.GL_TRIANGLE_STRIP, 0, chartData.fillCount)
            }
            chartData.lineBuffer?.takeIf { chartData.lineCount >= 3 }?.let {
                ChartGl.bindBuffer(it, posLoc, colorLoc)
                GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, chartData.lineCount)
            }
        }
    }
}

private class LineChartData {
    var lineBuffer: FloatBuffer? = null
    var fillBuffer: FloatBuffer? = null
    var lineCount = 0
    var fillCount = 0

    fun setData(values: DoubleArray?, lineColor: FloatArray, fillTop: FloatArray, fillBottom: FloatArray, renderer: ChartRenderer) {
        if (values == null || values.size < 2) {
            lineCount = 0
            fillCount = 0
            return
        }
        val min = values.minOrNull() ?: 0.0
        val max = values.maxOrNull() ?: 1.0
        val range = (max - min).coerceAtLeast(1e-9)
        val n = values.size
        val xIn = FloatArray(n) { it.toFloat() / (n - 1).coerceAtLeast(1) }
        val yIn = FloatArray(n) { ((values[it] - min) / range).toFloat() }
        val (xOutTemp, yOutTemp) = ChartCurve.smoothPoints(xIn, yIn)
        val pts = xOutTemp.size
        val xOut = xOutTemp.copyOf()
        val yOut = yOutTemp.copyOf()
        if (pts > 0) {
            xOut[0] = 0f
            xOut[pts - 1] = 1f
        }
        val minY = yOut.minOrNull() ?: 0f
        renderer.setMinLineY((minY * 2.0f - 1.0f))
        
        val fillCoords = FloatArray(pts * 2 * ChartGl.FLOATS_PER_VERTEX)
        val fillColor = floatArrayOf(fillTop[0], fillTop[1], fillTop[2], 0f)
        for (i in 0 until pts) {
            val x = xOut[i]
            val y = yOut[i]
            ChartGl.putVertex(fillCoords, i * 12, x, y, fillColor)
            ChartGl.putVertex(fillCoords, i * 12 + 6, x, -1f, fillColor)
        }
        
        val lineWidth = 0.008f
        val lineCoordsList = mutableListOf<Float>()
        for (i in 0 until pts - 1) {
            val x1 = xOut[i]
            val y1 = yOut[i]
            val x2 = xOut[i + 1]
            val y2 = yOut[i + 1]
            val dx = x2 - x1
            val dy = y2 - y1
            val len = kotlin.math.sqrt(dx * dx + dy * dy)
            if (len > 0) {
                val nx = -dy / len * lineWidth
                val ny = dx / len * lineWidth
                val baseOffset = lineCoordsList.size
                val tempArr = FloatArray(ChartGl.FLOATS_PER_VERTEX * 6)
                ChartGl.putVertex(tempArr, 0, x1 + nx, y1 + ny, lineColor)
                ChartGl.putVertex(tempArr, ChartGl.FLOATS_PER_VERTEX, x1 - nx, y1 - ny, lineColor)
                ChartGl.putVertex(tempArr, ChartGl.FLOATS_PER_VERTEX * 2, x2 + nx, y2 + ny, lineColor)
                ChartGl.putVertex(tempArr, ChartGl.FLOATS_PER_VERTEX * 3, x2 + nx, y2 + ny, lineColor)
                ChartGl.putVertex(tempArr, ChartGl.FLOATS_PER_VERTEX * 4, x1 - nx, y1 - ny, lineColor)
                ChartGl.putVertex(tempArr, ChartGl.FLOATS_PER_VERTEX * 5, x2 - nx, y2 - ny, lineColor)
                lineCoordsList.addAll(tempArr.toList())
            }
        }
        val lineCoords = lineCoordsList.toFloatArray()
        lineCount = lineCoords.size / ChartGl.FLOATS_PER_VERTEX
        fillCount = pts * 2
        lineBuffer = ChartGl.toFloatBuffer(lineCoords)
        fillBuffer = ChartGl.toFloatBuffer(fillCoords)
    }
}
