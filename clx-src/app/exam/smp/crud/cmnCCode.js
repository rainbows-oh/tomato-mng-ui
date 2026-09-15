/************************************************
 * cmnCCode.js
 * @프로그램설명 : 공통코드관리
 *
 * @작성일자 :  ${date}.
 * @작성자 : ${user}
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 


/************************************************
 ** 글로벌 함수
 ************************************************/ 


/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 
var util = createCommonUtil();

/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 

/**
 * 공통코드 분류 목록을 조회한다.
 */
function doList(psStatus) {
	util.Grid.reset(app, "grdDtl");
	util.Submit.send(app, "subList", function(pbSuccess) {
		if (pbSuccess) {
			if (psStatus == "save") {
				//갱신된 데이터가 조회되었습니다.
				util.Msg.notify(app, "INF-M005", null, true);
			} else {
				//조회되었습니다.
				util.Msg.notify(app, "INF-M001");
			}
			
			util.Control.redraw(app, ["grpMst", "grpDtl"]);
		}
	});
}

/**
 * 마스터 신규
 */
function doInsert(/* cpr.events.CGridEvent */ e){
	
	var vnIndex = util.Grid.getIndex(app, "grdMst");
	
	util.Grid.setCellValue(app, "grdMst", "cdCls", "CFG", vnIndex);
	util.Grid.setCellValue(app, "grdMst", "unitSystemRcd", app.lookup("cmbUnitSystemRcd").value, vnIndex);
	util.Grid.setCellValue(app, "grdMst", "useYn", "Y", vnIndex);
}

/**
 * 마스터 저장
 */
function doSave() {
	// 그리드의 변경사항 유/무를 반환
	if (!util.Grid.isModified(app, ["grdMst"], "MSG")) return false;
	
	// 그리드 유효성 검증
	if (!util.validate(app, ["grdMst"])) return false;
	
	// 저장 서브미션 호출
	util.Submit.send(app, "subSave", function(pbSuccess) {
		if (pbSuccess) {
			doList("save");
		}
	});
}

/**
 * @param psStatus - 조회 상태(저장 후 조회인 경우에는 'save' 구분값 넘김)
 */
function doListDtl(psStatus) {
	
	app.lookup("dmParamDtl").setValue("strCdCls", util.Grid.getCellValue(app, "grdMst", "cd"));
	
	//조회 서브미션 호출
	util.Submit.send(app, "subListDtl", function(pbSuccess) {
		if (pbSuccess) {
			if (psStatus == "save") {
				//갱신된 데이터가 조회되었습니다.
				util.Msg.notify(app, "INF-M005");
			} else {
				//조회되었습니다.
				util.Msg.notify(app, "INF-M001");
			}
			
		}
	});
}

/**
 * 디테일 신규
 */
function doInsertDtl( /* cpr.events.CGridEvent */ e) {
	var vnIndex = util.Grid.getIndex(app, "grdMst");
	var vsCdCls = util.Grid.getCellValue(app, "grdMst", "cd", vnIndex);
	var vsUnitSystemRcd = util.Grid.getCellValue(app, "grdMst", "unitSystemRcd", vnIndex);
	
	var vnDtlIndex = util.Grid.getIndex(app, "grdDtl");
	util.Grid.setCellValue(app, "grdDtl", "cdCls", vsCdCls, vnDtlIndex);
	util.Grid.setCellValue(app, "grdDtl", "cd", vsCdCls + ".", vnDtlIndex);
	util.Grid.setCellValue(app, "grdDtl", "unitSystemRcd", vsUnitSystemRcd, vnDtlIndex);
	util.Grid.setCellValue(app, "grdDtl", "useYn", "Y", vnDtlIndex);
}

/**
 * 디테일 저장
 */
function doSaveDtl() {
	// 그리드의 변경사항 유/무를 반환
	if (!util.Grid.isModified(app, ["grdDtl"], "MSG")) return false;
	
	// 그리드 유효성 검증
	if (!util.validate(app, ["grdDtl"])) return false;
	
	// 저장 서브미션 호출
	util.Submit.send(app, "subSaveDtl", function(pbSuccess) {
		if (pbSuccess) {
			doList("save");
		}
	});
}

/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	
	var vsMstGrid = "grdMst";
	var vsDtlGrid = "grdDtl";
	var vsMstGrp = "grpMst";
	var vsDtlGrp = "grpDtl";
	
	var vcMstGrid = app.lookup(vsMstGrid);
	var vcDtlGrid = app.lookup(vsDtlGrid);
	var vcMstDataSet = vcMstGrid.dataSet;
	var vcDtlDataSet = vcDtlGrid.dataSet;
	
	var vcMstGrp = app.lookup(vsMstGrp);
	var vcDtlGrp = app.lookup(vsDtlGrp);
	
	vcMstGrp.bind("enabled").toExpression("#" + vcDtlDataSet.id + ".isModified() ? false : true");
	vcDtlGrp.bind("enabled").toExpression("(#" + vsMstGrid + ".getRowCount() < 1  || #" + vcMstDataSet.id + ".isModified()) ? false : true");
	
	vcMstGrid.addEventListener("before-update", function(e) {
		vcDtlGrp.redraw();
	});
	
	vcDtlGrid.addEventListener("before-update", function(e) {
		vcMstGrp.redraw();
	});
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	//조회 서브미션 호출
	util.Submit.send(app, "subOnload", function(pbSuccess) {
		if (pbSuccess) {
			util.SelectCtl.selectItem(app, "cmbUnitSystemRcd", 0);
		}
	});
}

/*
 * "조회" 버튼(btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSearchClick(e){
	
	//데이터 변경사항 체크
	if (util.Grid.isModified(app, "grdMst") || util.Grid.isModified(app, "grdDtl")) {
		var poOptions = {
			confirmCallback: function() {
				//조회조건 유효성 체크
				if (!util.validate(app, "grpSearch")) return false;
				doList();
			},
			cancelCallback: function() {
				return false;
			}
		}
		util.Msg.confirmDlg(app, "CRM-M003", [app.lookup("grdMst").fieldLabel], poOptions);
	} else {
		//조회조건 유효성 체크
		if (!util.validate(app, "grpSearch")) return false;
		doList();
	}
}

/*
 * 사용자 정의 컨트롤에서 beforeDelete 이벤트 발생 시 호출.
 * 삭제버튼 클릭전 호출 이벤트(행 삭제전에 체크할 비지니스 로직이 있는 경우 사용)
 */
function onUdccomgridcudbtns1BeforeDelete(e){
	
	//상세내역이 존재하면 삭제 불가
	var vnDtlRowCnt = util.Grid.getRowCount(app, "grdDtl");
	
	if (vnDtlRowCnt > 0) {
		util.Msg.alertDlg(app, "WRN-M054", [util.Grid.getIndex(app, "grdMst") + 1, util.Control.getProperty(app, "grdMst", "fieldLabel"),
			util.Control.getProperty(app, "grdDtl", "fieldLabel")
		]);
		return false;
	}
	return true;
}

/*
 * 사용자 정의 컨트롤에서 commonEvent 이벤트 발생 시 호출.
 * 신규, 삭제, 취소 클릭 공통 이벤트(e.userData의 status로 확인 가능)
 */
function onUdccomgridcudbtns1CommonEvent(e){
	
	util.Control.redraw(app, ["grpMst","grpDtl"]);
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdMstSelectionChange(e){
	
	if (util.Grid.getRowState(app, "grdMst") == cpr.data.tabledata.RowState.INSERTED) {
		util.Grid.reset(app, "grdDtl");
		return false;
	}
	
	// 마스터의 컬럼값으로 디테일 헤더컬럼의 텍스트 변경
	var voDmCol = app.lookup("dmCol");
	var vaColumns = voDmCol.getColumnNames();
	for (var i = 0, len = vaColumns.length; i < len; i++) {
		voDmCol.setValue(vaColumns[i], util.Grid.getCellValue(app, "grdMst", vaColumns[i]));
	}
	
	doListDtl();
}

/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onGrdMstUpdate(e){
	
	var grdDtl = app.lookup("grdDtl");
	if (e.columnName == "cd") {
		var vsCdCls = ValueUtil.fixNull(e.newValue);
		
		for (var i = 0, len = grdDtl.rowCount; i < len; i++) {
			grdDtl.setCellValue(i, "cdCls", vsCdCls);
		}
	}
}

/*
 * 사용자 정의 컨트롤에서 commonEvent 이벤트 발생 시 호출.
 * 신규, 삭제, 취소 클릭 공통 이벤트(e.userData의 status로 확인 가능)
 */
function onUdccomgridcudbtns2CommonEvent(e){
	
	util.Control.redraw(app, ["grpMst","grpDtl"]);
}

/*
 * 그리드에서 delete 이벤트 발생 시 호출.
 * Grid의 행이 삭제되었을 때 이벤트.
 */
function onGrdDtlDelete(e){
	
	// 마스터에 대한 마지막 찾기 Find-Row 정보 셋팅
	util.Grid.markFindRowCondition(app, "grdMst");
}

/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onGrdDtlUpdate(e){
	
	// 마스터에 대한 마지막 찾기 Find-Row 정보 셋팅
	util.Grid.markFindRowCondition(app, "grdMst");
	
	if (e.columnName == "CD_EX") {
		e.control.setCellValue(e.rowIndex, "cd", e.control.getCellValue(e.rowIndex, "cdCls") + "." + e.control.getCellValue(e.rowIndex, "CD_EX"), false);
	} else if (e.columnName == "cdCls") {
		e.control.setCellValue(e.rowIndex, "cd", e.control.getCellValue(e.rowIndex, "cdCls") + "." + e.control.getCellValue(e.rowIndex, "CD_EX"), false);
	}
}

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린 크기 변경 시 전파되는 이벤트.
 */
function onBodyScreenChange(e){
	if (e.screen.name == "EXB-PART"){
		app.lookup("grdMst").leftSplit = 0;
		app.lookup("grdDtl").leftSplit = 0;
	} else {
		app.lookup("grdMst").leftSplit = 5;
		app.lookup("grdDtl").leftSplit = 6;
	}
}

/*
 * "조회(Page)" 버튼(btnSearch4)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSearch4Click(e) {
	var btnSearch4 = e.control;
	
	util.DataMap.setValue(app, "dmParam", "size", util.DataMap.getValue(app, "dmPageInfo", "size"));
	util.DataMap.setValue(app, "dmParam", "page", util.DataMap.getValue(app, "dmPageInfo", "page"));
	
	util.Submit.send(app, "subList9", function(pbSuccess) {
		if (pbSuccess) {
			util.Control.redraw(app, ["grpMst", "grpDtl"]);
		}
	});
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPgi1SelectionChange(e) {
	var pgi1 = e.control;
	onBtnSearch4Click(e);
}
