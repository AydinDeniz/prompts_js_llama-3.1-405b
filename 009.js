// Set up the SVG
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 500 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Function to generate the bar chart
function generateBarChart(data) {
  // Set up the scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

  // Create the bars
  const bars = svg.selectAll('rect')
    .data(data, d => d.category);

  bars.enter()
    .append('rect')
    .attr('x', d => xScale(d.category))
    .attr('y', height)
    .attr('width', xScale.bandwidth())
    .attr('height', 0)
    .transition()
    .duration(500)
    .attr('y', d => yScale(d.value))
    .attr('height', d => height - yScale(d.value));

  bars.transition()
    .duration(500)
    .attr('y', d => yScale(d.value))
    .attr('height', d => height - yScale(d.value));

  bars.exit()
    .transition()
    .duration(500)
    .attr('height', 0)
    .attr('y', height)
    .remove();

  // Add the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.select('.x-axis')
    .remove();

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  svg.select('.y-axis')
    .remove();

  svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis);

  // Add the tooltip
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  bars.on('mouseover', (d) => {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0.9);

    tooltip.html(`Category: ${d.category}<br>Value: ${d.value}`)
      .style('left', (d3.event.pageX) + 'px')
      .style('top', (d3.event.pageY - 28) + 'px');
  });

  bars.on('mouseout', () => {
    tooltip.transition()
      .duration(500)
      .style('opacity', 0);
  });
}

// Example usage
const data = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 },
  { category: 'C', value: 15 },
  { category: 'D', value: 30 },
  { category: 'E', value: 25 },
];

generateBarChart(data);

// Update the chart with new data
setTimeout(() => {
  const newData = [
    { category: 'A', value: 15 },
    { category: 'B', value: 25 },
    { category: 'C', value: 20 },
    { category: 'D', value: 35 },
    { category: 'E', value: 30 },
  ];

  generateBarChart(newData);
}, 2000);