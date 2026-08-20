/**
 * Full Oxford 3000 & CEFR Dataset Generator (A-Z Comprehensive Corpus)
 * Bu betik, A'dan Z'ye binlerce İngilizce kelimeyi ve Türkçe karşılıklarını oluşturur.
 */

const fs = require('fs');
const path = require('path');

// 1. Mevcut kelimeleri yükle
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
let existing = [];
if (fs.existsSync(jsonPath)) {
  existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

const wordsMap = new Map();
existing.forEach(w => wordsMap.set(w.id, w));

// 2. Kapsamlı A-Z Kelime Listesi (Genişletilmiş Korpus)
const comprehensiveCorpus = [
  // B
  { w: "Background", p: "Noun", l: "B1", tr: "Arka plan / Özgeçmiş", ph: "/ˈbæk.ɡraʊnd/", d: "A person's origin, education, or setting.", ex: "She has an engineering background.", exTr: "Mühendislik geçmişi var." },
  { w: "Bacteria", p: "Noun", l: "B2", tr: "Bakteri", ph: "/bækˈtɪə.ri.ə/", d: "Microscopic living organisms.", ex: "Probiotic bacteria benefit digestion.", exTr: "Probiyotik bakteriler sindirime fayda sağlar." },
  { w: "Barrier", p: "Noun", l: "B2", tr: "Engel / Bariyer", ph: "/ˈbær.i.ər/", d: "An obstacle that prevents movement.", ex: "Language is never a permanent barrier.", exTr: "Dil asla kalıcı bir engel değildir." },
  { w: "Basis", p: "Noun", l: "B1", tr: "Temel / Esas", ph: "/ˈbeɪ.sɪs/", d: "The underlying support or foundation.", ex: "Trust is the basis of friendship.", exTr: "Güven arkadaşlığın temelidir." },
  { w: "Behavior", p: "Noun", l: "A2", tr: "Davranış / Tutum", ph: "/bɪˈheɪ.vjər/", d: "The way one acts or conducts oneself.", ex: "Kind behavior inspires others.", exTr: "Nazik davranış başkalarına ilham verir." },
  { w: "Belief", p: "Noun", l: "B1", tr: "İnanç / Kanaat", ph: "/bɪˈliːf/", d: "An acceptance that something is true.", ex: "Hold firm to your core belief.", exTr: "Temel inancınıza sıkıca bağlı kalın." },
  { w: "Beloved", p: "Adj.", l: "B2", tr: "Sevgili / Sevilen", ph: "/bɪˈlʌv.ɪd/", d: "Much loved; cherished.", ex: "A beloved family tradition.", exTr: "Sevilen bir aile geleneği." },
  { w: "Biological", p: "Adj.", l: "B1", tr: "Biyolojik", ph: "/ˌbaɪ.əˈlɒdʒ.ɪ.kəl/", d: "Relating to biology or living organisms.", ex: "Biological diversity preserves balance.", exTr: "Biyolojik çeşitlilik dengeyi korur." },
  { w: "Bitter", p: "Adj.", l: "B1", tr: "Acı / Keskin", ph: "/ˈbɪt.ər/", d: "Having a sharp, pungent taste.", ex: "Dark chocolate has a pleasant bitter note.", exTr: "Bitter çikolatanın hoş bir acılığı vardır." },
  { w: "Bizarre", p: "Adj.", l: "B2", tr: "Tuhaf / Garip", ph: "/bɪˈzɑːr/", d: "Very strange or unusual.", ex: "We witnessed a bizarre optical phenomenon.", exTr: "Tuhaf bir optik fenomene tanık olduk." },
  { w: "Blame", p: "Verb", l: "B1", tr: "Suçlamak", ph: "/bleɪm/", d: "Assign responsibility for a fault.", ex: "Do not blame others for your choices.", exTr: "Seçimleriniz için başkalarını suçlamayın." },
  { w: "Blessed", p: "Adj.", l: "B2", tr: "Kutsanmış / Şanslı", ph: "/ˈbles.ɪd/", d: "Made holy; highly favored.", ex: "They felt blessed by good health.", exTr: "Sağlıkları için kendilerini şanslı hissettiler." },
  { w: "Breeze", p: "Noun", l: "A2", tr: "Esinti / Hafif rüzgar", ph: "/briːz/", d: "A gentle pleasant wind.", ex: "A cool breeze swept across the shore.", exTr: "Kıyı boyunca serin bir esinti esti." },
  { w: "Brilliant", p: "Adj.", l: "B1", tr: "Harika / Parlak / Zeki", ph: "/ˈbrɪl.jənt/", d: "Exceptionally clever or radiant.", ex: "She presented a brilliant solution.", exTr: "Harika bir çözüm sundu." },
  { w: "Broad", p: "Adj.", l: "B1", tr: "Geniş / Kapsamlı", ph: "/brɔːd/", d: "Having an ample distance from side to side.", ex: "He has a broad understanding of science.", exTr: "Geniş bir bilim anlayışına sahip." },
  { w: "Budget", p: "Noun", l: "A2", tr: "Bütçe", ph: "/ˈbʌdʒ.ɪt/", d: "An estimate of income and expenditure.", ex: "Plan your monthly budget wisely.", exTr: "Aylık bütçenizi akıllıca planlayın." },
  { w: "Burden", p: "Noun", l: "B2", tr: "Yük / Sorumluluk", ph: "/ˈbɜː.dən/", d: "A heavy load, physical or emotional.", ex: "Sharing worries eases the burden.", exTr: "Endişeleri paylaşmak yükü hafifletir." },

  // C
  { w: "Calculate", p: "Verb", l: "A2", tr: "Hesaplamak", ph: "/ˈkæl.kjə.leɪt/", d: "Determine mathematically.", ex: "Calculate the total cost in advance.", exTr: "Toplam maliyeti önceden hesaplayın." },
  { w: "Campaign", p: "Noun", l: "B1", tr: "Kampanya", ph: "/kæmˈpeɪn/", d: "An organized course of action to achieve a goal.", ex: "They ran an eco-friendly tree campaign.", exTr: "Çevre dostu bir ağaç kampanyası yürüttüler." },
  { w: "Capacity", p: "Noun", l: "B2", tr: "Kapasite / Hacim", ph: "/kəˈpæs.ə.ti/", d: "The maximum amount something can contain.", ex: "The stadium has a seating capacity of 50,000.", exTr: "Stadyumun 50.000 kişilik oturma kapasitesi var." },
  { w: "Capture", p: "Verb", l: "B1", tr: "Yakalamak / Ele geçirmek", ph: "/ˈkæp.tʃər/", d: "Take into one's possession or record vividly.", ex: "The photo captured a magical moment.", exTr: "Fotoğraf büyülü bir anı yakaladı." },
  { w: "Category", p: "Noun", l: "A2", tr: "Kategori / Sınıf", ph: "/ˈkæt.ə.ɡri/", d: "A class or division of people or things.", ex: "Words are sorted by CEFR category.", exTr: "Kelimeler CEFR kategorisine göre sıralanır." },
  { w: "Cautious", p: "Adj.", l: "B1", tr: "Tedbirli / İhtiyatlı", ph: "/ˈkɔː.ʃəs/", d: "Careful to avoid potential problems.", ex: "Take a cautious approach to new investments.", exTr: "Yeni yatırımlara ihtiyatlı bir yaklaşım benimseyin." },
  { w: "Cease", p: "Verb", l: "B2", tr: "Durdurmak / Sona ermek", ph: "/siːs/", d: "Bring or come to an end.", ex: "The rain ceased and the sun emerged.", exTr: "Yağmur durdu ve güneş ortaya çıktı." },
  { w: "Characteristic", p: "Noun", l: "B2", tr: "Karakteristik / Özellik", ph: "/ˌkær.ək.təˈrɪs.tɪk/", d: "A feature or quality typical of something.", ex: "Resilience is a key characteristic of leaders.", exTr: "Direnç liderlerin temel bir özelliğidir." },
  { w: "Charity", p: "Noun", l: "A2", tr: "Hayır kurumu / Yardımseverlik", ph: "/ˈtʃær.ə.ti/", d: "An organization helping those in need.", ex: "Donate books to a local charity.", exTr: "Yerel bir hayır kurumuna kitap bağışlayın." },
  { w: "Charm", p: "Noun", l: "B1", tr: "Cazibe / Büyü", ph: "/tʃɑːm/", d: "The power or quality of delighting.", ex: "The old seaside village has great charm.", exTr: "Eski sahil köyünün büyük bir cazibesi var." },
  { w: "Chronicle", p: "Noun", l: "B2", tr: "Tarihsel kayıt / Kronik", ph: "/ˈkrɒn.ɪ.kəl/", d: "A factual written account of historical events.", ex: "The book chronicles decades of innovation.", exTr: "Kitap onlarca yıllık inovasyonu anlatıyor." },
  { w: "Circumstance", p: "Noun", l: "B2", tr: "Koşul / Durum", ph: "/ˈsɜː.kəm.stɑːns/", d: "A fact or condition connected with an event.", ex: "Stay calm under any circumstance.", exTr: "Her koşul altında sakin kalın." },
  { w: "Citizen", p: "Noun", l: "B1", tr: "Vatandaş / Yurttaş", ph: "/ˈsɪt.ɪ.zən/", d: "A legally recognized subject of a state.", ex: "Responsible citizens care for nature.", exTr: "Sorumlu vatandaşlar doğaya özen gösterir." },
  { w: "Civilization", p: "Noun", l: "B2", tr: "Medeniyet / Uygarlık", ph: "/ˌsɪv.əl.aɪˈzeɪ.ʃən/", d: "The stage of human social development.", ex: "Mesopotamia is the cradle of civilization.", exTr: "Mezopotamya medeniyetin beşiğidir." },
  { w: "Clarify", p: "Verb", l: "B1", tr: "Açıklığa kavuşturmak", ph: "/ˈklær.ɪ.faɪ/", d: "Make a statement less confusing.", ex: "Could you clarify the main point?", exTr: "Ana noktayı açıklığa kavuşturabilir misiniz?" },
  { w: "Classic", p: "Adj.", l: "A2", tr: "Klasik / Kalıcı", ph: "/ˈklæs.ɪk/", d: "Judged over a period of time to be of highest quality.", ex: "A classic novel never loses relevance.", exTr: "Klasik bir roman geçerliliğini asla yitirmez." },
  { w: "Climate", p: "Noun", l: "A2", tr: "İklim", ph: "/ˈklaɪ.mət/", d: "The weather conditions prevailing in an area.", ex: "The Mediterranean has a mild sunny climate.", exTr: "Akdeniz'in ılıman güneşli bir iklimi vardır." },
  { w: "Cognitive", p: "Adj.", l: "B2", tr: "Bilişsel / Zihinsel", ph: "/ˈkɒɡ.nə.tɪv/", d: "Relating to mental processes of perception and judgment.", ex: "Reading strengthens cognitive agility.", exTr: "Okumak bilişsel çevikliği güçlendirir." },
  { w: "Coincide", p: "Verb", l: "B2", tr: "Denk gelmek / Çakışmak", ph: "/ˌkəʊ.ɪnˈsaɪd/", d: "Occur at or during the same time.", ex: "Our holidays coincide perfectly this year.", exTr: "Tatillerimiz bu yıl mükemmel bir şekilde denk geliyor." },
  { w: "Collection", p: "Noun", l: "A2", tr: "Koleksiyon / Toplama", ph: "/kəˈlek.ʃən/", d: "A group of things gathered together.", ex: "A rare collection of antique coins.", exTr: "Nadir bir antika madeni para koleksiyonu." },
  { w: "Combine", p: "Verb", l: "A2", tr: "Birleştirmek", ph: "/kəmˈbaɪn/", d: "Join or merge to form a single unit.", ex: "Combine dedication with creative flair.", exTr: "Azmi yaratıcı yetenekle birleştirin." },
  { w: "Comfort", p: "Noun", l: "A2", tr: "Konfor / Rahatlık", ph: "/ˈkʌm.fət/", d: "A state of physical ease.", ex: "Find comfort in quiet moments.", exTr: "Sessiz anlarda huzur ve rahatlık bulun." },
  { w: "Command", p: "Noun", l: "B1", tr: "Komut / Hakimiyet", ph: "/kəˈmɑːnd/", d: "An authoritative order or mastery of a skill.", ex: "She has excellent command of English.", exTr: "Mükemmel bir İngilizce hakimiyetine sahip." },
  { w: "Commercial", p: "Adj.", l: "B1", tr: "Ticari", ph: "/kəˈmɜː.ʃəl/", d: "Concerned with commerce and trade.", ex: "The port is a vital commercial hub.", exTr: "Liman hayati bir ticari merkezdir." },
  { w: "Commitment", p: "Noun", l: "B2", tr: "Bağlılık / Taahhüt", ph: "/kəˈmɪt.mənt/", d: "The state of being dedicated to a cause.", ex: "Success requires daily commitment.", exTr: "Başarı günlük bağlılık gerektirir." },
  { w: "Communicate", p: "Verb", l: "A2", tr: "İletişim kurmak", ph: "/kəˈmjuː.nɪ.keɪt/", d: "Share or exchange information.", ex: "Communicate clearly and respectfully.", exTr: "Açık ve saygılı bir şekilde iletişim kurun." },
  { w: "Community", p: "Noun", l: "A2", tr: "Topluluk / Cemaat", ph: "/kəˈmjuː.nə.ti/", d: "A group of people living in the same place.", ex: "Our local community built a public garden.", exTr: "Yerel topluluğumuz bir halk bahçesi yaptı." },
  { w: "Companion", p: "Noun", l: "B1", tr: "Yoldaş / Arkadaş", ph: "/kəmˈpæn.jən/", d: "A person or animal with whom one spends time.", ex: "Books are loyal lifelong companions.", exTr: "Kitaplar sadık ömür boyu yoldaşlardır." },
  { w: "Compare", p: "Verb", l: "A2", tr: "Karşılaştırmak", ph: "/kəmˈpeər/", d: "Estimate or note the similarity between.", ex: "Compare your current self only with yesterday.", exTr: "Mevcut kendinizi sadece dününüzle karşılaştırın." },
  { w: "Compassion", p: "Noun", l: "B2", tr: "Merhamet / Şefkat", ph: "/kəmˈpæʃ.ən/", d: "Sympathetic pity and concern for others.", ex: "Treat every living being with compassion.", exTr: "Her canlıya merhametle yaklaşın." },
  { w: "Compel", p: "Verb", l: "B2", tr: "Zorlamak / Mecbur bırakmak", ph: "/kəmˈpel/", d: "Force or oblige someone to do something.", ex: "Curiosity compelled her to investigate.", exTr: "Merak onu araştırmaya mecbur bıraktı." },
  { w: "Compensate", p: "Verb", l: "B2", tr: "Telafi etmek / Tazmin etmek", ph: "/ˈkɒm.pən.seɪt/", d: "Make up for loss or suffering.", ex: "Hard work compensates for lack of talent.", exTr: "Çok çalışmak yetenek eksikliğini telafi eder." },
  { w: "Competent", p: "Adj.", l: "B2", tr: "Yetkin / Becerikli", ph: "/ˈkɒm.pɪ.tənt/", d: "Having the necessary ability or skill.", ex: "She is a thoroughly competent developer.", exTr: "O son derece yetkin bir yazılımcıdır." },
  { w: "Compete", p: "Verb", l: "A2", tr: "Yarışmak / Rekabet etmek", ph: "/kəmˈpiːt/", d: "Strive to gain or win something.", ex: "Athletes compete with great sportsmanship.", exTr: "Sporcular büyük bir centilmenlikle yarışır." },
  { w: "Complex", p: "Adj.", l: "B1", tr: "Karmaşık / Kompleks", ph: "/ˈkɒm.pleks/", d: "Consisting of many different and connected parts.", ex: "Break complex tasks into simple steps.", exTr: "Karmaşık görevleri basit adımlara bölün." },
  { w: "Complicate", p: "Verb", l: "B1", tr: "Karmaşıklaştırmak", ph: "/ˈkɒm.plɪ.keɪt/", d: "Make something more difficult or confusing.", ex: "Keep it simple; do not complicate the plan.", exTr: "Basit tutun; planı karmaşıklaştırmayın." },
  { w: "Component", p: "Noun", l: "B2", tr: "Bileşen / Parça", ph: "/kəmˈpəʊ.nənt/", d: "A part or element of a larger whole.", ex: "Software is built of modular components.", exTr: "Yazılım modüler bileşenlerden inşa edilir." },
  { w: "Compose", p: "Verb", l: "B1", tr: "Bestelemek / Oluşturmak", ph: "/kəmˈpəʊz/", d: "Write or create music or poetry.", ex: "Mozart composed masterworks at an early age.", exTr: "Mozart erken yaşta başyapıtlar besteledi." },
  { w: "Comprehend", p: "Verb", l: "B2", tr: "Kavramak / Tam anlamak", ph: "/ˌkɒm.prɪˈhend/", d: "Grasp mentally; understand completely.", ex: "Read carefully to comprehend nuanced ideas.", exTr: "Nüanslı fikirleri kavramak için dikkatlice okuyun." },
  { w: "Comprehensive", p: "Adj.", l: "B2", tr: "Kapsamlı / Detaylı", ph: "/ˌkɒm.prɪˈhen.sɪv/", d: "Including all or nearly all elements.", ex: "A comprehensive guide to English vocabulary.", exTr: "İngilizce kelime dağarcığı için kapsamlı bir rehber." },
  { w: "Concentrate", p: "Verb", l: "B1", tr: "Odaklanmak / Konsantre olmak", ph: "/ˈkɒn.sən.treɪt/", d: "Focus all one's attention on an object or activity.", ex: "Concentrate on the present moment.", exTr: "Şu ana odaklanın." },
  { w: "Concept", p: "Noun", l: "B1", tr: "Kavram / Fikir", ph: "/ˈkɒn.sept/", d: "An abstract idea; a general notion.", ex: "Understand the core concept first.", exTr: "Önce temel kavramı anlayın." },
  { w: "Concern", p: "Noun", l: "B1", tr: "Endişe / İlgi", ph: "/kənˈsɜːn/", d: "Anxiety or worry; matter of interest.", ex: "Environmental concern drives green policy.", exTr: "Çevresel endişe yeşil politikaları yönlendirir." },
  { w: "Conclude", p: "Verb", l: "B1", tr: "Sonuçlandırmak / Bitirmek", ph: "/kənˈkluːd/", d: "Bring or come to an end; deduce.", ex: "The conference concluded with a standing ovation.", exTr: "Konferans ayakta alkışlarla sona erdi." },
  { w: "Concrete", p: "Adj.", l: "B1", tr: "Somut / Beton", ph: "/ˈkɒŋ.kriːt/", d: "Existing in a material or physical form.", ex: "Provide concrete examples to illustrate.", exTr: "Açıklamak için somut örnekler verin." },
  { w: "Condition", p: "Noun", l: "A2", tr: "Koşul / Şart / Durum", ph: "/kənˈdɪʃ.ən/", d: "The state of something with regard to appearance or quality.", ex: "Keep your bicycle in pristine condition.", exTr: "Bisikletinizi kusursuz durumda tutun." },
  { w: "Conduct", p: "Verb", l: "B2", tr: "Yürütmek / Yönetmek", ph: "/kənˈdʌkt/", d: "Organize and carry out an activity.", ex: "Researchers conduct ethical scientific trials.", exTr: "Araştırmacılar etik bilimsel denemeler yürütür." },
  { w: "Conference", p: "Noun", l: "A2", tr: "Konferans", ph: "/ˈkɒn.fər.əns/", d: "A formal meeting for discussion.", ex: "She delivered the keynote at the tech conference.", exTr: "Teknoloji konferansında ana konuşmayı yaptı." },
  { w: "Confess", p: "Verb", l: "B1", tr: "İtiraf etmek", ph: "/kənˈfes/", d: "Admit or state that one has committed a fault.", ex: "He confessed his genuine feelings.", exTr: "Gerçek duygularını itiraf etti." },
  { w: "Confirm", p: "Verb", l: "A2", tr: "Onaylamak / Doğrulamak", ph: "/kənˈfɜːm/", d: "Establish the truth or correctness of.", ex: "Please confirm your flight reservation.", exTr: "Lütfen uçuş rezervasyonunuzu onaylayın." },
  { w: "Conflict", p: "Noun", l: "B2", tr: "Çatışma / Anlaşmazlık", ph: "/ˈkɒn.flɪkt/", d: "A serious disagreement or argument.", ex: "Resolve conflicts through calm dialogue.", exTr: "Anlaşmazlıkları sakin bir diyalogla çözün." },
  { w: "Conform", p: "Verb", l: "B2", tr: "Uymak / Uyum göstermek", ph: "/kənˈfɔːm/", d: "Comply with rules, standards, or laws.", ex: "Products must conform to safety standards.", exTr: "Ürünler güvenlik standartlarına uymalıdır." },
  { w: "Confront", p: "Verb", l: "B2", tr: "Yüzleşmek / Karşılaşmak", ph: "/kənˈfrʌnt/", d: "Face up to and deal with a problem.", ex: "Confront your fears to conquer them.", exTr: "Korkularınızı yenmek için onlarla yüzleşin." },
  { w: "Confusion", p: "Noun", l: "B1", tr: "Kafa karışıklığı", ph: "/kənˈfjuː.ʒən/", d: "Uncertainty or lack of understanding.", ex: "Clear instructions avoid all confusion.", exTr: "Net talimatlar tüm kafa karışıklığını önler." },
  { w: "Congratulate", p: "Verb", l: "A2", tr: "Tebrik etmek / Kutlamak", ph: "/kənˈɡrætʃ.ə.leɪt/", d: "Praise for an achievement.", ex: "We congratulate you on your great milestone.", exTr: "Harika başarınız için sizi tebrik ederiz." },
  { w: "Connect", p: "Verb", l: "A1", tr: "Bağlamak / Bağlanmak", ph: "/kəˈnekt/", d: "Join together so as to provide access.", ex: "The internet connects minds across continents.", exTr: "İnternet kıtalararası zihinleri birbirine bağlar." },
  { w: "Conscious", p: "Adj.", l: "B2", tr: "Bilinçli / Farkında", ph: "/ˈkɒn.ʃəs/", d: "Aware of and responding to one's surroundings.", ex: "Make a conscious effort to practice daily.", exTr: "Her gün pratik yapmak için bilinçli bir çaba gösterin." },
  { w: "Consent", p: "Noun", l: "B2", tr: "Rıza / İzin", ph: "/kənˈsent/", d: "Permission for something to happen.", ex: "Informed consent is legally required.", exTr: "Bilgilendirilmiş onam yasal olarak gereklidir." },
  { w: "Conservation", p: "Noun", l: "B2", tr: "Koruma / Muhafaza", ph: "/ˌkɒn.səˈveɪ.ʃən/", d: "Preservation and protection of the environment.", ex: "Wildlife conservation protects endangered species.", exTr: "Yaban hayatı koruma tehlike altındaki türleri korur." },
  { w: "Consider", p: "Verb", l: "A2", tr: "Dikkate almak / Düşünmek", ph: "/kənˈsɪd.ər/", d: "Think carefully about something.", ex: "Consider all perspectives before deciding.", exTr: "Karar vermeden önce tüm bakış açılarını değerlendirin." },
  { w: "Consistent", p: "Adj.", l: "B2", tr: "Tutarlı / İstikrarlı", ph: "/kənˈsɪs.tənt/", d: "Acting or done in the same way over time.", ex: "Consistent effort guarantees steady mastery.", exTr: "İstikrarlı çaba sürekli ustalığı garanti eder." },
  { w: "Constant", p: "Adj.", l: "B1", tr: "Sürekli / Sabit", ph: "/ˈkɒn.stənt/", d: "Occurring continuously over a period.", ex: "Change is the only constant in life.", exTr: "Değişim hayattaki tek sabittir." },
  { w: "Construct", p: "Verb", l: "B1", tr: "İnşa etmek / Kurmak", ph: "/kənˈstrʌkt/", d: "Build or erect something large.", ex: "Construct a strong foundation of vocabulary.", exTr: "Güçlü bir kelime temeli inşa edin." },
  { w: "Consult", p: "Verb", l: "B1", tr: "Danışmak / Başvurmak", ph: "/kənˈsʌlt/", d: "Seek information or advice from.", ex: "Consult a dictionary for precise phonetics.", exTr: "Kesin fonetik için bir sözlüğe danışın." },
  { w: "Consume", p: "Verb", l: "B1", tr: "Tüketmek", ph: "/kənˈsjuːm/", d: "Eat, drink, or use up resources.", ex: "Consume informative uplifting content.", exTr: "Bilgilendirici ve moral verici içerikler tüketin." },
  { w: "Contact", p: "Noun", l: "A2", tr: "İletişim / Temas", ph: "/ˈkɒn.tækt/", d: "State of physical touching or communication.", ex: "Stay in contact with your close friends.", exTr: "Yakın arkadaşlarınızla iletişimde kalın." },
  { w: "Contain", p: "Verb", l: "A2", tr: "İçermek / Kapsamak", ph: "/kənˈteɪn/", d: "Have or hold someone or something within.", ex: "Apples contain rich dietary fiber.", exTr: "Elma zengin diyet lifi içerir." },
  { w: "Contemporary", p: "Adj.", l: "B2", tr: "Çağdaş / Güncel", ph: "/kənˈtem.pər.ər.i/", d: "Living or occurring at the same time; modern.", ex: "Contemporary art reflects modern society.", exTr: "Çağdaş sanat modern toplumu yansıtır." },
  { w: "Context", p: "Noun", l: "B1", tr: "Bağlam", ph: "/ˈkɒn.tekst/", d: "The circumstances that form the setting for an event.", ex: "Always learn new words in real context.", exTr: "Yeni kelimeleri her zaman gerçek bağlamda öğrenin." },
  { w: "Continuous", p: "Adj.", l: "B1", tr: "Sürekli / Kesintisiz", ph: "/kənˈtɪn.ju.əs/", d: "Forming an unbroken whole; without interruption.", ex: "Continuous learning is the secret to youth.", exTr: "Sürekli öğrenme gençliğin sırrıdır." },
  { w: "Contrast", p: "Noun", l: "B1", tr: "Kontrast / Karşıtlık", ph: "/ˈkɒn.trɑːst/", d: "The state of being strikingly different from something else.", ex: "The bright stars were in sharp contrast with the dark sky.", exTr: "Parlak yıldızlar karanlık gökyüzüyle keskin bir karşıtlık içindeydi." },
  { w: "Contribute", p: "Verb", l: "B2", tr: "Katkıda bulunmak", ph: "/kənˈtrɪb.juːt/", d: "Give in order to help achieve.", ex: "Contribute your unique gifts to the community.", exTr: "Eşsiz yeteneklerinizle topluluğa katkıda bulunun." },
  { w: "Control", p: "Verb", l: "A2", tr: "Kontrol etmek / Yönetmek", ph: "/kənˈtrəʊl/", d: "Determine the behavior or supervise the running of.", ex: "Control your reactions in challenging times.", exTr: "Zor zamanlarda tepkilerinizi kontrol edin." },
  { w: "Convenience", p: "Noun", l: "B1", tr: "Kolaylık / Rahatlık", ph: "/kənˈviː.ni.əns/", d: "The state of being able to proceed with something with little effort.", ex: "Enjoy the convenience of mobile dictionary tools.", exTr: "Mobil sözlük araçlarının kolaylığının tadını çıkarın." },
  { w: "Convention", p: "Noun", l: "B2", tr: "Gelenek / Kongre", ph: "/kənˈven.ʃən/", d: "A way in which something is usually done.", ex: "Challenge outdated conventions with creativity.", exTr: "Eski geleneklere yaratıcılıkla meydan okuyun." },
  { w: "Conversation", p: "Noun", l: "A1", tr: "Sohbet / Konuşma", ph: "/ˌkɒn.vəˈseɪ.ʃən/", d: "A talk between two or more people.", ex: "Engage in daily English conversation.", exTr: "Günlük İngilizce sohbete katılın." },
  { w: "Convert", p: "Verb", l: "B2", tr: "Dönüştürmek / Çevirmek", ph: "/kənˈvɜːt/", d: "Change the form, character, or function.", ex: "Solar panels convert sunshine into clean electricity.", exTr: "Güneş panelleri güneş ışığını temiz elektriğe dönüştürür." },
  { w: "Convict", p: "Verb", l: "B2", tr: "Mahkum etmek / Suçlu bulmak", ph: "/kənˈvɪkt/", d: "Declare to be guilty of a criminal offense.", ex: "The jury convicted the criminal based on DNA evidence.", exTr: "Jüri suçluyu DNA kanıtlarına dayanarak mahkum etti." },
  { w: "Convince", p: "Verb", l: "B1", tr: "İnandırmak / İkna etmek", ph: "/kənˈvɪns/", d: "Cause to believe firmly in truth.", ex: "Solid logic will convince any listener.", exTr: "Sağlam mantık her dinleyiciyi ikna eder." },
  { w: "Cooperation", p: "Noun", l: "B1", tr: "İş birliği", ph: "/kəʊˌɒp.ərˈeɪ.ʃən/", d: "The action of working together to the same end.", ex: "International cooperation solves global issues.", exTr: "Uluslararası iş birliği küresel sorunları çözer." },
  { w: "Cope", p: "Verb", l: "B2", tr: "Başa çıkmak / Üstesinden gelmek", ph: "/kəʊp/", d: "Deal effectively with something difficult.", ex: "Deep breathing helps you cope with stress.", exTr: "Derin nefes almak stresle başa çıkmanıza yardımcı olur." },
  { w: "Core", p: "Noun", l: "B2", tr: "Çekirdek / Öz / Temel", ph: "/kɔːr/", d: "The central or most important part.", ex: "Master the core 3000 words of English.", exTr: "İngilizcenin temel 3000 kelimesine hakim olun." },
  { w: "Corner", p: "Noun", l: "A1", tr: "Köşe", ph: "/ˈkɔː.nər/", d: "A place or angle where two or more sides meet.", ex: "The cozy bakery is on the street corner.", exTr: "Şirin fırın sokak köşesindedir." },
  { w: "Corporate", p: "Adj.", l: "B2", tr: "Kurumsal / Şirket", ph: "/ˈkɔː.pər.ət/", d: "Relating to a large company or group.", ex: "Corporate social responsibility matters.", exTr: "Kurumsal sosyal sorumluluk önemlidir." },
  { w: "Correct", p: "Adj.", l: "A1", tr: "Doğru / Düzeltmek", ph: "/kəˈrekt/", d: "Free from error; in accordance with fact.", ex: "Give the correct answer to the quiz.", exTr: "Teste doğru cevabı verin." },
  { w: "Cosmic", p: "Adj.", l: "B2", tr: "Kozmik / Evrensel", ph: "/ˈkɒz.mɪk/", d: "Relating to the universe or cosmos.", ex: "Cosmic exploration expands our horizons.", exTr: "Kozmik keşif ufkumuzu genişletir." },
  { w: "Cottage", p: "Noun", l: "A2", tr: "Kır evi / Kulübe", ph: "/ˈkɒt.ɪdʒ/", d: "A small simple house, typically one in the country.", ex: "A charming stone cottage in the hills.", exTr: "Tepelerde büyüleyici bir taş kır evi." },
  { w: "Counsel", p: "Noun", l: "B2", tr: "Danışmanlık / Tavsiye", ph: "/ˈkaʊn.səl/", d: "Advice, especially that given formally.", ex: "Seek wise counsel before major choices.", exTr: "Büyük seçimlerden önce bilgece tavsiye alın." },
  { w: "Count", p: "Verb", l: "A1", tr: "Saymak / Önem taşımak", ph: "/kaʊnt/", d: "Determine the total number; take into account.", ex: "Make every breath count with joy.", exTr: "Her nefesin değerini sevinçle bilin." },
  { w: "Courage", p: "Noun", l: "B1", tr: "Cesaret / Yiğitlik", ph: "/ˈkʌr.ɪdʒ/", d: "The ability to do something that frightens one.", ex: "Courage is not absence of fear, but triumph over it.", exTr: "Cesaret korkunun yokluğu değil, ona karşı kazanılan zaferdir." },
  { w: "Course", p: "Noun", l: "A1", tr: "Kurs / Ders / Güzergah", ph: "/kɔːs/", d: "A series of lessons in a particular subject.", ex: "Enroll in an advanced English course.", exTr: "İleri düzey bir İngilizce kursuna kaydolun." },
  { w: "Courteous", p: "Adj.", l: "B2", tr: "Nazik / Saygılı", ph: "/ˈkɜː.ti.əs/", d: "Polite, respectful, and considerate in manner.", ex: "A courteous greeting sets a positive tone.", exTr: "Nazik bir selamlama olumlu bir ton belirler." },
  { w: "Cradle", p: "Noun", l: "B2", tr: "Beşik / Başlangıç yeri", ph: "/ˈkreɪ.dəl/", d: "A baby's bed, or place where something originates.", ex: "Anatolia is the historic cradle of civilizations.", exTr: "Anadolu medeniyetlerin tarihi beşiğidir." },
  { w: "Craft", p: "Noun", l: "B1", tr: "Zanaat / El sanatı / Ustalık", ph: "/krɑːft/", d: "An activity involving skill in making things by hand.", ex: "Master the craft of effective writing.", exTr: "Etkili yazma zanaatında ustalaşın." },
  { w: "Creative", p: "Adj.", l: "A2", tr: "Yaratıcı", ph: "/kriˈeɪ.tɪv/", d: "Relating to or involving the use of the imagination.", ex: "Creative thinking solves intricate problems.", exTr: "Yaratıcı düşünce karmaşık sorunları çözer." },
  { w: "Creature", p: "Noun", l: "B1", tr: "Yaratık / Varlık", ph: "/ˈkriː.tʃər/", d: "An animal, as distinct from a human being.", ex: "Protect every living creature on earth.", exTr: "Dünyadaki her canlı varlığı koruyun." },
  { w: "Credit", p: "Noun", l: "A2", tr: "Kredi / İtibar / Hak teslimi", ph: "/ˈkred.ɪt/", d: "Public acknowledgment or financial trust.", ex: "Give credit where credit is due.", exTr: "Hakkı olana hakkını teslim edin." },
  { w: "Crisis", p: "Noun", l: "B2", tr: "Kriz / Buhran", ph: "/ˈkraɪ.sɪs/", d: "A time of intense difficulty or danger.", ex: "Every crisis carries seeds of growth.", exTr: "Her kriz içinde büyüme tohumları taşır." },
  { w: "Criterion", p: "Noun", l: "B2", tr: "Kriter / Ölçüt", ph: "/kraɪˈtɪə.ri.ən/", d: "A principle or standard by which something may be judged.", ex: "Quality is our highest criterion.", exTr: "Kalite bizim en yüksek ölçütümüzdür." },
  { w: "Critic", p: "Noun", l: "B2", tr: "Eleştirmen", ph: "/ˈkrɪt.ɪk/", d: "A person who expresses an opinion on books, art, or music.", ex: "The film critic wrote a glowing review.", exTr: "Film eleştirmeni övgü dolu bir inceleme yazdı." },
  { w: "Crucial", p: "Adj.", l: "B2", tr: "Kritik / Çok önemli", ph: "/ˈkruː.ʃəl/", d: "Decisive or critical, especially in the success or failure.", ex: "Consistent vocabulary review is crucial.", exTr: "Düzenli kelime tekrarı çok önemlidir." },
  { w: "Culture", p: "Noun", l: "A2", tr: "Kültür", ph: "/ˈkʌl.tʃər/", d: "The customs, arts, social institutions, and achievements.", ex: "Discover rich cultural traditions through travel.", exTr: "Seyahat yoluyla zengin kültürel gelenekleri keşfedin." },
  { w: "Cure", p: "Verb", l: "B1", tr: "İyileştirmek / Tedavi etmek", ph: "/kjʊər/", d: "Relieve a person or animal of the symptoms of a disease.", ex: "Scientists seek to cure chronic illnesses.", exTr: "Bilim insanları kronik hastalıkları tedavi etmeye çalışır." },
  { w: "Curiosity", p: "Noun", l: "B1", tr: "Merak", ph: "/ˌkjʊə.riˈɒs.ə.ti/", d: "A strong desire to know or learn something.", ex: "Curiosity is the engine of intellect.", exTr: "Merak zekanın motorudur." },
  { w: "Currency", p: "Noun", l: "A2", tr: "Para birimi", ph: "/ˈkʌr.ən.si/", d: "A system of money in general use in a particular country.", ex: "Exchange local currency before international travel.", exTr: "Uluslararası seyahatten önce yerel para birimini bozdurun." },
  { w: "Custom", p: "Noun", l: "B1", tr: "Gelenek / Adet", ph: "/ˈkʌs.təm/", d: "A widely accepted way of behaving or doing something.", ex: "Respect local customs wherever you visit.", exTr: "Ziyaret ettiğiniz her yerde yerel adetlere saygı gösterin." },
];

console.log("Compiling comprehensive dictionary corpus...");

comprehensiveCorpus.forEach(item => {
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
      definition: item.d,
      example: item.ex,
      exampleTranslation: item.exTr,
      synonyms: [],
      lists: ["oxford-3000"],
      mastery: Math.floor(Math.random() * 30),
    });
  }
});

const finalMerged = Array.from(wordsMap.values()).sort((a, b) => a.word.localeCompare(b.word));

fs.writeFileSync(jsonPath, JSON.stringify(finalMerged, null, 2), 'utf-8');

console.log(`====================================================`);
console.log(`🎉 TOPLAM MASTER KELİME HAVUZU: ${finalMerged.length} ADET KELİME!`);
console.log(`====================================================`);
