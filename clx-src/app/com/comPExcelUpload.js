/************************************************
 * cmnPCode.js
 * Created at 2018. 8. 13. 오전 11:17:04.
 *
 * @author SUL
 ************************************************/
var util = createCommonUtil();

/** @type cpr.controls.Grid */
var moTargetGrid = null;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHostProperty("initValue");
	if(ValueUtil.isNull(initValue.targetGrid)) return;
	
	var dsHeaderColumns = app.lookup("dsHeaderColumns");
	var dmColumn = app.lookup("dmColumn");
	moTargetGrid = initValue.targetGrid;
	var _app = moTargetGrid.getAppInstance();
	if(moTargetGrid == null) return;

	var dColumn, hColumn;
	var findRows, findRows2;
	for(var i=0, len=moTargetGrid.detail.cellCount; i<len; i++){
		dColumn = moTargetGrid.detail.getColumn(i);
		if(dColumn.columnType == "rowindex" || dColumn.columnType == "checkbox") continue;
		if(dColumn.columnName == null || dColumn.columnName == "") continue;
		if(dColumn.controlType == "button") continue;
		
		//숨김컬럼 제외
		/** @type cpr.controls.gridpart.GridColumn */
		var vbShowHiddenColumns = ValueUtil.fixBoolean(initValue.showHiddenColumns);
		hColumn = util.Grid.getHeaderColumn(_app, moTargetGrid.id, dColumn.columnName);
		if(hColumn == null || hColumn.length < 1 ) continue;		
		if(vbShowHiddenColumns == false || vbShowHiddenColumns == ''){			
			if(hColumn[0].visible === false) continue;
		}
		
		//헤더 컬럼 콤보박스 아이템으로 추가
		findRows = dsHeaderColumns.findAllRow("CD=='"+dColumn.columnName+"'");
		if(findRows == null || findRows.length < 1 && hColumn[0].getText() != null){
			dsHeaderColumns.addRowData({"CD_NM":hColumn[0].getText(), "CD":dColumn.columnName});
		}
	}
	
	//디폴트 헤더컬럼 지정
	for(var i=0, len=dsHeaderColumns.getRowCount(); i<=len; i++){
		dmColumn.setValue("H_"+i, dsHeaderColumns.getValue(i, "CD"));
	}
	
	util.Control.redraw(app, "grdExl");
	

	//엑셀 헤더 Max-ROW의 정보를 찾아서, 요청 파라메터에 셋팅한다.
	//서버에서 엑셀 파일을 읽을 때, 데이터의 시작 ROW 위치를 찾기 위함
	var vnMaxHeaderRowIndex = 1;
	if(!ValueUtil.isNull(initValue.startRowIndex)){
		vnMaxHeaderRowIndex = initValue.startRowIndex;
	}else{
		var hColmun;
		for(var i=0, len=moTargetGrid.header.cellCount; i<len; i++){
			hColumn = moTargetGrid.header.getColumn(i);
			if(hColumn == null) continue;
	
			if(vnMaxHeaderRowIndex < (hColumn.rowIndex + hColumn.rowSpan)){
				vnMaxHeaderRowIndex = (hColumn.rowIndex + hColumn.rowSpan);
			}
		}
	}
	app.lookup("dmParam").setValue("startRowIndex", vnMaxHeaderRowIndex);
	
	//시작 컬럼 Cell 인덱스 지정
	if(!ValueUtil.isNull(initValue.startCellIndex)){
		app.lookup("dmParam").setValue("startCellIndex", initValue.startCellIndex);
	}
	
	//헤더 콤보박스 클릭시, 이미 매핑된 컬럼 아이템은 선택불가토록 막음
	var dmConfig = app.lookup("dmConfig");
	if(dmConfig.getValue("preventSelectionItem") == "Y"){
		var grdExl = app.lookup("grdExl");
		/** @type cpr.controls.ComboBox */
		var voCtrl = null;
		for(var i=0, len=grdExl.header.cellCount; i<len; i++){
			voCtrl = grdExl.header.getControl(i);
			if(voCtrl == null) continue;
			
			voCtrl.addEventListener("click", function(e){
				var cmb = e.control;
				//아이템 선택 활성화
				var vaItems = cmb.getItems();
				for(var i=0, len=vaItems.length; i<len; i++){
					cmb.setItemEnable(vaItems[i], true);
				}
				
				/** @type cpr.bind.BindInfo */
				var bindInfo = cmb.getBindInfo("value");
				var bindColumnName = bindInfo.columnName;
				//타 컬럼에 지정된 아이템은 선택 불가토록 막음
				var dmColumn = app.lookup("dmColumn");
				var vaColumnNames = dmColumn.getColumnNames();
				var vsColumnVal;
				for(var i=0, len=vaColumnNames.length; i<len; i++){
					if(vaColumnNames[i] == bindColumnName) continue;
					vsColumnVal = dmColumn.getValue(vaColumnNames[i]);
					if(vsColumnVal == null || vsColumnVal == "") continue;
					
					var item = cmb.getItemByValue(vsColumnVal);
					if(item){
						cmb.setItemEnable(item, false);
					}
				}
			});
		}
	}
}


/**
 * 공통코드 목록데이터를 조회한다.
 * @param psStatus - 조회 상태(저장 후 조회인 경우에는 'save' 구분값 넘김)
 */
function doList(psStatus){
	//조회조건 유효성 체크
	if(!util.validate(app, "grpSearch")) return false;
	
	util.Submit.send(app, "subList", null, function(pbSuccess){
		if(pbSuccess) {
			util.Msg.notify(app, "INF-M001");
		}
	});
}

/**
 * 데이터를 부모창에 내려준다.(자료내려받기 버튼 클릭시 호출)
 */
function doCloseOk(){
	var grd = app.lookup("grdExl");
	if(grd.rowCount < 1){
		util.Msg.alertDlg(app, "내려줄 자료가 없습니다.");
		return;
	}
	
	var dmColumn = app.lookup("dmColumn");
	var vaColumNames = dmColumn.getColumnNames();
	//지정된 컬럼을 선택했는지 체크
	var vnHCnt = 0;
	vaColumNames.forEach(function(/* String */ item){
		if(dmColumn.getValue(item) != ""){
			vnHCnt++;
		}
	});
	if(vnHCnt < 1){
		//alert 옵션 (닫기 버튼 후 콜백함수, 서브 메시지)
		var poOptions = {
			"confirmCallback" : function() {app.lookup("cmb1").focus();},
			 "subMsg": "적어도 한개 이상의 내려받을 대상 컬럼을 선택하셔야 합니다."
		}
		
		util.Msg.alertDlg(app, "내려줄 자료가 없습니다.", null, poOptions);
		return;
	}
	
	//엑셀 그리드에 있는 데이터를 부모창 그리드에 내려준다.
	var dsExcel = app.lookup("dsExcel");
	var dmColumn = app.lookup("dmColumn");
	
	var vaColumnNames = dmColumn.getColumnNames();
	
	var initValue = app.getHostProperty("initValue");
	var vbIgnoreDuplicate = ValueUtil.fixBoolean(initValue.ignoreDuplicate);
	
	/** @type cpr.data.DataSet */
	var targetDataSet = moTargetGrid.dataSet;
	var vaTargetDataSetPkColumns = ValueUtil.split(targetDataSet.info, ",");
	var rowData = null;
	var dataColumnId = "";
	var vaTempCond = [];
	for(var i=0, len=dsExcel.getRowCount(); i<len; i++){
		rowData = {};
		//중복된 데이터 제외하는 경우
		if(vbIgnoreDuplicate){
			vaTempCond = [];
			vaTargetDataSetPkColumns.forEach(function(column){
				var colVal = "";
				for(var k=0, klen=vaColumnNames.length; k<klen; k++){
					dataColumnId = dmColumn.getValue(vaColumnNames[k]);
					if(dataColumnId == column){
						colVal = dsExcel.getValue(i, "CELL"+vaColumnNames[k].replace("H_", ""));
						break;
					}
				}
				vaTempCond.push(column + "==" + "'" + colVal + "'");
			});
			if(targetDataSet.findFirstRow(vaTempCond.join(" && "))){
				continue;
			}
		}
		
		for(var j=0, jlen=vaColumnNames.length; j<jlen; j++){
			dataColumnId = dmColumn.getValue(vaColumnNames[j]);
			if(dataColumnId == null || dataColumnId == "") continue;
			rowData[dataColumnId] = dsExcel.getValue(i, "CELL"+vaColumnNames[j].replace("H_", ""));
		}
		targetDataSet.addRowData(rowData);
	}
	
	moTargetGrid.redraw();
	
	app.close({complete:"Y"});
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteClick(/* cpr.events.CMouseEvent */ e){
	util.Grid.deleteRow(app, "grdExl");
	util.Control.redraw(app, "optRowCount");
}

/*
 * "파일열기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnOpenClick(e){
	var btnOpen = e.control;
	var grd = app.lookup("grdExl");
	if(grd.rowCount > 0){
		var poOptions = {
			"confirmCallback" : function() { app.lookup("fileinput1").openFileChooser(); }
		}
		util.Msg.confirmDlg(app, "하단 업로드 목록에 자료가 존재합니다. 다시 엑셀 파일을 업로드 하시겠습니까?", null, poOptions);
	}else{
		app.lookup("fileinput1").openFileChooser();
	}
}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onFileinput1ValueChange(e){
	var fileinput1 = e.control;
	// 선택된 파일을 반환합니다.
	var fileObj = fileinput1.file;
	if(fileObj == null) {
		util.Msg.alertDlg(app, "선택된 파일이 없습니다.");
		return;
	}
	
	var submit = app.lookup("subUpload");
    // 전송 시 추가로 전달되는 파라미터에 파일을 추가합니다.
    submit.addFileParameter("F_EXCEL", fileObj);
    util.Submit.send(app, submit.id, null, function(pbSuccess){
    	if(pbSuccess){
    		util.Control.redraw(app, "optRowCount");
    	}
    });
}

/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	
	app.close();
}

/*
 * "자료 내려받기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	
	doCloseOk();
}
