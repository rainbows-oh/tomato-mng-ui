/************************************************
 * udcGuideToggle.js
 * Created at 2025. 7. 9. 오전 11:27:27.
 *
 * @author yein
 ************************************************/

/** @type cpr.controls.Container */
var vcTarget = null;
var vcGrpFill = null;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

/*
 * 루트 컨테이너에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(e){
	if(e.property == 'grpId') {
	}
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	
	if(app.getAppProperty("grpId")) {
		vcTarget = app.getHostAppInstance().lookup(app.getAppProperty("grpId"))
		
		cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function(e) {
			app.getHostAppInstance().getContainer().getChildren().forEach(function(each){
				if(each.style.hasClass("fill-layout-target")) {
					vcGrpFill = each;	
				} 
			});	
		});
	}
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e) {
	var button = e.control;
	
	if (!button.style.hasClass("collapse")) {
		vcTarget.getLayout().setRowVisible(1, false);
		vcTarget.getLayout().setRowVisible(2, true);
		
		button.style.addClass("collapse");
	} else {
		vcTarget.getLayout().setRowVisible(1, true);
		vcTarget.getLayout().setRowVisible(2, false);
		
		button.style.removeClass("collapse");
	}
}
