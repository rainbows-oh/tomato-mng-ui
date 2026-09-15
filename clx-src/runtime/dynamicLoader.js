/************************************************
 * System Name : 
 * Business Name : 
 * Screen Name : dynamicLoader.js
 * Description : 스크립트/CSS 로드 (캐시 미적용 위해)
 * 담당자(정/부) : 
 * Modification History
 * 수정일             수정자   요청자   수정내용
 * ----------------------------------------------
 * 
************************************************/

/**
 * eXBuilder6 버전
 */
var EXB6_VERSION = document.querySelector('meta[name="eb6-compiler-version"]').content;

/**
 * 버전으로 관리 될 파일 리스트
 */
var aExbScriptUrl = [
	/* eXBuilder6 런타임 CSS */
	"runtime/css/cleopatra.css",
	
	/* 프로젝트 CSS */
	"./theme/cleopatra-theme.css",
	"./theme/custom-theme.css",
	
	/* eXBuilder6 런타임 스크립트 */
	"runtime/cleopatra.js",
	
	/* 프로젝트 표준 기본속성 및 상수 정의 파일 */
	"runtime/defaults.js"
];

function loadLinks(links){
	var navigationStart = window.performance.timing.navigationStart;
	var currentTime = navigationStart + "." + window.performance.now();
	
	for(var i = 0; i < links.length; i++){
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		
		var bCacheListPresence = false;
		
		var sScriptVersion = "";
		for(var j = 0; j < aExbScriptUrl.length; j++){
			var sScriptUrl = aExbScriptUrl[j];
			if(sScriptUrl == links[i]){
				sScriptVersion = EXB6_VERSION;
				bCacheListPresence = true;
			}
		}
		
		if(bCacheListPresence){
			link.href = links[i] + "?v=" + sScriptVersion;
		}else{
			link.href = links[i] + "?p=" + currentTime;
		}
		
		document.head.appendChild(link);
	}
}

function loadScripts(scripts, index, callback) {
	var navigationStart = window.performance.timing.navigationStart;
	var currentTime = navigationStart + "." + window.performance.now();
	
	var scriptsLen = scripts.length;
	var script = document.createElement("script");
	script.type = "text/javascript";
	
	if (scripts[index].indexOf("cleopatra.js") > -1) {
		script.id = "eXbuilder6";
	}
	
	var bCacheListPresence = false;
	
	var sScriptVersion = "";
	for(var i = 0; i < aExbScriptUrl.length; i++){
		var sScriptUrl = aExbScriptUrl[i];
		if(sScriptUrl == scripts[index]){
			sScriptVersion = EXB6_VERSION;
			bCacheListPresence = true;
		}
	}
	
	if(scripts[index].indexOf("/thirdparty/") > -1){ // 외부 라이브러리
		script.src = scripts[index];
	}else{
		if(bCacheListPresence){
			script.src = scripts[index] + "?v=" + sScriptVersion;
		}else{
			script.src = scripts[index] + "?p=" + currentTime;
		}
	}
	
	script.onload = function(){
		if(scriptsLen == index+1){
			callback();
		}else{
			loadScripts(scripts, ++index, callback);
		}
	};
	
	document.head.appendChild(script);
}

