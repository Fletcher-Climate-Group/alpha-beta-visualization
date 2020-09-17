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
function createAB(commonX) {
    alphaZ = (commonX - curve1.mean) / curve1.stdev
    betaZ = (commonX - curve2.mean) / curve2.stdev
    alpha = createAlpha(curve1.mean, curve1.stdev, alphaZ)
    beta = createBeta(curve2.mean, curve2.stdev, betaZ)

    chart.data.datasets[2].data = alpha
    chart.data.datasets[3].data = beta

    chart.update()
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
        ],
    },
    options: {
        title: {
            text: 'Alpha and Beta',
            display: false,

        },
        legend: {
            position: 'bottom'
        },
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                display: true,
                ticks: {
                    display: false,
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
createAB(curve1.mean + curve1.stdev * 1.65)

//variables and function for slider 
var slider = document.getElementById("alphaRange")
var output = document.getElementById("alphaValue")
output.innerHTML = slider.value

slider.oninput = function () {
    output.innerHTML = this.value

    endPoint = curve1.mean + curve1.stdev * numStdev
    startPoint = curve1.mean + curve1.stdev * 1.65

    createAB(endPoint - (this.value / 100) * (endPoint - startPoint))
}