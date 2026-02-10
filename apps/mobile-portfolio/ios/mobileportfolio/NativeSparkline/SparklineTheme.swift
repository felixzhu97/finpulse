import UIKit

enum SparklineTheme {

    static func lineColor(for trend: String) -> UIColor {
        switch trend {
        case "up": return UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1)
        case "down": return UIColor(red: 34/255, green: 197/255, blue: 94/255, alpha: 1)
        default: return UIColor(red: 107/255, green: 114/255, blue: 128/255, alpha: 1)
        }
    }

    static var baselineColor: UIColor {
        UIColor(red: 156/255, green: 163/255, blue: 175/255, alpha: 0.4)
    }

    static var baselineDashLengths: [CGFloat] { [3, 3] }
}
