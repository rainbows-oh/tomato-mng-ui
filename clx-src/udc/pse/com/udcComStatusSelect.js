/*******************************************************************************
 * Business Category :
 * Screen ID : udcComStatusSelect.js
 * Screen Name :
 * Created Date :  2026. 11. 10. 오전 9:07:25
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
exports.getText = getText;


/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
/** 필터 카드(grpCard). 최초 표시 시 lookup 으로 얻어 보관한다. */
var vcCard = null;
/** 카드 높이(px). 고정 — 내용이 더 길면 Done 버튼 위 목록(company-list 그룹)에서만 스크롤 */
var VC_CARD_HEIGHT = 357;
/** 카드 너비(px) — PC/태블릿, 모바일(EXB-PART = 767px 이하) */
var VC_CARD_WIDTH = 440;
var VC_CARD_WIDTH_MOBILE = 280;
/** 모바일 스크린 이름 */
var VC_SCREEN_MOBILE = "EXB-PART";
/** 스크롤 추적 리스너 (카드 표시 중에만 등록) */
var vcScrollHandler = null;
/** requestAnimationFrame 중복 예약 방지 플래그 */
var vcScrollPending = false;
/** 카드 바깥 클릭 감지 리스너 (카드 표시 중에만 등록) */
var vcOutsideHandler = null;
/** 콤보박스(cmbSector)를 눌렀는지 여부 (콤보박스 클릭은 카드 바깥 클릭으로 보지 않기 위한 플래그) */
var vbComboPressed = false;

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
 * Returns the text to be displayed for the UDC control in the grid's view mode.
 */
function getText() {
	// TODO: Write code to return the text to be displayed in the grid's view mode.
	return "";
};

/**
 * 필터 카드를 UDC 바로 아래에 플로팅하고 표시한다.
 * UDC 가 놓인 영역의 높이/레이아웃에 영향받지 않도록 최상위 앱(AppInstance)에 띄운다.
 * (이미 플로팅된 컨트롤이면 위치만 갱신된다)
 */
function openCard() {
	if (!vcCard) vcCard = app.lookup("grpCard");

	var vcHost = app.getHost();	// UDC 컨트롤 (단독 실행 시 null)
	var vcAnchor = vcHost ? vcHost : app.lookup("cmbSector");
	var vcTargetApp = vcHost ? app.getRootAppInstance() : app;
	var vcRect = vcAnchor.getActualRect();

	/* 모바일에서는 카드 폭 고정 */
	var vnWidth = (vcTargetApp.targetScreen.name == VC_SCREEN_MOBILE) ? VC_CARD_WIDTH_MOBILE : VC_CARD_WIDTH;

	vcCard.visible = true;
	vcTargetApp.floatControl(vcCard, new cpr.geometry.Rectangle(vcRect.left, vcRect.bottom + 4, vnWidth, VC_CARD_HEIGHT));
};

/**
 * 필터 카드를 숨긴다. (플로팅 상태는 유지하고 visible 만 끈다 — 제거 후 재플로팅 시 렌더가 복구되지 않는 문제 회피)
 */
function closeCard() {
	if (vcCard) vcCard.visible = false;
	unbindScrollFollow();
	unbindOutsideClick();
};

/**
 * 노드가 필터 카드(grpCard, card 클래스) 안에 속하는지 확인한다.
 * @param {Node} pnNode 이벤트 발생 노드
 * @return {Boolean}
 */
function doIsInsideCard(pnNode) {
	var vnNode = pnNode;
	while (vnNode) {
		if (typeof vnNode.className === "string" && (" " + vnNode.className + " ").indexOf(" card ") > -1) {
			return true;
		}
		vnNode = vnNode.parentNode;
	}
	return false;
};

/**
 * 카드 바깥을 눌렀을 때 카드를 닫는 리스너를 등록한다. (카드 안, 콤보박스를 누른 경우는 제외)
 * 콤보박스의 mousedown(컨트롤 이벤트)이 document 리스너보다 먼저 실행되어 vbComboPressed 로 구분한다.
 */
function bindOutsideClick() {
	if (vcOutsideHandler) return;

	vcOutsideHandler = function(ev) {
		if (vbComboPressed) {
			vbComboPressed = false;
			return;
		}
		if (doIsInsideCard(ev.target)) return;
		closeCard();
	};
	document.addEventListener("mousedown", vcOutsideHandler, false);
};

/**
 * 카드 바깥 클릭 감지 리스너를 해제한다.
 */
function unbindOutsideClick() {
	if (!vcOutsideHandler) return;

	document.removeEventListener("mousedown", vcOutsideHandler, false);
	vcOutsideHandler = null;
	vbComboPressed = false;
};

/**
 * 스크롤 시 카드가 UDC(앵커) 위치를 따라가도록 갱신하는 리스너를 등록한다.
 * 플로팅 레이어는 스크롤 영역 밖에 있으므로, 중첩 스크롤까지 잡도록 capture 로 등록한다.
 * (브라우저 스크롤이 먼저 그려져 미세하게 흔들릴 수 있다)
 */
function bindScrollFollow() {
	if (vcScrollHandler) return;

	vcScrollHandler = function() {
		if (vcScrollPending) return;
		vcScrollPending = true;
		window.requestAnimationFrame(function() {
			vcScrollPending = false;
			if (!vcScrollHandler) return;	// 그 사이 해제됨
			if (app.getContainer().disposed) {
				unbindScrollFollow();
				return;
			}
			if (vcCard && vcCard.visible) openCard();
		});
	};
	window.addEventListener("scroll", vcScrollHandler, true);
};

/**
 * 스크롤 추적 리스너를 해제한다.
 */
function unbindScrollFollow() {
	if (!vcScrollHandler) return;

	window.removeEventListener("scroll", vcScrollHandler, true);
	vcScrollHandler = null;
};

/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 콤보박스(cmbSector)에서 mousedown 이벤트 발생 시 호출.
 * 콤보박스를 누르는 것은 카드 바깥 클릭으로 보지 않도록 표시한다.
 */
function onCmbSectorMousedown(e) {
	vbComboPressed = true;
}

/*
 * 콤보박스(cmbSector)에서 open 이벤트 발생 시 호출.
 * 기본 드롭다운 목록은 열지 않고(preventDefault), 필터 카드를 표시한다. (카드가 열려 있으면 닫는다)
 */
function onCmbSectorOpen(e) {
	e.preventDefault();

	if (!vcCard) vcCard = app.lookup("grpCard");

	if (vcCard.visible) {
		closeCard();
		return;
	}

	openCard();
	bindScrollFollow();
	bindOutsideClick();
}

/*
 * Done 버튼(btnDone)에서 click 이벤트 발생 시 호출.
 * 카드를 닫는다.
 */
function onBtnDoneClick(e) {
	closeCard();
}
