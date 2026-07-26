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
    "html,body,#container{margin:0;padding:0;height:100%;width:100%;background:" +
    chartBgColor +
    ";overflow:hidden;}" +
    "#container, #container iframe{touch-action:none;-webkit-user-select:none;user-select:none;}" +
    "</style>" +
    '<script src="https://s3.tradingview.com/tv.js"></script>' +
    '</head><body><div id="container"></div><script>' +
    "let widget;" +
    "let chartApi;" +
    "let trendLineClickSub=null;" +
    "let trendLinePending=null;" +
    "let trendLinePendingMarkerId=null;" +
    "let trendLineModeEnabled=false;" +
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
    "disabled_features:['header_widget','left_toolbar','control_bar','timeframes_toolbar','symbol_search_hot_key','header_symbol_search','header_compare','header_undo_redo','header_screenshot','header_chart_type','header_settings','header_indicators','header_saveload','display_market_status','create_volume_indicator_by_default','adaptive_logo']," +
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
    "function setChartPanZoomEnabled(enabled){if(!chartApi)return;" +
    "const toggles=['setScrollEnabled','setZoomEnabled','setHandleScroll','setHandleScale'];" +
    "for(let i=0;i<toggles.length;i+=1){try{if(typeof chartApi[toggles[i]]==='function'){chartApi[toggles[i]](enabled);}}catch(e){}}}" +
    "function resolveClickPoint(param){if(!param||!chartApi)return null;" +
    "let time=param.time!=null?param.time:null;" +
    "let price=param.price!=null?param.price:null;" +
    "if(param.point){" +
    "if(time==null){try{if(chartApi.coordinateToTime){time=chartApi.coordinateToTime(param.point.x);}}catch(e){}}" +
    "if(time==null){try{const ts=chartApi.timeScale&&chartApi.timeScale();if(ts&&ts.coordinateToTime){time=ts.coordinateToTime(param.point.x);}}catch(e){}}" +
    "if(price==null){try{if(chartApi.coordinateToPrice){price=chartApi.coordinateToPrice(param.point.y);}}catch(e){}}}" +
    "if(time==null&&param.index!=null){try{const series=chartApi.getSeries&&chartApi.getSeries();if(series&&series.bars){const bar=series.bars().valueAt(param.index);if(bar&&bar.time!=null){time=bar.time;}}}catch(e){}}" +
    "if(time==null||price==null||!isFinite(Number(price)))return null;" +
    "return{time:time,price:Number(price)};}" +
    "function clearPendingMarker(){if(trendLinePendingMarkerId==null||!chartApi)return;" +
    "try{if(chartApi.removeEntity){chartApi.removeEntity(trendLinePendingMarkerId);}}catch(e){}" +
    "trendLinePendingMarkerId=null;}" +
    "function showPendingMarker(point){clearPendingMarker();if(!chartApi||!chartApi.createShape||!point)return;" +
    "try{trendLinePendingMarkerId=chartApi.createShape(point,{shape:'balloon',lock:true,disableSelection:true,disableSave:true,overrides:{color:TREND_LINE_COLOR,backgroundColor:TREND_LINE_COLOR,fontsize:8,text:''}});}catch(e){trendLinePendingMarkerId=null;}}" +
    "function detachTrendLineClick(){if(trendLineClickSub&&trendLineClickSub.unsubscribe){try{trendLineClickSub.unsubscribe();}catch(e){}}trendLineClickSub=null;trendLinePending=null;clearPendingMarker();}" +
    "function createTrendLine(fromPoint,toPoint){if(!chartApi||!fromPoint||!toPoint)return false;" +
    "const opts={lock:false,disableSelection:false,disableSave:true,overrides:{linecolor:TREND_LINE_COLOR,linewidth:2,linestyle:0}};" +
    "const shapes=['trend_line','TrendLine','trendline'];" +
    "for(let i=0;i<shapes.length;i+=1){try{if(chartApi.createMultipointShape){chartApi.createMultipointShape([fromPoint,toPoint],Object.assign({shape:shapes[i]},opts));return true;}}catch(e){}}" +
    "return false;}" +
    "function attachTrendLineClick(){detachTrendLineClick();if(!chartApi||!chartApi.subscribeClick||!chartApi.createMultipointShape)return false;" +
    "trendLineClickSub=chartApi.subscribeClick(function(param){if(!trendLineModeEnabled)return;" +
    "const point=resolveClickPoint(param);if(!point)return;" +
    "if(!trendLinePending){trendLinePending=point;showPendingMarker(point);postToApp({type:'drawing',event:'firstPoint'});return;}" +
    "if(createTrendLine(trendLinePending,point)){clearPendingMarker();trendLinePending=null;postToApp({type:'drawing',event:'lineCreated'});return;}" +
    "postToApp({type:'drawing',event:'lineFailed'});});return true;}" +
    "function selectNativeTrendTool(enabled){const ids=enabled?['trend_line','LineToolTrendLine','drawingToolbarActionTrendLine']:['cursor','LineToolCursor','drawingToolbarActionCursor'];" +
    "for(let i=0;i<ids.length;i+=1){try{if(widget&&widget.selectLineTool){widget.selectLineTool(ids[i]);return 'widget';}}catch(e){}" +
    "try{if(chartApi&&chartApi.selectLineTool){chartApi.selectLineTool(ids[i]);return 'chart';}}catch(e){}" +
    "try{if(chartApi&&chartApi.executeActionById){chartApi.executeActionById(ids[i]);return 'action';}}catch(e){}}" +
    "return null;}" +
    "function setTrendLineDrawMode(enabled){trendLineModeEnabled=!!enabled;trendLinePending=null;clearPendingMarker();" +
    "if(!chartApi){postToApp({type:'drawing',event:enabled?'modeOn':'modeOff',ready:false});return;}" +
    "if(!enabled){detachTrendLineClick();selectNativeTrendTool(false);setChartPanZoomEnabled(true);postToApp({type:'drawing',event:'modeOff',ready:true});return;}" +
    "selectNativeTrendTool(false);" +
    "setChartPanZoomEnabled(false);" +
    "if(attachTrendLineClick()){postToApp({type:'drawing',event:'modeOn',ready:true,mode:'tap'});return;}" +
    "const native=selectNativeTrendTool(true);" +
    "if(native){try{if(widget&&widget.magnetMode){widget.magnetMode(true);}}catch(e){}postToApp({type:'drawing',event:'modeOn',ready:true,mode:'native'});return;}" +
    "setChartPanZoomEnabled(true);" +
    "postToApp({type:'drawing',event:'modeOn',ready:false,mode:'unsupported'});}" +
    "function clearDrawings(){if(!chartApi)return;" +
    "try{if(chartApi.removeAllShapes){chartApi.removeAllShapes();postToApp({type:'drawing',event:'cleared'});return;}}catch(e){}" +
    "try{if(chartApi.executeActionById){chartApi.executeActionById('removeAllDrawingTools');postToApp({type:'drawing',event:'cleared'});}}catch(e){}}" +
    "async function publishQuote(sym){try{" +
    "const res=await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(sym)+'?interval=1d&range=1d');" +
    "const json=await res.json();" +
    "const meta=json&&json.chart&&json.chart.result&&json.chart.result[0]&&json.chart.result[0].meta;" +
    "if(!meta||!meta.regularMarketPrice)return;" +
    "const price=meta.regularMarketPrice;" +
    "const prev=meta.chartPreviousClose||meta.previousClose||price;" +
    "const changePercent=prev?((price-prev)/prev)*100:0;" +
    "postToApp({type:'quote',symbol:sym,price:price,changePercent:changePercent});" +
    "}catch(e){}}" +
    "function handleMessage(raw){try{" +
    "const data=JSON.parse(raw||'{}');" +
    "if(!chartApi){if(data.type==='setTrendLineMode'){trendLineModeEnabled=!!data.enabled;}" +
    "return;}" +
    "if(data.type==='setSymbol'&&data.symbol){chartApi.setSymbol(data.symbol,data.interval||'" +
    interval +
    "');publishQuote(data.symbol);}" +
    "else if(data.type==='setInterval'&&data.interval){chartApi.setResolution(String(data.interval));}" +
    "else if(data.type==='setTrendLineMode'){setTrendLineDrawMode(!!data.enabled);}" +
    "else if(data.type==='clearDrawings'){clearDrawings();}" +
    "}catch(e){}}" +
    "function notifyReady(){postToApp({type:'ready'});}" +
    "widget.onChartReady(function(){try{chartApi=widget.activeChart?widget.activeChart():(widget.chart?widget.chart():null);}catch(e){chartApi=null;}" +
    "const sym='" +
    symbol +
    "';" +
    "publishQuote(sym);setInterval(function(){publishQuote(sym);},15000);" +
    "if(trendLineModeEnabled){setTrendLineDrawMode(true);}" +
    "notifyReady();setTimeout(notifyReady,400);});" +
    "document.addEventListener('message',function(event){handleMessage(event.data);});" +
    "window.addEventListener('message',function(event){handleMessage(event.data);});" +
    "</script></body></html>"
  );
}
