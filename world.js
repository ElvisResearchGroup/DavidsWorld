//contains all of the objects that will be drawn onto the screen - Will eventually be parsed from JSON
var objects = [
{object: 'circle', colour: 'blue', x: '10', y: '10'},
{object: 'square', colour: 'yellow', x: '50', y: '50'},
{object: 'triangle', colour: 'blue', x: '75', y: '75'}
];
var mainData = {};


loadWorld();





//block dealing with loading from JSON
function loadWorld(){
	console.log("3");
	 $.getJSON("lib/geometry/geometry.json", function(data){ //json path will need to change to be dynamic later
	 	
	    console.log("Data",data);
	    mainData = data;
	    console.log(mainData.library[2]);
       
       for(var i=0; i<mainData.library.length;i++){
       var obj = mainData.library[i];
       console.log(obj.colour);

       
       var sides = obj.field_vals[obj.field_key.indexOf("Sides")];
       //check if object is a square
       if(obj.image == "\\poly" && sides == 4){
       	//Object is a square
       	 console.log("Square - Hi");
          drawSquare();
          
          
          
           }
           
           
       //check if object is a circle
       if(obj.image == "\\poly" && sides == 0){
       	//object is a circle
       	var myCircle = new Circle(obj.x, obj.y, obj.field_vals[obj.field_key.indexOf("Radius")] );//X,y are from the center of the circle, not one of the corners like on the square - Account for this in the JSON
       	myCircle.fill(obj.colour);
       	console.log("Circle - Hi");
       	myCircle.addTo(stage);

       }
       //check if object is a polygon that is NOT a circle or a square
       if(obj.image == "\\poly" && sides != 0 && sides != 4){
       	
       	
       	
       	
      }

    }	    
	    
	    
	    
	  });


//Now deal with parsing the json objects

}



function drawSquare(){
	

var square = new Rect(1,1,1,1); //Error here - for some reason RECT is now throwing an illegal constructor - Steps up to this point and crashes.


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
  
