import Metal

enum LineChartTheme {
    typealias Colors = (clear: MTLClearColor, line: (Float, Float, Float, Float), fillTop: (Float, Float, Float, Float), fillBottom: (Float, Float, Float, Float), grid: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        if dark {
            return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (1, 0.25, 0.25, 1), (1, 0.25, 0.25, 0.4), (1, 0.25, 0.25, 0), (0.22, 0.22, 0.26, 1))
        }
        return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (1, 0.2, 0.2, 1), (1, 0.2, 0.2, 0.35), (1, 0.2, 0.2, 0), (0.85, 0.85, 0.88, 1))
    }
}

enum BaselineChartTheme {
    typealias Colors = (clear: MTLClearColor, line: (Float, Float, Float, Float), grid: (Float, Float, Float, Float), fillAbove: (Float, Float, Float, Float), fillBelow: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        if dark {
            return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (0.9, 0.9, 0.92, 1), (0.22, 0.22, 0.26, 1), (0.2, 0.72, 0.45, 0.5), (1, 0.3, 0.25, 0.5))
        }
        return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.2, 0.2, 0.2, 1), (0.85, 0.85, 0.88, 1), (0.2, 0.7, 0.4, 0.4), (1, 0.2, 0.2, 0.4))
    }
}

enum CandleChartTheme {
    typealias Colors = (clear: MTLClearColor, grid: (Float, Float, Float, Float), up: (Float, Float, Float, Float), down: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        if dark {
            return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (0.22, 0.22, 0.26, 1), (0.2, 0.75, 0.85, 1), (1, 0.3, 0.25, 1))
        }
        return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.85, 0.85, 0.88, 1), (0.2, 0.7, 0.6, 1), (1, 0.2, 0.2, 1))
    }
}

enum HistogramChartTheme {
    typealias Colors = (clear: MTLClearColor, grid: (Float, Float, Float, Float), bar: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        if dark {
            return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (0.22, 0.22, 0.26, 1), (0.25, 0.41, 0.88, 0.9))
        }
        return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.85, 0.85, 0.88, 1), (0.2, 0.4, 0.85, 0.9))
    }
}

enum LineOnlyChartTheme {
    typealias Colors = (clear: MTLClearColor, line: (Float, Float, Float, Float), grid: (Float, Float, Float, Float))
    static func theme(dark: Bool) -> Colors {
        if dark {
            return (MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1), (1, 0.25, 0.25, 1), (0.22, 0.22, 0.26, 1))
        }
        return (MTLClearColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1), (0.2, 0.4, 0.9, 1), (0.85, 0.85, 0.88, 1))
    }
}
