const gradientsMap = {
    p: {top: "#1C76A1", bottom: "#003F5C", border: "#46B2E5"},
    d: {top: "#EC4382", bottom: "#881D4B", border: "#FF659F"},
    g: {top: "#90A11C", bottom: "#585C00", border: "#E5DB46"},
    b: {top: "#48D2B1", bottom: "#205C56", border: "#25F1C0"}
};

const attachToolTip = (id) => {
    d3.select("#" + id + "-tooltip").remove();

    let tooltip = d3.select("body").append("div")
        .attr("id", id + "-tooltip")
        .attr("class", "tooltip d3-tooltip bs-tooltip-right")
        .style("opacity", 0)
        .style("display", "none")
        .style("pointer-events", "none")
        .style("position", "absolute");

    tooltip.append("div")
        .attr("class", "arrow");

    let tooltipContent = tooltip
        .append("div")
        .attr("class", "tooltip-inner")
        .style("margin-top", "-.2vw")
        .style("margin-left", "-.1vw")
        .style("min-width", "7vw")
        .style("max-width", "8vw")
        .style("min-height", "2vw")
        .style("padding", ".25vw")
        .style("position", "absolute");

    tooltipContent.append("div")
        .attr("class", "tooltip-top-text")
        .style("font-size", "14px")
        .style("text-align", "center")
        .style("padding-bottom", ".1vw")
        .style("font-family", "'Roboto', sans-serif");

    tooltipContent.append("div")
        .attr("class", "tooltip-bottom-text")
        .style("font-size", "14px")
        .style("text-align", "center")
        .style("font-family", "'Roboto', sans-serif");
};

const displayToolTip = (id, textTop, textBottom) => {
    let tooltip = d3.select("#" + id + "-tooltip")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY) + "px")
        .style("display", "block");

    if(textTop) {
        tooltip.select(".tooltip-top-text")
            .text(textTop);
    }

    if (textBottom) {
        tooltip.select(".tooltip-bottom-text")
            .text(textBottom);
    }

    tooltip
        .transition()
        .duration(500)
        .style("opacity", 1)
        .style("top", (d3.event.pageY - 20) + "px");
};

const hideToolTip = (id) => {
    d3.select("#" + id + "-tooltip")
        .transition()
        .duration(500)
        .style("top", (d3.event.pageY) + "px")
        .style("opacity", 0);
};

const drawGroupedBarChart = (chartName, groupChartData, arrayLength=false) => {
    if(groupChartData && groupChartData.length) {
        let data = [];

        if(arrayLength) {
            data = groupChartData.slice(0, arrayLength);
        } else {
            data = groupChartData;
        }

        let params = {
            margin: {top: 0, right: 10, bottom: 30, left: 10},
            width: 1000,
            height: 250,
            groupBy: 'quarter',
            barWidth: 7.5
        };

        params.barWidth = (params.barWidth + (200 / data.length)).toFixed(2);

        //////////// SET AXIS DATA FOR BAR CHART /////////////
        let x0 = d3.scale.ordinal()
            .rangeRoundBands([0, params.width]);

        let x1 = d3.scale.ordinal();

        let y = d3.scale.linear()
            .range([params.height, 0]);

        const yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-params.width)
            .outerTickSize(0)
            .tickPadding(10);

        //////////// SET DOMAIN & RANGE FOR BAR CHART /////////////
        let xAxisValues = _.uniq(data, function(d) {
            return d[params.groupBy];
        }, true);

        x0.domain(xAxisValues.map((x)=> {
            return x[params.groupBy];
        }));

        const xAxis = d3.svg.axis()
            .scale(x0)
            .orient("bottom")
            .tickFormat(function(d) {
                // location quarter data in quarter string;
                let quarterAbbrev = d.match(/[Q]\d{1}/g)[0];
                // return quarter data plus year if quarterAbbrev is 'Q1'
                return (quarterAbbrev === "Q1") ? d.replace(/-/g, ' ') : quarterAbbrev;
            });

        x1.rangeRoundBands([0, x0.rangeBand(), .5]);

        let yRange = d3.max(data, function(d) {
            if(Number(d.quantity)) {
                return Number(d.quantity);
            }});

        y.domain([0, yRange]);

        //////////// SET NODE ELEMENTS FOR BAR CHART /////////////

        //group data by key set in params
        const dataObj = _.groupBy(data, function(obj) {
            return obj[params.groupBy];
        });

        // break up data into group of arrays
        const dataArray = Object.keys(dataObj).map(function (key) { return dataObj[key]; });

        d3.select("svg").remove();

        let svg = d3.select('.' + chartName)
            .append("svg")
            .attr("class", "group-bar-chart")
            .attr("viewBox",
                "0 0 " +
                (params.width + params.margin.left + params.margin.right) + " " +
                (params.height + params.margin.top + params.margin.bottom))
            .append("g")
            .attr("transform", "translate(" + params.margin.left + "," + params.margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + params.height + ")")
            .style("font-family", "'Roboto', sans-serif")
            .style("font-size", "12px")
            .style("fill", "#f2f2f2")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em");

        let barGroup = svg.selectAll(".bar-group")
            .data(dataArray)
            .enter()
            .append("g")
            .attr("class", "g")
            .attr("cursor", "default")
            .attr("transform", function (d) {
                return "translate(" + x0(d[0].quarter) + ",0)";
            });

        for (const key of Object.keys(gradientsMap)) {
            const gradient = svg.append("defs")
                .append("linearGradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
                .attr("id", function () {
                    return "gradient_" + key;
                });

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", gradientsMap[key].bottom);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", gradientsMap[key].top);
        }

        let barCounter = 0;

        barGroup.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                if (i === 0) {
                    //reset x1 domain to fit each group array size
                    let parentData = d3.select(this.parentNode).datum();
                    x1.domain(parentData.map((x)=> {
                        return x.cost;
                    }));
                }
                return x1(d.cost);
            })
            .attr("y", function (d) {
                let Qty = Number(d.quantity) || 0.5;
                return y(Qty);
            })
            .attr("height", function (d) {
                let Qty = Number(d.quantity) || 0.5;
                return params.height - y(Qty);
            })
            .attr("width", params.barWidth)
            .style("cursor", "pointer")
            .attr("data-index", function(d) {
                barCounter++;
                return d.index;
            })
            .attr("data-server", function(d) {
                return d.product.replace(/\s/g, '');
            })
            .attr("fill", function (d) {
                const grade = d.grade.toLowerCase()[0];
                return "url(#gradient_" + grade + ")";
            })
            .attr("stroke", function (d) {
                return gradientsMap[d.grade.toLowerCase()[0]].border;
            })
            .attr("stroke-width", ".052vw")
            .on(barEvents);

        attachToolTip(chartName);
    }
};

const barEvents = {
    'mouseenter': function(d) {
        let modelData = d.quantity + ' ' + d.grade;
        let bottomText = "$ " + Math.floor(d.cost);
        displayToolTip("chart", modelData, bottomText);
    },
    'mouseleave': function(){
        hideToolTip("chart");
    }
};