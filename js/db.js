dbErrorHandler = function(transaction, error) {
	console.log(error); // log the error message
	return true; // rollback transaction
}
nullDataHandler = function(transaction, results) {
}
dbSetup = function() {
	try {
		if (window.openDatabase) {
			var shortName = 'az4db';
			var version = '1.0';
			var displayName = 'AlphaZone4 App Database';
			var maxSize = 65536; // in bytes
			mydb = openDatabase(shortName, version, displayName, maxSize);
			createTables();
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
createTables = function() {
	try {
		// news table
		mydb.transaction(function(transaction) {
			transaction.executeSql("CREATE TABLE IF NOT EXISTS news("
					+ "id INTEGER NOT NULL PRIMARY KEY,"
					+ "title TEXT NOT NULL DEFAULT '', "
					+ "excerpt TEXT NOT NULL DEFAULT '', "
					+ "artricle TEXT NOT NULL DEFAULT '', "
					+ "url TEXT NOT NULL DEFAULT '', "
					+ "image TEXT NOT NULL DEFAULT '');", [], nullDataHandler,
					errorHandler);
		});

	} catch (e) {
		alert(e.message);
		return;
	}
}
document.addEventListener("deviceready", dbSetup, false);