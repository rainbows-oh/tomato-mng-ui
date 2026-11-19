/*******************************************************************************
 * Business Category :
 * Screen ID : BarChart01.js
 * Screen Name :
 * Created Date :  2026. 11. 19. 오후 2:37:03
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

/** 상태별 막대 색상 (status 명칭 기준) */
var STATUS_COLORS = {
	"New Submission": "#5B5BF0",
	"Under Review": "#D98324",
	"Forwarded": "#E8B33A",
	"For Approval": "#E07B28",
	"For Filing": "#D4551F",
	"Rejected": "#D63864",
	"Cancelled": "#9B1B3C",
	"Filed": "#0E7A5F",
	"Circular": "#18A97C",
	"Company Report": "#2BBF8F",
	"Disclosure Notice": "#22B5A0",
	"Listing Notice": "#3ECF9E",
	"TP Announcement": "#2FC27C",
	"Changed": "#27AE60"
};

/** 명칭이 STATUS_COLORS 에 없을 때 순서대로 사용할 색상 */
var FALLBACK_COLORS = ["#5B5BF0", "#D98324", "#E8B33A", "#E07B28", "#D4551F", "#D63864", "#9B1B3C", "#0E7A5F", "#18A97C", "#2BBF8F", "#22B5A0", "#3ECF9E", "#2FC27C", "#27AE60"];


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

/**
 * 데이터셋(status, count)으로 막대 차트를 다시 그립니다.
 */
function drawChart() {
	var voContent = app.lookup("shl1").getComponent("sbChartComponent");
	if (!voContent) return;

	// 1. 기존 차트 컨테이너 삭제
	var oldWrap = voContent.querySelector("#" + chartId);
	if (oldWrap) {
		oldWrap.parentNode.removeChild(oldWrap);
	}

	// 2. 새 차트 컨테이너 생성
	var newWrap = document.createElement("div");
	newWrap.id = chartId;
	newWrap.className = "udc-bar-chart";
	newWrap.style.width = "100%";
	newWrap.style.height = "100%";
	newWrap.style.position = "relative";
	voContent.appendChild(newWrap);

	// 3. 데이터셋
	/** @type cpr.data.DataSet */
	var vcDataset = app.getAppProperty("dataSet");
	if (!vcDataset) return;
	if (vcDataset.getRowCount() === 0) return;

	// 4. 차트 렌더링
	createBarChart("#" + chartId, vcDataset.getRowDataRanged(), vcDataset.getColumnData("status"));
}

/**
 * SBChart 가로 막대 차트 옵션 설정 및 렌더링
 */
function createBarChart(targetSelector, barDatas, categories) {
	sb.chart.render(targetSelector, {
		data: {
			json: barDatas,
			type: "bar",
			keys: {
				x: "status",
				value: ["count"]
			},
			labels: {
				format: function(value) {
					return value;
				}
			}
		},
		legend: {
			show: false
		},
		extend: {
			bar: {
				showZeroValue: true,
				borderRadius: 2,
				dataLabelPosition: "right",
				barFormat: function(parm) {
					var rtn = {};
					var name = categories[parm.index];
					rtn.fillColor = STATUS_COLORS[name] || FALLBACK_COLORS[parm.index % FALLBACK_COLORS.length];
					return rtn;
				}
			}
		},
		axis: {
			x: {
				type: "category",
				categories: categories,
				tick: {
					centered: true,
					fit: true,
					multiline: false,
					width: 200,
					line: {
						show: false
					}
				},
				domain: {
					show: false
				}
			},
			y: {
				tick: {
					count: 5,
					line: {
						show: false
					},
					format: function(val) {
						return Math.round(val);
					}
				},
				domain: {
					show: false
				}
			},
			rotated: true
		},
		tooltip: {
			custom: function(data) {
				return '<div style="color: white; margin:3px;">' + categories[data[0].index] + " : " + data[0].value + '</div>';
			}
		},
		grid: {
			x: {
				show: false
			},
			y: {
				ticks: 5,
				useLineStyle: true,
				lineStyle: {
					strokeStyle: "dotted",
					strokeWidth: 1,
					strokeOpacity: 0.5
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

	chartId = app.getAppProperty("chartId") ? app.getAppProperty("chartId") : "barChart01Wrap";
	if (!voContent) return;

	// eXBuilder 쉘 및 부모 DOM 요소의 잘림 방지
	voContent.style.overflow = "visible";
	if (voContent.parentElement) {
		voContent.parentElement.style.overflow = "visible";
	}

	vcChartShl.registerComponent("sbChartComponent", voContent);
	drawChart();
}
