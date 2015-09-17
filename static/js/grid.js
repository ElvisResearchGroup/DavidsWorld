


function drawGrid(){ 
  var gridSize = 100;
  var gridSpace = 20;
  //vertical
 for(var i=gridSpace; i<gridSize;i+=gridSpace){
   new Path()
   .moveTo(i,0)
   .lineTo(i,gridSize)//Height
   .stroke('#ccc', 1)
   .addTo(stage);   
 }
 //horizontal 
   for(var i=gridSpace; i<gridSize;i+=gridSpace){
   new Path()
   .moveTo(0,i)
   .lineTo(gridSize,i)//width
   .stroke('#ccc', 1)
   .addTo(stage);   
 }
  
}




//shape.getBoundingBox(shape.getAbsoluteMatrix()) - bounding box