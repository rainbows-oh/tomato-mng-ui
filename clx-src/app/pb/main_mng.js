/*******************************************************************************
 * Business Category :
 * Screen ID : main_mng.js
 * Screen Name : 
 * Created Date :  2026. 11. 3. 오후 3:23:11
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


/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/

/** 패널 폭 (펼침 / 접힘) */
var MENU_WIDTH_OPEN = "250px";
var PANEL_WIDTH_FOLDED = "56px";

/** 패널 접힘 여부 */
var mbMenuFolded = false;

/** 모바일(EXB-PART) 스크린 이름 (767px 이하) */
var SCREEN_MOBILE = "EXB-PART";
/** 모바일에서 좌측 메뉴 패널이 최상단에 떴을 때의 폭 */
var MOBILE_MENU_WIDTH = "250px";

/** 헤더 우측 영역(grpHeaderUtils) 아이콘 간격 (PC/태블릿 / 모바일) */
var HEADER_UTILS_SPACING = 20;
var HEADER_UTILS_SPACING_MOBILE = 12;

/** 본문 그룹 (좌측 메뉴 / 중앙 영역이 놓인 그룹). 모바일 메뉴가 떠 있어도 참조할 수 있도록 load 시 보관 */
var mcBody = null;

/** 모바일 스크린 여부 */
var mbMobile = false;
/** 모바일에서 최상단에 떠 있는 패널 정보 {panel, parent, index, constraint, dim} (닫을 때 원래 위치로 복원). 없으면 null — 한 번에 하나만 열림 */
var moMobilePanel = null;


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
 * 본문 그룹의 중앙 영역에서 화면이 표시되는 임베디드 앱 컨트롤을 찾는다.
 * @param {cpr.controls.Container} pcBody 본문 그룹
 * @return {cpr.controls.EmbeddedApp} 임베디드 앱. 없으면 null.
 */
function doFindContentApp(pcBody) {
	var vaChildren = pcBody.getChildren();
	for (var i = 0; i < vaChildren.length; i++) {
		if (vaChildren[i].type !== "container") continue;
		
		var vaInner = vaChildren[i].getChildren();
		for (var j = 0; j < vaInner.length; j++) {
			if (vaInner[j].type === "embeddedapp") return vaInner[j];
		}
	}
	return null;
}

/**
 * 메뉴 경로에서 앱 ID를 추출한다.
 * @param {String} psPagePath 메뉴 화면 경로 (.clx 포함)
 * @return {String} 앱 ID. 경로가 없거나 clx 파일이 아니면 빈 문자열.
 */
function doGetAppId(psPagePath) {
	if (!psPagePath) return "";
	
	var vnExtIndex = psPagePath.lastIndexOf(".clx");
	return vnExtIndex === -1 ? "" : psPagePath.substring(0, vnExtIndex);
}

/**
 * 좌측 메뉴 패널의 현재 접힘 상태에 맞춰 본문 영역의 컬럼 폭을 갱신한다.
 * @param {cpr.controls.Container} pcBody 좌측 패널, 중앙 영역이 놓인 본문 그룹
 */
function doApplyPanelColumns(pcBody) {
	var vcLayout = pcBody.getLayout();
	
	vcLayout.setColumns([
		mbMenuFolded ? PANEL_WIDTH_FOLDED : MENU_WIDTH_OPEN,
		"1fr"
	]);
	
	/* 모바일에서는 좌측 메뉴 칸을 레이아웃에서 숨김 (패널은 헤더 버튼을 누르면 최상단에 뜸)
	   컨트롤의 visible 이나 클래스로 숨기면 PC 로 돌아올 때 칸 배치가 어긋나므로 레이아웃의 칸 숨김을 사용 */
	vcLayout.setColumnVisible(0, !mbMobile);
}

/**
 * 본문 영역(좌측 메뉴 / 중앙 영역이 놓인 그룹)을 반환한다.
 * 모바일 메뉴가 떠 있으면 grpSidenav 의 부모가 달라지므로, load 시 보관해 둔 본문 그룹을 사용한다.
 * @return {cpr.controls.Container} 본문 그룹
 */
function doGetBody() {
	if (!mcBody) mcBody = app.lookup("grpSidenav").getParent();
	return mcBody;
}

/**
 * 스크린(PC/태블릿 ↔ 모바일)에 맞춰 헤더와 좌/우 패널의 구성을 바꾼다.
 * - 모바일: 헤더의 햄버거(btnMobileMenuOpen) 표시, 인사말(optUserName) 숨김, 우측 아이콘 간격(grpHeaderUtils) 12px,
 *           본문의 좌측 메뉴(grpSidenav) 칸 숨김 (패널은 햄버거 버튼을 누르면 최상단에 뜸),
 *           메뉴 패널 상단은 접기 버튼(btnSidenavFold) 대신 닫기 버튼(btnMobileMenuClose) 표시
 * - PC/태블릿: 위의 반대. 모바일 패널이 떠 있으면 먼저 닫는다.
 * @param {Boolean} pbMobile 모바일 스크린 여부
 */
function doApplyMobileLayout(pbMobile) {
	mbMobile = pbMobile;
	
	if (!pbMobile) doCloseMobilePanel();
	
	app.lookup("grpLogoWrap").getLayout().setColumnVisible(0, pbMobile);
	app.lookup("optUserName").visible = !pbMobile;
	app.lookup("grpHeaderUtils").getLayout().horizontalSpacing = pbMobile ? HEADER_UTILS_SPACING_MOBILE : HEADER_UTILS_SPACING;
	app.lookup("btnSidenavFold").visible = !pbMobile;
	app.lookup("btnMobileMenuClose").visible = pbMobile;
	
	doApplyPanelColumns(doGetBody());
}

/**
 * 모바일에서 패널을 화면 최상단에 띄운다. (뒤에 어두운 배경을 깔고, 배경을 누르면 닫힘)
 * 패널은 본문 그룹의 셀에서 빠져나와 앱 위에 떠 있고, 닫을 때 원래 위치로 되돌린다.
 * 다른 패널이 이미 떠 있으면 먼저 닫는다.
 * @param {cpr.controls.Container} pcPanel 띄울 패널 (grpSidenav)
 * @param {Object} poConstraint 떠 있을 때의 위치/크기 (XY 제약)
 */
function doOpenMobilePanel(pcPanel, poConstraint) {
	if (moMobilePanel) doCloseMobilePanel();
	if (pcPanel.isFloated()) return;
	
	var vcParent = pcPanel.getParent();
	var vcDim = new cpr.controls.Container();
	vcDim.setLayout(new cpr.controls.layouts.XYLayout());
	vcDim.style.addClass("mobile-dim");
	vcDim.addEventListener("click", doCloseMobilePanel);
	
	moMobilePanel = {
		panel: pcPanel,
		parent: vcParent,
		index: vcParent.getChildren().indexOf(pcPanel),
		constraint: vcParent.getConstraint(pcPanel),
		dim: vcDim
	};
	
	app.floatControl(vcDim, {
		top: "0px",
		right: "0px",
		bottom: "0px",
		left: "0px"
	});
	app.floatControl(pcPanel, poConstraint);
}

/**
 * 모바일에서 떠 있는 패널을 닫고 원래 위치로 되돌린다. (떠 있는 패널이 없으면 아무것도 하지 않음)
 */
function doCloseMobilePanel() {
	if (!moMobilePanel) return;
	
	var voInfo = moMobilePanel;
	moMobilePanel = null;
	
	voInfo.parent.insertChild(voInfo.index, voInfo.panel, voInfo.constraint);
	app.getContainer().removeChild(voInfo.dim, true);
}

/** 모바일에서 좌측 메뉴 패널을 최상단에 띄운다. */
function doOpenMobileMenu() {
	doOpenMobilePanel(app.lookup("grpSidenav"), {
		top: "0px",
		bottom: "0px",
		left: "0px",
		width: MOBILE_MENU_WIDTH
	});
}


/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/


/*
 * "Collapse menu panel" 버튼(btnSidenavFold)에서 click 이벤트 발생 시 호출.
 * 좌측 메뉴 패널(grpSidenav)을 접거나 펼친다. (펼침 250px / 접힘 56px, 접힘 시 두 번째 행(메뉴 목록)을 숨겨 버튼만 남김)
 * 접근성: 상태에 맞게 버튼의 fieldLabel(대체 텍스트)도 함께 바꾼다.
 */
function onBtnSidenavFoldClick(e) {
	var vcButton = e.control;
	var vcPanel = app.lookup("grpSidenav");

	mbMenuFolded = !mbMenuFolded;

	vcPanel.getLayout().setRowVisible(1, !mbMenuFolded);
	doApplyPanelColumns(doGetBody());

	vcButton.fieldLabel = mbMenuFolded ? "Expand menu panel" : "Collapse menu panel";
}

/*
 * 헤더의 햄버거 버튼(btnMobileMenuOpen)에서 click 이벤트 발생 시 호출.
 * 모바일에서만 보이는 버튼으로, 누르면 좌측 메뉴를 화면 최상단에 띄운다.
 */
function onBtnMobileMenuOpenClick(e) {
	if (mbMobile) doOpenMobileMenu();
}

/*
 * 메뉴 패널 상단의 닫기 버튼(btnMobileMenuClose)에서 click 이벤트 발생 시 호출. (모바일에서만 보임)
 */
function onBtnMobileMenuCloseClick(e) {
	doCloseMobilePanel();
}

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린이 바뀌면(767px 이하는 EXB-PART) 모바일 / PC 구성으로 전환한다.
 */
function onBodyScreenChange(e) {
	doApplyMobileLayout(e.screen.name == SCREEN_MOBILE);
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 최초 렌더링 직후 현재 스크린이 모바일이면 모바일 구성을 적용한다. (screen-change 는 스크린이 바뀔 때만 발생)
 */
function onBodyLoad(e) {
	mcBody = app.lookup("grpSidenav").getParent();
	doApplyMobileLayout(app.targetScreen.name == SCREEN_MOBILE);
}

/*
 * 사이드 내비게이션에서 item-click 이벤트 발생 시 호출.
 * 선택한 메뉴의 화면(page_path)을 중앙 영역의 임베디드 앱에 로드한다.
 */
function onSnavMenuItemClick(e) {
	var vsAppId = doGetAppId(e.item.row.getValue("page_path"));
	if (!vsAppId) return;
	
	/* 모바일 메뉴가 떠 있으면 부모가 달라지므로 본문 그룹은 doGetBody() 로 가져온다 */
	var vcBody = doGetBody();
	var vcEmbeddedApp = doFindContentApp(vcBody);
	if (!vcEmbeddedApp) return;
	
	cpr.core.App.load(vsAppId, function(/* cpr.core.App */ loadedApp) {
		vcEmbeddedApp.app = loadedApp;
		vcEmbeddedApp.redraw();
	});
	
	/* 모바일에서는 화면을 열면 메뉴를 닫는다 */
	if (mbMobile) doCloseMobilePanel();
}
