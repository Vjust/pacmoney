var width = 880,height = 860;
//,centered;
//width = 960,

var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

var path = d3.geo.path()
    .projection(projection);
    
var baseDiv = "#my123";

var svg = d3.select(baseDiv).append("svg")
    .attr("width", width)
    .attr("height", height);
    
var lastElement;

// tooltip
var tooltipDiv = d3.select(baseDiv)
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "MyToolTip")
                    .style("opacity", 1e-6);


svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", click)
//    .on("mouseover", mouseover)
//    .on("mousemove", mousemove)
//    .on("mouseout", mouseout)
    ;

var map = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .attr("class","map");

var g = map.append("g")
    .attr("class", "states_districts");

var g_districts = g.append("g")
    .attr("class", "districts");

var g_states = g.append("g")
    .attr("class", "states");   

var state_fp2name = {"01":"Alabama","02":"Alaska","04":"Arizona","05":"Arkansas","06":"California","08":"Colorado","09":"Connecticut","10":"Delaware","11":"District of Columbia","12":"Florida","13":"Georgia","15":"Hawaii","16":"Idaho","17":"Illinois","18":"Indiana","19":"Iowa","20":"Kansas","21":"Kentucky","22":"Louisiana","23":"Maine","24":"Maryland","25":"Massachusetts","26":"Michigan","27":"Minnesota","28":"Mississippi","29":"Missouri","30":"Montana","31":"Nebraska","32":"Nevada","33":"New Hampshire","34":"New Jersey","35":"New Mexico","36":"New York","37":"North Carolina","38":"North Dakota","39":"Ohio","40":"Oklahoma","41":"Oregon","42":"Pennsylvania","44":"Rhode Island","45":"South Carolina","46":"South Dakota","47":"Tennessee","48":"Texas","49":"Utah","50":"Vermont","51":"Virginia","53":"Washington","54":"West Virginia","55":"Wisconsin","56":"Wyoming","72":"Puerto Rico"};

var state_name2abbrev = {"Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","District of Columbia":"DC","Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Puerto Rico":"PR","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"}

var my_state_abbrev = 
{ 
    "AK": "Alaska" ,  "AL": "Alabama", "AR": "Arkansas", "AZ": "Arizona", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DC": "District of Columbia", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "IA": "Iowa", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "MA": "Massachusetts", "MD": "Maryland", "ME": "Maine", "MI": "Michigan", "MN": "Minnesota", "MO": "Missouri", "MS": "Mississippi", "MT": "Montana", "NC": "North Carolina", "ND": "North Dakota", "NE": "Nebraska", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NV": "Nevada", "NY": "New York", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "PR": "Puerto Rico", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VA": "Virginia", "VT": "Vermont", "WA": "Washington", "WI": "Wisconsin", "WV": "West Virginia", "WY": "Wyoming"  
};


var lookupDonorNames = {},
        district_names = [],
        ext_ids = [],
        contributionsByDonor = {},
        contributionsByDistrict = {},
        totalDonations = {},
        data = [];
totalDonations["AllContributors"] = 0;

//var colorScale = d3.scale
                //.linear()
                //.range(  ["#ffdd8c",   "#fcb644",   "#FACC2E",   "#f5eeb8",   "#F5DA81"] );

var colorScale2 = d3.scale
                .linear()
                .domain( [2 * Math.pow(10,6), 4 * Math.pow(10,6), 6 * Math.pow(10,6), 8* Math.pow(10,6), 10* Math.pow(10,6) ])
                .range(  ["#f5eeb8",   "#F5DA81",   "#FACC2E",   "#fcb644",   "#a97f11"] );


//.range(  ["#f1b9bd", "#ffdd8c","#fcb644","#e3b2b7","#f5eeb8"] );
//light pink,yellow1,dark yellow,dark pink,lighter yellow
//#f16571, #f79e8a
var maxDistrict = "max";


/* D3 Map execution starts here */
d3.json("/data/us_states_apr.json", function(states) {


    g_states.selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d",path);
                        
    g_states.selectAll("text")
            .data(states.features)
            .enter()
            .append("svg:text")
            .text(function(d){
                return state_name2abbrev[d.properties.name];
            })
            .attr("x", function(d){
                return path.centroid(d)[0];            
            })
            .attr("y", function(d){
                return path.centroid(d)[1];            
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("stroke", "#222")
            .attr("stroke-width", "0.5px");



    d3.json("/data/us_districts.json", function(districts) {
        
            //console.log(districts);
            if (districts) {
            for (var i = -1+ districts.features.length; i >= 0; i--) {
              if (districts.features[i].geometry == null) {
                districts.features.splice(i,1);
              } else {
                        districts.features[i].properties.Dist2 =
                                    state_name2abbrev[state_fp2name[districts.features[i].properties.STATEFP]]
                                        + "-" + districts.features[i].properties.CD113FP;
              }
            }
            }
            var district_abbrev = districts.features.map(function(d){return d.properties.Dist2;});


            g_districts.selectAll("path")
                        .data(districts.features.filter(function(d){return d !== 'undefined';})
                        .sort(function(a,b){a.properties.Dist2 - b.properties.Dist2}))
                        .enter().append("path")
                        .attr("class","district")
                        .attr("id", function(d){return d.properties.Dist2;})
                        .attr("d", path)
                        .on("click", click);
                        
                        //.on("mouseover", mouseover)
                        //.on("mousemove", mousemove)
                        //.on("mouseout", mouseout)
                        //;

  });
});

/*
    Click on map
 */
function click(d) {
    clearTooltip();
    // highlight current element
    var elementId = d.properties.Dist2;
    var elementSelector = "#" + elementId;
    var posX = $(elementSelector).offset().left-300;
    var posY = $(elementSelector).offset().top+150;

    //addHighlight(elementSelector);

    //var url = "/data/distjson?district_id=" + d.properties.Dist2;
    var url = "/data/distjson?district_id=" + elementId ;
    
    d3.json (url, function (json) {
            // summarize it  (ASSUMPTION : its wrong, but we are only looking at the first transaction in Json_list)
            //console.log (d[0]);
            addHighlight(elementSelector, json[0].transaction_amt);
            
            //toolTipBox(elementId, d[0].cmte_nm, d[0].transaction_amt,
            //d[0].cand_name, 394,355);
            toolTipBox(elementId, json[0].cmte_nm, json[0].transaction_amt,
                       json[0].cand_name, json[0].cand_pty_affiliation, posX ,posY);
        }
    );
}

function addHighlight(elementId, str_transaction_amt) {


    // add highlight for the specified element
    var tranAmtStr=str_transaction_amt.replace(/,/g, "").replace(/\$/g, "");
    var tranAmtNumeric=Number(tranAmtStr);
    d3.select(elementId)
            .transition()
            .style("fill",colorScale2(tranAmtNumeric));
               
}


function toolTipBox(elementId, cont_name, donation, cand_name, cand_pty_affiliation, posX, posY)  {        
    var xPosition=posX -25;
    var yPosition=posY -25;   
    
    var state_val = my_state_abbrev[elementId.substring(0,2) ];
    //console.log(state_val);
    var tranAmtStr=donation.replace(/,/g, "").replace(/\$/g, "");
    var tranAmtNumeric=Number(tranAmtStr);
    
    var tooltip=d3.select("#MyToolTip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            
            //.style("background",colorScale2(tranAmtNumeric));
            
            
    clearTooltip ();

            
         tooltip
            .append("p")
            .text(cont_name)
            .attr("id", "tt_cont_name");
            
         tooltip   
            .append("p")
            .text(cand_name)
            .attr("id", "tt_cand_name");
            
        tooltip   
            .append("p")
            .text(cand_pty_affiliation +","+ state_val)
            .attr("id", "tt_cand_name");
        
        tooltip
            .append("p")
            .text("Transaction Amout: " + donation)
            .attr("id", "tt_donation");
            
            
         tooltip
            .transition("show")
            .style("opacity", 1)            
            .duration(500);            
}

/*
    This highlights multiple districts based on search.
    Does not mean the "whole" map.. A subset of the map.
*/
function fullMapHighlight(json_list) {
     
      resetMap();      
      
      for (var i in json_list) {        
               var distObject = json_list[i];
               
                if (distObject.district_id != undefined && distObject.district_id.length == 5) {
                   addHighlight( "#"+  distObject.district_id, distObject.transaction_amt);
                }
        }
}

/*
    district Id should be of the form State-Code + districtId; i.e. CA-08
    Called from search results
 */
function searchHighLight(districtId, contributor, donation, cand_name, cand_pty_affiliation) {
     var elementId = "#" + districtId;
     var cont_name = contributor;
     var donation = donation;
     var cand_pty_affiliation = cand_pty_affiliation;
     var posX = $(elementId).offset().left + 130;
     var posY = $(elementId).offset().top + 25;
     
     // change highlight color
     addHighlight(elementId, donation);
               
     // show tooltip          
     toolTipBox(elementId, cont_name, donation, cand_name, cand_pty_affiliation, posX , posY);
}

/*
    "Unhighlight" the map , by resetting each path element
*/
function resetMap() {
     
      var pathlist= $("path");
      for (var i in pathlist) { 
                var elementId = "#" + pathlist[i].id;
                //console.log ("resetting elementId:" + elementId);
                if (elementId.length == 6) {
                    d3.select(elementId)
                            .transition()
                            .style("fill","");
                }
        }
        
        clearTooltip();
                           
}


function clearTooltip() {
    // clear all existing p's
    
        var tooltip=d3.select("#MyToolTip");
        tooltip.selectAll("p").remove();
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.unique = function(a){
  return function(){
    return this.filter(a)
  }
}(function(a,b,c){return c.indexOf(a,b+1)<0});