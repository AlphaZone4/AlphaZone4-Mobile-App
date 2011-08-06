var news = [];
var newsDb;
// renderer
newsRender = function() {
	var h = ""; // news page
	var h_main = "<li data-role=\"list-divider\">Quick News</li>"; // front
	// page
	// summary
	for ( var i = 0; i < news.length; i++) {
		h += "<li><a href='" + news[i].url + "'><img src='" + news[i].image
				+ "' /><h3>" + news[i].title + "</h3><p>" + news[i].excerpt
				+ "</p>" + "</a></li>";
		if (i == 4)
			h_main += h;
	}
	if (h != "") {
		$("#news_list_summary").html(h_main).listview("refresh");
		$("#news_list").html(h).listview("refresh");
	}
}
// fetch news array from the database
newsFetchDb = function(db) {
	if (!db)
		db = newsDb;
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM news ORDER BY id DESC', [], function(db,
				rs) {
			// loop through each sql result and add to news object
			news = [];
			for ( var i = 0; i < rs.rows.length; i++) {
				news.push(rs.rows.item(i));
			}
			// render news lists
			newsRender();
		}, function(error) {
			alert("DBNews error 1: " + error);
		});
	});
}
newsFetchAZ4 = function(db) {
	if (!db)
		db = newsDb;
	// update database with data from the interwebs
	$.ajax({
			url : 'http://alphazone4.com/api/?method=news_feed',
			dataType : 'json',
			success : function(data) {
				newsDb.transaction(function(tx){
					for ( var i = 0; i < data.length; i++) {
						tx.executeSql('REPLACE INTO news (id, title, excerpt, article, url, image) VALUES (?, ?, ?, ?, ?, ?)',
								[	data[i].id,
									data[i].title,
									data[i].excerpt,
									data[i].article,
									data[i].url,
									data[i].image ]);
					}
				}, function(e){
					var h = "<li><img src=\"images/offline.png\" /><h3>Error</h3>" +
							"<p>There is a PhoneGap bug that refuses database creation on first-run. Restart the app to see news.</p></li>";
					$("#news_list_summary").html(h).listview("refresh");
					$("#news_list").html(h).listview("refresh");
				}, function(){newsFetchDb();});
			}
	});
}
// generic news update function
newsUpdate = function(db) {
	if (!db)
		db = newsDb;
	// check if we're online
	if (connectionCheck()) {
		// fetch latest news from website api
		newsFetchDb();
		newsFetchAZ4(db);
	} else {
		// just fetch cached news
		newsFetchDb(db);
	}
}
// onCreate handle
dbAddHandle(function(db) {
	newsDb = db;
	newsUpdate(db); // TODO : add manual refresh button somewhere
});