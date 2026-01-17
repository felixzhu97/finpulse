'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { WaterfallChartProps, WaterfallDataPoint, ChartTheme } from '../types';
import { getThemeColors } from '../utils/chart-helpers';

export function WaterfallChart({
  data,
  height = 400,
  theme = 'light',
  className,
}: WaterfallChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const colors = getThemeColors(theme);
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 计算累积值
    let runningTotal = 0;
    const processedData = data.map((d, i) => {
      const start = runningTotal;
      let end: number;
      
      if (d.type === 'total' || i === data.length - 1) {
        end = d.value;
        runningTotal = d.value;
      } else {
        end = runningTotal + d.value;
        runningTotal = end;
      }
      
      return {
        ...d,
        start,
        end,
        isTotal: d.type === 'total' || i === data.length - 1,
      };
    });

    // 创建比例尺
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, width])
      .padding(0.2);

    const allValues = processedData.flatMap((d) => [d.start, d.end]);
    const minValue = Math.min(0, ...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1;

    const yScale = d3
      .scaleLinear()
      .domain([minValue - padding, maxValue + padding])
      .range([actualHeight, 0]);

    // 绘制柱子
    processedData.forEach((d) => {
      const x = xScale(d.name)!;
      const barWidth = xScale.bandwidth();
      
      // 确定颜色
      let barColor = colors.primary;
      if (d.isTotal) {
        barColor = colors.text;
      } else if (d.value >= 0) {
        barColor = colors.success;
      } else {
        barColor = colors.danger;
      }

      // 绘制连接线（除了第一个和总计）
      if (!d.isTotal && processedData.indexOf(d) > 0) {
        const prevD = processedData[processedData.indexOf(d) - 1];
        if (prevD && !prevD.isTotal) {
          const lineX = xScale(prevD.name)! + xScale.bandwidth();
          g.append('line')
            .attr('x1', lineX)
            .attr('x2', x)
            .attr('y1', yScale(prevD.end))
            .attr('y2', yScale(d.start))
            .attr('stroke', colors.grid)
            .attr('stroke-width', 2)
            .style('pointer-events', 'none');
        }
      }

      // 绘制柱子
      const rectHeight = Math.abs(yScale(d.end) - yScale(d.start));
      const rectY = d.end >= d.start ? yScale(d.end) : yScale(d.start);

      const rect = g
        .append('rect')
        .attr('x', x)
        .attr('y', rectY)
        .attr('width', barWidth)
        .attr('height', rectHeight)
        .attr('fill', barColor)
        .attr('stroke', colors.background)
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function (event) {
          d3.select(this).attr('stroke-width', 3);
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.innerHTML = `
              <div><strong>${d.name}</strong></div>
              <div>${d.value >= 0 ? '+' : ''}${d.value.toFixed(2)}</div>
              ${d.end !== d.value ? `<div>总计: ${d.end.toFixed(2)}</div>` : ''}
            `;
          }
        })
        .on('mousemove', function (event) {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.pageX + 10}px`;
            tooltipRef.current.style.top = `${event.pageY - 10}px`;
          }
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke-width', 1);
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
        });

      // 添加数值标签
      const labelY = d.end >= d.start ? rectY - 5 : rectY + rectHeight + 15;
      g.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.text)
        .attr('font-size', '12px')
        .text(d.value >= 0 ? `+${d.value.toFixed(0)}` : d.value.toFixed(0));
    });

    // 添加 X 轴
    g.append('g')
      .attr('transform', `translate(0,${actualHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', colors.text)
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.selectAll('.domain, .tick line').attr('stroke', colors.grid);

    // 添加 Y 轴
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('fill', colors.text);

    g.selectAll('.domain').attr('stroke', colors.grid);
  }, [data, height, theme]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} width="100%" height={height} style={{ display: 'block' }} />
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          display: 'none',
          padding: '8px 12px',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${getThemeColors(theme).grid}`,
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          color: getThemeColors(theme).text,
          fontSize: '12px',
        }}
      />
    </div>
  );
}
