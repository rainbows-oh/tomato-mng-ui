/*******************************************************************************
 * Business Category :
 * Screen ID : UdcComViewButton.js
 * Screen Name : 
 * Created Date :  2026. 9. 17. 오후 2:05:26
 * Creator : ryu
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
 * value(table/card)에 따라 targetTable/targetCard의 노출 여부를 전환한다.
 * @param {"table"|"card"} psValue 보여줄 대상 ("table": targetTable 표시, "card": targetCard 표시)
 */
function toggleTargetVisible(psValue) {
	var vcTargetTable = app.getAppProperty("targetTable");
	var vcTargetCard = app.getAppProperty("targetCard");

	if (vcTargetTable && vcTargetTable.type) vcTargetTable.visible = (psValue == "table");
	if (vcTargetCard && vcTargetCard.type) vcTargetCard.visible = (psValue == "card");
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
	toggleTargetVisible(app.getAppProperty("value"));
}

/*
 * 루트 컨테이너에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(e) {
	if (e.property === "value") {
		toggleTargetVisible(app.getAppProperty("value"));
	}
}

/*
 * "Table view" 버튼(btnShowGrid)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnShowGridClick(e) {
	var btnShowGrid = e.control;

	app.setAppProperty("value", "table");
	
	app.lookup("btnShowGrid").style.setClasses("btn-grid active");
	app.lookup("btnShowCard").style.setClasses("btn-card");
}

/*
 * "Card view" 버튼(btnShowCard)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnShowCardClick(e) {
	var btnShowCard = e.control;

	app.setAppProperty("value", "card");
	
	app.lookup("btnShowGrid").style.setClasses("btn-grid");
	app.lookup("btnShowCard").style.setClasses("btn-card active");
}
