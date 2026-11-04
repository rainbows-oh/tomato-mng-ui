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
// 임베디드앱(ema1)에 순서대로 호출할 화면 경로
var maTemplatePaths = [
	"app/pb/management/new2/MGT-TPL-03-00_Disclosures_Template_NewTemplate1",
	"app/pb/management/new2/MGT-TPL-04-00_Disclosures_Template_NewTemplate2",
	"app/pb/management/new2/MGT-TPL-05-00_Disclosures_Template_NewTemplate3",
	"app/pb/management/new2/MGT-TPL-06-00_Disclosures_Template_NewTemplate4"
];

// 현재 ema1 에 호출되어 있는 화면의 maTemplatePaths 인덱스
var mnTemplateIndex = -1;

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

/*
 * maTemplatePaths 의 pnIndex 번째 화면을 ema1 에 호출한다.
 * 호출에 성공했을 때만 현재 인덱스(mnTemplateIndex)를 갱신한다.
 */
function loadTemplate(pnIndex) {
	var vcEma = app.lookup("ema1");

	cpr.core.App.load(maTemplatePaths[pnIndex], function(loadedApp) {
		if (loadedApp) {
			vcEma.app = loadedApp;
			mnTemplateIndex = pnIndex;

			// 호출된 화면까지의 단계(optStep1~4)만 active, 이후 단계는 active 제거
			for (var i = 0; i < maTemplatePaths.length; i++) {
				if (i <= pnIndex) {
					app.lookup("optStep" + (i + 1)).style.addClass("active");
				} else {
					app.lookup("optStep" + (i + 1)).style.removeClass("active");
				}
			}
			
			// 마지막 화면에서만 Next 대신 Publish 버튼 표시
			var vbLast = pnIndex == maTemplatePaths.length - 1;
			app.lookup("btnCallNextTemplate").visible = !vbLast;
			app.lookup("btnPublish").visible = vbLast;
		}
	});
}

/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	// 최초 로드 시 첫번째 화면 호출
	loadTemplate(0);
}

/*
 * "Next" 버튼(btnCallNextTemplate)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCallNextTemplateClick(e) {
	var btnCallNextTemplate = e.control;

	// 현재 호출된 화면의 다음 화면 호출 (마지막 화면이면 동작하지 않음)
	if (mnTemplateIndex > -1 && mnTemplateIndex < maTemplatePaths.length - 1) {
		loadTemplate(mnTemplateIndex + 1);
	}
}

/*
 * "Back" 버튼(btnCallBackTemplate)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCallBackTemplateClick(e) {
	var btnCallBackTemplate = e.control;

	// 현재 호출된 화면의 이전 화면 호출 (첫번째 화면이면 동작하지 않음)
	if (mnTemplateIndex > 0) {
		loadTemplate(mnTemplateIndex - 1);
	}
}
