
let act_vs_pre = new Act_Vs_Pre();
let linegraph = new Linegraph();
let info = new Info();
let tsne = new TSNE(linegraph);
// let tsne = new TSNE();
//
// let init = true
// if (init){
//     window.location.reload(true);
//     init = false
//     window.stop()
// }

//load the data corresponding to all the elements
//pass this data and instances of all the charts that update on element selection to periodic's constructor
d3.csv("data/ptable.csv").then(ptable => {
    let periodic_table = new Periodic_table(ptable, act_vs_pre, linegraph, info, tsne);
    periodic_table.update();
});
