/*
Project Name : Api Google Maps v2
Engine : Google App Script
Language Code : JavaScript
Date : 12-jan-2021 (9:32pm)
Last Update : -
Credit : @Aghisna12
*/

function getMaps(keyword, lat_from = "-7.7495851", long_from = "110.3674181") {//lat:-7.7495851 & long:110.3674181 (posisi/terdekat dari Sleman)
  var hasil = [];
  if (keyword) {
    var api_maps = "https://www.google.com/s?tbm=map&gs_ri=maps&suggest=p&authuser=0&hl=id&gl=id&pf=t&tch=1&ech=12&q=";
    var respon = UrlFetchApp.fetch(api_maps + keyword + "&pb=" + "!2d" +  long_from + "!3d" + lat_from).getContentText();
    if (respon) {
      var data = respon.replace(/\/\*(.*?)\*\//g, "");
      if (data) {
        var json = JSON.parse(data);
        if (json.d) {
          var map_d = (json.d).replace(/(?:\r\n|\r|\n)/g, "").replace(/null,/g, "");
          var maps = map_d.match(/\[\[\[(.*?)\[\["0x/g);
          if (maps) {
            for (var index in maps) {
              var map = maps[index];
              var map_r = /"\],\["(.*?)".*?\]\]\],\["(.*?)".*?\]\],\[(.*?)\]/g.exec(map);
              if (map_r && map_r.length == 4) {
                if (map_r[3].includes(",")) {
                  var pos_r = map_r[3].split(",");
                  if (pos_r && pos_r.length == 2) {
                    hasil.push({'nama':map_r[1], 'alamat':map_r[2], 'posisi':{'lat':pos_r[0],'long':pos_r[1]}});
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return hasil;
}

function testMaps() {
  var test = getMaps("jakarta");
  Logger.log(JSON.stringify(test,null,2));
}

testMaps();
/*
Output:
[
  {
    "nama": "Jakarta",
    "alamat": "Daerah Khusus Ibukota Jakarta",
    "posisi": {
      "lat": "-6.2087634",
      "long": "106.84559899999999"
    }
  },
  {
    "nama": "Jakarta Selatan",
    "alamat": "Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta",
    "posisi": {
      "lat": "-6.2614927",
      "long": "106.81059979999999"
    }
  },
  {
    "nama": "Jakarta Timur",
    "alamat": "Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta",
    "posisi": {
      "lat": "-6.2250138",
      "long": "106.9004472"
    }
  },
  {
    "nama": "Jakarta Barat",
    "alamat": "Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta",
    "posisi": {
      "lat": "-6.167430899999999",
      "long": "106.7637239"
    }
  },
  {
    "nama": "Jakarta Pusat",
    "alamat": "Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta",
    "posisi": {
      "lat": "-6.1805113",
      "long": "106.8283831"
    }
  }
]
*/
