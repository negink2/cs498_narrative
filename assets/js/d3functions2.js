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
        .text(companyData[0].CompanyName + " Stock Price " + dateRange + " in dollar")
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

        setCompanyAnnotation(svg, companyName, q);
        setCovidAnnotation(svg, q);



        // Legends
        svg.append("circle").attr("cx",100).attr("cy",730).attr("r", 6).style("fill", "#C3A4FC")
        svg.append("circle").attr("cx",100).attr("cy",760).attr("r", 6).style("fill", "#00cc99")
        svg.append("text").attr("x", 120).attr("y", 730).text(companyName + "'s Stock Price in dollar").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 120).attr("y", 760).text("The United States' Covid-19 Spread").style("font-size", "15px").attr("alignment-baseline","middle")

    }
}

function setCompanyAnnotation(svg, companyName, q){
    var line = svg.append('line').attr("class", "stock");
    var text1, text2, text3;
    // Apple
    if(companyName == 'Apple'){
        if(q==1){
            line
            .attr('x1', 545.6).attr('x2', 450)
            .attr('y1', 181.7).attr('y2', 181);

            var annx = 200;
            var anny = 182;
            var textStr1 = companyName + "'s stock price decreased";
            var textStr2 = "at the end of early pandemic";
            var textStr3 = "by decreasing covid-19 cases";
            text1 = svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2 = svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
            text3 = svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20 + 20)
            .text(textStr3);
        }
        if(q==2){
            line
            .attr('x1', 261.1417651146629).attr('x2', 261)
            .attr('y1', 236.59593750000005).attr('y2', 120);

            var annx = 180;
            var anny = 80;
            var textStr1 = companyName + "'s stock price started to increase";
            var textStr2 = "as covid-19 spreade increased rapidly";
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
        }
        if(q==3){
            line
            .attr('x1', 553.3166666666666).attr('x2', 373)
            .attr('y1', 108.90053763440856).attr('y2', 80);

            var annx = 153;
            var anny = 80;
            var textStr1 = companyName + "'s stock price increased";
            var textStr2 = "at the end of late pandemice";
            var textStr3 = "as covid-19 increased"
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
            text3=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20 + 20)
            .text(textStr3);
        }
    }
    // Amazon
    else if(companyName == 'Amazon'){
        if(q==1){
            line
            .attr('x1', 545.6333333333333).attr('x2', 400)
            .attr('y1', 174.316704805492).attr('y2', 281);

            var annx = 150;
            var anny = 282;
            var textStr1 = companyName + "'s stock price decreased";
            var textStr2 = "at the end of early pandemic";
            var textStr3 = "by decreasing covid-19 cases";
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
            text3=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20 + 20)
            .text(textStr3);
        }
        if(q==2){
            line
            .attr('x1', 207.32105628908965).attr('x2', 261)
            .attr('y1', 259.01068888888886).attr('y2', 120);

            var annx = 180;
            var anny = 80;
            var textStr1 = companyName + "'s stock price started to increase";
            var textStr2 = "as covid-19 spreade increased rapidly";
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
        }
        if(q==3){
            line
            .attr('x1', 553.3166666666666).attr('x2', 373)
            .attr('y1', 105.18723175965664).attr('y2', 80);

            var annx = 153;
            var anny = 80;
            var textStr1 = companyName + "'s stock price increased";
            var textStr2 = "at the end of late pandemice";
            var textStr3 = "as covid-19 increased"
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
            text3=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20 + 20)
            .text(textStr3);
        }
    }
    // Tesla
    else if(companyName == 'Tesla'){
        if(q==1){
            line
            .attr('x1', 545.6333333333333).attr('x2', 320)
            .attr('y1', 257.6590909090909).attr('y2', 151);

            var annx = 120;
            var anny = 90;
            var textStr1 = companyName + "'s stock price decreased";
            var textStr2 = "at the end of early pandemic";
            var textStr3 = "by decreasing covid-19 cases";
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
            text3=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20 + 20)
            .text(textStr3);
        }
        if(q==2){
            line
            .attr('x1', 222.69840166782487).attr('x2', 261)
            .attr('y1', 393.75949367088606).attr('y2', 120);

            var annx = 180;
            var anny = 80;
            var textStr1 = companyName + "'s stock price started to increase";
            var textStr2 = "as covid-19 spreade increased rapidly";
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
        }
        if(q==3){
            line
            .attr('x1', 553.3166666666666).attr('x2', 373)
            .attr('y1', 99.65087396504141).attr('y2', 80);

            var annx = 153;
            var anny = 80;
            var textStr1 = companyName + "'s stock price increased";
            var textStr2 = "at the end of late pandemice";
            var textStr3 = "as covid-19 increased"
            text1=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny)
            .text(textStr1);
            text2=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20)
            .text(textStr2);
            text3=svg.append("text").attr("class", "annotation1")
            .attr('x', annx)
            .attr('y', anny + 20 + 20)
            .text(textStr3);
        }
    }

    // Transitions
    line.attr("opacity", 0)
    .transition()
    .duration(2500)
    .ease(d3.easeLinear)
    .attr("opacity", 1);

    if(text1 != null){
        text1.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
    }

    if(text2 != null){
        text2.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
    }

    if(text3 != null){
        text3.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
    }
}

function setCovidAnnotation(svg, q){
    var text1, text2, text3;
    var line = svg.append('line').attr("class", "covid-country");
    if(q==1){
        line
        .attr('x1', 561).attr('x2', 300)
        .attr('y1', 563).attr('y2', 463);

        var annx = 200;
        var anny = 420;
        var textStr1 = "Covid-19 spread has decreased";
        var textStr2 = "at the end of early pandemic";
        var textStr3 = "after some fluctuations";
        text1=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny)
        .text(textStr1);
        text2=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny + 20)
        .text(textStr2);
        text3=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny + 20 + 20)
        .text(textStr3);

    }
    if(q==2){
        line
        .attr('x1', 222.69840166782487).attr('x2', 361)
        .attr('y1', 629.9851635104783).attr('y2', 564);

        var annx = 380;
        var anny = 564;
        var textStr1 = "Covid-19 spread";
        var textStr2 = "started to increase rapidly";        
        text1=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny)
        .text(textStr1);
        text2=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny + 20)
        .text(textStr2);

    }
    if(q==3){
        line
        .attr('x1', 561).attr('x2', 361)
        .attr('y1', 119.89698420717377).attr('y2', 240);

        var annx = 230;
        var anny = 270;
        var textStr1 = "Covid-19 spread";
        var textStr2 = "increased rapidly in late pandemic";        
        text1=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny)
        .text(textStr1);
        text2=svg.append("text").attr("class", "annotation2")
        .attr('x', annx)
        .attr('y', anny + 20)
        .text(textStr2);

    }

    // Transitions
    line.attr("opacity", 0)
    .transition()
    .duration(2500)
    .ease(d3.easeLinear)
    .attr("opacity", 1);

    if(text1 != null){
        text1.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
    }

    if(text2 != null){
        text2.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
    }

    if(text3 != null){
        text3.attr("opacity", 0)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
    }
}