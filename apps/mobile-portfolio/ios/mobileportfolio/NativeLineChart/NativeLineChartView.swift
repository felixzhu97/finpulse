import Metal
import MetalKit
import UIKit

private final class ChartBuffers {
    var line: MTLBuffer?
    var fill: MTLBuffer?
    var lineCount = 0
    var fillCount = 0

    func update(values: [Double], device: MTLDevice, colors: LineChartTheme.Colors) {
        guard values.count >= 2 else {
            lineCount = 0
            fillCount = 0
            return
        }
        let minVal = values.min() ?? 0, maxVal = values.max() ?? 1
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
        var fillVerts: [Float] = []
        for (x, y) in pts {
            lineVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: colors.line))
            fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: colors.fillTop))
            fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: -1.0, color: colors.fillBottom))
        }
        lineCount = pts.count
        fillCount = fillVerts.count / ChartCurve.strideFloats
        line = device.makeBuffer(bytes: lineVerts, length: lineVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        fill = device.makeBuffer(bytes: fillVerts, length: fillVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }
}

@objc(NativeLineChartView)
public class NativeLineChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private let buffers = ChartBuffers()

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    @objc public var theme: NSString? {
        didSet {
            applyTheme()
            if let d = device {
                buildGrid(device: d)
                updateBuffers()
            }
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
        applyTheme()
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = ChartPipeline.make(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        let colors = LineChartTheme.theme(dark: (theme as String?) == "dark")
        metalView?.clearColor = colors.clear
    }

    private func buildGrid(device: MTLDevice) {
        let grid = LineChartTheme.theme(dark: (theme as String?) == "dark").grid
        let result = ChartGrid.build(device: device, gridColor: grid)
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
        let colors = LineChartTheme.theme(dark: (theme as String?) == "dark")
        buffers.update(values: arr.map { $0.doubleValue }, device: device, colors: colors)
        metalView?.setNeedsDisplay()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.setNeedsDisplay()
    }
}

extension NativeLineChartView: MTKViewDelegate {
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
