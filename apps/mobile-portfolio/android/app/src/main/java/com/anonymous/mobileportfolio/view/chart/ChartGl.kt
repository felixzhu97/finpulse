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
        void main() {
            vec2 clip = a_position * 2.0 - 1.0;
            clip.y = -clip.y;
            gl_Position = vec4(clip, 0.0, 1.0);
            v_color = a_color;
        }
    """.trimIndent()

    val FRAGMENT_SHADER = """
        #version 300 es
        precision mediump float;
        in vec4 v_color;
        out vec4 fragColor;
        void main() { fragColor = v_color; }
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

    fun buildGridBuffer(gridColor: FloatArray): FloatBuffer {
        val arr = FloatArray(8 * FLOATS_PER_VERTEX)
        for (i in 1..4) {
            val y = -i / 5f * 2f + 1f
            putVertex(arr, (i - 1) * 12, -1f, y, gridColor)
            putVertex(arr, (i - 1) * 12 + 6, 1f, y, gridColor)
        }
        return toFloatBuffer(arr)
    }
}
