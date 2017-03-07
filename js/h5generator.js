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
            obj.data('contextRes',JSON.stringify(aObj))
            obj.attr('data-contextRes',JSON.stringify(aObj))
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
                root.sub[name] = { html: '', sub: {}, def: {} };
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

    var main = {
        init: function () {
            var data = $('.htmlGenerators');
            if (data.length === 0) return;
            var start = { sub: {} };
            data.map(function (e, obj) {
                scanGenerator($(obj), start);
            });
            for (var i in start.sub) {
                buildFunction(start.sub[i], i, main, '');
            }
        }
    };

    exports.generators = main;

})(window);

$(document).ready(function () {
    generators.init();
});

