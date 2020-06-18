/*
Project Name : TelegramBot( Jadwal Sholat Indonesia ) *Support inline search query
Engine : Google App Script
Language Code : JavaScript
Date : 18-jun-2020 (4:53am)
Last Update : none
Credit : @Aghisna12

Requirement:
- library telegram(unofficial) = https://blog.banghasan.com/note/tutorial/telegram/library-google-script-bot-api-telegram/

Info : Semoga bermanfaat dan berguna bagi yang membutuhkan

PENTING!: data yang akan kita ambil dari api terbuka di 'api.banghasan.com' silakan kita ikuti syarat dan ketentuan penggunaannya.

Referensi : github.com, stackoverflow.com, core.telegram.org, blog.banghasan.com

Terimakasih : Allah SWT, Kedua Orangtua Tercinta

Situs : blog.banghasan.com, api.banghasan.com, script.google.com, https://t.me/botindonesia(telegram group)
*/

//setting maksimal hasil pencarian untuk inline search query. bertujuan meminimalisir overload/timeout
var maksimal_hasil_inline_search_query = 4;

// masukkan token bot mu di sini
var token = "TOKEN TELEGRAM BOT";

//api server Data Surat Al-Quran 
var api_fatimah = "https://api.banghasan.com/sholat/format/json";

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

//daftar kota/kabupaten yang tersedia di api.banghasan.com
var daftar_kota = {
  /*dump list pertama*/
  512:"ACEH BARAT",513:"ACEH BARAT DAYA",514:"ACEH BESAR",515:"ACEH JAYA",516:"ACEH SELATAN",517:"ACEH SINGKIL",518:"ACEH TAMIANG",519:"ACEH TENGAH",
  520:"ACEH TENGGARA",521:"ACEH TIMUR",522:"ACEH UTARA",568:"AGAM",803:"ALOR",535:"ASAHAN",980:"ASMAT",784:"BADUNG",
  853:"BALANGAN",679:"BANDUNG",680:"BANDUNG BARAT",896:"BANGGAI",897:"BANGGAI KEPULAUAN",898:"BANGGAI LAUT",651:"BANGKA",652:"BANGKA BARAT",
  653:"BANGKA SELATAN",654:"BANGKA TENGAH",741:"BANGKALAN",785:"BANGLIO",854:"BANJAR",706:"BANJARNEGARA",910:"BANTAENG",779:"BANTUL",
  610:"BANYUASIN",707:"BANYUMAS",742:"BANYUWANGI",839:"BARITO SELATAN",840:"BARITO TIMUR",841:"BARITO UTARA",855:"BARITOKUALA",911:"BARRU",
  708:"BATANG",599:"BATANGHARI",536:"BATUBARA",681:"BEKASI",655:"BELITUNG",656:"BELITUNG TIMUR",804:"BELU",523:"BENER MERIAH",
  587:"BENGKALIS",825:"BENGKAYANG",626:"BENGKULU SELATAN",627:"BENGKULU TENGAH",628:"BENGKULU UTARA",866:"BERAU",981:"BIAKNUMFOR",793:"BIMA",
  659:"BINTAN",524:"BIREUEN",743:"BLITAR",709:"BLORA",947:"BOALEMO",682:"BOGOR",744:"BOJONEGORO",881:"BOLAANGMONGONDOW",
  882:"BOLAANGMONGONDOW SELATAN",883:"BOLAANGMONGONDOW TIMUR",884:"BOLAANGMONGONDOW UTARA",933:"BOMBANA",745:"BONDOWOSO",912:"BONE",948:"BONEBOLANGO",982:"BOVENDIGOEL",
  710:"BOYOLALI",711:"BREBES",786:"BULELENG",913:"BULUKUMBA",867:"BULUNGAN",600:"BUNGO",899:"BUOL",959:"BURU",
  960:"BURU SELATAN",934:"BUTON",935:"BUTON UTARA",683:"CIAMIS",684:"CIANJUR",712:"CILACAP",685:"CIREBON",537:"DAIRI",
  1004:"DEIYAI",538:"DELISERDANG",713:"DEMAK",569:"DHARMASRAYA",1005:"DOGIYAI",794:"DOMPU",900:"DONGGALA",612:"EMPAT LAWANG",
  805:"ENDE",914:"ENREKANG",1010:"FAK-FAK",806:"FLORES TIMUR",686:"GARUT",525:"GAYOLUES",787:"GIANYAR",949:"GORONTALO",
  950:"GORONTALO UTARA",915:"GOWA",746:"GRESIK",714:"GROBOGAN",780:"GUNUNGKIDUL",842:"GUNUNGMAS",970:"HALMAHERA BARAT",971:"HALMAHERA SELATAN",
  972:"HALMAHERA TENGAH",973:"HALMAHERA TIMUR",974:"HALMAHERA UTARA",856:"HULUSUNGAI SELATAN",857:"HULUSUNGAI TENGAH",858:"HULUSUNGAI UTARA",539:"HUMBANG HASUNDUTAN",588:"INDRAGIRI HILIR",
  589:"INDRAGIRI HULU",687:"INDRAMAYU",1006:"INTAN JAYA",983:"JAYAPURA",1007:"JAYAWIJAYA",747:"JEMBER",788:"JEMBRANA",916:"JENEPONTO",
  715:"JEPARA",748:"JOMBANG",1011:"KAIMANA",590:"KAMPAR",843:"KAPUAS",826:"KAPUAS HULU",716:"KARANGANYAR",789:"KARANGASEM",
  688:"KARAWANG",658:"KARIMUN",540:"KARO",844:"KATINGAN",629:"KAUR",828:"KAYONG UTARA",717:"KEBUMEN",749:"KEDIRI",
  984:"KEEROM",718:"KENDAL",630:"KEPAHIANG",662:"KEPULAUAN ANAMBAS",961:"KEPULAUAN ARU",571:"KEPULAUAN MENTAWAI",596:"KEPULAUAN MERANTI",889:"KEPULAUAN SANGIHE",
  891:"KEPULAUAN SIAU TAGULANDANG BIARO",975:"KEPULAUAN SULA",890:"KEPULAUAN TALAUD",1009:"KEPULAUAN YAPEN",601:"KERINCI",827:"KETAPANG",719:"KLATEN",790:"KLUNGKUNG",
  936:"KOLAKA",937:"KOLAKA TIMUR",938:"KOLAKA UTARA",939:"KONAWE",946:"KONAWE KEPULAUAN",940:"KONAWE SELATAN",941:"KONAWE UTARA",968:"KOTA AMBON",
  875:"KOTA BALIKPAPAN",530:"KOTA BANDA ACEH",649:"KOTA BANDAR LAMPUNG",697:"KOTA BANDUNG",698:"KOTA BANJAR",865:"KOTA BANJARBARU",864:"KOTA BANJARMASIN",664:"KOTA BATAM",
  771:"KOTA BATU",945:"KOTA BAU-BAU",699:"KOTA BEKASI",635:"KOTA BENGKULU",802:"KOTA BIMA",561:"KOTA BINJAI",894:"KOTA BITUNG",772:"KOTA BLITAR",
  700:"KOTA BOGOR",876:"KOTA BONTANG",582:"KOTA BUKITTINGGI",675:"KOTA CILEGON",701:"KOTA CIMAHI",702:"KOTA CIREBON",792:"KOTA DENPASAR",703:"KOTA DEPOK",
  598:"KOTA DUMAI",952:"KOTA GORONTALO",567:"KOTA GUNUNG SITOLI",667:"KOTA JAKARTA",608:"KOTA JAMBI",1008:"KOTA JAYAPURA",773:"KOTA KEDIRI",944:"KOTA KENDARI",
  893:"KOTA KOTAMOBAGU",824:"KOTA KUPANG",532:"KOTA LANGSA",533:"KOTA LHOKSEUMAWE",623:"KOTA LUBUKLINGGAU",774:"KOTA MADIUN",736:"KOTA MAGELANG",930:"KOTA MAKASSAR",
  775:"KOTA MALANG",892:"KOTA MANADO",801:"KOTA MATARAM",560:"KOTA MEDAN",650:"KOTA METRO",776:"KOTA MOJOKERTO",580:"KOTA PADANG",581:"KOTA PADANGPANJANG",
  562:"KOTA PADANGSIDEMPUAN",624:"KOTA PAGARALAM",852:"KOTA PALANGKARAYA",622:"KOTA PALEMBANG",931:"KOTA PALOPO",908:"KOTA PALU",657:"KOTA PANGKALPINANG",932:"KOTA PARE-PARE",
  583:"KOTA PARIAMAN",777:"KOTA PASURUAN",584:"KOTA PAYAKUMBUH",737:"KOTA PEKALONGAN",597:"KOTA PEKANBARU",563:"KOTA PEMATANGSIANTAR",837:"KOTA PONTIANAK",625:"KOTA PRABUMULIH",
  778:"KOTA PROBOLINGGO",534:"KOTA SABANG",738:"KOTA SALATIGA",874:"KOTA SAMARINDA",585:"KOTA SAWAHLUNTO",735:"KOTA SEMARANG",676:"KOTA SERANG",564:"KOTA SIBOLGA",
  838:"KOTA SINGKAWANG",586:"KOTA SOLOK",1022:"KOTA SORONG",531:"KOTA SUBULUSSALAM",704:"KOTA SUKABUMI",609:"KOTA SUNGAI PENUH",770:"KOTA SURABAYA",739:"KOTA SURAKARTA",
  677:"KOTA TANGERANG",678:"KOTA TANGERANG SELATAN",565:"KOTA TANJUNGBALAI",663:"KOTA TANJUNGPINANG",877:"KOTA TARAKAN",705:"KOTA TASIKMALAYA",566:"KOTA TEBINGTINGGI",740:"KOTA TEGAL",
  978:"KOTA TERNATE",979:"KOTA TIDORE",895:"KOTA TOMOHON",969:"KOTA TUAL",783:"KOTA YOGYAKARTA",859:"KOTABARU",845:"KOTAWARINGIN BARAT",846:"KOTAWARINGIN TIMUR",
  591:"KUANTAN SINGINGI",829:"KUBURAYA",720:"KUDUS",781:"KULONPROGO",689:"KUNINGAN",807:"KUPANG",868:"KUTAI BARAT",869:"KUTAI KARTANEGARA",
  870:"KUTAI TIMUR",541:"LABUHANBATU",542:"LABUHANBATU SELATAN",543:"LABUHANBATU UTARA",611:"LAHAT",847:"LAMANDAU",750:"LAMONGAN",636:"LAMPUNG BARAT",
  637:"LAMPUNG SELATAN",638:"LAMPUNG TENGAH",639:"LAMPUNG TIMUR",640:"LAMPUNG UTARA",830:"LANDAK",544:"LANGKAT",1002:"LANNY JAYA",671:"LEBAK",
  631:"LEBONG",808:"LEMBATA",570:"LIMAPULUHKOTO",660:"LINGGA",795:"LOMBOK BARAT",796:"LOMBOK TENGAH",797:"LOMBOK TIMUR",798:"LOMBOK UTARA",
  751:"LUMAJANG",917:"LUWU",918:"LUWU TIMUR",919:"LUWU UTARA",752:"MADIUN",
  /*dump list kedua*/
  721:"MAGELANG",753:"MAGETAN",873:"MAHAKAM ULU",690:"MAJALENGKA",956:"MAJENE",823:"MALAKA",754:"MALANG",878:"MALINAU",
  964:"MALUKU BARAT DAYA",965:"MALUKU TENGAH",966:"MALUKU TENGGARA",967:"MALUKU TENGGARA BARAT",957:"MAMASA",993:"MAMBERAMO RAYA",994:"MAMBERAMO TENGAH",953:"MAMUJU",
  954:"MAMUJU TENGAH",955:"MAMUJU UTARA",545:"MANDAILING NATAL",809:"MANGGARAI",810:"MANGGARAI BARAT",811:"MANGGARAI TIMUR",1013:"MANOKWARI",1014:"MANOKWARI SELATAN",
  985:"MAPPI",920:"MAROS",1020:"MAYBRAT",831:"MELAWI",602:"MERANGIN",986:"MERAUKE",647:"MESUJI",987:"MIMIKA",
  885:"MINAHASA",886:"MINAHASA SELATAN",887:"MINAHASA TENGGARA",888:"MINAHASA UTARA",755:"MOJOKERTO",901:"MOROWALI",902:"MOROWALI UTARA",613:"MUARAENIM",
  603:"MUAROJAMBI",632:"MUKO-MUKO",942:"MUNA",848:"MURUNGRAYA",614:"MUSIBANYUASIN",615:"MUSIRAWAS",1000:"NABIRE",526:"NAGANRAYA",
  812:"NAGEKEO",661:"NATUNA",1003:"NDUGA",813:"NGADA",756:"NGANJUK",757:"NGAWI",546:"NIAS",547:"NIAS BARAT",
  548:"NIAS SELATAN",549:"NIAS UTARA",879:"NUNUKAN",616:"OGAN ILIR",617:"OGAN KOMERING ILIR",618:"OGAN KOMERING ULU",619:"OGAN KOMERING ULU SELATAN",620:"OGAN KOMERING ULU TIMUR",
  758:"PACITAN",558:"PADANG LAWAS",559:"PADANG LAWAS UTARA",572:"PADANGPARIAMAN",550:"PAKPAKBHARAT",759:"PAMEKASAN",672:"PANDEGLANG",696:"PANGANDARAN",
  921:"PANGKAJENE KEPULAUAN",988:"PANIAI",903:"PARIGIMOUTONG",573:"PASAMAN",574:"PASAMAN BARAT",872:"PASER",760:"PASURUAN",722:"PATI",
  1021:"PEGUNUNGAN ARFAK",989:"PEGUNUNGAN BINTANG",1025:"Pekajang Kab. Lingga",723:"PEKALONGAN",592:"PELALAWAN",724:"PEMALANG",871:"PENAJAM PASER UTARA",621:"PENUKAL ABAB LEMATANG ILIR",
  645:"PESAWARAN",648:"PESISIR BARAT",575:"PESISIR SELATAN",527:"PIDIE",528:"PIDIE JAYA",922:"PINRANG",951:"POHUWATO",958:"POLEWALI MANDAR",
  761:"PONOROGO",832:"PONTIANAK",904:"POSO",646:"PRINGSEWU",762:"PROBOLINGGO",849:"PULANGPISAU",1028:"Pulau Laut Kab. Natuna",1027:"Pulau Midai Kab. Natuna",
  976:"PULAU MOROTAI",1026:"Pulau Serasan Kab. Natuna",977:"PULAU TALIABU",1024:"Pulau Tambelan Kab. Bintan",990:"PUNCAK",991:"PUNCAKJAYA",725:"PURBALINGGA",691:"PURWAKARTA",
  726:"PURWOREJO",1012:"RAJAAMPAT",633:"REJANGLEBONG",727:"REMBANG",593:"ROKAN HILIR",594:"ROKAN HULU",814:"ROTE NDAO",820:"SABURAIJUA",
  833:"SAMBAS",551:"SAMOSIR",763:"SAMPANG",834:"SANGGAU",992:"SARMI",604:"SAROLANGUN",576:"SAWAHLUNTO SIJUNJUNG",836:"SEKADAU",
  909:"SELAYAR",634:"SELUMA",728:"SEMARANG",962:"SERAM BAGIAN BARAT",963:"SERAM BAGIAN TIMUR",673:"SERANG",553:"SERDANG BEDAGAI",850:"SERUYAN",
  595:"SIAK",923:"SIDENRENGRAPPANG",764:"SIDOARJO",907:"SIGI",815:"SIKKA",554:"SIMALUNGUN",529:"SIMEULUE",924:"SINJAI",
  835:"SINTANG",765:"SITUBONDO",782:"SLEMAN",577:"SOLOK",578:"SOLOK SELATAN",925:"SOPPENG",1015:"SORONG",1016:"SORONG SELATAN",
  729:"SRAGEN",692:"SUBANG",693:"SUKABUMI",851:"SUKAMARA",730:"SUKOHARJO",816:"SUMBA BARAT",817:"SUMBA BARAT DAYA",818:"SUMBA TENGAH",
  819:"SUMBA TIMUR",799:"SUMBAWA",800:"SUMBAWA BARAT",694:"SUMEDANG",766:"SUMENEP",995:"SUPIORI",860:"TABALONG",791:"TABANAN",
  926:"TAKALAR",1019:"TAMBRAUW",880:"TANA TIDUNG",861:"TANAHBUMBU",579:"TANAHDATAR",862:"TANAHLAUT",927:"TANATORAJA",674:"TANGERANG",
  641:"TANGGAMUS",605:"TANJUNGJABUNG BARAT",606:"TANJUNGJABUNG TIMUR",555:"TAPANULI SELATAN",556:"TAPANULI TENGAH",557:"TAPANULI UTARA",863:"TAPIN",695:"TASIKMALAYA",
  607:"TEBO",731:"TEGAL",1017:"TELUKBINTUNI",1018:"TELUKWONDAMA",732:"TEMANGGUNG",821:"TIMOR TENGAH SELATAN",822:"TIMOR TENGAH UTARA",552:"TOBASAMOSIR",
  905:"TOJOUNAUNA",996:"TOLIKARA",906:"TOLITOLI",928:"TORAJA UTARA",767:"TRENGGALEK",769:"TUBAN",642:"TULANGBAWANG",643:"TULANGBAWANG BARAT",
  768:"TULUNGAGUNG",929:"WAJO",943:"WAKATOBI",999:"WAROPEN",644:"WAYKANAN",733:"WONOGIRI",734:"WONOSOBO",997:"YAHUKIMO",
  1001:"YALIMO",998:"YAPEN WAROPEN"}

//untuk membuat nilai hari, dari hari ini ke depan atau mundur kebelakang
function cariHari(hari, format) {
  var date = new Date();
  if (hari) {
    date.setDate(date.getDate() + parseInt(hari));
  }
  return Utilities.formatDate(date, 'Asia/Jakarta', format);
}

//mencari data jadwal sholat dari api. dengan paramater kode kota dan hari
function infoSholat(kota, kode_kota, hari) {
  var tanggal = cariHari(hari, 'yyyy-MM-dd');
  var respon = UrlFetchApp.fetch(api_fatimah + "/jadwal/kota/" + kode_kota + "/tanggal/" + tanggal).getContentText();
  var hasil = "";
  if (respon) {
    var info_sholat = JSON.parse(respon);
    if (info_sholat.jadwal.data) {
      var data_sholat = info_sholat.jadwal.data;
      hasil = "<b>🕌 Jadwal Sholat Untuk Wilayah " + kota + " (" + kode_kota + ") Dan Sekitarnya</b>\n\n";
      hasil += "<code><b>" + kota + " (" + data_sholat.tanggal + ")</b>\n\n\tImsak   = " + data_sholat.imsak + "\n\tSubuh   = " + data_sholat.subuh + "\n\tTerbit  = " + data_sholat.terbit + "\n\tDhuha   = " + data_sholat.dhuha + "\n\tDzuhur  = " + data_sholat.dzuhur + "\n\tAshar   = " + data_sholat.ashar + "\n\tMaghrib = " + data_sholat.maghrib + "\n\tIsya    = " + data_sholat.isya + "\n\n";
      hasil += "Sumber:DEPAG RI</code>";
    }
  }
  return hasil;
}

//mencari kode kota dengan katakunci yang diminta
function cariKota(cari) {
  var hasil = [];
  for (kode_kota in daftar_kota) {
    if ((daftar_kota[kode_kota].toLowerCase()).includes(cari.toLowerCase())) {
      if (daftar_kota[kode_kota].toLowerCase() == cari.toLowerCase()) {
        return [{'kode':kode_kota, 'kota':daftar_kota[kode_kota]}];
      } else {
        hasil.push({'kode':kode_kota, 'kota':daftar_kota[kode_kota]});
      }
    }
  }
  return hasil
}

//mencari informasi jadwalsholat yang langsung dipanggil untuk private message di bot dengan parameter katakunci dan hari
function cariInfoKota(cari, hari) {
  var hasil = "";
  var respon = cariKota(cari);
  if (respon.length > 0) {
    if (respon.length == 1) {
      hasil = infoSholat(respon[0].kota, respon[0].kode, hari);
    } else {
      hasil = "Maaf, Pencarian Tidak Ditemukan\n\n<i>Mungkin yang anda maksud:</i>\n";
      respon.forEach(function(object, index) {
        hasil += "\t‣ (" + object.kode + ") <code>" + object.kota + "</code>\n";
      });
    }
  } else {
    hasil = "Maaf, Pencarian Tidak Ditemukan";
  }
  return hasil;
}

//mencari data jadwal sholat dari pencarian inline search query. dengan katakunci dan hari
function cariInfoKotaInline(cari, hari) {
  var hasil = [];
  var respon = cariKota(cari);
  if (respon.length > 0) {
    if (respon.length == 1) {
      var info_sholat = infoSholat(respon[0].kota, respon[0].kode, hari);
      var info_tanggal = cariHari(hari, 'dd-MMMM-yyyy');
      hasil.push({
        'type':'article',
        'id':'0',
        'title':respon[0].kota + ' (' + respon[0].kode + ')',
        'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/pray-2265933-1890836.png',
        'description':info_tanggal,
        'message_text':info_sholat,
        'parse_mode':'HTML'
      });
    } else {
      var uid = 0;
      respon.forEach(function(object, index) {
        if (object.kota && object.kota && uid < maksimal_hasil_inline_search_query) {
          var info_sholat = infoSholat(object.kota, object.kode, hari);
          var info_tanggal = cariHari(hari, 'dd-MMMM-yyyy');
          hasil.push({
            'type':'article',
            'id':uid.toString(),
            'title':object.kota + ' (' + object.kode + ')',
            'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/pray-2265933-1890836.png',
            'description':info_tanggal,
            'message_text':info_sholat,
            'parse_mode':'HTML'
          });
          ++uid;
        }
      });
    }
  } else {
    hasil.push({
      'type':'article',
      'id':'1',
      'title':'Maaf, Pencarian Tidak Ditemukan',
      'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/faq-2147169-1804873.png',
      'description':'format: <kab/kota> <hari>',
      'message_text':'Maaf, Data Tidak Ditemukan.\ncontoh : <code>@sholatinfobot sleman</code> atau <code>@sholatinfobot sleman +2</code> (untuk jadwal 2 hari kedepan)',
      'parse_mode':'HTML'
    });
  }
  return hasil;
}

//https://stackoverflow.com/a/14794066
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}

//menyusun interaksi user, dengan membedakan jenis katakunci dan hari (untuk jenis private message)
function pencarianInfo(katakunci) {
  var hasil = [];
  if (katakunci.includes(" ")) {
    var split_kata = katakunci.split(" ");
    if (split_kata.length > 1) {
      if (split_kata.length == 1) {
        hasil.push({'cari':split_kata[1]});
      } else {
        if (isInt(split_kata[split_kata.length - 1])) {
          var rangkai_kata = "";
          for (var index = 1; index < split_kata.length - 1; index++) {
            if (index == split_kata.length - 2) {
              rangkai_kata += split_kata[index];
            } else {
              rangkai_kata += split_kata[index] + " ";
            }
          }
          hasil.push({'cari':rangkai_kata,'hari':split_kata[split_kata.length - 1]});
        } else {
          var rangkai_kata = "";
          for (var index = 1; index < split_kata.length; index++) {
            if (index == split_kata.length - 1) {
              rangkai_kata += split_kata[index];
            } else {
              rangkai_kata += split_kata[index] + " ";
            }
          }
          hasil.push({'cari':rangkai_kata});
        }
      }
    }
  }
  return hasil;
}

//menyusun interaksi user, dengan membedakan jenis katakunci dan hari (untuk jenis pencarian inline search query)
function pencarianInfoQuery(katakunci) {
  var hasil = [];
  if (katakunci.includes(" ")) {
    var split_kata = katakunci.split(" ");
    if (split_kata.length > 1) {
      if (split_kata.length == 1) {
        hasil.push({'cari':split_kata[0]});
      } else {
        if (isInt(split_kata[split_kata.length - 1])) {
          var rangkai_kata = "";
          for (var index = 0; index < split_kata.length - 1; index++) {
            if (index == split_kata.length - 2) {
              rangkai_kata += split_kata[index];
            } else {
              rangkai_kata += split_kata[index] + " ";
            }
          }
          hasil.push({'cari':rangkai_kata,'hari':split_kata[split_kata.length - 1]});
        } else {
          var rangkai_kata = "";
          for (var index = 0; index < split_kata.length; index++) {
            if (index == split_kata.length - 1) {
              rangkai_kata += split_kata[index];
            } else {
              rangkai_kata += split_kata[index] + " ";
            }
          }
          hasil.push({'cari':rangkai_kata});
        }
      }
    }
  } else {
    hasil.push({'cari':katakunci});
  }
  return hasil;
}

// fungsi utama kita buat handle segala pesan
function prosesPesan(update) {
  
  // detek klo ada pesan teks dari user
  if (update.message) { 
    
    //simpan pesan bantuan
    var help_msg = "Maaf, perintah yang anda masukan salah. penggunaan: <code>/info Lokasi Hari</code>\ncontoh penggunan: <code>/info Sleman</code>\n<code>/info Sleman +2</code>";
    
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
      var katakunci = pencarianInfo(text);
      if (katakunci.length == 1) {
        var hasil = "";
        if (katakunci[0].cari && katakunci[0].hari) {
          hasil = cariInfoKota(katakunci[0].cari, katakunci[0].hari);
        } else if (katakunci[0].cari) {
          hasil = cariInfoKota(katakunci[0].cari);
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
  //jika pesan berupa search query(inline query)
  else if (update.inline_query) {
    
    // penyederhanaan variable inline query
    var msg = update.inline_query;
    var text = msg.query;
    var query_id = msg.id;
    //var chat_id = msg.from.id;
    //ambil data Surat Al-Quran dari server api.banghasan.com
    if (text.length > 2) {
      var katakunci = pencarianInfoQuery(text);
      if (katakunci.length == 1) {
        var hasil;
        
        if (katakunci[0].cari && katakunci[0].hari) {
          hasil = cariInfoKotaInline(katakunci[0].cari, katakunci[0].hari);
        }
        
        if (katakunci[0].cari && !katakunci[0].hari) {
          hasil = cariInfoKotaInline(katakunci[0].cari);
        }
        
        if (hasil) {
          kirimInlineQuery(query_id, hasil);
        } else {
          hasil.push({
            'type':'article',
            'id':'1',
            'title':'Maaf, Pencarian Tidak Ditemukan',
            'thumb_url':'https://cdn.iconscout.com/icon/free/png-64/faq-2147169-1804873.png',
            'description':'format: <kab/kota> <hari>',
            'message_text':'None',
            'parse_mode':'HTML'
          });
          kirimInlineQuery(query_id, hasil);
        }
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
  var webAppUrl = "WEB APP HASIL DEPLOY";
  
  /*var hasil = */tg.setWebHook(webAppUrl);
  //Logger.log(hasil);
}

/*
//dumping data semua kota
function semua_kota(start,end) {
  var respon = UrlFetchApp.fetch(api_fatimah + "/kota").getContentText();
  var kota = "{";
  if (respon) {
    var respon_json = JSON.parse(respon);
    if (respon_json.kota) {
      var respon_kota = respon_json.kota;
      if (respon_kota) {
        var susunan = 0;
        respon_kota.forEach(function(object, index) {
          if (index >= start && index <= end) {
            if (index == respon_kota.length - 1) {
              kota += object.id + ':"' + object.nama + '"';
            } else {
              if (susunan > 6) {
                susunan = 0;
                kota += object.id + ':"' + object.nama + '",\n';
              } else {
                ++susunan;
                kota += object.id + ':"' + object.nama + '",';
              }
            }
          }
        });
        kota = kota + "}";
      }
    }
  }
  return kota;
}

//Menampilkan kode semua kota, terdapat 511 buah kota yang terdaftar. (sumber :doc fatimah)
function dump_semua_kota() {
  //var pertama = semua_kota(0, 300);
  //Logger.log(pertama);
  var kedua = semua_kota(301, 600);
  Logger.log(kedua);
}
*/
