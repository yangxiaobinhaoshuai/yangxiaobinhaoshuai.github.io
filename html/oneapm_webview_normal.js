/*
 提取页面数据和页面中的资源数据数据
 */
(function oneapm_mobile_obtain_webviewdata(w, d) {
    var xmlns = "http://www.w3.org/2000/svg";

    /**
     * Creates array of timing entries from Navigation and Resource Timing Interfaces
     * @returns {object[]}
     */
    function getTimings() {
        var entries = [];
        // Page times come from Navigation Timing API
        entries.push(createEntryFromNavigationTiming());
        // Other entries come from Resource Timing API
        //var resources = [];
        //if(w.performance.getEntriesByType !== undefined) {
        //	resources = w.performance.getEntriesByType("resource");
        //}
        //else if(w.performance.webkitGetEntriesByType !== undefined) {
        //	resources = w.performance.webkitGetEntriesByType("resource");
        ///}
// TODO: .length - 1 is a really hacky way of removing the bookmarklet script
// Do it by name???
        //for(var n = 0; n < resources.length - 1; n++) {
        //	entries.push(createEntryFromResourceTiming(resources[n]));
        //}
        return entries;
    }

    /**
     * Creates an entry from a PerformanceResourceTiming object
     * @param {object} resource
     * @returns {object}
     */
    function createEntryFromNavigationTiming() {
        var timing = w.performance.timing;
// TODO: Add fetchStart and duration, fix TCP, SSL etc. timings
        return {
            url: d.URL,
            start: 0,
            duration: timing.responseEnd - timing.navigationStart,
            redirectStart: timing.redirectStart === 0 ? 0 : timing.redirectStart - timing.navigationStart,
            redirectDuration: timing.redirectEnd - timing.redirectStart,
            appCacheStart: 0,											// TODO
            appCacheDuration: 0,										// TODO
            dnsStart: timing.domainLookupStart - timing.navigationStart,
            dnsDuration: timing.domainLookupEnd - timing.domainLookupStart,
            tcpStart: timing.connectStart - timing.navigationStart,
            tcpDuration: timing.connectEnd - timing.connectStart,		// TODO
            sslStart: 0,												// TODO
            sslDuration: 0,												// TODO
            requestStart: timing.requestStart - timing.navigationStart,
            requestDuration: timing.responseStart - timing.requestStart,
            responseStart: timing.responseStart - timing.navigationStart,
            responseDuration: timing.responseEnd - timing.responseStart
        }
    }

    /**
     * Creates an entry from a PerformanceResourceTiming object
     * @param {object} resource
     * @returns {object}
     */
    function createEntryFromResourceTiming(resource) {
// NB
// AppCache: start = fetchStart, end = domainLookupStart, connectStart or requestStart
// TCP: start = connectStart, end = secureConnectionStart or connectEnd
// SSL: secureConnectionStart can be undefined
        return {
            url: resource.name,
            start: resource.startTime,
        }
    }
})(window, window.document);


/**
 预览信息的函数
 **/
var namespace = {};
//从小到大排序
function sortFloat(arr) {
    return arr.sort(function (a, b) {
        return a - b;
    });
}

//错误回调掉函数
//window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
//TODO
//alert(errorMessage+",error uri:"+scriptURI+",error  columnNumber :"+columnNumber);
//}


//得到js、css、image等资源的分别的总和
//第二次加载可能加载的是缓存数据，就不会有这些资源的timeling了
function resourceTiming(_oneapm_webview_1_) {
    var resourceList = window.performance.getEntriesByType("resource");
    var imageLoadTime = 0;
    var jsLoadTime = 0;
    var cssLoadTime = 0;
    var tmpTime = 0;
    var imageLoadTimeArray = Array();
    var jsLoadTimeArray = Array();
    var cssLoadTimeArray = Array();

    for (i = 0; i < resourceList.length; i++) {
        tmpTime = Math.round(resourceList[i].responseEnd - resourceList[i].startTime);
        if (resourceList[i].initiatorType == "img") {
            imageLoadTimeArray.push(tmpTime);
            imageLoadTime += tmpTime;
        } else if (resourceList[i].initiatorType == "link") {//css
            cssLoadTime += tmpTime;
            cssLoadTimeArray.push(tmpTime);
        } else if (resourceList[i].initiatorType == "script") {//js
            jsLoadTime += tmpTime;
            jsLoadTimeArray.push(tmpTime);
        }
    }
    sortFloat(imageLoadTimeArray);
    sortFloat(jsLoadTimeArray);
    sortFloat(cssLoadTimeArray);
    //调用java代码添加metric,exclusive  时间传total时间即可，sum_of_squares值传0即可。
    //format :count /exclusive / max / min / sum_of_squares / total
    if (imageLoadTimeArray.length != 0) {
        if (imageLoadTimeArray.length == 1) {
            var addImageMetricJson = {
                "count": 1 + "",
                "exclusive": imageLoadTime + "",
                "max": imageLoadTimeArray[0] + "",
                "min": imageLoadTimeArray[0] + "",
                "sum_of_squares": 0 + "",
                "total": imageLoadTime + ""
            };
            window.OneapmWebViewProxy.addImageMetric(JSON.stringify(addImageMetricJson), _oneapm_webview_1_ + "");
        } else {
            var addImageMetricJson = {
                "count": imageLoadTimeArray.length + "",
                "exclusive": imageLoadTime + "",
                "max": imageLoadTimeArray[imageLoadTimeArray.length - 1] + "",
                "min": imageLoadTimeArray[0] + "",
                "sum_of_squares": 0 + "",
                "total": imageLoadTime + ""
            };
            window.OneapmWebViewProxy.addImageMetric(JSON.stringify(addImageMetricJson), _oneapm_webview_1_ + "");
        }
    }

    if (jsLoadTimeArray.length != 0) {
        if (jsLoadTimeArray.length == 1) {
            var JsMetricJson = {
                "count": 1 + "",
                "exclusive": jsLoadTime + "",
                "max": jsLoadTimeArray[0] + "",
                "min": jsLoadTimeArray[0] + "",
                "sum_of_squares": 0 + "",
                "total": jsLoadTime + ""
            };
            window.OneapmWebViewProxy.addScriptMetric(JSON.stringify(JsMetricJson), _oneapm_webview_1_ + "");
        } else {
            var JsMetricJson = {
                "count": jsLoadTimeArray.length - 1 + "",
                "exclusive": jsLoadTime + "",
                "max": jsLoadTimeArray[jsLoadTimeArray.length - 1] + "",
                "min": jsLoadTimeArray[0] + "",
                "sum_of_squares": 0 + "",
                "total": jsLoadTime + ""
            };
            window.OneapmWebViewProxy.addScriptMetric(JSON.stringify(JsMetricJson), _oneapm_webview_1_ + "");
        }
    }

    if (cssLoadTimeArray.length != 0) {
        if (cssLoadTimeArray.length == 1) {
            var cssMetricJson = {
                    "count": 1 + "",
                    "exclusive": cssLoadTimeArray + "",
                    "max": cssLoadTimeArray[0] + "",
                    "min": cssLoadTimeArray[0] + "",
                    "sum_of_squares": 0 + "",
                    "total": cssLoadTimeArray
                } + "";
            window.OneapmWebViewProxy.addLinkMetric(JSON.stringify(cssMetricJson), _oneapm_webview_1_ + "");
        } else {
            var cssMetricJson = {
                "count": cssLoadTimeArray.length - 1 + "",
                "exclusive": cssLoadTimeArray + "",
                "max": cssLoadTimeArray[cssLoadTimeArray.length - 1] + "",
                "min": cssLoadTimeArray[0] + "",
                "sum_of_squares": 0 + "",
                "total": cssLoadTimeArray + ""
            };
            window.OneapmWebViewProxy.addLinkMetric(JSON.stringify(cssMetricJson), _oneapm_webview_1_ + "");
        }
    }
}

//_oneapm_ivoke_java_commit_data发送数据
function _oneapm_ivoke_java_commit_data(webview_id_1) {
    _oneapm_webview_1_ = webview_id_1;
    setTimeout(function () {
        if (!window.performance) {//不支持相关API
            return;
        }
        var performance = window.performance;
        var timing = performance.timing;
        var windowLoadedTime = timing.loadEventStart ? timing.loadEventStart - timing.fetchStart : -1;
        var domainLookupTime = timing.domainLookupEnd - timing.domainLookupStart;
        resourceTiming(webview_id_1);
        window.OneapmWebViewProxy.addDomainLookupTime(JSON.stringify({"addDomainLookupTime": domainLookupTime + ""}), _oneapm_webview_1_ + "");
        window.OneapmWebViewProxy.addTotalWebViewSummary(JSON.stringify({"total_webview_summary": windowLoadedTime + ""}));
        window.OneapmWebViewProxy.addSingleWebViewSummary(JSON.stringify({"singe_webview_summary": windowLoadedTime + ""}), _oneapm_webview_1_ + "");
        window.OneapmWebViewProxy.addWebViewSummaryMetric(JSON.stringify({"singe_webview_summary": windowLoadedTime + ""}), _oneapm_webview_1_ + "");

        var datas = getTimings();
        window.OneapmWebViewProxy.fetchPageContent(JSON.stringify(datas[0]), _oneapm_webview_1_ + "");
        alert(1);
    }, 300);
}


