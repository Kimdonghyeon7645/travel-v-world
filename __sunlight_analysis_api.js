document.addEventListener("DOMContentLoaded", function() {
	// 분석시간 범위
	$("#frmSetList #anaStTime").html();
	var options = "";
	for(let i=4; i<21; i++){
		options += '<option value="'+i+'">'+i+'시</option>';
	}
	$("#frmSetList #anaStTime").html(options);
	$("#frmSetList #anaEdTime").html(options);
	$("#frmSetList #anaStTime").val("4").prop("selected", true);
	$("#frmSetList #anaEdTime").val("20").prop("selected", true);
	
	$('#anaDate .input.date').datepicker({
		dateFormat: "yy-mm-dd"
	});
	$.datepicker.setDefaults({
		dateFormat: 'yyyy-mm-dd',
		monthNames: ['01','02','03','04','05','06','07','08','09','10','11','12'],
		dayNamesMin: ['일','월','화','수','목','금','토'],
		showMonthAfterYear: true
	});
	$('#anaDate .input.date').val((new Date()).toISOString().slice(0,10));
	//페이지 진입시 현재 날짜로 변경
	var realDate = new Date();
	sunlightAnalysis.setClock({year: realDate.getFullYear(), month: realDate.getMonth()+1, date: realDate.getDate()}, null);
	
	ws3d.viewer.setting.useSunLighting = true; //태양 광원 사용 여부, true시 태양 광원을 활성화 함, false시 객체 정면을 광원방향으로 함
	ws3d.viewer.scene.sun.glowFactor = 10; // 태양 빛 증가
	ws3d.viewer.shadows = true;
	ws3d.viewer.terrainShadows = 3; // 지형 그림자 사용 활성화
	
	var viewModel = {
			contourDate: sunlightAnalysis.getToday(),
			contourTime: new Date().getHours()
	};
	
	ws3d.common.knockout.track(viewModel);
	ws3d.common.knockout
    .getObservable(viewModel, "contourDate")
    .subscribe(function (newValue) {
        const dateSplit = newValue.split("-");
        sunlightAnalysis.setClock({year: dateSplit[0], month: dateSplit[1], date: dateSplit[2]}, null);
    });
	ws3d.common.knockout
        .getObservable(viewModel, "contourTime")
        .subscribe(function (newValue) {
        	sunlightAnalysis.setClock(null, {hours: newValue, minutes: 0, seconds: 0});
        });
	
	var toolbar = document.getElementById("toolbar");
    ws3d.common.knockout.applyBindings(viewModel, toolbar);
}); //end of DOMContentLoaded event handler


sunlightAnalysis = window.sunlightAnalysis || {};
sunlightAnalysis.spotmarkerS = "";
sunlightAnalysis.spotmarkerSunny = "";

sunlightAnalysis.sunObjectID = "sunObject";
sunlightAnalysis.selectPoint = null;
sunlightAnalysis.ancientLightObjID = "ancientLightObj";
sunlightAnalysis.ancientLightEntities = [];


sunlightAnalysis.ResultInfo = null;


sunlightAnalysis.getToday = function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (1 + date.getMonth())).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
}

// 마우스를 지면에 클릭하여 해당 위치에 태양 위치 표시 시작
sunlightAnalysis.drawPointOnMap = function() {	
	sunlightAnalysis.spotmarkerS = "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlight/spotmarkerS.png";
	sunlightAnalysis.spotmarkerSunny = "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlight/sunny.png";
	
    ws3d.viewer.canvas.style.cursor = "pointer"; // 마우스 커서 변경
    ws3d.viewer.map.excludeTerrainModifierOnPicking = false; // 지형 수정 객체 피킹을 위해 옵션 수정
    const sunPickingEvent = ws3d.viewer.map.onPickingElement.addEventListener(sunPickingEventHandler);
    // 태양 위치 보기를 위한 마우스 선택 이벤트 핸들러
    function sunPickingEventHandler(windowPosition, ecefPosition, cartographic, featureInfo) {
    	sunlightAnalysis.selectPoint = new ws3d.common.OgcPoint(cartographic.longitude / Math.PI * 180 , cartographic.latitude / Math.PI * 180, cartographic.height);

		sunlightAnalysis.createSunObject();
		// 태양 위치 표시 선택 이벤트 해제
	    ws3d.viewer.canvas.style.cursor = "grab"; // 마우스 커서 변경
        ws3d.viewer.map.excludeTerrainModifierOnPicking = true; // 지형 수정 객체 피킹을 위해 옵션 수정
        ws3d.viewer.map.onPickingElement.removeEventListener(sunPickingEventHandler);
        sunlightAnalysis.completeDrawGeometry();
    }
};

sunlightAnalysis.completeDrawGeometry = function() {
}

// UI에서 시간 변경시 기존 선택 위치에 현재 태양 위치를 마커로 표시
sunlightAnalysis.createSunObject = function(callbackFn) {
	if(sunlightAnalysis.selectPoint != null) { // 기존 위치를 사용하여 설정된 시간에 맞게 태양 위치 마커 생성
		// 기존 객체 지우기
		ws3d.viewer.objectManager.removeGroupGeometries(sunlightAnalysis.sunObjectID);
        // 일조권 분석 대상 타일 객체
        const ThreeDTileLayerElement = ws3d.viewer.map.getElementArray();

		ws3d.viewer.navigation.createSunMarker(
			sunlightAnalysis.selectPoint,
   			{
                image: sunlightAnalysis.spotmarkerS,
   				width: 32,
   				height: 64
   			},
   			{
   				image: sunlightAnalysis.spotmarkerSunny,
   				width: 32,
   				height: 32
   			},
			{
				text : '태양 위치',
				font : '16px S-Core Dream',
			},
            ThreeDTileLayerElement,
			sunlightAnalysis.sunObjectID,
			callbackFn
		);
	} else {
	}
};

sunlightAnalysis.runSunlight = function(interval, stTime, endTime, callbackFn) { //일조량
    if(sunlightAnalysis.selectPoint == null) {
        alert('선택된 지점이 없습니다.', '','');
        return;
    }
    if(interval == 1 || interval == 5 || interval == 10 || interval == 15) {
        
    } else {
        alert('시간 간격은 1,5,10,15분 만 지원합니다.', '','');
        return;
    }
    const tempDate = ws3d.common.JulianDate.toDate(ws3d.viewer.clock.currentTime); // 기존 설정 시간 저장용
    
    
    const table = null;
    sunlightAnalysis.ResultInfo = new Array();

    let promiseChain = sunlightAnalysis._sunshineProc(stTime, interval, table, tempDate);

    for (let i = stTime + 1; i <= endTime; i++) {
        promiseChain = promiseChain.then(() => sunlightAnalysis._sunshineProc(i, interval, table, tempDate));
    }
        
    promiseChain = promiseChain.then(() => sunlightAnalysis._sunshineProc(null, interval, table, tempDate));
    
    callbackFn(sunlightAnalysis.ResultInfo);
    
};

sunlightAnalysis._sunshineProc = function(hours, interval, table, tempDate) { 

    return new Promise((r1, r2) => {
        setTimeout(() => {
            if(hours != null) { // 일조량 계산 수행
                let sunshine_time = 0; // 일조시간
                // 설정 간격으로 일조량 체크
                for(let minutes = interval; minutes <= 60; minutes+=interval) {

                    // 시간 설정
                    sunlightAnalysis.setClock(null, {hours: hours, minutes: minutes, seconds: 0});

                    // 태양객체 생성 및 콜백 결과 처리
                    sunlightAnalysis.createSunObject(function(selectPointMarker, sunPointMarker, pickFromRay) {
                        // 선택지점-태양 사이의 선택된 객체가 없으면 일조시간
                        if(pickFromRay.length == 0) {
                            // pickFromRay 안에 선택된 객체가 없으면 일조 시간 누적
                            sunshine_time += interval;
                        }
                    });
                }
                let jsonObj	= null;
                jsonObj = null; jsonObj	= new Object(); jsonObj.startHours = hours-1; jsonObj.endHours = hours; jsonObj.sunLight = sunshine_time;
                sunlightAnalysis.ResultInfo.push(jsonObj);
                r1();
            } else { // 원래 시간으로 복구
            	sunlightAnalysis.createSunlightResultTable(sunlightAnalysis.ResultInfo); 
                sunlightAnalysis.setClock(null, {hours: tempDate.getHours(), minutes: tempDate.getMinutes(), seconds: tempDate.getSeconds()});
                sunlightAnalysis.createSunObject();
            }
        }, 200);
    })
}

// setClock 변경 수행
sunlightAnalysis.setClock = function(date, time) { 
    // 현재 설정된 Clock Javascript Date
    const now = ws3d.common.JulianDate.toDate(ws3d.viewer.clock.currentTime);
    if(date == null) { // 시간만 변경했을 경우
        now.setHours(time.hours);
        now.setMinutes(time.minutes);
        now.setSeconds(time.seconds);
    } else { // 날짜만 변경했을 경우
        now.setFullYear(date.year);
        now.setMonth(Number(date.month)-1);
        now.setDate(date.date);
    }
    const julianDate = ws3d.common.JulianDate.fromDate(now);
    ws3d.viewer.clock.currentTime = julianDate;
    ws3d.viewer.clock.startTime = julianDate.clone();
    julianDate.secondsOfDay = julianDate.secondsOfDay + 0.1;
    ws3d.viewer.clock.stopTime = julianDate.clone();
}

sunlightAnalysis.createSunlightResultTable = function(ResultInfo) {
    
    const existingTable = document.getElementById('sunlightResultTable');
    if (existingTable) {
        existingTable.remove();
    }

    //테이블 생성
    const table = document.createElement('ul');
    table.id = 'sunlightResultTable';
    table.classList.add('scope');

    // 테이블헤더 추가
    const header = document.createElement('li');
    header.classList.add('th');
    header.innerHTML = `
    	<h3 style="margin-top: 20px;">분석결과(시간별 일조량)</h3>
        <b>시간</b><b style="margin-left: 80px">일조량</b>
    `;
    table.appendChild(header);
    
    let totSunlight = 0;
    
    ResultInfo.forEach((result) => {
        const listItem = document.createElement('li');
        
        const sunlightVal = parseInt(result.sunLight);  
        totSunlight += sunlightVal;  
        
        listItem.innerHTML = `
            <b>${result.startHours} ~ ${result.endHours}</b>
            <b style="margin-left: 80px">${result.sunLight}</b>
        `;
        table.appendChild(listItem);
    });
    
    const hours = Math.floor(totSunlight / 60);
    const minutes = totSunlight % 60;
    
    const totItem = document.createElement('li');
    totItem.innerHTML = `
        <b>합계</b>
        <b style="margin-left: 80px">${hours}시간 ${minutes}분</b>
    `;
    table.appendChild(totItem);

    document.body.appendChild(table);
}

//최소 분석 범위 체크
sunlightAnalysis.anaTimeCheck = function(anaSt, anaEd) {
	var edstCheck = anaEd - anaSt >= 4 ? true : false;
	if (!edstCheck) { alert("최소 분석시간 범위는 4시간 이상부터 입니다.", "", function(){$("#frmSetList #anaEdTime").val("20").prop("selected", true);$("#frmSetList #anaEdTime").focus();}); }
}