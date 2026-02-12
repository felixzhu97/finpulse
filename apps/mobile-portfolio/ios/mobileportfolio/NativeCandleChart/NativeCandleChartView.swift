import Metal
import MetalKit
import UIKit

private final class CandleBuffers {
    var bodies: MTLBuffer?
    var wicks: MTLBuffer?
    var bodiesCount = 0
    var wicksCount = 0

    func update(flatOHLC: [Double], device: MTLDevice, colors: CandleChartTheme.Colors) {
        let n = flatOHLC.count / 4
        guard n >= 1 else {
            bodiesCount = 0
            wicksCount = 0
            return
        }
        var minH = flatOHLC[1]
        var maxH = flatOHLC[1]
        for i in 0..<n {
            minH = min(minH, flatOHLC[i * 4 + 2])
            maxH = max(maxH, flatOHLC[i * 4 + 1])
        }
        let range = (maxH - minH) > 0 ? (maxH - minH) : 1.0
        let scale = 1.0 / range
        var bodyVerts: [Float] = []
        var wickVerts: [Float] = []
        let barW = (2.0 / Float(max(n, 1))) * 0.6
        for i in 0..<n {
            let o = flatOHLC[i * 4]
            let h = flatOHLC[i * 4 + 1]
            let l = flatOHLC[i * 4 + 2]
            let c = flatOHLC[i * 4 + 3]
            let x = (Float(i) / Float(max(n - 1, 1))) * 2.0 - 1.0
            let yO = Float((o - minH) * scale) * 2.0 - 1.0
            let yC = Float((c - minH) * scale) * 2.0 - 1.0
            let yH = Float((h - minH) * scale) * 2.0 - 1.0
            let yL = Float((l - minH) * scale) * 2.0 - 1.0
            let (yLo, yHi) = c >= o ? (yO, yC) : (yC, yO)
            let color: (Float, Float, Float, Float) = c >= o ? colors.up : colors.down
            bodyVerts.append(contentsOf: ChartVertex.vertex(x: x - barW/2, y: yLo, color: color))
            bodyVerts.append(contentsOf: ChartVertex.vertex(x: x + barW/2, y: yLo, color: color))
            bodyVerts.append(contentsOf: ChartVertex.vertex(x: x - barW/2, y: yHi, color: color))
            bodyVerts.append(contentsOf: ChartVertex.vertex(x: x - barW/2, y: yHi, color: color))
            bodyVerts.append(contentsOf: ChartVertex.vertex(x: x + barW/2, y: yLo, color: color))
            bodyVerts.append(contentsOf: ChartVertex.vertex(x: x + barW/2, y: yHi, color: color))
            wickVerts.append(contentsOf: ChartVertex.vertex(x: x, y: yL, color: color))
            wickVerts.append(contentsOf: ChartVertex.vertex(x: x, y: yH, color: color))
        }
        bodiesCount = bodyVerts.count / ChartCurve.strideFloats
        wicksCount = wickVerts.count / ChartCurve.strideFloats
        bodies = device.makeBuffer(bytes: bodyVerts, length: bodyVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        wicks = device.makeBuffer(bytes: wickVerts, length: wickVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }
}

@objc(NativeCandleChartView)
public class NativeCandleChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private let buffers = CandleBuffers()

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
        applyTheme()
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = ChartPipeline.make(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = CandleChartTheme.theme(dark: (theme as String?) == "dark").clear
    }

    private func buildGrid(device: MTLDevice) {
        let colors = CandleChartTheme.theme(dark: (theme as String?) == "dark")
        let bottomSeparatorColor: (Float, Float, Float, Float) = colors.grid
        let result = ChartGrid.build(device: device, gridColor: colors.grid, bottomSeparatorColor: bottomSeparatorColor)
        gridBuffer = result.buffer
        gridCount = result.count
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], arr.count >= 4, let device = device else {
            buffers.bodiesCount = 0
            buffers.wicksCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let t = CandleChartTheme.theme(dark: (theme as String?) == "dark")
        buffers.update(flatOHLC: arr.map { $0.doubleValue }, device: device, colors: t)
        metalView?.setNeedsDisplay()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.setNeedsDisplay()
    }
}

extension NativeCandleChartView: MTKViewDelegate {
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
        if let bodies = buffers.bodies, buffers.bodiesCount >= 3 {
            encoder.setVertexBuffer(bodies, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: buffers.bodiesCount)
        }
        if let wicks = buffers.wicks, buffers.wicksCount >= 2 {
            encoder.setVertexBuffer(wicks, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: buffers.wicksCount)
        }
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
