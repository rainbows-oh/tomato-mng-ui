/************************************************
 * Business Category : Common
 * Screen ID : udcBaseDateRangePicker.js
 * Screen Name : Start/End Date Input
 * Created Date : 
 * Creator : 
 * Revision History
 ***************************************************
 * Date				Name				Description
 ***************************************************
 * 
 ***************************************************/

/******************************************************************************
 * Common Module Area
 *******************************************************************************/
var util = createCommonUtil(); //exBuilder6 default common module

/******************************************************************************
 * Business Common Module Area
 *******************************************************************************/
exports.getText = getText;
exports.focus = setStartDateFocusCtrl;
exports.endDateFocus = setEndDateFocusCtrl;
exports.clearSelection = fnClearSelection;

/******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
var today = DateUtil.getCurrentDay();
var isReadOnly = false;

/******************************************************************************
 * Onload and Submission Call Area
 * (Contains related events and submission calls, along with callback functions invoked upon screen loading.)
 *******************************************************************************/
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	setPicker();
	setLayout();
	
	// UDC에 지정된 필수값 사용자 속성(required) 각 컨트롤에 셋팅
	var isRequired = app.getHost().userAttr("required");
	if (!ValueUtil.isNull(isRequired)) {
		var requiredTargetCtrls = ["dtiStartDate", "dtiEndDate"];
		for (var i = 0; i < requiredTargetCtrls.length; i++) {
			app.lookup(requiredTargetCtrls[i]).userAttr("required", isRequired);
		}
	}
	
	// UDC에 지정된 사용자 속성(autoKeydownSearch) 각 컨트롤에 셋팅
	var autoKeydownSearch = app.getHost().userAttr("autoKeydownSearch");
	if (!ValueUtil.isNull(autoKeydownSearch)) {
		app.lookup("dtiStartDate").userAttr("autoKeydownSearch", "Y");
		app.lookup("dtiEndDate").userAttr("autoKeydownSearch", "Y");
	}
}

/******************************************************************************
 * Validation Check Area
 *******************************************************************************/

/******************************************************************************
 * User-Defined JavaScript Functions
 *******************************************************************************/
/**
 * Returns the text to be displayed for the UDC control in the grid's view mode.
 */
function getText() {
	var startDate = ValueUtil.fixNull(app.lookup("dtiStartDate").displayingText);
	var endDate = ValueUtil.fixNull(app.lookup("dtiEndDate").displayingText);
	
	if (startDate == "" && endDate == "") {
		return "";
	} else {
		return startDate + "~" + endDate;
	}
}

/**
 * Clear the DatePicker selection for the UDC control.
 */
function fnClearSelection() {
	app.lookup("rdbDatePicker").clearSelection(false);
}

/**
 * Handle focusing for dtiStartDate
 */
function setStartDateFocusCtrl() {
	util.Control.setFocus(app, "dtiStartDate");
}

/**
 * Handle focusing for dtiEndDate
 */
function setEndDateFocusCtrl() {
	util.Control.setFocus(app, "dtiEndDate");
}

/**
 * Layout Configuration
 */
function setLayout() {
	var dtiStartDate = app.lookup("dtiStartDate");
	var dtiEndDate = app.lookup("dtiEndDate");
	
	/** [dateFormat] Date format **/
	var dateFormat = app.getAppProperty("dateFormat");
	
	today = DateUtil.getCurrentDay(dateFormat);
	
	var dateMask     = "MM/DD/YYYY";
	var calendarType = "yearmonthdate";
	
	/** [startDateReadOnly][endDateReadOnly] Start/End date readOnly **/
	var startDateReadOnly = isReadOnly || app.getAppProperty("startDateReadOnly");
	var endDateReadOnly   = isReadOnly || app.getAppProperty("endDateReadOnly");
	
	var startDateWidth = startDateReadOnly ? "100px" : "150px";
	var endDateWidth   = endDateReadOnly   ? "100px" : "150px";
	if(dateFormat == "MMYYYY"){
		dateMask     = "MM/YYYY";
		calendarType = "yearmonth";
		startDateWidth = startDateReadOnly ? "80px" : "100px";
		endDateWidth   = endDateReadOnly   ? "80px" : "100px";
		app.lookup("dtiStartDate").fieldLabel = "Start Year-Month";
		app.lookup("dtiEndDate").fieldLabel   = "End Year-Month";
	}
	
	// Configure format
	dtiStartDate.format = dateFormat;
	dtiEndDate.format   = dateFormat;
	
	// Configure mask
	dtiStartDate.mask = dateMask;
	dtiEndDate.mask   = dateMask;
	
	// Configure calendarType
	dtiStartDate.calendarType = calendarType;
	dtiEndDate.calendarType   = calendarType;
	
	// Configure date input widths
	app.lookup("grpDate").getLayout().setColumns([startDateWidth, "9px", endDateWidth]);
	
	/** [startDateMinDate] Start date minDate **/
	var startDateMinDate = app.getAppProperty("startDateMinDate");
	if(!ValueUtil.isNull(startDateMinDate)){
		dtiStartDate.minDate = DateUtil.toDate(startDateMinDate, dateFormat);
	}
	
	/** [startDateMinDate] Start date maxDate **/
	var startDateMaxDate = app.getAppProperty("startDateMaxDate");
	if(!ValueUtil.isNull(startDateMaxDate)){
		dtiStartDate.maxDate = DateUtil.toDate(startDateMaxDate, dateFormat);
	}
	
	/** [endDateMinDate] End date minDate **/
	var endDateMinDate = app.getAppProperty("endDateMinDate");
	if(!ValueUtil.isNull(endDateMinDate)){
		dtiEndDate.minDate = DateUtil.toDate(endDateMinDate, dateFormat);
	}
	
	/** [endDateMaxDate] End date maxDate **/
	var endDateMaxDate = app.getAppProperty("endDateMaxDate");
	if(!ValueUtil.isNull(endDateMaxDate)){
		dtiEndDate.maxDate = DateUtil.toDate(endDateMaxDate, dateFormat);
	}
	
	/** [startDateAutoSkip] Start date autoSkip **/
	var startDateAutoSkip = ValueUtil.fixBoolean(app.getAppProperty("startDateAutoSkip"));
	dtiStartDate.autoSkip = startDateAutoSkip;
	
	/** [endDateAutoSkip] End date autoSkip **/
	var endDateAutoSkip = ValueUtil.fixBoolean(app.getAppProperty("endDateAutoSkip"));
	dtiEndDate.autoSkip = endDateAutoSkip;
	
	app.getContainer().redraw();
}

/**
 * Configure Date Selection Button Area
 */
function setPicker() {
	var rootContainer = app.getContainer();
	
	/** [showPickerArea] Overall control of the date selection area **/
	var showPickerArea = app.getAppProperty("showPickerArea");
	if (showPickerArea) {
		rootContainer.getLayout().setColumnVisible(1, true);
	} else {
		rootContainer.getLayout().setColumnVisible(1, false);
	}
	
	/** [showAllPeriod][showTodayBtn][show1WeekBtn][show1MonthBtn][show3MonthBtn][show6MonthsBtn][show1YearBtn] Individual control of date selection items **/
	util.SelectCtl.clearFilter(app, "rdbDatePicker");
	
	var showPickerBtn = [];
	
	if (app.getAppProperty("showAllPeriod")) { // All Period
		showPickerBtn.push("'all'");
	}
	
	if (app.getAppProperty("showTodayBtn")) { // Today
		showPickerBtn.push("'today'");
	}
	
	if (app.getAppProperty("showThisMonthBtn")) { // This Month
		showPickerBtn.push("'thisMonth'");
	}
	
	if (app.getAppProperty("show1WeekBtn")) { // 1 Week
		showPickerBtn.push("'1week'");
	}
	
	if (app.getAppProperty("show2WeeksBtn")) { // 2 Weeks
		showPickerBtn.push("'2weeks'");
	}
	
	if (app.getAppProperty("show3WeeksBtn")) { // 3 Weeks
		showPickerBtn.push("'3weeks'");
	}
	
	if (app.getAppProperty("show1MonthBtn")) { // 1 Month
		showPickerBtn.push("'1month'");
	}
	
	if (app.getAppProperty("show2MonthsBtn")) { // 2 Months
		showPickerBtn.push("'2months'");
	}
	
	if (app.getAppProperty("show3MonthsBtn")) { // 3 Months
		showPickerBtn.push("'3months'");
	}
	
	if (app.getAppProperty("show6MonthsBtn")) { // 6 Months
		showPickerBtn.push("'6months'");
	}
	
	if (app.getAppProperty("show1YearBtn")) { // 1 Year
		showPickerBtn.push("'1year'");
	}
	
	// Filter date selection radio buttons
	var showPickerItemFilter = "[" + showPickerBtn + "].indexOf(value) != -1";
	util.SelectCtl.setFilter(app, "rdbDatePicker", showPickerItemFilter);
	
	/** [defaultPickerType] Default date selection type **/
	var defaultPickerType = app.getAppProperty("defaultPickerType");
	if (!ValueUtil.isNull(defaultPickerType)) {
		// Process only when visible
		var findPickerType = app.lookup("rdbDatePicker").findItem({
			value: defaultPickerType
		});
		if (!ValueUtil.isNull(findPickerType) && app.getAppProperty("showPickerArea")) {
			util.SelectCtl.selectItem(app, "rdbDatePicker", defaultPickerType, false);
			setDate(defaultPickerType);
		}
	}
	
	rootContainer.redraw();
}

/**
 * Set the start and end dates.
 * @param rangeType {String} Period type
 */
function setDate(rangeType) {
	var defaultPickerTypeEndDt = app.getAppProperty("defaultPickerTypeEndDt");
	var startDate = today;
	var endDate = today;
	var value = "";
	
	switch (rangeType) {
		case "all":
			startDate = "";
			endDate = "";
			break;
			
		case "today":
			value = startDate + "~" + endDate;
			break;
			
		case "thisMonth":
			var dateFormat = app.getAppProperty("dateFormat");
			if (dateFormat == "MMDDYYYY") {
				startDate = DateUtil.getFirstDayOfMonth(DateUtil.getCurrentDay("YYYY"), DateUtil.getCurrentDay("MM"));
			}
			
			value = startDate + "~" + endDate;
			break;
			
		case "1week":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addDate(today, 7);
			} else {
				startDate = DateUtil.addDate(today, -7);
			}
			
			value = startDate + "~" + endDate;
			break;
			
		case "2weeks":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addDate(today, 14);
			} else {
				startDate = DateUtil.addDate(today, -14);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "3weeks":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addDate(today, 21);
			} else {
				startDate = DateUtil.addDate(today, -21);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "1month":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 1);
			} else {
				startDate = DateUtil.addMonth(today, -1);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "2months":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, "M", 2);
			} else {
				startDate = DateUtil.addMonth(today, "M", -2);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "3months":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 3);
			} else {
				startDate = DateUtil.addMonth(today, -3);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "6months":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 6);
			} else {
				startDate = DateUtil.addMonth(today, -6);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "1year":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 12);
			} else {
				startDate = DateUtil.addMonth(today, -12);
			}
			value = startDate + "~" + endDate;
			break;
			
		default:
			startDate = "";
			endDate = "";
			break;
	}
	
	app.setAppProperty("startDate", startDate, false);
	app.setAppProperty("endDate", endDate, false);
	app.setAppProperty("value", value);
	
	app.getContainer().redraw();
}

/******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *********************************----------------------------------------------*/
/*
 * 루트 컨테이너에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(e) {
	switch (e.property) {
		case "dateFormat":
			setLayout();
			break;
			
		case "startDate":
		case "endDate":
			var startDate = ValueUtil.fixNull(app.getAppProperty("startDate"));
			var endDate = ValueUtil.fixNull(app.getAppProperty("endDate"));
			
			var value = startDate + "~" + endDate;
			
			if (value == "~") {
				value = "";
			}
			
			app.setAppProperty("value", value, true);
			app.lookup("rdbDatePicker").clearSelection(false);
			break;
			
		case "defaultPickerType":
			var defaultPickerType = ValueUtil.fixNull(app.getAppProperty("defaultPickerType"));
			
			if (ValueUtil.isNull(defaultPickerType)) {
				app.lookup("rdbDatePicker").clearSelection(false);
				setDate(defaultPickerType);
			} else {
				// Process only when visible
				var findPickerType = app.lookup("rdbDatePicker").findItem({
					value: defaultPickerType
				});
				if (!ValueUtil.isNull(findPickerType) && app.getAppProperty("showPickerArea")) {
					util.SelectCtl.selectItem(app, "rdbDatePicker", defaultPickerType, false);
					setDate(defaultPickerType);
				}
			}
			
			break;
			
		case "showPickerArea":
		case "showAllPeriod":
		case "showTodayBtn":
		case "showThisMonthBtn":
		case "show1WeekBtn":
		case "show2WeeksBtn":
		case "show3WeeksBtn":
		case "show1MonthBtn":
		case "show2MonthsBtn":
		case "show3MonthsBtn":
		case "show6MonthsBtn":
		case "show1YearBtn":
			setPicker();
			break;
			
		case "value":
			/** [value-change] Fires when the value changes **/
			var valueChangeEvent = new cpr.events.CUIEvent("value-change");
			valueChangeEvent.oldValue = e.oldValue;
			valueChangeEvent.newValue = e.newValue;
			app.dispatchEvent(valueChangeEvent);
			
			break;
			
		case "required":
			// Set the mandatory user attribute (required) specified in the UDC to each control
			var isRequired = e.newValue;
			if (!ValueUtil.isNull(isRequired)) {
				var requiredTargetCtrls = ["dtiStartDate", "dtiEndDate"];
				for (var i = 0; i < requiredTargetCtrls.length; i++) {
					app.lookup(requiredTargetCtrls[i]).userAttr("required", isRequired);
				}
			}
			break;
		default:
			break;
	}
	
	app.getContainer().redraw();
}

/*
 * 라디오 버튼에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onRdbDatePickerItemClick(e) {
	var rangeType = util.Control.getValue(app, "rdbDatePicker");
	setDate(rangeType);
	
	/** [click-date-picker] Fires when clicking the date picker **/
	var clickDatePickerEvent = new cpr.events.CUIEvent("click-date-picker");
	clickDatePickerEvent.pickerType = e.item.value;
	app.dispatchEvent(clickDatePickerEvent);
}

/*
 * 데이트 인풋에서 before-value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장되기 전에 발생하는 이벤트. 다음 이벤트로 value-change가 발생합니다.
 */
function onDtiStartDateBeforeValueChange(e){
	// Ignore mandatory input check to validate only (2026.02.11)
	app.lookup("dtiStartDate").userAttr("ignoreRequired", "Y");
}

/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onDtiStartDateValueChange(e) {
	// Clear date selection when date is changed in the date input
	app.lookup("rdbDatePicker").clearSelection(false);
	
	util.validate(app, "dtiStartDate");
	
	app.lookup("dtiStartDate").removeUserAttr("ignoreRequired");
}

/*
 * 데이트 인풋에서 before-value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장되기 전에 발생하는 이벤트. 다음 이벤트로 value-change가 발생합니다.
 */
function onDtiEndDateBeforeValueChange(e){
	// Ignore mandatory input check to validate only (2026.02.11)
	app.lookup("dtiEndDate").userAttr("ignoreRequired", "Y");
}

/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onDtiEndDateValueChange(e) {
	// Clear date selection when date is changed in the date input
	app.lookup("rdbDatePicker").clearSelection(false);
	
	util.validate(app, "dtiEndDate");
	
	app.lookup("dtiEndDate").removeUserAttr("ignoreRequired");
}

/*
 * 데이트 인풋에서 focus 이벤트 발생 시 호출.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onDtiStartDateFocus(e) {
	/** [input-focus] Fires after an input control gains focus **/
	var inputFocusEvent = new cpr.events.CUIEvent("input-focus");
	app.dispatchEvent(inputFocusEvent);
}

/*
 * 루트 컨테이너에서 before-draw 이벤트 발생 시 호출.
 * 그룹 컨텐츠가 그려지기 직전에 호출되는 이벤트 입니다. 내부 컨텐츠를 동적으로 구성하기위한 용도로만 사용됩니다.
 */
function onBodyBeforeDraw(e) {
	// Change date input width when UDC readOnly property changes (2025.09.03)
	if (app.getHost().readOnly == !isReadOnly) {
		isReadOnly = !isReadOnly;
		setLayout();
	}
}

/*
 * 그룹에서 mouseenter 이벤트 발생 시 호출.
 * 마우스 포인터가 컨트롤 위에 진입할 때 발생하는 이벤트.
 */
function onGrpDateMouseenter(e){
	var tooltipUse = app.getAppProperty("tooltipUse");
	var tooltipText = ValueUtil.fixNull(app.getAppProperty("tooltipText"));
	
	if(tooltipUse && tooltipText != ""){
		util.Control.showTooltip(app, "grpDate", tooltipText);
	}
}
