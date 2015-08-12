
function parseExpr(input){
    var groups = /\s*(\u2200|\u2203)\s*([a-zA-Z0-9,\s]+)\u22C5\s*((?:\s*\S+)+)\s*/.exec(input);
    var type;
    if (groups === null){ //not all or some
        return parseExpr2(input);
    } else if (groups[1] === '\u2200'){ //all
        type = expressionTypes.ALL;
    } else { //some
        type = expressionTypes.SOME;
    }
    return parseVarList(groups[2]).reduceRight(function(prev, curr){
        return {type: type, first: curr, second: prev};
    }, parseExpr(groups[3]));
}

function parseVarList(input){
    var regex = /^([a-zA-Z][0-9a-zA-Z]*)\s*(?:,\s*(.+))*/;
    var groups = regex.exec(input);
    var list = [];
    while (groups != null && groups[2]){
        list.push(groups[1]);
        groups = regex.exec(groups[2]);
    }
    if (groups) {
        list.push(groups[1]);
        return list;
    } else {
        //TODO improve error handling
        console.log('Parse fail: ' + input);
    }
}

//Checks that all brackets are balanced in the input string. 
function balancedBrackets(input){
    var stack = [];
     
    var str = input.split('');
    for (i = 0; i < str.length; i++) {
        var c = str[i];
        if (c === '(') {
            stack.push(c);
        } else if (c === ')') {
          if (stack.length <= 0) return false;
          else if (stack[stack.length-1] === '(') stack.pop();
          else return false;
        }
      }
     
      return stack.length <= 0;
}

function parseExpr2(input) { //<->
    var groups = /^(.+?)\s*\u2194\s*(.+)$/.exec(input);
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: expressionTypes.IFF, 
            first: parseExpr3(groups[1]),
            second: parseExpr2(groups[2])
        };
    } else {
        return parseExpr3(input);
    }
}

function parseExpr3(input) { //->
    var groups = /^(.+?)\s*\u2192\s*(.+)$/.exec(input);
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: expressionTypes.IMPLIES, 
            first: parseExpr4(groups[1]),
            second: parseExpr3(groups[2])
        };
    } else {
        return parseExpr4(input);
    }
}

function parseExpr4(input) { //or, xor
    var groups = /^(.+?)\s*(\u2228|\u22BB)\s*(.+)$/.exec(input);
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: (groups[2] === '\u2228') ? expressionTypes.OR : expressionTypes.XOR, 
            first: parseExpr5(groups[1]),
            second: parseExpr4(groups[3])
        };
    } else {
        return parseExpr5(input);
    }
}

function parseExpr5(input) { //and
    var groups = /^(.+?)\s*\u2227\s*(.+)$/.exec(input);
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: expressionTypes.AND, 
            first: parseExpr6(groups[1]),
            second: parseExpr5(groups[2])
        };
    } else {
        return parseExpr6(input);
    }
}

function parseExpr6(input) { //not
    var groups = /^\u00AC\s*(.+)$/.exec(input);
    if (groups){
        return {type: expressionTypes.NOT, 
            first: parseExpr6(groups[1]),
            second: null
        };
    } else {
        return parseExpr7(input);
    }
}

function parseExpr7(input){ // ()
    var groups = /^\((.*)\)$/.exec(input);
    if (groups){
        return parseExpr(groups[1]);
    } else {
        return parseComparisons(input);
    }
}


function parseComparisons(input) {
    var groups = /^(.+?)\s*(=|!=|>|<|>=|<=)\s*(.+)$/.exec(input);
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: (groups[2] === '=') ? expressionTypes.EQUALS : 
                      (groups[2] === '!=') ? expressionTypes.NOT_EQUALS : //Possibly \u2260
                      (groups[2] === '>') ? expressionTypes.GREATER_THAN : 
                      (groups[2] === '<') ? expressionTypes.LESS_THAN : 
                      (groups[2] === '>=') ? expressionTypes.GTE : //>= \u2265, <= \u2264
                      expressionTypes.LTE, 
            first: parseValue(groups[1]),
            second: parseValue(groups[3])
        };
    } else {
        //TODO check whether this is wanted behaviour
        return parseValue(input);
    }
}

function parseValue(input){
    var groups = /^([a-zA-Z][0-9a-zA-Z]*).([a-zA-Z][0-9a-zA-Z]*)$/.exec(input);
    var cons;
    if (groups) { //Field access
        return {type: expressionTypes.VAR_ACCESS, 
            vari: groups[1],
            field: groups[2]
        };
    } else { //Constant
        groups = /^([0-9]+|'[^']*'|"[^"]*"|[a-zA-Z][0-9a-zA-Z]*)$/.exec(input);
        if (groups) {
            if (!groups[1]) console.log(groups);
            if (groups[1].charAt(0) === "'" || groups[1].charAt(0) === '"') {
                cons =  groups[1].substring(1, groups[1].length-1);
            } else if (/^[^0-9]/.exec(groups[1])){
                return {type: expressionTypes.VAR_ACCESS, 
                    vari: groups[1],
                    field: null
                };
            } else {
                cons = +groups[1];
            }
            return {type: expressionTypes.CONST, val: cons}
        } else {
            //FUTURE ERROR
        }
    }
}