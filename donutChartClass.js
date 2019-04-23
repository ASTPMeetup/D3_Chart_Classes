const dataArray = [
    {
        "key": "Q1",
        "value": 12
    },
    {
        "key": "Q2",
        "value": 4
    },
    {
        "key": "Q3",
        "value": 2
    },
    {
        "key": "Q4",
        "value": 9
    }
];

class DonutChartClass {
    constructor(chartClass, chartId, options) {
        let chartData = dataArray.filter((d) => parseInt(d.value) > 0);

        this.chartId = chartId;
        this.chartClass = chartClass;
        this.data = chartData;
        this.radius = 70;
        this.width = 140;
        this.height = 135;
        this.pieFill = 360;
        this.total = chartData.reduce((a, b) => a + b.value, 0);
        this.chartFill = ["darkblue", "red", "green", "yellow"];
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

        let svg = d3.select('.' + this.chartClass).append('svg')
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
            .style("opacity", "0.7")
            .attr('stroke-width', '.175vw')
            .attr("id", (d) => {
                return "arc_" + d.data.key;
            })
            .attr("stroke", (d, i) => {
                return this.chartFill[i];
            });

        arcGroup.selectAll('path')
            .attr("d", d3.svg.arc()
                .innerRadius(this.radius - 13)
                .outerRadius(this.radius - 14))
            .on(this.setChartEvents());
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
        let instance = this;
        return {
            'mouseover': (d) => {
                const elementNode = d3.select(this);
                instance.displayArcData("arc_" + d.data.key, d.data);

            },
            'mouseout': (d) => {
                const elementNode = d3.select(this);
                instance.hideArcData("arc_" + d.data.key);
            }
        }
    }
    displayArcData(elementNode, data) {
        let svg = d3.select("#" + this.chartId);
        let selectedNode = d3.select('#' + elementNode);

        selectedNode.transition()
            .duration(500)
            .ease('bounce')
            .attr('stroke-width', '.5vw');

        svg.select('.header-text')
            .text(() => {
                return (this.translatedText) ? data.key : "ABBREV";
            });

        svg.select('.sub-header-text')
            .text(() => {
                return Math.round( (data.value/ this.total) * 100) + "%";
            });
    }
    hideArcData(elementNode) {
        let svg = d3.select("#" + this.chartId);
        let selectedNode = d3.select('#' + elementNode);

        selectedNode.transition()
            .duration(250)
            .ease('bounce')
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