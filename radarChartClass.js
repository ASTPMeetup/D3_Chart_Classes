let d = [
  [
    {"area": "Redux ", "value": 50},
    {"area": "Node ", "value": 75},
    {"area": "Bootstrap ", "value": 85},
    {"area": "React ", "value": 95},
    {"area": "ES6 ", "value": 85},
    {"area": "CSS3 ", "value": 90},
    {"area": "MongoDB ", "value": 65},
    {"area": "Backbone", "value": 90},
    {"area": "Angular ", "value": 60},
    {"area": "Meteor ", "value": 95},
    {"area": "D3", "value": 98},
    {"area": "HTML5 ", "value": 90},
    {"area": "Photoshop ", "value": 40},
    {"area": "Accessibility ", "value": 85},
  ],
  [
    {"area": "Redux ", "value": 60},
    {"area": "Node ", "value": 25},
    {"area": "Bootstrap ", "value": 35},
    {"area": "React ", "value": 45},
    {"area": "ES6 ", "value": 55},
    {"area": "CSS3 ", "value": 80},
    {"area": "MongoDB ", "value": 65},
    {"area": "Backbone", "value": 20},
    {"area": "Angular ", "value": 10},
    {"area": "Meteor ", "value": 18},
    {"area": "D3", "value": 44},
    {"area": "HTML5 ", "value": 30},
    {"area": "Photoshop ", "value": 90},
    {"area": "Accessibility ", "value": 65},
  ]
];

class RadarBarChart {
    constructor(id) {
      this.data = d;
      this.width = 300;
      this.height = 300;
      this.id = id;
      this.factorLegend = .85;
      this.radians = 2 * Math.PI;
      this.ToRight = 5;
      this.TranslateX = 80;
      this.TranslateY = 30;
      this.ExtraWidthY = 100;
      this.maxValue = 100;
      this.numOfLevels = 3;
      this.ExtraWidthX = 150;
    }
    drawSVG() {
      const allAxis = this.data[0].map((i) => i.area);

      let svg = d3.select(this.id)
              .append("svg")
              .attr("width", this.width+this.ExtraWidthX)
              .attr("height", this.height+this.ExtraWidthY);
  
      let lineLevelsGroup = svg.append("g")
        .attr("class", "line-levels")
        .attr("transform", "translate(" + this.TranslateX + "," + this.TranslateY + ")");

      lineLevelsGroup.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

        this.drawLevelLines(allAxis);
        this.appendAxisLabels(allAxis);
        this.appendRadarNode(allAxis);
    }
    drawLevelLines(allAxis) {
      const radius = Math.min(this.width/2, this.height/2);
      const LineLevelRadius = this.radians / allAxis.length;

      let LineLevelsGroup = d3.select('.line-levels');

      for(var levelIndex=0; levelIndex<this.numOfLevels; levelIndex++){
        let levelFactor = radius*((levelIndex+1)/this.numOfLevels);

        LineLevelsGroup.selectAll(".levels")
         .data(allAxis)
         .enter()
         .append("svg:line")
         .attr("x1", (d, i) => { return levelFactor*(1-Math.sin(i*LineLevelRadius));})
         .attr("y1", (d, i) => { return levelFactor*(1-Math.cos(i*LineLevelRadius));})
         .attr("x2", (d, i) => { return levelFactor*(1-Math.sin((i+1)*LineLevelRadius));})
         .attr("y2", (d, i) => { return levelFactor*(1-Math.cos((i+1)*LineLevelRadius));})
         .attr("class", "line")
         .style("stroke", "grey")
         .style("stroke-opacity", "0.5")
         .style("stroke-width", ".05rem")
         .attr("transform", "translate(" + (this.width/2-levelFactor) + ", " + (this.height/2-levelFactor) + ")");
      }
    }
    appendAxisLabels(allAxis){
      let axis = d3.selectAll('.axis');
      const LineLevelRadius = this.radians / allAxis.length;
      const width = this.width;
      const height = this.height;
      const factorLegend = this.factorLegend;

      axis.append("line")
        .attr("x1", this.width/2)
        .attr("y1", this.height/2)
        .attr("x2", function(d, i){ return width/2*(1-Math.sin(i*LineLevelRadius));})
        .attr("y2", function(d, i){ return height/2*(1-Math.cos(i*LineLevelRadius));})
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-width", "1px");

      axis.append("text")
        .attr("class", "label")
        .text(function(d){return d})
        .style("font-family", "Open Sans")
        .style("font-size", "14px")
        .style("font-weight", "300")
        .style("color", "#666666")
        .attr("text-anchor", "middle")
        .attr("dy", "1.2em")
        .attr("transform", function(d, i){return "translate(0, -10)"})
        .attr("x", function(d, i){
          return width/2*(1-factorLegend*Math.sin(i*LineLevelRadius))-65*Math.sin(i*LineLevelRadius);
        })
        .attr("y", function(d, i){
          return height/2*(1-Math.cos(i*LineLevelRadius))-20*Math.cos(i*LineLevelRadius);
        });
    }
    appendRadarNode(allAxis){
      const maxValue = this.maxValue;
      const LineLevelRadius = this.radians / allAxis.length;
      const width = this.width;
      const height = this.height;

      let LineLevelsGroup = d3.select('.line-levels');

      this.data.forEach(function(y, x){
        let dataValues = [];

        LineLevelsGroup.selectAll(".nodes")
        .data(y, function(j, i){
          dataValues.push([
            width/2*(1-(j.value/maxValue)*Math.sin(i*LineLevelRadius)), 
            height/2*(1-(j.value/maxValue)*Math.cos(i*LineLevelRadius))
          ]);
        });
        dataValues.push(dataValues[0]);

        LineLevelsGroup.selectAll(".area")
          .data([dataValues])
          .enter()
          .append("polygon")
          .attr("class", "radar-chart-series")
          .style("stroke-width", "2px")
          .style("stroke", "#FF8C00")
          .attr("points",function(d) {
            let pointsPath="";
            for(let i=0;i<d.length;i++){
            pointsPath = pointsPath + d[i][0] + "," + d[i][1] + " ";
            }
            return pointsPath;
          })
          .style("fill", "#FFB700")
          .style("fill-opacity", 0.25);
      });
    }
};