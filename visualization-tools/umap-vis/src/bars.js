
const d3 = require('d3');

let index = 0;

class Time {
  constructor(node, SECTIONS, switchLabels) {
    this.switchLabels = switchLabels;

    const container = node
      .append('div')
      .style('grid-column', '3 / span 1')
      .style('grid-row',`${++index} / span 1`)


    const tmp = container
      .append('div')
      .style('width', '100%')
      .style('height', '100%')

    const {width, height} = container.node().getBoundingClientRect();
    this.width = width;
    this.height = height;

    // // this.x = d3.scaleLinear().range([0, width]);
    this.y = d3.scaleLinear().domain([0, 1]).range([height - 30, 0]);


    tmp.remove();

    this.svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block');


    this.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', height - 30)
      .attr('width', width)
      .attr('fill', '#f0f0f0')

    this.x = d3.scaleBand().domain(d3.range(SECTIONS.length)).range([0, width]).padding(0.2);

    this.rects = [];
    SECTIONS.map((key, i) => {
      this.rects.push(this.svg.append('rect')
        .attr('x', this.x(i))
        .attr('y', this.y(0))
        .style('fill', 'rgba(76, 75, 99)')
        .attr('width', this.x.bandwidth())
        .attr('height', 0)
        .on('click', () => {
          this._onSelectVar(key);
        }));

      this.svg.append('text')
        .attr('y', (!switchLabels || i % 2 === 0) ? height - 20 : height - 10)
        .attr('x', this.x(i) + this.x.bandwidth() / 2)
        .attr('width', this.x.bandwidth())
        .attr('text-anchor', 'middle')
        .attr('font-size', 8)
        .text(key)
    })
  }

  onSelectVar(cb) {
    this._onSelectVar = (_var) => {
      if (!this.switchLabels) {
        _var = 'timeSect' + _var;
      }
      if (this._var === _var) {
        this._var = null;
        cb(null);
      } else {
        this._var = _var;
        cb(_var)
      }
    };
  }

  setData(data, n) {

    const max = d3.max(data);
    this.y = this.y.domain([0, 1.2 * max]);

    this.svg.selectAll('text.value').remove();



    // this.svg.append('text')
    //   .attr('y', 40)
    //   .attr('x', width - 20)
    //   .attr('font-size', 48)
    //   .attr('text-anchor', 'end')
    //   .attr('fill', '#ddd')
    //   .classed('value', true)
    //   .text(n);

    data.forEach((d, i) => {
      const val = d;
      const highlighted = d === max;

      this.rects[i]
      .style('fill', highlighted ? '#E7E3D0' : 'rgba(76, 75, 99)')
      .style('stroke', highlighted ? 'rgba(76, 75, 99)' : 'none')
      .style('stroke-width', highlighted ? 2 : 0)
      .attr('y', this.y(val))
      .attr('height', this.y(0) - this.y(val));

      this.svg.append('text')
        .attr('y', this.y(val) - 14)
        .attr('x', this.x(i) + this.x.bandwidth() / 2)
        .attr('width', this.x.bandwidth())
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .classed('value', true)
        .text(val.toFixed(1));
    })
  }


}

module.exports = Time;