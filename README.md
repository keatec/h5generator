# h5generator
Generator Libary for HTML based Websites

# Description

h5generator can be used to define HTML code which can  later be generated using variable text

Sample:
```html
    <div data-generator="softi">
        <h1>Tolle Software {title}</h1>
        <p>{desc}</p>
    </div>
```
after compilation a call to 
```javascript
    generators.softi({
        title: 'BestApp',
        desc: 'Best Sofware ever'
    })
```
will generate this as return 
```html
    <div>
        <h1>Tolle Software BestApp</h1>
        <p>Best Software ever</p>
    </div>
```




    