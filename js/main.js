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
            url: getUrl(config.recipes + config.recipieParams),
            dataType: "json",
            success: successHandler,
            complete: function (xhr, status){
                if(status == 'error'){
                    console.log("Error getting data = " , xhr);
                }
            }
        });
    };


    function getRecipieById(id){
        $.ajax({
            type: 'GET',
            url: getUrl(config.recipes + "/" + id + "?"),
            dataType: "json",
            success: drawRecipieGraph,
            complete: function (xhr, status){
                if(status == 'error'){
                    console.log("Error getting data = " , xhr);
                }
            }
        });
    }

	var successHandler = function(data){

        console.log(data);

        var index;
        var html = '<ul>';
        var div_html = "";
        //var ingredients = "&#60ul&#62";

        $.each(data.results, function(i, val) {
            index = i + 1;
            
            // $.each(val.ingredients,function(i,ingredient){              
            //     ingredients += '&#60li&#62'+ingredient+'&#60&#47li&#62';
            // });
            // ingredients += "&#60&#47ul&#62";

            html += '<li><img style="height: 90px;" src="'+val.thumb+'"/><a href="#" class="nolink" onclick="hack.getRecipieById(this.id)" id='+val.id+'>'+val.name+'</a></li>';

            
            //div_html += '<div id="tabs-'+index+'"><p><ul><li>'+val.cooking_method+'</li><li>'+val.cuisine+'</li><li>ingredients</li>'+ingredients+'</ul></p></div>';
        });

        $("#tabs").html(html + '</ul>' + div_html);

        chart_data = data;
	};


    var drawRecipieGraph = function(data){
        drawNutritionGraph(data);
    };



    function drawNutritionGraph(data){
        var nutrution = data.nutritional_info;
        console.log(nutrution);

            // Radialize the colors
        Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function(color) {
            return {
                radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        });
        
        // Build the chart
        $('#graphContainer').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage}%</b>',
                percentageDecimals: 1
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function() {
                            return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Nutrition Information',
                data: [
                    ['Calcium',   45.0],
                    ['Potasium',       26.8],
                    {
                        name: 'fat',
                        y: 12.8,
                        sliced: true,
                        selected: true
                    },
                    ['Iron',   0.7]
                ]
            }]
        });
    
    }

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
        },
        getRecipieById: function(id){
            getRecipieById(id);
        }
	};
})();

$(document).ready(function() {
   
    $("#load_recipies").click(function() {
         hack.init();

         // $("#test").click(function(){
         //        console.log(this);
         //        //alert(this);
         //  });

        $(document).tooltip({ position: "top right", opacity: 0.7});
    });

    //$("#tabs").tabs();

    $("#button").click(function() {
        hack.drawGraph();
    });
});