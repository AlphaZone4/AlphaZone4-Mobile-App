// global useful functions

/*
 * Test the current device online connection
 * returns true if internet access is available, false otherwise
 */
function connectionCheck(){
	if (typeof(navigator.network)=="undefined") return true;
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

/*
 * debug print function
 */
function print_r(obj){
	alert(print_r_(obj));
}
function print_r_(obj, indent)
{
  var result = "";
  if (indent == null) indent = "";

  for (var property in obj)
  {
    var value = obj[property];
    if (typeof value == 'string')
      value = "'" + value + "'";
    else if (typeof value == 'object')
    {
      if (value instanceof Array)
      {
        // Just let JS convert the Array to a string!
        value = "[ " + value + " ]";
      }
      else
      {
        // Recursive dump
        // (replace " " by "\t" or something else if you prefer)
        var od = DumpObjectIndented(value, indent + "  ");
        // If you like { on the same line as the key
        // value = "{\n" + od + "\n" + indent + "}";
        // If you prefer { and } to be aligned
        value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
      }
    }
    result += indent + "'" + property + "' : " + value + ",\n";
  }
  return result.replace(/,\n$/, "");
}