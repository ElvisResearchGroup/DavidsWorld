/*$.getScript("parser.js", function(){

   alert("Script loaded but not necessarily executed.");

});

$.getScript("evaluation.js", function(){

   alert("Script loaded but not necessarily executed.");

});
*/




document.getElementById("loading").innerHTML = "loading bar should go here";

var expArray = [];
var count = 0;

function add(ex){
	//create a new element
	var word = document.getElementById('textbox1').value;
	var element = document.createElement("input");

	//Create Labels
	var label = document.createElement("Label");
	var div = document.createElement("div");
	label.innerHTML = word;     
	div.innerHTML = word;
	div.id = count++;
	expArray.push(div.id);

	//Assign different attributes to the element.
	element.setAttribute("type", "text");
	element.setAttribute("value", word);
	element.setAttribute("name", "Test Name");
	element.setAttribute("style", "width:200px");

	/*div.setAttribute("style", "font-weight:normal");
	div.setAttribute("style", "font-family:Arial, Helvetica, sans-serif");
	div.setAttribute("style", "padding:2%");
	div.setAttribute("style", "margin: 5%");
	div.setAttribute("style", "background-color: #0390B2");
	div.setAttribute("style", "color: #0390B2");
	div.setAttribute("style", "border-style: solid");*/


	div.style.fontWeight = "normal";
	div.style.fontFamily = "Arial, Helvetica, sans-serif";
	div.style.padding = "0.5%";
	div.style.margin =  "0.5%";
	div.style.background = "#0390B2";
	div.style.color= "#FFFFFF";


	var lineBreak = document.createElement("br");

	// 'foobar' is the div id, where new fields are to be added
	var foo = document.getElementById("foobar");

	//Append the element in page
	foo.appendChild(div);
	//expArray.push(div);
	//foo.appendChild(element);
	//foo.appendChild(lineBreak);
}

function go(){
	for (id in expArray){
		console.log(id);
		var div = document.getElementById(id);

		console.log(div.innerHTML.toString());

		var parsedTree = parse(div.innerHTML);

		var eval = evaluate(parsedTree, [{
				p:{x: 1, y: 2}}
			]);
		console.log(eval, parsedTree);
		if(eval){
			div.innerHTML = div.innerHTML + " true";
		}
		else {
			div.innerHTML = div.innerHTML + " false";
		}	
		
	}
}
