# Data Explorer: a tool to automate data profiling and exploratory data analysis

:warning: **Alpha version**  |  :hammer_and_wrench: **Work in progress**

&nbsp;  

_**Data Explorer**_ is a tool to *automate* the common tasks of the *data analysis stage* of a data science project: *data profiling* and *exploratory data analysis*.

&nbsp;

**Data Profiling**
* Dataset size, description and reference.
* Number of rows and columns.
* Column description and data types, with warnings of mixed types.
* Null values
* Column summary statistics & charts

&nbsp;

**Examples**

| Dataset | Size & Structure | Description |
| --- | --- | --- |
| [Household Electric Power](https://alelentini.github.io/ds-data-explorer/datasets/household_electric_power/eda_0/index.html) | 127MB - 2M rows - 9 columns | Data from eletric power consumption in a house of France. |
| [Bs. As. Atmospheric Pressure](https://alelentini.github.io/ds-data-explorer/datasets/atmospheric_presure/eda_0/index.html) | 38MB - 250k rows - 11 columns | Data from IOT sensors in Buenos Aires city. |
| [Iris Flower](https://alelentini.github.io/ds-data-explorer/datasets/iris/eda_1/index.html) | 4kB - 150 rows - 5 columns | Despite its small size, it's here by its ubiquity. |

&nbsp;

**Data Explorer User Interface**

<p align="center"><img src="/images/de_02.gif"></p>

&nbsp;

## How does it works?

* Receives a delimiter-separated values file (DSV)
* A phyton script processes the dataset computing the *data profiling* and *exploratory data analysis* tasks and stores the results as JavaScript objects
* Results can be interactively analyzed through a *single-page application*
* It is recommended to use _**Data Explorer**_ as a template for common data profiling and exploratory tasks, and then customize it according to the particular needs of each dataset.

<p align="center"><img src="/images/de_01.svg"></p>

&nbsp;

## Next features

* Data integrity section:
    -> Nulls, mixed types (e.g. a text value in a field that is numeric), timeseries intervals disruptions, etc.
    -> Summary of records with data integrity issues
* GB size datasets -> use webworkers to avoid browser blocking.
