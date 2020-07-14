function getMaps(keyword, lat_from = "-7.7495851", long_from = "110.3674181") {//lat:-7.7495851 & long:110.3674181 (posisi/terdekat dari Sleman)
  var hasil = [];
  if (keyword) {
    var api_maps = "https://www.google.com/s?tbm=map&gs_ri=maps&suggest=p&authuser=0&hl=en&gl=id&pf=t&tch=1&ech=12&q=";
    var respon = UrlFetchApp.fetch(api_maps + keyword + "&pb=" + "!2d" +  long_from + "!3d" + lat_from).getContentText();
    if (respon) {
      var data = respon.replace(/\/\*(.*?)\*\//g, "");
      if (data) {
        var json = JSON.parse(data);
        if (json.d) {
          var map_d = json.d;
          var maps = map_d.match(/,\[\["0x(.*?)\]/g);
          if (maps) {
            for (var index in maps) {
              var map = maps[index];
              if (map.includes("null,")) {
                map = map.replace(/null,/g, "");
              }
              var map_r = /,\[\["(.*?)","(.*?)"(.*?)\[(.*?)\]/g.exec(map);
              if (map_r.length > 0) {
                if (map_r[4].includes(",")) {
                  var pos_r = map_r[4].split(",");
                  if (pos_r && pos_r.length == 2) {
                    hasil.push({'nama':map_r[2], 'posisi':{'lat':pos_r[0],'long':pos_r[1]}});
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
  var test = getMaps("monumen");
  Logger.log(JSON.stringify(test,null,2));
}

function testLimitMaps() {
  for (var i = 0; i < 100; i++) {
    var test = getMaps("monumen");
    if (test) {
      Logger.log(test.length);
    }
  }
}

/*
Output Logger://testMaps()
[20-07-14 05:23:14:717 PDT] [
  {
    "nama": "Monumen Nasional, Gambir, Central Jakarta City, Jakarta",
    "posisi": {
      "lat": "-6.1753924",
      "long": "106.8271528"
    }
  },
  {
    "nama": "Monumen Yogya Kembali, Jl. Ring Road Utara, Jongkang, Sariharjo, Sleman Regency, Special Region of Yogyakarta",
    "posisi": {
      "lat": "-7.7495904",
      "long": "110.3696068"
    }
  },
  {
    "nama": "Monumen Kresek, Sewu, Kresek, Madiun, East Java",
    "posisi": {
      "lat": "-7.705077299999999",
      "long": "111.63098339999999"
    }
  },
  {
    "nama": "Monumen Kapal Selam, Jalan Pemuda, Embong Kaliasin, Surabaya City, East Java",
    "posisi": {
      "lat": "-7.2654304",
      "long": "112.7503052"
    }
  },
  {
    "nama": "Monumen Jayandaru, Jalan Jenggolo, Rw1, Sidokumpul, Sidoarjo Regency, East Java",
    "posisi": {
      "lat": "-7.4462755",
      "long": "112.7184116"
    }
  }
]
*/
