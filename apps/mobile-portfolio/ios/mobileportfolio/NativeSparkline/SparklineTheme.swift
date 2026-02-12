import UIKit

enum SparklineTheme {

    static func lineColor(for trend: String) -> UIColor {
        switch trend {
        case "up": return UIColor(red: 255/255, green: 59/255, blue: 48/255, alpha: 1)
        case "down": return UIColor(red: 52/255, green: 199/255, blue: 89/255, alpha: 1)
        default: return UIColor(red: 142/255, green: 142/255, blue: 147/255, alpha: 1)
        }
    }

    static func baselineColor(for trend: String) -> UIColor {
        let lineColor = lineColor(for: trend)
        return lineColor.withAlphaComponent(0.3)
    }

    static func gradientColors(for trend: String) -> [UIColor] {
        let lineColor = lineColor(for: trend)
        return [
            lineColor.withAlphaComponent(0.15),
            lineColor.withAlphaComponent(0.0)
        ]
    }

    static var baselineDashLengths: [CGFloat] { [3, 3] }
}
