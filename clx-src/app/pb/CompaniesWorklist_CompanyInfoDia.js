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

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbActionSelectionChange(e) {
	var cmbAction = e.control;
	
	if(cmbAction.value == "value1") {
		app.lookup("grpRemark").visible = true;
		app.lookup("grpEffectiveDate").visible = false;
		app.lookup("grpAssignTo").visible = false;
	} else if(cmbAction.value == "value2") {
		app.lookup("grpRemark").visible = false;
		app.lookup("grpEffectiveDate").visible = true;
		app.lookup("grpAssignTo").visible = false;
	} else {
		app.lookup("grpRemark").visible = false;
		app.lookup("grpEffectiveDate").visible = false;
		app.lookup("grpAssignTo").visible = true;
	}
}
