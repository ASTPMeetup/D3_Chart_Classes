const formGradientsMap = {
    r: {top: "#1C76A1", bottom: "#003F5C", border: "#46B2E5"},
    m: {top: "#EC4382", bottom: "#881D4B", border: "#FF659F"},
    v: {top: "#A14B9E", bottom: "#593A71", border: "#AA1CA6"},
    t: {top: "#90A11C", bottom: "#585C00", border: "#E5DB46"},
    f: {top: "#48D2B1", bottom: "#205C56", border: "#25F1C0"},
    c: {top: "#48D2B1", bottom: "#205C56", border: "#25F1C0"},
    b: {top: "#EC4382", bottom: "#881D4B", border: "#FF659F"}
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
        .style("font-size", ".75vw")
        .style("text-align", "center")
        .style("padding-bottom", ".1vw");

    tooltipContent.append("div")
        .attr("class", "tooltip-bottom-text")
        .style("font-size", ".75vw")
        .style("text-align", "center");
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

const drawGroupedBarChart = (chartName, data, dataRange=null, filterArray=[]) => {
    if(data && data.length) {
        let params = {
            margin: {top: 0, right: 10, bottom: 30, left: 10},
            width: 1000,
            height: 250,
            groupBy: 'quarter',
            barWidth: 7.5
        };

        // if dataRange is set, display only data in range.
        data = (dataRange) ? data.slice(dataRange[0], dataRange[1]) : data;

        // if data filters exist, display only data permissible by filters
        data = filterChartData(data, filterArray);

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

        d3.select(".group-bar-chart").remove();
        let svg = d3.select('.' + chartName)
            .append("svg")
            .attr("class", "group-bar-chart")
            .style("width", "100%")
            .attr("viewBox",
                "0 0 " +
                (params.width + params.margin.left + params.margin.right) + " " +
                (params.height + params.margin.top + params.margin.bottom))
            .append("g")
            .attr("transform", "translate(" + params.margin.left + "," + params.margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + params.height + ")")
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

        for (const key of Object.keys(formGradientsMap)) {
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
                .attr("stop-color", formGradientsMap[key].bottom);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", formGradientsMap[key].top);
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
                return d.server.replace(/\s/g, '');
            })
            .attr("fill", function (d) {
                const form = d.form.toLowerCase()[0];
                return "url(#gradient_" + form + ")";
            })
            .attr("stroke", function (d) {
                return formGradientsMap[d.form.toLowerCase()[0]].border;
            })
            .attr("stroke-width", ".052vw")
            .on(barEvents);

        attachToolTip(chartName);

        //track bars generated against data retrieved from getRecentPurchase method;
        console.info('getRecentPurchase: purchase data length: ' + data.length + ', bars generated: ' + barCounter);
    }
};

const barEvents = {
    'mouseenter': function(d) {
        let modelData = d.quantity + " " + d.server;
        let bottomText = d.quarter;
        displayToolTip("chart", modelData, bottomText);
    },
    'mouseleave': function(){
        hideToolTip("chart");
    }
};

const filterChartData = (data, filters=[]) => {
    if(filters.length && data.length) {
        return data.filter((d) => {
            for(let i = 0; i < filters.length; i++) {
                if(d[filters[i].type] === filters[i].value) {
                    return false;
                }
            }

            return true;
        });
    }
    return data;
};

const dataArray = [
    {
        "index": 90,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-09",
        "quantity": "9",
        "cost": 935.629999999997,
        "margin": "792.72",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 43,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.7400000000002,
        "margin": "821.41",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 76,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.73,
        "margin": "880.42",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 77,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.73,
        "margin": "880.42",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 106,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.73,
        "margin": "880.42",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 107,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.7400000000002,
        "margin": "880.41",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 108,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.7400000000002,
        "margin": "880.41",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 134,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-11",
        "quantity": "1",
        "cost": 1261.73,
        "margin": "880.42",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 67,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-12",
        "quantity": "1",
        "cost": 1261.7400000000002,
        "margin": "880.41",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 75,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R320",
        "date": "2015-03-16",
        "quantity": "1",
        "cost": 1261.7400000000002,
        "margin": "880.41",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "12"
    },
    {
        "index": 120,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2015-03-31",
        "quantity": "1",
        "cost": 1403.48,
        "margin": "3288.35",
        "form": "R",
        "quarter": "2016-Q1",
        "generation": "13"
    },
    {
        "index": 99,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R720",
        "date": "2015-05-22",
        "quantity": "1",
        "cost": 2697.2,
        "margin": "2485.95",
        "form": "R",
        "quarter": "2016-Q2",
        "generation": "12"
    },
    {
        "index": 135,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2015-06-12",
        "quantity": "1",
        "cost": 1575.030000000001,
        "margin": "9117.97",
        "form": "R",
        "quarter": "2016-Q2",
        "generation": "13"
    },
    {
        "index": 170,
        "acct_id": "1592344586",
        "country": "US",
        "server": "M630",
        "date": "2015-06-12",
        "quantity": "2",
        "cost": 1106.21,
        "margin": "17083.79",
        "form": "M",
        "quarter": "2016-Q2",
        "generation": "13"
    },
    {
        "index": 144,
        "acct_id": "1592344586",
        "country": "US",
        "server": "FC630",
        "date": "2015-06-18",
        "quantity": "2",
        "cost": 9846.2,
        "margin": "16757.8",
        "form": "F",
        "quarter": "2016-Q2",
        "generation": "13"
    },
    {
        "index": 119,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2015-06-19",
        "quantity": "1",
        "cost": 5897.76,
        "margin": "10165.24",
        "form": "R",
        "quarter": "2016-Q2",
        "generation": "13"
    },
    {
        "index": 169,
        "acct_id": "1592344586",
        "country": "US",
        "server": "FC630",
        "date": "2015-06-19",
        "quantity": "2",
        "cost": 9755.009999999998,
        "margin": "16824.99",
        "form": "F",
        "quarter": "2016-Q2",
        "generation": "13"
    },
    {
        "index": 136,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730",
        "date": "2015-10-14",
        "quantity": "1",
        "cost": 1745.83,
        "margin": "1224.48",
        "form": "R",
        "quarter": "2016-Q3",
        "generation": "13"
    },
    {
        "index": 128,
        "acct_id": "1592344586",
        "country": "US",
        "server": "T320",
        "date": "2015-12-21",
        "quantity": "1",
        "cost": 4514.17,
        "margin": "1497.94",
        "form": "T",
        "quarter": "2016-Q4",
        "generation": "12"
    },
    {
        "index": 124,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730",
        "date": "2015-12-30",
        "quantity": "8",
        "cost": 53756.18,
        "margin": "6360.62",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 42,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730",
        "date": "2016-01-06",
        "quantity": "2",
        "cost": 13562.41,
        "margin": "25035.59",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 11,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.87,
        "margin": "5608.7",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 58,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 59,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 60,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 66,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.87,
        "margin": "5608.7",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 73,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 74,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 87,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.87,
        "margin": "5608.7",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 88,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.87,
        "margin": "5608.7",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 114,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 177,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 185,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-01-28",
        "quantity": "1",
        "cost": 5327.88,
        "margin": "5608.69",
        "form": "R",
        "quarter": "2016-Q4",
        "generation": "13"
    },
    {
        "index": 86,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2016-02-04",
        "quantity": "1",
        "cost": 4664.8,
        "margin": "3026.24",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 98,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730",
        "date": "2016-02-16",
        "quantity": "1",
        "cost": 3030.49,
        "margin": "1667.89",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 49,
        "acct_id": "1592344586",
        "country": "US",
        "server": "M630",
        "date": "2016-03-10",
        "quantity": "2",
        "cost": 21234.059999999998,
        "margin": "39611.94",
        "form": "M",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 109,
        "acct_id": "1592344586",
        "country": "US",
        "server": "M630",
        "date": "2016-03-10",
        "quantity": "2",
        "cost": 16951.02,
        "margin": "13044.68",
        "form": "M",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 130,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-03-11",
        "quantity": "6",
        "cost": 59413.560000000005,
        "margin": "8074.24",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 154,
        "acct_id": "1592344586",
        "country": "US",
        "server": "FC630",
        "date": "2016-03-11",
        "quantity": "4",
        "cost": 42636.17,
        "margin": "3659.71",
        "form": "F",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 184,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R330",
        "date": "2016-03-16",
        "quantity": "1",
        "cost": 2173.9,
        "margin": "285.17",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 165,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R430",
        "date": "2016-04-18",
        "quantity": "2",
        "cost": 6397.04,
        "margin": "6109.78",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 112,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2016-04-28",
        "quantity": "1",
        "cost": 3555.3,
        "margin": "2816.76",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 50,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R530",
        "date": "2016-04-29",
        "quantity": "1",
        "cost": 3219.3,
        "margin": "2094.41",
        "form": "R",
        "quarter": "2017-Q1",
        "generation": "13"
    },
    {
        "index": 18,
        "acct_id": "1592344586",
        "country": "US",
        "server": "T320",
        "date": "2016-05-04",
        "quantity": "1",
        "cost": 1391.03,
        "margin": "714.51",
        "form": "T",
        "quarter": "2017-Q2",
        "generation": "12"
    },
    {
        "index": 127,
        "acct_id": "1592344586",
        "country": "US",
        "server": "T630",
        "date": "2016-05-20",
        "quantity": "2",
        "cost": 13978.660000000002,
        "margin": "9064.72",
        "form": "T",
        "quarter": "2017-Q2",
        "generation": "13"
    },
    {
        "index": 171,
        "acct_id": "1592344586",
        "country": "US",
        "server": "FC630",
        "date": "2016-05-25",
        "quantity": "4",
        "cost": 37400.630000000005,
        "margin": "84851.37",
        "form": "F",
        "quarter": "2017-Q2",
        "generation": "13"
    },
    {
        "index": 113,
        "acct_id": "1592344586",
        "country": "US",
        "server": "FC630",
        "date": "2016-06-13",
        "quantity": "4",
        "cost": 36770.53,
        "margin": "6017.67",
        "form": "F",
        "quarter": "2017-Q2",
        "generation": "13"
    },
    {
        "index": 17,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730",
        "date": "2016-07-19",
        "quantity": "1",
        "cost": 4837.03,
        "margin": "4726.54",
        "form": "R",
        "quarter": "2017-Q2",
        "generation": "13"
    },
    {
        "index": 139,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730",
        "date": "2016-07-19",
        "quantity": "1",
        "cost": 4837.03,
        "margin": "4726.54",
        "form": "R",
        "quarter": "2017-Q2",
        "generation": "13"
    },
    {
        "index": 71,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2016-08-26",
        "quantity": "2",
        "cost": 12244.669999999998,
        "margin": "20369.33",
        "form": "R",
        "quarter": "2017-Q3",
        "generation": "13"
    },
    {
        "index": 181,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2016-09-15",
        "quantity": "6",
        "cost": 36542.240000000005,
        "margin": "4853.98",
        "form": "R",
        "quarter": "2017-Q3",
        "generation": "13"
    },
    {
        "index": 133,
        "acct_id": "1592344586",
        "country": "US",
        "server": "T330",
        "date": "2016-10-24",
        "quantity": "1",
        "cost": 1151.31,
        "margin": "565.11",
        "form": "T",
        "quarter": "2017-Q3",
        "generation": "13"
    },
    {
        "index": 96,
        "acct_id": "1592344586",
        "country": "US",
        "server": "M630",
        "date": "2016-12-12",
        "quantity": "2",
        "cost": 8107.4400000000005,
        "margin": "892.58",
        "form": "M",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 118,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R330",
        "date": "2016-12-12",
        "quantity": "2",
        "cost": 2509.06,
        "margin": "1383.96",
        "form": "R",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 178,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-12-12",
        "quantity": "1",
        "cost": 3202.75,
        "margin": "978.45",
        "form": "R",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 3,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R730XD",
        "date": "2016-12-15",
        "quantity": "1",
        "cost": 3173.0200000000004,
        "margin": "10869.52",
        "form": "R",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 89,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2017-01-10",
        "quantity": "1",
        "cost": 3550.09,
        "margin": "4203.43",
        "form": "R",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 91,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2017-01-11",
        "quantity": "1",
        "cost": 12680.71,
        "margin": "-1383.04",
        "form": "R",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 163,
        "acct_id": "1592344586",
        "country": "US",
        "server": "R630",
        "date": "2017-02-01",
        "quantity": "8",
        "cost": 60064.14000000001,
        "margin": "20258.1",
        "form": "R",
        "quarter": "2017-Q4",
        "generation": "13"
    },
    {
        "index": 1,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 2,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12987.72,
        "margin": "-19.4",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 6,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 7,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 8,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17548.199999999997,
        "margin": "-835.28",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 12,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 16,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17548.199999999997,
        "margin": "-835.28",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 21,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 22,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 23,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 26,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 27,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 28,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17547.719999999998,
        "margin": "-834.8",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 29,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17547.719999999998,
        "margin": "-834.8",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 30,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 31,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17548.199999999997,
        "margin": "-835.28",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 37,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 38,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 39,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 63,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 64,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12987.72,
        "margin": "-19.4",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 79,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17548.199999999997,
        "margin": "-835.28",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 80,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 81,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 82,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 83,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 100,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 101,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12987.72,
        "margin": "-19.4",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 102,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 103,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12987.72,
        "margin": "-19.4",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 104,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17548.199999999997,
        "margin": "-835.28",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 105,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 125,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-06-23",
        "quantity": "4",
        "cost": 17548.199999999997,
        "margin": "-835.28",
        "form": "R",
        "quarter": "2018-Q2",
        "generation": "13"
    },
    {
        "index": 132,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-23",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 137,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-25",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 140,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-27",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 141,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-29",
        "quantity": "4",
        "cost": 12987.72,
        "margin": "-19.4",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 142,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-30",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 143,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-30",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 150,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-31",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    },
    {
        "index": 151,
        "acct_id": "1592344586",
        "country": "US",
        "server": "C6320",
        "date": "2017-10-31",
        "quantity": "4",
        "cost": 12988.199999999999,
        "margin": "-19.88",
        "form": "R",
        "quarter": "2018-Q3",
        "generation": "13"
    }
];

const filterArrayWithSlider = ()=> {
    let redrawChart = (e) => {
        drawGroupedBarChart("chart", dataArray.slice(0, Number(e.target.value)));
    };
    document.getElementById("range").addEventListener("input", redrawChart);
};