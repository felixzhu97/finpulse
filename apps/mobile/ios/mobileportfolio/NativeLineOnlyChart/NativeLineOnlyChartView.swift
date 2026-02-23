import Metal
import MetalKit
import UIKit

private final class LineOnlyBuffers {
    var line: MTLBuffer?
    var lineCount = 0

    func update(values: [Double], device: MTLDevice, colors: LineOnlyChartTheme.Colors) {
        guard values.count >= 2 else {
            lineCount = 0
            return
        }
        let minVal = values.min() ?? 0
        let maxVal = values.max() ?? 1
        let scale = (maxVal - minVal) > 0 ? 1.0 / (maxVal - minVal) : 1.0
        let n = values.count
        var raw: [(Float, Float)] = []
        for (i, v) in values.enumerated() {
            let x = (Float(i) / Float(max(n - 1, 1))) * 2.0 - 1.0
            let y = Float((v - minVal) * scale) * 2.0 - 1.0
            raw.append((x, y))
        }
        let pts = ChartCurve.smoothPoints(raw)
        var lineVerts: [Float] = []
        for (x, y) in pts {
            lineVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: colors.line))
        }
        lineCount = pts.count
        line = device.makeBuffer(bytes: lineVerts, length: lineVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }
}

@objc(NativeLineOnlyChartView)
public class NativeLineOnlyChartView: BaseChartView {
    private let buffers = LineOnlyBuffers()

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    public override func createRenderer(device: MTLDevice, pixelFormat: MTLPixelFormat) -> BaseChartRenderer {
        return BaseChartRenderer(device: device, pixelFormat: pixelFormat)
    }

    public override func applyTheme() {
        metalView?.clearColor = LineOnlyChartTheme.theme(dark: isDarkTheme).clear
    }

    public override func buildGrid(device: MTLDevice) {
        guard let renderer = renderer else { return }
        let colors = LineOnlyChartTheme.theme(dark: isDarkTheme)
        renderer.updateGrid(gridColor: colors.grid, bottomSeparatorColor: colors.grid)
    }

    public override func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty, let device = device else {
            buffers.lineCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let t = LineOnlyChartTheme.theme(dark: isDarkTheme)
        buffers.update(values: arr.map { $0.doubleValue }, device: device, colors: t)
        metalView?.setNeedsDisplay()
    }

    public override func drawCustomContent(renderer: BaseChartRenderer, encoder: MTLRenderCommandEncoder) {
        if buffers.lineCount >= 2, let line = buffers.line {
            encoder.setVertexBuffer(line, offset: 0, index: 0)
            encoder.drawPrimitives(type: .lineStrip, vertexStart: 0, vertexCount: buffers.lineCount)
        }
    }
}
