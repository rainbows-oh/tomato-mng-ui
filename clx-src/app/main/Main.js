/************************************************
 * Main.js
 * @프로그램설명 : 
 *
 * @작성일자 :
 * @작성자 : 
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 

/**
 * 인터벌 함수
 */
var moTimeInterval = null;

/**
 * 표시 시간
 */
var moHourTime = null;

/************************************************
 ** 글로벌 함수
 ************************************************/ 

exports.openPage = openPage;
exports.doOpenSearch = doOpenSearch;
exports.doOpenMenuToMdi = doOpenMenuToMdi;
exports.getMenuPath = getMenuPath;
exports.getUserInfo = getUserInfo;
exports.favMnRefresh = favMnRefresh;
exports.removeTabItemFromList = removeTabItemFromList;
exports.expandAsideArea = expandAsideArea;
exports.checkRelation = function(paRows,poRow) {
	/** @type String */
	var vsRows = paRows;
	var vaRows = vsRows.split(",");
	if(vaRows.indexOf(poRow) != -1) {
		return true;
	} else {
		return false;
	}
};
/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 

var util = createCommonUtil();

/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 

cpr.core.Platform.INSTANCE.tooltipManager.setDefaultTooltip(function( /* cpr.controls.UIControl */ tooltipOwner) {
	var vcOptTxt = new cpr.controls.Output();
	if(tooltipOwner && (tooltipOwner.tooltip || tooltipOwner.fieldLabel)) {
		vcOptTxt.value = tooltipOwner.tooltip || tooltipOwner.fieldLabel;
		return vcOptTxt;
	}
});

cpr.core.NotificationCenter.INSTANCE.subscribe(AppProperties.MSG_TOPIC_ID, app, function(poMsgInfo) {
	var vcNotifier = app.lookup("notifier");
	
	if (poMsgInfo["TYPE"] == "SUCCESS") {
		vcNotifier.success(poMsgInfo["MSG"]);
	} else if (poMsgInfo["TYPE"] == "INFO") {
		vcNotifier.info(poMsgInfo["MSG"]);
	} else if (poMsgInfo["TYPE"] == "WARNING") {
		vcNotifier.warning(poMsgInfo["MSG"]);
	} else if (poMsgInfo["TYPE"] == "DANGER") {
		vcNotifier.danger(poMsgInfo["MSG"]);
	} else {
		vcNotifier.info(poMsgInfo["MSG"]);
	}
	
	// 알림 메세지 데이터셋에 알림메시지 추가
	util.DataSet.insertRow(app, "dsNotiMsg", 0, false, {"TYPE" : poMsgInfo["TYPE"], "MSG" : poMsgInfo["MSG"], "REPLAY" : "true"})
});

/**
 * 사용자 정보를 반환한다.
 * @param {String} psUserInfoType (Optional) 사용자 정보 변수(ex: USER_ID)
 * @return {String | cpr.data.DataMap} 사용자 정보
 */
function getUserInfo(psUserInfoType) {
	var dmUserInfo = app.lookup("dmUserInfo");
	if (ValueUtil.isNull(psUserInfoType)) {
		return dmUserInfo;
	}
	return dmUserInfo.getValue(psUserInfoType);
}

function setInitConfig() {
	// 컬러 스키마 처리
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "data-xb-color"))) {
		var voElBody = document.body;
		voElBody.setAttribute("data-xb-color", localStorage.getItem(AppProperties.PROJECT_NM + "data-xb-color"));
	}
	
	// 헤더 내 접속 시간 관련 처리
	/** @type MomentDuration */
	moHourTime = moment().add(1, "hour");
	
	// 한 시간 단위로 프로그레스바 설정
	var vcPrgTimeLimit = app.lookup("prgTimeLimit");
	var voHourTime = moment.duration(1, "hour").asSeconds();
	vcPrgTimeLimit.max = voHourTime;
	vcPrgTimeLimit.value = voHourTime;
	
	// 모바일 메뉴 전체 펼침
	var vcSnavMMenu = app.lookup("snavMMenu");
	vcSnavMMenu.collapseAllItems();
	vcSnavMMenu.addEventListener("node-close", function(e){
//		e.preventDefault();
	});
	
	favMenuCheck();
	
	setLocalSession();
}

function collapseAsideArea() {
	var vcGrpAsd = app.lookup("grpAsd");
	
	vcGrpAsd.style.addClass("collapsed");
	
	util.Control.updateConstraint(app, "grpAsd", null, {
		width: "81px"
	});
	
	util.Control.updateConstraint(app, "btnAsdExpder", null, {
		left: "80px"
	});
	
	util.Control.updateConstraint(app, "grpBody", null, {
		top: "8px",
		right: "16px",
		bottom: "16px",
		left: "105px"
	});
	
	util.Control.setVisible(app, false, ["grpSideBr", "grpDrpSearch"]);
	
	var btnExpander = app.lookup("btnAsdExpder");
	btnExpander.style.addClass("on");
	
	app.getContainer().redraw();
}

function expandAsideArea() {
	var vcGrpAsd = app.lookup("grpAsd");
	
	vcGrpAsd.style.removeClass("collapsed");

	util.Control.updateConstraint(app, "grpAsd", null, {
		width: "300px"
	});
	
	util.Control.updateConstraint(app, "btnAsdExpder", null, {
		left: "299px"
	});
	
	util.Control.updateConstraint(app, "grpBody", null, {
		top: "8px",
		left: "324px"
	});

	util.Control.setVisible(app, true, ["grpSideBr"]);
	
	var btnExpander = app.lookup("btnAsdExpder");
	btnExpander.style.removeClass("on");
	
	var vcSnavMn = app.lookup("snavMn");
	if(ValueUtil.isNull(vcSnavMn.getFilter())) {
		// 루트 메뉴 타이틀 처리
		var snavRtMn = app.lookup("snavRtMn");
		snavRtMn.selectItem(0);
		
		var vcRtMnItem = snavRtMn.getItem(0);
		util.Control.setValue(app, "optMnTit", vcRtMnItem.label);
		vcSnavMn.setFilter("hasAncestor('" + vcRtMnItem.value + "')");
	}
	
	app.getContainer().redraw();
}

/**
 * 로컬 세션 타임을 설정하는 함수입니다.
 * 타임아웃이 발생했을 때에 대한 비즈니스 로직이 수행되어야합니다.
 */
function setLocalSession() {
	
	clearInterval(moTimeInterval);
	
	moTimeInterval = setInterval(function(){
		var vsTime = moment.duration(moHourTime.diff(moment())).asSeconds();
		if (vsTime < 0){
			clearInterval(moTimeInterval);
			return;
		}
		app.lookup("prgTimeLimit").tooltip = Math.floor(vsTime / 60) + "분 " + Math.floor(vsTime % 60) + "초 남았습니다";
		app.lookup("btnUser").tooltip = Math.floor(vsTime / 60) + "분 " + Math.floor(vsTime % 60) + "초 남았습니다";
		util.Control.setValue(app, "prgTimeLimit", Math.floor(vsTime));
	}, 1000);
}


/**
 * 화면을 호출하여 MDI 페이지에 추가하는 함수입니다. 외부에서 호출될 수 있습니다.
 * @param {cpr.data.Row} poRow 선택된 데이터 로우 (데이터셋)
 * @param {Object} poInitParam? 오픈될 메뉴에 전달할 파라미터
 * @param {readyCallback?:(embApp:cpr.controls.EmbeddedApp)=>null} poOptions? 옵션 파라미터
 */
function openPage(poRow, poInitParam, poOptions) {
	var voItemRow = poRow;
	var vsCallPage = ValueUtil.fixNull(voItemRow.getValue("CALL_PAGE"))
	if (vsCallPage == "") {
		return;
	}
	
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiSideCollasped"))) {
		var vbMdiSideCollaped = ValueUtil.fixBoolean(localStorage.getItem(AppProperties.PROJECT_NM + "mdiSideCollasped"));
		var vbMobileScreen = app.getRootAppInstance().targetScreen.name == "EXB-PART"; 
		if(!vbMdiSideCollaped && !vbMobileScreen) { // 모바일이 아니면서 사이드 메뉴 접기 설정인 경우
			// 메뉴 선택 시, 사이드 영역 접기
			collapseAsideArea();
		}
	}
	
	var vcMdiCn = app.lookup("mdiCn");
	
	var vsAppId = "";
	if (vsCallPage.indexOf(".clx") != -1) {
		/* CLX 화면인 경우 */
		vsAppId = vsCallPage.substring(0, vsCallPage.lastIndexOf(".clx"));
	}
	
	var voOpenedTabItem = vcMdiCn.findItemWithAppID(vsAppId);
	if (voOpenedTabItem) {
		if (!ValueUtil.isNull(poInitParam)) {
			// 이미 오픈된 페이지지만 전달할 파라미터가 바뀌었을 경우(문서 이동 스크롤시 사용)
			voOpenedTabItem.content.setAppProperty("initValue", poInitParam);
		}
		vcMdiCn.setSelectedTabItem(voOpenedTabItem);
		return;
	}
	
	var vcDmConfig = app.lookup("dmGlobalConfig");
	var vnMaxWindowCnt = ValueUtil.fixNumber(vcDmConfig.getValue("mdiWindowMaxCount"));
	var vbMdiFirstClose = ValueUtil.fixBoolean(vcDmConfig.getValue("mdiFirstClose"));
	
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiWindowMaxCount"))) {
		vnMaxWindowCnt = ValueUtil.fixNumber(localStorage.getItem(AppProperties.PROJECT_NM + "mdiWindowMaxCount"))
	}
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiFirstClose"))) {
		vbMdiFirstClose = ValueUtil.fixBoolean(localStorage.getItem(AppProperties.PROJECT_NM + "mdiFirstClose"))
	}
	if (vcMdiCn.getTabItems().length > vnMaxWindowCnt - 1) {
		if(vbMdiFirstClose){
			var vbIsCloseTab = false;
			var tabItems = vcMdiCn.getTabItems();
			var openedMenus = localStorage.getItem(AppProperties.PROJECT_NM + "openedMenus") || ""; // null이면 빈 문자열로 대체		
			for(var i=0; i<tabItems.length; i++){
				if(tabItems[i].name != "dashboard" && openedMenus.indexOf(tabItems[i].text) == -1){
					vcMdiCn.close(tabItems[i]);
					vbIsCloseTab = true;
					break;
				}
			}
			if(!vbIsCloseTab){
				// 프로그램 탭은 @개를 초과할 수 없습니다. \n열려있는 프로그램을 닫은 후 선택해 주세요.
				util.Msg.alertDlg(app, "INF-M012", [vnMaxWindowCnt]);
				return false;
			}
		}else{
			// 프로그램 탭은 @개를 초과할 수 없습니다. \n열려있는 프로그램을 닫은 후 선택해 주세요.
			util.Msg.alertDlg(app, "INF-M012", [vnMaxWindowCnt]);
			return false;
		}
	}
	// 로컬스토리지에 고정한 탭 아이템
	var vsSavedItem = localStorage.getItem(AppProperties.PROJECT_NM + "openedMenus");
	var vaObjectItem = ValueUtil.fixNull(vsSavedItem) == "" ? [] : JSON.parse(vsSavedItem);
	var vaOpenedMenuID = vaObjectItem.map(function(each){
		var voMenuInfo = JSON.parse(each)["row"];
		var vsRowPageId = voMenuInfo["MENU_ID"];
		return vsRowPageId;
	});
	
	vcMdiCn.addItemWithApp(vsAppId, true, function( /* cpr.controls.TabItem */ tabItem) {
		/* 초기 파라미터 설정 */
		var voMenuInfo = {
			"row": voItemRow.getRowData()
		}
		
		var vsMenuNm = voItemRow.getValue("MENU_NM");
		/* 아이템 설정 */
		tabItem.text = vsMenuNm;
		tabItem.tooltip = vsMenuNm;
		tabItem.userAttr("__menuInfo", JSON.stringify(voMenuInfo));
		if (ValueUtil.fixNull(poInitParam) != "") {
			voMenuInfo["initParam"] = poInitParam;
		}
		
		/* 아이템 리스트 추가 */
		addTabItemToList(tabItem);
		
		// 로컬스토리지에 고정한 탭 아이템 체크
		if(vaOpenedMenuID.indexOf(voItemRow.getValue("MENU_ID")) != -1) {
			tabItem.checked = true;
		}
			
		/* 임베디드 앱이 준비가 되면 처리할 작업 */
		/** @type cpr.controls.EmbeddedApp */
		var vcEaCn = tabItem.content;
		if (vcEaCn.type == "embeddedapp") {
			vcEaCn.ready(function( /* cpr.controls.EmbeddedApp */ ea) {
				var vnScaleRate = app.getAppProperty("_scaleRate");
				if (vnScaleRate && vnScaleRate != 100) setScreenScale(vnScaleRate, tabItem);
				
				if (!ValueUtil.isNull(poInitParam)) {
					vcEaCn.setAppProperty("initValue", poInitParam);
				}
				
				if (ValueUtil.fixNull(poOptions) != "" && poOptions["readyCallback"]) {
					poOptions["readyCallback"].call(null, ea);
				}
				selectMenuTreeItem();
			});
		}
		
	});
}

/**
 * 메뉴 아이디를 통해 화면을 여는 함수입니다. 메인 화면의 메뉴 데이터셋에서 행을 가져올 수 없을 때 활용합니다.
 * @param {String} psMenuId 메뉴ID
 * @param {Object} poParam? 오픈될 메뉴에 전달할 파라미터
 * @param {readyCallback?:(embApp:cpr.controls.EmbeddedApp)=>null} poOptions? 옵션 파라미터
 */
function doOpenMenuToMdi(psMenuId, poParam, poOptions) {
	var vcDsAllMenu = app.lookup("dsAllMenu");
	var voDsRow = vcDsAllMenu.findFirstRow("MENU_ID == '"+psMenuId+"'");
	if (voDsRow != null){
		var vsAppId = voDsRow.getValue("CALL_PAGE");
		openPage(voDsRow, poParam, poOptions);
	} else {
		util.Msg.alertDlg(app,"WRN-M030");
	}
}

/*
 * 통합화면(Search.clx) 오픈
 * 해당 화면을 MDI 페이지에 추가하는 함수입니다. 외부에서 호출될 수 있습니다.
 */
function doOpenSearch(psValue){
	var vcMdiCn = app.lookup("mdiCn");
	var vsAppId = "app/main/Search";
	var vsMenuNm = "통합검색";
	var vsMenuId = "search"
	// 이미 MID 폴더에 추가된 탭인지 확인
	var voOpenedTabItem = vcMdiCn.findItemWithAppID(vsAppId);
	if (voOpenedTabItem) {
		vcMdiCn.setSelectedTabItem(voOpenedTabItem);
		
		if (!ValueUtil.isNull(psValue)) {
			voOpenedTabItem.content.setAppProperty("initValue", psValue);
		}
		return;
	}
	// 최대 탭 개수 초과 시
	var vcDmConfig = app.lookup("dmGlobalConfig");
	var vnMaxWindowCnt = ValueUtil.fixNumber(vcDmConfig.getValue("mdiWindowMaxCount"));
	var vbMdiFirstClose = ValueUtil.fixBoolean(vcDmConfig.getValue("mdiFirstClose"));
	
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiWindowMaxCount"))) {
		vnMaxWindowCnt = ValueUtil.fixNumber(localStorage.getItem(AppProperties.PROJECT_NM + "mdiWindowMaxCount"))
	}
	
	if (!ValueUtil.isNull(localStorage.getItem(AppProperties.PROJECT_NM + "mdiFirstClose"))) {
		vbMdiFirstClose = ValueUtil.fixBoolean(localStorage.getItem(AppProperties.PROJECT_NM + "mdiFirstClose"))
	}
	if (vcMdiCn.getTabItems().length > vnMaxWindowCnt - 1) {
		
		if(vbMdiFirstClose){
			var tabItems = vcMdiCn.getTabItems();
			var openedMenus = localStorage.getItem(AppProperties.PROJECT_NM + "openedMenus") || ""; // null이면 빈 문자열로 대체		
			for(var i=0; i<tabItems.length; i++){
				if(tabItems[i].name != "dashboard" && openedMenus.indexOf(tabItems[i].text) == -1){
					vcMdiCn.close(tabItems[i]);
					break;
				}
			}
		}else{
			// 프로그램 탭은 @개를 초과할 수 없습니다. \n열려있는 프로그램을 닫은 후 선택해 주세요.
			util.Msg.alertDlg(app, "INF-M012", [vnMaxWindowCnt]);
			return false;
		}
	}
	
	var embeddidApp = new cpr.controls.EmbeddedApp(vsAppId);
	vcMdiCn.addItemWithApp(vsAppId,true, function( /* cpr.controls.TabItem */ tabItem){
		/* 임베디드 앱이 준비된 후 호출되는 메소드 */
		tabItem.name = vsMenuId
		tabItem.visible = true;
		tabItem.closable = true;
		tabItem.text = vsMenuNm;
		var voMenuInfo = {
			"row": {
				"CALL_PAGE" : vsAppId,
				"MENU_NM" : vsMenuNm,
				"MENU_ID" : vsMenuId
			}
		}
		tabItem.userAttr("__menuInfo", JSON.stringify(voMenuInfo))
		// 로컬스토리지에 고정한 탭 아이템
		var vsSavedItem = localStorage.getItem(AppProperties.PROJECT_NM + "openedMenus");
		var vaObjectItem = ValueUtil.fixNull(vsSavedItem) == "" ? [] : JSON.parse(vsSavedItem);
		vaObjectItem.map(function(each){
			var voMenuInfo = JSON.parse(each)["row"];
			if(voMenuInfo["MENU_ID"] == vsMenuId){
				tabItem.checked = true;
				return false;
			};
		});
		// MDI 폴더에 추가
		vcMdiCn.addTabItem(tabItem);
		/* 아이템 리스트 추가 */
		var vcLbxTabList = app.lookup("lbxTabList");
		if(!vcLbxTabList.getItemByValue("_Search")){
			vcLbxTabList.addItem(new cpr.controls.Item(vsMenuNm, "_Search"));
		}
		
		/** @type cpr.controls.EmbeddedApp */
		var vcEaCn = tabItem.content;
		if (vcEaCn.type == "embeddedapp") {
			vcEaCn.ready(function( /* cpr.controls.EmbeddedApp */ ea) {
				if (!ValueUtil.isNull(psValue)) {
					vcEaCn.setAppProperty("initValue", psValue);
				}
			})
		}
	});
}

/**
 * 현재메뉴의 메뉴 path 리턴
 * @param {String} psMenuId
 * @return {cpr.utils.ObjectMap}
 */
function getMenuPath(psMenuId) {
	/** @type cpr.data.DataSet */
	var vcDsAllMenu = app.lookup("dsAllMenu");
	if (vcDsAllMenu == null) return "";
	
	var vaMenuPathId = [];
	var vaMenuPathNm = [];
	var voMenu = null;

	while (true) {
		voMenu = vcDsAllMenu.findFirstRow("MENU_ID == '" + psMenuId + "'");
		if (voMenu == null) break;
		if (voMenu.getValue("parentMenuId") == "") {
			vaMenuPathId.push(voMenu.getValue("MENU_ID"));
			vaMenuPathNm.push(voMenu.getValue("MENU_NM"));
			break;
		}
		
		vaMenuPathId.push(voMenu.getValue("MENU_ID"));
		vaMenuPathNm.push(voMenu.getValue("MENU_NM"));
		psMenuId = voMenu.getValue("UP_MENU_ID");
	}
	
	var lbxMenuBarItem = null;
	
	vaMenuPathId.reverse();
	vaMenuPathNm.reverse();
	
	var vaMenuPathInfo = new cpr.utils.ObjectMap();
	vaMenuPathInfo.put("MENU_PATH_ID", vaMenuPathId);
	vaMenuPathInfo.put("MENU_PATH_NM", vaMenuPathNm);
	
	return vaMenuPathInfo;
}

/**
 * 현재 추가한 탭 아이템을 탭 아이템 목록으로 추가
 * @param {cpr.controls.TabItem} pcTabItem
 */
function addTabItemToList(pcTabItem) {
	var vcLbxTabList = app.lookup("lbxTabList");
	
	/** @type cpr.data.DataRow */
	var voMenuInfo = JSON.parse(pcTabItem.userAttr("__menuInfo"));
	/** @type Object */
	var voRowData = voMenuInfo.row;
	// 화면 분할상태에서 다른메뉴 오픈 후 닫을 경우, 아이템이 중복되어 리스트 오류가 생기는 현상 때문에 조건문 추가
	// 해당 값을 가진 아이템이 있을 경우 추가 x 
	if(!vcLbxTabList.getItemByValue(voRowData["MENU_ID"])){
		vcLbxTabList.addItem(new cpr.controls.Item(voRowData["MENU_NM"], voRowData["MENU_ID"]));
	}
}

/**
 * 추가된 탭 아이템을 탭 아이템 목록에서 제거
 * @param {voRowData.getValue("MENU_NM")} pcTabItem
 */
function removeTabItemFromList(pcTabItem) {
	var vcLbxTabList = app.lookup("lbxTabList");
	
	if (ValueUtil.isNull(pcTabItem.userAttr("__menuInfo"))) return;

	var voMenuInfo = JSON.parse(pcTabItem.userAttr("__menuInfo"));
	/** @type cpr.data.DataRow */
	var voRowData = voMenuInfo.row;
	
	var vsItemVal = voRowData["MENU_ID"];
	if (vsItemVal == "search") vsItemVal = "_Search";
		
	vcLbxTabList.deleteItemByValue(vsItemVal);
	
	
	// 마지막 탭 아이템 close 할 때 dashboard 선택
	var vcMdiCn = app.lookup("mdiCn");
	var vaOpenedTabs = vcMdiCn.getTabItems();
	if (vaOpenedTabs.length == 2) {
		vcMdiCn.setSelectedTabItem(vcMdiCn.getItemByName("dashboard"));
	}
	
	// 필요 없는 기능 주석처리(2025-02-04)
	// 탭 아이템이 모두 지워진 후 대시보드 탭 선택
	/*
	var vcMdiCn = app.lookup("mdiCn");
	var vaOpenedTabs = vcMdiCn.getTabItems();
	if (vaOpenedTabs.length > 1) {
		// 분할 상태에서 다른메뉴 오픈 후 해지 할 경우, 탭 아이템 인덱스가 바껴서 인덱스 0이 아닌 dashboard 이름으로 찾도록 변경
		vcMdiCn.setSelectedTabItem(vcMdiCn.getItemByName("dashboard"));
	}
	*/
}

/**
 * 화면 배율 조정
 * @param {Number} pnZoomRate
 * @param {Object} poMdiItem 화면 신규 오픈시 적용할 mdiItem
 */
function setScreenScale(pnZoomRate, poMdiItem) {
	var vcMdiCn = app.lookup("mdiCn");
	
	// 화면에 적용될 scale 비율
	var vnScale = (pnZoomRate / 100).toFixed(1);
	// 실제 화면에 적용될 비율 % 
	var vsScreenRate = ((100 / pnZoomRate) * 100) + "%";
	var vaContents;
	
	if (poMdiItem) { // 화면 신규 오픈시 비율 적용
		vaContents = [poMdiItem];
	} else { // 메인화면 버튼을 통한 화면확대/축소 기능 사용시
		vaContents = vcMdiCn.getTabItems();
	}
	
	vaContents.forEach(function(tabItem) {
		/** @type cpr.controls.EmbeddedApp */
		var EmbeddedApp = tabItem.content;
		var voContainer = EmbeddedApp.getEmbeddedAppInstance().getContainer();
		
		/*
		 * 화면 확대/축소 로직
		 * 루트 레이아웃의 scale은 적용된 scale 비율에 따라 적용
		 * 축소 : 내부 루트 레이아웃의 크기는 고정하고 임베디드 앱 영역의 width,height 확장
		 * 확대 : 임베디드 앱 영역의 크기는 고정하고 내부 루트 컨테이너의 width,height 축소 
		 */
		voContainer.style.css({
			"transform": "scale3d(" + vnScale.toString() + ", " + vnScale.toString() + ", 1)",
			"transform-origin": "0 0"
		});
		
		if (pnZoomRate < 100) {
			voContainer.style.css({
				width: "100%",
				height: "100%"
			});
			
			EmbeddedApp.style.css({
				width: vsScreenRate,
				height: vsScreenRate
			});
		} else {
			EmbeddedApp.style.css({
				width: "100%",
				height: "100%"
			});
			
			/*
			 * TODO 화면 확대시 스크롤이 생성되는 scale만 확장(스크롤 생성)시킬지 브라우저 배율기능과 동일하게  적용(스크롤 미생성)할지 프로젝트 별 검토가 필요함
			 * 루트레이아웃이 폼 레이아웃으로 구성된 경우 콘텐트 영역 폼레이아웃에 scroable false시 스크롤이 생성되지 않음 
			 */
			voContainer.style.css({
				width: vsScreenRate,
				height: vsScreenRate
			});
		}
		EmbeddedApp.redraw();
	});
	
	app.setAppProperty("_scaleRate", pnZoomRate);
	util.Control.setValue(app, "nbeZmRatio", pnZoomRate);
}

/**
 * 화면에 팝업을 플로팅하는 함수입니다. 팝업외의 영역을 클릭하면 팝업이 닫힙니다.
 * @param {cpr.controls.UIControl} pcControl
 * @param {{top:String, right:String, bottom:String, left:String, width:String, height:String}} poConstraint
 * @param {closeCallback : Function, modal : Boolean} poOption? 추가옵션
 */
function floating(pcControl, poConstraint, poOption) {
	var vcFloatingTarget = pcControl;
	
	var vcGrpCont = app.getContainer();
	
	var vcGrpOverlay = new cpr.controls.Container();
	vcGrpOverlay.setLayout(new cpr.controls.layouts.XYLayout());
	
	vcGrpOverlay.userAttr("floated-configuration", "true");
	
	vcGrpOverlay.addEventListenerOnce("click", function(e) {
		unfloating(vcFloatingTarget);
		
		if (hasOption("closeCallback") && _.isFunction(poOption["closeCallback"])) poOption["closeCallback"]();
	});
	
	if (pcControl.getParent()) {
		
		pcControl._originParent = pcControl.getParent();
		pcControl._originIndex = pcControl.getParent().getChildren().indexOf(pcControl);
		pcControl._originConstraint = pcControl.getParent().getConstraint(pcControl);
		pcControl._originVisible = pcControl.visible;
	}
	
	vcGrpCont.addChild(vcGrpOverlay, {
		top: "0px",
		right: "0px",
		bottom: "0px",
		left: "0px"
	});
	
	if (hasOption("modal")) {
		vcGrpOverlay.style.addClass("cl-overlay");
	}
	
	util.Control.setVisible(app, true, vcFloatingTarget.id);
	
	//vcGrpCont.floatControl(vcFloatingTarget, poConstraint);
	app.floatControl(vcFloatingTarget, poConstraint);
	
	vcFloatingTarget.focus();
	if (!vcFloatingTarget.focusable) {
		vcFloatingTarget.getAllRecursiveChildren().find(function(each){
			if (each.focusable) return each;
		}).focus();
	}
	
	/**
	 * poOption 옵션 파라미터가 존재하는지 체크하는 함수입니다. 
	 * @param {String} psParamName
	 */
	function hasOption(psParamName) {
		if (ValueUtil.fixNull(poOption) != "" && poOption[psParamName]) {
			return true;
		} else {
			return false;
		}
	}
}

/**
 * 열렸던 팝업을 닫는 함수입니다. 별도의 호출없이, floating된 팝업이 있을 때 팝업 외의 영역을 클릭하면 수행됩니다.
 * @param {cpr.controls.UIControl} pcControl
 */
function unfloating(pcControl) {
	var vcGrpCont = app.getContainer();

	vcGrpCont.getChildren().filter(function(each) {
		return each.userAttr("floated-configuration") == "true";
	}).forEach(function(each) {
		vcGrpCont.removeChild(each, true);
	});
	
	/** @type cpr.controls.Container */
	var vcOriginParent = pcControl._originParent;
	if (vcOriginParent) {
		
		vcOriginParent.insertChild(pcControl._originIndex, pcControl, pcControl._originConstraint);
		util.Control.setVisible(app, pcControl._originVisible, pcControl.id);
	} else {
		
		var voActualRect = pcControl.getActualRect();
		vcGrpCont.addChild(pcControl, {
			top: "10px",
			bottom: "10px",
			left: -250 + "px",
			width: voActualRect.width + "px"
		});
	}
	if (pcControl.userAttr("prevent-hide") == "true") {
		util.Control.setVisible(app, true, pcControl.id);
	}
	
}


/**
 * 세션스토리지에 담긴 정보를 가지고 새로고침 전에 열었던 화면을 다시 열어주는 함수입니다.
 * 기존에 열려있던 화면에 대해 init parameter를 정의했었다면, 해당 정보를 가진 상태의 화면을 열게됩니다. 
 */
function openSaveMenu(){
	var openMenus = localStorage.getItem(AppProperties.PROJECT_NM + "openedMenus");
	var dsAllMenu = app.lookup("dsAllMenu");
	
	if(openMenus) {	
		/** @type Array */
		var vaOpenList = JSON.parse(openMenus);
		vaOpenList.forEach(function(each){
			var voMenuInfo = JSON.parse(each);
			var voRowInfo = voMenuInfo["row"];
			var vsRowPageId = voRowInfo["MENU_ID"];
			var vsCallPage = voRowInfo["CALL_PAGE"];
			var voInitParam = null;
			if(voRowInfo.hasOwnProperty("initParam")) {
				voInitParam = voMenuInfo["initParam"];
			}
			// 통합검색 화면인 경우
			if(vsRowPageId == "search"){
				doOpenSearch();
			}else{
				var voRow = dsAllMenu.findFirstRow("MENU_ID == '"+ vsRowPageId +"'");
				if (ValueUtil.fixNull(vsCallPage) != "") {
					openPage(voRow, voInitParam)
				}
			}
		});
	}
}


/**
 * 컨텐츠 영역 (MDIFolder)을 확대합니다.
 */
function zoomInContent() {
	
	util.Control.setVisible(app, false, ["grpAsd"]);
	
	util.Control.updateConstraint(app, "grpBody", null, {
		top: "8px",
		right: "5px",
		bottom: "5px",
		left: "5px"
	});
	
	app.lookup("btnUtilZoom").style.removeClass("btn-tab-max");
	app.lookup("btnUtilZoom").style.addClass("btn-tab-min");
}

/**
 * 컨텐츠 영역 (MDIFolder)을 축소합니다.
 */
function zoomOutConent() {
	
	util.Control.setVisible(app, true, ["grpAsd"]);
	util.Control.setVisible(app, false, ["grpMHd"]);
	
	collapseAsideArea();
	
	app.lookup("mdiCn").hideHeader = false;
	
	app.lookup("btnUtilZoom").style.removeClass("btn-tab-min");
	app.lookup("btnUtilZoom").style.addClass("btn-tab-max");
}

/**
 * 로컬스토리지에 저장되어 있는 메뉴ID를 가져와서 즐겨찾기 컬럼 값 변경 메서드
 * @param {Boolean} pbFavCheck? 앱헤더 체크 여부
 */
function favMenuCheck() {
	var vsFavMenus = localStorage.getItem(AppProperties.PROJECT_NM + "favMenus");
	
	util.DataSet.findAllRow(app, "dsAllMenu", "MENU_FAV == 'Y'").forEach(function(each){
		each.setValue("MENU_FAV", "");
	});
		
	if (!ValueUtil.isNull(JSON.parse(vsFavMenus))) {
		JSON.parse(vsFavMenus).forEach(function(each, idx){
			util.DataSet.findRow(app, "dsAllMenu", "MENU_ID == '" + each + "'").setValue("MENU_FAV","Y");	
		});
	}
}


/**
 * 체크/언체크된 아이템을 로컬스토리지에 저장
 * @param {cpr.controls.TabItem} pcTabItem
 * @param {Boolean} pbChecked
 */
function mdiLockTabItem(pcTabItem, pbChecked) {
	var openMenus = [];
	var vsSavedItem = localStorage.getItem(AppProperties.PROJECT_NM + "openedMenus");
	if (!ValueUtil.isNull(vsSavedItem)) openMenus = openMenus.concat(JSON.parse(vsSavedItem));
	
	var vaObjectItem = ValueUtil.fixNull(vsSavedItem) == "" ? [] : JSON.parse(vsSavedItem);
	var vaOpenedMenuID = vaObjectItem.map(function(each){
		var voMenuInfo = JSON.parse(each)["row"];
		var vsRowPageId = voMenuInfo["MENU_ID"];
		return vsRowPageId;
	});
	
	if (pbChecked) {
		// 체크한 탭 아이템 로컬스토리지 저장
		if(vaOpenedMenuID.indexOf(JSON.parse(pcTabItem.userAttr(AppProperties.MAIN_MENU_INFO))["row"]["MENU_ID"]) == -1) {
			openMenus.push(pcTabItem.userAttr(AppProperties.MAIN_MENU_INFO));
		}
	} else {
		// 체크한 탭 아이템 로컬스토리지 제거
		if(vaOpenedMenuID.indexOf(JSON.parse(pcTabItem.userAttr(AppProperties.MAIN_MENU_INFO))["row"]["MENU_ID"]) != -1) {
			openMenus.splice(vaOpenedMenuID.indexOf(JSON.parse(pcTabItem.userAttr(AppProperties.MAIN_MENU_INFO))["row"]["MENU_ID"]),1);
		}
	}

	localStorage.setItem(AppProperties.PROJECT_NM + "openedMenus", JSON.stringify(openMenus));
}

// udcComAppHeader 앱 헤더의 즐겨찾기 체크박스 값이 변경 시 불러오는 함수
function favMnRefresh() {
	// 즐겨찾기 사이드메뉴가 열려 있을 경우
	if (app.lookup("optMnTit").value =='즐겨찾기') {
		var vcSnavMn = app.lookup("snavMn");
		//  즐겨찾기 컬럼 값 변경
		favMenuCheck();
		vcSnavMn.redraw();
	}
}

/**
 * 통합 검색 데이터 추가 (최근 검색 기록 및 메뉴 아이템)
 * @param {String} psValue
 */
function addSearchData(psValue) {
	//최근 검색 기록 추가 함수와 메뉴 추가 함수 분리
	//- 최근 검색 기록 버튼 클릭 시 메뉴 추가 하도록
	
	//최근 검색 기록 추가
	addRcntData(psValue);
	//메뉴 추가
	addMenuData(psValue);
}

/**
 * 최근 검색 기록 추가 (최대 5개까지)
 * @param {String} psValue
 */
function addRcntData(psValue){
	var vcGrpRcntSearch = app.lookup("grpRcntSearch");
	vcGrpRcntSearch.scrollTo(0, 0);
	
	if (vcGrpRcntSearch.getChildrenCount() == 5){
		vcGrpRcntSearch.removeChild(vcGrpRcntSearch.getLastChild(), true);
	}
	
	var vcBtnRcntItem = new cpr.controls.Button();
	vcBtnRcntItem.value = psValue;
	vcBtnRcntItem.style.setClasses(["btn-base"]);
	vcBtnRcntItem.addEventListener("click", function(e){
		var vsValue = e.control.value;
		/* 데이터 재검색 */
		if (app.lookup("grpGlbSearchWrap").visible == true){
			app.lookup("sipMGlbSearch").value = vsValue;
		} else {
			app.lookup("sipMnSearch").value = vsValue;
		}
		
		//메뉴 추가
		addMenuData(vsValue);
	});
	
	vcGrpRcntSearch.insertChild(0, vcBtnRcntItem, {
		autoSize: "width",
		height: "24px"
	});
}

/**
 * 메뉴 검색 결과 표시
 * @param {String} psValue
 */
function addMenuData(psValue){
	var vcGrpMnSearch = app.lookup("grpMnSearch");
	vcGrpMnSearch.removeAllChildren(true); // 검색 아이템 초기화
	vcGrpMnSearch.scrollTo(0, 0);
	
	var vcDsAllMn = app.lookup("dsAllMenu");
	var vaMatchedMnItems = vcDsAllMn.findAllRow("(MENU_NM).toLowerCase() *= '" + psValue.toLowerCase() + "'");
	for(var idx = 0; idx < vaMatchedMnItems.length; idx++){
		var voMatchedMnItem = vaMatchedMnItems[idx];
		var vnMenuLvl = voMatchedMnItem.getValue("MENU_LVL");
		if(ValueUtil.isNull(voMatchedMnItem.getValue("CALL_PAGE"))) {
			continue;
		}
		
		// 호출가능한 화면이 존재하는 경우에만 표시
		var vcBtnMnItem = new cpr.controls.Button();
		vcBtnMnItem.value = voMatchedMnItem.getValue("MENU_NM");
		vcBtnMnItem.userAttr("MENU_ID", voMatchedMnItem.getValue("MENU_ID"));
		vcBtnMnItem.style.setClasses(["btn-submit"]);
		vcBtnMnItem.addEventListener("click", function(e){
			doOpenMenuToMdi(e.control.userAttr("MENU_ID"));
			util.Control.setVisible(app, false, "grpDrpSearch");
		});
			
		vcGrpMnSearch.addChild(vcBtnMnItem, {
			autoSize: "width",
			height: "24px"
		});
	}
}

/**
 * 루트 메뉴에 따른 사이드 메뉴를 필터링 한다.
 * @param {cpr.controls.TreeItem} pcRtMnItem
 */
function filterSnavMn(pcRtMnItem) {
	app.lookup("btnFavMn").style.removeClass("on");
	
	util.Control.setVisible(app, true, "grpBtns");
	util.Control.setValue(app, "sipMnSearch", "");
	
	// 루트 메뉴 타이틀 처리
	util.Control.setValue(app, "optMnTit", pcRtMnItem.label);
	
	// 루트 메뉴에 따른 사이드 메뉴 필터
	var vcSnavMn = app.lookup("snavMn");

	vcSnavMn.setFilter("hasAncestor('" + pcRtMnItem.value + "')");
}

/**
 * 선택된 MDI 탭에 대하여 메뉴트리를 선택한다.
 */
function selectMenuTreeItem() {
	var vcSnavMn = app.lookup("snavMn");
	var vcMdiCn = app.lookup("mdiCn");
	var voSelectedTabItem = vcMdiCn.getSelectedTabItem();
	if(!voSelectedTabItem) return;
	
	var vsMenuInfo = voSelectedTabItem.userAttr("__menuInfo");
	if(!vsMenuInfo) return;
	var vsMenuId = JSON.parse(vsMenuInfo).row.MENU_ID;
	
	vcSnavMn.clearFilter();
	var voFindItem = vcSnavMn.findItem({value: vsMenuId});
	if(!voFindItem) return;
	var vaParentItems = util.Tree.getTreeItemAllParents(voFindItem);
	var voParentItem = vaParentItems.find(function(each){
		return each.depth == 0;
	});
	if(!voParentItem) return;
	var vsParentValue = voParentItem.value;
	
	filterSnavMn(voParentItem);
	app.lookup("snavRtMn").selectItem(voParentItem, false);

	if(!vcSnavMn.isSelected(voFindItem) || !vcSnavMn.isExpanded(voFindItem)) { // 선택아이템이 선택되어있지 않거나 선택아이템의 메뉴가 펼쳐져 있지 않은 경우
		util.Tree.expandAllItems(app, "snavMn", false);
		if(voFindItem) util.Tree.expandParentItem(app, "snavMn", voFindItem, true);
		vcSnavMn.selectItem(voFindItem, false);
	}
}

/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린 크기 변경 시 전파되는 이벤트.
 */
function onBodyScreenChange(e){
	
	fnResponsiveMainLayout(e.screen.name);
	
	if(util.isMobile())  {
		// 모바일 디바이스일 경우에만 커스텀 스크롤 적용
		cpr.core.AppConfig.INSTANCE.setEnvValue("useCustomScrollbar", true);
	} else {
		cpr.core.AppConfig.INSTANCE.setEnvValue("useCustomScrollbar", false);
	}
	
	if (e.screen.name == "EXB-PART"){
		util.Control.setVisible(app, false, ["grpAsd", "btnAsdExpder", "grpDrpSearch", "udccommdidiv1","btnMdiZoom","btnUtilZoom", "btnMdiList", "grpBtnHome", "btnMdiRefresh", "btnMdiWinOpen", "btnMdiClose", "btnMMenu"]);
		
	} else {
		// PC 및 테블릿
		util.Control.setVisible(app, true, ["grpAsd", "btnAsdExpder", "udccommdidiv1","btnMdiZoom","btnUtilZoom", "btnMdiList", "grpDrpSearch", "grpBtnHome", "btnMdiRefresh", "btnMdiWinOpen", "btnMdiClose"]);
		util.Control.setVisible(app, false, ["btnMMenu"]);
		
		collapseAsideArea();
	}
}

/*
 * 버튼(btnLogo)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLogoClick(e){
	location.reload();
}

/*
 * 사이드 내비게이션에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onSnavRtMnItemClick(e){
	var vcRtMnItem = e.item;
	filterSnavMn(vcRtMnItem);
	// 메뉴 열기
	expandAsideArea();
}

/*
 * 버튼(btnFavMn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnFavMnClick(e){
	var btnFav = e.control;
	
	var vcSnavMn = app.lookup("snavMn");
	app.lookup("snavRtMn").clearSelection();
	
	util.Control.setVisible(app, false, "grpBtns");
	favMenuCheck();
	
	// 즐겨찾기 메뉴 필터
	vcSnavMn.setFilter("MENU_FAV == 'Y'");
	vcSnavMn.redraw();
	util.Control.setValue(app, "optMnTit", "즐겨찾기");
	
	btnFav.style.addClass("on");
	
	// 메뉴 펼치기
	expandAsideArea();
}

/*
 * 버튼(btnUserSet)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnUserSetClick(e){
	var btnUserSet = e.control;
	util.Dialog.open(app, "app/main/Setting", 480, -1, function(dialog){
	});
}

/*
 * "사용자" 버튼(btnUser)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnUserClick(e){
	util.Dialog.open(app, "app/main/User", 480, 360, function(dialog){
	});
}

/*
 * 그룹에서 mouseleave 이벤트 발생 시 호출.
 * 사용자가 컨트롤 및 컨트롤의 자식 영역 바깥으로 마우스 포인터를 이동할 때 발생하는 이벤트.
 */
function onGrpAsdMouseleave(e){
	//collapseAsideArea();
}

/*
 * 사이드 내비게이션에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onSnavMnItemClick(e){
	var voItemRow = e.item.row;
	var vsCallPage = voItemRow.getValue("CALL_PAGE");
	if (ValueUtil.fixNull(vsCallPage) != "") {
		openPage(voItemRow, true);
		
		// 모바일일 때 어사이드 메뉴 닫기
		app.getFloatingControls().filter(function(each) {
			return each.style.hasClass("cl-overlay");
		}).forEach(function(each) {
			each.dispatchEvent(new cpr.events.CMouseEvent("click"));
		});
		
		if(app.lookup("grpMMenu").isFloated()) unfloating(app.lookup("grpMMenu"));
	}
}

/*
 * MDI 폴더에서 content-ready 이벤트 발생 시 호출.
 * TabItem의 Content가 그려질 준비를 마쳤을 때 호출되는 이벤트로 컨트롤을 그리는 스크립트가 동작하기 전에 호출됨.
 */
function onMdiCnContentReady(e){
}

/*
 * MDI 폴더에서 close 이벤트 발생 시 호출.
 * 탭 아이템을 닫을 때 발생하는 이벤트이며, 사용자가 취소할 수 있습니다.
 */
function onMdiCnClose(e){
	var mdiCn = e.control;
	
	function _closeItem (poItem) {
		/* 확인 버튼 클릭 시, 화면 close */
		mdiCn.removeTabItem(poItem);
		
		var vaLastTabItems = mdiCn.getTabItems()[mdiCn.getTabItems().length-1];
		if (!vaLastTabItems) {
			return;
		}
		
		mdiCn.setSelectedTabItem(vaLastTabItems[0]);
		removeTabItemFromList(poItem);
		
		// 체크한 탭 아이템 해제
		if (poItem.checked) {
			poItem.checked = false;
		}
	}
	
	if (e.content && e.content.content && (e.content.content instanceof cpr.controls.EmbeddedApp)) {
		var vcItemApp = e.content.content.getEmbeddedAppInstance();
		if(vcItemApp) {
			
			/* MDI Tab 닫을 때, 앱 내부  데이터 변경사항 여부 체크 로직 제거 */
			var vbModify = util.isAppModified(vcItemApp, "CRM", vcItemApp.getContainer(), {
				confirmCallback: function(){
					// 변경사항 존재할 경우
					// 확인 버튼 클릭 시 닫기
					_closeItem(e.content);
				}
			});
			
			if(vbModify) {
				// 기본 close 동작 방지
				e.preventDefault();
				mdiCn.setSelectedTabItem(e.content);
				return false;
			} else {
				// 변경사항 없는 경우 닫기
				_closeItem(e.content);
			}
		}
	}
}

/*
 * 버튼(btnMdiHome)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMdiHomeClick(e){
	var vcMdiCn = app.lookup("mdiCn");
	vcMdiCn.setSelectedTabItem(vcMdiCn.getItemByName("dashboard"));
}

/*
 * 버튼(btnMdiList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMdiListClick(e){
	var vcBtnMdiList = app.lookup("btnMdiList");
	var voBtnMdiListActlRct = vcBtnMdiList.getActualRect();

	floating(app.lookup("grpMnListPop"), {
		top: voBtnMdiListActlRct.top + voBtnMdiListActlRct.height + 4 + "px",
		right: window.innerWidth - voBtnMdiListActlRct.left - voBtnMdiListActlRct.width + "px",
		width: "150px"
	});
}

/*
 * 버튼(btnMdiZoom)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMdiZoomClick(e){
	var vcBtnMdiZoom = app.lookup("btnMdiZoom");
	var voBtnMdiZoomActrlRct = vcBtnMdiZoom.getActualRect();
	
	floating(app.lookup("grpZmSetPop"), {
		top: voBtnMdiZoomActrlRct.top + voBtnMdiZoomActrlRct.height + 4 + "px",
		right: window.innerWidth - voBtnMdiZoomActrlRct.left - voBtnMdiZoomActrlRct.width + "px",
		width: "100px",
		height: "32px"
	});
}

/*
 * 버튼(btnMdiRefresh)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMdiRefreshClick(e){
	// 현재 선택되어 있는 화면을 새로고침
	var vcMdiCn = app.lookup("mdiCn");
	
	var vcSelectedTabItem = vcMdiCn.getSelectedTabItem();
	var vcItemCn = vcSelectedTabItem.content;
			
	if (vcItemCn instanceof cpr.controls.EmbeddedApp) {
		var vsAppId = vcItemCn.app.id;
		vcItemCn.app = null;
		cpr.core.App.load(vsAppId, function(loadedApp) {
			vcItemCn.app = loadedApp;
			vcItemCn.redraw();
		});
	}
}

/*
 * 버튼(btnMdiClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMdiCloseClick(e){
	// 대시보드를 제외한 나머지 탭 삭제
	var vcMdiCn = app.lookup("mdiCn");
	
	util.Msg.confirmDlg(app, "전체 메뉴를 닫으시겠습니까?", null,{
		confirmCallback: function(){
			var vcAliveTabItem = vcMdiCn.getItemByName("dashboard");
			if(vcAliveTabItem != null) {
				vcAliveTabItem.checked = true;
			}
			var vaOpenedTabs = vcMdiCn.getTabItems();
			vaOpenedTabs.forEach(function(each){
				if(!each.checked) {
					each.close();
				}
			});
			
			// 고정 탭이 존재하여도 대시보드 화면을 선택
			if(vcAliveTabItem != null) {
				vcMdiCn.setSelectedTabItem(vcAliveTabItem);
			}
		}
		,subMsg: "잠긴 탭은 닫히지 않습니다."
	});
}

/*
 * 버튼(btnAsdExpder)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAsdExpderClick(e){
	var vcGrpAsd = app.lookup("grpAsd");
	
	/* 어사이드 영역의 접힘 상태에 따라 영역을 토글 */
	if (vcGrpAsd.style.hasClass("collapsed") == true) {
		expandAsideArea();
	} else {
		collapseAsideArea();
	}
}


/*
 * 버튼(btnZmOut)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnZmOutClick(e){
	var vnScaleVal = Number(util.Control.getValue(app, "nbeZmRatio"));
	if (vnScaleVal <= app.lookup("nbeZmRatio").min){
		return;
	}
	setScreenScale(vnScaleVal - 10);
}

/*
 * 버튼(btnZmIn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnZmInClick(e){
	var vnScaleVal = Number(util.Control.getValue(app, "nbeZmRatio"));
	if (vnScaleVal >= app.lookup("nbeZmRatio").max){
		return;
	}
	
	setScreenScale(vnScaleVal + 10);
}

/*
 * 리스트 박스에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onLbxTabListItemClick(e){
	var lbxTabList = e.control;
	// 활성 탭 아이템 변경
	var vcMdiCn = app.lookup("mdiCn");
	// 클릭한 아이템 value
	var vsItemVal = e.item.value;
	// 대시보드나 , 통합검색일 경우
	if (vsItemVal == "_Dashboard" || vsItemVal == "_Search") { 
		// _Dashboard -> dashboard로 변경 후 검색
		vcMdiCn.setSelectedTabItem(vcMdiCn.getItemByName(vsItemVal.toLowerCase().replace("_", "")));
		// 언플로팅
		unfloating(app.lookup("grpMnListPop"));
		return;
	}else {
		var vsAppId = util.DataSet.findRow(app, "dsAllMenu", "MENU_ID == '" + e.item.value + "'").getValue("CALL_PAGE");
		if (vsAppId.indexOf(".clx") != -1) {
			/* CLX 화면인 경우 */
			vsAppId = vsAppId.substring(0, vsAppId.lastIndexOf(".clx"));
		}
		
		var voOpenedTabItem = vcMdiCn.findItemWithAppID(vsAppId);
		if (voOpenedTabItem) {
			vcMdiCn.setSelectedTabItem(voOpenedTabItem);
			
			// 언플로팅
			unfloating(app.lookup("grpMnListPop"));
			return;
		} else {
			// clx 화면이 없는 경우 탭 아이템 선택
			vcMdiCn.getTabItems().filter(function(each){
				if (each.text == e.item.label) {
					vcMdiCn.setSelectedTabItem(each);
					return;
				}
			});
		}
	}
}

/*
 * 버튼(btnMMenu)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMMenuClick(e){
	var vnDsNotiCnt = util.DataSet.findAllRow(app, "dsNotiMsg", "REPLAY == 'true'");
	if (vnDsNotiCnt.length > 0) {
		util.Control.addClass(app, "btnMAlarm", "on");
	} else {
		util.Control.removeClass(app, "btnMAlarm", "on");
	}
	
	floating(app.lookup("grpMMenu"), {
		top: "0px",
		right: "0px",
		bottom: "0px",
		left: "0px",
		zIndex: "1"
	});
}

/*
 * 버튼(btnMMenuClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMMenuCloseClick(e){
	unfloating(app.lookup("grpMMenu"));
}

/*
 * 버튼(btnMAlarm)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMAlarmClick(e){
	var btnMAlarm = e.control;
	util.Dialog.open(app, "app/main/User", 480, 360, function(dialog){
		var vnDsNotiCnt = util.DataSet.findAllRow(app, "dsNotiMsg", "REPLAY == 'true'");
		if (vnDsNotiCnt.length > 0) {
			util.Control.addClass(app, "btnMAlarm", "on");
		} else {
			util.Control.removeClass(app, "btnMAlarm", "on");
		}
	});
}

/*
 * 버튼(btnMSetting)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMSettingClick(e){
	var btnMSetting = e.control;
	util.Dialog.open(app, "app/main/Setting", "auto", -1, function(dialog){
	});
}

/*
 * "로그아웃" 버튼(btnMLogout)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMLogoutClick(e){
	var btnMLogout = e.control;
	cpr.core.App.load("app/main/Login", function(loadedApp){
		app.dispose();
		loadedApp.createNewInstance().run();
		cpr.core.Platform.INSTANCE.setDocumentTitle(loadedApp.title);
	});
}

/*
 * "홈으로" 버튼(btnMHome)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMHomeClick(e){
	app.lookup("btnMMenuClose").click();
	app.lookup("btnMdiHome").click();
}

/*
 * "테마" 버튼(btnMCustm)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMCustmClick(e){
	var btnMCustm = e.control;
	util.Dialog.open(app, "app/main/Setting", "auto", -1, function(dialog){
	});
}

/*
 * "전체메뉴" 버튼(btnMAllMenu)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMAllMenuClick(e){
	util.Control.setVisible(app, true, "btnMFavMenu");
	util.Control.setVisible(app, false, "btnMAllMenu");
	
	app.lookup("snavMMenu").clearFilter();
}

/*
 * "즐겨찾기" 버튼(btnMFavMenu)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMFavMenuClick(e){
	util.Control.setVisible(app, false, "btnMFavMenu");
	util.Control.setVisible(app, true, "btnMAllMenu");
	
	favMenuCheck();

	// 즐겨찾기 메뉴 필터
	app.lookup("snavMMenu").setFilter("MENU_FAV == 'Y'");
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	// 사이드 메뉴 펼치기
	app.lookup("snavMn").expandAllItems();
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	// 사이드 메뉴 접기
	app.lookup("snavMn").collapseAllItems();
}

/*
 * MDI 폴더에서 tabheader-click 이벤트 발생 시 호출.
 * 탭 아이템의 헤더 영역을 클릭하였을 때 발생하는 이벤트입니다.
 */
function onMdiCnTabheaderClick(e){
	var mdiCn = e.control;
	if(e.button == 2){
		var item = e.item;
		
		var vcSelectedTabItem = mdiCn.getSelectedTabItem();
		
		e.preventDefault();
		var vcRootContainer = app.getRootAppInstance().getContainer();
	
		var vcMenu = new cpr.controls.Menu("mdiTabmenu");
		vcMenu.addItem(new cpr.controls.MenuItem("모든 탭 닫기", "closeAll", "root"));
		vcMenu.addItem(new cpr.controls.MenuItem("다른 탭 닫기", "closeOthers", "root"));
		vcMenu.addItem(new cpr.controls.MenuItem("앱ID 복사", "clipBoardAppId", "root"));
	    vcMenu.addItem(new cpr.controls.MenuItem("새창 열기", "tabPopup", "root"));
	    
		vcMenu.addEventListener("selection-change", function( /**@type cpr.events.CSelectionEvent */ e) {
			var vaNewSelection = e.newSelection;
			switch (vaNewSelection[0].value) {
				case "closeAll":
					/* 대시보드 탭과 잠김 탭 이외의 모든 탭 아이템을 닫음 */
					var lockItems = mdiCn.getCheckedTabItems();
					var vcAliveTabItem = mdiCn.getItemByName("dashboard");
					if(lockItems.length <= 1){ // 대시보드는 항상 check 상태
						mdiCn.closeOthers(vcAliveTabItem);
					} else {
						var items = mdiCn.getTabItems();
						for(var i = 1; i < items.length ; i++){
							if(lockItems.indexOf(items[i]) < 0) {
								mdiCn.close(items[i]);
							}
						}
					}
					
					// 대시보드 화면을 선택
					if(vcAliveTabItem != null) {
						mdiCn.setSelectedTabItem(mdiCn.getItemByName("dashboard"));
					}
					break;
				case "closeOthers":
					/* 대시보드 탭과 잠김 탭과 현재 선택된 탭 이외의 모든 탭 아이템을 닫음 */
					var vaItems = mdiCn.getTabItems();
					
					var vcAliveTabItem = mdiCn.getItemByName("dashboard");
					
					vaItems.some(function(each){
						if(vcAliveTabItem.content.app.id == each.content.app.id || each.content.app.id == item.content.app.id || each.checked){
							return false;
						}
						mdiCn.close(each);
					});
					mdiCn.setSelectedTabItem(item, false);
					break;
				case "clipBoardAppId":
					var input = document.createElement("input");
					input.style.position = "fixed";
					input.value = item.content.app.id;
					document.body.appendChild(input);
					input.focus();
					input.select();
					document.execCommand("copy");
					document.body.removeChild(input);
					util.Msg.notify(app, "앱 ID가 복사되었습니다.");
					break;
				case "tabPopup":
					var voTabItem = mdiCn.getSelectedTabItem();
					var vsAppId = voTabItem.content.app.id;
					
					//미리보기 서버일 경우
					if (typeof eb6Preview != "undefined") {
						vsAppId = vsAppId + ".clx.html"
					}else{
						vsAppId = vsAppId + ".clx"
					}
					window.open(vsAppId, "_blank");
				break;	
			}
			vcMenu.hide();
			vcMenu.dispose();
		});
	
		vcMenu.addEventListener("blur", function( /**@type cpr.events.CFocusEvent*/ e) {
			vcMenu.hide();
			vcMenu.dispose();
		});
		var showConstraint = {
				"position" : "absolute",
				"top" : e.clientY + "px",
				"left" : e.clientX + "px",
				"width" : "150px",
				"height" : "auto"
			};
		if(vcRootContainer.getLayout() instanceof cpr.controls.layouts.FormLayout){
			app.floatControl(vcMenu, showConstraint);
		}else{
			vcRootContainer.addChild(vcMenu, showConstraint);
		}	
		vcMenu.focus();
	}
}

/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(e){
	var btnUtilZoom = e.control;
	
	var vbZoomed = btnUtilZoom.style.hasClass("btn-tab-min");
	if (vbZoomed) {
		zoomOutConent();
	} else {
		// 네비게이션은 닫히기 때문에 버튼만 visible 처리
		app.lookup("btnAsdExpder").visible = false;
		zoomInContent();
	}
}


/*
 * "새 창 띄우기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(e){
	var button = e.control;
	var vcMdiCn = app.lookup("mdiCn");
	var voTabItem = vcMdiCn.getSelectedTabItem();
	if (!voTabItem.content.app) return;
	var vsAppId = voTabItem.content.app.id;
	
	// 대시보드 화면 제외
	if (voTabItem == vcMdiCn.getItemByName("dashboard")) return;
	
	//미리보기 서버일 경우
	if (typeof eb6Preview != "undefined") {
		vsAppId = vsAppId + ".clx.html"
	}else{
		vsAppId = vsAppId + ".clx"
	}
	window.open(vsAppId, "_blank");
}

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	util.Submit.send(app, "subOnLoad", function(pbSuccess) {
		if (pbSuccess) {
			// 대시보드 화면 로드
			var vcEaHome = app.lookup("eaHome");
			vcEaHome.app = null;
			cpr.core.App.load("app/main/Home", function(loadedApp) {
				vcEaHome.app = loadedApp;
				vcEaHome.redraw();
			});
			setInitConfig();
			openSaveMenu();
			/* 아이템 리스트 추가 */
			app.lookup("lbxTabList").addItem(new cpr.controls.Item("Dashboard", "_Dashboard"));
			util.Control.redraw(app, "snavRtMn");
		}
	});
}

/*
 * 사용자 정의 컨트롤에서 changeDivideType 이벤트 발생 시 호출.
 * 분할 방식을 변경했을 때 발생하는 이벤트
 */
function onUdcComMdiDivChangeDivideType(e){
	var udcComMdiDiv = e.control;
	
	var vbCtrlVisible = (udcComMdiDiv.divideType == "default");
	util.Control.setVisible(app, vbCtrlVisible, ["btnMdiList", "btnMdiZoom", "btnMdiClose", "btnMdiRefresh", "btnMdiWinOpen"]);
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	var mdiFolder = app.lookup("mdiCn");
	var dashboard = mdiFolder.getItemByName("dashboard");
	dashboard.checked = true;
}

/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(e){
	clearInterval(moTimeInterval);
}

/*
 * MDI 폴더에서 tabheader-check 이벤트 발생 시 호출.
 * 탭아이템의 체크박스를 체크시 발생하는 이벤트이며, 사용자가 취소할 수 있습니다.
 */
function onMdiCnTabheaderCheck(e){
	var mdiCn = e.control;
	if (e.item.name != "dashboard") mdiLockTabItem(e.item, true);
}

/*
 * MDI 폴더에서 tabheader-uncheck 이벤트 발생 시 호출.
 * 탭아이템의 체크박스를 체크를 해제시 발생하는 이벤트이며, 사용자가 취소할 수 있습니다.
 */
function onMdiCnTabheaderUncheck(e){
	var mdiCn = e.control;
	if (e.item.name != "dashboard") {
		mdiLockTabItem(e.item, false);
	}else{
		e.preventDefault();
	}
}

/*
 * 서치 인풋에서 search 이벤트 발생 시 호출.
 * Searchinput의 enter키 또는 검색버튼을 클릭하여 인풋의 값이 Search될때 발생하는 이벤트
 */
function onSearchInputSearch(e){
	var searchInput = e.control;
	var vcSideNav = app.lookup("snavMMenu");
	/** @type cpr.data.DataSet */
	var vcDsNav = vcSideNav.dataSet;
	
	if(ValueUtil.isNull(vcDsNav)) {
		return;
	}
	vcSideNav.clearFilter();
	vcSideNav.collapseAllItems();
	
	var vsNewValue = app.lookup("sipMSearch").value.toLowerCase();
	var vaRows = vcDsNav.findAllRow("MENU_LOWERCASE *= '" + vsNewValue+"' || DESC_LOWERCASE *= '" + vsNewValue + "' || TAG_LOWERCASE *= '" + vsNewValue + "'");
	var vaTreeItems = vaRows.map(function(each){
		return vcSideNav.getItemByValue(each.getValue("MENU_ID"));
	});
	
	var vaResults = [];
	vaTreeItems.forEach(function(each){
		
		var vaParentItem = each.parentItem;
		while(vaParentItem){
			vaResults.push(vaParentItem);
			vaParentItem = vaParentItem.parentItem;		
		}
	});
	var vaAllValue = vaTreeItems.concat(vaResults).map(function(each){
		return each.value;
	});
	
	if(vaAllValue.length > 0) {
		vcSideNav.setFilter("@checkRelation('"+vaAllValue.join(",")+"',value)");
		vcSideNav.expandItem(vcSideNav.getItem(0));
		vcSideNav.expandAllItems(vcSideNav.getItem(0));
		vcSideNav.clearSelection();
	}
}

/*
 * 서치 인풋에서 search 이벤트 발생 시 호출.
 * Searchinput의 enter키 또는 검색버튼을 클릭하여 인풋의 값이 Search될때 발생하는 이벤트
 */
function onSipMnSearchSearch(e){
	var sipMnSearch = e.control;
	
	util.Control.setVisible(app, true, "grpDrpSearch");
	
	var vcSipGlbSearch = app.lookup("sipMnSearch");
	var voSipGlbSearchActlRct = vcSipGlbSearch.getActualRect();
	
	var voGrpHdActlRct = vcSipGlbSearch.getActualRect();
	var vcSnavMnHeight = app.lookup("snavMn").getActualRect().height;
	
	var vcGrpDrpSearch = app.lookup("grpDrpSearch");
	app.getContainer().floatControl(vcGrpDrpSearch, {
		top: (voGrpHdActlRct.bottom + 20) + "px",
		left: voSipGlbSearchActlRct.left + "px",
		width: "455px"
	});

	// 검색 팝업 최대 높이 지정
	vcGrpDrpSearch.getLayout().maxContentHeight = vcSnavMnHeight - 50;
	/* 통합 검색 데이터 추가 (최근 검색 기록 및 메뉴 아이템) */
	addSearchData(vcSipGlbSearch.displayText);
	
	app.getContainer().addEventListener("click", function(ev){
		if (ev.targetControl != vcGrpDrpSearch){
			app.getContainer().removeEventListeners("click");
			util.Control.setVisible(app, false, "grpDrpSearch");
		}
	});
}

/*
 * 버튼(btnSiteMap)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSiteMapClick(e){
	var btnSiteMap = e.control;
	
	util.Dialog.open(app, "app/main/Sitemap", 1300, 700, function(){
		
	}, {}, {
		headerMax: true,
		resizable: true
	});
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrpDrpSearchClick(e){
	var grpDrpSearch = e.control;
	e.stopPropagation();
}

/*
 * 버튼(btnDrpSearchClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDrpSearchCloseClick(e){
	var btnDrpSearchClose = e.control;
	util.Control.setVisible(app, false, "grpDrpSearch");
}

/*
 * MDI 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onMdiCnSelectionChange(e){
	selectMenuTreeItem();
}


/**
 * 반응형 모바일, 태블릿 일 경우 mdi탭 구조 변경
 * @param {String} psScreenName 스크린명
 */
function fnResponsiveMainLayout (psScreenName) {
	
	if (psScreenName == "EXB-PART") {
		app.lookup("mdiCn").headerArrowVisible = false;
		app.lookup("mdiCn").getItemByName("dashboard").visible = true;
		
		util.Control.updateConstraint(app, "grpBody", null, {
			top: "8px",
			right: "5px",
			bottom: "55px",
			left: "5px"
		});
		
		// 반응형 모바일 일 경우 mdi 버튼 풋터 영역으로 이동
		var vcMFooter = new cpr.controls.Container("mobileFooter");
		var layout = new cpr.controls.layouts.FormLayout();
		layout.scrollable = false;
		layout.horizontalSpacing = "0px";
		layout.verticalSpacing = "0px";
		layout.topMargin = "0px";
		layout.rightMargin = "0px";
		layout.bottomMargin = "0px";
		layout.leftMargin = "0px";
		layout.setColumns(["1fr", "1fr", "1fr", "1fr", "1fr"]);
		layout.setRows(["1fr"]);
		
		vcMFooter.setLayout(layout);
		vcMFooter.style.addClass("mobile-footer");
		
		// 새로운 버튼 생성
		var vcBtnMdiClose = new cpr.controls.Button();
		var vcBtnMdiRefresh = new cpr.controls.Button();
		var vcBtnMdiHome = new cpr.controls.Button();
		var vcBtnMdiWinOpen = new cpr.controls.Button();
		var vcBtnMMenu = new cpr.controls.Button();
		
		// 버튼 클래스 추가
		vcBtnMdiClose.style.addClass("btn-tab-close");
		vcBtnMdiRefresh.style.addClass("btn-refresh");
		vcBtnMdiHome.style.addClass("btn-home");
		vcBtnMdiWinOpen.style.addClass("btn-win-open");
		vcBtnMMenu.style.addClass("btn-menu");
		
		// 새로 생성된 버튼에 기존에 있던 이벤트 연결
		vcBtnMdiClose.addEventListener("click", onBtnMdiCloseClick);
		vcBtnMMenu.addEventListener("click", onBtnMMenuClick);
		vcBtnMdiHome.addEventListener("click", onBtnMdiHomeClick);
		vcBtnMdiRefresh.addEventListener("click", onBtnMdiRefreshClick);
		vcBtnMdiWinOpen.addEventListener("click", onButtonClick4);
		
		// 풋터 영역에 버튼 추가
		vcMFooter.addChild(vcBtnMdiClose, {
			"colIndex": 0,
			"rowIndex": 0,
			"horizontalAlign": "center",
			"verticalAlign": "center",
			"width": 40,
			"height": 40
		});
		vcMFooter.addChild(vcBtnMdiRefresh, {
			"colIndex": 1,
			"rowIndex": 0,
			"horizontalAlign": "center",
			"verticalAlign": "center",
			"width": 40,
			"height": 40
		});
		vcMFooter.addChild(vcBtnMdiHome, {
			"colIndex": 2,
			"rowIndex": 0,
			"horizontalAlign": "center",
			"verticalAlign": "center",
			"width": 40,
			"height": 40
		});
		vcMFooter.addChild(vcBtnMdiWinOpen, {
			"colIndex": 3,
			"rowIndex": 0,
			"horizontalAlign": "center",
			"verticalAlign": "center",
			"width": 40,
			"height": 40
		});
		vcMFooter.addChild(vcBtnMMenu, {
			"colIndex": 4,
			"rowIndex": 0,
			"horizontalAlign": "center",
			"verticalAlign": "center",
			"width": 40,
			"height": 40
		});
		vcMFooter.redraw();
		
		// 컨테이너에 모바일풋터 추가
		app.getContainer().addChild(vcMFooter, {
			"right": "0px",
			"bottom": "0px",
			"left": "0px",
			"height": "55px"
		});
		
	} else {
		app.lookup("mdiCn").headerArrowVisible = true;
		app.lookup("mdiCn").getItemByName("dashboard").visible = false;
		
		// 모바일이 아닐경우 모바일풋터 삭제
		app.getContainer().removeChild(app.lookup("mobileFooter"), true);
	}
	
	app.getContainer().redraw();
}


