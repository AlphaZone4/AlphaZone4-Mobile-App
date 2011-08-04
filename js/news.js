var news = [];
var newsDb;
// renderer
newsRender = function() {
	var h = "<ul data-role=\"listview\">";
	for ( var i = 0; i < news.length; i++) {
		// print_r(news);
		h += "<li><a href=''><img src='" + news[i].image + "' /><h3>"
				+ news[i].title + "</h3><p>" + news[i].excerpt + "</p>"
				+ "</a></li>";
	}
	h += "</ul>";
	$("#news_list").html(h).page();
}
// fetch news array from the database
newsFetchDb = function(db){
	if (!db) db = newsDb;
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM news', [], function(db, rs) {
			// loop through each sql result and add to news object
			news = [];
			for (var i=0; i<rs.rows.length; i++){
				news.push(rs.rows.item(i));
			}
			// render news
			newsRender();
		}, function(error) {
			alert("DBNews error 1: " + error);
		});
	});
}
// generic news update function
newsUpdate = function(db){
	if (!db) db = newsDb;
	// check if we're online
	if (connectionCheck()) {
		// TODO : fetch latest news from website api
		// update the news object
		newsFetchDb(db);
	}else{
		// just fetch cached news
		newsFetchDb(db);
	}
}
// onCreate handle
dbAddHandle(function(db) {
	newsDb = db;
});