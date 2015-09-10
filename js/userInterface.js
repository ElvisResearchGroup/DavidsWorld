
var expArray = [];//holds ids of expression divs
var count = 0; //used to count expression divs

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
	expressionDiv.innerHTML = word;
	resultDiv.innerHTML = ' - ';
	expressionDiv.id = count++;
	resultDiv.id = expressionDiv.id.toString() + 'b';
	expArray.push(expressionDiv.id);

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

	var lineBreak = document.createElement("br");

	// 'output' is the div id, where new fields are to be added
	var output = document.getElementById("outputDiv");
	//foo.style.display = "table-row";
	expressionDiv.style.display = "table-cell";
	resultDiv.style.display = "table-cell";

	//Append the element in page
	console.log(document.getElementById('txtExpr').value);
	if(document.getElementById('txtExpr').value!="Input expression" && document.getElementById('txtExpr').value.length>0){
	output.appendChild(expressionDiv);
	output.appendChild(resultDiv);
	output.appendChild(lineBreak);
	}

}

/**
 * when user clicks go button - evaluates expressions that have been added
 */

function go(){
	worldstage.sendMessage('getworldforeval')
}

function setupListeners(){
	worldstage.on('message:evalworld', function(data){
		console.log(data)
		world = data;
		for (id in expArray){
			console.log(id);
			var expressionDiv = $(document.getElementById(id));


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
			resultDiv.innerHTML = "true";
			resultDiv.style.background = "#009933";
			resultDiv.style.paddingLeft = "10px";
			resultDiv.style.paddingRight = "10px";

			}
			else {
				resultDiv.innerHTML = " false";
				resultDiv.style.background = "#FF5C5C";
				resultDiv.style.paddingLeft = "7px";
				resultDiv.style.paddingRight = "7px";
			}	
			
		}

	});
	
	$('#addObj').click(function(){
		var name = "";
		if($('#objNamer').val() != "Object Name"){
			worldstage.sendMessage('addobject', {type: $('#objList').val(), x: 10, y: 10, name: $('#objNamer').val(), colour: $('#colourList').val()});
		}
		else{
	  		worldstage.sendMessage('addobject', {type: $('#objList').val(), x: 200, y: 200, width:50, height: 50, colour: $('#colourList').val()});
	  	}
	});

	$('#sizeInc').click(function(){
	  worldstage.sendMessage('changeSize', 1);
	});

	$('#sizeDec').click(function(){
	  worldstage.sendMessage('changeSize', -1);
	});

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
			symbol = "\u2261";
			break;
		case 'xor':
			symbol = "\u2295";
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
  var list = document.getElementById('objList');
  console.log("Populate", data);
  data.library.forEach(function(e){
    console.log(e);
    var temp = document.createElement('option');
    temp.innerHTML = e.type;
    list.appendChild(temp); 
  }
  );
    
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

