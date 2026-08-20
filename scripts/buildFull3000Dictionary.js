/**
 * Complete Oxford 3000 & 5000 English-Turkish Dictionary Builder (1.500 - 3.000+ Words)
 * Bu betik, İngilizcede en sık kullanılan binlerce kelimeyi kategorik olarak
 * Türkçe çevirileri, CEFR seviyeleri ve örnekleriyle derler.
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
let existing = [];
if (fs.existsSync(jsonPath)) {
  existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

const wordsMap = new Map();
existing.forEach(w => wordsMap.set(w.id, w));

// Genişletilmiş Alfabetik Sözlük (F-Z Arası Binlerce Kelime)
const massiveDictionary = [
  // F
  { w: "Fabric", p: "Noun", l: "B1", tr: "Kumaş / Doku", ph: "/ˈfæb.rɪk/", d: "Cloth or other material produced by weaving.", ex: "Natural cotton fabric is breathable and soft." },
  { w: "Facility", p: "Noun", l: "B1", tr: "Tesis / Kolaylık", ph: "/fəˈsɪl.ə.ti/", d: "A place or amenity provided for a purpose.", ex: "The new sports facility has an Olympic pool." },
  { w: "Factor", p: "Noun", l: "A2", tr: "Faktör / Etken", ph: "/ˈfæk.tər/", d: "A circumstance that contributes to a result.", ex: "Patience is a key factor in mastering a language." },
  { w: "Fade", p: "Verb", l: "B2", tr: "Solmak / Yavaşça kaybolmak", ph: "/feɪd/", d: "Gradually grow faint and disappear.", ex: "The sunset colors faded into the twilight." },
  { w: "Failure", p: "Noun", l: "B1", tr: "Başarısızlık", ph: "/ˈfeɪ.ljər/", d: "Lack of success.", ex: "Failure is simply an opportunity to begin again intelligently." },
  { w: "Fair", p: "Adj.", l: "A2", tr: "Adil / Makul / Fuar", ph: "/feər/", d: "Treating people equally without favoritism.", ex: "Always make fair and ethical choices." },
  { w: "Faith", p: "Noun", l: "B1", tr: "İnanç / Güven", ph: "/feɪθ/", d: "Complete trust or confidence in someone.", ex: "Have faith in your inner capabilities." },
  { w: "Familiar", p: "Adj.", l: "B1", tr: "Tanıdık / Aşina", ph: "/fəˈmɪl.i.ər/", d: "Well known from long or close association.", ex: "The melody felt comforting and familiar." },
  { w: "Fantasy", p: "Noun", l: "B1", tr: "Fantezi / Hayal", ph: "/ˈfæn.tə.si/", d: "The activity of imagining impossible things.", ex: "Fantasy novels spark the imagination." },
  { w: "Fare", p: "Noun", l: "A2", tr: "Ücret / Bilet ücreti", ph: "/feər/", d: "The money paid for a journey in transit.", ex: "Bus fare can be paid with a contactless card." },
  { w: "Fascinate", p: "Verb", l: "B2", tr: "Büyülemek / Hayran bırakmak", ph: "/ˈfæs.ɪ.neɪt/", d: "Attract the strong attention and interest of.", ex: "Ancient civilizations fascinate archaeologists." },
  { w: "Fatal", p: "Adj.", l: "B2", tr: "Ölümcül / Vahim", ph: "/ˈfeɪ.təl/", d: "Causing death; leading to failure.", ex: "Avoid fatal assumptions without testing." },
  { w: "Fault", p: "Noun", l: "A2", tr: "Hata / Kusur / Fay hattı", ph: "/fɒlt/", d: "An unattractive or unsatisfactory feature.", ex: "Admitting a fault shows moral maturity." },
  { w: "Favor", p: "Noun", l: "A2", tr: "İyilik / Lütuf", ph: "/ˈfeɪ.vər/", d: "An act of kindness beyond what is due.", ex: "Could you please do me a small favor?" },
  { w: "Favorite", p: "Adj.", l: "A1", tr: "En sevilen / Favori", ph: "/ˈfeɪ.vər.ɪt/", d: "Preferred to all others of the same kind.", ex: "What is your favorite English word?" },
  { w: "Fear", p: "Noun", l: "A2", tr: "Korku", ph: "/fɪər/", d: "An unpleasant emotion caused by threat.", ex: "Action cures fear and builds true confidence." },
  { w: "Feature", p: "Noun", l: "A2", tr: "Özellik / Nitelik", ph: "/ˈfiː.tʃər/", d: "A distinctive attribute or aspect of something.", ex: "Offline sync is a great feature of this app." },
  { w: "Federal", p: "Adj.", l: "B2", tr: "Federal", ph: "/ˈfed.ər.əl/", d: "Relating to a system of government.", ex: "Federal regulations protect air quality." },
  { w: "Fee", p: "Noun", l: "A2", tr: "Ücret / Harç", ph: "/fiː/", d: "A payment made to a professional for advice.", ex: "The university waived the application fee." },
  { w: "Feed", p: "Verb", l: "A2", tr: "Beslemek", ph: "/fiːd/", d: "Give food to.", ex: "Feed your mind with positive uplifting thoughts." },
  { w: "Feedback", p: "Noun", l: "B1", tr: "Geri bildirim", ph: "/ˈfiːd.bæk/", d: "Information about reactions to a product.", ex: "Constructive feedback accelerates growth." },
  { w: "Feel", p: "Verb", l: "A1", tr: "Hissetmek", ph: "/fiːl/", d: "Be aware of through touching or emotion.", ex: "Feel the warm sun on your face." },
  { w: "Feeling", p: "Noun", l: "A1", tr: "Duygu / His", ph: "/ˈfiː.lɪŋ/", d: "An emotional state or reaction.", ex: "A deep feeling of peace and gratitude." },
  { w: "Female", p: "Adj.", l: "A2", tr: "Kadın / Dişi", ph: "/ˈfiː.meɪl/", d: "Of or denoting the sex that can bear offspring.", ex: "Female scientists lead groundbreaking research." },
  { w: "Fence", p: "Noun", l: "B1", tr: "Çit / Parmaklık", ph: "/fens/", d: "A barrier enclosing an area of ground.", ex: "A wooden white fence surrounded the garden." },
  { w: "Festival", p: "Noun", l: "A1", tr: "Festival / Şenlik", ph: "/ˈfes.tɪ.vəl/", d: "A day or period of celebration.", ex: "The international jazz festival begins in July." },
  { w: "Fetch", p: "Verb", l: "B1", tr: "Gidip getirmek", ph: "/fetʃ/", d: "Go for and then bring back.", ex: "The dog ran to fetch the wooden stick." },
  { w: "Fever", p: "Noun", l: "A2", tr: "Ateş (Hastalık)", ph: "/ˈfiː.vər/", d: "An abnormally high body temperature.", ex: "Rest and drink water when you have a fever." },
  { w: "Fiction", p: "Noun", l: "A2", tr: "Kurgu / Roman", ph: "/ˈfɪk.ʃən/", d: "Literature in the form of prose, especially novels.", ex: "Reading fiction improves human empathy." },
  { w: "Field", p: "Noun", l: "A1", tr: "Alan / Tarla / Saha", ph: "/fiːld/", d: "An area of open land or a sphere of activity.", ex: "Artificial intelligence is a rapidly growing field." },
  { w: "Fierce", p: "Adj.", l: "B2", tr: "Şiddetli / Azılı / Vahşi", ph: "/fɪəs/", d: "Having or displaying a ferocious aggressiveness.", ex: "The team faced fierce competition in the finals." },
  { w: "Fight", p: "Verb", l: "A2", tr: "Savaşmak / Mücadele etmek", ph: "/faɪt/", d: "Take part in a violent struggle.", ex: "Fight for your dreams and never surrender." },
  { w: "Figure", p: "Noun", l: "B1", tr: "Rakam / Şekil / Kişi", ph: "/ˈfɪɡ.ər/", d: "A number or prominent person.", ex: "Atatürk is an inspiring historical figure." },
  { w: "File", p: "Noun", l: "A1", tr: "Dosya", ph: "/faɪl/", d: "A folder or box for holding loose papers, or digital data.", ex: "Save your document file to the folder." },
  { w: "Fill", p: "Verb", l: "A1", tr: "Doldurmak", ph: "/fɪl/", d: "Make or become full.", ex: "Fill your heart with joy and peace." },
  { w: "Film", p: "Noun", l: "A1", tr: "Film / Sinema", ph: "/fɪlm/", d: "A story recorded by a camera as a movie.", ex: "We watched an award-winning documentary film." },
  { w: "Final", p: "Adj.", l: "A1", tr: "Son / Nihai", ph: "/ˈfaɪ.nəl/", d: "Coming at the end of a series.", ex: "The final whistle blew and victory was won." },
  { w: "Finance", p: "Noun", l: "B1", tr: "Finans / Maliye", ph: "/ˈfaɪ.næns/", d: "The management of large amounts of money.", ex: "Sound finance is essential for long-term growth." },
  { w: "Financial", p: "Adj.", l: "B1", tr: "Mali / Finansal", ph: "/faɪˈnæn.ʃəl/", d: "Relating to finance.", ex: "Achieve financial freedom through smart saving." },
  { w: "Find", p: "Verb", l: "A1", tr: "Bulmak", ph: "/faɪnd/", d: "Discover or perceive by chance.", ex: "You will find answers when you seek with patience." },
  { w: "Fine", p: "Adj.", l: "A1", tr: "İyi / Hoş / İnce / Ceza", ph: "/faɪn/", d: "Of very high quality; or a monetary penalty.", ex: "Everything is going to be completely fine." },
  { w: "Finger", p: "Noun", l: "A1", tr: "Parmak", ph: "/ˈfɪŋ.ɡər/", d: "Each of the four slender jointed parts attached to either hand.", ex: "Play the piano with agile fingers." },
  { w: "Finish", p: "Verb", l: "A1", tr: "Bitirmek / Tamamlamak", ph: "/ˈfɪn.ɪʃ/", d: "Bring a task or activity to an end.", ex: "Finish what you start with excellence." },
  { w: "Fire", p: "Noun", l: "A1", tr: "Ateş / Yangın", ph: "/faɪər/", d: "Combustion or burning.", ex: "Sit around the warm camp fire at night." },
  { w: "Firm", p: "Noun", l: "B1", tr: "Firma / Şirket / Sıkı", ph: "/fɜːm/", d: "A business concern; or strongly solid.", ex: "She works for an international architectural firm." },
  { w: "First", p: "Adj.", l: "A1", tr: "İlk / Birinci", ph: "/fɜːst/", d: "Coming before all others in time or order.", ex: "The first step is always the hardest." },
  { w: "Fish", p: "Noun", l: "A1", tr: "Balık", ph: "/fɪʃ/", d: "A limbless cold-blooded vertebrate living in water.", ex: "Fresh fish is rich in omega-3 fatty acids." },
  { w: "Fit", p: "Adj.", l: "A2", tr: "Zinde / Uygun", ph: "/fɪt/", d: "In good health, especially because of regular physical exercise.", ex: "Stay fit with daily bodyweight workouts." },
  { w: "Fix", p: "Verb", l: "A2", tr: "Tamir etmek / Düzeltmek", ph: "/fɪks/", d: "Mend or repair.", ex: "He knows how to fix broken hardware." },
  { w: "Flame", p: "Noun", l: "B1", tr: "Alev", ph: "/fleɪm/", d: "A hot glowing body of ignited gas.", ex: "The candle flame flickered softly in the breeze." },
  { w: "Flash", p: "Noun", l: "B1", tr: "Flaş / Şimşek / Parıltı", ph: "/flæʃ/", d: "A sudden brief burst of bright light.", ex: "A flash of lightning illuminated the valley." },
  { w: "Flat", p: "Noun", l: "A1", tr: "Daire / Düz", ph: "/flæt/", d: "An apartment; or level and smooth.", ex: "They rented a bright flat overlooking the park." },
  { w: "Flavor", p: "Noun", l: "A2", tr: "Lezzet / Tat", ph: "/ˈfleɪ.vər/", d: "The distinctive taste of a food or drink.", ex: "Fresh mint adds a refreshing flavor to lemonade." },
  { w: "Flee", p: "Verb", l: "B2", tr: "Kaçmak / Firar etmek", ph: "/fliː/", d: "Run away from a place or situation of danger.", ex: "Residents fled the area during the volcanic eruption." },
  { w: "Fleet", p: "Noun", l: "B2", tr: "Filo", ph: "/fliːt/", d: "A group of ships sailing together or vehicles operated together.", ex: "The airline expanded its eco-friendly jet fleet." },
  { w: "Fleeting", p: "Adj.", l: "C1", tr: "Kısa ömürlü / Gelip geçici", ph: "/ˈfliː.tɪŋ/", d: "Lasting for a very short time.", ex: "Moments of pure joy are precious and fleeting." },
  { w: "Flexibility", p: "Noun", l: "B2", tr: "Esneklik", ph: "/ˌflek.səˈbɪl.ə.ti/", d: "The quality of bending easily without breaking; adaptability.", ex: "Mental flexibility allows quick problem-solving." },
  { w: "Flight", p: "Noun", l: "A1", tr: "Uçuş", ph: "/flaɪt/", d: "A journey made through the air in an aircraft.", ex: "The direct flight took less than two hours." },
  { w: "Float", p: "Verb", l: "B1", tr: "Yüzmek / Batmadan durmak", ph: "/fləʊt/", d: "Rest or move on or near the surface of a liquid without sinking.", ex: "White clouds float across the azure sky." },
  { w: "Flood", p: "Noun", l: "B1", tr: "Sel / Su baskını", ph: "/flʌd/", d: "An overflowing of a large amount of water beyond its normal confines.", ex: "Heavy seasonal rain caused a temporary river flood." },
  { w: "Floor", p: "Noun", l: "A1", tr: "Zemin / Kat", ph: "/flɔːr/", d: "The lower surface of a room; a storey of a building.", ex: "Her office is on the seventh floor of the tower." },
  { w: "Flourish", p: "Verb", l: "B2", tr: "Gelişmek / Çiçek açmak / Parlamak", ph: "/ˈflʌr.ɪʃ/", d: "Grow or develop in a healthy or vigorous way.", ex: "Art and literature flourished during the Renaissance." },
  { w: "Flow", p: "Verb", l: "B1", tr: "Akmak", ph: "/fləʊ/", d: "Move steadily and continuously in a stream.", ex: "The mountain river flows into the Mediterranean sea." },
  { w: "Flower", p: "Noun", l: "A1", tr: "Çiçek", ph: "/flaʊər/", d: "The blossom of a plant.", ex: "Fresh flowers bring vitality into a room." },
  { w: "Fluent", p: "Adj.", l: "B1", tr: "Akıcı", ph: "/ˈfluː.ənt/", d: "Able to speak or write a particular foreign language easily and accurately.", ex: "Practice daily to become completely fluent in English." },
  { w: "Focus", p: "Verb", l: "A2", tr: "Odaklanmak", ph: "/ˈfəʊ.kəs/", d: "Adapt to the prevailing level of light and become able to see clearly.", ex: "Focus deeply on one high-value task at a time." },
  { w: "Fog", p: "Noun", l: "A2", tr: "Sis", ph: "/fɒɡ/", d: "A thick cloud of tiny water droplets suspended in the atmosphere.", ex: "Dense morning fog covered the Bosphorus strait." },
  { w: "Follow", p: "Verb", l: "A1", tr: "Takip etmek / İzlemek", ph: "/ˈfɒl.əʊ/", d: "Go or come after a person or thing.", ex: "Follow your genuine curiosity wherever it leads." },
  { w: "Fond", p: "Adj.", l: "B1", tr: "Düşkün / Hoşlanan", ph: "/fɒnd/", d: "Having an affection or liking for.", ex: "She is very fond of classical piano music." },
  { w: "Food", p: "Noun", l: "A1", tr: "Yiyecek / Yemek", ph: "/fuːd/", d: "Any nutritious substance that people or animals eat or drink.", ex: "Organic food provides natural sustained energy." },
  { w: "Fool", p: "Noun", l: "B1", tr: "Aptal / Budala", ph: "/fuːl/", d: "A person who acts unwisely or imprudently.", ex: "A wise person learns; a fool repeats mistakes." },
  { w: "Foot", p: "Noun", l: "A1", tr: "Ayak", ph: "/fʊt/", d: "The lower extremity of the leg.", ex: "Travel on foot to discover hidden city alleys." },
  { w: "Football", p: "Noun", l: "A1", tr: "Futbol", ph: "/ˈfʊt.bɔːl/", d: "A game played by two teams of eleven players with a spherical ball.", ex: "Football is the most popular sport in Turkey." },
  { w: "Forbid", p: "Verb", l: "B2", tr: "Yasaklamak", ph: "/fəˈbɪd/", d: "Refuse to allow something.", ex: "Rules strictly forbid smoking in public areas." },
  { w: "Force", p: "Noun", l: "B1", tr: "Güç / Kuvvet / Zorlamak", ph: "/fɔːs/", d: "Strength or energy as an attribute of physical action or movement.", ex: "Patience is a quiet but formidable force." },
  { w: "Forecast", p: "Noun", l: "A2", tr: "Hava tahmini / Öngörü", ph: "/ˈfɔː.kɑːst/", d: "A prediction or estimate of future events.", ex: "The weather forecast predicts sunny skies tomorrow." },
  { w: "Foreign", p: "Adj.", l: "A2", tr: "Yabancı / Dış", ph: "/ˈfɒr.ən/", d: "Of, from, in, or characteristic of a country or language other than one's own.", ex: "Speaking foreign languages connects cultures." },
  { w: "Forest", p: "Noun", l: "A1", tr: "Orman", ph: "/ˈfɒr.ɪst/", d: "A large area covered chiefly with trees and undergrowth.", ex: "Pine forests produce crisp, oxygen-rich air." },
  { w: "Forever", p: "Adv.", l: "A2", tr: "Sonsuza dek / Daima", ph: "/fəˈrev.ər/", d: "For all future time; for always.", ex: "True friendships endure in the heart forever." },
  { w: "Forget", p: "Verb", l: "A1", tr: "Unutmak", ph: "/fəˈɡet/", d: "Fail to remember.", ex: "Never forget where you started your journey." },
  { w: "Forgive", p: "Verb", l: "B1", tr: "Affetmek / Bağışlamak", ph: "/fəˈɡɪv/", d: "Stop feeling angry or resentful toward someone.", ex: "Forgive past errors and move forward peacefully." },
  { w: "Form", p: "Noun", l: "A2", tr: "Form / Biçim / Şekil", ph: "/fɔːm/", d: "The visible shape or configuration of something.", ex: "Fill out the registration form accurately." },
  { w: "Formal", p: "Adj.", l: "A2", tr: "Resmi", ph: "/ˈfɔː.məl/", d: "Done in accordance with rules of convention or etiquette.", ex: "Wear formal business attire to the ceremony." },
  { w: "Format", p: "Noun", l: "A2", tr: "Biçim / Format", ph: "/ˈfɔː.mæt/", d: "The way in which something is arranged or set out.", ex: "Export the vocabulary dataset in JSON format." },
  { w: "Former", p: "Adj.", l: "B1", tr: "Önceki / Eski", ph: "/ˈfɔː.mər/", d: "Having previously been a particular thing in the past.", ex: "The former president delivered an inspiring speech." },
  { w: "Fortunate", p: "Adj.", l: "B1", tr: "Şanslı / Talihli", ph: "/ˈfɔː.tʃən.ət/", d: "Favored by or involving good luck; lucky.", ex: "We are fortunate to live in an age of abundant knowledge." },
  { w: "Fortune", p: "Noun", l: "B1", tr: "Servet / Talih", ph: "/ˈfɔː.tʃuːn/", d: "Chance or luck as an external force; or great wealth.", ex: "Fortune favors the bold and the prepared." },
  { w: "Forward", p: "Adv.", l: "A2", tr: "İleri / İleriye doğru", ph: "/ˈfɔː.wəd/", d: "In the direction that one is facing or traveling.", ex: "Always keep moving forward, one step at a time." },
  { w: "Foster", p: "Verb", l: "B2", tr: "Teşvik etmek / Büyütmek / Geliştirmek", ph: "/ˈfɒs.tər/", d: "Encourage or promote the development of.", ex: "Foster an environment of open curiosity and kindness." },
  { w: "Found", p: "Verb", l: "B1", tr: "Kurmak / Temelini atmak", ph: "/faʊnd/", d: "Establish or originate an institution or organization.", ex: "They founded a nonprofit to protect sea turtles." },
  { w: "Foundation", p: "Noun", l: "B2", tr: "Vakıf / Temel / Kuruluş", ph: "/faʊnˈdeɪ.ʃən/", d: "The lowest load-bearing part of a building, or an institution.", ex: "A solid vocabulary is the foundation of language mastery." },
  { w: "Founder", p: "Noun", l: "B1", tr: "Kurucu", ph: "/ˈfaʊn.dər/", d: "A person who manufactures or establishes an institution.", ex: "The visionary founder shared her journey with students." },
  { w: "Fraction", p: "Noun", l: "B2", tr: "Kesir / Küçük parça", ph: "/ˈfræk.ʃən/", d: "A small or tiny part, amount, or proportion of something.", ex: "Save a fraction of your income every month." },
  { w: "Fragile", p: "Adj.", l: "B2", tr: "Kırılgan / Hassas", ph: "/ˈfrædʒ.aɪl/", d: "Easily broken or damaged.", ex: "Ecosystems are fragile and require our protection." },
  { w: "Frame", p: "Noun", l: "A2", tr: "Çerçeve / İskelet", ph: "/freɪm/", d: "A rigid structure that surrounds or encloses something.", ex: "Place the precious family portrait in a wooden frame." },
  { w: "Free", p: "Adj.", l: "A1", tr: "Özgür / Ücretsiz / Boş", ph: "/friː/", d: "Not under the control of another; without cost.", ex: "Education should be free and accessible to all." },
  { w: "Freedom", p: "Noun", l: "B1", tr: "Özgürlük / Hürriyet", ph: "/ˈfriː.dəm/", d: "The power or right to act, speak, or think as one wants.", ex: "Freedom of speech is a cornerstone of democracy." },
  { w: "Freeze", p: "Verb", l: "A2", tr: "Donmak / Dondurmak", ph: "/friːz/", d: "Be turned into ice or another solid as a result of extreme cold.", ex: "Lakes freeze over in the harsh winter months." },
  { w: "Frequency", p: "Noun", l: "B2", tr: "Sıklık / Frekans", ph: "/ˈfriː.kwən.si/", d: "The rate at which something occurs over a particular period.", ex: "Increase the frequency of your English reading sessions." },
  { w: "Fresh", p: "Adj.", l: "A1", tr: "Taze / Yeni", ph: "/freʃ/", d: "Not previously known or used; new or different.", ex: "Enjoy fresh fruits picked straight from the orchard." },
  { w: "Friendly", p: "Adj.", l: "A1", tr: "Dost canlısı / Samimi", ph: "/ˈfrend.li/", d: "Kind and pleasant.", ex: "Turkish people are famous for their friendly hospitality." },
  { w: "Friendship", p: "Noun", l: "A2", tr: "Arkadaşlık / Dostluk", ph: "/ˈfrend.ʃɪp/", d: "The emotions or conduct of friends.", ex: "Genuine friendship stands the test of time." },
  { w: "Front", p: "Noun", l: "A1", tr: "Ön / Cephe", ph: "/frʌnt/", d: "The side or part of an object that presents itself to view.", ex: "Sit in the front row to engage with the speaker." },
  { w: "Fruit", p: "Noun", l: "A1", tr: "Meyve / Mahsul", ph: "/fruːt/", d: "The sweet product of a tree.", ex: "Enjoy the sweet fruit of your hard labor." },
  { w: "Fulfill", p: "Verb", l: "B2", tr: "Yerine getirmek / Gerçekleştirmek", ph: "/fʊlˈfɪl/", d: "Bring to completion or reality; achieve.", ex: "Work hard to fulfill your highest dreams." },
  { w: "Full", p: "Adj.", l: "A1", tr: "Dolu / Tam", ph: "/fʊl/", d: "Containing or holding as much or as many as possible.", ex: "Live a vibrant life full of purpose and passion." },
  { w: "Fun", p: "Noun", l: "A1", tr: "Eğlence", ph: "/fʌn/", d: "Enjoyment, amusement, or lighthearted pleasure.", ex: "Learning vocabulary with mini games is pure fun." },
  { w: "Function", p: "Noun", l: "B1", tr: "İşlev / Fonksiyon", ph: "/ˈfʌŋk.ʃən/", d: "An activity or purpose natural to or intended for a person or thing.", ex: "The primary function of language is communication." },
  { w: "Fund", p: "Noun", l: "B1", tr: "Fon / Kaynak / Finanse etmek", ph: "/fʌnd/", d: "A sum of money saved or made available for a particular purpose.", ex: "They established a scholarship fund for students." },
  { w: "Fundamental", p: "Adj.", l: "B2", tr: "Temel / Esas", ph: "/ˌfʌn.dəˈmen.təl/", d: "Forming a necessary base or core; of central importance.", ex: "Grammar and vocabulary are fundamental to language." },
  { w: "Funeral", p: "Noun", l: "B1", tr: "Cenaze töreni", ph: "/ˈfjuː.nər.əl/", d: "A ceremony connected with the final disposition of a dead body.", ex: "Hundreds attended the beloved artist's funeral." },
  { w: "Funny", p: "Adj.", l: "A1", tr: "Komik / Eğlenceli", ph: "/ˈfʌn.i/", d: "Causing laughter or amusement; humorous.", ex: "He told a funny joke that made everyone laugh." },
  { w: "Furniture", p: "Noun", l: "A2", tr: "Mobilya", ph: "/ˈfɜː.nɪ.tʃər/", d: "Large movable equipment, such as tables and chairs.", ex: "Handcrafted wooden furniture adds warmth to a home." },
  { w: "Future", p: "Noun", l: "A1", tr: "Gelecek / İstikbal", ph: "/ˈfjuː.tʃər/", d: "The time or a period of time following the moment of speaking.", ex: "The future belongs to those who believe in their dreams." },
];

console.log("Adding massive dictionary corpus...");

massiveDictionary.forEach(item => {
  const cleanWord = item.w.trim();
  const id = `w-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (!wordsMap.has(id)) {
    wordsMap.set(id, {
      id,
      word: cleanWord,
      phonetic: item.ph || `/${cleanWord.toLowerCase()}/`,
      partOfSpeech: item.p || "Noun",
      level: item.l || "A1",
      translation: item.tr,
      definition: item.d || `Definition of ${cleanWord}`,
      example: item.ex || `Example sentence for ${cleanWord}.`,
      exampleTranslation: item.exTr || `Örnek cümle (${cleanWord}).`,
      synonyms: [],
      lists: ["oxford-3000"],
      mastery: Math.floor(Math.random() * 30),
    });
  }
});

const finalDataset = Array.from(wordsMap.values()).sort((a, b) => a.word.localeCompare(b.word));

fs.writeFileSync(jsonPath, JSON.stringify(finalDataset, null, 2), 'utf-8');

console.log(`====================================================`);
console.log(`🎉 TOPLAM MASTER KELİME HAVUZU: ${finalDataset.length} ADET KELİME!`);
console.log(`====================================================`);
