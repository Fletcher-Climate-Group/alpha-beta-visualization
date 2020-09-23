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
                pointRadius: 0,
                fill: false,
                borderColor: '#ff6384',
                data: createGausDataset(curve1.mean, curve1.stdev, numStdev, curveIncrement)
            },
            //curve 2 for testing mean
            {
                label: 'Curve 2',
                pointRadius: 0,
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
                    //suggestedMin: -6,
                    //suggestedMax: 6,
                }
            }],
            yAxes: [{
                display: true,
                ticks: {
                    display: true,
                    suggestedMax: 0.45,
                }
            }],
        },
        elements: {
            line: {
                borderWidth: 5.5,
            }
        },
        animation: {
            duration: 300
        },
    }
});

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
        y = jStat.normal.pdf(x, mean, stdev)
        xy = {
            x: x,
            y: y
        }
        dataset.push(xy)
    }
    return dataset
}

//updateNormalCurves updates the normal curves in the chart mean and/or stdev changes
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

//createRight: creates a right hand tail dataset
function createRight(z, mean, stdev, numdev, inc) {
    var dataset = []
    for (i = numdev; i > z; i -= inc) {
        x = i * stdev + mean
        y = jStat.normal.pdf(x, mean, stdev)
        xy = {
            x: x,
            y: y
        }
        dataset.push(xy)
    }
    dataset.push({
        x: z * stdev + mean,
        y: jStat.normal.pdf(z * stdev + mean, mean, stdev)
    })
    return dataset
}

//createLeft: creates a left hand tail dataset
function createLeft(z, mean, stdev, numdev, inc) {
    var dataset = []
    for (i = (numdev * -1); i < z; i += inc) {
        x = i * stdev + mean
        y = jStat.normal.pdf(x, mean, stdev)
        xy = {
            x: x,
            y: y
        }
        dataset.push(xy)
    }
    dataset.push({
        x: z * stdev + mean,
        y: jStat.normal.pdf(z * stdev + mean, mean, stdev)
    })
    return dataset
}

//createAB: updates the alpha and beta datasets on the chart based on a new alpha for curve 1
function updateAlphaBetaPower(alpha) {
    alphaZ = (jStat.normal.inv(alpha, curve1.mean, curve1.stdev)*-1 - curve1.mean)/curve1.stdev
    betaZ = ((alphaZ * curve1.stdev + curve1.mean) - curve2.mean) / curve2.stdev

    alpha = createRight(alphaZ, curve1.mean, curve1.stdev, numStdev, curveIncrement)
    beta = createLeft(betaZ, curve2.mean, curve2.stdev, numStdev, curveIncrement)
    power = createRight(betaZ, curve2.mean, curve2.stdev, numStdev, curveIncrement)

    chart.data.datasets[2].data = alpha
    chart.data.datasets[3].data = beta
    chart.data.datasets[4].data = power

    chart.update()
}

//displayAlphaBetaPower updates the alpha, beta, and power numbers displayed
function displayAlphaBetaPower() {
    dAlpha = document.getElementById("displayAlpha")
    dBeta = document.getElementById("displayBeta")
    dPower = document.getElementById("displayPower")

    commonX = chart.data.datasets[2].data[len = chart.data.datasets[2].data.length - 1].x

    alpha = jStat.ztest(commonX, curve1.mean, curve1.stdev, 1).toFixed(2)
    beta = jStat.ztest(commonX, curve2.mean, curve2.stdev, 1).toFixed(2)
    power = (1 - beta).toFixed(2)

    dAlpha.innerHTML = alpha

    if (commonX <= curve2.mean) {
        dBeta.innerHTML = beta
        dPower.innerHTML = power
    } else {
        dBeta.innerHTML = power
        dPower.innerHTML = beta
    }
}

//create the initial alpha, beta, and power highlights and displays their initial values
updateAlphaBetaPower(0.1)
displayAlphaBetaPower()

//initial setup for alpha slider
var sliderAlpha = document.getElementById("rangeAlpha")
var outputAlpha = document.getElementById("valueAlpha")
outputAlpha.innerHTML = sliderAlpha.value

//alpha slider function: updates alpha, beta, and power based on the slider value
sliderAlpha.oninput = function () {
    outputAlpha.innerHTML = this.value

    updateAlphaBetaPower(parseFloat(this.value))
    displayAlphaBetaPower()
}

//initial setup for sample size slider 
var sliderSampleSize = document.getElementById("rangeSampleSize")
var outputSampleSize = document.getElementById("valueSampleSize")
outputSampleSize.innerHTML = sliderSampleSize.value

//sample size slider function: updates the normal curves, alpha, beta, and power based on the sample size from the slider
sliderSampleSize.oninput = function () {
    outputSampleSize.innerHTML = this.value

    stdev = Math.sqrt(100 / parseInt(this.value))
    updateNormalCurves(curve1.mean, curve2.mean, stdev)

    updateAlphaBetaPower(sliderAlpha.value)
    displayAlphaBetaPower()
}

//initial setup for effect size slider 
var sliderEffectSize = document.getElementById("rangeEffectSize")
var outputEffectSize = document.getElementById("valueEffectSize")
outputEffectSize.innerHTML = sliderEffectSize.value

//effect size slider function: updates the normal curves, alpha, beta, and power based on the effect size from the slider
sliderEffectSize.oninput = function () {
    outputEffectSize.innerHTML = this.value

    updateNormalCurves(curve1.mean, parseFloat(this.value), curve1.stdev)

    updateAlphaBetaPower(sliderAlpha.value)
    displayAlphaBetaPower()
}