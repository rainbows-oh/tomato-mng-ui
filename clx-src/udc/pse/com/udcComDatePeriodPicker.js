/*******************************************************************************
 * Business Category :
 * Screen ID : udcComDateRangePicker.js
 * Screen Name : 
 * Created Date :  2026. 9. 29. 오후 3:03:28
 * Creator : user
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
var today = DateUtil.getCurrentDay();
var isReadOnly = false;

/*******************************************************************************
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
}

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
	var startDate = ValueUtil.fixNull(app.lookup("dtiStartDate").displayingText);
	var endDate = ValueUtil.fixNull(app.lookup("dtiEndDate").displayingText);
	
	if (startDate == "" && endDate == "") {
		return "";
	} else {
		return startDate + "~" + endDate;
	}
};

/**
 * Layout Configuration
 */
function setLayout() {
	var dtiStartDate = app.lookup("dtiStartDate");
	var dtiEndDate = app.lookup("dtiEndDate");
	
	/** [dateFormat] Date format **/
	var dateFormat = app.getAppProperty("dateFormat");
	
	today = DateUtil.getCurrentDay(dateFormat);
	
	var dateMask     = "MM-DD-YYYY";
	var calendarType = "yearmonthdate";
	
	if(dateFormat == "MMYYYY"){
		dateMask     = "MM-YYYY";
		calendarType = "yearmonth";
		app.lookup("dtiStartDate").fieldLabel = "Period start-month";
		app.lookup("dtiEndDate").fieldLabel   = "Period end-month";
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
	
	app.getContainer().redraw();
};

/**
 * Configure Date Selection Button Area
 */
function setPicker() {
	var rootContainer = app.lookup("grpDate");
	
	/** [showPickerArea] Overall control of the date selection area **/
	var showPickerArea = app.getAppProperty("showPickerArea");
	if (showPickerArea) {
		rootContainer.getLayout().setColumnVisible(1, true);
	} else {
		rootContainer.getLayout().setColumnVisible(1, false);
	}
	
	/** Individual control of date selection items **/
	util.SelectCtl.clearFilter(app, "cmbPeriod");
	
	var showPickerBtn = [];
	
	if (app.getAppProperty("showTodayBtn")) { // Today
		showPickerBtn.push("'today'");
	}
	
	if (app.getAppProperty("show1WeekBtn")) { // 1 Week
		showPickerBtn.push("'1week'");
	}
	
	if (app.getAppProperty("show1MonthBtn")) { // 1 Month
		showPickerBtn.push("'1month'");
	}
	
	if (app.getAppProperty("show6MonthsBtn")) { // 6 Months
		showPickerBtn.push("'6months'");
	}
	
	if (app.getAppProperty("show1YearBtn")) { // 1 Year
		showPickerBtn.push("'1year'");
	}
	
	if (app.getAppProperty("show2YearsBtn")) { // 2 Years
		showPickerBtn.push("'2years'");
	}
	
	if (app.getAppProperty("show3YearsBtn")) { // 3 Years
		showPickerBtn.push("'3years'");
	}
	
	// Filter date selection radio buttons
	var showPickerItemFilter = "[" + showPickerBtn + "].indexOf(value) != -1";
	util.SelectCtl.setFilter(app, "cmbPeriod", showPickerItemFilter);
	
	/** [defaultPickerType] Default date selection type **/
	var defaultPickerType = app.getAppProperty("defaultPickerType");
	if (!ValueUtil.isNull(defaultPickerType)) {
		// Process only when visible
		var findPickerType = app.lookup("cmbPeriod").findItem({
			value: defaultPickerType
		});
		if (!ValueUtil.isNull(findPickerType) && app.getAppProperty("showPickerArea")) {
			util.SelectCtl.selectItem(app, "cmbPeriod", defaultPickerType, false);
			setDate(defaultPickerType);
		}
	}
	
	rootContainer.redraw();
};

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
		case "today":
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
			
		case "1month":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 1);
			} else {
				startDate = DateUtil.addMonth(today, -1);
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
			
		case "2years":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 24);
			} else {
				startDate = DateUtil.addMonth(today, -24);
			}
			value = startDate + "~" + endDate;
			break;
			
		case "3years":
			if (defaultPickerTypeEndDt){
				endDate = DateUtil.addMonth(today, 36);
			} else {
				startDate = DateUtil.addMonth(today, -36);
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
};

/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/
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
			app.lookup("cmbPeriod").clearSelection(false);
			break;
			
		case "defaultPickerType":
			var defaultPickerType = ValueUtil.fixNull(app.getAppProperty("defaultPickerType"));
			
			if (ValueUtil.isNull(defaultPickerType)) {
				app.lookup("cmbPeriod").clearSelection(false);
				setDate(defaultPickerType);
			} else {
				// Process only when visible
				var findPickerType = app.lookup("cmbPeriod").findItem({
					value: defaultPickerType
				});
				if (!ValueUtil.isNull(findPickerType) && app.getAppProperty("showPickerArea")) {
					util.SelectCtl.selectItem(app, "cmbPeriod", defaultPickerType, false);
					setDate(defaultPickerType);
				}
			}
			
			break;
			
		case "showPickerArea":
		case "showTodayBtn":
		case "show1WeekBtn":
		case "show1MonthBtn":
		case "show6MonthsBtn":
		case "show1YearBtn":
		case "show2YearsBtn":
		case "show3YearsBtn":
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
 * 콤보 박스에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onCmbPeriodItemClick(e) {
	var cmbPeriod = e.control;
	var rangeType = util.Control.getValue(app, "cmbPeriod");
	setDate(rangeType);
	
	/** [click-date-picker] Fires when clicking the date picker **/
	var clickDatePickerEvent = new cpr.events.CUIEvent("click-date-picker");
	clickDatePickerEvent.pickerType = e.item.value;
	app.dispatchEvent(clickDatePickerEvent);
}
