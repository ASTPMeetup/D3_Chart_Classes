export class DonutChartClass {
    constructor(chartClass, chartId, data, options) {
        let chartData = data.filter((d) => parseInt(d.value) > 0);

        this.chartId = chartId;
        this.chartClass = chartClass;
        this.data = chartData;
        this.radius = 70;
        this.width = 140;
        this.height = 135;
        this.pieFill = 360;
        this.total = chartData.reduce((a, b) => a + b.value, 0);
        this.chartFill = "#EE6411";
        this.header = "";
        this.subHeader = "";
        this.translatedText = false;
        this.gradientFill = false;
        this.dataFormat = "percentage";

        if('undefined' !== typeof options) {
            for (let i in options) {
                if ('undefined' !== typeof options[i]) {
                    this[i] = options[i];
                }
            }
        }
    }
    drawSVG() {
        d3.select('#' + this.chartId).remove();

        let svg = d3.select('.' + this.chartClass + "_" + this.chartId).append('svg')
            .attr('class', 'fragmented-donut-chart')
            .attr('id', this.chartId)
            .attr("viewBox", "0 0 " + this.width + " " + this.height)
            .style("width", "100%");

        let svgContainer = svg.append("g")
            .attr("id", this.chartId + "-group")
            .attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");

        svgContainer.append("circle")
            .attr('r', this.radius - 17)
            .attr('class', 'chart_circle')
            .style("fill", "transparent")
            .style("stroke", "transparent")
            .style("stroke-width", ".175vw");

        this.appendArcGroup();
        this.appendCenterText();
    }
    appendArcGroup() {
        let svg = d3.select('#' + this.chartId + "-group");
        let pie = d3.layout.pie().padAngle(.1);

        pie.value((d) => d.value)
            .endAngle(this.pieFill * ( Math.PI/180));

        let arc = d3.svg.arc()
            .innerRadius(this.radius - 19)
            .outerRadius(this.radius - 15);

        let arcGroup = svg.append("g");

        let arcs = arcGroup.selectAll('.arc')
            .data(pie(this.data))
            .enter()
            .append('g')
            .attr('class', 'arc')
            .attr('fill', 'none');

        arcs.append('path')
            .attr('d', arc)
            .attr('class', 'chart_arc')
            .style("cursor", "pointer")
            .attr('stroke-width', '.175vw')
            .attr("stroke", (d) => {
                return this.chartFill;
            })
            .on(this.setChartEvents());

        arcGroup.selectAll('path')
            .attr("id", (d, i) => {
                return "arc_" + i;
            })
            .attr("d", d3.svg.arc()
                .innerRadius(this.radius - 13)
                .outerRadius(this.radius - 14));
    }
    appendCenterText() {
        let svg = d3.select('#' + this.chartId + "-group");

        svg.append("text")
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .attr("fill", "#C5C5C5")
            .attr("font-size", '.936vw')
            .attr("class", "header-text")
            .text(()=> {
                return (this.header) ? this.header : this.chartId.toLowerCase();
            });

        svg.append("text")
            .attr("dy", "0.8em")
            .style("text-anchor", "middle")
            .style("text-transform", "lowercase")
            .attr("fill", "#C5C5C5")
            .attr("font-size", '.728vw')
            .attr("class", "sub-header-text")
            .text(()=> {
                return (this.subHeader) ? this.subHeader : "distribution";
            });
    }
    setChartEvents() {
        return {
            'mouseover': (d) => {
                const elementNode = d3.select(this);
                instance.displayArcData(elementNode, d.data);

            },
            'mouseout': (d) => {
                const elementNode = d3.select(this);
                instance.hideArcData(elementNode);
            }
        }
    }
    displayArcData(elementNode, data) {
        let svg = d3.select('#' + this.chartId + "-group");

        elementNode.transition()
            .style("opacity", "1")
            .attr('stroke-width', '.25vw');

        svg.select('.header-text')
            .text(() => {
                return (this.translatedText) ? data.key : "ABBREV";
            });

        svg.select('.sub-header-text')
            .text(() => {
                return data.value;
            });
    }
    hideArcData(elementNode) {
        let svg = d3.select('#' + this.chartId + "-group");

        elementNode.transition()
            .duration(500)
            .ease('bounce')
            .style("opacity", "0.7")
            .attr('stroke-width', '.175vw');

        svg.select('.header-text')
            .text(()=> {
                return (this.header) ? this.header : this.chartId.toLowerCase();
            });

        svg.select('.sub-header-text')
            .text(()=> {
                return (this.subHeader) ? this.subHeader : "distribution";
            });
    }
}