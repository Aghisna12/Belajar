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
          var map_d = json.d;
          var maps = map_d.match(/,\[\["0x(.*?)\]/g);
          if (maps) {
            for (var index in maps) {
              var map = maps[index];
              if (map.includes("null,")) {
                map = map.replace(/null,/g, "");
              }
              var map_r = /,\[\["(.*?)","(.*?), (.*?)"(.*?)\[(.*?)\]/g.exec(map);
              if (map_r.length == 6) {
                if (map_r[5].includes(",")) {
                  var pos_r = map_r[5].split(",");
                  if (pos_r && pos_r.length == 2) {
                    hasil.push({'nama':map_r[2], 'alamat':map_r[3], 'posisi':{'lat':pos_r[0],'long':pos_r[1]}});
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

/*
Output Logger://testMaps()
 [
  {
    "nama": "Monumen Nasional",
    "alamat": "Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta",
    "posisi": {
      "lat": "-6.1753924",
      "long": "106.8271528"
    }
  },
  {
    "nama": "Monumen Yogya Kembali",
    "alamat": "Jl. Ring Road Utara, Jongkang, Sariharjo, Kabupaten Sleman, Daerah Istimewa Yogyakarta",
    "posisi": {
      "lat": "-7.7495904",
      "long": "110.3696068"
    }
  },
  {
    "nama": "Monumen Kresek",
    "alamat": "Sewu, Kresek, Madiun, Jawa Timur",
    "posisi": {
      "lat": "-7.705077299999999",
      "long": "111.63098339999999"
    }
  },
  {
    "nama": "Monumen Tugu",
    "alamat": "Gowongan, Kota Yogyakarta, Daerah Istimewa Yogyakarta",
    "posisi": {
      "lat": "-7.782984",
      "long": "110.367035"
    }
  },
  {
    "nama": "Monumen Kapal Selam",
    "alamat": "Jalan Pemuda, Embong Kaliasin, Kota Surabaya, Jawa Timur",
    "posisi": {
      "lat": "-7.2654304",
      "long": "112.7503052"
    }
  }
]
*/
