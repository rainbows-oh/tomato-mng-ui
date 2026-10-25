/************************************************
 * @file      Overview.js
 * @author    ryu
 * @created   2026. 5. 27. 오후 2:49:29
 * * [History]
 * - 2026. 5. 27. : 최초 생성 (ryu)
 ************************************************/
var util = createCommonUtil();


/*
 * @function 
 * @desc    루트 컨테이너에서 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 * @param   {cpr.events.CEvent} e 이벤트 객체
 */
function onBodyLoad(e){
	// 노티파이어
	app.lookup("notifier").notify("메세지가 표시됩니다");
	app.lookup("notifier2").info("메세지가 표시됩니다");
	app.lookup("notifier3").success("메세지가 표시됩니다");
	app.lookup("notifier4").warning("메세지가 표시됩니다");
	app.lookup("notifier5").danger("메세지가 표시됩니다");

	// 캘린더
	app.lookup("date").addAnniversary({label: "기념일", date: moment().subtract(-3, "day").format("YYYYMMDD")});
	app.lookup("anniversary").addItem(new cpr.controls.CalendarItem("일정1", moment().subtract(1, "day"), moment().subtract(1, "day")));
	app.lookup("anniversary").addItem(new cpr.controls.CalendarItem("일정2", moment().subtract(2, "day"), moment().subtract(1, "day")));
	app.lookup("anniversary").addItem(new cpr.controls.CalendarItem("일정3", moment().subtract(3, "day"), moment().subtract(1, "day")));
	app.lookup("anniversary").addItem(new cpr.controls.CalendarItem("일정4", moment().subtract(1, "day"), moment().subtract(1, "day")));
	app.lookup("anniversary").addItem(new cpr.controls.CalendarItem("일정5", moment().subtract(1, "day"), moment().subtract(1, "day")));
	
	// 툴팁
	cpr.core.Platform.INSTANCE.tooltipManager.registerTooltip(app.lookup("tooltip"), function(tooltipOwner) {
		var output = new cpr.controls.Output();
		output.value = tooltipOwner.tooltip;
		return output;
	});
	
	var cmb = app.lookup("cmb");
	var item = cmb.getItemByValue(2);
	
	if (item) {
		cmb.setItemEnable(item, false);
	}
	
	var calendar = app.lookup("cal1");
	
	calendar.addAnniversary({
		date: "2026-10-13",
		className: "cal-urgent"
	});
	
}

/*
 * @function 
 * @desc    "일반" 버튼(btnDlg)에서 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 * @param   {cpr.events.CMouseEvent} e 이벤트 객체
 */
function onBtnDlgClick(e){
	var newApp = new cpr.core.App("__tmp__", {
		onCreate: function(app, exports) {
			app.app.title = "팝업";
			var container = app.getContainer();
			container.style.css({
				"width": "100%",
				"top": "0px",
				"height": "100%",
				"left": "0px"
			});
			
		}
	});
	
	app.getRootAppInstance().dialogManager.openDialog(newApp, "dialog", { width: 1024, height: 600 }, function(dialog) {
		dialog.headerTitle = "타이틀";
		dialog.headerMin = true;
		dialog.headerMax = true;
		dialog.resizable = false;
	});
}

/*
 * @function 
 * @desc    "메세지" 버튼(btnMsgDlg)에서 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 * @param   {cpr.events.CMouseEvent} e 이벤트 객체
 */
function onBtnMsgDlgClick(e){
	var newApp = new cpr.core.App("__tmp__", {
		onCreate: function(app, exports){
			var container = app.getContainer();
		}
	});
	
	app.getRootAppInstance().dialogManager.openDialog(newApp, "dialog", {width: 360, height: 200}, function(dialog) {
		dialog.headerTitle = "알림";
		dialog.resizable = false;
		dialog.style.addClass("modal");
	});
}

/*
 * 콤보 박스에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onCmbOpen(e) {
	var cmb = e.control;
	
	setTimeout(function(){
		if(cmb.isOpened()) {
			debugger;
		}
	}, 200);
}

/*
 * 콤보 박스에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onCmb6Open(e) {
	var cmb6 = e.control;
	
	setTimeout(function(){
		if(cmb6.isOpened()) {
			debugger;
		}
	}, 200);
}

/*
 * "버튼" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e) {
	var button = e.control;
	
	util.Dialog.open(app, "app/pb/management/NewManualDisclosure_modal", 600, 527, function(){
		
	}, {
		
	}, {
		resizable: true
	});
}

/*
 * 콤보 박스에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onCmb7ItemClick(e) {
	var cmb7 = e.control;
	
	setTimeout(function(){
		
	}, 200);
	debugger;
}
