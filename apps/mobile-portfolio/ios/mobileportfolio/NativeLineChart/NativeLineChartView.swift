import Metal
import MetalKit
import UIKit

private final class ChartLayoutCalculator {
    static let chartPadding: CGFloat = 0
    static let bottomPadding: CGFloat = 0
    
    static func calculateChartAreaHeight(totalHeight: CGFloat) -> CGFloat {
        return totalHeight - chartPadding - bottomPadding
    }
    
    static func calculateYPosition(normalizedY: CGFloat, chartAreaHeight: CGFloat) -> CGFloat {
        return chartPadding + (1.0 - normalizedY) * chartAreaHeight
    }
}

private final class ChartDataCalculator {
    static func calculateRange(from values: [Double]) -> (min: Double, max: Double, range: Double) {
        let minVal = values.min() ?? 0
        let maxVal = values.max() ?? 1
        let range = maxVal - minVal > 0 ? maxVal - minVal : 1.0
        return (minVal, maxVal, range)
    }
    
    static func normalizeValue(_ value: Double, min: Double, range: Double) -> Double {
        return (value - min) / range
    }
    
    static func calculateYPosition(normalizedY: Double, chartAreaHeight: CGFloat, chartPadding: CGFloat) -> CGFloat {
        return chartPadding + CGFloat(1.0 - normalizedY) * chartAreaHeight
    }
}

private final class LineChartBuffers {
    var line: MTLBuffer?
    var fill: MTLBuffer?
    var lineCount = 0
    var fillCount = 0
    var minLineY: Float = -1.0
    var gradientTopColor: (Float, Float, Float, Float) = (0, 0, 0, 0)
    var uniformBuffer: MTLBuffer?
    
    func update(values: [Double], device: MTLDevice, colors: LineChartTheme.Colors) {
        guard values.count >= 2 else {
            lineCount = 0
            fillCount = 0
            return
        }
        let minVal = values.min() ?? 0
        let maxVal = values.max() ?? 1
        let scale = (maxVal - minVal) > 0 ? 1.0 / (maxVal - minVal) : 1.0
        let n = values.count
        var raw: [(Float, Float)] = []
        for (i, v) in values.enumerated() {
            let x = Float(i) / Float(max(n - 1, 1))
            let y = Float((v - minVal) * scale) * 2.0 - 1.0
            raw.append((x, y))
        }
        var pts = ChartCurve.smoothPoints(raw)
        if !pts.isEmpty {
            pts[0] = (0.0, pts[0].1)
            pts[pts.count - 1] = (1.0, pts[pts.count - 1].1)
        }
        minLineY = pts.map { $0.1 }.min() ?? -1.0
        gradientTopColor = colors.fillTop
        var lineVerts: [Float] = []
        var fillVerts: [Float] = []
        let fillColor: (Float, Float, Float, Float) = (colors.fillTop.0, colors.fillTop.1, colors.fillTop.2, 0.0)
        for (x, y) in pts {
            fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: y, color: fillColor))
            fillVerts.append(contentsOf: ChartVertex.vertex(x: x, y: -1.0, color: fillColor))
        }
        
        let lineWidth: Float = 0.008
        for i in 0..<(pts.count - 1) {
            let (x1, y1) = pts[i]
            let (x2, y2) = pts[i + 1]
            let dx = x2 - x1
            let dy = y2 - y1
            let len = sqrt(dx * dx + dy * dy)
            if len > 0 {
                let nx = -dy / len * lineWidth
                let ny = dx / len * lineWidth
                lineVerts.append(contentsOf: ChartVertex.vertex(x: x1 + nx, y: y1 + ny, color: colors.line))
                lineVerts.append(contentsOf: ChartVertex.vertex(x: x1 - nx, y: y1 - ny, color: colors.line))
                lineVerts.append(contentsOf: ChartVertex.vertex(x: x2 + nx, y: y2 + ny, color: colors.line))
                lineVerts.append(contentsOf: ChartVertex.vertex(x: x2 + nx, y: y2 + ny, color: colors.line))
                lineVerts.append(contentsOf: ChartVertex.vertex(x: x1 - nx, y: y1 - ny, color: colors.line))
                lineVerts.append(contentsOf: ChartVertex.vertex(x: x2 - nx, y: y2 - ny, color: colors.line))
            }
        }
        lineCount = lineVerts.count / ChartCurve.strideFloats
        fillCount = fillVerts.count / ChartCurve.strideFloats
        line = device.makeBuffer(bytes: lineVerts, length: lineVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        fill = device.makeBuffer(bytes: fillVerts, length: fillVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        
        struct Uniforms {
            var minLineY: Float
            var gradientTopR: Float
            var gradientTopG: Float
            var gradientTopB: Float
            var gradientTopA: Float
        }
        var uniforms = Uniforms(
            minLineY: minLineY,
            gradientTopR: gradientTopColor.0,
            gradientTopG: gradientTopColor.1,
            gradientTopB: gradientTopColor.2,
            gradientTopA: gradientTopColor.3
        )
        uniformBuffer = device.makeBuffer(bytes: &uniforms, length: MemoryLayout<Uniforms>.stride, options: .storageModeShared)
    }
}

@objc(NativeLineChartView)
public class NativeLineChartView: BaseChartView {
    private let buffers = LineChartBuffers()
    private var baselineLayer: CAShapeLayer?

    @objc public var data: NSArray? {
        didSet { updateBuffers() }
    }

    @objc public var trend: NSString? {
        didSet { updateBuffers() }
    }
    
    @objc public var timestamps: NSArray? {
        didSet { }
    }
    
    @objc public var baselineValue: NSNumber? {
        didSet { updateBaseline() }
    }

    public override func createRenderer(device: MTLDevice, pixelFormat: MTLPixelFormat) -> BaseChartRenderer {
        return BaseChartRenderer(device: device, pixelFormat: pixelFormat)
    }

    public override func buildGrid(device: MTLDevice) {
        guard let renderer = renderer else { return }
        let trendStr = (trend as String?) ?? "flat"
        let colors = LineChartTheme.theme(dark: isDarkTheme, trend: trendStr)
        renderer.updateGrid(gridColor: colors.grid, bottomSeparatorColor: colors.bottomSeparator)
    }

    public override func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty,
              let renderer = renderer else {
            metalView?.setNeedsDisplay()
            return
        }
        let trendStr = (trend as String?) ?? "flat"
        let colors = LineChartTheme.theme(dark: isDarkTheme, trend: trendStr)
        buffers.update(values: arr.map { $0.doubleValue }, device: device!, colors: colors)
        metalView?.setNeedsDisplay()
    }
    
    private func updateBaseline() {
        guard let baseline = baselineValue?.doubleValue else {
            baselineLayer?.removeFromSuperlayer()
            baselineLayer = nil
            return
        }
        
        guard let arr = data as? [NSNumber], arr.count >= 2 else { return }
        let values = arr.map { $0.doubleValue }
        let (minVal, _, range) = ChartDataCalculator.calculateRange(from: values)
        
        let chartAreaHeight = ChartLayoutCalculator.calculateChartAreaHeight(totalHeight: bounds.height)
        let normalizedY = ChartDataCalculator.normalizeValue(baseline, min: minVal, range: range)
        let yPosition = ChartDataCalculator.calculateYPosition(normalizedY: normalizedY, chartAreaHeight: chartAreaHeight, chartPadding: ChartLayoutCalculator.chartPadding)
        
        if baselineLayer == nil {
            let layer = CAShapeLayer()
            layer.strokeColor = (isDarkTheme ? UIColor.white : UIColor.black).withAlphaComponent(0.15).cgColor
            layer.lineWidth = 1.0
            layer.lineDashPattern = [4, 4]
            layer.fillColor = UIColor.clear.cgColor
            self.layer.addSublayer(layer)
            baselineLayer = layer
        }
        
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 0, y: yPosition))
        path.addLine(to: CGPoint(x: bounds.width, y: yPosition))
        baselineLayer?.path = path.cgPath
    }

    public override func drawCustomContent(renderer: BaseChartRenderer, encoder: MTLRenderCommandEncoder) {
        if let fill = buffers.fill, buffers.fillCount >= 2 {
            encoder.setVertexBuffer(fill, offset: 0, index: 0)
            if let uniformBuf = buffers.uniformBuffer {
                encoder.setFragmentBuffer(uniformBuf, offset: 0, index: 0)
            }
            encoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: buffers.fillCount)
        }
        
        if buffers.lineCount >= 3, let line = buffers.line {
            encoder.setVertexBuffer(line, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: buffers.lineCount)
        }
    }
    
    public override func layoutSubviews() {
        super.layoutSubviews()
        updateBaseline()
    }
}
