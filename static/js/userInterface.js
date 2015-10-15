var exprIdArray = []; //holds ids of expression divs
var count = 0; //used to count expression divs
var pressedGo = false;
var expArray = [];
var toAdd = [];
var allowInvalid = false;

/**
 * This function deletes an expression when the user clicks the "X" button next to the expression.
 */
function deleteExp(divId) {
    $('#' + divId).remove();

    var index = -1;
    for (i = 0; i < exprIdArray.length; i++) {
        if (exprIdArray[i] == divId) index = i;
    }
    if (index > -1) {
        exprIdArray.splice(index, 1);
        expArray.splice(index, 1); //Could be the cause of errors
    }
}

/**
 * when user clicks go button - evaluates expressions that have been added and displays true or false.
 */

function go() {
    pressedGo = true;
    worldstage.sendMessage('getworldforeval')
}

/**
 * 
 */
function setupListeners() {
    worldstage.on('message:getExpr', function(data) {
        console.log("getExpr Recieved");
        worldstage.sendMessage('exprArray', expArray);
    });

    worldstage.on('message:objectSelected', function(data) {
        console.log(data);
        $('#objNamer').val(data);

    });

    worldstage.on('message:evalworld', function(data) {
        world = data;
        var scope = {
            Color: getColour()
        };
        for (var w = 0; w < world.length; w++) {
            var obj = world[w];
            if (obj.name) {
                scope[obj.name] = obj;
            }
        }

        for (var i = 0; i < exprIdArray.length; i++) {
            var id = exprIdArray[i];

            var expressionDiv = $('#' + id);

            var expr = expressionDiv.find('p').text();
            var parsedTree = null;
            var errormessage = null;
            try {
                parsedTree = parseExpr(expr, Object.keys(scope));
            } catch (error) {
                errormessage = error.message;
                console.error(error);
            }

            var eval = false;
            if (parsedTree) {
                try {
                    eval = evaluate(parsedTree, scope);
                } catch (error) {
                    eval = null;
                    errormessage = "Evaluation error"
                    console.error(error);
                }
            } else {
                eval = null;
            }

            console.log('eval', eval);
            console.log('world', world);

            expressionDiv.find('.result')
                .toggleClass('fail', !eval)
                .toggleClass('pass', eval)
                .attr("title", errormessage)
                .text((eval == null) ? "Error" : (eval) ? "True" : "False");
        }

    });


    worldstage.on('message:saveData', function(data) {
        data.expressions = expArray;
        var dataToParse = JSON.stringify(data);
        var depth = 0;
        var tabWidth = 2;
        var j = 0;
        var output = "";
        var ignoreUntil = '';
        for (var i = 0; i < dataToParse.length; i++) {
            var temp = dataToParse.charAt(i);
            if (ignoreUntil) {
                output += temp;
                if (ignoreUntil == temp) {
                    ignoreUntil = '';
                }
            } else {
                if (temp == ',') {
                    output += temp;
                    output += '\n';
                    for (j = 0; j < depth; j++) output += ' ';
                } else if ((temp == '{') || (temp == '[')) {
                    output += temp;
                    output += '\n';
                    depth += tabWidth;
                    for (j = 0; j < depth; j++) output += ' ';
                } else if (temp == '}' || temp == ']') {
                    output += '\n';
                    depth -= tabWidth;
                    for (j = 0; j < depth; j++) output += ' ';
                    output += temp;
                } else if (temp == '"' || temp == "'") {
                    output += temp;
                    ignoreUntil = temp;
                } else if (temp == ':') {
                    output += temp + ' ';
                } else {
                    output += temp;
                }
            }
        }




        saveAsFile(output, "save");
    });

    /**
     * on click on add expression button, adds the written expression to list of expressions
     */
    worldstage.on('message:addexpr', function(data) {
        world = data;
        toAdd.forEach(function(expr) {

            //Create Labels
            var id = count++;
            var expressionDiv = $('<div/>', {
                    'id': id,
                    'class': 'expression'
                })
                .append($('<p/>', {
                        'onclick': 'update(' + id + ')'
                    })
                    .text(expr));
            var resultDiv = $('<div/>', {
                'class': 'result'
            });
            var deleteDiv = $('<div/>', {
                    'class': 'delexpr',
                    'onclick': 'deleteExp(' + id + ')'
                })
                .text('X');

            //Append the element in page
            if (expr != "Input expression" && expr.length > 0) {
                var scope = ["Colour"];
                for (var w = 0; w < world.length; w++) {
                    var obj = world[w];
                    if (obj.name) {
                        scope.push(obj.name);
                    }
                }
                try {
                    if (!allowInvalid) {
                        parseExpr(expr, scope);
                    }

                    exprIdArray.push(id);
                    expArray.push(expr);

                    $('#outputDiv').append(expressionDiv
                        .append(deleteDiv)
                        .append(resultDiv));

                    $('#parserError').toggleClass('show', false);

                    console.log("testtestsetset");

                    button('clear');
                } catch (error) {
                    $('#parserError').toggleClass('show', true).text(error.message);
                }
            }
        });
    });


    $('#addObj').click(function() {
        var temp = {
            type: $('#objList').val(),
            name: "",
            colour: $('#colourList').val()
        };
        if ($('#objNamer').val() != "Object Name") {
            //temp.name = $('#objNamer').val();

        }

        worldstage.sendMessage('addobject', temp);
    });

    $('#objNamer').keyup(function() {
        console.log("key pressed");
        var field = $('#objNamer');
        var text = field.val();

        worldstage.sendMessage('setSelectedObjectTitle', text);
    });


    $('#txtExpr').keypress(function() {
        var field = $('#txtExpr');
        var text = field.val();
        var length = text.length;

        var startPos = field[0].selectionStart;
        var endPos = field[0].selectionEnd;
        var scrollTop = field[0].scrollTop;

        text = replaceString(/<->/, text, '\u2194');
        text = replaceString(/->/, text, '\u2192');
        text = replaceString(/\^|&/, text, '\u2227');
        text = replaceString(/\|/, text, '\u2228');
        text = replaceString(/~/, text, '\u00AC');
        text = replaceString(/\\x/, text, '\u22BB');
        text = replaceString(/:/, text, '\u22C5');
        text = replaceString(/\\e/, text, '\u2203');
        text = replaceString(/\\a/, text, '\u2200');

        if (field.val() != text) {
            field.val(text);

            if (length != text.length) {
                var diff = length - text.length;
                field[0].selectionStart = startPos - diff;
                field[0].selectionEnd = startPos - diff;
                field[0].scrollTop = scrollTop;
            }
        }
    });

    $('body').on('change', '#liblist', function() {
        var library_name = $('#liblist').val();
        $.getJSON("lib/" + library_name + "/" + library_name + "_lib.json", function(data) {
            worldstage.sendMessage('setlibrary', data);

            worldstage.sendMessage('clearworld');

            populateObjectSelect(data);
        });
    });

    $('#sizeInc').click(function() {
        console.log("test")
        worldstage.sendMessage('changeSize', 1);
    });

    $('#sizeDec').click(function() {
        worldstage.sendMessage('changeSize', -1);
    });

    $('#txtExpr').keydown(function(event) {
        if (event.keyCode == 13) {
            $('#addExpr').click();
            event.preventDefault();
        }
    });

    $('#fileSelect').click(function(e) {
        $('#files').click();
        e.preventDefault();
    });

    $('#removeObj').click(function(e) {
        worldstage.sendMessage('removeObj');
        console.log("removing object");
    });

    $('#copyObj').click(function(e) {
        worldstage.sendMessage("cloneObj");
        console.log("copying object");
    });

    $('#performSave').click(function(e) {
        $('#cover').toggle(0);
        $('#saveprompt').toggle(0);
    });

    $('#saveprompt > #close').click(function(e) {
        $('#cover').toggle(0);
        $('#saveprompt').toggle(0);
    });

    $('#fileName').on('input', function() {
        var a = $('#performSave')[0];
        if ($('#fileName').val()) {
            a.download = $('#fileName').val() + ".json";
        } else {
            a.download = "save.json";
        }
    });
}

/**
 * This function is used to display the corresponding logic symbol in place of the text code that the user types in the expression bar. For example
 * if the user types in '\a' in the expression bar it would be replaced by the actual unicode symbol for the forall symbol.
 */
function replaceString(regex, string, replacement) {
    var changed = string.replace(regex, replacement);
    while (changed != string) {
        string = changed;
        changed = string.replace(regex, replacement);
    }
    return changed;
}

function button(operator) {
    //insert operator into expression box
    var currentExp = document.getElementById('txtExpr').value;
    console.log(currentExp);

    var symbol = getSymbol(operator);

    if (currentExp == "Input expression" || symbol == "") {
        document.getElementById('txtExpr').value = symbol;
    } else {
        insertAtCaret(document.getElementById('txtExpr'), symbol);
    }
}

/**
 * This function returns the unicode character for the corresponding logic symbol.
 */
function getSymbol(operator) {
    var symbol = "";
    switch (operator) {
        case 'and':
            symbol = "\u2227";
            break;
        case 'or':
            symbol = "\u2228";
            break;
        case 'not':
            symbol = "\u00AC";
            break;
        case 'dot':
            symbol = "\u22C5";
            break;
        case 'for all':
            symbol = "\u2200";
            break;
        case 'there exists':
            symbol = "\u2203";
            break;
        case 'iff':
            symbol = "\u2194";
            break;
        case 'xor':
            symbol = "\u22BB";
            break;
        case 'implies':
            symbol = "\u2192";
            break;

    }
    return symbol;
}


//sourced from: http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
/**
 * This function inserts symbol at the location of the cursor when the button is pressed. 
 */
function insertAtCaret(element, text) {
    if (document.selection) {
        element.focus();
        var sel = document.selection.createRange();
        sel.text = text;
        element.focus();
    } else if (element.selectionStart || element.selectionStart === 0) {
        var startPos = element.selectionStart;
        var endPos = element.selectionEnd;
        var scrollTop = element.scrollTop;
        element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
        element.focus();
        element.selectionStart = startPos + text.length;
        element.selectionEnd = startPos + text.length;
        element.scrollTop = scrollTop;
    } else {
        element.value += text;
        element.focus();
    }
}




/**
 * Adds objects to the world ??? i think
 */

function populateObjectSelect(data) {
    //What does this do??
    var list = $('#objList');
    list.empty();

    data.library.forEach(function(e) {
        list.append($('<option/>', {
            value: e.type
        }).text(e.type));
    });
}

function populateColourSelect() {
    var colours = Colour;
    var elem = $('#colourList');
    Object.keys(colours).forEach(function(c) {
        elem.append($('<option/>', {
            value: c
        }).text(c));
    });

}

/**
 * Adds objects from the user interface to the world
 */
function addObjectFromUI() {
    var obj_index = document.getElementById('objList').selectedIndex;
    var default_x = 5,
        default_y = 5;
    var width = 50,
        height = 50;
    addObject(obj_index, default_x, default_y, width, height);
}

function update(id) {
    $('#txtExpr').val($('#' + id + ' p').text());
}

function setExpressionList(exprs) {
    //TODO remove br after it is removed from index.
    $('#outputDiv').empty().append($('<br/>'));
    exprIdArray = [];
    count = 0;
    console.log("EXPRESSIONS", exprs);
    toAdd = exprs;
    allowInvalid = true;
    worldstage.sendMessage("getworldforadd");
}

function setSize() {
    var height = $('#world').width();
    console.log("HEIGHT " + height);
    //var right = document.getElementById('expression-column').style.height;
    document.getElementById('outputDiv').style.height = (height - 50) + 'px';
}

function openCheatSheet(){
	window.open('/cheatsheet');
}