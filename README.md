# Data Explorer: a tool to automate data profiling and exploratory analysis

:warning: **Alpha version**  |  :hammer_and_wrench: **Work in progress**

&nbsp;  

_**Data Explorer**_ is a tool to *automate* the common tasks of the *data analysis stage* of a data science project: *data profiling* and *exploratory data analysis*:

* Receives a delimiter-separated values file (DSV)
* A phyton script processes the dataset computing the *data profiling* and *exploratory data analysis* tasks and storing the results as JavaScript objects
* Results can be interactively analyzed through a *single-page application*

&nbsp;

<p align="center"><img src="/images/de_01.svg"></p>

&nbsp;

**Data Profiling**
* Dataset size
* Number of rows and columns
* Column data types
* Missing values