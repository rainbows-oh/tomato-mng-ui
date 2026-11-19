/*******************************************************************************
 * Business Category :
 * Screen ID : DonutChart.js
 * Screen Name :
 * Created Date :  2026. 11. 19. 오후 2:37:36
 * Creator : chwec
 * Revision History
 *******************************************************************************
 * Date				Name				Description
 *******************************************************************************
 *
 *******************************************************************************/

/*******************************************************************************
 * Common Module Area
 *******************************************************************************/
 var util = createCommonUtil();

/*******************************************************************************
 * Business Common Module Area
 *******************************************************************************/
exports.getText = getText;
exports.drawChart = drawChart;


/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
var chartId;

/** 템플릿 타입별 색상 (status 명칭 기준) */
var TYPE_COLORS = {
	"Unstructured": "#5B5BF0",
	"Structured": "#D98324",
	"Database Form": "#0E7A5F",
	"Disclosure Notice": "#D63864",
	"Listing Notice": "#9B1B3C",
	"TP Announcements": "#E07B28"
};

/** 명칭이 TYPE_COLORS 에 없을 때 순서대로 사용할 색상 */
var FALLBACK_COLORS = ["#5B5BF0", "#D98324", "#0E7A5F", "#9B1B3C", "#3ECF9E", "#E8B33A", "#D63864", "#18A97C"];


/*******************************************************************************
 * Onload and Submission Call Area
 * (Contains related events and submission calls, along with callback functions invoked upon screen loading.)
 *******************************************************************************/


/*******************************************************************************
 * Validation Check Area
 *******************************************************************************/


/*******************************************************************************
 * User-Defined JavaScript Functions
 *******************************************************************************/
/**
 * Returns the text to be displayed for the UDC control in the grid's view mode.
 */
function getText() {
	return "";
};

function getColor(name, index) {
	return TYPE_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

/**
 * 데이터셋(status, count)으로 도넛 차트와 하단 범례를 다시 그립니다.
 */
function drawChart() {
	var voContent = app.lookup("shl1").getComponent("sbChartComponent");
	if (!voContent) return;

	// 1. 기존 컨테이너 삭제
	var oldWrap = voContent.querySelector("#" + chartId);
	if (oldWrap) {
		oldWrap.parentNode.removeChild(oldWrap);
	}

	// 2. 새 컨테이너 생성 (도넛 위, 범례 아래)
	var newWrap = document.createElement("div");
	newWrap.id = chartId;
	newWrap.style.width = "100%";
	newWrap.style.height = "100%";
	newWrap.style.display = "flex";
	newWrap.style.flexDirection = "column";
	newWrap.style.alignItems = "center";
	voContent.appendChild(newWrap);

	var donutBox = document.createElement("div");
	donutBox.id = chartId + "_donut";
	donutBox.style.width = "100%";
	donutBox.style.flex = "0 0 auto";
	donutBox.style.height = "220px";
	newWrap.appendChild(donutBox);

	var legendBox = document.createElement("ul");
	legendBox.className = "udc-donut-legend";
	legendBox.style.width = "100%";
	legendBox.style.margin = "16px 0 0 0";
	legendBox.style.padding = "0";
	legendBox.style.listStyle = "none";
	newWrap.appendChild(legendBox);

	// 3. 데이터셋
	/** @type cpr.data.DataSet */
	var vcDataset = app.getAppProperty("dataSet");
	if (!vcDataset) return;

	var rowCount = vcDataset.getRowCount();
	if (rowCount === 0) return;

	// 4. 데이터 추출
	var columns = [];
	var colors = [];
	for (var i = 0; i < rowCount; i++) {
		var row = vcDataset.getRow(i);
		var name = String(row.getValue("status") || "");
		var count = Number(row.getValue("count")) || 0;
		var color = getColor(name, i);

		columns.push([name, count]);
		colors.push(color);
		legendBox.appendChild(createLegendItem(name, count, color));
	}

	// 5. 차트 렌더링
	createDonutChart("#" + chartId + "_donut", columns, colors, vcDataset.getSum("count"));
}

/**
 * 범례 한 줄 (색상 점 + 명칭 + 우측 정렬 수치)
 */
function createLegendItem(name, count, color) {
	var li = document.createElement("li");
	li.style.display = "flex";
	li.style.alignItems = "center";
	li.style.padding = "3px 0";
	li.style.fontSize = "12px";
	li.style.color = "#334155";

	var dot = document.createElement("span");
	dot.style.flex = "0 0 auto";
	dot.style.width = "8px";
	dot.style.height = "8px";
	dot.style.borderRadius = "50%";
	dot.style.marginRight = "8px";
	dot.style.backgroundColor = color;
	li.appendChild(dot);

	var label = document.createElement("span");
	label.style.flex = "1 1 auto";
	label.textContent = name;
	li.appendChild(label);

	var value = document.createElement("span");
	value.style.flex = "0 0 auto";
	value.textContent = count;
	li.appendChild(value);

	return li;
}

/**
 * SBChart 도넛 차트 옵션 설정 및 렌더링
 */
function createDonutChart(targetSelector, columnsData, colors, total) {
	sb.chart.render(targetSelector, {
		global: {
			size: {
				displayHeight: 220
			},
			color: {
				// 데이터 순서대로 조각 색상 지정 (data.colors 는 이 라이브러리에서 적용되지 않음)
				pattern: colors
			}
		},
		data: {
			columns: columnsData,
			type: "donut"
		},
		extend: {
			donut: {
				title: {
					type: "html",
					text: '<p style="text-align:center;"><span style="font-size:24px;font-weight:700;">' + total + '</span><br><span style="font-size:11px;">Total</span></p>'
				}
			}
		},
		legend: {
			show: false
		},
		tooltip: {
			format: {
				value: function(value, ratio) {
					var percent = Math.round(ratio * 100);
					return value + "(" + percent + "%)";
				}
			}
		}
	});
}

/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/
/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(e /* cpr.events.CUIEvent */ ) {
	var vcChartShl = e.control;
	var voContent = e.content;

	chartId = app.getAppProperty("chartId") ? app.getAppProperty("chartId") : "donutChartWrap";
	if (!voContent) return;

	// eXBuilder 쉘 및 부모 DOM 요소의 잘림 방지
	voContent.style.overflow = "visible";
	if (voContent.parentElement) {
		voContent.parentElement.style.overflow = "visible";
	}

	vcChartShl.registerComponent("sbChartComponent", voContent);
	drawChart();
}
