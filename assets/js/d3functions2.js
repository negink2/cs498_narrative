function render(data, companyData, dateRange, q) {

    if(data !== undefined && data != null && data.length > 0
        && companyData !== undefined && companyData != null && companyData.length > 0){

        var width = 500;
        var height = 650;
        var margin = 100;
        var labelXX = width - data.length/2 - margin;
        var labelXY = 700;
        var labelYX = margin/3;
        var labelYY = -(height + margin)/2;
        var labelY2X = width + margin + margin/2;
        var labelY2Y = -(height + margin)/2;
        

        var svg = d3.select(".svg-container").append("svg")
        .attr("width", 800)
        .attr("height", 800);

        // X
        const xScale = d3.scaleTime().domain(d3.extent(data, d => {
            //if(d.date != "2019-12-31"){
            return d3.timeParse("%Y-%m-%d")(d.date)
            //}
        }))

        var xAxis = xScale
        .range([0, width ]);    
        
        svg.append("g")
        .attr("transform", "translate("+margin+"," + height + ")")
        .call(d3.axisBottom(xAxis));

        var x = xScale
        .range([margin, width + data.length ]);

        // Y
        var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            var cases = parseInt(d.new_cases);
            var cases = cases < 0 ? 0: cases;
            return cases;
        })])
        .range([ height, margin ]);
        svg.append("g")
        .attr("class", "left-axis")
        .attr("transform", "translate("+margin+",0)")
        .call(d3.axisLeft(y));



        // Y2
        var y2 = d3.scaleLinear()
        .domain([0, d3.max(companyData, function(d) {
            var high = d.High.replace('$', '');
            high = parseInt(high);
            high = high < 0 ? 0: high;
            return high;
        })])
        .range([ height, margin ]);
        svg.append("g")
        .attr("class", "right-axis")
        .attr("transform", "translate("+ 601  +",0)")
        .call(d3.axisRight(y2));



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
        .text("United States' New Covid-19 Cases " + dateRange)
        .attr("class", "left-axis-label");


        // Y2 Axis Label
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", labelY2X)
        .attr("x", labelY2Y)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(companyData[0].CompanyName + " Stock High Price " + dateRange + " in dollar")
        .attr("class", "right-axis-label");


        // svg.selectAll(".bar")
        //  .data(companyData)
        //  .enter().append("rect")
        //  .attr("class", "bar")
        //  .attr("x", function(d) { 
        //     var dd = new Date(d.Date).toLocaleDateString('en-ca');
        //      ddate = d3.timeParse("%Y-%m-%d")(dd)
        //      return x(ddate); 
        //  })
        //  .attr("y", function(d) { 
        //     var high = d.High.replace('$', '');
        //     high = parseInt(high);
        //     high = high < 0 ? 0: high;
        //     return y2(high);
        //  })
        //  .attr("width", 5)
        //  .attr("height", function(d) { 
        //     var high = d.High.replace('$', '');
        //     high = parseInt(high);
        //     high = high < 0 ? 0: high;
        //      return height - y2(high); 
        //  });

        // Company Line

        var line2 = d3.line()
        .x(function(d) {
            var dd = new Date(d.Date).toLocaleDateString('en-ca'); 
            var ddate = d3.timeParse("%Y-%m-%d")(dd)       
            return x(ddate);
        })
        .y(function(d) {
            var high = d.High.replace('$', '');
            var cases = parseInt(high);
            var cases = cases < 0 ? 0: cases;
            return y2(cases) 
        });

        // line
        var pth2 = svg
        .append("path")            
        .datum(companyData)
        .attr("d", line2)
        .attr("class", "line-company")
        .attr("fill", "none")
        .attr("stroke-width", 2);

        var lineLength2 = d3.select(".line-company").node().getTotalLength();
        d3.selectAll(".line-company")
        .attr("stroke-dasharray", lineLength2 + " " + lineLength2)
        .attr("stroke-dashoffset", lineLength2)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);        






        var line = d3.line()
            .x(function(d) { 
                var ddate = "";
                //if(d.date != "2019-12-31"){
                ddate = d3.timeParse("%Y-%m-%d")(d.date)
                //}                   
                return x(ddate);
            })
            .y(function(d) {
                var cases = parseInt(d.new_cases);
                var cases = cases < 0 ? 0: cases;
                return y(cases) 
            });

        // line
        var pth = svg
        .append("path")            
        .datum(data)
        .attr("d", line)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke-width", 2);

        var lineLength = d3.select(".line").node().getTotalLength();
        d3.selectAll(".line")
        .attr("stroke-dasharray", lineLength + " " + lineLength)
        .attr("stroke-dashoffset", lineLength)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);


        // Tooltip        
        var div = d3.select("body").append("div")	
        .attr("class", "tooltip tooltip-default")				
        .style("opacity", 0);

        var dots = svg.selectAll("dot")	
        .data(data)
        .enter().append("circle")        
        .attr("class", "dots")
        .attr("r", 3)		
        .attr("cx", function(d) { return x(d3.timeParse("%Y-%m-%d")(d.date)); })		 
        .attr("cy", function(d) { return y(d.new_cases); })
        .on("mouseover", function(d) {        	
            div.transition()		
            .duration(200)		
            .style("opacity", .9);        		
            var htmlContent = "<div>Covid-19 Cases of the <span>" + d.location + "</span><br/></div>";
            htmlContent += "<div>Date: <span>" + d3.timeFormat("%m/%d/%Y")(d3.timeParse("%Y-%m-%d")(d.date)) + "</span><br/></div>";
            htmlContent += "<div>Number of New Cases: <span>"  + formatNumber(d.new_cases) + "</span><br/></div>";
            htmlContent += "<div>Covid-19 Death Rate: <span>" + formatNumber(d.cvd_death_rate) + "</span><br/></div>";
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


        // Tooltip Company

        var div2 = d3.select("body").append("div")	
        .attr("class", "tooltip tooltip-company")				
        .style("opacity", 0);

        var dots2 = svg.selectAll("dot")	
        .data(companyData)
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
            return y2(high); 
        })
        .on("mouseover", function(d) {
            div2.transition()		
            .duration(200)		
            .style("opacity", .9);        		
            var htmlContent = "<div>Company: <span>" + d.CompanyName + "</span><br/></div>";
            htmlContent += "<div>Date: <span>" + d.Date + "</span><br/></div>";
            htmlContent += "<div>Highest Price: <span>" + d.High + "</span><br/></div>";            
            div2.html(htmlContent)	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })
        .on("mouseout", function(d) {		
            div2.transition()		
            .duration(500)
            .style("opacity", 0);	
        });

        dots2.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1)
        .attr("stroke-dashoffset", lineLength2)


        // Annotations
        var companyName = companyData[0].CompanyName;
        var ann1x = getAnnotationPosition('x',companyName, q);
        var ann1y = getAnnotationPosition('y',companyName, q);
        const annotations1 = [
            {
              note: {
                //title: "Here is the annotation label",
                label: companyName + "'s Stock Price"
              },
              x: ann1x,
              y: ann1y
              //,dy: -80,
              //dx: 10
            }
          ];

        var ann2x = getAnnotationPosition('x', 'covid', q);
        var ann2y = getAnnotationPosition('y', 'covid', q);
        const annotations2 = [
            {
                note: {
                  label: "United States' Covid-19 Spread",
                  //title: 'United States Covid-19 Spread'
                },
                x: ann2x,
                y: ann2y
                //,dy: 80,
                //dx: 10
              }
          ];
        const makeAnnotations1 = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations1)
        svg
        .append("g")
        .attr("class", "annotation1")
        .call(makeAnnotations1)

        const makeAnnotations2 = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations2)
        svg
        .append("g")
        .attr("class", "annotation2")
        .call(makeAnnotations2)



        // Legends
        svg.append("circle").attr("cx",100).attr("cy",730).attr("r", 6).style("fill", "#C3A4FC")
        svg.append("circle").attr("cx",100).attr("cy",760).attr("r", 6).style("fill", "#00cc99")
        svg.append("text").attr("x", 120).attr("y", 730).text(companyName + "'s Stock Price in dollar").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 120).attr("y", 760).text("The United States' Covid-19 Spread").style("font-size", "15px").attr("alignment-baseline","middle")

    }
}

function getAnnotationPosition(xory, type, q){
    result = 0    
    if(type == "covid"){
        if(xory == 'x'){
            if(q==1){
                result = 230;
            }
            else{
                result = 330;
            }
        }
        else if(xory=='y'){
            if(q==3){
                result = 480;
            }
            else{
                result = 500;
            }
        }
    }
    else if(type == "Amazon"){
        if(xory == 'x'){
            result = 150;
        }
        else if(xory=='y'){
            result = 130;
        }
    }     
    else if(type == "Apple"){
        if(xory == 'x'){
            if(q==1){
                result = 170;
            }
            else{
                result = 190;
            }
        }
        else if(xory=='y'){
            result = 130;
        }        
    }
    else if(type == "Tesla"){
        if(xory == 'x'){
            if(q==1){
                result = 170;
            }
            else{
                result = 190;
            }
        }
        else if(xory=='y'){
            result = 130;
        }        
    } 
    return result;
}