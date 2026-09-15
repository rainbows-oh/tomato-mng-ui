/*******************************************************************************
 * Business Category :
 * Screen ID : chart_Pie.js
 * Screen Name : 
 * Created Date :  2026. 9. 14. 오전 11:08:24
 * Creator : user
 * Revision History
 *******************************************************************************
 * Date				Name				Description
 *******************************************************************************
 * 
 *******************************************************************************/


/*******************************************************************************
 * Business Common Module Area
 *******************************************************************************/
exports.getText = getText;

exports.drawChart = drawChart;

var moChart = null;
var maData = [];

/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
var chartId;

/*******************************************************************************
 * User-Defined JavaScript Functions
 *******************************************************************************/
/**
  * Returns the text to be displayed for the UDC control in the grid's view mode.
  */
function getText() {
	return "";
};

/**
 * 데이터셋에서 데이터를 추출하여 파이 차트를 그립니다.
 */
function drawChart() {
	var voContent = app.lookup("shl1").getComponent("sbChartComponent");
	if (!voContent) return;

	// 1. 기존 차트 컨테이너 삭제
	var oldWrap = voContent.querySelector(`#${chartId}`);
	if (oldWrap) {
		oldWrap.remove();
	}

	// 2. 새 차트 컨테이너 생성 (85% 크기 + 중앙 정렬)
	var newWrap = document.createElement("div");
	newWrap.id = chartId;
	newWrap.style.width = "85%";
	newWrap.style.height = "85%";
	newWrap.style.position = "relative";
	newWrap.style.top = "7.5%";
	newWrap.style.margin = "0 auto";
	
	voContent.appendChild(newWrap);

	// 3. 앱 데이터셋 가져오기
	/** @type cpr.data.DataSet */
	var vcDataset = app.getAppProperty("dataSet");
	if (!vcDataset) return;

	var rowCount = vcDataset.getRowCount();
	if (rowCount === 0) return;

	// 4. 데이터 추출
	var pieColumns = [];
	for (var i = 0; i < rowCount; i++) {
		var row = vcDataset.getRow(i);
		var statusName = String(row.getValue("status") || "");
		var countValue = Number(row.getValue("count")) || 0;

		pieColumns.push([statusName, countValue]);
	}

	// 5. 차트 렌더링 호출
	createPieChart(`#${chartId}`, pieColumns);

	// 6. 마우스 호버 시 중심에서 밖으로 밀어내는 이벤트 등록
	attachPieExplodeEvent();
}

/**
 * SBChart 파이 차트 옵션 설정 및 렌더링
 */
function createPieChart(targetSelector, columnsData) {
	sb.chart.render(targetSelector, {
		title: {
			text: "Monthly Status",
			position: "top-left"
		},
		data: {
			columns: columnsData,
			type: "pie",
			colors: {
				"New Submission": "#1160a2", // 파랑
				"Changed": "#8ea81b",        // 연두
				"Filed": "#a31219",          // 버건디
				"For Filing": "#f88102",     // 오렌지
				"Circular": "#fcd036"        // 노랑
			}
		},
		pie: {
			expand: false, // 자체 expand 차단
			label: {
				show: true,
				format: function (value, ratio, id) {
					return value;
				}
			}
		},
		legend: {
			position: "right"
		},
		tooltip: {
			format: {
				value: function (value, ratio, id) {
					var percent = Math.round(ratio * 100);
					return value + "(" + percent + "%)";
				}
			}
		}
	});
}

/**
 * SBChart 내부 각도 데이터를 이용해 양쪽 조각과 균일한 간격을 유지하며 방사형으로 밀어내는 이벤트
 */
function attachPieExplodeEvent() {
	var chartWrap = document.getElementById(chartId);
	if (!chartWrap) return;

	chartWrap.addEventListener("mouseover", function(e) {
		var target = e.target;
		if (target && target.tagName && target.tagName.toLowerCase() === "path") {
			// SBChart(C3/D3) 내부 데이터 객체 추출 (path 또는 부모 g 요소)
			var d = target.__data__ || (target.parentNode && target.parentNode.__data__);

			// 파이 조각의 시작 각도와 끝 각도가 존재할 경우
			if (d && typeof d.startAngle === "number" && typeof d.endAngle === "number") {
				// 1. 부채꼴의 정확한 중앙 방위 각도 계산 (라디안)
				var midAngle = (d.startAngle + d.endAngle) / 2;
				var offset = 16; // ★ 바깥으로 밀려날 거리 (px 단위, 원하는 대로 조절 가능)

				// 2. D3 기준(12시 방향 = 0도)에 맞춘 정확한 방사형 이동 좌표(X, Y) 계산
				var moveX = Math.sin(midAngle) * offset;
				var moveY = -Math.cos(midAngle) * offset;

				// 3. 변형 적용 (CSS transition에 의해 부드럽게 이동)
				target.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
			}
		}
	});

	chartWrap.addEventListener("mouseout", function(e) {
		var target = e.target;
		if (target && target.tagName && target.tagName.toLowerCase() === "path") {
			target.style.transform = "translate(0px, 0px)";
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
function onShl1Load(e /* cpr.events.CUIEvent */) {
	var vcChartShl = e.control;
	var voContent = e.content;

	chartId = app.getAppProperty("chartId") ? app.getAppProperty("chartId") : "pieChartWrap";
	if (!voContent) return;

	// eXBuilder 쉘 및 부모 DOM 요소의 잘림 방지
	voContent.style.overflow = "visible";
	if (voContent.parentElement) {
		voContent.parentElement.style.overflow = "visible";
	}

	// CSS 스타일 동적 주입 (JS transform 애니메이션 연결)
	if (!document.getElementById("sbchart-pie-hover-style")) {
		var styleTag = document.createElement("style");
		styleTag.id = "sbchart-pie-hover-style";
		styleTag.innerHTML = `
			#${chartId}, 
			#${chartId} *, 
			#${chartId} svg {
				overflow: visible !important;
			}

			/* 조각 트랜지션 및 입체 그림자 설정 */
			#${chartId} path {
				transition: transform 0.2s ease-in-out !important;
				stroke: #ffffff !important;
				stroke-width: 1.5px !important;
				filter: drop-shadow(2px 3px 4px rgba(0, 0, 0, 0.3)) !important;
				cursor: pointer;
			}
		`;
		document.head.appendChild(styleTag);
	}

	vcChartShl.registerComponent("sbChartComponent", voContent);
	drawChart();
}