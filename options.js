document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['targetLanguage'], function(items) {
    let lang = items.targetLanguage || 'en';
    updateUITranslations(lang);
  });

  chrome.storage.local.get(
    [
      'geminiApiKey',
      'aiModel',
      'targetLanguage',
      'batchSize',
      'maxBatchLength',
      'delayBetweenRequests',
      'toggleBlueBackground',
      'realTimeTranslation',
      'excludeList',
      'showProgressPopup'
    ],
    function(items) {
      document.getElementById('apiKey').value = items.geminiApiKey || "";
      document.getElementById('aiModel').value = items.aiModel || "";
      document.getElementById('targetLanguage').value = items.targetLanguage || 'en';
      document.getElementById('batchSize').value = (typeof items.batchSize === 'undefined' || items.batchSize == 20) ? 80 : items.batchSize;
      document.getElementById('maxBatchLength').value = (typeof items.maxBatchLength === 'undefined' || items.maxBatchLength == 4000) ? 5000 : items.maxBatchLength;
      document.getElementById('delayBetweenRequests').value = (typeof items.delayBetweenRequests === 'undefined' || items.delayBetweenRequests == 1000) ? 2500 : items.delayBetweenRequests;
      
      document.getElementById('toggleBlueBackground').checked = items.toggleBlueBackground === true;
      document.getElementById('realTimeTranslation').checked = items.realTimeTranslation === true;
      
      if (typeof items.showProgressPopup === 'undefined') {
        document.getElementById('showProgressPopup').checked = true;
      } else {
        document.getElementById('showProgressPopup').checked = items.showProgressPopup === true;
      }

      if (items.excludeList && Array.isArray(items.excludeList)) {
        document.getElementById('excludeList').value = items.excludeList.join('\n');
      }
    }
  );

  document.getElementById('saveBtn').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const aiModel = document.getElementById('aiModel').value.trim();
    const targetLanguage = document.getElementById('targetLanguage').value;
    const batchSize = parseInt(document.getElementById('batchSize').value, 10) || 80;
    const maxBatchLength = parseInt(document.getElementById('maxBatchLength').value, 10) || 5000;
    const delayBetweenRequests = parseInt(document.getElementById('delayBetweenRequests').value, 10) || 2500;
    const toggleBlueBackground = document.getElementById('toggleBlueBackground').checked;
    const realTimeTranslation = document.getElementById('realTimeTranslation').checked;
    const showProgressPopup = document.getElementById('showProgressPopup').checked;
    
    let excludeList = document.getElementById('excludeList').value
      .split(/\r?\n/)
      .map(url => url.trim())
      .filter(url => url);

    const lang = targetLanguage || 'en';
    const translations = optionsTranslations[lang] || optionsTranslations.en;

    if (!apiKey) {
      showStatus(translations.noApiKey, 'error');
      return;
    }

    chrome.storage.local.set(
      { 
        geminiApiKey: apiKey, 
        aiModel: aiModel,
        targetLanguage: targetLanguage,
        batchSize: batchSize,
        maxBatchLength: maxBatchLength,
        delayBetweenRequests: delayBetweenRequests,
        toggleBlueBackground: toggleBlueBackground,
        realTimeTranslation: realTimeTranslation,
        showProgressPopup: showProgressPopup,
        excludeList: excludeList
      },
      function() {
        showStatus(translations.savedSettings, 'success');
        updateUITranslations(targetLanguage);
      }
    );
  });
});

const optionsTranslations = {
  en: {
    pageTitle: 'Gemini Website Translator Settings',
    header: 'Gemini Website Translator Settings',
    apiKeyLabel: 'Gemini API Key:',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeyHelp: 'Get your API key from Google AI Studio',
    aiModelLabel: 'AI Model:',
    aiModelPlaceholder: 'e.g., gemini-2.0-flash-lite',
    aiModelHelp: 'If left blank, gemini-2.0-flash-lite will be used.',
    batchSizeLabel: 'Batch Size (Number of Texts):',
    batchSizeHelp: 'Number of texts to translate at once. Higher is more efficient, but too many may cause errors.',
    maxBatchLengthLabel: 'Max Batch Length (Characters):',
    maxBatchLengthHelp: 'Maximum total characters in a batch. If exceeded, the batch will be split.',
    delayBetweenRequestsLabel: 'Delay Between Requests (ms):',
    delayBetweenRequestsHelp: 'Waiting time between API calls. Longer delays can help avoid rate limit errors.',
    toggleBlueBackgroundLabel: 'Translated Text Blue Background:',
    toggleBlueBackgroundHelp: 'Toggle whether to apply a blue background to translated texts.',
    autoTranslationLabel: 'Automatic Translation:',
    autoTranslationHelp: 'If enabled, the texts to be translated will be automatically translated.',
    showProgressPopupLabel: 'Show Progress Popup:',
    showProgressPopupHelp: 'Toggle whether to display a popup during translation.',
    excludeListLabel: 'List of Sites to Exclude:',
    excludeListHelp: 'Enter each URL on a new line. Sites listed here will not be automatically translated.',
    saveBtn: 'Save Settings',
    noApiKey: 'Please enter an API key.',
    savedSettings: 'Settings saved!'
  },
  ja: {
    pageTitle: 'Gemini ウェブサイト翻訳設定',
    header: 'Gemini ウェブサイト翻訳設定',
    apiKeyLabel: 'Gemini API キー:',
    apiKeyPlaceholder: 'APIキーを入力してください',
    apiKeyHelp: 'Google AI StudioからAPIキーを取得できます',
    aiModelLabel: 'AIモデル:',
    aiModelPlaceholder: '例: gemini-2.0-flash-lite',
    aiModelHelp: '何も入力されていない場合、 gemini-2.0-flash-lite が使用されます。',
    batchSizeLabel: 'バッチサイズ (テキスト数):',
    batchSizeHelp: '一度に翻訳するテキストの数。多いほど効率的ですが、あまり多すぎるとエラーになる可能性があります。',
    maxBatchLengthLabel: '最大バッチ長 (文字数):',
    maxBatchLengthHelp: 'バッチ内のテキストの合計最大文字数。これを超えるとバッチが分割されます。',
    delayBetweenRequestsLabel: 'リクエスト間隔 (ミリ秒):',
    delayBetweenRequestsHelp: 'API呼び出し間の待機時間。長く設定するとレート制限エラーを回避できます。',
    toggleBlueBackgroundLabel: '翻訳済みテキストの青背景:',
    toggleBlueBackgroundHelp: '翻訳済みの文章に青背景を適用するかどうかを切り替えます。',
    autoTranslationLabel: '自動翻訳:',
    autoTranslationHelp: 'オンにすると自動的に翻訳対象のテキストを翻訳します。',
    showProgressPopupLabel: '進捗ポップアップ表示:',
    showProgressPopupHelp: '翻訳中に進捗状況を示すポップアップを表示するかどうかを切り替えます。',
    excludeListLabel: '翻訳を使用しないサイト一覧:',
    excludeListHelp: '各URLは改行区切りで入力してください。これらのサイトは自動翻訳されません。',
    saveBtn: 'Save Settings',
    noApiKey: 'APIキーを入力してください',
    savedSettings: '設定を保存しました！'
  },
  fr: {
    pageTitle: 'Paramètres du Traducteur de Sites Web Gemini',
    header: 'Paramètres du Traducteur de Sites Web Gemini',
    apiKeyLabel: 'Clé API Gemini:',
    apiKeyPlaceholder: 'Entrez votre clé API',
    apiKeyHelp: 'Obtenez votre clé API depuis Google AI Studio',
    aiModelLabel: 'Modèle d\'IA:',
    aiModelPlaceholder: 'par ex., gemini-2.0-flash-lite',
    aiModelHelp: 'Si laissé vide, gemini-2.0-flash-lite sera utilisé.',
    batchSizeLabel: 'Taille du lot (nombre de textes):',
    batchSizeHelp: 'Nombre de textes à traduire simultanément. Plus c\'est élevé, plus c\'est efficace, mais un trop grand nombre peut entraîner des erreurs.',
    maxBatchLengthLabel: 'Longueur maximale du lot (caractères):',
    maxBatchLengthHelp: 'Nombre total maximal de caractères dans un lot. Si dépassé, le lot sera divisé.',
    delayBetweenRequestsLabel: 'Délai entre les requêtes (ms):',
    delayBetweenRequestsHelp: 'Temps d\'attente entre les appels API. Des délais plus longs peuvent aider à éviter les erreurs de limite de requêtes.',
    toggleBlueBackgroundLabel: 'Fond bleu pour le texte traduit:',
    toggleBlueBackgroundHelp: 'Activez ou désactivez l\'affichage d\'un fond bleu pour le texte traduit.',
    autoTranslationLabel: 'Traduction automatique:',
    autoTranslationHelp: 'Si activée, les textes à traduire seront automatiquement traduits.',
    showProgressPopupLabel: 'Afficher la fenêtre de progression:',
    showProgressPopupHelp: 'Activez ou désactivez l\'affichage d\'une fenêtre montrant la progression de la traduction.',
    excludeListLabel: 'Liste des sites à exclure:',
    excludeListHelp: 'Entrez chaque URL sur une nouvelle ligne. Les sites listés ne seront pas automatiquement traduits.',
    saveBtn: 'Save Settings',
    noApiKey: 'Veuillez entrer une clé API.',
    savedSettings: 'Paramètres enregistrés !'
  },
  de: {
    pageTitle: 'Einstellungen für den Gemini Website Translator',
    header: 'Einstellungen für den Gemini Website Translator',
    apiKeyLabel: 'Gemini API-Schlüssel:',
    apiKeyPlaceholder: 'Geben Sie Ihren API-Schlüssel ein',
    apiKeyHelp: 'Holen Sie sich Ihren API-Schlüssel von Google AI Studio',
    aiModelLabel: 'KI-Modell:',
    aiModelPlaceholder: 'z.B. gemini-2.0-flash-lite',
    aiModelHelp: 'Wenn nichts eingegeben wird, wird gemini-2.0-flash-lite verwendet.',
    batchSizeLabel: 'Batch-Größe (Anzahl Texte):',
    batchSizeHelp: 'Anzahl der Texte, die gleichzeitig übersetzt werden. Höhere Werte sind effizienter, zu hohe können jedoch Fehler verursachen.',
    maxBatchLengthLabel: 'Maximale Batch-Länge (Zeichen):',
    maxBatchLengthHelp: 'Maximale Gesamtzeichen in einem Batch. Wird dieser Wert überschritten, wird der Batch aufgeteilt.',
    delayBetweenRequestsLabel: 'Verzögerung zwischen Anfragen (ms):',
    delayBetweenRequestsHelp: 'Wartezeit zwischen API-Aufrufen. Längere Wartezeiten können helfen, Ratenbegrenzungsfehler zu vermeiden.',
    toggleBlueBackgroundLabel: 'Blauer Hintergrund für übersetzten Text:',
    toggleBlueBackgroundHelp: 'Schalten Sie ein, ob ein blauer Hintergrund für den übersetzten Text angezeigt werden soll.',
    autoTranslationLabel: 'Automatische Übersetzung:',
    autoTranslationHelp: 'Wenn aktiviert, werden die zu übersetzenden Texte automatisch übersetzt.',
    showProgressPopupLabel: 'Fortschrittsanzeige anzeigen:',
    showProgressPopupHelp: 'Schalten Sie ein, ob während der Übersetzung ein Popup mit dem Fortschritt angezeigt werden soll.',
    excludeListLabel: 'Liste der auszuschließenden Seiten:',
    excludeListHelp: 'Geben Sie jede URL in einer neuen Zeile ein. Die hier aufgeführten Seiten werden nicht automatisch übersetzt.',
    saveBtn: 'Save Settings',
    noApiKey: 'Bitte geben Sie einen API-Schlüssel ein.',
    savedSettings: 'Einstellungen gespeichert!'
  },
  es: {
    pageTitle: 'Configuración del Traductor de Sitios Web Gemini',
    header: 'Configuración del Traductor de Sitios Web Gemini',
    apiKeyLabel: 'Clave API de Gemini:',
    apiKeyPlaceholder: 'Introduce tu clave API',
    apiKeyHelp: 'Obtén tu clave API en Google AI Studio',
    aiModelLabel: 'Modelo de IA:',
    aiModelPlaceholder: 'por ejemplo, gemini-2.0-flash-lite',
    aiModelHelp: 'Si se deja en blanco, se utilizará gemini-2.0-flash-lite.',
    batchSizeLabel: 'Tamaño del lote (número de textos):',
    batchSizeHelp: 'Número de textos a traducir simultáneamente. Un valor mayor es más eficiente, pero un número demasiado alto puede causar errores.',
    maxBatchLengthLabel: 'Longitud máxima del lote (caracteres):',
    maxBatchLengthHelp: 'Número total máximo de caracteres en un lote. Si se excede, el lote se dividirá.',
    delayBetweenRequestsLabel: 'Retraso entre solicitudes (ms):',
    delayBetweenRequestsHelp: 'Tiempo de espera entre llamadas a la API. Retrasos más largos pueden ayudar a evitar errores por límite de solicitudes.',
    toggleBlueBackgroundLabel: 'Fondo azul para el texto traducido:',
    toggleBlueBackgroundHelp: 'Activa o desactiva la aplicación de un fondo azul al texto traducido.',
    autoTranslationLabel: 'Traducción automática:',
    autoTranslationHelp: 'Si está activada, los textos a traducir se traducirán automáticamente.',
    showProgressPopupLabel: 'Mostrar ventana de progreso:',
    showProgressPopupHelp: 'Activa o desactiva la visualización de un popup durante la traducción.',
    excludeListLabel: 'Lista de sitios a excluir:',
    excludeListHelp: 'Introduce cada URL en una nueva línea. Los sitios listados no se traducirán automáticamente.',
    saveBtn: 'Save Settings',
    noApiKey: 'Por favor, introduce una clave API.',
    savedSettings: '¡Configuración guardada!'
  },
  it: {
    pageTitle: 'Impostazioni del Traduttore di Siti Web Gemini',
    header: 'Impostazioni del Traduttore di Siti Web Gemini',
    apiKeyLabel: 'Chiave API Gemini:',
    apiKeyPlaceholder: 'Inserisci la tua chiave API',
    apiKeyHelp: 'Ottieni la tua chiave API da Google AI Studio',
    aiModelLabel: 'Modello IA:',
    aiModelPlaceholder: 'es. gemini-2.0-flash-lite',
    aiModelHelp: 'Se lasciato vuoto, verrà utilizzato gemini-2.0-flash-lite.',
    batchSizeLabel: 'Dimensione del lotto (numero di testi):',
    batchSizeHelp: 'Numero di testi da tradurre contemporaneamente. Valori più alti sono più efficienti, ma un numero troppo elevato potrebbe causare errori.',
    maxBatchLengthLabel: 'Lunghezza massima del lotto (caratteri):',
    maxBatchLengthHelp: 'Numero massimo di caratteri in un lotto. Se superato, il lotto verrà diviso.',
    delayBetweenRequestsLabel: 'Intervallo tra le richieste (ms):',
    delayBetweenRequestsHelp: 'Tempo di attesa tra le chiamate API. Intervalli più lunghi possono aiutare a evitare errori di limite di richieste.',
    toggleBlueBackgroundLabel: 'Sfondo blu per il testo tradotto:',
    toggleBlueBackgroundHelp: 'Attiva o disattiva l\'applicazione di uno sfondo blu al testo tradotto.',
    autoTranslationLabel: 'Traduzione automatica:',
    autoTranslationHelp: 'Se abilitata, i testi da tradurre verranno tradotti automaticamente.',
    showProgressPopupLabel: 'Mostra popup di avanzamento:',
    showProgressPopupHelp: 'Attiva o disattiva la visualizzazione di un popup durante la traduzione.',
    excludeListLabel: 'Elenco dei siti da escludere:',
    excludeListHelp: 'Inserisci ogni URL su una nuova riga. I siti elencati non verranno tradotti automaticamente.',
    saveBtn: 'Save Settings',
    noApiKey: 'Per favore, inserisci una chiave API.',
    savedSettings: 'Impostazioni salvate!'
  },
  pt: {
    pageTitle: 'Configurações do Tradutor de Sites Gemini',
    header: 'Configurações do Tradutor de Sites Gemini',
    apiKeyLabel: 'Chave API Gemini:',
    apiKeyPlaceholder: 'Insira sua chave API',
    apiKeyHelp: 'Obtenha sua chave API no Google AI Studio',
    aiModelLabel: 'Modelo de IA:',
    aiModelPlaceholder: 'ex.: gemini-2.0-flash-lite',
    aiModelHelp: 'Se deixado em branco, será usado gemini-2.0-flash-lite.',
    batchSizeLabel: 'Tamanho do Lote (Número de Textos):',
    batchSizeHelp: 'Número de textos a serem traduzidos de uma vez. Valores maiores são mais eficientes, mas muitos textos podem causar erros.',
    maxBatchLengthLabel: 'Comprimento Máximo do Lote (Caracteres):',
    maxBatchLengthHelp: 'Número máximo de caracteres em um lote. Se excedido, o lote será dividido.',
    delayBetweenRequestsLabel: 'Intervalo Entre Requisições (ms):',
    delayBetweenRequestsHelp: 'Tempo de espera entre chamadas à API. Intervalos mais longos podem ajudar a evitar erros de limite de requisições.',
    toggleBlueBackgroundLabel: 'Fundo Azul para o Texto Traduzido:',
    toggleBlueBackgroundHelp: 'Ative ou desative a aplicação de um fundo azul ao texto traduzido.',
    autoTranslationLabel: 'Tradução Automática:',
    autoTranslationHelp: 'Se ativada, os textos a serem traduzidos serão traduzidos automaticamente.',
    showProgressPopupLabel: 'Exibir Popup de Progresso:',
    showProgressPopupHelp: 'Ative ou desative a exibição de um popup durante a tradução.',
    excludeListLabel: 'Lista de Sites a Excluir:',
    excludeListHelp: 'Insira cada URL em uma nova linha. Os sites listados não serão traduzidos automaticamente.',
    saveBtn: 'Save Settings',
    noApiKey: 'Por favor, insira uma chave API.',
    savedSettings: 'Configurações salvas!'
  },
  ru: {
    pageTitle: 'Настройки Gemini Website Translator',
    header: 'Настройки Gemini Website Translator',
    apiKeyLabel: 'API-ключ Gemini:',
    apiKeyPlaceholder: 'Введите ваш API-ключ',
    apiKeyHelp: 'Получите ваш API-ключ в Google AI Studio',
    aiModelLabel: 'Модель ИИ:',
    aiModelPlaceholder: 'например, gemini-2.0-flash-lite',
    aiModelHelp: 'Если оставить пустым, будет использоваться gemini-2.0-flash-lite.',
    batchSizeLabel: 'Размер партии (количество текстов):',
    batchSizeHelp: 'Количество текстов для одновременного перевода. Большее значение эффективнее, но слишком большое может привести к ошибкам.',
    maxBatchLengthLabel: 'Максимальная длина партии (символы):',
    maxBatchLengthHelp: 'Максимальное количество символов в партии. При превышении партия будет разделена.',
    delayBetweenRequestsLabel: 'Задержка между запросами (мс):',
    delayBetweenRequestsHelp: 'Время ожидания между вызовами API. Более длительные задержки помогут избежать ошибок лимита запросов.',
    toggleBlueBackgroundLabel: 'Синий фон для переведённого текста:',
    toggleBlueBackgroundHelp: 'Включите, чтобы применять синий фон к переведённому тексту.',
    autoTranslationLabel: 'Автоматический перевод:',
    autoTranslationHelp: 'Если включено, тексты для перевода будут автоматически переведены.',
    showProgressPopupLabel: 'Показывать всплывающее окно прогресса:',
    showProgressPopupHelp: 'Включите, чтобы отображалось всплывающее окно с информацией о прогрессе перевода.',
    excludeListLabel: 'Список сайтов для исключения:',
    excludeListHelp: 'Введите каждый URL на новой строке. Сайты в этом списке не будут автоматически переводиться.',
    saveBtn: 'Save Settings',
    noApiKey: 'Пожалуйста, введите API-ключ.',
    savedSettings: 'Настройки сохранены!'
  },
  zh: {
    pageTitle: 'Gemini 网站翻译设置',
    header: 'Gemini 网站翻译设置',
    apiKeyLabel: 'Gemini API 密钥:',
    apiKeyPlaceholder: '请输入您的 API 密钥',
    apiKeyHelp: '从 Google AI Studio 获取您的 API 密钥',
    aiModelLabel: 'AI 模型:',
    aiModelPlaceholder: '例如，gemini-2.0-flash-lite',
    aiModelHelp: '如果留空，将使用 gemini-2.0-flash-lite。',
    batchSizeLabel: '批处理大小 (文本数量):',
    batchSizeHelp: '一次翻译的文本数量。数值越高效率越高，但过多可能导致错误。',
    maxBatchLengthLabel: '批处理最大长度 (字符数):',
    maxBatchLengthHelp: '批处理中所有文本的最大字符数。超出此值时将拆分批处理。',
    delayBetweenRequestsLabel: '请求间隔 (毫秒):',
    delayBetweenRequestsHelp: 'API 调用之间的等待时间。较长的等待可以帮助避免请求限制错误。',
    toggleBlueBackgroundLabel: '翻译文本蓝色背景:',
    toggleBlueBackgroundHelp: '切换是否为翻译后的文本应用蓝色背景。',
    autoTranslationLabel: '自动翻译:',
    autoTranslationHelp: '如果启用，将自动翻译需要翻译的文本。',
    showProgressPopupLabel: '显示进度弹窗:',
    showProgressPopupHelp: '切换是否在翻译期间显示进度弹窗。',
    excludeListLabel: '排除翻译的网站列表:',
    excludeListHelp: '每行输入一个 URL。此列表中的网站将不会被自动翻译。',
    saveBtn: 'Save Settings',
    noApiKey: '请输入 API 密钥。',
    savedSettings: '设置已保存！'
  },
  ko: {
    pageTitle: 'Gemini 웹사이트 번역 설정',
    header: 'Gemini 웹사이트 번역 설정',
    apiKeyLabel: 'Gemini API 키:',
    apiKeyPlaceholder: 'API 키를 입력하세요',
    apiKeyHelp: 'Google AI Studio에서 API 키를 받을 수 있습니다',
    aiModelLabel: 'AI 모델:',
    aiModelPlaceholder: '예: gemini-2.0-flash-lite',
    aiModelHelp: '빈 칸으로 두면 gemini-2.0-flash-lite가 사용됩니다.',
    batchSizeLabel: '배치 크기 (텍스트 수):',
    batchSizeHelp: '한 번에 번역할 텍스트의 수입니다. 숫자가 클수록 효율적이지만, 너무 많으면 오류가 발생할 수 있습니다.',
    maxBatchLengthLabel: '최대 배치 길이 (문자 수):',
    maxBatchLengthHelp: '배치 내 텍스트의 총 최대 문자 수입니다. 이 수치를 초과하면 배치가 분할됩니다.',
    delayBetweenRequestsLabel: '요청 간격 (ms):',
    delayBetweenRequestsHelp: 'API 호출 간 대기 시간입니다. 대기 시간이 길면 요청 제한 오류를 피할 수 있습니다.',
    toggleBlueBackgroundLabel: '번역된 텍스트 파란색 배경:',
    toggleBlueBackgroundHelp: '번역된 텍스트에 파란색 배경을 적용할지 여부를 전환합니다.',
    autoTranslationLabel: '자동 번역:',
    autoTranslationHelp: '켜면 번역 대상 텍스트가 자동으로 번역됩니다.',
    showProgressPopupLabel: '진행 상황 팝업 표시:',
    showProgressPopupHelp: '번역 중 진행 상황을 보여주는 팝업을 표시할지 여부를 전환합니다.',
    excludeListLabel: '번역 제외 사이트 목록:',
    excludeListHelp: '각 URL을 줄 바꿈으로 구분하여 입력하세요. 이 목록의 사이트는 자동 번역되지 않습니다.',
    saveBtn: 'Save Settings',
    noApiKey: 'API 키를 입력하세요',
    savedSettings: '설정이 저장되었습니다!'
  }
};

function updateUITranslations(lang) {
  const tr = optionsTranslations[lang] || optionsTranslations.en;
  document.getElementById('pageTitle').textContent = tr.pageTitle || 'Gemini Website Translator Settings';
  document.getElementById('header').textContent = tr.header || 'Gemini Website Translator Settings';

  document.getElementById('apiKeyLabel').textContent = tr.apiKeyLabel || 'Gemini API Key:';
  document.getElementById('apiKey').placeholder = tr.apiKeyPlaceholder || 'Enter your API key';
  document.getElementById('apiKeyHelp').textContent = tr.apiKeyHelp || 'Get your API key from Google AI Studio';

  document.getElementById('aiModelLabel').textContent = tr.aiModelLabel || 'AI Model:';
  document.getElementById('aiModel').placeholder = tr.aiModelPlaceholder || 'e.g., gemini-2.0-flash-lite';
  document.getElementById('aiModelHelp').textContent = tr.aiModelHelp || 'If left blank, gemini-2.0-flash-lite will be used.';

  document.getElementById('batchSizeLabel').textContent = tr.batchSizeLabel || 'Batch Size (Number of Texts):';
  document.getElementById('batchSizeHelp').textContent = tr.batchSizeHelp || '';

  document.getElementById('maxBatchLengthLabel').textContent = tr.maxBatchLengthLabel || 'Max Batch Length (Characters):';
  document.getElementById('maxBatchLengthHelp').textContent = tr.maxBatchLengthHelp || '';

  document.getElementById('delayBetweenRequestsLabel').textContent = tr.delayBetweenRequestsLabel || 'Delay Between Requests (ms):';
  document.getElementById('delayBetweenRequestsHelp').textContent = tr.delayBetweenRequestsHelp || '';

  document.getElementById('toggleBlueBackgroundLabel').textContent = tr.toggleBlueBackgroundLabel || 'Translated Text Blue Background:';
  document.getElementById('toggleBlueBackgroundHelp').textContent = tr.toggleBlueBackgroundHelp || '';


  document.getElementById('autoTranslationLabel').textContent = tr.autoTranslationLabel || 'Automatic Translation:';
  document.getElementById('autoTranslationHelp').textContent = tr.autoTranslationHelp || 'If enabled, the texts to be translated will be automatically translated.';

  document.getElementById('showProgressPopupLabel').textContent = tr.showProgressPopupLabel || 'Show Progress Popup:';
  document.getElementById('showProgressPopupHelp').textContent = tr.showProgressPopupHelp || '';

  document.getElementById('excludeListLabel').textContent = tr.excludeListLabel || 'List of Sites to Exclude:';
  document.getElementById('excludeListHelp').textContent = tr.excludeListHelp || '';

  document.getElementById('saveBtn').textContent = 'Save Settings';
  document.title = tr.pageTitle || 'Gemini Website Translator Settings';
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';
  setTimeout(function() {
    status.style.display = 'none';
    status.className = '';
  }, 3000);
}