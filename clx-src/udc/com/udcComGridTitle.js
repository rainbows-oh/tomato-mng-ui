/************************************************
 * udcComGridTitle.js
 * Created at 2024. 7. 22. 오전 9:01:06.
 *
 * @author ryu
 ************************************************/

/************************************************
 * 공통 모듈 선언
 ************************************************/
var util = createCommonUtil();

/*
 * <sheetJs 제약사항>
 * 1-1. applyClassStyle = false 인 경우 스타일은 인라인으로 직접 설정 or 전역으로 색상코드로 설정 가능
 * 1-2. applyClassStyle = true 인 경우 클래스 스타일도 적용
 * 		-> border-style, border-color, background-color, color, font-size, font-weight(bold 인 경우), text-align, vertical-align 적용
 * 		-> 변수 사용 (ex. @primary) 및 16진수(ex. #fefefe) 로 스타일 지정된 경우 적용 가능.
 * 		-> 단, css 기본색상 (ex. red) 인 경우 컴파일 옵션 소스 난독화 사용시에만 가능합니다.
 * 		-> border을 축약하여 스타일을 작성하는 경우, 1px solid @blue; 형식으로 작성해야 합니다.
 * 2. 틀 고정, 이미지, 차트, 표 기능은 pro 에서만 제공
 * 3. 폰트 사이즈는 px 사용 권장 (px 기준으로만 적용)
 * 4. 페이징 처리 시 전체 그리드를 다운로드 원할 시에는 서버 권장
 * 5. datatype=number이고 format 설정했을 경우, 엑셀에서 제공되는 포맷 형식만 적용
 * 	  -> s#,##0 -> #,##0으로 변환하는 코드 작성 했습니다.
 */

/************************************************
 * 전역 변수 (엑셀 다운로드에서 사용)
 ************************************************/
var EXCEL_STYLE = {
	HEADER_BG_COLOR: "dddddd", // 그리드 헤더 배경 색상
	HEADER_COLOR: "000000", // 헤더 텍스트 색상
	DETAIL_BG_COLOR: "FFFFFF", // 디테일 배경 색상
	GROUP_HEADER_BG_COLOR: "F8F8F8", // 그룹 헤더 배경 색상
	GROUP_FOOTER_BG_COLOR: "dbdfea", // 그룹 푸터 배경 색상
	FOOTER_BG_COLOR: "cde2fe", // 푸터 배경 색상
	FOOTER_COLOR: "000000", // 푸터 텍스트 색상
	BORDER_STYLE: "thin", // border 선 스타일 (ex. thick, thin, dashed, dotted ...)
	BORDER_COLOR: "bbbbbb", // border 색 스타일
	VERTICAL_ALIGN: "center", // vertical-align (ex. top, center, bottom)
	HORIZONTAL_ALIGN: "center", // horizontal-align (ex. left, center, right)
	FONT_SIZE: "11", // 폰트 사이즈
	FONT_FAMILY: "Calibri", // 폰트
	FONT_BOLD: false, // bold
	FONT_ITALIC: false // italic
};

/************************************************
 * 사용자 함수
 ************************************************/

/**
 * 프린트할 html 반환
 */
function getHTMLToGrid(gridArr, pageInfo) {
	var htmlTagArr = [];
	htmlTagArr[htmlTagArr.length] = "<div class='page'>";
	
	if (pageInfo != null) {
		// 제목
		if (pageInfo.hasOwnProperty("title")) {
			htmlTagArr[htmlTagArr.length] = "<h1>" + pageInfo["title"] + "</h1>";
		}
		// 결재선 테이블
		if (pageInfo.hasOwnProperty("approvalLine")) {
			var approvalLineTagArr = [];
			approvalLineTagArr[approvalLineTagArr.length] = "<table class='approval_table' >";
			approvalLineTagArr[approvalLineTagArr.length] = "<tr>";
			for (var i = 0; i < pageInfo["approvalLine"].length; i++) {
				approvalLineTagArr[approvalLineTagArr.length] = "<td>" + pageInfo["approvalLine"][i] + "</td>";
			}
			approvalLineTagArr[approvalLineTagArr.length] = "</tr><tr>";
			for (var i = 0; i < pageInfo["approvalLine"].length; i++) {
				approvalLineTagArr[approvalLineTagArr.length] = "<td></td>";
			}
			approvalLineTagArr[approvalLineTagArr.length] = "</tr>";
			approvalLineTagArr[approvalLineTagArr.length] = "</table>";
			htmlTagArr[htmlTagArr.length] = approvalLineTagArr.join("");
		}
	}
	
	// 그리드
	for (var i = 0; i < gridArr.length; i++) {
		htmlTagArr[htmlTagArr.length] = getGridTable(gridArr[i]).join("");
		
		if (i != (gridArr.length - 1)) {
			htmlTagArr[htmlTagArr.length] = "<div style='page-break-before: always; '> </div>";
		}
	}
	htmlTagArr[htmlTagArr.length] = "</div>";
	
	return htmlTagArr.join("");
}

/**
 * 그리드 데이터를 통한 table 반환
 * @param {cpr.controls.Grid} grid
 */
function getGridTable(grid) {
	var exportData = grid.getExportData({
		exceptStyle: false,
		applyFormat: true,
		applySuppress: true
	});
	
	var tableTagArr = [];
	tableTagArr[tableTagArr.length] = "<table class='cl-control cl-grid'>";
	var cols = exportData.cols;
	tableTagArr[tableTagArr.length] = "<colgroup>";
	var colWidths = [];
	var totalColumnWidth = 0;
	for (var ci = 0; ci < cols.length; ci++) {
		var colWidth = cpr.utils.ParamUtil.parseSize(cols[ci]["width"]).size;
		totalColumnWidth += colWidth;
		colWidths[colWidths.length] = colWidth;
	}
	for (var ci = 0; ci < colWidths.length; ci++) {
		tableTagArr[tableTagArr.length] = "<col style='width : " + (colWidths[ci] / totalColumnWidth) + "%'>";
	}
	tableTagArr[tableTagArr.length] = "</colgroup>";
	
	var layouts = exportData.rowgroups;
	for (var li = 0; li < layouts.length; li++) {
		var layout = layouts[li];
		var datas = layout.data;
		var styles = layout.style;
		var trTagArr = [];
		
		// 셀별 데이터를 trTagArr에 배열로 추가
		for (var ri = 0; ri < datas.length; ri++) {
			var tdTagArr = [];
			for (var ci = 0; ci < datas[ri].length; ci++) {
				var rowIndex = styles[ci]["rowindex"];
				if (tdTagArr[rowIndex] == null) {
					tdTagArr[rowIndex] = [];
				}
				if (Object.keys(datas[ri][ci]).length != 0) {
					tdTagArr[rowIndex][tdTagArr[rowIndex].length] = getTd(datas[ri][ci], styles[ci]).join("");
				}
			}
			trTagArr = trTagArr.concat(tdTagArr);
		}
		
		if (layout["region"] == "header") {
			tableTagArr[tableTagArr.length] = "<thead class='cl-grid-header'>";
		}
		for (var tri = 0; tri < trTagArr.length; tri++) {
			tableTagArr[tableTagArr.length] = "<tr class='cl-grid-row'>";
			tableTagArr[tableTagArr.length] = trTagArr[tri].join("");
			tableTagArr[tableTagArr.length] = "</tr>";
		}
		if (layout["region"] == "header") {
			tableTagArr[tableTagArr.length] = "</thead>";
		}
	}
	
	tableTagArr[tableTagArr.length] = "</table>";
	return tableTagArr;
	
}

/**
 * 셀 데이터를 통한 td 반환
 * @param {any} cell
 * @param {any} columnInfo
 * @returns {string[]}
 */
function getTd(cell, columnInfo) {
	var value = cell["value"];
	var cellStyle = cell["style"];
	var columnStyle = columnInfo["style"];
	var style = _.extend({}, columnStyle, cellStyle);
	var styleKeys = Object.keys(style);
	
	var tdTagArr = [];
	tdTagArr[tdTagArr.length] = "<td class='cl-grid-cell'";
	if (cell.hasOwnProperty("rowspan")) {
		if (cell["rowspan"] > 1) {
			tdTagArr[tdTagArr.length] = " rowspan='" + cell["rowspan"] + "'";
		}
	} else if (columnInfo["rowspan"] > 1) {
		tdTagArr[tdTagArr.length] = " rowspan='" + columnInfo["rowspan"] + "'";
	}
	if (cell.hasOwnProperty("colspan")) {
		if (cell["colspan"] > 1) {
			tdTagArr[tdTagArr.length] = " colspan='" + cell["colspan"] + "'";
		}
	} else if (columnInfo["colspan"] > 1) {
		tdTagArr[tdTagArr.length] = " colspan='" + columnInfo["colspan"] + "'";
	}
	
	if (styleKeys.length > 0) {
		tdTagArr[tdTagArr.length] = " style='";
		for (var si = 0; si < styleKeys.length; si++) {
			tdTagArr[tdTagArr.length] = styleKeys[si] + " : " + style[styleKeys[si]] + "; ";
		}
		tdTagArr[tdTagArr.length] = "'";
	}
	tdTagArr[tdTagArr.length] = ">" + value + "</td>";
	
	return tdTagArr;
}

/**
 * 그리드 컨트롤 바인딩 여부
 * @returns {Boolean}
 */
function isGridCtrl() {
	/**@type cpr.controls.Grid */
	var grid = app.getAppProperty("ctrl");
	if (grid == null || grid.type !== "grid") {
		util.Msg.alertDlg(app, "Can not find Target Grid Control!");
		return false;
	}
	return true;
}
/************************************************
 * 이벤트 핸들러
 ************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	var vcCtrl = app.getAppProperty("ctrl");
	if (vcCtrl) {
		
		var vsTitle = app.getAppProperty("title");
		var vsFieldLabel = vcCtrl.fieldLabel;
		
		if (ValueUtil.isNull(vsTitle) || "No Title" == vsTitle) {
			if (ValueUtil.isNull(vsFieldLabel)) {
				app.lookup("optTilte").value = "No Title";
			} else {
				app.lookup("optTilte").value = vsFieldLabel;
			}
			
		} else {
			app.lookup("optTilte").value = vsTitle;
		}
		
		if (vcCtrl.type == "grid") {
			if (vcCtrl.dataSet) {
				app.setAppProperty("rowCount", vcCtrl.dataSet.getRowCount());
			} else {
				app.setAppProperty("rowCount", "0");
			}
		}
	}
	
	//다운로드 권한이 없으면... 엑셀버튼 숨김
	if (util.Main.getMenuInfo(app, "DOWNLD_YN") !== "Y") {
		//app.setAppProperty("showExportExcel", false);
	}
	
	//모바일 화면이면... 엑셀버튼 숨김
	//	var mainApp = util.getMainApp(app);
	//	if(mainApp){
	//		if(mainApp.getContainer().userAttr("adaptive-screen") === "true"){
	//			app.setAppProperty("showExportExcel", false);
	//			
	//			var layout = app.lookup("grp1").getLayout();
	//			layout.setColumnVisible(1, false);
	//			layout.setColumnVisible(2, false);
	//			layout.setColumnVisible(3, false);
	//			layout.setColumnVisible(4, false);
	//		}
	//	}
}

/*
 * 루트 컨테이너에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(e) {
	if (e.property == "rowCount") {
		app.lookup("optRowCount").redraw();
	}
	//	}else if(e.property == "title"){
	//		app.lookup("optTilte").value = e.newValue;
	//	}
}

/*
 * 버튼(btnTools)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnToolsClick(e) {
	if(!isGridCtrl()) return false;
	
	/**@type cpr.controls.Grid */
	var grid = app.getAppProperty("ctrl");
	
	var vsGridKey = grid.getAppInstance().id + grid.id;
	
	var ctxMenu = new cpr.controls.Menu("ctx_menu");
	ctxMenu.addItem(new cpr.controls.MenuItem("정렬", "sort", "root"));
	ctxMenu.addItem(new cpr.controls.MenuItem("정렬 표시", "sortable", "sort"));
	ctxMenu.addItem(new cpr.controls.MenuItem("정렬 초기화", "sortInit", "sort"));
	ctxMenu.addItem(new cpr.controls.MenuItem("정렬 취소", "sortCancel", "sort"));
	ctxMenu.addItem(new cpr.controls.MenuItem("필터", "filter", "root"));
	ctxMenu.addItem(new cpr.controls.MenuItem("필터 표시", "filterable", "filter"));
	ctxMenu.addItem(new cpr.controls.MenuItem("필터 초기화", "filterInit", "filter"));
	ctxMenu.addItem(new cpr.controls.MenuItem("필터 취소", "filterCancel", "filter"));
	ctxMenu.addItem(new cpr.controls.MenuItem("개인화", "personalized", "root"));
	ctxMenu.addItem(new cpr.controls.MenuItem("초기화", "initial", "root"));
	//	ctxMenu.addItem(new cpr.controls.MenuItem("인쇄", "print", "root"));
	
	// 인쇄시 그리드에 선택된 행이 존재할 경우 컨트롤 영역이 보여져 그리드 선택 clear 후 재 선택되도록 수정 (2021.07.29 추가)
	var vaGrdSelectIdx = grid.getSelectedIndices();
	ctxMenu.addEventListener("before-selection-change", function(e) {
		vaGrdSelectIdx = grid.getSelectedIndices();
		grid.clearSelection();
	});
	
	// 인쇄시 그리드에 선택된 행이 존재할 경우 컨트롤 영역이 보여져 그리드 선택 clear 후 재 선택되도록 수정 (2021.07.29 추가)
	ctxMenu.addEventListener("dispose", function(e) {
		grid.selectRows(vaGrdSelectIdx);
	});
	
	ctxMenu.addEventListener("item-click", function( /**@type cpr.events.CItemEvent */ e) {
		var itemValue = e.item.value;
		
		if (itemValue == "sort" || itemValue == "filter") {
			//정렬, 필터 선택시 컨텍스트 메뉴가 닫히지 않음
			ctxMenu.selectItem(ctxMenu.selectItemByValue(itemValue));
			return;
			//정렬 표시
		} else if (itemValue == "sortable") {
			for (var i = 0, len = grid.header.cellCount; i < len; i++) {
				grid.header.getColumn(i).sortable = true;
			}
			//정렬 초기화
		} else if (itemValue == "sortInit") {
			if (grid) grid.header.clearSort();
			//정렬 취소
		} else if (itemValue == "sortCancel") {
			if (grid) grid.header.clearSort();
			for (var i = 0, len = grid.header.cellCount; i < len; i++) {
				grid.header.getColumn(i).sortable = false;
			}
			//필터 보여주기
		} else if (itemValue == "filterable") {
			var isHFiltered = false;
			var column, filterStr;
			for (var i = 0, len = grid.header.cellCount; i < len; i++) {
				column = grid.header.getColumn(i);
				filterStr = column.getFilter();
				if (filterStr != null && filterStr[0] != "__all__") {
					isHFiltered = true;
					break;
				}
			}
			if (!isHFiltered) {
				var hTRowIndex = app.getAppProperty("headerRowIndex");
				for (var i = 0, len = grid.header.cellCount; i < len; i++) {
					column = grid.header.getColumn(i);
					if (hTRowIndex > -1) {
						if ((column.rowIndex + column.rowSpan) == (hTRowIndex + 1) && column.targetColumnName != "") {
							column.filterable = true;
						}
					} else {
						if (column.targetColumnName != "") {
							column.filterable = true;
						}
					}
				}
			}
			//필터 초기화
		} else if (itemValue == "filterInit") {
			if (grid) grid.header.clearFilter();
			//필터 해제 및 필터 숨김 (필터 취소)
		} else if (itemValue == "filterCancel") {
			if (grid) {
				grid.header.clearFilter();
				for (var i = 0, len = grid.header.cellCount; i < len; i++) {
					grid.header.getColumn(i).filterable = false;
				}
			}
			//인쇄
		} else if (itemValue == "print") {
			/*
			var targetEle = document.getElementById("uuid-"+grid.uuid);
			// 3.DOM의 text를 얻습니다.
			var content = targetEle.innerHTML;
			// 오픈되는 윈도우에 프린트하려는 데이터를 공유합니다.
		    sessionStorage.setItem("print-content", content);
		    var windowWidth = (window.innerWidth | document.body.clientWidth)-500;
			var windowHeight = (window.innerHeight | document.body.clientHeight)-300;
			var width = windowWidth > 600 ? windowWidth : 600;
			var height = windowHeight > 400 ? windowHeight : 400;
			
			//print하는 페이지를 엽니다.
			var popWindow = window.open('app/com/inc/print.html',"print",'left=100,top=100, resizable=yes, height='+height+',width='+width);
			* */
			
			sessionStorage.setItem("print-content", getHTMLToGrid([grid], {
				title: grid.fieldLabel,
			}));
			
			var windowWidth = (window.innerWidth | document.body.clientWidth) - 500;
			var windowHeight = (window.innerHeight | document.body.clientHeight) - 300;
			var width = windowWidth > 600 ? windowWidth : 600;
			var height = windowHeight > 400 ? windowHeight : 400;
			var popWindow = window.open('app/com/inc/print.html', "print", 'left=100,top=100, resizable=yes, height=' + height + ',width=' + width);
			
			// 그리드 개인화 설정(컬럼설정, 틀고정)
		} else if (itemValue == "personalized") {
			util.Dialog.open(app, "app/com/comPGridSetting", 800, 600, function(dialog) {
				
			}, {
				targetGrid: grid
			}, {
				modal: false
			});
			
			// 그리드 개인화 초기화
		} else if (itemValue == "initial") {
			localStorage.setItem(vsGridKey, null);
			grid.resetGrid();
			util.Msg.notify(app, "그리드가 초기화 되었습니다.");
		}
		
		ctxMenu.blur();
		//		ctxMenu.dispose();
	});
	
	ctxMenu.addEventListenerOnce("blur", function( /**@type cpr.events.CFocusEvent*/ e) {
		// 인쇄시 그리드에 선택된 행이 존재할 경우, 컨트롤 영역이 보여져 그리드 선택 clear 후 재 선택되도록 수정 (2021.07.29 추가)
		grid.selectRows(vaGrdSelectIdx);
		e.control.dispose();
	});
	
	/**@type cpr.controls.Container */
	var rootContainer = null;
	var showConstraint = {
		"position": "absolute",
		"width": "auto",
		"height": "auto"
	};
	if (util.Dialog.isDialogPopup(grid.getAppInstance())) {
		rootContainer = grid.getAppInstance().getContainer();
		
		if ((e.clientY - rootContainer.getActualRect().top + 130) > rootContainer.getActualRect().height)
			showConstraint.top = (e.clientY - rootContainer.getActualRect().top - 130) + "px";
		else
			showConstraint.top = (e.clientY - rootContainer.getActualRect().top) + "px";
		
		showConstraint.left = (e.clientX - (rootContainer.getActualRect().left + 130)) + "px";
	} else {
		rootContainer = grid.getAppInstance().getRootAppInstance().getContainer();
		// 스크롤 이동 후 컨텍스트 메뉴를 띄운 경우 클릭된 위치에 스크롤 이동량 추가
		//showConstraint.top = (e.clientY + e.view.scrollY) + "px"; // 25.02.13 : IE에서 e.view.scrollY 값이 undefined라서 document.documentElement.scrollTop로 변경
		showConstraint.top = (e.clientY + document.documentElement.scrollTop) + "px";
		if (e.clientX < 130) {
			showConstraint.left = "0px";
		} else {
			showConstraint.left = (e.clientX) + "px";
		}
	}
	
	var layout = rootContainer.getLayout();
	if (layout instanceof cpr.controls.layouts.FormLayout ||
		layout instanceof cpr.controls.layouts.VerticalLayout) {
		rootContainer.floatControl(ctxMenu, showConstraint);
	} else {
		rootContainer.addChild(ctxMenu, showConstraint);
	}
	ctxMenu.focus();
}

/*
 * 버튼(btnExcelExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnExcelExportClick(e) {
	if(!isGridCtrl()) return false;
	
	var vsExportType = app.getAppProperty("exportType");
	var vsExportMassiveType = app.getAppProperty("exportMassiveType");
	var vcCtrl = app.getAppProperty("ctrl");
	var exportTitle = !ValueUtil.isNull(app.getAppProperty("exportExcelTitle")) ? app.getAppProperty("exportExcelTitle") : app.lookup("optTilte").value;
	var _app = vcCtrl.getAppInstance();
	// 엑셀 export 옵션
	var voOptions = {
		// 숨긴 컬럼 제외여부
		isExcludeHideColumn: !app.getAppProperty("exportHiddenColumn"),
		// 추가적으로 제외할 컬럼
		excludeColumns: app.getAppProperty("exportExcludeColumns"),
		// 제외할 영역  ex.header, gfooter
		excludePart: app.getAppProperty("exportExcludePart"),
		// 포맷 적용 여부
		applyFormat: app.getAppProperty("exportApplyFormat"),
		// 동적 병합 적용 여부
		applySuppress: app.getAppProperty("exportApplySuppress"),
		// rowindex 특수컬럼 export 여부
		showRowIndex: app.getAppProperty("exportshowRowIndex"),
		// 클래스 스타일 적용 여부
		applyClassStyle: app.getAppProperty("exportApplyClassStyle")
	};
	// 클라이언트 방식
	if (vsExportType == "client") {
		loadClientExcel(exportTitle, vcCtrl, voOptions);
		// 미리보기일 경우 클라이언트 방식
	} else if (window.eb6Preview) {
		// 미리보기 화면입니다.\n 서버가 아닌 클라이언트 방식으로 엑셀이 다운로드됩니다.
		util.Msg.alertDlg(app, "INF-M024", null, {
			confirmCallback: function() {
				loadClientExcel(exportTitle, vcCtrl, voOptions);
			}
		});
		
		// 서버 방식
	} else {
		if(vsExportMassiveType == "standard"){
			util.Grid.exportData(_app, vcCtrl.id, exportTitle, null, voOptions);			
		}else{
			util.Grid.exportMassiveData(_app, vcCtrl.id, exportTitle, voOptions);
		}
	}
}

/************************************************
 * 클라이언트 엑셀 다운로드
 ************************************************/

/**
 * 클라이언트 방식 라이브러리(xlsx) 로드 후 엑셀로 export 함수 실행
 * @param {String} psExportTitle 파일명 
 * @param {cpr.controls.Control} pcCtrl 대상 그리드
 * @param {
 *   isExcludeHideColumn? : Boolean <!-- 숨김컬럼 제외 여부 (default: true) -->,
 *   excludeColumns? : String <!-- 출력시 숨김컬럼 외 제외할 컬럼명 (여러개인 경우 콤마로 구분)<br> ex) COL1,COL2,COL3 -->,
 *   excludePart?: cpr.controls.gridpart.VLOC_REGION <!-- 출력시 제외영역 (header,detail,footer,gheader,gfooter)<br>ex) footer,gfooter -->,
 *   applyFormat? : Boolean <!-- 익스포트시 포맷을 적용시킬 지 여부 (default: true) --> ,
 *   applySuppress? : Boolean <!-- 엑셀 익스포트시 suppress, mergedToIndexExpr에 의한 셀 병합을 반영할지 여부(default: true) -->,
 *   showRowIndex? : Boolean <!-- rowindex 특수컬럼을 export 할지 여부 (default: false) -->
 * } options? 그리드 엑셀 익스포트 옵션
 */
function loadClientExcel(psExportTitle, pcCtrl, poOptions) {
	// 라이브러리 로드 (해당 라이브러리가 먼저 불러와져야 스타일 안깨짐)
	var resourceLoader = new cpr.core.ResourceLoader();
	resourceLoader.addScript("./thirdparty/excel/FileSaver.min.js");
	resourceLoader.addScript("./thirdparty/excel/xlsx.full.min.js");
	resourceLoader.addScript("./thirdparty/excel/shim.min.js"); // Internet Explorer and Older Browsers 를 지원하기 위해 필요한 라이브러리
	resourceLoader.load().then(function(input) {
		var resourceAfterLoader = new cpr.core.ResourceLoader();
		resourceAfterLoader.addScript("./thirdparty/excel/xlsx.bundle.js");
		resourceAfterLoader.load().then(function(input) {
			// 엑셀 export
			exportExcelToJSON(psExportTitle + ".xlsx", "sheet1", pcCtrl, poOptions);
		});
	});
}

/**
 * xlsx 라이브러리 사용
 * @param {String} psFileName 파일명
 * @param {String} psSheetName 시트명
 * @param {cpr.controls.Grid} pcGrid 대상 그리드
 * @param {
 *   isExcludeHideColumn? : Boolean <!-- 숨김컬럼 제외 여부 (default: true) -->,
 *   excludeColumns? : String <!-- 출력시 숨김컬럼 외 제외할 컬럼명 (여러개인 경우 콤마로 구분)<br> ex) COL1,COL2,COL3 -->,
 *   excludePart?: cpr.controls.gridpart.VLOC_REGION <!-- 출력시 제외영역 (header,detail,footer,gheader,gfooter)<br>ex) footer,gfooter -->,
 *   applyFormat? : Boolean <!-- 익스포트시 포맷을 적용시킬 지 여부 (default: true) --> ,
 *   applySuppress? : Boolean <!-- 엑셀 익스포트시 suppress, mergedToIndexExpr에 의한 셀 병합을 반영할지 여부(default: true) -->,
 *   showRowIndex? : Boolean <!-- rowindex 특수컬럼을 export 할지 여부 (default: false) -->
 *   applyClassStyle? : Boolean <!-- 클래스 스타일 적용할지 여부 (default: false) -->
 * } options? 그리드 엑셀 익스포트 옵션
 */
function exportExcelToJSON(psFileName, psSheetName, pcGrid, options) {
	/* options의 기본값 세팅 */
	if (ValueUtil.isNull(options)) options = {};
	options = _.defaults(options, {
		applyFormat: true,
		applySuppress: true,
		isExcludeHideColumn: true,
		showRowIndex: false,
		applyClassStyle: false
	});
	
	/** @type cpr.controls.Grid */
	var vcGrid = pcGrid;
	var voExportData;
	var vaVisibleCols = [];
	var vaExcludePart = [];
	var vaExclColumns = [];
	
	// visible=false 컬럼
	vaVisibleCols = options.isExcludeHideColumn ? vaVisibleCols.concat(vcGrid.getColIndicesByVisible(false)) : vaVisibleCols;
	
	//파라미터로 받아온 출력 제외 영역이 존재하는 경우
	vaExcludePart = !ValueUtil.isNull(options.excludePart) ? ValueUtil.split(options.excludePart, ",") : vaExcludePart;
	//파라미터로 받아온 출력 제외 컬럼이 존재하는 경우
	if (!ValueUtil.isNull(options.excludeColumns)) {
		vaExclColumns = ValueUtil.split(options.excludeColumns, ",");
		var vaDColumns;
		for (var j = 0; j < vaExclColumns.length; j++) {
			// 컬럼명을 컬럼인덱스로 변환
			vaDColumns = vcGrid.detail.getColumnByName(vaExclColumns[j].trim());
			if (vaDColumns) {
				vaDColumns.forEach(function( /* cpr.controls.gridpart.GridDetailColumn */ each) {
					vaVisibleCols = vaVisibleCols.concat(each.colIndex);
				});
			}
		}
	}
	// 특수컬럼 제외
	// 체크박스, 라디오
	var vaHeaderCols = util.Grid.getGridHeaderCells(vcGrid);
	vaHeaderCols.forEach(function(each) {
		if (each.columnType == "checkbox" || each.columnType == "radio") {
			vaVisibleCols = vaVisibleCols.concat(each.colIndex);
		}
	});
	
	// rowindex 컬럼 제외하는 경우
	var vaDetailCols = util.Grid.getGridDetailCells(vcGrid);
	vaDetailCols.forEach(function(each) {
		if (!options.showRowIndex && each.columnType == "rowindex") {
			vaVisibleCols = vaVisibleCols.concat(each.colIndex);
		}
	});
	
	// 상태컬럼 제외
	if (util.Grid.getHeaderStatusColumn(vcGrid.getAppInstance(), vcGrid.id)) {
		var vaStatusCols = util.Grid.getHeaderStatusColumn(vcGrid.getAppInstance(), vcGrid.id).colIndex;
		if (!(vaStatusCols instanceof Array)) {
			vaStatusCols = [vaStatusCols];
		}
		vaVisibleCols = vaVisibleCols.concat(vaStatusCols);
	}
	
	// 그리드 정보
	voExportData = vcGrid.getExportData({
		exceptStyle: false,
		applyFormat: options.applyFormat,
		applySuppress: options.applySuppress, // 동적 병합
		excludeColIndex: vaVisibleCols // 제외할 컬럼
	});
	
	// 엑셀 생성.
	var wb = XLSX.utils.book_new(); // workbook 생성
	var ws = {}; // sheet 생성
	var vaCols = []; // 엑셀의 cell width를 지정할 부분.
	// 컬럼 width 설정
	// 컬럼 width 설정을 아래 object 형태로 정의
	// {wch:100}
	// 컬럼 width 값 그대로 하면 엑셀에서 너무 크게 지정되기 때문에 임의로 5를 나눠서 적용
	voExportData.cols.forEach(function(poObj) {
		vaCols.push({
			wch: parseInt(poObj.width, 10) / 5
		});
	});
	
	// {"!cols" : [{wch:100},{wch:100}]}
	if (vaCols.length > 0) {
		ws["!cols"] = vaCols;
	}
	
	// 엑셀 전체 데이터를 SheetJS에서 사용 가능하도록 변경.
	// 특정 셀의 값은 아래와 같이 정의한다.
	// {alphabet + row number} : {"v": "출력할Text","t": "Type (s:text/b:boolean/n:number...)","s": {style Object}}
	// ex) A1 : {"v": "테스트","t": "s","s": {"font": {"name": "Courier","sz": 24},fill:{bgColor:{rgb: "FFE9E9E9"}}}}
	var vaMerges = []; // 병합할 셀에 대한 정보 .
	var vnLastColIdx = 0; // 마지막 column을 찾기위한 변수.
	var vsLastColAlphabet; // 마지막 column을 표기하기위한 변수.
	var vnGroupRowIdx = 1; // 마지막 row를 표기하기위한 변수. 각 로우그룹 start는 0부터라 해당값을 더해줘야함.
	
	voExportData.rowgroups.forEach(function(rowGroup) {
		/** @type Array */
		var vaGrpDataList = rowGroup.data; // 데이터 ( 값 )
		var vaGrpStyle = rowGroup.style; // 위치정보( colIndex, rowIndex, merge 정보 )
		var vsGrpRegion = rowGroup.region; // 로우그룹의 타입.(header, detail, gheader, gfooter, footer)
		// exportData에서는 row 정보는 각 그룹내 row정보이므로 중첩되어 증가되도록 선언한다.
		var vnLastAddRow = 0;
		
		// 제외할 영역이 아닌 경우
		if (vaExcludePart.indexOf(vsGrpRegion) == -1) {
			vaGrpDataList.forEach(function(vaGrpData) {
				vaGrpData.forEach(function(psValue, cellIdx) {
					var vaClass = [];
					var voCellInfo = vaGrpStyle[cellIdx]; // 위치정보
					// 클래스 스타일 적용하는 경우
					if(options.applyClassStyle){
						var vnGrdCellIdx = voCellInfo.cellIndex;
						var vaClassName = null; // 해당 셀이 가지고 있는 클래스명 배열
						
						// 해당 셀의 클래스 정보를 가져옴
						if (vsGrpRegion == "header") {
							if (vcGrid.header.getControl(vnGrdCellIdx)) {
								vaClassName = vcGrid.header.getControl(vnGrdCellIdx).style.getClasses(); // 컨트롤 클래스 명
								vaClass = vaClass.concat(vaClassName instanceof Array ? vaClassName : [vaClassName]); 
							}
							if (vcGrid.header.getColumn(cellIdx)) {
								vaClassName = vcGrid.header.getColumn(vnGrdCellIdx).style.getClasses(); // 컬럼 클래스 명
								vaClass = vaClass.concat(vaClassName instanceof Array ? vaClassName : [vaClassName]); 
							}	
						}else if(vsGrpRegion == "detail"){
							if (vcGrid.detail.getControl(vnGrdCellIdx)) {
								vaClassName = vcGrid.detail.getControl(vnGrdCellIdx).style.getClasses(); // 컨트롤 클래스 명
								vaClass = vaClass.concat(vaClassName instanceof Array ? vaClassName : [vaClassName]); 
							}
							if (vcGrid.detail.getColumn(vnGrdCellIdx)) {
								vaClassName = vcGrid.detail.getColumn(vnGrdCellIdx).style.getClasses(); // 컬럼 클래스 명
								vaClass = vaClass.concat(vaClassName instanceof Array ? vaClassName : [vaClassName]); 
							}	
						}else if(vsGrpRegion == "footer"){
							if (vcGrid.footer.getControl(vnGrdCellIdx)) {
								vaClassName = vcGrid.footer.getControl(vnGrdCellIdx).style.getClasses(); // 컨트롤 클래스 명
								vaClass = vaClass.concat(vaClassName instanceof Array ? vaClassName : [vaClassName]); 
							}
							if (vcGrid.footer.getColumn(vnGrdCellIdx)) {
								vaClassName = vcGrid.footer.getColumn(vnGrdCellIdx).style.getClasses(); // 컬럼 클래스 명
								vaClass = vaClass.concat(vaClassName instanceof Array ? vaClassName : [vaClassName]); 
							}
						}
					}

					// 해당 로우그룹을 기준으로 올려주는 rowIndex MAX값 
					if (vnLastAddRow < voCellInfo.rowindex) {
						vnLastAddRow = voCellInfo.rowindex;
					}
					// 1. 셀의 위치값을 찾는다.
					var vsColAlphabet = getCellAlphabet(voCellInfo.colindex);
					// 2. 셀의 스타일을 찾는다.
					var vsCellStyle = {};
					vsCellStyle = getCssToXlsxJsStyle(voCellInfo, vsGrpRegion, vaClass, options.applyClassStyle);
					
					// 3. 셀 병합
					var vnStartCol = 0;
					var vnStartRow = 0;
					var vnEndCol = 0;
					var vnEndRow = 0;
					
					function isMergeOverlap(newMerge, merges) {
						for (var m of merges) {
							if (!(newMerge.e.r < m.s.r || newMerge.s.r > m.e.r || newMerge.e.c < m.s.c || newMerge.s.c > m.e.c)) {
								return true; // 겹침
							}
						}
						return false;
					}
					
					// 3-1.동적 병합
					// 데이터 병합으로 병합된 경우 (suppressible or mergeToIndexExpr)
					if ((psValue.colspan && psValue.colspan > 1) || (psValue.rowspan && psValue.rowspan > 1)) {
						var colspan = Number(psValue.colspan) || 1;
						
						// rowspan 값 체크: 값이 없으면 전체 행 범위로 잡기 (예: vnLastAddRow 사용)
						var rowspan = Number(psValue.rowspan);
						if (!rowspan || rowspan < 1) {
							// rowspan 값이 없거나 1보다 작으면 (즉 병합이 지정 안 됐으면)
							// 병합 범위를 현재 최대 행까지 확장 (vnLastAddRow는 전체 데이터 기준 마지막 행 번호라고 가정)
							rowspan = vnLastAddRow - (vnGroupRowIdx + voCellInfo.rowindex - 1) + 1;
						}
						
						vnStartCol = voCellInfo.colindex;
						vnStartRow = vnGroupRowIdx + voCellInfo.rowindex - 1;
						vnEndCol = vnStartCol + colspan - 1;
						vnEndRow = vnStartRow + rowspan - 1;
						
						var newMerge = {
							s: {
								r: vnStartRow,
								c: vnStartCol
							},
							e: {
								r: vnEndRow,
								c: vnEndCol
							}
						};
						
						// 셀 병합데이터 추가. (병합정보는 A1 이런식이 아닌 인덱스 0부터 시작)
						if (!isMergeOverlap(newMerge, vaMerges)) {
							vaMerges.push(newMerge);
						}
						
						// 단 sheetjs 특성상 셀 병합 시 병합된 셀에도 border style을 넣어줘야 정상적인 border가 입혀지게된다.
						// 하여 시작 col부터 마지막 col & row 까지 모두 border style를 넣어준다.
						for (var sRow = vnStartRow; sRow <= vnEndRow; sRow++) {
							for (var sCol = vnStartCol; sCol <= vnEndCol; sCol++) {
								var colAlpha = getCellAlphabet(sCol);
								var cellKey = colAlpha + (sRow + 1);
								
								ws[cellKey] = {
									v: (sRow === vnStartRow && sCol === vnStartCol) ? psValue.value : "",
									t: voCellInfo.type === "number" ? "n" : "s",
									s: vsCellStyle
								};
								
								// formula 가 있는 경우 적용
								if(voCellInfo.formula != null) {
									ws[cellKey]["f"] = voCellInfo.formula.replace(/#C\((\d+)\)#R\(\)/g, function(_, colNum) {
										var colName = getCellAlphabet(Number(colNum));
										var row = sRow + 1; // 원하는 행 번호
										return colName + row;
									});
								}
							}
						}
					}
					
					// 3-2. colSpan이나 rowSpan이 있는경우 실행.
					// 물리적으로 병합된 경우 (그리드 편집기에서 병합처리)
					if (voCellInfo.colspan > 1 || voCellInfo.rowspan > 1) {
						var vnEndRowIndex = voCellInfo.rowindex + (voCellInfo.rowspan || 1) - 1;
						if (vnLastAddRow < vnEndRowIndex) {
							vnLastAddRow = vnEndRowIndex;
						}
						
						vnStartCol = voCellInfo.colindex;
						vnStartRow = vnGroupRowIdx + voCellInfo.rowindex - 1;
						vnEndCol = vnStartCol + voCellInfo.colspan - 1;
						vnEndRow = vnStartRow + (voCellInfo.rowspan || 1) - 1;
						
						var newMerge2 = {
							s: {
								r: vnStartRow,
								c: vnStartCol
							},
							e: {
								r: vnEndRow,
								c: vnEndCol
							}
						};
						
						// 셀 병합데이터 추가.(병합정보는 A1 이런식이 아닌 인덱스 0부터 시작)
						if (!isMergeOverlap(newMerge2, vaMerges)) {
							vaMerges.push(newMerge2);
						}
						
						// 단 sheetjs 특성상 셀 병합 시 병합된 셀에도 border style을 넣어줘야 정상적인 border가 입혀지게된다.
						// 하여 시작 col부터 마지막 col & row 까지 모두 border style를 넣어준다.
						for (var sRow = vnStartRow; sRow <= vnEndRow; sRow++) {
							for (var sCol = vnStartCol; sCol <= vnEndCol; sCol++) {
								var colAlpha = getCellAlphabet(sCol);
								var cellKey = colAlpha + (sRow + 1);
								
								ws[cellKey] = {
									v: (sRow === vnStartRow && sCol === vnStartCol) ? psValue.value : "",
									t: voCellInfo.type === "number" ? "n" : "s",
									s: vsCellStyle
								};
								
								// formula 가 있는 경우 적용
								if(voCellInfo.formula != null) {
									ws[cellKey]["f"] = voCellInfo.formula.replace(/#C\((\d+)\)#R\(\)/g, function(_, colNum) {
										var colName = getCellAlphabet(Number(colNum));
										var row = sRow + 1; // 원하는 행 번호
										return colName + row;
									});
								}
							}
						}
					}
					
					if(!ws[vsColAlphabet + (vnGroupRowIdx + voCellInfo.rowindex)]){
						// 4. 셀을 선언한다.
						// 알파벳 + (rowIndex MAX값 + 위치정보의 rowIndex) 가 현재 셀 정보.
						ws[vsColAlphabet + (vnGroupRowIdx + voCellInfo.rowindex)] = {
							"v": psValue.value,
							"t": voCellInfo.type == "number" ? "n" : "s",
							"s": vsCellStyle
						};
						
						// formula 가 있는 경우 적용
						if (voCellInfo.formula != null) {
							ws[vsColAlphabet + (vnGroupRowIdx + voCellInfo.rowindex)]["f"] = voCellInfo.formula.replace(/#C\((\d+)\)#R\(\)/g, function(_, colNum) {
								var colName = getCellAlphabet(Number(colNum));
								var row = vnGroupRowIdx + voCellInfo.rowindex; // 원하는 행 번호
								return colName + row;
							});
						}
					}
					
					// 마지막 컬럼 위치를 저장한다.
					if (vnLastColIdx < voCellInfo.colindex) {
						vnLastColIdx = voCellInfo.colindex;
						vsLastColAlphabet = vsColAlphabet;
					}
				});
				// rowIndex MAX값 
				vnGroupRowIdx += vnLastAddRow + 1;
			});
		}
	});
	
	// 마지막 컬럼값과 마지막 로우를 합쳐 마지막 셀위치 표기.
	vsLastColAlphabet = vsLastColAlphabet + vnGroupRowIdx;
	
	// ref 선언을 해줘서 엑셀에 표기한다.
	ws["!ref"] = "A1:" + vsLastColAlphabet;
	
	// 병합할 셀에 대한 정보가 있다면 추가한다.
	// SheetJS에서는 병합할 셀에 대한 정보를 아래 object처럼 진행한다.
	// {"!merges" : [{ s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },{ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },]}
	if (vaMerges.length > 0) {
		ws["!merges"] = vaMerges;
	}
	// workbook에 새로만든 워크시트에 이름을 주고 붙인다. 
	XLSX.utils.book_append_sheet(wb, ws, psSheetName);
	// 엑셀 파일 쓰기
	var wbout = XLSX.write(wb, {
		bookType: 'xlsx',
		type: 'binary'
	});
	
	// 파일 다운로드
	saveAs(new Blob([s2ab(wbout)], {
		type: "application/octet-stream"
	}), psFileName);
}

/**
 * column index를 통해 엑셀의 알파벳 컬럼을 가져온다.
 * @param {cpr.utils.CellStyle} poCellInfo
 */
function getCellAlphabet(pnColindex) {
	// 위치정보를 excel에 맞게 알파벳 + 로우정보로 변환한다.
	var vsColAlphabet = "";
	var vnColIndex = pnColindex + 1;
	
	// 1. 셀의 위치값을 찾는다.
	// colIndex를 기준으로 알파벳을 찾아낸다.
	// colIndex가 0인 경우 A 이며 Z까지 출력한다.
	// 단 colIndex가 27이상인 경우 AA 와 같이 출력되므로 26을 나눈 뒤 
	// 나머지 값은 현재 위치 값이 되며 나눈 값을 내림으로 처리하여 0보다 클 경우 
	// 해당 값을 기준으로 다시 26나눠 나머지 값을 알파벳으로 추가한다.
	// 알파벳을 구하는 방법은 ascii code 를 기준으로 65(A)~90(Z)를 기준으로 생성한다.
	while (vnColIndex > 0) {
		// 엑셀 열 인덱스 보정: 0 기반 처리 (나머지 계산 후 1 감소)
		var vnColAlphabetCode = (vnColIndex - 1) % 26;
		
		// 알파벳 코드 계산 및 문자열 앞에 추가
		vsColAlphabet = String.fromCharCode(vnColAlphabetCode + 65) + vsColAlphabet;
		
		// 다음 반복을 위한 인덱스 감소
		vnColIndex = Math.floor((vnColIndex - 1) / 26);
	}
	return vsColAlphabet;
}

/**
 * css를 기준으로 SheetJS 양식의 style을 만든다.
 * css가 없는 경우라면 그리드의 region에 맞춰 default color, background-color를 선언한다.
 * @param {Object} poCssJsonObj
 * @param {String} psGrpRegion
 * @param {Array} paClass 클래스명
 * @param {Boolean} pbApplyClassStyle 클래스 스타일 적용 여부
 */
function getCssToXlsxJsStyle(poCssJsonObj, psGrpRegion, paClass, pbApplyClassStyle) {
	var vsBgColor = "";
	var vsFgColor = "";
	var voStyle = poCssJsonObj.style;
	var vsNumFmt = "";
	
	// 폰트 사이즈 ex) 11
	var vsFontSize = EXCEL_STYLE.FONT_SIZE;
	// 글씨 bold, italic
	var vbBold = EXCEL_STYLE.FONT_BOLD;
	var vbItalic = EXCEL_STYLE.FONT_ITALIC;
	// 정렬 ex) center
	var vsVertical = EXCEL_STYLE.VERTICAL_ALIGN;
	var vsHorizontal = EXCEL_STYLE.HORIZONTAL_ALIGN;
	
	// border 색 스타일
	var voBorderLeftColor = getColor(EXCEL_STYLE.BORDER_COLOR);
	var voBorderRightColor = getColor(EXCEL_STYLE.BORDER_COLOR);
	var voBorderTopColor = getColor(EXCEL_STYLE.BORDER_COLOR);
	var voBorderBottomColor = getColor(EXCEL_STYLE.BORDER_COLOR);
	
	// border 선 스타일
	var vsBorderLeft = EXCEL_STYLE.BORDER_STYLE;
	var vsBorderRight = EXCEL_STYLE.BORDER_STYLE;
	var vsBorderTop = EXCEL_STYLE.BORDER_STYLE;
	var vsBorderBottom = EXCEL_STYLE.BORDER_STYLE;
	
	var vsBorderLeftWidth = "1px";
	var vsBorderRightWidth = "1px";
	var vsBorderTopWidth = "1px";
	var vsBorderBottomWidth = "1px";
	
	// 로우 타입에 따라 전역 스타일 적용
	switch (psGrpRegion) {
		case "header":
			vsBgColor = getColor(EXCEL_STYLE.HEADER_BG_COLOR);
			vsFgColor = getColor(EXCEL_STYLE.HEADER_COLOR);
			// 헤더인 경우 bold 처리
			vbBold = true;
			break;
		case "detail":
			vsBgColor = getColor(EXCEL_STYLE.DETAIL_BG_COLOR);
			break;
		case "gheader":
			vsBgColor = getColor(EXCEL_STYLE.GROUP_HEADER_BG_COLOR);
			break;
		case "gfooter":
			vsBgColor = getColor(EXCEL_STYLE.GROUP_FOOTER_BG_COLOR);
			break;
		case "footer":
			vsBgColor = getColor(EXCEL_STYLE.FOOTER_BG_COLOR);
			vsFgColor = getColor(EXCEL_STYLE.FOOTER_COLOR);
			break;
	}
	
	// 클래스 스타일 적용
	if (pbApplyClassStyle) {
		getStyleSheetArray(paClass);
		paClass.forEach(function(each) {
			vbBold = getComputedCss(each, "font-weight") || vbBold; 									// 폰트 굵기
			vsFontSize = getComputedCss(each, "font-size") || vsFontSize;								// 폰트 사이즈
			vsHorizontal = getComputedCss(each, "text-align") || vsHorizontal;							// 글자 정렬
			vsVertical = getComputedCss(each, "vertical-align") || vsVertical;							// 수직 정렬
			vsBgColor = getComputedCss(each, "background-color") || vsBgColor;							// 배경색
			vsFgColor = getComputedCss(each, "color") || vsFgColor;										// 글자색
			voBorderLeftColor = getComputedCss(each, "border-left-color") || voBorderLeftColor;			// 왼쪽 선 색
			voBorderRightColor = getComputedCss(each, "border-right-color") || voBorderRightColor;		// 오른쪽 선 색
			voBorderTopColor = getComputedCss(each, "border-top-color") || voBorderTopColor;			// 위쪽 선 색
			voBorderBottomColor = getComputedCss(each, "border-bottom-color") || voBorderBottomColor;	// 아래쪽 선 색
			vsBorderLeft = getComputedCss(each, "border-left-style") || vsBorderLeft;					// 왼쪽 선 스타일
			vsBorderRight = getComputedCss(each, "border-right-style") || vsBorderRight;				// 오른쪽 선 스타일
			vsBorderTop = getComputedCss(each, "border-top-style") || vsBorderTop;						// 위쪽 선 스타일
			vsBorderBottom = getComputedCss(each, "border-bottom-style") || vsBorderBottom;				// 아래쪽 선 스타일
			vsBorderLeftWidth = getComputedCss(each, "border-left-width") || vsBorderLeftWidth;			// 왼쪽 선 굵기
			vsBorderRightWidth = getComputedCss(each, "border-right-width") || vsBorderRightWidth;		// 오른쪽 선 굵기
			vsBorderTopWidth = getComputedCss(each, "border-top-width") || vsBorderTopWidth;			// 위쪽 선 굵기
			vsBorderBottomWidth = getComputedCss(each, "border-bottom-width") || vsBorderBottomWidth;	// 아래쪽 선 굵기
		});
	}
			
	// 엑셀에서 제공되는 format 형식만 제공
	// s#,##0 -> #,##0
	vsNumFmt = poCssJsonObj.format ? poCssJsonObj.format.replace("s", "") : "";
	
	// 스타일이 있을 경우
	if (Object.keys(voStyle).length > 0) {
		
		// background-color
		vsBgColor = voStyle["background-color"] ? getColor(voStyle["background-color"]) : vsBgColor;
		
		// border colors
		voBorderLeftColor = voStyle["border-left-color"] ? getColor(voStyle["border-left-color"]) : voBorderLeftColor;
		voBorderRightColor = voStyle["border-right-color"] ? getColor(voStyle["border-right-color"]) : voBorderRightColor;
		voBorderTopColor = voStyle["border-top-color"] ? getColor(voStyle["border-top-color"]) : voBorderTopColor;
		voBorderBottomColor = voStyle["border-bottom-color"] ? getColor(voStyle["border-bottom-color"]) : voBorderBottomColor;
		
		// border 선 스타일
		vsBorderLeft = voStyle["border-left-style"] || vsBorderLeft;
		vsBorderRight = voStyle["border-right-style"] || vsBorderRight;
		vsBorderTop = voStyle["border-top-style"] || vsBorderTop;
		vsBorderBottom = voStyle["border-bottom-style"] || vsBorderBottom;
		
		vsBorderLeftWidth =voStyle["border-left-width"] || vsBorderLeftWidth;				
		vsBorderRightWidth = voStyle["border-right-width"] || vsBorderRightWidth;		
		vsBorderTopWidth = voStyle["border-top-width"] || vsBorderTopWidth;				
		vsBorderBottomWidth = voStyle["border-bottom-width"] || vsBorderBottomWidth;	
		
		// font-color
		vsFgColor = voStyle["color"] ? getColor(voStyle["color"]) : vsFgColor;
		// font size
		vsFontSize = voStyle["font-size"] || vsFontSize;
		// 정렬
		vsHorizontal = voStyle['text-align'] || EXCEL_STYLE.HORIZONTAL_ALIGN;
		vsVertical = voStyle['vertical-align'] || EXCEL_STYLE.VERTICAL_ALIGN;

		// italic , oblique 일 경우 italic 적용
		if (voStyle["font-style"] == "oblique" || voStyle["font-style"] == "italic") {
			vbItalic = true;
		}
		// normal, undefined 아닌 경우 bold 적용
		if (voStyle["font-weight"] != undefined && voStyle["font-weight"] != "lighter" && voStyle["font-weight"] != "normal") {
			vbBold = true;
		}
	}
	
	
	// 폰트 ex) @HY견명조
	var vsFontName = voStyle["font-family"] || EXCEL_STYLE.FONT_FAMILY;
	
	// 정렬 스타일 
	// ex) {vertical : "center", horizontal : "center"}
	var voAlign = {
		vertical: vsVertical,
		horizontal: vsHorizontal
	};
	// 폰트 스타일
	// ex) {color: {rgb: "364a63"}, sz: "11", bold : true, italic : false, name : "@HY견명조"}
	var voFont = {
		color: {
			rgb: vsFgColor
		},
		sz: vsFontSize.replace("px", ""),
		bold: vbBold,
		italic: vbItalic,
		name: vsFontName
	};
	// 배경색  
	// ex) {fgColor : {rgb: "FFFFFF"}}
	var voFill = {
		fgColor: {
			rgb: vsBgColor
		}
	};
	
	// border 스타일
	if (vsBorderLeft == "solid" && vsBorderLeftWidth != "1px") {
	    vsBorderLeft = "thick";
	} else if (vsBorderLeft == "solid") {
	    vsBorderLeft = "thin";
	}
	if (vsBorderRight == "solid" && vsBorderRightWidth != "1px") {
	    vsBorderRight = "thick";
	} else if (vsBorderRight == "solid") {
	    vsBorderRight = "thin";
	}
	if (vsBorderTop == "solid" && vsBorderTopWidth != "1px") {
	    vsBorderTop = "thick";
	} else if (vsBorderTop == "solid") {
	    vsBorderTop = "thin";
	}
	if (vsBorderBottom == "solid" && vsBorderBottomWidth != "1px") {
	    vsBorderBottom = "thick";
	} else if (vsBorderBottom == "solid") {
	    vsBorderBottom = "thin";
	}

	// ex) {top:{ style: "thin", color: "ed0d0d"}}
	var voBorder = {
		top: {
			style: vsBorderTop,
			color: {
				rgb: voBorderTopColor
			}
		},
		bottom: {
			style: vsBorderBottom,
			color: {
				rgb: voBorderBottomColor
			}
		},
		left: {
			style: vsBorderLeft,
			color: {
				rgb: voBorderLeftColor
			}
		},
		right: {
			style: vsBorderRight,
			color: {
				rgb: voBorderRightColor
			}
		}
	};
	// 스타일
	return {
		alignment: voAlign,
		font: voFont,
		fill: voFill,
		border: voBorder,
		numFmt: vsNumFmt
	};
}

/**
 * #FFF -> FFFFFF 으로 변환
 * @param {String} psColor
 */
function getColor(psColor) {
	var vsColor = psColor.replace("#", "");
	// FCF 인경우 -> FFCCFF
	if (vsColor.length == 3) {
		var vaSmlhex = vsColor.split("");
		vsColor = "";
		vaSmlhex.forEach(function(vsHex) {
			vsColor += (vsHex + vsHex);
		});
	}
	return vsColor;
}
/**
 * 바이너리 데이터 만드는 함수
 * @param {any} s
 */
function s2ab(s) {
	var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
	var view = new Uint8Array(buf); //create uint8array as viewer
	for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
	return buf;
}

/************************************************
 * 클래스 스타일 가져오기
 ************************************************/

/**
 * @param {Number} width
 * @param {String} str
 * rgb (0, 25, 25) => 에서 16진수로 변환하는 경우 0은 00이 되도록 변환
 */
var fillZero = function(width, str) {
	return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str; //남는 길이만큼 0으로 채움
}
/**
 * 클래스 정보
 */
var _CLASS_INFO = {};
var _OWNER_SET = new Set();
var _SHEETS = null;

/**
 * 
 * @param {Array} classArr
 */
function getStyleSheetArray(classArr) {
	var vaClass = classArr;
	vaClass = vaClass.filter(function(each) {
		return each != "";
	});
	if (vaClass.length > 0 && vaClass[0] instanceof Array) {
		vaClass[0] = vaClass[0][0];
	}
	if (_OWNER_SET.has(JSON.stringify(vaClass))) {
		return;
	}
	_OWNER_SET.add(JSON.stringify(vaClass));
	var results = {};
	if (_SHEETS == null) {
		_SHEETS = document.styleSheets;
	}

	vaClass.forEach(function(eachClass) {
		//룰 가져오기
		var rules = getStyleSheet(eachClass);
		if (rules.length > 0) {
			rules.forEach(function(/*String*/eachRule){
				// 여러 곳에서 스타일을 지정했을 경우 cl-grid 의 스타일이 적용되도록
				if(rules.length > 1){
					if(rules.length > 1 && eachRule.indexOf(".cl-grid") != -1){
						if(eachRule.indexOf(eachClass+",") != -1) {
							eachRule =  eachRule.replace(eachRule.slice(eachRule.indexOf(","),eachRule.indexOf("{")-1),"");
						}
						var classInfo = eachRule.substr(eachRule.indexOf("."+eachClass)).match(/(\.[\w-]+)|(\{[^}]*\})/g);
						var returns = arrayToObject(classInfo);
						assign(_CLASS_INFO, returns);
					}
				}else{
					if(eachRule.indexOf(eachClass+",") != -1) {
						eachRule =  eachRule.replace(eachRule.slice(eachRule.indexOf(","),eachRule.indexOf("{")-1),"");
					}
					var classInfo = eachRule.substr(eachRule.indexOf("."+eachClass)).match(/(\.[\w-]+)|(\{[^}]*\})/g);
					var returns = arrayToObject(classInfo);
					assign(_CLASS_INFO, returns);
				}
			});
			
		}
	});
}

/**
 * 빌드된 스타일 시트에서 해당 클래스를 포함한 CSSStyleRule 에서 cssText를 변환
 * @param {String} className
 */
function getStyleSheet(className) {
	if (_CLASS_INFO.hasOwnProperty(className)) {
		return null;
	}
	var vaRules = [];
	for (var i = 0; i < _SHEETS.length; i++) {
	    var voSheet = _SHEETS[i];
	
	    for (var j = 0; j < voSheet.cssRules.length; j++) {
	        var tempRule = voSheet.cssRules[j];
	
	        if (tempRule.selectorText && tempRule.selectorText.indexOf("." + className) !== -1) {
	            vaRules.push(tempRule.cssText);
	        }
	    }
	}
	return vaRules;
};

/**
 * Array 형태 Object 형태로 변환 (ex. ['.a', '{ color: rgb(0, 125, 27); }']  => .a: {color: rgb(0, 125, 27)})
 * @param {Array} pArray
 */
function arrayToObject(pArray) {
	const value = pArray.pop(); // 배열의 마지막 값을 추출합니다.
	var nestedObject = cssStringToObject(value);
	
	// 배열을 역순으로 순회하면서 중첩된 객체를 만듭니다.
	for (var i = pArray.length - 1; i >= 0; i--) {
		// Edge IE모드에서도 지원가능하도록 ES6→ES5문법으로 변경 (2025.02.04)
		var tmpNestedObj = {};
		tmpNestedObj[pArray[i]] = nestedObject;
		nestedObject = tmpNestedObj;
	}
	
	return nestedObject;
};

/**
 * css 스타일 String 형태 Object 형태로 변환 (ex. '{ color: rgb(0, 125, 27); }' => { color: rgb(0, 125, 27); })
 * @param {String} cssString
 */
function cssStringToObject(cssString) {
	var cssObject = {};
	var properties = cssString
		.replace(/[{|}]/g, '') // 중괄호 제거
		.split(';'); // 세미콜론으로 분리
	
	properties.forEach(function(property) {
		var arrays = property.split(":").map(function(each) {
			return each.trim();
		});
		var key = arrays[0];
		var value = arrays[1];
		if (key) {
			cssObject[key] = value;
		}
	})
	
	return cssObject;
}

/**
 * @param {Object} arg1
 * @param {Object} arg2
 */
function assign(arg1, arg2) {
	if (!(arg2 instanceof Object)) {
		arg1 = arg2;
	}
	Object.keys(arg2).forEach(function(each) {
		
		if (arg1.hasOwnProperty(each)) {
			if (!(arg2[each] instanceof Object)) {
				arg1[each] = arg2[each];
				return;
			}
			if (JSON.stringify(arg1[each]) == JSON.stringify(arg2[each])) {
				return;
			}
			assign(arg1[each], arg2[each]);
		} else {
			arg1[each] = arg2[each];
		}
	});
};
/**
 * 클래스의 해당 스타일 값을 반환합니다.
 * @param {String} className
 * @param {"background-color"|"color"|"font-weight"|"font-size"|"text-align"|"vertical-align"|"border-right-width"|"border-left-style"} propertyNm
 */
function getComputedCss(className, propertyNm) {
	if (!_CLASS_INFO.hasOwnProperty("." + className)) {
		return null;
	}
	var vsPropertyName = propertyNm;
	var voClass = _CLASS_INFO["." + className];

	var vsBorderStyleNm = propertyNm.replace(/border-(left|right|top|bottom)-style/, "border-style");	// border-style
	var vsBorderColorNm = propertyNm.replace(/border-(left|right|top|bottom)-color/, "border-color");	// border-color
	var vsBorderWidthNm = propertyNm.replace(/border-(left|right|top|bottom)-width/, "border-width");	// border-width
	var vsBorderSideNm = propertyNm.replace(/(border-\w+)-(color|style|width)/g, "$1"); 						// border-(left|right|top|bottom)

	/** @type String */
	// 먼저 클래스에서 직접 해당 속성을 찾음
	var target = voClass[vsPropertyName];
	if (target == null) {
		// 스타일이 border | border-(left|right|top|bottom) | border-(style|color) 로 정의되어 있는 경우
		if(vsPropertyName.indexOf("border") == 0){
			
			if (voClass[vsBorderStyleNm] != null) {
				vsPropertyName = vsBorderStyleNm;
			} else if (voClass[vsBorderColorNm] != null) {
				vsPropertyName = vsBorderColorNm;
			} else if(voClass[vsBorderWidthNm] != null){
				vsPropertyName = vsBorderWidthNm;
			} else if (voClass[vsBorderSideNm] != null) {
				vsPropertyName = vsBorderSideNm;
			} else {
			    vsPropertyName = "border";
			}
			target = voClass[vsPropertyName];
		    if (target == null) {
		        return "";
		    }
		}else{
			return "";
		}
	}
	target = target.trim();
	// 색상 변환
	if (target.indexOf("rgb") != -1 && !/(border-)(\w*-)(style)/g.test(propertyNm) && !/(border-)(\w*-)(width)/g.test(propertyNm)) {
		if (propertyNm.indexOf("border") != -1) {
			target = target.split("rgb")[1];
		}
		var background = target.match(/([0-9]+)/g);
		if (background && background.length > 0) {
			var newBgColor = fillZero(2, parseInt(background[0]).toString(16).toUpperCase()) +
				fillZero(2, parseInt(background[1]).toString(16).toUpperCase()) +
				fillZero(2, parseInt(background[2]).toString(16).toUpperCase());
			if (background.length > 3 && background[3] == "0") {
				newBgColor = "FFFFFF";
			}
		}
		return newBgColor;
	// bold 인 경우만 적용
	} else if (propertyNm == "font-weight") {
		return target == "bold";
	//  border-left , border 로 스타일이 지정되어있는 경우
	} else if (/^border-(left|right|top|bottom)$/.test(vsPropertyName) || vsPropertyName == "border") {
		if(/border-(left|right|top|bottom)-style/.test(propertyNm)){
			// " " (공백)으로 분리하고 두 번째 값을 반환
       		return target.split(" ")[1];
		}else{
			// " " (공백)으로 분리하고 첫 번째 값을 반환
        	return target.split(" ")[0];
		}
    }else {
		return target;
	}
}