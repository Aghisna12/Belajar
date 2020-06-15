/*
Project Name : TelegramBot( Data Covid-19 Indonesia ) *Support inline query
Engine : Google App Script
Language Code : JavaScript
Date : 14-jun-2020 (6:12am)
Last Update : none
Credit : @Aghisna12

Info : Ini merupakan lanjutan / pengembangan dari project sebelumnya untuk TelegramBot Data Covid-19 Indonesia dengan penambahan inline search query

Referensi : github.com
            stackoverflow.com
            core.telegram.org
            blog.banghasan.com

Terimakasih : Allah SWT
              blog.banghasan.com
              kawalkorona.com
              script.google.com
*/

// masukkan token bot mu di sini
var token = "API TOKEN TELEGRAM BOT";

//api server data Covid-19 dari kawalcorona.com untuk semua provinsi khusus di Indonesia
//credit : Teguh Aprianto [ Ethical Hacker Indonesia ]
var api_covid_19 = "https://api.kawalcorona.com/indonesia/provinsi/";

// buat objek baru kita kasih nama tg
var tg = new telegram.daftar(token);

//untuk mengirim result query dari pencarian kata kunci
//saya coba pakai library Telegram(bang Hasan [unofficial]) 'tg.request(..' tapi gagal :(
/*
function kirimInlineQuery(query_id, result) {
  var data = {
    method: "post",
    payload: {
      method: "answerInlineQuery",
      inline_query_id: query_id,
      results: JSON.stringify(result)//merubah array(json) ke string json, supaya aman sebagai data parameter
    }
  }
  //fetch ke server api telegram sesuai identitas bot token
  return UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data);
}
*/

//Update pake lib
function kirimInlineQuery(query_id, result) {
  tg.request('answerInlineQuery',{inline_query_id: query_id, results: JSON.stringify(result)});
}

// fungsi buat handle hanya menerima pesan berupa POST, kalau GET keluarkan pesan error
function doGet(e) {
  return HtmlService.createHtmlOutput("Hanya data POST yang kita proses yak!");
}

/*
//runtime debug ke chat telegram
function debugLog(msg) {
  tg.kirimPesan("chat_id", msg);
}
*/

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

//data Covid-19 untuk wilayah Indonesia dari api (kawalcorona.com)
function dataCovid(cari_provinsi, isQuery) {
  //mengambil semua data untuk semua provinsi di indonesia
  var respon = UrlFetchApp.fetch(api_covid_19);
  //parse hasil response json dari server api kawalcorona.com
  var hasil =  JSON.parse(respon);
  //untuk menyimpan result(hasil akhir) yang akan dikirimkan ke user
  var result = "";
  //untuk menyimpan hasil sebagai inline query array
  var hasilQuery = [];
  //menyimpan id dari index hasil looping
  var uid = 0;
  //looping data dari semua provinsi
  hasil.forEach(function(object) {
    //menyimpan variable data dari array
    var provinsi = object.attributes.Provinsi;
    var kasus_positif = object.attributes.Kasus_Posi;
    var kasus_sembuh = object.attributes.Kasus_Semb;
    var kasus_meninggal = object.attributes.Kasus_Meni;
    //jika user meminta hanya spesifikasi provinsi tertentu, kita ambil dari parameter dan bukan request query
    if ((" " + provinsi).toLowerCase().includes(cari_provinsi.toLowerCase()) && !isQuery && cari_provinsi.length > 0) {
      //ini untuk spesifikasi dari provinsi yang diminta user
      result = "<b><u>Provinsi : " + provinsi + "</u></b>\n\n";
      result += "Kasus Positif : " + kasus_positif + "\nKasus Sembuh : " + kasus_sembuh + "\nKasus Meninggal : " + kasus_meninggal + "\n\n";
    } else {
      //jika user hanya mengetik '/info' maka akan mengambil untuk semua provinsi di Indonesia
      if (cari_provinsi == "" || cari_provinsi.length < 1 && !isQuery) { //dan bukan request query
        //menyimpan result(hasil akhir) dengan append variable data
        result += "<b><u>Provinsi : " + provinsi + "</u></b>\n\n";
        result += "Kasus Positif : " + kasus_positif + "\nKasus Sembuh : " + kasus_sembuh + "\nKasus Meninggal : " + kasus_meninggal + "\n\n";
      }
      //jika data yang diminta(request) untuk data query
      if(isQuery) {
        //jika variable provinsi terdapat kata yang di cari
        if (provinsi.toLowerCase().includes(cari_provinsi.toLowerCase())) {
          //push atau tambah data ke variable hasilQuery
          hasilQuery.push({
            'type':'article',
            'id':uid.toString(),
            'title':provinsi,
            'description':'P:' + kasus_positif + ' S:' + kasus_sembuh + ' M:' + kasus_meninggal,
            'message_text': 'Maaf, belum support.'
          })
          //otomatis menambah nilai +1 setiap loop
          ++uid;
        }
      }
    }
  });
  //if (jika)
  if (isQuery) {
    //jika request untuk query
    return hasilQuery;
  } else {
    //jika request untuk pesan teks
    return result;
  }
  //selesai result(hasil akhir)
}

// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  // detek klo ada pesan teks dari user
  if (update.message) { 

    //simpan pesan bantuan
    var help_msg = "Maaf, perintah yang anda masukan salah.";
    
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
      return tg.kirimPesan(chat_id, "Pesan diterima!\n\nLanjutkan bang..!", 'HTML');
    }
    
    //jika user ketik /info <Provinsi> untuk info data Covid-19 di Indonesia
    else if ( /\/info/i.exec(text) ){
      //memulai memngambil data dari web api
      var covid = dataCovid(text.replace("/info", ""), false);
      //lanjut kirim ke user datanya
      return tg.kirimPesan(chat_id, covid, 'HTML');
    }

    // kalau nanti mau kembangin sendiri menjadi bot interaktif, code nya taruh disini
    // atau buatkan fungsi tersendiri saja buat handle nya biar ga bertumpuk panjang
    // -- mulai custom text --
    
    //jika semua if statement salah
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
    var chat_id = msg.from.id;
    /*debugLog(text + "\n" + chat_id);*/
    //ambil data dari server api Kawalcorona.com
    var data = dataCovid(text, true);
    /*debugLog(data);*/
    //kirim data ke result query pencarian
    kirimInlineQuery(query_id, data);
    
    //akhir deteksi pesan query
  }
  
  else {
    return tg.kirimPesan(chat_id, help_msg, 'HTML');
  }
  //akhir deteksi semua pesan dari user
}

function setWebhook() {
  // Isi dengan web App URL yang di dapat saat deploy
  var webAppUrl = "URL WEB APP SCRIPT HASIL DEPLOY";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}
