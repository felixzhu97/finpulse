import Metal
import MetalKit
import UIKit

private func baselineTheme(_ dark: Bool) -> (clear: MTLClearColor, line: (Float, Float, Float, Float), grid: (Float, Float, Float, Float), fillAbove: (Float, Float, Float, Float), fillBelow: (Float, Float, Float, Float)) {
    if dark {
        return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (0.9, 0.9, 0.92, 1), (0.22, 0.22, 0.26, 1), (0.2, 0.72, 0.45, 0.5), (1, 0.3, 0.25, 0.5))
    }
    return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.2, 0.2, 0.2, 1), (0.85, 0.85, 0.88, 1), (0.2, 0.7, 0.4, 0.4), (1, 0.2, 0.2, 0.4))
}

private let strideFloats = 8
private let smoothSteps = 12

private func vert(_ x: Float, _ y: Float, _ c: (Float, Float, Float, Float)) -> [Float] {
    [x, y, 0, 0, c.0, c.1, c.2, c.3]
}

private func catmullRom(_ p0: Float, _ p1: Float, _ p2: Float, _ p3: Float, t: Float) -> Float {
    let t2 = t * t
    let t3 = t2 * t
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
}

private func smoothPoints(_ pts: [(Float, Float)]) -> [(Float, Float)] {
    guard pts.count >= 2 else { return pts }
    var out: [(Float, Float)] = []
    let n = pts.count
    for i in 0..<(n - 1) {
        let p0 = i > 0 ? pts[i - 1] : pts[i]
        let p1 = pts[i]
        let p2 = pts[i + 1]
        let p3 = i + 2 < n ? pts[i + 2] : pts[i + 1]
        for s in 0..<smoothSteps {
            let t = Float(s) / Float(smoothSteps)
            out.append((catmullRom(p0.0, p1.0, p2.0, p3.0, t: t), catmullRom(p0.1, p1.1, p2.1, p3.1, t: t)))
        }
    }
    out.append(pts.last!)
    return out
}

private final class BaselineBuffers {
    var line: MTLBuffer?
    var fill: MTLBuffer?
    var lineCount = 0
    var fillCount = 0

    func update(values: [Double], baseline: Double, device: MTLDevice, lineColor: (Float, Float, Float, Float), fillAbove: (Float, Float, Float, Float), fillBelow: (Float, Float, Float, Float)) {
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
        let pts = smoothPoints(raw)
        var lineVerts: [Float] = []
        var fillVerts: [Float] = []
        for (x, y) in pts {
            lineVerts.append(contentsOf: vert(x, y, lineColor))
            if y >= baseNorm {
                fillVerts.append(contentsOf: vert(x, y, fillAbove))
                fillVerts.append(contentsOf: vert(x, baseNorm, fillAbove))
            } else {
                fillVerts.append(contentsOf: vert(x, y, fillBelow))
                fillVerts.append(contentsOf: vert(x, baseNorm, fillBelow))
            }
        }
        lineCount = pts.count
        fillCount = fillVerts.count / strideFloats
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
        view.clearColor = baselineTheme((theme as String?) == "dark").clear
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = makePipeline(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
    }

    private func applyTheme() {
        metalView?.clearColor = baselineTheme((theme as String?) == "dark").clear
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
        let grid = baselineTheme((theme as String?) == "dark").grid
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
            buffers.lineCount = 0
            buffers.fillCount = 0
            metalView?.setNeedsDisplay()
            return
        }
        let base = baselineValue?.doubleValue ?? (arr.map { $0.doubleValue }.reduce(0, +) / Double(arr.count))
        let t = baselineTheme((theme as String?) == "dark")
        buffers.update(values: arr.map { $0.doubleValue }, baseline: base, device: device, lineColor: t.line, fillAbove: t.fillAbove, fillBelow: t.fillBelow)
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
