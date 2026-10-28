/*******************************************************************************
 * Business Category :
 * Screen ID : Roles.js
 * Screen Name : 
 * Created Date :  2026. 10. 15. 오후 5:06:27
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
// 코드 그룹 선택 여부 (false: grpSelectInfo 표시, true: grpSelectGroup 표시)
var mbSelected = false;

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

/*
 * grpVisible 의 표시 영역을 현재 스크린/선택 여부에 맞게 갱신한다.
 *  - 0행(cmbSelectGroup)   : 모바일에서만 표시
 *  - 1행(grpSelectInfo)    : 그룹 선택 전에만 표시
 *  - 2행(grpSelectGroup)   : 그룹 선택 후에만 표시
 */
function updateSelectView() {
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		// 현재 스크린이 모바일인지 여부
		var vbMobile = AppProperties.SCREEN_MOBILE_NM.indexOf(app.targetScreen.name) > -1;

		util.FreeForm.setRowVisible(app, "grpVisible", 0, vbMobile);
		util.FreeForm.setRowVisible(app, "grpVisible", 1, !mbSelected);
		util.FreeForm.setRowVisible(app, "grpVisible", 2, mbSelected);
	});
}


/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * "Add Role" 버튼(btn3)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn3Click(e) {
	var btn3 = e.control;
	
	util.Dialog.open(app, "app/pb/Role_AddRole", 500, -1, null);
}

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린 크기 변경 시 전파되는 이벤트.
 *
 * 스크린별 영역 표시 제어 (모바일: SCREEN_MOBILE_NM / PC·태블릿: 그 외)
 *  - grpContent 첫번째 열(Roles 목록) : 모바일 숨김, PC·태블릿 표시
 *  - grpVisible 0행(cmbSelectGroup) : 모바일 표시, PC·태블릿 숨김
 */
function onBodyScreenChange(e) {
	// 반응형 모듈(responsiveForm)의 레이아웃 재구성이 끝난 뒤에 적용해야 하므로 asyncExec 로 지연한다.
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		// 현재 스크린이 모바일인지 여부
		var vbMobile = AppProperties.SCREEN_MOBILE_NM.indexOf(app.targetScreen.name) > -1;

		// grpContent : 반응형(mobile-column-count) 적용 그룹이므로 레이아웃 API 대신 공통 API 사용
		util.FreeForm.setColumnVisible(app, "grpContent", 0, !vbMobile);
	});

	updateSelectView();
}

/*
 * 라디오 버튼에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onRdb1ItemClick(e) {
	var rdb1 = e.control;
	mbSelected = true;
	updateSelectView();
}

/*
 * 콤보박스에서 selection-change 이벤트 발생 시 호출.
 * Combobox 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectGroupSelectionChange(e) {
	var cmbSelectGroup = e.control;
	mbSelected = true;
	updateSelectView();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	// 최초 로드 시에는 선택 전 상태(grpSelectInfo 표시)
	mbSelected = false;
	updateSelectView();
}
