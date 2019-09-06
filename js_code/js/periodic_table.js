/** Class implementing the tileChart. */
class Periodic_table {

    /**
     * Initializes the svg elements required to lay the tiles
     * @param ptable instance of ptable
     * and to populate the legend.
     */

    // constructor(ptable, act_vs_pre, line_graph, info, tsne){
    constructor(ptable, act_vs_pre, line_graph, tsne){
        //Create the svg and margin for Periodic_table.
        this.margin = {top: 10, right: 5, bottom: 20, left: 5};
        let divptable = d3.select("#Periodic_Table_Chart").classed("ptable_view", true);
        this.svgBounds = divptable.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = parseInt(this.svgWidth*3/5);
        this.svg = divptable.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
        this.ptable = ptable;
        this.act_vs_pre = act_vs_pre;
        this.line_graph = line_graph;
        // this.info = info;
        this.tsne = tsne;
        this.selectedElements = []
        this.dict = []
        this.dict_axis = []
        this.barHeight_list = []
        this.text = "All Elements"

        /* THIS PREPOPULATES THE Act VS Pred Graph while making the Ptable */
        d3.csv("data/experimental_predictions.csv").then(element_data => {
            this.act_vs_pre.update(element_data);
            this.tsne.update(element_data);
        });

        let legendHeight = 20;
        //add the svg to the div
        let legend = d3.select("#legend").classed("tile_view",true);

        // creates svg elements within the div
        this.legendSvg = legend.append("svg")
                            .attr("width",this.svgWidth)
                            .attr("height",legendHeight)
                            .attr("transform", "translate(" + this.margin.left + ",0)");
    };



    /**
     * update the element which is selected or hoverOver
     *
     * @param colorScale global quantile scale based on the winning margin between republicans and democrats
     */

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

    update (){
        let ptablet = this.transpose(this.ptable)
        var ptablet_ints = ptablet[5].map(Number);
        this.svg.selectAll("*").remove();
        let widthCur = parseInt(this.svgWidth/20);
        let heightCur =parseInt(this.svgHeight/12);
        let log_array = ptablet_ints.map(Math.log)
        var domain = this.makeArr(0, d3.max(log_array), 9).map(Math.exp).map(Math.round);
        domain[0] = 0
        //Color range for global color scale
        // let range = ['#CBCBCB', '#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494'];
        let range = ['#fffff9', '#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494'];

        //ColorScale be used consistently by all the charts
        var colorScale = d3.scaleLinear()
            .domain(domain)
            .range(range);

        var resid_bars = this.svg
            .append("g")
            .attr("id", "resid_bars");

        var ptable_bars = this.svg
            .append("g")
            .attr("id", "ptable_bars");

        var color_bars = this.svg
            .append("g")
            .attr("id", "color_bars");

        //Create the colorbars which represent the colorscale.
        color_bars.append('g').attr('id', 'title_of_colors_bar');
        let title_group = color_bars.select('#title_of_colors_bar');
        title_group.append('text')
            .attr('x', widthCur*15)
            .attr('y', heightCur*1.2)
            .style('font-size', d=>heightCur*0.35+'px')
            .style('fill','black')
            .style('text-anchor', 'middle')
            .text(d=>"# representative formulae");

        //Make the bars for the colorbars, and the length of bar represent the frequence.
        let c_bars =  color_bars.selectAll('rect').data(domain);
        let boxwidth = 0.9
        let xloc = 8.9
        // let boxwidth = 1.53
        c_bars.enter()
            .append('rect')
            .attr('x', (d,i)=>widthCur*xloc+i*widthCur/boxwidth)
            .attr('y', heightCur*0.5)
            .attr('width', widthCur/boxwidth)
            .attr('height', heightCur/3)
            // .attr('height', function(d){if(d>1){return d/30*heightCur/20+heightCur/4}else if(d===0){return heightCur/8} return heightCur/6;})
            .style('fill', d=>colorScale(d))
            .style( 'stroke', '#101010')
            .style('stroke-width',2);

        // var x = d3.scaleQuantile().range([widthCur*1/boxwidth,widthCur*2/boxwidth,widthCur*3/boxwidth,widthCur*4/boxwidth,widthCur*5/boxwidth,widthCur*6/boxwidth,widthCur*7/boxwidth,widthCur*8/boxwidth, widthCur*9/boxwidth]);
        var x = d3.scaleQuantile().range([0, widthCur*1/boxwidth,widthCur*2/boxwidth,widthCur*3/boxwidth,widthCur*4/boxwidth,widthCur*5/boxwidth,widthCur*6/boxwidth,widthCur*7/boxwidth,widthCur*8/boxwidth]);

        var xDomain = x.domain(domain);
        let xAxis = d3.axisTop(x).tickSizeOuter(0);

        color_bars.append('g').classed('axis', true)
              .attr('transform', "translate("+(widthCur*xloc)+"," + heightCur*0.5 + ")").call(xAxis)
              .style('font-size', d=>heightCur*0.3+'px')
              .style('text-anchor', 'start');
        let text_bars = color_bars.selectAll('g').selectAll('g').selectAll('text');
        text_bars.attr('y', -heightCur*0.1)
        let lines_bars = color_bars.selectAll('g').selectAll('g').selectAll('line');
        lines_bars.attr('y2', -heightCur*0.06)

        //Make the bars for each elements.
        let bars = ptable_bars.selectAll('g').data(this.ptable).enter().append('g');

        bars
            .append("rect")
            .attr("y", d=> d.row*heightCur)
            .attr("x", d=> d.column*widthCur)
            .attr('height',heightCur*0.92)
            .attr('width', widthCur*0.92)
            .attr('class',"tile nothighlighted")
            .style('fill',d => colorScale(d.count));


        //Make the text for each elements which will be correlated with the bars.
        bars
            .append('text')
            .attr("y", d=> d.row*heightCur+heightCur*0.6)
            .attr("x", d=> d.column*widthCur)
            .attr("dx", d=> widthCur*0.45)
            .attr('class', d => d.symbol + " tilestext")
            .style('font-size', d=>heightCur*0.4+'px')
            .style('fill', function(d){if(d.count > 0){ return 'black'} return '#999999'})
            .text(d =>  d.symbol)



        // bars
            // .append('text')
            // .attr("y", d=> d.row*heightCur+heightCur*0.7)
            // .attr("x", d=> d.column*widthCur)
            // .attr("dx", d=> widthCur*0.05)
            // .attr('class', "tilestext")
            // .attr('text-anchor', 'start')
            // .style('font-size', d=>heightCur*0.2+'px')
            // .style('fill', function(d){if(d.count > 0){ return '#565656'} return 'black'})
            // .text(d =>  d.name);

        //Set the clich mouseover and mouse out event for every elements' bars.
        bars
            .on('click', onClick)
            .on("mouseover", hoverOver)
            .on("mouseout", hoverOff);

        let legendQuantile = d3.legendColor()
            .shapeWidth((this.svgWidth - 2*this.margin.left - this.margin.right)/12)
            .cells(20)
            .orient('vertical')
            .labelFormat(d3.format('.1r'))
            .scale(colorScale);


        let that = this

        //The click function will highlight the element bar which is selected.
        function onClick(d){

            function removeA(arr) {
                var what, a = arguments, L = a.length, ax;
                while (L > 1 && arr.length) {
                    what = a[--L];
                    while ((ax= arr.indexOf(what)) !== -1) {
                        arr.splice(ax, 1);
                    }
                }
                return arr;
            }

            let selected = d3.select(this).select('rect')
            if (that.selectedElements.includes(d.symbol)){
                that.selectedElements = removeA(that.selectedElements, d.symbol)
                selected.classed("nothighlighted", true)
                selected.classed("highlighted", false);
            }else{
                that.selectedElements.push(d.symbol)
                selected.classed("nothighlighted", false)
                selected.classed("highlighted", true);
            }
            updateBarsCharts()
            that.act_vs_pre.onClick(d, that)
            that.tsne.onClick(d, that)
        }

        function hoverOver(d) {
            that.act_vs_pre.hoverOver(d, that)
            that.tsne.hoverOver(d, that)
        }

        function hoverOff(d) {
            that.act_vs_pre.hoverOff(d, that)
            that.tsne.hoverOff(d, that)
        }

        function notclick() {
            var selectedCircle = d3.select(this).select('rect')
            selectedCircle.classed("highlighted",false);
        }

        // updateBarsCharts makes the residual bars with the residual data.
        function updateBarsCharts(){

            if(that.selectedElements.length == 0){
                that.dict = []
                d3.csv("data/experimental_predictions.csv").then(temp => {update_dict(temp);});
                that.text = "All Elements. "
            }
            else{
                that.dict = []
                that.text = "";
                that.selectedElements.forEach(d => {
                    that.text =that.text +d+", "
                    d3.csv("data/element_data/"+d+".csv").then(data => {
                        update_dict(data);});
                })
            }
            that.text = that.text.slice(0, -2) + '.';
            window.setTimeout(update_axis, 1000);
        };
        updateBarsCharts()
        // update_dict read the data about the selected elements.
        function update_dict(data){
            data.forEach(function(item){
                that.dict[item.formula] = item;
           });
        };

        // update_axis find the max and min about the selected elements's residual value and then ask to redraw the residual bars.
        function update_axis(){
            that.dict_axis = [];
            let max_d = -120000;
            let min_d = 120000;
            let count = 0;
            Object.keys(that.dict).forEach(function(key) {
                if(max_d < parseFloat(that.dict[key]['residual'])){
                    max_d = parseFloat(that.dict[key]['residual'])
                }
                if(min_d > parseFloat(that.dict[key]['residual'])){
                    min_d = parseFloat(that.dict[key]['residual'])
                }
                count++;
            });
            that.dict_axis = [Math.floor(min_d),Math.floor(max_d) +1]
            update_barsH(count);
            update_residView();
        };

        //update_barsH make the data which will represent the numbers of formulae in each residual range.
        function update_barsH(count){
            let how_many = 5;
            if(count >50){
                how_many = 15;
            }
            if(count >20){
                how_many = 25;
            }
            if(count >250){
                how_many = 40;
            }

            let domain1 = rangefuc(that.dict_axis[0],that.dict_axis[1],how_many);
            domain1.push(that.dict_axis[1]);
            let i = 0;
            that.barHeight_list = Array(how_many).fill(0);
            Object.keys(that.dict).forEach(function(key) {
                for(i = 0; i < domain1.length-1;i++){
                    if(that.dict[key]['residual']>= domain1[i] && that.dict[key]['residual']< domain1[i+1]){
                        that.barHeight_list[i]++;
                        i = domain1.length-1;
                    }
                }
            });

        };

        //update_residView will redraw the bars for each residual range and the axis.
        function update_residView(){
            that.svg.select("#resid_bars").selectAll("*").remove();
            let widthCur = parseInt(that.svgWidth/20);
            let heightCur =parseInt(that.svgHeight/12);
            let how_many = that.barHeight_list.length;
            let x_rate = widthCur*5/how_many;
            // let range1 = ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#4a1486'];
            // let domain1 = [0,2,5,20,60,100,180,300]
            let range1 = ['#c9c9c9','#c9c9c9'];
            let domain1 = [0, 300]
            let colorScale1 = d3.scaleLinear()
                .domain(domain1)
                .range(range1);
            var resibar = that.svg.select("#resid_bars")
            resibar.append('g').attr('id', 'title_of_resid_bar');
            let rtitle_group = resibar.select('#title_of_resid_bar');
            rtitle_group.append('text')
                .attr('x', widthCur*5)
                .attr('y', heightCur*0.3)
                .style('font-size', d=>heightCur*0.3+'px')
                .style('fill','black')
                .style('text-anchor', 'middle')
                .text(d=>"Plot for Residual: "+that.text);

            let rate = (heightCur*3.2)/(Math.max.apply(null, that.barHeight_list));


            let r_bars =  resibar.selectAll('rect').data(that.barHeight_list);
            r_bars.enter()
                .append('rect')
                .attr('x', (d,i)=>widthCur*3.5+i*x_rate)
                .attr('y', d=>heightCur*3.6-d*rate)
                .attr('width',x_rate)
                .attr('height', d=>d*rate)
                .style('fill', d=> colorScale1(d))
                .style( 'stroke', '#101010')
                .style('stroke-width',1);
            r_bars.attr("transform",
            "translate(" + widthCur + "," +heightCur + ")");

            let xScale = d3.scaleLinear()
                .domain([that.dict_axis[0], that.dict_axis[1]])
                .range([widthCur*3.5,widthCur*9])
                .nice()
            let yScale = d3.scaleLinear()
                .domain([Math.max.apply(null, that.barHeight_list), 0])
                .range([heightCur*0.4, heightCur*3.6])
                .nice()
            let xAxis = d3.axisTop(xScale).tickSizeOuter(0);
            let yAxis_left = d3.axisLeft(yScale).tickSizeOuter(0);

            resibar.append('g').classed('axis', true)
                    .attr('id', 'x_axis')
                    .attr('transform', "translate("+0+"," + heightCur*3.6 + ")").call(xAxis)
                    .style('font-size', d=>heightCur*0.16+'px')
                    .style('text-anchor', 'middle');
            let rtext_bars = resibar.select('#x_axis').selectAll('g').selectAll('text');
            rtext_bars.attr('y', heightCur*0.16)
            let rlines_bars = resibar.select('#x_axis').selectAll('g').selectAll('line');
            rlines_bars.attr('y2', heightCur*0.06)

            resibar.append('g').classed('axis', true)
                    .attr('id', 'y_axis')
                    .attr('transform', "translate("+widthCur*3.5+"," +0 + ")").call(yAxis_left)
                    .style('font-size', d=>heightCur*0.16+'px')
                    .style('text-anchor', 'middle');
            let rtext_barsy = resibar.select('#y_axis').selectAll('g').selectAll('text');
            rtext_barsy.attr('x', -heightCur*0.16)
            let rlines_barsy = resibar.select('#y_axis').selectAll('g').selectAll('line');
            rlines_barsy.attr('x2', -heightCur*0.06)
        };


        // a helper function to create the array based on start number, end number and length of the array.
        function rangefuc(start, end, len) {
            var step = ((end - start) / len)
            return Array(len).fill().map((_, idx) => start + (idx * step))
        }




    };




}
