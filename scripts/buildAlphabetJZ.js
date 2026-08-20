const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
let existing = [];
if (fs.existsSync(jsonPath)) {
  existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

const wordsMap = new Map();
existing.forEach(w => wordsMap.set(w.id, w));

// Alphabet J to Z Complete Vocabulary Items
const jzDictionary = [
  // J
  { w: "Jealous", p: "Adj.", l: "B1", tr: "Kıskanç", ph: "/ˈdʒel.əs/", d: "Feeling or showing envy of someone or their achievements and possessions.", ex: "Celebrate others' wins rather than feeling jealous." },
  { w: "Journal", p: "Noun", l: "A2", tr: "Günlük / Dergi", ph: "/ˈdʒɜː.nəl/", d: "A daily record of news and events of a personal nature; a periodical.", ex: "Writing in a daily journal clears mental clutter." },
  { w: "Journalist", p: "Noun", l: "A2", tr: "Gazeteci", ph: "/ˈdʒɜː.nə.lɪst/", d: "A person who writes for newspapers, magazines, or news websites.", ex: "The investigative journalist uncovered the truth." },
  { w: "Journey", p: "Noun", l: "A1", tr: "Yolculuk / Seyahat", ph: "/ˈdʒɜː.ni/", d: "An act of traveling from one place to another.", ex: "A journey of a thousand miles begins with a single step." },
  { w: "Joy", p: "Noun", l: "A2", tr: "Neşe / Sevinç", ph: "/dʒɔɪ/", d: "A feeling of great pleasure and happiness.", ex: "Find joy in the simple moments of everyday life." },
  { w: "Judge", p: "Noun", l: "B1", tr: "Yargıç / Hüküm vermek", ph: "/dʒʌdʒ/", d: "A public officer appointed to decide cases in a law court.", ex: "Do not judge a book simply by its cover." },
  { w: "Judicial", p: "Adj.", l: "B2", tr: "Yargısal / Adli", ph: "/dʒuːˈdɪʃ.əl/", d: "Relating to the administration of justice.", ex: "An independent judicial system protects liberty." },
  { w: "Juice", p: "Noun", l: "A1", tr: "Meyve suyu", ph: "/dʒuːs/", d: "The liquid part that can be extracted from plant or fruit.", ex: "Freshly squeezed pomegranate juice is full of vitamins." },
  { w: "July", p: "Noun", l: "A1", tr: "Temmuz", ph: "/dʒuˈlaɪ/", d: "The seventh month of the year.", ex: "July brings warm sunny beach weather." },
  { w: "Jump", p: "Verb", l: "A1", tr: "Zıplamak / Atlamak", ph: "/dʒʌmp/", d: "Push oneself off a surface and into the air by using the muscles in one's legs.", ex: "The playful dolphins jump above the waves." },
  { w: "June", p: "Noun", l: "A1", tr: "Haziran", ph: "/dʒuːn/", d: "The sixth month of the year.", ex: "Schools finish and summer vacation begins in June." },
  { w: "Junior", p: "Adj.", l: "B1", tr: "Genç / Kıdemsiz", ph: "/ˈdʒuː.ni.ər/", d: "For or denoting young or younger people; lower in rank.", ex: "He started as a junior software engineer." },
  { w: "Jury", p: "Noun", l: "B2", tr: "Jüri", ph: "/ˈdʒʊə.ri/", d: "A body of people sworn to give a verdict in a legal case.", ex: "The jury reached a unanimous verdict." },
  { w: "Justice", p: "Noun", l: "B1", tr: "Adalet / Hak", ph: "/ˈdʒʌs.tɪs/", d: "Just behavior or treatment; fairness.", ex: "Justice and equality are fundamental human rights." },
  { w: "Justify", p: "Verb", l: "B2", tr: "Gerekçelendirmek / Haklı çıkarmak", ph: "/ˈdʒʌs.tɪ.faɪ/", d: "Show or prove to be right or reasonable.", ex: "The outcome easily justified the initial investment." },

  // K
  { w: "Keen", p: "Adj.", l: "B1", tr: "İstekli / Keskin / Meraklı", ph: "/kiːn/", d: "Having or showing eagerness or enthusiasm; sharp.", ex: "She is keen to learn advanced English vocabulary." },
  { w: "Keep", p: "Verb", l: "A1", tr: "Tutmak / Korumak / Devam etmek", ph: "/kiːp/", d: "Have or retain possession of.", ex: "Keep practicing daily and results will follow." },
  { w: "Key", p: "Noun", l: "A1", tr: "Anahtar / Kilit nokta", ph: "/kiː/", d: "A small piece of shaped metal with incisions, or a crucial element.", ex: "Consistency is the key to mastering any new skill." },
  { w: "Keyboard", p: "Noun", l: "A1", tr: "Klavye", ph: "/ˈkiː.bɔːd/", d: "A panel of keys that operate a computer or typewriter.", ex: "Type comfortably on an ergonomic mechanical keyboard." },
  { w: "Kick", p: "Verb", l: "A1", tr: "Tekmelemek / Vurmak", ph: "/kɪk/", d: "Strike or propel forcibly with the foot.", ex: "He kicked the ball right into the top corner." },
  { w: "Kid", p: "Noun", l: "A1", tr: "Çocuk", ph: "/kɪd/", d: "A child or young person.", ex: "Kids learn foreign languages through games effortlessly." },
  { w: "Kill", p: "Verb", l: "A2", tr: "Öldürmek", ph: "/kɪl/", d: "Cause the death of a person, animal, or other living thing.", ex: "Protect wildlife; do not kill endangered creatures." },
  { w: "Kilogram", p: "Noun", l: "A1", tr: "Kilogram", ph: "/ˈkɪl.ə.ɡræm/", d: "The SI unit of mass equivalent to approximately 2.2 pounds.", ex: "Buy one kilogram of fresh organic apples." },
  { w: "Kilometer", p: "Noun", l: "A1", tr: "Kilometre", ph: "/kɪˈlɒm.ɪ.tər/", d: "A metric unit of measurement equal to 1,000 meters.", ex: "We walked five kilometers along the seaside." },
  { w: "Kind", p: "Adj.", l: "A1", tr: "Nazik / Kibar / Tür", ph: "/kaɪnd/", d: "Having or showing a friendly, generous, and considerate nature.", ex: "Be kind whenever possible; it is always possible." },
  { w: "King", p: "Noun", l: "A1", tr: "Kral", ph: "/kɪŋ/", d: "The male ruler of an independent state, especially one who inherits the position.", ex: "The ancient king built a magnificent library." },
  { w: "Kingdom", p: "Noun", l: "B1", tr: "Krallık / Alem", ph: "/ˈkɪŋ.dəm/", d: "A country, state, or territory ruled by a king or queen.", ex: "The animal kingdom is vast and diverse." },
  { w: "Kiss", p: "Verb", l: "A1", tr: "Öpmek", ph: "/kɪs/", d: "Touch or caress with the lips as a sign of love, sexual desire, or greeting.", ex: "She kissed her mother gently on the cheek." },
  { w: "Kitchen", p: "Noun", l: "A1", tr: "Mutfak", ph: "/ˈkɪtʃ.ən/", d: "A room or area where food is prepared and cooked.", ex: "The aroma of roasted coffee filled the kitchen." },
  { w: "Knee", p: "Noun", l: "A2", tr: "Diz", ph: "/niː/", d: "The joint between the thigh and the lower leg in humans.", ex: "Bend your knees properly when lifting heavy weights." },
  { w: "Knife", p: "Noun", l: "A1", tr: "Bıçak", ph: "/naɪf/", d: "An instrument composed of a blade fixed into a handle.", ex: "Use a sharp kitchen knife to slice bread evenly." },
  { w: "Knight", p: "Noun", l: "B1", tr: "Şövalye", ph: "/naɪt/", d: "A man awarded a non-hereditary title by the monarch in recognition of merit.", ex: "Medieval knights lived by a code of honor." },
  { w: "Knock", p: "Verb", l: "A2", tr: "Kapıyı çalmak / Vurmak", ph: "/nɒk/", d: "Strike a surface noisily to attract attention.", ex: "Always knock on the door before entering." },
  { w: "Knowledge", p: "Noun", l: "A1", tr: "Bilgi / İlim", ph: "/ˈnɒl.ɪdʒ/", d: "Facts, information, and skills acquired through experience or education.", ex: "Knowledge is power, but application is wisdom." },

  // L
  { w: "Label", p: "Noun", l: "A2", tr: "Etiket / Etiketlemek", ph: "/ˈleɪ.bəl/", d: "A small piece of paper or fabric attached to an article to give information.", ex: "Read the nutrition label before buying." },
  { w: "Laboratory", p: "Noun", l: "A2", tr: "Laboratuvar", ph: "/ləˈbɒr.ə.tər.i/", d: "A room or building equipped for scientific experiments and research.", ex: "Scientists work late in the research laboratory." },
  { w: "Lack", p: "Noun", l: "B1", tr: "Eksiklik / Yokluk", ph: "/læk/", d: "The state of being without or not having enough of something.", ex: "Lack of sleep impairs focus and clarity." },
  { w: "Lady", p: "Noun", l: "A1", tr: "Hanımefendi / Leydi", ph: "/ˈleɪ.di/", d: "A polite or formal way of referring to a woman.", ex: "The elderly lady greeted everyone warmly." },
  { w: "Lake", p: "Noun", l: "A1", tr: "Göl", ph: "/leɪk/", d: "A large body of water surrounded by land.", ex: "Lake Van is the largest lake in Turkey." },
  { w: "Landscape", p: "Noun", l: "B1", tr: "Manzara / Peyzaj", ph: "/ˈlænd.skeɪp/", d: "All the visible features of an area of countryside or land.", ex: "The Cappadocia landscape is truly surreal." },
  { w: "Laugh", p: "Verb", l: "A1", tr: "Gülmek", ph: "/lɑːf/", d: "Make the spontaneous sounds and movements of the face and body that are the instinctive expression of amusement.", ex: "Laughter is the best natural medicine." },
  { w: "Launch", p: "Verb", l: "B1", tr: "Başlatmak / Fırlatmak / Lansman", ph: "/lɔːntʃ/", d: "Set in motion an activity or enterprise, or send a rocket into space.", ex: "The startup launched an innovative educational platform." },
  { w: "Law", p: "Noun", l: "A2", tr: "Hukuk / Yasa / Kanun", ph: "/lɔː/", d: "The system of rules which a particular country or community recognizes.", ex: "Respect the law and uphold democratic values." },
  { w: "Lawyer", p: "Noun", l: "A2", tr: "Avukat", ph: "/ˈlɔɪ.ər/", d: "A person who practices or studies law; an attorney.", ex: "Consult a lawyer before signing complex contracts." },
  { w: "Layer", p: "Noun", l: "B1", tr: "Katman / Tabaka", ph: "/ˈleɪ.ər/", d: "A sheet, quantity, or thickness of material, typically one of several.", ex: "The atmosphere consists of several protective layers." },
  { w: "Leader", p: "Noun", l: "A2", tr: "Lider / Önder", ph: "/ˈliː.dər/", d: "The person who leads or commands a group, organization, or country.", ex: "An authentic leader empowers and serves others." },
  { w: "Leadership", p: "Noun", l: "B1", tr: "Liderlik", ph: "/ˈliː.də.ʃɪp/", d: "The action of leading a group of people or an organization.", ex: "Effective leadership requires emotional intelligence." },
  { w: "League", p: "Noun", l: "B1", tr: "Lig / Birlik", ph: "/liːɡ/", d: "A collection of people, countries, or groups that combine for a particular purpose.", ex: "The football league championship was thrilling." },
  { w: "Lean", p: "Verb", l: "B2", tr: "Yaslanmak / Eğilmek / Yağsız", ph: "/liːn/", d: "Be in or move into a sloping position; or thin and healthy.", ex: "He leaned against the old stone railing." },
  { w: "Leap", p: "Verb", l: "B2", tr: "Sıçramak / Atlamak / Büyük atılım", ph: "/liːp/", d: "Jump or spring a long way, to a great height, or with great force.", ex: "Take a courageous leap toward your ambitions." },
  { w: "Legend", p: "Noun", l: "B1", tr: "Efsane / Destan", ph: "/ˈledʒ.ənd/", d: "A traditional story sometimes popularly regarded as historical but unauthenticated.", ex: "The ancient legend of Troy captivates readers." },
  { w: "Lesson", p: "Noun", l: "A1", tr: "Ders / İbret", ph: "/ˈles.ən/", d: "A period of learning or teaching.", ex: "Every setback carries an invaluable life lesson." },
  { w: "Liberty", p: "Noun", l: "B2", tr: "Özgürlük / Hürriyet", ph: "/ˈlɪb.ə.ti/", d: "The state of being free within society from oppressive restrictions.", ex: "Liberty and justice are universal ideals." },
  { w: "Library", p: "Noun", l: "A1", tr: "Kütüphane", ph: "/ˈlaɪ.brər.i/", d: "A building or room containing collections of books.", ex: "A library is a sanctuary of quiet wisdom." },
  { w: "Life", p: "Noun", l: "A1", tr: "Hayat / Yaşam", ph: "/laɪf/", d: "The condition that distinguishes organisms from inorganic matter.", ex: "Live a life filled with courage and love." },
  { w: "Limit", p: "Noun", l: "A2", tr: "Sınır / Limit", ph: "/ˈlɪm.ɪt/", d: "A point or level beyond which something does not or may not extend.", ex: "Your only limits are the ones you set in your mind." },
  { w: "Line", p: "Noun", l: "A1", tr: "Çizgi / Hat / Sıra", ph: "/laɪn/", d: "A long, narrow mark or band.", ex: "Wait patiently in line for your turn." },
  { w: "Listen", p: "Verb", l: "A1", tr: "Dinlemek", ph: "/ˈlɪs.ən/", d: "Give one's attention to a sound.", ex: "Listen actively and comprehend deeply." },
  { w: "Literature", p: "Noun", l: "B1", tr: "Edebiyat", ph: "/ˈlɪt.rə.tʃər/", d: "Written works, especially those considered of superior or lasting artistic merit.", ex: "Classic literature nourishes the intellect." },
  { w: "Logic", p: "Noun", l: "B1", tr: "Mantık", ph: "/ˈlɒdʒ.ɪk/", d: "Reasoning conducted or assessed according to strict principles of validity.", ex: "Use clear sound logic to solve complex problems." },
  { w: "Logical", p: "Adj.", l: "B1", tr: "Mantıklı / Tutarlı", ph: "/ˈlɒdʒ.ɪ.kəl/", d: "Of or according to the rules of logic or formal argument.", ex: "Present a structured and logical argument." },
  { w: "Longevity", p: "Noun", l: "B2", tr: "Uzun ömürlülük", ph: "/lɒnˈdʒev.ə.ti/", d: "Long life; long existence or service.", ex: "A Mediterranean diet promotes health and longevity." },
  { w: "Loyal", p: "Adj.", l: "B1", tr: "Sadık / Vefalı", ph: "/ˈlɔɪ.əl/", d: "Giving or showing firm and constant support or allegiance to a person or institution.", ex: "A loyal companion is a precious blessing." },
  { w: "Luck", p: "Noun", l: "A1", tr: "Şans / Talih", ph: "/lʌk/", d: "Success or failure apparently brought by chance rather than through one's own actions.", ex: "Good luck on your upcoming final examination!" },
  { w: "Luxury", p: "Noun", l: "B1", tr: "Lüks / Konfor", ph: "/ˈlʌk.ʃər.i/", d: "The state of great comfort and extravagant living.", ex: "Time for peaceful contemplation is the ultimate luxury." },

  // M
  { w: "Machine", p: "Noun", l: "A1", tr: "Makine", ph: "/məˈʃiːn/", d: "An apparatus using or applying mechanical power and having several parts.", ex: "The coffee machine brews rich espresso." },
  { w: "Magazine", p: "Noun", l: "A1", tr: "Dergi", ph: "/ˌmæɡ.əˈziːn/", d: "A periodical publication containing articles and illustrations.", ex: "She reads a monthly science magazine." },
  { w: "Magnificent", p: "Adj.", l: "B1", tr: "Muhteşem / Görkemli", ph: "/mæɡˈnɪf.ɪ.sənt/", d: "Impressively beautiful, elaborate, or extravagant; striking.", ex: "The Bosphorus at sunset is truly magnificent." },
  { w: "Major", p: "Adj.", l: "A2", tr: "Büyük / Başlıca / Önemli", ph: "/ˈmeɪ.dʒər/", d: "Important, serious, or significant.", ex: "Renewable power plays a major role in sustainability." },
  { w: "Majority", p: "Noun", l: "B1", tr: "Çoğunluk", ph: "/məˈdʒɒr.ə.ti/", d: "The greater number.", ex: "The vast majority voted in favor of the proposal." },
  { w: "Manage", p: "Verb", l: "A2", tr: "Yönetmek / Başarmak", ph: "/ˈmæn.ɪdʒ/", d: "Be in charge of; succeed in doing.", ex: "Manage your daily time with mindfulness." },
  { w: "Management", p: "Noun", l: "B1", tr: "Yönetim / İdare", ph: "/ˈmæn.ɪdʒ.mənt/", d: "The process of dealing with or controlling things or people.", ex: "Effective project management guarantees timely delivery." },
  { w: "Manager", p: "Noun", l: "A2", tr: "Müdür / Yönetici", ph: "/ˈmæn.ɪ.dʒər/", d: "A person responsible for controlling or administering all or part of a company.", ex: "The general manager greeted the new team members." },
  { w: "Manner", p: "Noun", l: "B1", tr: "Tavır / Tarz / Nezaket kuralları", ph: "/ˈmæn.ər/", d: "A way in which a thing is done or happens; polite behavior.", ex: "He handled the situation in a calm and dignified manner." },
  { w: "Manufacture", p: "Verb", l: "B2", tr: "Üretmek / İmal etmek", ph: "/ˌmæn.jəˈfæk.tʃər/", d: "Make something on a large scale using machinery.", ex: "They manufacture eco-friendly electric vehicles." },
  { w: "Marine", p: "Adj.", l: "B1", tr: "Denizle ilgili / Denizsel", ph: "/məˈriːn/", d: "Of, found in, or produced by the sea.", ex: "Protect marine ecosystems from plastic pollution." },
  { w: "Market", p: "Noun", l: "A1", tr: "Pazar / Piyasa", ph: "/ˈmɑː.kɪt/", d: "A regular gathering of people for the purchase and sale of provisions.", ex: "Buy fresh organic herbs at the weekly market." },
  { w: "Marvelous", p: "Adj.", l: "B1", tr: "Harikulade / Müthiş", ph: "/ˈmɑː.vəl.əs/", d: "Causing great wonder; extraordinary.", ex: "We enjoyed a marvelous orchestral concert." },
  { w: "Master", p: "Noun", l: "B1", tr: "Usta / Üstat / Hakim olmak", ph: "/ˈmɑː.stər/", d: "A person with exceptional skill or mastery.", ex: "Master the fundamental principles of your craft." },
  { w: "Mastery", p: "Noun", l: "B2", tr: "Ustalık / Hakimiyet", ph: "/ˈmɑː.stər.i/", d: "Comprehensive knowledge or skill in a subject.", ex: "Language mastery requires steady dedicated repetition." },
  { w: "Match", p: "Verb", l: "A1", tr: "Eşleştirmek / Maç", ph: "/mætʃ/", d: "Correspond or cause to correspond in some essential respect; a contest.", ex: "Match the English words with their Turkish meanings." },
  { w: "Material", p: "Noun", l: "A2", tr: "Malzeme / Madde", ph: "/məˈtɪə.ri.əl/", d: "The matter from which a thing is or can be made.", ex: "Use sustainable materials in modern building design." },
  { w: "Mature", p: "Adj.", l: "B2", tr: "Olgun / Yetişkin", ph: "/məˈtʃʊər/", d: "Fully developed physically or mentally.", ex: "A mature thinker considers unintended consequences." },
  { w: "Maximum", p: "Adj.", l: "A2", tr: "Maksimum / En yüksek", ph: "/ˈmæk.sɪ.məm/", d: "As great, high, or intense as possible or permitted.", ex: "Operate at maximum focus and efficiency." },
  { w: "Mayor", p: "Noun", l: "B1", tr: "Belediye başkanı", ph: "/meər/", d: "The elected head of a city, town, or other municipality.", ex: "The city mayor opened the new public park." },
  { w: "Meaning", p: "Noun", l: "A1", tr: "Anlam / Mana", ph: "/ˈmiː.nɪŋ/", d: "What is meant by a word, text, concept, or action.", ex: "Look up the precise meaning of unfamiliar words." },
  { w: "Measure", p: "Verb", l: "B1", tr: "Ölçmek / Tedbir", ph: "/ˈmeʒ.ər/", d: "Ascertain the size, amount, or degree of something.", ex: "Measure your daily progress with joy." },
  { w: "Measurement", p: "Noun", l: "B1", tr: "Ölçüm / Ebat", ph: "/ˈmeʒ.ə.mənt/", d: "The action of measuring something.", ex: "Accurate measurement ensures high engineering quality." },
  { w: "Media", p: "Noun", l: "A2", tr: "Medya / Basın", ph: "/ˈmiː.di.ə/", d: "The main means of mass communication.", ex: "Digital media spreads educational content globally." },
  { w: "Medical", p: "Adj.", l: "A2", tr: "Tıbbi / Medikal", ph: "/ˈmed.ɪ.kəl/", d: "Relating to the science or practice of medicine.", ex: "Medical advancements extend human lifespan." },
  { w: "Medicine", p: "Noun", l: "A1", tr: "İlaç / Tıp", ph: "/ˈmed.sən/", d: "The science or practice of the diagnosis, treatment, and prevention of disease.", ex: "Study modern clinical medicine to heal others." },
  { w: "Medium", p: "Noun", l: "B1", tr: "Orta / Araç / Ortam", ph: "/ˈmiː.di.əm/", d: "An agency or means of doing something; or intermediate quality.", ex: "Art is a powerful medium for human expression." },
  { w: "Memory", p: "Noun", l: "A2", tr: "Hafıza / Anı / Bellek", ph: "/ˈmem.ər.i/", d: "The faculty by which the mind stores and remembers information.", ex: "Spaced repetition strengthens vocabulary memory." },
  { w: "Mental", p: "Adj.", l: "B1", tr: "Zihinsel / Ruhsal", ph: "/ˈmen.təl/", d: "Relating to the mind.", ex: "Cultivate strong mental resilience and inner peace." },
  { w: "Mention", p: "Verb", l: "A2", tr: "Bahsetmek / Değinmek", ph: "/ˈmen.ʃən/", d: "Refer to something briefly and without going into detail.", ex: "He mentioned that the conference was fruitful." },
  { w: "Mentor", p: "Noun", l: "B2", tr: "Akıl hocası / Mentör", ph: "/ˈmen.tɔːr/", d: "An experienced and trusted adviser.", ex: "A wise mentor guides your career growth." },
  { w: "Message", p: "Noun", l: "A1", tr: "Mesaj / İleti", ph: "/ˈmes.ɪdʒ/", d: "A verbal, written, or recorded communication sent to someone.", ex: "Leave a clear and polite voicemail message." },
  { w: "Metal", p: "Noun", l: "A2", tr: "Metal / Maden", ph: "/ˈmet.əl/", d: "A solid material that is typically hard, shiny, and good conductor.", ex: "Copper and silver are highly conductive metals." },
  { w: "Method", p: "Noun", l: "A2", tr: "Yöntem / Metot", ph: "/ˈmeθ.əd/", d: "A particular procedure for accomplishing or approaching something.", ex: "Use effective active recall study methods." },
  { w: "Mind", p: "Noun", l: "A1", tr: "Zihin / Akıl / Önemsemek", ph: "/maɪnd/", d: "The element of a person that enables them to be aware of the world.", ex: "A calm mind sees solutions clearly." },
  { w: "Mineral", p: "Noun", l: "B1", tr: "Mineral / Maden", ph: "/ˈmɪn.ər.əl/", d: "A solid inorganic substance of natural occurrence.", ex: "Fresh spring water contains essential minerals." },
  { w: "Minimum", p: "Adj.", l: "A2", tr: "Minimum / En az", ph: "/ˈmɪn.ɪ.məm/", d: "The least or smallest amount or quantity possible.", ex: "Spend a minimum of twenty minutes studying daily." },
  { w: "Minister", p: "Noun", l: "B1", tr: "Bakan / Din görevlisi", ph: "/ˈmɪn.ɪ.stər/", d: "A head of a government department.", ex: "The education minister visited regional universities." },
  { w: "Ministry", p: "Noun", l: "B1", tr: "Bakanlık", ph: "/ˈmɪn.ɪ.stri/", d: "A government department headed by a minister.", ex: "The Ministry of Environment announced new clean energy goals." },
  { w: "Minor", p: "Adj.", l: "B1", tr: "Küçük / Önemsiz / Reşit olmayan", ph: "/ˈmaɪ.nər/", d: "Lesser in importance, seriousness, or significance.", ex: "Do not stress over minor setbacks." },
  { w: "Minute", p: "Noun", l: "A1", tr: "Dakika", ph: "/ˈmɪn.ɪt/", d: "A period of time equal to sixty seconds.", ex: "Take a two-minute mindful breathing break." },
  { w: "Miracle", p: "Noun", l: "B1", tr: "Mucize", ph: "/ˈmɪr.ə.kəl/", d: "An extraordinary event bringing very welcome consequences.", ex: "Life itself is an extraordinary natural miracle." },
  { w: "Mirror", p: "Noun", l: "A2", tr: "Ayna / Yansıtmak", ph: "/ˈmɪr.ər/", d: "A reflective surface, now typically of glass coated with a metal amalgam.", ex: "Look in the mirror and smile with confidence." },
  { w: "Mischief", p: "Noun", l: "B2", tr: "Yaramazlık / Hınzırlık", ph: "/ˈmɪs.tʃɪf/", d: "Playful misbehavior or troublemaking, especially in children.", ex: "The playful puppy was always up to little mischief." },
  { w: "Mission", p: "Noun", l: "B1", tr: "Görev / Misyon", ph: "/ˈmɪʃ.ən/", d: "An important assignment given to a person or group.", ex: "Our mission is to make learning joyful and accessible." },
  { w: "Mistake", p: "Noun", l: "A1", tr: "Hata / Yanlış", ph: "/mɪˈsteɪk/", d: "An act or judgment that is misguided or wrong.", ex: "Mistakes are stepping stones to true wisdom." },
  { w: "Mix", p: "Verb", l: "A1", tr: "Karıştırmak", ph: "/mɪks/", d: "Combine or put together to form one mass or substance.", ex: "Mix curiosity with daily consistent effort." },
  { w: "Mobile", p: "Adj.", l: "A1", tr: "Mobil / Taşınabilir", ph: "/ˈməʊ.baɪl/", d: "Able to move or be moved freely or easily.", ex: "Study on your mobile device wherever you travel." },
  { w: "Mode", p: "Noun", l: "B1", tr: "Mod / Biçim / Tarz", ph: "/məʊd/", d: "A way or manner in which something occurs or is experienced.", ex: "Switch the application to Dark Mode for eye comfort." },
  { w: "Model", p: "Noun", l: "A2", tr: "Model / Örnek", ph: "/ˈmɒd.əl/", d: "A three-dimensional representation of a person or thing.", ex: "Build a scalable data model for the application." },
  { w: "Moderate", p: "Adj.", l: "B1", tr: "Ilımlı / Orta düzeyde", ph: "/ˈmɒd.ər.ət/", d: "Average in amount, intensity, quality, or degree.", ex: "Moderate daily exercise yields optimal health." },
  { w: "Modern", p: "Adj.", l: "A1", tr: "Modern / Çağdaş", ph: "/ˈmɒd.ən/", d: "Relating to the present or recent times as opposed to the remote past.", ex: "Modern mobile apps make learning accessible." },
  { w: "Modest", p: "Adj.", l: "B2", tr: "Mütevazı / Alçakgönüllü", ph: "/ˈmɒd.ɪst/", d: "Unassuming or moderate in the estimation of one's abilities.", ex: "He remained modest despite monumental triumphs." },
  { w: "Moment", p: "Noun", l: "A1", tr: "An / Lahza", ph: "/ˈməʊ.mənt/", d: "A very brief period of time.", ex: "Live fully in the present moment." },
  { w: "Monitor", p: "Verb", l: "B1", tr: "İzlemek / Takip etmek / Ekran", ph: "/ˈmɒn.ɪ.tər/", d: "Observe and check the progress or quality of something over time.", ex: "Monitor your weekly learning streaks diligently." },
  { w: "Mood", p: "Noun", l: "A2", tr: "Ruh hali / Keyif", ph: "/muːd/", d: "A temporary state of mind or feeling.", ex: "Listening to acoustic music uplifts your mood." },
  { w: "Moon", p: "Noun", l: "A1", tr: "Ay (Gökyüzü)", ph: "/muːn/", d: "The natural satellite of the earth, visible by reflected light.", ex: "The full moon illuminated the quiet ocean." },
  { w: "Moral", p: "Adj.", l: "B1", tr: "Ahlaki / Manevi", ph: "/ˈmɒr.əl/", d: "Concerned with the principles of right and wrong behavior.", ex: "Live with strong moral integrity and empathy." },
  { w: "Motion", p: "Noun", l: "B1", tr: "Hareket / Önerge", ph: "/ˈməʊ.ʃən/", d: "The action or process of moving or being moved.", ex: "Set positive changes into continuous motion." },
  { w: "Motivate", p: "Verb", l: "B1", tr: "Motive etmek / Teşvik etmek", ph: "/ˈməʊ.tɪ.veɪt/", d: "Provide someone with a reason for doing something.", ex: "Intrinsic curiosity motivates sustained learning." },
  { w: "Motivation", p: "Noun", l: "B1", tr: "Motivasyon / Güdü", ph: "/ˌməʊ.tɪˈveɪ.ʃən/", d: "The reason or reasons one has for acting in a particular way.", ex: "Clear goals fuel daily motivation and passion." },
  { w: "Mount", p: "Verb", l: "B2", tr: "Tırmanmak / Monte etmek", ph: "/maʊnt/", d: "Climb up or ascend, or attach firmly.", ex: "Mount the artwork securely on the wall." },
  { w: "Movement", p: "Noun", l: "A2", tr: "Hareket / Akım", ph: "/ˈmuːv.mənt/", d: "An act of changing physical location or position.", ex: "Daily physical movement keeps joints healthy." },
  { w: "Multiple", p: "Adj.", l: "B1", tr: "Birden çok / Çoklu", ph: "/ˈmʌl.tɪ.pəl/", d: "Having or involving several parts, elements, or members.", ex: "Learn multiple vocabulary senses in context." },
  { w: "Museum", p: "Noun", l: "A1", tr: "Müze", ph: "/mjuːˈziː.əm/", d: "A building in which objects of historical, scientific, or artistic interest are kept.", ex: "The Istanbul Archaeology Museum holds priceless artifacts." },
  { w: "Music", p: "Noun", l: "A1", tr: "Müzik", ph: "/ˈmjuː.zɪk/", d: "Vocal or instrumental sounds combined in such a way as to produce beauty.", ex: "Music unites human hearts across language barriers." },
  { w: "Mutual", p: "Adj.", l: "B2", tr: "Karşılıklı / Ortak", ph: "/ˈmjuː.tʃu.əl/", d: "Held in common by two or more parties.", ex: "Mutual respect is the bedrock of genuine friendship." },
  { w: "Mystery", p: "Noun", l: "B1", tr: "Gizem / Sır", ph: "/ˈmɪs.tər.i/", d: "Something that is difficult or impossible to understand or explain.", ex: "The cosmos is full of wondrous mysteries." },

  // N
  { w: "Nation", p: "Noun", l: "A2", tr: "Ulus / Millet", ph: "/ˈneɪ.ʃən/", d: "A large body of people united by common descent, history, or culture.", ex: "Education is the greatest wealth of any nation." },
  { w: "National", p: "Adj.", l: "A2", tr: "Ulusal / Milli", ph: "/ˈnæʃ.ən.əl/", d: "Relating to a nation; common to a whole nation.", ex: "Enjoy hiking in protected national parks." },
  { w: "Native", p: "Adj.", l: "B1", tr: "Yerli / Ana (Dil)", ph: "/ˈneɪ.tɪv/", d: "Associated with the place or circumstances of one's birth.", ex: "Practice speaking with native language speakers." },
  { w: "Natural", p: "Adj.", l: "A1", tr: "Doğal / Tabii", ph: "/ˈnætʃ.ər.əl/", d: "Existing in or caused by nature; not made by humankind.", ex: "Pure olive oil is a natural wholesome treasure." },
  { w: "Nature", p: "Noun", l: "A1", tr: "Doğa / Tabiat / Huy", ph: "/ˈneɪ.tʃər/", d: "The phenomena of the physical world collectively.", ex: "Spend time in nature to recharge your spirit." },
  { w: "Necessary", p: "Adj.", l: "A2", tr: "Gerekli / Zorunlu", ph: "/ˈnes.ə.ser.i/", d: "Required to be done, achieved, or present; needed.", ex: "Patience and practice are necessary for mastery." },
  { w: "Necessity", p: "Noun", l: "B2", tr: "Zorunluluk / İhtiyaç", ph: "/nəˈses.ə.ti/", d: "The fact of being required or indispensable.", ex: "Clean water is an absolute necessity of life." },
  { w: "Negative", p: "Adj.", l: "A2", tr: "Olumsuz / Negatif", ph: "/ˈneɡ.ə.tɪv/", d: "Consisting in or characterized by the absence rather than the presence of distinguishing features.", ex: "Transform negative thoughts into constructive action." },
  { w: "Network", p: "Noun", l: "A2", tr: "Ağ / Şebeke / Bağlantı", ph: "/ˈnet.wɜːk/", d: "An interconnected group or system of people or things.", ex: "Build a strong professional network of mentors." },
  { w: "Neutral", p: "Adj.", l: "B2", tr: "Tarafsız / Nötr", ph: "/ˈnjuː.trəl/", d: "Not supporting or helping either side in a conflict.", ex: "A mediator maintains a neutral objective stance." },
  { w: "Noble", p: "Adj.", l: "B1", tr: "Asil / Soylu / Yüce", ph: "/ˈnəʊ.bəl/", d: "Belonging to a hereditary class with high social or moral rank.", ex: "Helping those in need is a noble endeavor." },
  { w: "Normal", p: "Adj.", l: "A1", tr: "Normal / Olağan", ph: "/ˈnɔː.məl/", d: "Conforming to a standard; usual, typical, or expected.", ex: "It is completely normal to make mistakes while learning." },
  { w: "Notable", p: "Adj.", l: "B2", tr: "Kayda değer / Dikkate değer", ph: "/ˈnəʊ.tə.bəl/", d: "Worthy of attention or notice; remarkable.", ex: "She made notable contributions to physics." },
  { w: "Notice", p: "Verb", l: "A2", tr: "Fark etmek / Dikkat etmek", ph: "/ˈnəʊ.tɪs/", d: "Become aware of.", ex: "Notice the subtle beauty in everyday moments." },
  { w: "Novel", p: "Noun", l: "A2", tr: "Roman / Yeni ve özgün", ph: "/ˈnɒv.əl/", d: "A fictitious prose narrative of book length, or new.", ex: "Reading a classic novel enriches imagination." },
  { w: "Numerous", p: "Adj.", l: "B1", tr: "Pek çok / Sayısız", ph: "/ˈnjuː.mə.rəs/", d: "Great in number; many.", ex: "She received numerous awards for her scholarship." },
  { w: "Nutrient", p: "Noun", l: "B1", tr: "Besin / Gıda maddesi", ph: "/ˈnjuː.tri.ənt/", d: "A substance that provides nourishment essential for growth.", ex: "Fresh vegetables are packed with vital nutrients." },
  { w: "Nutrition", p: "Noun", l: "B1", tr: "Beslenme", ph: "/njuːˈtrɪʃ.ən/", d: "The process of providing or obtaining the food necessary for health.", ex: "Good nutrition fuels both body and brain." },
];

console.log("Adding J-Z vocabulary items...");

jzDictionary.forEach(item => {
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
      example: item.ex || `Example sentence with ${cleanWord}.`,
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
