/*******************************************************************************
 * Business Category :
 * Screen ID : Mng_login.js
 * Screen Name : 
 * Created Date :  2026. 11. 13. 오전 9:15:24
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
/** 모바일 스크린 이름 */
var VC_SCREEN_MOBILE = "EXB-PART";
/** 로그인 영역(grp2) 폼 레이아웃의 열 너비 — PC/태블릿, 모바일 */
var VC_LOGIN_COL_WIDTH = "420px";
var VC_LOGIN_COL_WIDTH_MOBILE = "1fr";
/** 이미지 영역(grp3) 폼 레이아웃 여백 — PC : 위/아래 1fr, 좌/우 90px */
var VC_IMG_MARGIN_PC = {top: "1fr", right: "90px", bottom: "1fr", left: "90px"};
/** 이미지 영역(grp3) 폼 레이아웃 여백 — 모바일/태블릿 : 위 1fr, 좌/우 20px, 아래 24px */
var VC_IMG_MARGIN_NOT_PC = {top: "1fr", right: "20px", bottom: "24px", left: "20px"};
/** PC 스크린 이름 */
var VC_SCREEN_PC = "EXB-FULL";
/** 로그인 영역(grp2) 행의 높이 — PC/태블릿(디자인 원본 값), 모바일(자동 높이의 최소값이라 login-input 은 내용 높이만큼만 차지) */
var VC_LOGIN_ROW_HEIGHT = "403px";
var VC_LOGIN_ROW_HEIGHT_MOBILE = "25px";


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
 * 화면 크기에 맞춰 로그인 영역(grp2) 폼 레이아웃의 크기를 적용한다.
 * 모바일 : 열 1fr, 행은 자동 높이(login-input 이 내용 높이만큼만 차지)
 * 그 외 : 열 420px, 행 403px(자동 높이)
 * 반응형 모듈(responsiveForm)이 screen-change 때 레이아웃을 원복/재구성하므로,
 * 그 처리가 끝난 뒤 적용되도록 비동기로 실행한다.
 */
function doApplyLoginAreaLayout() {
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		var vcLayout = app.lookup("grp2").getLayout();
		var vbMobile = (app.targetScreen.name == VC_SCREEN_MOBILE);
		
		vcLayout.setColumns([vbMobile ? VC_LOGIN_COL_WIDTH_MOBILE : VC_LOGIN_COL_WIDTH]);
		vcLayout.setRows([vbMobile ? VC_LOGIN_ROW_HEIGHT_MOBILE : VC_LOGIN_ROW_HEIGHT]);
		vcLayout.setRowAutoSizing(0, true);
		
		doApplyImgAreaMargin();
	});
}

/**
 * 화면 크기에 맞춰 이미지 영역(grp3) 폼 레이아웃의 여백을 적용한다.
 * PC : 위/아래 1fr, 좌/우 90px
 * 모바일/태블릿 : 위 1fr, 좌/우 20px, 아래 24px
 */
function doApplyImgAreaMargin() {
	var vcLayout = app.lookup("grp3").getLayout();
	var vcMargin = (app.targetScreen.name == VC_SCREEN_PC) ? VC_IMG_MARGIN_PC : VC_IMG_MARGIN_NOT_PC;
	
	vcLayout.topMargin = vcMargin.top;
	vcLayout.rightMargin = vcMargin.right;
	vcLayout.bottomMargin = vcMargin.bottom;
	vcLayout.leftMargin = vcMargin.left;
}


/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성되었을 때 화면 크기에 맞는 로그인 영역 열 너비를 적용한다.
 */
function onBodyLoad(e) {
	doApplyLoginAreaLayout();
}

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 화면 크기(스크린)가 바뀌면 로그인 영역 열 너비를 다시 적용한다.
 */
function onBodyScreenChange(e) {
	doApplyLoginAreaLayout();
}

/*
 * "Forgot password?" 버튼(btnForgetPw)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnForgetPwClick(e) {
	var btnForgetPw = e.control;
	
		util.Dialog.open(app, "app/pb/1116/login/COM-AUTH-04-00_ResetPassword", 400, -1, function(){
		
	}, {
		
	}, {
		headerVisible: false
	});
}
