/************************************************
 * User.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2024. 9. 12..
 * @작성자 : ryu
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


/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdbColorSelectionChange(e){
	var voElBody = document.body;
	
	var vcItem = e.newSelection;
	var vsItemColor = vcItem.value;
	if (vsItemColor == "default"){
		voElBody.removeAttribute("data-xb-color");		
	} else {
		voElBody.setAttribute("data-xb-color", vcItem.value);
	}
	
	localStorage.setItem(AppProperties.PROJECT_NM + "data-xb-color", vcItem.value);
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	// 컬러 스키마 처리
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "data-xb-color"))) {
		util.SelectCtl.selectItem(app, "rdbColor", localStorage.getItem(AppProperties.PROJECT_NM + "data-xb-color"))
	}
	
	// MDI 탭 오픈 개수
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiWindowMaxCount"))) {
		app.lookup("rdbMdiCnt").value = localStorage.getItem(AppProperties.PROJECT_NM + "mdiWindowMaxCount");
	}
	
	// MDI 탭 초과시 닫기 옵션
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiFirstClose"))) {
		app.lookup("rdbMdiFirstClose").value = localStorage.getItem(AppProperties.PROJECT_NM + "mdiFirstClose");
	}
	
	// 메뉴 선택시, 사이드 영역 접기여부 옵션
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiSideCollasped"))) {
		app.lookup("rdbSnavSetting").value = localStorage.getItem(AppProperties.PROJECT_NM + "mdiSideCollasped");
	}
	
	var voGrpSettingLyt = app.lookup("grpSetting").getLayout();
	if (app.getRootAppInstance().targetScreen.name == "EXB-PART"){
//		voGrpSettingLyt.setRowVisible(2, false);
//		voGrpSettingLyt.setRowVisible(3, false);
		voGrpSettingLyt.setRowVisible(4, false);
	} else {
//		voGrpSettingLyt.setRowVisible(2, true);
//		voGrpSettingLyt.setRowVisible(3, true);
		voGrpSettingLyt.setRowVisible(4, true);
	}
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdbMdiCntSelectionChange(e){
	localStorage.setItem(AppProperties.PROJECT_NM +  "mdiWindowMaxCount", e.newSelection.value);
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdbmdiFirstCloseSelectionChange(e){
	localStorage.setItem(AppProperties.PROJECT_NM + "mdiFirstClose", e.newSelection.value);
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdbSnavSettingSelectionChange(e){
	localStorage.setItem(AppProperties.PROJECT_NM + "mdiSideCollasped", e.newSelection.value);
}
