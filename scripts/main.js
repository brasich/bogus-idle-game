//buttons
var increment_button = document.getElementById("manual");
var buy_auto_button = document.getElementById("buy_auto");
var buy_turbo_button = document.getElementById("buy_turbo");
var upgrade_auto_button = document.getElementById("upgrade_auto");
var upgrade_turbo_button = document.getElementById("upgrade_turbo");
var upgrade_click_multiple_button = document.getElementById("upgrade_click_multiple");
//text values
var n_widgets_disp = document.getElementById("n_widgets");
var lifetime_widgets_disp = document.getElementById("n_lifetime_widgets");
var n_auto_disp = document.getElementById("n_auto");
var auto_cost_disp = document.getElementById("auto_cost");
var auto_upgrade_cost_disp = document.getElementById("auto_upgrade_cost");
var n_turbo_disp = document.getElementById("n_turbo");
var turbo_cost_disp = document.getElementById("turbo_cost");
var turbo_upgrade_cost_disp = document.getElementById("turbo_upgrade_cost");
var click_multiple_upgrade_cost_disp = document.getElementById("click_multiple_upgrade_cost");
var current_performance_disp = document.getElementById("current_performance");

//prevent double tap zoom
increment_button.ondblclick = function(e) {
  e.preventDefault();
}
buy_auto_button.ondblclick = function(e) {
  e.preventDefault();
}

//display values
var lifetime_widgets = 0;
var n_widgets = 0;
var n_auto = 0;
var auto_cost = 10;
var auto_upgrade_cost = 100000;
var n_turbo = 0;
var turbo_cost = 1000;
var turbo_upgrade_cost = 10000000;
var click_multiple_upgrade_cost = 50000000;
var running_average_performance = 0;

//game state values
var current_performance = 0;
var n_ticks_since_stats_refresh = 0;
var prior_widget_count = 0;
var widget_high_water_mark = 0;
var performance_high_water_mark= 0;
var widget_scale_lim = 1;
var performance_scale_lim = 1;
var AUTO_RATE = 1;
var TURBO_RATE = 100;
var click_performance_multiple = 0;

//game constants
const TICK_LENGTH = 42;
const SEC_PER_TICK = (TICK_LENGTH / 1000);
const PRICE_UP_MULT = 1.2;
const UPGRADE_PRICE_UP_MULT = 2;
const ACHIEVEMENTS = [{
                        score: 10,
                        title: "10 clicks",
                        content: "wow look at you, 10 whole clicks",
                        unlocked: false
                      },{
                        score: 1000,
                        title: "1,000 clicks",
                        content: "keep it going",
                        unlocked: false
                      },{
                        score: 1000000,
                        title: "1,000,000 clicks",
                        content: "who wants to be a millionaire?",
                        unlocked: false
                      },{
                        score: 1000000000,
                        title: "1,000,000,000 clicks",
                        content: "your first billion",
                        unlocked: false
                      },{
                        score: 44000000000,
                        title: "44B clicks",
                        content: "a twitters worth",
                        unlocked: false
                      }]

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
      label: 'clicks',
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
    auto_upgrade_cost = parseInt(auto_upgrade_cost_disp.innerText.replace(/\,/g, ''));
    n_turbo = parseInt(n_turbo_disp.innerText.replace(/\,/g, ''));
    turbo_cost = parseInt(turbo_cost_disp.innerText.replace(/\,/g, ''));
    turbo_upgrade_cost = parseInt(turbo_upgrade_cost_disp.innerText.replace(/\,/g, ''));
    click_multiple_upgrade_cost = parseInt(click_multiple_upgrade_cost_disp.innerText.replace(/\,/g, ''));
};

get_display_state;

function set_display_state() {
    lifetime_widgets_disp.innerText = lifetime_widgets.toLocaleString();
    n_widgets_disp.innerText = n_widgets.toLocaleString();
    n_auto_disp.innerText = n_auto.toLocaleString();
    auto_cost_disp.innerText = auto_cost.toLocaleString();
    auto_upgrade_cost_disp.innerText = auto_upgrade_cost.toLocaleString();
    n_turbo_disp.innerText = n_turbo.toLocaleString();
    turbo_cost_disp.innerText = turbo_cost.toLocaleString();
    turbo_upgrade_cost_disp.innerText = turbo_upgrade_cost.toLocaleString();
    click_multiple_upgrade_cost_disp.innerText = click_multiple_upgrade_cost.toLocaleString();
    current_performance_disp.innerText = running_average_performance.toLocaleString();
};

function manual_increment() {
    get_display_state();
    bonus_clicks = click_performance_multiple * current_performance;
    n_widgets += (1 + bonus_clicks);
    lifetime_widgets += (1 + bonus_clicks);
    set_display_state();
};

function upgrade_manual() {
  get_display_state();
  if (n_widgets >= click_multiple_upgrade_cost) {
    n_widgets -= click_multiple_upgrade_cost;
    click_performance_multiple += 0.1;
    click_multiple_upgrade_cost = Math.ceil(click_multiple_upgrade_cost * UPGRADE_PRICE_UP_MULT);
    set_display_state()
  }
};

upgrade_click_multiple_button.onclick = upgrade_manual;

increment_button.onclick = manual_increment;

function upgrade_auto() {
  get_display_state();
  if (n_widgets >= auto_upgrade_cost) {
    n_widgets -= auto_upgrade_cost;
    AUTO_RATE *= 2
    auto_upgrade_cost = Math.ceil(auto_upgrade_cost * UPGRADE_PRICE_UP_MULT);
    set_display_state()
  }
};

upgrade_auto_button.onclick = upgrade_auto;

function buy_auto() {
    get_display_state();
    if (n_widgets >= auto_cost) {
        n_widgets -= auto_cost;
        n_auto += 1;
        auto_cost = Math.ceil(auto_cost * PRICE_UP_MULT);
        set_display_state();
    } else {

    };
};

buy_auto_button.onclick = buy_auto;

function upgrade_turbo() {
  get_display_state();
  if (n_widgets >= turbo_upgrade_cost) {
    n_widgets -= turbo_upgrade_cost;
    TURBO_RATE *= 2
    turbo_upgrade_cost = Math.floor(turbo_upgrade_cost * UPGRADE_PRICE_UP_MULT);
    set_display_state()
  }
}

upgrade_turbo_button.onclick = upgrade_turbo;

function buy_turbo() {
  get_display_state();
  if (n_widgets >= turbo_cost) {
      n_widgets -= turbo_cost;
      n_turbo += 1;
      turbo_cost = Math.floor(turbo_cost * PRICE_UP_MULT);
      set_display_state();
  } else {

  };
};

buy_turbo_button.onclick = buy_turbo;

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

function unlock_achievement(achievement_idx) {
  const para = document.createElement("p");
  const title = document.createElement("b");
  const title_text = document.createTextNode(ACHIEVEMENTS[achievement_idx].title + ": ");
  title.appendChild(title_text);
  para.appendChild(title);
  const node = document.createTextNode(ACHIEVEMENTS[achievement_idx].content);
  para.appendChild(node);
  document.getElementById("achievements_section").appendChild(para);
  ACHIEVEMENTS[achievement_idx].unlocked = true;
}

function evaluate_tick() {
    get_display_state();
    n_widgets += AUTO_RATE * n_auto + TURBO_RATE * n_turbo;
    lifetime_widgets += AUTO_RATE * n_auto + TURBO_RATE * n_turbo;
    n_ticks_since_stats_refresh += 1;

    let achievement_unlock_idx = ACHIEVEMENTS.findIndex(e => (e.score <= lifetime_widgets) & (e.unlocked === false))
    if (achievement_unlock_idx >= 0) {
      unlock_achievement(achievement_unlock_idx);
    }

    if (n_widgets > widget_high_water_mark) {
        widget_high_water_mark = n_widgets;
        widget_scale_lim = Math.pow(10,Math.ceil(Math.log10(widget_high_water_mark)));
        performanceChart.options.scales.y.max = widget_scale_lim;
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