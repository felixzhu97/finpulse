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
            let x0 = (Float(i) / Float(n)) * 2.0 - 1.0
            let x1 = x0 + barW
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
public class NativeHistogramChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private let buffers = HistogramBuffers()

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    @objc public var theme: NSString? {
        didSet {
            applyTheme()
            if let d = device { buildGrid(device: d); updateBuffers() }
        }
    }

    public override init(frame: CGRect) {
        super.init(frame: frame)
        setupMetal()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupMetal()
    }

    private func setupMetal() {
        guard let device = MTLCreateSystemDefaultDevice() else { return }
        self.device = device
        commandQueue = device.makeCommandQueue()
        let view = MTKView(frame: bounds, device: device)
        view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.delegate = self
        view.clearColor = HistogramChartTheme.theme(dark: (theme as String?) == "dark").clear
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = ChartPipeline.make(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = HistogramChartTheme.theme(dark: (theme as String?) == "dark").clear
    }

    private func buildGrid(device: MTLDevice) {
        let grid = HistogramChartTheme.theme(dark: (theme as String?) == "dark").grid
        let result = ChartGrid.build(device: device, gridColor: grid)
        gridBuffer = result.buffer
        gridCount = result.count
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty, let device = device else {
            buffers.barsCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let t = HistogramChartTheme.theme(dark: (theme as String?) == "dark")
        buffers.update(values: arr.map { $0.doubleValue }, device: device, colors: t)
        metalView?.setNeedsDisplay()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.setNeedsDisplay()
    }
}

extension NativeHistogramChartView: MTKViewDelegate {
    public func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    public func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable,
              let pass = view.currentRenderPassDescriptor,
              let pipeline = pipeline,
              let commandBuffer = commandQueue?.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { return }
        encoder.setRenderPipelineState(pipeline)
        if let grid = gridBuffer, gridCount > 0 {
            encoder.setVertexBuffer(grid, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: gridCount)
        }
        if let bars = buffers.bars, buffers.barsCount >= 3 {
            encoder.setVertexBuffer(bars, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: buffers.barsCount)
        }
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
