/*
Project Name : TelegramBot( Surat Al-Quran ) *Support inline search query
Engine : Google App Script
Language Code : JavaScript
Date : 17-jun-2020 (6:12am)
Last Update : 17-jun-2020 (4:12pm)
Credit : @Aghisna12

Requirement:
- library telegram(unofficial) = https://blog.banghasan.com/note/tutorial/telegram/library-google-script-bot-api-telegram/

Info : Semoga bermanfaat dan berguna bagi yang membutuhkan

PENTING!: data yang akan kita ambil dari api di 'https://api.banghasan.com/' silakan kita ikuti syarat dan ketentuan untuk penggunaannya.

Referensi : github.com, stackoverflow.com, core.telegram.org, blog.banghasan.com

Terimakasih : Allah SWT

Situs : blog.banghasan.com, bmkg.go.id, script.google.com, https://t.me/botindonesia(telegram group), api.banghasan.com
*/

// masukkan token bot mu di sini
var token = "TOKEN BOT TELEGRAM";

//api server Data Surat Al-Quran 
var api_fatimah = "https://api.banghasan.com/quran/format/json/surat";

// buat objek baru kita kasih nama tg
var tg = new telegram.daftar(token);

//untuk mengirim respon pada Inline Search Query
function kirimInlineQuery(query_id, result) {
  tg.request('answerInlineQuery',{inline_query_id: query_id, results: JSON.stringify(result)});
}

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

//mencari informasi surat darikatakunci atau dengan nomor ayat untuk request inline query
function cariSuratInline(cari, ayat) {
  var hasil = cariInfo(cari);
  var hasil_surat = [];
  if (hasil.length > 1 && hasil.length < 114) {
    var uid = 0;
    hasil.forEach(function(object) {
      if (object.nomor) {
        var info_surat = cariInfoSurat(object.nomor);
        if (info_surat && info_surat[0].nama && info_surat[0].ayat && info_surat[0].nomor && info_surat[0].keterangan && info_surat.length == 1) {
          var keterangan = info_surat[0].keterangan;
          if (keterangan.includes("<br>")) {
            keterangan = keterangan.replace("<br>", "\n");
          }
          hasil_surat.push({
            'type':'article',
            'id':uid.toString(),
            'title':info_surat[0].nomor + '. ' + info_surat[0].nama + ' (' + info_surat[0].arti + ')',
            'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/free-36-144336.png',
            'description':'Jumlah Ayat : ' + info_surat[0].ayat,
            'message_text':'<b>' + info_surat[0].nomor + '. ' + info_surat[0].nama + '</b> (' + info_surat[0].arti + ')\n<i>' + info_surat[0].ayat + ' ayat, ' + info_surat[0].type + '</i>\n\n' + keterangan,
            'parse_mode':'HTML'
          });
          ++uid;
        }
      }
    });
  } else if (hasil.length == 1) {
    if (hasil[0].nomor) {
      var info_surat = cariInfoSurat(hasil[0].nomor);
      if (info_surat && info_surat[0].nama && info_surat[0].ayat && info_surat[0].nomor && info_surat[0].keterangan && info_surat.length == 1) {
        if (ayat) {
          var info_ayat = cariInfoAyat(info_surat[0].nomor, ayat);
          var hasil_ayat = '<b>' + info_surat[0].nomor + '. ' + info_surat[0].nama + '</b> (' + info_surat[0].arti + ')\n<i>' + info_surat[0].ayat + ' ayat,  ' + info_surat[0].type + '</i>\n\n';
          var hasil_ayat_tambah = "Ayat ke : " + ayat + "\n" + info_ayat[0].teks_ar + "\n" + info_ayat[0].teks_idt + "\n" + info_ayat[0].teks_id;
          if (hasil_ayat_tambah.includes("<br>")) {
            hasil_ayat_tambah = hasil_ayat_tambah.replace("<br>", "\n");
          }
          hasil_ayat += hasil_ayat_tambah;
          hasil_surat.push({
            'type':'article',
            'id':'1',
            'title':info_surat[0].nomor + '. ' + info_surat[0].nama + ' (' + info_surat[0].arti + ')',
            'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/free-36-144336.png',
            'description':'Ayat Ke : ' + ayat,
            'message_text':hasil_ayat,
            'parse_mode':'HTML'
          });
        } else {
          var keterangan = info_surat[0].keterangan;
          if (keterangan.includes("<br>")) {
            keterangan = keterangan.replace("<br>", "\n");
          }
          hasil_surat.push({
            'type':'article',
            'id':'1',
            'title':info_surat[0].nomor + '. ' + info_surat[0].nama + ' (' + info_surat[0].arti + ')',
            'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/free-36-144336.png',
            'description':'Jumlah Ayat : ' + info_surat[0].ayat,
            'message_text':'<b>' + info_surat[0].nomor + '. ' + info_surat[0].nama + '</b> (' + info_surat[0].arti + ')\n<i>' + info_surat[0].ayat + ' ayat, ' + info_surat[0].type + '</i>\n\n' + keterangan,
            'parse_mode':'HTML'
          });
        }
      }
    }
  } else {
    //info_surat = "Maaf, Pencarian Tidak Ditemukan";
  }
  return hasil_surat;
}

//mencari Surat berdasarkan katakunci atau dengan nomor ayat
function cariSurat(cari, ayat) {
  var hasil = cariInfo(cari);
  var info_surat;
  if (hasil.length > 1 && hasil.length < 114) {
    info_surat = "Maaf, Pencarian Anda Tidak Ditemukan\n\n<i>Mungkin yang anda cari:</i>\n";
    hasil.forEach(function(object) {
      info_surat += "\t‣ " + object.nomor + ". <code>" + object.surat + "</code>\n";
    });
  } else if (hasil.length == 1) {
    if (hasil[0].nomor) {
      var info = cariInfoSurat(hasil[0].nomor);
      if (info && info[0].nama && info[0].ayat && info[0].nomor && info[0].keterangan) {
        if (ayat) {
          var info_ayat = cariInfoAyat(info[0].nomor, ayat);
          info_surat = '<b>' + info[0].nomor + '. ' + info[0].nama + '</b> (' + info[0].arti + ')\n<i>' + info[0].ayat + ' ayat,  ' + info[0].type + '</i>\n\n';
          var info_surat_tambah = "Ayat ke : " + ayat + "\n" + info_ayat[0].teks_ar + "\n" + info_ayat[0].teks_idt + "\n" + info_ayat[0].teks_id;
          if (info_surat_tambah.includes("<br>")) {
            info_surat_tambah = info_surat_tambah.replace("<br>", "\n");
          }
          info_surat += info_surat_tambah;
        } else {
          var keterangan = info[0].keterangan;
          if (keterangan.includes("<br>")) {
            keterangan = keterangan.replace("<br>", "\n");
          }
          info_surat = '<b>' + info[0].nomor + '. ' + info[0].nama + '</b> (' + info[0].arti + ')\n<i>' + info[0].ayat + ' ayat,  ' + info[0].type + '</i>\n\n' + keterangan;
        }
      } else {
        info_surat = "Maaf, Informasi Tidak Ditemukan";
      }
    } else {
      info_surat = "Maaf, Nomor Surat Tidak Ditemukan";
    }
  } else {
    info_surat = "Maaf, Pencarian Tidak Ditemukan";
  }
  return info_surat;
}

//mencari informasi Surat dari semua daftar surat yang tersedia di server api dengan katakunci
function cariInfo(cari) {
  var semua_surat = {1:"Al Fatihah",2:"Al Baqarah",3:"Ali Imran",4:"An Nisaa",5:"Al Maidah",6:"Al An'am",7:"Al A'raf",8:"Al Anfaal",9:"At Taubah",10:"Yunus",11:"Huud",12:"Yusuf",13:"Ar Ra'du",14:"Ibrahim",15:"Al Hijr",16:"An Nahl",17:"Al Israa'",18:"Al Kahfi",19:"Maryam",20:"Thaahaa",21:"Al Anbiyaa",22:"Al Hajj",23:"Al Mu'minun",24:"An Nuur",25:"Al Furqaan",26:"Asy Syu'ara",27:"An Naml",28:"Al Qashash",29:"Al 'Ankabut",30:"Ar Ruum",31:"Luqman",32:"As Sajdah",33:"Al Ahzab",34:"Saba'",35:"Faathir",36:"Yaa Siin",37:"Ash Shaaffat",38:"Shaad",39:"Az Zumar",40:"Al Ghaafir",41:"Al Fushilat",42:"Asy Syuura",43:"Az Zukhruf",44:"Ad Dukhaan",45:"Al Jaatsiyah",46:"Al Ahqaaf",47:"Muhammad",48:"Al Fath",49:"Al Hujuraat",50:"Qaaf",51:"Adz Dzaariyaat",52:"Ath Thuur",53:"An Najm",54:"Al Qamar",55:"Ar Rahmaan",56:"Al Waaqi'ah",57:"Al Hadiid",58:"Al Mujaadalah",59:"Al Hasyr",60:"Al mumtahanah",61:"Ash Shaff",62:"Al Jumuah",63:"Al Munafiqun",64:"Ath Taghabun",65:"Ath Thalaaq",66:"At Tahriim",67:"Al Mulk",68:"Al Qalam",69:"Al Haaqqah",70:"Al Ma'aarij",71:"Nuh",72:"Al Jin",73:"Al Muzammil",74:"Al Muddastir",75:"Al Qiyaamah",76:"Al Insaan",77:"Al Mursalaat",78:"An Naba'",79:"An Naazi'at",80:"'Abasa",81:"At Takwiir",82:"Al Infithar",83:"Al Muthaffifin",84:"Al Insyiqaq",85:"Al Buruuj",86:"Ath Thariq",87:"Al A'laa",88:"Al Ghaasyiah",89:"Al Fajr",90:"Al Balad",91:"Asy Syams",92:"Al Lail",93:"Adh Dhuhaa",94:"Asy Syarh",95:"At Tiin",96:"Al 'Alaq",97:"Al Qadr",98:"Al Bayyinah",99:"Az Zalzalah",100:"Al 'Aadiyah",101:"Al Qaari'ah",102:"At Takaatsur",103:"Al 'Ashr",104:"Al Humazah",105:"Al Fiil",106:"Quraisy",107:"Al Maa'uun",108:"Al Kautsar",109:"Al Kafirun",110:"An Nashr",111:"Al Lahab",112:"Al Ikhlash",113:"Al Falaq",114:"An Naas"}
  var hasil = [];
  for (surat in semua_surat) {
    if (semua_surat[surat].toLowerCase().includes(cari.toLowerCase())) {
      hasil.push({'nomor':surat,'surat':semua_surat[surat]})
    }
  }
  return hasil;
}

//mencari informasi Surat berdasarkan nomor Surat
function cariInfoSurat(nomor) {
  var respon = UrlFetchApp.fetch(api_fatimah + "/" + nomor).getContentText();
  var hasil = [];
  if (respon) {
    var respon_json = JSON.parse(respon);
    if (respon_json.hasil) {
      var hasil_json = respon_json.hasil;
      if (hasil_json[0]) {
        hasil.push({
          'nomor':hasil_json[0].nomor,
          'nama':hasil_json[0].nama,
          'ayat':hasil_json[0].ayat,
          'type':hasil_json[0].type,
          'arti':hasil_json[0].arti,
          'keterangan':hasil_json[0].keterangan
        });
      }
    }
  }
  return hasil;
}

//mencari informasi Ayat dari nomor Surat dan nomor Ayat
function cariInfoAyat(nomor, ayat) {
  var respon = UrlFetchApp.fetch(api_fatimah + "/" + nomor + "/ayat/" + ayat).getContentText();
  var hasil = [];
  if (respon) {
    var respon_json = JSON.parse(respon);
    if (respon_json.ayat) {
      var hasil_json = respon_json.ayat;
      if (hasil_json.data) {
        hasil.push({
          'teks_ar':hasil_json.data.ar[0].teks,
          'teks_idt':hasil_json.data.idt[0].teks,
          'teks_id':hasil_json.data.id[0].teks
        });
      }
    }
  }
  return hasil;
}

//jika value integer/angka
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}

// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  // detek klo ada pesan teks dari user
  if (update.message) { 
    
    //simpan pesan bantuan
    var help_msg = "Maaf, perintah yang anda masukan salah. penggunaan: <code>/info Surat Ayat</code>\ncontoh penggunan: <code>/info Ibrahim</code>\n<code>/info Ikhlas 2</code>";
    
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
    
    //jika user ketik /info <nama Surat Al-Quran> untuk info data surat Al-quran
    else if ( /\/info/i.exec(text) ){
      //memulai memngambil data dari web api server penyedia data Surat Al-Quran
      if (text.includes(" ")) {
        var split_info = text.split(" ");
        var hasil;
        if (split_info.length > 2) {
          if (split_info.length == 3) {
            if (isInt(split_info[2])) {
              hasil = cariSurat(split_info[1], split_info[2]);
            } else {
              hasil = cariSurat(split_info[1] + " " + split_info[2]);
            }
          } else {
            if (split_info.length == 4) {
              hasil = cariSurat(split_info[1] + " " + split_info[2], split_info[split_info.length - 1]);
            }
          }
          //lanjut kirim ke user datanya
          return tg.kirimPesan(chat_id, hasil, 'HTML', true);
        } else {
          if (split_info.length == 2) {
            hasil = cariSurat(split_info[1]);
          }
          return tg.kirimPesan(chat_id, hasil, 'HTML', true);
        }
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
  //jika pesan berupa search query(inline query)
  else if (update.inline_query) {
    
    // penyederhanaan variable inline query
    var msg = update.inline_query;
    var text = msg.query;
    var query_id = msg.id;
    //var chat_id = msg.from.id;
    //ambil data Surat Al-Quran dari server api.banghasan.com
    if (text.length >= 2) {
      if (text.includes(" ")) {
        var split_info = text.split(" ");
        var hasil;
        if (split_info.length > 1) {
          if (split_info.length == 2) {
            if (isInt(split_info[1])) {
              hasil = cariSuratInline(split_info[0], split_info[1]);
            } else {
              hasil = cariSuratInline(split_info[0] + " " + split_info[1]);
            }
          } else {
            if (split_info.length == 3) {
              hasil = cariSuratInline(split_info[0] + " " + split_info[1], split_info[split_info.length - 1]);
            }
          }
          //lanjut kirim ke user datanya
          kirimInlineQuery(query_id, hasil);
        } else {
          if (split_info.length == 1) {
            hasil = cariSuratInline(split_info[0]);
          }
          kirimInlineQuery(query_id, hasil);
        }
      } else {
        var data = cariSuratInline(text);
        //kirim data ke result query pencarian
        kirimInlineQuery(query_id, data);
      }
    }
    
    //akhir deteksi pesan query
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
  var webAppUrl = "WEB APP SCRIPT";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}

/*
//generate semua surat dari api server
function semua_surat() {
  var respon = UrlFetchApp.fetch(api_fatimah).getContentText();
  if (respon) {
    var respon_json = JSON.parse(respon);
    var respon_hasil = respon_json.hasil;
    if (respon_hasil) {
      var surat = "{";
      respon_hasil.forEach(function(object, index) {
        if (index == respon_hasil.length - 1) {
          surat += object.nomor + ':"' + object.name + '"';
        } else {
          surat += object.nomor + ':"' + object.name + '",';
        }
      });
      Logger.log(surat + "}");
    }
  }
}
//output:
//{1:"Al Fatihah",2:"Al Baqarah",3:"Ali Imran",4:"An Nisaa",5:"Al Maidah",6:"Al An'am",7:"Al A'raf",8:"Al Anfaal",9:"At Taubah",10:"Yunus",11:"Huud",12:"Yusuf",13:"Ar Ra'du",14:"Ibrahim",15:"Al Hijr",16:"An Nahl",17:"Al Israa'",18:"Al Kahfi",19:"Maryam",20:"Thaahaa",21:"Al Anbiyaa",22:"Al Hajj",23:"Al Mu'minun",24:"An Nuur",25:"Al Furqaan",26:"Asy Syu'ara",27:"An Naml",28:"Al Qashash",29:"Al 'Ankabut",30:"Ar Ruum",31:"Luqman",32:"As Sajdah",33:"Al Ahzab",34:"Saba'",35:"Faathir",36:"Yaa Siin",37:"Ash Shaaffat",38:"Shaad",39:"Az Zumar",40:"Al Ghaafir",41:"Al Fushilat",42:"Asy Syuura",43:"Az Zukhruf",44:"Ad Dukhaan",45:"Al Jaatsiyah",46:"Al Ahqaaf",47:"Muhammad",48:"Al Fath",49:"Al Hujuraat",50:"Qaaf",51:"Adz Dzaariyaat",52:"Ath Thuur",53:"An Najm",54:"Al Qamar",55:"Ar Rahmaan",56:"Al Waaqi'ah",57:"Al Hadiid",58:"Al Mujaadalah",59:"Al Hasyr",60:"Al mumtahanah",61:"Ash Shaff",62:"Al Jumuah",63:"Al Munafiqun",64:"Ath Taghabun",65:"Ath Thalaaq",66:"At Tahriim",67:"Al Mulk",68:"Al Qalam",69:"Al Haaqqah",70:"Al Ma'aarij",71:"Nuh",72:"Al Jin",73:"Al Muzammil",74:"Al Muddastir",75:"Al Qiyaamah",76:"Al Insaan",77:"Al Mursalaat",78:"An Naba'",79:"An Naazi'at",80:"'Abasa",81:"At Takwiir",82:"Al Infithar",83:"Al Muthaffifin",84:"Al Insyiqaq",85:"Al Buruuj",86:"Ath Thariq",87:"Al A'laa",88:"Al Ghaasyiah",89:"Al Fajr",90:"Al Balad",91:"Asy Syams",92:"Al Lail",93:"Adh Dhuhaa",94:"Asy Syarh",95:"At Tiin",96:"Al 'Alaq",97:"Al Qadr",98:"Al Bayyinah",99:"Az Zalzalah",100:"Al 'Aadiyah",101:"Al Qaari'ah",102:"At Takaatsur",103:"Al 'Ashr",104:"Al Humazah",105:"Al Fiil",106:"Quraisy",107:"Al Maa'uun",108:"Al Kautsar",109:"Al Kafirun",110:"An Nashr",111:"Al Lahab",112:"Al Ikhlash",113:"Al Falaq",114:"An Naas"}
*/
