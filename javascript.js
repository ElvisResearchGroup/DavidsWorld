
//document.getElementById('loading').innerHTML = "loading bar should go here";

var expArray = [];
var count = 0;

function add(ex){
	//create a new element
	var word = document.getElementById('textbox1').value;
	var element = document.createElement("input");

	//Create Labels
	var label = document.createElement("Label");
	var div = document.createElement("div");
	var div2 = document.createElement("div");
	label.innerHTML = word;     
	div.innerHTML = word;
	div2.innerHTML = ' - ';
	div.id = count++;
	div2.id = div.id.toString() + 'b';
	expArray.push(div.id);

	div.style.fontWeight = "normal";
	div.style.fontFamily = "Arial, Helvetica, sans-serif";
	div.style.padding = "0.5%";
	div.style.margin =  "0.5%";
	div.style.background = "#0390B2";
	div.style.color= "#FFFFFF";
	div.style.width = "100%";
	//div.setAttribute("style", "align:float-left");

	//div2.style.align = "right";
	div2.style.width = "18%";
	div2.style.background = "#0390B2";
	div2.style.color= "#FFFFFF";
	//div2.setAttribute("style", "align:float-right");

	var lineBreak = document.createElement("br");

	// 'foobar' is the div id, where new fields are to be added
	var foo = document.getElementById("foobar");
	//foo.style.display = "table-row";
	div.style.display = "table-cell";
	div2.style.display = "table-cell";

	//Append the element in page
	foo.appendChild(div);
	foo.appendChild(div2);
	foo.appendChild(lineBreak);

}

function go(){
	for (id in expArray){
		console.log(id);
		var div = document.getElementById(id);


		var expr = div.innerHTML.toString();

		console.log(expr.toString());

		var parsedTree = parse(expr.toString());

		console.log(parsedTree);

		var eval = evaluate(parsedTree, 
				{p:{x: 1, y: 2}}
			);

		console.log(eval, parsedTree);
		if(eval){
			var div2 = document.getElementById(div.id.toString()+'b');
			div2.innerHTML = "true";
			div2.style.color = "green";
		}
		else {
			var div2 = document.getElementById(div.id.toString()+'b');
			div2.innerHTML = " false";
			div2.style.color = "red";
		}	
		
	}
}

function button(operator){
	//insert operator into expression box
	var currentExp = document.getElementById('textbox1').value;
	console.log(currentExp);
	if(operator=='and'){
		if(currentExp="Input expression"){
			document.getElementById('textbox1').value = "\u2227";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2227";
		}
	}
	else if (operator=='or'){
		if(currentExp="Input expression"){
			document.getElementById('textbox1').value = "\u2228";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2228";
		}
	}
	else if (operator =='not'){
		if(currentExp="Input expression"){
			document.getElementById('textbox1').value = "¬";
		}
		else{
			document.getElementById('textbox1').value = currentExp + '¬';
		}
	}
	else if (operator == 'dot'){
		if(currentExp="Input expression"){
			document.getElementById('textbox1').value = '.';
		}
		else{
			document.getElementById('textbox1').value = currentExp + '.';
		}
	}
	else if (operator == 'for all'){
		if(currentExp="Input expression"){
			document.getElementById('textbox1').value = "\u2200";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2200";
		}
	}
	else if (operator == 'there exists'){
		if(currentExp="Input expression"){
			document.getElementById('textbox1').value ="\u2203";
		}
		else{
			document.getElementById('textbox1').value = currentExp + "\u2203";
		}
	}
	else {
		document.getElementById('textbox1').value = currentExp;
	}


}
