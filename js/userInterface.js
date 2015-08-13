
var expArray = [];
var count = 0;

function add(ex){
	//create a new element
	var word = document.getElementById('textbox1').value;
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

	// 'foobar' is the div id, where new fields are to be added
	var output = document.getElementById("outputDiv");
	//foo.style.display = "table-row";
	expressionDiv.style.display = "table-cell";
	resultDiv.style.display = "table-cell";

	//Append the element in page
	console.log(document.getElementById('textbox1').value);
	if(document.getElementById('textbox1').value!="Input expression" && document.getElementById('textbox1').value.length>0){
	output.appendChild(expressionDiv);
	output.appendChild(resultDiv);
	output.appendChild(lineBreak);
	}

}

function go(){
	for (id in expArray){
		console.log(id);
		var expressionDiv = document.getElementById(id);


		var expr = expressionDiv.innerHTML.toString();

		console.log('expression= ' + expr.toString());

		var parsedTree = parseExpr(expr.toString());

		console.log(parsedTree);

		var eval = evaluate(parsedTree, 
				{p:{x: 1, y: 2}}
			);

		console.log(eval, parsedTree);
		var resultDiv = document.getElementById(expressionDiv.id.toString()+'b');
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
}

function button(operator){
	//insert operator into expression box
	var currentExp = document.getElementById('textbox1').value;
	console.log(currentExp);
	if(operator=='and'){
		if(currentExp=="Input expression"){
			document.getElementById('textbox1').value = "\u2227";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2227";
		}
	}
	else if (operator=='or'){
		if(currentExp=="Input expression"){
			document.getElementById('textbox1').value = "\u2228";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2228";
		}
	}
	else if (operator =='not'){
		if(currentExp=="Input expression"){
			document.getElementById('textbox1').value = "¬";
		}
		else{
			document.getElementById('textbox1').value = currentExp + '¬';
		}
	}
	else if (operator == 'dot'){
		if(currentExp=="Input expression"){
			document.getElementById('textbox1').value = '\u22C5';
		}
		else{
			document.getElementById('textbox1').value = currentExp + '\u22C5';
		}
	}
	else if (operator == 'for all'){
		if(currentExp=="Input expression"){
			document.getElementById('textbox1').value = "\u2200";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2200";
		}
	}
	else if (operator == 'there exists'){
		if(currentExp=="Input expression"){
			document.getElementById('textbox1').value ="\u2203";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2203";
		}
	}
	else if(operator == 'clear'){
		document.getElementById('textbox1').value = "";
	}
	else {
		document.getElementById('textbox1').value = currentExp;
	}


}

function populateObjectSelect(data){
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

function addObjectFromUI(){
	  console.log('test2');
	  var obj_index = document.getElementById('objList').selectedIndex;
	  var default_x = 5, default_y = 5;
	  var width = 50, height = 50;
	  addObject(obj_index, default_x, default_y, width, height);  
}

