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

private final class HistogramRenderer {
    private let device: MTLDevice
    private let commandQueue: MTLCommandQueue
    private let pipeline: MTLRenderPipelineState?
    private let buffers = HistogramBuffers()
    
    init(device: MTLDevice, pixelFormat: MTLPixelFormat) {
        self.device = device
        self.commandQueue = device.makeCommandQueue()!
        self.pipeline = ChartPipeline.make(device: device, pixelFormat: pixelFormat)
    }
    
    func updateBuffers(values: [Double], colors: HistogramChartTheme.Colors) {
        buffers.update(values: values, device: device, colors: colors)
    }
    
    func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable,
              let pass = view.currentRenderPassDescriptor,
              let pipeline = pipeline,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { return }
        encoder.setRenderPipelineState(pipeline)
        
        if let bars = buffers.bars, buffers.barsCount >= 3 {
            encoder.setVertexBuffer(bars, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: buffers.barsCount)
        }
        
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
    
    var needsDisplay: Bool {
        return buffers.barsCount > 0
    }
}

@objc(NativeHistogramChartView)
public class NativeHistogramChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var renderer: HistogramRenderer?

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    @objc public var theme: NSString? {
        didSet {
            applyTheme()
            if device != nil { updateBuffers() }
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
        
        let view = MTKView(frame: bounds, device: device)
        view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.delegate = self
        view.isOpaque = false
        view.backgroundColor = .clear
        view.colorPixelFormat = .bgra8Unorm
        view.clearColor = HistogramChartTheme.theme(dark: (theme as String?) == "dark").clear
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        
        renderer = HistogramRenderer(device: device, pixelFormat: view.colorPixelFormat)
    }

    private func applyTheme() {
        metalView?.clearColor = HistogramChartTheme.theme(dark: (theme as String?) == "dark").clear
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty,
              let renderer = renderer else {
            metalView?.setNeedsDisplay()
            return
        }
        let t = HistogramChartTheme.theme(dark: (theme as String?) == "dark")
        renderer.updateBuffers(values: arr.map { $0.doubleValue }, colors: t)
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
        renderer?.draw(in: view)
    }
}
