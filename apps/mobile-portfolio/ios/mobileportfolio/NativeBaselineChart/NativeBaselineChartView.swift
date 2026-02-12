import Metal
import MetalKit
import UIKit

private final class BaselineBuffers {
    var line: MTLBuffer?
    var fill: MTLBuffer?
    var lineCount = 0
    var fillCount = 0

    func update(values: [Double], baseline: Double, device: MTLDevice, colors: BaselineChartTheme.Colors) {
        guard values.count >= 2 else {
            lineCount = 0
            fillCount = 0
            return
        }
        let minVal = values.min() ?? 0
        let maxVal = values.max() ?? 1
        let range = (maxVal - minVal) > 0 ? (maxVal - minVal) : 1.0
        let scale = 1.0 / range
        let baseNorm = Float((baseline - minVal) * scale) * 2.0 - 1.0
        let n = values.count
        var raw: [(Float, Float)] = []
        for (i, v) in values.enumerated() {
            let x = (Float(i) / Float(max(n - 1, 1))) * 2.0 - 1.0
            let y = Float((v - minVal) * scale) * 2.0 - 1.0
            raw.append((x, y))
        }
        let pts = ChartCurve.smoothPoints(raw)
        var lineVerts: [Float] = []
        var fillVerts: [Float] = []
        for (x, y) in pts {
            lineVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: colors.line))
            if y >= baseNorm {
                fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: colors.fillAbove))
                fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: baseNorm, color: colors.fillAbove))
            } else {
                fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: colors.fillBelow))
                fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: baseNorm, color: colors.fillBelow))
            }
        }
        lineCount = pts.count
        fillCount = fillVerts.count / ChartCurve.strideFloats
        line = device.makeBuffer(bytes: lineVerts, length: lineVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        fill = device.makeBuffer(bytes: fillVerts, length: fillVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }
}

@objc(NativeBaselineChartView)
public class NativeBaselineChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private let buffers = BaselineBuffers()

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    @objc public var baselineValue: NSNumber? {
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
        backgroundColor = .clear
        isOpaque = false
        setupMetal()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .clear
        isOpaque = false
        setupMetal()
    }

    private func setupMetal() {
        guard let device = MTLCreateSystemDefaultDevice() else { return }
        self.device = device
        commandQueue = device.makeCommandQueue()
        let view = MTKView(frame: bounds, device: device)
        view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.delegate = self
        view.isOpaque = false
        view.backgroundColor = .clear
        view.colorPixelFormat = .bgra8Unorm
        view.clearColor = BaselineChartTheme.theme(dark: (theme as String?) == "dark").clear
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = ChartPipeline.make(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = BaselineChartTheme.theme(dark: (theme as String?) == "dark").clear
    }

    private func buildGrid(device: MTLDevice) {
        let colors = BaselineChartTheme.theme(dark: (theme as String?) == "dark")
        let bottomSeparatorColor: (Float, Float, Float, Float) = colors.grid
        let result = ChartGrid.build(device: device, gridColor: colors.grid, bottomSeparatorColor: bottomSeparatorColor)
        gridBuffer = result.buffer
        gridCount = result.count
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty, let device = device else {
            buffers.lineCount = 0
            buffers.fillCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let values = arr.map { $0.doubleValue }
        let base: Double
        if let providedBaseline = baselineValue?.doubleValue {
            base = providedBaseline
        } else {
            let sorted = values.sorted()
            let mid = sorted.count / 2
            base = sorted.count % 2 == 0
                ? (sorted[mid - 1] + sorted[mid]) / 2.0
                : sorted[mid]
        }
        let t = BaselineChartTheme.theme(dark: (theme as String?) == "dark")
        buffers.update(values: values, baseline: base, device: device, colors: t)
        metalView?.setNeedsDisplay()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.setNeedsDisplay()
    }
}

extension NativeBaselineChartView: MTKViewDelegate {
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
        if let fill = buffers.fill, buffers.fillCount >= 2 {
            encoder.setVertexBuffer(fill, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: buffers.fillCount)
        }
        if buffers.lineCount >= 2, let line = buffers.line {
            encoder.setVertexBuffer(line, offset: 0, index: 0)
            encoder.drawPrimitives(type: .lineStrip, vertexStart: 0, vertexCount: buffers.lineCount)
        }
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
