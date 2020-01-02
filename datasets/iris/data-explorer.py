import os
import sys
import pandas as pd

# Parameters that should be defined by a previous procedure
DS_PATH = 'C:\\Users\\60048007\\Documents\\Projects\\ds\\data-explorer\\datasets\\iris\\'
DS_FILE_IN = 'iris.csv'
DS_FILE_OUT = 'iris-eda.js'
DS_SEP = ','
DS_HEADER_ROW = 0
DS_NAME = 'iris'
DS_DESCRIPTION = 'The Iris flower data set or Fisher\'s Iris data set is a multivariate data set introduced by the British statistician and biologist Ronald Fisher in his 1936 paper The use of multiple measurements in taxonomic problems as an example of linear discriminant analysis<sup><a href=\'https://archive.ics.uci.edu/ml/datasets/Iris\' target=\'_blank\' title=\'View dataset definition in UCI repository\'>1 </a><a href=\'https://en.wikipedia.org/wiki/Iris_flower_data_set\' target=\'_blank\' title=\'View dataset definition in Wikipedia\'>2</a>'
DS_COL_DESCRIPTION = ['sepal length in cm', 'sepal width in cm', 'petal length in cm', 'petal width in cm', 'class: <em>Iris Setosa, Iris Versicolour, Iris Virginica</em>']
DS_COL_SUBTYPES_2 = ['A', 'A', 'A', 'A', 'C']


# --------------------------------------------------------------------------------------------------
# OBJECTS DEFINITION
# --------------------------------------------------------------------------------------------------

class DataSet:
    """ Dataset object: data profiling and EDA results of the pandas dataframe object """

    def __init__(self, path='', sep='', header_row=0):
        self.path = path
        self.sep = sep
        self.header = header_row
        self.name = ''
        self.file_name = ''
        self.description = ''
        self.file_size = '0 KB'
        self.mem_size = '0 KB'
        self.col_num = 0
        self.row_num = 0
        self.col_names = []
        self.col_types = []
        self.col_subtypes = []
        self.col_subtypes_2 = []
        self.col_description = []
        self.col_sum_stats = []
        self.col_unique_val = []
        self.col_unique_count = []


class ColValues:
    """ Column values analysis object """

    def __init__(self, col_type):
        self.nulls = 0
        self.unique_values = []
        self.unique_count = []
        if col_type == 'int64' or col_type == 'float64':
            self.min = 0
            self.max = 0
            self.range = 0
            self.mean = 0
            self.q1 = 0
            self.q2 = 0
            self.q3 = 0
            self.sd = 0
            self.md = [0]


# --------------------------------------------------------------------------------------------------
# FUNCTIONS DEFINITION
# --------------------------------------------------------------------------------------------------

def format_bytes(bytes):
    """ Formats a quantity in bytes to a string appending the corresponding unit: B, KB, MB, GB, TB """

    for x in ['bytes', 'KB', 'MB', 'GB', 'TB']:
        if bytes < 1000:
            return "%3.1f %s" % (bytes, x)
        bytes /= 1000


def set_dataset_info():
    """Sets dataset information: size, rows and columns number"""

    ds.name = DS_NAME
    ds.file_name = DS_FILE_IN
    ds.description = DS_DESCRIPTION
    ds.file_size = format_bytes(os.stat(DS_PATH + DS_FILE_IN).st_size)
    ds.mem_size = format_bytes(sys.getsizeof(df))
    ds.col_num = len(df.columns)
    ds.row_num = len(df)


def perform_col_profiling():
    """Performs column profiling"""

    # Sets columns names
    ds.col_names = list(df.columns.values.tolist())

    # Sets columns data types
    set_col_types()

    # Sets columns data subtypes
    set_col_subtypes()

    # Sets columns value analysis
    set_col_values()


def set_col_types():
    """Sets columns data types: numeric, text, boolean"""

    # Dataset columns types
    for col in df.columns:
        if df.dtypes[col] == 'int64' or df.dtypes[col] == 'float64':
            ds.col_types.append('numeric')
        elif df.dtypes[col] == 'bool':
            ds.col_types.append('boolean')
        elif df.dtypes[col] == 'object':
            ds.col_types.append('text')
        else:
            ds.col_types.append('unknown')

    # Dataset columns types
    ds.col_description = DS_COL_DESCRIPTION


def set_col_subtypes():
    """Sets columns data subtypes: integer, decimal, etc."""

    # Dataset columns subtypes
    for col in df.columns:
        if df.dtypes[col] == 'int64':
            ds.col_subtypes.append('integer')
        elif df.dtypes[col] == 'float64':
            ds.col_subtypes.append('decimal')
        else:
            ds.col_subtypes.append('unknown')

    # Dataset columns subtypes 2: Attributes & Classes
    ds.col_subtypes_2 = DS_COL_SUBTYPES_2


def set_col_values():
    """Performs columns data analysis: min, max, range, median, standard deviation, frecuency distribution, nulls, etc."""

    # Dataset columns value analysis
    for col in df.columns:
        ds.col_sum_stats.append(ColValues(df.dtypes[col]))
        ds.col_sum_stats[-1].nulls = df[col].isna().sum()
        ds.col_sum_stats[-1].unique_values = df[col].value_counts(dropna=False).index.to_list()
        ds.col_sum_stats[-1].unique_count = list(df[col].value_counts(dropna=False).values)
        sum_stats = df[col].describe()
        if df.dtypes[col] == 'int64' or df.dtypes[col] == 'float64':
            ds.col_sum_stats[-1].min = sum_stats['min']
            ds.col_sum_stats[-1].max = sum_stats['max']
            ds.col_sum_stats[-1].range = sum_stats['max'] - sum_stats['min']
            ds.col_sum_stats[-1].mean = sum_stats['mean']
            ds.col_sum_stats[-1].sd = sum_stats['std']
            ds.col_sum_stats[-1].q1 = sum_stats['25%']
            ds.col_sum_stats[-1].q2 = sum_stats['50%']
            ds.col_sum_stats[-1].q3 = sum_stats['75%']
        if df.dtypes[col] == 'object':
            ds.col_sum_stats[-1].nulls += (df[col].values == '').sum()
        elif df.dtypes[col] == 'bool':
            pass
        elif df.dtypes[col] == 'object':
            pass
        else:
            pass


def save_results():
    """Saves profiling and EDA results as JavaScript objects to output file"""

    ofile = open(DS_PATH + DS_FILE_OUT, 'w')

    ofile.write('//************************************************************************************************//\n')
    ofile.write('//* ' + DS_FILE_IN + ' - Data Profiling and Exploratory Analysis *//\n')
    ofile.write('//************************************************************************************************//\n')
    ofile.write('\n')

    # Dataset object: dataset summary information
    ofile.write('ds = {\n')

    # Dataset information
    ofile.write('\tname: "' + ds.name + '",\n')
    ofile.write('\tdescription: "' + ds.description + '",\n')
    ofile.write('\tfile_name: "' + ds.file_name + '",\n')
    ofile.write('\tmem_size: "' + ds.mem_size + '",\n')
    ofile.write('\tfile_size: "' + ds.file_size + '",\n')
    ofile.write('\tcol_num: ' + str(ds.col_num) + ',\n')
    ofile.write('\trow_num: ' + str(ds.row_num) + ',\n')

    # Columns profiling
    ofile.write('\tcol_names: ' + str(ds.col_names) + ',\n')
    ofile.write('\tcol_types: ' + str(ds.col_types) + ',\n')
    ofile.write('\tcol_subtypes: ' + str(ds.col_subtypes) + ',\n')
    ofile.write('\tcol_subtypes_2: ' + str(ds.col_subtypes_2) + ',\n')
    ofile.write('\tcol_description: ' + str(ds.col_description) + ',\n')
    ofile.write('\tcol_values: [\n')
    for col in df.columns:
        col_ix = df.columns.get_loc(col)
        ofile.write('\t\t{nulls: ' + str(ds.col_sum_stats[col_ix].nulls) + ', ')
        if df.dtypes[col] == 'int64' or df.dtypes[col] == 'float64':
            ofile.write('min: ' + str(ds.col_sum_stats[col_ix].min) + ', ')
            ofile.write('max: ' + str(ds.col_sum_stats[col_ix].max) + ', ')
            ofile.write('range: ' + str(ds.col_sum_stats[col_ix].range) + ', ')
            ofile.write('mean: ' + str(ds.col_sum_stats[col_ix].mean) + ', ')
            ofile.write('sd: ' + str(ds.col_sum_stats[col_ix].sd) + ', ')
            ofile.write('q1: ' + str(ds.col_sum_stats[col_ix].q1) + ', ')
            ofile.write('q2: ' + str(ds.col_sum_stats[col_ix].q2) + ', ')
            ofile.write('q3: ' + str(ds.col_sum_stats[col_ix].q3) + ', ')
        ofile.write('unique_values: ' + str(ds.col_sum_stats[col_ix].unique_values) + ', ')
        ofile.write('unique_count: ' + str(ds.col_sum_stats[col_ix].unique_count) + '},\n')
    ofile.write('\t]\n')

    # End of dataset object
    ofile.write('}\n\n')

    # Dataframe object: dataset data
    ofile.write('df = [\n')

    for row_ix in df.index:
        ofile.write('\t' + str(df.iloc[row_ix].to_list()) + ',\n')
        #ofile.write('\t' + df.iloc[row_ix].to_json() + ',\n')
        #ofile.write('\t' + '{"row_ix":' + str(row_ix) + ',' + df.iloc[row_ix].to_json()[1:] + ',\n')

    # End of dataframe object
    ofile.write(']')

    ofile.close()


# --------------------------------------------------------------------------------------------------
# MAIN PROCEDURE
# --------------------------------------------------------------------------------------------------

# Reads source dataset into Pandas dataframe
df = pd.read_csv(filepath_or_buffer=DS_PATH + DS_FILE_IN, sep=DS_SEP, header=DS_HEADER_ROW)

# Creates dataset object
ds = DataSet(DS_PATH + DS_FILE_IN, DS_SEP, DS_HEADER_ROW)

# Sets dataset information
set_dataset_info()

# Performs column profiling
perform_col_profiling()

# Stores results in file as JavaScript objects
save_results()
