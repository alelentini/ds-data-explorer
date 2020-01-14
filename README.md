# Data Explorer: a tool to automate data profiling and exploratory analysis
<div class="text-blue mb-2">
  .text-blue on white
</div>

:warning: **Alpha version**  |  :hammer_and_wrench: **Work in progress**

&nbsp;  

_**Data Explorer**_ is a tool to *automate* the common tasks of the *data analysis stage* of a data science project: *data profiling* and *exploratory data analysis*:

* Receives a delimiter-separated values file (DSV)
* A phyton script processes the dataset computing the *data profiling* and *exploratory data analysis* tasks and stores the results as JavaScript objects
* Results can be interactively analyzed through a *single-page application*
* It is recommended to use _**Data Explorer**_ as a template for common data profiling and exploratory tasks, and then customize it according to the particular needs of each dataset.

&nbsp;

<p align="center"><img src="/images/de_01.svg"></p>

&nbsp;

**Data Profiling**
* Dataset size
* Number of rows and columns
* Column data types
* Missing values
* Column data visualization

&nbsp;

**Examples**

* [Iris](https://alelentini.github.io/ds-data-explorer/datasets/iris/eda_1/index.html)
* [Bs. As. atmospheric pressure](https://alelentini.github.io/ds-data-explorer/datasets/atmospheric_presure/eda_0/index.html)
