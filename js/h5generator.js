/*

MIT License

Copyright (c) 2017 keatec

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/


(function (exports) {

    var combinePath = function (root,level,rootpath) {
        console.log('CP',root,level,rootpath);
        var left = root.match(/\.[^\.]+/gi);
        var xdo = level.match(/(\.\.\/)|(\/\/)|[a-z0-9]+/gi);
        while (xdo.length > 0 && (xdo[0] == '..\/' || (xdo[0] == '//'))) {
            if (xdo[0] == '..\/') {
                left.splice(left.length-1,1);
                xdo.splice(0,1);
            };
            if (xdo[0] == '//') {
                left = ['.'+rootpath]
                xdo.splice(0,1);
            }
        };
        console.log('->',left.join('')+'.'+xdo.join(''))
        return left.join('')+'.'+xdo.join('');
    }

    var buildFunction = function (elem, name, rootfnc, rootname) {
        var html = elem.html;
        var code = [];
        var reg = /\{[^\}]+\}/gi;
        var lines = html.split(reg); expr = html.match(reg) || [];
        var pos = 0; var vname; var vars = {};
        var i;
        for (i = 0; i < lines.length; i++) {
            code.push('' + JSON.stringify(lines[i]));
            if (pos < expr.length) {
                var match = (/\{([\!]{0,1})([a-z]+)(?:\:([^\}]+)){0,1}\}/gi).exec(expr[pos]);
                vname = match[2];
                vars[vname] = match[1] == '!';
                if (match[3] !== undefined) {
                    elem.def[vname] = match[3];
                }
                code.push('(\'\'+' + vname + ' )');
                pos++;
            }
        }
        code = code.join('+\n');
        var fnc;
        var check = []; var checknames = []; var varnames = []; varcheck = {};
        for (i in vars) {
            if (vars[i]) {
                varnames.push('!' + i);
                varcheck[i] = 1;
                check.push('(_opt.' + i + ' === undefined)');
                checknames.push(i);
            } else {
                varnames.push(i);
                varcheck[i] = 1;
            }
        }
        if (check.length > 0) check = ['if (' + check.join(' || ') + ') {throw new Error(\'Generator ' + rootname + '.' + name + ' requires: (' + checknames.join(',') + ') \');};'];
        var fncc = [];
        fncc.push('fnc = function ' + name + ' (_aOpt,_aDef) { ');
        fncc.push('var _def = (_aDef == undefined ? ' + JSON.stringify(elem.def) + ' : _aDef); var _opt = (_aOpt == undefined ? {} : _aOpt);');
        
        //fncc.push('console.log(_aDef,_aOpt,_opt.title == undefined);');
        fncc.push('var _ars = ' + JSON.stringify(varcheck) + ';');
        fncc.push('for (var _i in _opt) {if (_ars[_i] != 1) {throw new Error(\'Generator ' + rootname + '.' + name + ' does not define a value "\'+_i+\'"\')};};');
        
        fncc.push(check.join(''));
        for (i in vars) {
            fncc.push('var ' + i + ';');
        }
        for (i in vars) {
            fncc.push('' + i + '= (_opt.' + i + ' != undefined ? _opt.' + i + ': (_def.' + i + ' != undefined ? _def.' + i + ' : \'\'));');
            fncc.push('if (' + i + ' instanceof Array) ' + i + '=' + i + '.join(\'\');');
        }
        fncc.push('; return ' + code + '}');
        //console.log(fncc.join('\r\n'));
        eval('' + fncc.join(''));
        console.log('Generator created: generators' + rootname + '.' + name + '({' + varnames.join(',') + '})');
        rootfnc[name] = fnc;
        elem.fnc = fnc;
        fnc.asActive = function (aObj,aDef) {
            var obj = $(this(aObj,aDef));
            /*obj.data('generator',rootname+'.'+name);data-contextRes
            obj.attr('data-generator',rootname+'.'+name);*/
            var extra; var html;
            while ((extra = obj.find('*[data-generatorinclude]').first()).length >0 ) {
                html = '<div></div>';
                console.log(elem,name,rootname);
                var path = combinePath('.'+elem.path,extra.data('generatorinclude'),elem.rootpath);
                eval ('html = '+path.substr(1)+'.asActive('+JSON.stringify(JSON.parse('{'+extra.text()+'}'))+');')
                extra.replaceWith(html);  
            }
            obj.data('contextres',JSON.stringify(aObj));
            obj.attr('data-contextres',JSON.stringify(aObj));
            if (obj.hasClass('context')) {
                // ok, this is a Clicker Object;
                var app = obj.data('app');
                if (window[app] !== undefined) {
                    if (window[app]['update_'+name] !== undefined) {
                        var res = window[app]['update_'+name](obj,aObj);
                        if (res !== undefined) {
                            obj.data('contextres',JSON.stringify(res));
                            obj.attr('data-contextres',JSON.stringify(res));
                        }
                    }
                }
            }
            return obj;
        };
        for (i in elem.sub) {
            buildFunction(elem.sub[i], i, fnc, rootname + '.' + name);
        }
    };

    var scanGenerator = function (obj, root) {
        if (obj.data('generator') !== undefined) {
            // There is an Generator
            var name = obj.data('generator');
            if (name.length > 0) {
                obj.removeData('generator');
                obj.removeAttr('data-generator');
                if (root[name] !== undefined) throw new Error('Only one generator definition is allowed per child');
                root.sub[name] = { html: '', sub: {}, def: {}, path: root.path+'.'+name, rootpath: root.rootpath };
                var val = root.sub[name];
                var html = $('<div/>').append(obj.clone());
                var list = html.find('*[data-generatorplace]');
                list.map(function (e) {
                    $(list[e]).replaceWith($('<!--repl:' + $(list[e]).data('generatorplace') + '-->'));
                });
                html.find('*[data-generator]').remove();
                html.find('.htmlGeneratorsDemo').remove();
                html = html.html();
                html = html.replace(/<\!\-\-repl\:([!a-z]+)\-\-\>/gi, function (e, o) {
                    return '{' + o + '}';
                });
                val.html = html;
                obj.children().map(function (e, obj) {
                    scanGenerator($(obj), val);
                });
            }
        } else {
            obj.children().map(function (e, obj) {
                scanGenerator($(obj), root);
            });
        }

    };

    var compileExtHtml = function (cfg) {
        //console.log(cfg);  
        var start = cfg.html.indexOf('<!--<h5generator>-->');
        var end = cfg.html.indexOf('<!--</h5generator>-->');
        if (start < 0 || end < 0 || (start >= end)) throw new Error('generator was not found in html');
        var html = cfg.html.substr(start+20,end-(start + 20));
        html = html.replace(/^[\s]*/gi,'');
        var start = { sub: {}, path: 'generators.'+cfg.name,rootpath: 'generators.'+cfg.name  };
        var go = $(html);
        for (var i = 0; i < go.length; i++) {
            scanGenerator($(go[i]), start);
        }
        for (var i in start.sub) {
            buildFunction(start.sub[i], i, cfg.ref, '.'+cfg.name);
        };
    };



    var loadAsync;

    var main = {
        waitFor : function () {
            if (loadAsync == undefined) throw new Error('Async Load requires a Promise Libary.');
            return loadAsync;
        },
        init: function () {
            var data = $('.htmlGenerators');
            if (data.length === 0) return;
            var start = { sub: {} };
            data.map(function (e, obj) {
                scanGenerator($(obj), start);
            });
            for (var i in start.sub) {
                buildFunction(start.sub[i], i, main, '');
            };
            if (window['Promise'] != undefined) {
                loadAsync = new Promise(function (res,rej) {
                    var todo = $('.htmlGenerators')
                        .find('div[data-generatorref]')
                        .map(function (e,obj) {
                            return {uri: $(obj).data('generatorref'),name: $(obj).data('name')}})
                                .map(function (i,e) {
                                    if (e.name != undefined) {
                                        generators[e.name] = {}; e.ref = generators[e.name]; 
                                        return e
                                    }; 
                                    e.ref = generators; return e
                                })
                    //console.log('Reading Generators Async',todo);
                    if (todo.length == 0) return res(); // Patch for IE11, IE11 does not support defered Loading
                    todo = todo.toArray().map(function (obj) {
                        return new Promise(function (res,rej) {
                                $.ajax({
                                    url: obj.uri, 
                                    success: function (data) {
                                        obj.html = data;
                                        res(obj);
                                    },
                                    error: function(err) {
                                        console.log(err);
                                        rej(err);
                                    }
                                });
                        });
                    });
                    return Promise.all(todo)
                        .each(function (obj) {
                            compileExtHtml(obj); 
                            $('*[data-generatorbuild]').map(function (e,obj) {
                                var el = $(obj);
                                var html;
                                eval('html = generators.'+el.data('generatorbuild')+'('+el.html()+')');
                                el.replaceWith(html);
                            })                        
                            return;
                        })
                        .then(function (todo) {
                            res();
                        })
                        .catch(function (err) {
                            //console.log('eee',err);
                            rej(err);
                        })
                });
            };
        }
    };

    exports.generators = main;

})(window);


$(document).on('ready',function () {
    generators.init();
});

