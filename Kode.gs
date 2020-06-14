/*
Project Name : TelegramBot( Data Covid-19 Indonesia & ChatBot Indo)
Engine : Google App Script
Language Code : JavaScript
Date : 13-jun-2020 (4:33pm)
Last Update : none
Credit : @Aghisna12

Info : Dihari minggu saat libur, iseng-iseng nyoba tutorial di blog Bang Hasan (https://blog.banghasan.com/note/tutorial/bot/telegram/google%20script/Bot-Telegram-GoogleScript-Chatbot/).
       Lalu saya kembangkan dengan data covid-19 dari web api Kawalcorona.com

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
var token = 'TULIS BOT TOKEN TELEGRAM';

//api server chatbot-indo
var api_chatbot_indo = "https://chatbot-indo.herokuapp.com/get/";

//api server data Covid-19 dari kawalcorona.com untuk semua provinsi khusus di Indonesia
//credit : Teguh Aprianto [ Ethical Hacker Indonesia ]
var api_covid_19 = "https://api.kawalcorona.com/indonesia/provinsi/";

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
      prosesPesan(update);
    }
  } 
}

//untuk mengolah pesan dari user yang akan di jawab oleh web api chatbot-indo
function chatBot(txt) {
  //mengambil data dengan parameter dari pesan user
  var response = UrlFetchApp.fetch(api_chatbot_indo + txt);
  //mengolah data respon server chatbot-indo
  response =  JSON.parse(response);
  //mengambil data untuk variabel msg
  return response.msg;
}

//data Covid-19 untuk wilayah Indonesia dari api (kawalcorona.com)
function dataCovid(provinsi) {
  //mengambil semua data untuk semua provinsi di indonesia
  var respon = UrlFetchApp.fetch(api_covid_19);
  //parse hasil response json dari server api kawalcorona.com
  var hasil =  JSON.parse(respon);
  //untuk menyimpan result(hasil akhir) yang akan dikirimkan ke user
  var result = "";
  //looping data dari semua provinsi
  hasil.forEach(function(object) {
    //jika user meminta hanya spesifikasi provinsi tertentu, kita ambil dari parameter
    if (provinsi.includes(object.attributes.Provinsi)) {
      //ini untuk spesifikasi dari provinsi yang diminta user
      result = "<b><u>Provinsi : " + object.attributes.Provinsi + "</u></b>\n\n" + "Kasus Positif : " + object.attributes.Kasus_Posi + "\n" + "Kasus Sembuh : " + object.attributes.Kasus_Semb + "\n" + "Kasus Meninggal : " + object.attributes.Kasus_Meni + "\n\n";
    } else {
      //jika user hanya mengetik '/info' maka akan mengambil untuk semua provinsi di Indonesia
      if (provinsi == "") {
        //menyimpan result(hasil akhir) dengan append variable data
        result += "<b><u>Provinsi : " + object.attributes.Provinsi + "</u></b>\n\n";
        result += "Kasus Positif : " + object.attributes.Kasus_Posi + "\n" + "Kasus Sembuh : " + object.attributes.Kasus_Semb + "\n" + "Kasus Meninggal : " + object.attributes.Kasus_Meni + "\n\n";
      }
    }
  });
  //selesai result(hasil akhir)
  return result;
}

// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  // detek klo ada pesan dari user
  if (update.message) { 

    // penyederhanaan variable
    var msg = update.message;
    var text = msg.text;

    // jika user ketik /ping, bot akan jawab Pong!
    if ( /\/ping/i.exec(text) ){
      return tg.kirimPesan(msg.chat.id, '<b>Pong!</b>', 'HTML');
    }

    // eh ini saya tambahkan lagi, jika user klik start
    if ( /\/start/i.exec(text) ){
      return tg.kirimPesan(msg.chat.id, "Pesan diterima!\n\nLanjutkan bang..!", 'HTML');
    }
    
    //jika user ketik /info <Provinsi> untuk info data Covid-19 di Indonesia
    if ( /\/info/i.exec(text) ){
      //memulai memngambil data dari web api
      var covid = dataCovid(text.replace("/info", ""));
      //lanjut kirim ke user datanya
      return tg.kirimPesan(msg.chat.id, covid, 'HTML');
    }

    // kalau nanti mau kembangin sendiri menjadi bot interaktif, code nya taruh disini
    // atau buatkan fungsi tersendiri saja buat handle nya biar ga bertumpuk panjang
    // -- mulai custom text --

    // jika pesan biasa kita handle dengan chatbot
    if ( /^\w+/i.exec(text) ){
      var jawaban = chatBot(text);
      return tg.kirimPesan(msg.chat.id, jawaban);
    }

    // akhir deteksi pesan text
  }
  
}

function setWebhook() {
  // Isi dengan web App URL yang di dapat saat deploy
  var webAppUrl = "TULIS ALAMAT URL HASIL DEPLOY";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}
