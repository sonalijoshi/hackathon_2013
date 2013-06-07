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

    function getRecipies(cuisine, limit){

        var params = "?cuisine=" + cuisine;
        params += "&limit=" + limit;

        $.ajax({
            type: 'GET',
            url: getUrl(config.recipes + params),
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
        $.each(data.results, function(i, val) {
            index = i + 1;
            html += '<li><div><span><img style="height: 90px;" src="'+val.thumb+'"/><span><span><a href="#" class="nolink items" onclick="hack.getRecipieById(this.id)" id='+val.id+'>'+val.name+'</a></span></div></li>';
        });

        $("#leftPanel").html(html + '</ul>');
        chart_data = data;
	};

    var drawRecipieGraph = function(data){
        console.log(data);
        
        var div_html = "";
        div_html += '<span class="item name">' + data.name + '</span></br>';
        //div_html += '<span class="item">Cooking Method:' + data.cooking_method + '</span></br>';;
        div_html += '<span class="item">Cost: $' + data.cost + '</span></br>';;
        //div_html += '<span class="item">Cuisine: ' + data.cuisine + '</span></br>';
        div_html += '<span class="item">Serves: ' + data.serves + '</span></br>';
        div_html += '<span class="item">Yields: ' + data.yields + '</span></br>';
        
        var _ingredients = "Ingredients<br/><ul>";
        $.each(data.ingredients,function(i,ingredient){              
            _ingredients += '<li class="item">'+ ingredient.name + ' - ' + ingredient.quantity + ' '+ ingredient.unit +'</li>';
        });
        _ingredients += "</ul>";

        $("#name").html(div_html);
        $("#ingredients").html('<span class="item"><img src="'+ data.image +'" />' + '</span></br>').append(_ingredients);

        drawNutritionGraph(data.nutritional_info);
    };

    function drawNutritionGraph(nutrution){

        var _series = [],
        _data = [],
        _data_parsed = [],
        _parsed = [] ;

        $.each(nutrution, function(key, val) {

            _parsed = val.split("per");
            var _converted = 0;

            if(_parsed[0].search("mg") >= 0){
                var _temp = _parsed[0].split("mg");
                _converted = _temp[0] / 1000;
                //console.log("converted" + _temp[0] + " to " +  _converted);
            }else if(_parsed[0].search("g") >= 0){
                var _temp = _parsed[0].split("g");
                _converted = _temp[0] * 1;
                //console.log("converted" + _temp[0] + " to " +  _converted);
            }else{
                return true;
            }

            if(_converted < 0){
                _converted = 0;
            }

            _data_parsed.push({
                name: key,
                value: _converted,
                unit: "g",
                per: "100 g",
                text: val
            });
        });

        console.log(_data_parsed);

        $.each(_data_parsed, function(key, val) {
                _data.push({
                    name:val.name,
                    y:val.value,
                    sliced:true,
                    selected:false,
                    text: val.text
                });
        })

        _series.push({
            type: 'pie',
            name: "Nutrition Info",
            data: _data,
        });

        console.log(_series);

            // Radialize the colors
        Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function(color) {
            return {
                radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')]
                ]
            };
        });

        var chartOptions = {
            chart: {
                renderTo: 'graphContainer',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: 'Nutrition Info'
            },
            tooltip: {
                pointFormat: '{point.name}: <b>{point.text}%</b>',
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
            series: _series
        };

        chart = new Highcharts.Chart(chartOptions);
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

        options.xAxis = {
            categories: _categoryNames,
        };
        options.series = _series;
        chart = new Highcharts.Chart(options);
        chart.redraw();
 	}

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
            }
    };

	return{
    	init: function (cuisine, limit) {
            getRecipies(cuisine, limit);
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

    $('#searchForm').submit(function() {
        hack.init($("#cuisine").val(), $("#limit").val());
        return false;
    });

   $(document).tooltip({ position: "top right", opacity: 0.7});

    $("#button").click(function() {
        hack.drawGraph();
    });
});