var chart;
var chart_data;
var hack=(function () {

	function getUrl(path){
		return config.baseUrl + path + config.key;
	};

	function getCuisines(){
		$.ajax({
		    type: 'GET',
	        url: getUrl(config.cuisines),
	        dataType: "json",
	        success: successHandler,
	        complete: function (xhr, status){
	        	if(status == 'error'){
	        		console.log("Error getting data = " , xhr);
	        	}
	        }
    	});
	};

    function getRecipies(){
        $.ajax({
            type: 'GET',
            url: getUrl(config.recipes),
            dataType: "json",
            success: successHandler,
            complete: function (xhr, status){
                if(status == 'error'){
                    console.log("Error getting data = " , xhr);
                }
            }
        });
    };

	var successHandler = function(data){

        console.log(data);

        var index;
        var html = '<ul>';
        var div_html = "";
        var ingredients = "";
        $.each(data.results, function(i, val) {

            index = i + 1;
            html += '<li><a href="#tab-'+index+'">'+val.name+'</a></li>';

            $.each(val.ingredients,function(i,ingredient){
                ingredients += '<li class="sub">'+ingredient+'</li>';
            });

            //div_html += '<div id="tabs-'+index+'"><p><ul><li>'+val.cooking_method+'</li><li>'+val.cuisine+'</li><li>ingredients</li>'+ingredients+'</ul></p></div>';
        });


        $("#tabs").html(html + '</ul>' + div_html);

        chart_data = data;
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
	    	name: "recipes",
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
                text: 'recipes'
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
            getRecipies();
        },
        drawGraph: function (){
            drawGraph(chart_data);
        }
	};
})();

$(document).ready(function() {
   
    $("#load_recipies").click(function() {
         hack.init();
    });

    $("#tabs").tabs();

    $("#button").click(function() {
        hack.drawGraph();
    });
});