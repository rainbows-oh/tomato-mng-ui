/*******************************************************************************
 * Business Category :
 * Screen ID : udcComContentToggleBtn.js
 * Screen Name : 
 * Created Date :  2026. 9. 16. 오후 5:44:41
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
 * gridGroup/cardGroup 프로퍼티에 지정된 대상 그룹의 노출 여부를 전환한다.
 * @param {"grid"|"card"} psShowType 보여줄 대상 ("grid": gridGroup 표시, "card": cardGroup 표시)
 */
function toggleContentGroup(psShowType) {
	var vcGridGroup = app.getAppProperty("gridGroup");
	var vcCardGroup = app.getAppProperty("cardGroup");

	if (vcGridGroup) vcGridGroup.visible = (psShowType == "grid");
	if (vcCardGroup) vcCardGroup.visible = (psShowType == "card");
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
	app.lookup("btnShowGrid").style.setClasses("btn-show-grid icon cl cl-focus");
	toggleContentGroup("grid");
}

/*
 * "목록 카드로 보기" 버튼(btnShowCard)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnShowCardClick(e) {
	var btnShowCard = e.control;
	
	app.lookup("btnShowGrid").style.setClasses("btn-show-grid icon");
	app.lookup("btnShowCard").style.setClasses("btn-show-card icon cl-focus");
	toggleContentGroup("card");
}

/*
 * "목록 그리드로 보기" 버튼(btnShowGrid)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnShowGridClick(e) {
	var btnShowGrid = e.control;
	
	app.lookup("btnShowGrid").style.setClasses("btn-show-grid icon cl-focus");
	app.lookup("btnShowCard").style.setClasses("btn-show-card icon");
	toggleContentGroup("grid");
}
