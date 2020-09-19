//variables for normal curves
curve1 = {
    mean: 0,
    stdev: 1,
}
curve2 = {
    mean: 2,
    stdev: 1,
}
curveIncrement = 0.5
numStdev = 3

//calcGaus: calculates the y value of a x based on the gausian fucntion
function calcGaus(mean, stdev, x) {
    var part1 = 1 / (stdev * Math.sqrt(2 * Math.PI))
    var part2 = Math.exp(-1 * (Math.pow(x - mean, 2) / (2 * Math.pow(stdev, 2))))
    return (part1 * part2)
}

//createGausDataset: creates a normal curve dataset to be added to the chart
function createGausDataset(mean, stdev, numdev, inc) {
    var dataset = []
    for (i = (numdev * -1); i < (numdev + inc); i += inc) {
        var xy = {}
        x = i * stdev + mean
        y = calcGaus(mean, stdev, x)
        xy = {
            x: x,
            y: y
        }
        dataset.push(xy)
    }
    return dataset
}

function updateNormalCurves(mean1, mean2, stdev) {
    curve1.mean = mean1
    curve1.stdev = stdev
    curve2.mean = mean2
    curve2.stdev = stdev
    var c1 = createGausDataset(mean1, stdev, numStdev, curveIncrement)
    var c2 = createGausDataset(mean2, stdev, numStdev, curveIncrement)

    chart.data.datasets[0].data = c1
    chart.data.datasets[1].data = c2
    chart.update()
}

//createAlpha: creates an alpha dataset to be added to the chart
function createAlpha(mean, stdev, z) {
    var dataset = []
    for (i = numStdev; i > z; i -= curveIncrement) {
        x = i * stdev + mean
        y = calcGaus(mean, stdev, x)
        xy = {
            x: x,
            y: y
        }
        dataset.push(xy)
    }
    dataset.push({
        x: z * stdev + mean,
        y: calcGaus(mean, stdev, z * stdev + mean)
    })
    return dataset
}

//createAlpha: creates a beta dataset to be added to the chart
function createBeta(mean, stdev, z) {
    var dataset = []
    for (i = (numStdev * -1); i < z; i += curveIncrement) {
        x = i * stdev + mean
        y = calcGaus(mean, stdev, x)
        xy = {
            x: x,
            y: y
        }
        dataset.push(xy)
    }
    dataset.push({
        x: z * stdev + mean,
        y: calcGaus(mean, stdev, z * stdev + mean)
    })
    return dataset
}

//createAB: updates the alpha and beta datasets on the chart
function updateAlphaBetaPower(alpha) {
    var z_lookup = {
        0.1: 1.28,
        0.09: 1.34,
        0.08: 1.41,
        0.07: 1.48,
        0.06: 1.55,
        0.05: 1.64,
        0.04: 1.75,
        0.03: 1.88,
        0.02: 2.05,
        0.01: 2.33,
        0: 3
    }

    alphaZ = z_lookup[alpha]
    betaZ = ((alphaZ * curve1.stdev + curve1.mean) - curve2.mean) / curve2.stdev

    alpha = createAlpha(curve1.mean, curve1.stdev, alphaZ)
    beta = createBeta(curve2.mean, curve2.stdev, betaZ)
    power = createAlpha(curve2.mean, curve2.stdev, betaZ)

    chart.data.datasets[2].data = alpha
    chart.data.datasets[3].data = beta
    chart.data.datasets[4].data = power

    chart.update()
}

function getCommonX() {
    x = chart.data.datasets[2].data[len = chart.data.datasets[2].data.length - 1].x
    console.log(x)
    return x
}

//chart canvas
var myChart = document.getElementById('curveChart').getContext('2d');

//chart setup
var chart = new Chart(myChart, {
    type: 'line',
    data: {
        datasets: [
            //curve 1 for null mean
            {
                label: 'Curve 1',
                pointRadius: 3,
                fill: false,
                borderColor: '#ff6384',
                data: createGausDataset(curve1.mean, curve1.stdev, numStdev, curveIncrement)
            },
            //curve 2 for testing mean
            {
                label: 'Curve 2',
                pointRadius: 3,
                fill: false,
                borderColor: '#1BBAC2',
                data: createGausDataset(curve2.mean, curve2.stdev, numStdev, curveIncrement)
            },
            //alpha highlight initial setup
            {
                label: 'alpha',
                borderColor: '#DE5D94',
                backgroundColor: '#DE5D94',
                borderWidth: 4,
                pointRadius: 0,
            },
            //beta highlight initial setup
            {
                label: 'beta',
                borderColor: '#37C7C6',
                backgroundColor: '#37C7C6',
                borderWidth: 4,
                pointRadius: 0,
            },
            //power highlight initial setup
            {
                label: 'power',
                borderColor: '#4f87db',
                backgroundColor: '#4f87db',
                borderWidth: 4,
                pointRadius: 0,
            },
        ],
    },
    options: {
        title: {
            text: 'Alpha, Beta and Power',
            display: false,
        },
        legend: {
            position: 'bottom',
            labels: {
                filter: function (item, chart) {
                    removeList = ['Curve 1', 'Curve 2']
                    if (removeList.includes(item.text)) {
                        return false
                    }
                    return true
                }
            }
        },
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                display: true,
                ticks: {
                    display: true,
                }
            }],
            yAxes: [{
                display: true,
                ticks: {
                    display: false,
                    suggestedMax: 0.45,
                }
            }],
        },
        elements: {
            line: {
                borderWidth: 5.5,
            }
        }
    }
});

//creates the initial alpha and beta highlight
updateAlphaBetaPower(0.1)

//alpha slider and values for beta and power (note put updating beta and alpha numbers in a common function problably the updateAlphaBetaPower function)
var sliderAlpha = document.getElementById("rangeAlpha")
var outputAlpha = document.getElementById("valueAlpha")
var outputBeta = document.getElementById("valueBeta")
var outputPower = document.getElementById("valuePower")
outputAlpha.innerHTML = sliderAlpha.value
outputBeta.innerHTML = jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)
outputPower.innerHTML = 1 - jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)

sliderAlpha.oninput = function () {
    outputAlpha.innerHTML = this.value
    outputBeta.innerHTML = jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)
    outputPower.innerHTML = 1 - jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)
    
    updateAlphaBetaPower(parseFloat(this.value))
}

//sample size slider 
var sliderSampleSize = document.getElementById("rangeSampleSize")
var outputSampleSize = document.getElementById("valueSampleSize")
outputSampleSize.innerHTML = sliderSampleSize.value

sliderSampleSize.oninput = function () {
    outputSampleSize.innerHTML = this.value
    outputBeta.innerHTML = jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)
    outputPower.innerHTML = 1 - jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)

    stdev = Math.sqrt(100 / parseInt(this.value))
    updateNormalCurves(curve1.mean, curve2.mean, stdev)
    updateAlphaBetaPower(sliderAlpha.value)
}

//effect size slider 
var sliderEffectSize = document.getElementById("rangeEffectSize")
var outputEffectSize = document.getElementById("valueEffectSize")
outputEffectSize.innerHTML = sliderEffectSize.value

sliderEffectSize.oninput = function () {
    outputEffectSize.innerHTML = this.value
    outputBeta.innerHTML = jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)
    outputPower.innerHTML = 1 - jStat.ztest(getCommonX(), curve2.mean, curve2.stdev, 1).toFixed(2)

    updateNormalCurves(curve1.mean, parseFloat(this.value), curve1.stdev)
    updateAlphaBetaPower(sliderAlpha.value)
}

