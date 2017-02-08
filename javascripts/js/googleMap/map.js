/* 2017 
 * Tommy Dang, Assistant professor, iDVL@TTU
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var map; 
var mapZoom=8;
var mapLat = 32.24;
var mapLng = -101.479;
var mapId = google.maps.MapTypeId.TERRAIN;
var overlay;
var layer;
var bounds;
var selectedWells=[];
var numberNearestWell=9;
// Add a default well
//selectedWells.push(idv.wellMap["233701"]);
redrawMap();


// Initialize the google map
function init(){
	map = new google.maps.Map(d3.select("#map").node(),{
     zoom: mapZoom,
     draggableCursor: 'crosshair',
    center: new google.maps.LatLng(mapLat, mapLng),
    mapTypeId: mapId
  });
  bounds   = new google.maps.LatLngBounds();
	overlay  = new google.maps.OverlayView();
  overlay.onAdd = function() {
    layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "stations");
  }
}

// Redraw wells on map for every click
function redrawMap(wellList) {
  	init();  // Reload a new map ***************

    var data = {};
    for (var i=0; i<wellList.length;i++){
    	well = wellList[i];
    	data[well.id+" at "+ well.detail.county] = well;
    }
	

    var mapDiv = d3.select("#map");
    google.maps.event.addDomListener(mapDiv, 'click', function() {
          window.alert('Map was clicked!');
        });

   overlay.draw = function() {
      var projection = this.getProjection(), padding = 10;
      var marker = layer.selectAll("svg").data(d3.entries(data)).each(transform)
                        .enter().append("svg:svg")
                        .each(transform)
                        .attr("class", "marker");
      
    //if (selectedWells.length>0)                    
      layer.selectAll("svg").call(tip);
                   
      // Add a circle.
      marker.append("svg:circle")
                        .attr("r", function(d,i){ return i==0 ? 6 : 4;})
                        .attr("cx", padding)
                        .attr("cy", padding)
                        .attr("fill", function(d){ return d.value.getMyColor(); })
                        .on("mouseover",showTip)
                        .on("mouseout",mouseout)
                        .on("click", clickWell);

      // Add a label.
      marker.append("svg:text")
                        .attr("x", padding + 7)
                        .attr("y", padding)
                        .attr("dy", ".31em")
                        .attr("class","marker_text")
                        .text(function(d) {return d.key; });

      google.maps.event.addListener(map, 'click', function (event) {
              displayCoordinates(event.latLng);               
          });
 
      function displayCoordinates(pnt) {
          var coordsLabel = document.getElementById("tdCursor");
          var lat = pnt.lat();
          lat = lat.toFixed(4);
          var lng = pnt.lng();
          lng = lng.toFixed(4);
          console.log("Latitude: " + lat + "  Longitude: " + lng);
      }

   // google.maps.event.addListener(map, 'mousemove', function (event) {
   //             displayCoordinates(event.latLng);               
   //       });



      function transform(d) {
        //d = new google.maps.LatLng(d.value[1], d.value[0]);
        d = new google.maps.LatLng(d.value.detail.position.lat, d.value.detail.position.lon);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this).style("left", (d.x - padding) + "px").style("top", (d.y - padding) + "px");
      }
     
      function mouseout(d){
        tip.hide(d);
        d3.select(this).transition()
            .duration(100)
            .attr("stroke-width",0.5);
      };

      function clickWell(d){
        tip.hide(d);
        console.log("Well clicked");
        var wlist = [];
        for (var key in idv.wellMap){
          var w = idv.wellMap[key];
          w["distanceToSelectedWell"] = getPixelDistance(d.value, w)
          wlist.push(w);
        }
        wlist.sort(function(a, b) {
          return a["distanceToSelectedWell"] - b["distanceToSelectedWell"];
        });

        var wlist2 = [];
        for (var i=0; i<numberNearestWell+1;i++){
          wlist2.push(wlist[i]); 
        }
        
        // Redraw the map ***********************
        mapZoom = map.zoom;
        mapLat = map.center.lat();
        mapLng = map.center.lng();
        mapId = map.mapTypeId;
        redrawMap(wlist2);
        var wellGPS = {lat: +d.value.detail.position.lat, lng: +d.value.detail.position.lon};
      };
    };
    overlay.setMap(map);
  }

function getPixelDistance(d1,d2){
  return (d1.pointX - d2.pointX)*(d1.pointX - d2.pointX)+
         (d1.pointY - d2.pointY)*(d1.pointY - d2.pointY)
};

  
  // Make the markers glow
  //var glow = $('.stations');
  //setInterval(function(){
  //  glow.toggleClass('glow');
  //}, 1000);

// Create the Google Map…
/*var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 8,
  center: new google.maps.LatLng(32.24, -101.479),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

function addPoint(well){
	var data = {};
	//data[well.id+" at "+ well.detail.county] = [well.detail.position.lon,well.detail.position.lat,
	//"Well "+well.id, well];
	data[well.id+" at "+ well.detail.county] = well;
	

	

	//var data = {"KMAE":[-120.12,36.98,"MADERA MUNICIPAL AIRPORT",[26,1,2,5,6,3,2,1,2,7,29,12,3]],"KSJC":[-121.92,37.37,"SAN JOSE INTERNATIONAL  AIRPORT",[28,1,1,1,6,10,5,3,2,4,14,21,7]],"KMCE":[-120.50,37.28,"MERCED MUNICIPAL AIRPORT",[29,1,1,3,7,5,2,1,3,6,12,26,5]],"KMER":[-120.57,37.37,"Merced / Castle Air Force Base",[34,1,1,1,4,5,2,1,1,4,17,22,7]],"KAPC":[-122.28,38.20,"NAPA COUNTY AIRPORT",[23,2,1,6,3,3,8,18,11,13,4,3,5]],"KSUU":[-121.95,38.27,"Fairfield / Travis Air Force Base",[13,7,4,3,3,6,4,13,33,4,1,2,7]],"KSQL":[-122.25,37.52,"San Carlos Airport",[18,3,2,2,3,4,3,2,5,17,16,12,12]],"KSNS":[-121.60,36.67,"SALINAS MUNICIPAL AIRPORT",[21,1,1,6,12,3,1,2,9,21,17,5,1]],"KMOD":[-120.95,37.62,"MODESTO CITY CO SHAM FLD",[27,1,1,2,10,5,1,1,1,3,17,24,8]],"KOAK":[-122.23,37.72,"METRO OAKLAND INTERNATIONAL  AIRPORT ",[16,3,3,2,4,6,3,4,9,23,20,6,2]],"KSCK":[-121.23,37.90,"STOCKTON METROPOLITAN AIRPORT ",[21,2,2,3,6,8,2,1,4,15,19,12,4]],"KCCR":[-122.05,38.00,"CONCORD BUCHANAN FIELD",[24,3,2,1,1,5,17,12,9,9,7,6,4]],"KMRY":[-121.85,36.58,"MONTEREY PENINSULA AIRPORT",[26,1,2,9,5,3,4,9,13,14,9,4,1]],"KPAO":[-122.12,37.47,"Palo Alto Airport",[31,3,1,1,2,5,1,1,1,4,10,25,14]],"KSAC":[-121.50,38.50,"SACRAMENTO EXECUTIVE AIRPORT ",[32,1,0,1,3,11,12,16,5,2,4,9,3]],"KHWD":[-122.12,37.67,"HAYWARD AIR TERMINAL",[20,2,7,2,2,6,3,3,6,23,18,6,2]],"KSTS":[-122.82,38.50,"SANTA ROSA SONOMA COUNTY",[46,1,0,1,5,13,10,4,3,3,4,6,3]],"KSMF":[-121.60,38.70,"SACRAMENTO INTERNATIONAL  AIRPORT",[19,2,1,2,4,21,18,8,3,2,5,12,4]],"KNUQ":[-122.05,37.43,"MOFFETT FIELD",[35,3,1,1,4,7,2,1,2,5,6,17,15]],"KRHV":[-121.82,37.33,"San Jose / Reid / Hillv",[35,0,0,1,4,4,2,1,1,10,28,11,1]],"KWVI":[-121.78,36.93,"WATSONVILLE MUNICIPAL AIRPORT ",[44,1,2,3,4,5,7,9,8,4,6,5,2]],"KMHR":[-121.30,38.55,"Sacramento, Sacramento Mather Airport",[21,1,1,2,8,15,12,12,7,4,5,7,3]],"KVCB":[-121.95,38.38,"VACAVILLE NUT TREE AIRPORT",[36,2,1,1,2,6,10,18,10,2,2,5,6]],"KSFO":[-122.37,37.62,"SAN FRANCISCO INTERNATIONAL  AIRPORT ",[13,3,3,2,3,4,4,4,7,31,20,2,3]],"KLVK":[-121.82,37.70,"LIVERMORE MUNICIPAL AIRPORT ",[32,2,7,3,1,1,2,7,9,17,16,2,1]]};

	//document.getElementById("map").style.zIndex = "-100";
	var overlay = new google.maps.OverlayView();

  	// Add the container when the overlay is added to the map.
  	overlay.onAdd = function() {
	    var layer = d3.select(this.getPanes().overlayLayer).append("div")
	        .attr("class", "stations");

	    // Draw each marker as a separate SVG element.
	    // We could use a single SVG, but what size would it have?
	    overlay.draw = function() {
	      var projection = this.getProjection(),
	          padding = 10;

	      var marker = layer.selectAll("svg")
	          .data(d3.entries(data))
	          .each(transform) // update existing markers
	        .enter().append("svg")
	          .each(transform)
	          .attr("class", "marker");
	       layer.selectAll(".marker").style.zIndex = "1000";
	          
	      // Add a circle.
	      marker.append("circle")
	          .attr("r", 4)
	          .attr("cx", padding)
	          .attr("cy", padding)
	          .attr("fill", function(d){
	          	return d.value.getMyColor();
	          })
	          .on("mouseover",function(d){ console.log("AA"+d.key); })

	      // Add a label.
	      marker.append("text")
	          .attr("x", padding + 7)
	          .attr("y", padding)
	          .attr("dy", ".31em")
	          .text(function(d) { return d.key; });

	      	// Popup text when mousing over
			marker.selectAll(".marker").append("title")
			      .text(function(d) { return "AAAA"; });    

	      function transform(d) {
	      	d = new google.maps.LatLng(d.value.detail.position.lat, d.value.detail.position.lon);
	        d = projection.fromLatLngToDivPixel(d);
	        return d3.select(this)
	            .style("left", (d.x - padding) + "px")
	            .style("top", (d.y - padding) + "px");
	      }
    	};
 	};

 	// Bind our overlay to the map…
  	overlay.setMap(map);
}*/