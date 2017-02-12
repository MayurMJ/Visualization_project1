var mydata = [];
var x, y, bins;
$("#table_container").data("binname", "Group");
$("#table_container").data("chartname", "bar");
$("#table_container").data("Bins", bins);


function generateBins(mydata, ticks) {
    
     x = d3.scaleLinear()
     .domain([0,d3.max(mydata)]);

     bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(ticks))
    (mydata);

    $("#table_container").data("Bins", bins);
}



d3.csv("PSID.csv", function(error, data) {
  if (error) throw error;

  var navMenu = d3.select("#table_container");
  var options = navMenu.selectAll("li")
               .data(Object.keys(data[0]))
               .enter()
               .append("li")
               .append("a")
               .attr("href", "#")
               .text(function (d) {return d;})
               .on("click", function (attri) { 
                //.attr("class", "active"); 
                $("#table_container").data("binname", attri);
                mydata.length = 0;
                if($("#table_container").data("chartname") == "bar")
                   populateandDrawHist(attri);
                if($("#table_container").data("chartname") == "pie")
                   populateandDrawPie(attri);
                   
                });



$("#bar").click(function() {
  var attri = $("#table_container").data("binname");
  $("#table_container").data("chartname", "bar");
  populateandDrawHist(attri);

});

$("#pie").click(function() {
  var attri = $("#table_container").data("binname");
  $("#table_container").data("chartname", "pie");
  populateandDrawPie(attri);
});

function populateandDrawHist(attr) {
  mydata.length = 0;
  data.forEach(function(d) {
                  if (d[attr] != 0)
                  mydata.push(d[attr]);
                  });
  debugger;
  generateBins(mydata, 12);
  drawHistogram(mydata);
}

function populateandDrawPie(attr) {
  mydata.length = 0;
  data.forEach(function(d) {
                  if (d[attr] != 0)
                  mydata.push(d[attr]);
                  });
  generateBins(mydata, 10);
  drawPie(mydata);
}
});

 
function drawPie(mydata) {
  
  d3.selectAll("g").remove();


  //var data = [{"letter":"q","presses":1},{"letter":"w","presses":5},{"letter":"e","presses":2}];
  var data = [];
  var i =0;
  bins = $("#table_container").data("Bins");
  bins.forEach(function(d) {
                     data[i] = {range : d.x0 + "-" + d.x1 , count: d.length };
                     i = i+1;
                   });
  var width = 960,
  height = 400,
  radius = Math.min(width, height) / 2;

  var legendRectSize = 18;
  var legendSpacing = 4; 

  var color = d3.scaleOrdinal()
 // .range(["#6363FF", "#6373FF", "#63A3FF", "#63E3FF", "#63FFFB", "#63FFCB",
        //       "#63FF9B", "#63FF6B", "#7BFF63", "#BBFF63", "#DBFF63", "#FBFF63", 
         //      "#FFD363", "#FFB363", "#FF8363", "#FF7363", "#FF6364"])
  //.range(["#00FFFF", "#fa8072", "#228B22", "#0000FF", "#8A2BE2", "#A52A2A", "#5F9EA0", "#7FFF00", "#6495ED", "#DC143C", "#00008B", "#006400", "#8B008B", "#556B2F", "#8B0000", "#FFD700", "#D3D3D3",  "#FF4500", "#FF0000", "#7CFC00"]);
  .range(d3.schemeCategory20);

  var pie = d3.pie()
  .sort(null)
  .startAngle(1.1*Math.PI)
  .endAngle(3.1*Math.PI)
  .value(function(d) { return d.count;})
  (data);

  var arc = d3.arc()
  .outerRadius(radius - 10)
  .innerRadius(radius - 100);
  
  var labelArc = d3.arc()
  .outerRadius(radius - 40)
  .innerRadius(radius - 40);

  var svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("fill" , "white")
  .append("g")
  .attr("transform", "translate(" + width/2 + "," + height/2 +")"); 

  var g = svg.selectAll("arc")
  .data(pie)
  .enter()
  .append("g")
  .attr("class", "arc")
  .on("click", function() {
       $("#table_container").data("chartname", "bar");
       drawHistogram(mydata); 
    });

  g.append("path")
  //.attr("d", arc)
  .style("fill", function(d) { return color(d.data.range);})
  .transition().delay(function(d, i) { return i * 150; }).duration(10)
  .attrTween('d', function(d) {
       var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
       return function(t) {
           d.endAngle = i(t);
         return arc(d);
       }
  });

   g.append("text")
   .attr("transform", function(d) { return "translate(" + labelArc.centroid(d)  + ")"; })
   .text(function(d) { return d.data.count;}) 
   .style("fill", "#fff");

  var legend = svg.selectAll('.legend')                     
          .data(color.domain())                                   
          .enter()                                                
          .append('g')                                            
          .attr('class', 'legend')                                
          .attr('transform', function(d, i) {                     
            var height = legendRectSize + legendSpacing;          
            var offset =  height * color.domain().length / 2;     
            var horz = 12 * legendRectSize;                       
            var vert = i * height - offset;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });                                                     

        legend.append('rect')                                     
          .attr('width', legendRectSize)                          
          .attr('height', legendRectSize)                         
          .style('fill', color)                                   
          .style('stroke', color);                                
          
        legend.append('text')                                     
          .attr('x', legendRectSize + legendSpacing)              
          .attr('y', legendRectSize - legendSpacing)              
          .text(function(d) { return d; })
          .style("fill", "black");                       


}

  

function drawHistogram(mydata) {
    
    

    d3.selectAll("g").remove();
    var svg = d3.select("svg"),
    margin = {top: 10, right: 30, bottom: 30, left: 100},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .on("contextmenu", function() {
          d3.event.preventDefault();
         $("#table_container").data("chartname", "pie");
         drawPie(mydata); 
    });
    bins = $("#table_container").data("Bins");

    var pastpos =margin.left;
    var ticks = 10;
    var offset = width / 10;
    var drag1 = d3.drag()
         //.subject(function() { 
             // return { x: d3.event.x, y: 0}
         //})
        
        .on("end", function(d,i) {
               // d3.event.sourceEvent.stopPropagation();
               pastpos = d3.event.x;
               ticks = 10;
            })
        .on("drag", function(d,i) {
               // d3.event.sourceEvent.stopPropagation();
                console.log(ticks + "," + offset + "," + d3.event.x + "," + pastpos);
                //return "translate(" + [ d3.event.x,d3.event.y ] + ")"
                if(d3.event.x > pastpos) {
                     if(d3.event.x - pastpos > offset ) {
                      ticks = ticks + 1;;
                      generateBins(mydata, ticks);
                      drawHistogram(mydata);
                      pastpos = d3.event.x;
                     }
                }
                if(d3.event.x < pastpos) {
                 if(pastpos - d3.event.x > offset ) {
                      ticks--;
                      generateBins(mydata, ticks);
                      drawHistogram(mydata);
                      pastpos = d3.event.x;
                     }
                }
                
            })
        .on("end", function(d,i) {
               // d3.event.sourceEvent.stopPropagation();
               pastpos = d3.event.x;
               ticks = 10;
            });
        //});

svg.call(drag1);

    // .on("mouseenter", function() {
    //    var coordinates = [0, 0];
    //    coordinates = d3.mouse(this);
    //    var x = coordinates[0];
    // })

    
     x.range([0, width]);
     

    var y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) { return (d.length * 1.1); })])
    .range([height, 0]);

    var refBin;

     bins.some(function(d) {
                     refBin = d;
                     return !(d.length === 0);
                   });
  
    

    var bar = g.selectAll(".bar")
    .data(bins)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

     bar.append("rect")
    .attr("x", 1)
    .attr("width", x(refBin.x1) - x(refBin.x0) - 7)
    .attr("height", function(d) { return height - y(d.length); })
    .attr("fill", "steelblue")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);


     bar.append("text")
    .attr("dy", ".75em")
    .attr("y",-12)
    .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .style("display", "none")
    .text(function(d) { return d.length; });

    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));




      function handleMouseOver(d, i) {
            
            var translateY = d3.max(bins, function(d) { return (d.length * 1.1); }) / 24.475;
            var translateX =  d3.max(mydata) / 150.20;
             d3.select(this.parentNode)
            .attr("transform", function(d) { return "translate(" + x(d.x0 - translateX) + "," + y(d.length + translateY) + ")"; })
            .select("text")
            .style("display" , "block");
            


            var changeBar = d3.select(this);
             changeBar
            .attr("fill", "green")
            .attr("width", (x(bins[0].x1) - x(bins[0].x0)  + 2))
            .attr("height", function(d) { return (height - (y(d.length + translateY)) ); });


             //  changeBar.append("text")
             // .attr("dy", ".75em")
             // .attr("y", 6)
             // .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
             // .attr("text-anchor", "middle")
             // .text(5);

            


            // Specify where to put label of text
            // svg.append("text").attr({
            //    id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
            //     x: function() { return xScale(d.x) - 30; },
            //     y: function() { return yScale(d.y) - 15; }
            // })
            // .text(function() {
            //   return [d.length];  // Value of the text
            // });
          }
          function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            
            d3.select(this.parentNode)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .select("text")
            .style("display" , "none");


            d3.select(this)
            .attr("fill", "steelblue")
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 10)
            .attr("height", function(d) { return height - y(d.length); });

            
            // Select text by id and then remove
            //d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
          }
}