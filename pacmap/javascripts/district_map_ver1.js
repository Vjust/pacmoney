var width = 960,
    height = 500,
    centered;


var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);


// tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1e-6);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", click)
    .on("mouseover", mouseover) // tooltip
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
    ;

           // this is for testing purposes.
          d3.json("/data/cont",   function(contribution){
                var x = contribution[0];
                console.log (x.contributor.district);
                console.log(contribution);
          });


var map = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .attr("class","map")

var g = map.append("g")
    .attr("class", "states_districts");

var g_districts = g.append("g")
    .attr("class", "districts");

var g_states = g.append("g")
    .attr("class", "states");

var state_fp2name = {"01":"Alabama","02":"Alaska","04":"Arizona","05":"Arkansas","06":"California","08":"Colorado","09":"Connecticut","10":"Delaware","11":"District of Columbia","12":"Florida","13":"Georgia","15":"Hawaii","16":"Idaho","17":"Illinois","18":"Indiana","19":"Iowa","20":"Kansas","21":"Kentucky","22":"Louisiana","23":"Maine","24":"Maryland","25":"Massachusetts","26":"Michigan","27":"Minnesota","28":"Mississippi","29":"Missouri","30":"Montana","31":"Nebraska","32":"Nevada","33":"New Hampshire","34":"New Jersey","35":"New Mexico","36":"New York","37":"North Carolina","38":"North Dakota","39":"Ohio","40":"Oklahoma","41":"Oregon","42":"Pennsylvania","44":"Rhode Island","45":"South Carolina","46":"South Dakota","47":"Tennessee","48":"Texas","49":"Utah","50":"Vermont","51":"Virginia","53":"Washington","54":"West Virginia","55":"Wisconsin","56":"Wyoming","72":"Puerto Rico"};

var state_name2abbrev = {"Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","District of Columbia":"DC","Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Puerto Rico":"PR","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"}

var lookupDonorNames = {},
        district_names = [],
        ext_ids = [],
        contributionsByDonor = {},
        contributionsByDistrict = {},
        totalDonations = {},
        data = [];
totalDonations["AllContributors"] = 0;

var colorScale = d3.scale
                .linear()
                .range(["#f1b9bd", "#e3b2b7","#fcb644","#ffdd8c","#f5eeb8"]);
//#f16571, #f79e8a
var maxDistrict = "max";






/* D3 Map execution starts here */
d3.json("/data/us_states_ca_only.json", function(states) {
    g_states.selectAll("path")
            .data(states.features)
            .enter().append("path")
            .attr("d",path);

    d3.json("/data/us_districts_ca_only.json", function(districts) {

    for (var i = -1+districts.features.length; i >= 0; i--) {
      if (districts.features[i].geometry == null) {
        districts.features.splice(i,1);
      } else {
        districts.features[i].properties.Dist2 =
            state_name2abbrev[state_fp2name[districts.features[i].properties.STATEFP]] + "-" + districts.features[i].properties.CD113FP;
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
                .on("click", click)
                .on("mouseover", mouseover)  // tooltip
                .on("mousemove", mousemove)
                .on("mouseout", mouseout);


      /*
      d3.json("/data/cont", function(contributors){
        var ids = [{"key": "title", "value": "All Donors"}];

          contributors.forEach(function(contrib){
          if (typeof contrib.cycle.contributor.contributor_ext_id !== 'undefined' && 
            contrib.cycle.contributor.contributor_type.Corporation.transaction.Recipient.district.district.match(/\w/) &&
            contrib.cycle.contributor.contributor_ext_id.match(/\w/) &&
            district_abbrev.indexOf(contrib.cycle.contributor.contributor_type.Corporation.transaction.Recipient.district.district) > -1
          ) {
            var whichDistrict = contrib.cycle.contributor.contributor_type.Corporation.transaction.Recipient.district.district;
            var whichContributor = contrib.cycle.contributor.contributor_ext_id;
            var howMuch = contrib.cycle.contributor.contributor_type.Corporation.transaction.amount;
            if (ext_ids.indexOf(whichContributor) == -1) {
              ext_ids.push(whichContributor);
              ids.push({"key":whichContributor,"value":contrib.cycle.contributor.contributor_name});
              contributionsByDonor[whichContributor] = [{
                "district": whichDistrict, 
                "contribution": howMuch
              }];
              totalDonations["AllContributors"] += parseFloat(howMuch);
              totalDonations[whichContributor] = parseFloat(howMuch);
              lookupDonorNames[whichContributor] = contrib.cycle.contributor.contributor_name;
            } else {
              contributionsByDonor[whichContributor].push({
                "district": whichDistrict, 
                "contribution": howMuch
              });
              totalDonations["AllContributors"] += parseFloat(howMuch);
              totalDonations[whichContributor] += parseFloat(howMuch);
            }
            if (district_names.indexOf(whichDistrict) == -1) {
              district_names.push(whichDistrict);
              contributionsByDistrict[whichDistrict] = [{
                "contributor": whichContributor, 
                "contribution": howMuch
              }];
              totalDonations[whichDistrict] = parseFloat(howMuch);
              if (typeof maxDistrict.match(/max/) || totalDonations[whichDistrict] > totalDonations[maxDistrict]) {
                maxDistrict = whichDistrict;
              }
            } else {
              contributionsByDistrict[whichDistrict].push({
                "contributor": whichContributor, 
                "contribution": howMuch
              });
              totalDonations[whichDistrict] += parseFloat(howMuch);
              if (typeof maxDistrict.match(/max/) || totalDonations[whichDistrict] > totalDonations[maxDistrict]) {
                maxDistrict = whichDistrict;
              }
            }
          }
        })
//        var cScale = colorScale.domain([0,0.25*totalDonations[maxDistrict],0.5*totalDonations[maxDistrict],0.75*totalDonations[maxDistrict],totalDonations[maxDistrict]]);
        var cScale = colorScale.domain([0,1000,5000,10000,totalDonations[maxDistrict]]);
        district_names.forEach(function(dn){
          d3.selectAll("path#" + dn).style("fill",cScale(totalDonations[dn]));
        })
        var all_ext_ids = ext_ids.join(",");
        var all_district_names = district_names.sort().join(",");
        ext_ids.sort(function(a,b){return totalDonations[b]-totalDonations[a];}).unshift(all_ext_ids);
        var hiddenAllDistricts = d3.select("div.pulldown").append("hidden").attr("class","AllDistricts").attr("value",all_district_names);
        district_names.sort().unshift("All Districts");
        var pulldownDistrict = d3.select("div.pulldown").append("select").attr("class","District")
          .on("change",function(d){
            showOnMap("district",this.value,contributionsByDistrict[this.value]);
            mousemove("district",this.value,contributionsByDistrict[this.value]);
          })

        pulldownDistrict.selectAll("option").data(district_names)
          .enter()
            .append("option")
            .attr("class","district")
            .attr("id",function(d){if (d.match(/All /)){return district_names;} else {return d}}) 
           .attr("value",function(d){if (d.match(/All /)){return district_names;} else {return d}})
            .text(function(d){if (d.match(/All /)) {return d + " ... $" + totalDonations["AllContributors"].toFixed(2);} else {return d + " ... $" + totalDonations[d].toFixed(2);}})
        var hiddenAllDonors = d3.select("div.pulldown").append("hidden").attr("class","AllDonors").attr("value",all_ext_ids);
        var pulldownContributor = d3.select("div.pulldown").append("select").attr("class","Contributor")
          .on("change",function(d){
            showOnMap("contributor",this.value,contributionsByDonor[this.value]);
            mousemove("contributor",this.value,contributionsByDonor[this.value]);
          })


        pulldownContributor.selectAll("option").data(ext_ids)
          .enter()
            .append("option")
            .attr("class","contributor")
            .attr("id",function(d){if (! d.match(/,/)) {return d;}})
            .attr("value",function(d){return d;})
            .text(function(d){
              if (! d.match(/,/)) {
                return lookupDonorNames[d] + " ... $" + totalDonations[d].toFixed(2);
              } else {
                return "All Donors ... $" + totalDonations["AllContributors"].toFixed(2);
              }
            })

        ;
    }); */
  });
});


          var contDistrict="path#CA-08.district";
          d3.selectAll(contDistrict)
                         .transition()
                         .style("fill",colorScale(1));
          //districts_list.push(contDistrict);





// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*


    This function is called for a contributor/district id


*/

function showOnMap(district_or_contributor,id,data_url,d) {

  d3.selectAll("path.active").transition().style("stroke-width","0.12px");

  var cScale = colorScale.domain([0,1000,5000,10000,totalDonations[maxDistrict]]);
  var district_selected = id;
  // d3.select("div.pulldown select.District")[0][0].value;


  if (id.match(/,/ || id.match(/All / || typeof data === 'undefined'))) {
            d3.selectAll("g.districts path").transition().style("fill","#aaa");
            var districtsArray = d3.select("hidden.AllDistricts").attr("value").split(",")
            for (var i = 0; i < districtsArray.length; i++) {
                console.log(districtsArray[i]);
                d3.selectAll("path#" + districtsArray[i]).transition().style("fill",cScale(totalDonations[districtsArray[i]]))
            }

       if (id.match(/All Districts/)){
                centered = null; //zoomout
                d3.selectAll("g.states").transition().style("opacity",1);
                d3.selectAll("g.districts").transition().style("stroke-width","0.5px");
                g.transition()
                    .duration(1000)
                    .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")");
        }

        var allDonorsString = d3.select("hidden.AllDonors").attr("value");
        var allDonors = allDonorsString.split(",").sort(function(a,b){return totalDonations[b]-totalDonations[a];});
        allDonors.unshift(allDonorsString);

                            /* removing pull downs
                            d3.select("div.pulldown select.Contributor").selectAll("option").remove();
                            d3.select("div.pulldown select.Contributor").selectAll("option").data(allDonors)
                                .enter()
                              .append("option")
                                .attr("class","contributor")
                                .attr("id", function(d){if (! d.match(/,/)){return d;}})
                                .attr("value", function(d){return d;})
                                .attr("selected",function(d){if (!d.match(/,/) && lookupDonorNames[d] === id){console.log(lookupDonorNames[d]);return "selected";}})
                                .text(function(d){
                                  if (d.match(/,/)) {return "All Donors ... $" + totalDonations["AllContributors"].toFixed(2);}
                                  else {return lookupDonorNames[d] + " ... $" + totalDonations[d].toFixed(2);}});
                            var districts_list = district_names;
                            console.log(districts_list);

                           */
                           /* -- removing pulldowns
                            d3.select("div.pulldown select.District").selectAll("option").remove();
                            d3.select("div.pulldown select.District").selectAll("option").data(districts_list)
                                .enter()
                              .append("option")
                              .attr("class","district")
                              .attr("id",function(d){if (! d.match(/,/)){return d;}})
                              .attr("value",function(d){return d;})
                              .text(function(d){
                                    if (d.match(/,|All Districts/)){
                                        return "All Districts ... $" + totalDonations["AllContributors"].toFixed(2);}
                                    else
                                    {
                                        return d + " ... $" + totalDonations[d].toFixed(2);}})


                          if (id.match(/All Districts/)){
                              d3.select("div.pulldown select.Contributor")[0][0].value = district_selected;
                          }
                          */
  }

  else if (district_or_contributor.match(/contributor/)) {

          d3.selectAll("g.districts path").style("fill","#aaa");
          var districts_list = [];
          if (typeof data === 'undefined') {
            data = contributionsByDonor;
          }

          var contDistrict="path#CA-08";
          d3.selectAll(contDistrict)
                         .transition()
                         .style("fill","green");
          districts_list.push(contDistrict);


           if (false) {
                   $.get("/data/cont",function(contribution,status){
                               var x=contribution[0];
                               var contDistrict=  x.contributor.district;
                               if (districts_list.indexOf(contDistrict) < 0) {
                                  d3.selectAll("path#" + contDistrict)
                                      .transition()
                                      .style("fill",cScale(1));

                                  districts_list.push(contDistrict);
                               }
                               districts_list.sort();
                               districts_list.unshift(district_names.join(","));
                               console.log("jquery get to /data/cont")
                               console.log (contribution);
                    });
           }

        if (false) {
                    //console.log(d3.select("div.pulldown select.Contributor").selectAll("option").attr("selected"));
                    var bbox = d3.select("path#" + id).node().getBBox();
                    d3.selectAll("path#"+id).each(function(d){
                        var _bbox = d3.select(this).node().getBBox();
                        if (_bbox.width > bbox.width) {
                            bbox = _bbox;
                        }
                    });

                    var centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
                        x = -centroid[0],
                        y = -centroid[1],
                        k = (width / bbox.width) * 0.3;
                    centered = centroid;

                    g.transition()
                            .duration(1000)
                            .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")");

                    d3.selectAll("g.states").transition().style("opacity",0.35);
                    d3.selectAll("g.districts").transition().style("stroke-width","0.12px");
                    d3.selectAll("g.districts path").attr("class","district");

                    g.selectAll("path#" + id)
                            .attr("class","district active")
                            .style("fill",cScale(totalDonations[id]))
                            .style("stroke-width", "0.5px")
                            .classed(centered && function(d) { return d === centered; })
        }
          /*
                          d3.select("div.pulldown select.District").selectAll("option").remove();
                          d3.select("div.pulldown select.District").selectAll("option").data(districts_list)
                            .enter()
                              .append("option")
                                .attr("class","district")
                                .attr("id",function(d){if (! d.match(/,/)){return d;}})
                                .attr("value",function(d){return d;})
                                .text(function(d){if (d.match(/,/)){return "All Districts ... $" + totalDonations["AllContributors"].toFixed(2);} else {return d + " ... $" + totalDonations[d].toFixed(2);}})
                          d3.select("div.pulldown select.District")[0][0].value = selected_district;
          */
  } else if (district_or_contributor.match(/district/)) {


        //console.log(d3.select("div.pulldown select.Contributor").selectAll("option").attr("selected"));
        var bbox = d3.select("path#" + id).node().getBBox();
        d3.selectAll("path#"+id).each(function(d){
            var _bbox = d3.select(this).node().getBBox();
            if (_bbox.width > bbox.width) {
                bbox = _bbox;
            }
        });

        var centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
            x = -centroid[0],
            y = -centroid[1],
            k = (width / bbox.width) * 0.3;
        centered = centroid;

        g.transition()
                .duration(1000)
                .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")");

        d3.selectAll("g.states").transition().style("opacity",0.35);
        d3.selectAll("g.districts").transition().style("stroke-width","0.12px");
        d3.selectAll("g.districts path").attr("class","district");

        g.selectAll("path#" + id)
                .attr("class","district active")
                .style("fill",cScale(totalDonations[id]))
                .style("stroke-width", "0.5px")
                .classed(centered && function(d) { return d === centered; })

      /*
                            //var keepAllDonors = d3.select("div.pulldown select.Contributor").select("option").datum();
                            var donors_list = [keepAllDonors].sort(function(a,b){return totalDonations[a]-totalDonations[b];});

                            data.forEach(function(contribution){
                                if (donors_list.indexOf(contribution.contributor) === -1) {
                                        donors_list.push(contribution.contributor);
                                }
                            });


                              var option_selected = d3.select("div.pulldown select.Contributor")[0][0].value;
                              d3.select("div.pulldown select.Contributor").selectAll("option").remove();
                                d3.select("div.pulldown select.Contributor").selectAll("option").data(donors_list)
                              .enter()
                                .append("option")
                                  .attr("class","contributor")
                        //          .attr("value",function(d){if (d.match(/All /)){return donors_list;} else {return d}})
                                  .attr("id", function(d){if (! d.match(/,/)){return d;}})
                                  .attr("value", function(d){return d;})
                                  .attr("selected",function(d){console.log(option_selected); if (d.match(option_selected)){return "selected";}})
                                  .text(function(d){
                                    if (d.match(/,/) || d.match(/All /)) {return "All Donors ... $" + totalDonations["AllContributors"].toFixed(2);}
                                    else {return lookupDonorNames[d] + " ... $" + totalDonations[d].toFixed(2);}
                                  })
                                d3.select("div.pulldown select.Contributor")[0][0].value = option_selected;
    */
  }
}







//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*

    Click


 */



function click(d) {
  d3.selectAll("path.active").transition().style("stroke-width","0.12px");
  var id = d3.select(this).attr("id");
  //var donor_selected = d3.select("div.pulldown select.Contributor")[0][0].value;
  console.log(id);
  console.log(donor_selected);
  if (district_names.indexOf(id) > -1 ) {
    var x = 0,
        y = 0,
        k = 1;

    if (d && centered !== d) {
      var bbox = d3.select(this).node().getBBox(),
        centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
        x = -centroid[0],
        y = -centroid[1],
        k = (width / bbox.width) * 0.3;
      centered = d;
      d3.selectAll("g.states").transition().style("opacity",0.35);
      d3.selectAll("g.districts").transition().style("stroke-width","0.12px");
      d3.selectAll("path#"+d3.select(this).attr("id")).transition().style("stroke-width","0.5px");
      var donors = contributionsByDistrict[id].map(function(cbd){return cbd.contributor;}).unique().sort(function(a,b){return totalDonations[a]-totalDonations[b];});
      donors.filter(function(d){return !d.match(/function/);});
      console.log(donors);
      if (! donors[0].match(/,/)) {
        donors.unshift("All Donors");
      }

        /*
                  d3.select("div.pulldown select.Contributor").selectAll("option").remove();
                  d3.select("div.pulldown select.Contributor").selectAll("option").data(donors)
                    .enter()
                      .append("option")
                        .attr("class","contributor")
                        .attr("value",function(d){if (d.match(/All /)){return d3.select("hidden.AllDonors").attr("value");} else {return d}})
                        .text(function(d){
                          if (d.match(/,/) || d.match(/All /)) {
                            return "All Donors ... $" + totalDonations["AllContributors"].toFixed(2);
                          } else {
                            return lookupDonorNames[d] + " ... $" + totalDonations[d].toFixed(2);
                          }
                        });
                  d3.select("div.pulldown select.District")[0][0].value = id;
                  d3.select("div.pulldown select.Contributor")[0][0].value = donor_selected;
      */
    } else {
      centered = null;
      d3.selectAll("g.states").transition().style("opacity",1);
      d3.selectAll("g.districts").transition().style("stroke-width","0.5px");
      var getAllDonors = d3.select("div.pulldown hidden.AllDonors").attr("value");
      if (typeof donors_list === 'undefined') {
//        donors_list = contributionsByDistrict[d3.select(this).attr("id")].map(function(d){return d.contributor;});
        donors_list = d3.select("div.pulldown hidden.AllDonors").attr("value").split(",");
        donors_list.unshift(getAllDonors);
      }
      console.log(donors_list);
      /*
                  var selectedContributor = d3.select("div.pulldown select.Contributor option").attr("value");
                  d3.select("div.pulldown select.Contributor").selectAll("option").remove();
                  d3.select("div.pulldown select.Contributor").selectAll("option").data(donors_list)
                    .enter()
                      .append("option")
                        .attr("class","contributor")
                        .attr("value",function(d){if (d.match(/All /)){return getAllDonors;} else {return d}})
                        .text(function(d){
                          if (! d.match(/,/)) {
                            return lookupDonorNames[d] + " ... $" + totalDonations[d].toFixed(2);
                          } else {
                            return "All Donors ... $" + totalDonations["AllContributors"].toFixed(2);
                          }
                        });
                  d3.select("div.pulldown select.District")[0][0].value = d3.select("div.pulldown select.District option").attr("value");
      */
//    if (donors_list === d3.select("div.pulldown hidden.AllDonors").attr("value").split(",")) {
        //d3.select("div.pulldown select.Contributor")[0][0].value = getAllDonors;
//      } else {
//        d3.select("div.pulldown select.Contributor")[0][0].value = selectedContributor;
//      }
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });


    g.transition()
        .duration(1000)
        .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
//      .style("stroke-width", 1.5 / k + "px");

  }
}

// tooltip
function mouseover() {
  div.transition()
      .duration(500)
      .style("opacity", 1);
}


/*

    district Id should be of the form State-Code + districtId; i.e. CA-08
 */
function highLight(districtId) {
     var elementId = "path#" + districtId;
     d3.selectAll(elementId)
               .transition()
               .style("fill",colorScale(1));
}

// function mousemove() {
//   div
//       .text(d3.event.pageX + ", " + d3.event.pageY + "- this is a tooltip")
//       .style("left", (d3.event.pageX - 34) + "px")
//       .style("top", (d3.event.pageY - 12) + "px");
// }
function mousemove(district_or_contributor,id,d) {
  if (this.id) {
        helperGetContData(id)
  }            
  div
      .text( myval3 )
      .style("left", (d3.event.pageX - 34) + "px")
      .style("top", (d3.event.pageY - 12) + "px");

    }

function helperGetContData() {
       var district_id = id;
       var myval3 = "District : "  + district_id;
        if (contributionsByDistrict && contributionsByDistrict[district_id]) {
                contributionsByDistrict[district_id].map( function (cont) {
                        myval3 = myval3 + "\n"
                              + "Contributor:" + cont.contributor
                              + "\n" + "Amount:" + cont.contribution;
                          } );
      }
}



function mouseout() {
  div.transition()
      .duration(500)
      .style("opacity", 1e-6);
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

