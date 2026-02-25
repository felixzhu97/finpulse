import Metal

enum LineChartTheme {
    typealias Colors = (clear: MTLClearColor, line: (Float, Float, Float, Float), fillTop: (Float, Float, Float, Float), fillBottom: (Float, Float, Float, Float), grid: (Float, Float, Float, Float), bottomSeparator: (Float, Float, Float, Float))
    static func theme(dark: Bool, trend: String = "flat") -> Colors {
        let lineColor: (Float, Float, Float, Float)
        let fillTop: (Float, Float, Float, Float)
        let fillBottom: (Float, Float, Float, Float)
        
        let fillAlpha: Float = dark ? 0.15 : 0.55
    switch trend {
        case "up":
            lineColor = (0/255, 200/255, 5/255, 1)
            fillTop = (0/255, 200/255, 5/255, fillAlpha)
            fillBottom = (0/255, 200/255, 5/255, 0)
        case "down":
            lineColor = (255/255, 59/255, 48/255, 1)
            fillTop = (255/255, 59/255, 48/255, fillAlpha)
            fillBottom = (255/255, 59/255, 48/255, 0)
        default:
            lineColor = (142/255, 142/255, 147/255, 1)
            fillTop = (142/255, 142/255, 147/255, fillAlpha)
            fillBottom = (142/255, 142/255, 147/255, 0)
        }
        
        let gridColor: (Float, Float, Float, Float) = dark ? (0.25, 0.25, 0.28, 0.6) : (0.6, 0.6, 0.65, 0.5)
        let bottomSeparatorColor: (Float, Float, Float, Float) = dark ? (0.5, 0.5, 0.55, 0.9) : (0.75, 0.75, 0.8, 0.9)
        let clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        
        return (clearColor, lineColor, fillTop, fillBottom, gridColor, bottomSeparatorColor)
    }
}

enum BaselineChartTheme {
    typealias Colors = (clear: MTLClearColor, line: (Float, Float, Float, Float), grid: (Float, Float, Float, Float), fillAbove: (Float, Float, Float, Float), fillBelow: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        let clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        if dark {
            return (clearColor, (0.9, 0.9, 0.92, 1), (0.22, 0.22, 0.26, 1), (0.2, 0.72, 0.45, 0.5), (1, 0.3, 0.25, 0.5))
        }
        return (clearColor, (0.2, 0.2, 0.2, 1), (0.85, 0.85, 0.88, 1), (0.2, 0.7, 0.4, 0.4), (1, 0.2, 0.2, 0.4))
    }
}

enum CandleChartTheme {
    typealias Colors = (clear: MTLClearColor, grid: (Float, Float, Float, Float), up: (Float, Float, Float, Float), down: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        let clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        if dark {
            return (clearColor, (0.22, 0.22, 0.26, 1), (0.2, 0.75, 0.85, 1), (1, 0.3, 0.25, 1))
        }
        return (clearColor, (0.85, 0.85, 0.88, 1), (0.2, 0.7, 0.6, 1), (1, 0.2, 0.2, 1))
    }
}

enum HistogramChartTheme {
    typealias Colors = (clear: MTLClearColor, grid: (Float, Float, Float, Float), bar: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        let clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        if dark {
            return (clearColor, (0.22, 0.22, 0.26, 1), (0.5, 0.5, 0.55, 0.6))
        }
        return (clearColor, (0.85, 0.85, 0.88, 1), (0.5, 0.5, 0.55, 0.5))
    }
}

enum LineOnlyChartTheme {
    typealias Colors = (clear: MTLClearColor, line: (Float, Float, Float, Float), grid: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        let clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        if dark {
            return (clearColor, (1, 0.25, 0.25, 1), (0.22, 0.22, 0.26, 1))
        }
        return (clearColor, (0.2, 0.4, 0.9, 1), (0.85, 0.85, 0.88, 1))
    }
}
