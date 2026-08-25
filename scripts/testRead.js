const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
let existing = [];
if (fs.existsSync(jsonPath)) {
  existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

const wordsMap = new Map();

// 1. Load existing words
existing.forEach((w) => {
  if (w && w.id) {
    wordsMap.set(w.id, {
      ...w,
      lists: Array.isArray(w.lists) ? [...w.lists] : [],
    });
  }
});

// 2. Load and merge words from all script files
const scriptsDir = path.join(__dirname, '..', 'scripts');
fs.readdirSync(scriptsDir).forEach((f) => {
  if (!f.endsWith('.js') || f === 'seedFirestore.js' || f === 'testRead.js') return;
  try {
    const fileContent = fs.readFileSync(path.join(scriptsDir, f), 'utf-8');
    const regex = /\{\s*(?:w|word):\s*"([^"]+)",\s*(?:p|pos|partOfSpeech):\s*"([^"]+)",\s*(?:l|level):\s*"([^"]+)",\s*tr:\s*"([^"]+)",\s*(?:ph|phonetic):\s*"([^"]+)",\s*(?:d|def|definition):\s*"([^"]+)",\s*(?:ex|example):\s*"([^"]+)"(?:,\s*(?:exTr|exampleTranslation):\s*"([^"]+)")?(?:,\s*(?:syn|synonyms):\s*(\[[^\]]*\]))?(?:,\s*(?:lists|lst|list):\s*(\[[^\]]*\]))?/g;
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      const [_, word, pos, level, tr, ph, def, ex, exTr, synRaw, listRaw] = match;
      const cleanWord = word.trim();
      const id = `w-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      let syn = [];
      if (synRaw) {
        try {
          syn = JSON.parse(synRaw.replace(/'/g, '"'));
        } catch {}
      }

      let parsedLists = [];
      if (listRaw) {
        try {
          parsedLists = JSON.parse(listRaw.replace(/'/g, '"'));
        } catch {}
      }

      if (!wordsMap.has(id)) {
        wordsMap.set(id, {
          id,
          word: cleanWord,
          partOfSpeech: pos,
          level: level,
          translation: tr,
          phonetic: ph,
          definition: def,
          example: ex,
          exampleTranslation: exTr || `Örnek cümle (${cleanWord}).`,
          synonyms: syn,
          mastery: 0,
          lists: parsedLists,
        });
      } else {
        const cur = wordsMap.get(id);
        if (level.startsWith('C') && !cur.level.startsWith('C')) {
          cur.level = level;
        }
        if (tr && (!cur.translation || cur.translation.length < tr.length)) {
          cur.translation = tr;
        }
        if (ph && !cur.phonetic) cur.phonetic = ph;
        if (def && !cur.definition) cur.definition = def;
        if (ex && !cur.example) cur.example = ex;
        if (exTr && (!cur.exampleTranslation || cur.exampleTranslation.startsWith('Örnek'))) {
          cur.exampleTranslation = exTr;
        }
        if (syn.length > 0 && (!cur.synonyms || cur.synonyms.length === 0)) {
          cur.synonyms = syn;
        }
      }
    }
  } catch (e) {
    console.error(`Error reading ${f}:`, e.message);
  }
});

// 3. Add explicit C1 & C2 academic / exam vocabulary
const advancedVocab = [
  {
    w: "Aberration", p: "Noun", l: "C1", tr: "Sapma / Anormallik / Kuraldışılık", ph: "/ˌæb.əˈreɪ.ʃən/",
    d: "A departure from what is normal, usual, or expected, typically an unwelcome one.",
    ex: "The sudden drop in test scores was an aberration from her usual excellence.",
    exTr: "Test puanlarındaki ani düşüş, onun her zamanki mükemmelliğinden bir sapmaydı.",
    syn: ["anomaly", "deviation", "irregularity", "divergence"]
  },
  {
    w: "Abhor", p: "Verb", l: "C1", tr: "Nefret etmek / İğrenmek / Tiksinmek", ph: "/əbˈhɔːr/",
    d: "Regard with disgust and hatred.",
    ex: "They abhor all forms of discrimination, injustice, and cruelty.",
    exTr: "Her türlü ayrımcılıktan, adaletsizlikten ve zulümden nefret ederler.",
    syn: ["detest", "loathe", "despise", "abominate"]
  },
  {
    w: "Acumen", p: "Noun", l: "C1", tr: "Keskin zeka / Kavrayış / Sezgi yeteneği", ph: "/ˈæk.jə.mən/",
    d: "The ability to make good judgments and quick decisions, typically in a particular domain.",
    ex: "Her sharp business acumen helped the small enterprise turn into a global brand.",
    exTr: "Onun keskin iş zekası, küçük girişimin küresel bir markaya dönüşmesine yardımcı oldu.",
    syn: ["astuteness", "shrewdness", "sharpness", "discernment"]
  },
  {
    w: "Alacrity", p: "Noun", l: "C2", tr: "İsteklilik / Canlılık / Çevik heves", ph: "/əˈlæk.rə.ti/",
    d: "Brisk and cheerful readiness to do something.",
    ex: "She accepted the academic research fellowship with great alacrity.",
    exTr: "Akademik araştırma bursunu büyük bir isteklilik ve sevinçle kabul etti.",
    syn: ["eagerness", "willingness", "readiness", "enthusiasm"]
  },
  {
    w: "Anachronistic", p: "Adj.", l: "C2", tr: "Çağdışı / Çağına uymayan / Zaman aşımına uğramış", ph: "/əˌnæk.rəˈnɪs.tɪk/",
    d: "Belonging or appropriate to an earlier period, especially so as to seem conspicuously old-fashioned.",
    ex: "Using typewriters in a modern digital office feels completely anachronistic.",
    exTr: "Modern bir dijital ofiste daktilo kullanmak tamamen çağdışı hissettiriyor.",
    syn: ["outdated", "archaic", "antiquated", "obsolete"]
  },
  {
    w: "Antipathy", p: "Noun", l: "C1", tr: "Karşıtlık / Güçlü hoşnutsuzluk / Antipati", ph: "/ænˈtɪp.ə.θi/",
    d: "A deep-seated feeling of dislike; aversion.",
    ex: "There was mutual antipathy between the two competing political factions.",
    exTr: "İki rakip siyasi grup arasında karşılıklı güçlü bir hoşnutsuzluk vardı.",
    syn: ["hostility", "aversion", "animosity", "enmity"]
  },
  {
    w: "Assiduous", p: "Adj.", l: "C2", tr: "Çalışkan / Gayretli / Sebatkar", ph: "/əˈsɪdʒ.u.əs/",
    d: "Showing great care, attention, and perseverance in doing work.",
    ex: "Through assiduous research, the historian discovered previously lost manuscripts.",
    exTr: "Tarihçi, sebatkar ve gayretli araştırmalarıyla daha önce kaybolmuş el yazmalarını keşfetti.",
    syn: ["diligent", "meticulous", "industrious", "painstaking"]
  },
  {
    w: "Banal", p: "Adj.", l: "C1", tr: "Basmakalıp / Sıradan / Yavan", ph: "/bəˈnɑːl/",
    d: "So lacking in originality as to be obvious and boring.",
    ex: "The film had stunning visuals but suffered from a banal, predictable storyline.",
    exTr: "Filmin göz alıcı görselleri vardı fakat basmakalıp ve tahmin edilebilir hikayesinden zarar gördü.",
    syn: ["trite", "hackneyed", "clichéd", "commonplace"]
  },
  {
    w: "Belligerent", p: "Adj.", l: "C1", tr: "Saldırgan / Kavgacı / Savaşçı", ph: "/bəˈlɪdʒ.ər.ənt/",
    d: "Hostile and aggressive; engaged in a war or conflict.",
    ex: "Diplomats worked tirelessly to de-escalate the belligerent rhetoric between the states.",
    exTr: "Diplomatlar, devletler arasındaki saldırgan söylemi yatıştırmak için yorulmadan çalıştılar.",
    syn: ["hostile", "aggressive", "combative", "pugnacious"]
  },
  {
    w: "Cacophony", p: "Noun", l: "C1", tr: "Kulak tırmalayan sesler karmaşası / Kakofoni", ph: "/kəˈkɒf.ə.ni/",
    d: "A harsh, discordant mixture of sounds.",
    ex: "The cacophony of construction drills and blaring horns echoed through the busy avenue.",
    exTr: "İnşaat matkaplarının ve çalan kornaların kulak tırmalayan gürültüsü kalabalık caddede yankılandı.",
    syn: ["dissonance", "discord", "racket", "clamor"]
  },
  {
    w: "Castigate", p: "Verb", l: "C2", tr: "Sertçe azarlamak / Şiddetle kınamak", ph: "/ˈkæs.tɪ.ɡeɪt/",
    d: "Reprimand someone severely.",
    ex: "The ethics committee castigated the author for blatant intellectual dishonesty.",
    exTr: "Etik komitesi, açık entelektüel sahtekarlığı nedeniyle yazarı sert bir şekilde kınadı.",
    syn: ["reprimand", "rebuke", "admonish", "chastise"]
  },
  {
    w: "Circumlocution", p: "Noun", l: "C2", tr: "Dolaylı anlatım / Lafı uzatma / Dolambaçlı söz", ph: "/ˌsɜː.kəm.ləˈkjuː.ʃən/",
    d: "The use of many words where fewer would do, especially in a deliberate attempt to be vague.",
    ex: "Politicians often resort to circumlocution when avoiding direct yes-or-no questions.",
    exTr: "Siyasiler doğrudan evet ya da hayır sorularından kaçınırken sıklıkla dolambaçlı anlatıma başvurur.",
    syn: ["periphrasis", "verbosity", "prolixity", "pleonasm"]
  },
  {
    w: "Compunction", p: "Noun", l: "C2", tr: "Vicdan azabı / Pişmanlık duygusu", ph: "/kəmˈpʌŋk.ʃən/",
    d: "A feeling of guilt or moral scruple that prevents or follows the doing of something bad.",
    ex: "He embezzled public funds without the slightest compunction.",
    exTr: "En ufak bir vicdan azabı duymadan kamu fonlarını zimmetine geçirdi.",
    syn: ["remorse", "scruples", "misgivings", "qualms"]
  },
  {
    w: "Dearth", p: "Noun", l: "C1", tr: "Kıtlık / Yetersizlik / Yokluk", ph: "/dɜːθ/",
    d: "A scarcity or lack of something.",
    ex: "There is an alarming dearth of skilled healthcare professionals in remote rural regions.",
    exTr: "Uzak kırsal bölgelerde endişe verici bir nitelikli sağlık personeli kıtlığı var.",
    syn: ["scarcity", "shortage", "paucity", "lack"]
  },
  {
    w: "Deleterious", p: "Adj.", l: "C1", tr: "Zararlı / Sağlığı bozan / Yıkıcı", ph: "/ˌdel.ɪˈtɪə.ri.əs/",
    d: "Causing harm or damage.",
    ex: "Prolonged screen exposure before sleep has deleterious effects on sleep quality.",
    exTr: "Uykudan önce uzun süre ekrana maruz kalmanın uyku kalitesi üzerinde zararlı etkileri vardır.",
    syn: ["harmful", "detrimental", "damaging", "injurious"]
  },
  {
    w: "Egregious", p: "Adj.", l: "C1", tr: "Göz göre göre yapılan / Affedilemez / Fahiş", ph: "/ɪˈɡriː.dʒəs/",
    d: "Outstandingly bad; shocking.",
    ex: "The auditor uncovered an egregious accounting error that cost the firm millions.",
    exTr: "Denetçi, şirkete milyonlara mal olan fahiş bir muhasebe hatasını ortaya çıkardı.",
    syn: ["shocking", "appalling", "terrible", "flagrant"]
  },
  {
    w: "Enervate", p: "Verb", l: "C2", tr: "Gücünü tüketmek / Halsiz bırakmak / Zayıflatmak", ph: "/ˈen.ə.veɪt/",
    d: "Cause someone to feel drained of energy or vitality; weaken.",
    ex: "The suffocating tropical humidity enervated the travelers within hours.",
    exTr: "Boğucu tropikal nem, gezginleri saatler içinde halsiz ve dermansız bıraktı.",
    syn: ["exhaust", "tire", "fatigue", "weaken"]
  },
  {
    w: "Ephemeral", p: "Adj.", l: "C2", tr: "Geçici / Fani / Kısa ömürlü", ph: "/ɪˈfem.ər.əl/",
    d: "Lasting for a very short time.",
    ex: "The ephemeral beauty of cherry blossoms captivates people every single spring.",
    exTr: "Kiraz çiçeklerinin geçici güzelliği her bahar insanları büyüler.",
    syn: ["fleeting", "transient", "momentary", "evanescent"]
  },
  {
    w: "Equanimity", p: "Noun", l: "C2", tr: "İtidal / Soğukkanlılık / Ruh dinginliği", ph: "/ˌek.wəˈnɪm.ə.ti/",
    d: "Mental calmness, composure, and evenness of temper, especially in a difficult situation.",
    ex: "She accepted both praise and severe criticism with serene equanimity.",
    exTr: "Hem övgüleri hem de sert eleştirileri sakin bir itidal ve vakarla kabul etti.",
    syn: ["composure", "calmness", "poise", "serenity"]
  },
  {
    w: "Esoteric", p: "Adj.", l: "C1", tr: "Sadece uzmanların anladığı / Ezoterik / Derin", ph: "/ˌes.əˈter.ɪk/",
    d: "Intended for or likely to be understood by only a small number of people with a specialized knowledge.",
    ex: "Quantum theoretical physics involves esoteric mathematical formulas.",
    exTr: "Kuantum teorik fiziği, yalnızca uzmanların anladığı ezoterik matematiksel formüller içerir.",
    syn: ["abstruse", "obscure", "arcane", "cryptic"]
  },
  {
    w: "Evanescent", p: "Adj.", l: "C2", tr: "Uçucu / Çabuk kaybolan / Gelip geçici", ph: "/ˌev.əˈnes.ənt/",
    d: "Soon passing out of sight, memory, or existence; quickly fading or disappearing.",
    ex: "Rainbows are evanescent wonders of the atmosphere that vanish in moments.",
    exTr: "Gökkuşakları, dakikalar içinde kaybolan gelip geçici atmosfer harikalarıdır.",
    syn: ["fleeting", "transient", "vanishing", "ephemeral"]
  },
  {
    w: "Exonerate", p: "Verb", l: "C1", tr: "Aklamak / Suçsuz bulmak / Muaf tutmak", ph: "/ɪɡˈzɒn.ə.reɪt/",
    d: "Absolve someone from blame for a fault or wrongdoing.",
    ex: "Fresh DNA evidence served to completely exonerate the wrongfully convicted man.",
    exTr: "Yeni DNA kanıtları, haksız yere mahkûm edilen adamı tamamen aklamaya yaradı.",
    syn: ["absolve", "acquit", "clear", "vindicate"]
  },
  {
    w: "Fastidious", p: "Adj.", l: "C2", tr: "Aşırı titiz / Zor beğenen / Kılı kırk yaran", ph: "/fæsˈtɪd.i.əs/",
    d: "Very attentive to and concerned about accuracy and detail; very hard to please.",
    ex: "The master watchmaker is fastidious about every tiny gear in his mechanical clocks.",
    exTr: "Usta saatçi, mekanik saatlerindeki her minik dişli konusunda aşırı titizdir.",
    syn: ["meticulous", "punctilious", "scrupulous", "demanding"]
  },
  {
    w: "Garrulous", p: "Adj.", l: "C1", tr: "Çenesi düşük / Geveze / Çok konuşan", ph: "/ˈɡær.əl.əs/",
    d: "Excessively talkative, especially on trivial matters.",
    ex: "The garrulous cab driver told entertaining stories throughout the entire journey.",
    exTr: "Çenesi düşük taksi şoförü yolculuk boyunca eğlenceli hikayeler anlattı.",
    syn: ["talkative", "voluble", "loquacious", "chatty"]
  },
  {
    w: "Gregarious", p: "Adj.", l: "C1", tr: "Sosyalleşmeyi seven / Cana yakın / Sürü halinde yaşayan", ph: "/ɡrɪˈɡeə.ri.əs/",
    d: "Fond of company; sociable.",
    ex: "Dolphins are highly intelligent and gregarious marine mammals.",
    exTr: "Yunuslar son derece zeki ve bir arada yaşamayı seven sosyal deniz memelileridir.",
    syn: ["sociable", "outgoing", "companionable", "convivial"]
  },
  {
    w: "Iconoclast", p: "Noun", l: "C2", tr: "Gelenek yıkan / tabuları deviren / Aykırı düşünen", ph: "/aɪˈkɒn.ə.klæst/",
    d: "A person who attacks cherished beliefs or institutions.",
    ex: "Steve Jobs was regarded as a visionary technological iconoclast.",
    exTr: "Steve Jobs, tabuları yıkan vizyoner bir teknoloji öncüsü olarak kabul ediliyordu.",
    syn: ["rebel", "dissident", "maverick", "nonconformist"]
  },
  {
    w: "Impetuous", p: "Adj.", l: "C1", tr: "Düşüncesizce acele eden / Tez canlı / Fevri", ph: "/ɪmˈpetʃ.u.əs/",
    d: "Acting or done quickly and without thought or care.",
    ex: "He later regretted making such an impetuous investment decision.",
    exTr: "Daha sonra bu denli fevri ve düşüncesizce bir yatırım kararı verdiği için pişman oldu.",
    syn: ["impulsive", "rash", "hasty", "reckless"]
  },
  {
    w: "Inchoate", p: "Adj.", l: "C2", tr: "Henüz yeni başlamış / Ham / Tam gelişmemiş", ph: "/ɪnˈkəʊ.eɪt/",
    d: "Just begun and so not fully formed or developed; rudimentary.",
    ex: "She had an inchoate concept for a novel that required months of outlining.",
    exTr: "Bir roman için henüz ham ve tam şekillenmemiş, aylarca planlama gerektiren bir fikri vardı.",
    syn: ["rudimentary", "unformed", "nascent", "embryonic"]
  },
  {
    w: "Inimical", p: "Adj.", l: "C2", tr: "Düşmanca / Zararlı / Engelleyici", ph: "/ɪˈnɪm.ɪ.kəl/",
    d: "Tending to obstruct or harm; unfriendly; hostile.",
    ex: "Excessive stress and burn-out are inimical to creative problem-solving.",
    exTr: "Aşırı stres ve tükenmişlik, yaratıcı problem çözmeye zararlı ve engelleyicidir.",
    syn: ["harmful", "detrimental", "hostile", "unfavorable"]
  },
  {
    w: "Insidious", p: "Adj.", l: "C1", tr: "Sinsi / Gizlice ilerleyen ve tehlikeli", ph: "/ɪnˈsɪd.i.əs/",
    d: "Proceeding in a gradual, subtle way, but with harmful effects.",
    ex: "High blood pressure is an insidious condition that often produces no early symptoms.",
    exTr: "Yüksek tansiyon, sıklıkla hiçbir erken belirti vermeyen sinsi bir durumdur.",
    syn: ["stealthy", "subtle", "surreptitious", "cunning"]
  },
  {
    w: "Juxtapose", p: "Verb", l: "C1", tr: "Yan yana koyup karşılaştırmak", ph: "/ˌdʒʌk.stəˈpəʊz/",
    d: "Place or deal with close together for contrasting effect.",
    ex: "The exhibition juxtaposes classical Ottoman calligraphy with contemporary abstract art.",
    exTr: "Sergi, klasik Osmanlı hat sanatını çağdaş soyut sanatla yan yana getirip karşılaştırıyor.",
    syn: ["collocate", "compare", "contrast"]
  },
  {
    w: "Laconic", p: "Adj.", l: "C2", tr: "Az ve öz konuşan / Sözü uzatmayan", ph: "/ləˈkɒn.ɪk/",
    d: "Using very few words.",
    ex: "His laconic reply of 'No' concluded the intense press conference immediately.",
    exTr: "Onun 'Hayır' şeklindeki az ve öz cevabı, yoğun basın toplantısını derhal sonlandırdı.",
    syn: ["brief", "concise", "terse", "succinct"]
  },
  {
    w: "Lethargic", p: "Adj.", l: "C1", tr: "Uyuşuk / Bitkin / Hareketsiz", ph: "/ləˈθɑː.dʒɪk/",
    d: "Affected by lethargy; sluggish and apathetic.",
    ex: "The flu left him feeling weak, dizzy, and lethargic for an entire week.",
    exTr: "Grip, onu bütün bir hafta boyunca halsiz, başı dönen ve uyuşuk bıraktı.",
    syn: ["sluggish", "inert", "inactive", "listless"]
  },
  {
    w: "Magnanimous", p: "Adj.", l: "C1", tr: "Alçakgönüllü ve cömert / Yüce gönüllü", ph: "/mæɡˈnæn.ɪ.məs/",
    d: "Generous or forgiving, especially toward a rival or less powerful person.",
    ex: "The champion was magnanimous in victory, warmly praising her opponent's valiant effort.",
    exTr: "Şampiyon zaferinde yüce gönüllü davrandı ve rakibinin cesur mücadelesini sıcak bir şekilde övdü.",
    syn: ["generous", "charitable", "benevolent", "noble"]
  },
  {
    w: "Mendacious", p: "Adj.", l: "C2", tr: "Yalancı / Hakikatten uzak / Aldatıcı", ph: "/menˈdeɪ.ʃəs/",
    d: "Not telling the truth; lying.",
    ex: "The journalist exposed the mendacious claims published by the tabloid magazine.",
    exTr: "Gazeteci, magazin dergisinde yayımlanan aldatıcı ve asılsız iddiaları ortaya çıkardı.",
    syn: ["untruthful", "dishonest", "deceitful", "false"]
  },
  {
    w: "Nefarious", p: "Adj.", l: "C1", tr: "Haince / Çok kötü niyetli / Aşağılık", ph: "/nɪˈfeə.ri.əs/",
    d: "Wicked or criminal.",
    ex: "Cybersecurity experts thwarted the hacker group's nefarious scheme.",
    exTr: "Siber güvenlik uzmanları, hacker grubunun kötü niyetli ve sinsi planını engelledi.",
    syn: ["wicked", "evil", "sinful", "iniquitous"]
  },
  {
    w: "Obfuscate", p: "Verb", l: "C1", tr: "Kafaları karıştırmak / Belirsizleştirmek / Muğlaklaştırmak", ph: "/ˈɒb.fʌs.keɪt/",
    d: "Render obscure, unclear, or unintelligible.",
    ex: "Do not obfuscate the simple contract terms with dense legal jargon.",
    exTr: "Sözleşmenin basit maddelerini yoğun hukuk diliyle muğlaklaştırıp kafa karıştırmayın.",
    syn: ["obscure", "confuse", "blur", "muddle"]
  },
  {
    w: "Ostentatious", p: "Adj.", l: "C1", tr: "Gösterişli / Gösteriş budalası / Şatafatlı", ph: "/ˌɒs.tenˈteɪ.ʃəs/",
    d: "Characterized by vulgar or pretentious display; designed to impress or attract notice.",
    ex: "He drove an ostentatious gold-plated sports car through the modest neighborhood.",
    exTr: "Mütevazı mahallenin içinden gösterişli, altın kaplama bir spor arabayla geçti.",
    syn: ["showy", "pretentious", "flamboyant", "gaudy"]
  },
  {
    w: "Paradigm", p: "Noun", l: "C1", tr: "Paradigma / Model / Temel örnek", ph: "/ˈpær.ə.daɪm/",
    d: "A typical example or pattern of something; a model.",
    ex: "Quantum mechanics caused a major paradigm shift in modern theoretical physics.",
    exTr: "Kuantum mekaniği, modern teorik fizikte köklü bir paradigma değişimine yol açtı.",
    syn: ["model", "pattern", "archetype", "exemplar"]
  },
  {
    w: "Paucity", p: "Noun", l: "C2", tr: "Kıtlık / Azlık / Yetersiz miktar", ph: "/ˈpɔː.sə.ti/",
    d: "The presence of something only in small or insufficient quantities or amounts; scarcity.",
    ex: "The committee struggled due to a paucity of reliable statistical evidence.",
    exTr: "Komite, güvenilir istatistiki kanıt azlığı ve kıtlığı nedeniyle zorlandı.",
    syn: ["scarcity", "dearth", "shortage", "deficiency"]
  },
  {
    w: "Perfunctory", p: "Adj.", l: "C1", tr: "Baştan savma / Öylesine yapılmış / Ruhsuz", ph: "/pəˈfʌŋk.tər.i/",
    d: "Carried out with a minimum of effort or reflection.",
    ex: "He gave the inspection documents a perfunctory glance before signing.",
    exTr: "İmzalamadan önce denetim belgelerine baştan savma, öylesine bir göz attı.",
    syn: ["cursory", "superficial", "careless", "slipshod"]
  },
  {
    w: "Perspicacious", p: "Adj.", l: "C2", tr: "İnce anlayışlı / Sezgisi kuvvetli / Ferasetli", ph: "/ˌpɜː.spɪˈkeɪ.ʃəs/",
    d: "Having a ready insight into and understanding of things.",
    ex: "The perspicacious investment analyst foresaw the real estate downturn years ahead.",
    exTr: "Ferasetli ve sezgileri güçlü yatırım analisti, gayrimenkul krizini yıllar öncesinden öngördü.",
    syn: ["discerning", "shrewd", "astute", "insightful"]
  },
  {
    w: "Platitude", p: "Noun", l: "C2", tr: "Yavan söz / Klişe / Basmakalıp ifade", ph: "/ˈplæt.ɪ.tʃuːd/",
    d: "A remark or statement, especially one with a moral content, that has been used too often to be interesting or thoughtful.",
    ex: "Empty political speeches filled with platitudes no longer convince educated voters.",
    exTr: "Klişelerle dolu boş siyasi konuşmalar artık eğitimli seçmenleri ikna etmiyor.",
    syn: ["cliché", "truism", "commonplace", "banality"]
  },
  {
    w: "Proclivity", p: "Noun", l: "C1", tr: "Eğilim / Yatkınlık / Temayül", ph: "/prəˈklɪv.ə.ti/",
    d: "A tendency to choose or do something regularly; an inclination or predisposition.",
    ex: "From early childhood, she demonstrated an innate proclivity for foreign languages.",
    exTr: "Erken çocukluktan itibaren yabancı dillere karşı doğuştan gelen bir yatkınlık gösterdi.",
    syn: ["inclination", "tendency", "predisposition", "propensity"]
  },
  {
    w: "Quandary", p: "Noun", l: "C1", tr: "İkilem / Çıkmaz / Güç durum", ph: "/ˈkwɒn.dri/",
    d: "A state of perplexity or uncertainty over what to do in a difficult situation.",
    ex: "Facing two equally attractive university offers placed her in an agonizing quandary.",
    exTr: "Birbirinden cazip iki üniversite teklifiyle karşılaşmak onu tatlı bir ikilemde bıraktı.",
    syn: ["dilemma", "predicament", "plight", "perplexity"]
  },
  {
    w: "Rancor", p: "Noun", l: "C1", tr: "Kin / Husumet / Derin dargınlık", ph: "/ˈræŋ.kər/",
    d: "Bitterness or resentfulness, especially when long-standing.",
    ex: "They parted ways without lingering rancor, remaining respectful friends.",
    exTr: "Arkalarında kin ve husumet bırakmadan ayrıldılar ve birbirine saygılı dostlar olarak kaldılar.",
    syn: ["bitterness", "spite", "malice", "animosity"]
  },
  {
    w: "Recalcitrant", p: "Adj.", l: "C2", tr: "İnatçı / Söz dinlemez / Boyun eğmeyen", ph: "/rɪˈkæl.sɪ.trənt/",
    d: "Having an obstinately uncooperative attitude toward authority or discipline.",
    ex: "The recalcitrant delegates refused to sign the compromise agreement.",
    exTr: "İnatçı ve uzlaşmaz delegeler uzlaşma metnini imzalamayı reddetti.",
    syn: ["uncooperative", "defiant", "stubborn", "insubordinate"]
  },
  {
    w: "Salient", p: "Adj.", l: "C1", tr: "En belirgin / Göze çarpan / Önemli", ph: "/ˈseɪ.li.ənt/",
    d: "Most noticeable or important.",
    ex: "The executive summary neatly highlights the salient points of the annual report.",
    exTr: "Yönetici özeti, yıllık raporun en belirgin ve can alıcı noktalarını güzelce vurguluyor.",
    syn: ["prominent", "conspicuous", "important", "striking"]
  },
  {
    w: "Spurious", p: "Adj.", l: "C1", tr: "Sahte / Düzmece / Asılsız", ph: "/ˈspjʊə.ri.əs/",
    d: "Not being what it purports to be; false or fake.",
    ex: "The court rejected the defense's spurious reasoning as entirely unfounded.",
    exTr: "Mahkeme, savunmanın asılsız ve düzmece gerekçelerini tamamen temelsiz bularak reddetti.",
    syn: ["fake", "false", "counterfeit", "bogus"]
  },
  {
    w: "Substantiate", p: "Verb", l: "C1", tr: "Kanıtlamak / Delillendirmek / Somutlaştırmak", ph: "/səbˈstæn.ʃi.eɪt/",
    d: "Provide evidence to support or prove the truth of.",
    ex: "You must substantiate your bold scientific claims with empirical data.",
    exTr: "İddialı bilimsel savlarınızı ampirik verilerle delillendirip kanıtlamalısınız.",
    syn: ["prove", "validate", "verify", "corroborate"]
  },
  {
    w: "Taciturn", p: "Adj.", l: "C2", tr: "Suskun / Az konuşan / Ketum", ph: "/ˈtæs.ɪ.tɜːn/",
    d: "Reserved or uncommunicative in speech; saying little.",
    ex: "His taciturn demeanor concealed a deeply compassionate and observant nature.",
    exTr: "Suskun ve ketum tavrı, son derece şefkatli ve dikkatli bir karakteri gizliyordu.",
    syn: ["untalkative", "uncommunicative", "reticent", "quiet"]
  },
  {
    w: "Tenuous", p: "Adj.", l: "C1", tr: "Zayıf / İnce / Pamuk ipliğine bağlı", ph: "/ˈten.ju.əs/",
    d: "Very weak or slight.",
    ex: "The coalition government maintained a tenuous hold on power.",
    exTr: "Koalisyon hükümeti, iktidarı pamuk ipliğine bağlı, zayıf bir şekilde elinde tuttu.",
    syn: ["fragile", "shaky", "flimsy", "doubtful"]
  },
  {
    w: "Ubiquitous", p: "Adj.", l: "C1", tr: "Her yerde bulunan / Çok yaygın", ph: "/juːˈbɪk.wɪ.təs/",
    d: "Present, appearing, or found everywhere simultaneously.",
    ex: "Smartphones and wireless networks have become ubiquitous in modern society.",
    exTr: "Akıllı telefonlar ve kablosuz ağlar günümüz modern toplumunda her yerde bulunur hale geldi.",
    syn: ["omnipresent", "pervasive", "universal", "everywhere"]
  },
  {
    w: "Vacillate", p: "Verb", l: "C1", tr: "Tereddüt etmek / İki arada bir derede kalmak / Bocalamak", ph: "/ˈvæs.ɪ.leɪt/",
    d: "Alternate or waver between different opinions or actions; be indecisive.",
    ex: "He vacillated between accepting the overseas job offer and staying with his family.",
    exTr: "Yurt dışı iş teklifini kabul etmekle ailesinin yanında kalmak arasında bocaladı.",
    syn: ["waver", "hesitate", "oscillate", "fluctuate"]
  },
  {
    w: "Venerable", p: "Adj.", l: "C1", tr: "Saygıdeğer / Muhterem / Yılların itibarını kazanmış", ph: "/ˈven.ər.ə.bəl/",
    d: "Accorded a great deal of respect, especially because of age, wisdom, or character.",
    ex: "The venerable academic institution was founded over five centuries ago.",
    exTr: "Bu saygıdeğer ve köklü akademik kurum beş asırdan fazla bir süre önce kuruldu.",
    syn: ["respected", "revered", "hallowed", "august"]
  },
  {
    w: "Vindicate", p: "Verb", l: "C1", tr: "Haklı çıkarmak / Aklamak / Doğrulamak", ph: "/ˈvɪn.dɪ.keɪt/",
    d: "Clear someone of blame or suspicion; show or prove to be right, reasonable, or justified.",
    ex: "Subsequent historical discoveries fully vindicated her controversial thesis.",
    exTr: "Sonraki tarihi keşifler, onun tartışmalı tezini tamamen haklı çıkardı.",
    syn: ["acquit", "exonerate", "absolve", "justify"]
  },
  {
    w: "Volatile", p: "Adj.", l: "C1", tr: "Değişken / İstikrarsız / Kolay parlayan", ph: "/ˈvɒl.ə.taɪl/",
    d: "Liable to change rapidly and unpredictably, especially for the worse.",
    ex: "Global stock markets remained extremely volatile throughout the financial crisis.",
    exTr: "Küresel borsa piyasaları finansal kriz boyunca son derece değişken ve istikrarsız kaldı.",
    syn: ["unpredictable", "turbulent", "unstable", "fickle"]
  },
  {
    w: "Voracious", p: "Adj.", l: "C1", tr: "Doymak bilmez / Aşırı hevesli / Obur", ph: "/vəˈreɪ.ʃəs/",
    d: "Wanting or devouring great quantities of food; having a very eager approach to an activity.",
    ex: "She was a voracious reader who devoured several philosophical books each week.",
    exTr: "Her hafta birkaç felsefe kitabını bitiren, okumaya doymak bilmez bir okurdu.",
    syn: ["insatiable", "avid", "unquenchable", "eager"]
  },
  {
    w: "Zealous", p: "Adj.", l: "C1", tr: "Şevkli / Gayretli / Aşırı hevesli", ph: "/ˈzel.əs/",
    d: "Having or showing great energy and enthusiasm in pursuit of a cause or an objective.",
    ex: "The zealous young environmentalists organized a massive beach cleanup campaign.",
    exTr: "Şevkli genç çevreciler devasa bir sahil temizleme kampanyası düzenlediler.",
    syn: ["fervent", "ardent", "passionate", "eager"]
  }
];

advancedVocab.forEach(item => {
  const cleanWord = item.w.trim();
  const id = `w-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  wordsMap.set(id, {
    id,
    word: cleanWord,
    phonetic: item.ph,
    partOfSpeech: item.p,
    level: item.l,
    translation: item.tr,
    definition: item.d,
    example: item.ex,
    exampleTranslation: item.exTr,
    synonyms: item.syn || [],
    mastery: 0,
    lists: ['ielts', 'toefl'],
  });
});

// 4. Clean up lists tags and tag with IELTS / TOEFL and levels
const allWords = Array.from(wordsMap.values());

allWords.forEach(w => {
  const lvl = w.level || 'A1';
  const listSet = new Set(w.lists || []);

  // Remove old deprecated lists
  listSet.delete('business-pro');
  listSet.delete('travel-essentials');

  // Tag with level id
  listSet.add(lvl.toLowerCase());

  // Academic / exam tags for B2, C1, C2
  if (lvl === 'B2' || lvl === 'C1' || lvl === 'C2') {
    listSet.add('ielts');
    listSet.add('toefl');
  }

  w.lists = Array.from(listSet);
});

allWords.sort((a, b) => a.word.localeCompare(b.word));

// Write to JSON
fs.writeFileSync(jsonPath, JSON.stringify(allWords, null, 2), 'utf-8');

// Level Summary
const levelCounts = {};
allWords.forEach(w => {
  levelCounts[w.level] = (levelCounts[w.level] || 0) + 1;
});

console.log("==========================================");
console.log("🎉 SUCCESS: Master Vocabulary compiled!");
console.log("Total unique words:", allWords.length);
console.log("Levels:", levelCounts);
console.log("A1 words:", allWords.filter(w => w.level === 'A1').length);
console.log("A2 words:", allWords.filter(w => w.level === 'A2').length);
console.log("B1 words:", allWords.filter(w => w.level === 'B1').length);
console.log("B2 words:", allWords.filter(w => w.level === 'B2').length);
console.log("C1 words:", allWords.filter(w => w.level === 'C1').length);
console.log("C2 words:", allWords.filter(w => w.level === 'C2').length);
console.log("IELTS list words:", allWords.filter(w => w.lists?.includes('ielts')).length);
console.log("TOEFL list words:", allWords.filter(w => w.lists?.includes('toefl')).length);
console.log("==========================================");



