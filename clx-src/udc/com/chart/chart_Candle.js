/************************************************
 * chart_Area.js
 * Created at 2020. 7. 8. 오후 6:48:14.
 *
 * @author csj
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function() {
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.drawChart = drawChart;

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(e /* cpr.events.CUIEvent */) {
	var vcChartShl = e.control;
	var voContent = e.content;
	
	// 1. eXBuilder 쉘 및 부모 DOM 요소의 잘림 방지 (도넛 차트 방식과 동일)
	voContent.style.overflow = "visible";
	if (voContent.parentElement) {
		voContent.parentElement.style.overflow = "visible";
	}

	// 2. CSS 스타일 동적 주입 (캔들 차트 전용 잘림 방지 및 호버 애니메이션)
	if (!document.getElementById("sbchart-stock-style")) {
		var styleTag = document.createElement("style");
		styleTag.id = "sbchart-stock-style";
		styleTag.innerHTML = `
			#stockChartWrap, 
			#stockChartWrap *, 
			#stockChartWrap svg {
				overflow: visible !important;
			}

			/* 캔들 및 그래프 요소 트랜지션 설정 */
			#stockChartWrap path,
			#stockChartWrap rect {
				transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out !important;
				cursor: pointer;
			}
		`;
		document.head.appendChild(styleTag);
	}
	
	if (!voContent) return;

	// 쉘에 DOM 컴포넌트 등록
	vcChartShl.registerComponent("sbChartComponent", voContent);

	// 차트 그리기
	drawChart();
}

/** 글로벌 캔들 데이터 및 동적 소수점 자릿수 저장 변수 */
var candlestickData = [];
var dynamicDecimalPlaces = 2; // 기본값

/**
 * 주식 가격 포맷팅 (문자열에서 감지된 정확한 소수점 자릿수 적용)
 */
function formatPrice(val) {
	if (val === null || val === undefined || isNaN(val)) return "0";
	var num = Number(val);
	return num.toLocaleString(undefined, {
		minimumFractionDigits: dynamicDecimalPlaces,
		maximumFractionDigits: dynamicDecimalPlaces
	});
}

/**
 * SBChart를 그립니다. (검색 조건 변경 시 매번 깔끔하게 재생성)
 */
function drawChart() {
	var voContent = app.lookup("shl1").getComponent("sbChartComponent");
	if (!voContent) return;

	// 1. 기존에 있던 차트 껍데기가 있다면 완전히 삭제
	var oldWrap = voContent.querySelector("#stockChartWrap");
	if (oldWrap) {
		oldWrap.remove();
	}

	// 2. 새로운 차트 전용 컨테이너 생성 및 등록
	var newWrap = document.createElement("div");
	newWrap.id = "stockChartWrap";
	newWrap.style.width = "100%";
	newWrap.style.height = "100%";
	newWrap.style.minHeight = "400px";
	voContent.appendChild(newWrap);
	
	/** @type cpr.data.DataSet */
	var vcDataset = app.getAppProperty("dataSet");
	if (!vcDataset) return;

	var rowCount = vcDataset.getRowCount();
	if (rowCount === 0) return;

	candlestickData = [];
	var maxDecimals = 0;

	// 3단계: 문자열 가격 데이터를 분석하여 최대 소수점 자릿수 정확히 감지
	for (var i = 0; i < rowCount; i++) {
		var row = vcDataset.getRow(i);

		["open", "close", "low", "high"].forEach(function (field) {
			var rawVal = row.getValue(field);
			if (rawVal !== null && rawVal !== undefined) {
				var rawValStr = String(rawVal).trim();
				if (rawValStr.indexOf(".") !== -1) {
					var decimalPartLength = rawValStr.split(".")[1].length;
					if (decimalPartLength > maxDecimals) {
						maxDecimals = decimalPartLength;
					}
				}
			}
		});
	}

	dynamicDecimalPlaces = maxDecimals > 0 ? maxDecimals : 2;

	// 4단계: 데이터 파싱 및 캔들 데이터 구성
	for (var i = 0; i < rowCount; i++) {
		var row = vcDataset.getRow(i);

		var rawDate = String(row.getValue("date") || "");
		var formattedDate = rawDate;
		if (rawDate.length === 8) {
			formattedDate = rawDate.substring(0, 4) + "-" + rawDate.substring(4, 6) + "-" + rawDate.substring(6, 8);
		}

		var open = Number(row.getValue("open")) || 0;
		var close = Number(row.getValue("close")) || 0;
		var low = Number(row.getValue("low")) || 0;
		var high = Number(row.getValue("high")) || 0;
		var volume = Number(row.getValue("volume") || row.getValue("vol")) || 0;
		
		var rawSignal = row.getValue("hasSignal");
		var hasSignal = rawSignal === true || rawSignal === "true";

		candlestickData.push({
			date: formattedDate,
			openprc: open,
			closeprc: close,
			lowprc: low,
			highprc: high,
			volume: volume,
			updwn: close >= open ? "UP" : "DN",
			hasSignal: hasSignal
		});
	}

	// SBChart 렌더링
	createStockChart("#stockChartWrap");
}

/**
 * 그리드 행 선택 제어 이벤트를 출판(Dispatch)합니다. (content 속성 사용)
 */
function dispatchRowSelectEvent(candleIndex, rowIndex, candleData) {
	var event = new cpr.events.CUIEvent("rowSelect", {
		content: {
			candleIndex: candleIndex,
			rowIndex: rowIndex,
			data: candleData
		}
	});
	
	app.dispatchEvent(event);
}

/**
 * 텍스트가 차트 좌/우 경계 밖으로 잘리지 않도록 위치 비율에 따라 dynamic offset 계산
 */
function getDynamicOffsetX(index, totalCount, textWidth) {
	var halfWidth = Math.round(textWidth / 2);
	var ratio = (index + 0.5) / totalCount;

	// 우측 경계 근처 (우측 25% 구간): 왼쪽으로 이동
	if (ratio > 0.75) {
		return -textWidth + 15; 
	}

	// 좌측 경계 근처 (좌측 25% 구간): 양수 오프셋을 주어 차트 안쪽(오른쪽)으로 밀어냄
	if (ratio < 0.25) {
		return -5; 
	}

	return -halfWidth;
}

/**
 * SBChart paint 마커 데이터 생성 (최고가/최저가 및 신호 화살표)
 */
function buildPaintMarkers(rows) {
	if (!rows || rows.length === 0) return [];

	var markers = [];
	var totalCount = rows.length;

	var blackArrowPath = [
		{ x: -10, y: 17 },
		{ x: 0, y: 2 },
		{ x: 10, y: 17 },
		{ x: 0, y: 14 }
	];

	// 1. 신호 화살표 마커
	rows.forEach(function (row, index) {
		if (row.hasSignal) {
			markers.push({
				type: "custom",
				position: [{ x: index + 0.5, y: row.lowprc }],
				subShape: [
					{
						type: "path",
						positionPx: blackArrowPath,
						color: "black",
						fillColor: "black"
					}
				]
			});
		}
	});

	// 2. 최고가 / 최저가 위치 계산
	var maxIndex = 0;
	var minIndex = 0;

	for (var i = 1; i < totalCount; i++) {
		if (rows[i].highprc > rows[maxIndex].highprc) maxIndex = i;
		if (rows[i].lowprc < rows[minIndex].lowprc) minIndex = i;
	}

	var maxRow = rows[maxIndex];
	var minRow = rows[minIndex];

	var maxText = "최대수치 : " + formatPrice(maxRow.highprc);
	var minText = "최소수치 : " + formatPrice(minRow.lowprc);

	// 3. 최대수치 마커
	var maxTextWidth = 0;
	for (var j = 0; j < maxText.length; j++) {
		maxTextWidth += (maxText.charCodeAt(j) > 128) ? 11 : 6;
	}
	var maxOffsetX = getDynamicOffsetX(maxIndex, totalCount, maxTextWidth);

	markers.push({
		type: "custom",
		position: [{ x: maxIndex + 0.5, y: maxRow.highprc }],
		subShape: [
			{
				type: "text",
				text: maxText,
				positionPx: [{ x: maxOffsetX, y: -20 }],
				color: "#e53935",
				fillColor: "#e53935",
				font: "12px sans-serif"
			},
			{
				type: "path",
				positionPx: [
					{ x: -6, y: -12 },
					{ x: 6, y: -12 },
					{ x: 0, y: -2 }
				],
				color: "#e53935",
				fillColor: "#e53935"
			}
		]
	});

	// 4. 최소수치 마커
	var minTextWidth = 0;
	for (var k = 0; k < minText.length; k++) {
		minTextWidth += (minText.charCodeAt(k) > 128) ? 11 : 6;
	}
	var minOffsetX = getDynamicOffsetX(minIndex, totalCount, minTextWidth);

	markers.push({
		type: "custom",
		position: [{ x: minIndex + 0.5, y: minRow.lowprc }],
		subShape: [
			{
				type: "text",
				text: minText,
				positionPx: [{ x: minOffsetX, y: 24 }],
				color: "#1e88e5",
				fillColor: "#1e88e5",
				font: "12px sans-serif"
			},
			{
				type: "path",
				positionPx: [
					{ x: -6, y: 12 },
					{ x: 6, y: 12 },
					{ x: 0, y: 2 }
				],
				color: "#1e88e5",
				fillColor: "#1e88e5"
			}
		]
	});

	return markers;
}

/**
 * SBChart 생성 함수
 */
function createStockChart(targetSelector) {
	var minLow = Math.min(...candlestickData.map((d) => d.lowprc));
	var maxHigh = Math.max(...candlestickData.map((d) => d.highprc));
	var maxVolume = Math.max(...candlestickData.map((d) => d.volume));

	var yMin = minLow > 0 ? minLow * 0.98 : minLow * 1.02;
	var yMax = maxHigh * 1.02;

	var maxPriceStr = formatPrice(maxHigh);
	
	// ★ 핵심 수정: 기존 Math.max(130, ...)의 130px 하드코딩 여백을 65px로 줄여 왼쪽 붕 뜨는 현상 해결
	var dynamicLeftPadding = Math.max(65, maxPriceStr.length * 7 + 10);

	sb.chart.render(targetSelector, {
		global: {
			onMouseEvent: function (parm) {
				if (!parm) return;

				if (parm.mouseEventType === "out") {
					dispatchRowSelectEvent(-1, -1, null);
					return;
				}

				if (parm.mouseEventType === "enter" && parm.data) {
					var idx = parm.data.index;
					if (typeof idx === "number" && candlestickData[idx] && candlestickData[idx].hasSignal) {
						dispatchRowSelectEvent(idx, idx, candlestickData[idx]);
					} else {
						dispatchRowSelectEvent(-1, -1, null);
					}
				}
			},
			paint: {
				use: true,
				showControl: false,
				paintJsondata: {
					useBackground: true,
					jsonData: buildPaintMarkers(candlestickData)
				}
			},
			padding: {
				left: 15,
				right: 30,
				bottom: 50
			},
			crosshair: {
				x: {
					format: function (value) {
						var idx = Math.floor(value);
						return candlestickData[idx] ? candlestickData[idx].date : "";
					}
				},
				show: true,
				dotted: false,
				showValueX: true
			}
		},
		grid: {
			x: { show: false }
		},
		legend: {
			show: false
		},
		data: {
			json: candlestickData,
			keys: {
				x: "date",
				value: [
					{
						open: "openprc",
						close: "closeprc",
						low: "lowprc",
						high: "highprc"
					}
				]
			},
			types: {
				openprc: "candlestick",
				closeprc: "candlestick",
				lowprc: "candlestick",
				highprc: "candlestick"
			},
			datarange: {
				position: "auto",
				show: true,
				selectable: false,
				size: { height: 60 },
				backgroundChart: {
					bUseChart: true,
					chartType: "bar",
					seriesKey: "volume",
					strokeColor: "#26a69a",
					color: "#26a69a",
					barWidth: 8,
					syncCrosshair: true,
					// ★ SBChart 서브 차트 축 구조에 맞춰 max 지정
					axis: {
						y: {
							max: maxVolume * 1.4 // 40% 여유 공간 확보 (필요시 1.3 ~ 1.5 조절)
						}
					},
					y: {
						max: maxVolume * 1.4
					}
				},
				drBoundary: {
					strokeColor: "#6b9ae8",
					strokeWidth: 1,
					strokeOpacity: 0.45,
					color: "#8eb4f0",
					opacity: 0
				}
			}
		},
		tooltip: {
			width: "210px",
			grouped: false,
			noUseExpand: true,
			noUseUnexpand: true,
			custom: function (data) {
				if (!data || !data[0]) return "";
				var idx = data[0].index;
				var row = candlestickData[idx];
				if (!row) return "";

				var border =
					row.updwn === "UP"
						? "3px solid #e53935"
						: row.updwn === "DN"
						? "3px solid #1e88e5"
						: "3px solid rgba(255,255,255,0.35)";

				return (
					'<div style="color: white; padding: 12px; line-height: 1.5; border: ' + border + '; border-radius: 6px; background: rgba(30, 30, 30, 0.85);">' +
					'<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">[ ' + row.date + " ]</div>" +
					'<div style="margin-bottom: 4px;">고가 : ' + formatPrice(row.highprc) + "</div>" +
					'<div style="margin-bottom: 4px;">시가 : ' + formatPrice(row.openprc) + "</div>" +
					'<div style="margin-bottom: 4px;">종가 : ' + formatPrice(row.closeprc) + "</div>" +
					'<div style="margin-bottom: 4px;">저가 : ' + formatPrice(row.lowprc) + "</div>" +
					'<div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.2); color: #26a69a; font-weight: bold;">거래량 : ' + Number(row.volume).toLocaleString() + "</div>" +
					"</div>"
				);
			}
		},
		axis: {
			x: {
				type: "category",
				tick: {
					outer: false,
					centered: true,
					width: 100,
					autoSkipOverlap: true,
					line: { show: false }
				}
			},
			y: {
				tick: {
					outer: false,
					line: { show: false },
					format: function (value) {
						return formatPrice(value);
					}
				},
				min: yMin,
				max: yMax
			}
		},
		extend: {
			candlestick: {
				marker: { show: false }
			}
		}
	});
}
