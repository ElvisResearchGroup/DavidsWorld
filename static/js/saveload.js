worldstage.on('message:saveData', function(data,link){
   saveAsFile(link, data, "File_Name_Goes_Here");
});



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
  
}


//Local Load - is called by handleFileLoad
function loadLocal(json){
  var library_name = json.library_name.toLowerCase();
	$('#liblist').val(library_name);
		$.getJSON("lib/" + library_name + "/" + library_name + "_lib.json", function(data){
			worldstage.sendMessage('setlibrary', data);

			populateObjectSelect(data);
			setExpressionList(json.expressions);
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



//link = button (i.e call saveOutput(this) onclick for download button)
//Content = text to save
//file name = name of file that will be downloaded
function saveAsFile(link, content, filename) {
    var blob = new Blob([content], {type: "text/text"});
    var url  = URL.createObjectURL(blob);

    // update link to new 'url'
    link.download    = filename + ".json";
    link.href        = url;
}

//call this on save file button click
function saveOutput(link){
    console.log("saveOutput clicked");
   worldstage.sendMessage('needWorldJSON',link);
}
