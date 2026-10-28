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
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린 크기 변경 시 전파되는 이벤트.
 */
function onBodyScreenChange(e) {
	// 반응형 모듈(responsiveForm)의 레이아웃 재구성이 끝난 뒤에 적용해야 하므로 asyncExec 로 지연한다.
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		// 현재 스크린이 모바일인지 여부
		var vbMobile = AppProperties.SCREEN_MOBILE_NM.indexOf(app.targetScreen.name) > -1;
		
		// grpContent : 반응형(mobile-column-count) 적용 그룹이므로 레이아웃 API 대신 공통 API 사용
		util.FreeForm.setColumnVisible(app, "grpContent", 0, !vbMobile);
		
		if(vbMobile) app.lookup("btnMobileSelect").visible = true;
	});
}
