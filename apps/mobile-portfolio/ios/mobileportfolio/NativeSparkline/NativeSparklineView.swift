import UIKit

@objc(NativeSparklineView)
public class NativeSparklineView: UIView {

    @objc public var trend: NSString? = "flat" {
        didSet { setNeedsDisplay() }
    }

    @objc public var data: NSArray? {
        didSet {
            if let arr = data as? [NSNumber], !arr.isEmpty {
                dataPoints = SparklinePoints.points(from: arr.map { $0.doubleValue })
            } else {
                dataPoints = nil
            }
            setNeedsDisplay()
        }
    }

    private var dataPoints: [CGPoint]?

    public override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .clear
    }

    public override func draw(_ rect: CGRect) {
        guard let ctx = UIGraphicsGetCurrentContext() else { return }
        let w = rect.width
        let h = rect.height
        let midY = h / 2

        let doubleData = (data as? [NSNumber])?.map { $0.doubleValue }
        let fallback = (trend as String?) ?? "flat"
        guard let dp = dataPoints, dp.count >= 2 else {
            drawBaseline(context: ctx, width: w, midY: midY, trend: "flat")
            return
        }

        let resolvedTrend = SparklinePoints.resolvedTrend(data: doubleData, fallback: fallback)
        let lineColor = SparklineTheme.lineColor(for: resolvedTrend)

        drawGradient(context: ctx, width: w, height: h, points: dp, lineColor: lineColor)
        drawBaseline(context: ctx, width: w, midY: midY, trend: resolvedTrend)
        drawLine(context: ctx, width: w, height: h, points: dp, lineColor: lineColor)
    }

    private func drawGradient(context: CGContext, width: CGFloat, height: CGFloat, points: [CGPoint], lineColor: UIColor) {
        guard points.count >= 2 else { return }
        
        let doubleData = (data as? [NSNumber])?.map { $0.doubleValue }
        let fallback = (trend as String?) ?? "flat"
        let resolvedTrend = SparklinePoints.resolvedTrend(data: doubleData, fallback: fallback)
        let gradientColors = SparklineTheme.gradientColors(for: resolvedTrend)
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let cgColors = gradientColors.map { $0.cgColor }
        guard let gradient = CGGradient(colorsSpace: colorSpace, colors: cgColors as CFArray, locations: [0.0, 1.0]) else { return }
        
        let path = CGMutablePath()
        let firstPoint = CGPoint(x: points[0].x * width, y: points[0].y * height)
        path.move(to: CGPoint(x: 0, y: height))
        path.addLine(to: firstPoint)
        
        for i in 1..<points.count {
            path.addLine(to: CGPoint(x: points[i].x * width, y: points[i].y * height))
        }
        
        path.addLine(to: CGPoint(x: width, y: height))
        path.closeSubpath()
        
        context.saveGState()
        context.addPath(path)
        context.clip()
        
        let minY = points.map { $0.y * height }.min() ?? 0
        let startPoint = CGPoint(x: width / 2, y: minY)
        let endPoint = CGPoint(x: width / 2, y: height)
        context.drawLinearGradient(gradient, start: startPoint, end: endPoint, options: [])
        context.restoreGState()
    }

    private func drawBaseline(context: CGContext, width: CGFloat, midY: CGFloat, trend: String) {
        let baselineColor = SparklineTheme.baselineColor(for: trend)
        context.setStrokeColor(baselineColor.cgColor)
        context.setLineWidth(1)
        context.setLineDash(phase: 0, lengths: SparklineTheme.baselineDashLengths)
        context.move(to: CGPoint(x: 0, y: midY))
        context.addLine(to: CGPoint(x: width, y: midY))
        context.strokePath()
    }

    private func drawLine(context: CGContext, width: CGFloat, height: CGFloat, points: [CGPoint], lineColor: UIColor) {
        context.setLineDash(phase: 0, lengths: [])
        context.setStrokeColor(lineColor.cgColor)
        context.setLineWidth(2.0)
        context.setLineCap(.round)
        context.setLineJoin(.round)
        context.beginPath()
        context.move(to: CGPoint(x: points[0].x * width, y: points[0].y * height))
        for i in 1..<points.count {
            context.addLine(to: CGPoint(x: points[i].x * width, y: points[i].y * height))
        }
        context.strokePath()
    }
}
