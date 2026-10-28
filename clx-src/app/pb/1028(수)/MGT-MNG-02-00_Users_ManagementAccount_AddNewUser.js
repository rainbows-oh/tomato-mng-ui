/*******************************************************************************
 * Business Category :
 * Screen ID : UserManagement.js
 * Screen Name : 
 * Created Date :  2026. 9. 15. 오전 11:38:50
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
	
	vcInput.secret = !pcChkBox.checked;
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 */
function onCbx1ValueChange(e) {
	var cbx1 = e.control;
	
	setPasswordVisible(e.control, "ipbPw");
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 */
function onCbxPwChk2ValueChange(e) {
	var cbxPwChk2 = e.control;
	
	setPasswordVisible(e.control, "ipbPw2");
}
