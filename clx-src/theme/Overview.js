/************************************************
 * @file      Overview.js
 * @author    ryu
 * @created   2026. 5. 27. 오후 2:49:29
 * * [History]
 * - 2026. 5. 27. : 최초 생성 (ryu)
 ************************************************/

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
