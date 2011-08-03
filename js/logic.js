// global useful functions

	/* setup event listener to fire JS when device is ready */
	
	
    var onDeviceReady = function(){
    	alert("FDSAFDS");
        if (connectionCheck()){
        	msg("Online!");
        }else{
        	msg("Offline :(");
        }
    }

    
    document.addEventListener("deviceready", onDeviceReady, false);
/*
 * Test the current device online connection
 * returns true if internet access is available, false otherwise
 */
function connectionCheck(){
	var networkState = navigator.network.connection.type;
	if ((networkState == Connection.UNKNOWN)||(networkState == Connection.NONE)){
		return false;
	}else{
		return true;
	}
}

/*
 * Shortcut function to display native message
 */
function msg(msg){
	navigator.notification.alert(msg);
}