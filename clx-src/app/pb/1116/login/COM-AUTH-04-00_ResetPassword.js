/*******************************************************************************
 * Business Category :
 * Screen ID : CompanySearch_modal.js
 * Screen Name : 
 * Created Date :  2026. 10. 19. 오후 5:47:27
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
/**
 * @param {cpr.controls.CheckBox} pcChkBox
 * @param {String} psInpId
 */
function setPasswordVisible(pcChkBox, psInpId) {
	var vcInput = app.lookup(psInpId);
	vcInput.secret = pcChkBox.checked;
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 */
function onCbxPwChkValueChange(e) {
	var cbxPwChk = e.control;
	setPasswordVisible(e.control, "ipbPw");
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 */
function onCbxPwChk2ValueChange(e) {
	var cbxPwChk2 = e.control;
	setPasswordVisible(e.control, "ipbPw2");
}

/*
 * "Back to Log In" 버튼(btn2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn2Click(e) {
	var btn2 = e.control;
	app.close();
}
