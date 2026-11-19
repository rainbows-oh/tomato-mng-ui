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

/** 헤더의 설정 버튼(btnSettings)을 누르면 중앙 영역에 여는 화면 (System Configuration) */
var SETTINGS_APP_ID = "app/pb/management/new4/MGT-CON-01-00_Supplemental_SystemConfiguration_List";

/** 헤더 팝업(알림 grpNotification / 사용자 프로필 grpProfile) 크기 / 위치 — 헤더(56px) 바로 아래, 누른 버튼의 오른쪽 끝에 맞춰 띄움 */
var NOTI_WIDTH = 380;
var NOTI_HEIGHT = 510;
var PROFILE_WIDTH = 320;
/** 프로필 팝업은 높이를 고정하지 않고 안쪽 내용 높이만큼 (doOpenPopover 의 높이를 비우면 자동) */
var POPOVER_TOP = 56;
/** 헤더 팝업 좌우 최소 여백 (화면이 좁을 때 팝업 폭을 줄이는 기준) */
var POPOVER_EDGE_GAP = 8;
/** 높이 자동일 때 안쪽 내용 아래에 더하는 값 — 팝업 아래쪽 안쪽 여백(grpProfile 레이아웃 bottommargin 20) + 테두리 위아래 2px */
var POPOVER_AUTO_HEIGHT_EXTRA = 22;

/** 모바일 스크린 여부 */
var mbMobile = false;
/** 모바일에서 최상단에 떠 있는 패널 정보 {panel, parent, index, constraint, dim} (닫을 때 원래 위치로 복원). 없으면 null — 한 번에 하나만 열림 */
var moMobilePanel = null;
/** 떠 있는 헤더 팝업 정보 {pop, parent, index, constraint, dim} (닫을 때 원래 위치로 복원). 닫혀 있으면 null — 한 번에 하나만 열림 */
var moPopover = null;


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
 * 화면(앱 ID)을 중앙 영역의 임베디드 앱에 로드한다.
 * 모바일 메뉴가 떠 있으면 부모가 달라지므로 본문 그룹은 doGetBody() 로 가져온다.
 * @param {String} psAppId 로드할 화면의 앱 ID (.clx 제외)
 * @return {Boolean} 로드를 시작했으면 true, 앱 ID 가 없거나 임베디드 앱을 못 찾으면 false
 */
function doLoadContent(psAppId) {
	if (!psAppId) return false;
	
	var vcEmbeddedApp = doFindContentApp(doGetBody());
	if (!vcEmbeddedApp) return false;
	
	cpr.core.App.load(psAppId, function(/* cpr.core.App */ loadedApp) {
		vcEmbeddedApp.app = loadedApp;
		vcEmbeddedApp.redraw();
	});
	return true;
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
 * - 모바일: 헤더의 햄버거(btnMobileMenuOpen) 표시, 인사말(btnUserName) 숨김, 우측 아이콘 간격(grpHeaderUtils) 12px,
 *           본문의 좌측 메뉴(grpSidenav) 칸 숨김 (패널은 햄버거 버튼을 누르면 최상단에 뜸),
 *           메뉴 패널 상단은 접기 버튼(btnSidenavFold) 대신 닫기 버튼(btnMobileMenuClose) 표시
 * - PC/태블릿: 위의 반대. 모바일 패널이 떠 있으면 먼저 닫는다.
 * @param {Boolean} pbMobile 모바일 스크린 여부
 */
function doApplyMobileLayout(pbMobile) {
	mbMobile = pbMobile;
	
	doClosePopover();
	if (!pbMobile) doCloseMobilePanel();
	
	app.lookup("grpLogoWrap").getLayout().setColumnVisible(0, pbMobile);
	app.lookup("btnUserName").visible = !pbMobile;
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

/**
 * 헤더 팝업(알림 / 사용자 프로필)을 헤더 바로 아래(top 56px)에 띄운다. (누른 버튼의 오른쪽 끝에 맞춤)
 * 뒤에 투명한 바탕을 깔아 팝업 바깥을 누르면 닫히게 하고, 닫을 때 원래 위치로 되돌린다.
 * 다른 팝업이 이미 떠 있으면 먼저 닫는다.
 * 높이(pnHeight)를 주지 않으면 안쪽 내용 높이만큼 자동으로 맞춘다. (floatControl 은 높이를 직접 지정해야 하므로,
 * 우선 띄운 뒤 안쪽 내용의 실제 높이를 재서 다시 지정한다)
 * @param {cpr.controls.Container} pcPop 띄울 팝업 (grpNotification / grpProfile)
 * @param {cpr.controls.Button} pcButton 누른 헤더 버튼 (btnNotification / btnUserName)
 * @param {Number} pnWidth 팝업 폭. null 이면 폭을 고정하지 않고 화면 좌우(POPOVER_EDGE_GAP 여백)에 맞춤(1fr)
 * @param {Number} [pnHeight] 팝업 높이. 없으면 내용 높이에 맞춤
 */
function doOpenPopover(pcPop, pcButton, pnWidth, pnHeight) {
	if (moPopover) doClosePopover();
	if (pcPop.isFloated()) return;
	
	var vcParent = pcPop.getParent();
	var vcDim = new cpr.controls.Container();
	vcDim.setLayout(new cpr.controls.layouts.XYLayout());
	vcDim.addEventListener("click", doClosePopover);
	
	moPopover = {
		pop: pcPop,
		parent: vcParent,
		index: vcParent.getChildren().indexOf(pcPop),
		constraint: vcParent.getConstraint(pcPop),
		dim: vcDim
	};
	
	var voBtn = pcButton.getActualRect();
	var voApp = app.getContainer().getActualRect();
	var vbFluidWidth = (pnWidth === undefined || pnWidth === null);
	var vnWidth = vbFluidWidth ? 0 : Math.min(pnWidth, voApp.width - POPOVER_EDGE_GAP * 2);
	var vnMaxHeight = voApp.height - POPOVER_TOP - POPOVER_EDGE_GAP;
	var vbAutoHeight = (pnHeight === undefined || pnHeight === null);
	
	var voConstraint = {
		top: POPOVER_TOP + "px",
		/* 자동 높이일 때는 우선 화면에 들어가는 최대 높이로 띄운 뒤 내용 높이로 줄인다 */
		height: (vbAutoHeight ? vnMaxHeight : pnHeight) + "px"
	};
	if (vbFluidWidth) {
		/* 폭 자동(1fr) — 좌우를 화면 가장자리 여백에 붙임 */
		voConstraint.left = POPOVER_EDGE_GAP + "px";
		voConstraint.right = POPOVER_EDGE_GAP + "px";
	} else {
		voConstraint.left = Math.max(POPOVER_EDGE_GAP, voBtn.left - voApp.left + voBtn.width - vnWidth) + "px";
		voConstraint.width = vnWidth + "px";
	}
	
	pcPop.visible = true;
	app.floatControl(vcDim, {
		top: "0px",
		right: "0px",
		bottom: "0px",
		left: "0px"
	});
	app.floatControl(pcPop, voConstraint);
	
	if (vbAutoHeight) {
		/* 줄이는 동안 팝업이 크게 보였다 줄어드는 깜빡임이 없도록 잠시 투명하게 */
		pcPop.style.css("opacity", "0");
		cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
			doFitPopoverHeight(pcPop, voConstraint, vnMaxHeight);
		});
	}
}

/**
 * 떠 있는 팝업의 높이를 안쪽 내용의 실제 높이에 맞춘다. (내용이 화면보다 길면 화면에 들어가는 최대 높이까지만)
 * @param {cpr.controls.Container} pcPop 떠 있는 팝업
 * @param {Object} poConstraint 띄울 때 사용한 위치/크기
 * @param {Number} pnMaxHeight 화면에 들어가는 최대 높이
 */
function doFitPopoverHeight(pcPop, poConstraint, pnMaxHeight) {
	/* 그 사이에 팝업이 닫혔다면 아무것도 하지 않음 */
	if (!moPopover || moPopover.pop !== pcPop) return;
	
	var vnTop = pcPop.getActualRect().top;
	var vnBottom = 0;
	pcPop.getChildren().forEach(function(pcChild) {
		if (!pcChild.visible) return;
		var voRect = pcChild.getActualRect();
		vnBottom = Math.max(vnBottom, voRect.top + voRect.height - vnTop);
	});
	
	/* 내용을 못 잰 경우(0)에는 최대 높이를 그대로 둠 */
	var vnHeight = vnBottom > 0 ? Math.min(vnBottom + POPOVER_AUTO_HEIGHT_EXTRA, pnMaxHeight) : pnMaxHeight;
	poConstraint.height = vnHeight + "px";
	app.floatControl(pcPop, poConstraint);
	pcPop.style.css("opacity", "1");
}

/**
 * 떠 있는 헤더 팝업을 닫는다: 팝업은 원래 칸으로 되돌려 숨기고, 바탕은 없앤다. (떠 있지 않으면 아무것도 하지 않음)
 */
function doClosePopover() {
	if (!moPopover) return;
	
	var voInfo = moPopover;
	moPopover = null;
	
	voInfo.pop.visible = false;
	voInfo.parent.insertChild(voInfo.index, voInfo.pop, voInfo.constraint);
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
 * 헤더의 알림 버튼(btnNotification)에서 click 이벤트 발생 시 호출.
 * 알림 팝업이 닫혀 있으면 열고, 떠 있으면 닫는다.
 */
function onBtnNotificationClick(e) {
	if (moPopover) {
		doClosePopover();
		return;
	}
	/* 모바일에서는 폭을 고정(380)하지 않고 화면 좌우에 맞춤(1fr) */
	doOpenPopover(app.lookup("grpNotification"), e.control, mbMobile ? null : NOTI_WIDTH, NOTI_HEIGHT);
}

/*
 * 알림 팝업 상단의 닫기 버튼(btnNotiClose)에서 click 이벤트 발생 시 호출.
 */
function onBtnNotiCloseClick(e) {
	doClosePopover();
}

/*
 * 헤더의 사용자 이름 버튼(btnUserName)에서 click 이벤트 발생 시 호출.
 * 사용자 프로필 팝업이 닫혀 있으면 열고, 떠 있으면 닫는다.
 */
function onBtnUserNameClick(e) {
	if (moPopover) {
		doClosePopover();
		return;
	}
	doOpenPopover(app.lookup("grpProfile"), e.control, PROFILE_WIDTH);
}

/*
 * 사용자 프로필 팝업 상단의 닫기 버튼(btnProfileClose)에서 click 이벤트 발생 시 호출.
 */
function onBtnProfileCloseClick(e) {
	doClosePopover();
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
	if (!doLoadContent(doGetAppId(e.item.row.getValue("page_path")))) return;
	
	/* 모바일에서는 화면을 열면 메뉴를 닫는다 */
	if (mbMobile) doCloseMobilePanel();
}

/*
 * "Settings" 버튼(btnSettings)에서 click 이벤트 발생 시 호출.
 * System Configuration 화면(SETTINGS_APP_ID)을 중앙 영역의 임베디드 앱에 연다.
 */
function onBtnSettingsClick(e) {
	doLoadContent(SETTINGS_APP_ID);
	
	/* 모바일에서 메뉴가 떠 있었다면 화면을 열면서 닫는다 */
	if (mbMobile) doCloseMobilePanel();
}

/*
 * "Change Password" 버튼(btnChangePw)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnChangePwClick(e) {
	var btnChangePw = e.control;
	
	util.Dialog.open(app, "app/pb/MGT-MYP-02-00_ChangePassword", 600, -1, function() {
		
	}, {
		
	}, {
		
	});
}
