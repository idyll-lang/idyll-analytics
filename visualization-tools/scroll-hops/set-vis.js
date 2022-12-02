

const d3 = require('d3');

const edges = require('./edges.json');
const data = require('./sets.json');

const width = window.innerWidth * 4;
const height = window.innerHeight * 4;

d3.select('html').style('margin', 0);

const svg = d3.select('body').style('margin', 0)
  .append('svg')
  .attr('width', width)
  .attr('height', height)


// const padding =

const w = width / 25 / 2;
const h = height / 12 / 2;

const o = d3.scalePow().exponent(1 / 8).domain([0, 5000]);

const lineOpacity = d3.scalePow().exponent(1).domain([0, 1000]).range([0, 1]).clamp(true);
const strokeWidth = d3.scalePow().exponent(1 / 4).domain([0, 1000]).range([0, 16]).clamp(true);

// data.forEach((timestep, i) => {
//   timestep.forEach((count, j) => {
//     svg.append('rect')
//       .attr('x', (i) * (2 * w + w / 2))
//       .attr('y', j * (2 * h + h / 2))
//       .attr('width', w)
//       .attr('height', h)
//       .attr('opacity', o(count))
//       .attr('stroke', '#777')
//       .attr('stroke-width', 1)
//   })
// })

edges.forEach(({ start, end, value }) => {
  const [ i, j ] = start;
  const [ m, n ] = end;
  if (strokeWidth(value.length) >= 0.25) {
    svg.append('line')
      .attr('x1', (i) * (2 * w) + w)
      .attr('y1', (j) * (2 * h) + h)
      .attr('x2', (m) * (2 * w) + w)
      .attr('y2', (n) * (2 * h) + h)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', strokeWidth(value.length))
      .attr('opacity', lineOpacity(value.length));
  }
})


window.d3 = d3;