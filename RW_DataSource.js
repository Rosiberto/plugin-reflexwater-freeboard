(function () {
	var RWDatasource = function(settings, updateCallback)
	{
		var self = this;
		var updateTimer = null;
		var currentSettings = settings;

		function updateRefresh(refreshTime)
		{
			if(updateTimer)
			{
				clearInterval(updateTimer);
			}

			updateTimer = setInterval(function()
			{
				self.updateNow();
			}, refreshTime);
		}

		updateRefresh(currentSettings.refresh * 1000);

		this.updateNow = function()
		{
			url = "http://"+currentSettings.rwhost+"/api/v2/entitie/id/"+currentSettings.id;
			if(currentSettings.use_thingproxy) {
				url =  "https://thingproxy.freeboard.io/fetch/" + url;
			}	
			
			$.ajax({
				url       : url,
				dataType  : "JSON",
				type: "GET",
				beforeSend: function(xhr)
				{
					xhr.setRequestHeader("Content-Type", "application/json");
					xhr.setRequestHeader("Accept", "application/json");			
				},
				success   : function(data)
				{
					//Initialize mydata 
					mydata={};
					
					//if advanced setting is true do not modify received JSON 
					if(currentSettings.advanced){
						mydata=data;
					}
					//if advanced setting is false reduce received JSON nesting
					else{
					
						//Get attributes 
						mydata["id"] = data.id;
						
						if (currentSettings.type == "Reservoir" || currentSettings.type == "Tank"){
					
							mydata["Head"]	  = data.Head;
							mydata["Pressure"]= data.Pressure;
							
						}else{
						//(currentSettings.type == "Pump" || currentSettings.type == "Valve")
							
							mydata["Flow"] = data.Flow;
						}
					}
					updateCallback(mydata);
				},
				error     : function(xhr, status, error)
				{
				}
			});
		}

		this.onDispose = function()
		{
			clearInterval(updateTimer);
			updateTimer = null;
		}

		this.onSettingsChanged = function(newSettings)
		{
			currentSettings = newSettings;
			updateRefresh(currentSettings.refresh * 1000);
		}
	};

	freeboard.loadDatasourcePlugin({
		type_name  : "REFlex Water",
		settings   : [
			{
				name        : "rwhost",
				display_name: "Host:port",
				type        : "text",
				default_value 		: "195.220.224.169:8500"
			},
			{
				name: "use_thingproxy",
				display_name: "Thingproxy",
				description: 'A CORS Proxy (JSONP connection) will be used',
				type: "boolean",
				default_value: true
			},
			{
				name        : "type",
				display_name: "Type",
				type        : "option",
				options: [
					{
						name: "PUMP",
						value: "Pump"
					},
					{
						name: "VALVE",
						value: "Valve"
					},
					{
						name: "TANK",
						value: "Tank"
					},
					{
						name: "RESERVOIR",
						value: "Reservoir"
					}
				]
			},			
			{
				name        : "id",
				display_name: "Id",
				type        : "text"
			},
			/*{
				name        : "advanced",
				display_name: "Advanced",
				description: 'Advanced mode permits access to all JSON request',
				type        : "boolean"
			},*/			
			{
				name         : "refresh",
				display_name : "Refresh Every",
				type         : "number",
				suffix       : "seconds",
				default_value: 5
			}
		],
		newInstance: function(settings, newInstanceCallback, updateCallback)
		{
			newInstanceCallback( new RWDatasource(settings, updateCallback));
		}
	});
}());
