var testIputA = "ab?b!=c.d";
var testInputB = "?x?x=1";
var testInputC = "¬a?b";
var testInputD = "(avb)?c";

function parse(expr){
  
    if(expr.length == 0)
      return null;
    
    var first_char = expr[0];
    expr = expr.substring(1, expr.length);
  
    if(first_char == "\u2200" || first_char == "\u2203"){
      return parseAllSome(expr, first_char);
    } else if(first_char == "¬"){
      return parseNot(expr);
    } else {
      return parseExpr(first_char+expr);
    }
      
}

function parseAllSome(expr, first_char){

  var first = "";
  var i;
  //We assume the escape character is '\u22C5' (dot operator).
  for(i = 0; expr[i] != "\u22C5"; i++){
    first += expr[i];
  }
  var type = "ALL";
  if(first_char == "\u2203")
    type = "SOME";
  
  var second = expr.substring(i+1, expr.length);
  
  var obj = {type:type,
		    first:first,
		    second:parse(second)
		    };
  return obj;
}

//Parse not expression from start of string
function parseNot(expr){
  var obj = {type:'NOT',
	  first:parse(expr),
	  second:null
	  };
  return obj;
}


//expression parsing
function parseExpr(expr){
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
      name = "AND";
      break;
    case '\u2228':
      name = "OR";
      break;
    case '=':
      name = "EQUALS";
      break;
    case '!=':
      name = "NOT_EQUAL";
      break;
    case '>':
      name = "GREATER_THAN";
      break;
    case '>':
      name = "LESS_THAN";
      break;
    case '<=':
      name = "GTE";
      break;
    case '>=':
      name = "LTE";
      break;
    case '\u2192':
      name = "IMPLIES";
      break;
    case '\u2295':
      name = "XOR";
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
	type:'CONST',
	val: val
      }
      return obj;
    }
    else {
      var val  = parseInt(expr);
      var obj = {
	type:'CONST',
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
	type:'VAR_ACCESS',
	val:split[0],
	field:split[1]
    }
  else{
    obj = {
	type:'VAR_ACCESS',
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

