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
    
    static func calculateBottomSeparatorY(chartAreaHeight: CGFloat) -> CGFloat {
        return chartPadding + chartAreaHeight
    }
}

private final class ValueFormatter {
    static func format(_ value: Double) -> String {
        if abs(value) >= 1e9 {
            return String(format: "%.2fB", value / 1e9)
        }
        if abs(value) >= 1e6 {
            return String(format: "%.2fM", value / 1e6)
        }
        if abs(value) >= 1e3 {
            return String(format: "%.2fK", value / 1e3)
        }
        if abs(value) >= 1 {
            return String(format: "%.2f", value)
        }
        if abs(value) >= 0.01 {
            return String(format: "%.4f", value)
        }
        return String(format: "%.6f", value)
    }
}

private final class AxisLabelManager {
    private let parentView: UIView
    private var labels: [UILabel] = []
    private let labelCount: Int
    private var isDark: Bool
    
    init(parentView: UIView, labelCount: Int, isDark: Bool) {
        self.parentView = parentView
        self.labelCount = labelCount
        self.isDark = isDark
    }
    
    func updateTheme(isDark: Bool) {
        self.isDark = isDark
        labels.forEach { $0.textColor = labelColor }
    }
    
    func updateLabels(count: Int) {
        while labels.count < count {
            let label = createLabel()
            parentView.addSubview(label)
            parentView.bringSubviewToFront(label)
            labels.append(label)
        }
        
        while labels.count > count {
            let label = labels.removeLast()
            label.removeFromSuperview()
        }
    }
    
    func getLabel(at index: Int) -> UILabel? {
        guard index >= 0 && index < labels.count else { return nil }
        return labels[index]
    }
    
    func clearLabels() {
        labels.forEach { $0.removeFromSuperview() }
        labels.removeAll()
    }
    
    private func createLabel() -> UILabel {
        let label = UILabel()
        label.font = UIFont.systemFont(ofSize: 12, weight: .medium)
        label.backgroundColor = .clear
        label.isUserInteractionEnabled = false
        return label
    }
    
    var labelColor: UIColor {
        return isDark ? UIColor(white: 1.0, alpha: 0.9) : UIColor(white: 0.0, alpha: 0.7)
    }
}

private final class ChartBuffers {
    var line: MTLBuffer?
    var fill: MTLBuffer?
    var lineCount = 0
    var fillCount = 0
    var minLineY: Float = -1.0
    var gradientTopColor: (Float, Float, Float, Float) = (0, 0, 0, 0)
    
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

private final class ChartRenderer {
    private let device: MTLDevice
    private let commandQueue: MTLCommandQueue
    private let pipeline: MTLRenderPipelineState?
    private var gridBuffer: MTLBuffer?
    private var gridCount = 0
    private var bottomSeparatorBuffer: MTLBuffer?
    private var bottomSeparatorCount = 0
    private let buffers = ChartBuffers()
    private var uniformBuffer: MTLBuffer?
    
    init(device: MTLDevice, pixelFormat: MTLPixelFormat) {
        self.device = device
        self.commandQueue = device.makeCommandQueue()!
        self.pipeline = ChartPipeline.make(device: device, pixelFormat: pixelFormat)
    }
    
    func updateGrid(device: MTLDevice, gridColor: (Float, Float, Float, Float), bottomSeparatorColor: (Float, Float, Float, Float)) {
        let result = ChartGrid.build(device: device, gridColor: gridColor, bottomSeparatorColor: bottomSeparatorColor)
        gridBuffer = result.buffer
        gridCount = result.count
        bottomSeparatorBuffer = result.separatorBuffer
        bottomSeparatorCount = result.separatorCount
    }
    
    func updateBuffers(values: [Double], colors: LineChartTheme.Colors) {
        buffers.update(values: values, device: device, colors: colors)
        
        struct Uniforms {
            var minLineY: Float
            var gradientTopR: Float
            var gradientTopG: Float
            var gradientTopB: Float
            var gradientTopA: Float
        }
        var uniforms = Uniforms(
            minLineY: buffers.minLineY,
            gradientTopR: buffers.gradientTopColor.0,
            gradientTopG: buffers.gradientTopColor.1,
            gradientTopB: buffers.gradientTopColor.2,
            gradientTopA: buffers.gradientTopColor.3
        )
        uniformBuffer = device.makeBuffer(bytes: &uniforms, length: MemoryLayout<Uniforms>.stride, options: .storageModeShared)
    }
    
    func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable,
              let pass = view.currentRenderPassDescriptor,
              let pipeline = pipeline,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: pass) else { return }
        encoder.setRenderPipelineState(pipeline)
        
        if let grid = gridBuffer, gridCount > 0 {
            encoder.setVertexBuffer(grid, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: gridCount)
        }
        
        if let separator = bottomSeparatorBuffer, bottomSeparatorCount > 0 {
            encoder.setVertexBuffer(separator, offset: 0, index: 0)
            encoder.drawPrimitives(type: .line, vertexStart: 0, vertexCount: bottomSeparatorCount)
        }
        
        if let fill = buffers.fill, buffers.fillCount >= 2 {
            encoder.setVertexBuffer(fill, offset: 0, index: 0)
            if let uniformBuf = uniformBuffer {
                encoder.setFragmentBuffer(uniformBuf, offset: 0, index: 0)
            }
            encoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: buffers.fillCount)
        }
        
        if buffers.lineCount >= 3, let line = buffers.line {
            encoder.setVertexBuffer(line, offset: 0, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: buffers.lineCount)
        }
        
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
    
    var needsDisplay: Bool {
        return buffers.lineCount > 0 || buffers.fillCount > 0
    }
}

@objc(NativeLineChartView)
public class NativeLineChartView: UIView {
    private var metalView: MTKView?
    private var device: MTLDevice?
    private var renderer: ChartRenderer?
    private var yAxisLabelManager: AxisLabelManager?
    private var xAxisLabelManager: AxisLabelManager?
    private var baselineLayer: CAShapeLayer?

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

    @objc public var trend: NSString? {
        didSet { updateBuffers() }
    }
    
    @objc public var timestamps: NSArray? {
        didSet { updateXAxisLabels() }
    }
    
    @objc public var baselineValue: NSNumber? {
        didSet { updateBaseline() }
    }

    public override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
        isOpaque = false
        clipsToBounds = false
        setupMetal()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .clear
        isOpaque = false
        clipsToBounds = false
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
        view.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        sendSubviewToBack(view)
        
        renderer = ChartRenderer(device: device, pixelFormat: view.colorPixelFormat)
        
        let isDark = (theme as String?) == "dark"
        yAxisLabelManager = AxisLabelManager(parentView: self, labelCount: 6, isDark: isDark)
        xAxisLabelManager = AxisLabelManager(parentView: self, labelCount: 5, isDark: isDark)
        
        buildGrid(device: device)
        applyTheme()
    }
    
    public override var backgroundColor: UIColor? {
        didSet {
            super.backgroundColor = .clear
        }
    }

    private func applyTheme() {
        let trendStr = (trend as String?) ?? "flat"
        let colors = LineChartTheme.theme(dark: (theme as String?) == "dark", trend: trendStr)
        metalView?.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        
        let isDark = (theme as String?) == "dark"
        if yAxisLabelManager == nil {
            yAxisLabelManager = AxisLabelManager(parentView: self, labelCount: 6, isDark: isDark)
        } else {
            yAxisLabelManager?.updateTheme(isDark: isDark)
        }
        if xAxisLabelManager == nil {
            xAxisLabelManager = AxisLabelManager(parentView: self, labelCount: 5, isDark: isDark)
        } else {
            xAxisLabelManager?.updateTheme(isDark: isDark)
        }
        
        updateYAxisLabels()
    }

    private func buildGrid(device: MTLDevice) {
        guard let renderer = renderer else { return }
        let trendStr = (trend as String?) ?? "flat"
        let colors = LineChartTheme.theme(dark: (theme as String?) == "dark", trend: trendStr)
        renderer.updateGrid(device: device, gridColor: colors.grid, bottomSeparatorColor: colors.bottomSeparator)
    }

    private func updateBuffers() {
        guard let arr = data as? [NSNumber], !arr.isEmpty,
              let renderer = renderer else {
            updateYAxisLabels()
            metalView?.setNeedsDisplay()
            return
        }
        let trendStr = (trend as String?) ?? "flat"
        let colors = LineChartTheme.theme(dark: (theme as String?) == "dark", trend: trendStr)
        renderer.updateBuffers(values: arr.map { $0.doubleValue }, colors: colors)
        updateYAxisLabels()
        metalView?.setNeedsDisplay()
    }
    
    private func updateYAxisLabels() {
        guard let arr = data as? [NSNumber], !arr.isEmpty,
              let manager = yAxisLabelManager else {
            yAxisLabelManager?.clearLabels()
            return
        }
        
        let values = arr.map { $0.doubleValue }
        let (minVal, maxVal, range) = ChartDataCalculator.calculateRange(from: values)
        
        let labelCount = 6
        manager.updateLabels(count: labelCount)
        
        let chartAreaHeight = ChartLayoutCalculator.calculateChartAreaHeight(totalHeight: bounds.height)
        
        for i in 0..<labelCount {
            guard let label = manager.getLabel(at: i) else { continue }
            let t = CGFloat(i) / CGFloat(labelCount - 1)
            let value = maxVal - t * range
            let yPosition = ChartLayoutCalculator.calculateYPosition(normalizedY: t, chartAreaHeight: chartAreaHeight)
            
            label.text = ValueFormatter.format(value)
            label.textAlignment = .left
            label.textColor = manager.labelColor
            label.frame = CGRect(x: bounds.width + 8, y: yPosition - 8, width: 80, height: 16)
            label.isHidden = false
            bringSubviewToFront(label)
        }
    }

    private func updateXAxisLabels() {
        guard let arr = data as? [NSNumber], arr.count >= 2,
              let timestampsArr = timestamps as? [NSNumber], timestampsArr.count == arr.count,
              let manager = xAxisLabelManager else { return }
        
        let labelCount = 5
        manager.updateLabels(count: labelCount)
        
        let chartWidth = bounds.width
        let startTime = timestampsArr[0].doubleValue
        let endTime = timestampsArr[timestampsArr.count - 1].doubleValue
        let duration = endTime - startTime
        
        let chartAreaHeight = ChartLayoutCalculator.calculateChartAreaHeight(totalHeight: bounds.height)
        let bottomSeparatorY = ChartLayoutCalculator.calculateBottomSeparatorY(chartAreaHeight: chartAreaHeight)
        
        for i in 0..<labelCount {
            guard let label = manager.getLabel(at: i) else { continue }
            let t = CGFloat(i) / CGFloat(labelCount - 1)
            let timestamp = startTime + t * duration
            let date = Date(timeIntervalSince1970: timestamp / 1000)
            let hour = Calendar.current.component(.hour, from: date)
            
            let x = t * chartWidth
            label.text = String(hour)
            label.textAlignment = .center
            label.textColor = manager.labelColor
            let labelWidth: CGFloat = 24
            label.frame = CGRect(x: x - labelWidth / 2, y: bottomSeparatorY + 4, width: labelWidth, height: 16)
            label.isHidden = false
            bringSubviewToFront(label)
        }
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
            layer.strokeColor = ((theme as String?) == "dark" ? UIColor.white : UIColor.black).withAlphaComponent(0.15).cgColor
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

    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.frame = bounds
        updateYAxisLabels()
        updateXAxisLabels()
        updateBaseline()
        metalView?.setNeedsDisplay()
    }
}

extension NativeLineChartView: MTKViewDelegate {
    public func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    public func draw(in view: MTKView) {
        renderer?.draw(in: view)
    }
}
