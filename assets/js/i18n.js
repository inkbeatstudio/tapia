/* ============================================================
   TEPIA GROUP — i18n engine
   Static-first pattern: page ships with EN text in the DOM,
   JS swaps text on load based on saved/browser language and
   on manual switch.
   ============================================================ */

(function () {
  const LANGS = [
    { code: "en", label: "English", short: "EN" },
    { code: "uk", label: "Українська", short: "UA" },
    { code: "de", label: "Deutsch", short: "DE" },
    { code: "ro", label: "Română", short: "RO" },
    { code: "ru", label: "Русский", short: "RU" },
  ];
  const DEFAULT_LANG = "en";

  const DICT = {
    nav: {
      home: { en: "Home", uk: "Головна", de: "Start", ro: "Acasă", ru: "Главная" },
      about: { en: "About", uk: "Про нас", de: "Über uns", ro: "Despre noi", ru: "О нас" },
      searches: { en: "Vacancies", uk: "Вакансії", de: "Stellenangebote", ro: "Locuri de muncă", ru: "Вакансии" },
      industries: { en: "Destinations", uk: "Країни", de: "Zielländer", ro: "Destinații", ru: "Страны" },
      blog: { en: "Guides", uk: "Блог", de: "Ratgeber", ro: "Articole", ru: "Блог" },
      employers: { en: "For Employers", uk: "Роботодавцям", de: "Für Arbeitgeber", ro: "Pentru angajatori", ru: "Работодателям" },
      contact: { en: "Contact", uk: "Контакти", de: "Kontakt", ro: "Contact", ru: "Контакты" },
      cta: { en: "Get a consultation", uk: "Отримати консультацію", de: "Beratung erhalten", ro: "Obține o consultație", ru: "Получить консультацию" },
    },
    hero: {
      eyebrow: { en: "Legal Employment Abroad · Warsaw", uk: "Легальне працевлаштування за кордоном · Варшава", de: "Legale Arbeit im Ausland · Warschau", ro: "Angajare legală în străinătate · Varșovia", ru: "Легальное трудоустройство за границей · Варшава" },
      title: { en: "Legal work abroad — without the risk or the guesswork.", uk: "Легальна робота за кордоном — без ризику і зайвих запитань.", de: "Legale Arbeit im Ausland — ohne Risiko und ohne Rätselraten.", ro: "Muncă legală în străinătate — fără riscuri și incertitudini.", ru: "Легальная работа за границей — без риска и лишних вопросов." },
      subtitle: { en: "TEPIA GROUP is a licensed employment agency based in Warsaw. We match candidates with verified, legal vacancies in Poland, Germany and across the EU, and support you at every step: documents, work permit, travel and housing.", uk: "TEPIA GROUP — ліцензована агенція з працевлаштування у Варшаві. Ми підбираємо перевірені легальні вакансії в Польщі, Німеччині та інших країнах ЄС і супроводжуємо на кожному кроці: документи, дозвіл на роботу, виїзд і житло.", de: "TEPIA GROUP ist eine lizenzierte Personalvermittlung mit Sitz in Warschau. Wir vermitteln geprüfte, legale Stellen in Polen, Deutschland und in der ganzen EU und begleiten Sie bei jedem Schritt: Dokumente, Arbeitserlaubnis, Reise und Unterkunft.", ro: "TEPIA GROUP este o agenție de recrutare licențiată cu sediul la Varșovia. Potrivim candidați cu locuri de muncă verificate și legale în Polonia, Germania și în UE, și te sprijinim la fiecare pas: acte, permis de muncă, călătorie și cazare.", ru: "TEPIA GROUP — лицензированное агентство по трудоустройству в Варшаве. Мы подбираем проверенные легальные вакансии в Польше, Германии и странах ЕС и сопровождаем на каждом шаге: документы, разрешение на работу, выезд и жильё." },
      cta_primary: { en: "Find a vacancy", uk: "Підібрати вакансію", de: "Stelle finden", ro: "Găsește un loc de muncă", ru: "Подобрать вакансию" },
      cta_secondary: { en: "Free consultation", uk: "Безкоштовна консультація", de: "Kostenlose Beratung", ro: "Consultație gratuită", ru: "Бесплатная консультация" },
      stat1_num: { en: "12+", uk: "12+", de: "12+", ro: "12+", ru: "12+" },
      stat1_label: { en: "Years on the market", uk: "Років на ринку", de: "Jahre am Markt", ro: "Ani pe piață", ru: "Лет на рынке" },
      stat2_num: { en: "5,400+", uk: "5 400+", de: "5.400+", ro: "5.400+", ru: "5 400+" },
      stat2_label: { en: "People placed abroad", uk: "Людей працевлаштовано", de: "Vermittelte Personen", ro: "Persoane plasate", ru: "Человек трудоустроено" },
      stat3_num: { en: "98%", uk: "98%", de: "98%", ro: "98%", ru: "98%" },
      stat3_label: { en: "Fully legal contracts", uk: "Повністю легальних контрактів", de: "Vollständig legale Verträge", ro: "Contracte pe deplin legale", ru: "Полностью легальных контрактов" },
      stat4_num: { en: "9", uk: "9", de: "9", ro: "9", ru: "9" },
      stat4_label: { en: "Destination countries", uk: "Країн працевлаштування", de: "Zielländer", ro: "Țări de destinație", ru: "Стран трудоустройства" },
    },
    industries: {
      eyebrow: { en: "Where We Place People", uk: "Куди ми працевлаштовуємо", de: "Wohin wir vermitteln", ro: "Unde plasăm candidați", ru: "Куда мы трудоустраиваем" },
      title: { en: "Verified vacancies across 9 European countries", uk: "Перевірені вакансії у 9 країнах Європи", de: "Geprüfte Stellen in 9 europäischen Ländern", ro: "Locuri de muncă verificate în 9 țări europene", ru: "Проверенные вакансии в 9 странах Европы" },
      i1_title: { en: "Poland", uk: "Польща", de: "Polen", ro: "Polonia", ru: "Польша" },
      i1_text: { en: "Warehouse, production and logistics roles near Warsaw, Kraków and Wrocław.", uk: "Вакансії на складах, виробництві та в логістиці біля Варшави, Кракова та Вроцлава.", de: "Lager-, Produktions- und Logistikjobs in der Nähe von Warschau, Krakau und Breslau.", ro: "Locuri de muncă în depozite, producție și logistică lângă Varșovia, Cracovia și Wrocław.", ru: "Вакансии на складах, производстве и логистике рядом с Варшавой, Краковом и Вроцлавом." },
      i2_title: { en: "Germany", uk: "Німеччина", de: "Deutschland", ro: "Germania", ru: "Германия" },
      i2_text: { en: "Manufacturing and warehouse positions with some of the highest net wages in the EU.", uk: "Вакансії на виробництві та складах з одними з найвищих чистих зарплат у ЄС.", de: "Produktions- und Lagerpositionen mit einigen der höchsten Nettolöhne der EU.", ro: "Poziții în producție și depozitare cu unele dintre cele mai mari salarii nete din UE.", ru: "Вакансии на производстве и складах с одними из самых высоких чистых зарплат в ЕС." },
      i3_title: { en: "Netherlands", uk: "Нідерланди", de: "Niederlande", ro: "Țările de Jos", ru: "Нидерланды" },
      i3_text: { en: "Greenhouse, food processing and distribution centre jobs with company housing.", uk: "Робота в теплицях, харчовій промисловості та на розподільчих центрах з житлом від роботодавця.", de: "Jobs in Gewächshäusern, Lebensmittelverarbeitung und Verteilzentren mit Firmenunterkunft.", ro: "Locuri de muncă în sere, procesarea alimentelor și centre de distribuție, cu cazare oferită.", ru: "Работа в теплицах, пищевой промышленности и на распределительных центрах с жильём от работодателя." },
      i4_title: { en: "Czechia", uk: "Чехія", de: "Tschechien", ro: "Cehia", ru: "Чехия" },
      i4_text: { en: "Automotive and electronics assembly lines close to the Polish border.", uk: "Складальні лінії автомобільної та електронної промисловості біля польського кордону.", de: "Montagelinien für Automobil und Elektronik nahe der polnischen Grenze.", ro: "Linii de asamblare auto și electronice aproape de granița poloneză.", ru: "Сборочные линии автомобильной и электронной промышленности у польской границы." },
      i5_title: { en: "Lithuania", uk: "Литва", de: "Litauen", ro: "Lituania", ru: "Литва" },
      i5_text: { en: "Fast visa processing and short relocation distance from Ukraine and Belarus.", uk: "Швидке оформлення віз та невелика відстань переїзду з України та Білорусі.", de: "Schnelle Visabearbeitung und kurze Umzugsdistanz aus der Ukraine und Belarus.", ro: "Procesare rapidă a vizelor și distanță scurtă de relocare din Ucraina și Belarus.", ru: "Быстрое оформление виз и небольшое расстояние переезда из Украины и Беларуси." },
      i6_title: { en: "Slovakia", uk: "Словаччина", de: "Slowakei", ro: "Slovacia", ru: "Словакия" },
      i6_text: { en: "Manufacturing roles with simplified work permit procedures.", uk: "Вакансії на виробництві зі спрощеною процедурою оформлення дозволу на роботу.", de: "Fertigungsjobs mit vereinfachten Verfahren für die Arbeitserlaubnis.", ro: "Poziții de producție cu proceduri simplificate pentru permisul de muncă.", ru: "Вакансии на производстве с упрощённой процедурой оформления разрешения на работу." },
    },
    process: {
      eyebrow: { en: "How It Works", uk: "Як це працює", de: "So funktioniert es", ro: "Cum funcționează", ru: "Как это работает" },
      title: { en: "From application to your first day of work — 5 steps", uk: "Від заявки до першого робочого дня — 5 кроків", de: "Von der Bewerbung bis zum ersten Arbeitstag — 5 Schritte", ro: "De la cerere la prima zi de muncă — 5 pași", ru: "От заявки до первого рабочего дня — 5 шагов" },
      s1_t: { en: "Consultation & document check", uk: "Консультація та перевірка документів", de: "Beratung & Dokumentenprüfung", ro: "Consultație și verificarea actelor", ru: "Консультация и проверка документов" },
      s1_d: { en: "We review your profile and explain which countries and roles fit you best.", uk: "Аналізуємо ваш профіль і пояснюємо, які країни та вакансії підходять найкраще.", de: "Wir prüfen Ihr Profil und erklären, welche Länder und Stellen am besten passen.", ro: "Analizăm profilul tău și explicăm ce țări și roluri ți se potrivesc cel mai bine.", ru: "Анализируем ваш профиль и объясняем, какие страны и вакансии подходят лучше всего." },
      s2_t: { en: "Job matching", uk: "Підбір вакансії", de: "Stellenvermittlung", ro: "Potrivirea locului de muncă", ru: "Подбор вакансии" },
      s2_d: { en: "We offer verified vacancies that match your experience and salary expectations.", uk: "Пропонуємо перевірені вакансії відповідно до вашого досвіду й очікуваної зарплати.", de: "Wir bieten geprüfte Stellen, die zu Ihrer Erfahrung und Gehaltsvorstellung passen.", ro: "Oferim locuri de muncă verificate, potrivite experienței și așteptărilor salariale.", ru: "Предлагаем проверенные вакансии, соответствующие вашему опыту и ожидаемой зарплате." },
      s3_t: { en: "Work permit & visa", uk: "Дозвіл на роботу та віза", de: "Arbeitserlaubnis & Visum", ro: "Permis de muncă și viză", ru: "Разрешение на работу и виза" },
      s3_d: { en: "We prepare the invitation and handle the work permit paperwork with the employer.", uk: "Готуємо запрошення та оформлюємо дозвіл на роботу разом з роботодавцем.", de: "Wir bereiten die Einladung vor und erledigen die Arbeitserlaubnis mit dem Arbeitgeber.", ro: "Pregătim invitația și gestionăm actele pentru permisul de muncă împreună cu angajatorul.", ru: "Готовим приглашение и оформляем разрешение на работу вместе с работодателем." },
      s4_t: { en: "Travel & arrival", uk: "Виїзд і поселення", de: "Reise & Ankunft", ro: "Călătorie și sosire", ru: "Выезд и поселение" },
      s4_d: { en: "We arrange transport, border crossing details and your first night's accommodation.", uk: "Організовуємо транспорт, перетин кордону та поселення в перший день.", de: "Wir organisieren den Transport, die Grenzübertrittsdetails und die erste Unterkunft.", ro: "Organizăm transportul, trecerea frontierei și cazarea pentru prima noapte.", ru: "Организуем транспорт, пересечение границы и поселение в первый день." },
      s5_t: { en: "Work & ongoing support", uk: "Робота та супровід", de: "Arbeit & laufende Unterstützung", ro: "Muncă și sprijin continuu", ru: "Работа и сопровождение" },
      s5_d: { en: "A personal manager stays reachable for the full length of your contract.", uk: "Персональний менеджер на зв'язку протягом усього терміну контракту.", de: "Ein persönlicher Betreuer ist während der gesamten Vertragslaufzeit erreichbar.", ro: "Un manager personal rămâne disponibil pe toată durata contractului.", ru: "Персональный менеджер на связи в течение всего срока контракта." },
    },
    testimonials: {
      eyebrow: { en: "Candidate Voices", uk: "Відгуки кандидатів", de: "Stimmen unserer Kandidaten", ro: "Voci ale candidaților", ru: "Отзывы кандидатов" },
      title: { en: "Real people, real jobs, real paychecks", uk: "Реальні люди, реальна робота, реальна зарплата", de: "Echte Menschen, echte Jobs, echter Lohn", ro: "Oameni reali, locuri de muncă reale, salarii reale", ru: "Реальные люди, реальная работа, реальная зарплата" },
      t1: { en: "The contract matched exactly what I signed before leaving. Salary arrived on the same date every month.", uk: "Контракт повністю відповідав тому, що я підписав перед виїздом. Зарплата приходила день у день щомісяця.", de: "Der Vertrag stimmte genau mit dem überein, was ich vor der Abreise unterschrieben hatte. Der Lohn kam jeden Monat pünktlich.", ro: "Contractul a corespuns exact cu ce am semnat înainte de plecare. Salariul a venit la aceeași dată în fiecare lună.", ru: "Контракт полностью совпал с тем, что я подписал перед отъездом. Зарплата приходила день в день каждый месяц." },
      t1_name: { en: "Andriy P.", uk: "Андрій П.", de: "Andrij P.", ro: "Andriy P.", ru: "Андрей П." },
      t1_role: { en: "Warehouse operator, Poland", uk: "Оператор складу, Польща", de: "Lageroperator, Polen", ro: "Operator depozit, Polonia", ru: "Оператор склада, Польша" },
      t2: { en: "My manager answered messages even on weekends during my first month. That mattered more than I expected.", uk: "Мій менеджер відповідав на повідомлення навіть у вихідні протягом першого місяця. Це виявилось важливішим, ніж я думав.", de: "Mein Betreuer antwortete auch am Wochenende in meinem ersten Monat. Das bedeutete mir mehr, als ich erwartet hatte.", ro: "Managerul meu a răspuns la mesaje chiar și în weekend în prima lună. A contat mai mult decât credeam.", ru: "Мой менеджер отвечал на сообщения даже в выходные в первый месяц. Это оказалось важнее, чем я думал." },
      t2_name: { en: "Kateryna M.", uk: "Катерина М.", de: "Kateryna M.", ro: "Kateryna M.", ru: "Екатерина М." },
      t2_role: { en: "Production line worker, Germany", uk: "Робітниця виробничої лінії, Німеччина", de: "Produktionsmitarbeiterin, Deutschland", ro: "Muncitoare pe linia de producție, Germania", ru: "Работница производственной линии, Германия" },
      t3: { en: "Housing was ready before I even landed. No hidden deductions from the salary either.", uk: "Житло було готове ще до мого приїзду. Жодних прихованих відрахувань із зарплати.", de: "Die Unterkunft war fertig, bevor ich überhaupt gelandet bin. Auch keine versteckten Abzüge vom Lohn.", ro: "Cazarea era gata chiar înainte să aterizez. Nici deduceri ascunse din salariu.", ru: "Жильё было готово ещё до моего приезда. Никаких скрытых вычетов из зарплаты." },
      t3_name: { en: "Oleh S.", uk: "Олег С.", de: "Oleh S.", ro: "Oleh S.", ru: "Олег С." },
      t3_role: { en: "Logistics associate, Netherlands", uk: "Співробітник логістики, Нідерланди", de: "Logistikmitarbeiter, Niederlande", ro: "Asociat logistică, Țările de Jos", ru: "Сотрудник логистики, Нидерланды" },
    },
    faq: {
      eyebrow: { en: "FAQ", uk: "Часті питання", de: "FAQ", ro: "Întrebări frecvente", ru: "Частые вопросы" },
      title: { en: "Questions we hear often", uk: "Питання, які нам ставлять часто", de: "Häufig gestellte Fragen", ro: "Întrebări frecvente", ru: "Вопросы, которые нам часто задают" },
      q1: { en: "Is the employment fully legal?", uk: "Чи повністю легальне працевлаштування?", de: "Ist die Beschäftigung vollständig legal?", ro: "Este angajarea pe deplin legală?", ru: "Полностью ли легально трудоустройство?" },
      a1: { en: "Yes. Every vacancy comes with a written contract, a registered work permit and an employer we've personally verified before publishing the listing.", uk: "Так. Кожна вакансія має письмовий контракт, оформлений дозвіл на роботу та роботодавця, якого ми особисто перевірили перед публікацією.", de: "Ja. Jede Stelle umfasst einen schriftlichen Vertrag, eine registrierte Arbeitserlaubnis und einen Arbeitgeber, den wir vor der Veröffentlichung persönlich geprüft haben.", ro: "Da. Fiecare loc de muncă vine cu un contract scris, un permis de muncă înregistrat și un angajator pe care l-am verificat personal înainte de publicare.", ru: "Да. Каждая вакансия включает письменный контракт, оформленное разрешение на работу и работодателя, которого мы лично проверили перед публикацией." },
      q2: { en: "Do I need to speak the local language?", uk: "Чи потрібно знати мову країни?", de: "Muss ich die Landessprache sprechen?", ro: "Trebuie să vorbesc limba locală?", ru: "Нужно ли знать язык страны?" },
      a2: { en: "Most warehouse and production roles require only basic instructions, often given in English or Russian/Ukrainian by a team lead. Language requirements are listed on every vacancy.", uk: "Більшість вакансій на складі чи виробництві вимагають лише базового розуміння інструкцій, часто англійською або російською/українською від бригадира. Мовні вимоги вказані на кожній вакансії.", de: "Die meisten Lager- und Produktionsjobs erfordern nur grundlegende Anweisungen, oft auf Englisch oder Russisch/Ukrainisch von einem Teamleiter. Sprachanforderungen stehen bei jeder Stelle.", ro: "Majoritatea rolurilor din depozit sau producție necesită doar instrucțiuni de bază, adesea în engleză sau rusă/ucraineană de la un șef de echipă. Cerințele de limbă sunt indicate la fiecare loc de muncă.", ru: "Большинство вакансий на складе или производстве требуют лишь базового понимания инструкций, часто на английском или русском/украинском от бригадира. Языковые требования указаны в каждой вакансии." },
      q3: { en: "Who pays for the trip and the first accommodation?", uk: "Хто оплачує проїзд і перше поселення?", de: "Wer bezahlt die Reise und die erste Unterkunft?", ro: "Cine plătește călătoria și prima cazare?", ru: "Кто оплачивает проезд и первое поселение?" },
      a3: { en: "It depends on the specific vacancy — many employers cover travel costs or reimburse them after the trial period. This is always stated clearly before you accept an offer.", uk: "Залежить від конкретної вакансії — багато роботодавців покривають проїзд або компенсують його після випробувального терміну. Це завжди чітко вказано ще до того, як ви приймете пропозицію.", de: "Das hängt von der jeweiligen Stelle ab — viele Arbeitgeber übernehmen die Reisekosten oder erstatten sie nach der Probezeit. Dies wird immer klar angegeben, bevor Sie ein Angebot annehmen.", ro: "Depinde de locul de muncă specific — mulți angajatori acoperă costurile călătoriei sau le rambursează după perioada de probă. Acest lucru este mereu specificat clar înainte să accepți oferta.", ru: "Зависит от конкретной вакансии — многие работодатели покрывают проезд или компенсируют его после испытательного срока. Это всегда чётко указывается ещё до принятия предложения." },
      q4: { en: "What if something goes wrong with the employer?", uk: "Що робити, якщо виникнуть проблеми з роботодавцем?", de: "Was, wenn es Probleme mit dem Arbeitgeber gibt?", ro: "Ce se întâmplă dacă apar probleme cu angajatorul?", ru: "Что делать, если возникнут проблемы с работодателем?" },
      a4: { en: "Your personal manager stays reachable for the full length of your contract and will step in directly with the employer on your behalf.", uk: "Ваш персональний менеджер на зв'язку протягом усього терміну контракту й безпосередньо втручається у спілкування з роботодавцем від вашого імені.", de: "Ihr persönlicher Betreuer ist während der gesamten Vertragslaufzeit erreichbar und tritt direkt in Ihrem Namen mit dem Arbeitgeber in Kontakt.", ro: "Managerul tău personal rămâne disponibil pe toată durata contractului și intervine direct pe lângă angajator în numele tău.", ru: "Ваш персональный менеджер на связи в течение всего срока контракта и напрямую вмешивается в общение с работодателем от вашего имени." },
    },
    formSection: {
      eyebrow: { en: "Get Started", uk: "Почніть зараз", de: "Jetzt starten", ro: "Începe acum", ru: "Начните сейчас" },
      title: { en: "Leave a request — we'll match a vacancy for you", uk: "Залиште заявку — ми підберемо вакансію", de: "Hinterlassen Sie eine Anfrage — wir finden eine passende Stelle", ro: "Lasă o cerere — îți găsim un loc de muncă", ru: "Оставьте заявку — мы подберём вакансию" },
      text: { en: "Share a few details and a personal manager will call you back within 15 minutes during business hours.", uk: "Залиште кілька деталей — і персональний менеджер зателефонує вам протягом 15 хвилин у робочий час.", de: "Teilen Sie ein paar Details mit — ein persönlicher Betreuer ruft Sie innerhalb von 15 Minuten während der Geschäftszeiten zurück.", ro: "Trimite câteva detalii — un manager personal te va suna înapoi în 15 minute, în timpul programului.", ru: "Оставьте несколько деталей — персональный менеджер перезвонит вам в течение 15 минут в рабочее время." },
      name: { en: "Full name", uk: "Повне ім'я", de: "Vollständiger Name", ro: "Nume complet", ru: "Полное имя" },
      company: { en: "Preferred country", uk: "Бажана країна", de: "Bevorzugtes Land", ro: "Țara preferată", ru: "Предпочитаемая страна" },
      phone: { en: "Phone", uk: "Телефон", de: "Telefon", ro: "Telefon", ru: "Телефон" },
      email: { en: "Email", uk: "Ел. пошта", de: "E-Mail", ro: "Email", ru: "Эл. почта" },
      message: { en: "What kind of work are you looking for?", uk: "Яку роботу ви шукаєте?", de: "Welche Art von Arbeit suchen Sie?", ro: "Ce fel de muncă cauți?", ru: "Какую работу вы ищете?" },
      submit: { en: "Send request", uk: "Надіслати заявку", de: "Anfrage senden", ro: "Trimite cererea", ru: "Отправить заявку" },
      required: { en: "This field is required", uk: "Це поле обов'язкове", de: "Dieses Feld ist erforderlich", ro: "Acest câmp este obligatoriu", ru: "Это поле обязательно" },
      contact_required: { en: "Enter a phone or an email", uk: "Вкажіть телефон або ел. пошту", de: "Geben Sie eine Telefonnummer oder E-Mail an", ro: "Introduceți un telefon sau un email", ru: "Укажите телефон или эл. почту" },
      privacy: { en: "By submitting, you agree to our", uk: "Надсилаючи форму, ви погоджуєтесь з нашою", de: "Mit dem Absenden stimmen Sie unserer", ro: "Prin trimitere, sunteți de acord cu", ru: "Отправляя форму, вы соглашаетесь с нашей" },
      privacy_link: { en: "Privacy Policy", uk: "Політикою конфіденційності", de: "Datenschutzerklärung zu", ro: "Politica de confidențialitate", ru: "Политикой конфиденциальности" },
    },
    footer: {
      tagline: { en: "Licensed employment agency for legal work across Europe.", uk: "Ліцензована агенція легального працевлаштування в Європі.", de: "Lizenzierte Personalvermittlung für legale Arbeit in ganz Europa.", ro: "Agenție de recrutare licențiată pentru muncă legală în Europa.", ru: "Лицензированное агентство легального трудоустройства в Европе." },
      col1: { en: "Company", uk: "Компанія", de: "Unternehmen", ro: "Companie", ru: "Компания" },
      col2: { en: "Services", uk: "Послуги", de: "Leistungen", ro: "Servicii", ru: "Услуги" },
      col3: { en: "Contact", uk: "Контакти", de: "Kontakt", ro: "Contact", ru: "Контакты" },
      about: { en: "About TEPIA", uk: "Про TEPIA", de: "Über TEPIA", ro: "Despre TEPIA", ru: "О TEPIA" },
      blog: { en: "Guides", uk: "Блог", de: "Ratgeber", ro: "Articole", ru: "Блог" },
      careers: { en: "Open vacancies", uk: "Актуальні вакансії", de: "Offene Stellen", ro: "Locuri de muncă disponibile", ru: "Актуальные вакансии" },
      privacy: { en: "Privacy Policy", uk: "Конфіденційність", de: "Datenschutz", ro: "Confidențialitate", ru: "Конфиденциальность" },
      s1: { en: "Job placement", uk: "Підбір вакансій", de: "Stellenvermittlung", ro: "Plasare la muncă", ru: "Подбор вакансий" },
      s2: { en: "Work permit & visa support", uk: "Оформлення дозволу на роботу та візи", de: "Arbeitserlaubnis- & Visa-Support", ro: "Suport permis de muncă și viză", ru: "Оформление разрешения на работу и визы" },
      s3: { en: "Housing assistance", uk: "Допомога з житлом", de: "Unterkunftshilfe", ro: "Asistență cazare", ru: "Помощь с жильём" },
      s4: { en: "Staff outsourcing for employers", uk: "Аутсорсинг персоналу для роботодавців", de: "Personal-Outsourcing für Arbeitgeber", ro: "Externalizare personal pentru angajatori", ru: "Аутсорсинг персонала для работодателей" },
      rights: { en: "All rights reserved.", uk: "Всі права захищені.", de: "Alle Rechte vorbehalten.", ro: "Toate drepturile rezervate.", ru: "Все права защищены." },
    },
    about: {
      eyebrow: { en: "About TEPIA", uk: "Про TEPIA", de: "Über TEPIA", ro: "Despre TEPIA", ru: "О TEPIA" },
      title: { en: "12 years of getting people to work safely, legally, on time.", uk: "12 років допомагаємо людям виїжджати на роботу безпечно, легально й вчасно.", de: "12 Jahre lang bringen wir Menschen sicher, legal und pünktlich zur Arbeit.", ro: "12 ani în care ajutăm oamenii să plece la muncă în siguranță, legal și la timp.", ru: "12 лет помогаем людям выезжать на работу безопасно, легально и вовремя." },
      lede: { en: "TEPIA GROUP sp. z o.o. is a licensed employment agency headquartered in Warsaw, registered with the Marshal's Office of the Mazovia Voivodeship (KRAZ no. 00000/2014).", uk: "TEPIA GROUP sp. z o.o. — ліцензована агенція з працевлаштування зі штаб-квартирою у Варшаві, зареєстрована в реєстрі агенцій зайнятості Мазовецького воєводства (KRAZ № 00000/2014).", de: "TEPIA GROUP sp. z o.o. ist eine lizenzierte Personalvermittlung mit Hauptsitz in Warschau, registriert beim Marschallamt der Woiwodschaft Masowien (KRAZ-Nr. 00000/2014).", ro: "TEPIA GROUP sp. z o.o. este o agenție de recrutare licențiată cu sediul la Varșovia, înregistrată la Oficiul Mareșalului Voievodatului Mazovia (KRAZ nr. 00000/2014).", ru: "TEPIA GROUP sp. z o.o. — лицензированное агентство по трудоустройству со штаб-квартирой в Варшаве, зарегистрированное в реестре агентств занятости Мазовецкого воеводства (KRAZ № 00000/2014)." },
      story_h: { en: "Our story", uk: "Наша історія", de: "Unsere Geschichte", ro: "Povestea noastră", ru: "Наша история" },
      story_p1: { en: "TEPIA started with staffing three warehouses near Warsaw. Today we work with over 120 verified employers in 9 countries and support candidates from Ukraine, Belarus and beyond.", uk: "TEPIA почала з укомплектування трьох складів під Варшавою. Сьогодні ми співпрацюємо з понад 120 перевіреними роботодавцями у 9 країнах і підтримуємо кандидатів з України, Білорусі та інших країн.", de: "TEPIA begann mit der Personalbesetzung von drei Lagerhäusern bei Warschau. Heute arbeiten wir mit über 120 geprüften Arbeitgebern in 9 Ländern und unterstützen Kandidaten aus der Ukraine, Belarus und darüber hinaus.", ro: "TEPIA a început cu recrutarea personalului pentru trei depozite lângă Varșovia. Astăzi colaborăm cu peste 120 de angajatori verificați în 9 țări și sprijinim candidați din Ucraina, Belarus și alte țări.", ru: "TEPIA начала с укомплектования трёх складов под Варшавой. Сегодня мы сотрудничаем с более чем 120 проверенными работодателями в 9 странах и поддерживаем кандидатов из Украины, Беларуси и других стран." },
      story_p2: { en: "We learned early that people need more than a job listing — they need a guarantee that the contract is real, the housing exists, and the salary shows up on time. Every vacancy is checked in person before it goes on the site.", uk: "Ми рано зрозуміли: людям потрібна не просто вакансія — їм потрібна гарантія, що контракт справжній, житло існує, а зарплата приходить вчасно. Кожну вакансію ми перевіряємо особисто, перш ніж опублікувати.", de: "Wir haben früh gelernt, dass Menschen mehr brauchen als eine Stellenanzeige — sie brauchen die Garantie, dass der Vertrag echt ist, die Unterkunft existiert und der Lohn pünktlich kommt. Jede Stelle wird persönlich geprüft, bevor sie online geht.", ro: "Am învățat devreme că oamenii au nevoie de mai mult decât un anunț de angajare — au nevoie de garanția că contractul e real, cazarea există și salariul vine la timp. Fiecare loc de muncă este verificat personal înainte de publicare.", ru: "Мы рано поняли: людям нужна не просто вакансия — им нужна гарантия, что контракт настоящий, жильё существует, а зарплата приходит вовремя. Каждую вакансию мы проверяем лично перед публикацией." },
      values_eyebrow: { en: "What Our Trust Is Built On", uk: "На чому базується наша довіра", de: "Worauf unser Vertrauen basiert", ro: "Pe ce se bazează încrederea noastră", ru: "На чём строится наше доверие" },
      values_title: { en: "Three commitments we don't compromise on", uk: "Три принципи, якими ми не жертвуємо", de: "Drei Grundsätze, bei denen wir keine Kompromisse machen", ro: "Trei angajamente de la care nu ne abatem", ru: "Три принципа, которыми мы не жертвуем" },
      v1_t: { en: "Only legal contracts", uk: "Лише легальні контракти", de: "Nur legale Verträge", ro: "Doar contracte legale", ru: "Только легальные контракты" },
      v1_d: { en: "Verified employers and registered work permits — no shady schemes, ever.", uk: "Перевірені роботодавці та оформлені дозволи на роботу — без жодних сірих схем.", de: "Geprüfte Arbeitgeber und registrierte Arbeitserlaubnisse — niemals fragwürdige Schemata.", ro: "Angajatori verificați și permise de muncă înregistrate — fără scheme dubioase, niciodată.", ru: "Проверенные работодатели и оформленные разрешения на работу — никаких серых схем." },
      v2_t: { en: "Everything fixed in writing", uk: "Все зафіксовано письмово", de: "Alles schriftlich festgehalten", ro: "Totul consemnat în scris", ru: "Всё зафиксировано письменно" },
      v2_d: { en: "Salary, housing and schedule are agreed in the contract before you travel.", uk: "Зарплата, житло й графік узгоджуються в контракті ще до виїзду.", de: "Lohn, Unterkunft und Zeitplan werden im Vertrag vor der Abreise vereinbart.", ro: "Salariul, cazarea și programul sunt convenite în contract înainte de plecare.", ru: "Зарплата, жильё и график согласовываются в контракте ещё до выезда." },
      v3_t: { en: "A manager for the whole contract", uk: "Менеджер на весь термін контракту", de: "Ein Betreuer für die gesamte Vertragslaufzeit", ro: "Un manager pe toată durata contractului", ru: "Менеджер на весь срок контракта" },
      v3_d: { en: "Your personal manager stays reachable for as long as your contract runs.", uk: "Ваш персональний менеджер на зв'язку протягом усього терміну контракту.", de: "Ihr persönlicher Betreuer ist so lange erreichbar, wie Ihr Vertrag läuft.", ro: "Managerul tău personal rămâne disponibil pe toată durata contractului.", ru: "Ваш персональный менеджер на связи в течение всего срока контракта." },
      team_eyebrow: { en: "Who Guides You", uk: "Хто вас супроводжує", de: "Wer Sie begleitet", ro: "Cine te ghidează", ru: "Кто вас сопровождает" },
      team_title: { en: "The people behind every placement", uk: "Люди, які стоять за кожним працевлаштуванням", de: "Die Menschen hinter jeder Vermittlung", ro: "Oamenii din spatele fiecărei plasări", ru: "Люди, стоящие за каждым трудоустройством" },
      p1_name: { en: "Aleksandra Nowak", uk: "Александра Новак", de: "Aleksandra Nowak", ro: "Aleksandra Nowak", ru: "Александра Новак" },
      p1_role: { en: "Head of Recruitment", uk: "Керівниця відділу підбору персоналу", de: "Leiterin Personalvermittlung", ro: "Șefa departamentului de recrutare", ru: "Руководитель отдела подбора персонала" },
      p2_name: { en: "Marek Kowalski", uk: "Марек Ковальський", de: "Marek Kowalski", ro: "Marek Kowalski", ru: "Марек Ковальски" },
      p2_role: { en: "Work Permit Specialist", uk: "Спеціаліст з оформлення дозволів на роботу", de: "Spezialist für Arbeitserlaubnisse", ro: "Specialist permise de muncă", ru: "Специалист по оформлению разрешений на работу" },
      p3_name: { en: "Julia Wiśniewska", uk: "Юлія Вишнєвська", de: "Julia Wiśniewska", ro: "Julia Wiśniewska", ru: "Юлия Вишневская" },
      p3_role: { en: "Candidate Support Manager", uk: "Менеджерка з супроводу кандидатів", de: "Kandidaten-Support-Managerin", ro: "Manager suport candidați", ru: "Менеджер по сопровождению кандидатов" },
      licenses_eyebrow: { en: "Official Documents", uk: "Офіційні документи", de: "Offizielle Dokumente", ro: "Documente oficiale", ru: "Официальные документы" },
      licenses_title: { en: "Licenses & recognitions", uk: "Ліцензії та нагороди", de: "Lizenzen & Auszeichnungen", ro: "Licențe și recunoașteri", ru: "Лицензии и награды" },
      l1: { en: "Employment agency license, Marshal's Office of Mazovia — KRAZ no. 00000/2014", uk: "Ліцензія агенції зайнятості, Мазовецьке воєводське управління — KRAZ № 00000/2014", de: "Lizenz als Personalvermittlung, Marschallamt Masowien — KRAZ-Nr. 00000/2014", ro: "Licență agenție de ocupare, Oficiul Mareșalului Mazovia — KRAZ nr. 00000/2014", ru: "Лицензия агентства занятости, Мазовецкое воеводское управление — KRAZ № 00000/2014" },
      l2: { en: "Member, Polish Personnel Agencies Association (PZAP)", uk: "Член Польської асоціації кадрових агентств (PZAP)", de: "Mitglied im polnischen Personalagenturen-Verband (PZAP)", ro: "Membru al Asociației Poloneze a Agențiilor de Personal (PZAP)", ru: "Член Польской ассоциации кадровых агентств (PZAP)" },
      l3: { en: "\"Employer of Trust\" industry recognition, 2025", uk: "Галузеве визнання «Роботодавець довіри», 2025", de: "Branchenauszeichnung „Vertrauenswürdiger Arbeitgeber\", 2025", ro: "Recunoaștere de industrie „Angajator de încredere\", 2025", ru: "Отраслевое признание «Работодатель доверия», 2025" },
      l4: { en: "GDPR-aligned candidate data processing since 2018", uk: "Обробка даних кандидатів відповідно до GDPR з 2018 року", de: "DSGVO-konforme Verarbeitung von Kandidatendaten seit 2018", ro: "Procesare a datelor candidaților conformă GDPR din 2018", ru: "Обработка данных кандидатов согласно GDPR с 2018 года" },
    },
    contactsPage: {
      eyebrow: { en: "Contact", uk: "Контакти", de: "Kontakt", ro: "Contact", ru: "Контакты" },
      title: { en: "Ready to start your path to Europe?", uk: "Готові розпочати свій шлях до Європи?", de: "Bereit für Ihren Weg nach Europa?", ro: "Ești gata să îți începi drumul spre Europa?", ru: "Готовы начать свой путь в Европу?" },
      offices_eyebrow: { en: "Offices", uk: "Офіси", de: "Standorte", ro: "Birouri", ru: "Офисы" },
      o1_city: { en: "Warsaw (HQ)", uk: "Варшава (штаб-квартира)", de: "Warschau (Hauptsitz)", ro: "Varșovia (sediu central)", ru: "Варшава (штаб-квартира)" },
      o1_addr: { en: "ul. Złota 44, 00-120 Warszawa, Poland", uk: "вул. Злота 44, 00-120 Варшава, Польща", de: "ul. Złota 44, 00-120 Warschau, Polen", ro: "str. Złota 44, 00-120 Varșovia, Polonia", ru: "ул. Злота 44, 00-120 Варшава, Польша" },
      o2_city: { en: "Wrocław", uk: "Вроцлав", de: "Breslau", ro: "Wrocław", ru: "Вроцлав" },
      o2_addr: { en: "ul. Powstańców Śląskich 7a, 53-332 Wrocław, Poland", uk: "вул. Повстанців Шльонських 7a, 53-332 Вроцлав, Польща", de: "ul. Powstańców Śląskich 7a, 53-332 Breslau, Polen", ro: "str. Powstańców Śląskich 7a, 53-332 Wrocław, Polonia", ru: "ул. Повстанцев Шлёнских 7a, 53-332 Вроцлав, Польша" },
      o3_city: { en: "Kraków", uk: "Краків", de: "Krakau", ro: "Cracovia", ru: "Краков" },
      o3_addr: { en: "ul. Karmelicka 20, 31-128 Kraków, Poland", uk: "вул. Кармелицька 20, 31-128 Краків, Польща", de: "ul. Karmelicka 20, 31-128 Krakau, Polen", ro: "str. Karmelicka 20, 31-128 Cracovia, Polonia", ru: "ул. Кармелицка 20, 31-128 Краков, Польша" },
    },
    vacPage: {
      eyebrow: { en: "Vacancies", uk: "Вакансії", de: "Stellenangebote", ro: "Locuri de muncă", ru: "Вакансии" },
      title: { en: "Current verified vacancies", uk: "Актуальні перевірені вакансії", de: "Aktuelle geprüfte Stellen", ro: "Locuri de muncă verificate disponibile", ru: "Актуальные проверенные вакансии" },
      search_ph: { en: "Search by title or keyword", uk: "Пошук за назвою чи ключовим словом", de: "Suche nach Titel oder Stichwort", ro: "Caută după titlu sau cuvânt cheie", ru: "Поиск по названию или ключевому слову" },
      all: { en: "All countries", uk: "Усі країни", de: "Alle Länder", ro: "Toate țările", ru: "Все страны" },
      hot: { en: "Urgent", uk: "Терміново", de: "Dringend", ro: "Urgent", ru: "Срочно" },
      apply: { en: "View & apply", uk: "Переглянути й відгукнутись", de: "Ansehen & bewerben", ro: "Vezi și aplică", ru: "Смотреть и откликнуться" },
      subs_title: { en: "Get new vacancies by email", uk: "Отримуйте нові вакансії на пошту", de: "Neue Stellen per E-Mail erhalten", ro: "Primește locuri de muncă noi pe email", ru: "Получайте новые вакансии на почту" },
      subs_text: { en: "One email whenever a new verified vacancy opens in your country of interest.", uk: "Один лист щоразу, коли відкривається нова перевірена вакансія у вашій країні.", de: "Eine E-Mail, sobald eine neue geprüfte Stelle in Ihrem Wunschland entsteht.", ro: "Un email de fiecare dată când apare un loc de muncă verificat în țara ta de interes.", ru: "Одно письмо, когда открывается новая проверенная вакансия в вашей стране." },
      subs_btn: { en: "Subscribe", uk: "Підписатись", de: "Abonnieren", ro: "Abonează-te", ru: "Подписаться" },
    },
    vacDetail: {
      badge: { en: "Verified Vacancy", uk: "Перевірена вакансія", de: "Geprüfte Stelle", ro: "Loc de muncă verificat", ru: "Проверенная вакансия" },
      title: { en: "Warehouse Packer", uk: "Пакувальник на складі", de: "Lagerpacker", ro: "Ambalator în depozit", ru: "Упаковщик на складе" },
      loc: { en: "Wrocław, Poland · Full-time", uk: "Вроцлав, Польща · Повна зайнятість", de: "Breslau, Polen · Vollzeit", ro: "Wrocław, Polonia · Normă întreagă", ru: "Вроцлав, Польша · Полная занятость" },
      about_h: { en: "About the vacancy", uk: "Про вакансію", de: "Über die Stelle", ro: "Despre locul de muncă", ru: "О вакансии" },
      about_p: { en: "Our partner, a logistics operator near Wrocław, is hiring warehouse packers for a two-shift schedule. Free onboarding, company housing available from day one, salary paid on the 10th of each month.", uk: "Наш партнер, логістичний оператор під Вроцлавом, набирає пакувальників на складі на двозмінний графік. Безкоштовне навчання, житло від компанії з першого дня, зарплата виплачується 10 числа щомісяця.", de: "Unser Partner, ein Logistikbetreiber bei Breslau, sucht Lagerpacker für einen Zweischicht-Zeitplan. Kostenlose Einarbeitung, Firmenunterkunft ab dem ersten Tag, Lohnzahlung am 10. jedes Monats.", ro: "Partenerul nostru, un operator logistic lângă Wrocław, angajează ambalatori de depozit pentru un program în două schimburi. Instruire gratuită, cazare de la companie din prima zi, salariu plătit pe data de 10 a fiecărei luni.", ru: "Наш партнёр, логистический оператор под Вроцлавом, набирает упаковщиков на склад на двухсменный график. Бесплатное обучение, жильё от компании с первого дня, зарплата выплачивается 10 числа каждого месяца." },
      req_h: { en: "Requirements", uk: "Вимоги", de: "Anforderungen", ro: "Cerințe", ru: "Требования" },
      r1: { en: "18+ years old, valid biometric passport", uk: "18+ років, дійсний біометричний паспорт", de: "18+ Jahre, gültiger biometrischer Reisepass", ro: "18+ ani, pașaport biometric valabil", ru: "18+ лет, действующий биометрический паспорт" },
      r2: { en: "No warehouse experience required — training provided on site", uk: "Досвід на складі не обов'язковий — навчання на місці", de: "Keine Lagererfahrung erforderlich — Einarbeitung vor Ort", ro: "Nu este necesară experiență de depozit — instruire la fața locului", ru: "Опыт работы на складе не обязателен — обучение на месте" },
      r3: { en: "Able to stand and lift up to 15 kg during a shift", uk: "Здатність стояти та піднімати до 15 кг протягом зміни", de: "Fähigkeit, während einer Schicht zu stehen und bis zu 15 kg zu heben", ro: "Capacitate de a sta în picioare și de a ridica până la 15 kg în timpul unui schimb", ru: "Способность стоять и поднимать до 15 кг в течение смены" },
      r4: { en: "Basic English or Polish helpful, not required", uk: "Базова англійська чи польська — перевага, але не обов'язково", de: "Grundkenntnisse in Englisch oder Polnisch von Vorteil, nicht erforderlich", ro: "Engleza sau poloneza de bază este un avantaj, nu o cerință", ru: "Базовый английский или польский — преимущество, но не обязательно" },
      apply_h: { en: "Apply now", uk: "Відгукнутись зараз", de: "Jetzt bewerben", ro: "Aplică acum", ru: "Откликнуться сейчас" },
      cv: { en: "Attach passport scan or CV (PDF)", uk: "Прикріпити скан паспорта або резюме (PDF)", de: "Reisepass-Scan oder Lebenslauf anhängen (PDF)", ro: "Atașează scanarea pașaportului sau CV-ul (PDF)", ru: "Прикрепить скан паспорта или резюме (PDF)" },
    },
    blogPage: {
      eyebrow: { en: "Guides", uk: "Блог", de: "Ratgeber", ro: "Articole", ru: "Блог" },
      title: { en: "Practical guides before you go", uk: "Практичні поради перед виїздом", de: "Praktische Ratgeber vor der Ausreise", ro: "Ghiduri practice înainte de plecare", ru: "Практические советы перед выездом" },
      read: { en: "Read guide", uk: "Читати", de: "Ratgeber lesen", ro: "Citește ghidul", ru: "Читать" },
      a1_date: { en: "March 2026", uk: "Березень 2026", de: "März 2026", ro: "Martie 2026", ru: "Март 2026" },
      a1_t: { en: "How to get a Polish work permit in 2026", uk: "Як оформити дозвіл на роботу в Польщі у 2026 році", de: "Wie man 2026 eine polnische Arbeitserlaubnis bekommt", ro: "Cum obții un permis de muncă în Polonia în 2026", ru: "Как оформить разрешение на работу в Польше в 2026 году" },
      a1_e: { en: "The paperwork checklist, typical processing time and the most common mistakes to avoid.", uk: "Чек-лист документів, типові терміни оформлення й найпоширеніші помилки.", de: "Die Dokumenten-Checkliste, typische Bearbeitungszeit und häufigste Fehler.", ro: "Lista de acte, timpul tipic de procesare și cele mai comune greșeli de evitat.", ru: "Чек-лист документов, типичные сроки оформления и самые частые ошибки." },
      a2_date: { en: "February 2026", uk: "Лютий 2026", de: "Februar 2026", ro: "Februarie 2026", ru: "Февраль 2026" },
      a2_t: { en: "Ten questions to ask before accepting a job offer abroad", uk: "Десять питань, які варто поставити перед прийняттям пропозиції за кордоном", de: "Zehn Fragen vor der Annahme eines Jobangebots im Ausland", ro: "Zece întrebări de pus înainte de a accepta o ofertă de muncă în străinătate", ru: "Десять вопросов перед принятием предложения о работе за границей" },
      a2_e: { en: "How to spot a legitimate contract before you sign anything.", uk: "Як розпізнати легітимний контракт, перш ніж щось підписувати.", de: "Wie man einen seriösen Vertrag erkennt, bevor man etwas unterschreibt.", ro: "Cum recunoști un contract legitim înainte de a semna ceva.", ru: "Как распознать легитимный контракт, прежде чем что-то подписывать." },
      a3_date: { en: "January 2026", uk: "Січень 2026", de: "Januar 2026", ro: "Ianuarie 2026", ru: "Январь 2026" },
      a3_t: { en: "Germany vs Netherlands: comparing net pay and living costs", uk: "Німеччина проти Нідерландів: порівнюємо чисту зарплату й вартість життя", de: "Deutschland vs. Niederlande: Nettolohn und Lebenshaltungskosten im Vergleich", ro: "Germania vs Țările de Jos: comparăm salariul net și costul vieții", ru: "Германия против Нидерландов: сравниваем чистую зарплату и стоимость жизни" },
      a3_e: { en: "A side-by-side look at what actually lands in your bank account each month.", uk: "Порівняння того, що насправді приходить на ваш рахунок щомісяця.", de: "Ein direkter Vergleich, was tatsächlich jeden Monat auf Ihrem Konto landet.", ro: "O comparație directă a ceea ce ajunge cu adevărat în contul tău în fiecare lună.", ru: "Прямое сравнение того, что реально приходит на ваш счёт каждый месяц." },
    },
    employersPage: {
      eyebrow: { en: "For Employers", uk: "Роботодавцям", de: "Für Arbeitgeber", ro: "Pentru angajatori", ru: "Работодателям" },
      title: { en: "Verified staff, delivered on schedule", uk: "Перевірений персонал вчасно", de: "Geprüftes Personal, pünktlich geliefert", ro: "Personal verificat, livrat la timp", ru: "Проверенный персонал вовремя" },
      lede: { en: "Tell us your staffing needs. We'll come back with a sourcing plan, timeline and cost per hire within two business days.", uk: "Розкажіть про потребу в персоналі. Ми повернемось із планом підбору, термінами та вартістю протягом двох робочих днів.", de: "Teilen Sie uns Ihren Personalbedarf mit. Wir melden uns innerhalb von zwei Werktagen mit einem Beschaffungsplan, Zeitplan und Kosten pro Einstellung.", ro: "Spune-ne nevoile tale de personal. Revenim cu un plan de recrutare, un calendar și costul per angajare în două zile lucrătoare.", ru: "Расскажите о потребности в персонале. Мы вернёмся с планом подбора, сроками и стоимостью в течение двух рабочих дней." },
      role_title: { en: "Position title", uk: "Назва позиції", de: "Positionstitel", ro: "Titlul poziției", ru: "Название позиции" },
      seniority: { en: "Number of positions", uk: "Кількість позицій", de: "Anzahl der Stellen", ro: "Numărul de poziții", ru: "Количество позиций" },
      timeline: { en: "Needed by", uk: "Потрібно до", de: "Benötigt bis", ro: "Necesar până la", ru: "Требуется до" },
      guarantee_h: { en: "Replacement guarantee", uk: "Гарантія заміни", de: "Ersatzgarantie", ro: "Garanție de înlocuire", ru: "Гарантия замены" },
      guarantee_d: { en: "If a placed worker leaves within the trial period, we replace them at no additional cost.", uk: "Якщо працевлаштований співробітник звільниться протягом випробувального терміну, ми замінимо його безкоштовно.", de: "Wenn ein vermittelter Mitarbeiter innerhalb der Probezeit kündigt, ersetzen wir ihn ohne zusätzliche Kosten.", ro: "Dacă un angajat plasat pleacă în perioada de probă, îl înlocuim fără costuri suplimentare.", ru: "Если трудоустроенный сотрудник уволится в течение испытательного срока, мы заменим его бесплатно." },
    },
    thanks: {
      title: { en: "Thank you — your request is in.", uk: "Дякуємо — вашу заявку отримано.", de: "Danke — Ihre Anfrage ist eingegangen.", ro: "Mulțumim — cererea ta a fost primită.", ru: "Спасибо — ваша заявка получена." },
      text: { en: "A personal manager from TEPIA GROUP will call you back within 15 minutes during business hours.", uk: "Персональний менеджер TEPIA GROUP зателефонує вам протягом 15 хвилин у робочий час.", de: "Ein persönlicher Betreuer von TEPIA GROUP ruft Sie innerhalb von 15 Minuten während der Geschäftszeiten zurück.", ro: "Un manager personal de la TEPIA GROUP te va suna înapoi în 15 minute, în timpul programului.", ru: "Персональный менеджер TEPIA GROUP перезвонит вам в течение 15 минут в рабочее время." },
      back: { en: "Back to homepage", uk: "На головну сторінку", de: "Zur Startseite", ro: "Înapoi la pagina principală", ru: "На главную страницу" },
    },
    cookie: {
      text: { en: "We use cookies to improve your experience and for analytics. See our", uk: "Ми використовуємо файли cookie для покращення роботи сайту та аналітики. Див.", de: "Wir verwenden Cookies, um Ihr Erlebnis zu verbessern und für Analysen. Siehe unsere", ro: "Folosim cookie-uri pentru a îmbunătăți experiența și pentru analiză. Vezi", ru: "Мы используем файлы cookie для улучшения работы сайта и аналитики. См." },
      link: { en: "Privacy Policy", uk: "Політику конфіденційності", de: "Datenschutzerklärung", ro: "Politica de confidențialitate", ru: "Политику конфиденциальности" },
      accept: { en: "Accept", uk: "Прийняти", de: "Akzeptieren", ro: "Accept", ru: "Принять" },
      decline: { en: "Decline", uk: "Відхилити", de: "Ablehnen", ro: "Refuz", ru: "Отклонить" },
    },
  };

  function get(path, lang) {
    const parts = path.split(".");
    let node = DICT;
    for (const p of parts) {
      if (!node[p]) return null;
      node = node[p];
    }
    return node[lang] || node[DEFAULT_LANG] || "";
  }

  function currentLang() {
    return localStorage.getItem("tepia_lang") || DEFAULT_LANG;
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = get(key, lang);
      if (val) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = get(key, lang);
      if (val) el.setAttribute("placeholder", val);
    });
    document.querySelectorAll(".lang-current").forEach((el) => {
      const meta = LANGS.find((l) => l.code === lang);
      if (meta) el.textContent = meta.short;
    });
    document.querySelectorAll(".lang-menu button").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    document.querySelectorAll("[data-i18n-lang]").forEach((el) => {
      el.style.display = el.getAttribute("data-i18n-lang") === lang ? "" : "none";
    });
    localStorage.setItem("tepia_lang", lang);
  }

  function buildLangMenu() {
    document.querySelectorAll(".lang-menu").forEach((menu) => {
      menu.innerHTML = LANGS.map(
        (l) => `<button type="button" data-lang="${l.code}">${l.short} — ${l.label}</button>`
      ).join("");
      menu.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          applyLang(btn.getAttribute("data-lang"));
          menu.classList.remove("open");
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildLangMenu();
    applyLang(currentLang());
  });

  window.TEPIA_I18N = { applyLang, currentLang, LANGS, get };
})();
