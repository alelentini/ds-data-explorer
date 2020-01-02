
/*--------------------------------------------------------------------------------------------------------*/
// Global Variables & Objects
/*--------------------------------------------------------------------------------------------------------*/

const mean_line_color = '#613504';
const DS_TABLE_COL_0_WIDTH = '50px';
const DS_TABLE_COL_WIDTH = '100px';
var DS_ROW_VIEW = ds.row_num <= 500 ? ds.row_num : 500;
var col_ix_sel = -1;
var col_ix_sel_old = 0;
var dec_digits = 2;


/*--------------------------------------------------------------------------------------------------------*/
// General functions
/*--------------------------------------------------------------------------------------------------------*/

function col_class(col_ix) {

    switch (ds.col_subtypes_2[col_ix]) {
        case 'ID':
            return 'col-name-id';
            break;
    
        case 'C':
            return 'col-name-class';
            break;

        default:
            return 'col-name';
            break;
    }
}


/*--------------------------------------------------------------------------------------------------------*/
// Data population functions
/*--------------------------------------------------------------------------------------------------------*/

function download_df() {

    var script = document.createElement('script');
    script.src = 'js/atmospheric_presure-eda-df.js';
    script.onload = function () {
        populate_data_table();
        populate_profiling(0);
        document.getElementById('loading-msg').classList.add('d-none');
    }
    document.body.appendChild(script);
}


function populate_description() {

    document.getElementById('ds-name').innerHTML = ds.name;
    document.getElementById('ds-file-name').innerHTML = ds.file_name; 
    document.getElementById('ds-file-size-disk').innerHTML = ds.file_size;
    document.getElementById('ds-file-size-memory').innerHTML = ds.mem_size;
    document.getElementById('ds-description-1').innerHTML = ds.description;
    document.getElementById('ds-row-num').innerHTML = ds.row_num.toLocaleString();
    document.getElementById('ds-col-num').innerHTML = ds.col_num;

    populate_col_sum_table();
}


function populate_col_sum_table() {

    var col_ix;
    var s = '';


    // Populates profiling table
    for(col_ix = 0; col_ix < ds.col_num; col_ix++) {
        s += '<tr onclick="populate_profiling(' + col_ix + ')" style="cursor:pointer" title="View column profiling">' + 
                '<td style="width:50%"><p class="' + col_class(col_ix) + '">' +  
                    ds.col_names[col_ix] + '</p><p>' + ds.col_types[col_ix] + ' | ' + ds.col_subtypes[col_ix] + '</p></td>' + 
                '<td style="width:50%">' + 
                    '<p>' + ds.col_description[col_ix] + '</p>' +
                    '<p>' + (ds.col_values[col_ix].nulls > 0 ? '<span style="font-size:130%;color:red">&#9679;</span> ' : '<span style="font-size:130%;color:green">&#9679;</span> ') + 
                        'Nulls:' + ds.col_values[col_ix].nulls; + '</p>' +
                '</td>' +
            '</tr>';
    }
    document.getElementById('col-table-body').innerHTML = s;
}


function populate_profiling(col_ix) {

    var row_ix;


    if(col_ix != col_ix_sel) {

        // Update loading message
        document.getElementById('loading-msg').innerHTML = 'Creating charts <i class="fa fa-spinner fa-spin"></i>';
        document.getElementById('loading-msg').classList.remove('d-none');

        // Updates selected column in Columns table
        document.getElementById('col-table-body').rows[col_ix_sel_old].classList.remove('selected');
        document.getElementById('col-table-body').rows[col_ix].classList.add('selected');
        
        // Updates selected column in Data table
        document.getElementById('ds-table-head').rows[0].cells[col_ix_sel_old + 1].classList.remove('selected');
        document.getElementById('ds-table-body').querySelectorAll('.col-' + col_ix_sel).forEach(
            elem => {elem.classList.remove('selected')}
        );        
        document.getElementById('ds-table-head').rows[0].cells[col_ix + 1].classList.add('selected');
        document.getElementById('ds-table-body').querySelectorAll('.col-' + col_ix).forEach(
            elem => {elem.classList.add('selected')}
        );

        // Updates column profiling name
        document.getElementById('col-name').innerHTML = ds.col_names[col_ix];
        switch(ds.col_subtypes_2[col_ix]) {
            case 'ID':
                document.getElementById('col-name').classList.remove('col-name', 'col-name-class');
                document.getElementById('col-name').classList.add('col-name-id');
                document.getElementById('col-subtype_2').innerHTML = ': identifier field';
                break;

            case 'C':
                document.getElementById('col-name').classList.remove('col-name-id', 'col-name');
                document.getElementById('col-name').classList.add('col-name-class');
                document.getElementById('col-subtype_2').innerHTML = ': class field';
                break;

            default:
                document.getElementById('col-name').classList.remove('col-name-class', 'col-name-id');
                document.getElementById('col-name').classList.add('col-name');
                document.getElementById('col-subtype_2').innerHTML = ': attribute field';
                break;
        }

        // Updates profiling table & charts
        document.getElementById('col-num-stats').classList.add('d-none');
        if(ds.col_types[col_ix] == 'numeric' && ds.col_subtypes_2[col_ix] != 'ID') {
            // Updates profiling table
            rows = document.getElementById('col-num-stats-body').rows;
            rows[0].cells[1].innerHTML = ds.col_values[col_ix].mean.toFixed(2);
            //rows[0].cells[3].innerHTML = ds.col_values[col_ix].mode;
            rows[1].cells[1].innerHTML = ds.col_values[col_ix].sd.toFixed(2);
            rows[2].cells[1].innerHTML = ds.col_values[col_ix].min.toFixed(2);
            rows[3].cells[1].innerHTML = ds.col_values[col_ix].max.toFixed(2);
            rows[4].cells[1].innerHTML = ds.col_values[col_ix].range.toFixed(2);
            rows[2].cells[3].innerHTML = ds.col_values[col_ix].q1.toFixed(2);
            rows[3].cells[3].innerHTML = ds.col_values[col_ix].q2.toFixed(2);
            rows[4].cells[3].innerHTML = ds.col_values[col_ix].q3.toFixed(2);
            document.getElementById('col-num-stats').classList.remove('d-none');
            // Updates profiling charts
            create_numeric_chart(col_ix);
        } else if(ds.col_types[col_ix] == 'text' && ds.col_subtypes_2[col_ix] != 'ID') {
            // Updates profiling table
            
            // Updates profiling charts
            create_text_chart(col_ix);
        } else {
            document.getElementById('prof-charts').classList.add('d-none');
        }

        // Updates current and previous selected column indexes
        col_ix_sel = col_ix;
        col_ix_sel_old = col_ix_sel;

        // Update loading message
        document.getElementById('loading-msg').classList.add('d-none');
    }
}


function populate_data_table() {

    var row_ix;
    var col_ix;
    var s;


    // Populates dataset table: head
    s = '<th style="width:' + DS_TABLE_COL_0_WIDTH + '" scope="col" class="text-center">#</th>'
    for(col_ix = 0; col_ix < ds.col_num; col_ix++) {
        s += '<th style="width:' + DS_TABLE_COL_WIDTH + 
            ';cursor:pointer" title="View column profiling" scope="col" class="text-center"><span onclick="populate_profiling(' + 
            col_ix + ')" class="' + col_class(col_ix) + '">' +  
            ds.col_names[col_ix] + '</span></th>'
    }
    document.getElementById('ds-table-head').innerHTML = '<tr>' + s + '</tr>';

    // Populates dataset table: body
    s = ''
    for(row_ix = 0; row_ix < DS_ROW_VIEW; row_ix++) {
        s += '<tr><td class="text-center" style="width:' + DS_TABLE_COL_0_WIDTH + '">' +  (row_ix + 1) + '</td>';
        for(col_ix = 0; col_ix < ds.col_num; col_ix++) {
            if(ds.col_types[col_ix] == 'numeric' && ds.col_subtypes[col_ix] == 'decimal') {
                s += '<td class="text-right col-' + col_ix + '"  style="width:' + DS_TABLE_COL_WIDTH + '">' +  (df[row_ix][col_ix] === null ? '<span style="color:red">null<span>' : df[row_ix][col_ix].toFixed(2)) + '</td>';
            } else {
                s += '<td class="text-right col-' + col_ix + '"  style="width:' + DS_TABLE_COL_WIDTH + '">' +  (df[row_ix][col_ix] === null ? '<span style="color:red">null<span>' : df[row_ix][col_ix]) + '</td>';
            }
        }
        s += '</tr>'
    }
    document.getElementById('ds-table-body').innerHTML = s;

    // Updates data showing label
    document.getElementById('ds-view-show-info').innerHTML = 'Showing ' + 
        (ds.row_num <= DS_ROW_VIEW? DS_ROW_VIEW : 'first ' + DS_ROW_VIEW) +
        ' rows | ' + ds.col_num + ' columns';
}


function create_text_chart(col_ix) {

    var vlSpec;
    var vlValues = [];
    
    
    // Bar chart data
    vlValues.push({'Value': 'Null', 'Count': ds.col_values[col_ix].nulls});
    j = ds.col_values[col_ix].unique_values.length;
    for(i = 0; i < j; i++) {
        vlValues.push({'Value': ds.col_values[col_ix].unique_values[i], 'Count': ds.col_values[col_ix].unique_count[i]});
    }
    
    // Bar chart
    vlSpec = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v4.json',
        'width': 'container',
        'config': {'style': {'cell': {'stroke': 'transparent'}}},
        'data': {'values': vlValues},
        'encoding': {
            'y': {'field': 'Value', 'type': 'nominal', 'title': null, 'sort': '-y', 'axis': {'labelExpr': 'truncate(datum.label, 10)'}},
            'x': {'field': 'Count', 'type': 'quantitative', 'title': null, 'axis': {'domain': false, 'ticks': false, 'labels': false, 'grid': false}}
        },
        'layer': [
            {
                'mark': {'type': 'bar', 'opacity': 0.7, 'tooltip': true}
            }, 
            {
                'mark': {'type': 'text', 'align': 'left', 'baseline': 'middle', 'dx': 3}, 
                'encoding': {'text': {'field': 'Count', 'type': 'quantitative'}}
            }
        ]
    }
    document.getElementById('prof-charts').classList.remove('d-none');
    vegaEmbed('#prof-charts', vlSpec, {'actions': false});
}


function create_numeric_chart(col_ix) {

    var row_ix;
    var vlSpec;
    var vlValues = [];
    

    // Charts data
    j = df.length;
    for(row_ix = 0; row_ix < j; row_ix++) {
        if(df[row_ix][col_ix] !== null) {
            vlValues.push(df[row_ix][col_ix]);
        }
    }
   
    // Boxplot & Histogram chart
    vlSpec = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v4.json',
        'config': {'style': {'cell': {'stroke': 'transparent'}}},
        'data': {'values': vlValues},
        'vconcat': [
            // Strip chart
            {
                'width': 'container', 
                'layer': [
                    // Strip
                    {
                        'mark': 'tick',
                        'encoding': {
                            'x': {'field': 'data', 'type': 'quantitative',
                                'scale': {
                                    'domain': [Math.floor(ds.col_values[col_ix].min), Math.ceil(ds.col_values[col_ix].max)]
                                },
                                'axis': {'grid': false},
                                'title': null
                            },
                            'tooltip': {'field': 'data', 'type': 'quantitative'}
                        }
                    },
                    // Mean line
                    {
                        'mark': {'type': 'rule', 'opacity': 0.9, 'tooltip': true},
                        'encoding': {
                            'x': {'field': 'data', 'type': 'quantitative', 'aggregate': 'mean', 'title': null},
                            'color': {'value': mean_line_color},
                            'size': {'value': 1.5}
                        }
                    }
                ]
            },
            // Boxplot chart
            {
                'width': 'container', 
                'layer': [
                    // Boxplot
                    {
                        'mark': {
                            'type': 'boxplot', 'extent': 1.5, 'opacity': 0.7, 'median': {'strokeWidth': 3}, 
                            'outliers': {'color': 'red'}
                        }, 
                        'encoding': {
                            'x': {'field': 'data', 'type': 'quantitative', 
                                'scale': {
                                    'domain': [Math.floor(ds.col_values[col_ix].min), Math.ceil(ds.col_values[col_ix].max)]
                                }, 
                                'title': null
                            },
                            'tooltip': {'field': 'data', 'type': 'quantitative'}
                        }
                    },
                    // Mean line
                    {
                        'mark': {'type': 'rule', 'opacity': 0.9, 'tooltip': true},
                        'encoding': {
                            'x': {'field': 'data', 'type': 'quantitative', 'aggregate': 'mean', 'title': null},
                            'color': {'value': mean_line_color},
                            'size': {'value': 1.5}
                        }
                    }
                ]
            },
            // Histogram chart
            {
                'height': 100,
                'width': 'container', 
                'layer': [
                    // Histogram
                    {
                        'mark': {'type': 'bar', 'opacity': 0.7, 'tooltip': true},
                        'encoding': {
                            'x': {'field': 'data', 'type': 'quantitative', 'bin': true, 'scale': {'domain': [Math.floor(ds.col_values[col_ix].min), Math.ceil(ds.col_values[col_ix].max)]}, 'title': null},
                            'y': {'type': 'quantitative', 'aggregate': 'count', 'title': null}
                        }
                    },
                    // Mean line
                    {
                        'mark': {'type': 'rule', 'opacity': 0.9, 'tooltip': true},
                        'encoding': {
                            'x': {'field': 'data', 'type': 'quantitative', 'aggregate': 'mean', 'title': null},
                            'color': {'value': mean_line_color},
                            'size': {'value': 1.5}
                        }
                    }
                ]
            }
        ]
    }
    document.getElementById('prof-charts').classList.remove('d-none');
    vegaEmbed('#prof-charts', vlSpec, {'actions': false});
}


/*--------------------------------------------------------------------------------------------------------*/
// MAIN FUNCTION: Called by onload event
/*--------------------------------------------------------------------------------------------------------*/

// Initializes Profile  
function initEda() {

    // Download dataframe data
    download_df();
    
    // Populates dataset information summary
    populate_description();

    // Populates dataset view table
    //populate_data_table(); 

    // Populates profiling
    //populate_profiling(0);  
}