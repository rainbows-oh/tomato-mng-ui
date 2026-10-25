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
 */
function onBodyScreenChange(e) {
	// 반응형 모듈의 레이아웃 재구성이 끝난 뒤 적용 (모바일: 1fr, 그 외: 340px)
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		var vcLayout = app.lookup("grpContent").getLayout();
		var vaColumns = vcLayout.getColumns();
		vaColumns[0] = AppProperties.SCREEN_MOBILE_NM.indexOf(app.targetScreen.name) > -1 ? "1fr" : "340px";
		vcLayout.setColumns(vaColumns);
	});
}
