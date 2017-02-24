# h5generator
Generator Libary for HTML based (Single Page) Websites

# Description

h5generator can be used to define HTML code which can  later be generated using variable text

Sample:
```html
<div data-generator="softi">
    <h1>Tolle Software {title}</h1>
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

> by unhiding this tag your template can be directly edited for Design questions.
> It is also possible to add demotags to the generator which can be used to test different
> visual effects and scenarios. During compilation this elements will removed

generators can (and should) be nested.

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
Now you have two generators "softi" (*1) and "softi.address" (*2). To Insert to Result of "softi.address" softi has a place to insert the Result
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

If you want to visual check your generator you can simply add sample elements by using
the class 'htmlGeneratorsDemo'. Elements with this class are ignored during compilation. (you have to remove the display:none from the generators tag to make the html elements visible of course!)

```html
<div style="display:none" class="htmlGenerators">
    <div data-generator="softi"> <--*1
        <h1>Tolle Software {title}</h1>
        <p>{desc}</p>
        {address}<--*2
        <div data-generator="address"> <--*3
            <p>{street}</p>
            <p>{town}</p>
            <p>{country}</p>
        </div>
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
    