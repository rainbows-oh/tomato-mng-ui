/************************************************
 * util.module.js
 * @프로그램설명 : 문자열, 숫자, Null 체크 등의 각종 유틸 클래스가 있는 모듈
 *
 * @작성일자 : 2021. 10. 15
 * @작성자 :
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/**
 * @class AppUtil AppInstance에 대한 유틸
 */
AppUtil = {
    /**
     * 해당 앱의 속성(Property)값을 할당한다.
     * @param {cpr.core.AppInstance} app 앱인스턴스 객체
	 * @param {String | Object} propertyName App 속성
	 * @param {String | Object} value App 속성값
	 * @param {boolean} pbEvent =`true` value-change 이벤트 발생여부
	 * @return void
     */
    setAppProperty : function (app, propertyName, value, pbEvent) {
    	pbEvent = pbEvent == null ? true : pbEvent;
    	
        /** @type cpr.core.AppInstance */
        var _app = app;
        var hostApp = _app.getHostAppInstance();
        var property = _app.getAppProperty(propertyName);
        if(hostApp && hostApp.lookup(property) && hostApp.lookup(property) instanceof cpr.controls.UIControl){
        	if(pbEvent){
        		hostApp.lookup(property).value = value;
        	}else{
        		hostApp.lookup(property).putValue(value);
        	}
        }else{
        	_app.setAppProperty(propertyName, value);
        	
        	//그룹에 임베디드된 경우라면... 해당 그룹을 redraw()해준다.
        	if (app.getHost().getParent() && app.getHost().getParent().type == "container") {
        		app.getHost().getParent().redraw();
        	}
        }
    },
    
    /**
     * UDC 컨트롤에 대해 value 앱 속성에 바인딩된 컨트롤 객체를 반환한다.
     * @param {cpr.controls.UIControl} poCtrl
     */
    getUDCBindValueControl : function(poCtrl){
    	var vcBindCtrl = poCtrl;
    	var embApp = poCtrl.getEmbeddedAppInstance();
		embApp.getContainer().getChildren().some(function(embCtrl){
			if(embCtrl.type == "container"){
				embCtrl.getChildren().some(function(subembCtrl){
					if(subembCtrl.getBindInfo("value") && subembCtrl.getBindInfo("value").property == "value"){
						vcBindCtrl = subembCtrl;
						return true;
					}
				});
			}else{
				if(embCtrl.getBindInfo("value") && embCtrl.getBindInfo("value").property == "value"){
					vcBindCtrl = embCtrl;
					return true;
				}
			}
		});
		
		return vcBindCtrl;
    }
 };

/**
 * @class ValueUtil Value 체크 및 형 변환
 */
ValueUtil = {
    /**
     * 해당 값이 Null인지 여부를 체크하여 반환한다.
	 * @param {String | Object} puValue 값
	 * @return {Boolean} Null 여부
     */
    isNull : function (puValue) {
        return (this.fixNull(puValue) == "");
    },

    /**
     * 해당 값이 숫자(Number) 타입인지 여부를 반환한다.
	 * @param {Number | String} puValue	값
	 * @return {Boolean} Number인지 여부
	 * @example ValueUtil.isNumber("1234.56") == true
     */
    isNumber : function (puValue) {
        var vnNum = Number(puValue);
        return isNaN(vnNum) == false;
    },
    
    /**
	 * 해당 값이 숫자(Number) 타입인지 여부를 반환한다.<br>
	 * 숫자일 경우, 기존 값과 비교 시 동일하지 않을 경우에는 false 를 반환한다.	
	 * <pre>
	 * <code>ValueUtil.isNumberStrict("1234.56") // true
	 * ValueUtil.isNumberStrict("00001") // false
	 * </code></pre>
	 * @param {Number | String} puValue		값
	 * @return {Boolean} Number인지 여부
	 * @example ValueUtil.isNumberStrict("1234.56") == true / ValueUtil.isNumberStrict("00001") == false
	 */
	isNumberStrict: function(puValue) {
		var vnNum = Number(puValue);
		return (isNaN(vnNum) == false && vnNum.toString() == puValue);
	},
	
	/**
     * 해당 값이 boolean 타입인지 여부를 반환한다.
	 * <pre>
	 * <code>ValueUtil.isBoolean(false) // true
	 * </code></pre>
     * @param {Boolean | Object} puValue		값
     * @return {Boolean} Boolean인지 여부
     * @example ValueUtil.isBoolean(false) == true
     */
    isBoolean: function(puValue) {
        if (typeof(puValue) == "boolean" || puValue instanceof Boolean) return true ;
        else return false ;
    },
    
    /**
     * 해당 값의 Array 여부를 반환한다.
     * @param {Object} puValue 값
     * @return {Boolean} Array인지 여부
     */
    isArray: function(puValue) {
	    return puValue instanceof Array;
	},
	
	/**
	 * 파일명(문자열)에 특수문자가 포함되었는지 여부를 반환한다.
	 * @param {String} psValue 파일명
	 * @return {Boolean} 특수문자가 포함된 경우 false 리턴
	 */
	isFileSpecChar: function(psValue) {
		if(this.isNull(psValue)) return false;
		var vsSpecialChar = /[\/?,;:|*~`!^+<>@#$%^\\\=\'\"]/gi;
		
		if (!vsSpecialChar.test(psValue)) {
			return true;
		} else {
			return false;
		}
	},
	
	/**
	 * 해당 값이 정수/실수 인지 여부를 반환한다.
	 * <pre><code>
	 *  ValueUtil.isInteger(1234) //true
	 * </code></pre>
	 * @param {Number} pnValue 값
	 * @return {Boolean} 정수인지 여부
	 * @example ValueUtil.isInteger(1234) == true
	 */
	isInteger: function(pnValue) {
		var vnNum = this.fixNumber(pnValue);
		return vnNum % 1 === 0;
	},
	
	/**
	 * 해당 문자로 시작하는지 여부 반환 <br>
	 * - 주의사항 : null 은 false 리턴
	 * <pre>
	 * <code>
	 *  ValueUtil.isStartWith("aaaabbbbb","aaa") // true
	 * </code>
	 * </pre>
	 * @param {String} psValue 값
	 * @param {String} psFindStr 찾고자하는 문자/문자열
	 * @param {Boolean} pbIgnoreCase? =`false`대소문자 구분할지 여부<br/>true면 대소문자를 구분한다.
	 * @return {Boolean} psFindStr 로 시작하는 문자열인지 여부
	 */
	isStartWith: function(psValue, psFindStr, pbIgnoreCase) {
		var vsSourceTxt = this.fixNull(psValue, null, false);
		var vsFindStr = this.fixNull(psFindStr, " ", false);
		if(vsFindStr == "") vsFindStr = " ";
		
		var vbIgnoreCase = (pbIgnoreCase == null || pbIgnoreCase == undefined) ? false : pbIgnoreCase;
		if(!vbIgnoreCase) { 
			vsSourceTxt = vsSourceTxt.toLowerCase();
			vsFindStr = vsFindStr.toLowerCase();
		}
		
		return vsSourceTxt.indexOf(vsFindStr) == 0;
	},
	
	/**
	 * 해당 문자로 끝나는지 확인한다.
	 * <pre><code>
	 *  ValueUtil.isEndWith("aaaabbbbb","bbbb") // true
	 * </code></pre>  
	 * @param {String} psValue 값
	 * @param {String} psFindStr 찾고자하는 문자/문자열
	 * @param {Boolean} pbIgnoreCase? =`false` 대소문자 구분할지 여부<br/>true면 대소문자를 구분한다.
	 * @return {Boolean} psFindStr 로 끝나는 문자열인지 여부
	 */
	isEndWith: function(psValue, psFindStr, pbIgnoreCase) {
		var vsSourceTxt = this.fixNull(psValue, null, false);
		var vsFindStr = this.fixNull(psFindStr, " ", false);
		if (vsFindStr == "") vsFindStr = " ";
		
		var vbIgnoreCase = (pbIgnoreCase == null || pbIgnoreCase == undefined) ? false : pbIgnoreCase;
		if (!vbIgnoreCase) {
			vsSourceTxt = vsSourceTxt.toLowerCase();
			vsFindStr = vsFindStr.toLowerCase();
		}
		
		var vnPos = vsSourceTxt.lastIndexOf(vsFindStr);
		if (vnPos < 0) return false;
		
		var vnTotLength = vsSourceTxt.length;
		if ((vnTotLength - vnPos) == vsFindStr.length) return true;
		
		return false;
	},
    
    /**
     * 해당 문자를 갖고있는지 확인한다. 
     * <pre><code>
     * ValueUtil.isHaveStr("aaaabbbbb","bbbb") // true  
     * </code></pre>
     * @param {String} psSource 값
     * @param {String} psFindStr 찾고자하는 문자/문자열
     * @param {Boolean} pbIgnoreCase? =`false`대소문자 구분할지 여부<br/>true면 대소문자를 구분한다.
     * @return {Boolean} psFindStr 이 문자열에 포함되어 있는지 여부
     */
    isHaveStr: function(psSource, psFindStr, pbIgnoreCase) {
    	var vsSourceTxt = this.fixNull(psSource, null, false);
    	var vsFindStr = this.fixNull(psFindStr, " ", false);
    	if (vsFindStr == "") vsFindStr = " ";
    	
    	var vbIgnoreCase = (pbIgnoreCase == null || pbIgnoreCase == undefined) ? false : pbIgnoreCase;
		if (!vbIgnoreCase) {
			vsSourceTxt = vsSourceTxt.toLowerCase();
			vsFindStr = vsFindStr.toLowerCase();
		}
    	
    	var vnPos = vsSourceTxt.lastIndexOf(vsFindStr);
    	return vnPos > -1;
    },
    
    /**
     * 화면에서 보여주고 있는지 상태를 리턴한다.<br/>
     * 자신을 포함하는 모든 부모의 visible 상태가 false인 경우 false를 반환된다.<br/>
     * <pre><code>
     * ValueUtil.isHTMLVisible(app.lookup("btn1")) // true
     * </pre></code>
     * @param {cpr.controls.UIControl} pcCtrl UI컨트롤
     * @return {Boolean} 화면에 컨트롤이 보여지는지 여부
     */
    isHTMLVisible : function (pcCtrl){
    	return pcCtrl.isShowing();
    },
    
    /**
     * 해당 값에 대한 문자열을 반환한다. <br/>
     * 만약 해당값이 null이거나 정의되지 않은 경우, 대체문자 혹은 공백("") 문자열을 반환한다.
     * @param {String | Object} puValue	값
     * @param {String} puAlterValue? 대체문자
     * @param {Boolean} pbTrimValue? =`true` 입력 값(puValue) 의 값을 trim 할 지 여부<br/>true 일 경우에 trim 한다
     * @return {String} 문자열 String
     */
    fixNull: function(puValue, puAlterValue, pbTrimValue) {
    	
    	var vbTrimValue = (pbTrimValue == null || pbTrimValue == undefined) ? true : pbTrimValue;
    	if(vbTrimValue) {
	    	var vsType = typeof(puValue);
	    	if (vsType == "string" || (vsType == "object" && puValue instanceof String)) {
	    		puValue = this.trim(puValue);
	    	}
    	}
    	
    	var vsAlterStr = "";
    	if (puAlterValue == null || puAlterValue == "null" || puAlterValue == "undefined" || puAlterValue == undefined) {
    		vsAlterStr = "";
    	} else {
    		vsAlterStr = puAlterValue;
    	}
    	
    	return (puValue == null || puValue == "null" || puValue == "undefined" || puValue == undefined) ? vsAlterStr : String(puValue);
    },
    
    /**
     * 해당 값을 불리언(Boolean) 타입으로 변환한다.
	 * @param {Boolean | Object} puValue 값
	 * @return {Boolean} 불리언 유형으로 반환
     */
    fixBoolean : function (puValue) {
        if (typeof(puValue) == "boolean" || puValue instanceof Boolean) {
            return puValue;
        }
        if (typeof(puValue) == "number" || puValue instanceof Number) {
            return puValue != 0;
        }
        return (this.fixNull(puValue).toUpperCase() == "TRUE");
    },

    /**
     * 해당 값을 숫자(Number) 타입으로 변환한다.
	 * @param {Object} puValue 값
	 * @return {Number} 숫자 타입으로 반환
     */
    fixNumber : function (puValue) {
        if (typeof(puValue) == "number" || puValue instanceof Number) {
            return puValue;
        }
        var vnNum = Number(this.fixNull(puValue));
        return isNaN(vnNum) ? 0 : vnNum;
    },
    
    /**
     * 해당 값을 숫자(Float) 타입으로 변환한다.
	 * @param {Object} puValue 값
	 * @return {Float} 소수점이 있는 숫자 타입으로 반환
     */
    fixFloat : function (puValue) {
        if (typeof(puValue) == "number" || puValue instanceof Number) {
            return puValue;
        }
        var vnFloat = parseFloat(this.fixNull(puValue));
        return isNaN(vnFloat) ? 0 : vnFloat;
    },
    
    /**
	 * nvl(puValue, puDefalt)
	 * 입력값이 null 일때, Defalt value 를 return 한다.
	 * @param {any} puValue 체크대상 값
	 * @param {any} puDefalt 기본값
	 * @return {any} 처리된 값
	 */
	nvl: function(puValue, puDefalt) {
		return (this.isNull(puValue)) ? puDefalt : puValue;
	},
    /**
     * 해당 값의 앞/뒤 공백을 제거한 문자열을 반환한다.
	 * @param {String} psValue 값
	 * @return {String} 공백 제거된 문자열
     */
    trim : function (psValue) {
        return psValue == null ? psValue : psValue.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'');
    },
    
    /** 
     * 문자열의 좌측 공백(psReplaceValue)을 제거 
     * @param {String} psValue 대상 
     * @param {String} psReplaceValue? =`" "` 제거대상 문자
     * @return {String} 공백(or 제거대상 문자) 제거된 문자열
     */
    lTrim: function(psValue, psReplaceValue) {
    	
    	psValue = this.fixNull(psValue, null, false);
    	if (psValue == "") return "";
    	
    	psReplaceValue = this.fixNull(psReplaceValue, " ", false);
    	if(psReplaceValue.length < 1) psReplaceValue = " ";
    	
    	var vnPos;
    	for (vnPos = 0; vnPos < psValue.length; vnPos += psReplaceValue.length) {
    		if (psValue.substr(vnPos, psReplaceValue.length) != psReplaceValue) {
    			break;
    		}
    	}
    	
    	return psValue.substr(vnPos);
    },
	
	/** 
	 * 문자열의 우측 공백(psReplaceValue)을 제거 
	 * @param {String} psValue  대상 
	 * @param {String} psReplaceValue? =`" "` 제거대상 문자
	 * @return {String} 공백(or 제거대상 문자) 제거된 문자열
	 */
	rTrim: function(psValue, psReplaceValue) {
		
		psValue = this.fixNull(psValue, null, false);
		if (psValue == "") return "";
		
		psReplaceValue = this.fixNull(psReplaceValue, " ");
		if (psReplaceValue.length < 1) psReplaceValue = " ";
		
		var vnPos;
		for (vnPos = psValue.length - psReplaceValue.length; vnPos >= 0; vnPos -= psReplaceValue.length) {
			if (psValue.substr(vnPos, psReplaceValue.length) != psReplaceValue) {
				break;
			}
		}
		
		return psValue.substr(0, vnPos + psReplaceValue.length);
	},
	
	/** 
	 *  전체 문자길이가 되도록 좌측에 대체문자를 채운다.<br>
	 * <pre><code>
	 *  ValueUtil.lPad( "1" , "0" , 3) // "001"
	 *  ValueUtil.lPad( "1" , " " , 3) // "  1"	
	 * </code></pre>
	 * @param {String} psValue  값
	 * @param {String} psReplaceValue 대체문자
	 * @param {Number} pnTotLength  전체 문자길이  
	 * @return {String} pad 가 된 문자 
	 */
	lPad: function(psValue, psReplaceValue, pnTotLength) {
		
		psValue = this.fixNull(psValue, null, false);
		psReplaceValue = this.fixNull(psReplaceValue, " ", false);
		pnTotLength = this.fixNumber(pnTotLength);
		
		if (pnTotLength < 1) return psValue;
		
		for (var i = 0, size = pnTotLength - psValue.length; i < size; i++) {
			psValue = psReplaceValue + psValue;
		}
		
		if(psValue.length > pnTotLength) {
			psValue = psValue.substr(psValue.length - pnTotLength, psValue.length);	
		}
		
		return psValue;
	},
	
	/** 
	 *  전체 문자길이가 되도록 만큼 우측에  대체문자를 체운다.
	 * <pre><code>
	 *  ValueUtil.rPad( "1" , "0" , 3); // "100"
	 *  ValueUtil.rPad( "1" , " " , 3); // "1  "
	 * </code></pre>
	 * @param {String} psValue  값 
	 * @param {String} psReplaceValue 대체문자  
	 * @param {Number} pnTotLength  전체 문자길이  
	 * @return {String} pad가 된 문자 
	 */
	rPad: function(psValue, psReplaceValue, pnTotLength) {
		
		psValue = this.fixNull(psValue, null, false);
		psReplaceValue = this.fixNull(psReplaceValue, " ", false);
		pnTotLength = this.fixNumber(pnTotLength);
		
		if (pnTotLength < 1) return psValue;
		
		for (var i = 0, size = pnTotLength - psValue.length; i < size; i++) {
			psValue = psValue + psReplaceValue;
		}
		
		if(psValue.length > pnTotLength) {
			psValue = psValue.substr(0, pnTotLength);	
		}
		
		return psValue;
	},
    
    /**
     * 문자열을 split한 배열을 반환한다.
	 * @param {String} psValue split 대상 문자열
	 * @param {String} psDelemeter 구분문자 (ex: 콤마(,))
	 * @return {Array} 문자열 배열
     */
    split : function (psValue, psDelemeter) {
    	psValue = this.fixNull(psValue);
        var vaValues = new Array();
        var vaTemp = psValue.split(psDelemeter);
        var _this = this;
        vaTemp.forEach(function(/* eachType */ item){
        	vaValues.push(_this.trim(item));
        });
        
        return vaValues;
    },
    
    /**
     * 문자열에서 패턴(psPattern) 이 대체 문자열(psReplaceTxt)로 전부 변경된 새 문자열을 리턴한다.
     * <pre><code>
     * ValueUtil.replaceAll( "t-o-m-a-t-o" , "-" , "") //"tomato"
     * </pre></code>
     * @param {String} psSource 원본 문자열 
     * @param {String} psPattern 변경할 문자열
     * @param {String} psReplaceTxt 대체 문자열
     * @return {String} 변경된 문자열
     */
    replaceAll: function(psSource, psPattern, psReplaceTxt) {
    	
    	if (psSource == null || psSource == "") return psSource;
    	if (psPattern == null || psPattern == "") return psSource;
    	
    	var vaResult = psSource.split(psPattern);
    	return vaResult.join(psReplaceTxt);
    },
    
    /**
     * 문자열 데이터의 길이(length)를 반환한다.
	 * @param {String} value 값
	 * @param {"char" | "utf8" | "ascii"} unit? 단위<br/>
     * [char] : 문자의 길이.<br/>
 	 * [utf8] : utf8 기준의 문자 byte size.<br/>
 	 * [ascii] : ascii 기준의 문자 byte size.
	 * @return {Number} 문자열 길이
     */
    getLength : function(value, unit) {
    	if(!unit) unit = "char";
    	
		var length = 0;
		switch(unit) {
			case "utf8":{
				for(var i=0, len=value.length; i<len; i++) {
				    if(escape(value.charAt(i)).length >= 4) {
				        length += 3;
				    } else if(escape(value.charAt(i)) == "%A7") {
				        length += 3;
				    } else if(escape(value.charAt(i)) != "%0D") {
				        length++;
				    } else {
				    	length++;
				    }
				}
				break;
			}
			case "ascii":{
				for(var i = 0, c; c = value.charAt(i++); length += c >> 7 ? 2 : 1);
				break;
			}
			default : {
				length = value.length;
			}
		}
		
		return length;
    },
    /**
	 * 주어진 문자열의 바이트 길이를 계산하여 반환.
	 * 이 함수는 문자열 내 각 문자의 유니코드 값에 따라
	 * ASCII 문자는 1바이트로, 그 외의 문자는 2바이트로 계산.
	 * @param {String} _str 계산할 문자열.
	 * @return {Number} 문자열의 총 바이트 길이.
	 */
    getByteLength: function(/*String*/_str){
    	var stringByteLength = 0;
    	stringByteLength = (function(s,b,i,c){
		    for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?2:c>>7?2:1);
		    return b;
		})(_str);

		return stringByteLength;
    },
    
    	/**
	 * 숫자 마스킹 처리 함수
	 * (뒷 pnStart번자리 부터 pnCount 개 마스킹) </br>
	 * (pnStart : 1, pnCount : 4 입력시 뒤에 숫자 1번째 부터 4개의 숫자 마스킹) </br>
	 * @param {String} psData 데이터
	 * @param {Number} pnStart 뒤에 시작 인덱스
	 * @param {Number} pnCount 마스킹 카운트
	 * @param {Boolean} pbRvrs =`true` false 시 앞자리 pnStart 부터 마스킹
	 * @return {String} 마스킹된 숫자 반환
	 */
    setNumberMask : function(psData, pnStart, pnCount, pbRvrs){
    	
    	// default 셋팅
		pbRvrs = pbRvrs == null ? true : pbRvrs;
	
		var aData =  [];
		var aReturn  =  [];
	
		aData = psData.split("");
	
		var nDecCnt = 0; // 암호화된 개수
		var nNumber = 0; // 숫자 개수
	
		// true 시, 뒷자리부터 마스킹.
		if (pbRvrs) {
			aData.reverse();
		}
	
		aData.forEach(function(psChar){
			if (psChar != " " && !isNaN(psChar)) {
				nNumber++;
			}
	
			// 뒤에서 pnStart번 자리 부터, pnCount 개 마스킹
			if (nNumber > pnStart && nDecCnt < pnCount && !isNaN(psChar) && psChar != " ") {
				nDecCnt++;
				psChar = "*";
		    }
	
		    aReturn.push(psChar);
		});
	
		// reverse 하여 마스킹해서, 다시 reverse 후 return
		if (pbRvrs) {
			aReturn.reverse();
		}
	
		return aReturn.join("");
    },
    
    /**
     * 파일명의 length를 체크한다. 
     * @param {String} psValue 파일명
     * @param {Number} pnTotLength 최대 파일명 length
     * @return {Boolean} 파일명 길이가 최대 길이(pnTotLength) 이상이면 false 리턴
     */
    fileNameLengthChk: function(psValue, pnTotLength) {
    	if (this.isNull(psValue) || this.isNull(pnTotLength)) return false;
    	
    	pnTotLength = this.fixNumber(pnTotLength);
    	if (this.getLength(psValue) > pnTotLength) {
    		return false;
    	} else {
    		return true;
    	}
    },
    
    /**
	 * 입력값을 마스킹한다
     * @exmple  var sMaskValue  = ValueUtil.maskType("ACCOUNT","1234567809"))
	 * @param {"PHILSYS"|"ACCOUNT"|"EMAIL"|"ADDRESS"|"PASSPORT"|"CARD" |"NAME"} psType String			-Data Type<br>
				'PHILSYS' 	: 필리핀 국가 식별 번호 (12자리 PSN / 16자리 PCN)<br>
				'ACCOUNT' 	: 은행계좌번호<br>
				'EMAIL' 	: 이메일<br>
				'ADDRESS' 	: 주소   (,콤마 기준으로 이후값 마스킹)<br>
				'PASSPORT'  : 여권번호<br>
			    'CARD'      : 카드번호<br>
                'NAME'      : 이름<br>
	 * @param  {String} sourceData 입력값(String value)
	 * @return String    마스킹된 결과값
	 */
	maskType: function(psType, sourceData) {
		// "개인정보 암호화(마스킹)" 페이지 기준.
		// 필리핀 국가 식별 번호 (12자리 PSN / 16자리 PCN) : 1234******12, 1234********3456
		// 은행계좌번호 : 뒤 6자리~2자리. 예시 > 12345****9
		// E-Mail : 뒤 3자리. 예시> abc***@hanwha.com
		// 주소 : 세부주소. 예시 > 서울시 영등포구 여의도동 63 *****
		// 여권번호: 발급 일련번호 뒤 4자리 > P1234567A -> P1234****
		// 카드번호 : 14~16 자리에 따라 4~6개 마스킹 예시 > 1234-56**-****-3456, 1234-56****-*2345, 1234-56****-1234
		// 이름  : 한글은 첫자와 마지막자를 제외한 *

		var data = this.trim(String(sourceData));
		if( this.isNull(data) ){
			return this.fixNull(data);
		}

		var sReturnValue = "";
		var pattern      = "";
				
		switch (psType.toUpperCase()) {

			case 'PHILSYS': // 필리핀 국가 식별 번호 (12자리 PSN / 16자리 PCN)
		        var sDataPhilSys = data.replace(/[\-\s]/g, ""); // 하이픈 및 공백 제거

		        if (sDataPhilSys.length === 12) {
		            // 12자리 PSN: 앞 4자리, 뒤 2자리 남기고 중간 6자리 마스킹
		            // 예: 123456789012 -> 1234******12
		            sReturnValue = this.setNumberMask(data, 4, 6);
		        } else if (sDataPhilSys.length === 16) {
		            // 16자리 PCN: 앞 4자리, 뒤 4자리 남기고 중간 8자리 마스킹
		            // 예: 1234567890123456 -> 1234********3456
		            sReturnValue = this.setNumberMask(data, 4, 8);
				}
				break;

			case 'ACCOUNT': //계좌번호 (뒤 6~2자리. 5개 숫자 마스킹)
				// 10~14 자리수내에서 마스킹
				var sDataAccount = data.replace(/-/g, "");
				if (sDataAccount.length > 9 && sDataAccount.length < 15) {
					sReturnValue = this.setNumberMask(data, 1, 5);
				}
				break;

			case 'EMAIL': //이메일 (이메일 아이디 뒤 3자리 마스킹)
				pattern =/^([a-zA-Z0-9._-]+)([a-zA-Z0-9._-]{3})@([a-zA-Z0-9._-]+)[.]([a-zA-Z0-9._-]+)$/;
				if(pattern.test(data)){
					sReturnValue = data.replace(pattern,"$1***@$3.$4");
				}
				break;

			case 'ADDRESS': //주소
				// 뒷자리 * 5개로 표현  (2020.7.1)
				var aData = data.split(",");
				sReturnValue = aData[0] + " *****";
				break;

			case 'PASSPORT': //여권번호
				var oPhilPattern = /^([a-zA-Z]{1}[0-9]{4})([0-9]{3}[a-zA-Z]{1})$/; // 여권번호 ex ) P1234567A

				if (oPhilPattern.test(data)) {
					sReturnValue = data.replace(oPhilPattern , "$1****");
				}

				break;

			case 'CARD': // 카드번호
				var pattern_14 = /^([0-9]{4})(-*)([0-9]{2})([0-9]{4})(-*)([0-9]{4})$/;
				var pattern_15 = /^([0-9]{4})(-*)([0-9]{2})([0-9]{4})(-*)([0-9]{1})([0-9]{4})$/;
				var pattern_16 = /^([0-9]{4})(-*)([0-9]{2})([0-9]{2})(-*)([0-9]{4})(-*)([0-9]{4})$/;

				if (pattern_14.test(data)){
					sReturnValue = data.replace(pattern_14,"$1-$3****-$6");
				} else if (pattern_15.test(data)){
					sReturnValue = data.replace(pattern_15,"$1-$3****-*$7");
				} else if (pattern_16.test(data)){
					sReturnValue = data.replace(pattern_16,"$1-$3**-****-$8");
				}

				break;
			case 'NAME' :
					var names = data.split(" ");
					var lastName = "";
					var maskedName = "";

                    if ( names.length > 1 ){
                        lastName = names.pop(); //성
                    }

					names = names.map(function(name){   //First Name, Middle Name

						//#5141 정규식"((?<="로 인한 ie오류로 인하여 수정처리(2021.06.18)
						var stReplaceIdx = name.length - Math.ceil(name.length / 2);  //replace 시작위치
						var sMaskName = name.substr(0, stReplaceIdx);
						var nMaskCnt  = name.length - stReplaceIdx;

                        for (var idx = 0; idx < nMaskCnt; idx++) {
                            sMaskName = sMaskName + "*";
                        }

						return sMaskName;
					});

					names.forEach(function(each, i){
						maskedName += each + " ";
					});
					maskedName +=  lastName;

					return maskedName;

				break;
			default :
				break;	// sReturnValue가 ""이기 때문
		}

		// sReturnValue 가 없을 경우 사용자가 입력한 data 리턴되게 변경.
		// 마스킹 형식과 일치하지 않은 경우, 마스킹 처리되지 않아서 sReturnValue 가 빈값.
		if (sReturnValue == "") {
			sReturnValue = data;
		}

		return sReturnValue;
	},
	
	/**
	 * n개의 object를 하나로 병합한 object를 반환한다.<br>
	 * 동일한 키(key)가 존재하면 기존 키의 값은 덮어쓰기(overwrite) 된다.<br>
	 * 1개의 object만 파라미터로 지정하면 복제된 object를 리턴한다.
	 * @param {Object} 병합 할 객체
	 * @return {Obejct} 병합 된 객체
	 */
	merge : function() {
		var args = Array.prototype.slice.call(arguments);
		var length = args.length;
		
		function isArray(obj){
			return Object.prototype.toString.call(obj) === '[object Array]';
		}
		
		function isPlainObject(obj){
			return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
		}
		
		var result;
		if(isArray(args[0])){
			result = [];
			for(var i = 0; i < length; i++){
				var arr = args[i];
				for(var j = 0, arrLength = arr.length; j < arrLength; j++){
					var item = arr[j];
					result.push(isArray(item) || isPlainObject(item) ? this.merge(item) : item);
				}
			}
		}else{
			result = {};
			for(var k = 0; k < length; k++){
				var obj = args[k];
				for(var prop in obj){
					if(Object.prototype.hasOwnProperty.call(obj, prop)){
						var value = obj[prop];
						result[prop] = (isArray(value) || isPlainObject(value) ? this.merge(value) : value);
					}
				}
			}
		}
		
		return result;
	}
 };

var _holiday = {
	"0101" : "New Year's Day",
	"0409" : "Araw ng Kagitingan",
	"0501" : "Labor Day",
	"0612" : "Independence Day",
	"1130" : "Bonifacio Day",
	"1225" : "Christmas Day",
	"1230" : "Rizal Day"
}

/**
 * @class 날짜 유틸 클래스
 */
DateUtil = {
	/**
     * 날짜를 지정한 패턴의 문자열로 반환한다.
	 * @param {Date} poDate	날짜
	 * @param {String} psPattern 포맷 문자열(ex: YYYYMMDD)
	 * @param {String} psShowPattern 포맷 문자열(ex: YYYYMMDD, MON:July, mon:Jul, DAY:Sunday, day:Sun)
	 * @return {String} 날짜 문자열
     */
    formatDate : function (psDate, psPattern, psShowPattern) { 
		var date = this.toDate(psDate, psPattern);
		var formatDate = this.format(date, psShowPattern);
		return formatDate;
    },
	
    /**
     * 날짜를 지정한 패턴의 문자열로 반환한다.
	 * @param {Date} poDate	날짜
	 * @param {String} psPattern 포맷 문자열(ex: YYYYMMDD)
	 * @return {String} 날짜 문자열
     */
    format : function (poDate, psPattern) { // dateValue As Date, strPattern As String
        var CAL_INITIAL = {
		    MONTH_IN_YEAR :         ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		    SHORT_MONTH_IN_YEAR :   ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		    DAY_IN_WEEK :           ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"],
		    SHORT_DAY_IN_WEEK :     ["Sun", "Mon", "Tue", "Wed","Thu", "Fri", "Sat"]
		};
        
        var year      = poDate.getFullYear();
	    var month     = poDate.getMonth() + 1;
	    var day       = poDate.getDate();
	    var dayInWeek = poDate.getDay();
	    var hour24    = poDate.getHours();
	    var ampm      = (hour24 < 12) ? "AM" : "PM";
	    var hour12    = (hour24 > 12) ? (hour24 - 12) : hour24;
	    var min       = poDate.getMinutes();
	    var sec       = poDate.getSeconds();
	
	    var YYYY = "" + year;
	    var YY   = YYYY.substr(2);
	    var MM   = (("" + month).length == 1) ? "0" + month : "" + month;
	    var MON  = CAL_INITIAL.MONTH_IN_YEAR[month-1];
	    var mon  = CAL_INITIAL.SHORT_MONTH_IN_YEAR[month-1];
	    var DD   = (("" + day).length == 1) ? "0" + day : "" + day;
	    var DAY  = CAL_INITIAL.DAY_IN_WEEK[dayInWeek];
	    var day  = CAL_INITIAL.SHORT_DAY_IN_WEEK[dayInWeek];
	    var HH   = (("" + hour24).length == 1) ? "0" + hour24 : "" + hour24;
	    var hh   = (("" + hour12).length == 1) ? "0" + hour12 : "" + hour12;
	    var mm   = (("" + min).length == 1) ? "0" + min : "" + min;
	    var ss   = (("" + sec).length == 1) ? "0" + sec : "" + sec;
	    var SS   = "" + poDate.getMilliseconds();
		
	    var dateStr;
	    var index = -1;
	    if (typeof(psPattern) == "undefined") {
	        dateStr = "YYYYMMDD";
	    } else {
	        dateStr = psPattern;
	    }
	
	    dateStr = dateStr.replace(/YYYY/g, YYYY);
	    dateStr = dateStr.replace(/yyyy/g, YYYY);
	    dateStr = dateStr.replace(/YY/g,   YY);
	    dateStr = dateStr.replace(/MM/g,   MM);
	    dateStr = dateStr.replace(/MON/g,  MON);
	    dateStr = dateStr.replace(/mon/g,  mon);
	    dateStr = dateStr.replace(/DD/g,   DD);
	    dateStr = dateStr.replace(/dd/g,   DD);
	    dateStr = dateStr.replace(/day/g,  day);
	    dateStr = dateStr.replace(/DAY/g,  DAY);
	    dateStr = dateStr.replace(/hh/g,   hh);
	    dateStr = dateStr.replace(/HH/g,   HH);
	    dateStr = dateStr.replace(/mm/g,   mm);
	    dateStr = dateStr.replace(/ss/g,   ss);
	    dateStr = dateStr.replace(/(\s+)a/g, "$1" + ampm);
	
	    return dateStr;
    },

    /**
     * 올바른 날짜인지를 체크한다.
	 * @param {Number | String} puYear 년도
	 * @param {Number | String} puMonth	월
	 * @param {Number | String} puDay 일
	 * @return {Boolean} 유효한 날짜인지 여부
    */
    isValid : function (puYear, puMonth, puDay) {
    	var pnYear = Number(puYear);
    	var pnMonth = Number(puMonth);
    	var pnDay = Number(puDay);
        var vdDate = new Date(pnYear, pnMonth-1, pnDay);
        return vdDate.getFullYear() == pnYear      &&
               vdDate.getMonth   () == pnMonth - 1 &&
               vdDate.getDate    () == pnDay;
    },

    /**
     * 현재 날짜에 해당 날짜만큼 더한 날짜를 반환한다.
	 * @param {String} psDate 날짜 문자열(format : YYYYMMDD)
	 * @param {Number} pnDayTerm 추가 일수
	 * @return {String} 날짜 문자열
    */
    addDate : function (psDate, pnDayTerm) {
    	var pnYear 	= Number(psDate.substring(0,4));
    	var pnMonth = Number(psDate.substring(4,6));
    	var pnDay 	= Number(psDate.substring(6,8));

    	if (this.isValid(pnYear, pnMonth, pnDay)) {
	    	var vdDate = new Date(pnYear, pnMonth-1, pnDay);
	    	var vnOneDay = 1*24*60*60*1000 ; /* 1day,24hour,60minute,60seconds,1000ms */
	    	
	    	var psTime = vdDate.getTime() + (Number(pnDayTerm)*Number(vnOneDay));
	    	vdDate.setTime(psTime);
	    	
	        return this.format(vdDate,"YYYYMMDD");
    	}else{
    		return psDate;
    	}
    },
    
    /**
     * 현재 날짜에 해당 월만큼 더한 날짜를 반환한다.
	 * @param {String} psDate 날짜 문자열(format : YYYYMMDD)
	 * @param {Number} pnAddMonth 추가 월
	 * @return {String} 날짜 문자열
    */
    addMonth : function (psDate, pnAddMonth) {

    	var pnYear 	= Number(psDate.substring(0,4));
    	var pnMonth = Number(psDate.substring(4,6));
    	var pnDay 	= Number(psDate.substring(6,8));

    	if (this.isValid(pnYear, pnMonth, pnDay)) {
    		
	    	var vdDate = new Date(pnYear, pnMonth-1, pnDay);
	    	
	    	vdDate = new Date(vdDate.setMonth(vdDate.getMonth() + Number(pnAddMonth)));	
	    	
	        return this.format(vdDate,"YYYYMMDD");
    	}else{
    		return psDate;
    	}
    },
    
    /**
     * 날짜 문자열을 Date형으로 변환하여 반환한다.
     * <pre><code>
     * DateUtil.toDate("2007-02-09","YYYY-MM-DD");
 	 * </code></pre>
	 * @param {Date} psDateTime	날짜
	 * @param {String} psPattern 포맷 문자열(ex: YYYY-MM-DD)
	 * @return {Date} 날짜(Date) 객체
	 * @example DateUtil.toDate("2007-02-09","YYYY-MM-DD")
     */ 
    toDate : function (psDateTime, psPattern) {
        var vdDate = new Date();
        var vnIdx, vnCnt;

        var vsaFmt = ["Y", "M", "D", "H", "m", "s", "S"];
        var vnFmtLen = vsaFmt.length;
        var vnPtnLen = psPattern.length;
        var vnaNums = [vdDate.getFullYear(), vdDate.getMonth()+1, vdDate.getDate(), vdDate.getHours(), vdDate.getMinutes(), vdDate.getSeconds(), vdDate.getMilliseconds()];

        for (var i = 0; i < vnFmtLen; i++) {
            vnIdx = psPattern.indexOf(vsaFmt[i]);
            if (vnIdx != -1) {
                vnCnt = 1;
                for (var j=vnIdx+1; j < vnPtnLen; j++) {
                    if (psPattern.charAt(j) != vsaFmt[i]) { break; }
                    vnCnt++;
                }
                vnaNums[i] = Number(psDateTime.substring(vnIdx, vnIdx+vnCnt));
            } else {
                if(i==0) vnaNums[0] = 1900;
                else if(i==2) vnaNums[2] = 01;
            }
        }

        if (vnaNums[0] < 1900) { // 년도는 검증
            if (vnaNums[0] <= vdDate.getFullYear() % 100) {
                vnaNums[0] += vdDate.getFullYear() - (vdDate.getFullYear() % 100);
            } else if (vnaNums[0] < 100) {
                vnaNums[0] += 1900;
            } else {
                vnaNums[0] = 1900;
            }
        }

        return new Date(vnaNums[0], vnaNums[1]-1, vnaNums[2], vnaNums[3], vnaNums[4], vnaNums[5], vnaNums[6]);
    },
    
	/**
     * 해당월의 마지막 일자를 반환한다.
     * <pre><code>
     * DateUtil.getMonthLastDay("20230201");<br>
     * 또는<br>
     * DateUtil.getMonthLastDay("20230301", -1);
 	 * </code></pre>
	 * @param {String} psDate 년월 문자열(format : YYYYMM, YYYYMMDD)
	 * @param {Number} pnAdd? +/- 월 수
	 * @return {Number} 일(Day)
     */ 
    getMonthLastDay : function (psDate, pnAdd) {
    	var pnYear 	= Number(psDate.substring(0,4));
    	var pnMonth = Number(psDate.substring(4,6));
        var vdDate = new Date(pnYear, pnMonth, 0, 1, 0, 0);
        if(pnAdd == null){
        	return vdDate.getDate();
        }else{
        	var vdDate2 = new Date(vdDate.getFullYear(), vdDate.getMonth()+1+pnAdd, 0, 1, 0, 0);
        	return vdDate2.getDate();
        }
    },

    /**
     * 두 날짜간의 일(Day)수를 반환한다.
	 * @param {String} psDate1st 날짜 문자열(format : YYYYMMDD)
	 * @param {String} psDate2nd 날짜 문자열(format : YYYYMMDD)
	 * @return {Number} 일수(Day)
     */
    getDiffDay : function (psDate1st, psDate2nd) {
    	var date1 = this.toDate(psDate1st, "YYYYMMDD");
    	var date2 = this.toDate(psDate2nd, "YYYYMMDD");
        
        return parseInt((date2 - date1)/(1000*60*60*24));
    },
    
    /**
     * 해당 날짜의 하루 전 날짜 반환한다.
     * @param {String} psDate 날짜 문자열(format : YYYYMMDD)
     */
    getBeforeDate : function(psDate){
    	var y = psDate.substring(0, 4);
		var m = psDate.substring(4, 6);
		var d = psDate.substring(6, 8);
		var befDt = new Date(y, m - 1, d - 1);
		var befDtYear = befDt.getFullYear().toString();
		var befDtMonth = new String(befDt.getMonth() + 1);
		var befDtDate = befDt.getDate().toString();
		
		if (befDtMonth.length == 1) befDtMonth = "0" + befDtMonth;
		if (befDtDate.length == 1) befDtDate = "0" + befDtDate;
		
		return befDtYear + befDtMonth + befDtDate + "000000";
    },
    
    /**
     * 입력받은 날짜에 시분초 문자열 000000을 붙여서 반환한다.
     * @param {String} psDate 날짜포맷 문자열
     */
    addZoreDate : function(psDate){
    	var dateString = psDate.substring(0, 8);
		dateString += "000000";
		return dateString;
    },
    
    /**
     * <pre><code>
     *  DateUtil.addMinutes("0900", 50);
     * </code></pre>
     * @param {String} psHHmm 특정분을 더할 시분 값
	 * @param {String} pnAddMinutes 더할 분
	 * @return {String} 시분(HHmm)
     */
    addMinutes : function (psHHmm, pnAddMinutes) {
    	var vdDate = DateUtil.toDate(psHHmm, "HHmm");
		vdDate.setMinutes(vdDate.getMinutes() + pnAddMinutes);
		
		var vnHours = vdDate.getHours();
		var vnMinutes = vdDate.getMinutes();
		
		var vsHours = "";
		var vsMinutes = "";
		
		if(vnHours < 10){
			vsHours = "0" + vnHours;
		}else{
			vsHours = vnHours + "";
		}
		
		if(vnMinutes < 10){
			vsMinutes = "0" + vnMinutes;
		}else{
			vsMinutes = vnMinutes + "";
		}
		
		return vsHours + vsMinutes;
    },
    /**
	 * 현재 시간을 밀리초 단위의 타임스탬프로 반환합니다.
	 * @return {Number} 현재 시간의 타임스탬프 (밀리초 단위).
	 */
    getCurrentTime : function() {
    	return new Date().getTime();
    },
    /**
     * 입력한 일자에 해당되는 요일을 반환한다.
     * <pre>
     * <code>DateUti.getDayOfWeek("20191120");
 	 * </code></pre>
	 * @param {String} psDate 일자 문자열(ex:20191120)
	 * @return {String} 요일
     */ 
    getDayOfWeek : function (psDate) {
    	
		var vsYear 	= psDate.substring(0,4);
		var vsMonth = psDate.substring(4,6);
		var vsDay 	= psDate.substring(6,8);
    	
    	// Date 객체 생성 (월은 0부터 시작하므로 month - 1)
    	var date = new Date(vsYear, vsMonth - 1, vsDay);
    	
		return date.toLocaleDateString('en-US', { weekday: 'short' });
    },
    
    /**
     * yyyyMMdd 형태의 문자열 날짜를 반환한다.
     * <pre>
     * <code>DateUtil.makeDate("2010", "05", "01"); // "20100501"
     * </code></pre>
     * @param {String | Number} pnYear	- Year : 년도
     * @param {String | Number} pnMonth	- Month : 월
     * @param {String | Number} pnDate	- Date : 일
     * @return {String} 날짜 문자열
     * @example : DateUtil.makeDate("2010", "05", "01");
     */
    makeDate: function(pnYear, pnMonth, pnDate) {
    	if (ValueUtil.isNull(pnYear) || ValueUtil.isNull(pnMonth) || ValueUtil.isNull(pnDate)) return "";
    	
    	var voNewDate = new Date(pnYear, pnMonth - 1, pnDate);
    	
    	var vsFullYear = voNewDate.getFullYear().toString();
    	var vsMonth = ValueUtil.lPad(voNewDate.getMonth() + 1, "0", 2);
    	var vsDate = ValueUtil.lPad(voNewDate.getDate(), "0", 2);
    	
    	return vsFullYear + vsMonth + vsDate;
    },
    
    /**
     * 현재일자를 입력한 format형식으로 반환한다.
     * <pre>
     * <code>DateUtil.getCurrentDay("YYYY-MM-DD");
     * </code></pre>
     * @param {String} psFormat format형식(예:YYYY-MM-DD", "YYYYMMDD", "YY-MM-DD", "YYMMDD", "YYYY-MM-DD HH:mm:ss")
     * @return {String} format에 해당하는 현재일자
     */
    getCurrentDay: function(psFormat) {
    	var now = new Date(this.getCurrentTime());
    	return this.format(now, psFormat);
    },
    
	/**
	 * 특정 연도의 부활절(주님 부활 대축일) 날짜를 반환한다.
	 * @param {String|Number} puYear 년도 문자열 (YYYY)
	 * @return {String} 날짜 문자열
	 */
	getEasterDate : function(puYear) {
		if (ValueUtil.isNull(puYear)) {
			puYear = this.getCurrentDay("YYYY");
		};
		
	    var a = puYear % 19;
	    var b = Math.floor(puYear / 100);
	    var c = puYear % 100;
	    var d = Math.floor(b / 4);
	    var e = b % 4;
	    var f = Math.floor((b + 8) / 25);
	    var g = Math.floor((b - f + 1) / 3);
	    var h = (19 * a + b - d - g + 15) % 30;
	    var i = Math.floor(c / 4);
	    var k = c % 4;
	    var l = (32 + 2 * e + 2 * i - h - k) % 7;
	    var m = Math.floor((a + 11 * h + 22 * l) / 451);
	    
	    var month = Math.floor((h + l - 7 * m + 114) / 31); // 3: 3월, 4: 4월
	    var day = ((h + l - 7 * m + 114) % 31) + 1;
	
	    return new Date(puYear, month - 1, day);
	},
	
    /**
	 * 부활절을 기준으로 성주간 주요 날짜를 반환한다.
	 * @param {String|Number} puYear 년도 문자열 (YYYY)
	 * @return {Array} 날짜 문자열
	 */
	getHolyWeek : function(puYear) {
		var  easter = this.getEasterDate(puYear);
	
	    // 날짜 계산 헬퍼 함수
	    var addDays = (date, days) => {
	        var result = new Date(date);
	        result.setDate(result.getDate() + days);
	        return result;
	    };
	
	    return {
	        palmSunday: this.format(addDays(easter, -7), "YYYYMMDD"),     // 성지 주일 (성주간 시작)
	        maundyThursday: this.format(addDays(easter, -3), "YYYYMMDD"), // 성목요일
	        goodFriday: this.format(addDays(easter, -2), "YYYYMMDD"),     // 성금요일
	        blackSaturday: this.format(addDays(easter, -1), "YYYYMMDD"),  // 성토요일
	        easterSunday: this.format(easter, "YYYYMMDD")                 // 부활 대축일
	    };
	},
	
    /**
	 * 전달받은 날짜가 공휴일인지 여부를 반환한다.
	 * @param {String} psDate 공휴일인지 체크 할 날짜 문자열 (format : YYYYMMDD)
	 * @return {Boolean} 공휴일인지 여부
	 */
	isHoliday : function(psDate) {
		var dateStr = ValueUtil.fixNull(psDate);
		
		if ("" == dateStr.trim()){
			return false;
		}
		
		if (this.getDayOfWeek(dateStr) === "Sun"){
			return true;
		}
		
		var year = dateStr.substring(0, 4);
		dateStr = dateStr.substr(4, 8);
	
		var dt = {}
		//성주간 날짜
		var holyWeek = this.getHolyWeek(year);
		dt[holyWeek.maundyThursday.substring(4, 8)] = "maundyThursday";
		dt[holyWeek.goodFriday.substring(4, 8)]     = "goodFriday";
		dt[holyWeek.blackSaturday.substring(4, 8)]  = "blackSaturday";
		
		dt = ValueUtil.merge(dt, _holiday);
		
		for (var holiday in dt){
			if (holiday === dateStr){
				return true;
			}
		}
		
		return false;
	},
	
	/**
	 * 전달받은 년도의 공휴일 일자들을 반환한다.<br>
	 * @param {String|Number} puYear 년도 문자열 (YYYY)
	 * @return {Array} 공휴일 일자 배열
	 */
	getHoliday : function(puYear) {
		var holidayList = [];
		
		var year = puYear;
		var dt = {}
		//성주간 날짜
		var holyWeek = this.getHolyWeek(year);
		dt[holyWeek.maundyThursday.substring(4, 8)] = "maundyThursday";
		dt[holyWeek.goodFriday.substring(4, 8)]     = "goodFriday";
		dt[holyWeek.blackSaturday.substring(4, 8)]  = "blackSaturday";
		
		//양력 휴일 및 성주간
		dt = ValueUtil.merge(dt, _holiday);
		for (var holiday in dt){
			holidayList.push(year + holiday);
		}
		
		return holidayList.sort();
	},
};
	

/**
 * @class
 * @desc 변수 타입체크 유틸입니다
 */
TypeUtil = {
	/**
	 * 필리핀 국가 식별 체계(PhilSys) 형식에 맞는지 체크합니다.
	 * @param {String} value
	 * @return {Boolean}
	 */
	isPhilSys : function(value){
		// 값이 없는 경우(선택 입력 등) 유효한 것으로 처리할 경우 true 반환
   		 if (ValueUtil.isNull(value)) return true;
	
		// 하이픈(-) 및 공백 제거
	    var cleanValue = value.toString().replace(/[\-\s]/g, "");
		
	    // 숫자로만 구성되어 있는지 체크
	    if (!/^\d+$/.test(cleanValue)) {
		return false;
		}
		
	    // 12자리(PSN) 또는 16자리(PCN) 검증
	    if (cleanValue.length === 12 || cleanValue.length === 16) {
			return true;
		}
		
			return false;
	},
	
	/**
	 * 이메일 형식에 맞는지 체크합니다.
	 * @param {String} value
	 * @return {Boolean}
	 */
	isEmail : function(value){
		if (!value) return true;
		
		if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
			return true;
		}
		
		return false;
	},
	
	/**
	 * url 형식에 맞는지 체크합니다.
	 * @param {String} value
	 * @return {Boolean}
	 */
	isURL : function(value){
		if (!value) return true;
		
		// w3resource.com
		var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
		if(regexp.test(value)) {
			return true;
		}
		
		return false;
	},
	
	/**
	 * 해당 값이 'function' 유형인지 여부를 반환한다.
	 * @param {Function} poFunc
	 * @return {Boolean}
	 */
	isFunc: function(poFunc) {
		if (poFunc != null && (typeof poFunc == "function")) {
			return true;
		} else {
			return false;
		}
	},
	
	/**
	 * 해당 값이 '카드번호' 형식에 맞는 문자열인지 여부를 반환한다.
	 * @param {String | Object} value 문자열값 (카드번호16자리)
	 * @return {Boolean}
	 */
	isCreditno: function(value) {
		if (ValueUtil.isNull(value)) return false;
		
		// 하이픈(-) 및 공백 제거
	    value = value.toString().replace(/[\-\s]/g, "");
	    
	    // 숫자로만 구성되어 있는지 확인
	    if (!/^\d+$/.test(value)) return false;
		
	    // 범용 카드 자릿수 체크 (12자리 ~ 19자리 수용)
		if (value.length < 12 || value.length > 19) return false;
		
		var sum = 0;
		var buf = new Array();
		
		for (var i = 0; i < value.length; i++) {
			buf[i] = Number(value.charAt(i));
		}
		
		var temp;
		for (var i = buf.length - 1, j = 0; i >= 0; i--, j++) {
			temp = buf[i] * ((j % 2) + 1);
			if (temp >= 10) {
				temp = temp - 9;
			}
			sum += temp;
		}
		
		return (sum % 10) === 0;
	}
}
