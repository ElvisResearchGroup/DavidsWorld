/*
 * Parses an expression string to an expression tree. 
 */
function parseExpr(input){
    //Tries to match it as 'all' or 'some'
    var groups = /^\s*(\u2200|\u2203)\s*([a-zA-Z0-9,\s]+)\u22C5\s*((?:\s*\S+)+)\s*$/.exec(input);
    var type;
    
    //If not 'all' or 'some' then continue parsing
    if (groups === null){
        groups = /^\s*(\u2200|\u2203)/.exec(input); 
        if (groups !== null){
            throw {message: "Missing or invalid variable list for " + input};
        }

        return parseExpr2(input.trim());
    //If 'all' or 'some' record the type as such
    } else if (groups[1] === '\u2200'){
        type = expressionTypes.ALL;
    } else {
        type = expressionTypes.SOME;
    }
    
    //Parse the variable list, and transform it into a tree structure
    return parseVarList(groups[2]).reduceRight(function(prev, curr){
        return {type: type, first: curr, second: prev};
    //Parse the remaining input and place it in the inner most tree
    }, parseExpr(groups[3]));

}

/**
 * Parses a list of variables, returning a list.
 */
function parseVarList(input){
    //Find variables
    var regex = /^([a-zA-Z][0-9a-zA-Z]*)\s*(?:,\s*(.+))*$/;
    var groups = regex.exec(input);
    var list = [];
    //While more than one variables are found, keep adding them to the list
    while (groups != null && groups[2]){
        list.push(groups[1]);
        groups = regex.exec(groups[2]);
    }
    //Add last variable to the list and return it
    if (groups) {
        list.push(groups[1]);
        return list;
    //No last variable
    } else {
        throw {message: "Invalid variable identifier " + input};
        //TODO improve error handling
    }
}

/*
 * Checks that all brackets are balanced in the input string. 
 */
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

/**
 * Parse iff expresssions
 */ 
function parseExpr2(input) {
    //Try to match iff
    var regex;
    var num = 0;
    var groups = /^(.+?)\s*\u2194\s*(.+)$/.exec(input);

    //If there was an 'iff' but it wrapped in brackets
    while (groups && !(balancedBrackets(groups[1]) && balancedBrackets(groups[2]))) {
        //Try to find another 'iff' skipping the previous 'iff's
        num++;
        regex = new RegExp('^(.+?(?:\u2194.+?){' + num + '})\\s*\u2194\\s*(.+)$');
        groups = regex.exec(input);
    }

    //If iff, parse children
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: expressionTypes.IFF, 
            first: parseExpr3(groups[1]),
            second: parseExpr2(groups[2])
        };
    //Otherwise continue parsing the input
    } else {
        return parseExpr3(input);
    }
}

/**
 * Parse implies expresssions
 */
function parseExpr3(input) {
    //Try to match implies
    var regex;
    var num = 0;
    var groups = /^(.+?)\s*\u2192\s*(.+)$/.exec(input); 

    //If there was an 'implies' but it wrapped in brackets
    while (groups && !(balancedBrackets(groups[1]) && balancedBrackets(groups[2]))) {
        //Try to find another 'implies' skipping the previous 'implies's
        num++;
        regex = new RegExp('^(.+?(?:\u2192.+?){' + num + '})\\s*\u2192\\s*(.+)$');
        groups = regex.exec(input);
    }

    //If implies, parse children
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){
        return {type: expressionTypes.IMPLIES, 
            first: parseExpr4(groups[1]),
            second: parseExpr3(groups[2])
        };
    //Otherwise continue parsing the input
    } else {
        return parseExpr4(input);
    }
}

/**
 * Parse or and xor expresssions
 */
function parseExpr4(input) {
    //Try to match 'or' or 'xor'
    var regex;
    var num = 0;
    var groups = /^(.+?)\s*(\u2228|\u22BB)\s*(.+)$/.exec(input);
    
    //If there was an 'or' or 'xor' but it wrapped in brackets
    while (groups && !(balancedBrackets(groups[1]) && balancedBrackets(groups[2]))) {
        //Try to find another 'or' or 'xor' skipping the previous 'or' or 'xor's
        num++;
        regex = new RegExp('^(.+?(?:[\u2228\u22BB].+?){' + num + '})\\s*(\u2228|\u22BB)\\s*(.+)$');
        groups = regex.exec(input);
    }

    //If it was, parse children
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[3])){

        return {type: (groups[2] === '\u2228') ? expressionTypes.OR : expressionTypes.XOR, 
            first: parseExpr5(groups[1]),
            second: parseExpr4(groups[3])
        };
    //Otherwise continue parsing the input
    } else {
        return parseExpr5(input);
    }
}

/**
 * Parse 'and' expresssions
 */
function parseExpr5(input) {
    //Try to match 'and'
    var num = 0;
    var regex = /^(.+?)\s*\u2227\s*(.+)$/;
    var groups = regex.exec(input);
    
    //If there was an 'and' but it wrapped in brackets
    while (groups && !(balancedBrackets(groups[1]) && balancedBrackets(groups[2]))) {
        //Try to find another 'and' skipping the previous 'and's
        num++;
        regex = new RegExp('^(.+?(?:\u2227.+?){' + num + '})\\s*\u2227\\s*(.+)$');
        groups = regex.exec(input);
    }

    //If 'and', parse children
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[2])){

        return {type: expressionTypes.AND, 
            first: parseExpr6(groups[1]),
            second: parseExpr5(groups[2])
        };
    //Otherwise continue parsing
    } else {
        return parseExpr6(input);
    }
}

/**
 * Parse not expresssions
 */
function parseExpr6(input) {
    //Try to match not
    var groups = /^\u00AC\s*(.+)$/.exec(input);
    
    //If it is 'not', parse the notted expression
    if (groups){
        return {type: expressionTypes.NOT, 
            first: parseExpr6(groups[1]),
            second: null
        };
    //Otherwise continue parsing
    } else {
        return parseExpr7(input);
    }
}

/**
 * Parse bracketed expressions
 */
function parseExpr7(input){
    //Try to match wrapping brackets
    var groups = /^\((.*)\)$/.exec(input);

    //If it is wrapped, parse the contents from the top
    if (groups){
        return parseExpr(groups[1]);
    //Otherwise continue parsing
    } else {
        return parseComparisons(input);
    }
}

/**
 * Parse comparison expressions
 */
function parseComparisons(input) {
    //Try to match any comparisons
    var groups = /^(.+?)\s*(=|!=|>=|<=|>|<)\s*(.+)$/.exec(input);

    //If it was a comparison, parse the values on either side
    if (groups && balancedBrackets(groups[1]) && balancedBrackets(groups[3])){
        return {type: (groups[2] === '=') ? expressionTypes.EQUALS : 
                      (groups[2] === '!=') ? expressionTypes.NOT_EQUALS : //Possibly \u2260
                      (groups[2] === '>') ? expressionTypes.GREATER_THAN : 
                      (groups[2] === '<') ? expressionTypes.LESS_THAN : 
                      (groups[2] === '>=') ? expressionTypes.GTE : //>= \u2265, <= \u2264
                      expressionTypes.LTE, 
            first: parseValue(groups[1]),
            second: parseValue(groups[3])
        };
    //Otherwise treat the input as a value
    } else {
        //TODO check whether this is wanted behaviour
        return parseValue(input);
    }
}

/**
 * Parse variables, field accesses, and constants
 */
function parseValue(input){
    //Try to match field accesses
    var groups = /^([a-zA-Z][0-9a-zA-Z]*)\.([a-zA-Z][0-9a-zA-Z]*)$/.exec(input);
    var cons;

    console.log("value input: ", input);
    //If it was a field access, return it
    if (groups) {
        return {type: expressionTypes.VAR_ACCESS, 
            vari: groups[1],
            field: groups[2]
        };
    //Otherwise
    } else {
        //Check it is a variable or a constant
        groups = /^([0-9]+|'[^']*'|"[^"]*"|[a-zA-Z][0-9a-zA-Z]*)$/.exec(input);
        if (groups) {
            //If a string constant, keep it as one
            if (groups[1].charAt(0) === "'" || groups[1].charAt(0) === '"') {
                cons =  groups[1].substring(1, groups[1].length-1);
            //If it's a variable, then return a null field access (so just access the variable)
            } else if (/^[^0-9]/.exec(groups[1])){
                return {type: expressionTypes.VAR_ACCESS, 
                    vari: groups[1],
                    field: null
                };
            //Otherwise it must be a number
            } else {
                cons = +groups[1];
            }
            //Return the constant
            return {type: expressionTypes.CONST, val: cons}
        } else {
            throw {message:"Invalid value type: " + input};
        }
    }
}