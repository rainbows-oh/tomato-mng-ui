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
/**
 * 모든 상태값(status)에 따른 배지 텍스트 반환
 * @param {String} status 
 */
exports.getBadgeText = function(status) {
	// 디버깅 로그: 전달받은 raw 값 및 타입 출력
	console.log("[getBadgeText] Raw Input:", status, "| Type:", typeof status);

	var val = status ? String(status).trim() : "";

	switch (val) {
		case "Approved":
		case "Submitted":
		case "Changed":
		case "Rejected":
			return val;

		// Default
		default:
			return "-";
	}
};

/**
 * 모든 상태값(status)에 따른 배지 스타일 클래스 반환
 * @param {String} status 
 */
exports.getBadgeClass = function(status) {
	// 디버깅 로그: 전달받은 raw 값 및 타입 출력
	console.log("[getBadgeClass] Raw Input:", status, "| Type:", typeof status);

	var val = status ? String(status).trim() : "";

	switch (val) {
		// Success (초록색)
		case "Approved":
			return "badge fill green";

		// Information (파란색)
		case "Submitted":
			return "badge fill blue";

		// Warning (노란색)
		case "Changed":
			return "badge fill yellow";

		// Danger (빨간색)
		case "Rejected":
			return "badge fill red";

		// Default
		default:
			return "badge fill blue";
	}
};
 
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
 
 
/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

