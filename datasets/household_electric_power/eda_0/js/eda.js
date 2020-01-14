
/*--------------------------------------------------------------------------------------------------------*/
// Global Variables & Objects
/*--------------------------------------------------------------------------------------------------------*/

var start_time;
var df_cols_loaded = [];
var mean_line_color = '#613504';
var data_table;
var DATA_ROW_FIRST = 0;
var DATA_ROW_LAST = 10000;


/*--------------------------------------------------------------------------------------------------------*/
// General functions
/*--------------------------------------------------------------------------------------------------------*/

// Formats a quantity in bytes to a string appending the corresponding unit: B, KB, MB, GB, TB
function format_bytes(bytes) {

    var units = {a: 'bytes', b: 'KB', c: 'MB', d: 'GB', e: 'TB'};

    for (const prop in units) {
        if(bytes < 1000) {
            return `${bytes.toFixed(2)} ${units[prop]}`; 
        }
        bytes /= 1024;
    }
}


// Toggles visibility of sections
function toggle_section(section_id) {

    document.getElementById('section-' + section_id).classList.toggle('d-none');
    if(document.getElementById('section-button-' + section_id).classList.contains('chevron-up')) {
        document.getElementById('section-button-' + section_id).classList.remove('chevron-up');
        document.getElementById('section-button-' + section_id).classList.add('chevron-down');
    } else {
        document.getElementById('section-button-' + section_id).classList.remove('chevron-down');
        document.getElementById('section-button-' + section_id).classList.add('chevron-up');
    }
}


// Toggles visibility of column profiling detail rows
function toggle_col_prof_details(col_ix) {

    document.getElementById('col-prof-det-' + col_ix).classList.toggle('d-none');
    // Creates charts
    if(!document.getElementById('col-prof-det-' + col_ix).classList.contains('d-none')) {
        if(ds.columns[col_ix].types.length == 1) {
            switch(ds.columns[col_ix].types[0].type) {
                case 'numeric':
                    setTimeout(create_numeric_chart, 500, col_ix);
                    break;
            }
        }
    }
}


// Inferes data type CSS class
function infer_data_type_class(value) {

    return 'unknown';
    /*if(RegExp('^[+-]?\\d+[\.]?\\d+$').test(value)) {
        return 'numeric';
    } else if() {

    } else {
        return 'unknown';
    }*/
}



/*--------------------------------------------------------------------------------------------------------*/
// Data population functions
/*--------------------------------------------------------------------------------------------------------*/

// Download dataset data
function download_df() {

    var script;

    start_time = new Date();
    
    // Updates UI
    document.getElementById('loading-col-msg').classList.remove('d-none');
    document.getElementById('loading-col-msg-status').innerHTML = ' Loading data for column 1/' + ds.col_num;
    
    // Download data via scripts for each column
    for(var col_ix = 0; col_ix < ds.col_num; col_ix++) {
        script = document.createElement('script');
        script.id = 'script-df-col-' + col_ix;
        script.src = 'data/eda-df-col-' + col_ix + '.js';
        script.async = true;
        script.defer = true;
        script.onload = function () {
            df_cols_loaded.push('OK');
            // Updates UI - Loading message
            if(df_cols_loaded.length < ds.col_num - 1) {
                document.getElementById('loading-col-msg-status').innerHTML = ' Loading data for column ' + 
                    (df_cols_loaded.length + 1) + '/' + ds.col_num;
                document.getElementById('data-col-progress').value = (df_cols_loaded.length + 1) / ds.col_num;
            } else {
                document.getElementById('data-col-progress').classList.add('d-none');
                document.getElementById('loading-col-msg-status').innerHTML = ' Building data table';
            }
        }
        document.body.appendChild(script);
    }

    // Checks each second if all data was loaded and then populates dataset table
    intId = window.setInterval(() => {
        if(df_cols_loaded.length == ds.col_num) {
            window.clearInterval(intId);
            populate_data_table(DATA_ROW_LAST);
        }
    }, 1000);
}


// Populates dataset data
function populate_data_table(rows) {

    var columns = [];
    var config = {};
    var data = [];
    var row = {};
    var s;
    

    // Updates rows number to a maximum of dataset rows
    rows = (rows > ds.row_num) ? ds.row_num : rows;

    // Populates columns definition
    columns.push({title: 'row ix', field: 'id', frozen: true});
    for(var col_ix = 0; col_ix < ds.col_num; col_ix++) {
        columns.push({title: col_title(col_ix), field: 'c' + col_ix});
    }
    
    // Populates data
    for(var row_ix = 0; row_ix < rows; row_ix++) {
        row = {id: (row_ix + 1).toLocaleString('en')};
        for(col_ix = 0; col_ix < ds.col_num; col_ix++) {
            row['c' + col_ix] = window['df_col_' + col_ix][row_ix];
        }
        data.push(row);
    }

    // Creates data table
    config = {
        height: 450,
        data: data,
        progressiveRender: true,
        columns: columns
    }
    data_table = new Tabulator("#data-table", config);

    // Updates UI
    if(rows == ds.row_num) {
        s = '<span class="caption" style="margin-left:15px">Showing all rows</span>';
    } else {
        s = '<span class="caption" style="margin-left:15px">Showing first ' + rows.toLocaleString('en') +
                ' rows';
                //' rows | <a href="#" onclick="populate_data_table(' + ds.row_num + ')" title="Show all rows">Show all</a></span';
    }
    document.getElementById('data-table-info').innerHTML = s;
    document.getElementById('loading-col-msg').classList.add('d-none');
}


// Returns HTML for data table column header
function col_title(col_ix) {

    // Column name
    var s = '<span class="col-name">' + ds.columns[col_ix].name + '</span>';

    // Data ml type
    s += '<p class="data-table-header-info">' + col_ml_type(col_ix) + '</p>';

    // Nulls values
    s += '<p class="data-table-header-info">' + col_nulls(col_ix) + ' Nulls</p>';

    // Data types
    if(ds.columns[col_ix].types.length == 1) {
        s += '<p class="data-table-header-info"><i class="fa fa-check" style="color:green"></i> Homogeneous type</p>' +
             '<p style="margin-left:15px" class="data-table-header-info data-type-' + ds.columns[col_ix].types[0].type + '">'+
                ds.columns[col_ix].types[0].type + ' | ' + 
                ds.columns[col_ix].types[0].subtype + 
             '</p>';
    } else {
        s += '<p class="data-table-header-info"><i class="fa fa-exclamation-triangle" style="color:orange"></i> Mixed types</p>';
        for(var col_type_ix = 0; col_type_ix < ds.columns[col_ix].types.length; col_type_ix++) {
            s += '<p style="margin-left:15px" class="data-table-header-info data-type-' + ds.columns[col_ix].types[col_type_ix].type + '">' +
                    ds.columns[col_ix].types[col_type_ix].type + ' | ' + 
                    ds.columns[col_ix].types[col_type_ix].subtype + 
                '</p>';
        }   
    }

    // Interval info for date-time columns
    if(ds.columns[col_ix].types.length == 1 && ds.columns[col_ix].types[0].type == 'date-time') {
        if(ds.columns[col_ix].sum_stats.intervals.length == 2) {
            s += '<p class="data-table-header-info"><i class="fa fa-check" style="color:green"></i> Unique interval</p>';
        } else {
            s += '<p class="data-table-header-info"><i class="fa fa-exclamation-triangle" style="color:orange"></i> ' + 
                ds.columns[col_ix].sum_stats.intervals.length + ' different intervals';
        }
    }

    return s;
}


// Updates UI: dataset info section
function update_ds_info() {

    document.getElementById('ds-name').innerHTML =  ds.name;
    document.getElementById('ds-disk-size').innerHTML =  format_bytes(ds.file_size);
    document.getElementById('ds-path').innerHTML =  ds.file_path;
    document.getElementById('ds-description').innerHTML = ds.description;
    document.getElementById('ds-references').innerHTML = ds.references[0];
    for(var i = 1; i < ds.references.length; i++) {
        document.getElementById('ds-references').innerHTML += '<br>' + ds.references[i];
    }
    document.getElementById('ds-rows').innerHTML = ds.row_num.toLocaleString('en');
    document.getElementById('ds-columns').innerHTML = ds.col_num.toLocaleString('en');
}


// Updates UI: Column profiling
function update_column_profiling() {

    var s = '';

    // Creates Column Profiling HTML table
    for(var col_ix = 0; col_ix < ds.col_num; col_ix++) {
        s += '<tr>' +
                '<td style="border-bottom:none">' + col_name(col_ix) + '</span></td>' +
                '<td style="border-bottom:none">' + col_types(col_ix) + '</td>' +
                '<td style="border-bottom:none">' + col_ml_type(col_ix) + '</td>' +
                '<td style="border-bottom:none">' + col_nulls(col_ix) + '</td>' +
                '<td style="border-bottom:none">' + ds.columns[col_ix].description + '</td>' +
             '</tr>' +
             '<tr id="col-prof-det-' + col_ix + '" class="d-none">' +
                '<td colspan=5 style="border-top:none">' + col_prof_details(col_ix) + '</td>' +
             '</tr>';
    }
    document.getElementById('col-prof-table-body').innerHTML = s;
}


// Creates HTML for column name
function col_name(col_ix) {

    return '<i class="fa fa-search" style="cursor:pointer" onclick="toggle_col_prof_details(' + col_ix + ')" title="Show/hide profiling details"></i>&nbsp;&nbsp;<span class="col-name">' + ds.columns[col_ix].name + '</span>';
}


// Creates HTML for column type tables
function col_types(col_ix) {

    if(ds.columns[col_ix].types.length == 1) {
        s = '<p style="margin-bottom:2px"><i class="fa fa-check" style="color:green"></i> Homogeneous type</p>';
    } else {
        s = '<p style="margin-bottom:2px"><i class="fa fa-exclamation-triangle" style="color:orange"></i> Mixed types</p>';
    }
    s += '<table id="col-types-table-' + col_ix + '" class="table table-col-types table-borderless table-hover table-condensed"><tbody>';
    for(var col_type_ix = 0; col_type_ix < ds.columns[col_ix].types.length; col_type_ix++) {
        s += '<tr class="data-type-' + ds.columns[col_ix].types[col_type_ix].type + '">' + 
                '<td style="width:40%">' + ds.columns[col_ix].types[col_type_ix].type + '</td>' + 
                '<td style="width:40%">' + ds.columns[col_ix].types[col_type_ix].subtype + '</td>' +
                '<td style="width:20%">' + ds.columns[col_ix].types[col_type_ix].count.toLocaleString('en') + '</td>' + 
             '</tr>';
    }
    return s + '</tbody></table>';
}


// Returns description for column ml_type
function col_ml_type(col_ix) {

    switch(ds.columns[col_ix].ml_type) {
        case 'A':
            return 'Attribute';  
        case 'C':
            return 'Class';
        case 'I':
            return 'Identifier';
    }
}


// Creates HTML for column nulls
function col_nulls(col_ix) {

    if(ds.columns[col_ix].sum_stats.nulls == 0) {
        return '<i class="fa fa-check" style="color:green"></i> 0';
    } else {
        return '<i class="fa fa-times" style="color:red"></i> ' + ds.columns[col_ix].sum_stats.nulls.toLocaleString('en');
    }
}


// Creates HTML for column profiling details rows
function col_prof_details(col_ix) {

    var s = '';
    var s2 = '';
    var ix;

    if(ds.columns[col_ix].types.length == 1) {
        switch(ds.columns[col_ix].types[0].type) {
            // Numeric type
            case 'numeric':
                s = '<div class="row">' +
                        '<div class="col-4">' +
                            '<table id="col-num-stats-"' + col_ix + '" class="table table-borderless table-condensed table-hover">' +
                                '<tbody id="col-num-stats-tbody-' + col_ix + '">' +
                                    '<tr><td class="caption" style="width:25%">Mean:</td><td>' + ds.columns[col_ix].sum_stats.mean.toFixed(2).toLocaleString('en') + '</td><td class="caption" style="width:25%">Mode:</td><td></td></tr>' +
                                    '<tr><td class="caption" style="width:25%">SD:</td><td>' + ds.columns[col_ix].sum_stats.sd.toFixed(2).toLocaleString('en') + '</td><td class="caption" style="width:25%">MAD:</td><td></td></tr>' +
                                    '<tr><td class="caption" style="width:25%">Min:</td><td>' + ds.columns[col_ix].sum_stats.min.toFixed(2).toLocaleString('en') + '</td><td class="caption" style="width:25%">Q1:</td><td>' + ds.columns[col_ix].sum_stats.q1.toFixed(2).toLocaleString('en') + '</td></tr>' +
                                    '<tr><td class="caption" style="width:25%">Max:</td><td>' + ds.columns[col_ix].sum_stats.max.toFixed(2).toLocaleString('en') + '</td><td class="caption" style="width:25%">Q2:</td><td>' + ds.columns[col_ix].sum_stats.q2.toFixed(2).toLocaleString('en') + '</td></tr>' +
                                    '<tr><td class="caption" style="width:25%">Range:</td><td>' + ds.columns[col_ix].sum_stats.range.toFixed(2).toLocaleString('en') + '</td><td class="caption" style="width:25%">Q3:</td><td>' + ds.columns[col_ix].sum_stats.q3.toFixed(2).toLocaleString('en') + '</td></tr>' +
                                    '<tr><td class="caption" style="width:25%">Unique values:</td><td>' + ds.columns[col_ix].sum_stats.values.length.toLocaleString('en') + ' (' + ((ds.columns[col_ix].sum_stats.values.length / ds.row_num) * 100).toFixed(2) + '%)</td><td class="caption" style="width:25%"></td><td></td></tr>' +
                                '</tbody>' +
                            '</table>' +
                        '</div>' +
                        '<div class="col-8" id="chart-col-' + col_ix + '">' +
                            '<p class="caption"><i class="fa fa-spinner fa-spin"></i> Building charts</p>' +
                        '</div>' +
                    '</div>';
                return s;
                break;

            // Date-time type
            case 'date-time':
                for(ix = 0; ix < ds.columns[col_ix].sum_stats.values.length; ix++) {
                    s2 += '<tr class="data-type-' + infer_data_type_class(ds.columns[col_ix].sum_stats.values[ix].value) + '">' + 
                            '<td style="width:60%">' + ds.columns[col_ix].sum_stats.values[ix].value + '</td>' +
                            '<td style="width:40%">' + ds.columns[col_ix].sum_stats.values[ix].delta +' </td>' +
                        '</tr>';
                }
                s = '<div class="row">' +
                        '<div class="col-4">' +
                            '<table id="col-num-stats-"' + col_ix + '" class="table table-borderless table-condensed table-hover">' +
                                '<tbody id="col-num-stats-tbody-' + col_ix + '">' +
                                    '<tr><td class="caption" style="width:25%">Start:</td><td>' + ds.columns[col_ix].sum_stats.start + '</td><td class="caption" style="width:25%"></td><td></td></tr>' +
                                    '<tr><td class="caption" style="width:25%">End:</td><td>' + ds.columns[col_ix].sum_stats.end + '</td><td class="caption" style="width:25%"></td><td></td></tr>' +
                                    '<tr><td class="caption" style="width:25%">Interval:</td><td>' + col_intervals_sum(col_ix, true) + '</td><td class="caption" style="width:25%"></td><td></td></tr>' +
                                    //'<tr><td class="caption" style="width:25%">Unique values:</td><td>' + ds.columns[col_ix].sum_stats.values.length.toLocaleString('en') + ' (' + ((ds.columns[col_ix].sum_stats.values.length / ds.row_num) * 100).toFixed(2) + '%)</td><td class="caption" style="width:25%"></td><td></td></tr>' +
                                '</tbody>' +
                            '</table>' +
                        '</div>' +
                        '<div class="col-4">' +
                            '<p><span class="caption">Unique values: </span>' + ds.columns[col_ix].sum_stats.values.length.toLocaleString('en') + ' (' + ((ds.columns[col_ix].sum_stats.values.length / ds.row_num) * 100).toFixed(2) + '%)</p>' +
                            '<table id="col-num-stats-2-"' + col_ix + '" class="table table-borderless table-condensed table-hover table-col-prof-det">' +
                                '<thead id="col-num-stats-2-head-' + col_ix + '">' +
                                    '<tr>' +
                                        '<th style="width:60%">Value</th>' +
                                        '<th style="width:40%">Interval</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody id="col-num-stats-2-tbody-' + col_ix + '">'+ s2 + '</tbody>' +
                            '</table>' +
                        '</div>' +
                        '<div class="col-4"></div>' +
                    '</div>';
                return s;
                break;

            // Other types
            default:
                return s;
                break;
        }
    } else {
        for(ix = 0; ix < ds.columns[col_ix].sum_stats.values.length; ix++) {
            s2 += '<tr class="data-type-' + infer_data_type_class(ds.columns[col_ix].sum_stats.values[ix].value) + '">' + 
                    '<td style="width:60%">' + ds.columns[col_ix].sum_stats.values[ix].value + '</td>' +
                    //'<td style="width:60%">' + infer_data_type(ds.columns[col_ix].sum_stats.values[ix].value) + '</td>' +
                    '<td style="width:40%">' + ds.columns[col_ix].sum_stats.values[ix].count.toLocaleString('en') + ' (' + ((ds.columns[col_ix].sum_stats.values[ix].count / ds.row_num) * 100).toFixed(2) + '%)</td>' +
                  '</tr>';
        }
        s = '<div class="row">' +
                '<div class="col-4">' +
                    '<p><span class="caption">Unique values: </span>' + ds.columns[col_ix].sum_stats.values.length.toLocaleString('en') + ' (' + ((ds.columns[col_ix].sum_stats.values.length / ds.row_num) * 100).toFixed(2) + '%)</p>' +
                    '<table id="col-num-stats-"' + col_ix + '" class="table table-borderless table-condensed table-hover table-col-prof-det">' +
                        '<thead id="col-num-stats-head-' + col_ix + '">' +
                            '<tr>' +
                                '<th style="width:60%">Value</th>' +
                                '<th style="width:40%">Count</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody id="col-num-stats-tbody-' + col_ix + '">'+ s2 + '</tbody>' +
                    '</table>' +
                '</div>' +
                '<div class="col-8"></div>' +
            '</div>';
        return s;
    }
}


// Creats HTML for date-time column profiling summary
function col_intervals_sum(col_ix, details) {

    var s;

    if(ds.columns[col_ix].sum_stats.intervals.length == 2) {
        s = '<p style="margin-bottom:2px"><i class="fa fa-check" style="color:green"></i> Unique interval</p>' + 
            '<p style="margin-left:10px;margin-top:2px;margin-bottom:2px">' + ds.columns[col_ix].sum_stats.intervals[1] + '</p>';
    } else {
        s = '<p style="margin-bottom:2px"><i class="fa fa-warning" style="color:orange"></i> ' + ds.columns[col_ix].sum_stats.intervals.length + 
            ' different intervals</p>';
        if(details) {
            for(var ix = 1; ix < ds.columns[col_ix].sum_stats.intervals.length; ix++) {
                s += '<p style="margin-left:10px;margin-top:2px;margin-bottom:2px">' + ds.columns[col_ix].sum_stats.intervals[ix] + '</p>';
            }
        }
    }
    return s;
}


// Creates chart for numeric column
function create_numeric_chart(col_ix) {

    if(!document.getElementById('chart-col-' + col_ix).classList.contains('vega-embed')) {
        var vlSpec;
        
        // Boxplot & Histogram chart
        vlSpec = {
            '$schema': 'https://vega.github.io/schema/vega-lite/v4.json',
            'config': {'style': {'cell': {'stroke': 'transparent'}}},
            'data': {'values': window['df_col_' + col_ix]},
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
                                        'domain': [Math.floor(ds.columns[col_ix].sum_stats.min), Math.ceil(ds.columns[col_ix].sum_stats.max)]
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
                                        'domain': [Math.floor(ds.columns[col_ix].sum_stats.min), Math.ceil(ds.columns[col_ix].sum_stats.max)]
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
                                'x': {'field': 'data', 'type': 'quantitative', 'bin': true, 'scale': {'domain': [Math.floor(ds.columns[col_ix].sum_stats.min), Math.ceil(ds.columns[col_ix].sum_stats.max)]}, 'title': null},
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
        vegaEmbed('#chart-col-' + col_ix, vlSpec, {'actions': false});
        document.getElementById('chart-col-msg-' + col_ix).classList.toggle('d-none');
    }
}


/*--------------------------------------------------------------------------------------------------------*/
// MAIN FUNCTION: Called by onload event
/*--------------------------------------------------------------------------------------------------------*/

// Initializes Profile  
function initEda() {

    
    // Customizes dataset summary data processed in Phyton -> To backend processing?
    customize_ds_info();

    // Updates UI: dataset info section
    update_ds_info();

    // Updates UI: Column profiling
    update_column_profiling();

    // Download dataset data
    download_df();
}


/*--------------------------------------------------------------------------------------------------------*/
// DATASET CUSTOM FUNCTIONS
/*--------------------------------------------------------------------------------------------------------*/


// Customizes dataset summary data processed in Phyton -> To backend processing?
function customize_ds_info() {

    var ix;
    var data = [];

    // Modify 'Time' column summary statistics
    ds.columns[1].sum_stats.intervals[1] = 1
    for(ix = 0; ix < ds.columns[1].sum_stats.values.length; ix++) {
        data.push(ds.columns[1].sum_stats.values[ix].value.substring(11));
    }
    data.sort();
    for(ix = 0; ix < ds.columns[1].sum_stats.values.length; ix++) {
        ds.columns[1].sum_stats.values[ix].value = data[ix];
        ds.columns[1].sum_stats.values[ix].delta = ds.columns[1].sum_stats.values[ix].delta.substring(0, 1) + ' minute';
    }
}