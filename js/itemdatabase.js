// AlphaZone4.com Item Database JavaScript code
// Copyright James Holding 2011
// No copying, redistribution, modification or any other use outside of authorisation by owner
// CONFIG
var az4lang = {
	prices : {
		free : "<strong>free</strong>",
		reward : "Reward Item",
		gone : "No longer available",
		psn : "PSN/PS3 Game Reward",
		unknown : "(unknown)"
	}
}
// CODE
jQuery(document).ready(function($){
	// global database settings
	if ($("#az4_loader").length == 0){
		$('body').prepend("<div id='az4_object_box'></div><div id='az4_object_back'></div><div id='az4_loader'><img src='http://alphazone4.com/api/images/loader.gif' /></div>");
		$("#az4_object_back").click(function(){
			$("#az4_object_back").hide();
			$("#az4_object_box").hide(100);
		});
	}
});
(function($){
	// methods array
	var methods = {
		getSettings : function(){
			var settings = $(this).data('settings');
			if (typeof(settings)=="undefined"){
				// load default settings from class object
				settings = $.fn.az4database.settings;
			}
			return settings;
		},
		init : function(options){
			// renders for each database instance setup
			return this.each(function(){
				var settings = $(this).az4database('getSettings');
				// parse settings
				if (options){ 
					$.extend(settings, options);
				}
				// check if we're making a database or not
				if (!settings.database){
					settings.database = true;
					// run initHook if exists
					settings.initHook();
					// test for already existing jumper (in case there are two things... hax!)
					var jump = true;
					if ($("#az4_crumb").length > 0){
						jump = false;
					}
					// build database layout
					$(this).html("<div class='az4_box'><span class='az4_crumb' id='az4_crumb'></span></div><div class='az4_box' id='az4_page'></div><div id='az4_items_div' class='az4_box az4_clear'><ul class='az4_items' id='az4_item_box'></ul></div><div id='az4_items_footer' class='az4_box az4_clear'></div><div style='clear:both'></div>");
					var domain=window.location.hostname;
					if ((domain!="")&&(domain!="beta.stix.co")&&(domain!="alphazone4.com")&&(domain!="www.alphazone4.com")){
						$(this).append("<div stlye='clear:both;text-align:center;'><a href='http://alphazone4.com'>Powered by the AlphaZone4.com API - Your home away from PlayStation Home</a></div>");
					}
					// find layout top
					popTop = 0;
					popLeft = 0;
					if (jump){
						var temp = document.getElementById("az4_crumb");
						while (temp.offsetParent){
							popTop += temp.offsetTop;
							popLeft += temp.offsetLeft;
							temp = temp.offsetParent;
						}
					}
					// write settings
					settings.jump = jump;
					settings.popTop = popTop;
					settings.popLeft = popLeft;
					$(this).data('settings', settings);
					// setup timer or start database
					if (settings.hash){
						var rem = $(this);
						setInterval(function(){var settings = rem.az4database('getSettings');if(settings.last_hash!=document.location.hash){rem.az4database('initialLoad');}}, 400);
					}else{
						$(this).az4database("initialLoad");
					}
				}
			});
		},
		initialLoad : function(){
			$("#az4_object_back").hide();
			$("#az4_object_box").hide();
			var settings = $(this).az4database('getSettings');
			var hash = document.location.hash;
			if ((settings.hash)&&(hash!="")&&(hash!="#")){
				$(this).az4database('hash', hash);
				if (hash.substr(1,3)=="cat"){
					$(this).az4database('loadCat', parseInt(hash.substring(4)));
				}else if(hash.substr(1,6)=="update"){
					$(this).az4database('loadUpdate', parseInt(hash.substring(7)));
				}else if(hash.substr(1,8)=="freebies"){
					$(this).az4database('loadFree', hash.substring(9));
				}else if(hash.substr(1,6)=="search"){
					//switch_country(hash.substring(7,9));
					var q = hash.substring(7);//replace("+"," ");
					//q = replaceAll(q, "+", " ");
					if (q==""){
						$(this).az4database('loadSearch');
					}else{
						$(this).az4database('loadSearch', q);
					}
				}else{
					$(this).az4database('loadCat', 1);
				}
			}else{
				if (settings.lockRegion){
					if (settings.region=="US"){
						$(this).az4database('hash', "cat110");
						$(this).az4database('loadCat', 110);
					}else if(settings.region=="HK"){
					$(this).az4database('hash', "cat286");
						$(this).az4database('loadCat', 286);
					}else if(settings.region=="JP"){
						$(this).az4database('hash', "cat383");
						$(this).az4database('loadCat', 383);
					}else{
						$(this).az4database('hash', "cat1");
						$(this).az4database('loadCat', 1);
					}
				}else{
					if (settings.cat==0){
					// try load from cookies
						var cook = $(this).az4database('readCookie', 'database_country');
						if (cook!=null){
							if (cook=="US"){
								$(this).az4database('hash', "cat110");
								$(this).az4database('loadCat', 110);
							}else if(cook=="HK"){
								$(this).az4database('hash', "cat286");
								$(this).az4database('loadCat', 286);
							}else if(cook=="JP"){
								$(this).az4database('hash', "cat383");
								$(this).az4database('loadCat', 383);
							}else{
								$(this).az4database('hash', "cat1");
								$(this).az4database('loadCat', 1);
							}
						}else{
							if (settings.region=="US"){
								$(this).az4database('hash', "cat110");
								$(this).az4database('loadCat', 110);
							}else if(settings.region=="HK"){
								$(this).az4database('hash', "cat286");
								$(this).az4database('loadCat', 286);
							}else if(settings.region=="JP"){
								$(this).az4database('hash', "cat383");
								$(this).az4database('loadCat', 383);
							}else{
								$(this).az4database('hash', "cat1");
								$(this).az4database('loadCat', 1);
							}
						}
					}else{
						$(this).az4database('hash', "cat"+settings.cat);
						$(this).az4database('loadCat', settings.cat);
					}
				}
			}
		},
		loadCat : function(cat, refresh, cb){
			if ($(this).az4database("isLoading")) return;
			$(this).az4database('loading', true);
			if (typeof(refresh)==="undefined") refresh = false;
			var rem = $(this);
			var settings = $(this).az4database('getSettings');
			$.ajax({
				url: settings.api_base+'?method=database_getCat&id='+cat+((refresh)?"&rand="+Math.floor(Math.random()*99999999999):""),
				dataType: 'json',
				success: function(data){
					rem.az4database('loading', false);
					rem.az4database('renderCat', data);
					if (typeof(cb)!="undefined") cb();
				},
				error: function(data){
					rem.az4database('loading', false);
					alert("Error: "+data.error);
				}
			});
		},
		loadUpdate : function(update, refresh){
			if ($(this).az4database("isLoading")) return;
			$(this).az4database('loading', true);
			if (typeof(refresh)==="undefined") refresh = false;
			var rem = $(this);
			var settings = $(this).az4database('getSettings');
			$.ajax({
				url: settings.api_base+'?method=database_getUpdate&id='+update+((refresh)?"&rand="+Math.floor(Math.random()*99999999999):""),
				dataType: 'json',
				success: function(data){
					rem.az4database('loading', false);
					rem.az4database('renderUpdate', data);
				},
				error: function(data){
					rem.az4database('loading', false);
					alert("Error: "+data.error);
				}
			});
		},
		loadFree : function(country, refresh){
			if ($(this).az4database("isLoading")) return;
			$(this).az4database('loading', true);
			if (typeof(refresh)==="undefined") refresh = false;
			var rem = $(this);
			var settings = $(this).az4database('getSettings');
			$.ajax({
				url: settings.api_base+'?method=database_getFreeItems&id='+country+((refresh)?"&rand="+Math.floor(Math.random()*99999999999):""),
				dataType: 'json',
				success: function(data){
					rem.az4database('loading', false);
					rem.az4database('renderFree', data);
				},
				error: function(data){
					rem.az4database('loading', false);
					alert("Error: "+data.error);
				}
			});
		},
		loadSearch : function(_q, page){
			// build search query
			if (typeof(page)=="undefined") page = 1;
			if (!_q){
				_q = $("#q").val();
			}else{
				_q = _q;
			}
			if ((!_q)||(_q=="")){
				// just load search form (no search given)
				$(this).az4database('hash', "search");
				$(this).az4database('type', "search");
				$(this).az4database('renderSearch', "");
			}else{
				var query = "&q="+_q+"&gender="+$('input:radio[name=gender]:checked').val();
				var zones = [];
				if ($('#itemsearch_EU').attr('checked')){
					zones.push("EU");
				}
				if ($('#itemsearch_US').attr('checked')){
					zones.push("US");
				}
				if ($('#itemsearch_JP').attr('checked')){
					zones.push("JP");
				}
				if ($('#itemsearch_HK').attr('checked')){
					zones.push("HK");
				}
				if (zones[0]){
					query += "&zone="+zones.join(",");
				}
				if (page){
					query += "&page="+page;
				}
				// load ajax
				if ($(this).az4database("isLoading")) return;
				$(this).az4database('loading', true);
				var rem = $(this);
				var settings = $(this).az4database('getSettings');
				$.ajax({
					url: settings.api_base+'?method=database_search'+query,
					dataType: 'json',
					success: function(data){
						rem.az4database('hash', "search"+_q);
						rem.az4database('type', "search");
						rem.az4database('loading', false);
						rem.az4database('renderSearch', _q, data);
					},
					error: function(data){
						rem.az4database('hash', "search");
						rem.az4database('type', "search");
						rem.az4database('loading', false);
					}
				});
			}
		},
		renderSearch : function(q, data){
			var settings = $(this).az4database('getSettings');
			if ($("#item_search").length==0){
				// render search fields
				var c = "<form id='item_search'>";
				c += "<h2>Search Options</h2><br />";
				c += "<div><label for='q'><p style='float:left;padding-left:7px;padding-top:15px;width:90px;'>Search Query: </p></label><input type='text' name='q' id='q' "+((q)?"value='"+q+"' ":"")+"/></div>";
				c += "<br /><p style='float:left;padding-left:7px;padding-top:6px;width:90px;'>Gender: </p><div id='itemsearch_gender'>";
				c += "<input type='radio' checked='checked' id='gender_none' name='gender' value='' /><label for='gender_none'>Any</label>";
				c += "<input type='radio' id='gender_male' name='gender' value='M' /><label for='gender_male'>Male</label>";
				c += "<input type='radio' id='gender_female' name='gender' value='F' /><label for='gender_female'>Female</label>";
				c += "</div><p style='float:left;padding-left:7px;padding-top:6px;width:90px;'>Region: </p><div id='itemsearch_zone'>";
				c += "<input type='checkbox' id='itemsearch_EU' checked='checked' /><label for='itemsearch_EU'>Europe</label>";
				c += "<input type='checkbox' id='itemsearch_US' checked='checked' /><label for='itemsearch_US'>America</label>";
				c += "<input type='checkbox' id='itemsearch_JP' checked='checked' /><label for='itemsearch_JP'>Japan</label>";
				c += "<input type='checkbox' id='itemsearch_HK' checked='checked' /><label for='itemsearch_HK'>Asia</label>";
				c += "</div>";
				c += "<p style='float:left;padding-left:7px;padding-top:6px;width:90px;'>Search Area: </p><div id='itemsearch_types'>";
				c += "<input type='checkbox' id='itemsearch_items' checked='checked' /><label for='itemsearch_items'>Items</label>";
				c += "<input type='checkbox' id='itemsearch_cats' /><label for='itemsearch_cats'>Categories</label>";
				c += "</div>";
				c += "<input type='submit' id='az4_item_search' value='Search' />";
				c += "<input type='button' value='Random' id='az4_item_random' />";
				c += "</form><h2>Results</h2><div id='az4_items_header' class='az4_box az4_clear'></div>";
				// render search results
				c += "<div id='az4_search_results'></div>";
				$("#az4_page").html(c);
				// add event handlers (ONCE)
				var rem = $(this);
				$("#item_search").submit(function(){
					$("#az4_item_box").html("");
					$("#az4_item_footer").html("");
					$("#az4_item_header").html("");
					rem.az4database("loadSearch");
					return false;
				});
				$("#az4_item_random").click(function(){
					rem.az4database('loading', true);
					$.ajax({
						url: settings.api_base+'?method=database_random&num=10',
						dataType: 'json',
						success: function(data){
							rem.az4database('hash', "search");
							rem.az4database('type', "search");
							rem.az4database('loading', false);
							var d = {items:data};
							rem.az4database('renderSearch', $("#q").val(), d);
						}
					});
					return false;
				});
				// pretify
				$("#itemsearch_gender").buttonset();
				$("#itemsearch_types").buttonset();
				$("#itemsearch_zone").buttonset();
				$("#az4_item_search").button();
				$("#az4_item_random").button();
			}
			// clear footer
			$("#az4_crumb").html("");
			$("#az4_items_footer").html("");
			// render search results (or blank them)
			$("#az4_item_box").html("");
			if (typeof(data)!=="undefined"){
				if (typeof(data.error)!="undefined"){
					// show error
					$("#az4_item_box").html("");
					$("#az4_items_header").html(data.error);
				}else{
					// render items
					$(this).az4database("renderItems", data.items);
					// make stats
					if (typeof(data.time)!="undefined"){
						var stats = "Search took "+data.time+" seconds. Found "+data.total+" items and "+data.cats_found+" categories";
					}else{
						var stats = "";
					}
					if ($("#itemsearch_cats").attr("checked")){
						if (data.cats.length > 0){
							for(var i=0; i<data.cats.length; i++){
								stats += "<br /><a href='#cat"+data.cats[i].id+"'><img src='"+settings.api_base+"/images/"+data.cats[i].country.toLowerCase()+"sml.png' /> "+data.cats[i].trail+"</a>";
							}
						}
					}
					// render pages if we actually have pages
					if (data.pages>1){
						var c = "<table style='margin-left:auto;margin-right:auto'><tr>";
						for(var i=0; i<data.pages; i++){
							c += "<td class='az4_search_page_"+(i+1)+"' name='"+(i+1)+"'><a href='#'><img src='"+settings.api_base+"/images/page"+(((i+1)==data.page)?"_green":"")+".png' /><p>"+(i+1)+"</p></a></td>";
						}
						c += "</tr></table>";
						// add pages to footer and header
						$("#az4_items_header").html(stats+"<br />"+c);
						$("#az4_items_footer").html(c);
						for(var i=0; i<data.pages; i++){
							var rem = $(this);
							$(".az4_search_page_"+(i+1)).click(function(){
								rem.az4database("loadSearch", data.query, $(this).attr("name"));
								return false;
							});
						}
					}else{
						$("#az4_items_header").html(stats);
						$("#az4_items_footer").html("");
					}
				}
			}
			return this;
		},
		renderUpdate : function(data){
			var settings = $(this).az4database('getSettings');
			// store data into object
			$(this).data('data', data);
			$(this).data('items', data.items);
			$(this).data('cats', []);
			$(this).data('page', "");
			// set hash value in browser
			$(this).az4database('hash', "update"+data.id);
			$(this).az4database('type', "update");
			// save current region into cookies
			$(this).az4database('createCookie', 'database_country', data.country, 8);
			$(this).data('country', data.country);
			// render breadcrumb
			if ((settings.navigate)&&(typeof(data.breadcrumb)!=="undefined")){
				// draw country flag
				// loop through segments of trail and render
				var h = "<img src='"+settings.api_base+"images/"+data.country.toLowerCase()+"sml.png' class='az4_object' id='home_flag' name='cat_"+data.breadcrumb[0].id+"' /> ";
				for(var t=0; t<data.breadcrumb.length; t++){
					h += ((data.breadcrumb[t].name!="Home")?" &gt;":"")+" <a href='#' class='az4_object' name='cat_"+data.breadcrumb[t].id+"' id='cat_"+data.breadcrumb[t].id+"'>"+((data.breadcrumb[t].name!="")?data.breadcrumb[t].name:"???")+"</a>";
				}
				$("#az4_crumb").html(h);
			}
			// render page
			$("#az4_page").html($(this).az4database('parsePage', data.page));
			// render items
			$(this).az4database('renderItems');
			// run api hooks
			data.type = "update";
			$(this).az4database('doHook', 'navigate', data);
		},
		renderFree : function(data){
			var settings = $(this).az4database('getSettings');
			// store data into object
			$(this).data('data', data);
			$(this).data('items', data.items);
			$(this).data('cats', []);
			$(this).data('page', "");
			// set hash value in browser
			$(this).az4database('hash', "freebies"+data.country);
			$(this).az4database('type', "free");
			// save current region into cookies
			$(this).az4database('createCookie', 'database_country', data.country, 8);
			$(this).data('country', data.country);
			// render breadcrumb
			if ((settings.navigate)&&(typeof(data.breadcrumb)!=="undefined")){
				// draw country flag
				// loop through segments of trail and render
				var h = "<img src='"+settings.api_base+"images/"+data.country.toLowerCase()+"sml.png' class='az4_object' id='home_flag' name='cat_"+data.breadcrumb[0].id+"' /> ";
				for(var t=0; t<data.breadcrumb.length; t++){
					h += ((data.breadcrumb[t].name!="Home")?" &gt;":"")+" <a href='#' class='az4_object' name='cat_"+data.breadcrumb[t].id+"' id='cat_"+data.breadcrumb[t].id+"'>"+((data.breadcrumb[t].name!="")?data.breadcrumb[t].name:"???")+"</a>";
				}
				$("#az4_crumb").html(h);
			}
			// render page
			$("#az4_page").html($(this).az4database('parsePage', data.page));
			// render items
			$(this).az4database('renderItems');
			// run api hooks
			data.type = "free";
			$(this).az4database('doHook', 'navigate', data);
		},
		renderCat : function(data){
			var settings = $(this).az4database('getSettings');
			// store data into object
			$(this).data('data', data);
			$(this).data('items', data.items);
			$(this).data('cats', data.cats);
			$(this).data('page', data.page);
			// set hash value in browser
			$(this).az4database('hash', "cat"+data.id);
			$(this).az4database('type', "cat");
			// save current region into cookies
			$(this).az4database('createCookie', 'database_country', data.country, 8);
			$(this).data('country', data.country);
			// render breadcrumb
			if ((settings.navigate)&&(typeof(data.breadcrumb)!=="undefined")){
				// draw country flag
				// loop through segments of trail and render
				var h = "<img src='"+settings.api_base+"images/"+data.country.toLowerCase()+"sml.png' class='az4_object' id='home_flag' name='cat_"+data.breadcrumb[0].id+"' /> ";
				for(var t=0; t<data.breadcrumb.length; t++){
					h += ((data.breadcrumb[t].name!="Home")?" &gt;":"")+" <a href='#' class='az4_object' name='cat_"+data.breadcrumb[t].id+"' id='cat_"+data.breadcrumb[t].id+"'>"+((data.breadcrumb[t].name!="")?data.breadcrumb[t].name:"???")+"</a>";
				}
				$("#az4_crumb").html(h);
			}
			// render page
			$("#az4_page").html($(this).az4database('parsePage', data.page));
			if (data.cats.length>0){
				// categories listed here, remove items
				$(this).az4database('renderCats');
			}else{
				// no categories, let's show the items then
				$(this).az4database('renderItems');
			}
			// run api hooks
			data.type = "cat";
			$(this).az4database('doHook', 'navigate', data);
		},
		renderCats : function(cats, div){
			var settings = $(this).az4database('getSettings');
			if (cats){
				$(this).data('cats', cats);
			}else{
				var cats = $(this).data('cats');
			}
			$("#az4_items_footer").html("");
			var h = "";
			for(var i=0; i<cats.length; i++){
				h += "<li id='list_"+cats[i].id+"' class='az4_object' name='cat_"+cats[i].id+"'>"+((cats[i].expired==true)?"<div class='az4_overlay'><img src='"+settings.api_base+"images/GNO.png' /></div>":"")+"<div class='az4_more'><p><strong>"+cats[i].name+"</strong></p></div><div class='az4_img' id='az4_cat_image_"+cats[i].id+"'></div><p class='az4_center'>"+cats[i].name+"</p></li>";
			}
			if (!div){
				$("#az4_item_box").html(h);
			}else{
				div.html(h);
			}
			// setup synronous image loaders with event callbacks
			for(var i=0; i<cats.length; i++){
				var img = new Image();
				$(img).load(function(){
					$(this).hide();
					var dat = $(this).attr('name');
					if ($("#"+dat).hasClass('az4_img')) $("#"+dat).removeClass('az4_img').append(this);
					$(this).show();
				}).error(function () {
				}).attr('src', "http://cdn.alphazone4.com/c/"+cats[i].thumbnail)
				.attr('width', 128).attr('height', 128).attr('name', "az4_cat_image_"+cats[i].id);
			}
			// add event handlers
			$(this).az4database('doEventHandlers');
			return this;
		},
		renderItems : function(items, div, staticRender){
			var settings = $(this).az4database('getSettings');
			if (typeof(staticRender)=="undefined") staticRender = false;
			if (items){
				$(this).data('items', items);
			}else{
				var items = $(this).data('items');
			}
			$("#az4_items_footer").html("");
			var h = "";
			for(var i=0; i<items.length; i++){
				if (typeof(items[i].prices)=="undefined"){
					// fetch item data through Ajax then re-call operation TODO
					h = "<li>data invalid :|</li>";
				}else{
					var price = $(this).az4database('itemPrice', items[i]);
					// run action hook for this item
					var rating = $(this).az4database('doHook', 'renderItem', items[i]);
					var rating_class = "";
					var rating_div = "";
					// loop through return from hook and add together
					if (rating!=""){
						for (var j=0; j<rating.length; j++){
							rating_class += " "+rating[j][1];
							rating_div += rating[j][0];
						}
					}
					h += "<li id='list_"+items[i].id+"' class='az4_"+((staticRender)?"static_":"")+"object"+rating_class+"'><div class='az4_overlay'><img src='"+settings.api_base+"images/"+((price==az4lang.prices.gone)?"G":"")+((price==az4lang.prices.free)?"F":"")+((price==az4lang.prices.psn)?"B":"")+((items[i].gender!="")?items[i].gender:"N")+"O.png' /></div><div class='az4_more az4_object' name='item_"+items[i].id+"'><p><strong>"+items[i].name+"</strong></p></div><div class='az4_img' id='az4_item_image_"+items[i].id+"'></div><p class='az4_center'>"+price+"</p>"+rating_div+"</li>";
				}
			}
			// render list in one go (much faster)
			if (!div){
				$("#az4_item_box").html(h);
			}else{
				div.html(h);
			}
			// setup synronous image loaders with event callbacks
			var rem = this;
			for(var i=0; i<items.length; i++){
				var img = new Image();
				$(img).load(function(){
					$(this).hide();
					var dat = $(this).attr('name');
					if ($("#"+dat, rem).hasClass('az4_img')) $("#"+dat, rem).removeClass('az4_img').append(this);
					$(this).show();
				}).error(function () {
				}).attr('src', "http://cdn.alphazone4.com/i/"+items[i].image)
				.attr('width', 128).attr('height', 128).attr('name', "az4_item_image_"+items[i].id);
			}
			// add event handlers
			$(this).az4database('doEventHandlers', staticRender);
			return this;
		},
		showObjectId : function(id, database){
			// loading_stop(); TODO
			var items = $(this).data('items');
			if (typeof(items) != "undefined"){
				for(var t=0; t<items.length; t++){
					if (items[t].id == id){
						$(this).az4database('showObject', items[t], database);
						return false;
					}
				}
			}
			var settings = $(this).az4database('getSettings');
			$.ajax({
				url: settings.api_base+'?method=database_item&id='+id,
				cache: true,
				dataType: 'json',
				success: function(dat){
					$(this).az4database('showObject', dat, database);
				}
			});
			return this;
		},
		showObject : function(dat, database){
			var settings = $(this).az4database('getSettings');
			if (typeof(database)=="undefined") database = settings.database;
			var h = "<table width=100%><tbody><tr><td class='az4_img az4_item_image' "+((dat.image_large_exist=="true")?"width=320":"width=128")+" valign='top'>";
			h += "<img src='http://cdn.alphazone4.com/"+((dat.image_large_exist=="true")?"l":"i")+"/"+dat.image+"' "+((dat.image_large_exist=="true")?"width=320 height=176":"width=128 height=128")+" align='left' />";
			var p;
			h += "</td><td valign='top'><h2>"+dat.name+((dat.gender!="")?" <img src='"+settings.api_base+"images/"+((dat.gender=="M")?"":"fe")+"male.png' />":"")+"</h2><div class='az4_object_dat'>";
			if (((settings.lockRegion==false)||("EU"==settings.region)||(!settings.database))&&((p=$(this).az4database('itemPrice', dat, "EU"))!="(unknown)")) h += "<img src='"+settings.api_base+"images/eusml.png'/> "+p+"<br />";
			if (((settings.lockRegion==false)||("US"==settings.region)||(!settings.database))&&((p=$(this).az4database('itemPrice', dat, "US"))!="(unknown)")) h += "<img src='"+settings.api_base+"images/ussml.png'/> "+p+"<br />";
			if (((settings.lockRegion==false)||("JP"==settings.region)||(!settings.database))&&((p=$(this).az4database('itemPrice', dat, "JP"))!="(unknown)")) h += "<img src='"+settings.api_base+"images/jpsml.png'/> "+p+"<br />";
			if (((settings.lockRegion==false)||("HK"==settings.region)||(!settings.database))&&((p=$(this).az4database('itemPrice', dat, "HK"))!="(unknown)")) h += "<img src='"+settings.api_base+"images/hksml.png'/> "+p+"<br />";
			var price_add = $(this).az4database('doHook', 'objectDatPrices', dat);
			h += "</div>"+price_add+"</td></tr></td></tr></tbody></table>";
			if ((dat.description!="")||(dat.tutorial!="")) h += "<div class='az4_object_dat clear'>"+dat.description+((dat.tutorial!="")?((dat.description!="")?"<br />":"")+"<i>How to get:</i> "+dat.tutorial:"")+"</div>";
			if (dat.categories!=null){
				h += "<div class='az4_object_dat'>Found in:<ul class='az4_categories'>";
				for(var t=0; t<dat.categories.length; t++){
					if ((settings.lockRegion==false)||(dat.categories[t].region.toUpperCase()==settings.region)){
						h += "<li class='az4_"+((database)?"category":"list")+"' name='cat_"+dat.categories[t].cat_id+"' id='cat_cat_"+dat.categories[t].cat_id+"'><img src='"+settings.api_base+"images/"+dat.categories[t].region.toLowerCase()+"sml.png'/> <a href='/store/#cat"+dat.categories[t].cat_id+"'>"+dat.categories[t].cat_name+"</a></li>";
					}
				}
				if (typeof(dat.stores)!=="undefined"){
					for(var t=0; t<dat.stores.length; t++){
						if ((settings.lockRegion==false)||(dat.stores[t].region.toUpperCase()==settings.region)){
							h += "<li class='az4_list az4_store' name='store_"+dat.stores[t].id+"' id='store_store_"+dat.stores[t].cat_id+"'><img src='"+settings.api_base+"images/"+dat.stores[t].region.toLowerCase()+"sml.png'/> <a href='/store/#store"+dat.stores[t].store_id+"'>"+dat.stores[t].name+"</a></li>";
						}
					}
				}
				h += "</ul></div>";
			}
			$('#az4_object_back').fadeIn(100);
			$('#az4_object_box').html(h).fadeIn(100);
			$(this).az4database('doHook', 'objectDat', dat);
			// Add category event handlers
			var struct = $(this);
			$(".az4_category").each(function(index){
				$(this).data('struct', struct);
				$(this).click(function(){
					$("#az4_object_box").hide(100);
					$("#az4_object_back").hide();
					var struct = $(this).data('struct');
					struct.az4database('objectClick', $(this));
					return false;
				});
			});
			$(".az4_list").each(function(index){
				$(this).click(function(){
					$("#az4_object_box").hide();
					$("#az4_object_back").hide();
				});
			});
		},
		objectClick : function(obj, database){
			// get rid of the background
			$("#az4_object_back").hide();
			$("#az4_object_box").hide();
			// get settings
			var settings = $(this).az4database('getSettings');
			if (typeof(database)=="undefined") database = settings.database;
			// are we already loading? stop.
			if (settings.loading) return this;
			// Pop
			if (settings.jump){
				//az4_jump(); TODO
			}
			// retrieve element name attribute and test for existance
			var dat = obj.attr('name');
			if (typeof(dat)!=="undefined"){
				// test for type of navigation and call related function
				if (dat.substr(0,4)=="cat_"){
					if (settings.database){ // check we're actually part of the database
						if (settings.navigate){
							$(this).az4database('loadCat', parseInt(dat.substring(4)));
						}
					}else{
						// else, just redirect to the category page
						window.location.href="/store#cat"+dat.substring(4);
					}
				}else if(dat.substr(0,5)=="item_"){
					$(this).az4database('showObjectId', parseInt(dat.substring(5)), database);
				}else if(dat.substr(0,7)=="update_"){
					if (settings.database){ // check we're actually part of the database
						if (settings.navigate){
							$(this).az4database('loadUpdate', parseInt(dat.substring(7)));
						}
					}else{
						// else, just redirect to the category page
						window.location.href="/store#update"+dat.substring(7);
					}
				}else if(dat.substr(0,5)=="free_"){
					if (settings.database){ // check we're actually part of the database
						if (settings.navigate){
							$(this).az4database('loadFree',dat.substring(5));
						}
					}else{
						// else, just redirect to the category page
						window.location.href="/store#free"+dat.substring(5);
					}
				}else{
					//unknown object name
					/*show_error("Unknown object type: "+dat); TODO
					loading_stop();*/
				}
			}else{
				// an invalid rendering issue occured - an element has no name but it's got 'object' class
				/*show_error("Class 'object' missing name parameter - "+obj.attr('id')); TODO
				loading_stop();*/
			}
			return this;
		},
		doEventHandlers : function(staticRender){
			if (typeof(staticRender)=="undefined") staticRender = false;
			// add item hover fades
			$(".az4_more", this).each(function(){
				$(this).css('opacity', 0);
				$(this).hover(function(){
					$(this).stop().fadeTo(10, 1);
				},
				function(){
					$(this).stop().fadeTo(10, 0);
				});
			});
			// add item clicks
			var struct = $(this);
			$(".az4_object", this).each(function(index){
				$(this).data('struct', struct);
				$(this).click(function(){
					var struct = $(this).data('struct');
					struct.az4database('objectClick', $(this), !staticRender);
					return false;
				});
			});
			return this;
		},
		priceString : function(i){
			if (i=="-1"){
				return az4lang.prices.free;
			}else if(i=="-2"){
				return az4lang.prices.reward;
			}else if(i=="-3"){
				return az4lang.prices.gone;
			}else if(i=="-4"){
				return az4lang.prices.psn;
			}else{
				return az4lang.prices.unknown;
			}
		},
		loading : function(start){
			var settings = $(this).az4database('getSettings');
			if (start){
				$("#az4_loader").stop(false, true).show(100);
			}else{
				$("#az4_loader").stop(false, true).hide(100);
			}
			settings.loading = start;
			$(this).data('settings', settings);
		},
		isLoading : function(){
			var settings = $(this).az4database('getSettings');
			return settings.loading;
		},
		itemPrice : function(i, _c){
			var _country;
			if (!_c){
				_country = $(this).data('country');
				if (_country == null) _country = "ALL";
			}else{
				_country = _c;
			}
			if (_country=="ALL"){
				/*var str = "";
				var t = $(this).az4database('itemPrice', i, "EU");
				if (t!="(unknown)") str += t+"<br />";
				t = $(this).az4database('itemPrice', i, "US");
				if (t!="(unknown)") str += t+"<br />";
				t = $(this).az4database('itemPrice', i, "JP");
				if (t!="(unknown)") str += t+"<br />";
				t = $(this).az4database('itemPrice', i, "HK");
				if (t!="(unknown)") str += t+"<br />";
				return ((str.length>0)?str.substr(0, str.length-6):"");*/
				return "";
			}else{
				if (_country=="EU"){
					if (i.prices.GBP==0){
						return "(unknown)";
					}else if(i.prices.GBP<0){
						return $(this).az4database('priceString', i.prices.GBP);
					}else{
						var price = "&pound;"+i.prices.GBP;
						if (i.prices.EUR>0) price += " / &euro;"+i.prices.EUR;
						return price;
					}
				}else if(_country=="US"){
					if (i.prices.USD==0){
						return "(unknown)";
					}else if(i.prices.USD<0){
						return $(this).az4database('priceString', i.prices.USD);
					}else{
						return "$"+i.prices.USD;
					}
				}else if(_country=="HK"){
					if (i.prices.HKD==0){
						return "(unknown)";
					}else if(i.prices.HKD<0){
						return $(this).az4database('priceString', i.prices.HKD);
					}else{
						return "HK$"+i.prices.HKD;
					}
				}else{
					if (i.prices.JPY==0){
						return "(unknown)";
					}else if(i.prices.JPY<0){
						return $(this).az4database('priceString', i.prices.JPY);
					}else{
						return "&yen;"+i.prices.JPY;
					}
				}
			}
		},
		parsePage : function(page){
			if (typeof(page)!=="undefined"){
				// render category links
				page = page.replace(/\[cat=([^\]]+)\]([0-9]+)\[\/cat\]/g,"<a href='#' name='cat_$2' id='caturl_$2' class='az4_object'>$1</a>");
				// render update links
				page = page.replace(/\[update=([^\]]+)\]([0-9]+)\[\/update\]/g,"<a href='#' name='update_$2' id='updateurl_$2' class='az4_object'>$1</a>");
				// render freebie links
				page = page.replace(/\[free=([^\]]+)\]([A-Z]+)\[\/free\]/g,"<a href='#' name='free_$2' id='freeurl_$2' class='az4_object'>$1</a>");
				return page;
			}else{
				return "";
			}
		},
		createCookie : function(name, value, days){
			if (days){
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		},
		readCookie : function(name){
			var nameEQ = name+"=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length; i++){
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		},
		eraseCookie : function(name){
			$(this).az4database('createCookie', name, "", -1);
		},
		getCat : function(){
			var d = $(this).data('data');
			return d.id;
		},
		hash : function(hash){
			var settings = $(this).az4database('getSettings');
			if (settings.hash){
				document.location.hash = hash;
				settings.last_hash = document.location.hash;
				$(this).data('settings', settings);
			}
		},
		addHook : function(hook, func){
			var settings = $(this).az4database('getSettings');
			if (typeof(settings.hooks[hook])=="undefined") settings.hooks[hook] = [];
			settings.hooks[hook].push(func);
			$(this).data('settings', settings);
		},
		doHook : function(hook, data){
			var settings = $(this).az4database('getSettings');
			var r = "";
			if (typeof(settings.hooks[hook])!=="undefined"){
				for(var i=0; i<settings.hooks[hook].length; i++){
					var dat = settings.hooks[hook][i](data);
					if (typeof(dat) == "object"){
						if (typeof(r)=="string") r = [];
						r.push(dat);
					}else{
						r += dat;
					}
				}
			}
			return r;
		},
		isChild : function(){
			var d = $(this).data('data');
			return (!d.cats.length>0);
		},
		type : function(t){
			return $(this).data("type", t);
		},
		getType : function(){
			return $(this).data("type");
		}
	};

  $.fn.az4database = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.az4database' );
    }
  };
  
  $.fn.az4database.settings = {
		'cat' : 0, // 0 = load from cookie or address bar
		'hash' : false, // update address bar hash?
		'navigate' : false, // allow category navigation?
		'lockRegion' : false,
		'region' : 'EU',
		'jump' : false, // TODO
		'api_base' : 'http://alphazone4.com/api/',
		'api_version' : '0.1',
		'url' : 'http://alphazone4.com/',
		'loading' : false,
		'hooks' : {},
		'initHook' : function(){},
		'database' : false
	};
})(jQuery);