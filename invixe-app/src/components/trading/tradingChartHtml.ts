import { SMA_150_COLOR } from "./TradingSmaToggle";
import { TREND_LINE_COLOR } from "./TradingTrendLineToggle";

type BuildTvHtmlOptions = {
  symbol: string;
  interval: string;
  withSma: boolean;
  chartBgColor: string;
  candleUpColor: string;
  candleDownColor: string;
  gridColor: string;
};

export function buildTradingViewHtml({
  symbol,
  interval,
  withSma,
  chartBgColor,
  candleUpColor,
  candleDownColor,
  gridColor,
}: BuildTvHtmlOptions): string {
  const studiesJson = withSma
    ? '[{ "id": "MASimple@tv-basicstudies", "inputs": { "length": 150 } }]'
    : "[]";

  return (
    "<!DOCTYPE html>" +
    '<html lang="he"><head>' +
    '<meta charset="UTF-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />' +
    "<style>" +
    "html,body{margin:0;padding:0;height:100%;width:100%;background:" +
    chartBgColor +
    ";overflow:hidden;}" +
    "#container{height:100%;width:100%;}" +
    "#container, #container iframe{touch-action:none;-webkit-user-select:none;user-select:none;}" +
    "</style>" +
    '<script src="https://s3.tradingview.com/tv.js"></script>' +
    '</head><body><div id="container"></div><script>' +
    "let widget;" +
    "let chartApi;" +
    "let chartDataReady=false;" +
    "let trendLinePending=null;" +
    "let trendLineModeEnabled=false;" +
    "let savedTrendLines=[];" +
    "const TREND_LINE_COLOR='" +
    TREND_LINE_COLOR +
    "';" +
    "widget=new TradingView.widget({" +
    "autosize:true," +
    "symbol:'" +
    symbol +
    "'," +
    "interval:'" +
    interval +
    "'," +
    "container_id:'container'," +
    "locale:'he'," +
    "theme:'dark'," +
    "timezone:'Etc/UTC'," +
    "hide_top_toolbar:true," +
    "hide_side_toolbar:true," +
    "hide_legend:true," +
    "allow_symbol_change:false," +
    "enable_publishing:false," +
    "studies:" +
    studiesJson +
    "," +
    "studies_overrides:{" +
    "\"moving average.ma.color\":'" +
    SMA_150_COLOR +
    "'," +
    '"moving average.ma.linewidth":2,' +
    '"moving average.ma.transparency":0' +
    "}," +
    "enabled_features:['chart_scroll','chart_zoom','horz_touch_drag_scroll','vert_touch_drag_scroll','pinch_scale']," +
    "disabled_features:['header_widget','control_bar','timeframes_toolbar','symbol_search_hot_key','header_symbol_search','header_compare','header_undo_redo','header_screenshot','header_chart_type','header_settings','header_indicators','header_saveload','display_market_status','create_volume_indicator_by_default','adaptive_logo']," +
    "overrides:{" +
    "\"paneProperties.background\":'" +
    chartBgColor +
    "'," +
    "\"paneProperties.backgroundType\":'solid'," +
    "\"paneProperties.vertGridProperties.color\":'" +
    gridColor +
    "'," +
    "\"paneProperties.horzGridProperties.color\":'" +
    gridColor +
    "'," +
    "\"scalesProperties.textColor\":'#8CA0AE'," +
    "\"mainSeriesProperties.candleStyle.upColor\":'" +
    candleUpColor +
    "'," +
    "\"mainSeriesProperties.candleStyle.downColor\":'" +
    candleDownColor +
    "'," +
    "\"mainSeriesProperties.candleStyle.borderUpColor\":'" +
    candleUpColor +
    "'," +
    "\"mainSeriesProperties.candleStyle.borderDownColor\":'" +
    candleDownColor +
    "'," +
    "\"mainSeriesProperties.candleStyle.wickUpColor\":'" +
    candleUpColor +
    "'," +
    "\"mainSeriesProperties.candleStyle.wickDownColor\":'" +
    candleDownColor +
    "'" +
    "}" +
    "});" +
    "function postToApp(payload){try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(payload));}catch(e){}}" +
    "function chartSize(){const el=document.getElementById('container');return{width:el?el.clientWidth:window.innerWidth,height:el?el.clientHeight:window.innerHeight};}" +
    "function setChartPanZoomEnabled(enabled){if(!chartApi)return;" +
    "const toggles=['setScrollEnabled','setZoomEnabled','setHandleScroll','setHandleScale'];" +
    "for(let i=0;i<toggles.length;i+=1){try{if(typeof chartApi[toggles[i]]==='function'){chartApi[toggles[i]](enabled);}}catch(e){}}}" +
    "function getSeries(){try{return chartApi&&chartApi.getSeries?chartApi.getSeries():null;}catch(e){return null;}}" +
    "function getTimeScale(){try{return chartApi&&chartApi.timeScale?chartApi.timeScale():null;}catch(e){return null;}}" +
    "function getPlotBounds(width,height){return{left:width*0.02,right:width*0.84,top:height*0.06,bottom:height*0.94};}" +
    "function barTime(bar){if(!bar)return null;if(bar.time!=null)return bar.time;if(bar.timestamp!=null)return bar.timestamp;if(bar.date!=null)return bar.date;return null;}" +
    "function rowsPriceRange(rows){let minP=Infinity,maxP=-Infinity;" +
    "for(let i=0;i<rows.length;i+=1){const hi=Number(rows[i].high!=null?rows[i].high:rows[i].close!=null?rows[i].close:rows[i].value);" +
    "const lo=Number(rows[i].low!=null?rows[i].low:rows[i].close!=null?rows[i].close:rows[i].value);" +
    "if(isFinite(hi)&&hi>maxP)maxP=hi;if(isFinite(lo)&&lo<minP)minP=lo;}" +
    "if(!isFinite(minP)||!isFinite(maxP)||maxP<=minP)return null;return{minP:minP,maxP:maxP};}" +
    "function priceToCoordinate(series,price){if(!series||price==null)return null;" +
    "try{if(typeof series.priceToCoordinate==='function'){const y=series.priceToCoordinate(price);if(y!=null&&isFinite(y))return y;}}catch(e){}" +
    "try{const ps=series.priceScale&&series.priceScale();if(ps&&typeof ps.priceToCoordinate==='function'){const y=ps.priceToCoordinate(price);if(y!=null&&isFinite(y))return y;}}catch(e){}" +
    "return null;}" +
    "function coordinateToPrice(series,y){if(y==null||!isFinite(y))return null;" +
    "try{if(chartApi&&typeof chartApi.coordinateToPrice==='function'){const p=series?chartApi.coordinateToPrice(y,series):chartApi.coordinateToPrice(y);if(p!=null&&isFinite(Number(p)))return Number(p);}}catch(e){}" +
    "try{const ps=series&&series.priceScale&&series.priceScale();if(ps&&typeof ps.coordinateToPrice==='function'){const p=ps.coordinateToPrice(y);if(p!=null&&isFinite(Number(p)))return Number(p);}}catch(e){}" +
    "return null;}" +
    "function resolvePointFromXY(x,y){if(!chartApi)return null;" +
    "const series=getSeries();const ts=getTimeScale();let time=null;let price=null;" +
    "if(ts){try{if(typeof ts.coordinateToTime==='function'){time=ts.coordinateToTime(x);}}catch(e){}" +
    "if(time==null){try{if(typeof ts.coordinateToLogical==='function'){const logical=ts.coordinateToLogical(x);if(logical!=null&&series&&series.bars){const bar=series.bars().valueAt(Math.round(logical));if(bar){if(bar.time!=null)time=bar.time;if(bar.close!=null)price=Number(bar.close);}}}}catch(e){}}}" +
    "if(time==null){try{if(typeof chartApi.coordinateToTime==='function'){time=chartApi.coordinateToTime(x);}}catch(e){}}" +
    "if(price==null){price=coordinateToPrice(series,y);}" +
    "if(time==null||price==null||!isFinite(price))return null;" +
    "return{time:time,price:price};}" +
    "function resolvePointFromExportData(rows,x,y,width,height){if(!rows||rows.length<1)return null;" +
    "const plot=getPlotBounds(width,height);const relX=(x-plot.left)/(plot.right-plot.left);if(relX<0||relX>1)return null;" +
    "const idx=Math.round(relX*(rows.length-1));const bar=rows[Math.max(0,Math.min(rows.length-1,idx))];" +
    "const time=barTime(bar);const range=rowsPriceRange(rows);if(time==null||!range)return null;" +
    "const relY=(y-plot.top)/(plot.bottom-plot.top);if(relY<0||relY>1)return null;" +
    "const price=range.maxP-relY*(range.maxP-range.minP);return{time:time,price:Number(price)};}" +
    "function projectPointFromExportData(point,rows,width,height){if(!rows||rows.length<1||!point)return null;" +
    "const plot=getPlotBounds(width,height);const range=rowsPriceRange(rows);if(!range)return null;" +
    "let idx=0,best=Infinity;for(let i=0;i<rows.length;i+=1){const t=barTime(rows[i]);if(t==null)continue;const d=Math.abs(Number(t)-Number(point.time));if(d<best){best=d;idx=i;}}" +
    "const x=plot.left+(idx/(rows.length-1||1))*(plot.right-plot.left);" +
    "const relY=(range.maxP-point.price)/(range.maxP-range.minP);const y=plot.top+relY*(plot.bottom-plot.top);" +
    "return{x:x,y:y};}" +
    "function apiPixel(point){const series=getSeries();const ts=getTimeScale();if(!series||!ts||!point)return null;" +
    "try{const x=ts.timeToCoordinate(point.time);const y=priceToCoordinate(series,point.price);if(x!=null&&y!=null&&isFinite(x)&&isFinite(y))return{x:x,y:y};}catch(e){}return null;}" +
    "function publishTrendLinePixels(){if(!chartApi){postToApp({type:'trendPixels',lines:[],pending:null});return;}" +
    "const size=chartSize();function emit(rows){" +
    "const lines=[];for(let i=0;i<savedTrendLines.length;i+=1){const p1=savedTrendLines[i].p1;const p2=savedTrendLines[i].p2;" +
    "let a=apiPixel(p1);let b=apiPixel(p2);if((!a||!b)&&rows){if(!a)a=projectPointFromExportData(p1,rows,size.width,size.height);if(!b)b=projectPointFromExportData(p2,rows,size.width,size.height);}" +
    "if(a&&b)lines.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y});}" +
    "let pending=null;if(trendLinePending){pending=apiPixel(trendLinePending);if(!pending&&rows){pending=projectPointFromExportData(trendLinePending,rows,size.width,size.height);}}" +
    "postToApp({type:'trendPixels',lines:lines,pending:pending});}" +
    "if(typeof chartApi.exportData==='function'){chartApi.exportData().then(function(rows){emit(rows&&rows.length?rows:null);}).catch(function(){emit(null);});}else{emit(null);}}" +
    "function applyTrendPoint(point){if(!point){postToApp({type:'drawing',event:'tapMissed'});return;}" +
    "if(!trendLinePending){trendLinePending=point;postToApp({type:'drawing',event:'firstPoint'});}else{savedTrendLines.push({p1:trendLinePending,p2:point});trendLinePending=null;postToApp({type:'drawing',event:'lineCreated'});}" +
    "publishTrendLinePixels();}" +
    "function handleExternalTrendTap(x,y){if(!trendLineModeEnabled||!chartDataReady||!chartApi)return;" +
    "const direct=resolvePointFromXY(x,y);if(direct){applyTrendPoint(direct);return;}" +
    "if(typeof chartApi.exportData!=='function'){applyTrendPoint(null);return;}" +
    "const size=chartSize();chartApi.exportData().then(function(rows){applyTrendPoint(rows&&rows.length?resolvePointFromExportData(rows,x,y,size.width,size.height):null);}).catch(function(){applyTrendPoint(null);});}" +
    "function bindTrendLineRedraw(){if(!chartApi)return;" +
    "try{const ts=getTimeScale();if(ts&&typeof ts.subscribeVisibleTimeRangeChange==='function'){ts.subscribeVisibleTimeRangeChange(function(){publishTrendLinePixels();});}}catch(e){}" +
    "try{if(chartApi.onVisibleRangeChanged){chartApi.onVisibleRangeChanged().subscribe(null,function(){publishTrendLinePixels();});}}catch(e){}" +
    "try{const series=getSeries();const ps=series&&series.priceScale&&series.priceScale();if(ps&&typeof ps.subscribeVisiblePriceRangeChange==='function'){ps.subscribeVisiblePriceRangeChange(function(){publishTrendLinePixels();});}}catch(e){}" +
    "try{if(chartApi.onDataLoaded){chartApi.onDataLoaded().subscribe(null,function(){publishTrendLinePixels();});}}catch(e){}}" +
    "function setTrendLineDrawMode(enabled){trendLineModeEnabled=!!enabled;" +
    "if(!enabled){trendLinePending=null;setChartPanZoomEnabled(true);postToApp({type:'trendPixels',lines:[],pending:null});postToApp({type:'drawing',event:'modeOff',ready:!!chartApi});return;}" +
    "if(!chartApi||!chartDataReady){postToApp({type:'drawing',event:'modeOn',ready:false});return;}" +
    "setChartPanZoomEnabled(false);publishTrendLinePixels();postToApp({type:'drawing',event:'modeOn',ready:true,mode:'tap'});}" +
    "function clearDrawings(){savedTrendLines=[];trendLinePending=null;publishTrendLinePixels();postToApp({type:'drawing',event:'cleared'});}" +
    "function publishChartQuote(sym){if(!chartApi)return;try{" +
    "const series=getSeries();" +
    "let price=null;" +
    "if(series){if(typeof series.lastPrice==='function'){price=Number(series.lastPrice());}" +
    "if((price==null||!isFinite(price)||price<=0)&&series.bars){const bars=series.bars();if(bars&&typeof bars.last==='function'){const lastBar=bars.last();if(lastBar&&lastBar.close!=null){price=Number(lastBar.close);}}}" +
    "}" +
    "if((price==null||!isFinite(price)||price<=0)&&typeof chartApi.exportData==='function'){" +
    "chartApi.exportData().then(function(rows){try{if(!rows||!rows.length)return;var last=rows[rows.length-1];var close=Number(last.close!=null?last.close:last.value);if(!isFinite(close)||close<=0)return;var changePercent=0;if(rows.length>=2){var prev=Number(rows[rows.length-2].close!=null?rows[rows.length-2].close:rows[rows.length-2].value);if(prev>0){changePercent=((close-prev)/prev)*100;}}postToApp({type:'quote',symbol:String(sym||'').toUpperCase(),price:close,changePercent:changePercent});}catch(e){}}).catch(function(){});return;" +
    "}" +
    "if(price==null||!isFinite(price)||price<=0)return;" +
    "let changePercent=0;" +
    "if(series&&series.bars){const bars=series.bars();if(bars&&typeof bars.count==='function'&&bars.count()>=2){const lastBar=bars.last();const prevBar=bars.valueAt(bars.count()-2);if(lastBar&&prevBar&&prevBar.close>0){changePercent=((Number(lastBar.close)-Number(prevBar.close))/Number(prevBar.close))*100;}}}" +
    "postToApp({type:'quote',symbol:String(sym||'').toUpperCase(),price:price,changePercent:changePercent});" +
    "}catch(e){}}" +
    "function scheduleChartQuotes(sym){[400,1200,2500,5000,15000].forEach(function(ms){setTimeout(function(){publishChartQuote(sym);},ms);});}" +
    "function handleMessage(raw){try{" +
    "const data=typeof raw==='string'?JSON.parse(raw||'{}'):(raw||{});" +
    "if(!chartApi){if(data.type==='setTrendLineMode'){trendLineModeEnabled=!!data.enabled;}" +
    "return;}" +
    "if(data.type==='setSymbol'&&data.symbol){savedTrendLines=[];trendLinePending=null;publishTrendLinePixels();chartApi.setSymbol(data.symbol,data.interval||'" +
    interval +
    "');setTimeout(function(){publishChartQuote(data.symbol);},800);}" +
    "else if(data.type==='setInterval'&&data.interval){savedTrendLines=[];trendLinePending=null;publishTrendLinePixels();chartApi.setResolution(String(data.interval));setTimeout(function(){publishChartQuote('" +
    symbol +
    "');},800);}" +
    "else if(data.type==='setTrendLineMode'){setTrendLineDrawMode(!!data.enabled);}" +
    "else if(data.type==='clearDrawings'){clearDrawings();}" +
    "}catch(e){}}" +
    "function notifyReady(){postToApp({type:'ready'});}" +
    "function markChartDataReady(){chartDataReady=true;bindTrendLineRedraw();if(trendLineModeEnabled){setTrendLineDrawMode(true);}else{publishTrendLinePixels();}notifyReady();}" +
    "widget.onChartReady(function(){try{chartApi=widget.activeChart?widget.activeChart():(widget.chart?widget.chart():null);}catch(e){chartApi=null;}" +
    "const sym='" +
    symbol +
    "';" +
    "scheduleChartQuotes(sym);setInterval(function(){publishChartQuote(sym);},15000);" +
    "try{if(chartApi&&chartApi.onDataLoaded){chartApi.onDataLoaded().subscribe(null,function(){publishChartQuote(sym);});}}catch(e){}" +
    "try{if(chartApi&&chartApi.dataReady){const ready=chartApi.dataReady();if(ready&&typeof ready.then==='function'){ready.then(function(){markChartDataReady();}).catch(function(){setTimeout(markChartDataReady,900);});}else{setTimeout(markChartDataReady,900);}}else{setTimeout(markChartDataReady,900);}}catch(e){setTimeout(markChartDataReady,900);}" +
    "notifyReady();setTimeout(notifyReady,400);});" +
    "document.addEventListener('message',function(event){handleMessage(event.data);});" +
    "window.addEventListener('message',function(event){handleMessage(event.data);});" +
    "window.handleChartCommand=function(data){handleMessage(data);};" +
    "window.handleExternalTrendTap=function(x,y){handleExternalTrendTap(x,y);};" +
    "</script></body></html>"
  );
}
