class VerticalBarChart {
    constructor(data, chartName, chartId, options) {
        this.data = data;
        this.chartName = chartName;
        this.chartId = chartId;
        this.chartPadding = 40;
        this.chartMargin = 100;
        this.width = 500;
        this.height = 250;
        this.barPadding = 5;
        this.barWidth = 10;
        this.barColor = "rgb(61, 198, 239)";
        this.barGroupPadding = 20;
        this.axisPadding = 10;
        this.timeSpan = "year";

        if('undefined' !== typeof options){
            for(let i in options){
                if('undefined' !== typeof options[i]){
                    this[i] = options[i];
                }
            }
        }
    }
    drawSVG() {
        this.xScale = this.defaultTimeXScale();
        this.yScale = this.defaultYScale();

        // create svg
        let svg = d3.select('.' + this.chartName).append("svg")
            .attr("id", this.chartId)
            .attr("viewBox", "0 0 " + (this.width + this.chartMargin) + " " + (this.height + this.chartMargin) + "");

        // TARGET CLASS: "bar-group" -- create bar group container to encapsulate bars
        let barGroup = svg.append("g")
            .attr("class", "bar-group")
            .attr("transform", "translate(" + (this.chartPadding + this.barGroupPadding) + "," + this.chartPadding + ")");

        // TARGET CLASS: "bar-chart-rect" -- append bars to bar group class
        barGroup.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar-chart-rect")
            .attr("y", (d)=> {
                return this.yScale(d.value)
            })
            .attr("height",(d)=> {
                return this.height - this.yScale(d.value);
            })
            .attr("x", (d)=> {
                return this.xScale(new Date(d.key)) - this.barPadding;
            })
            .attr("width", (d)=> {
                return this.barWidth;
            })
            .style("fill", (d,i) => {
                return this.barColor;
            });

        // TARGET CLASS: "x-axis" -- create X Axis group
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + (this.chartPadding + this.barGroupPadding) +
                "," + (this.height + this.chartPadding + this.axisPadding) + ")");

        // TARGET CLASS: "y-axis" -- create Y Axis group
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + (this.chartPadding - this.axisPadding) +
                "," + this.chartPadding + ")");

        // append Y Axis labels
        this.appendYAxisLabels();

        //set x axis to time span prop
        this.setAxisToTimeSpan();

    }
    defaultYScale(){
        return d3.scale.linear()
            .domain([0,d3.max(data, (d) => {
                return d.value;
            })])
            .range([this.height, 0]);
    }
    getStartDateFromDataMin() {
        return d3.min(this.data.map((d) => new Date(d.key)));
    }
    defaultTimeXScale() {
        let startDate = this.getStartDateForTimeSpan();

        return d3.time.scale()
            .domain([startDate, new Date()])
            .rangeRound([0, this.width])
            .nice(d3.time[this.mapTimeSpanToTickRange]);
    }
    modifyXDomain(startDate) {
        this.xScale = d3.time.scale()
            .domain([startDate, new Date()])
            .rangeRound([0, this.width])
            .nice(d3.time[this.mapTimeSpanToTickRange]);
    }
    mapTimeSpanToTickRange() {
        const mapTimeSpanToTimeTick = {
            max: 'month',
            year: 'week',
            quarter: 'week',
            month: 'day',
            week: 'day'
        };

        return mapTimeSpanToTimeTick[this.timeSpan];
    }
    setAxisToTimeSpan() {
        switch(this.timeSpan) {
            case "week": return this.setXAxisToLastWeek();
            case "month": return this.setXAxisToLastMonth();
            case "quarter": return this.setXAxisToLastQuarter();
            case "year": return this.setXAxisToLastYear();
            default: return this.setXAxisToMax();
        }
    }
    getStartDateForTimeSpan() {
        let currentDate = new Date();

        switch(this.timeSpan) {
            case "week":
                return currentDate.setDate(currentDate.getDate() - 7);
            case "month":
                return currentDate.setMonth(currentDate.getMonth() - 1);
            case "quarter":
                return currentDate.setMonth(currentDate.getMonth() - 3);
            case "year":
                return currentDate.setFullYear(currentDate.getFullYear() - 1);
            default:
                return this.getStartDateFromDataMin();
        }
    }
    setXAxisToLastWeek() {
        let xAxisGroup = d3.select(".x-axis");

        let pastWeek = this.getStartDateForTimeSpan();
        this.modifyXDomain(pastWeek);

        const formatTickMark = (d) => {
            let formatToMonth = d3.time.format("%b %_d");
            return formatToMonth(d);
        };

        this.setMinorMajorTicks(xAxisGroup, formatTickMark,7);
    }
    setXAxisToLastMonth() {
        let xAxisGroup = d3.select(".x-axis");

        let pastMonth = this.getStartDateForTimeSpan();
        this.modifyXDomain(pastMonth);

        const formatTickMark = (d,i) => {
            if (i % 7 === 0) {
                let formatToMonth = d3.time.format("%b %_d");
                return formatToMonth(d);
            } else {
                return "";
            }
        };

        this.setMinorMajorTicks(xAxisGroup, formatTickMark,30);
    }
    setXAxisToLastQuarter(){
        let xAxisGroup = d3.select(".x-axis");

        let pastQuarter = this.getStartDateForTimeSpan();
        this.modifyXDomain(pastQuarter);

        const formatTickMark = (d) => {
            if(d.getDate() <= 7) {
                let formatToMonth = d3.time.format("%b");
                return formatToMonth(d);
            } else {
                return "";
            }
        };

        this.setMinorMajorTicks(xAxisGroup, formatTickMark,12);
    }
    setXAxisToLastYear(){
        let xAxisGroup = d3.select(".x-axis");

        const formatTickMark = (d) => {
            if(d.getDate() <= 7) {
                let formatToMonth = d3.time.format("%b");
                return formatToMonth(d);
            } else {
                return "";
            }
        };

        this.setMinorMajorTicks(xAxisGroup, formatTickMark,52);
    }
    setXAxisToMax() {
        let xAxisGroup = d3.select(".x-axis");
        let minDate = this.getStartDateFromDataMin();

        this.modifyXDomain(minDate);

        const formatTickMark = (d) => {
            if (d.getMonth() === 0) {
                let formatToMonth = d3.time.format("%Y");
                return formatToMonth(d);
            } else {
                return "";
            }
        };

        // get number of months from min date to current date
        let currentDate = new Date();
        let numOfTicks = currentDate.getMonth() - minDate.getMonth()
            + (12 * (currentDate.getFullYear() - minDate.getFullYear()));

        this.setMinorMajorTicks(xAxisGroup, formatTickMark, numOfTicks);
    }
    setMinorMajorTicks(xAxisGroup, setTickMark, numOfTicks) {
        const setXAxisLabels = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom")
            .innerTickSize(30)
            .outerTickSize(0)
            .ticks(numOfTicks)
            .tickFormat((d,i) => {
                return setTickMark(d, i);
            });

        xAxisGroup.call(setXAxisLabels)
            .select(".domain").remove();

        xAxisGroup.selectAll("g")
            .filter(function (d, i) {
                return !setTickMark(d,i);
            })
            .attr("class", "minor-tick");
    }
    appendYAxisLabels(){
        let yAxisGroup = d3.select(".y-axis");

        const setYAxisLabels = d3.svg.axis()
            .scale(this.yScale)
            .orient("left")
            .innerTickSize(15)
            .outerTickSize(0)
            .ticks(15)
            .tickFormat("");

        yAxisGroup.call(setYAxisLabels)
            .select(".domain")
            .attr("transform", "translate(10,0)");
    }
    attachDateToolTips() {
        let yAxisGroup = d3.selectAll(".bar-chart-rect");
        yAxisGroup.on(this.mouseOverDateEvents(this.chartId));
        attachToolTip(this.chartId);
    }
    mouseOverDateEvents(chartId) {
        return {
            'mouseenter': function(d) {
                let dateString = new Date(d.key);
                let topText = dateString.toLocaleDateString();
                let bottomText = d.value + " Total Projects.";
                displayToolTip(chartId, topText, bottomText);
            },
            'mouseleave': function(){
                hideToolTip(chartId);
            }
        }
    }
}

function attachToolTip(id) {
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
        .style("font-size", ".75vw")
        .style("text-align", "center")
        .style("padding-bottom", ".1vw");

    tooltipContent.append("div")
        .attr("class", "tooltip-bottom-text")
        .style("font-size", ".75vw")
        .style("text-align", "center");
}

function displayToolTip(id, textTop, textBottom) {
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
}

function hideToolTip(id) {
    d3.select("#" + id + "-tooltip")
        .transition()
        .duration(500)
        .style("top", (d3.event.pageY) + "px")
        .style("opacity", 0);
}