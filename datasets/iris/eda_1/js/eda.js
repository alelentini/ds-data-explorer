
/*--------------------------------------------------------------------------------------------------------*/
// Global Variables & Objects
/*--------------------------------------------------------------------------------------------------------*/

const mean_line_color = '#613504';
const DS_TABLE_COL_0_WIDTH = '50px';
const DS_TABLE_COL_WIDTH = '180px';
var col_ix_sel = -1;
var col_ix_sel_old = 0;
var dec_digits = 2;


/*--------------------------------------------------------------------------------------------------------*/
// General functions
/*--------------------------------------------------------------------------------------------------------*/




/*--------------------------------------------------------------------------------------------------------*/
// Data population functions
/*--------------------------------------------------------------------------------------------------------*/

function populate_description() {

    document.getElementById('ds-name').innerHTML = ds.name;
    document.getElementById('ds-file-name').innerHTML = ds.file_name; 
    document.getElementById('ds-file-size-disk').innerHTML = ds.file_size;
    document.getElementById('ds-file-size-memory').innerHTML = ds.mem_size;
    document.getElementById('ds-description-1').innerHTML = ds.description;
    document.getElementById('ds-row-num').innerHTML = ds.row_num;
    document.getElementById('ds-col-num').innerHTML = ds.col_num;

    populate_col_sum_table();
}


function populate_col_sum_table() {

    var col_ix;
    var s = '';


    // Populates profiling table
    for(col_ix = 0; col_ix < ds.col_num; col_ix++) {
        s += '<tr onclick="populate_profiling(' + col_ix + ')" style="cursor:pointer" title="View column profiling">' + 
                '<td style="width:50%"><p class="' + (ds.col_subtypes_2[col_ix] == 'A' ? 'col-name': 'col-name-class') + 
                    '">' +  ds.col_names[col_ix] + '</p><p>' + ds.col_types[col_ix] + ' | ' + ds.col_subtypes[col_ix] + '</p></td>' + 
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
        if(ds.col_subtypes_2[col_ix] == 'C') {
            document.getElementById('col-name').classList.remove('col-name');
            document.getElementById('col-name').classList.add('col-name-class');
        } else {
            document.getElementById('col-name').classList.remove('col-name-class');
            document.getElementById('col-name').classList.add('col-name');
        }

        // Updates profiling table & charts
        document.getElementById('col-num-stats').classList.add('d-none');
        switch (ds.col_types[col_ix]) {
            case 'numeric':
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
                break;
            
            case 'text':
                // Updates profiling table
                
                // Updates profiling charts
                create_text_chart(col_ix);
                break;

            default:
                break;
        }

        // Updates current and previous selected column indexes
        col_ix_sel = col_ix;
        col_ix_sel_old = col_ix_sel;
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
            col_ix + ')" class="' + (ds.col_subtypes_2[col_ix] == 'A' ? 'col-name': 'col-name-class') + '">' +  
            ds.col_names[col_ix] + '</span></th>'
    }
    document.getElementById('ds-table-head').innerHTML = '<tr>' + s + '</tr>';

    // Populates dataset table: body
    s = ''
    for(row_ix = 0; row_ix < ds.row_num; row_ix++) {
        s += '<tr><td class="text-center" style="width:' + DS_TABLE_COL_0_WIDTH + '">' +  (row_ix + 1) + '</td>';
        for(col_ix = 0; col_ix < ds.col_num; col_ix++) {
            if(ds.col_types[col_ix] == 'numeric' && ds.col_subtypes[col_ix] == 'decimal') {
                s += '<td class="text-right col-' + col_ix + '"  style="width:' + DS_TABLE_COL_WIDTH + '">' +  df[row_ix][col_ix].toFixed(2) + '</td>';
            } else {
                s += '<td class="text-right col-' + col_ix + '"  style="width:' + DS_TABLE_COL_WIDTH + '">' +  df[row_ix][col_ix] + '</td>';
            }
        }
        s += '</tr>'
    }
    document.getElementById('ds-table-body').innerHTML = s;

    // Updates data showing label
    document.getElementById('ds-view-show-info').innerHTML = 'Showing ' + ds.row_num + ' rows | ' + ds.col_num + ' columns';
}


function create_text_chart(col_ix) {

    var vlSpec;
    var vlValues = [];
    
    
    // Bar chart data
    vlValues.push({'x': 'Null', 'y': ds.col_values[col_ix].nulls});
    j = ds.col_values[col_ix].unique_values.length;
    for(i = 0; i < j; i++) {
        vlValues.push({'x': ds.col_values[col_ix].unique_values[i], 'y': ds.col_values[col_ix].unique_count[i]});
    }
    
    // Bar chart
    vlSpec = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v4.json',
        'width': 'container',
        'config': {'style': {'cell': {'stroke': 'transparent'}}},
        'data': {'values': vlValues},
        'encoding': {
            'y': {'field': 'x', 'type': 'nominal', 'title': null},
            'x': {'field': 'y', 'type': 'quantitative', 'title': null, 'axis': {'domain': false, 'ticks': false, 'labels': false, 'grid': false}}
        },
        'layer': [
            {
                'mark': {'type': 'bar', 'opacity': 0.7}
            }, 
            {
                'mark': {'type': 'text', 'align': 'left', 'baseline': 'middle', 'dx': 3}, 
                'encoding': {'text': {'field': 'y', 'type': 'quantitative'}}
            }
        ]
    }
    vegaEmbed('#prof-charts', vlSpec, {'actions': false});
}


function create_numeric_chart(col_ix) {

    var row_ix;
    var vlSpec;
    var vlValues = [];
    
    
    // Charts data
    j = df.length;
    for(row_ix = 0; row_ix < j; row_ix++) {
        vlValues.push(df[row_ix][col_ix]);
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
    vegaEmbed('#prof-charts', vlSpec, {'actions': false});
}


/*--------------------------------------------------------------------------------------------------------*/
// MAIN FUNCTION: Called by onload event
/*--------------------------------------------------------------------------------------------------------*/

// Initializes Profile  
function initEda() {

    // Populates dataset information summary
    populate_description();

    // Populates dataset view table
    populate_data_table();

    // Populates profiling
    populate_profiling(0);    
}