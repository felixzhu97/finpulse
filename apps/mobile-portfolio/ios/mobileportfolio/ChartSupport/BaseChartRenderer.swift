import Metal
import MetalKit

public class BaseChartRenderer {
    let device: MTLDevice
    let commandQueue: MTLCommandQueue
    let pipeline: MTLRenderPipelineState?
    var gridBuffer: MTLBuffer?
    var gridCount = 0
    var bottomSeparatorBuffer: MTLBuffer?
    var bottomSeparatorCount = 0
    
    public init(device: MTLDevice, pixelFormat: MTLPixelFormat) {
        self.device = device
        self.commandQueue = device.makeCommandQueue()!
        self.pipeline = ChartPipeline.make(device: device, pixelFormat: pixelFormat)
    }
    
    public func updateGrid(gridColor: (Float, Float, Float, Float), bottomSeparatorColor: (Float, Float, Float, Float)) {
        let result = ChartGrid.build(device: device, gridColor: gridColor, bottomSeparatorColor: bottomSeparatorColor)
        gridBuffer = result.buffer
        gridCount = result.count
        bottomSeparatorBuffer = result.separatorBuffer
        bottomSeparatorCount = result.separatorCount
    }
    
    public func drawGrid(encoder: MTLRenderCommandEncoder) {
        if let grid = gridBuffer, gridCount > 0 {
            encoder.setVertexBuffer(grid, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: gridCount)
        }
        
        if let separator = bottomSeparatorBuffer, bottomSeparatorCount > 0 {
            encoder.setVertexBuffer(separator, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: bottomSeparatorCount)
        }
    }
    
    public func beginDraw(in view: MTKView) -> (MTLRenderCommandEncoder, MTLCommandBuffer)? {
        guard let _ = view.currentDrawable,
              let pass = view.currentRenderPassDescriptor,
              let pipeline = pipeline,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { return nil }
        
        encoder.setRenderPipelineState(pipeline)
        return (encoder, commandBuffer)
    }
    
    public func endDraw(encoder: MTLRenderCommandEncoder, commandBuffer: MTLCommandBuffer, drawable: CAMetalDrawable) {
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
