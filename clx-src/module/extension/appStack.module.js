/*******************************************************************************
 * Business Category :
 * Screen ID : appStack.module.js
 * Screen Name : AppStack Module (EmbeddedApp & FullApp 통합)
 * Created Date : 2026. 9. 14. 오후 6:18:57
 * Creator : user
 * Revision History
 *******************************************************************************
 * Date				Name				Description
 *******************************************************************************
 * 2026.09.16       user                FullApp(app.close) & EmbeddedApp 혼용 및 $1 접미사 처리
 *******************************************************************************/

/************************************************
 * AppStack 변수
 ************************************************/ 
/**
 * StackInfo 객체의 ID 정보
 */
var _LAST_KNOWN_STATE_ID = 0;

/**
 * 현재 앱 스택.
 * 화면이 열린 후 열렸던 화면에 대한 스택을 쌓습니다.
 * @type StackInfo[]
 */
var _stack = [];

/**
 * 앞으로 가기 앱 스택.
 * @type StackInfo[]
 */
var _redoStack = [];

/**
 * 
 */
var appStackInfo = null;

/**
 * 앱 스택 적용시, URL 의 쿼리스트링 사용 여부.
 * true 로 설정 시 location 뒤에 ?p=appid 가 적용됩니다.
 * @type {Boolean} 기본값 false
 */
var mbQueryString = false;

/************************************************
 * AppStack Util
 ************************************************/ 
/**
 * AppStack(앱스택) 유틸
 * @constructor
 * @param {common.module} appKit
 */
function AppStackKit(appKit){
	this._appKit = appKit;
};

/**
 * AppStack 시작
 * @param {(psAppId: string, pbAppStack: Boolean)=>void} pfCallback popstate 이벤트 후 콜백함수
 * @param {Boolean} pbType? =`false` 앱스택 타입 (true 로 설정 시 AppID 를 쿼리스트링으로 적용합니다.)
 */
AppStackKit.prototype.start = function(pfCallback, pbType) {
	// 이미 메인 앱에서 콜백이 등록되어 있는 경우, 서브 화면 로드로 인한 중복/덮어쓰기 호출 방지
	if (appStackInfo && appStackInfo.getFnCallBack()) {
		return;
	}

	pbType = (pbType != null && pbType != undefined) ? pbType : false;
	mbQueryString = pbType;
	
	// 최초 앱스택 콜백 저장
	appStackInfo = (function(fnCallBack){
		var voFnCallBack = fnCallBack;
		return {
			getFnCallBack : function(){
				return voFnCallBack;
			}
		}
	})(pfCallback);
	
	/*
	 * mbQueryString=true 인 경우, 이전 History 존재 시 콜백 호출
	 */
	var historyState = history.state;
	if(mbQueryString && historyState && historyState.appId) {
		var vsAppId = historyState.appId.replace(/\$\d+$/, "");
		var newInfo = new StackInfo(vsAppId);
		_stack.push(newInfo);
		pfCallback(vsAppId, false);
	}
	
	// 중복 바인딩 방지 후 이벤트 추가
	window.removeEventListener("popstate", handlePoppedState);
	window.addEventListener("popstate", handlePoppedState);
};

/**
 * AppStack 중지
 */
AppStackKit.prototype.stop = function(){
	appStackInfo = null;
	window.removeEventListener("popstate", handlePoppedState);
};

/**
 * AppStack 정보 추가 (EmbeddedApp & FullApp 공용)
 * @param {string} psAppId 스택을 쌓을 앱ID
 */
AppStackKit.prototype.push = function(psAppId){
	if (!psAppId) return;

	// eXBuilder6 런타임 접미사($1, $2 등) 자동 제거
	var cleanAppId = psAppId.replace(/\$\d+$/, "");

	// 동일 화면 연속 push 방지
	if (_stack.length > 0) {
		var activeInfo = getActiveStackInfo();
		if (activeInfo && activeInfo.state && activeInfo.state.appId === cleanAppId) {
			return;
		}
	}

	var newInfo = new StackInfo(cleanAppId);
	
	_stack.push(newInfo);
	
	if(mbQueryString) {
		/* 쿼리스트링 적용하는 경우 */
		var vsUrl = location.origin + location.pathname + "?p=" + cleanAppId;
		if (_stack.length === 1) {
			history.replaceState(newInfo.state, "", vsUrl);
		} else {
			history.pushState(newInfo.state, "", vsUrl);
		}
	} else {
		/* 일반 앱 스택 (history.state 자체에도 cleanAppId를 백업 저장하여 메모리 초기화 대비) */
		var stateObj = {
			"id": newInfo.state.id,
			"appId": cleanAppId
		};
		
		if (_stack.length === 1) {
			history.replaceState(stateObj, cleanAppId);
		} else {
			history.pushState(stateObj, cleanAppId);
		}
	}
};

/**
 * 화면 전환 공통 함수 (임베디드/전체화면 메인 호출용)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {string} psAppId 이동할 App ID
 * @param {any} [poInitValue] 전달할 파라미터
 * @param {Object} poOptions? { params: {key: value}, readyCallback: fn(ea) }
 */
AppStackKit.prototype.openLoadPage = function(app, psAppId, poInitValue, poOptions) {
    var voMainApp = this._appKit ? this._appKit.getMainApp(app) : app.getRootAppInstance();
    
    if (voMainApp && typeof voMainApp.callAppMethod === "function") {
        voMainApp.callAppMethod("openLoadPage", psAppId, poInitValue, poOptions);
    } else {
        console.error("openLoadPage 메소드를 찾을 수 없습니다.");
    }
};

/**
 * 브라우저의 popstate 이벤트를 처리하는 핸들러.
 * @param {PopStateEvent} e
 */
function handlePoppedState(e) {
	var state = e.state;
	if (!state) return;
	
	var vsAppId = "";
	
	if(!mbQueryString) {
		// 1. 메모리 스택에서 검색 (EmbeddedApp 방식)
		var prevAppInfo = _stack.filter(function(each) {
			return each.state && each.state.id == state["id"];
		})[0];
		
		var nextAppInfo = _redoStack.filter(function(each) {
			return each.state && each.state.id == state["id"];
		})[0];
		
		var current;
		
		if (prevAppInfo) {
			while (getActiveStackInfo() != prevAppInfo) {
				if (_stack.length === 0) break;
				var current = _stack.pop();
				_redoStack.push(current);
			}
			current = getActiveStackInfo();
		} else if (nextAppInfo) {
			do {
				current = _redoStack.pop();
				_stack.push(current);
			} while (current !== nextAppInfo);
		}
		
		// 2. 메모리(_stack)가 날아갔을 경우 history.state에서 추출 (FullApp app.close 방식 Fallback)
		if (current && current.state) {
			vsAppId = current.state.appId;
		} else if (state.appId) {
			vsAppId = state.appId;
		}
	} else {
		var vsSearchParams = new URLSearchParams(location.search);
		vsAppId = vsSearchParams.get("p");
	}
	
	if (!vsAppId) return;
	
	// $1 등 런타임 접미사 최종 제거
	vsAppId = vsAppId.replace(/\$\d+$/, "");
	
	if (appStackInfo && appStackInfo.getFnCallBack()) {
		var voFnCallBack = appStackInfo.getFnCallBack();
		voFnCallBack(vsAppId, false);
	}
}

/**
 * @private
 * 현재 화면에 표시중인 앱 정보를 얻습니다.
 */
function getActiveStackInfo() {
	if (_stack.length > 0) {
		return _stack[_stack.length - 1];
	} else {
		return null;
	}
}

/**
 * 각 앱의 정보를 담은 스택 엘리먼트 객체.
 * @param {String} psAppId 앱 아이디
 * @constructor
 */
function StackInfo(psAppId) {
	var cleanAppId = psAppId ? psAppId.replace(/\$\d+$/, "") : "";
	this.state = {
		"appId": cleanAppId,
		"id": _LAST_KNOWN_STATE_ID++, 
	};
}

/************************************************
 * AppStack Global 출판
 ************************************************/ 
globals.getAppStack = function(app) {
	return new AppStackKit(app);
};