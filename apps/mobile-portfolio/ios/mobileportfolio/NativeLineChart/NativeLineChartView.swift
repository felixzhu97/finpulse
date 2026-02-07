import Metal
import MetalKit
import UIKit

private struct ChartTheme {
    static let clearColor = MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1)
    static let lineColor: (Float, Float, Float, Float) = (1, 0.2, 0.2, 1)
    static let fillTop: (Float, Float, Float, Float) = (1, 0.2, 0.2, 0.35)
    static let fillBottom: (Float, Float, Float, Float) = (1, 0.2, 0.2, 0)
    static let gridColor: (Float, Float, Float, Float) = (0.85, 0.85, 0.88, 1)
}

private let strideFloats = 8

private final class ChartBuffers {
    var line: MTLBuffer?
    var fill: MTLBuffer?
    var lineCount = 0
    var fillCount = 0

    func update(values: [Double], device: MTLDevice) {
        guard values.count >= 2 else {
            lineCount = 0
            fillCount = 0
            return
        }
        let minVal = values.min() ?? 0, maxVal = values.max() ?? 1
        let scale = (maxVal - minVal) > 0 ? 1.0 / (maxVal - minVal) : 1.0
        let n = values.count
        var lineVerts: [Float] = []
        var fillVerts: [Float] = []
        for (i, v) in values.enumerated() {
            let x = (Float(i) / Float(max(n - 1, 1))) * 2.0 - 1.0
            let y = Float((v - minVal) * scale) * 2.0 - 1.0
            lineVerts.append(contentsOf: [x, y, 0, 0, ChartTheme.lineColor.0, ChartTheme.lineColor.1, ChartTheme.lineColor.2, ChartTheme.lineColor.3])
            fillVerts.append(contentsOf: [x, y, 0, 0, ChartTheme.fillTop.0, ChartTheme.fillTop.1, ChartTheme.fillTop.2, ChartTheme.fillTop.3])
            fillVerts.append(contentsOf: [x, -1.0, 0, 0, ChartTheme.fillBottom.0, ChartTheme.fillBottom.1, ChartTheme.fillBottom.2, ChartTheme.fillBottom.3])
        }
        lineCount = n
        fillCount = fillVerts.count / strideFloats
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
        view.clearColor = ChartTheme.clearColor
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        pipeline = makePipeline(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
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
        var verts: [Float] = []
        for i in 1..<5 {
            let y = Float(i) / 5.0 * 2.0 - 1.0
            verts.append(contentsOf: [-1.0, y, 0, 0, ChartTheme.gridColor.0, ChartTheme.gridColor.1, ChartTheme.gridColor.2, ChartTheme.gridColor.3])
            verts.append(contentsOf: [1.0, y, 0, 0, ChartTheme.gridColor.0, ChartTheme.gridColor.1, ChartTheme.gridColor.2, ChartTheme.gridColor.3])
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
        buffers.update(values: arr.map { $0.doubleValue }, device: device)
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
