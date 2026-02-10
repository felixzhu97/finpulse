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

        drawBaseline(context: ctx, width: w, midY: midY)
        drawLine(context: ctx, width: w, height: h)
    }

    private func drawBaseline(context: CGContext, width: CGFloat, midY: CGFloat) {
        context.setStrokeColor(SparklineTheme.baselineColor.cgColor)
        context.setLineWidth(1)
        context.setLineDash(phase: 0, lengths: SparklineTheme.baselineDashLengths)
        context.move(to: CGPoint(x: 0, y: midY))
        context.addLine(to: CGPoint(x: width, y: midY))
        context.strokePath()
    }

    private func drawLine(context: CGContext, width: CGFloat, height: CGFloat) {
        context.setLineDash(phase: 0, lengths: [])

        let doubleData = (data as? [NSNumber])?.map { $0.doubleValue }
        let fallback = (trend as String?) ?? "flat"
        let pts: [CGPoint]
        if let dp = dataPoints {
            pts = dp
        } else {
            pts = SparklinePoints.placeholderPoints(for: fallback)
        }
        guard pts.count >= 2 else { return }

        let resolvedTrend = SparklinePoints.resolvedTrend(data: doubleData, fallback: fallback)
        context.setStrokeColor(SparklineTheme.lineColor(for: resolvedTrend).cgColor)
        context.setLineWidth(1.5)
        context.setLineCap(.round)
        context.setLineJoin(.round)
        context.beginPath()
        context.move(to: CGPoint(x: pts[0].x * width, y: pts[0].y * height))
        for i in 1..<pts.count {
            context.addLine(to: CGPoint(x: pts[i].x * width, y: pts[i].y * height))
        }
        context.strokePath()
    }
}
