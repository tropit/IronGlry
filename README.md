# IronGlry
Gallery using Angular
------------------------------------------------
Animated Gallery by using Angular Bootstrap,

the plug-in input Array / JSON data (url,title,date) and few more

arguments. And output animated view with tools to browse the pictures
nicely.
___________

Calling the plug-in is with the tags <my-gallery></my-gallery>
___________
Attributes:

feed - Data

search - Active/de-active search bar

pagination - View mode with one page or many

results-per-page - How many results in each page

sorting - Active/de-active sorting box

auto-rotate-time - How much time between every each slides(m/s).

----------

The gallery remember the client last view (Searching value, sorting or resultPerPage) for his next time.
** For testing the plugin in recommand the use the function clearAllStroge() in glryCtrl (clearing ngLocalStorage - if you want to changing attributes, in some of the cases you will need that.
