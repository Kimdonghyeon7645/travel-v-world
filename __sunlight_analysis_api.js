document.addEventListener("DOMContentLoaded", function() {
	// �м��ð� ����
	$("#frmSetList #anaStTime").html();
	var options = "";
	for(let i=4; i<21; i++){
		options += '<option value="'+i+'">'+i+'��</option>';
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
		dayNamesMin: ['��','��','ȭ','��','��','��','��'],
		showMonthAfterYear: true
	});
	$('#anaDate .input.date').val((new Date()).toISOString().slice(0,10));
	//������ ���Խ� ���� ��¥�� ����
	var realDate = new Date();
	sunlightAnalysis.setClock({year: realDate.getFullYear(), month: realDate.getMonth()+1, date: realDate.getDate()}, null);
	
	ws3d.viewer.setting.useSunLighting = true; //�¾� ���� ��� ����, true�� �¾� ������ Ȱ��ȭ ��, false�� ��ü ������ ������������ ��
	ws3d.viewer.scene.sun.glowFactor = 10; // �¾� �� ����
	ws3d.viewer.shadows = true;
	ws3d.viewer.terrainShadows = 3; // ���� �׸��� ��� Ȱ��ȭ
	
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

// ���콺�� ���鿡 Ŭ���Ͽ� �ش� ��ġ�� �¾� ��ġ ǥ�� ����
sunlightAnalysis.drawPointOnMap = function() {	
	sunlightAnalysis.spotmarkerS = "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlight/spotmarkerS.png";
	sunlightAnalysis.spotmarkerSunny = "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlight/sunny.png";
	
    ws3d.viewer.canvas.style.cursor = "pointer"; // ���콺 Ŀ�� ����
    ws3d.viewer.map.excludeTerrainModifierOnPicking = false; // ���� ���� ��ü ��ŷ�� ���� �ɼ� ����
    const sunPickingEvent = ws3d.viewer.map.onPickingElement.addEventListener(sunPickingEventHandler);
    // �¾� ��ġ ���⸦ ���� ���콺 ���� �̺�Ʈ �ڵ鷯
    function sunPickingEventHandler(windowPosition, ecefPosition, cartographic, featureInfo) {
    	sunlightAnalysis.selectPoint = new ws3d.common.OgcPoint(cartographic.longitude / Math.PI * 180 , cartographic.latitude / Math.PI * 180, cartographic.height);

		sunlightAnalysis.createSunObject();
		// �¾� ��ġ ǥ�� ���� �̺�Ʈ ����
	    ws3d.viewer.canvas.style.cursor = "grab"; // ���콺 Ŀ�� ����
        ws3d.viewer.map.excludeTerrainModifierOnPicking = true; // ���� ���� ��ü ��ŷ�� ���� �ɼ� ����
        ws3d.viewer.map.onPickingElement.removeEventListener(sunPickingEventHandler);
        sunlightAnalysis.completeDrawGeometry();
    }
};

sunlightAnalysis.completeDrawGeometry = function() {
}

// UI���� �ð� ����� ���� ���� ��ġ�� ���� �¾� ��ġ�� ��Ŀ�� ǥ��
sunlightAnalysis.createSunObject = function(callbackFn) {
	if(sunlightAnalysis.selectPoint != null) { // ���� ��ġ�� ����Ͽ� ������ �ð��� �°� �¾� ��ġ ��Ŀ ����
		// ���� ��ü �����
		ws3d.viewer.objectManager.removeGroupGeometries(sunlightAnalysis.sunObjectID);
        // ������ �м� ��� Ÿ�� ��ü
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
				text : '�¾� ��ġ',
				font : '16px S-Core Dream',
			},
            ThreeDTileLayerElement,
			sunlightAnalysis.sunObjectID,
			callbackFn
		);
	} else {
	}
};

sunlightAnalysis.runSunlight = function(interval, stTime, endTime, callbackFn) { //������
    if(sunlightAnalysis.selectPoint == null) {
        alert('���õ� ������ �����ϴ�.', '','');
        return;
    }
    if(interval == 1 || interval == 5 || interval == 10 || interval == 15) {
        
    } else {
        alert('�ð� ������ 1,5,10,15�� �� �����մϴ�.', '','');
        return;
    }
    const tempDate = ws3d.common.JulianDate.toDate(ws3d.viewer.clock.currentTime); // ���� ���� �ð� �����
    
    
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
            if(hours != null) { // ������ ��� ����
                let sunshine_time = 0; // �����ð�
                // ���� �������� ������ üũ
                for(let minutes = interval; minutes <= 60; minutes+=interval) {

                    // �ð� ����
                    sunlightAnalysis.setClock(null, {hours: hours, minutes: minutes, seconds: 0});

                    // �¾簴ü ���� �� �ݹ� ��� ó��
                    sunlightAnalysis.createSunObject(function(selectPointMarker, sunPointMarker, pickFromRay) {
                        // ��������-�¾� ������ ���õ� ��ü�� ������ �����ð�
                        if(pickFromRay.length == 0) {
                            // pickFromRay �ȿ� ���õ� ��ü�� ������ ���� �ð� ����
                            sunshine_time += interval;
                        }
                    });
                }
                let jsonObj	= null;
                jsonObj = null; jsonObj	= new Object(); jsonObj.startHours = hours-1; jsonObj.endHours = hours; jsonObj.sunLight = sunshine_time;
                sunlightAnalysis.ResultInfo.push(jsonObj);
                r1();
            } else { // ���� �ð����� ����
            	sunlightAnalysis.createSunlightResultTable(sunlightAnalysis.ResultInfo); 
                sunlightAnalysis.setClock(null, {hours: tempDate.getHours(), minutes: tempDate.getMinutes(), seconds: tempDate.getSeconds()});
                sunlightAnalysis.createSunObject();
            }
        }, 200);
    })
}

// setClock ���� ����
sunlightAnalysis.setClock = function(date, time) { 
    // ���� ������ Clock Javascript Date
    const now = ws3d.common.JulianDate.toDate(ws3d.viewer.clock.currentTime);
    if(date == null) { // �ð��� �������� ���
        now.setHours(time.hours);
        now.setMinutes(time.minutes);
        now.setSeconds(time.seconds);
    } else { // ��¥�� �������� ���
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

    //���̺� ����
    const table = document.createElement('ul');
    table.id = 'sunlightResultTable';
    table.classList.add('scope');

    // ���̺���� �߰�
    const header = document.createElement('li');
    header.classList.add('th');
    header.innerHTML = `
    	<h3 style="margin-top: 20px;">�м����(�ð��� ������)</h3>
        <b>�ð�</b><b style="margin-left: 80px">������</b>
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
        <b>�հ�</b>
        <b style="margin-left: 80px">${hours}�ð� ${minutes}��</b>
    `;
    table.appendChild(totItem);

    document.body.appendChild(table);
}

//�ּ� �м� ���� üũ
sunlightAnalysis.anaTimeCheck = function(anaSt, anaEd) {
	var edstCheck = anaEd - anaSt >= 4 ? true : false;
	if (!edstCheck) { alert("�ּ� �м��ð� ������ 4�ð� �̻���� �Դϴ�.", "", function(){$("#frmSetList #anaEdTime").val("20").prop("selected", true);$("#frmSetList #anaEdTime").focus();}); }
}