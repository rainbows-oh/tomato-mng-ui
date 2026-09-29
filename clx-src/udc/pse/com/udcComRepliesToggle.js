/*******************************************************************************
 * Business Category :
 * Screen ID : udcComRepliesToggle.js
 * Screen Name : 
 * Created Date :  2026. 9. 29. 오전 9:27:54
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
 * 현재 rdb1.value가 "value2"(Closed)이면 "value1"(Open) 아이템을 제거한다.
 * 사용자가 직접 클릭한 경우(selection-change)뿐 아니라, 호스트에서 apppropbind로
 * 초기값을 "value2"로 넘긴 경우(load 시점)에도 동일하게 적용되어야 하므로 공통 함수로 분리.
 * (init 시점에는 apppropbind 초기값이 아직 반영되지 않아 load에서 처리해야 함)
 */
function syncRdb1ItemByValue() {
	var vcRdb1 = app.lookup("rdb1");

	if (vcRdb1.value == "value2") {
		vcRdb1.deleteItemByValue("value1");
	}
}

/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdb1SelectionChange(e) {
	syncRdb1ItemByValue();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	syncRdb1ItemByValue();
}
