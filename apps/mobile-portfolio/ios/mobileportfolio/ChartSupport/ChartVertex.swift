import Foundation

enum ChartVertex {

    static func vertex(x: Float, y: Float, color: (Float, Float, Float, Float)) -> [Float] {
        [x, y, 0, 0, color.0, color.1, color.2, color.3]
    }
}
