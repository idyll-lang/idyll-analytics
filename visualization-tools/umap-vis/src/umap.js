const d3 = require('d3');
const parser = require('ua-parser-js');

const colorMaxes = {
  brightnessWeight: 100,
  targetString: 100,
  showHilbert: 5,
  algorithm: 3,
  selectedArtwork: 150,
  loadStatus: 3,
  showHilbertDetails: 3
}

const TIME_BAR_SECTIONS = [];

const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function() {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

class UMAP {
  constructor(node, dataUrl) {
    this._handleBrush = this.handleBrush.bind(this);
    this.handleBrush = this._handleBrush;//throttle(this.handleBrush.bind(this), 1);

    this._redraw = this.redraw.bind(this);
    this.redraw = throttle(this.redraw.bind(this), 29);

    window.redraw = this.redraw;

    const container = node
      .append('div')
      .style('grid-column', '1 / span 2')
      .style('grid-row','1 / span 2');

    const chartContainer =
    container
      .append('div')
      .style('width', '100%')
      .style('height', '100%')
      .style('position', 'relative');

    const {width, height} = chartContainer.node().getBoundingClientRect();
    this.width = width;
    this.height = height;

    this.x = d3.scaleLinear().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    this.canvas = chartContainer.append('canvas')
      .style('width', '100%')
      .style('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('bottom', 0)
      .style('right', 0)
      .style('display', 'block').node();

    this.canvas.width = 2 * width;
    this.canvas.height = 2 * height;

    this.svg = chartContainer.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('bottom', 0)
      .style('right', 0)
      .style('display', 'block');


    console.log('fetching: ', dataUrl)
    d3.csv(dataUrl)
      .then(this.initialize.bind(this));
  }

  initialize(data) {
    this.data = this.formatData(data);
    const context = this.canvas.getContext("2d");

    this.countDisplay = this.svg.append('text').attr('x', 20).attr('y', 20).text('Showing ' + this.data.length + ' users.').attr('fill', 'black');
    this.varDisplay = this.svg.append('text').attr('x', 20).attr('y', 35).attr('fill', 'black');

    // TODO - check and only do this on retina screens
    context.scale(2,2);
    this.redraw();
    this.addBrush();
  }

  setVariable(v) {
    this._currentlySelectedVariable = v;
    this._redraw();
    this.updateMeta();
  }

  getFillColor(mobile) {
    // console.log(mobile);
    if (mobile == 1) {
      return  `rgba(76, 170, 99, ${window.hide_mobile ? 0 : 0.1})`;
    }
    return  `rgba(76, 75, 99, ${window.hide_desktop ? 0 : 0.1})`;
  }
  getStrokeColor(mobile) {
    if (mobile == 1) {
      return `rgba(76, 75, 99, ${window.hide_mobile ? 0 : 0.2})`;
    }
    return `rgba(76, 75, 99, ${window.hide_desktop ? 0 : 0.2})`;
  }

  redraw() {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.width * 2, this.height * 2);
    context.lineWidth = 0.5;


    this.data.forEach(({ x, y, userAgent, mobile, _i }, i) => {

      if (this._currentlySelectedVariable) {
        let val = this.data[i][this._currentlySelectedVariable];
        if (colorMaxes[this._currentlySelectedVariable]) {
          val = val / colorMaxes[this._currentlySelectedVariable];
        } else {
          val = val / 5000;
        }
        val = Math.max(0, Math.min(1, val));
        context.fillStyle = `rgba(97,34,251, ${val})`;

        if (this.currentlySelected[_i]) {
          context.strokeStyle = `rgba(97,34,251, ${0.7})`;
        } else {
          context.strokeStyle = `rgba(97,34,251, ${0.3})`;
        }
      } else {
        if (this.currentlySelected[_i]) {
          context.fillStyle = `rgba(97,34,251, ${0.6})`;
          context.strokeStyle = `rgba(97,34,251, ${0.7})`;
        } else {
          context.fillStyle = this.getFillColor(mobile);// `rgba(76, 75, 99, ${0.1})`;
          context.strokeStyle = this.getStrokeColor(mobile)
        }
      }
      // if (!mobile) {
      //   console.log(x, y);
      // }
      context.beginPath();
      context.arc(this.x(x), this.y(y), 3, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.stroke();
    });
  }

  formatData(data) {
    // read as strings, change to floats
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;

    // data.sort((a, b) => {
    //   return Math.sign(Math.random() - 0.5);
    // });


    data.reverse();

    data.forEach((d, i) => {
      d.x = +d.x;
      d.y = +d.y;
      d._i = i;
      if (d.x > maxX) {
        maxX = d.x;
      }
      if (d.y > maxY) {
        maxY = d.y;
      }
      if (d.x < minX) {
        minX = d.x;
      }
      if (d.y < minY) {
        minY = d.y;
      }
    });

    this.x.domain([minX - 1, maxX + 1]);
    this.y.domain([minY - 1, maxY + 1]);

    this.currentlySelected = [...data.map(d => false)];
    return data;
  }

  handleBrush(coords, event) {

    if (event === null || !coords || coords[0][0] === coords[1][0]) {
      this.currentlySelected = this.currentlySelected.map(d => false);
      this._redraw();
      this._onUpdate(this.data);
      return;
    }

    const _x0 = this.x.invert(coords[0][0]);
    const _y1 = this.y.invert(coords[0][1]);
    const _x1 = this.x.invert(coords[1][0]);
    const _y0 = this.y.invert(coords[1][1]);

    const selected = this.data.filter((d) => {
      const selected = _x0 < d.x && _x1 > d.x && d.y > _y0 && d.y < _y1;
      this.currentlySelected[d._i] = selected;
      return selected;
    })

    this.redraw();

    // const filteredData = this.data.filter((d) => this.currentlySelected[d._i]);
    this._onUpdate(selected);
    this._selected = selected;
    this.updateMeta();
  }

  onUpdate(cb) {
    this._onUpdate = cb;
  }

  updateMeta() {
    this.countDisplay.text('Showing ' + this._selected.length + ' users.');
    if (this._currentlySelectedVariable) {
      this.varDisplay.text('Showing relative usage of ' + this._currentlySelectedVariable);
    } else {
      this.varDisplay.text('');
    }
  }

  // add brushing behavior, which overrides other mouse and click behaviors
  addBrush() {
    const self = this;
    const brush = d3.brush()
      // .extent([[xScale.domain()[0], yScale.domain()[0]], [xScale.domain()[1], yScale.domain()[1]]])
      .on("brush end", function () {
        // .on("end", function () {
          self._handleBrush(d3.brushSelection(this), d3.event.selection);
        })
      .on("brush", function () {
      // .on("end", function () {
        self.handleBrush(d3.brushSelection(this));
      })

    this.svg.call(brush).attr('class','brush');
  }



}

module.exports = UMAP;