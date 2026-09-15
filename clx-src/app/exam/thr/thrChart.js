/************************************************
 * thrChart.js
 * Created at 2022. 11. 18. 오전 10:55:07.
 *
 * @author aaajd
 ************************************************/

var moInterval = null;
var rootApp = null;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	app.lookup("subList").send();
	
	rootApp = app.getRootAppInstance();
	if (rootApp.app.id == "exb/com/main/Main") {
		rootApp.addEventListener("windowResize", windowResize);
	}
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubListSubmitSuccess(e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var subList = e.control;
	
	app.lookup("candleChart").dataSet = app.lookup("dsCandle");
	app.lookup("candleChart").drawChart();
	
	app.lookup("pieChart").dataSet = app.lookup("dsPie");
	app.lookup("pieChart").drawChart();
}

function windowResize() {
	if (typeof(Event) === 'function') {
		// modern browsers
		window.dispatchEvent(new Event('resize'));
		
	} else {
		// for IE and other old browsers
		// causes deprecation warning on modern browsers
		var evt = window.document.createEvent('UIEvents');
		evt.initUIEvent('resize', true, false, window, 0);
		window.dispatchEvent(evt);
	}
}

/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(e) {
	if (rootApp.app.id == "exb/com/main/Main") {
		rootApp.removeEventListener("windowResize", windowResize);
	}
}


/************************************************
 ** 파일내 로컬변수 선언
 ************************************************/
var util = createCommonUtil();

/*
 * 사용자 정의 컨트롤에서 rowSelect 이벤트 발생 시 호출.
 */
function onCandleChartRowSelect(e) {
	var candleChart = e.control;
	var oData = e.content;
	if (oData.rowIndex > -1) {
		var vcGrid = app.lookup("dsGrid");
		var pnRowIndex = oData.rowIndex;
		
		util.Grid.selectRow(app, "dsGrid", oData.rowIndex, false, false);
	}
}
