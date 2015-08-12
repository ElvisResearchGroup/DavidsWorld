
//Function that checks whether the browser is capable of HTML5 local storage - Returns true if it is, or false if it isn't
function supportsLocalStorage()
{
      try
      {
        return 'localStorage' in window && window['localStorage'] !== null;
      }
      catch (e)
      {
        return false;
      }
}







//Local Save - Handled with HTML5 - 
function save(){
  if(supportsLocalStorage == true){
    
    
    
    
    
    
  }
  else{
    //Browser does not support HTML5 Localstorage. Either: Throw an error or deal with save/load in a different way (Not supported yet)
    console.log("Browser does not support HTML5 Local Storage - Please update your browser to the latest version and try again");
    return false;
    
  }
  
  
  
  
  
}



//Local Load - Handled with HTML5
function load(){
  
  
  
}

