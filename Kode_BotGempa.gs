/*
Project Name : TelegramBot( Info Gempa Bumi )
Engine : Google App Script
Language Code : JavaScript
Date : 26-jun-2020 (5:23am)
Last Update : none
Credit : @Aghisna12

Requirement:
- library telegram(unofficial) = https://blog.banghasan.com/note/tutorial/telegram/library-google-script-bot-api-telegram/

Info : Semoga bermanfaat dan berguna bagi yang membutuhkan

PENTING!: data yang akan kita ambil dari api di 'https://data.bmkg.go.id/gempabumi/' silakan kita ikuti syarat dan ketentuan penggunaannya.

Referensi : github.com, stackoverflow.com, core.telegram.org, blog.banghasan.com

Terimakasih : Allah SWT

Situs : blog.banghasan.com, data.bmkg.go.id, script.google.com, https://t.me/botindonesia(telegram group)
*/

var token = "API TOKEN BOT TELEGRAM";

var api_bmkg = "https://data.bmkg.go.id/";

var tg = new telegram.daftar(token);

function gempaTerkini(range) {
  var hasil = [];
  var data_gempa = UrlFetchApp.fetch(api_bmkg + "gempaterkini.xml");
  if (data_gempa.getContentText()) {
    var data = data_gempa.getContentText();
    var gempa_terkini = XmlService.parse(data);
    if (gempa_terkini) {
      var info_gempa = gempa_terkini.getRootElement();
      if (info_gempa) {
        var daftar_gempa = info_gempa.getChildren();
        if (daftar_gempa) {
          var min_range = 0;
          var max_range = 4;
          if (range.includes("~")) {
            var split_range = range.split("~");
            if (split_range.length == 2) {
              min_range = split_range[0];
              if (min_range == 1) {
                min_range = 0;
              }
              max_range = split_range[1];
            }
          }
          daftar_gempa.forEach(function(object, index ) {
            if (index >= min_range && index <= max_range) {
              if (object.getChild("Tanggal") && object.getChild("Jam") && object.getChild("Lintang") && object.getChild("Bujur") && object.getChild("Magnitude") && object.getChild("Kedalaman") && object.getChild("Wilayah")) {
                hasil.push({
                  'tanggal':object.getChild("Tanggal").getText(),
                  'jam':object.getChild("Jam").getText(),
                  'lintang':object.getChild("Lintang").getText(),
                  'bujur':object.getChild("Bujur").getText(),
                  'magnitude':object.getChild("Magnitude").getText(),
                  'kedalaman':object.getChild("Kedalaman").getText(),
                  'wilayah':object.getChild("Wilayah").getText()
                });
              }
            }
          });
        }
      }
    }
  }
  return hasil;
}

function gempaDirasakan(range) {
  var hasil = [];
  var data_gempa = UrlFetchApp.fetch(api_bmkg + "gempadirasakan.xml");
  if (data_gempa.getContentText()) {
    var data = data_gempa.getContentText();
    var gempa_dirasakan = XmlService.parse(data);
    if (gempa_dirasakan) {
      var info_gempa = gempa_dirasakan.getRootElement();
      if (info_gempa) {
        var daftar_gempa = info_gempa.getChildren();
        if (daftar_gempa) {
          var min_range = 0;
          var max_range = 4;
          if (range.includes("~")) {
            var split_range = range.split("~");
            if (split_range.length == 2) {
              min_range = split_range[0];
              if (min_range == 1) {
                min_range = 0;
              }
              max_range = split_range[1];
            }
          }
          daftar_gempa.forEach(function(object, index ) {
            if (index >= min_range && index <= max_range) {
              if (object.getChild("Tanggal") && object.getChild("Posisi") && object.getChild("Magnitude") && object.getChild("Kedalaman") && object.getChild("Keterangan") && object.getChild("Dirasakan")) {
                hasil.push({
                  'tanggal':object.getChild("Tanggal").getText(),
                  'posisi':object.getChild("Posisi").getText(),
                  'magnitude':object.getChild("Magnitude").getText(),
                  'kedalaman':object.getChild("Kedalaman").getText(),
                  'keterangan':object.getChild("Keterangan").getText(),
                  'dirasakan':object.getChild("Dirasakan").getText()
                });
              }
            }
          });
        }
      }
    }
  }
  return hasil;
}


// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  //simpan pesan bantuan
  var help_msg = "Maaf, perintah yang anda masukan salah. penggunaan: <code>/terkini 'range hasil'</code>\n<code>/dirasakan 'range hasil'</code>\ncontoh penggunan: <code>/terkini 0~4</code>\n<code>/dirasakan 2~6</code>";
  
  // detek klo ada pesan teks dari user
  if (update.message) { 
    
    // penyederhanaan variable pesan text
    var msg = update.message;
    var text = msg.text;
    var chat_id = msg.chat.id;
    
    // jika user ketik /ping, bot akan jawab Pong!
    if ( /\/ping/i.exec(text) ){
      return tg.kirimPesan(chat_id, '<b>Pong!</b>' + chat_id, 'HTML');
    }
    
    // eh ini saya tambahkan lagi, jika user klik start
    else if ( /\/start/i.exec(text) ){
      return tg.kirimPesan(chat_id, "Selamat datang, Semoga bermanfaat.\nTerimakasih...", 'HTML');
    }
    
    //jika user ketik /terkini <index hasil range> untuk info data Gemba Bumi di Indonesia Terkini
    else if ( /\/terkini/i.exec(text) ){
      //memulai memngambil data Gempa Bumi Terkini di Indonesia dari web api server BMKG penyedia data terbuka
      var data_gempa_terkini = gempaTerkini(text.replace("/terkini ", ""));
      if (data_gempa_terkini.length > 0) {
        var hasil = "<b>Data Gempa Bumi Terkini di Indonesia</b>";
        data_gempa_terkini.forEach(function(object, index) {
          hasil += "\n\n\t‣ " + object.tanggal + " " + object.jam;
          hasil += "\n\t\t• " + object.lintang + " " + object.bujur;
          hasil += "\n\t\t• " + object.magnitude;
          hasil += "\n\t\t• " + object.kedalaman;
          hasil += "\n\t\t• " + object.wilayah;
        });
        hasil += "\n\nSumber:<a href='https://data.bmkg.go.id/gempabumi/'>BMKG</a>";
        return tg.kirimPesan(chat_id, hasil, 'HTML', true);
      } else {
        return tg.kirimPesan(chat_id, help_msg, 'HTML');
      }
    }
    
    //jika user ketik /dirasakan <index hasil range> untuk info data Gemba Bumi di Indonesia yang Dirasakan
    else if ( /\/dirasakan/i.exec(text) ){
      //memulai memngambil data Gempa Bumi yang Dirasakan di Indonesia dari web api server BMKG penyedia data terbuka
      var data_gempa_dirasakan = gempaDirasakan(text.replace("/dirasakan ", ""));
      if (data_gempa_dirasakan.length > 0) {
        var hasil = "<b>Data Gempa Bumi yang Dirasakan di Indonesia</b>";
        data_gempa_dirasakan.forEach(function(object, index) {
          hasil += "\n\n\t‣ " + object.tanggal;
          hasil += "\n\t\t• " + object.posisi;
          hasil += "\n\t\t• " + object.magnitude;
          hasil += "\n\t\t• " + object.kedalaman;
          hasil += "\n\t\t• " + object.keterangan;
          hasil += "\n\t\t• " + object.dirasakan;
        });
        hasil += "\n\nSumber:<a href='https://data.bmkg.go.id/gempabumi/'>BMKG</a>";
        return tg.kirimPesan(chat_id, hasil, 'HTML', true);
      } else {
        return tg.kirimPesan(chat_id, help_msg, 'HTML');
      }
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

//menentukan webhook yang di set dari server telegram dengan identitas token bot dan situs point webhook untuk bot
function setWebhook() {
  // Isi dengan web App URL yang di dapat saat deploy
  var webAppUrl = "URL WEB APP HASIL DEPLOY";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}
