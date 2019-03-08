
class VerticalBarChart {
    constructor(data, chartName, chartId) {
        this.data = data;
        this.chartName = chartName;
        this.chartId = chartId;
        this.width = 500;
        this.height = 250;
        this.barPadding = 10;
        this.chartPadding = 30;
        this.chartMargin = 60;
        this.labelsMargin = 10;
    }
    drawSVG() {
        this.xScale = this.defaultXScale();
        this.yScale = this.defaultYScale();
        this.colorScale = this.defaultColorScale();

        let svg = d3.select('.' + this.chartName).append("svg")
            .attr("id", this.chartId)
            .attr("viewBox", "0 0 " + (this.width + this.chartMargin) + " " + (this.height + this.chartMargin) + "");

        // create bar group container to encapsulate bars
        let barGroup = svg.append("g")
            .attr("class", "bar-group")
            .attr("transform", "translate(" + this.chartPadding + "," + this.chartPadding + ")");


        // append bars to bar group
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
                return this.xScale(d.key)
            })
            .attr("width", (d)=> {
                return this.xScale.rangeBand() - this.barPadding;
            })
            .style("fill", (d,i) => {
               return this.colorScale(i);
            });

        // create X Axis group
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + this.chartPadding + "," + (this.height + this.chartPadding) + ")")
    }
    defaultYScale(){
        return d3.scale.linear()
            .domain([0,d3.max(data, (d) => {
                return d.value;
            })])
            .range([this.height, 0]);
    }
    defaultXScale() {
        return d3.scale.ordinal()
            .domain(data.map((d) => d.key))
            .rangeBands([0, this.width]);
    }
    defaultColorScale() {
        return d3.scale.category20();
    }
    appendXAxisLabels(){
        let xAxisGroup = d3.select(".x-axis");

        const setXAxisLabels = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom")
            .tickPadding(5);

        xAxisGroup.call(setXAxisLabels)
            .select(".domain").remove();
    }
}