#include <metal_stdlib>
using namespace metal;

struct VertexIn {
    float2 position;
    float2 _pad;
    float4 color;
};

struct VertexOut {
    float4 position [[position]];
    float4 color;
    float yCoord;
};

struct Uniforms {
    float minLineY;
    float gradientTopR;
    float gradientTopG;
    float gradientTopB;
    float gradientTopA;
};

vertex VertexOut chart_vertex(constant VertexIn* vertices [[buffer(0)]], uint vid [[vertex_id]]) {
    VertexOut out;
    float2 pos = vertices[vid].position;
    float2 clip = float2(pos.x * 2.0 - 1.0, pos.y);
    out.position = float4(clip, 0.0, 1.0);
    out.color = vertices[vid].color;
    out.yCoord = pos.y;
    return out;
}

fragment float4 chart_fragment(VertexOut in [[stage_in]], constant Uniforms& uniforms [[buffer(0)]]) {
    float4 lineColor = in.color;
    if (lineColor.a > 0.5) {
        return lineColor;
    }
    
    float y = in.yCoord;
    float minY = uniforms.minLineY;
    float maxY = 1.0;
    
    float t = clamp((maxY - y) / (maxY - minY), 0.0, 1.0);
    float alpha = mix(uniforms.gradientTopA, 0.0, smoothstep(0.0, 1.0, t));
    float4 gradientColor = float4(uniforms.gradientTopR, uniforms.gradientTopG, uniforms.gradientTopB, alpha);
    
    return gradientColor;
}
