/*******************************************************************************
 * Business Category :
 * Screen ID : MGT-CAL-01-00_Calendars_Internal Calendar.js
 * Screen Name : Internal Calendar
 * Created Date :  2026. 11. 4.
 * Creator :
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


/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
var CAL_ID_PC = "shlCalendar"; // PC(태블릿 포함)용 달력 쉘
var CAL_ID_MO = "shlCalendarMo"; // 모바일(EXB-PART)용 달력 쉘
var MOBILE_SCREEN_NAME = "EXB-PART"; // 모바일 스크린 이름
var calendars = {}; // 쉘 id -> {el: 달력 div, fc: FullCalendar 인스턴스, mobile: 모바일용 여부}
var SELECTED_DATE = "2026-08-28"; // 선택된 날짜(YYYY-MM-DD). 날짜 칸을 누르면 바뀐다 (처음 값은 Figma 샘플: 28일 = 오늘)
var MOBILE_ROW_HEIGHT = 52; // 모바일 날짜 칸 높이 (Figma 모바일 day-cell 52)
var MOBILE_MAX_DOTS = 3; // 모바일에서 날짜마다 보이는 점 개수 (Figma dot 5x5)
var dotsByDate = {}; // "YYYY-MM-DD" -> 일정 코드 배열 (모바일 점 표시용)
var resizeBound = false; // 창 크기 변경 리스너를 한 번만 붙이기 위한 표시
var moLabelPop = null; // 떠 있는 Event Labels 팝업 {pop, parent, index, constraint, dim}. 닫혀 있으면 null
var VC_VIEWER_APP_ID = "app/pb/1110/MGT-CAL-01-Temp_Calendars_InternalCalendar_DisclosureViewer"; // 항목 클릭 시 여는 Disclosure Viewer 팝업
var VC_VIEWER_WIDTH = 1024; // 팝업 너비 (높이는 -1: 내용에 맞춤)
var SIDE_TITLE_ROW_HEIGHT = "46px"; // 오른쪽 일정 영역(grpSide)의 제목 행 높이 (clx 의 첫 행과 같은 값)
var pcBodyMinSize = null; // body 레이아웃의 PC 최소 크기(clx minlength). 모바일에서 풀었다가 PC에서 되돌릴 때 쓴다

/*******************************************************************************
 * Onload and Submission Call Area
 *******************************************************************************/

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 화면이 처음 열릴 때 현재 스크린에 맞는 쪽(PC / 모바일)만 보이게 한다.
 */
function onBodyInit(e) {
	// 반응형 모듈(responsiveForm.module.js)도 app.targetScreen.name으로 현재 스크린을 읽는다.
	applyScreen(app.targetScreen ? app.targetScreen.name : "");
	bindItemButtons();
}

/**
 * 오른쪽 목록(grpSideList)의 일정 항목 버튼(cal-item-btn)에 click 이벤트를 연결한다.
 */
function bindItemButtons() {
	/** @type cpr.controls.Container */
	var grpSideList = app.lookup("grpSideList");
	grpSideList.getChildren().forEach(function(card) {
		card.getChildren().forEach(function(ctrl) {
			if (ctrl.userAttr("code")) {
				ctrl.addEventListener("click", onCalItemBtnClick);
			}
		});
	});
}

/*
 * 일정 항목 버튼(cal-item-btn)에서 click 이벤트 발생 시 호출.
 * Disclosure Viewer 화면을 팝업으로 연다.
 */
function onCalItemBtnClick(e) {
	openDisclosureViewer();
}

/**
 * Disclosure Viewer 화면을 팝업으로 연다. (오른쪽 목록 항목, 달력 일정 칩 공통)
 */
function openDisclosureViewer() {
	util.Dialog.open(app, VC_VIEWER_APP_ID, VC_VIEWER_WIDTH, -1, function() {
		
	});
}

/*
 * 루트 컨테이너에서 screen-change 이벤트 발생 시 호출.
 * 스크린 크기 변경 시 전파되는 이벤트. 모바일 스크린이면 모바일 화면을, 아니면 PC 화면을 보여준다.
 */
function onBodyScreenChange(e) {
	applyScreen(e.screen.name);
}

/**
 * 스크린 이름에 맞게 PC용/모바일용 달력 쉘의 보임 여부를 바꾼다.
 * @param {String} psScreenName
 */
function applyScreen(psScreenName) {
	var vbMobile = (psScreenName === MOBILE_SCREEN_NAME);
	/** @type cpr.controls.UIControlShell */
	var shlCalendar = app.lookup(CAL_ID_PC);
	/** @type cpr.controls.UIControlShell */
	var shlCalendarMo = app.lookup(CAL_ID_MO);
	shlCalendar.visible = !vbMobile;
	shlCalendarMo.visible = vbMobile;

	// 반응형 모듈은 화면 전환 때 "보이는 컨트롤"만 배치한다. 모듈의 screen-change 처리가
	// shlCalendarMo를 숨김 상태로 본 경우를 대비해, 보이게 한 뒤 모듈에 다시 배치시킨다.
	// (모듈 내부 메서드 _onScreenChange 사용 — 확인 필요: 모듈 수정 시 함께 점검)
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
		/** @type cpr.controls.Container */
		var grpLayout = app.lookup("grpLayout");
		var voRForm = grpLayout["_RForm"];
		// PC로 돌아올 때도 호출해야 모바일 배치(1열)가 원래 레이아웃으로 복원된다 (메인 안에서 모바일 상태로 시작하는 경우)
		if (voRForm && voRForm._onScreenChange) {
			voRForm._onScreenChange({screen: {name: psScreenName}});
		}
		applyMinSize(vbMobile);
		applySideListScroll(vbMobile);
		// 보이게 된 쪽 달력은 크기를 다시 맞춘다
		refreshCalendars();
	});
}

/**
 * PC용 최소 크기(clx minlength: body 열·행, grpLayout 달력 열)를 모바일에서는 풀고 PC에서는 되돌린다.
 * 최소 크기는 스크린과 상관없이 걸려서, 그대로 두면 모바일 화면이 PC 폭(1326)으로 넓어진다.
 * grpLayout의 PC 값은 반응형 모듈이 PC로 돌아올 때 원래 레이아웃째 복원한다.
 * @param {Boolean} pbMobile
 */
function applyMinSize(pbMobile) {
	/** @type cpr.controls.layouts.FormLayout */
	var voBodyLayout = app.getContainer().getLayout();
	if (!pcBodyMinSize) {
		pcBodyMinSize = {col: voBodyLayout.getColumnMinWidth(0), row: voBodyLayout.getRowMinHeight(1)};
	}
	voBodyLayout.setColumnMinWidth(0, pbMobile ? 0 : pcBodyMinSize.col);
	voBodyLayout.setRowMinHeight(1, pbMobile ? 0 : pcBodyMinSize.row);
	if (pbMobile) {
		/** @type cpr.controls.Container */
		var grpLayout = app.lookup("grpLayout");
		grpLayout.getLayout().setColumnMinWidth(0, 0);
	}
	app.getContainer().redraw();
}

/**
 * 오른쪽 일정 영역(grpSide)의 스크롤 방식을 스크린에 맞게 바꾼다.
 * PC/태블릿: 목록(grpSideList)이 자체 스크롤 (영역 높이는 달력과 같게 고정)
 * 모바일: 목록 스크롤을 끄고, 영역(grpSide)의 목록 행을 자동 높이로 해서 목록이 있는 만큼 높이가 늘어난다.
 *         스크롤은 루트(body) 레이아웃에서만 생긴다.
 * @param {Boolean} pbMobile
 */
function applySideListScroll(pbMobile) {
	/** @type cpr.controls.Container */
	var grpSide = app.lookup("grpSide");
	/** @type cpr.controls.Container */
	var grpSideList = app.lookup("grpSideList");
	
	grpSideList.getLayout().scrollable = !pbMobile;
	
	/** @type cpr.controls.layouts.FormLayout */
	var voSideLayout = grpSide.getLayout();
	voSideLayout.setRows(pbMobile ? [SIDE_TITLE_ROW_HEIGHT, "25px"] : [SIDE_TITLE_ROW_HEIGHT, "1fr"]);
	voSideLayout.setRowAutoSizing(1, pbMobile);
	grpSideList.redraw();
	grpSide.redraw();
}

/*
 * btnPrevMonth(이전 달) 버튼에서 click 이벤트 발생 시 호출.
 */
function onBtnPrevMonthClick(e) {
	moveMonth(-1);
}

/*
 * btnNextMonth(다음 달) 버튼에서 click 이벤트 발생 시 호출.
 */
function onBtnNextMonthClick(e) {
	moveMonth(1);
}

/*
 * btnEventLabels(Event Labels) 버튼에서 click 이벤트 발생 시 호출.
 * 라벨 필터 팝업(grpEvent)을 버튼 바로 아래(오른쪽 끝 맞춤, 간격 8)에 띄운다. 바깥을 누르면 닫힌다.
 */
function onBtnEventLabelsClick(e) {
	if (moLabelPop) {
		closeLabelPopup();
		return;
	}
	/** @type cpr.controls.Container */
	var grpEvent = app.lookup("grpEvent");
	var vcParent = grpEvent.getParent();
	var vcDim = new cpr.controls.Container();
	vcDim.setLayout(new cpr.controls.layouts.XYLayout());
	vcDim.addEventListener("click", closeLabelPopup);
	// 닫을 때 원래 칸으로 되돌리려고 위치를 기억한다 (main_mng.js doOpenMobilePanel과 같은 방식)
	moLabelPop = {
		pop: grpEvent,
		parent: vcParent,
		index: vcParent.getChildren().indexOf(grpEvent),
		constraint: vcParent.getConstraint(grpEvent),
		dim: vcDim
	};
	var voBtn = e.control.getActualRect();
	var voApp = app.getContainer().getActualRect();
	// Figma event-labels-panel 560 x 530. 모바일은 버튼과 같은 폭(왼쪽 끝도 버튼에 맞춰진다)이고,
	// 2열이 좁아 라벨 이름이 두 줄이 되므로 칸 높이 33 → 47(이름 14 x 2), 9줄이면 126 더 높다
	var vbMobile = (app.targetScreen.name === MOBILE_SCREEN_NAME);
	var vnWidth = vbMobile ? voBtn.width : Math.min(560, voApp.width - 32);
	grpEvent.visible = true;
	app.floatControl(vcDim, {top: "0px", right: "0px", bottom: "0px", left: "0px"});
	app.floatControl(grpEvent, {
		top: (voBtn.top - voApp.top + voBtn.height + 8) + "px",
		left: Math.max(16, voBtn.left - voApp.left + voBtn.width - vnWidth) + "px",
		width: vnWidth + "px",
		// shortcut: 모바일 656은 이름이 최대 두 줄(폭 343 기준)일 때만 맞다. 더 좁은 기기를 지원하면 높이를 내용에 맞춰 계산
		height: (vbMobile ? 656 : 530) + "px"
	});
}

/**
 * 라벨 필터 팝업을 닫는다: 팝업은 원래 칸으로 되돌려 숨기고, 바탕은 없앤다. (다시 열 때 새로 띄운다)
 */
function closeLabelPopup() {
	if (!moLabelPop) return;
	var voInfo = moLabelPop;
	moLabelPop = null;
	voInfo.pop.visible = false;
	voInfo.parent.insertChild(voInfo.index, voInfo.pop, voInfo.constraint);
	app.getContainer().removeChild(voInfo.dim, true);
}

/*
 * cbxAllLabels(Select All) 체크박스에서 value-change 이벤트 발생 시 호출.
 * 라벨을 모두 선택하거나 모두 해제한다.
 */
function onCbxAllLabelsValueChange(e) {
	/** @type cpr.controls.CheckBoxGroup */
	var cbgLabels = app.lookup("cbgLabels");
	var vbAll = e.control.checked;
	// 라벨 하나를 풀어서 체크가 풀린 경우(onCbgLabelsSelectionChange)는 선택을 그대로 둔다
	if (!vbAll && cbgLabels.values.length < cbgLabels.getItemCount()) return;
	cbgLabels.putValue(vbAll ? cbgLabels.getItems().map(function(item) {
		return item.value;
	}).join(",") : "");
	applyLabelFilter();
}

/*
 * cbgLabels(라벨 목록) 체크박스그룹에서 selection-change 이벤트 발생 시 호출.
 * 모두 선택됐는지에 맞춰 Select All을 바꾸고, 달력과 목록을 다시 거른다.
 */
function onCbgLabelsSelectionChange(e) {
	/** @type cpr.controls.CheckBoxGroup */
	var cbgLabels = e.control;
	/** @type cpr.controls.CheckBox */
	var cbxAllLabels = app.lookup("cbxAllLabels");
	cbxAllLabels.checked = (cbgLabels.values.length === cbgLabels.getItemCount());
	applyLabelFilter();
}

/**
 * 선택된 라벨(cbgLabels)의 일정만 달력(칩·모바일 점)과 오른쪽 목록에 보이게 한다.
 * 목록 묶음은 남은 항목이 없으면 숨긴다. (묶음 개수·"60 items" 글자는 고정 샘플이라 바꾸지 않는다)
 */
function applyLabelFilter() {
	var vaEvents = makeEventsFromDataset();
	for (var vsId in calendars) {
		var voCal = calendars[vsId];
		if (!voCal.fc) continue;
		voCal.fc.setOption("events", voCal.mobile ? [] : vaEvents);
		voCal.fc.setOption("dayCellTopContent", voCal.fc.getOption("dayCellTopContent")); // 모바일 점 다시 그리기
	}
	var vaCodes = app.lookup("cbgLabels").values;
	/** @type cpr.controls.Container */
	var grpSideList = app.lookup("grpSideList");
	grpSideList.getChildren().forEach(function(card) {
		var vbAny = false;
		card.getChildren().forEach(function(ctrl) {
			var vsCode = ctrl.userAttr("code");
			if (vsCode) {
				ctrl.visible = vaCodes.indexOf(vsCode) > -1;
				vbAny = vbAny || ctrl.visible;
			}
		});
		card.visible = vbAny;
	});
}

/*
 * 쉘에서 init 이벤트 발생 시 호출. (PC용/모바일용 쉘이 같이 쓴다)
 * 달력이 이미 만들어진 경우 다시 만들지 않는다.
 */
function onShlCalendarInit(e) {
	var voCal = calendars[e.control.id];
	if (voCal && voCal.el) {
		if (voCal.fc) voCal.fc.render();
		e.preventDefault();
	}
}

/*
 * 쉘에서 load 이벤트 발생 시 호출. (PC용/모바일용 쉘이 같이 쓴다)
 * FullCalendar(7.1.3)로 월 달력을 그린다. 이벤트 데이터는 데이터셋 dsEvent(예시)다.
 */
function onShlCalendarLoad(e) {
	var vsId = e.control.id;

	if (!calendars[vsId]) {
		calendars[vsId] = {el: null, fc: null, mobile: (vsId === CAL_ID_MO)};
	}
	var voCal = calendars[vsId];
	if (voCal.fc) return; // 이미 그려진 경우

	if (!voCal.el) {
		voCal.el = document.createElement("div");
		voCal.el.className = voCal.mobile ? "cal-fc" : "cal-fc cal-fc-pc"; // PC용 클래스
		e.content.appendChild(voCal.el);
	}

	// 스크립트는 읽는 순서가 보장되어야 하므로 ResourceLoader로 차례로 읽은 뒤 그린다
	loadScriptOnce("./thirdparty/fullcalendar/all/global.js").then(function() {
		return loadScriptOnce("./thirdparty/fullcalendar/themes/monarch/global.js");
	}).then(function() {
		buildCalendar(voCal);
	});
}

/**
 * FullCalendar 인스턴스를 만들어 그린다. (스크립트 로드 완료 후 호출)
 * @param {Object} poCal calendars[쉘 id]
 */
function buildCalendar(poCal) {
	if (poCal.fc) return;
	var vaEvents = makeEventsFromDataset(); // dotsByDate(모바일 점)도 여기서 채워진다

	poCal.fc = new FullCalendar.Calendar(poCal.el, {
		initialView: "dayGridMonth",
		initialDate: "2026-08-01",
		now: "2026-08-28", // 설계 이미지의 "오늘"(28일)을 고정 표시하기 위한 샘플 값
		headerToolbar: false, // 월 이동 버튼/제목은 화면의 btnGrp 그룹(btnPrevMonth, optMonthTitle, btnNextMonth)이 맡는다
		viewClass: poCal.mobile ? "cal-fc-view cal-fc-mobile" : "cal-fc-view", // 모바일이면 cal-fc-mobile 추가
		// PC: 쉘을 채운다(최소 크기는 LESS·clx minlength). 모바일: auto 높이 + aspectRatio로 칸 52px
		height: poCal.mobile ? "auto" : "100%",
		dayRowClass: poCal.mobile ? "" : "cal-fc-row", // PC: 모든 줄이 같은 높이를 나눠 갖게 하는 클래스(LESS)
		aspectRatio: calcAspectRatio(poCal),
		fixedWeekCount: true,
		showNonCurrentDates: false,
		dayMaxEvents: 3, // 칩은 칸마다 3개, 4개 이상이면 칩 3개 + "+N more"(칸 맨 아래)
		eventOrder: "seq", // 입력 순서대로 표시 (기본은 제목순)
		dayHeaderFormat: {weekday: "short"},
		events: poCal.mobile ? [] : vaEvents, // 모바일은 칩 없이 점만 쓴다

		// 요일 헤더
		dayHeaderClass: "cal-fc-head",
		dayHeaderInnerClass: "cal-fc-head-inner",

		// 날짜 칸
		dayCellClass: function(info) {
			return "cal-fc-day" + (toYmd(info.date) === SELECTED_DATE ? " cal-fc-selected" : "") + (info.isToday ? " cal-fc-today" : "");
		},
		dateClick: function(info) {
			selectDate(info.dateStr);
		},
		dayCellTopClass: "cal-fc-top",
		dayCellTopInnerClass: "cal-fc-top-inner",
		dayCellInnerClass: "cal-fc-day-inner",
		dayCellBottomClass: "cal-fc-bottom",
		dayCellTopContent: function(info) {
			return renderDayTop(info, poCal.mobile);
		},

		// 이벤트 칩 (코드 배지 + 회사명) — 클릭하면 Disclosure Viewer 팝업
		eventClick: function(info) {
			openDisclosureViewer();
		},
		eventClass: "cal-fc-event",
		eventInnerClass: "cal-fc-event-inner",
		eventContent: function(info) {
			var p = info.event.extendedProps;
			return {
				html: "<span class=\"cal-code cal-code-" + p.code + "\">" + p.code + "</span>" +
					"<span class=\"cal-chip-name\">" + info.event.title + "</span>"
			};
		},

		// +N more
		moreLinkClass: "cal-more",
		moreLinkInnerClass: "cal-more-inner",
		// +N more 클릭 시 아무 동작도 하지 않는다.
		// (7.1.3은 함수가 거짓 값을 반환하면 팝오버를 열고, 문자열이면 보기 전환을 하므로 true를 반환해 둘 다 막는다)
		moreLinkClick: function() {
			return true;
		},
		moreLinkContent: function(info) {
			return "+" + info.num + " more";
		}
	});

	poCal.fc.render();
	updateMonthTitle();
	markSideCard();

	// 창 크기가 바뀌면 행 높이를 유지하도록 aspectRatio를 다시 계산 (리스너는 한 번만)
	if (!resizeBound) {
		resizeBound = true;
		window.addEventListener("resize", function() {
			refreshCalendars();
		});
	}
}

/**
 * 만들어진 모든 달력(PC용/모바일용)의 월을 같이 옮기고 월 제목을 갱신한다.
 * @param {Number} pnStep -1: 이전 달, 1: 다음 달
 */
function moveMonth(pnStep) {
	for (var vsId in calendars) {
		var voCal = calendars[vsId];
		if (voCal.fc) voCal.fc[pnStep < 0 ? "prev" : "next"]();
	}
	updateMonthTitle();
}

/**
 * 달력이 보여주는 월 이름(예: August)을 optMonthTitle 아웃풋에 넣는다.
 */
function updateMonthTitle() {
	for (var vsId in calendars) {
		var voCal = calendars[vsId];
		if (voCal.fc) {
			/** @type cpr.controls.Output */
			var optMonthTitle = app.lookup("optMonthTitle");
			optMonthTitle.value = voCal.fc.getDate().toLocaleString("en-US", {month: "long"});
			return;
		}
	}
}

/**
 * 만들어진 달력 중 보이는 것(폭이 있는 것)만 크기를 다시 맞춘다.
 */
function refreshCalendars() {
	for (var vsId in calendars) {
		var voCal = calendars[vsId];
		if (voCal.fc && voCal.el && voCal.el.clientWidth > 0) {
			voCal.fc.setOption("aspectRatio", calcAspectRatio(voCal));
		}
	}
}

/**
 * 날짜를 선택한다: 날짜 칸 배경(dayCellClass의 cal-fc-selected)과 오른쪽 목록 강조를 바꾼다.
 * @param {String} psYmd YYYY-MM-DD
 */
function selectDate(psYmd) {
	SELECTED_DATE = psYmd;
	for (var vsId in calendars) {
		var voCal = calendars[vsId];
		// 같은 함수를 다시 넣으면 FullCalendar가 날짜 칸 클래스를 다시 계산한다
		if (voCal.fc) voCal.fc.setOption("dayCellClass", voCal.fc.getOption("dayCellClass"));
	}
	markSideCard();
}

/**
 * 오른쪽 목록에서 선택된 날짜의 묶음(사용자 속성 date)을 강조하고 목록 맨 위로 스크롤한다. 묶음이 없으면 강조만 지운다.
 */
function markSideCard() {
	/** @type cpr.controls.Container */
	var grpSideList = app.lookup("grpSideList");
	var vcTarget = null;
	grpSideList.getChildren().forEach(function(card) {
		if (card.visible && card.userAttr("date") === SELECTED_DATE) { // 라벨 필터로 숨긴 묶음은 제외
			card.style.addClass("cal-active");
			vcTarget = vcTarget || card;
		} else {
			card.style.removeClass("cal-active");
		}
	});
	if (vcTarget) {
		// 12 = 목록 위 여백 (Figma rail-body padding)
		grpSideList.scrollTo(0, grpSideList.getViewPortRect().top + vcTarget.getActualRect().top - grpSideList.getActualRect().top - 12);
	}
}

/**
 * 날짜 칸 위쪽 내용. 숫자 + (모바일일 때) 그날 일정 점.
 * @param {Object} info
 * @param {Boolean} pbMobile
 * @return {String|Object}
 */
function renderDayTop(info, pbMobile) {
	if (info.isOther) return "";
	var vsYmd = toYmd(info.date);
	var vsHtml = "<span class=\"cal-num" + (info.isToday ? " cal-today" : "") + "\">" + info.dayNumberText + "</span>";
	if (pbMobile) {
		// 점이 없는 날도 점 칸(8px)은 항상 둬서 숫자 위치가 같게 한다
		vsHtml += "<span class=\"cal-dots\">";
		var vaDots = dotsByDate[vsYmd] || [];
		for (var i = 0; i < vaDots.length && i < MOBILE_MAX_DOTS; i++) {
			vsHtml += "<span class=\"cal-dot cal-code-" + vaDots[i] + "\"></span>";
		}
		vsHtml += "</span>";
	}
	return {html: vsHtml};
}

/**
 * Date를 "YYYY-MM-DD" 문자열로 바꾼다.
 * @param {Date} pdDate
 * @return {String}
 */
function toYmd(pdDate) {
	var vsMonth = ("0" + (pdDate.getMonth() + 1)).slice(-2);
	var vsDay = ("0" + pdDate.getDate()).slice(-2);
	return pdDate.getFullYear() + "-" + vsMonth + "-" + vsDay;
}

/**
 * 모바일(auto 높이) 달력의 줄 높이가 52px가 되는 aspectRatio (달력 높이 = 폭 / aspectRatio).
 * PC는 height:"100%"라 FullCalendar가 aspectRatio를 쓰지 않는다.
 * @param {Object} poCal calendars[쉘 id]
 * @return {Number}
 */
function calcAspectRatio(poCal) {
	return ((poCal.el && poCal.el.clientWidth) || 1000) / (6 * MOBILE_ROW_HEIGHT);
}

/*******************************************************************************
 * User Defined Function Area
 *******************************************************************************/

/**
 * ResourceLoader로 스크립트 하나를 읽는다.
 * @param {String} psUrl
 * @return {Promise}
 */
function loadScriptOnce(psUrl) {
	var loader = new cpr.core.ResourceLoader();
	loader.addScript(psUrl);
	return loader.load();
}

/**
 * 데이터셋(dsEvent)의 행을 FullCalendar 이벤트 배열로 바꾼다.
 * 컬럼: eventId, eventDate(YYYY-MM-DD), eventCode(색은 LESS의 코드별 규칙), companyName
 * @return {Array}
 */
function makeEventsFromDataset() {
	/** @type cpr.data.DataSet */
	var dsEvent = app.lookup("dsEvent");
	var vaCodes = app.lookup("cbgLabels").values; // Event Labels 팝업에서 선택된 라벨만
	var list = [];
	dotsByDate = {};
	for (var i = 0; i < dsEvent.getRowCount(); i++) {
		if (vaCodes.indexOf(dsEvent.getValue(i, "eventCode")) < 0) continue;
		var vsDate = dsEvent.getValue(i, "eventDate");
		if (!dotsByDate[vsDate]) dotsByDate[vsDate] = [];
		dotsByDate[vsDate].push(dsEvent.getValue(i, "eventCode"));
		list.push({
			id: dsEvent.getValue(i, "eventId"),
			title: dsEvent.getValue(i, "companyName"),
			start: dsEvent.getValue(i, "eventDate"),
			allDay: true,
			extendedProps: {code: dsEvent.getValue(i, "eventCode"), seq: i}
		});
	}
	return list;
}
