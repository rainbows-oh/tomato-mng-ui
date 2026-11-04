/*******************************************************************************
 * Business Category :
 * Screen ID : UdcComPagination.js
 * Screen Name : 
 * Created Date :  2026. 9. 17. 오후 2:26:03
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
 
 
/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/
/*
 * "Prev" 버튼(btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPrevClick(e) {
	var page = Number(app.getAppProperty("page"));
	var totalPages = Number(app.getAppProperty("totalPages"));
	
	console.log("=== [Prev Button Click] ===");
	console.log("Current Page:", page, "| Total Page:", totalPages);
	
	// 1페이지보다 크면 이전 페이지로 이동
	if (page > 1) {
		var prevPage = String(page - 1);
		app.setAppProperty("page", prevPage);
		
		// UDC 이벤트를 메인 화면(부모)으로 발송
		var event = new cpr.events.CUIEvent("pageChange");
		
		// 이벤트 발송
		app.dispatchEvent(event);
	} else {
		console.log("첫 번째 페이지입니다.");
	}
	
	app.getContainer().redraw();
}

/*
 * "Next" 버튼(btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnNextClick(e) {
	var page = Number(app.getAppProperty("page"));
	var totalPages = Number(app.getAppProperty("totalPages"));

	console.log("=== [Next Button Click] ===");
	console.log("Current Page:", page, "| Total Page:", totalPages);

	// 전체 페이지보다 작으면 다음 페이지로 이동
	if (page < totalPages) {
		var nextPage = String(page + 1);
		app.setAppProperty("page", nextPage);

		// UDC 이벤트를 메인 화면(부모)으로 발송
		var event = new cpr.events.CUIEvent("pageChange");
		
		// 이벤트 발송
		app.dispatchEvent(event);
	} else {
		console.log("마지막 페이지입니다.");
	}
	app.getContainer().redraw();
}

/*
 * "before" 버튼(btnFirst)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnFirstClick(e) {
	app.setAppProperty("page", 1);
	
	// UDC 이벤트를 메인 화면(부모)으로 발송
	var event = new cpr.events.CUIEvent("pageChange");
	
	// 이벤트 발송
	app.dispatchEvent(event);
}

/*
 * "after" 버튼(btnLast)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLastClick(e) {
	var totalPages = Number(app.getAppProperty("totalPages"));
	
	app.setAppProperty("page", totalPages);
	
	// UDC 이벤트를 메인 화면(부모)으로 발송
	var event = new cpr.events.CUIEvent("pageChange");
	
	// 이벤트 발송
	app.dispatchEvent(event);
}

/*
 * 넘버 에디터에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트. 키코드 관련 상수는 {@link cpr.events.KeyCode}에서 참조할 수 있습니다.
 */
function onNbePageKeydown(e) {
	var nbePage = e.control;
	if (e.keyCode == cpr.events.KeyCode.ENTER) {
		// UDC 이벤트를 메인 화면(부모)으로 발송
		var event = new cpr.events.CUIEvent("pageChange");
		
		// 이벤트 발송
		app.dispatchEvent(event);
	}
}
