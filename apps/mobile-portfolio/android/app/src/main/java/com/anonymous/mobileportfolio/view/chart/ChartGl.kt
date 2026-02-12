package com.anonymous.mobileportfolio.view.chart

import android.opengl.GLES30
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

object ChartGl {

    const val FLOATS_PER_VERTEX = 6
    const val STRIDE_BYTES = 24

    val VERTEX_SHADER = """
        #version 300 es
        in vec2 a_position;
        in vec4 a_color;
        out vec4 v_color;
        out float v_yCoord;
        void main() {
            vec2 clip = a_position * 2.0 - 1.0;
            clip.y = -clip.y;
            gl_Position = vec4(clip, 0.0, 1.0);
            v_color = a_color;
            v_yCoord = clip.y;
        }
    """.trimIndent()

    val FRAGMENT_SHADER = """
        #version 300 es
        precision mediump float;
        in vec4 v_color;
        in float v_yCoord;
        uniform float u_minLineY;
        uniform vec4 u_gradientTopColor;
        out vec4 fragColor;
        void main() {
            if (v_color.a > 0.5) {
                fragColor = v_color;
                return;
            }
            float y = v_yCoord;
            float minY = u_minLineY;
            float maxY = 1.0;
            float t = clamp((maxY - y) / (maxY - minY), 0.0, 1.0);
            float alpha = mix(u_gradientTopColor.a, 0.0, smoothstep(0.0, 1.0, t));
            fragColor = vec4(u_gradientTopColor.rgb, alpha);
        }
    """.trimIndent()

    fun putVertex(arr: FloatArray, offset: Int, x: Float, y: Float, color: FloatArray) {
        arr[offset] = x
        arr[offset + 1] = y
        System.arraycopy(color, 0, arr, offset + 2, 4)
    }

    fun toFloatBuffer(arr: FloatArray): FloatBuffer =
        ByteBuffer.allocateDirect(arr.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply { put(arr); position(0) }

    fun loadProgram(vertexSource: String, fragmentSource: String): Int {
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

    fun bindBuffer(buffer: FloatBuffer, posLoc: Int, colorLoc: Int) {
        GLES30.glEnableVertexAttribArray(posLoc)
        GLES30.glEnableVertexAttribArray(colorLoc)
        GLES30.glVertexAttribPointer(posLoc, 2, GLES30.GL_FLOAT, false, STRIDE_BYTES, buffer)
        GLES30.glVertexAttribPointer(colorLoc, 4, GLES30.GL_FLOAT, false, STRIDE_BYTES, buffer.duplicate().apply { position(2) })
    }

    fun drawLines(buffer: FloatBuffer, count: Int, lineWidth: Float, posLoc: Int, colorLoc: Int) {
        GLES30.glLineWidth(lineWidth)
        bindBuffer(buffer, posLoc, colorLoc)
        GLES30.glDrawArrays(GLES30.GL_LINES, 0, count)
    }

    fun buildGridBuffer(gridColor: FloatArray, bottomSeparatorColor: FloatArray): Pair<FloatBuffer, FloatBuffer> {
        val horizontalDivisions = 4
        val verticalDivisions = 6
        val horizontalLines = horizontalDivisions - 1
        val verticalLines = verticalDivisions - 1
        val verticalDivisionsForLabels = 6
        val extensionLines = verticalDivisionsForLabels
        val borderLines = 3
        val arr = FloatArray((horizontalLines + verticalLines + extensionLines + borderLines) * 2 * FLOATS_PER_VERTEX)
        var idx = 0
        
        val halfLineLength = 0.025f
        
        val topY = 1f
        val bottomY = -1f
        val leftX = 0f
        val rightX = 1f
        val borderOffset = 0.01f
        
        val topBorderY = topY - borderOffset
        val leftBorderX = leftX + borderOffset
        
        putVertex(arr, idx * 6, leftBorderX, topBorderY, gridColor)
        putVertex(arr, idx * 6 + 6, rightX, topBorderY, gridColor)
        idx += 2
        
        putVertex(arr, idx * 6, leftX, bottomY, gridColor)
        putVertex(arr, idx * 6 + 6, rightX, bottomY, gridColor)
        idx += 2
        
        putVertex(arr, idx * 6, leftBorderX, topBorderY, gridColor)
        putVertex(arr, idx * 6 + 6, leftBorderX, bottomY, gridColor)
        idx += 2
        
        for (i in 1 until horizontalDivisions) {
            val y = i / horizontalDivisions.toFloat() * 2f - 1f
            putVertex(arr, idx * 6, leftX - halfLineLength, y, gridColor)
            putVertex(arr, idx * 6 + 6, rightX + halfLineLength, y, gridColor)
            idx += 2
        }
        
        for (i in 1 until verticalDivisions) {
            val x = i / verticalDivisions.toFloat()
            putVertex(arr, idx * 6, x, bottomY, gridColor)
            putVertex(arr, idx * 6 + 6, x, topY, gridColor)
            idx += 2
        }
        
        val extensionLineLength = 0.04f
        val verticalDivisionsForLabels = 6
        for (i in 0 until verticalDivisionsForLabels) {
            val y = i / (verticalDivisionsForLabels - 1).toFloat() * 2f - 1f
            putVertex(arr, idx * 6, rightX, y, gridColor)
            putVertex(arr, idx * 6 + 6, rightX + extensionLineLength, y, gridColor)
            idx += 2
        }
        
        val separatorLineCount = 6
        val separatorArr = FloatArray(separatorLineCount * FLOATS_PER_VERTEX)
        var sepIdx = 0
        
        putVertex(separatorArr, sepIdx * 6, leftX - halfLineLength, bottomY, bottomSeparatorColor)
        putVertex(separatorArr, (sepIdx + 1) * 6, rightX + halfLineLength, bottomY, bottomSeparatorColor)
        sepIdx += 2
        
        putVertex(separatorArr, sepIdx * 6, leftX - halfLineLength, topY, bottomSeparatorColor)
        putVertex(separatorArr, (sepIdx + 1) * 6, rightX + halfLineLength, topY, bottomSeparatorColor)
        sepIdx += 2
        
        putVertex(separatorArr, sepIdx * 6, leftX, bottomY, bottomSeparatorColor)
        putVertex(separatorArr, (sepIdx + 1) * 6, leftX, topY, bottomSeparatorColor)
        sepIdx += 2
        
        putVertex(separatorArr, sepIdx * 6, rightX, bottomY, bottomSeparatorColor)
        putVertex(separatorArr, (sepIdx + 1) * 6, rightX, topY, bottomSeparatorColor)
        
        return Pair(toFloatBuffer(arr), toFloatBuffer(separatorArr))
    }
}
