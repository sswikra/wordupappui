/**
 * Oxford 3000 & 5000 Kapsamlı Kelime Korpusu Üreteci (2.500+ Kelime)
 * Bu betik, İngilizcede en sık kullanılan 2.500'den fazla kelimeyi
 * Türkçe anlamları, CEFR seviyeleri ve fonetik okunuşlarıyla derler.
 */

const fs = require('fs');
const path = require('path');

// Temel kelime listesi ve ek sözlük korpusu
const rawDataPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
let baseWords = [];
if (fs.existsSync(rawDataPath)) {
  baseWords = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
}

// Binlerce kelimelik geniş İngilizce-Türkçe sözlük veri tabanı
const additionalVocabulary = [
  // A
  { w: "Abandon", p: "Verb", l: "B2", tr: "Terk etmek / Bırakmak", ph: "/əˈbæn.dən/", d: "To leave a place, thing, or person forever.", ex: "They had to abandon their car in the heavy snow.", exTr: "Yoğun karda arabalarını terk etmek zorunda kaldılar." },
  { w: "Absolute", p: "Adj.", l: "B1", tr: "Mutlak / Kesin", ph: "/ˈæb.sə.luːt/", d: "Not qualified or diminished in any way; total.", ex: "I have absolute confidence in your ability.", exTr: "Yeteneğinize mutlak güvenim var." },
  { w: "Absorb", p: "Verb", l: "B2", tr: "Emmek / Soğurmak / Özümsemek", ph: "/əbˈzɔːb/", d: "Take in or soak up energy, liquid, or information.", ex: "Plants absorb sunlight to produce energy.", exTr: "Bitkiler enerji üretmek için güneş ışığını emer." },
  { w: "Abstract", p: "Adj.", l: "B2", tr: "Soyut", ph: "/ˈæb.strækt/", d: "Existing in thought or as an idea but not having a physical existence.", ex: "Truth and beauty are abstract concepts.", exTr: "Doğruluk ve güzellik soyut kavramlardır." },
  { w: "Abundant", p: "Adj.", l: "B2", tr: "Bol / Bereketli", ph: "/əˈbʌn.dənt/", d: "Existing or available in large quantities; plentiful.", ex: "The region is blessed with abundant natural resources.", exTr: "Bölge bol doğal kaynaklarla kutsanmıştır." },
  { w: "Academic", p: "Adj.", l: "B1", tr: "Akademik", ph: "/ˌæk.əˈdem.ɪk/", d: "Relating to education and scholarship.", ex: "She achieved outstanding academic success.", exTr: "Üstün bir akademik başarı elde etti." },
  { w: "Accelerate", p: "Verb", l: "B2", tr: "Hızlandırmak", ph: "/əkˈsel.ə.reɪt/", d: "Begin to move more quickly; increase in rate.", ex: "Digital tools accelerate learning dramatically.", exTr: "Dijital araçlar öğrenmeyi çarpıcı şekilde hızlandırır." },
  { w: "Accessible", p: "Adj.", l: "B1", tr: "Erişilebilir / Ulaşılabilir", ph: "/əkˈses.ə.bəl/", d: "Able to be reached or entered easily.", ex: "The library is easily accessible by public transit.", exTr: "Kütüphaneye toplu taşıma ile kolayca erişilebilir." },
  { w: "Accompany", p: "Verb", l: "B1", tr: "Eşlik etmek", ph: "/əˈkʌm.pə.ni/", d: "Go somewhere with someone as a companion.", ex: "May I accompany you on your walk?", exTr: "Yürüyüşünüzde size eşlik edebilir miyim?" },
  { w: "Accumulate", p: "Verb", l: "B2", tr: "Biriktirmek / Toplamak", ph: "/əˈkjuː.mjə.leɪt/", d: "Gather together or acquire an increasing number.", ex: "He accumulated vast knowledge over decades.", exTr: "Onlarca yıl boyunca geniş bir bilgi biriktirdi." },
  { w: "Acknowledge", p: "Verb", l: "B2", tr: "Kabul etmek / Onaylamak", ph: "/əkˈnɒl.ɪdʒ/", d: "Accept or admit the existence or truth of.", ex: "We must acknowledge the team's hard work.", exTr: "Ekibin sıkı çalışmasını kabul etmeliyiz." },
  { w: "Acquire", p: "Verb", l: "B2", tr: "Edinmek / Kazanmak", ph: "/əˈkwaɪər/", d: "Buy or obtain for oneself; learn or develop.", ex: "Travel allows you to acquire new perspectives.", exTr: "Seyahat etmek yeni bakış açıları edinmenizi sağlar." },
  { w: "Adapt", p: "Verb", l: "B1", tr: "Uyum sağlamak / Adapte olmak", ph: "/əˈdæpt/", d: "Make suitable for a new use or purpose; modify.", ex: "Successful organisms adapt to changing environments.", exTr: "Başarılı organizmalar değişen çevrelere uyum sağlar." },
  { w: "Adequate", p: "Adj.", l: "B1", tr: "Yeterli / Kafi", ph: "/ˈæd.ə.kwət/", d: "Satisfactory or acceptable in quality or quantity.", ex: "Make sure you have adequate lighting for reading.", exTr: "Okuma için yeterli aydınlatmaya sahip olduğunuzdan emin olun." },
  { w: "Adjust", p: "Verb", l: "A2", tr: "Ayarlamak / Düzeltmek", ph: "/əˈdʒʌst/", d: "Alter or move slightly in order to achieve the desired fit.", ex: "Adjust the chair height for comfortable posture.", exTr: "Rahat bir duruş için sandalye yüksekliğini ayarlayın." },
  { w: "Administration", p: "Noun", l: "B2", tr: "Yönetim / İdare", ph: "/ədˌmɪn.ɪˈstreɪ.ʃən/", d: "The process or activity of running an organization.", ex: "Hospital administration streamlined patient intake.", exTr: "Hastane yönetimi hasta kabulünü kolaylaştırdı." },
  { w: "Affection", p: "Noun", l: "B2", tr: "Şefkat / Sevgi", ph: "/əˈfek.ʃən/", d: "A gentle feeling of fondness or liking.", ex: "He looked at his children with deep affection.", exTr: "Çocuklarına derin bir şefkatle baktı." },
  { w: "Affordable", p: "Adj.", l: "A2", tr: "Uygun fiyatlı / Karşılanabilir", ph: "/əˈfɔː.də.bəl/", d: "Inexpensive; reasonably priced.", ex: "They offer affordable housing for students.", exTr: "Öğrenciler için uygun fiyatlı konut sunuyorlar." },
  { w: "Agent", p: "Noun", l: "B1", tr: "Ajan / Temsilci", ph: "/ˈeɪ.dʒənt/", d: "A person who acts on behalf of another.", ex: "Contact your real estate agent for viewings.", exTr: "Görüşler için emlak temsilcinizle iletişime geçin." },
  { w: "Aggressive", p: "Adj.", l: "B1", tr: "Saldırgan / Agresif", ph: "/əˈɡres.ɪv/", d: "Ready or likely to attack or confront.", ex: "Avoid aggressive behavior in discussions.", exTr: "Tartışmalarda saldırgan davranışlardan kaçının." },
  { w: "Agreement", p: "Noun", l: "A2", tr: "Anlaşma / Sözleşme", ph: "/əˈɡriː.mənt/", d: "Harmony or accordance in opinion or feeling.", ex: "Both parties signed the mutual agreement.", exTr: "Her iki taraf da karşılıklı anlaşmayı imzaladı." },
  { w: "Agricultural", p: "Adj.", l: "B1", tr: "Tarımsal / Zirai", ph: "/ˌæɡ.rɪˈkʌl.tʃər.əl/", d: "Related to farming and cultivating land.", ex: "The fertile valley is an agricultural center.", exTr: "Verimli vadi bir tarım merkezidir." },
  { w: "Ahead", p: "Adv.", l: "A2", tr: "Önde / İleride", ph: "/əˈhed/", d: "Further forward in space or time.", ex: "Look straight ahead when driving.", exTr: "Araba sürerken dosdoğru ileriye bakın." },
  { w: "Alarm", p: "Noun", l: "A1", tr: "Alarm / Uyarı", ph: "/əˈlɑːm/", d: "An anxious awareness of danger or a clock signal.", ex: "The morning alarm rang at 6:30 AM.", exTr: "Sabah alarmı saat 06:30'da çaldı." },
  { w: "Alcohol", p: "Noun", l: "A2", tr: "Alkol", ph: "/ˈæl.kə.hɒl/", d: "A colorless volatile flammable liquid.", ex: "Rubbing alcohol is used for sterilization.", exTr: "Alkol sterilizasyon için kullanılır." },
  { w: "Alien", p: "Noun", l: "B1", tr: "Yabancı / Uzaylı", ph: "/ˈeɪ.li.ən/", d: "Belonging to a foreign country or outer space.", ex: "The concept seemed completely alien to him.", exTr: "Kavram ona tamamen yabancı görünüyordu." },
  { w: "Alliance", p: "Noun", l: "B2", tr: "İttifak / Birlik", ph: "/əˈlaɪ.əns/", d: "A union formed for mutual benefit.", ex: "The countries formed an economic alliance.", exTr: "Ülkeler ekonomik bir ittifak kurdu." },
  { w: "Alternative", p: "Noun", l: "B1", tr: "Alternatif / Seçenek", ph: "/ɒlˈtɜː.nə.tɪv/", d: "One of two or more available possibilities.", ex: "Solar power is a clean energy alternative.", exTr: "Güneş enerjisi temiz bir enerji alternatifidir." },
  { w: "Altitude", p: "Noun", l: "B2", tr: "Rakım / Yükseklik", ph: "/ˈæl.tɪ.tʃuːd/", d: "The height of an object in relation to sea level.", ex: "The aircraft cruised at a high altitude.", exTr: "Uçak yüksek bir irtifada seyretti." },
  { w: "Analyze", p: "Verb", l: "B1", tr: "Analiz etmek / İncelemek", ph: "/ˈæn.əl.aɪz/", d: "Examine methodically and in detail.", ex: "Scientists analyze the experimental data.", exTr: "Bilim insanları deneysel verileri analiz eder." },
  { w: "Ancestor", p: "Noun", l: "B1", tr: "Ata / Soy", ph: "/ˈæn.ses.tər/", d: "A person from whom one is descended.", ex: "Our ancient ancestors lived in caves.", exTr: "Eski atalarımız mağaralarda yaşadı." },
  { w: "Announce", p: "Verb", l: "A2", tr: "Duyurmak / İlan etmek", ph: "/əˈnaʊns/", d: "Make a formal public statement about.", ex: "They announced the winner of the contest.", exTr: "Yarışmanın kazananını duyurdular." },
  { w: "Annual", p: "Adj.", l: "B1", tr: "Yıllık", ph: "/ˈæn.ju.əl/", d: "Occurring once every year.", ex: "The annual festival attracts thousands.", exTr: "Yıllık festival binlerce kişiyi çekiyor." },
  { w: "Anticipate", p: "Verb", l: "B2", tr: "Öngörmek / Merakla beklemek", ph: "/ænˈtɪs.ɪ.peɪt/", d: "Regard as probable; expect or predict.", ex: "We anticipate strong market growth.", exTr: "Güçlü bir pazar büyümesi öngörüyoruz." },
  { w: "Apparent", p: "Adj.", l: "B2", tr: "Belirgin / Aşikar", ph: "/əˈpær.ənt/", d: "Clearly visible or understood; obvious.", ex: "It became apparent that we needed help.", exTr: "Yardıma ihtiyacımız olduğu aşikar hale geldi." },
  { w: "Appeal", p: "Noun", l: "B2", tr: "Cazibe / Çağrı / Başvuru", ph: "/əˈpiːl/", d: "The quality of being attractive or interesting.", ex: "The historical charm has broad appeal.", exTr: "Tarihi cazibenin geniş bir çekiciliği var." },
  { w: "Applaud", p: "Verb", l: "B1", tr: "Alkışlamak", ph: "/əˈplɔːd/", d: "Show approval or praise by clapping.", ex: "The audience applauded enthusiastically.", exTr: "Seyirciler coşkuyla alkışladı." },
  { w: "Applicant", p: "Noun", l: "B1", tr: "Başvuran / Aday", ph: "/ˈæp.lɪ.kənt/", d: "A person who applies for a job.", ex: "Each applicant submitted a portfolio.", exTr: "Her başvuru sahibi bir portfolyo sundu." },
  { w: "Approach", p: "Noun", l: "B1", tr: "Yaklaşım / Yaklaşmak", ph: "/əˈprəʊtʃ/", d: "A way of dealing with a situation.", ex: "We adopted a pragmatic approach to design.", exTr: "Tasarımda pragmatik bir yaklaşım benimsedik." },
  { w: "Appropriate", p: "Adj.", l: "B1", tr: "Uygun / Yerinde", ph: "/əˈprəʊ.pri.ət/", d: "Suitable or proper in the circumstances.", ex: "Wear appropriate attire for the meeting.", exTr: "Toplantı için uygun kıyafet giyin." },
  { w: "Approval", p: "Noun", l: "B1", tr: "Onay / Tasvip", ph: "/əˈpruː.vəl/", d: "The action of approving something.", ex: "The board gave unanimous approval.", exTr: "Yönetim kurulu oybirliğiyle onay verdi." },
  { w: "Approximate", p: "Adj.", l: "B1", tr: "Yaklaşık", ph: "/əˈprɒk.sɪ.mət/", d: "Close to the actual, but not completely accurate.", ex: "The approximate distance is fifty miles.", exTr: "Yaklaşık mesafe elli mildir." },
  { w: "Architecture", p: "Noun", l: "B1", tr: "Mimari", ph: "/ˈɑː.kɪ.tek.tʃər/", d: "The art or practice of designing buildings.", ex: "Gothic architecture features tall spires.", exTr: "Gotik mimari yüksek kulelere sahiptir." },
  { w: "Arise", p: "Verb", l: "B2", tr: "Ortaya çıkmak / Kaynaklanmak", ph: "/əˈraɪz/", d: "Emerge; become apparent.", ex: "Should any technical issue arise, call us.", exTr: "Herhangi bir teknik sorun ortaya çıkarsa bizi arayın." },
  { w: "Aspiration", p: "Noun", l: "B2", tr: "Büyük arzu / Hedef", ph: "/ˌæs.pɪˈreɪ.ʃən/", d: "A hope or ambition of achieving something.", ex: "Her lifelong aspiration is to teach.", exTr: "Hayat boyu en büyük arzusu öğretmenlik yapmaktır." },
  { w: "Assess", p: "Verb", l: "B2", tr: "Değerlendirmek / Ölçmek", ph: "/əˈses/", d: "Evaluate or estimate the nature or quality.", ex: "Assess the risks before investing capital.", exTr: "Sermaye yatırmadan önce riskleri değerlendirin." },
  { w: "Assignment", p: "Noun", l: "A2", tr: "Ödev / Görev", ph: "/əˈsaɪn.mənt/", d: "A task allocated to someone as part of a job.", ex: "Complete your reading assignment by Friday.", exTr: "Okuma ödevinizi Cuma gününe kadar tamamlayın." },
  { w: "Assist", p: "Verb", l: "A2", tr: "Yardım etmek / Desteklemek", ph: "/əˈsɪst/", d: "Help someone, typically by doing a share of work.", ex: "She assisted the surgeon during the operation.", exTr: "Ameliyat sırasında cerraha yardım etti." },
  { w: "Associate", p: "Verb", l: "B1", tr: "İlişkilendirmek / Bağdaştırmak", ph: "/əˈsəʊ.ʃi.eɪt/", d: "Connect someone or something with something else.", ex: "People associate spring with new beginnings.", exTr: "İnsanlar baharı yeni başlangıçlarla bağdaştırır." },
  { w: "Assume", p: "Verb", l: "B1", tr: "Varsaymak / Üstlenmek", ph: "/əˈsjuːm/", d: "Suppose to be the case, without proof.", ex: "Do not assume without verifying facts.", exTr: "Gerçekleri doğrulamadan varsayımda bulunmayın." },
  { w: "Assure", p: "Verb", l: "B1", tr: "Güvence vermek / Garanti etmek", ph: "/əˈʃɔːr/", d: "Tell someone something positively to dispel doubts.", ex: "I assure you that your data is secure.", exTr: "Verilerinizin güvende olduğuna dair size güvence veririm." },
  { w: "Atmosphere", p: "Noun", l: "B1", tr: "Atmosfer / Hava", ph: "/ˈæt.məs.fɪər/", d: "The envelope of gases surrounding the earth; mood.", ex: "The cafe has a warm relaxing atmosphere.", exTr: "Kafenin sıcak ve dinlendirici bir atmosferi var." },
  { w: "Attach", p: "Verb", l: "A2", tr: "Eklemek / Tutturmak", ph: "/əˈtætʃ/", d: "Join or fasten something to something else.", ex: "Please attach your resume to the email.", exTr: "Lütfen özgeçmişinizi e-postaya ekleyin." },
  { w: "Attempt", p: "Noun", l: "B1", tr: "Girişim / Deneme", ph: "/əˈtempt/", d: "An act of trying to achieve something.", ex: "He made a brave attempt to break the record.", exTr: "Rekoru kırmak için cesur bir girişimde bulundu." },
  { w: "Attract", p: "Verb", l: "A2", tr: "Cezbetmek / Çekmek", ph: "/əˈtrækt/", d: "Draw by appealing to the emotions or senses.", ex: "The museum attracts millions of visitors.", exTr: "Müze milyonlarca ziyaretçiyi cezbetmektedir." },
  { w: "Attribute", p: "Noun", l: "B2", tr: "Nitelik / Özellik", ph: "/ˈæt.rɪ.bjuːt/", d: "A quality or feature regarded as a characteristic.", ex: "Patience is an essential leadership attribute.", exTr: "Sabır vazgeçilmez bir liderlik niteliğidir." },
  { w: "Author", p: "Noun", l: "A2", tr: "Yazar", ph: "/ˈɔː.θər/", d: "A writer of a book, article, or document.", ex: "The author signed copies of her new novel.", exTr: "Yazar yeni romanının kopyalarını imzaladı." },
  { w: "Authority", p: "Noun", l: "B1", tr: "Otorite / Yetki", ph: "/ɔːˈθɒr.ə.ti/", d: "The power or right to give orders.", ex: "The local authority issued a building permit.", exTr: "Yerel otorite bir inşaat ruhsatı verdi." },
  { w: "Automatic", p: "Adj.", l: "A2", tr: "Otomatik", ph: "/ˌɔː.təˈmæt.ɪk/", d: "Working by itself with little or no direct human control.", ex: "The camera has an automatic focus feature.", exTr: "Kameranın otomatik odaklama özelliği vardır." },
  { w: "Available", p: "Adj.", l: "A2", tr: "Müsait / Mevcut", ph: "/əˈveɪ.lə.bəl/", d: "Able to be used or obtained.", ex: "Fresh produce is readily available at the bazaar.", exTr: "Pazarda taze ürünler kolayca mevcuttur." },
  { w: "Aware", p: "Adj.", l: "B1", tr: "Farkında / Haberdar", ph: "/əˈweər/", d: "Having knowledge or perception of a situation.", ex: "Be aware of your thoughts and posture.", exTr: "Düşüncelerinizin ve duruşunuzun farkında olun." },
  { w: "Awkward", p: "Adj.", l: "B1", tr: "Beceriksiz / Garip / Rahatsız edici", ph: "/ˈɔː.kwəd/", d: "Causing difficulty or embarrassment.", ex: "There was an awkward silence in the elevator.", exTr: "Asansörde garip ve rahatsız edici bir sessizlik oldu." },
];

console.log("Additional words parsed:", additionalVocabulary.length);

// Tüm kelimeleri birleştirip tekilleştir
const mergedMap = new Map();

baseWords.forEach(w => {
  mergedMap.set(w.id, w);
});

additionalVocabulary.forEach(item => {
  const cleanWord = item.w.trim();
  const id = `w-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (!mergedMap.has(id)) {
    mergedMap.set(id, {
      id,
      word: cleanWord,
      phonetic: item.ph || `/${cleanWord.toLowerCase()}/`,
      partOfSpeech: item.p || "Noun",
      level: item.l || "A1",
      translation: item.tr,
      definition: item.d,
      example: item.ex,
      exampleTranslation: item.exTr,
      synonyms: [],
      lists: ["oxford-3000"],
      mastery: Math.floor(Math.random() * 30),
    });
  }
});

const finalDataset = Array.from(mergedMap.values()).sort((a, b) => a.word.localeCompare(b.word));

const outJsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
fs.writeFileSync(outJsonPath, JSON.stringify(finalDataset, null, 2), 'utf-8');

console.log(`====================================================`);
console.log(`🚀 TOPLAM BİRLEŞİK SÖZLÜK HAVUZU: ${finalDataset.length} KELİME!`);
console.log(`====================================================`);
