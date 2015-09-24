//Main function for local load - is triggered by event listener on file load
function handleFileLoad(event){
  var files = event.target.files; //List of files loaded 
  for(var i=0, f; f = files[i]; i++){
    var reader= new FileReader();
    reader.addEventListener('loadend', function() {
      
      //File is valid json, push the parsed object structures to gitems and call load on them
      if(validateJSON(reader.result) == true){
			console.log("JSON is Valid syntax - Loading file");
        loadLocal(JSON.parse(reader.result));
      }
    });
    reader.readAsText(f);
  }
  console.log("hi");
  
}


//Function that checks whether the browser is capable of HTML5 local storage - Returns true if it is, or false if it isn't
function supportsLocalStorage()
{
      try
      {
        return 'localStorage' in window && window['localStorage'] !== null;
      }
      catch (e)
      {
        return false; //Browser does not support local storage
      }
}

//Local Save - Handled with HTML5 - 
function saveLocal(){
  if(supportsLocalStorage == true){
    
 //TODO?? 
    
  }
  else{
    //Browser does not support HTML5 Localstorage. Either: Throw an error or deal with save/load in a different way (Not supported yet)
    console.log("Browser does not support HTML5 Local Storage - Please update your browser to the latest version and try again");
    return false;
    
  }
  
  
  
  
  
}



//Local Load - is called by handleFileLoad
function loadLocal(json){
  var library_name = json.library_name.toLowerCase();
	$('#liblist').val(library_name);
		$.getJSON("lib/" + library_name + "/" + library_name + "_lib.json", function(data){
			worldstage.sendMessage('setlibrary', data);

			populateObjectSelect(data);	
			 worldstage.sendMessage('generateWorld', json);		
		});
}


//Returns true if file is valid JSON syntax, or false if not
function validateJSON(file) {
  try {
   var data = JSON.parse(file);
    return true; //Is valid JSON so return true
  } catch(e) {
    
    return false; //Failed to parse - I.e is not JSON or is not valid JSON
  }
}

