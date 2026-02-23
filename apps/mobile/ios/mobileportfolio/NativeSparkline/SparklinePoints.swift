import CoreGraphics

enum SparklinePoints {

    private static let pad: CGFloat = 0.06
    private static let amp: CGFloat = 0.35
    private static let placeholderCount = 10

    static func points(from values: [Double]) -> [CGPoint]? {
        guard values.count >= 2, let minV = values.min(), let maxV = values.max() else { return nil }
        let h = 1 - pad * 2
        let n = CGFloat(values.count - 1)
        let range = maxV - minV
        return values.enumerated().map { i, v in
            let x = CGFloat(i) / n
            let y: CGFloat = range > 0 ? 1 - pad - CGFloat((v - minV) / range) * h : 0.5
            return CGPoint(x: x, y: y)
        }
    }

    static func resolvedTrend(data: [Double]?, fallback: String) -> String {
        guard let arr = data, arr.count >= 2 else { return fallback }
        let first = arr.first!
        let last = arr.last!
        if last > first { return "up" }
        if last < first { return "down" }
        return "flat"
    }

    static func placeholderPoints(for trend: String, count: Int = placeholderCount) -> [CGPoint] {
        let n = max(count - 1, 1)
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
}
