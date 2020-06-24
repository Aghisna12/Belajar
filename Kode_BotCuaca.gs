/*
Project Name : TelegramBot( Data Prakiraan Cuaca Terbuka BMKG Indonesia ) *Support inline search query
Engine : Google App Script
Language Code : JavaScript
Date : 16-jun-2020 (5:23am)
Last Update : 24-jun-2020 (11:24am)
Credit : @Aghisna12

Requirement:
   - library telegram(unofficial) = https://blog.banghasan.com/note/tutorial/telegram/library-google-script-bot-api-telegram/

Info : Semoga bermanfaat dan berguna bagi yang membutuhkan

PENTING!: data yang akan kita ambil dari api terbuka di 'https://data.bmkg.go.id/prakiraan-cuaca/' silakan kita ikuti syarat dan ketentuan penggunaannya.

Referensi : github.com
            stackoverflow.com
            core.telegram.org
            blog.banghasan.com

Terimakasih : Allah SWT
              blog.banghasan.com
              bmkg.go.id
              script.google.com
              https://t.me/botindonesia(telegram group)
*/

//maksimal hasiluntuk pencarian inline query. untuk meminimalis overload/timeout.
var maksimal_hasil = 4;

// masukkan token bot mu di sini
var token = "TOKEN BOT TELEGRAM";

//api server Data Prakiraan Cuaca Terbuka BMKG(https://data.bmkg.go.id/prakiraan-cuaca/)
var api_bmkg = "https://data.bmkg.go.id/datamkg/MEWS/DigitalForecast/DigitalForecast-";

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

//mencari info kota / kabupaten yang tersedia berdasarkan katakunci pencarian inline search query
function cariInline(cari) {
  var res = cariLokasi(cari);
  var hasil = [];
  if (res.length == 1) {
    if (res[0].nama_provinsi && res[0].kab_kota) {
      hasil.push({
        'type':'article',
        'id':'1',
        'title':res[0].kab_kota,
        'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/location-1684-1106829.png',
        'description':res[0].nama_provinsi,
        'message_text':infoBmkg(res[0].nama_provinsi, res[0].kab_kota),
        'parse_mode':'HTML',
        'disable_web_page_preview':true
      });
    }
  } else {
    if (res.length > 1) {
      var uid = 0;
      res.forEach(function(object) {
        if (uid < maksimal_hasil) {
          if (object.kab_kota && object.nama_provinsi) {
            hasil.push({
              'type':'article',
              'id':uid.toString(),
              'title':object.kab_kota,
              'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/location-1684-1106829.png',
              'description':object.nama_provinsi,
              'message_text': infoBmkg(object.nama_provinsi, object.kab_kota),
              'parse_mode':'HTML',
              'disable_web_page_preview':true
            });
          }
          ++uid;
        }
      });
    }
  }
  return hasil;
}

//format waktu/tanggal dari variable datetime
function formatWaktu(datetime) {
  var bulan_lengkap = ['error','jan','feb','mar','apr','mei','jun','jul','agust','sep','okt','nov','des'];
  var hasil = "";
  if (datetime.length == 12) {
    var tahun = datetime.slice(0, 4);
    var bulan = datetime.slice(4, 6);
    var hari = datetime.slice(6, 8);
    hasil = hari + "-" + bulan_lengkap[parseInt(bulan)] + "-" + tahun;
  }
  if (datetime.length == 14) {
    var tahun = datetime.slice(0, 4);
    var bulan = datetime.slice(4, 6);
    var hari = datetime.slice(6, 8);
    var jam = datetime.slice(8, 10);
    var menit = datetime.slice(10, 12);
    var detik = datetime.slice(12, 14)
    hasil = hari + "-" + bulan_lengkap[parseInt(bulan)] + "-" + tahun + " " + jam + ":" + menit + ":" + detik;
  }
  return hasil;
}

//untuk menentukan nama cuaca berdasarkan indek nomor
function infoCuaca(index){
  var list_cuaca = {
    0 : '☀ Cerah',
    1 : '⛅ Cerah Berawan',
    2 : '⛅ Cerah Berawan',
    3 : '☁ Berawan',
    4 : '☁ Berawan',
    5 : '🌁 Udara Kabur',
    10 : '🌫 Asap',
    45 : '🌁 Kabut',
    60 : '🌧 Hujan Ringan',
    61 : '🌧 Hujan Sedang',
    63 : '🌧 Hujan Lebat',
    80 : '🌧 Hujan Lokal',
    95 : '⛈ Hujan Petir',
    97 : '⛈ Hujan Petir',
    100 : '☀ Cerah',
    101 : '⛅ Cerah Berawan',
    102 : '⛅ Cerah Berawan',
    103 : '☁ Berawan',
    104 : '☁ Berawan'
  };
  if (list_cuaca[index]) {
    return list_cuaca[index];
  } else {
    return "null";
  }
}

//list kota / kabupaten dari setiap provinsi di indonesia, berdasarkan data yang tersedia dari api terbuka bmkg
function cariLokasi(cari) {
  var provinsi = [];
  var list_provinsi = {
    Aceh: ['Aceh Barat','Aceh Barat Daya','Aceh Besar','Aceh Jaya','Aceh Selatan','Aceh Singkil','Aceh Tamiang','Aceh Tengah','Aceh Tenggara','Aceh Timur','Aceh Utara','Banda Aceh','Bener Meriah','Bireun','Gayo Lues','Langsa','Lhokseumawe','Nagan Raya','Pidie','Pidie Jaya','Sabang','Simeulue','Subulussalam'],
    Bali: ['Amplapura','Bangli','Denpasar','Gianyar','Mengwi','Negara','Semarapura','Singaraja','Tabanan'],
    BangkaBelitung: ['Jebus','Koba','Manggar','Mentok','Pangkal Pinang','Selat Nasik','Sungai Liat','Sungai Selan','Tanjung Pandan','Toboali','Pelabuhan Belinyu'],
    Banten: ['Anyer','Bayah','Binuangen','Bojonegara','Carita','Kota Cilegon','Ciruas','Gunung kencana','Labuan','Kab. Lebak','Malingping','Pelabuhan Merak','Pandeglang','Rangkasbitung','Serang','Kota Tangerang','Tigaraksa','Ujung Kulon','Pelabuhan Merak'],
    Bengkulu: ['Bengkulu','Bengkulu Selatan','Bengkulu Tengah','Bengkulu Utara','Kaur','Kepahiang','Lebong','Mukomuko','Rejang Lebong','Seluma'],
    DIYogyakarta: ['Bantul','Sleman','Wates','Gunung Kidul','Yogyakarta'],
    DKIJakarta: ['Jakarta Barat','Jakarta Pusat','Jakarta Selatan','Jakarta Timur','Jakarta Utara','Kepulauan Seribu'],
    Gorontalo: ['Gorontalo','Kwandang','Limboto','Marisa','Suwawa','Tilamuta','Pelabuhan Gorontalo'],
    Jambi: ['Bangko','Bulian','Bungo','Jambi','Siulak','Kuala Tungkal','Sabak','Sakernan','Sarolangun','Sungai Penuh','Tebo'],
    JawaBarat: ['Bandung','Banjar','Bekasi','Ciamis','Cianjur','Cibinong','Cikarang','Cimahi','Cipanas','Cirebon','Cisarua','Depok','Gadog','Garut','Indramayu','Karawang','Kota Bogor','Kuningan','Lembang','Majalengka','Parigi','Pelabuhan Ratu','Purwakarta','Singaparna','Soreang','Subang','Sukabumi','Sumber','Sumedang','Tasikmalaya','Pelabuhan Ratu'],
    JawaTengah: ['Banjarnegara','Batang','Blora','Boyolali','Brebes','Cilacap','Demak','Jepara','Kajen','Karanganyar','Kebumen','Kendal','Klaten','Kudus','Magelang','Mungkid','Pati','Pekalongan','Pemalang','Purbalingga','Purwodadi','Purwokerto','Purworejo','Rembang','Salatiga','Semarang','Slawi','Sragen','Sukoharjo','Surakarta','Tegal','Temanggung','Ungaran','Wonogiri','Wonosobo','Pelabuhan Semarang'],
    JawaTimur: ['Bangkalan','Banyuwangi','Batu','Bojonegoro','Bondowoso','Gresik','Jember','Jombang','Kabupaten Blitar','Kabupaten Kediri','Kabupaten Madiun','Kabupaten Malang','Kabupaten Mojokerto','Kabupaten Pasuruan','Kabupaten Probolinggo','Kota Blitar','Kota Kediri','Kota Madiun','Kota Malang','Kota Mojokerto','Kota Pasuruan','Kota Probolinggo','Lamongan','Lumajang','Magetan','Nganjuk','Ngawi','Pacitan','Pamekasan','Ponorogo','Sampang','Sidoarjo','Situbondo','Sumenep','Surabaya','Trenggalek','Tuban','Tulungagung','Pelabuhan Surabaya'],
    KalimantanBarat: ['Bengkayang','Kapuas Hulu','Kayong Utara','Ketapang','Kubu Raya','Landak','Melawi','Mempawah','Pontianak','Sambas','Sanggau','Sekadau','Singkawang','Sintang','Sungai Raya'],
    KalimantanSelatan: ['Amuntai','Banjarbaru','Banjarmasin','Barabai','Batulicin','Kandangan','Kotabaru','Marabahan','Martapura','Paringin','Pelaihari','Rantau','Tanjung'],
    KalimantanTengah: ['Buntok','Kasongan','Kuala Kapuas','Kuala Kurun','Kuala Pembuang','Muarateweh','Nanga Bulik','Palangkaraya','Pangkalan Bun','Pulangpisau','Puruk Cahu','Sampit','Sukamara','Tamiang Layang','Pelabuhan Sampit'],
    KalimantanTimur: ['Balikpapan','Bontang','Penajam','Samarinda','Sendawar','Sengata','Tanah Grogot','Tanjung Redeb','Tenggarong','Pelabuhan Balikpapan','Pelabuhan Nunukan','Pelabuhan Tarakan'],
    KalimantanUtara: ['Malinau','Nunukan','Tana Tidung','Tanjung Selor','Tarakan','Pelabuhan Balikpapan','Pelabuhan Nunukan','Pelabuhan Tarakan'],
    KepulauanRiau: ['Batam','Bintan','Daik Lingga','Ranai','Tanjung Balai Karimun','Tanjung Pinang','Tarempa','Pelabuhan Batam','Pelabuhan Tarempa'],
    Lampung: ['Bandar Lampung','Blambangan Umpu','Gedong Tataan','Gunung Sugih','Kalianda','Kota Agung','Kotabumi','Krui','Liwa','Menggala','Metro','Panaragan Jaya','Pringsewu','Sukadana','Wiralaga Mulya'],
    Maluku: ['Ambon','Bula','Dobo','Kisar','Leksula','Masohi','Namlea','Piru','Saumlaki','Tual','Pelabuhan Ambon','Pelabuhan Bula','Pelabuhan Dobo','Pelabuhan Namlea','Pelabuhan Saumlaki','Pelabuhan Tual'],
    MalukuUtara: ['Jailolo','Labuha','Maba','Morotai','Sanana','Sofifi','Taliabu','Ternate','Tidore','Tobelo','Weda'],
    NusaTenggaraBarat: ['Dompu','Gerung','Kota Bima','Mataram','Praya','Sape','Selong','Sumbawa Besar','Taliwang','Tanjung','Pelabuhan Bima'],
    NusaTenggaraTimur: ['Atambua','Ba a','Bajawa','Betun','Borong','Ende','Kalabahi','Kefamenanu','Kupang','Labuan Bajo','Larantuka','Lewoleba','Maumere','Mbay','Oelamasi','Ruteng','Sabu','Soe','Waibakul','Waikabubak','Waingapu','Weetabula','Pelabuhan Ende','Pelabuhan Kalabahi','Pelabuhan Kupang','Pelabuhan Larantuka','Pelabuhan Lewoleba','Pelabuhan Maumere','Pelabuhan Waingapu'],
    Papua: ['Agats','Biak','Botawa','Burmeso','Enarotali','Genyem','Jayapura','Karubaga','Kepi','Merauke','Mulia','Nabire','Oksibil','Sarmi','Sentani','Serui','Sorendiweri','Sumohai','Tanah Merah','Timika','Wamena','Waris','Pelabuhan Agats','Pelabuhan Biak','Pelabuhan Jayapura','Pelabuhan Merauke','Pelabuhan Nabire','Pelabuhan Serui'],
    PapuaBarat: ['Aimas','Bintuni','Fakfak','Kaimana','Kumurkek','Manokwari','Ransiki','Sorong','Teminabuan','Waisai','Wasior','Pelabuhan Kaimana','Pelabuhan Manokwari','Pelabuhan Sorong','Pelabuhan Wasior'],
    Riau: ['Bagan Siapiapi','Bangkinang','Bengkalis','Dumai','Pangkalan Kerinci','Pasir Pengarairan','Pekanbaru','Rengat','Selat panjang','Siak Sri Indrapura','Teluk Kuantan','Tembilahan'],
    SulawesiBarat: ['Majene','Mamasa','Mamuju','Mamuju Tengah','Mamuju Utara','Polewali Mandar'],
    SulawesiSelatan: ['Pelabuhan Barru','Bantaeng','Barru','Benteng','Bulukumba','Enrekang','Jeneponto','Makale','Makassar','Malili','Maros','Masamba','Palopo','Pangkajene dan Kepulauan','Pare Pare','Pinrang','Rantepao','Sengkang','Sidenreng','Sinjai','Sungguminasa','Takalar','Watampone','Watan Soppeng'],
    SulawesiTengah: ['Banggai','Kolonedale','Luwuk','Pelabuhan Poso','Ampana','Bungku','Buol','Donggala','Luwuk','Palu','Parigi','Poso','Salakan','Sigi Biromaru','Toli Toli'],
    SulawesiTenggara: ['Pelabuhan Kendari','Pelabuhan Raha','Bau Bau','Bombana','Buranga','Buton','Kolaka','Kolaka Utara','Konawe','Konawe Selatan','Kota Kendari','Raha','Wanggudu','Wangi Wangi'],
    SulawesiUtara: ['Pelabuhan Tahuna','Air Madidi','Amurang','Bitung','Boroko','Kotamobagu','Lolak','Manado','Melongguane','Ondong Siau','Ratahan','Tahuna','Tomohon','Tondano'],
    SumateraBarat: ['Arosuka','Batusangkar','Bukittinggi','Lubuk Basung','Lubuk Sikaping','Muaro Sijunjung','Padang','Padang Aro','Padangpanjang','Painan','Pariaman','Parit Malintang','Payakumbuh','Pulau Punjung','Sarilamak','Sawahlunto','Simpang Empat','Solok','Tuapejat'],
    SumateraSelatan: ['Martapura','Baturaja','Indralaya','Kayu Agung','Lahat','Lubuk Linggau','Martapura','Muaradua','Muara Enim','Muara Rumpit','Musirawas','Pagar Alam','Palembang','Pangkalan Balai','Prabumulih','Sekayu','Talang Ubi','Tebing Tinggi'],
    SumateraUtara: ['Aek Kanopan','Balige','Binjai Kota','Dolok Sanggul','Gunung Sitoli','Gunung Tua','Kabanjahe','Kisaran','Kota Pinang','Lahomi','Lima Puluh','Lotu','Lubuk Pakam','Medan','Padang Sidempuan','Pandan','Pangururan','Panyabungan','Pematang Raya','Pematang Siantar','Rantau Prapat','Salak','Sei Rampah','Sibolga','Sibuhuan','Sidikalang','Sipirok','Stabat','Tanjung Balai','Tarutung','Tebing Tinggi','Teluk Dalam']
  };
  var ketemu = false;
  for (nama_provinsi in list_provinsi) {
    list_provinsi[nama_provinsi].forEach(function(kab_kota) {
      var cari_kab_kota = kab_kota.toLowerCase();
      var cari_utama = cari.toLowerCase();
      if (cari_kab_kota.includes(cari_utama) && !ketemu) {
        if (cari_kab_kota.length == cari_utama.length) {
          ketemu = true;
        }
        provinsi.push({
          'nama_provinsi':nama_provinsi,
          'kab_kota':kab_kota
        });
      }
    });
  }
  return provinsi;
}

//mencari info cuaca berdasarkan katakunci kota / kabupaten
function cariInfoCuaca(cari) {
  var res = cariLokasi(cari);
  var hasil;
  if (res.length == 1) {
    if (res[0].nama_provinsi && res[0].kab_kota) {
      hasil = infoBmkg(res[0].nama_provinsi, res[0].kab_kota);
    } else {
      hasil = "Maaf, terdapat kesalahan pada daftar kabupaten/kota";
    }
  } else {
    hasil = "<u>Maaf, Lokasi Tidak Ditemukan</u>\nformat: <code>/info (nama kota/kabupaten)</code>\ncontoh: <code>/info sleman</code>";
    if (res.length > 1) {
      hasil += "\n\n<i>Mungkin yang anda maksud:</i>\n";
      res.forEach(function(object) {
        if (object.kab_kota && object.nama_provinsi) {
          hasil += "\t‣ <code>" + object.kab_kota + "</code> (" + object.nama_provinsi + ")\n";
        }
      });
    }
  }
  return hasil;
}

//memilih data bmkg untuk tanggal. jika, ada data tanggal kemarin maka tidak digunakan.
function sekarangBesok(tgl_bmkg, tanggal) {
  var date = new Date();
  if (tgl_bmkg) {
    var tgl = tgl_bmkg.slice(0, 12);
    var th = tgl.slice(0, 4);
    var bln = tgl.slice(4, 6);
    var hr = tgl.slice(6, 8);
    date = new Date(parseInt(th), parseInt(bln) - 1, parseInt(hr));
  }
  if (date) {
    var sekarang = Utilities.formatDate(date, 'Asia/Jakarta', 'yyyyMMdd');
    if (tanggal < sekarang) {
      return false;
    }
    date.setDate(date.getDate() +2);
    var besoknya = Utilities.formatDate(date, 'Asia/Jakarta', 'yyyyMMdd');
    if (tanggal == besoknya) {
      return false;
    }
  }
  return true;
}

//fungsi untuk mengambil data api terbuka dari server bmkg
function infoBmkg(provinsi, kab_kota) {
  var respon = UrlFetchApp.fetch(api_bmkg + provinsi + ".xml").getContentText();
  if (respon) {
    var document = XmlService.parse(respon);
    var root = document.getRootElement();
    if (root.getChild("forecast")) {
      var forecast = root.getChild("forecast");
      var area = forecast.getChildren();
      var hasil = "<b>📌 " + kab_kota + " (" + provinsi + ")</b>\n";
      var date_bmkg;
      if (forecast.getChild("issue").getChild("timestamp").getText()) {
        date_bmkg = forecast.getChild("issue").getChild("timestamp").getText();
        //hasil += formatWaktu(date_bmkg) + "\n";
      }
      var hasil_suhu = [];
      var hasil_cuaca = [];
      //var dump_area = "\n";
      area.forEach(function(object) {
        var nama_area_obj = object.getAttribute("description");
        if (nama_area_obj) {
          var nama_area = nama_area_obj.getValue();
          //dump_area += "'" + nama_area + "',";
          if (nama_area == kab_kota) {
            var params = object.getChildren();
            params.forEach(function(param) {
              var deskripsi_obj = param.getAttribute("description");
              if (deskripsi_obj) {
                var deskripsi = deskripsi_obj.getValue();
                if (deskripsi == "Temperature") {
                  var temperatures = param.getChildren();
                  temperatures.forEach(function(temperature) {
                    var waktu_obj = temperature.getAttribute("datetime");
                    var suhu_obj = temperature.getChild("value");
                    if (waktu_obj && suhu_obj) {
                      var waktu = waktu_obj.getValue();
                      var suhu_celcius = suhu_obj.getText() + "°C";
                      hasil_suhu.push({'waktu':waktu,'suhu_celcius':suhu_celcius});
                    }
                  });
                }
                if (deskripsi == "Weather") {
                  var temperatures = param.getChildren();
                  temperatures.forEach(function(temperature) {
                    var waktu_obj = temperature.getAttribute("datetime");
                    var cuaca_obj = temperature.getChild("value");
                    if (waktu_obj && cuaca_obj) {
                      var waktu = waktu_obj.getValue();
                      var info_cuaca = infoCuaca(cuaca_obj.getText());
                      hasil_cuaca.push({'waktu':waktu, 'info_cuaca':info_cuaca});
                    }
                  });
                }
              }
            });
          }
        }
      });
      var tanggal;
      hasil_suhu.forEach(function(object, index) {
        if (object.waktu && object.suhu_celcius) {
          if (sekarangBesok(date_bmkg, object.waktu.slice(0, 8))) {
            var waktu = object.waktu;
            var suhu = object.suhu_celcius;
            if (hasil_cuaca[index].waktu == waktu) {
              var jam = waktu.slice(8, 10);
              var menit = waktu.slice(10, 12);
              if (tanggal != waktu.slice(0, 8)) {
                tanggal = waktu.slice(0, 8);
                hasil += "\n\t🗓 <b>" + formatWaktu(waktu) + "</b>\n\t\t • <code>" + jam + ":" + menit + "</code> " + hasil_cuaca[index].info_cuaca + " (" + suhu + ")\n";
              } else {
                tanggal = waktu.slice(0, 8);
                hasil += "\t\t • <code>" + jam + ":" + menit + "</code> " + hasil_cuaca[index].info_cuaca + " (" + suhu + ")\n";
              }
            }
          }
        }
      });
    }
  }
  //Logger.log(dump_area);
  return hasil + '\n✔️ Sumber:<a href="https://data.bmkg.go.id/prakiraan-cuaca/">BMKG</a>';
}

// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  // detek klo ada pesan teks dari user
  if (update.message) { 
    
    //simpan pesan bantuan
    var help_msg = "Maaf, perintah yang anda masukan salah. format: <code>/info (nama kota/kabupaten)</code>\ncontoh: <code>/info sleman</code>";
    
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
    
    //jika user ketik /info <kota/kabupaten> untuk info data prakiraan cuaca
    else if ( /\/info/i.exec(text) ){
      //memulai memngambil data dari web api
      var cuaca = cariInfoCuaca(text.replace("/info ", ""));
      //lanjut kirim ke user datanya
      return tg.kirimPesan(chat_id, cuaca, 'HTML', true);
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
    //ambil data dari server api Kawalcorona.com
    if (text.length >= 2) {
      var data = cariInline(text);
      //kirim data ke result query pencarian
      kirimInlineQuery(query_id, data);
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
  var webAppUrl = "URL WEB APP HASIL DEPLOY";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}
