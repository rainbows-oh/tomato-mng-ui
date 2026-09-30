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
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRadioButtonSelectionChange(e) {
	var radioButton = e.control;
	
	var embContent = app.lookup("emb");
	
	if(radioButton.value == "value1") {
		cpr.core.App.load("app/pb/Correspondence_details_message", function(loadedApp) {
			if(loadedApp) {
				embContent.app = loadedApp;
			}
		})
	} else {
		cpr.core.App.load("app/pb/Correspondence_details_TAB", function(loadedApp) {
			if(loadedApp) {
				embContent.app = loadedApp;
			}
		})
	}
}
