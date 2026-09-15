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
/**
 * 재확인이 필요한 메세지의 경우 알림방에 메세지 아이템을 추가
 * @param {
 *   {
 *     "REPLAY" : Boolean <!-- 알림방 추가 여부 -->,
 *     "TYPE" : "" | "info" | "success" | "warning" | "danger" <!-- 메세지 유형 -->,
 *     "MSG" : String <!-- 메세지 내용 -->
 *   }
 * } poMsgInfo
 */
function createNotificationItem(poMsgInfo) {
	var vcGrpDrpdwnBd = app.lookup("grpNotiList");
	
	var vcGrpItem = new cpr.controls.Container();
	vcGrpItem.style.setClasses(["item"]);
	var vlForm = new cpr.controls.layouts.FormLayout();
	vlForm.scrollable = false;
	vlForm.horizontalSpacing = "0px";
	vlForm.verticalSpacing = "0px";
	vlForm.topMargin = "0px";
	vlForm.rightMargin = "0px";
	vlForm.bottomMargin = "0px";
	vlForm.leftMargin = "0px";
	vlForm.setColumns(["1fr"]);
	vlForm.setRows(["0px", "0px"]);
	vlForm.setRowAutoSizing(0, true);
	vlForm.setRowAutoSizing(1, true);
	vcGrpItem.setLayout(vlForm);
	var vcOptDate = new cpr.controls.Output();
	vcOptDate.value = "오늘";
	vcOptDate.style.setClasses(["caption"]);
	vcGrpItem.addChild(vcOptDate, {
		"colIndex": 0,
		"rowIndex": 1
	});
	var vcBtnMsg = new cpr.controls.Button();
	vcBtnMsg.value = poMsgInfo["MSG"];
	vcBtnMsg.style.setClasses(["message"]);
	if (poMsgInfo["REPLAY"] == "true") {
		vcBtnMsg.style.addClass("on");
	}
	vcGrpItem.addChild(vcBtnMsg, {
		"colIndex": 0,
		"rowIndex": 0
	});
	vcGrpDrpdwnBd.addChild(vcGrpItem, {
		"autoSize": "height",
		"width": "400px",
		"height": "67px"
	});
}

/**
 * 메세지 개수, 데이터가 없는 경우 등에 대한 업데이트를 진행합니다. 
 */
function updateNotification() {
	/* 메세지 개수 처리 */
	util.Control.setVisible(app, false, "optEmptyMessage");
	
	var vnNotiCnt = app.lookup("grpNotiList").getChildrenCount();
	if (vnNotiCnt == 0) {
		util.Control.setVisible(app, true, "optEmptyMessage");
	}
}
/*
 * 그룹에서 scroll 이벤트 발생 시 호출.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onGrpNotiListScroll(e){
	if (e.scrollTop > 0){
		e.control.style.css("box-shadow", "inset 0 0 12px 0 rgba(0, 0, 0, .1)");
	} else {
		e.control.style.removeStyle("box-shadow");
	}
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
	
	/** @type cpr.data.DataSet */
	var vcDsNotiMsg = app.getRootAppInstance().lookup("dsNotiMsg");
	if (vcDsNotiMsg.getRowCount() > 0) {
		for (var i = 0; i < vcDsNotiMsg.getRowCount(); i++) {
			createNotificationItem(vcDsNotiMsg.getRowDataRanged()[i])
		}
	}
	updateNotification();
}

/*
 * "전체삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	
	/** @type cpr.data.DataSet */
	var vcDsNotiMsg = app.getRootAppInstance().lookup("dsNotiMsg");
	vcDsNotiMsg.clearData();
	
	app.lookup("grpNotiList").removeAllChildren();
	util.Control.setVisible(app, true, "optEmptyMessage");
}

/*
 * "모두읽기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	app.lookup("grpNotiList").getAllRecursiveChildren().forEach(function(each){
		if (each instanceof cpr.controls.Button && each.style.hasClass("on")) {
			each.style.removeClass("on");
		}
	});
	
	/** @type cpr.data.DataSet */
	var vcDsNotiMsg = app.getRootAppInstance().lookup("dsNotiMsg");
	if (vcDsNotiMsg.getRowCount() > 0) {
		for (var i = 0; i < vcDsNotiMsg.getRowCount(); i++) {
			vcDsNotiMsg.setValue(i, "REPLAY", "false")
		}
	}
}

/*
 * "로그아웃" 버튼(btnMLogout)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMLogoutClick(e){
	var btnMLogout = e.control;
	cpr.core.App.load("app/main/Login", function(loadedApp){
		app.getRootAppInstance().dispose();
		loadedApp.createNewInstance().run();
		cpr.core.Platform.INSTANCE.setDocumentTitle(loadedApp.title);
	});
}

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	 app.lookup("grpNotiList").removeAllChildren();
}
