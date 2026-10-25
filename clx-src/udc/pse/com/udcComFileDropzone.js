/*******************************************************************************
 * Business Category :
 * Screen ID : udcComFileDropzone.js
 * Screen Name :
 * Created Date :  2026. 9. 29.
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
/** @type File[] 현재까지 추가된 파일 목록 */
var maFiles = [];
/** @type HTMLInputElement 클릭 시 파일 선택창을 띄우기 위한 숨김 input[type=file] */
var moFileInput = null;


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
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
function getText() {
	// TODO: Write code to return the text to be displayed in the grid's view mode.
	return "";
};

/**
 * 숨김 파일 input을 생성하고 change 이벤트를 연결한다.
 * 드롭존 클릭 시 이 input을 대신 클릭시켜 네이티브 파일 선택창을 띄운다.
 */
function doCreateHiddenFileInput() {
	var voInput = document.createElement("input");
	voInput.type = "file";
	voInput.multiple = true;
	voInput.accept = ".pdf,image/*";
	voInput.style.display = "none";

	voInput.addEventListener("change", function(e) {
		doAddFiles(e.target.files);
		voInput.value = ""; // 같은 파일을 다시 선택할 수 있도록 초기화
	});

	document.body.appendChild(voInput);
	return voInput;
}

/**
 * @param {cpr.controls.Container} pcDropzone
 */
function doBindDropzoneDragEvents(pcDropzone) {
	pcDropzone.addEventListener("dragover", function(e) {
		e.preventDefault();
		pcDropzone.style.addClass("dragover");
	});

	pcDropzone.addEventListener("dragleave", function(e) {
		pcDropzone.style.removeClass("dragover");
	});

	pcDropzone.addEventListener("drop", function(e) {
		e.preventDefault();
		pcDropzone.style.removeClass("dragover");
		doAddFiles(e.dataTransfer.files);
	});
}

/**
 * PDF 또는 이미지 파일인지 확인한다.
 * @param {File} poFile
 * @return {Boolean}
 */
function doIsFileAllowed(poFile) {
	return poFile.type === "application/pdf" || poFile.type.indexOf("image/") === 0;
}

/**
 * 허용되지 않는 파일 경고문(optFileRejectedInfo) 표시 여부를 지정한다.
 * UDC 에 해당 컨트롤이 없으면 아무것도 하지 않는다. (없을 때 예외가 나면 이후 파일 처리·용량 갱신이 중단됨)
 * @param {Boolean} pbVisible
 */
function doSetRejectedInfoVisible(pbVisible) {
	var vcInfo = app.lookup("optFileRejectedInfo");
	if (vcInfo) vcInfo.visible = pbVisible;
}

/**
 * 첨부된 파일이 있을 때만 파일 목록(grpFileList)을 표시한다.
 */
function doUpdateFileListVisible() {
	app.lookup("grpFileList").visible = maFiles.length > 0;
}

/**
 * 파일 목록(FileList)을 행으로 만들어 grpFileList에 추가한다.
 * PDF/이미지가 아닌 파일은 경고문 표출.
 * @param {FileList} paFileList
 */
function doAddFiles(paFileList) {
	var vcFileList = app.lookup("grpFileList");
	var vnIdx;

	for (vnIdx = 0; vnIdx < paFileList.length; vnIdx++) {
		var voFile = paFileList[vnIdx];
		if (!doIsFileAllowed(voFile)) {
			doSetRejectedInfoVisible(true);
			continue;
		} 

		maFiles.push(voFile);
		vcFileList.addChild(doCreateFileRow(voFile), {
			"width": "100%",
			"height": "36px"
		});
		doSetRejectedInfoVisible(false);
	}

	doUpdateFileListVisible();
}

/**
 * 파일 행 하나를 삭제한다.
 * @param {File} poFile
 * @param {cpr.controls.Container} pcRow
 */
function doRemoveFileRow(poFile, pcRow) {
	var vnIdx = maFiles.indexOf(poFile);
	if (vnIdx > -1) maFiles.splice(vnIdx, 1);

	app.lookup("grpFileList").removeChild(pcRow);
	doUpdateFileListVisible();
}

/**
 * 바이트 단위 크기를 "N.N MB"/"N.N KB" 형태 문자열로 변환한다.
 * @param {Number} pnBytes
 * @return {String}
 */
function doFormatFileSize(pnBytes) {
	if (pnBytes < 1024) return pnBytes + " byte";
	if (pnBytes < 1024 * 1024) return (pnBytes / 1024).toFixed(1) + " KB";
	return (pnBytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * 첨부 파일 행(attachments)을 만든다. (Overview.clx 의 grp6 구조)
 *  - 컨테이너(class: attachments) / 폼 레이아웃: 행 1fr, 열 1fr + 16px
 *  - (0,0) 파일명 아웃풋 + 크기, (0,1) 삭제 버튼(btn-close icon)
 * @param {File} poFile
 * @return {cpr.controls.Container}
 */
function doCreateFileRow(poFile) {
	var vcRow = new cpr.controls.Container();
	vcRow.style.setClasses(["attachments"]);

	var vcLayout = new cpr.controls.layouts.FormLayout();
	vcLayout.setRows(["1fr"]);
	vcLayout.setColumns(["1fr", "16px"]);
	vcLayout.horizontalSpacing = 0;
	vcLayout.verticalSpacing = 0;
	vcLayout.topMargin = 0;
	vcLayout.rightMargin = 0;
	vcLayout.bottomMargin = 0;
	vcLayout.leftMargin = 0;
	vcRow.setLayout(vcLayout);

	// 파일명 + " · " + 크기
	var vcName = new cpr.controls.Output();
	vcName.value = poFile.name;
	vcName.displayExp = 'text + sstr(" · ' + doFormatFileSize(poFile.size) + '", ["size"])';
	vcRow.addChild(vcName, {
		rowIndex: 0,
		colIndex: 0
	});

	// 삭제 버튼
	var vcRemoveBtn = new cpr.controls.Button();
	vcRemoveBtn.style.setClasses(["btn-close", "icon"]);
	vcRemoveBtn.icon = "0";
	vcRemoveBtn.addEventListener("click", function(e) {
		doRemoveFileRow(poFile, vcRow);
	});
	vcRow.addChild(vcRemoveBtn, {
		rowIndex: 0,
		colIndex: 1
	});

	return vcRow;
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
	moFileInput = doCreateHiddenFileInput();
	doBindDropzoneDragEvents(app.lookup("grpDropzone"));
}

/*
 * 드롭존(grpDropzone)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrpDropzoneClick(e) {
	moFileInput.click();
}
