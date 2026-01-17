"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { HeatmapChartProps, ChartTheme } from "../types";
import { getThemeColors } from "../utils/chart-helpers";

export function HeatmapChart({
  data,
  height = 400,
  theme = "light",
  colorScale = ["#3b82f6", "#8b5cf6", "#ec4899", "#ef4444"],
  showTooltip = true,
  className,
}: HeatmapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.data.length) return;

    const colors = getThemeColors(theme);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 清除之前的渲染

    const margin = { top: 60, right: 60, bottom: 60, left: 100 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 创建比例尺
    const xScale = d3
      .scaleBand()
      .domain(data.colLabels)
      .range([0, width])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(data.rowLabels)
      .range([0, actualHeight])
      .padding(0.05);

    // 创建颜色比例尺
    const values = data.data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const colorScaleFunc = d3
      .scaleSequential()
      .domain([minValue, maxValue])
      .interpolator(
        d3.interpolateRgb(colorScale[0], colorScale[colorScale.length - 1])
      );

    // 绘制矩形
    const cells = g
      .selectAll(".cell")
      .data(data.data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.col)!)
      .attr("y", (d) => yScale(d.row)!)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScaleFunc(d.value))
      .attr("stroke", colors.background)
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        if (showTooltip && tooltipRef.current) {
          d3.select(this).attr("stroke", colors.text).attr("stroke-width", 2);

          tooltipRef.current.style.display = "block";
          tooltipRef.current.innerHTML = `
            <div><strong>${d.row}</strong> × <strong>${d.col}</strong></div>
            <div>${d.value.toFixed(2)}</div>
          `;
        }
      })
      .on("mousemove", function (event) {
        if (showTooltip && tooltipRef.current) {
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
          tooltipRef.current.style.top = `${event.pageY - 10}px`;
        }
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("stroke", colors.background)
          .attr("stroke-width", 1);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "none";
        }
      });

    // 添加 X 轴
    g.append("g")
      .attr("transform", `translate(0,${actualHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", colors.text)
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.selectAll(".domain, .tick line").attr("stroke", colors.grid);

    // 添加 Y 轴
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", colors.text);

    // 添加颜色图例
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = -40;

    const legendScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    const legend = g
      .append("g")
      .attr("transform", `translate(${legendX},${legendY})`);

    const legendGradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    colorScale.forEach((color, i) => {
      legendGradient
        .append("stop")
        .attr("offset", `${(i / (colorScale.length - 1)) * 100}%`)
        .attr("stop-color", color);
    });

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    legend
      .append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .attr("fill", colors.text);

    legend.selectAll(".domain, .tick line").attr("stroke", colors.grid);
  }, [data, height, theme, colorScale, showTooltip]);

  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ display: "block" }}
      />
      {showTooltip && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            display: "none",
            padding: "8px 12px",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
            border: `1px solid ${getThemeColors(theme).grid}`,
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            color: getThemeColors(theme).text,
            fontSize: "12px",
          }}
        />
      )}
    </div>
  );
}
