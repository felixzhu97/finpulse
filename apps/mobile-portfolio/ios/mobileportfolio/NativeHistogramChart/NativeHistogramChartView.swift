import Metal
import MetalKit
import UIKit

private func histogramTheme(_ dark: Bool) -> (clear: MTLClearColor, grid: (Float, Float, Float, Float), bar: (Float, Float, Float, Float)) {
    if dark {
        return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (0.22, 0.22, 0.26, 1), (0.25, 0.41, 0.88, 0.9))
    }
    return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.85, 0.85, 0.88, 1), (0.2, 0.4, 0.85, 0.9))
}

private let strideFloats = 8

private func vert(_ x: Float, _ y: Float, _ c: (Float, Float, Float, Float)) -> [Float] {
    [x, y, 0, 0, c.0, c.1, c.2, c.3]
}

private final class HistogramBuffers {
    var bars: MTLBuffer?
    var barsCount = 0

    func update(values: [Double], device: MTLDevice, barColor: (Float, Float, Float, Float)) {
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
            barVerts.append(contentsOf: vert(x0, -1.0, barColor))
            barVerts.append(contentsOf: vert(x1, -1.0, barColor))
            barVerts.append(contentsOf: vert(x0, y, barColor))
            barVerts.append(contentsOf: vert(x0, y, barColor))
            barVerts.append(contentsOf: vert(x1, -1.0, barColor))
            barVerts.append(contentsOf: vert(x1, y, barColor))
        }
        barsCount = barVerts.count / strideFloats
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
        view.clearColor = histogramTheme((theme as String?) == "dark").clear
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = makePipeline(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = histogramTheme((theme as String?) == "dark").clear
    }

    private func makePipeline(device: MTLDevice, pixelFormat: MTLPixelFormat) -> MTLRenderPipelineState? {
        let lib = device.makeDefaultLibrary()
        let desc = MTLRenderPipelineDescriptor()
        desc.vertexFunction = lib?.makeFunction(name: "chart_vertex")
        desc.fragmentFunction = lib?.makeFunction(name: "chart_fragment")
        desc.colorAttachments[0].pixelFormat = pixelFormat
        desc.colorAttachments[0].isBlendingEnabled = true
        desc.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        desc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        desc.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        desc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha
        return try? device.makeRenderPipelineState(descriptor: desc)
    }

    private func buildGrid(device: MTLDevice) {
        let grid = histogramTheme((theme as String?) == "dark").grid
        var verts: [Float] = []
        for i in 1..<5 {
            let y = Float(i) / 5.0 * 2.0 - 1.0
            verts.append(contentsOf: vert(-1.0, y, grid))
            verts.append(contentsOf: vert(1.0, y, grid))
        }
        gridCount = verts.count / strideFloats
        gridBuffer = device.makeBuffer(bytes: verts, length: verts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty, let device = device else {
            buffers.barsCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let t = histogramTheme((theme as String?) == "dark")
        buffers.update(values: arr.map { $0.doubleValue }, device: device, barColor: t.bar)
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
