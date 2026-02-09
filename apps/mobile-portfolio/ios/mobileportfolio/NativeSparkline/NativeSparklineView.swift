import UIKit

private func points(from values: [Double]) -> [CGPoint]? {
    guard values.count >= 2, let minV = values.min(), let maxV = values.max() else { return nil }
    let pad: CGFloat = 0.06
    let h = 1 - pad * 2
    let n = CGFloat(values.count - 1)
    let range = maxV - minV
    return values.enumerated().map { i, v in
        let x = CGFloat(i) / n
        let y: CGFloat = range > 0 ? 1 - pad - CGFloat((v - minV) / range) * h : 0.5
        return CGPoint(x: x, y: y)
    }
}

private func points(for trend: String, count: Int) -> [CGPoint] {
    let n = max(count - 1, 1)
    let amp: CGFloat = 0.35
    var slope: CGFloat = 0
    if trend == "up" { slope = -1 }
    else if trend == "down" { slope = 1 }
    return (0..<count).map { i in
        let t = CGFloat(i) / CGFloat(n)
        let noise = sin(t * .pi * 2) * amp * 0.5
        let y = 0.5 + slope * t * amp + noise
        return CGPoint(x: t, y: y)
    }
}

@objc(NativeSparklineView)
public class NativeSparklineView: UIView {

    @objc public var trend: NSString? = "flat" {
        didSet { setNeedsDisplay() }
    }

    @objc public var data: NSArray? {
        didSet {
            if let arr = data as? [NSNumber], !arr.isEmpty {
                dataPoints = points(from: arr.map { $0.doubleValue })
            } else {
                dataPoints = nil
            }
            setNeedsDisplay()
        }
    }

    private var dataPoints: [CGPoint]?

    private var lineColor: UIColor {
        let t = resolvedTrend
        switch t {
        case "up": return UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1)
        case "down": return UIColor(red: 34/255, green: 197/255, blue: 94/255, alpha: 1)
        default: return UIColor(red: 107/255, green: 114/255, blue: 128/255, alpha: 1)
        }
    }

    private var resolvedTrend: String {
        if let arr = data as? [NSNumber], arr.count >= 2 {
            let first = arr.first!.doubleValue
            let last = arr.last!.doubleValue
            if last > first { return "up" }
            if last < first { return "down" }
        }
        return (trend as String?) ?? "flat"
    }

    private let baselineColor = UIColor(red: 156/255, green: 163/255, blue: 175/255, alpha: 0.4)
    private let dash: [CGFloat] = [3, 3]

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

        ctx.setStrokeColor(baselineColor.cgColor)
        ctx.setLineWidth(1)
        ctx.setLineDash(phase: 0, lengths: dash)
        ctx.move(to: CGPoint(x: 0, y: midY))
        ctx.addLine(to: CGPoint(x: w, y: midY))
        ctx.strokePath()

        ctx.setLineDash(phase: 0, lengths: [])

        let pts: [CGPoint]
        if let dp = dataPoints {
            pts = dp
        } else {
            pts = points(for: trend as String? ?? "flat", count: 10)
        }
        guard pts.count >= 2 else { return }
        ctx.setStrokeColor(lineColor.cgColor)
        ctx.setLineWidth(1.5)
        ctx.setLineCap(.round)
        ctx.setLineJoin(.round)
        ctx.beginPath()
        ctx.move(to: CGPoint(x: pts[0].x * w, y: pts[0].y * h))
        for i in 1..<pts.count {
            ctx.addLine(to: CGPoint(x: pts[i].x * w, y: pts[i].y * h))
        }
        ctx.strokePath()
    }
}
