var testInputB = "?x?x=1";
var testInputC = "¬a?b";
var testInputD = "(avb)?c";

function parse(expr){
    return parseExpr(expr);
    if(expr.length == 0)
      return null;
    
    var first_char = expr[0];
    expr = expr.substring(1, expr.length);
  
    if(first_char == "\u2200" || first_char == "\u2203"){
      return parseAllSome(expr, first_char);
    } else if(first_char == "\u00AC"){
      return parseNot(expr);
    } else {
      return parseExpr1(first_char+expr);
    }
      
}

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
        groups = /^([0-9]+)|('[^']*)'|("[^"]*)"$/.exec(input);
        if (groups) {

            if (groups[1].charAt(0) === "'" || groups[1].charAt(0) === '"') {
                cons =  groups[1].substring(1);
            } else {
                cons = +groups[1];
            }
            return {type: expressionTypes.CONST, val: cons}
        } else {
            //FUTURE ERROR
        }
    }
}

function parseAllSome(expr, first_char){

  var first = "";
  var i;
  //We assume the escape character is '\u22C5' (dot operator).
  for(i = 0; expr[i] != "\u22C5"; i++){
    first += expr[i];
  }
  var type = expressionTypes.ALL;
  if(first_char == "\u2203")
    type = expressionTypes.SOME;
  
  var second = expr.substring(i+1, expr.length);
  
  var obj = {type:type,
		    first:first,
		    second:parse(second)
		    };
  return obj;
}

//Parse not expression from start of string
function parseNot(expr){
  var obj = {type:expressionTypes.NOT,
	  first:parse(expr),
	  second:null
	  };
  return obj;
}


//expression parsing
function parseExpr1(expr){
  //'»' represents implies and '©' represents exclusive OR.
  var index = indexOfEquation(expr)
  //If no equation symbol is found...
  
  
  if(index == -1){
    var num_regex = new RegExp("[0-9]+([.][0-9]+)*")
    if(num_regex.test(expr))
      return parseCon(expr);
    else
      return parseVar(expr);
  }
  
  
  var i = 1;
  var second = expr.substring(index+1, expr.length);
  if(indexOfEquation(second) == 0){
    second = second.substring(1, expr.length);
    i++;
  }
  var type = getTypeName(expr.substring(index, index+i));

  var first = parse(expr.substring(0,index));
  var second = parse(second);

  var obj = {type:type,
	    first:first,
	    second:second
  }
  return obj;
}

function getTypeName(char){
  var name = "";
  switch(char){
    case '\u2227':
      name = expressionTypes.AND;
      break;
    case '\u2228':
      name = expressionTypes.OR;
      break;
    case '=':
      name = expressionTypes.EQUALS;
      break;
    case '!=':
      name = expressionTypes.NOT_EQUALS;
      break;
    case '>':
      name = expressionTypes.GREATER_THAN;
      break;
    case '>':
      name = expressionTypes.LESS_THAN;
      break;
    case '<=':
      name = expressionTypes.GTE;
      break;
    case '>=':
      name = expressionTypes.LTE;
      break;
    case '\u2192':
      name = expressionTypes.IMPLIES;
      break;
    case '\u2295': //FIXME not supported by evaluator
      name = expressionTypes.XOR;
      break;
    
  }
  return name;
}

function indexOfEquation(expr){
  for(var i = 0; i<expr.length;i++){
   if(expr[i] == '\u2227' ||
      expr[i] == '\u2228' ||
      expr[i] == '=' ||
      expr[i] == '!' ||
      expr[i] == '>' ||
      expr[i] == '<' ||
      expr[i] == '\u2192' ||
      expr[i] == '\u2295'){
      return i;
   }
  }
  return -1;
}


//constant parsing
function parseCon(expr){
    var regex = new RegExp("[.]");
    if(regex.test(expr)){
      var val = parseFloat(expr);
      var obj = {
	type: expressionTypes.CONST,
	val: val
      }
      return obj;
    }
    else {
      var val  = parseInt(expr);
      var obj = {
	type: expressionTypes.CONST,
	val: val
      }
      return obj;
    }
}

//Variable Parsing
function parseVar(expr){
  var regex = new RegExp('[.]');
  
  var split = expr.split(regex);
  var obj = null;
  if(split.length>1)
    obj = {
	type: expressionTypes.VAR_ACCESS,
	val:split[0],
	field:split[1]
    }
  else{
    obj = {
	type: expressionTypes.VAR_ACCESS,
	val:split[0],
	field:null
    }
  }
  return obj;
  
}

function printTree(){
    var tree = parse(testInputB);

    console.log(
      tree
    );
}

