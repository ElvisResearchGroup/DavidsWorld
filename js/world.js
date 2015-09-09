
var library_name;
var bg_colour;
var library;
var world = [];
var stage_obj_map = [];
var selected_object;

//block dealing with loading from JSON
function buildWorld(){
	generateRandomWorld(0); //This should be removed or modified to always draw a set world
}

function getSelectedObject(){
  return selected_object;
}

function setLibrary(lib){
    library = lib;
}
function getEvalWorld(){
  var scope = [];
    for(var i = 0; i < stage_obj_map.length; i++){
      var attr = stage_obj_map[i]._attributes;
      var obj = {
	type:world[i].type,
	x:attr.x,
	y:attr.y,
	colour:attr.fillColor
      }
      scope[i] = obj;      
    }
    
    return scope;
}

//THIS METHOD NEEDS TO BE CALLED ON RECEPTION OF MESSAGE TO WORKER THREAD rather than directly from saveload.js in order to get scope of bonsai
//gets passed a tree structure from saveload - TODO: Make sure library is loaded before user uploads world - will want to add check from library name of world load to library name on server
function generateWorldFromFile(worldTree){
  console.log("gets to here...");
  loadedLibrary = null;
  var worldObjects = [];
  var obj_list = []; //List of objects to draw to screen
  var ind_list = []; //List of indexes mapped to same position as obj_list
   if(loadedLibrary == null){
    loadedLibrary = worldTree[0]; //The library should be the only file in the buffer
    }
  
  
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
  addObject(ind_list[i], obj_list[i].x, obj_list[i].y, obj_list[i].width, obj_list[i].height, obj_list[i].colour);
  }
  }
    
}  
  














function generateRandomWorld(size){
  for (var i = 0; i < size; i++)
	{	
	  var type = parseInt(""+(Math.random() * 3));
	  var x = Math.random()*400+100;
	  var y = Math.random()*400+100;
	  addObject(type,x,y,50,50, color('white').randomize());
	}
}

//Passing null for x->height will make it use the default values.
function addObject(obj_index, x, y, width, height, colour){
    var lib_obj = library[obj_index];
    //Change the objects values based on parameters.
    if(x != null)
      lib_obj.x = x;
    if(y != null)
      lib_obj.y = y;
    if(width != null)
      lib_obj.width = width;
    if(height != null)
      lib_obj.height = height;
    if(colour != undefined)
      lib_obj.colour = colour;
    
    var index = world.length;
    world[index] = lib_obj;
    stage_obj_map[index] = createBonsaiShape(lib_obj);
    
}

function createBonsaiShape(obj){
  if(obj.image == "\\poly")
      return bonsaiPoly(obj);
  else
    return bonsaiImage(obj);//TODO!!!!
}

function bonsaiPoly(obj){
  var sides = getValue(obj, "Sides");
  var myPoly,x,y;
  if(sides <= 2){
    myPoly = new Circle(obj.x,obj.y,obj.width/2);
  }else if(sides == 4){
    myPoly = new Rect(obj.x, obj.y, obj.width, obj.height);
  }else{
    myPoly = new Polygon(obj.x,obj.y,obj.width/2,sides);
  }
  
  myPoly.addTo(stage);
  myPoly.fill(color(obj.colour))
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

function getValue(obj, key){
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
  
