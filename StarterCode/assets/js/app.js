var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 10;
var labelArea = 110;
var padding = 45;

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

var BottomText =  (width - labelArea)/2 + labelArea;
var SideText = height - margin - padding;
xText.attr("transform",`translate(
    ${BottomText}, 
    ${SideText})`
    );

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

svg.append("g").attr("class", "Y_Text");
var Y_Text = d3.select(".Y_Text");

var SideTextX =  margin + padding;
var SideTexty = (height + labelArea) / 2 - labelArea;
Y_Text.attr("transform",`translate(
    ${SideTextX}, 
     ${SideTexty}
    )rotate(-90)`
    );

Y_Text .append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

Y_Text .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

Y_Text .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (data) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   var crntX = "poverty";
   var crntY = "obesity";

   var ToolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {

            var state = `<div>${d.state}</div>`;
            var yLine = `<div>${crntY}: ${d[crntY]}%</div>`;
            if (crntX === "poverty") {
                xLine = `<div>${crntX}: ${d[crntX]}%</div>`}          
            else {
                xLine = `<div>${crntX}: ${parseFloat(d[crntX]).toLocaleString("en")}</div>`;}             
            return state + xLine + yLine  
        });

    svg.call(ToolTip);

    function  labelUpdate(axis, clickText) {

        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        clickText.classed("inactive", false).classed("active", true);
        }

    function yMinMax() {
        yMin = d3.min(data, function(d) {
          return parseFloat(d[crntY]) * 0.85;
        });
        yMax = d3.max(data, function(d) {
          return parseFloat(d[crntY]) * 1.15;
        }); 
      }
    function xMinMax() {
      xMin = d3.min(data, function(d) {
        return parseFloat(d[crntX]) * 0.85;
      });
      xMax = d3.max(data, function(d) {
        return parseFloat(d[crntX]) * 1.15;
      });     
    }

    xMinMax();
    yMinMax();

    var ScaleY = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])
    var ScaleX = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var Y_Axis = d3.axisLeft(ScaleY);
    var X_Axis = d3.axisBottom(ScaleX);

    function tickCount() {
      if (width <= 530) {
         X_Axis.ticks(5);
         Y_Axis.ticks(5);
      }
      else {
          X_Axis.ticks(10);
          Y_Axis.ticks(10);
      }        
    }
    tickCount();

    svg.append("g")
        .call(Y_Axis)
        .attr("class", "Y_Axis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );
    svg.append("g")
        .call(X_Axis)
        .attr("class", "X_Axis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    var circles = svg.selectAll("g circles").data(data).enter();

    circles.append("circle")
        .attr("cx", function(d) {

            return ScaleX(d[crntX]);
        })
        .attr("cy", function(d) {
            return ScaleY(d[crntY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {

            ToolTip.show(d, this);

            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {

            ToolTip.hide(d);

            d3.select(this).style("stroke", "#e3e3e3")
        });

        circles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return ScaleX(d[crntX]);
            })
            .attr("dy", function(d) {

              return ScaleY(d[crntY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                ToolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                ToolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              if (self.classed("inactive")) {

                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  crntX = name;

                  xMinMax();
                  ScaleX.domain([xMin, xMax]);

                  svg.select(".X_Axis")
                        .transition().duration(800)
                        .call(X_Axis);
                  
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return ScaleX(d[crntX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return ScaleX(d[crntX])                          
                        });
                  });          

                  labelUpdate(axis, self);
                }


                else {
                  crntY = name;

                  yMinMax();
                  ScaleY.domain([yMin, yMax]);

                  svg.select(".Y_Axis")
                        .transition().duration(800)
                        .call(Y_Axis);

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                      .transition().duration(800)
                      .attr("dy", function(d) {

                          return ScaleY(d[crntY]) + cRadius/3;                          
                      });
                });
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return ScaleY(d[crntY])                
                        });                       
                  });   

                  labelUpdate(axis, self);
                }
              }
          });
}