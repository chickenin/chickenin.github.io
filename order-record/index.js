// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDUG4V_eioVouW-NidZe2dty1vO8SYEN6U",
	authDomain: "chikenin-wuma.firebaseapp.com",
	databaseURL: "https://chikenin-wuma-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "chikenin-wuma",
	storageBucket: "chikenin-wuma.appspot.com",
	messagingSenderId: "189298170119",
	appId: "1:189298170119:web:d45856b6ded2a6d915cda2",
	measurementId: "G-XLYRQ0YL3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

var onlineStat = function(){
	const connectedRef = ref(db, '.info/connected');
	onValue(connectedRef, (snap) => {
		if (snap.val() === true) {
			localStorage.setItem("onlineStat", "online");
			
		}else{
			localStorage.setItem("onlineStat", "offline");
		}
		return localStorage.getItem("onlineStat");
	});
}

onlineStat;

function writeMenuData(category, name, datas) {
  set(ref(db, 'menu/' + category + '/' + name), datas);
}

function writeOrderHistory(datas) {
	return set(ref(db, 'orderHistory-'+datas.date+'/' + Date.now()), datas);
}

//var menuItems = {
//    "Little_Shihlin": {
//        "Cabe_Pedas": {
//            "image": "img\/little-shihlin.jpg",
//            "price": 20000
//        },
//        "BBQ": {
//            "image": "img\/little-shihlin.jpg",
//            "price": 20000
//        },
//        "Sapi_Panggang": {
//            "image": "img\/little-shihlin.jpg",
//            "price": 20000
//        },
//        "Balado": {
//            "image": "img\/little-shihlin.jpg",
//            "price": 20000
//        },
//        "Keju": {
//            "image": "img\/little-shihlin.jpg",
//            "price": 20000
//        },
//        "Seaweed": {
//            "image": "img\/little-shihlin.jpg",
//            "price": 20000
//        }
//    },
//    "Tambahan": {
//        "Nasi": {
//            "image": "img\/nasi.png",
//            "price": 3000
//        }
//    }
//};
//
//console.log(menuItems);
//
//$.each(menuItems, function(cat,menu){
//	var category = cat;
//	$.each(menu, function(name,data){
//		writeMenuData(category,name, data);
//	});
//});

var menuItems;

if(!localStorage.getItem("menuItems") || (localStorage.getItem("menuItems") && Date.now() - localStorage.getItem("menuItemsTimestamp") > 86400000)){
	console.log('Geting latest menu list . . .');
	onValue(ref(db, 'menu'), (snap) => {
			if (snap.val()) {
				localStorage.removeItem("menuItems"); 
				menuItems = snap.val();
				localStorage.setItem("menuItems", JSON.stringify(menuItems)); 
				localStorage.setItem("menuItemsTimestamp",  Date.now());
				
				console.log('Got the latest menu list . . . at '+ Date.now());
			}else{
				console.log('We dont have connection, use old list instead');  
			}
		},{
		onlyOnce: true
	});
}

var orderHistoryPushReady;

setInterval(function() {
	if(localStorage.getItem("pushOrderHistory")){
		onlineStat;
		if(localStorage.getItem("onlineStat")=='online'){
			orderHistoryPushReady=JSON.parse(localStorage.getItem("pushOrderHistory"));
			
			delete orderHistoryPushReady[0].id;
			
			writeOrderHistory(orderHistoryPushReady[0]);
			
			orderHistoryPushReady.splice(0, 1);
			
			if(orderHistoryPushReady.length>0){
				localStorage.setItem("pushOrderHistory", JSON.stringify(orderHistoryPushReady)); 
			}else{
				localStorage.removeItem("pushOrderHistory");
			}
		}
	};
}, 1000);