/************************************************
 * udcGuideToggle.js
 * Created at 2025. 7. 9. 오전 11:27:27.
 *
 * @author yein
 ************************************************/

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
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e) {
	var button = e.control;
	var vcOutput = app.getAppProperty("targetOutput");
	var vcGroup = app.getAppProperty("targetGroup");

	if (!button.style.hasClass("collapse")) {
		// 접힘 상태: 아웃풋 표시, 그룹 숨김
		if (vcOutput && vcOutput.type) vcOutput.visible = true;
		if (vcGroup && vcGroup.type) vcGroup.visible = false;

		button.style.addClass("collapse");
	} else {
		// 펼침 상태: 아웃풋 숨김, 그룹 표시
		if (vcOutput && vcOutput.type) vcOutput.visible = false;
		if (vcGroup && vcGroup.type) vcGroup.visible = true;

		button.style.removeClass("collapse");
	}
}
