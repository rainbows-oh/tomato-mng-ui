/*******************************************************************************
 * Business Category :
 * Screen ID : MGT-NTD-01-00_Calendars_Non-TradingDays_List.js
 * Screen Name :
 * Created Date :  2026. 11. 5. 오후 2:31:18
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


/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
/** 달력에 표시할 연도 */
var CALENDAR_YEAR = 2026;
/** 이벤트 날짜에 적용할 달력 기념일 클래스 (holiday 는 event.module.js 의 전역 공휴일이 사용하므로 별도 클래스 사용) */
var EVENT_CLASS = "event-day";


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
 * 컨테이너 하위의 달력 컨트롤을 배치 순서대로 수집합니다.
 * @param {cpr.controls.Container} pcContainer 컨테이너
 * @param {cpr.controls.Calendar[]} paResult 수집 결과
 */
function doCollectCalendars(pcContainer, paResult) {
	pcContainer.getChildren().forEach(function(each) {
		if (each instanceof cpr.controls.Calendar) {
			paResult.push(each);
		} else if (each instanceof cpr.controls.Container) {
			doCollectCalendars(each, paResult);
		}
	});
}

/**
 * 요일 헤더를 한 글자(S, M, T, W, T, F, S)로 표기하도록 로케일 데이터를 수정합니다.
 * (달력 기본 표기는 Su, Mo, Tu ...)
 * ※ 로케일 데이터는 앱 전체에서 공유되므로 달력/데이트인풋의 요일 최소 이름(en-US)에 모두 적용됩니다.
 */
function doSetWeekdayMin() {
	cpr.LocaleManager.INSTANCE.updateLocale("en-US", {
		dateTime: {
			weekdaysMin: ["S", "M", "T", "W", "T", "F", "S"]
		}
	});
}

/**
 * 데이터셋(dsHoliday)의 시작일 ~ 종료일 구간을 하루 단위(yyyyMMdd)로 펼쳐 반환합니다.
 * @return {String[]} 이벤트 일자 목록
 */
function doGetEventDates() {
	var vaDates = [];
	var vcDs = app.lookup("dsHoliday");

	for (var i = 0; i < vcDs.getRowCount(); i++) {
		var vsStart = vcDs.getValue(i, "startDate");
		var vsEnd = vcDs.getValue(i, "endDate") || vsStart;
		var vdCur = new Date(Number(vsStart.substring(0, 4)), Number(vsStart.substring(4, 6)) - 1, Number(vsStart.substring(6, 8)));
		var vdEnd = new Date(Number(vsEnd.substring(0, 4)), Number(vsEnd.substring(4, 6)) - 1, Number(vsEnd.substring(6, 8)));

		while (vdCur.getTime() <= vdEnd.getTime()) {
			vaDates.push(vdCur.getFullYear() + ("0" + (vdCur.getMonth() + 1)).slice(-2) + ("0" + vdCur.getDate()).slice(-2));
			vdCur.setDate(vdCur.getDate() + 1);
		}
	}
	return vaDates;
}

/**
 * 12개 달력의 표시 월을 1월 ~ 12월로 세팅하고, 이벤트 리스트(dsHoliday)의 일자를 표시합니다.
 */
function doSetCalendarMonth() {
	var vaCalendar = [];
	var vaEventDates = doGetEventDates();
	doCollectCalendars(app.lookup("grpContent"), vaCalendar);

	vaCalendar.forEach(function(each, idx) {
		/* defaultDate 는 기본(오늘) 날짜 스타일이 적용되므로 사용하지 않고, 달력 보기 위치만 이동 */
		each.navigate(new Date(CALENDAR_YEAR, idx, 1));

		/* 해당 월의 이벤트 날짜 표시 */
		var vsMonth = ("0" + (idx + 1)).slice(-2);
		vaEventDates.forEach(function(date) {
			if (date.substring(0, 6) == CALENDAR_YEAR + vsMonth) {
				each.addAnniversary({
					className: EVENT_CLASS,
					label: "Non-Trading Day",
					date: date
				});
			}
		});
	});
}


/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 루트 컨테이너의 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때(컨트롤이 화면에 그려지기 전) 발생하는 이벤트.
 * 첫 그리기 전에 월을 맞추기 위해 load 가 아닌 init 에서 처리.
 */
function onBodyInit(e) {
	doSetWeekdayMin();
	doSetCalendarMonth();
}

