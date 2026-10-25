/*******************************************************************************
 * Business Category :
 * Screen ID : udcComCorrespondenceCard.js
 * Screen Name : 
 * Created Date :  2026. 9. 18. 오전 10:54:49
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
 * 체크 상태에 따라 카드(grp6)의 highlight 클래스를 반영한다.
 * 체크 해제: toggle-card highlight / 체크: toggle-card
 */
function applyHighlight() {
	var vcCard = app.lookup("grp6");
	var vcCheckbox = app.lookup("cbx1");

	if (vcCheckbox.checked) {
		vcCard.style.removeClass("highlight");
	} else {
		vcCard.style.addClass("highlight");
	}
}
 
 
/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e) {
	applyHighlight();
}

/*
 * 체크박스에서 value-change 이벤트 발생 시 호출.
 * Checkbox의 value 즉, 체크 상태가 변경되어 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx1ValueChange(e) {
	applyHighlight();
}
