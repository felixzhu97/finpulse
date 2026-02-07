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
};

vertex VertexOut chart_vertex(constant VertexIn* vertices [[buffer(0)]], uint vid [[vertex_id]]) {
    VertexOut out;
    out.position = float4(vertices[vid].position, 0.0, 1.0);
    out.color = vertices[vid].color;
    return out;
}

fragment float4 chart_fragment(VertexOut in [[stage_in]]) {
    return in.color;
}
