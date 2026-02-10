import Metal

enum ChartGrid {

    static func build(device: MTLDevice, gridColor: (Float, Float, Float, Float)) -> (buffer: MTLBuffer?, count: Int) {
        var verts: [Float] = []
        for i in 1..<5 {
            let y = Float(i) / 5.0 * 2.0 - 1.0
            verts.append(contentsOf: ChartVertex.vertex(x: -1.0, y: y, color: gridColor))
            verts.append(contentsOf: ChartVertex.vertex(x: 1.0, y: y, color: gridColor))
        }
        let count = verts.count / ChartCurve.strideFloats
        let buffer = device.makeBuffer(bytes: verts, length: verts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        return (buffer, count)
    }
}
