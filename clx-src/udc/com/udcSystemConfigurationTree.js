/*******************************************************************************
 * Business Category :
 * Screen ID : udcSystemConfigurationTree.js
 * Screen Name : 
 * Created Date :  2026. 11. 18. 오후 4:25:37
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
 * 메뉴 묶음(menu-group)에서 하위 메뉴 영역(menu-children)을 찾는다.
 * @param {cpr.controls.Container} pcMenuGroup 화살표 영역(menu-parent)과 하위 메뉴 영역(menu-children)이 놓인 묶음
 * @return {cpr.controls.Container} 하위 메뉴 영역. 없으면 null.
 */
function doFindChildMenu(pcMenuGroup) {
	var vaChildren = pcMenuGroup.getChildren();
	for (var i = 0; i < vaChildren.length; i++) {
		if (vaChildren[i].style.getClasses().indexOf("menu-children") > -1) return vaChildren[i];
	}
	return null;
}

/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 화살표 버튼(btnExp)에서 click 이벤트 발생 시 호출.
 * 하위 메뉴 영역(grpChildMenu)이 보이면 접고(숨김), 숨겨져 있으면 펼친다.
 * 화살표 방향은 collapse 클래스로 구분하고(접힘: 오른쪽 화살표), 접근성을 위해 버튼의 fieldLabel(대체 텍스트)도 상태에 맞게 바꾼다.
 */
function onBtnExpClick(e) {
	var vcButton = e.control;
	/* 화살표 버튼 → 메뉴 영역(menu-parent) → 메뉴 묶음(menu-group, grpTree) */
	var vcMenuGroup = vcButton.getParent().getParent();
	var vcChildMenu = doFindChildMenu(vcMenuGroup);
	if (!vcChildMenu) return;
	
	var vbCollapse = vcChildMenu.visible;
	var vsMenuName = vcButton.fieldLabel.replace(/^(Collapse|Expand) /, "");
	
	vcChildMenu.visible = !vbCollapse;
	if (vbCollapse) {
		vcButton.style.addClass("collapse");
	} else {
		vcButton.style.removeClass("collapse");
	}
	vcButton.fieldLabel = (vbCollapse ? "Expand " : "Collapse ") + vsMenuName;
}
