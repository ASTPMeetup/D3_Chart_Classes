class HorizontalBarChart {
    constructor(data, chartName, chartId) {
        this.data = data;
        this.chartName = chartName;
        this.chartId = chartId;
        this.height = 250;
        this.width = 500;
        this.barPadding = 10;
        this.chartPadding = 35;
        this.chartMargin = 100;
        this.labelsMargin = 10;
    }
    drawSVG() {
        this.xScale = this.defaultXScale();
        this.yScale = this.defaultYScale();
        this.colorScale = this.defaultColorScale();

        let svg = d3.select('.' + this.chartName).append("svg")
            .attr("id", this.chartId)
            .attr("viewBox", "0 0 " + (this.width + this.chartPadding) + " " + (this.height + this.chartPadding) + "");

        // create bar group container to encapsulate bars
        let barGroup = svg.append("g")
            .attr("class", "bar-group")
            .attr("transform", "translate(" + this.chartMargin +"," + this.chartPadding + ")");


        // append bars to bar group
        barGroup.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar-chart-rect")
            .attr("y", (d)=> {
                return this.yScale(d.key)
            })
            .attr("height",(d)=> {
                return this.yScale.rangeBand() - this.barPadding;
            })
            .attr("width", (d)=> {
                return this.xScale(d.value);
            })
            .style("fill", (d,i) => {
                return this.colorScale(i);
            });

        // create X Axis group
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + this.chartMargin + "," + this.chartPadding + ")")
    }
    defaultXScale(){
        return d3.scale.linear()
            .domain([0,d3.max(data, (d) => {
                return d.value;
            })])
            .range([0, this.width]);
    }
    defaultYScale() {
        return d3.scale.ordinal()
            .domain(data.map((d) => d.key))
            .rangeBands([0, this.height]);
    }
    defaultColorScale() {
        return d3.scale.category20();
    }
    appendYAxisLabels(){
        let yAxisGroup = d3.select(".y-axis");

        const setYAxisLabels = d3.svg.axis()
            .scale(this.yScale)
            .orient("left")
            .tickPadding(5);

        yAxisGroup.call(setYAxisLabels);
    }
    groupDataByGroupProp() {
        this.data = groupData()
    }
    set adjustYAxisMargin(paddingValue) {
        this.chartMargin = paddingValue;
    }
}