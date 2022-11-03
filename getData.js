import fetch from "node-fetch";
import cheerio from "cheerio";

export const stockCache = {};
export const finalArr = [];
let earningsCache = {};
let stockObject = {}
const finalArr = [];

const StockTicker = function (ticker,pClose, todayOpen, dayRange, vol, avgVol, mrktCap, earnGrowPast, earnGrowCurr,earnGrowN5y, revGrow, peRatio, priceToSales,priceToBook,reportDate, epsCurrQuart, annRev, annProfit, profMargin) {
    this.ticker = ticker;
    this.previous_Close = pClose;
    this.day_Open = todayOpen;
    this.days_Range = dayRange;
    this.volume = vol;
    this.ave_Vol_3Mons = avgVol;
    this.market_Cap = mrktCap;
    this.earnGrowth_PastYear = earnGrowPast;
    this.earnGrowth_CurrYear = earnGrowCurr;
    this.earnGrowth_Next_5yrs = earnGrowN5y;
    this.revenueGrowth_PastYear = revGrow;
    this.pe_Ratio = peRatio;
    this.price_to_Sales = priceToSales;
    this.price_to_Book = priceToBook;
    this.next_reportDate = reportDate;
    this.forcasted_EPS = epsCurrQuart;
    this.annualRevenue_PastYear = annRev;
    this.annualProfit_PastYear = annProfit;
    this.profit_Margin = profMargin;
  };


export const getData = async function(stock) {
    stock = stock.toUpperCase();
    try {
        if (stockCache[stock]) {
            return Promise.resolve(stockCache[stock])
        };
        const headArr = [];
        const dataArr = [];
        const html = await fetch(`https://finance.yahoo.com/quote/${stock}/analysis?p=${stock}`)
        const txtConatiner = await html.text();
        const $ = cheerio.load(txtConatiner);
        const container = $('.BdB th');
        pusharr($, container, headArr);
        const datacont = $('.BdT td');
        pusharr($, datacont, dataArr);
        const stockObject = createObject(headArr, dataArr, stock);
        // stockObject[stock] = {
        //     headers: headArr,
        //     number: dataArr,
        // }
        finalArr.push(stockObject)
        stockCache[stock] = finalArr;
        return finalArr;
    } catch (e) {
        console.log(`testbot getData`, e);
    }
};

export const getDaily = async function(stock) {
    try {
        if (earningsCache[stock]) {
            return Promise.resolve(earningsCache[stock]);
        }
        const crate = [];
        const priceHolder = [];
        const lables = [];
        const headers = [];
        const prices = [];
        const getPage = await fetch(`https://money.cnn.com/quote/quote.html?symb=${stock}`);
        const html = await getPage.text();
        const $ = cheerio.load(html);
        const headLeft = $('.wsod_DataColumnLeft h3');
        pusharr($, headLeft, headers);
        // console.log(headers);
        const headRight = $('.wsod_DataColumnRight h3');
        pusharr($, headRight, headers);
        const lbls = $('.wsod_dataTable td');
        pusharr($, lbls, lables);
        const price = $('.wsod_quoteDataPoint');
        price.each((i,el) => {
            priceHolder.push(`${$(el).text()}`);
        });
        console.log(priceHolder);
        const todaysMovement = priceHolder.slice(0,13);
        const coFinancials = priceHolder.slice(-5);
        const fullDay = [stock, ...todaysMovement,...coFinancials];
        const tickerII = new StockTicker(...fullDay);
        prices.push(tickerII);
        // console.log(prices);
        earningsCache[stock] = {
            headers: headers,
            lables: lables,
            price: prices
        };
        crate.push(earningsCache)
        return crate
    } catch (e) {
        console.log('testbot getDaily',e);
    }
};


const createObject = function(head, data, ticker) {
    let obj = {};
    obj[ticker] = {
        headers: head,
    };
    const dataCopy = [...data];
    for (let i = 0; i < dataCopy.length; i+=5) {
        const blob = data.splice(0,5)
        // console.log(blob,blob.shift());
        obj[blob.shift()] = [...blob]
    }
    return obj;
};


const pusharr = function(money,txt,arr) {
    const $ = money;
    txt.each((i, el) => {
        arr.push(`${$(el).text()}`)
    })
};

