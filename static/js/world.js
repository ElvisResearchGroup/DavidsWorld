

//----------------------------------------------------
//Global Variables
//----------------------------------------------------
var DEFAULT_X = 10, DEFAULT_Y = 10;
var bg_colour;
var library;
var stage_obj_types = [];
var stage_obj_map = [];
var grid_lines = [[],[]];
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

//block dealing with loading from JSON
function buildWorld(){
    console.log("building world...");
    console.log(library);
    if(library.grid_width != undefined && library.grid_height != undefined)
        drawGrid(library.grid_width, library.grid_height);
    if(!library.bg_colour){
    	console.log(library.background);
	stage.setBackgroundColor(getColour(library.background));
    }
      
}

/**
 * Takes a message from outside process scope and handles it
 * @param {message} message to be handled
 * 
 */
function handleMessage(message) {
    console.log('message', message);
    if (message === 'getworldforeval'){
        stage.sendMessage('evalworld', getWorld());
    } 
    else if(message === 'clearworld'){
      console.log("TIME TO CLEAN UP");
      clearWorld();
      buildWorld();
    }
    else if(message === 'buildworld'){
      buildWorld();
    }

}

stage.on('message:generateWorld', function(data){
  generateWorldFromFile(data);
});

stage.on('message:setlibrary', function(data){
    setLibrary(data);
});


stage.on('message:addobject', function(data){
  addObject(data.type, {x: data.x, y: data.y, width: data.width, height: data.height, def_col: data.colour});
});

stage.on('message:changeSize', function(data){
  var scale = (data == 1) ? 1.4 : (1/1.4); 
  
  console.log(Object.getOwnPropertyNames(selected_object));
  selected_object.animate(10, {
      radius: selected_object._attributes.radius*scale,
      width: selected_object._attributes.width*scale,
      height: selected_object._attributes.height*scale
  });
});

//----------------------------------------------------
//Getters and Setters
//----------------------------------------------------
function getSelectedObject(){
  return selected_object;
}

function setLibrary(lib){
    library = lib;
}




/**
 * Deals with creating the world object, and then returns it.
 */
function getWorld(){
    var world = [];
    var item;
    
    for(var i = 0; i < stage_obj_map.length; i++){

      	item = new Object();
      	item.x = stage_obj_map[i]._attributes.x;
      	item.y = stage_obj_map[i]._attributes.y;

	if(grid_lines[0].length > 0){
	    var obj = getGridCoord(stage_obj_map[i]);
	    item.x = obj.x;
	    item.y = obj.y;
	}
	else{
	    item.x = stage_obj_map[i]._attributes.x;
	    item.y = stage_obj_map[i]._attributes.y;
	}

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

function getColour(col){
	if (!col) return Colour['white'];
  	if(Colour[col.toString().toLowerCase()]){
		col = Colour[col.toString().toLowerCase()];
  	}
  	return col;
}

function getColours(){
    return colour;
}

//----------------------------------------------------
//World Handling
//----------------------------------------------------

function clearWorld(){
    stage_obj_map.forEach(function(entry){
	stage.removeChild(entry);
    });
    
    for(var i = 0; i < 2; i++){
      for(var j = 0; j < grid_lines[i].length; j++){
	stage.removeChild(grid_lines[i][j]);
      }
    }
    grid_lines = [[],[]];
    stage_obj_map = [];
    stage_obj_types = [];
    
    console.log('cleared grid',grid_lines);
    
}

/**
 * Finds coordinates of object on grid, assuming grid exists.
 * @param {bonsai_obj} Bonsai object to find coordinates for
 */
function getGridCoord(bonsai_obj){
    var x, y;
    
    for(y = 0; y < grid_lines[0].length; y++){
	var temp = grid_lines[0][y]._segments[0][1];
	if(temp > bonsai_obj._attributes.y){
	  break;
	}
    }
    
    for(x = 0; x < grid_lines[1].length;x++){
	var temp = grid_lines[1][x]._segments[1][2];
	if(temp > bonsai_obj._attributes.x){
	  break;
	}
    }
    return {x: x, y: y};
}

//THIS METHOD NEEDS TO BE CALLED ON RECEPTION OF MESSAGE TO WORKER THREAD rather than directly from saveload.js in order to get scope of bonsai
//gets passed a tree structure from saveload - TODO: Make sure library is loaded before user uploads world - will want to add check from library name of world load to library name on server
function generateWorldFromFile(worldJSON){

  clearWorld();
  buildWorld();
  var worldObjects = [];
  var obj_list = []; //List of objects to draw to screen
  var ind_list = []; //List of indexes mapped to same position as obj_list
  //Make sure to Change background colour
  for(var i = 0; i< worldJSON.world.length; i++){
  worldObjects.push(worldJSON.world[i]);//populate each loaded object into buffer - Can be set as the main world buffer at the end of this function to keep concurrent with evaluator
  var obj = worldObjects[i];
  var lib_index = null;
  for(var index = 0; index < library.library.length;index++){
    if(library.library[index].type == obj.type){
    		var keys = Object.keys(library.library[index]).forEach(function(key){
	  	  if(Object.keys(obj).indexOf(key) >= 0 && obj[key] != undefined){
	 	   }
	 	   else
			obj[key] = library.library[index][key];
		});
      lib_index = index;
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

    for(var i = 0; i < library.library.length; i++){
	//If we find the correct object to create from.
      if(library.library[i].type == obj_type){
	var keys = Object.keys(library.library[i]).forEach(function(key){
	    if(data != null && Object.keys(data).indexOf(key) >= 0 && data[key] != undefined){
		lib_obj[key] = data[key];
	    }
	    else
		lib_obj[key] = library.library[i][key];
	});

      }
    }
    lib_obj["x"] = DEFAULT_X;
    lib_obj["y"] = DEFAULT_Y; 
    createBonsaiShape(lib_obj);
}


/**
 * Figures out what type of bonsai object the structure will become
 * @param {obj} Object passed from json tree structure - contains an image path for this function to deal with ELSE it is a polygon/other defined shape
 */
function createBonsaiShape(obj){
  var bonsaiObj;
  
    
  if(obj.image_path == undefined)
      bonsaiObj = bonsaiPoly(obj);
  else
      bonsaiObj = bonsaiImage(obj);//TODO!!!!
      
  var x_offset = 0, y_offset = 0;
  //If it is an image or a square
  //Create an offset.
  //This is because thier coords are in the top left of the object, and not the centre.
  if(obj.image_path != undefined || obj.poly == 4){
      
      x_offset = obj.width/2;
      y_offset = obj.height/2;
      console.log('Creating Offset', x_offset, y_offset);
  }
      
  bonsaiObj.on('multi:pointerdown', function(e){
        x = this.attr('x'); 
        y = this.attr('y');
        this.addTo(this.parent); 
      })
      .on('multi:drag', function(e){
        this.attr({
          x: objMove(x, 1, e.diffX),
          y: objMove(y, 2, e.diffY)
        });
      })
      .on('multi:pointerup', function(e){
	this.attr({
	  x: gridSnap(x, 1, this, e.diffX, this._attributes.width/2),
	  y: gridSnap(y, 2, this, e.diffY, this._attributes.height/2)
	});
      })
      .on("pointerdown", function(e){
      if(!(selected_object === undefined) && selected_object.stroke !== undefined)
        selected_object.stroke("#FFF", 2);
	selected_object = this;
    }); 
      
  stage_obj_types.push(obj.type);
  console.log(stage_obj_types);
  stage_obj_map.push(bonsaiObj);
     
}



/**
 * Deals with creating a bonsai object from an image
 * @param {obj} Object passed from json tree structure - contains an image path for this function to deal with
 */
function bonsaiImage(obj){
  console.log('exception', library, obj.image_path);
  return new Bitmap(obj.image_path, function(err) {
    if (err){
      console.log(err);
      return;
    }
    this.attr({
      y: obj.y,
      x: obj.x,
      width: obj.width,
      height: obj.height
    });
      
    console.log(obj);
    stage.addChild(this);
  });
}


/**
 * Deals with creating a bonsai object that is not from an image
 * @param {obj} Object passed from json tree structure - contains information pertinent to which shape it will draw
 */
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
  
  var colour = getColour(obj.def_col);
  console.log(colour);
  
  myPoly.fill(colour)
  .stroke('#000', 2);
  
  return myPoly;
}

//i = 1, for x.
//i = 2, for y.
function objMove(x, i, diff){
  var new_co = x + diff;
  //If there is a grid.
  if(grid_lines[i%2].length > 0){  
    
    //Minimum value inside the grid.
    var min = grid_lines[i%2][0]._segments[0][2];
    //Maximum value inside the grid.
    var max = grid_lines[i%2][grid_lines[i%2].length - 1]._segments[1][1];
    return Math.max(min, Math.min(new_co, max));

  }else{
    //If there is not a grid, just return the changed value.
    return new_co;
  }
}

function gridSnap(coord, i, obj, diff, offset){
  //If there is a grid
  if(grid_lines[i%2].length > 0){
      var grid_location = getGridCoord(obj);
      if(i == 1) 
	grid_location = grid_location.x;
      else
	grid_location = grid_location.y;
      
      //If it is outside the grid
      if(grid_location == 0 || grid_location == grid_lines[i%2].length){
	console.log('why am I here?');
      }
      else{
	//The Line before the object
	var first_line = grid_lines[i%2][grid_location-1]._segments[2-i][3-i];
	//Line after the object
	var second_line = grid_lines[i%2][grid_location]._segments[2-i][3-i];
	//Return the mid point of the two lines.
	return (first_line+second_line)/2 - offset;
      }
      
  }
  //If there is no grid, dont snap to grid.
  else{
    return coord + diff;
  }
}

function getValue(obj, key){ //What value is this referring to?
  var index = obj.field_key.indexOf(key);
  if(index < 0)
    return null;
  return obj.field_vals[index];
}

/**
 * Draws grid on the screen - this function is called on load if a grid is defined in a library or saved world.
 */
function drawGrid(x, y){ 
  var cell_width = stage.width/x;
  var cell_height = stage.height/y;

  //vertical
 for(var i=0; i<=y;i++){
   grid_lines[0][i] = new Path()
   .moveTo(i*cell_height,0)
   .lineTo(i*cell_height,stage.height)//Height
   .stroke('#000', 1)
   .addTo(stage);   
 }
 //horizontal 
   for(var i=0; i <= x;i++){
   grid_lines[1][i] = new Path()
   .moveTo(0,i*cell_width)
   .lineTo(stage.width,i*cell_width)//width
   .stroke('#000', 1)
   .addTo(stage);   
 }
  
}