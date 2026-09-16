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
	
	debugger;
	//Set the sum of dsBar by templateType in dsPie
	var dsPie = app.lookup("dsPie");
	dsPie.clearData();
	app.lookup("dsBarType").getColumnData("templetType").forEach(function(Type) {
		var typeSum = Number(app.lookup("dsBar").getConditionalSum(`templetType == '${Type}'`, "count"));
		var idx = dsPie.addRow().getIndex();
		dsPie.putValue(idx, "status", Type);
		dsPie.putValue(idx, "count", typeSum);
		
	});
	
	var dsBar = app.lookup("dsBar");
	var barColumns = [];
	
	var barConfig = {};
	for (var i = 0; i < dsBar.getRowCount(); i++) {
		var row = dsBar.getRow(i);
		var statusName = String(row.getValue("status") || "");
		var countValue = Number(row.getValue("count")) || 0;
		
		barColumns.push([statusName, countValue]);
	}
	
	var dsBarFilter = app.lookup("dsBarFilter");
	var barFilterColumns = [];
	for (var i = 0; i < dsBarFilter.getRowCount(); i++) {
		var row = dsBarFilter.getRow(i);
		var statusName = String(row.getValue("status") || "");
		var countValue = Number(row.getValue("count")) || 0;
		
		barFilterColumns.push([statusName, countValue]);
	}
	
	//Bind dataSet and Draw Chart
	app.lookup("pieChart").dataSet = dsPie;
	app.lookup("pieChart").drawChart();
	
	app.lookup("chart_donut").dataSet = dsPie;
	app.lookup("chart_donut").drawChart();
	
	app.lookup("chart_bar1").dataSet = app.lookup("dsBar");
	app.lookup("chart_bar1").drawChart();
	
	app.lookup("chart_bar").dataSet = app.lookup("dsBarFilter");
	app.lookup("cmb1").selectItem(0);
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
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb1SelectionChange(e) {
	var cmb1 = e.control;
	var val = cmb1.text;
	
	var colNames = app.lookup("dsBar").getColumnData("status");
	app.lookup("dsBarFilter").clearData();
	
	colNames.forEach(function(each){
		var condSum = Number(app.lookup("dsBar").getConditionalSum(`templetType == '${val}' && status == '${each}'`, "count"));
		var idx = app.lookup("dsBarFilter").addRow().getIndex();
		app.lookup("dsBarFilter").putValue(idx, "status", each);
		app.lookup("dsBarFilter").putValue(idx, "count", condSum);
	});
	app.lookup("dsGrid3").redraw();
	app.lookup("chart_bar").drawChart();
	
}
