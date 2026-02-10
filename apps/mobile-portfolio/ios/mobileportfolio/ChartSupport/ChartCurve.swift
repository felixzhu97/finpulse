import Foundation

enum ChartCurve {

    static let strideFloats = 8
    private static let smoothSteps = 12

    static func catmullRom(_ p0: Float, _ p1: Float, _ p2: Float, _ p3: Float, t: Float) -> Float {
        let t2 = t * t
        let t3 = t2 * t
        return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    }

    static func smoothPoints(_ pts: [(Float, Float)]) -> [(Float, Float)] {
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
}
