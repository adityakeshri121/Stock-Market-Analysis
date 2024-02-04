
const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];
let allStockData = null;
let currCompany = 'AAPL';
let currTimeline = '1mo';
let timeStamps = ['1 Month', '3 Months', '1 Year', '5 Years'];
let stocksData = null;
let summaryData = null;
let currBookValue = null;
let currProfit = null;


window.addEventListener('load', () => {
    fetchAllStockData();
});


function createLineChart(displayData, timeStamp) {
    const ctx = document.getElementById('my-chart').getContext('2d');
    const dateTime = timeStamp.map(time => new Date(time * 1000).toLocaleDateString());
    console.log(dateTime);
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateTime,
            datasets: [{
                label: 'Stock Price',
                data: displayData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
    });
}

function updateCompany(chart, newData, currTimeline) {


    currCompany = newData;
    currBookValue = stocksData[currCompany].bookValue
    currProfit = stocksData[currCompany].profit;
    console.log(newData, currTimeline);
    const formatDate = allStockData.stocksData[0][currCompany][currTimeline].timeStamp;
    const dateTime = formatDate.map(time => new Date(time * 1000).toLocaleDateString());
    const currValue = allStockData.stocksData[0][newData][currTimeline].value
    chart.data.labels = dateTime;
    chart.data.datasets[0].data = currValue;

    findMinMax(currValue)
    chart.update();
    updateSummary(currCompany);
}


function updateTimeLine(chart, timeLine, currCompany) {

    if (timeLine === '3 Months') {
        currTimeline = '3mo';
    }
    else if (timeLine === '1 Year') {
        currTimeline = '1y';
    }
    else if (timeLine === '5 Years') {
        currTimeline = '5y';
    }
    else {
        currTimeline = '1mo';
    }

    const formatDate = allStockData.stocksData[0][currCompany][currTimeline].timeStamp;
    const dateTime = formatDate.map(time => new Date(time * 1000).toLocaleDateString());
    const currValue = allStockData.stocksData[0][currCompany][currTimeline].value;
    findMinMax(currValue)


    chart.data.labels = dateTime;
    chart.data.datasets[0].data = currValue;
    chart.update();
}

function findMinMax(currValue) {
    const min = document.getElementById('min')
    const max = document.getElementById('max')

    const least = Math.min(...currValue).toFixed(2);
    const most = Math.max(...currValue).toFixed(2);

    min.innerHTML = `$${least}`;
    max.innerHTML = `$${most}`;
}

function updateSummary(currCompany) {
    const stockSum = document.getElementsByClassName('stock-description')[0];
    const stockName = document.getElementById('stock-name');
    const currComp = document.getElementById('comp-curr');
    const stockProfit = document.getElementById('stock-profit');
    const stockValue = document.getElementById('stock-value');
    stockSum.innerHTML = '';
    stockName.innerHTML = '';
    stockProfit.innerHTML = '';
    stockValue.innerHTML = '';
    currComp.innerHTML = "";

    const listItem = document.createElement('div');

    let curSum = summaryData[currCompany].summary;
    let currProfit = stocksData[currCompany].profit;
    let currValue = stocksData[currCompany].bookValue;
    listItem.textContent = curSum;

    currComp.innerHTML = currCompany;
    stockProfit.innerHTML = currProfit.toFixed(2);
    stockValue.innerHTML = `$${currValue.toFixed(2)}`;
    stockName.innerHTML = currCompany;
    setColor(stockProfit);
    stockName.style.margin = '5px';
    stockProfit.style.margin = '5px';
    stockValue.style.margin = '5px'
    stockSum.appendChild(listItem);

}

async function fetchAllStockData() {
    try {

        let apiData = await fetch('https://stocks3.onrender.com/api/stocks/getstocksdata');
        let jsonData = await apiData.json();
        allStockData = jsonData;

        const stockDataApi = await fetch('https://stocks3.onrender.com/api/stocks/getstockstatsdata');
        const stockDataJson = await stockDataApi.json();
        stocksData = stockDataJson.stocksStatsData[0];
        console.log(stocksData);

        const stockSummaryApi = await fetch('https://stocks3.onrender.com/api/stocks/getstocksprofiledata')
        const stockSummaryJson = await stockSummaryApi.json();
        summaryData = stockSummaryJson.stocksProfileData[0];


        updateSummary(currCompany);

        const initialData = allStockData.stocksData[0]['AAPL']['1mo'].value;
        const initialTimeStamp = allStockData.stocksData[0]['AAPL']['1mo'].timeStamp;
        const myChart = createLineChart(initialData, initialTimeStamp);
        const allStocks = document.getElementById('all-stocks');
        findMinMax(initialData)
        stocks.map(stock => {
            const listItem = document.createElement('button');
            const valueItem = document.createElement('span');
            const profitItem = document.createElement('span');

            listItem.textContent = stock;
            listItem.style.display = 'block';
            listItem.style.marginTop = '10px';
            listItem.style.width = '80px';

            valueItem.style.margin = '5px'
            profitItem.style.margin = '5px'

            valueItem.textContent = `$${stocksData[stock].bookValue.toFixed(2)}`;
            profitItem.textContent = `${stocksData[stock].profit.toFixed(2)}`;

            setColor(profitItem);

            listItem.addEventListener('click', function () {
                updateCompany(myChart, stock, currTimeline);
            });
            allStocks.appendChild(listItem);
            allStocks.appendChild(valueItem);
            allStocks.appendChild(profitItem);
        });

        const dateRange = document.getElementById('date-range');
        timeStamps.map(timeStamp => {
            const dateRangeBtn = document.createElement('button');
            dateRangeBtn.textContent = timeStamp;
            dateRangeBtn.style.width = '80px';
            dateRangeBtn.style.margin = '4px'
            dateRangeBtn.addEventListener('click', function () {
                updateTimeLine(myChart, timeStamp, currCompany);
            })

            dateRange.appendChild(dateRangeBtn);
        });



    }
    catch (err) {
        console.log(err);
    }
}


