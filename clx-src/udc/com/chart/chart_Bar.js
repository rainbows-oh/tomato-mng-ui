/************************************************
 * chart_line.js
 * Created at 2020. 7. 8. 오후 6:48:14.
 *
 * @author csj
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function() {
	return "";
};
exports.drawChart = drawChart;

var moChart = null;
var maData = [];

var colorList = ["red","orange","yellow", "green", "blue", "navy", "purple", "black", "wine"];

var chartId;
/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(e /* cpr.events.CUIEvent */ ) {
	var vcChartShl = e.control;
	var voContent = e.content;
	
	chartId = app.getAppProperty("chartId") ? app.getAppProperty("chartId") : "chartWrap";
	if (!voContent) return;
	
	// eXBuilder 쉘 및 부모 DOM 요소의 잘림 방지
	voContent.style.overflow = "visible";
	if (voContent.parentElement) {
		voContent.parentElement.style.overflow = "visible";
	}
	
	// CSS 스타일 동적 주입 (JS transform 애니메이션 연결)
	
	vcChartShl.registerComponent("sbChartComponent", voContent);
	drawChart();
}

/**
 * 데이터셋에서 데이터를 추출하여 파이 차트를 그립니다.
 */
function drawChart(config) {
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
	var barDatas = vcDataset.getRowDataRanged();
	console.log(barDatas);
	var categories = vcDataset.getColumnData("status");
	
	//	for (var i = 0; i < rowCount; i++) {
	//		var row = vcDataset.getRow(i);
	//		var statusName = String(row.getValue("status") || "");
	//		var countValue = Number(row.getValue("count")) || 0;
	//		
	//		barColumns.push([statusName, countValue]);
	//	}
	// 5. 차트 렌더링 호출
	createBarChart(`#${chartId}`, barDatas, categories);
}

/**
 * SBChart 파이 차트 옵션 설정 및 렌더링
 */
function createBarChart(targetSelector, barDatas, categories) {
	sb.chart.render(`#${chartId}`, {
			global: {
				color: {
					theme: "pastel",
				},
			},
			data: {
				json: barDatas,
				type: "bar",
				keys: {
					x: "status",
					value: ["count"]
				},
				labels: {
					format: function(value, id, index, ratio, originJson) {
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
					topRadius: 5,
					dataLabelPosition: "right",
					barFormat: function(parm) {
						console.log(parm);
						let rtn = {};
						if(colorList[parm.index]){
							rtn.fillColor = colorList[parm.index];							
						}
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
					 return Math.round(val); }
				},
				domain: {
					strokeStyle: "dotted"
				}
			},
			rotated: true,
		},
		tooltip: {
			custom: function(data) {
				return '<div style="color: white; margin:3px;">' + categories[data[0].index] + " : " + data[0].value + " submissions" + '</div>';
			}
		},
		grid: {
			x: {
				show: false,
			},
			y: {
				ticks: 5,
				useLineStyle: true,
				lineStyle: {
					strokeStyle: "dotted",
					strokeWidth: 1,
					strokeOpacity: 0.5,
				},
			}
		},
	});
}