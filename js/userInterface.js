
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
	var foo = document.getElementById("foobar");
	//foo.style.display = "table-row";
	expressionDiv.style.display = "table-cell";
	resultDiv.style.display = "table-cell";

	//Append the element in page
	foo.appendChild(expressionDiv);
	foo.appendChild(resultDiv);
	foo.appendChild(lineBreak);

}

function go(){
	for (id in expArray){
		console.log(id);
		var expressionDiv = document.getElementById(id);


		var expr = expressionDiv.innerHTML.toString();

		console.log(expr.toString());

		var parsedTree = parse(expr.toString());

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
			document.getElementById('textbox1').value = '.';
		}
		else{
			document.getElementById('textbox1').value = currentExp + '.';
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
