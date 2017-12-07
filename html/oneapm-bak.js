/*
    提取数据
 */
(function oneapm_mobile_obtain_webviewdata(w,d) {
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
})(window,window.document);
