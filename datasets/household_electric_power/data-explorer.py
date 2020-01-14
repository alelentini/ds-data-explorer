import os
import sys
import datetime
import pandas as pd
import os
import sys
import datetime
import pandas as pd

# ---------------------------------------------------------------------------------------------------------------------
# Complete parameters of the dataset to analyze - Then execute code in MAIN section
# ---------------------------------------------------------------------------------------------------------------------

DS_PATH = 'C:\\Users\\60048007\\Documents\\Projects\\ds\\data-explorer\\datasets\\household_electric_power\\'
DS_FILE_IN = 'household_power_consumption.txt'
DS_FILE_OUT_1 = 'eda-ds.js'
DS_FILE_OUT_2 = 'eda-df.js'
DS_FILE_OUT_3 = 'eda-df'
DS_SEP = ';'
DS_HEADER_ROW = 0
DS_NAME = 'household_electric_power'
DS_DESCRIPTION = 'This archive contains 2075259 measurements gathered in a house located in Sceaux (7km of Paris, ' \
                 'France) between December 2006 and November 2010 (47 months)'
DS_REFERENCES = ['<a href="https://archive.ics.uci.edu/ml/datasets/individual+household+electric+power+consumption" '
                 'target="_blank" title="View dataset definition">UCI Machine Learning Repository: Individual '
                 'household electric power consumption Data Set</a>']
DS_COL_DESCRIPTION = [
    'Date in format dd/mm/yyyy',
    'Time in format hh:mm:ss',
    'Household global minute-averaged active power (in kilowatt)',
    'Household global minute-averaged reactive power (in kilowatt)',
    'Minute-averaged voltage (in volt)',
    'Household global minute-averaged current intensity (in ampere)',
    'Energy sub-metering No. 1 (in watt-hour of active energy). It corresponds to the kitchen, '
    'containing mainly a dishwasher, an oven and a microwave (hot plates are not electric but gas powered)',
    'Energy sub-metering No. 2 (in watt-hour of active energy). It corresponds to the laundry room, '
    'containing a washing-machine, a tumble-drier, a refrigerator and a light',
    'Energy sub-metering No. 3 (in watt-hour of active energy). It corresponds to an electric '
    'water-heater and an air-conditioner'
]
DS_COL_ML_TYPES = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']
DS_SAVE = True
DF_SAVE = False
DF_SAVE_BY_COL = False
DF_MODIFY = False


# --------------------------------------------------------------------------------------------------
# OBJECTS DEFINITION
# --------------------------------------------------------------------------------------------------

class Dataset:
    """ Dataset object: data profiling and EDA results of the pandas dataframe object """

    def __init__(self, path='', sep='', header_row=0):
        self.path = path
        self.sep = sep
        self.header = header_row
        self.name = ''
        self.file_name = ''
        self.description = ''
        self.references = []
        self.file_size = 0
        self.mem_size = 0
        self.col_num = 0
        self.row_num = 0
        self.columns = []


class Column:
    """ Column object """

    def __init__(self):
        self.name = ''
        self.types = []
        self.ml_type = ''
        self.description = ''
        self.sum_stats = ColumnSumStats()
        self.values = []


class ColumnType:
    """ Column type object """

    def __init__(self):
        self.type = ''
        self.subtype = ''
        self.count = 0


class ColumnSumStats:
    """ Column Summary Statistics object """

    def __init__(self):
        self.nulls = 0
        # Statistics for numeric values
        self.min = 0
        self.max = 0
        self.range = 0
        self.mean = 0
        self.q1 = 0
        self.q2 = 0
        self.q3 = 0
        self.sd = 0
        self.md = [0]
        # Statistics for date-time values
        self.start = 0
        self.end = 0
        self.intervals = []
        self.is_time_series = False
        # Unique values
        self.values = []


class ColumnValue:
    """ Column values analysis object """

    def __init__(self, value, count):
        self.value = value
        self.count = count


# --------------------------------------------------------------------------------------------------
# FUNCTIONS DEFINITION
# --------------------------------------------------------------------------------------------------

def modify_dataframe(df_original):
    """ Modifies dataframe according to particular needs """

    df_modified = df_original

    return df_modified


def set_dataset_info():
    """Sets dataset information: size, rows and columns number"""

    # Updates execution information
    print('Step 2/4 - Processing dataset summary information')

    ds.name = DS_NAME
    ds.file_name = DS_FILE_IN
    ds.description = DS_DESCRIPTION
    ds.references = DS_REFERENCES
    ds.file_size = os.stat(DS_PATH + DS_FILE_IN).st_size
    ds.mem_size = sys.getsizeof(df)
    ds.col_num = len(df.columns)
    ds.row_num = len(df)


def perform_col_profiling():
    """Performs column profiling"""

    for col_name in df.columns:

        # Gets column index of col_name
        col_ix = df.columns.get_loc(col_name)

        # Updates execution information
        print('Step 3/4 - Profiling columns: ' + str(col_ix + 1) + '/' + str(ds.col_num) + ': ' + col_name)

        # Append column
        ds.columns.append(Column())

        # Sets column name
        ds.columns[-1].name = col_name

        # Sets column description
        if len(DS_COL_DESCRIPTION) > 0:
            ds.columns[-1].description = DS_COL_DESCRIPTION[col_ix]

        # Sets column data types
        set_col_types(col_name)

        # Sets column machine learning type
        ds.columns[-1].ml_type = DS_COL_ML_TYPES[col_ix]

        # Sets column summary statistics
        set_col_sum_stats(col_name, col_ix)


def set_col_types(col_name):
    """Sets columns data types: numeric, text, boolean"""

    # Gets column index of col_name
    col_ix = df.columns.get_loc(col_name)

    # Numeric - Integer
    if df.dtypes[col_name] == 'int64':
        ds.columns[col_ix].types.append(ColumnType())
        ds.columns[col_ix].types[-1].type = 'numeric'
        ds.columns[col_ix].types[-1].subtype = 'integer'
        ds.columns[col_ix].types[-1].count = ds.row_num
    # Numeric - Decimal
    elif df.dtypes[col_name] == 'float64':
        ds.columns[col_ix].types.append(ColumnType())
        ds.columns[col_ix].types[-1].type = 'numeric'
        ds.columns[col_ix].types[-1].subtype = 'decimal'
        ds.columns[col_ix].types[-1].count = ds.row_num
    # Boolean
    elif df.dtypes[col_name] == 'bool':
        ds.columns[col_ix].types.append(ColumnType())
        ds.columns[col_ix].types[-1].type = 'boolean'
        ds.columns[col_ix].types[-1].subtype = 'unknown'
        ds.columns[col_ix].types[-1].count = ds.row_num
    # Date-Time
    elif df.dtypes[col_name] == 'datetime64[ns]':
        ds.columns[col_ix].types.append(ColumnType())
        ds.columns[col_ix].types[-1].type = 'date-time'
        ds.columns[col_ix].types[-1].subtype = 'unknown'
        ds.columns[col_ix].types[-1].count = ds.row_num
    # Object type
    elif df.dtypes[col_name] == 'object':

        # Check for numeric instances
        numeric_count = (df[col_name].str.contains(r'^[+-]?\d+[\.]?\d+$', regex=True)).sum()
        numeric_integer_count = (df[col_name].str.contains(r'^[0]$|^[+-]?[1-9]+$', regex=True)).sum()
        if numeric_count > 0:
            ds.columns[col_ix].types.append(ColumnType())
            ds.columns[col_ix].types[-1].type = 'numeric'
            if numeric_integer_count == 0:
                ds.columns[col_ix].types[-1].subtype = 'decimal'
            else:
                ds.columns[col_ix].types[-1].subtype = 'integer'
            ds.columns[col_ix].types[-1].count = numeric_count

        # Check for date-time instances
        col_date_time = pd.to_datetime(df[col_name], errors='coerce', infer_datetime_format=True)
        date_time_count = ds.row_num - col_date_time.isna().sum()
        if date_time_count > 0:
            ds.columns[col_ix].types.append(ColumnType())
            ds.columns[col_ix].types[-1].type = 'date-time'
            if (col_date_time.dt.time == datetime.time.min).sum() == ds.row_num:
                ds.columns[col_ix].types[-1].subtype = 'date'
            if (col_date_time.dt.date == datetime.date.today()).sum() == ds.row_num:
                ds.columns[col_ix].types[-1].subtype = 'time'
            else:
                ds.columns[col_ix].types[-1].subtype = 'date'
            ds.columns[col_ix].types[-1].count = date_time_count

        # Check for boolean instances
        boolean_count = (df[col_name].str.upper().str.contains('TRUE|FALSE|YES|NO', regex=True)).sum()
        if boolean_count > 0:
            ds.columns[col_ix].types.append(ColumnType())
            ds.columns[col_ix].types[-1].type = 'boolean'
            ds.columns[col_ix].types[-1].subtype = 'unknown'
            ds.columns[col_ix].types[-1].count = boolean_count

        # Check for text instances
        if ds.row_num > numeric_count + date_time_count + boolean_count:
            ds.columns[col_ix].types.append(ColumnType())
            ds.columns[col_ix].types[-1].type = 'text'
            ds.columns[col_ix].types[-1].subtype = 'unknown'
            ds.columns[col_ix].types[-1].count = ds.row_num - numeric_count - date_time_count - boolean_count
    # Unknown data type
    else:
        ds.columns[col_ix].types.append(ColumnType())
        ds.columns[col_ix].types[-1].type = 'unknown'
        ds.columns[col_ix].types[-1].subtype = 'unknown'
        ds.columns[col_ix].types[-1].count = ds.row_num


def set_col_sum_stats(col_name, col_ix):
    """ Sets column summary statistics """

    # Sets column nulls
    ds.columns[col_ix].sum_stats.nulls = df[col_name].isna().sum()

    # Sets column unique values
    unique_values = df[col_name].value_counts()
    for ix in range(0, len(unique_values)):
        if ds.columns[col_ix].types[0].type != 'date-time':
            ds.columns[col_ix].sum_stats.values.append(ColumnValue(unique_values.index[ix], unique_values[ix]))

    # Sets column descriptive statistics
    if len(ds.columns[col_ix].types) == 1:
        if ds.columns[col_ix].types[0].type == 'numeric':
            sum_stats = df[col_name].describe()
            ds.columns[-1].sum_stats.min = sum_stats['min']
            ds.columns[-1].sum_stats.max = sum_stats['max']
            ds.columns[-1].sum_stats.range = sum_stats['max'] - sum_stats['min']
            ds.columns[-1].sum_stats.mean = sum_stats['mean']
            ds.columns[-1].sum_stats.sd = sum_stats['std']
            ds.columns[-1].sum_stats.q1 = sum_stats['25%']
            ds.columns[-1].sum_stats.q2 = sum_stats['50%']
            ds.columns[-1].sum_stats.q3 = sum_stats['75%']
        elif ds.columns[col_ix].types[0].type == 'date-time':
            df2 = pd.DataFrame(pd.to_datetime(df[col_name]).unique())
            df2.rename(columns={0: col_name}, inplace=True)
            df2.sort_values(by=[col_name], inplace=True)
            df2['Diff'] = df2[col_name].diff().replace({pd.NaT: pd.Timedelta('0 days 00:00:00')})
            if ds.columns[col_ix].types[0].subtype == 'date':
                df2[col_name] = df2[col_name].dt.strftime('%Y/%m/%d')
                ds.columns[-1].sum_stats.start = df2[col_name][0]
                ds.columns[-1].sum_stats.end = df2[col_name][len(df2) - 1]
                ds.columns[-1].sum_stats.intervals = df2['Diff'].unique().astype('timedelta64[D]').astype(int)
            elif ds.columns[col_ix].types[0].subtype == 'time':
                ds.columns[-1].sum_stats.start = df2[col_name].dt.time.min().strftime('%H:%M:%S')
                ds.columns[-1].sum_stats.end = df2[col_name].dt.time.max().strftime('%H:%M:%S')
                df2['Diff'] = df2['Diff'].dt.total_seconds() / 60
                ds.columns[-1].sum_stats.intervals = df2['Diff'].unique()
            for ix in range(0, len(df2)):
                ds.columns[col_ix].sum_stats.values.append(ColumnValue(df2[col_name][ix], df2['Diff'][ix]))
        elif ds.columns[col_ix].types[0].type == 'text':
            ds.columns[-1].sum_stats.nulls += (df[col_name].values == '').sum()


def save_results(save_ds=True, save_df=False, save_df_by_col=False):
    """Saves profiling and EDA results as JavaScript objects to output file"""

    # Dataset information
    if save_ds:

        print('Step 4/4 - Saving dataset summary information to file: ' + DS_PATH + DS_FILE_OUT_1)
        ofile = open(DS_PATH + DS_FILE_OUT_1, 'w', encoding='utf-8')
        ofile.write('//************************************************************************************************//\n')
        ofile.write('//* ' + DS_FILE_IN + ' - Data Profiling and Exploratory Analysis *//\n')
        ofile.write('//************************************************************************************************//\n')
        ofile.write('\n')

        # Dataset object: dataset summary information
        ofile.write('ds = {\n')

        # Dataset information
        ofile.write('\tname: "' + ds.name + '",\n')
        ofile.write('\tdescription: "' + ds.description + '",\n')
        ofile.write('\treferences: ' + str(ds.references) + ',\n')
        ofile.write('\tfile_name: "' + ds.file_name + '",\n')
        ofile.write('\tmem_size: ' + str(ds.mem_size) + ',\n')
        ofile.write('\tfile_size: ' + str(ds.file_size) + ',\n')
        ofile.write('\tcol_num: ' + str(ds.col_num) + ',\n')
        ofile.write('\trow_num: ' + str(ds.row_num) + ',\n')

        # Column profiling
        ofile.write('\tcolumns: [\n')
        for col in df.columns:
            # Gets column index of col_name
            col_ix = df.columns.get_loc(col)
            ofile.write('\t\t{name: "' + ds.columns[col_ix].name + '", ')
            ofile.write('description: "' + ds.columns[col_ix].description + '", ')
            ofile.write('types: [')
            col_type_ix = 1
            for col_type in ds.columns[col_ix].types:
                ofile.write('{type: "' + col_type.type + '", subtype: "' + col_type.subtype + '", count:' + str(col_type.count))
                if col_type_ix < len(ds.columns[col_ix].types):
                    ofile.write('},')
                else:
                    ofile.write('}')
                col_type_ix += 1
            ofile.write('], ')
            ofile.write('ml_type: "' + ds.columns[col_ix].ml_type + '", ')
            ofile.write('sum_stats: {')
            ofile.write('nulls: ' + str(ds.columns[col_ix].sum_stats.nulls) + ', ')
            ofile.write('values: [')
            col_value_ix = 1
            for col_value in ds.columns[col_ix].sum_stats.values:
                if ds.columns[col_ix].types[0].type == 'date-time':
                    ofile.write('{value: "' + str(col_value.value) + '", delta: "' + str(col_value.count) + '"')
                else:
                    ofile.write('{value: "' + str(col_value.value) + '", count: ' + str(col_value.count))
                if col_value_ix < len(ds.columns[col_ix].sum_stats.values):
                    ofile.write('}, ')
                else:
                    ofile.write('}')
                col_value_ix +=1
            ofile.write('], ')
            ofile.write('min: ' + str(ds.columns[col_ix].sum_stats.min) + ', ')
            ofile.write('max: ' + str(ds.columns[col_ix].sum_stats.max) + ', ')
            ofile.write('range: ' + str(ds.columns[col_ix].sum_stats.range) + ', ')
            ofile.write('mean: ' + str(ds.columns[col_ix].sum_stats.mean) + ', ')
            ofile.write('sd: ' + str(ds.columns[col_ix].sum_stats.sd) + ', ')
            ofile.write('q1: ' + str(ds.columns[col_ix].sum_stats.q1) + ', ')
            ofile.write('q2: ' + str(ds.columns[col_ix].sum_stats.q2) + ', ')
            ofile.write('q3: ' + str(ds.columns[col_ix].sum_stats.q3) + ', ')
            ofile.write('start: "' + str(ds.columns[col_ix].sum_stats.start) + '", ')
            ofile.write('end: "' + str(ds.columns[col_ix].sum_stats.end) + '", ')
            ofile.write('intervals: ' + str(list(ds.columns[col_ix].sum_stats.intervals)) + '}')
            if col_ix + 1 < ds.col_num:
                ofile.write('},\n')
            else:
                ofile.write('}\n')
        ofile.write('\t]\n')

        # End of dataset object
        ofile.write('}\n\n')
        ofile.close()

    # Dataset data
    if save_df:
        print('Step 4/4 - Saving dataset data to file: ' + DS_PATH + DS_FILE_OUT_2)
        ofile = open(DS_PATH + DS_FILE_OUT_2, 'w', encoding='utf-8')
        ofile.write('//************************************************************************************************//\n')
        ofile.write('//* ' + DS_FILE_IN + ' - Data Profiling and Exploratory Analysis *//\n')
        ofile.write('//************************************************************************************************//\n')
        ofile.write('\n')
        ofile.write('df = [\n')
        for row_ix in df.index:
            ofile.write('\t' + str(df.iloc[row_ix].to_list()).replace('nan', 'null') + ',\n')
            #ofile.write('\t' + df.iloc[row_ix].to_json() + ',\n')
            #ofile.write('\t' + '{"row_ix":' + str(row_ix) + ',' + df.iloc[row_ix].to_json()[1:] + ',\n')
        ofile.write(']')
        ofile.close()

    # Dataset data by column
    if save_df_by_col:
        for col_name in df.columns:
            # Gets column index of col_name
            col_ix = df.columns.get_loc(col_name)

            # Updates execution information
            print('Step 4/4 - Saving dataset data to file by column: ' + str(col_ix + 1) + '/' + str(ds.col_num) +
                  ': ' + col_name)

            ofile = open(DS_PATH + DS_FILE_OUT_3 + '-col-' + str(col_ix) + '.js', 'w', encoding='utf-8')
            ofile.write('df_col_' + str(col_ix) + ' = ' + str(df[col_name].tolist()))
            ofile.close()


# --------------------------------------------------------------------------------------------------
# MAIN PROCEDURE
# --------------------------------------------------------------------------------------------------

script_start = datetime.datetime.now()
print('Step 1/4 - Loading dataset: ' + DS_PATH + DS_FILE_IN)

# Reads source dataset into Pandas dataframe
df = pd.read_csv(filepath_or_buffer=DS_PATH + DS_FILE_IN, sep=DS_SEP, header=DS_HEADER_ROW, low_memory=False)

# Performs custom dataset modifications
if DF_MODIFY:
    df = modify_dataframe(df)

# Creates dataset object
ds = Dataset(DS_PATH + DS_FILE_IN, DS_SEP, DS_HEADER_ROW)

# Sets dataset information
set_dataset_info()

# Performs column profiling
perform_col_profiling()

# Stores results in file as JavaScript objects
save_results(save_ds=DS_SAVE, save_df=DF_SAVE, save_df_by_col=DF_SAVE_BY_COL)

# Updates execution info
print('Dataset processed OK - Elapsed time: ' + str(datetime.datetime.now() - script_start))