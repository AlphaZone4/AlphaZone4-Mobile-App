var mydb;
var dbHandles = [];
dbAddHandle = function(f) {
	dbHandles.push(f);
}
dbErrorHandler = function(transaction, error) {
	alert(error);
	console.log(error); // log the error message
	return true; // rollback transaction
}
nullDataHandler = function(transaction, results) {
	alert(results);
}
createTables = function() {
	try {
		// start transaction
		mydb.transaction(function(transaction) {
			// news table
			transaction.executeSql("CREATE TABLE IF NOT EXISTS news("
					+ "id INTEGER NOT NULL PRIMARY KEY,"
					+ "title TEXT NOT NULL DEFAULT '', "
					+ "excerpt TEXT NOT NULL DEFAULT '', "
					+ "article TEXT NOT NULL DEFAULT '', "
					+ "url TEXT NOT NULL DEFAULT '', "
					+ "image TEXT NOT NULL DEFAULT '');");
			// settings
			transaction.executeSql("CREATE TABLE IF NOT EXISTS settings("
					+ "id INTEGER NOT NULL PRIMARY KEY,"
					+ "key TEXT NOT NULL DEFAULT '', "
					+ "data TEXT NOT NULL DEFAULT '');");
		},
		function(e){}, //blank error
		function(){
			// call dbHandles
			for ( var i = 0; i < dbHandles.length; i++) {
				dbHandles[i](mydb);
			}
		});
	} catch (e) {
		alert(e.message);
		return;
	}
}
dbSetup = function() {
	try {
		if (window.openDatabase) {
			var shortName = 'az4db';
			var version = '1.0';
			var displayName = 'AlphaZone4 App Database';
			var maxSize = 20000; // in bytes
			mydb = window.openDatabase(shortName, version, displayName, maxSize);
			// setup database tables etc.
			createTables();
		}else{
			alert("DB not supported?");
		}
	} catch (e) {
		// Error handling code goes here.
		if (e == INVALID_STATE_ERR) {
			// Version number mismatch.
			alert("Invalid database version.");
		} else {
			alert("Unknown error " + e + ".");
		}
		return;
	}
}
document.addEventListener("deviceready", dbSetup, false);