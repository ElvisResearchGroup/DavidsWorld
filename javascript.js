

document.getElementById("loading").innerHTML = "loading bar should go here";

function add(ex){
	//create a new element
	var word = document.getElementById('textbox1').value;
	var element = document.createElement("input");

	//Create Labels
	var label = document.createElement("Label");
	label.innerHTML = "New Label";     

	//Assign different attributes to the element.
	element.setAttribute("type", "text");
	element.setAttribute("value", word);
	element.setAttribute("name", "Test Name");
	element.setAttribute("style", "width:200px");

	label.setAttribute("style", "font-weight:normal");

	var lineBreak = document.createElement("br");

	// 'foobar' is the div id, where new fields are to be added
	var foo = document.getElementById("foobar");

	//Append the element in page (in span).
	foo.appendChild(label);
	foo.appendChild(element);
	foo.appendChild(lineBreak);
}

