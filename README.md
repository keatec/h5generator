# h5generator
Generator Libary for HTML based (Single Page) Websites

If your code contians HTML fragments like
```javascript

output = '<div class="result">'+data+'</div>';

```

... this libary is for you...

Why?  Cause this code has a lot of Problems
* `data` needs to be compatible with `string`
* data should not be `null` or `undefined`
* data should be encoded (if needed)

So a better line of code would be

```javascript
output = '<div class="result">'+(data != undefined (''+data): 'is undefined')+'</div>';
```

So now it is time to start using a "generator".

```javascript
output = generators.result({data: data});
```
and all the design goes out of javascript into html

```html
<div class="result" data-generator="result">{data}</div>
```
Seperated and clear. Design can be changed without changing code. Code can be changed without design.

## What this libary does...

h5generator processes template written inside the HTML into javascript code. These generator functions can used with parameters to generate html.  

Sample:
```html
<div data-generator="softi">
    <h1>Name of Software: <b>{title}</b></h1>
    <p>{desc}</p>
</div>
```
after compilation a call to : 
```javascript
generators.softi({
    title: 'BestApp',
    desc: 'Best Sofware ever'
})
```
will generate as return:
```html
<div>
    <h1>Name of Software: <b>BestApp</b></h1>
    <p>Best Software ever</p>
</div>
```

The HTML templates are placed inside your main HTML Site in a hidden DIV Tag
```html
<div style="display:none" class="htmlGenerators">
    ...
    <div data-generator="softi">
        <h1>Tolle Software {title}</h1>
        <p>{desc}</p>
    </div>
    ...
</div>
```

> By changing `"display:none"` to `display:block` the templates will become visible in your HTML page. You can directly change and check the visual appearance without executing code to check designs   
> To support this kind of coding you can also add html to the generatore using a class `htmlGeneratorsDemo`. During compilation these elements will removed

## Generators can (and should) be nested.

```html
<div data-generator="softi"> <--*1
    <h1>Tolle Software {title}</h1>
    <p>{desc}</p>
    {address}<--*2
    <div data-generator="address"> <--*3
        <p>{street}</p>
        <p>{town}</p>
        <p>{country}</p>
    </div>
</div>
```
Now you have two generators "softi" (*1) and "softi.address" (*2).   
To insert the result of "softi.address" into softi, the softi generator has a place to insert the result
named {address} (*2).

So a complete html can be generated using:

```javascript
generators.softi({
    title: 'BestApp',
    desc: 'Best Sofware ever',
    address: generators.softi.address({
        street: 'Street with no name',
        town: 'London',
        country: 'Great Britain'
    })
})
```

If you have more then one address, simply use an array...

```javascript
generators.softi({
    title: 'BestApp',
    desc: 'Best Sofware ever',
    address: [
        generators.softi.address({
            street: 'Street with no name',
            town: 'London',
            country: 'Great Britain'
        }),
        generators.softi.address({
            street: 'Street two',
            town: 'Berlin',
            country: 'Germany'
        }),
    ]
})
```

If you want to visual check your generator-html you can simply add demo elements to your code by using
the class 'htmlGeneratorsDemo'. Elements with this class are __removed during compilation__. 

```html
<div style="display:none" class="htmlGenerators">
    <div data-generator="softi">
        <h1>Tolle Software {title}</h1>
        <p>{desc}</p>
        {address}
        <div data-generator="address">
            <p>{street}</p>
            <p>{town}</p>
            <p>{country}</p>
        </div>
        <!-- Visual Samples to check different behaviour --> 
        <div class="htmlGeneratorsDemo">
            <p>Super UltraVeryLong Street Name</p>
            <p>And a Big town</p>
            <p>What a very Big country</p>
        </div>
        <div class="htmlGeneratorsDemo">
            <p></p>
            <p>Town with no Street</p>
            <p>Small country</p>
        </div>
    </div>
</div>
```
    
# Documentation

## css Classes

`htmlGenerators`  
Holds all generators inside your HTML page.

`htmlGeneratorsDemo`  
Elements with this class will be remove during compilation. If your generators are visible you can use this Elements to check different scenarios.


## attributes

`data-generator`  
Starting with this HTML tag a generator will be build using the name provide.

`data-generatorplace`
This element will be handled like a normal insertion point.
The following code blocks are identical (after compilation):
```html
<div class="result">{data}</div>

<div class="result"><div data-generatorplace="data"/></div>
```

## reference variable inside HTML

anywhere inside the HTML of a generator you can specify a variable element

```html
<div class="{visualclass:defaultclass}">{value:no value}</div>
```

The Variable is named `value`. If this variable is not present the text `'no value'` is used at this place.

At some places an insert point like `{rows}` is not possible.
```html
<table><!-- This does NOT work !!! -->
    {rows}
</table>
```

In this case you can use a Tag which is valid (`<tr>`) and mark them with a spezial attribute `data-generatorplace`.  
So this will work (as aspected):

```html
<table><!-- This will work  !!! -->
    <tr data-generatorplace="rows"/>
</table>
```


## Sample


Here is a omplete example (for a generator to create BootStrap Dialogs)     

```javascript
<div class="modal fade " style="display: block" tabindex="-1" role="dialog" data-generator="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class=" close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title dlg-element" data-element="title">
                    <span class="glyphicon glyphicon-{icon:info-sign}" aria-hidden="true"></span>
                    &nbsp;{title}
                </h4>
            </div>
            <div class="modal-body">
                <div class="form">
                    <p data-generator="text">{text}</p>
                    <div data-generator="inputtext" class="form-group">
                        <label for="left">{label:Eingabefeld}</label>
                        <input type="{type:text}" placeholder="{placeholder:text}" class="valName_{name:unnamed} form-control"></input>
                    </div>
                    <div data-generator="select" class="form-group">
                        <label for="left">{label:Eingabefeld}</label>
                        <select class="valName_{name:unnamed} form-control">
                            <option data-generator="option" value="{value}">{title}</option>
                            <option data-generator="selectedoption" selected value="{value}">{title}</option>
                            <option data-generatorplace="select"></option>
                        </select>
                    </div>
                    <div data-generatorplace="content"></div>
                </div>
            </div>
            <div class="modal-footer">
                <div data-generator="cancelok">
                    <button type="button" class="btn btn-default pull-left" data-dismiss="modal">{cancel:Abbruch}</button>
                    <button type="button" class="btn btn-primary ok">{ok:Ok}</button>
                </div>
                <button data-generator="cancel" type="button" class="btn pull-left btn-default" data-dismiss="modal">{cancel:Abbruch}</button>
                <button data-generator="ok" type="button" class="btn btn-primary ok">{ok:Ok}</button>
                <div data-generatorplace="buttons"></div>
            </div>
        </div>
    </div>
</div>


```


