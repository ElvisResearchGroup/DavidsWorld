
var library_name;
var bg_colour;
var library;
var world = [];
var stage_obj_map = [];
var selected_object;
var Colour = {
  red:4280549631,
  green:1355315455,
  blue:8388607,
  orange:4289003775,
  yellow:4294377727,
  purple:3664828159,
  brown:3430359807,
  black:255,
  white:4294967295
};

stage.on('message', handleMessage);

//block dealing with loading from JSON
function buildWorld(){

	generateRandomWorld(5);
}

function handleMessage(message) {
    console.log('message', message);
    if (message === 'getworldforeval'){
        //TODO process world to be what is expected.
        stage.sendMessage('evalworld', updateWorld());
    }
    

}

stage.on('message:generateWorld', function(data){
generateWorldFromFile(data);
});


stage.on('message:addobject', function(data){
  addObject(data.type, data.x, data.y, data.width, data.height, data.colour);
  
});

function getSelectedObject(){
  return selected_object;
}

function getColours(){
 return Colour; 
}
function setLibrary(lib){
    library = lib;
}
function updateWorld(){
    var updatedWorld = [];
    var item;
    if(stage_obj_map.length != world.length)
	console.log("Something is wrong. Error in world mapping");
    for(var i = 0; i < stage_obj_map.length; i++){
	item = {};
	item.x = stage_obj_map[i]._attributes.x;
	item.y = stage_obj_map[i]._attributes.y;
	item.colour = stage_obj_map[i]._attributes.fillColor;
	item.type = world[i].type;
	updatedWorld.push(item);
	console.log('from world', item);
    }
    
    world = updatedWorld;
    console.log('updated', world);
    
    return updatedWorld;
}

//THIS METHOD NEEDS TO BE CALLED ON RECEPTION OF MESSAGE TO WORKER THREAD rather than directly from saveload.js in order to get scope of bonsai
//gets passed a tree structure from saveload - TODO: Make sure library is loaded before user uploads world - will want to add check from library name of world load to library name on server
function generateWorldFromFile(worldTree){
  console.log("gets to here...");
  //world = [];

  stage_obj_map.forEach(function(entry){
	
	stage.removeChild(entry);
	});
//stage_obj_map = [];
  loadedLibrary = null;
  var worldObjects = [];
  var obj_list = []; //List of objects to draw to screen
  var ind_list = []; //List of indexes mapped to same position as obj_list
   if(loadedLibrary == null){
    loadedLibrary = worldTree[0]; //The library should be the only file in the buffer
    }
  
  //Make sure to Change background colour
  for(var i = 0; i<loadedLibrary.library.length; i++){
  worldObjects[i] = loadedLibrary.library[i];//populate each loaded object into buffer - Can be set as the main world buffer at the end of this function to keep concurrent with evaluator
  console.log(worldObjects[i]);
  var obj = worldObjects[i];
  var lib_index = null;
  for(var index = 0; index < library.length;index++){
    if(library[i].type == obj.type){
      lib_index = i;
    }
  }
  if(lib_index == null){
    alert("Your loaded world has an object not supported in the current library");
    return false;
  }
  
  
  obj_list.push(obj);
  

ind_list.push(lib_index);
  //TODO: nullchecking for above vars
  
  
  
  }
  
  for(var i = 0; i<obj_list.length;i++){
    
  if(obj_list[i] != null && ind_list[i] != null){
 
  console.log("Printed a: " + obj_list[i].type + " " +ind_list[i] + " " + obj_list[i].colour);
  addObject(obj_list[i].type, obj_list[i].x, obj_list[i].y, obj_list[i].width, obj_list[i].height, obj_list[i].colour);
  }
  }
    
}  
  
function generateRandomWorld(size){
  for (var i = 0; i < size; i++)
	{	
	  var type = parseInt(""+(Math.random() * 3));
	  var types = ["Rectangle","Circle","Triangle"]; //TODO change/remove
	  var x = Math.random()*400+100;
	  var y = Math.random()*400+100;
	  var colour_list = Object.keys(Colour);
	  var colour = Colour[colour_list[parseInt(""+Math.random()*colour_list.length)]];
	  addObject(types[type],x,y,50,50, colour);
	}
}

//Passing null for x->height will make it use the default values.
function addObject(obj_type, x, y, width, height, colour){
    console.log("Adding object from inside addObject: " + "Type: " + obj_type + "X : " + x + "Y: " + y + "Wid: " + width + "height: " + height + "colour: " + colour);
    var lib_obj = null;
    var i;
    var lib;
    for(i = 0; i < library.length; i++){
      if(library[i].type == obj_type){
	lib = library[i];
	var lib_obj = {type: lib.type, colour: lib.colour, image: lib.image,
	  x: lib.x, y: lib.y, width: lib.width, height: lib.height, field_key: lib.field_key, field_vals: lib.field_vals};
	break;
      }
    }
    if(lib_obj == null)
      return;
    //Change the objects values based on parameters.
    if(x != undefined)
      lib_obj.x = x;
    if(y != undefined)
      lib_obj.y = y;
    if(width != undefined)
      lib_obj.width = width;
    if(height != undefined)
      lib_obj.height = height;
    if(colour != undefined)
      lib_obj.colour = colour;
    
    console.log('libobj', lib_obj);
    
    var index = world.length;
    world.push(lib_obj);
    stage_obj_map.push(createBonsaiShape(lib_obj));
    
}

function createBonsaiShape(obj){
  if(obj.image == "\\poly")
      return bonsaiPoly(obj);
  else
    return bonsaiImage(obj);//TODO!!!!
}

function bonsaiPoly(obj){ //What does this method do?
  var sides = getValue(obj, "Sides");
  var myPoly,x,y;
  if(sides <= 2){
    myPoly = new Circle(obj.x,obj.y,obj.width/2);
  }else if(sides == 4){
    myPoly = new Rect(obj.x, obj.y, obj.width, obj.height);
  }else{
    myPoly = new Polygon(obj.x,obj.y,obj.width/2,sides);
  }
	  
	console.log(obj.colour)
  myPoly.addTo(stage);
	var colour = obj.colour;
	if(Object.getOwnPropertyNames(Colour).indexOf(colour.toString().toLowerCase()) > -1){
		colour = Colour[colour.toLowerCase()];
	}
	console.log("Final Colour: ", colour);
  myPoly.fill(colour)
  .stroke('#000', 2)
  .on('multi:pointerdown', function(e){
      x = this.attr('x'); 
      y = this.attr('y');
      myPoly.addTo(myPoly.parent); 
    })
  .on('multi:drag', function(e){
    this.attr({
	x: x + e.diffX,
	y: y+ e.diffY
      });
   })
  .on("pointerdown", function(e){
    console.log(selected_object);
    if(!(selected_object === undefined))
      selected_object.stroke("#000", 2);
    this.stroke("#FFF", 2);
    selected_object = this;
    
  }); 
  
  return myPoly;
}

function getValue(obj, key){ //What value is this referring to?
  var index = obj.field_key.indexOf(key);
  if(index < 0)
    return null;
  return obj.field_vals[index];
}

function moveObj(obj, x, y){
    var index = world.indexOf(obj);
    stage_obj_map[index].moveBy(x,y);
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
  
