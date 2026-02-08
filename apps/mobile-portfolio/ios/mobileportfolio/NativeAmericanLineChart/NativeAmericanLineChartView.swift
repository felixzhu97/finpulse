import Metal
import MetalKit
import UIKit

private func americanTheme(_ dark: Bool) -> (clear: MTLClearColor, grid: (Float, Float, Float, Float), up: (Float, Float, Float, Float), down: (Float, Float, Float, Float)) {
    if dark {
        return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (0.22, 0.22, 0.26, 1), (0.2, 0.75, 0.85, 1), (1, 0.3, 0.25, 1))
    }
    return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.85, 0.85, 0.88, 1), (0.2, 0.7, 0.6, 1), (1, 0.2, 0.2, 1))
}

private let strideFloats = 8

private func vert(_ x: Float, _ y: Float, _ c: (Float, Float, Float, Float)) -> [Float] {
    [x, y, 0, 0, c.0, c.1, c.2, c.3]
}

private final class AmericanLineBuffers {
    var bodySegments: MTLBuffer?
    var bodyCount = 0
    var wicks: MTLBuffer?
    var wicksCount = 0

    func update(flatOHLC: [Double], device: MTLDevice, upColor: (Float, Float, Float, Float), downColor: (Float, Float, Float, Float)) {
        let n = flatOHLC.count / 4
        guard n >= 1 else {
            bodyCount = 0
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
        let tickW: Float = 0.02
        var segVerts: [Float] = []
        var wickVerts: [Float] = []
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
            let color: (Float, Float, Float, Float) = c >= o ? upColor : downColor
            segVerts.append(contentsOf: vert(x - tickW, yO, color))
            segVerts.append(contentsOf: vert(x + tickW, yC, color))
            wickVerts.append(contentsOf: vert(x, yL, color))
            wickVerts.append(contentsOf: vert(x, yH, color))
        }
        bodyCount = segVerts.count / strideFloats
        wicksCount = wickVerts.count / strideFloats
        bodySegments = device.makeBuffer(bytes: segVerts, length: segVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        wicks = device.makeBuffer(bytes: wickVerts, length: wickVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
    }
}

@objc(NativeAmericanLineChartView)
public class NativeAmericanLineChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private let buffers = AmericanLineBuffers()

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
        applyTheme()
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = makePipeline(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = americanTheme((theme as String?) == "dark").clear
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
        let grid = americanTheme((theme as String?) == "dark").grid
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
        guard let arr = data as? [NSNumber], arr.count >= 4, let device = device else {
            buffers.bodyCount = 0
            buffers.wicksCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let t = americanTheme((theme as String?) == "dark")
        buffers.update(flatOHLC: arr.map { $0.doubleValue }, device: device, upColor: t.up, downColor: t.down)
        metalView?.setNeedsDisplay()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.setNeedsDisplay()
    }
}

extension NativeAmericanLineChartView: MTKViewDelegate {
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
        if let bodies = buffers.bodySegments, buffers.bodyCount >= 2 {
            encoder.setVertexBuffer(bodies, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: buffers.bodyCount)
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
