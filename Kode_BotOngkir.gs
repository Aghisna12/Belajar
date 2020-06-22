/*
Project Name : TelegramBot( Cek Ongkir )
Engine : Google App Script
Language Code : JavaScript
Date : 22-jun-2020 (7:00am)
Last Update : none
Credit : @Aghisna12

Requirement:
- library telegram(unofficial) = https://blog.banghasan.com/note/tutorial/telegram/library-google-script-bot-api-telegram/

Info : Semoga bermanfaat dan berguna bagi yang membutuhkan

PENTING!: data yang akan kita ambil dari api di 'ruangapi.com' silakan kita ikuti syarat dan ketentuan penggunaannya.

Referensi : github.com, stackoverflow.com, core.telegram.org, blog.banghasan.com

Terimakasih : Allah SWT

Situs : blog.banghasan.com, ruangapi.com, script.google.com, https://t.me/botindonesia(telegram group)
*/

//setting maksimal hasil pencarian untuk inline search query. bertujuan meminimalisir overload/timeout
var maksimal_hasil_inline_search_query = 4;

// masukkan token bot mu di sini
var token = "API TOKEN BOT TELEGRAM";

//ruangapi api key
var api_key = "API TOKEN RUANGAPI.COM";

//ruangapi server
var api_server = "https://ruangapi.com/api/v1/";

// buat objek baru kita kasih nama tg
var tg = new telegram.daftar(token);

// fungsi buat handle hanya menerima pesan berupa POST, kalau GET keluarkan pesan error
function doGet(e) {
  return HtmlService.createHtmlOutput("Hanya data POST yang kita proses yak!");
}

// fungsi buat handle pesan POST
function doPost(e) {
  
  // Memastikan pesan yang diterima hanya dalam format JSON  
  if(e.postData.type == "application/json") {
    
    // Kita parsing data yang masuk
    var update = JSON.parse(e.postData.contents);
    
    // Jika data pesan update valid, kita proses
    if (update) {
      //kirim variable update ke fungsi 'prosesPesan'
      prosesPesan(update);
    }
  } 
}

function buatQuery(params) {
  var hasil = [];
  if (params) {
    var i = 0;
    for (var obj in params) {
      var pertama = encodeURIComponent(obj);
      var kedua = encodeURIComponent(params[obj]);
      if (pertama && kedua) {
        hasil.push({
          'pertama':pertama,
          'kedua':kedua
        });
      }
      ++i;
    };
  }
  if (hasil) {
    var hasil_query = "?";
    hasil.forEach(function(coba, idx) {
      var pertama = coba.pertama;
      var kedua = coba.kedua;
      if (idx == hasil.length - 1) {
        hasil_query += pertama + "=" + kedua;
      } else {
        hasil_query += pertama + "=" + kedua + "&";
      }
    });
    return hasil_query;
  } else {
    return "";
  }
}

function cariKecamatan(keyword) {
  var hasil = [];
  if (keyword) {
    var query = {
      'q':keyword
    };
    var data = {
      'method':'get',
      'headers':{
        'Authorization':api_key
      }
    };
    var respon = UrlFetchApp.fetch(api_server + "districts" + buatQuery(query), data);
    if (respon) {
      var json = JSON.parse(respon);
      if (json.data.results) {
        var results = json.data.results;
        results.forEach(function(object, index) {
          if (object.id && object.name && object.city.name) {
            hasil.push({
              'id_kec':object.id,
              'kecamatan':object.name,
              'kota':object.city.name
            });
          }
        });
      }
    }
  }
  return hasil;
}

function cariKabKota(keyword) {
  var hasil = [];
  if (keyword) {
    var query = {
      'q':keyword
    };
    var data = {
      'method':'get',
      'headers':{
        'Authorization':api_key
      }
    };
    var respon = UrlFetchApp.fetch(api_server + "cities" + buatQuery(query), data);
    if (respon) {
      var json = JSON.parse(respon);
      if (json.data.results) {
        var results = json.data.results;
        results.forEach(function(object, index) {
          if (object.id && object.name && object.postal_code) {
            hasil.push({
              'id_kota':object.id,
              'kota':object.name,
              'pos':object.postal_code
            });
          }
        });
      }
    }
  }
  return hasil;
}

function cekOngkir(asal, tujuan, berat, kurir) {
  var hasil = [];
  if (asal, tujuan, berat, kurir) {
    var data = {
      'method':'post',
      'headers':{
        'Authorization':api_key
      },
      'payload':{
        'origin':asal,
        'destination':tujuan,
        'weight':berat,
        'courier':kurir
      }
    };
    var respon = UrlFetchApp.fetch(api_server + "shipping", data);
    if (respon) {
      Logger.log(respon);
      var json = JSON.parse(respon);
      if (json.data.origin && json.data.destination && json.data.results) {
        var asal = 'Asal: ' + json.data.origin.city_name + ' (' + json.data.origin.province + ')\n';
        var tujuan = 'Tujuan: ' + json.data.destination.district_name + ', ' + json.data.destination.city + ' (' + json.data.destination.province + ')\n';
        var results = json.data.results;
        if (results.length > 0) {
          results.forEach(function(object) {
            hasil.push({
              'kurir':object.courier,
              'nama':object.service,
              'deskripsi':object.description,
              'estimasi':object.estimate,
              'harga':object.cost
            });
          });
        }
      }
    }
  }
  return hasil;
}

function cariOngkir(kurir, asal, berat, tujuan) {
  var id_kota_asal, nama_kota_asal, kode_pos_asal;
  var kab_kota = cariKabKota(asal);
  if (kab_kota.length > 0) {
    if (kab_kota.length == 1) {
      id_kota_asal = kab_kota[0].id_kota;
      nama_kota_asal = kab_kota[0].kota;
      kode_pos_asal = kab_kota[0].pos;
    } else {
      var ketemu = false;
      var banyak_kab_kota = "Maaf, Kab/Kota Tidak Ditemukan\n\n<i>Mungkin yang anda cari:</i>\n";
      kab_kota.forEach(function(object) {
        if (object.kota.toLowerCase() == asal.toLowerCase() && !ketemu) {
          ketemu = true;
          id_kota_asal = object.id_kota;
          nama_kota_asal = object.kota;
          kode_pos_asal = object.pos;
        } else {
          banyak_kab_kota += "\t‣ <code>" + object.kota + "</code> (" + object.pos + ")\n";
        }
      });
      if (!ketemu) {
        return banyak_kab_kota;
      }
    }
  }
  var id_kecamatan_tujuan, nama_kecamatan_tujuan, nama_kota_tujuan;
  var kec_kota = cariKecamatan(tujuan);
  if (kec_kota.length > 0) {
    if (kec_kota.length == 1) {
      id_kecamatan_tujuan = kec_kota[0].id_kec;
      nama_kecamatan_tujuan = kec_kota[0].kecamatan;
      nama_kota_tujuan = kec_kota[0].kota;
    } else {
      var ketemu = false;
      var banyak_kecamatan = "\nMaaf, Kecamatan Tidak Ditemukan\n\n<i>Mungkin yang anda cari:</i>\n";
      kec_kota.forEach(function(object) {
        if (object.kecamatan.toLowerCase() == tujuan.toLowerCase() && !ketemu) {
          ketemu = true;
          id_kecamatan_tujuan = object.id_kec;
          nama_kecamatan_tujuan = object.kecamatan;
          nama_kota_tujuan = object.kota;
        } else {
          banyak_kecamatan += "\t‣ <code>" + object.kecamatan + "</code> (" + object.kota + ")\n";
        }
      });
      if (!ketemu) {
        return banyak_kecamatan;
      }
    }
  }
  var hasil = "";
  if (id_kota_asal && id_kecamatan_tujuan) {
    hasil = "Asal : <b>" + nama_kota_asal + " (" + kode_pos_asal + ")</b>\nTujuan : <b>" + nama_kecamatan_tujuan + " (" + nama_kota_tujuan + ")</b>";
    var data_ongkir = cekOngkir(id_kota_asal, id_kecamatan_tujuan, berat, kurir);
    if (data_ongkir.length > 0) {
      var tmp_kurir;
      data_ongkir.forEach(function(object) {
        var hasil_kurir = object.kurir;
        var hasil_nama = object.nama;
        if (hasil_nama.includes("<") || hasil_nama.includes(">")) {
          hasil_nama = hasil_nama.replace("<", "&lt;");
          hasil_nama = hasil_nama.replace(">", "&gt;");
        }
        var deskripsi = object.deskripsi;
        var harga = object.harga;
        var estimasi = object.estimasi;
        if (estimasi) {
          estimasi += " hari";
        }
        if (hasil_kurir != tmp_kurir) {
          tmp_kurir = hasil_kurir;
          hasil += "\n\n\t‣ " + hasil_kurir + "\n\t\t• " + hasil_nama;
          if (deskripsi) {
            hasil += "\n\t\t\t⁃ " + deskripsi;
          }
          if (harga) {
            hasil += "\n\t\t\t⁃ Rp " + harga;
          }
          if (estimasi) {
            hasil += "\n\t\t\t⁃ " + estimasi;
          }
        } else {
          tmp_kurir = hasil_kurir;
          hasil += "\n\t\t• " + hasil_nama;
          if (deskripsi) {
            hasil += "\n\t\t\t⁃ " + deskripsi;
          }
          if (harga) {
            hasil += "\n\t\t\t⁃ Rp " + harga;
          }
          if (estimasi) {
            hasil += "\n\t\t\t⁃ " + estimasi;
          }
        }
      });
    } else {
      hasil += "Maaf, Hasil Tidak Ditemukan.";
    }
  }
  return hasil;
}

//https://stackoverflow.com/a/14794066
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}

//menyusun interaksi user, dengan membedakan jenis katakunci asal, berat dan tujuan (untuk jenis private message)
function pencarianInfo(katakunci) {
  var hasil = [];
  if (katakunci.includes(" ")) {
    var split_kata = katakunci.split(" ");
    if (split_kata.length > 0) {
      var ketemu = false;
      var asal = "";
      var berat = "";
      var tujuan = "";
      var kurir = "";
      split_kata.forEach(function(object, index) {
        if (isInt(object)) {
          ketemu = true;
          berat = object;
        } else {
          if (ketemu) {
            tujuan += object + " ";
          } else {
            if (object.includes("/")) {
              kurir = object.replace("/", "");
            } else {
              asal += object + " ";
            }
          }
        }
      });
      hasil.push({
        'kurir':kurir,
        'asal':asal.slice(0, asal.length - 1),
        'berat':berat,
        'tujuan':tujuan.slice(0, tujuan.length - 1)
      });
    }
  }
  return hasil;
}

// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  // detek klo ada pesan teks dari user
  if (update.message) { 
    
    //simpan pesan bantuan
    var help_msg = "Maaf, perintah yang anda masukan salah. penggunaan: <code>/KURIR ASAL BERAT TUJUAN</code>\ncontoh penggunan: <code>/jne sleman 800 klaten</code>";
    
    // penyederhanaan variable pesan text
    var msg = update.message;
    var text = msg.text;
    var chat_id = msg.chat.id;
    
    // jika user ketik /ping, bot akan jawab Pong!
    if ( /\/ping/i.exec(text) ){
      return tg.kirimPesan(chat_id, '<b>Pong!</b>', 'HTML');
    }
    
    // eh ini saya tambahkan lagi, jika user klik start
    else if ( /\/start/i.exec(text) ){
      return tg.kirimPesan(chat_id, "Selamat datang, Semoga bermanfaat.\nTerimakasih...", 'HTML');
    }
    
    //jika user ketik teks dan mengandung "/"
    else if ( /\//i.exec(text) ){
      var katakunci = pencarianInfo(text);
      if (katakunci.length == 1) {
        var hasil = "";
        if (katakunci[0].kurir && katakunci[0].asal && katakunci[0].berat && katakunci[0].tujuan) {
          hasil = cariOngkir(katakunci[0].kurir, katakunci[0].asal, katakunci[0].berat, katakunci[0].tujuan);
        } else {
          hasil = help_msg;
        }
        return tg.kirimPesan(chat_id, hasil, 'HTML');
      }
      return tg.kirimPesan(chat_id, help_msg, 'HTML');
    }
    
    // kalau nanti mau kembangin sendiri menjadi bot interaktif, code nya taruh disini
    // atau buatkan fungsi tersendiri saja buat handle nya biar ga bertumpuk panjang
    // -- mulai custom text --
    
    //jika if statement diatas salah
    else {
      return tg.kirimPesan(chat_id, help_msg, 'HTML');
    }
    
    // akhir deteksi pesan text
    
  }
  
  //jika if statement diatas salah
  else {
    return tg.kirimPesan(chat_id, help_msg, 'HTML');
  }
  //akhir deteksi semua pesan dari user
}

//menentukan webhook yang di set dari server telegram dengan identitas token bot dan situs point webhook untuk bot
function setWebhook() {
  // Isi dengan web App URL yang di dapat saat deploy
  var webAppUrl = "URL WEB APP HASIL DEPLOY";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}
