/************************************************
 * thrChart.js
 * Created at 2022. 11. 18. 오전 10:55:07.
 *
 * @author aaajd
 ************************************************/

var moInterval = null;
var rootApp = null;

var tpList = [];
var statList = [];
var colorList = [];
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	console.log("onBodyLoad....");
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
	
	//조회된 베이스데이터에서 필터에 사용되는 템플릿타입과 stuts 컬럼리스트 추출.
	tpList = [...new Set(app.lookup("dsBarBase").getColumnData("templetType"))];
	statList = [...new Set(app.lookup("dsBarBase").getColumnData("status"))];
	colorList = [...new Set(app.lookup("dsBarBase").getColumnData("rectColor"))];
	
	//도넛 차트는 템플릿타입별 합계값으로 보여준다.
	var dsPie = app.lookup("dsPie");
	dsPie.clearData();
	tpList.forEach(function(type) {
		var typeSum = Number(app.lookup("dsBarBase").getConditionalSum(`templetType == '${type}'`, "count"));
		var idx = dsPie.addRow().getIndex();
		dsPie.putValue(idx, "status", type);
		dsPie.putValue(idx, "count", typeSum);
		
	});
	
	//전체 데이터는 전체 템플릿타입에 status별 합계값으로 보여준다.
	var dsBarAll = app.lookup("dsBarAll");
	dsBarAll.clearData();
	statList.forEach(function(status) {
		var statusSum = Number(app.lookup("dsBarBase").getConditionalSum(`status == '${status}'`, "count"));
		var idx = dsBarAll.addRow().getIndex();
		dsBarAll.putValue(idx, "templetType", "all");
		dsBarAll.putValue(idx, "status", status);
		dsBarAll.putValue(idx, "count", statusSum);
	});
	
	//Bind dataSet and Draw Chart
	app.lookup("pieChart").dataSet = dsPie;
	app.lookup("pieChart").drawChart();
	
	app.lookup("chart_donut").dataSet = dsPie;
	app.lookup("chart_donut").drawChart();
	
	app.lookup("chart_bar1").dataSet = dsBarAll;
	app.lookup("chart_bar1").drawChart();
	
	app.lookup("chart_bar").dataSet = app.lookup("dsBarFilter");
	app.lookup("cmb1").selectItem(0);
}

function windowResize() {
	console.log("windowReSize....");
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
	
	var dsBarFilter = app.lookup("dsBarFilter");
	dsBarFilter.clearData();
	
	statList.forEach(function(each) {
		var condSum = Number(app.lookup("dsBarBase").getConditionalSum(`templetType == '${val}' && status == '${each}'`, "count"));
		var idx = dsBarFilter.addRow().getIndex();
		dsBarFilter.putValue(idx, "templetType", val);
		dsBarFilter.putValue(idx, "status", each);
		dsBarFilter.putValue(idx, "count", condSum);
	});
	
	var rowDiv = app.lookup("grp4").getLayout().getRowDivisions();

	
	if (Number(dsBarFilter.getSum("count")) > 0) {
		rowDiv[0].visible = true;
		rowDiv[1].visible = false;				
		app.lookup("dsGrid3").redraw();
		app.lookup("chart_bar").drawChart();
	} else {
		rowDiv[0].visible = false;
		rowDiv[1].visible = true;
	}
	app.lookup("grp4").getLayout().setRowDivisions(rowDiv);
	app.lookup("grp4").redraw();	
}