// set up
const TIME_BAR_SECTIONS = ['timeSect0', 'timeSect1', 'timeSect2', 'timeSect3', 'timeSect4',
                        'timeSect5', 'timeSect6'];

// const variables = [
//   "isInTune",
//   "clean",
//   "playRiff",
//   "playReference",
//   // "targetNote",
//   "autotuneGuitar",
//   "playNotes",
//   "playBeats",
//   // "playScale",
//   "beatDiff",
//   // "tunerVisualization",
//   "guitarState",
//   "currentFrequency",
//   "targetString"
// ]

const STATES =[
  "scrollState",
  "brightnessWeight",
  "showHilbert",
  "algorithm",
  "selectedArtwork",
  "loadStatus",
  "showHilbertDetails"
]

const d3 = require('d3');
const UMAP = require('./umap');
const Bars = require('./bars');

const container = d3.select('body')
                    .append('div')
                    .classed('grid-container', true)

const umap = new UMAP(container, window.location.origin + "/data/dr-tsne.csv");
const time = new Bars(container, TIME_BAR_SECTIONS.map((d, i) => i));
const interactions = new Bars(container, STATES, true);

const handleHighlightVariable = (v) => {
  console.log('hanlde click', v);
  umap.setVariable(v);
}

time.onSelectVar(handleHighlightVariable);
interactions.onSelectVar(handleHighlightVariable);


umap.onUpdate((selection) => {


  // // update charts based on filtered data
  // updateBars(data) {
  //   // extract overall time spent in each section
  //   timeData = extractTimeBars(data);
  //   bars.axisNominal(false);
  //   timeBars.datum(timeData)
  //       .call(bars);
  //   // extract overall number of changes to each state
  //   stateData = extractStateBars(data);
  //   bars.axisNominal(true);
  //   stateBars.datum(stateData)
  //       .call(bars);
  //   return [timeData, stateData];
  // }


  // get formatted data to show sum of time on page in each section
  function median(values){
    if(values.length ===0) return 0;

    values.sort(function(a,b){
      return a-b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
      return values[half];

    return (values[half - 1] + values[half]) / 2.0;
  }

  var sumTimes = {};
  var medianTimes = {};
  var sumChanges = {};
  var medianChanges = {};
  TIME_BAR_SECTIONS.map((key) => {
    medianTimes[key] = median(selection.map(d => +d[key]));
  })
  STATES.map((key) => {
    medianChanges[key] = median(selection.map(d => +d[key]));
  })
  selection.forEach((d, i) => {
    TIME_BAR_SECTIONS.map((key) => {
      sumTimes[key] = sumTimes[key] || 0;
      sumTimes[key] = sumTimes[key] + (+d[key]);
    })
    STATES.map((key) => {
      sumChanges[key] = sumChanges[key] || 0;
      sumChanges[key] = sumChanges[key] + (+d[key]);
    })
  })



  time.setData(TIME_BAR_SECTIONS.map((key, i) => Math.max(0, medianTimes[key] / 1000)), selection.length);
  interactions.setData(STATES.map((key, i) => Math.max(0, medianChanges[key])), selection.length);

})