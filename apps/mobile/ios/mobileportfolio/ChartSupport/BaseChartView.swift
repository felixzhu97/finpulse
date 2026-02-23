import Metal
import MetalKit
import UIKit

protocol ChartThemeProvider {
    associatedtype Colors
    static func theme(dark: Bool) -> Colors
}

@objc
public class BaseChartView: UIView {
    var metalView: MTKView?
    var device: MTLDevice?
    var renderer: BaseChartRenderer?
    
    @objc public var theme: NSString? {
        didSet {
            applyTheme()
            if let d = device {
                buildGrid(device: d)
                updateBuffers()
            }
        }
    }
    
    var isDarkTheme: Bool {
        return (theme as String?) == "dark"
    }
    
    public override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
        setupMetal()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
        setupMetal()
    }
    
    private func setupView() {
        backgroundColor = .clear
        isOpaque = false
        clipsToBounds = false
    }
    
    private func setupMetal() {
        guard let device = MTLCreateSystemDefaultDevice() else { return }
        self.device = device
        
        let view = MTKView(frame: bounds, device: device)
        view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.delegate = self
        view.isOpaque = false
        view.backgroundColor = .clear
        view.colorPixelFormat = .bgra8Unorm
        view.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        view.isPaused = true
        view.enableSetNeedsDisplay = true
        addSubview(view)
        metalView = view
        sendSubviewToBack(view)
        
        renderer = createRenderer(device: device, pixelFormat: view.colorPixelFormat)
        buildGrid(device: device)
        applyTheme()
    }
    
    public func createRenderer(device: MTLDevice, pixelFormat: MTLPixelFormat) -> BaseChartRenderer {
        fatalError("Subclasses must implement createRenderer()")
    }
    
    public func applyTheme() {
        metalView?.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
    }
    
    public func buildGrid(device: MTLDevice) {
        fatalError("Subclasses must implement buildGrid()")
    }
    
    public func updateBuffers() {
        fatalError("Subclasses must implement updateBuffers()")
    }
    
    public override var backgroundColor: UIColor? {
        didSet {
            super.backgroundColor = .clear
        }
    }
    
    public override func layoutSubviews() {
        super.layoutSubviews()
        metalView?.frame = CGRect(x: 0, y: 0, width: bounds.width, height: bounds.height)
        metalView?.setNeedsDisplay()
    }
    
    public func drawCustomContent(renderer: BaseChartRenderer, encoder: MTLRenderCommandEncoder) {
        fatalError("Subclasses must implement drawCustomContent()")
    }
}

extension BaseChartView: MTKViewDelegate {
    public func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}
    
    public func draw(in view: MTKView) {
        guard let renderer = renderer,
              let result = renderer.beginDraw(in: view),
              let drawable = view.currentDrawable else { return }
        
        let encoder = result.0
        let commandBuffer = result.1
        
        renderer.drawGrid(encoder: encoder)
        drawCustomContent(renderer: renderer, encoder: encoder)
        renderer.endDraw(encoder: encoder, commandBuffer: commandBuffer, drawable: drawable)
    }
}
