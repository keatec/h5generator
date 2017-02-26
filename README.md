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
    <h1>Tolle Software BestApp</h1>
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

If you have more then one address, simply build an array...

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
the class 'htmlGeneratorsDemo'. Elements with this class are removed during compilation. 

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
    