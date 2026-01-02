
import { Component, ChangeDetectionStrategy, input, ElementRef, inject, effect, computed } from '@angular/core';
import { WidgetInstance } from '../../../models/widget-instance.model';

declare const d3: any;

@Component({
  selector: 'app-widget-chart',
  template: `<div class="w-full h-full chart-container"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .chart-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
  `]
})
export class ChartComponent {
  private elRef = inject(ElementRef);
  instance = input.required<WidgetInstance>();
  data = computed(() => this.instance().props?.['data'] || '10,20,30,40,50');

  constructor() {
    effect(() => {
      this.renderChart(this.data());
    });
  }

  private renderChart(dataStr: string): void {
    const data = dataStr.split(',').map(d => +d.trim()).filter(n => !isNaN(n) && n > 0);
    if (!data.length) return;

    const container = this.elRef.nativeElement.querySelector('.chart-container');
    d3.select(container).select('svg').remove();

    const margin = { top: 10, right: 10, bottom: 20, left: 20 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map((_, i) => i))
      .padding(0.2);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(() => ''));

    const y = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y).ticks(5));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (_, i) => x(i))
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d))
      .attr('fill', '#60a5fa');
  }
}
