/*******************************************************************************
 * Business Category :
 * Screen ID : udcComStatusSelection.js
 * Screen Name : 
 * Created Date :  2026. 10. 16. 오후 3:21:26
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
/** 카드 높이(px). 최초 표시 후 실제 내용 높이로 측정해 보관한다. 측정 전에는 기본값 사용 */
var vcCardHeight = 0;
/** 카드 높이 측정 전 임시 높이(px) */
var VC_CARD_DEFAULT_HEIGHT = 270;
/** 스크롤 추적 리스너 (카드 표시 중에만 등록) */
var vcScrollHandler = null;
/** requestAnimationFrame 중복 예약 방지 플래그 */
var vcScrollPending = false;

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
 * 필터 카드를 체크박스 바로 아래에 플로팅하고 표시한다.
 * UDC 가 놓인 영역의 높이/레이아웃에 영향받지 않도록 최상위 앱(AppInstance)에 띄운다.
 * (이미 플로팅된 컨트롤이면 위치만 갱신된다)
 */
function openCard() {
	if (!vcCard) vcCard = app.lookup("grpCard");

	var vcHost = app.getHost();	// UDC 컨트롤 (단독 실행 시 null)
	var vcAnchor = vcHost ? vcHost : app.lookup("chkStatus");
	var vcTargetApp = vcHost ? app.getRootAppInstance() : app;
	var vcRect = vcAnchor.getActualRect();

	vcCard.visible = true;
	vcTargetApp.floatControl(vcCard, new cpr.geometry.Rectangle(vcRect.left, vcRect.bottom + 4, 440, vcCardHeight || VC_CARD_DEFAULT_HEIGHT));

	if (!vcCardHeight) fitCardHeight();
};

/**
 * 카드 높이를 내용(마지막 자식 하단 + 레이아웃 하단 여백)에 맞춘다. 최초 1회 측정 후 보관한다.
 * 렌더가 끝난 뒤 실제 크기를 읽어야 하므로 asyncExec 로 지연 실행한다.
 */
function fitCardHeight() {
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		var vcChildren = vcCard.getChildren();
		if (!vcChildren.length) return;

		var vcLast = vcChildren[vcChildren.length - 1];
		var vcHeight = Math.ceil(vcLast.getActualRect().bottom - vcCard.getActualRect().top + vcCard.getLayout().bottomMargin);
		if (vcHeight <= 0) return;	// 렌더 전이면 다음 표시 때 다시 측정

		vcCardHeight = vcHeight;
		if (vcCard.visible) openCard();
	});
};

/**
 * 필터 카드를 숨긴다. (플로팅 상태는 유지하고 visible 만 끈다 — 제거 후 재플로팅 시 렌더가 복구되지 않는 문제 회피)
 */
function closeCard() {
	if (vcCard) vcCard.visible = false;
};

/**
 * 스크롤 시 카드가 체크박스(앵커) 위치를 따라가도록 갱신하는 리스너를 등록한다.
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
 * "Status" 체크박스(chkStatus)에서 value-change 이벤트 발생 시 호출.
 * 체크 여부에 따라 필터 카드(grpCard)를 플로팅으로 표시/숨김한다.
 */
function onChkStatusValueChange(e) {
	var chkStatus = e.control;
	if (chkStatus.checked) {
		openCard();
		bindScrollFollow();
	} else {
		closeCard();
		unbindScrollFollow();
	}
}
