//contains all of the objects that will be drawn onto the screen - Will eventually be parsed from JSON
var objects = [
{object: 'circle', colour: 'blue', x: '10', y: '10'},
{object: 'square', colour: 'yellow', x: '50', y: '50'},
{object: 'triangle', colour: 'blue', x: '75', y: '75'}
];


  for(var i =0; i<objects.length; i++){
    var obj = objects[i];
    console.log(obj.object); //Debugging
    
    drawObject(obj.object, obj.colour, obj.x, obj.y); //type checking for colour & object is done in drawObject, the coordinates are assumed to be correct, however. 
    
    
  };







function drawObject(inputObject, inputColour, inputX, inputY){
 
  var ignoreCaseObject = inputObject.toUpperCase(); //Converting to upper case in order to allow case insensitivity (If users can create JSON files, being explicit with case is not ideal)
  

 if(ignoreCaseObject == "SQUARE"){
 var square = new Rect(inputX, inputY, 100, 100);
   square.addTo(stage);
   try{
   drawImage('Pear2.jpg', inputX, inputY);
   }
   catch(err){
     throw "The colour of the square was invalid";
   }   
}

if(ignoreCaseObject == "CIRCLE"){
//var circle = new Circle(inputX,inputY,100);
  
  
}

if(ignoreCaseObject == "TRIANGLE"){
	var triangle = new Polygon(inputX,inputY,150,3);
   try{
   //triangle.fill(colour);   
   }	
   catch(err){
   throw "The colour of the triangle was invalid"   
   }
	
	triangle.addTo(stage);
	
}


//creates a bitmap from an image that may not be a bitmap from the start - Bonsai requires a picture to be a bitmap to draw onto the svg canvas. The bitmap is then drawn at x,y on the screen
function drawImage(inputPath, xIn, yIn){
  
  new Bitmap(inputPath, function(err) {
  if (err) return;
  this.attr({
    y: yIn,
    x: xIn
  });
  stage.addChild(this);
 
});
 
   
  
}
  
}