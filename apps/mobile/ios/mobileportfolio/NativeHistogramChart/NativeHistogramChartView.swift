import Metal
import MetalKit
import UIKit

private final class HistogramBuffers {
    var bars: MTLBuffer?
    var barsCount = 0

    func update(values: [Double], device: MTLDevice, colors: HistogramChartTheme.Colors) {
        guard !values.isEmpty else {
            barsCount = 0
            return
        }
        let minVal = values.min() ?? 0
        let maxVal = values.max() ?? 1
        let range = (maxVal - minVal) > 0 ? (maxVal - minVal) : 1.0
        let scale = 1.0 / range
        let n = values.count
        let barW = (2.0 / Float(max(n, 1))) * 0.7
        var barVerts: [Float] = []
        for (i, v) in values.enumerated() {
            let x1 = (Float(i + 1) / Float(n)) * 2.0 - 1.0
            let x0 = x1 - barW
            let y = Float((v - minVal) * scale) * 2.0 - 1.0
            barVerts.append(contentsOf: ChartVertex.vertex(x: x0, y: -1.0, color: colors.bar))
            barVerts.append(contentsOf: ChartVertex.vertex(x: x1, y: -1.0, color: colors.bar))
            barVerts.append(contentsOf: ChartVertex.vertex(x: x0, y: y, color: colors.bar))
            barVerts.append(contentsOf: ChartVertex.vertex(x: x0, y: y, color: colors.bar))
            barVerts.append(contentsOf: ChartVertex.vertex(x: x1, y: -1.0, color: colors.bar))
            barVerts.append(contentsOf: ChartVertex.vertex(x: x1, y: y, color: colors.bar))
        }
        barsCount = barVerts.count / ChartCurve.strideFloats
        bars = device.makeBuffer(bytes: barVerts, length: barVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }
}

@objc(NativeHistogramChartView)
public class NativeHistogramChartView: BaseChartView {
    private let buffers = HistogramBuffers()

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    public override func createRenderer(device: MTLDevice, pixelFormat: MTLPixelFormat) -> BaseChartRenderer {
        return BaseChartRenderer(device: device, pixelFormat: pixelFormat)
    }

    public override func applyTheme() {
        metalView?.clearColor = HistogramChartTheme.theme(dark: isDarkTheme).clear
    }

    public override func buildGrid(device: MTLDevice) {
    }

    public override func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty,
              let _ = renderer else {
            metalView?.setNeedsDisplay()
            return
        }
        let t = HistogramChartTheme.theme(dark: isDarkTheme)
        buffers.update(values: arr.map { $0.doubleValue }, device: device!, colors: t)
        metalView?.setNeedsDisplay()
    }

    public override func drawCustomContent(renderer: BaseChartRenderer, encoder: MTLRenderCommandEncoder) {
        if let bars = buffers.bars, buffers.barsCount >= 3 {
            encoder.setVertexBuffer(bars, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: buffers.barsCount)
        }
    }
}
