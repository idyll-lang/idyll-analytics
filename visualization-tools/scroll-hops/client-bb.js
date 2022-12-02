var websocket = require('websocket-stream')
var concat = require('concat-stream')
// var regl = require('regl')();




let regl = require('regl')({extensions: 'angle_instanced_arrays'})


let line2d = require('regl-line2d')(regl)
const d3 = require('d3');

var control = require('control-panel')


let opacity = 1;
let x1 = 0;
let x2 = 0.001;
let y1 = 0;
let y2 = 1;
let bin = 1;
let selected = 0;
let showSelected = false;
let speed = 500;

var panel = control([
  {type: 'range', label: 'opacity', min: 0, max: 1, initial: opacity},
  {type: 'range', label: 'x1', min: 0, max: 0.1, initial: x1},
  {type: 'range', label: 'x2', min: 0.0, max: 0.01, initial: x2},
  {type: 'range', label: 'y1', min: 0, max: 1, initial: y1},
  {type: 'range', label: 'y2', min: 0, max: 1, initial: y2},
  {type: 'range', label: 'bin', min: 1, max: 1000, initial: bin},
  {type: 'range', label: 'speed', min: 1, max: 20000, initial: speed},
  {type: 'checkbox', label: 'showSelected', initial: showSelected}
  // {type: 'range', label: 'selected', min: 0, max: 20000, initial: selected},
],
  {theme: 'light', position: 'bottom-right'}
)

d3.select('body').append('div').style('position', 'fixed').style('top', '10px').style('left', '50vw').text('Time →').style('font-size', '22px').style('background', 'rgba(255, 255, 255, 0.85)');
d3.select('body').append('div').style('position', 'fixed').style('top', '100px').style('right', '-20px').text('Page Position →').style('transform', 'rotate(90deg)').style('font-size', '22px').style('background', 'rgba(255, 255, 255, 0.85)');

// let regl = require('regl')({extensions: 'angle_instanced_arrays'})
// let line2d = require('regl-line2d')(regl)

// Here we call resl and tell it to start preloading resources
require('resl')({
  // A call to resl takes a JSON object as configuration.

  // The configuration object must contain a manifest field which specifies
  // a list of all resources to load and their types.
  manifest: {

    // You can also specify custom parsers for your assets
    'json_data': {
      type: 'text',
      // stream: true,
      src: 'data/beat-basics.json',
      parser: JSON.parse  // Here we call JSON.parse as soon as the asset has
                          // finished loading
    }
  },

  // Once the assets are done loading, then we can use them within our
  // application
  onDone: (assets) => {
    console.log('done')

    // document.body.appendChild(assets.some_video)
    // document.body.appendChild(assets.an_image)

    let maxT = 0;
    let maxD = 0;


    assets.json_data.forEach((visit) => {
      visit.forEach(([t, d]) => {
        if (t > maxT) {
          maxT = t;
        }
        if (d > maxD) {
          maxD = d;
        }
      })
    })

    console.log(maxD, maxT)


    const drawPath = regl({
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1
        },
        equation: {
          rgb: 'add',
          alpha: 'add'
        },
        color: [0, 0, 0, 0]
      },
      depth: {
        enable: false,
      },
      frag: `
      precision mediump float;
      uniform vec3 color;
      uniform float opacity;

      void main () {
        gl_FragColor = vec4(color, opacity);


        vec4(1.0, 1.0, 1.0, 1.0);

      }`,

      vert: `
      precision mediump float;
      attribute vec2 position;
      uniform float x1;
      uniform float x2;
      uniform float y1;
      uniform float y2;
      uniform float bin;


      // float x, adjustedX = 1.0, y, adjustedY = 1.0;

      void main () {
        float x = position[0] / ${maxT.toFixed(1)};
        float adjustedX = (x - x1) / (x2 - x1);

        float y = (floor(position[1] / bin + 0.5) * bin) / ${maxD.toFixed(1)};
        float adjustedY = (y - y1) / (y2 - y1);

        gl_Position = vec4(
          2.0 * (adjustedX - 0.5),
          - 2.0 * (adjustedY - 0.5),
          0, 1);
      }`,

      attributes: {
        position: regl.prop('position')
      },
      uniforms: {
        color: (context, { color, index }) => {
          if (index === selected) {
            return [1.0, 0, 0];
          }
          return color;
        },
        x1: () => x1,
        x2: () => x2,
        y1: () => y1,
        y2: () => y2,
        opacity: (context, { index }) => {
          if (showSelected && index === selected) {
            return 1.0;
          }
          return opacity * opacity * opacity;
        },
        bin: () => bin,
        // selected: (context, { count }) => {
        //   Math.random() < 0.01
        // }
      },
      count: regl.prop('count'),
      primitive: 'line strip',
      lineWidth: (context, { index }) => {
        // regl.prop('lineWidth')
        // if (Math.random() < 0.01) {
        //   return 5;
        // }
        if (showSelected && index === selected) {
          return 7.0;
        }

        return 1;
      }
    })

    // drawPath([0, 1, 2, 3, 4].map((i) => {
    //   return {
    //     count: 2,
    //     position: [[0, 0], [1, 1]],
    //     lineWidth: 1,
    //     color: [0, 0, 0, 1]
    //   }
    // }))

    // const buffer = regl.buffer(data)
    // console.log(buffer);
    // console.log(dataArr.length);
    // console.log(data.byteLength);


    const batch = assets.json_data.map((d, i) => {
      return {
        count: d.length,
        position: regl.buffer(d),
        lineWidth: 1.0,
        color: [0, 0, 0],
        index: i
      }
    });


    panel.on('input', (data) => {
      // if (data.opacity) {
        opacity = data.opacity;
      // }
      // if (data.x1) {
        x1 = data.x1;
      // }
      // if (data.x2) {
        x2 = data.x2;
      // }
      // if (data.y1) {
        y1 = data.y1;
      // }
      // if (data.y2) {
        y2 = data.y2;
      // }
      // if (data.bin) {
        bin = data.bin;
        speed = data.speed;
        showSelected = data.showSelected;
      // }

        regl.clear({
          color: [1.0, 1.0, 1.0, 1.0],
          depth: 1
        })
        drawPath(batch);
    })

    const updateSelected = () => {
      selected = Math.floor(Math.random() * batch.length);
      regl.clear({
        color: [1.0, 1.0, 1.0, 1.0],
        depth: 1
      })
      drawPath(batch);
      setTimeout(updateSelected, speed)
    }

    updateSelected();
    // setInterval(() => {

    // }, 500)

    // regl.frame(({time}) => {
    // })

    regl.clear({
      color: [1.0, 1.0, 1.0, 1.0],
      depth: 1
    })
    drawPath(batch);
    // line2d.render({ thickness: 4, points: [0,0, 1,1, 1,0], close: true, color: 'red' })


  },

  // As assets are preloaded the progress callback gets fired
  onProgress: (progress, message) => {
    document.body.innerHTML =
      '<b>' + (progress * 100) + '% loaded</b>: ' + message
  },

  onError: (err) => {
    console.error(err)
  }
})
