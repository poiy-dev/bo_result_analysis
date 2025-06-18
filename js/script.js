let fileInput = document.getElementById('input_csv');
let fileMessage = document.getElementById('file_message');
let summaryArea = document.getElementById('summary_area');
let fileReader = new FileReader();
let csvItems = [];
let chart1 = null;
let chart2 = null;
let chart3 = null;
let chart4 = null;
let chart5 = null;

fileInput.onchange = () => {
    fileMessage.innerHTML = MESSAGE_READING_FILE

    let file = fileInput.files[0];
    setTimeout(fileReader.readAsText(file, "Shift_JIS"), 500);
};

fileReader.onload = () => {
    csvItems = readCsv();
    if (csvItems.length == 0) {
        onError();
        return;
    }
    enableChartArea();
    drawChart('all');
}

fileReader.onerror = () => {
    onError();
}

function radioChange(fundStr) {
    drawChart(fundStr);
}

function drawChart(fundStr) {
    let items = radioItems(fundStr);
    if (items.length == 0) {
        onError();
        return;
    }

    // destory chart
    safeDestroyChart(chart1);
    safeDestroyChart(chart2);
    safeDestroyChart(chart3);
    safeDestroyChart(chart4);
    safeDestroyChart(chart5);

    // create chart data
    let chartConfig1 = createDataset1(items);
    let chartConfig2 = createDataset2(items);
    let chartConfig3 = createDataset3(items);
    let chartConfig4 = createDataset4(items);
    let chartConfig5 = createDataset5(items);

    // create summary data
    createSummary(items);

    // draw chart
    chart1 = new Chart(document.getElementById('chart-1'), chartConfig1);
    chart2 = new Chart(document.getElementById('chart-2'), chartConfig2);
    chart3 = new Chart(document.getElementById('chart-3'), chartConfig3);
    chart4 = new Chart(document.getElementById('chart-4'), chartConfig4);
    chart5 = new Chart(document.getElementById('chart-5'), chartConfig5);
}

function onError() {
    fileMessage.innerHTML = MESSAGE_ERROR_CSV;
    fileMessage.style.color = 'red';
    disableChartArea();
    safeDestroyChart(chart1);
    safeDestroyChart(chart2);
    safeDestroyChart(chart3);
    safeDestroyChart(chart4);
    safeDestroyChart(chart5);
}

function safeDestroyChart(taregetChart) {
    if (taregetChart) {
        taregetChart.destroy();
    }
}

function readCsv() {
    let items = [];

    // ファイル読み込み
    let fileResult = fileReader.result.split('\r\n');

    // 先頭行をヘッダとして格納
    let header = fileResult[0].split(',')
    // 先頭行の削除
    fileResult.shift();

    // CSVから情報を取得
    items = fileResult.map(item => {
        let datas = item.split(',');
        let result = {};
        for (const index in datas) {
            let key = header[index].replace(/\"/g, "");
            result[key] = datas[index].replace(/\"/g, "");
        }
        return result;
    });
    return items;
}

function radioItems(fundStr) {
    if (fundStr == 'all') {
        return csvItems;
    }
    let tempItems = new Array();
    for (const item of csvItems) {
        if (item[CSV_HEAD_FUND] != fundStr) {
            continue;
        }
        tempItems.push(item);
    }
    return tempItems;
}

function fetchProfit(orderKey, items) {
    let profitAll = 0;
    for (const item of items) {
        if (item[CSV_HEAD_TARGET_ORDER_KEY] != orderKey) {
            continue
        }
        profitAll += Number(item[CSV_HEAD_FIXED_PROFIT]);
    }
    return profitAll;
}

function createOptions(titleStr) {
    let options = {};
    options['responsive'] = true;
    options['maintainAspectRatio'] = false;

    let y = {'beginAtZero': true};
    let scales = {'y': y};
    options['scales'] = scales;
    
    let title = {'display': true};
    title['text'] = titleStr;
    let plugins = {'title': title};
    options['plugins'] = plugins;
    
    return options;
}

function subMinutes(timeStr1, timeStr2) {
    let date1 = new Date(timeStr1);
    let date2 = new Date(timeStr2);

    let diff = date1.getTime() - date2.getTime();
    return Math.trunc(diff / 60000); // msec -> minutes
}

function getDueHour(timeStr1) {
    let date1 = new Date(timeStr1);
    return date1.getHours();
}

function calcCircle(circleList) {
    let circle = {"x": 0, "y": 0, "r": 0, "profit": 0}
    if (circleList.length == 0) {
        return circle;
    }
    for (const item of circleList) {
        circle["x"] += item["x"];
        circle["y"] += item["y"];
        circle["profit"] += item["profit"];
        circle["dueDate"] = item["dueDate"];
    }
    circle["x"] = Math.trunc(circle["x"] / circleList.length)
    circle["y"] = Math.trunc(circle["y"] / circleList.length)
    circle["profit"] = Math.trunc(circle["profit"] / circleList.length)
    return circle;
}

function calcLinear(valueMax, targetValue) {
    if (valueMax == 0) {
        return 0.0;
    }
    let ratio = Math.abs(targetValue) / valueMax;
    return CIRCLE_RADIUS_MIN + (CIRCLE_RADIUS_MAX - CIRCLE_RADIUS_MIN) * ratio;
}

function createDataset1(items) {
    let valArr = new Array(CHART1_LABEL_VAL.length).fill(0);
    let valAll = 0
    for (const item of items) {
        if (item[CSV_HEAD_TRADE_TYPE] != TRADE_TYPE_BUY) {
            continue;
        }
        for (let i = 0; i < CHART1_LABEL_VAL.length; ++i) {
            if (item[CSV_HEAD_CONTRACT_PRICE] > CHART1_LABEL_VAL[i]) {
                continue;
            }
            let profit = fetchProfit(item[CSV_HEAD_ORDER_KEY], items);
            valArr[i] += profit;
            valAll += profit;
            break;
        }
    }

    // create chart data 
    let chartConfig = {
        'type': 'bar',
        'data': {
            'labels': CHART1_LABEL,
            'datasets': [
                {
                    'label': '損益合計',
                    'data': valArr,
                    'borderWidth': 1,
                    'borderColor': 'rgb(255, 159, 64)',
                    'backgroundColor': 'rgba(255, 159, 64, 0.2)'
                }
            ]
        },
        'options': {
            'responsive': true,
            'maintainAspectRatio': false,
            'scales': {
                'y': { 
                    'beginAtZero': true,
                    'title': {
                        'display': true,
                        'text': '損益合計[円]' 
                    }
                },
                'x': { 
                    'title': {
                        'display': true,
                        'text': 'オプション価格[円]' 
                    } 
                }
            },
            'plugins': {
                'title': {
                    'display': true,
                    'text': TITLE_CONTRACT_PRICE
                }
            }
        }
    };
    return chartConfig;
}

function createDataset2(items) {
    let valArr = new Array(CHART2_LABEL_VAL.length).fill(0);
    for (const item of items) {
        if (item[CSV_HEAD_TRADE_TYPE] != TRADE_TYPE_BUY) {
            continue;
        }
        let remainMinutes = subMinutes(item[CSV_HEAD_DUE_TIME], item[CSV_HEAD_CONTRACT_TIME]);
        for (let i = 0; i < CHART2_LABEL_VAL.length; ++i) {
            if (remainMinutes > CHART2_LABEL_VAL[i]) {
                continue;
            }
            let profit = fetchProfit(item[CSV_HEAD_ORDER_KEY], items);
            valArr[i] += profit;
            break;
        }
    }

    // create chart data
    let chartConfig = {
        'type': 'bar',
        'data': {
            'labels': CHART2_LABEL,
            'datasets': [
                {
                    'label': '損益合計',
                    'data': valArr,
                    'borderWidth': 1,
                    'borderColor': 'rgb(54, 162, 235)',
                    'backgroundColor': 'rgba(54, 162, 235, 0.2)'
                }
            ]
        },
        'options': {
            'responsive': true,
            'maintainAspectRatio': false,
            'scales': {
                'y': { 
                    'beginAtZero': true,
                    'title': {
                        'display': true,
                        'text': '損益合計[円]' 
                    }
                },
                'x': { 
                    'title': {
                        'display': true,
                        'text': '残り時間[分]' 
                    } 
                }
            },
            'plugins': {
                'title': {
                    'display': true,
                    'text': TITLE_CONTRACT_TIME
                }
            }
        }
    };
    return chartConfig;
}

function createDataset3(items) {
    let valArr = new Array(CHART3_LABEL_VAL.length).fill(0);
    for (const item of items) {
        if (item[CSV_HEAD_TRADE_TYPE] != TRADE_TYPE_BUY) {
            continue;
        }
        let dueHour = getDueHour(item[CSV_HEAD_DUE_TIME]);
        for (let i = 0; i < CHART3_LABEL_VAL.length; ++i) {
            if (dueHour != CHART3_LABEL_VAL[i]) {
                continue;
            }
            let profit = fetchProfit(item[CSV_HEAD_ORDER_KEY], items);
            valArr[i] += profit;
            break;
        }
    }

    // create chart data
    let chartConfig = {
        'type': 'bar',
        'data': {
            'labels': CHART3_LABEL,
            'datasets': [
                {
                    'label': '損益合計',
                    'data': valArr,
                    'borderWidth': 1,
                    'borderColor': 'rgb(255, 205, 86)',
                    'backgroundColor': 'rgba(255, 205, 86, 0.2)'
                }
            ]
        },
        'options': {
            'responsive': true,
            'maintainAspectRatio': false,
            'scales': {
                'y': { 
                    'beginAtZero': true,
                    'title': {
                        'display': true,
                        'text': '損益合計[円]' 
                    }
                },
                'x': { 
                    'title': {
                        'display': true,
                        'text': '満期時間' 
                    } 
                }
            },
            'plugins': {
                'title': {
                    'display': true,
                    'text': TITLE_DUE_TIME
                }
            }
        }
    };
    return chartConfig;
}


function createDataset4(items) {
    let profitArr = new Array();
    let lossArr = new Array();
    let allArr = new Array();

    let tempItems = items;
    tempItems.sort((a, b) => a[CSV_HEAD_DUE_TIME] - b[CSV_HEAD_DUE_TIME]);

    let tempDueTime = tempItems[0][CSV_HEAD_DUE_TIME];
    let tempCircleList = new Array();
    let maxValue = 0;
    for (const item of tempItems) {
        if (item[CSV_HEAD_TRADE_TYPE] != TRADE_TYPE_BUY) {
            continue;
        }
        // if (tempDueTime != item[CSV_HEAD_DUE_TIME]) {
        //     let circle = calcCircle(tempCircleList);
        //     allArr.push(circle);
        //     tempCircleList.splice(0);
        //     if (maxValue < Math.abs(circle["profit"])) {
        //         maxValue = Math.abs(circle["profit"]);
        //     }
        // }

        let x = subMinutes(item[CSV_HEAD_DUE_TIME], item[CSV_HEAD_CONTRACT_TIME]);
        let y = item[CSV_HEAD_CONTRACT_PRICE];
        let profit = fetchProfit(item[CSV_HEAD_ORDER_KEY], items);
        let dueDate = item[CSV_HEAD_DUE_TIME].substring(0, 13);
        // tempCircleList.push({"x": x, "y": y, "r": 0, "profit": profit, "dueDate": dueDate});
        allArr.push({"x": x, "y": y, "r": 0, "profit": profit, "dueDate": dueDate});
        if (maxValue < Math.abs(profit)) {
            maxValue = Math.abs(profit);
        }
    }

    for (let item of allArr) {
        item["r"] = calcLinear(maxValue, item["profit"]);
        if (item["profit"] >= 0) {
            profitArr.push(item);
        } else {
            lossArr.push(item);
        }
    }

    // create chart data
    let chartConfig = {
        'type': 'bubble',
        'data': {
            'datasets': [
                {
                    'label': '利益ポジション',
                    'data': profitArr,
                    'borderWidth': 1,
                    'borderColor': 'rgb(75, 192, 192)',
                    'backgroundColor': 'rgba(75, 192, 192, 0.2)'
                },
                {
                    'label': '損失ポジション',
                    'data': lossArr,
                    'borderWidth': 1,
                    'borderColor': 'rgb(255, 99, 132)',
                    'backgroundColor': 'rgba(255, 99, 132, 0.2)'
                }
            ]
        },
        'options': {
            'responsive': true,
            'maintainAspectRatio': false,
            'scales': {
                'y': { 
                    'beginAtZero': true,
                    'title': {
                        'display': true,
                        'text': 'オプション価格' 
                    }
                },
                'x': { 
                    'beginAtZero': true,
                    'title': {
                        'display': true,
                        'text': '残り時間[分]' 
                    } 
                }
            },
            'plugins': {
                'title': {
                    'display': true,
                    'text': TITLE_RELATION_TIME_PRICE
                },
                'tooltip': {
                    'yAlign': 'bottom',
                    'callbacks': {
                        'label': function(context) {
                            const item = context.raw;
                            return item.dueDate + '時満期, 平均価格: ' + item.y + '円, 残り時間: ' + item.x + '分, 損益: ' + item.profit + '円';
                        }
                    }
                }
            },
            
        }
    };
    return chartConfig;
}

function createDataset5(items) {
    let valArr = new Array(CHART5_LABEL.length).fill(0);
    for (const item of items) {
        if (item[CSV_HEAD_TRADE_TYPE] != TRADE_TYPE_BUY) {
            continue;
        }
        for (let i = 0; i < CHART5_LABEL.length; ++i) {
            if (item[CSV_HEAD_FUND] != CHART5_LABEL[i]) {
                continue;
            }
            let profit = fetchProfit(item[CSV_HEAD_ORDER_KEY], items);
            valArr[i] += profit;
            break;
        }
    }

    // create chart data
    let chartConfig = {
        'type': 'bar',
        'data': {
            'labels': CHART5_LABEL,
            'datasets': [
                {
                    'label': '損益合計',
                    'data': valArr,
                    'borderWidth': 1,
                    'borderColor': 'rgb(34, 139, 34)',
                    'backgroundColor': 'rgba(204, 255, 204, 0.4)'
                }
            ]
        },
        'options': {
            'responsive': true,
            'maintainAspectRatio': false,
            'scales': {
                'y': { 
                    'beginAtZero': true,
                    'title': {
                        'display': true,
                        'text': '損益合計[円]' 
                    }
                },
                'x': { 
                    'title': {
                        'display': true,
                        'text': '通貨' 
                    } 
                }
            },
            'plugins': {
                'title': {
                    'display': true,
                    'text': TITLE_FUND
                }
            }
        }
    };
    return chartConfig;
}

function createSummary(items) {
    let buyNum = 0;
    let sellNum = 0;
    let hitNum = 0;
    let outNum = 0;
    let profitAll = 0;
    let profitUnitAll = 0.0;

    for (const item of items) {
        switch (item[CSV_HEAD_TRADE_TYPE]) {
            case TRADE_TYPE_BUY:
                buyNum++;
                break;
            case TRADE_TYPE_SELL:
                sellNum++;
                continue;
            case TRADE_TYPE_DUE_HIT:
                hitNum++;
                continue;
            case TRADE_TYPE_DUE_OUT:
                outNum++;
                continue;
            default:
                continue;
        }
        let profit = fetchProfit(item[CSV_HEAD_ORDER_KEY], items);
        profitAll += profit;
        profitUnitAll += profit / Number(item[CSV_HEAD_CONTRACT_NUM]);
    }

    document.getElementById("table_profit").textContent = profitAll;
    document.getElementById("table_buy_count").textContent = buyNum;
    document.getElementById("table_sell_count").textContent = sellNum;
    document.getElementById("table_full_hit").textContent = hitNum;
    document.getElementById("table_full_out").textContent = outNum;
    document.getElementById("table_profit_unit").textContent = profitUnitAll;
    document.getElementById("table_profit_expect").textContent = Math.round(profitUnitAll / buyNum);
}

function enableChartArea() {
    fileMessage.style.display = "none";
    summaryArea.style.display = "block";
}

function disableChartArea() {
    fileMessage.style.display = "block";
    summaryArea.style.display = "none";
}

window.onload = function () {
    fileMessage.innerHTML = MESSAGE_CHOOSE_FILE;
    disableChartArea();
}