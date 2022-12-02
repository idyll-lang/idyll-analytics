const fs = require('fs');
const d3 = require('d3');

const data = require('./data/cleaned.json');
// // console.log(data);
// console.log(data.slice(0, 2));


let maxT = 3 * 60 * 1000;
let maxD = 0;

const tBins = 25;
const dBins = 12;

data.forEach((visit, i) => {
  visit._id = i;
  visit.forEach(([t, d]) => {
    // if (t > maxT) {
    //   maxT = t;
    // }
    if (d > maxD) {
      maxD = d;
    }
  })
})

maxD /= 4;


const sets = {};
d3.range(0, maxT, maxT / tBins).map((t, i) => {
  sets[i] = [];
  d3.range(0, 800 * 13, 800).map((d, j) => {
    sets[i][j] = new Set();
  })
})

data.forEach((visit, visitNum) => {
  visit._bins = {};
  if (visitNum % 1000 === 0) {
    console.log(visitNum, data.length);
  }
  d3.range(0, maxT, maxT / tBins).map((t, i) => {
    // console.log(`${Math.round(t).toFixed(0)} / ${maxT}`);
    visit._bins[i] = {};
    // let found = false;
    d3.range(0, 800 * 13, 800).map((d, j) => {
      visit._bins[i][j] = false;
      // if (found) {
      //   return;
      // }
      let index = 0;
      // // visit._bins[t] = {};

      // console.log(`${d} / ${maxD}`);
      while(index < visit.length && visit[index][0] < t) {
        index++;
      }


      if (index < visit.length) {
        if (index > 0) {
          if (visit[index - 1][1] > d && visit[index - 1][1] < (d + 800)) {
            visit._bins[i][j] = true;
            sets[i][j].add(visitNum);
            // found = true;
          }
        }
      }


      // const included = data.filter((visit) => {
      //   return isInSet(visit, t, d, maxD / dBins);
      // }).map((visit) => visit._id);
      // sets[t][d] = new Set(included);
    })
  });
})

let output = [];
d3.range(0, maxT, maxT / tBins).map((t, i) => {
  output[i] = [];
  d3.range(0, 800 * 13, 800).map((d, j) => {
    output[i][j] = data.filter((visit) => visit._bins[i][j]).length;
  })
})


let edges = [];
d3.range(0, maxT, maxT / tBins).map((t, i) => {
  d3.range(0, maxD, 800 * 13, 800).map((d, j) => {

    d3.range(t + maxT / tBins, maxT, maxT / tBins).map((_t, m) => {
      d3.range(d + 800, 800 * 13, 800).map((_d, n) => {
        edges.push({
          start: [i, j],
          end: [m, n],
          value: [...sets[i][j]].filter(x => sets[m][n].has(x))
        })
      })
    })
  })
})


fs.writeFileSync('sets.json', JSON.stringify(output));
fs.writeFileSync('edges.json', JSON.stringify(edges));
// console.log(sets);
