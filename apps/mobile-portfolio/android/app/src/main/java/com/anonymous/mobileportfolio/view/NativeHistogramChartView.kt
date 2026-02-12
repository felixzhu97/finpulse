package com.anonymous.mobileportfolio.view

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet
import com.anonymous.mobileportfolio.view.chart.ChartGl
import com.anonymous.mobileportfolio.view.chart.HistogramChartThemes
import com.anonymous.mobileportfolio.view.chart.HistogramRenderer
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
        setEGLConfigChooser(8, 8, 8, 8, 0, 0)
        setZOrderOnTop(false)
        holder.setFormat(android.graphics.PixelFormat.TRANSLUCENT)
        setRenderer(object : GLSurfaceView.Renderer {
            override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
                renderer.onSurfaceCreated(gl, config)
            }

            override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
                renderer.onSurfaceChanged(gl, w, h)
            }

            override fun onDrawFrame(gl: GL10?) {
                renderer.onDrawFrame(gl)
            }
        })
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
}
