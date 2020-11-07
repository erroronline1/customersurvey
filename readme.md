# customer survey
yes, there are ready built solutions running on multiple devices, with cloud storage, live tracking, statistics and whatnot.
but, you know, this is free.
free as in *"put in your own effort and install a wamp- or lamp-server with mysql on any suitable device that might be useful to do your customers survey, and while you're at it you customize the html-, js-, css- and php-files anyway, because you can and your companies mindset won't allow any cloud storage of customers entries because fuck you"*.

a previous version had a backend to add or change questions, timings and other environment variables, but i decided to omit these because i did not change any of these within the timespan of three years anyway.

there are some legacy remainders within this project. the earlier version had html, js and php all mixed up. database-column-names are based on the previous setup though. don't mind that.
so this is by all means not an all purpose solution, more an accomodation to actual needs as well as one of my first attempts to gain best practices and wisely separate the functional groups into frontend, functional js and database api with clearly structured responses instead of returning evaluation js-commands parsing html with a lot of escaped quotes.

questions are set up directly in the index.html-file and absolutely depending on the database-structure. so if you want to adapt this please make it properly.

---
## index.html

the whole survey is a one-pager that has a snapping scroll effect (that works best with firefox).

to have the effects run as intended you'll have to follow this pattern:
```html
<div class="position" style="--sheet-index:5;"></div>
<section>
    <h1>...title...</h1>
    ...content...

    <svg class="nav_up grey" onclick="jump(-1)">
        <use href="#svg_navigation" /></svg>
    <svg class="nav_down grey" onclick="jump(1)">
        <use href="#svg_navigation" /></svg>
</section>
```
the div-element with the position class indicates the progress by sticking to the viewport once it entered. the inline css-variable `--sheet-index` has to be set according to its position.
the svg-images with the onclick-properties are navigation helpers to support and indicate progress directions.

direct supported items for the content are:
```html
<input type="radio" name="query1" value="2" id="query12" /><label for="query12"> <svg class="green">
    <use href="#svg_smile" /></svg></label>
<input type="radio" name="query1" value="1" id="query11" /><label for="query11"> <svg class="yellow">
    <use href="#svg_meh" /></svg></label>
<input type="radio" name="query1" value="0" id="query10" /><label for="query10"> <svg class="red">
    <use href="#svg_frown" /></svg></label>
```
... for gaining opinions with a tap on a smiley, selected will be indicated by an x-mark

```html
<p><textarea name="text1" id="text1"
    onfocus="initjskeyboard('text1keyboard', this);"></textarea>
</p>
<div id="text1keyboard"></div>
<!--this div has to have the same name as the aforedeclared class name-->
```
... for entering text using a generated keyboard.

finally there is a svg-sprite and the init()-call.

---
## style.css

setup --global-margin-top, ~right, ~bottom and ~left to adapt to possible frames aroung the devices screen.

otherwise it's mostly just normal styling. there are some noteable functional parts though:

```css
.position:nth-of-type(1n) {
    top: calc((var(--sheet-index) - 1) * 100vh / var(--sheets));
}

.position {
    scroll-snap-align: initial;
    position: sticky;
    position: -webkit-sticky;
    background: lightgreen;
    width: 1vw;
    height: calc(100vh / var(--sheets));
    margin-left: -1vw;
}
```
these indicate the progress of the survey-form. `--sheet-index` has to be set inline while `root:--sheets` will be set with javascript on initiatization.

```css
html {
    scroll-snap-type: mandatory;
    scroll-snap-points-y: repeat(100vh);
    scroll-snap-type: y mandatory;
    /*...*/
}

section {
    scroll-snap-align: start;
    height: 100vh;
    position: relative;
    padding: max(5vw, 10vh) 0;
    text-align: center;
}
```
the scroll-snapping makes the one-pager actually usable through dispaying the desired section. for the snappiest experience use firefox.

---
## scripts.js and erroronline1.js

### scripts.js

settings:

* `global.restart` sets seconds to restart, 0 disables
* `global.sheets` initiates the property, but will be set with init-function
* `global.report` if set during init scrollingEvent-handler will not try to update the database or reload the location after timeout

functions:

* `function jump(steps)` scrolls to relative sheet 
* `api.url` contains the url to be called. in case of localhost make sure to address properly to avoid cors-errors
* `api.currentId` contains the last database id to be updated eventually during one session
* `api.getInputs` reads all inputs and converts them to an object
* `api.save` initiates the actual api-call if a payload is provided
* `api.saveResult` assigns the returned entry id to api.currentId in case of successful request
* `api.delete` initiates the DELETE request to clear the database, asks for confirmation
* `api.deleteResult` feedback in case of success
* `api.errors` displays an error in case of unsuccessful request
* `initjskeyboard` initiates and assigns the jskeyboard-class to an input
* `class jskeyboard` creates a keyboard for the linked input/textarea to avoid having to use the native keyboard that does not neccessarily complies with any frame around the device
* `function restart()` initiates or resets the timeout to reload the entire survey depending on detected interaction
* `scroll-eventListener` initiates save once scrolling is finished
* `init()` determines the number of sheets, sets the respective variables in js and css and starts the reload function if applicable
* `growlNotif()` lets appear an information box for a few seconds

### erroronline1.js

my personal usecase framework of recurring functions i tend to include in any of my projects. this is not underscore.js!

* `Array.prototype.contains` and `String.prototype.contains` calls _.contains() for intuitive use. like .includes() but with wider use
* `_.el(elementId)` returns the element by id, just a shortcut
* `_.contains(obj, values)` checks whether *obj* of type string or array contains at least one occurence of *values* of type string or array
* `_.ajax.request(method, destination, payload)` where *method* is POST or GET, *destination* the url to be called and *payload* always an object with parameters to submit, that will be converted to url-paramteters in case of GET-request
* `_.insertChars()` is not used in this project but alike embedded in the jskeyboard class
* `-.dragNdrop` not used in this project but handles html5 drag and drop events

---
## api.php

most notably one of the first things is to set `header('Access-Control-Allow-Origin: *')` to avoid cors-errors on localhost.

other than that the api just checks for the request method and does the database interaction based on

* `POST` to insert a new row to the database, returning the insertId
* `PUT` to update the current row according to the previous fetched insertId
* `DELETE` to clear (truncate) the database in this case

---
## export.php

this can be called with the parameter `type` and the following values:

* *rtf* for a rich-text-formatted summary of the survey, including statistics, images, averages and comments
* *csv* for a processable table of raw data for several uses
* *sql* for a sql-database backup including DROP TABLE and CREATE TABLE

each will be sent as a stream to open or download the file instantaneously.

the provided sourcecode contains the rtf-summary in hardcoded german.

---
## statistics.php

this file creates image streams to depict the votes in a graph with daily and overall averages. the images have to be called with the respective column name from the database as the `field`-parameter.

---
## dbconnect.php

the database-parameters are set here, database connection is initiated and a few constants are declared for customization. this file is included in every other php-file.


# summary

i am well aware that there might be simpler solutions. but i am a vanilla guy and dont trust frameworks that are not my own. also i am currently neither capable of nor willing to use node, npm or any other tool to mAke NaTiVe ApPs UsInG HtMl AnD jAvAsCrIpT. and i somehow don't find the nerve to properly learn tkinter, kivy and alike.

in this scenario customization does not take place on only one site (admin-interface or single config file), but at least where it should be:
* content within html
* styling in css
* behaviour in javascript
* database interaction and dynamic file generation within php