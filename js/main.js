var chart;
var hack=(function () {

	function getUrl(path){
		return config.baseUrl + path + config.key;
	};

	function getCuisines(){
		$.ajax({
		    type: 'GET',
	        url: getUrl(config.cousine),
	        //data: JSON.stringify(detailOptions),
	        //contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        success: successHandler,
	        complete: function (xhr, status){
	        	if(status == 'error'){
	        		console.log("Error getting data = " , xhr);
	        	}
	        }
    	});
	}

	var successHandler = function(data){
		console.log(data);
		// for (var i = data.results.length - 1; i >= 0; i--) {
		// 	var res = JSON.stringify(data.results[i]);
		// 	$("#name-tag").append("res = " + res + "<br/>");
		// };
		drawGraph(data);
	};

	function drawGraph(data){

		var _categoryNames = [],
		_categoryIds = [],
		_series = [],
		_data = [];

        $.each(data.results, function(i, val) {
        	_categoryNames.push(val.name);
        	_categoryIds.push(val.id);
			_data.push(val.recipe_count);
	    })

	    _series.push({
	    	name: "cousine",
	    	data: _data,
	    });

		var options = {
            chart: {
                renderTo: 'graphContainer',
                type: 'column'
            },
            exporting: {
                enabled: false
            },
		    title: {
                text: 'Cuisines'
            },
            xAxis: {
                categories: _categoryNames,
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count'
                },
                tickPositions: [0, 50, 200]
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                 series: {
                    pointWidth: 20
                },
                column: {
                    pointPadding: 0,
                    groupPadding: 0.1,
                    borderWidth: 0
                }
            },
            credits: {
                enabled: false
            },
            series: _series
        };

		chart = new Highcharts.Chart(options);
 	}

	return{
    	init: function () {
    		getCuisines();
        }
	};
})();

$(document).ready(function() {
	hack.init();
});