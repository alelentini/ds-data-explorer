# Data Explorer: a tool to automate data profiling and exploratory data analysis

:warning: **Alpha version**  |  :hammer_and_wrench: **Work in progress**

&nbsp;  

_**Data Explorer**_ is a tool to *automate* the common tasks of the *data analysis stage* of a data science project: *data profiling* and *exploratory data analysis*.

&nbsp;

**Data Profiling**
* Dataset size, description and reference
* Number of rows and columns
* Column description and data types
* Null values
* Column summary statistics & charts

&nbsp;

**Examples**

| Dataset | Description
| --- | --- |
| [Household Electric Power](https://alelentini.github.io/ds-data-explorer/datasets/household_electric_power/eda_0/index.html) | 127MB, 2M rows, 9 columns data of eletric power consumption in a house of France. |
| [Bs. As. Atmospheric Pressure](https://alelentini.github.io/ds-data-explorer/datasets/atmospheric_presure/eda_0/index.html) | 250k rows, 11 columns, 38MB data from IOT sensors in Buenos Aires city. |
| [Iris Flower](https://alelentini.github.io/ds-data-explorer/datasets/iris/eda_1/index.html) | Despite its small size, it's here by its ubiquity. |

<p align="center"><img src="/images/de_02.gif"></p>

## How does it works?

* Receives a delimiter-separated values file (DSV)
* A phyton script processes the dataset computing the *data profiling* and *exploratory data analysis* tasks and stores the results as JavaScript objects
* Results can be interactively analyzed through a *single-page application*
* It is recommended to use _**Data Explorer**_ as a template for common data profiling and exploratory tasks, and then customize it according to the particular needs of each dataset.

&nbsp;

<p align="center"><img src="/images/de_01.svg"></p>

&nbsp;


