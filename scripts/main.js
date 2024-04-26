//prevent double tap zoom
document.ondblclick = function(e) {
  e.preventDefault();
}

//buttons
var increment_button = document.getElementById("manual");
var buy_auto_button = document.getElementById("buy_auto");
//text values
var n_widgets_disp = document.getElementById("n_widgets");
var n_auto_disp = document.getElementById("n_auto");
var auto_cost_disp = document.getElementById("auto_cost");
var current_performance_disp = document.getElementById("current_performance");

//display values
var n_widgets = 0;
var n_auto = 0;
var auto_cost = 10;
var running_average_performance = 0;

//game state values
var current_performance = 0;
var n_ticks_since_stats_refresh = 0;
var prior_widget_count = 0;
var widget_high_water_mark = 0;
var performance_high_water_mark= 0;
var widget_scale_lim = 1;
var performance_scale_lim = 1;

//game constants
const AUTO_RATE = 1;
const TICK_LENGTH = 50;
const SEC_PER_TICK = (TICK_LENGTH / 1000);
const PRICE_UP_MULT = 1.2;

//graph stats
const xValues = [...Array(300).keys()];
const widgetHist = new Array(300).fill(0);
const performanceHist = new Array(300).fill(0);
const smoothedPerformanceHist = new Array(300).fill(0);
const chartCanvas = document.getElementById('widgetCountChart');
const performanceChart = new Chart(chartCanvas, {
  type: 'line',
  data: {
    labels: xValues,
    datasets: [{
      label: 'widgets',
      data: widgetHist,
      borderWidth: 3,
      fill: false,
      pointRadius: 0,
      yAxisID: "y",
    },
    {
        label: 'performance',
        data: smoothedPerformanceHist,
        borderWidth: 3,
        fill: false,
        pointRadius: 0,
        yAxisID: "y2"
    }]
  },
  options: {
    //animation: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        min: 0,
        grid: {
            drawOnChartArea: false
        },
      }
    }
  }
});

function get_display_state() {
    n_widgets = parseInt(n_widgets_disp.innerText.replace(/\,/g, ''));
    n_auto = parseInt(n_auto_disp.innerText.replace(/\,/g, ''));
    auto_cost = parseInt(auto_cost_disp.innerText.replace(/\,/g, ''));
}

get_display_state;

function set_display_state() {
    n_widgets_disp.innerText = n_widgets.toLocaleString();
    n_auto_disp.innerText = n_auto.toLocaleString();
    auto_cost_disp.innerText = auto_cost.toLocaleString();
    current_performance_disp.innerText = running_average_performance.toLocaleString();
}

function manual_increment() {
    get_display_state();
    n_widgets += 1;
    set_display_state();
};

increment_button.onclick = manual_increment;

function buy_auto() {
    get_display_state();
    if (n_widgets >= auto_cost) {
        n_widgets -= auto_cost;
        n_auto += 1;
        auto_cost = Math.floor(auto_cost * PRICE_UP_MULT);
        set_display_state();
    } else {

    };
};

buy_auto_button.onclick = buy_auto;

function get_avg_last_n(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) { 
        sum += arr[i]
      };
    return sum / arr.length;
}

function evaluate_performance() {
    //calculate current performance
    const gain_since_last_refresh = n_widgets - prior_widget_count;
    const avg_rate_x_100 = 100 * gain_since_last_refresh / SEC_PER_TICK;
    current_performance = Math.round(avg_rate_x_100) / 100;
    //add stats to arrays
    widgetHist.shift();
    widgetHist.push(n_widgets);
    performanceHist.shift();
    performanceHist.push(current_performance);
    //compute rolling avg performance and add to array
    running_average_performance = get_avg_last_n(performanceHist.slice(-20));
    smoothedPerformanceHist.shift();
    smoothedPerformanceHist.push(running_average_performance);
    //update chart and reset
    performanceChart.update('none');
    prior_widget_count = n_widgets;
}

function evaluate_tick() {
    get_display_state();
    n_widgets += AUTO_RATE * n_auto;
    n_ticks_since_stats_refresh += 1;

    if (n_widgets > widget_high_water_mark) {
        widget_high_water_mark = n_widgets;
        widget_scale_lim = Math.pow(10,Math.ceil(Math.log10(widget_high_water_mark)));
        performanceChart.options.scales.y.max = widget_scale_lim
    };
    if (running_average_performance > performance_high_water_mark) {
        performance_high_water_mark = running_average_performance
        performance_scale_lim = Math.pow(10,Math.ceil(Math.log10(performance_high_water_mark)));
        performanceChart.options.scales.y2.max = performance_scale_lim
    }

    evaluate_performance();

    set_display_state();
}

setInterval(function(){ 
    evaluate_tick()  
}, TICK_LENGTH);