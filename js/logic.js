// global useful functions

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