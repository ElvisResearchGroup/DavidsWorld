

//----------------------------------------------------
//Global Variables
//----------------------------------------------------
var library_name;
var DEFAULT_X = 10, DEFAULT_Y = 10;
var bg_colour;
var library;
var stage_obj_types = [];
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


//----------------------------------------------------
//Messsage Handling
//----------------------------------------------------
stage.on('message', handleMessage);

function handleMessage(message) {
    console.log('message', message);
    if (message === 'getworldforeval'){
        //TODO process world to be what is expected.
        stage.sendMessage('evalworld', getWorld());
    }    

}

stage.on('message:generateWorld', function(data){
  generateWorldFromFile(data);
});


stage.on('message:addobject', function(data){
  addObject(data.type, {x: data.x, y: data.y, width: data.width, height: data.height, def_col: data.colour});
});

stage.on('message:changeSize', function(data){
  console.log("tests2", data, selected_object);
  var scale = (data == 1) ? 1.4 : (1/1.4); 
  
  console.log(Object.getOwnPropertyNames(selected_object));
  selected_object.animate(10, {
      radius: selected_object._attributes.radius*scale
  });
});

//----------------------------------------------------
//Getters and Setters
//----------------------------------------------------
function getSelectedObject(){
  return selected_object;
}

function getColours(){
 return Colour; 
}

function setLibrary(lib){
    library = lib;
}

//----------------------------------------------------
//World Generation
//----------------------------------------------------

function getWorld(){
    var world = [];
    var item;
    
    for(var i = 0; i < stage_obj_map.length; i++){
      	item = new Object();
      	item.x = stage_obj_map[i]._attributes.x;
      	item.y = stage_obj_map[i]._attributes.y;
      	item.colour = stage_obj_map[i]._attributes.fillColor;
      	item.type = stage_obj_types[i];
	item.size = stage_obj_map[i]._attributes.radius*2;
        if(!item.size){
          item.size = Math.max(stage_obj_map[i]._attributes.width, stage_obj_map[i]._attributes.height);
        }
        /**else if(!item.size){
	    item.size = stage_obj_map[i]._attribute.radius;
	}*/
        else if(item.width !== undefined && item.height !== undefined){
          item.height = stage_obj_map[i]._attributes.height;
          item.width = stage_obj_map[i]._attributes.width; 
        }
        //Add the object
	world.push(item);
    }
    console.log("World", world);
    return world;
}

//THIS METHOD NEEDS TO BE CALLED ON RECEPTION OF MESSAGE TO WORKER THREAD rather than directly from saveload.js in order to get scope of bonsai
//gets passed a tree structure from saveload - TODO: Make sure library is loaded before user uploads world - will want to add check from library name of world load to library name on server
function generateWorldFromFile(worldTree){

  stage_obj_map.forEach(function(entry){
	
	stage.removeChild(entry);
	});

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
 
  createBonsaiShape(obj_list[i]);
  }
  }
    
}  

//----------------------------------------------------
//Object Handling
//----------------------------------------------------
//Passing null for x->height will make it use the default values.
function addObject(obj_type, data){
    var lib_obj = new Object();

    //Cloning the object from the library.

    for(var i = 0; i < library.length; i++){
	//If we find the correct object to create from.
      if(library[i].type == obj_type){
	var keys = Object.keys(library[i]).forEach(function(key){
	    if(data != null && Object.keys(data).indexOf(key) >= 0 && data[key] != undefined){
		lib_obj[key] = data[key];
	    }
	    else
		lib_obj[key] = library[i][key];
	});
	//lib_obj = Object.clone(library[i].prototype);

      }
    }
    lib_obj["x"] = DEFAULT_X;
    lib_obj["y"] = DEFAULT_Y; 
    createBonsaiShape(lib_obj);
}

function createBonsaiShape(obj){
  var bonsaiObj;
  console.log("obj test",obj)
  
  if(obj.poly >= 0)
      bonsaiObj = bonsaiPoly(obj);
  else
      bonsaiObj = bonsaiImage(obj);//TODO!!!!
      
  stage_obj_types.push(obj.type);
  console.log(stage_obj_types);
  stage_obj_map.push(bonsaiObj);
     
}

function bonsaiImage(obj){
	//TODO!!!
}

function bonsaiPoly(obj){ //What does this method do?
  var sides = obj.poly;
  var myPoly;
  if(sides <= 2){
    //We assume that the circle has a radius, and do not account for the case where the lib specifies size instead.
    myPoly = new Circle(obj.x, obj.y, obj.radius);
  }else if(sides == 4){
    //We handle an edge case for rectangles, as the Polygon method would create a diamond shape.
    myPoly = new Rect(DEFAULT_X, DEFAULT_Y, obj.width, obj.height);
  }else{
    //We make the inverse assumtion to the Circle.
    myPoly = new Polygon(DEFAULT_X,DEFAULT_Y,obj.size,obj.poly);
  }
	  
  myPoly.addTo(stage);
  var colour = obj.def_col;
  if(Object.getOwnPropertyNames(Colour).indexOf(colour.toString().toLowerCase()) > -1){
	colour = Colour[colour.toLowerCase()];
  }
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
	y: y + e.diffY
      });
   })
  .on("pointerdown", function(e){
    if(!(selected_object === undefined))
      selected_object.stroke("#000", 2);
    this.stroke("#FFF", 2);
    selected_object = this;
    
  }); 
  
  return myPoly;
}

/**function moveObj(obj, x, y){
    var index = world.indexOf(obj);
    stage_obj_map[index].moveBy(x,y);
}*/

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
  
