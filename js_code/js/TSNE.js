class TSNE {

    constructor(linegraph){
        // Follow the constructor method in tsne.js
        // assign class 'content' in style.css to tile chart


        this.linegraph = linegraph;
        this.margin = {top: 10, right: 10, bottom: 55, left: 65};
        let tsne = d3.select("#TSNE_Chart").classed("tsne_view", true);
        this.svgBounds = tsne.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = parseInt(this.svgWidth);
        this.buttonClicked = 'true'
        this.initial = true
        // set initial button state for tsne graph
        this.activeButton = 'actual'
        this.selectedElements = []

        this.svg = tsne.append("svg")
            .attr("width", this.svgBounds.width)
            .attr("height", this.svgHeight)
            .attr('id', 'TSNE_Chart_svg')

        //  set environment for data plots
        let plot_area = this.svg.append('g').attr('id', 'tsne_plot')
        let plot_data = this.svg.select('#tsne_plot').append('g').attr('id', 'tsne_data')
        this.svg.select('#tsne_plot').append('g').attr('id', 'tsne_xaxis')
        let tsne_compounds = plot_data.append('g').attr('id', 'tsne_compounds')

        //  set environment for making axis
        this.svg.select('#tsne_xaxis').append('g').attr('id', 'tsne_top_xaxis')
        this.svg.select('#tsne_xaxis').append('g').attr('id', 'tsne_bottom_xaxis')
        this.svg.select('#tsne_xaxis').append('g').attr('id', 'tsne_xlabel').append('text')
                .text('Component 1').attr("transform", "translate(" + this.svgWidth*0.55 + "," + (this.svgHeight*1 - 5) + ")").style("text-anchor", "middle")
                .style('font-size', d=>this.svgWidth* 0.04+'px')
        this.svg.select('#tsne_plot').append('g').attr('id', 'tsne_yaxis')
        this.svg.select('#tsne_yaxis').append('g').attr('id', 'tsne_left_yaxis')
        this.svg.select('#tsne_yaxis').append('g').attr('id', 'tsne_right_yaxis')
        this.svg.select('#tsne_yaxis').append('g').attr('id', 'tsne_ylabel').append('text')
                .text('Component 2').attr("transform", "rotate(-90)").attr("x", -this.svgHeight*0.45).attr('dy', (this.svgWidth*0 + 15)).style("text-anchor", "middle")
                .style('font-size', d=>this.svgWidth* 0.04+'px')

        // make buttons for switching properties residual/actual band gap
        let button0 = tsne.append('svg')
            .attr('id', 'button0_svg')
            .attr('x', this.svgWidth/4 * 2)
            .attr('width', this.svgWidth/4)
            .attr('height', this.svgWidth*0.06)

        let button1 = tsne.append('svg')
            .attr('id', 'button1_svg')
            .attr('x', this.svgWidth/4 * 2)
            .attr('width', this.svgWidth/4)
            .attr('height', this.svgWidth*0.06)

        let button2 = tsne.append('svg')
            .attr('id', 'button2_svg')
            .attr('x', this.svgWidth/4 * 3)
            .attr('width', this.svgWidth/4)
            .attr('height', this.svgWidth*0.06)

        let button3= tsne.append('svg')
            .attr('id', 'button3_svg')
            .attr('x', this.svgWidth/4 * 4)
            .attr('width', this.svgWidth/4)
            .attr('height', this.svgWidth*0.06)

        // add button 'rect'
        let that = this
        button1.append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', this.svgWidth*0.2)
            .attr('height', this.svgWidth*0.06)
            .attr('fill', 'silver')
            .attr('stroke', 'black')
            .attr("rx", 10)
            .attr("ry", 10)
            .on('click', d => this.button1Click(d, that));
        // add button text
        button1.append('text')
            .attr('x', 0 + this.svgWidth*0.02)
            .attr('y', this.svgWidth*0.03)
            .style('alignment-baseline', "middle")
            .style('font-size', d=>this.svgWidth* 0.032+'px')
            // .style('')
            .text('actual')
            .on('click', d => this.button1Click(d, that));

        // add button 'rect'
        button2.append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', this.svgWidth*0.2)
            .attr('height', this.svgWidth*0.06)
            .attr('fill', 'silver')
            .attr('stroke', 'black')
            .attr("rx", 10)
            .attr("ry", 10)
            .on('click', d => this.button2Click(d, that));

        // add button text
        button2.append('text')
            .attr('x', 0 + this.svgWidth*0.02)
            .attr('y', this.svgWidth*0.03)
            .style('alignment-baseline', "middle")
            .style('font-size', d=>this.svgWidth* 0.032+'px')
            // .style('')
            .text('prediction')
            .on('click', d => this.button2Click(d, that));

        // add button 'rect'
        button3.append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', this.svgWidth*0.2)
            .attr('height', this.svgWidth*0.06)
            .attr('fill', 'silver')
            .attr('stroke', 'black')
            .attr("rx", 10)
            .attr("ry", 10)
            .on('click', d => this.button3Click(d, that));

        // add button text
        button3.append('text')
            .attr('x', 0 + this.svgWidth*0.02)
            .attr('y', this.svgWidth*0.03)
            .style('alignment-baseline', "middle")
            .style('font-size', d=>this.svgWidth* 0.032+'px')
            // .style('')
            .text('residual')
            .on('click', d => this.button3Click(d, that));






        // add color bar to tsne
        this.svg.select('#tsne_plot').append('g').attr('id', 'tsne_colorbar')
            .attr('transform', 'translate(' + (this.svgWidth-this.margin.right*0.9) + ',' + (2*this.margin.top) + ')')

        // add hover feature (only works if brush is disabled)
        this.tip = d3.tip().attr('class', 'd3-tip')
			.direction('s')
			.offset(function() {
				return [50,50];
			});

        this.svg.call(this.tip)
    };


    // render tooltip hover
    tooltip_render (tooltip_data) {
    let text = "<ul>";
    tooltip_data.result.forEach((row)=>{
        text += "<li class = " + 'formula' + ">"
             + 'formula' +":\t\t" + row.formula +
             "</li>" + "<li class = " + 'formula' + ">" +
            "Band gap:\t\t"+row.actual
            +  "</li>" +
             "</li>" + "<li class = " + 'formula' + ">" +
            "Predicted Band gap:\t\t"+row.predicted
            +  "</li>" +
             "</li>" + "<li class = " + 'formula' + ">" +
            "Residual:\t\t"+row.residual
            +  "</li>"
    });
    return text;
    }



    transpose(a) {
        return Object.keys(a[0]).map(function(c) {
            return a.map(function(r) { return r[c]; });
        });
    }

    makeArr(startValue, stopValue, cardinality) {
      var arr = [];
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
      }
      return arr;
    }



    update(element_data){
        let act;
        let pred;
        let res;

        if (this.initial){
            act = this.transpose(element_data)[1].map(Number)
            pred = this.transpose(element_data)[2].map(Number)
            res = this.transpose(element_data)[4].map(Number)
            let max_abs = d3.max([Math.abs(d3.min(res)), Math.abs(d3.max(res))])
            // set up the color palettes we will use
            this.colorScaleAct = d3.scaleLinear()
                .domain(this.makeArr(d3.min(act), d3.max(act), 7))
                .range(['#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'])
            this.colorScalePred = d3.scaleLinear()
                .domain(this.makeArr(d3.min(pred), d3.max(pred), 7))
                .range(['#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'])
            this.colorScaleRes = d3.scaleLinear()
                .domain(this.makeArr(-max_abs, max_abs, 7))
                .range(['#67001f','#b2182b','#d6604d', '#92c5de','#4393c3','#2166ac','#053061'])


            this.res_abs_domain = this.makeArr(0, max_abs, 8)
            this.linegraph.update(element_data, this.res_abs_domain)
            // color scale can be updated. Store an initial value
            this.activeColorScale = this.colorScaleAct}
            this.initial = false

        //update function, called in peridic_table.js
        this.current_element_data = element_data
        this.plot_data(element_data, this.activeColorScale)

        let svg = d3.select('#tsne_data')

        let that = this

        //generic brush function.
        let brushFunction = function(){
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            let coords = d3.event.selection;

            let data = d3.select('#TSNE_Chart').selectAll('svg').selectAll('#tsne_data').selectAll('circle')
            let selected = []

            data.attr('opacity', function(d) {
                let classes = d3.select(this).attr('class')
                if (classes.includes('nothidden')){

                    let x = parseFloat(d3.select(this).attr('cx'))
                    let y = parseFloat(d3.select(this).attr('cy'))

                    if (isSelected(coords, x, y) == true){
                        selected.push(d)
                    }
                    return 1
                }
            })

            function isSelected(coords, x, y){
                let x0 = coords[0][0],
                    x1 = coords[1][0],
                    y0 = coords[0][1],
                    y1 = coords[1][1];

                return x0 <= x && x <= x1 && y0 <= y && y <= y1
            }
            let selection_box = d3.select('rect.selection')
            if (selected.length == 0){selected = element_data}

            // Calls linegraph.py function to update average residual

            // window.setTimeout(linegraph.update(selected, that.res_abs_domain), 200);
            linegraph.update(selected, that.res_abs_domain)
            // We have the x axis data from brushing now
            // .....
        }
        //create a brush
        //extend defines the brush functional area
        let brushGroup = svg.append('g').classed('brush', true)
                            .call(d3.brush()
                            .extent([[0, 0], [this.svgWidth, this.svgHeight]])
                            .on("brush", brushFunction));
    }

    plot_data (element_data, colorScale){
        // function to generate and update plot data

        let component_1 = []
        let component_2 = []
        let actual = []
        let predicted = []
        let residual = []

        // get data properties
        let elementData = element_data.map(formula => {
            component_1.push(parseFloat(formula['component_1']))
            component_2.push(parseFloat(formula['component_2']))
            predicted.push(parseFloat(formula['predicted']))
            actual.push(parseFloat(formula['actual']))
            residual.push(parseFloat(formula['residual']))
        });
        // get min and max values for scaling
        let maxarray1 = d3.max(component_1)
        let maxarray2 = d3.max(component_2)
        let minarray1 = d3.min(component_1)
        let minarray2 = d3.min(component_2)
        let max_residual = d3.max(residual)
        let min_residual = d3.min(residual)
        let min_component = d3.min([minarray1, minarray2])
        let max_component = d3.max([maxarray1, maxarray2])

        this.svg.select("#tsne_colorbar").remove();

        // define the colorbar
        let legendQuantile = d3.legendColor()
            .shapeWidth(this.margin.left*0.2)
            .shapeHeight((this.svgHeight - this.margin.top - this.margin.bottom)/8)
            .cells(7)
            .orient('vertical')
            .labelFormat(d3.format('.3r'))
            .scale(colorScale);
        d3.select('#tsne_plot').append('g').attr('id', 'tsne_colorbar')
            .attr('transform', 'translate(' + (this.svgWidth-this.margin.right*0.5) + ',' + (2*this.margin.top) + ')');

        d3.select("#tsne_colorbar")
            .style('font-size', d=>this.margin.left* 0.2+'px')
            .call(legendQuantile);

        let text_thing = d3.select("#tsne_colorbar").selectAll('.cell').selectAll('.label')
            text_thing.attr('x', -this.svgWidth*0.015);

        // scale the data
        let xScale = d3.scaleLinear()
            .domain([min_component, max_component])
            .range([this.margin.left, this.svgWidth - this.margin.right])
            .nice()
        let yScale = d3.scaleLinear()
            .domain([max_component, min_component])
            .range([this.margin.top, this.svgHeight - this.margin.bottom])
            .nice()

        let xAxis_bottom = d3.axisBottom(xScale).tickSizeOuter(0);
        let xAxis_top = d3.axisTop(xScale).tickSizeOuter(0);
        let yAxis_left = d3.axisLeft(yScale).tickSizeOuter(0);
        let yAxis_right = d3.axisRight(yScale).tickSizeOuter(0);

        /* Here I format the axis so they look nice */
        let xAxis_B = d3.select('#tsne_bottom_xaxis')
            .attr('transform', "translate(0," + (this.svgHeight - this.margin.bottom)  + ")")
            .call(xAxis_bottom)
            xAxis_B.selectAll(".tick line")
                .attr("transform", "scale(1,-1)")

        let xAxis_T = d3.select('#tsne_top_xaxis')
            .attr('transform', "translate(0," + this.margin.top  + ")")
            .call(xAxis_top)
        xAxis_T.selectAll("text")
            .remove();
        xAxis_T.selectAll(".tick line")
            .attr("transform", "scale(1,-1)")
        let yAxis_L = d3.select('#tsne_left_yaxis')
            .attr('transform', "translate("+this.margin.left+"," + 0 + ")")
            .call(yAxis_left)
        yAxis_L.selectAll(".tick line")
            .attr("transform", "scale(-1,1)");
        let yAxis_R = d3.select('#tsne_right_yaxis')
            .attr('transform', "translate("+(this.svgWidth - this.margin.right )+"," + 0 + ")")
            .call(yAxis_right)
        yAxis_R.selectAll("text")
            .remove();
        yAxis_R.selectAll(".tick line")
            .attr("transform", "scale(-1,1)")

        xAxis_B.selectAll("text").attr('font-size', d=>this.svgWidth* 0.032+'px')
        yAxis_L.selectAll("text").attr('font-size', d=>this.svgWidth* 0.032+'px')

        // defin tooltip html style
        this.tip.html((d)=> {
            let tooltip_data = {
                    "result":[
                    {"formula": d.formula,"actual": parseFloat(d.actual).toPrecision(4),"predicted": parseFloat(d.predicted).toPrecision(4),"residual": parseFloat(d.residual).toPrecision(4)}
                    ]
                }

            return this.tooltip_render(tooltip_data)
        });

        // draw datapoints
        let group = d3.select('#tsne_data').select('#tsne_compounds')
        let circ = group.selectAll('circle').data(element_data)
        let new_circ = circ.enter().append('circle')
        circ.exit().remove()
        circ = circ.merge(new_circ)
        circ.attr('cx', d => {return xScale(parseFloat(d['component_1']))})
            .attr('cy', d => yScale(parseFloat(d['component_2'])))
            .attr('r', this.svgHeight/125)
            .attr('fill', d => colorScale(d[this.activeButton]))
            .attr('fill-opacity', d => 1)
            .attr('class', d => {return 'tsne nothidden ' + d['formula'] + ' ' +  d['elements']})
            .on('mouseover', this.tip.show)
            .on('mouseout', this.tip.hide)
    };

    onClick(d, that1){
        // handle clicks from the ptable data view
        this.selectedElements = that1.selectedElements

        if (this.selectedElements.length == 0){
            let circle_data = d3.selectAll('#tsne_compounds').selectAll('circle')
            circle_data.classed('hidden', false)
            circle_data.classed('nothidden', true)
            circle_data.classed('clicked', false)
        }else{
            let circle_data = d3.selectAll('#tsne_compounds').selectAll('circle')
            circle_data.classed('clicked', false)
            that1.selectedElements.forEach(d => {
                let selected_elements = d3.selectAll('#tsne_compounds')
                    .selectAll("."+d)
                    .classed('clicked', true)
            })

            circle_data.classed('hidden', true)
            circle_data.classed('nothidden', false)
            d3.selectAll('#tsne_compounds').selectAll('.clicked').classed('hidden', false).classed('nothidden', true)
        }
    };

    button1Click(d, that){
        // handle button click to switch properties
        let selectedElements = []
            that.activeColorScale = that.colorScaleAct;
            that.activeButton = 'actual'
            this.plot_data(this.current_element_data, this.activeColorScale)
        this.onClick(d, this)
    }
    button2Click(d, that){
        // handle button click to switch properties
        let selectedElements = []
            that.activeColorScale = that.colorScalePred;
            that.activeButton = 'predicted'
            this.plot_data(this.current_element_data, this.activeColorScale)
        this.onClick(d, this)
    }
    button3Click(d, that){
        // handle button click to switch properties
        let selectedElements = []
            that.activeColorScale = that.colorScaleRes;
            that.activeButton = 'residual'
            this.plot_data(this.current_element_data, this.activeColorScale)
        this.onClick(d, this)
    }

    hoverOver(d, that){
        // handle mouse hover from the ptable data view
        let selected_data = d3.selectAll('#tsne_compounds')

        selected_data.selectAll("*:not(."+d.symbol+')')
            .lower()
            .classed('not_selected', true)
        // selected_data.selectAll('.'+d.symbol).raise().classed('selected', true).classed('hidden', true)
    };

    hoverOff(d, that){
        // handle mouse hover from the ptable data view
        let selected_data = d3.selectAll('#tsne_compounds')
        selected_data.selectAll("*:not(."+d.symbol+')')
            .classed('not_selected', false)

        selected_data.selectAll('.'+d.symbol).lower().classed('selected', false)
        if (that.selectedElements.length == 0){
        }else{
        // d3.selectAll('#tsne_compounds').selectAll("*:not(.clicked)").classed('hidden', true)
        }

    };

}
