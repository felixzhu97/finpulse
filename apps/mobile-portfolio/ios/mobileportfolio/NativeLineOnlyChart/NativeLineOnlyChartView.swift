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
public class NativeLineOnlyChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private let buffers = LineOnlyBuffers()

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
        view.clearColor = LineOnlyChartTheme.theme(dark: (theme as String?) == "dark").clear
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = ChartPipeline.make(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = LineOnlyChartTheme.theme(dark: (theme as String?) == "dark").clear
    }

    private func buildGrid(device: MTLDevice) {
        let grid = LineOnlyChartTheme.theme(dark: (theme as String?) == "dark").grid
        let result = ChartGrid.build(device: device, gridColor: grid)
        gridBuffer = result.buffer
        gridCount = result.count
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty, let device = device else {
            buffers.lineCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let t = LineOnlyChartTheme.theme(dark: (theme as String?) == "dark")
        buffers.update(values: arr.map { $0.doubleValue }, device: device, colors: t)
        metalView?.setNeedsDisplay()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.setNeedsDisplay()
    }
}

extension NativeLineOnlyChartView: MTKViewDelegate {
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
        if buffers.lineCount >= 2, let line = buffers.line {
            encoder.setVertexBuffer(line, offset: 0, index: 0)
            encoder.drawPrimitives(type: .lineStrip, vertexStart: 0, vertexCount: buffers.lineCount)
        }
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
