import Metal

enum ChartGrid {

    static func build(device: MTLDevice, gridColor: (Float, Float, Float, Float), bottomSeparatorColor: (Float, Float, Float, Float)) -> (buffer: MTLBuffer?, separatorBuffer: MTLBuffer?, count: Int, separatorCount: Int) {
        var verts: [Float] = []
        var separatorVerts: [Float] = []
        
        let horizontalDivisions = 4
        let verticalDivisions = 6
        let halfLineLength: Float = 0.025
        
        let topY: Float = 1.0
        let bottomY: Float = -1.0
        let leftX: Float = 0.0
        let rightX: Float = 1.0
        let borderOffset: Float = 0.01
        
        let topBorderY = topY - borderOffset
        let leftBorderX = leftX + borderOffset
        
        verts.append(contentsOf: ChartVertex.vertex(x: leftBorderX, y: topBorderY, color: gridColor))
        verts.append(contentsOf: ChartVertex.vertex(x: rightX, y: topBorderY, color: gridColor))
        
        verts.append(contentsOf: ChartVertex.vertex(x: leftX, y: bottomY, color: gridColor))
        verts.append(contentsOf: ChartVertex.vertex(x: rightX, y: bottomY, color: gridColor))
        
        verts.append(contentsOf: ChartVertex.vertex(x: leftBorderX, y: topBorderY, color: gridColor))
        verts.append(contentsOf: ChartVertex.vertex(x: leftBorderX, y: bottomY, color: gridColor))
        
        for i in 1..<horizontalDivisions {
            let y = Float(i) / Float(horizontalDivisions) * 2.0 - 1.0
            verts.append(contentsOf: ChartVertex.vertex(x: leftX - halfLineLength, y: y, color: gridColor))
            verts.append(contentsOf: ChartVertex.vertex(x: rightX + halfLineLength, y: y, color: gridColor))
        }
        
        let extensionLineLength: Float = 0.04
        let verticalDivisionsForLabels = 6
        for i in 0..<verticalDivisionsForLabels {
            let y = Float(i) / Float(verticalDivisionsForLabels - 1) * 2.0 - 1.0
            verts.append(contentsOf: ChartVertex.vertex(x: rightX, y: y, color: gridColor))
            verts.append(contentsOf: ChartVertex.vertex(x: rightX + extensionLineLength, y: y, color: gridColor))
        }
        
        for i in 1..<verticalDivisions {
            let x = Float(i) / Float(verticalDivisions)
            verts.append(contentsOf: ChartVertex.vertex(x: x, y: bottomY, color: gridColor))
            verts.append(contentsOf: ChartVertex.vertex(x: x, y: topY, color: gridColor))
        }
        
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: leftX - halfLineLength, y: bottomY, color: bottomSeparatorColor))
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: rightX + halfLineLength, y: bottomY, color: bottomSeparatorColor))
        
        let topSeparatorColor = bottomSeparatorColor
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: leftX - halfLineLength, y: topY, color: topSeparatorColor))
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: rightX + halfLineLength, y: topY, color: topSeparatorColor))
        
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: leftX, y: bottomY, color: bottomSeparatorColor))
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: leftX, y: topY, color: bottomSeparatorColor))
        
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: rightX, y: bottomY, color: bottomSeparatorColor))
        separatorVerts.append(contentsOf: ChartVertex.vertex(x: rightX, y: topY, color: bottomSeparatorColor))
        
        let count = verts.count / ChartCurve.strideFloats
        let separatorCount = separatorVerts.count / ChartCurve.strideFloats
        let buffer = device.makeBuffer(bytes: verts, length: verts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        let separatorBuffer = device.makeBuffer(bytes: separatorVerts, length: separatorVerts.count * MemoryLayout<Float>.stride, options: .storageModeShared)
        return (buffer, separatorBuffer, count, separatorCount)
    }
}
