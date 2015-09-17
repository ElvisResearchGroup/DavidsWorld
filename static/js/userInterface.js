
var exprIdArray = [];//holds ids of expression divs
var count = 0; //used to count expression divs
var pressedGo = false;
var expArray = [];

/**
 * on click on add expression button, adds the written expression to list of expressions
 */
function add(ex){
	//create a new element
	var word = document.getElementById('txtExpr').value;
	//var element = document.createElement("input");

	//Create Labels
	var expressionDiv = document.createElement("div");
	var resultDiv = document.createElement("div");  
	var deleteDiv = document.createElement("div");
	expressionDiv.id = count++;
	expressionDiv.innerHTML = "<p onclick='update(" + expressionDiv.id + ")'> "+word+" &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp</p>";
	resultDiv.innerHTML = ' ';
	
	resultDiv.id = expressionDiv.id.toString() + 'b';
	deleteDiv.id = expressionDiv.id.toString() + 'c'; //MIGHT NOT WORK
	deleteDiv.innerHTML = "<p onclick='deleteExp(" + expressionDiv.id + ")'>X</p>"; //MIGHT NOT WORK
	exprIdArray.push(expressionDiv.id);



	//add styling to expression div
	expressionDiv.style.fontWeight = "normal";
	expressionDiv.style.fontFamily = "Arial, Helvetica, sans-serif";
	expressionDiv.style.padding = "0.5%";
	expressionDiv.style.margin =  "0.5%";
	expressionDiv.style.background = "#0390B2";
	expressionDiv.style.color= "#FFFFFF";
	expressionDiv.style.width = "100%";
	expressionDiv.style.fontSize = "large";

	resultDiv.style.width = "18%";
	resultDiv.style.background = "#0390B2";
	resultDiv.style.color= "#FFFFFF";

	deleteDiv.style.width = "40px";
	deleteDiv.style.background = "#0390B2";
	deleteDiv.style.color= "#FFFFFF";
	deleteDiv.style.fontSize = "large";

	var lineBreak = document.createElement("br");
	lineBreak.id = expressionDiv.id.toString() + 'd';
	console.log(lineBreak.id);

	// 'output' is the div id, where new fields are to be added
	var output = document.getElementById("outputDiv");
	//foo.style.display = "table-row";
	expressionDiv.style.display = "table-cell";
	resultDiv.style.display = "table-cell";
	deleteDiv.style.display = "table-cell";

	//Append the element in page
	console.log(document.getElementById('txtExpr').value);
	if(document.getElementById('txtExpr').value!="Input expression" && document.getElementById('txtExpr').value.length>0){
	output.appendChild(expressionDiv);
	output.appendChild(resultDiv);
	output.appendChild(deleteDiv);
	output.appendChild(lineBreak);
	}

}

function deleteExp(divId){ //MIGHT NOT WORK
	var expressionDiv = document.getElementById(divId);
	expressionDiv.parentNode.removeChild(expressionDiv);
	var resultDiv = document.getElementById(divId+'b');
	resultDiv.parentNode.removeChild(resultDiv);
	var deleteDiv = document.getElementById(divId+'c');
	deleteDiv.parentNode.removeChild(deleteDiv);
	var lineBreak = document.getElementById(divId+'d');
	lineBreak.parentNode.removeChild(lineBreak);
	var index = -1;
	for (i = 0; i < exprIdArray.length; i++) {
		if (exprIdArray[i] == divId) index = i;
	}
	if (index > -1){
		exprIdArray.splice(index, 1);
	}
}

/**
 * when user clicks go button - evaluates expressions that have been added
 */

function go(){
	pressedGo = true;
	worldstage.sendMessage('getworldforeval')
}

function setupListeners(){
	worldstage.on('message:evalworld', function(data){
		console.log('data '+data)
		world = data;
		console.log(exprIdArray + " set up phase");
		for (var i = 0; i < exprIdArray.length; i++){
			var id = exprIdArray[i];
			console.log('id' +id);
			var expressionDiv = $('#' + id + ' p');


			var expr = expressionDiv.text();

			console.log('expression', expr);

			var parsedTree = parseExpr(expr);

			console.log('tree', parsedTree);

			var eval = evaluate(parsedTree, {Colour: getColours()});

			console.log('eval', eval);
			console.log('world', world);
			var resultDiv = document.getElementById(id+'b');
			resultDiv.style.fontSize = "large";

			if(eval){
			resultDiv.innerHTML = "<p>true</p>";
			resultDiv.style.background = "#009933";
			resultDiv.style.paddingLeft = "10px";
			resultDiv.style.paddingRight = "10px";

			}
			else {
				resultDiv.innerHTML = "<p>false</p>";
				resultDiv.style.background = "#FF5C5C";
				resultDiv.style.paddingLeft = "7px";
				resultDiv.style.paddingRight = "7px";
			}	
			
		}

	});
	
	$('#addObj').click(function(){
		var name = "";
		if($('#objNamer').val() != "Object Name"){
			console.log("test2");
			var temp = {type: $('#objList').val(), name: $('#objNamer').val(), colour: $('#colourList').val()};
			worldstage.sendMessage('addobject', temp);
		}
		else{
	  		worldstage.sendMessage('addobject', {type: $('#objList').val(), width:50, height: 50, colour: $('#colourList').val()});
	  	}
	});

	$('#txtExpr').keypress(function(){
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

		if (field.val() != text){
			field.val(text);

			if (length != text.length){
				var diff = length-text.length;
		        field[0].selectionStart = startPos-diff;
		        field[0].selectionEnd = startPos-diff;
		        field[0].scrollTop = scrollTop;
		    }
    	}
	});

	$('body').on('change', '#liblist', function(){
		var library_name = $('#liblist').val();
		$.getJSON("lib/" + library_name + "/" + library_name + "_lib.json", function(data){
			setLibrary(data.library);
			
			worldstage.sendMessage('clearworld');

			populateObjectSelect(data);			
		});
	});

	$('#sizeInc').click(function(){
	  console.log("test")
	  worldstage.sendMessage('changeSize', 1);
	});

	$('#sizeDec').click(function(){
	  worldstage.sendMessage('changeSize', -1);
	});

	 $('#txtExpr').keydown(function(event) {
        if (event.keyCode == 13) {
            $('#addExpr').click();
            event.preventDefault();
         }
    });

}

function replaceString(regex, string, replacement){
	var changed = string.replace(regex, replacement);
	while (changed != string){
		string = changed;
		changed = string.replace(regex, replacement);
	}
	return changed;
}

function button(operator){
	//insert operator into expression box
	var currentExp = document.getElementById('txtExpr').value;
	console.log(currentExp);

	var symbol = getSymbol(operator);

	if(currentExp == "Input expression" || symbol == ""){
		document.getElementById('txtExpr').value = symbol;
	}
	else{
		insertAtCaret(document.getElementById('txtExpr'), symbol);
	}
}

function getSymbol(operator){
	var symbol = "";
	switch(operator){
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

function populateObjectSelect(data){
	//What does this do??
	var list = $('#objList');
	list.empty();
  	console.log("Populate", data);
  	data.library.forEach(function(e){
   		console.log(e);
   		list.append($('<option/>', {value: e.type}).text(e.type));
	});
}

function populateColourSelect(){
  var colours = getColours();
  var elem = $('#colourList');
  Object.keys(colours).forEach(function (c){
    elem.append($('<option/>', {value: c}).text(c));
  });
  
}

/**
 * Adds objects from the user interface to the world
 */
function addObjectFromUI(){
	  var obj_index = document.getElementById('objList').selectedIndex;
	  var default_x = 5, default_y = 5;
	  var width = 50, height = 50;
	  addObject(obj_index, default_x, default_y, width, height);  
}

/**
 * Loads file
 */

function fileLoader(){
 var fileSelect = document.getElementById('fileSelect'),
  fileElem = document.getElementById('files');
 fileSelect.addEventListener("click", function(e){
   if(fileElem){
     fileElem.click();
   }
   e.preventDefault();
 }, false);
}

function update(id){
	var expr = document.getElementById(id).innerText;
	console.log("expr = " + expr);
	console.log("id = " + id);
	var textbox = document.getElementById('txtExpr');
	textbox.value = expr;
}

document.getElementById('txtExpr').onkeypress=function(e){
    if(e.keyCode==13){
        document.getElementById('addExpr').click();
    }
}

