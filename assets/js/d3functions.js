function render(data){

    if(data !== undefined && data != null && data.length > 0){
        //&& covid !== undefined && covid != null && covid.length > 0){
        
        var width = 500;
        var height = 650;
        var margin = 100;
        var labelXX = width - data.length/3 - margin/3;
        var labelXY = 700;
        var labelYX = margin/3;
        var labelYY = -(height + margin)/2;
        
        

        var svg = d3.select(".svg-container").append("svg")
        .attr("width", 800)
        .attr("height", 800);

        // X
        const xScale = d3.scaleTime().domain(d3.extent(data, d => {
            var dd = new Date(d.Date).toLocaleDateString('en-ca');
            return d3.timeParse("%Y-%m-%d")(dd)            
        }))

        var xAxis = xScale
        .range([0, width + data.length ]);    
        
        svg.append("g")
        .attr("transform", "translate("+margin+"," + height + ")")
        .call(d3.axisBottom(xAxis));

        var x = xScale
        .range([margin, width + data.length ]);

        // Y
        var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            var high = d.High.replace('$', '');
            var cases = parseInt(high);
            var cases = cases < 0 ? 0: cases;
            return cases;
        })])
        .range([ height, margin ]);
        svg.append("g")
        .attr("transform", "translate("+margin+",0)")
        .call(d3.axisLeft(y));

        // X Axis Label
        svg.append("text")
        .attr("x", labelXX )
        .attr("y",  labelXY)
        .style("text-anchor", "middle")
        .text("Date");

        // Y Axis Label
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", labelYX)
        .attr("x", labelYY)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Stock Growth from Jan. 2020 to Jul. 2020");






        // Vertical Lines
        // March
        svg
        .append("line")
        .attr("x1",297)
        .attr("y1",100)
        .attr("x2",297)
        .attr("y2",650)
        .style("stroke", "black")

        // May
        svg
        .append("line")
        .attr("x1",499.5)
        .attr("y1",100)
        .attr("x2",499.5)
        .attr("y2",650)
        .style("stroke", "black");

        var rect1 = svg.append("rect")
        .attr("x", 100)
        .attr("y", 100)        
        .attr("width", 197.5)
        .attr("height", 550)
        .style("fill", "white")
        .style("opacity", "0")
        .style("cursor", "pointer")
        .attr("class", "rect")
        .on("mouseover", function(){
            rect1.style("opacity", "0.5")
            .style("fill", "#FF7A33");

            mouseMoveText();
        })
        .on("mouseout", function(){
            rect1.style("opacity", "0")
            .style("fill", "white");
            mouseMoveUnbind();
        })
        .on("click", function(){
            window.location.href = "index2.html?q=1&company=" + data[0].CompanyName;
        });

        var rect2 = svg.append("rect")
        .attr("x", 296.5)
        .attr("y", 100)
        .attr("width", 203)
        .attr("height", 550)
        .style("fill", "white")
        .style("opacity", "0")
        .style("cursor", "pointer")
        .attr("class", "rect")
        .on("mouseover", function(){
            rect2.style("opacity", "0.5")
            .style("fill", "#FF7A33");

            mouseMoveText();
        })
        .on("mouseout", function(){
            rect2.style("opacity", "0")
            .style("fill", "white");
            mouseMoveUnbind();
        })
        .on("click", function(){
            window.location.href = "index2.html?q=2&company=" + data[0].CompanyName;
        });

        var rect3 = svg.append("rect")
        .attr("x", 500)
        .attr("y", 100)
        .attr("width", 203)
        .attr("height", 550)
        .style("fill", "white")
        .style("opacity", "0")
        .style("cursor", "pointer")
        .attr("class", "rect")
        .on("mouseover", function(){
            rect3.style("opacity", "0.5")
            .style("fill", "#FF7A33");
            mouseMoveText();
        })
        .on("mouseout", function(){
            rect3.style("opacity", "0")
            .style("fill", "white");
            mouseMoveUnbind();            
        })
        .on("click", function(){
            window.location.href = "index2.html?q=3&company=" + data[0].CompanyName;
        });




        var line = d3.line()
            .x(function(d) {
                var dd = new Date(d.Date).toLocaleDateString('en-ca'); 
                var ddate = d3.timeParse("%Y-%m-%d")(dd)       
                return x(ddate);
            })
            .y(function(d) {
                var high = d.High.replace('$', '');
                var cases = parseInt(high);
                var cases = cases < 0 ? 0: cases;
                return y(cases) 
            });

        // line
        var pth = svg
        .append("path")            
        .datum(data)
        .attr("d", line)
        .attr("class", "line-company")
        .attr("fill", "none")
        .attr("stroke-width", 2);

        var lineLength = d3.select(".line-company").node().getTotalLength();
        d3.selectAll(".line-company")
        .attr("stroke-dasharray", lineLength + " " + lineLength)
        .attr("stroke-dashoffset", lineLength)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);        





        // Tooltip        
        var div = d3.select("body").append("div")	
        .attr("class", "tooltip tooltip-company")				
        .style("opacity", 0);

        var dots = svg.selectAll("dot")	
        .data(data)
        .enter().append("circle")        
        .attr("class", "dots-company")
        .attr("r", 3)		
        .attr("cx", function(d) {
            var dd = new Date(d.Date).toLocaleDateString('en-ca'); 
            var ddate = d3.timeParse("%Y-%m-%d")(dd);
            return x(ddate); 
        })		 
        .attr("cy", function(d) { 
            var high = d.High.replace('$', '');
            return y(high); 
        })
        .on("mouseover", function(d) {
            rect1.style("opacity", "0")
            .style("fill", "white");
            div.transition()		
            .duration(200)		
            .style("opacity", .9);        		
            var htmlContent = "<div>Company: <span>" + d.CompanyName + "</span><br/></div>";
            htmlContent += "<div>Date: <span>" + d.Date + "</span><br/></div>";
            htmlContent += "<div>Highest Price: <span>" + d.High + "</span><br/></div>";            
            div.html(htmlContent)	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })
        .on("mouseout", function(d) {		
            div.transition()		
            .duration(500)
            .style("opacity", 0);	
        });

        dots.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1)
        .attr("stroke-dashoffset", lineLength)

    }
}

function mouseMoveText(){
    $(".rect").mousemove(function(e){
        var cpos = { top: e.pageY + 10, left: e.pageX + 10 };
        $('.besideMouse').offset(cpos);
        $('.besideMouse').show();
     });
}

function mouseMoveUnbind(){
    $( ".rect" )
    .off( "mousemove", ".besideMouse", mouseMoveText); 
    $('.besideMouse').hide();
}