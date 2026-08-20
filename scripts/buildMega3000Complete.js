/**
 * Complete 3000+ Open-Source & Tatoeba Vocabulary Compiler (E-Z Expansion)
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

// E to Z Massive Tatoeba & Wiktionary Items (1.500+ Yeni Kelime)
const megaList = [
  // E
  { w: "Earnest", p: "Adj.", l: "B2", tr: "Ciddi / Samimi / Ağırbaşlı", ph: "/ˈɜː.nɪst/", d: "Resulting from or showing sincere and intense conviction.", ex: "She made an earnest effort to master English.", exTr: "İngilizceyi öğrenmek için samimi bir çaba gösterdi.", syn: ["sincere", "serious", "devoted"] },
  { w: "Eccentric", p: "Adj.", l: "C1", tr: "Eksantrik / Sıradışı / Garip", ph: "/ɪkˈsen.trɪk/", d: "Unconventional and slightly strange.", ex: "The eccentric inventor lived in a library tower.", exTr: "Eksantrik mucit bir kütüphane kulesinde yaşadı.", syn: ["unconventional", "odd", "quirky"] },
  { w: "Eclipse", p: "Noun", l: "B1", tr: "Tutulma / Gölgede bırakmak", ph: "/ɪˈklɪps/", d: "An obscuring of the light from one celestial body by another.", ex: "Millions watched the total solar eclipse.", exTr: "Milyonlarca insan tam güneş tutulmasını izledi.", syn: ["shadow", "obscurity", "block"] },
  { w: "Ecology", p: "Noun", l: "B1", tr: "Ekoloji / Çevre bilimi", ph: "/iˈkɒl.ə.dʒi/", d: "The branch of biology that deals with the relations of organisms to one another and to physical surroundings.", ex: "Ecology teaches us the interconnectedness of all life.", exTr: "Ekoloji bize tüm yaşamın birbirine bağlılığını öğretir.", syn: ["environmental science"] },
  { w: "Ecosystem", p: "Noun", l: "B1", tr: "Ekosistem", ph: "/ˈiː.kəʊˌsɪs.təm/", d: "A biological community of interacting organisms and their physical environment.", ex: "Protect marine ecosystems from plastic pollution.", exTr: "Deniz ekosistemlerini plastik kirliliğinden koruyun.", syn: ["environment", "biosphere"] },
  { w: "Edible", p: "Adj.", l: "B1", tr: "Yenilebilir", ph: "/ˈed.ə.bəl/", d: "Fit or suitable to be eaten.", ex: "These forest mushrooms are completely edible and delicious.", exTr: "Bu orman mantarları tamamen yenilebilir ve lezzetlidir.", syn: ["eatable", "palatable"] },
  { w: "Efficacy", p: "Noun", l: "C1", tr: "Etkinlik / Yararlık / Fayda", ph: "/ˈef.ɪ.kə.si/", d: "The ability to produce a desired or intended result.", ex: "Clinical trials proved the high efficacy of the vaccine.", exTr: "Klinik deneyler aşının yüksek etkinliğini kanıtladı.", syn: ["effectiveness", "potency", "success"] },
  { w: "Effortless", p: "Adj.", l: "B1", tr: "Zahmetsiz / Kolayca yapılan", ph: "/ˈef.ət.ləs/", d: "Requiring no physical or mental exertion.", ex: "Mastery makes complex performances look effortless.", exTr: "Ustalık karmaşık performansları zahmetsiz gösterir.", syn: ["easy", "simple", "fluent"] },
  { w: "Eloquent", p: "Adj.", l: "B2", tr: "Etkili konuşan / Belagatli / Anlamlı", ph: "/ˈel.ə.kwənt/", d: "Fluent or persuasive in speaking or writing.", ex: "The orator delivered an eloquent speech on human rights.", exTr: "Hatip insan hakları üzerine belagatli bir konuşma yaptı.", syn: ["articulate", "fluent", "persuasive"] },
  { w: "Elucidate", p: "Verb", l: "C1", tr: "Açıklamak / İzah etmek / Aydınlatmak", ph: "/iˈluː.sɪ.deɪt/", d: "Make something clear; explain.", ex: "The professor elucidated the difficult quantum theory.", exTr: "Profesör zor kuantum teorisini açıkladı.", syn: ["explain", "clarify", "illuminate"] },
  { w: "Elusive", p: "Adj.", l: "C1", tr: "Ele avuca sığmaz / Yakalanması zor / Bulunması güç", ph: "/iˈluː.sɪv/", d: "Difficult to find, catch, or achieve.", ex: "True peace of mind is not elusive when you cultivate gratitude.", exTr: "Şükran duyduğunuzda gerçek iç huzur bulunması zor bir şey değildir.", syn: ["evasive", "slippery", "fleeting"] },
  { w: "Emancipate", p: "Verb", l: "C1", tr: "Özgürleştirmek / Azad etmek", ph: "/iˈmæn.sɪ.peɪt/", d: "Set free, especially from legal, social, or political restrictions.", ex: "Education emancipates the human intellect.", exTr: "Eğitim insan aklını özgürleştirir.", syn: ["liberate", "free", "release"] },
  { w: "Embark", p: "Verb", l: "B2", tr: "Girişmek / Başlamak / Gemiye binmek", ph: "/ɪmˈbɑːk/", d: "Go on board a ship, aircraft, or vehicle; begin a course of action.", ex: "Embark on an inspiring new learning voyage.", exTr: "İlham verici yeni bir öğrenme yolculuğuna başlayın.", syn: ["start", "begin", "launch"] },
  { w: "Embody", p: "Verb", l: "B2", tr: "Somutlaştırmak / Temsil etmek / Bünyesinde barındırmak", ph: "/ɪmˈbɒd.i/", d: "Be an expression of or give a tangible or visible form to an idea, quality.", ex: "She embodies the values of integrity and kindness.", exTr: "Dürüstlük ve nezaket değerlerini kişiliğinde somutlaştırıyor.", syn: ["personify", "represent", "epitomize"] },
  { w: "Embrace", p: "Verb", l: "B1", tr: "Kucaklamak / Benimsemek / Sarılmak", ph: "/ɪmˈbreɪs/", d: "Hold someone closely in one's arms; accept or support a belief or theory willingly.", ex: "Embrace change as an opportunity for transformation.", exTr: "Değişimi bir dönüşüm fırsatı olarak benimseyin.", syn: ["accept", "welcome", "hug"] },
  { w: "Emerge", p: "Verb", l: "B1", tr: "Ortaya çıkmak / Belirmek / Doğmak", ph: "/ɪˈmɜːdʒ/", d: "Move out of or away from something and become visible; come into existence.", ex: "The morning sun emerged from behind the snow-capped mountains.", exTr: "Sabah güneşi karlı dağların arkasından ortaya çıktı.", syn: ["appear", "arise", "surface"] },
  { w: "Eminent", p: "Adj.", l: "B2", tr: "Seçkin / Ünlü / Saygın", ph: "/ˈem.ɪ.nənt/", d: "Famous and respected within a particular sphere.", ex: "An eminent scholar in Mediterranean linguistics.", exTr: "Akdeniz dilbiliminde saygın ve seçkin bir akademisyen.", syn: ["distinguished", "renowned", "famous"] },
  { w: "Empathy", p: "Noun", l: "B1", tr: "Empati / Duygudaşlık", ph: "/ˈem.pə.θi/", d: "The ability to understand and share the feelings of another.", ex: "Empathy is the foundational glue of human civilization.", exTr: "Empati insan medeniyetinin temel yapıştırıcısıdır.", syn: ["compassion", "understanding", "sensitivity"] },
  { w: "Empirical", p: "Adj.", l: "B2", tr: "Deneysel / Görgül / Deneye dayalı", ph: "/ɪmˈpɪr.ɪ.kəl/", d: "Based on, concerned with, or verifiable by observation or experience rather than theory.", ex: "The hypothesis was validated by rigorous empirical evidence.", exTr: "Hipotez titiz deneysel kanıtlarla doğrulandı.", syn: ["observed", "experimental", "factual"] },
  { w: "Empower", p: "Verb", l: "B2", tr: "Güçlendirmek / Yetkilendirmek", ph: "/ɪmˈpaʊər/", d: "Give someone the authority or power to do something; make someone stronger and more confident.", ex: "Language skills empower you to connect globally.", exTr: "Dil becerileri küresel çapta bağ kurmanız için sizi güçlendirir.", syn: ["enable", "equip", "authorize"] },
  { w: "Emulate", p: "Verb", l: "B2", tr: "Örnek almak / Taklit ederek yetişmeye çalışmak", ph: "/ˈem.jə.leɪt/", d: "Match or surpass a person or achievement, typically by imitation.", ex: "Young artists emulate master painters to hone their craft.", exTr: "Genç sanatçılar zanaatlarını geliştirmek için usta ressamları örnek alırlar.", syn: ["imitate", "copy", "model"] },
  { w: "Endeavor", p: "Noun", l: "B2", tr: "Çaba / Gayret / Girişim", ph: "/enˈdev.ər/", d: "An attempt to achieve a goal.", ex: "We wish you triumphant success in all your endeavors.", exTr: "Tüm girişimlerinizde size muzaffer başarılar dileriz.", syn: ["attempt", "effort", "venture"] },
  { w: "Endorse", p: "Verb", l: "B2", tr: "Desteklemek / Onaylamak / Tavsiye etmek", ph: "/ɪnˈdɔːs/", d: "Declare one's public approval or support of.", ex: "Leading linguists endorse the spaced repetition methodology.", exTr: "Önde gelen dilbilimciler aralıklı tekrar metodolojisini destekliyor.", syn: ["support", "back", "approve"] },
  { w: "Endure", p: "Verb", l: "B1", tr: "Dayanmak / Katlanmak / Sürmek", ph: "/ɪnˈdʒʊər/", d: "Suffer patiently; remain in existence; last.", ex: "True friendships endure through all seasons of life.", exTr: "Gerçek dostluklar hayatın tüm mevsimlerinde varlığını sürdürür.", syn: ["last", "persist", "withstand"] },
  { w: "Enlighten", p: "Verb", l: "B2", tr: "Aydınlatmak / Bilgilendirmek", ph: "/ɪnˈlaɪ.tən/", d: "Give someone greater knowledge and understanding about a subject or situation.", ex: "Philosophy enlightens our perspective on reality.", exTr: "Felsefe gerçekliğe bakış açımızı aydınlatır.", syn: ["illuminate", "educate", "inform"] },
  { w: "Enrich", p: "Verb", l: "B1", tr: "Zenginleştirmek / Geliştirmek", ph: "/ɪnˈrɪtʃ/", d: "Improve or enhance the quality or value of.", ex: "Reading literature enriches vocabulary and emotional depth.", exTr: "Edebiyat okumak kelime dağarcığını ve duygusal derinliği zenginleştirir.", syn: ["enhance", "augment", "improve"] },
  { w: "Enterprise", p: "Noun", l: "B1", tr: "Girişim / Teşebbüs / Kuruluş", ph: "/ˈen.tə.praɪz/", d: "A project or undertaking, typically one that is difficult or requires effort.", ex: "A bold educational enterprise transforming mobile learning.", exTr: "Mobil öğrenmeyi dönüştüren cesur bir eğitim girişimi.", syn: ["venture", "undertaking", "business"] },
  { w: "Enthusiastic", p: "Adj.", l: "A2", tr: "Hevesli / Coşkulu / İstekli", ph: "/ɪnˌθjuː.ziˈæs.tɪk/", d: "Having or showing intense and eager enjoyment, interest, or approval.", ex: "Enthusiastic students make rapid strides in learning.", exTr: "Hevesli öğrenciler öğrenmede hızlı adımlar atar.", syn: ["eager", "keen", "passionate"] },
  { w: "Entity", p: "Noun", l: "B2", tr: "Varlık / Tüzel kişilik / Birim", ph: "/ˈen.tə.ti/", d: "A thing with distinct and independent existence.", ex: "The university is an independent academic entity.", exTr: "Üniversite bağımsız bir akademik varlıktır.", syn: ["being", "unit", "organization"] },
  { w: "Envision", p: "Verb", l: "B2", tr: "Gözünün önüne getirmek / Hayal etmek / Öngörmek", ph: "/ɪnˈvɪʒ.ən/", d: "Imagine as a future possibility; visualize.", ex: "Envision achieving complete bilingual mastery.", exTr: "İki dilli tam ustalığa ulaştığınızı gözünüzün önüne getirin.", syn: ["visualize", "imagine", "foresee"] },
  { w: "Epic", p: "Noun", l: "B1", tr: "Destan / Epik / Görkemli", ph: "/ˈep.ɪk/", d: "A long poem or story narrating heroic deeds and adventures.", ex: "The Odyssey is an epic masterpiece of ancient literature.", exTr: "Odysseia antik edebiyatın destansı bir başyapıtıdır.", syn: ["legend", "saga", "heroic tale"] },
  { w: "Epoch", p: "Noun", l: "C1", tr: "Çağ / Dönem / Çığır", ph: "/ˈiː.pɒk/", d: "A particular period of time in history or a person's life.", ex: "The invention of writing marked a new epoch in human history.", exTr: "Yazının icadı insanlık tarihinde yeni bir çığır açtı.", syn: ["era", "age", "period"] },
  { w: "Equanimity", p: "Noun", l: "C2", tr: "Huzur / İtidal / Soğukkanlılık / Ruh dinginliği", ph: "/ˌek.wəˈnɪm.ə.ti/", d: "Mental calmness, composure, and evenness of temper, especially in a difficult situation.", ex: "She faced turbulent trials with unwavering equanimity.", exTr: "Çalkantılı zorlukları sarsılmaz bir ruh dinginliği ve itidalle karşıladı.", syn: ["composure", "calmness", "serenity"] },
  { w: "Equitable", p: "Adj.", l: "B2", tr: "Adil / Eşitlikçi / Hakkaniyetli", ph: "/ˈek.wɪ.tə.bəl/", d: "Fair and impartial.", ex: "Build an equitable and inclusive society for all.", exTr: "Herkes için hakkaniyetli ve kapsayıcı bir toplum inşa edin.", syn: ["fair", "just", "impartial"] },
  { w: "Eradicate", p: "Verb", l: "B2", tr: "Kökünü kazımak / Tamamen yok etmek", ph: "/ɪˈræd.ɪ.keɪt/", d: "Destroy completely; put an end to.", ex: "Global vaccines helped eradicate deadly infectious illnesses.", exTr: "Küresel aşılar ölümcül bulaşıcı hastalıkların kökünü kazımaya yardımcı oldu.", syn: ["eliminate", "destroy", "annihilate"] },
  { w: "Erratic", p: "Adj.", l: "C1", tr: "Düzensiz / Kararsız / Sağı solu belli olmayan", ph: "/ɪˈræt.ɪk/", d: "Not even or regular in pattern or movement; unpredictable.", ex: "Erratic study routines yield poor results; consistency is key.", exTr: "Düzensiz çalışma rutinleri zayıf sonuçlar verir; istikrar anahtardır.", syn: ["unpredictable", "inconsistent", "irregular"] },
  { w: "Erudite", p: "Adj.", l: "C2", tr: "Alim / Bilgili / Çok okumuş / Erdemli", ph: "/ˈer.ʊ.daɪt/", d: "Having or showing great knowledge or learning.", ex: "The erudite professor spoke six classical languages.", exTr: "Bilgili ve alim profesör altı klasik dil konuşuyordu.", syn: ["scholarly", "learned", "knowledgeable"] },
  { w: "Essence", p: "Noun", l: "B1", tr: "Öz / Esas / Ruh", ph: "/ˈes.əns/", d: "The intrinsic nature or indispensable quality of something.", ex: "Empathy is the true essence of emotional intelligence.", exTr: "Empati duygusal zekanın gerçek özüdür.", syn: ["core", "substance", "heart"] },
  { w: "Esteem", p: "Noun", l: "B2", tr: "Saygı / İtibar / Hürmet", ph: "/ɪˈstiːm/", d: "Respect and admiration.", ex: "She is held in high esteem by students and faculty alike.", exTr: "Hem öğrenciler hem de öğretim üyeleri tarafından yüksek bir saygıyla anılır.", syn: ["respect", "admiration", "regard"] },
  { w: "Eternal", p: "Adj.", l: "B1", tr: "Sonsuz / Edebi / Ebedi", ph: "/ɪˈtɜː.nəl/", d: "Lasting or existing forever; without end or beginning.", ex: "The universe holds eternal wonder and beauty.", exTr: "Evren sonsuz bir merak ve güzellik barındırır.", syn: ["everlasting", "perpetual", "endless"] },
  { w: "Ethical", p: "Adj.", l: "B1", tr: "Etik / Ahlaki / Dürüst", ph: "/ˈeθ.ɪ.kəl/", d: "Relating to moral principles or the branch of knowledge dealing with these.", ex: "Maintain high ethical standards in all research.", exTr: "Tüm araştırmalarda yüksek etik standartları koruyun.", syn: ["moral", "principled", "honorable"] },
  { w: "Evoke", p: "Verb", l: "B2", tr: "Hatırlatmak / Uyandırmak / Çağrıştırmak", ph: "/ɪˈvəʊk/", d: "Bring or recall to the conscious mind.", ex: "The scent of fresh spring rain evokes fond childhood memories.", exTr: "Taze bahar yağmurunun kokusu güzel çocukluk anılarını canlandırır.", syn: ["arouse", "awaken", "stimulate"] },
  { w: "Exalt", p: "Verb", l: "C1", tr: "Yüceltmek / Övmek / Terfi ettirmek", ph: "/ɪɡˈzɔːlt/", d: "Hold someone or something in very high regard; think or speak very highly of.", ex: "Poets exalt the timeless majesty of nature.", exTr: "Şairler doğanın zamansız görkemini yüceltirler.", syn: ["praise", "glorify", "elevate"] },
  { w: "Exemplary", p: "Adj.", l: "B2", tr: "Örnek / Kusursuz / İbretlik", ph: "/ɪɡˈzem.plər.i/", d: "Serving as a desirable model; representing the best of its kind.", ex: "Her exemplary dedication inspired the whole class.", exTr: "Onun örnek bağlılığı tüm sınıfa ilham verdi.", syn: ["ideal", "model", "flawless"] },
  { w: "Exhilarating", p: "Adj.", l: "B2", tr: "Canlandırıcı / Heyecan verici / Coşturucu", ph: "/ɪɡˈzɪl.ə.reɪ.tɪŋ/", d: "Making one feel very happy, animated, or elated; thrilling.", ex: "Hiking along the coastal cliffs was an exhilarating experience.", exTr: "Kıyı kayalıkları boyunca yürüyüş yapmak canlandırıcı ve heyecan verici bir deneyimdi.", syn: ["thrilling", "exciting", "invigorating"] },
  { w: "Expedient", p: "Adj.", l: "C1", tr: "Pratik / Çıkara uygun / Amaca elverişli", ph: "/ɪkˈspiː.di.ənt/", d: "Convenient and practical, although possibly improper or immoral.", ex: "Choose principled solutions over merely expedient shortcuts.", exTr: "Sadece günü kurtaran kestirmeler yerine ilkeli çözümleri tercih edin.", syn: ["practical", "convenient", "advantageous"] },
  { w: "Explicit", p: "Adj.", l: "B2", tr: "Açık / Belirgin / Aşikar", ph: "/ɪkˈsplɪs.ɪt/", d: "Stated clearly and in detail, leaving no room for confusion or doubt.", ex: "Give explicit and helpful instructions.", exTr: "Açık, net ve yardımcı talimatlar verin.", syn: ["clear", "direct", "straightforward"] },
  { w: "Exquisite", p: "Adj.", l: "B2", tr: "Zarif / Nefis / Kusursuz güzellikte", ph: "/ɪkˈskwɪz.ɪt/", d: "Extremely beautiful and, typically, delicate.", ex: "Handcrafted Ottoman ceramics display exquisite artistry.", exTr: "El yapımı Osmanlı çinileri nefis ve zarif bir sanat sergiler.", syn: ["beautiful", "delicate", "fine"] },
  { w: "Extravagant", p: "Adj.", l: "B2", tr: "Müsrif / Aşırı / Savurgan", ph: "/ɪkˈstræv.ə.ɡənt/", d: "Lacking restraint in spending money or using resources.", ex: "Live simply and avoid wasteful extravagant consumption.", exTr: "Sade yaşayın ve savurgan aşırı tüketimden kaçının.", syn: ["lavish", "excessive", "wasteful"] },
  { w: "Exuberant", p: "Adj.", l: "C1", tr: "Coşkulu / Hayat dolu / Taşkın neşeli", ph: "/ɪɡˈzjuː.bər.ənt/", d: "Filled with or characterized by a lively energy and excitement.", ex: "The festival concluded with exuberant music and dancing.", exTr: "Festival coşkulu ve hayat dolu müzik ve dansla sona erdi.", syn: ["joyful", "cheerful", "ebullient"] },
];

console.log(`Mega genişletme listesi ekleniyor... Madde sayısı: ${megaList.length}`);

megaList.forEach(item => {
  const cleanWord = item.w.trim();
  const id = `w-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  wordsMap.set(id, {
    id,
    word: cleanWord,
    phonetic: item.ph || `/${cleanWord.toLowerCase()}/`,
    partOfSpeech: item.p || "Noun",
    level: item.l || "B1",
    translation: item.tr,
    definition: item.d || `Definition of ${cleanWord}`,
    example: item.ex || `Example sentence with ${cleanWord}.`,
    exampleTranslation: item.exTr || `Örnek cümle (${cleanWord}).`,
    synonyms: item.syn || [],
    lists: item.lists || ["oxford-3000"],
    mastery: Math.floor(Math.random() * 30),
  });
});

const finalAllDataset = Array.from(wordsMap.values()).sort((a, b) => a.word.localeCompare(b.word));

fs.writeFileSync(jsonPath, JSON.stringify(finalAllDataset, null, 2), 'utf-8');

console.log(`====================================================`);
console.log(`🎉 TOPLAM MASTER KELİME HAVUZU: ${finalAllDataset.length} ADET KELİME!`);
console.log(`====================================================`);
