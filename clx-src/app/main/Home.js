/************************************************
 * Home.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2024. 9. 11..
 * @작성자 : ryug
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 


/************************************************
 ** 글로벌 함수
 ************************************************/ 

/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 
var util = createCommonUtil();

/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 

/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	util.Control.setValue(app, "optNotice", cpr.core.Platform.INSTANCE.getVersion());
	util.Control.setValue(app, "optReleaseDate", DateUtil.format(cpr.core.Platform.INSTANCE.getReleaseDate(), "YYYYMMDD"));
	
	if (!app.isRootAppInstance()) {
		util.Control.setValue(app, "optUserNm", util.Main.getUserInfo(app, "USER_NM"));
		util.Control.setValue(app, "optDeptCd", util.Main.getUserInfo(app, "DEPT_CD"));
		util.Control.setValue(app, "optDeptNm", util.Main.getUserInfo(app, "DEPT_NM"));
	}
}

/*
 * "기술지원 테크돔" 버튼(btnLink1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink1Click(e){
	window.open("https://tech.tomatosystem.co.kr/");
	e.stopPropagation();
}

/*
 * "비대면 교육신청" 버튼(btnLink2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink2Click(e){
	window.open("https://tech.tomatosystem.co.kr/edu.do");
	e.stopPropagation();
}

/*
 * "유튜브 교육영상" 버튼(btnLink3)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink3Click(e){
	window.open("https://www.youtube.com/@eXBuilder6/playlists");
	e.stopPropagation();
}

/*
 * "체험판 및 견적요청" 버튼(btnLink4)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink4Click(e){
	window.open("https://www.exbuilder6.co.kr/demo/demo.jsp");
	e.stopPropagation();
}

/*
 * "속성 및 기능 통합검색" 버튼(btnLink5)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink5Click(e){
	window.open("https://edu.tomatosystem.co.kr/");
	e.stopPropagation();
}

/*
 * "메인 기능 가이드" 버튼(btnLink6)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink6Click(e){
	var button = e.control;
	// 커스터마이징 가이드 오픈 시, 사이드내비게이션 펼침
	var rootAppIns = app.getRootAppInstance();	
	if(rootAppIns.hasAppMethod("doOpenMenuToMdi")) {
		rootAppIns.callAppMethod("doOpenMenuToMdi", "docs_customizing", {}, {
			readyCallback: function (){
				if(rootAppIns.hasAppMethod("expandAsideArea") && rootAppIns.targetScreen.name == "EXB-FULL") {
					rootAppIns.callAppMethod("expandAsideArea");
				}
			}
		});
	}
}

/*
 * "Help Content" 버튼(btnLink7)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink7Click(e){
	window.open("http://edu.tomatosystem.co.kr:8081/help/index.jsp");
	e.stopPropagation();
}

/*
 * "웹 접근성 가이드" 버튼(btnLink8)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLink8Click(e){
	window.open("https://edu.tomatosystem.co.kr/wa-guide/");
	e.stopPropagation();
}

/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	
	var vsTotalSearch = app.lookup("siTotalSearch").value;
	var rootAppIns = app.getRootAppInstance();
	if(rootAppIns.hasAppMethod("doOpenSearch")) {
		rootAppIns.callAppMethod("doOpenSearch", vsTotalSearch);
	}
}

/*
 * 서치 인풋에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트. 키코드 관련 상수는 {@link cpr.events.KeyCode}에서 참조할 수 있습니다.
 */
function onSiTotalSearchKeydown(e){
	var siTotalSearch = e.control;
	
	if(e.keyCode == cpr.events.KeyCode.ENTER) {
		app.lookup("btnTotSrch").click();
	}
}

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린 크기 변경 시 전파되는 이벤트.
 */
function onBodyScreenChange(e){
	var vcGrpVersion = app.lookup("grpVersion");
	var voGrpVersionLyt = vcGrpVersion.getLayout();
	
	if (e.screen.name == "EXB-PART"){
		// 모바일
		vcGrpVersion.getParent().updateConstraint(vcGrpVersion, {
			horizontalAlign : "fill"
		});
		voGrpVersionLyt.setColumnVisible(1, false);
	} else {
		// PC 및 타블렛
		vcGrpVersion.getParent().updateConstraint(vcGrpVersion, {
			horizontalAlign : "left",
			width : 500
		});
		voGrpVersionLyt.setColumnVisible(1, true);
	}
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(e){
	app.lookup("btnLink1").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick2(e){
	app.lookup("btnLink2").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick3(e){
	app.lookup("btnLink3").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick4(e){
	app.lookup("btnLink4").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick5(e){
	app.lookup("btnLink5").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick6(e){
	app.lookup("btnLink6").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick7(e){
	app.lookup("btnLink7").click();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick8(e){
	app.lookup("btnLink8").click();
}
