// options.js

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get([
    'targetLanguage', 'apiProvider', 'geminiApiKey', 'openaiApiKey', 'deepseekApiKey', 'anthropicApiKey', 'xaiApiKey',
    'geminiModel', 'openaiModel', 'deepseekModel', 'anthropicModel', 'xaiModel',
    'batchSize', 'maxBatchLength', 'delayBetweenRequests', 'maxToken', 'toggleBlueBackground',
    'realTimeTranslation', 'showProgressPopup', 'excludeList'
  ], function(items) {
    let lang = items.targetLanguage || 'en';
    updateUITranslations(lang);

    document.getElementById('apiProvider').value = items.apiProvider || 'gemini';
    document.getElementById('geminiApiKey').value = items.geminiApiKey || '';
    document.getElementById('openaiApiKey').value = items.openaiApiKey || '';
    document.getElementById('deepseekApiKey').value = items.deepseekApiKey || '';
    document.getElementById('anthropicApiKey').value = items.anthropicApiKey || '';
    document.getElementById('xaiApiKey').value = items.xaiApiKey || '';
    document.getElementById('targetLanguage').value = items.targetLanguage || 'en';
    document.getElementById('batchSize').value = items.batchSize || 80;
    document.getElementById('maxBatchLength').value = items.maxBatchLength || 5000;
    document.getElementById('delayBetweenRequests').value = items.delayBetweenRequests || 2500;
    document.getElementById('maxToken').value = items.maxToken || 8192;
    document.getElementById('toggleBlueBackground').checked = items.toggleBlueBackground === true;
    document.getElementById('realTimeTranslation').checked = items.realTimeTranslation === true;
    document.getElementById('showProgressPopup').checked = items.showProgressPopup !== false; // デフォルト true に修正
    document.getElementById('excludeList').value = (items.excludeList && Array.isArray(items.excludeList)) ? items.excludeList.join('\n') : '';

    const provider = items.apiProvider || 'gemini';
    const modelKey = provider + 'Model';
    document.getElementById('aiModel').value = items[modelKey] || '';

    updateApiFields(provider, lang);
  });

  document.getElementById('apiProvider').addEventListener('change', function() {
    const provider = this.value;
    const lang = document.getElementById('targetLanguage').value || 'en';
    updateApiFields(provider, lang);
    chrome.storage.local.get([provider + 'Model'], function(items) {
      document.getElementById('aiModel').value = items[provider + 'Model'] || '';
    });
  });

  document.getElementById('targetLanguage').addEventListener('change', function() {
    const lang = this.value;
    updateUITranslations(lang);
    const provider = document.getElementById('apiProvider').value;
    updateApiFields(provider, lang);
  });

  document.getElementById('saveBtn').addEventListener('click', function() {
    const apiProvider = document.getElementById('apiProvider').value;
    const geminiApiKey = document.getElementById('geminiApiKey').value.trim();
    const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
    const deepseekApiKey = document.getElementById('deepseekApiKey').value.trim();
    const anthropicApiKey = document.getElementById('anthropicApiKey').value.trim();
    const xaiApiKey = document.getElementById('xaiApiKey').value.trim();
    const aiModel = document.getElementById('aiModel').value.trim();
    const targetLanguage = document.getElementById('targetLanguage').value;
    const batchSize = parseInt(document.getElementById('batchSize').value, 10) || 80;
    const maxBatchLength = parseInt(document.getElementById('maxBatchLength').value, 10) || 5000;
    const delayBetweenRequests = parseInt(document.getElementById('delayBetweenRequests').value, 10) || 2500;
    const maxToken = parseInt(document.getElementById('maxToken').value, 10) || 8192;
    const toggleBlueBackground = document.getElementById('toggleBlueBackground').checked;
    const realTimeTranslation = document.getElementById('realTimeTranslation').checked;
    const showProgressPopup = document.getElementById('showProgressPopup').checked;
    const excludeList = document.getElementById('excludeList').value.split(/\r?\n/).map(url => url.trim()).filter(url => url);

    const lang = targetLanguage || 'en';
    const translations = optionsTranslations[lang] || optionsTranslations.en;

    const modelKey = apiProvider + 'Model';
    const saveData = {
      apiProvider: apiProvider,
      geminiApiKey: geminiApiKey,
      openaiApiKey: openaiApiKey,
      deepseekApiKey: deepseekApiKey,
      anthropicApiKey: anthropicApiKey,
      xaiApiKey: xaiApiKey,
      [modelKey]: aiModel,
      targetLanguage: targetLanguage,
      batchSize: batchSize,
      maxBatchLength: maxBatchLength,
      delayBetweenRequests: delayBetweenRequests,
      maxToken: maxToken,
      toggleBlueBackground: toggleBlueBackground,
      realTimeTranslation: realTimeTranslation,
      showProgressPopup: showProgressPopup,
      excludeList: excludeList
    };

    chrome.storage.local.set(saveData, function() {
      showStatus(translations.savedSettings, 'success');
      updateUITranslations(targetLanguage);
    });
  });
});

function updateApiFields(provider, lang) {
  const tr = optionsTranslations[lang] || optionsTranslations.en;
  const apiKeyHelp = {
    gemini: tr.apiKeyHelpGemini || 'Get your API key from <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    openai: tr.apiKeyHelpOpenAI || 'Get your API key from <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    deepseek: tr.apiKeyHelpDeepSeek || 'Get your API key from <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    anthropic: tr.apiKeyHelpAnthropic || 'Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    xai: tr.apiKeyHelpXAI || 'Get your API key from <a href="https://xai.com/" target="_blank">xAI</a>.'
  };
  const aiModelHelp = {
    gemini: tr.aiModelHelpGemini || 'If left blank, gemini-2.0-flash-lite will be used.',
    openai: tr.aiModelHelpOpenAI || 'If left blank, gpt-4o-mini will be used.',
    deepseek: tr.aiModelHelpDeepSeek || 'If left blank, deepseek-chat will be used.',
    anthropic: tr.aiModelHelpAnthropic || 'If left blank, claude-3-5-haiku-20241022 will be used.',
    xai: tr.aiModelHelpXAI || 'If left blank, grok-2-1212 will be used.'
  };
  const aiModelPlaceholder = {
    gemini: tr.aiModelPlaceholderGemini || 'e.g., gemini-2.0-flash-lite',
    openai: tr.aiModelPlaceholderOpenAI || 'e.g., gpt-4o-mini',
    deepseek: tr.aiModelPlaceholderDeepSeek || 'e.g., deepseek-chat',
    anthropic: tr.aiModelPlaceholderAnthropic || 'e.g., claude-3-5-haiku-20241022',
    xai: tr.aiModelPlaceholderXAI || 'e.g., grok-2-1212'
  };

  document.getElementById('apiKeyHelp').innerHTML = apiKeyHelp[provider];
  document.getElementById('aiModelHelp').textContent = aiModelHelp[provider];
  document.getElementById('aiModel').placeholder = aiModelPlaceholder[provider];

  document.getElementById('geminiApiKey').style.display = provider === 'gemini' ? 'block' : 'none';
  document.getElementById('openaiApiKey').style.display = provider === 'openai' ? 'block' : 'none';
  document.getElementById('deepseekApiKey').style.display = provider === 'deepseek' ? 'block' : 'none';
  document.getElementById('anthropicApiKey').style.display = provider === 'anthropic' ? 'block' : 'none';
  document.getElementById('xaiApiKey').style.display = provider === 'xai' ? 'block' : 'none';
}

function updateUITranslations(lang) {
  const tr = optionsTranslations[lang] || optionsTranslations.en;
  document.getElementById('pageTitle').textContent = tr.pageTitle || 'LLM Website Translator Settings';
  document.getElementById('header').textContent = tr.header || 'LLM Website Translator Settings';

  document.getElementById('apiProviderLabel').textContent = tr.apiProviderLabel || 'API Provider:';
  document.getElementById('apiProviderHelp').textContent = tr.apiProviderHelp || 'Choose the API provider to use for translation.';

  document.getElementById('apiKeyLabel').textContent = tr.apiKeyLabel || 'API Key:';
  document.getElementById('geminiApiKey').placeholder = tr.apiKeyPlaceholderGemini || 'Enter your Gemini API key';
  document.getElementById('openaiApiKey').placeholder = tr.apiKeyPlaceholderOpenAI || 'Enter your OpenAI API key';
  document.getElementById('deepseekApiKey').placeholder = tr.apiKeyPlaceholderDeepSeek || 'Enter your DeepSeek API key';
  document.getElementById('anthropicApiKey').placeholder = tr.apiKeyPlaceholderAnthropic || 'Enter your Anthropic API key';
  document.getElementById('xaiApiKey').placeholder = tr.apiKeyPlaceholderXAI || 'Enter your xAI API key';

  document.getElementById('aiModelLabel').textContent = tr.aiModelLabel || 'AI Model:';

  document.getElementById('batchSizeLabel').textContent = tr.batchSizeLabel || 'Batch Size (Number of Texts):';
  document.getElementById('batchSizeHelp').textContent = tr.batchSizeHelp || '';

  document.getElementById('maxBatchLengthLabel').textContent = tr.maxBatchLengthLabel || 'Max Batch Length (Characters):';
  document.getElementById('maxBatchLengthHelp').textContent = tr.maxBatchLengthHelp || '';

  document.getElementById('delayBetweenRequestsLabel').textContent = tr.delayBetweenRequestsLabel || 'Delay Between Requests (ms):';
  document.getElementById('delayBetweenRequestsHelp').textContent = tr.delayBetweenRequestsHelp || '';

  document.getElementById('maxTokenLabel').textContent = tr.maxTokenLabel || 'Max Token:';
  document.getElementById('maxTokenHelp').textContent = tr.maxTokenHelp || 'Maximum number of tokens for API requests.';

  document.getElementById('toggleBlueBackgroundLabel').textContent = tr.toggleBlueBackgroundLabel || 'Translated Text Blue Background:';
  document.getElementById('toggleBlueBackgroundHelp').textContent = tr.toggleBlueBackgroundHelp || '';

  document.getElementById('autoTranslationLabel').textContent = tr.autoTranslationLabel || 'Automatic Translation:';
  document.getElementById('autoTranslationHelp').textContent = tr.autoTranslationHelp || 'If enabled, the texts to be translated will be automatically translated.';

  document.getElementById('showProgressPopupLabel').textContent = tr.showProgressPopupLabel || 'Show Progress Popup:';
  document.getElementById('showProgressPopupHelp').textContent = tr.showProgressPopupHelp || '';

  document.getElementById('excludeListLabel').textContent = tr.excludeListLabel || 'List of Sites to Exclude:';
  document.getElementById('excludeListHelp').textContent = tr.excludeListHelp || '';

  document.getElementById('saveBtn').textContent = tr.saveBtn || 'Save Settings';
  document.title = tr.pageTitle || 'LLM Website Translator Settings';
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

const optionsTranslations = {
  en: {
    pageTitle: 'LLM Website Translator Settings',
    header: 'LLM Website Translator Settings',
    apiProviderLabel: 'API Provider:',
    apiProviderHelp: 'Choose the API provider to use for translation.',
    apiKeyLabel: 'API Key:',
    apiKeyHelpGemini: 'Get your API key from <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Get your API key from <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Get your API key from <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Get your API key from <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Enter your Gemini API key',
    apiKeyPlaceholderOpenAI: 'Enter your OpenAI API key',
    apiKeyPlaceholderDeepSeek: 'Enter your DeepSeek API key',
    apiKeyPlaceholderAnthropic: 'Enter your Anthropic API key',
    apiKeyPlaceholderXAI: 'Enter your xAI API key',
    aiModelLabel: 'AI Model:',
    aiModelHelpGemini: 'If left blank, gemini-2.0-flash-lite will be used.',
    aiModelHelpOpenAI: 'If left blank, gpt-4o-mini will be used.',
    aiModelHelpDeepSeek: 'If left blank, deepseek-chat will be used.',
    aiModelHelpAnthropic: 'If left blank, claude-3-5-haiku-20241022 will be used.',
    aiModelHelpXAI: 'If left blank, grok-2-1212 will be used.',
    aiModelPlaceholderGemini: 'e.g., gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'e.g., gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'e.g., deepseek-chat',
    aiModelPlaceholderAnthropic: 'e.g., claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'e.g., grok-2-1212',
    batchSizeLabel: 'Batch Size (Number of Texts):',
    batchSizeHelp: 'Number of texts to translate at once. Higher is more efficient, but too many may cause errors.',
    maxBatchLengthLabel: 'Max Batch Length (Characters):',
    maxBatchLengthHelp: 'Maximum total characters in a batch. If exceeded, the batch will be split.',
    delayBetweenRequestsLabel: 'Delay Between Requests (ms):',
    delayBetweenRequestsHelp: 'Waiting time between API calls. Longer delays can help avoid rate limit errors.',
    maxTokenLabel: 'Max Token:',
    maxTokenHelp: 'Maximum number of tokens for API requests.',
    toggleBlueBackgroundLabel: 'Translated Text Blue Background:',
    toggleBlueBackgroundHelp: 'Toggle whether to apply a blue background to translated texts.',
    autoTranslationLabel: 'Automatic Translation:',
    autoTranslationHelp: 'If enabled, the texts to be translated will be automatically translated.',
    showProgressPopupLabel: 'Show Progress Popup:',
    showProgressPopupHelp: 'Toggle whether to display a popup during translation.',
    excludeListLabel: 'List of Sites to Exclude:',
    excludeListHelp: 'Enter each URL on a new line. Sites listed here will not be automatically translated.',
    saveBtn: 'Save Settings',
    savedSettings: 'Settings saved!'
  },
  ja: {
    pageTitle: 'LLM ウェブサイト翻訳設定',
    header: 'LLM ウェブサイト翻訳設定',
    apiProviderLabel: 'APIプロバイダー:',
    apiProviderHelp: '翻訳に使用するAIプロバイダーを選択してください。',
    apiKeyLabel: 'APIキー:',
    apiKeyHelpGemini: '<a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>からAPIキーを取得してください。',
    apiKeyHelpOpenAI: '<a href="https://platform.openai.com/" target="_blank">OpenAI</a>からAPIキーを取得してください。',
    apiKeyHelpDeepSeek: '<a href="https://deepseek.com/" target="_blank">DeepSeek</a>からAPIキーを取得してください。',
    apiKeyHelpAnthropic: '<a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>からAPIキーを取得してください。',
    apiKeyHelpXAI: '<a href="https://xai.com/" target="_blank">xAI</a>からAPIキーを取得してください。',
    apiKeyPlaceholderGemini: 'Gemini APIキーを入力してください',
    apiKeyPlaceholderOpenAI: 'OpenAI APIキーを入力してください',
    apiKeyPlaceholderDeepSeek: 'DeepSeek APIキーを入力してください',
    apiKeyPlaceholderAnthropic: 'Anthropic APIキーを入力してください',
    apiKeyPlaceholderXAI: 'xAI APIキーを入力してください',
    aiModelLabel: 'AIモデル:',
    aiModelHelpGemini: '空白の場合、gemini-2.0-flash-liteが使用されます。',
    aiModelHelpOpenAI: '空白の場合、gpt-4o-miniが使用されます。',
    aiModelHelpDeepSeek: '空白の場合、deepseek-chatが使用されます。',
    aiModelHelpAnthropic: '空白の場合、claude-3-5-haiku-20241022が使用されます。',
    aiModelHelpXAI: '空白の場合、grok-2-1212が使用されます。',
    aiModelPlaceholderGemini: '例: gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: '例: gpt-4o-mini',
    aiModelPlaceholderDeepSeek: '例: deepseek-chat',
    aiModelPlaceholderAnthropic: '例: claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: '例: grok-2-1212',
    batchSizeLabel: 'バッチサイズ (テキスト数):',
    batchSizeHelp: '一度に翻訳するテキストの数。多いほど効率的ですが、あまり多すぎるとエラーになる可能性があります。',
    maxBatchLengthLabel: '最大バッチ長 (文字数):',
    maxBatchLengthHelp: 'バッチ内のテキストの合計最大文字数。これを超えるとバッチが分割されます。',
    delayBetweenRequestsLabel: 'リクエスト間隔 (ミリ秒):',
    delayBetweenRequestsHelp: 'API呼び出し間の待機時間。長く設定するとレート制限エラーを回避できます。',
    maxTokenLabel: '最大トークン数:',
    maxTokenHelp: 'APIリクエストの最大トークン数。',
    toggleBlueBackgroundLabel: '翻訳済みテキストの青背景:',
    toggleBlueBackgroundHelp: '翻訳済みの文章に青背景を適用するかどうかを切り替えます。',
    autoTranslationLabel: '自動翻訳:',
    autoTranslationHelp: 'オンにすると自動的に翻訳対象のテキストを翻訳します。',
    showProgressPopupLabel: '進捗ポップアップ表示:',
    showProgressPopupHelp: '翻訳中に進捗状況を示すポップアップを表示するかどうかを切り替えます。',
    excludeListLabel: '翻訳を使用しないサイト一覧:',
    excludeListHelp: '各URLは改行区切りで入力してください。これらのサイトは自動翻訳されません。',
    saveBtn: '設定を保存',
    savedSettings: '設定を保存しました！'
  },
  fr: {
    pageTitle: 'Paramètres du traducteur de site Web LLM',
    header: 'Paramètres du traducteur de site Web LLM',
    apiProviderLabel: 'Fournisseur API :',
    apiProviderHelp: 'Choisissez le fournisseur API à utiliser pour la traduction.',
    apiKeyLabel: 'Clé API :',
    apiKeyHelpGemini: 'Obtenez votre clé API sur <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Obtenez votre clé API sur <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Obtenez votre clé API sur <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Obtenez votre clé API sur <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Obtenez votre clé API sur <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Entrez votre clé API Gemini',
    apiKeyPlaceholderOpenAI: 'Entrez votre clé API OpenAI',
    apiKeyPlaceholderDeepSeek: 'Entrez votre clé API DeepSeek',
    apiKeyPlaceholderAnthropic: 'Entrez votre clé API Anthropic',
    apiKeyPlaceholderXAI: 'Entrez votre clé API xAI',
    aiModelLabel: 'Modèle AI :',
    aiModelHelpGemini: 'Si vide, gemini-2.0-flash-lite sera utilisé.',
    aiModelHelpOpenAI: 'Si vide, gpt-4o-mini sera utilisé.',
    aiModelHelpDeepSeek: 'Si vide, deepseek-chat sera utilisé.',
    aiModelHelpAnthropic: 'Si vide, claude-3-5-haiku-20241022 sera utilisé.',
    aiModelHelpXAI: 'Si vide, grok-2-1212 sera utilisé.',
    aiModelPlaceholderGemini: 'ex. : gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'ex. : gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'ex. : deepseek-chat',
    aiModelPlaceholderAnthropic: 'ex. : claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'ex. : grok-2-1212',
    batchSizeLabel: 'Taille du lot (nombre de textes) :',
    batchSizeHelp: 'Nombre de textes à traduire en une fois. Plus élevé est plus efficace, mais trop peut causer des erreurs.',
    maxBatchLengthLabel: 'Longueur maximale du lot (caractères) :',
    maxBatchLengthHelp: 'Nombre total maximum de caractères dans un lot. Si dépassé, le lot sera divisé.',
    delayBetweenRequestsLabel: 'Délai entre les requêtes (ms) :',
    delayBetweenRequestsHelp: 'Temps d\'attente entre les appels API. Des délais plus longs peuvent aider à éviter les erreurs de limitation de débit.',
    maxTokenLabel: 'Nombre maximum de jetons :',
    maxTokenHelp: 'Nombre maximum de jetons pour les requêtes API.',
    toggleBlueBackgroundLabel: 'Fond bleu pour le texte traduit :',
    toggleBlueBackgroundHelp: 'Activer ou désactiver l\'application d\'un fond bleu aux textes traduits.',
    autoTranslationLabel: 'Traduction automatique :',
    autoTranslationHelp: 'Si activé, les textes à traduire seront automatiquement traduits.',
    showProgressPopupLabel: 'Afficher la fenêtre contextuelle de progression :',
    showProgressPopupHelp: 'Activer ou désactiver l\'affichage d\'une fenêtre contextuelle pendant la traduction.',
    excludeListLabel: 'Liste des sites à exclure :',
    excludeListHelp: 'Entrez chaque URL sur une nouvelle ligne. Les sites listés ici ne seront pas traduits automatiquement.',
    saveBtn: 'Enregistrer les paramètres',
    savedSettings: 'Paramètres enregistrés !'
  },
  de: {
    pageTitle: 'Einstellungen für den LLM Website Translator',
    header: 'Einstellungen für den LLM Website Translator',
    apiProviderLabel: 'API-Anbieter:',
    apiProviderHelp: 'Wählen Sie den API-Anbieter für die Übersetzung aus.',
    apiKeyLabel: 'API-Schlüssel:',
    apiKeyHelpGemini: 'Holen Sie sich Ihren API-Schlüssel von <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Holen Sie sich Ihren API-Schlüssel von <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Holen Sie sich Ihren API-Schlüssel von <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Holen Sie sich Ihren API-Schlüssel von <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Holen Sie sich Ihren API-Schlüssel von <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Geben Sie Ihren Gemini API-Schlüssel ein',
    apiKeyPlaceholderOpenAI: 'Geben Sie Ihren OpenAI API-Schlüssel ein',
    apiKeyPlaceholderDeepSeek: 'Geben Sie Ihren DeepSeek API-Schlüssel ein',
    apiKeyPlaceholderAnthropic: 'Geben Sie Ihren Anthropic API-Schlüssel ein',
    apiKeyPlaceholderXAI: 'Geben Sie Ihren xAI API-Schlüssel ein',
    aiModelLabel: 'KI-Modell:',
    aiModelHelpGemini: 'Wenn leer, wird gemini-2.0-flash-lite verwendet.',
    aiModelHelpOpenAI: 'Wenn leer, wird gpt-4o-mini verwendet.',
    aiModelHelpDeepSeek: 'Wenn leer, wird deepseek-chat verwendet.',
    aiModelHelpAnthropic: 'Wenn leer, wird claude-3-5-haiku-20241022 verwendet.',
    aiModelHelpXAI: 'Wenn leer, wird grok-2-1212 verwendet.',
    aiModelPlaceholderGemini: 'z.B. gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'z.B. gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'z.B. deepseek-chat',
    aiModelPlaceholderAnthropic: 'z.B. claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'z.B. grok-2-1212',
    batchSizeLabel: 'Batch-Größe (Anzahl der Texte):',
    batchSizeHelp: 'Anzahl der Texte, die gleichzeitig übersetzt werden. Höher ist effizienter, aber zu viele können Fehler verursachen.',
    maxBatchLengthLabel: 'Maximale Batch-Länge (Zeichen):',
    maxBatchLengthHelp: 'Maximale Gesamtzeichen in einem Batch. Bei Überschreitung wird der Batch aufgeteilt.',
    delayBetweenRequestsLabel: 'Verzögerung zwischen Anfragen (ms):',
    delayBetweenRequestsHelp: 'Wartezeit zwischen API-Aufrufen. Längere Verzögerungen können helfen, Ratenbegrenzungsfehler zu vermeiden.',
    maxTokenLabel: 'Maximale Token-Anzahl:',
    maxTokenHelp: 'Maximale Anzahl an Token für API-Anfragen.',
    toggleBlueBackgroundLabel: 'Blauer Hintergrund für übersetzten Text:',
    toggleBlueBackgroundHelp: 'Schalten Sie um, ob ein blauer Hintergrund auf übersetzte Texte angewendet werden soll.',
    autoTranslationLabel: 'Automatische Übersetzung:',
    autoTranslationHelp: 'Wenn aktiviert, werden die zu übersetzenden Texte automatisch übersetzt.',
    showProgressPopupLabel: 'Fortschritts-Popup anzeigen:',
    showProgressPopupHelp: 'Schalten Sie um, ob ein Popup während der Übersetzung angezeigt werden soll.',
    excludeListLabel: 'Liste der auszuschließenden Websites:',
    excludeListHelp: 'Geben Sie jede URL in einer neuen Zeile ein. Die hier aufgeführten Websites werden nicht automatisch übersetzt.',
    saveBtn: 'Einstellungen speichern',
    savedSettings: 'Einstellungen gespeichert!'
  },
  es: {
    pageTitle: 'Configuración del traductor de sitios web LLM',
    header: 'Configuración del traductor de sitios web LLM',
    apiProviderLabel: 'Proveedor de API:',
    apiProviderHelp: 'Elija el proveedor de API para usar en la traducción.',
    apiKeyLabel: 'Clave API:',
    apiKeyHelpGemini: 'Obtenga su clave API en <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Obtenga su clave API en <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Obtenga su clave API en <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Obtenga su clave API en <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Obtenga su clave API en <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Ingrese su clave API de Gemini',
    apiKeyPlaceholderOpenAI: 'Ingrese su clave API de OpenAI',
    apiKeyPlaceholderDeepSeek: 'Ingrese su clave API de DeepSeek',
    apiKeyPlaceholderAnthropic: 'Ingrese su clave API de Anthropic',
    apiKeyPlaceholderXAI: 'Ingrese su clave API de xAI',
    aiModelLabel: 'Modelo de IA:',
    aiModelHelpGemini: 'Si se deja en blanco, se usará gemini-2.0-flash-lite.',
    aiModelHelpOpenAI: 'Si se deja en blanco, se usará gpt-4o-mini.',
    aiModelHelpDeepSeek: 'Si se deja en blanco, se usará deepseek-chat.',
    aiModelHelpAnthropic: 'Si se deja en blanco, se usará claude-3-5-haiku-20241022.',
    aiModelHelpXAI: 'Si se deja en blanco, se usará grok-2-1212.',
    aiModelPlaceholderGemini: 'ejemplo: gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'ejemplo: gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'ejemplo: deepseek-chat',
    aiModelPlaceholderAnthropic: 'ejemplo: claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'ejemplo: grok-2-1212',
    batchSizeLabel: 'Tamaño del lote (número de textos):',
    batchSizeHelp: 'Número de textos a traducir a la vez. Un valor más alto es más eficiente, pero demasiados pueden causar errores.',
    maxBatchLengthLabel: 'Longitud máxima del lote (caracteres):',
    maxBatchLengthHelp: 'Máximo total de caracteres en un lote. Si se excede, el lote se dividirá.',
    delayBetweenRequestsLabel: 'Retraso entre solicitudes (ms):',
    delayBetweenRequestsHelp: 'Tiempo de espera entre llamadas a la API. Retrasos más largos pueden ayudar a evitar errores de límite de tasa.',
    maxTokenLabel: 'Número máximo de tokens:',
    maxTokenHelp: 'Número máximo de tokens para solicitudes API.',
    toggleBlueBackgroundLabel: 'Fondo azul para texto traducido:',
    toggleBlueBackgroundHelp: 'Alternar si se debe aplicar un fondo azul a los textos traducidos.',
    autoTranslationLabel: 'Traducción automática:',
    autoTranslationHelp: 'Si está habilitado, los textos a traducir se traducirán automáticamente.',
    showProgressPopupLabel: 'Mostrar ventana emergente de progreso:',
    showProgressPopupHelp: 'Alternar si se debe mostrar una ventana emergente durante la traducción.',
    excludeListLabel: 'Lista de sitios a excluir:',
    excludeListHelp: 'Ingrese cada URL en una nueva línea. Los sitios listados aquí no se traducirán automáticamente.',
    saveBtn: 'Guardar configuración',
    savedSettings: '¡Configuración guardada!'
  },
  it: {
    pageTitle: 'Impostazioni del traduttore di siti web LLM',
    header: 'Impostazioni del traduttore di siti web LLM',
    apiProviderLabel: 'Fornitore API:',
    apiProviderHelp: 'Scegli il fornitore API da utilizzare per la traduzione.',
    apiKeyLabel: 'Chiave API:',
    apiKeyHelpGemini: 'Ottieni la tua chiave API da <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Ottieni la tua chiave API da <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Ottieni la tua chiave API da <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Ottieni la tua chiave API da <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Ottieni la tua chiave API da <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Inserisci la tua chiave API Gemini',
    apiKeyPlaceholderOpenAI: 'Inserisci la tua chiave API OpenAI',
    apiKeyPlaceholderDeepSeek: 'Inserisci la tua chiave API DeepSeek',
    apiKeyPlaceholderAnthropic: 'Inserisci la tua chiave API Anthropic',
    apiKeyPlaceholderXAI: 'Inserisci la tua chiave API xAI',
    aiModelLabel: 'Modello AI:',
    aiModelHelpGemini: 'Se lasciato vuoto, verrà utilizzato gemini-2.0-flash-lite.',
    aiModelHelpOpenAI: 'Se lasciato vuoto, verrà utilizzato gpt-4o-mini.',
    aiModelHelpDeepSeek: 'Se lasciato vuoto, verrà utilizzato deepseek-chat.',
    aiModelHelpAnthropic: 'Se lasciato vuoto, verrà utilizzato claude-3-5-haiku-20241022.',
    aiModelHelpXAI: 'Se lasciato vuoto, verrà utilizzato grok-2-1212.',
    aiModelPlaceholderGemini: 'es. gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'es. gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'es. deepseek-chat',
    aiModelPlaceholderAnthropic: 'es. claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'es. grok-2-1212',
    batchSizeLabel: 'Dimensione del lotto (numero di testi):',
    batchSizeHelp: 'Numero di testi da tradurre contemporaneamente. Valori più alti sono più efficienti, ma troppi possono causare errori.',
    maxBatchLengthLabel: 'Lunghezza massima del lotto (caratteri):',
    maxBatchLengthHelp: 'Massimo totale di caratteri in un lotto. Se superato, il lotto verrà diviso.',
    delayBetweenRequestsLabel: 'Ritardo tra le richieste (ms):',
    delayBetweenRequestsHelp: 'Tempo di attesa tra le chiamate API. Ritardi più lunghi possono aiutare a evitare errori di limite di tasso.',
    maxTokenLabel: 'Numero massimo di token:',
    maxTokenHelp: 'Numero massimo di token per le richieste API.',
    toggleBlueBackgroundLabel: 'Sfondo blu per il testo tradotto:',
    toggleBlueBackgroundHelp: 'Attiva/disattiva l\'applicazione di uno sfondo blu ai testi tradotti.',
    autoTranslationLabel: 'Traduzione automatica:',
    autoTranslationHelp: 'Se abilitato, i testi da tradurre saranno tradotti automaticamente.',
    showProgressPopupLabel: 'Mostra popup di progresso:',
    showProgressPopupHelp: 'Attiva/disattiva la visualizzazione di un popup durante la traduzione.',
    excludeListLabel: 'Elenco dei siti da escludere:',
    excludeListHelp: 'Inserisci ogni URL su una nuova riga. I siti elencati qui non verranno tradotti automaticamente.',
    saveBtn: 'Salva impostazioni',
    savedSettings: 'Impostazioni salvate!'
  },
  pt: {
    pageTitle: 'Configurações do Tradutor de Sites LLM',
    header: 'Configurações do Tradutor de Sites LLM',
    apiProviderLabel: 'Provedor de API:',
    apiProviderHelp: 'Escolha o provedor de API para usar na tradução.',
    apiKeyLabel: 'Chave API:',
    apiKeyHelpGemini: 'Obtenha sua chave API no <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Obtenha sua chave API no <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Obtenha sua chave API no <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Obtenha sua chave API no <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Obtenha sua chave API no <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Digite sua chave API do Gemini',
    apiKeyPlaceholderOpenAI: 'Digite sua chave API do OpenAI',
    apiKeyPlaceholderDeepSeek: 'Digite sua chave API do DeepSeek',
    apiKeyPlaceholderAnthropic: 'Digite sua chave API do Anthropic',
    apiKeyPlaceholderXAI: 'Digite sua chave API do xAI',
    aiModelLabel: 'Modelo de IA:',
    aiModelHelpGemini: 'Se deixado em branco, gemini-2.0-flash-lite será usado.',
    aiModelHelpOpenAI: 'Se deixado em branco, gpt-4o-mini será usado.',
    aiModelHelpDeepSeek: 'Se deixado em branco, deepseek-chat será usado.',
    aiModelHelpAnthropic: 'Se deixado em branco, claude-3-5-haiku-20241022 será usado.',
    aiModelHelpXAI: 'Se deixado em branco, grok-2-1212 será usado.',
    aiModelPlaceholderGemini: 'ex.: gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'ex.: gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'ex.: deepseek-chat',
    aiModelPlaceholderAnthropic: 'ex.: claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'ex.: grok-2-1212',
    batchSizeLabel: 'Tamanho do lote (número de textos):',
    batchSizeHelp: 'Número de textos a traduzir de uma vez. Valores mais altos são mais eficientes, mas muitos podem causar erros.',
    maxBatchLengthLabel: 'Comprimento máximo do lote (caracteres):',
    maxBatchLengthHelp: 'Máximo total de caracteres em um lote. Se excedido, o lote será dividido.',
    delayBetweenRequestsLabel: 'Atraso entre solicitações (ms):',
    delayBetweenRequestsHelp: 'Tempo de espera entre chamadas à API. Atrasos mais longos podem ajudar a evitar erros de limite de taxa.',
    maxTokenLabel: 'Número máximo de tokens:',
    maxTokenHelp: 'Número máximo de tokens para solicitações API.',
    toggleBlueBackgroundLabel: 'Fundo azul para texto traduzido:',
    toggleBlueBackgroundHelp: 'Alternar se deve aplicar um fundo azul aos textos traduzidos.',
    autoTranslationLabel: 'Tradução automática:',
    autoTranslationHelp: 'Se habilitado, os textos a serem traduzidos serão traduzidos automaticamente.',
    showProgressPopupLabel: 'Mostrar popup de progresso:',
    showProgressPopupHelp: 'Alternar se deve exibir um popup durante a tradução.',
    excludeListLabel: 'Lista de sites a excluir:',
    excludeListHelp: 'Digite cada URL em uma nova linha. Os sites listados aqui não serão traduzidos automaticamente.',
    saveBtn: 'Salvar configurações',
    savedSettings: 'Configurações salvas!'
  },
  ru: {
    pageTitle: 'Настройки переводчика сайтов LLM',
    header: 'Настройки переводчика сайтов LLM',
    apiProviderLabel: 'Провайдер API:',
    apiProviderHelp: 'Выберите провайдера API для использования в переводе.',
    apiKeyLabel: 'API-ключ:',
    apiKeyHelpGemini: 'Получите ваш API-ключ на <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Получите ваш API-ключ на <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Получите ваш API-ключ на <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Получите ваш API-ключ на <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Получите ваш API-ключ на <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Введите ваш API-ключ Gemini',
    apiKeyPlaceholderOpenAI: 'Введите ваш API-ключ OpenAI',
    apiKeyPlaceholderDeepSeek: 'Введите ваш API-ключ DeepSeek',
    apiKeyPlaceholderAnthropic: 'Введите ваш API-ключ Anthropic',
    apiKeyPlaceholderXAI: 'Введите ваш API-ключ xAI',
    aiModelLabel: 'Модель ИИ:',
    aiModelHelpGemini: 'Если оставить пустым, будет использоваться gemini-2.0-flash-lite.',
    aiModelHelpOpenAI: 'Если оставить пустым, будет использоваться gpt-4o-mini.',
    aiModelHelpDeepSeek: 'Если оставить пустым, будет использоваться deepseek-chat.',
    aiModelHelpAnthropic: 'Если оставить пустым, будет использоваться claude-3-5-haiku-20241022.',
    aiModelHelpXAI: 'Если оставить пустым, будет использоваться grok-2-1212.',
    aiModelPlaceholderGemini: 'напр., gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'напр., gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'напр., deepseek-chat',
    aiModelPlaceholderAnthropic: 'напр., claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'напр., grok-2-1212',
    batchSizeLabel: 'Размер партии (количество текстов):',
    batchSizeHelp: 'Количество текстов для перевода за один раз. Более высокие значения более эффективны, но слишком много может вызвать ошибки.',
    maxBatchLengthLabel: 'Максимальная длина партии (символы):',
    maxBatchLengthHelp: 'Максимальное общее количество символов в партии. При превышении партия будет разделена.',
    delayBetweenRequestsLabel: 'Задержка между запросами (мс):',
    delayBetweenRequestsHelp: 'Время ожидания между вызовами API. Более длительные задержки могут помочь избежать ошибок ограничения скорости.',
    maxTokenLabel: 'Максимальное количество токенов:',
    maxTokenHelp: 'Максимальное количество токенов для запросов API.',
    toggleBlueBackgroundLabel: 'Синий фон для переведенного текста:',
    toggleBlueBackgroundHelp: 'Переключить, применять ли синий фон к переведенным текстам.',
    autoTranslationLabel: 'Автоматический перевод:',
    autoTranslationHelp: 'Если включено, тексты для перевода будут переведены автоматически.',
    showProgressPopupLabel: 'Показать всплывающее окно прогресса:',
    showProgressPopupHelp: 'Переключить, отображать ли всплывающее окно во время перевода.',
    excludeListLabel: 'Список сайтов для исключения:',
    excludeListHelp: 'Введите каждую URL-адрес на новой строке. Сайты, перечисленные здесь, не будут автоматически переводиться.',
    saveBtn: 'Сохранить настройки',
    savedSettings: 'Настройки сохранены!'
  },
  zh: {
    pageTitle: 'LLM 网站翻译设置',
    header: 'LLM 网站翻译设置',
    apiProviderLabel: 'API 提供商:',
    apiProviderHelp: '选择用于翻译的 API 提供商。',
    apiKeyLabel: 'API 密钥:',
    apiKeyHelpGemini: '从 <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a> 获取您的 API 密钥。',
    apiKeyHelpOpenAI: '从 <a href="https://platform.openai.com/" target="_blank">OpenAI</a> 获取您的 API 密钥。',
    apiKeyHelpDeepSeek: '从 <a href="https://deepseek.com/" target="_blank">DeepSeek</a> 获取您的 API 密钥。',
    apiKeyHelpAnthropic: '从 <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a> 获取您的 API 密钥。',
    apiKeyHelpXAI: '从 <a href="https://xai.com/" target="_blank">xAI</a> 获取您的 API 密钥。',
    apiKeyPlaceholderGemini: '输入您的 Gemini API 密钥',
    apiKeyPlaceholderOpenAI: '输入您的 OpenAI API 密钥',
    apiKeyPlaceholderDeepSeek: '输入您的 DeepSeek API 密钥',
    apiKeyPlaceholderAnthropic: '输入您的 Anthropic API 密钥',
    apiKeyPlaceholderXAI: '输入您的 xAI API 密钥',
    aiModelLabel: 'AI 模型:',
    aiModelHelpGemini: '如果留空，将使用 gemini-2.0-flash-lite。',
    aiModelHelpOpenAI: '如果留空，将使用 gpt-4o-mini。',
    aiModelHelpDeepSeek: '如果留空，将使用 deepseek-chat。',
    aiModelHelpAnthropic: '如果留空，将使用 claude-3-5-haiku-20241022。',
    aiModelHelpXAI: '如果留空，将使用 grok-2-1212。',
    aiModelPlaceholderGemini: '例如：gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: '例如：gpt-4o-mini',
    aiModelPlaceholderDeepSeek: '例如：deepseek-chat',
    aiModelPlaceholderAnthropic: '例如：claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: '例如：grok-2-1212',
    batchSizeLabel: '批处理大小 (文本数量):',
    batchSizeHelp: '一次翻译的文本数量。数值越高效率越高，但过多可能导致错误。',
    maxBatchLengthLabel: '批处理最大长度 (字符数):',
    maxBatchLengthHelp: '批处理中所有文本的最大字符数。超出此值时将拆分批处理。',
    delayBetweenRequestsLabel: '请求间隔 (毫秒):',
    delayBetweenRequestsHelp: 'API 调用之间的等待时间。较长的等待可以帮助避免请求限制错误。',
    maxTokenLabel: '最大令牌数:',
    maxTokenHelp: 'API 请求的最大令牌数。',
    toggleBlueBackgroundLabel: '翻译文本蓝色背景:',
    toggleBlueBackgroundHelp: '切换是否为翻译后的文本应用蓝色背景。',
    autoTranslationLabel: '自动翻译:',
    autoTranslationHelp: '如果启用，将自动翻译需要翻译的文本。',
    showProgressPopupLabel: '显示进度弹窗:',
    showProgressPopupHelp: '切换是否在翻译期间显示进度弹窗。',
    excludeListLabel: '排除翻译的网站列表:',
    excludeListHelp: '每行输入一个 URL。此列表中的网站将不会被自动翻译。',
    saveBtn: '保存设置',
    savedSettings: '设置已保存！'
  },
  ko: {
    pageTitle: 'LLM 웹사이트 번역 설정',
    header: 'LLM 웹사이트 번역 설정',
    apiProviderLabel: 'API 제공자:',
    apiProviderHelp: '번역에 사용할 API 제공자를 선택하세요.',
    apiKeyLabel: 'API 키:',
    apiKeyHelpGemini: '<a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>에서 API 키를 받으세요.',
    apiKeyHelpOpenAI: '<a href="https://platform.openai.com/" target="_blank">OpenAI</a>에서 API 키를 받으세요.',
    apiKeyHelpDeepSeek: '<a href="https://deepseek.com/" target="_blank">DeepSeek</a>에서 API 키를 받으세요.',
    apiKeyHelpAnthropic: '<a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>에서 API 키를 받으세요.',
    apiKeyHelpXAI: '<a href="https://xai.com/" target="_blank">xAI</a>에서 API 키를 받으세요.',
    apiKeyPlaceholderGemini: 'Gemini API 키를 입력하세요',
    apiKeyPlaceholderOpenAI: 'OpenAI API 키를 입력하세요',
    apiKeyPlaceholderDeepSeek: 'DeepSeek API 키를 입력하세요',
    apiKeyPlaceholderAnthropic: 'Anthropic API 키를 입력하세요',
    apiKeyPlaceholderXAI: 'xAI API 키를 입력하세요',
    aiModelLabel: 'AI 모델:',
    aiModelHelpGemini: '비워두면 gemini-2.0-flash-lite가 사용됩니다.',
    aiModelHelpOpenAI: '비워두면 gpt-4o-mini가 사용됩니다.',
    aiModelHelpDeepSeek: '비워두면 deepseek-chat가 사용됩니다.',
    aiModelHelpAnthropic: '비워두면 claude-3-5-haiku-20241022가 사용됩니다.',
    aiModelHelpXAI: '비워두면 grok-2-1212가 사용됩니다.',
    aiModelPlaceholderGemini: '예: gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: '예: gpt-4o-mini',
    aiModelPlaceholderDeepSeek: '예: deepseek-chat',
    aiModelPlaceholderAnthropic: '예: claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: '예: grok-2-1212',
    batchSizeLabel: '배치 크기 (텍스트 수):',
    batchSizeHelp: '한 번에 번역할 텍스트의 수. 숫자가 클수록 효율적이지만, 너무 많으면 오류가 발생할 수 있습니다.',
    maxBatchLengthLabel: '최대 배치 길이 (문자 수):',
    maxBatchLengthHelp: '배치 내 텍스트의 총 최대 문자 수. 이 수치를 초과하면 배치가 분할됩니다.',
    delayBetweenRequestsLabel: '요청 간격 (ms):',
    delayBetweenRequestsHelp: 'API 호출 간 대기 시간. 대기 시간이 길면 요청 제한 오류를 피할 수 있습니다.',
    maxTokenLabel: '최대 토큰 수:',
    maxTokenHelp: 'API 요청의 최대 토큰 수.',
    toggleBlueBackgroundLabel: '번역된 텍스트 파란색 배경:',
    toggleBlueBackgroundHelp: '번역된 텍스트에 파란색 배경을 적용할지 여부를 전환합니다.',
    autoTranslationLabel: '자동 번역:',
    autoTranslationHelp: '켜면 번역 대상 텍스트가 자동으로 번역됩니다.',
    showProgressPopupLabel: '진행 상황 팝업 표시:',
    showProgressPopupHelp: '번역 중 진행 상황을 보여주는 팝업을 표시할지 여부를 전환합니다.',
    excludeListLabel: '번역 제외 사이트 목록:',
    excludeListHelp: '각 URL을 줄 바꿈으로 구분하여 입력하세요. 이 목록의 사이트는 자동 번역되지 않습니다.',
    saveBtn: '설정 저장',
    savedSettings: '설정이 저장되었습니다!'
  },
  hi: {
    pageTitle: 'LLM वेबसाइट अनुवादक सेटिंग्स',
    header: 'LLM वेबसाइट अनुवादक सेटिंग्स',
    apiProviderLabel: 'API प्रदाता:',
    apiProviderHelp: 'अनुवाद के लिए उपयोग करने के लिए API प्रदाता का चयन करें।',
    apiKeyLabel: 'API कुंजी:',
    apiKeyHelpGemini: '<a href="https://ai.google.dev/" target="_blank">Google AI Studio</a> से अपनी API कुंजी प्राप्त करें।',
    apiKeyHelpOpenAI: '<a href="https://platform.openai.com/" target="_blank">OpenAI</a> से अपनी API कुंजी प्राप्त करें।',
    apiKeyHelpDeepSeek: '<a href="https://deepseek.com/" target="_blank">DeepSeek</a> से अपनी API कुंजी प्राप्त करें।',
    apiKeyHelpAnthropic: '<a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a> से अपनी API कुंजी प्राप्त करें।',
    apiKeyHelpXAI: '<a href="https://xai.com/" target="_blank">xAI</a> से अपनी API कुंजी प्राप्त करें।',
    apiKeyPlaceholderGemini: 'अपनी जेमिनी API कुंजी दर्ज करें',
    apiKeyPlaceholderOpenAI: 'अपनी OpenAI API कुंजी दर्ज करें',
    apiKeyPlaceholderDeepSeek: 'अपनी DeepSeek API कुंजी दर्ज करें',
    apiKeyPlaceholderAnthropic: 'अपनी Anthropic API कुंजी दर्ज करें',
    apiKeyPlaceholderXAI: 'अपनी xAI API कुंजी दर्ज करें',
    aiModelLabel: 'AI मॉडल:',
    aiModelHelpGemini: 'यदि खाली छोड़ दिया जाता है, तो gemini-2.0-flash-lite का उपयोग किया जाएगा।',
    aiModelHelpOpenAI: 'यदि खाली छोड़ दिया जाता है, तो gpt-4o-mini का उपयोग किया जाएगा।',
    aiModelHelpDeepSeek: 'यदि खाली छोड़ दिया जाता है, तो deepseek-chat का उपयोग किया जाएगा।',
    aiModelHelpAnthropic: 'यदि खाली छोड़ दिया जाता है, तो claude-3-5-haiku-20241022 का उपयोग किया जाएगा।',
    aiModelHelpXAI: 'यदि खाली छोड़ दिया जाता है, तो grok-2-1212 का उपयोग किया जाएगा।',
    aiModelPlaceholderGemini: 'जैसे, gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'जैसे, gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'जैसे, deepseek-chat',
    aiModelPlaceholderAnthropic: 'जैसे, claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'जैसे, grok-2-1212',
    batchSizeLabel: 'बैच आकार (पाठों की संख्या):',
    batchSizeHelp: 'एक बार में अनुवाद करने के लिए पाठों की संख्या। अधिक होना अधिक कुशल है, लेकिन बहुत अधिक होने से त्रुटियाँ हो सकती हैं।',
    maxBatchLengthLabel: 'अधिकतम बैच लंबाई (अक्षर):',
    maxBatchLengthHelp: 'एक बैच में कुल अधिकतम अक्षर। यदि अधिक हो जाता है, तो बैच को विभाजित किया जाएगा।',
    delayBetweenRequestsLabel: 'अनुरोधों के बीच विलंब (मिलीसेकंड):',
    delayBetweenRequestsHelp: 'API कॉल के बीच प्रतीक्षा समय। लंबे विलंब दर सीमा त्रुटियों से बचने में मदद कर सकते हैं।',
    maxTokenLabel: 'अधिकतम टोकन:',
    maxTokenHelp: 'API अनुरोधों के लिए अधिकतम टोकन की संख्या।',
    toggleBlueBackgroundLabel: 'अनुवादित पाठ का नीला पृष्ठभूमि:',
    toggleBlueBackgroundHelp: 'अनुवादित पाठों पर नीला पृष्ठभूमि लागू करना है या नहीं।',
    autoTranslationLabel: 'स्वचालित अनुवाद:',
    autoTranslationHelp: 'यदि सक्षम है, तो अनुवाद करने के लिए पाठ स्वचालित रूप से अनुवादित किए जाएंगे।',
    showProgressPopupLabel: 'प्रगति पॉपअप दिखाएं:',
    showProgressPopupHelp: 'अनुवाद के दौरान प्रगति दिखाने वाले पॉपअप को प्रदर्शित करना है या नहीं।',
    excludeListLabel: 'बहिष्कृत साइटों की सूची:',
    excludeListHelp: 'प्रत्येक URL को एक नई पंक्ति पर दर्ज करें। यहाँ सूचीबद्ध साइटें स्वचालित रूप से अनुवादित नहीं की जाएंगी।',
    saveBtn: 'सेटिंग्स सहेजें',
    savedSettings: 'सेटिंग्स सहेजी गईं!'
  },
  ar: {
    pageTitle: 'إعدادات مترجم مواقع الويب LLM',
    header: 'إعدادات مترجم مواقع الويب LLM',
    apiProviderLabel: 'مزود API:',
    apiProviderHelp: 'اختر مزود API لاستخدامه في الترجمة.',
    apiKeyLabel: 'مفتاح API:',
    apiKeyHelpGemini: 'احصل على مفتاح API الخاص بك من <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'احصل على مفتاح API الخاص بك من <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'احصل على مفتاح API الخاص بك من <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'احصل على مفتاح API الخاص بك من <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'احصل على مفتاح API الخاص بك من <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'أدخل مفتاح API الخاص بك لـ Gemini',
    apiKeyPlaceholderOpenAI: 'أدخل مفتاح API الخاص بك لـ OpenAI',
    apiKeyPlaceholderDeepSeek: 'أدخل مفتاح API الخاص بك لـ DeepSeek',
    apiKeyPlaceholderAnthropic: 'أدخل مفتاح API الخاص بك لـ Anthropic',
    apiKeyPlaceholderXAI: 'أدخل مفتاح API الخاص بك لـ xAI',
    aiModelLabel: 'نموذج AI:',
    aiModelHelpGemini: 'إذا تُرك فارغًا، سيتم استخدام gemini-2.0-flash-lite.',
    aiModelHelpOpenAI: 'إذا تُرك فارغًا، سيتم استخدام gpt-4o-mini.',
    aiModelHelpDeepSeek: 'إذا تُرك فارغًا، سيتم استخدام deepseek-chat.',
    aiModelHelpAnthropic: 'إذا تُرك فارغًا، سيتم استخدام claude-3-5-haiku-20241022.',
    aiModelHelpXAI: 'إذا تُرك فارغًا، سيتم استخدام grok-2-1212.',
    aiModelPlaceholderGemini: 'مثل، gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'مثل، gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'مثل، deepseek-chat',
    aiModelPlaceholderAnthropic: 'مثل، claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'مثل، grok-2-1212',
    batchSizeLabel: 'حجم الدفعة (عدد النصوص):',
    batchSizeHelp: 'عدد النصوص المراد ترجمتها في وقت واحد. القيم الأعلى أكثر كفاءة، ولكن الكثير قد يسبب أخطاء.',
    maxBatchLengthLabel: 'أقصى طول للدفعة (أحرف):',
    maxBatchLengthHelp: 'الحد الأقصى لعدد الأحرف في الدفعة. إذا تم تجاوزه، سيتم تقسيم الدفعة.',
    delayBetweenRequestsLabel: 'التأخير بين الطلبات (مللي ثانية):',
    delayBetweenRequestsHelp: 'وقت الانتظار بين استدعاءات API. التأخيرات الأطول يمكن أن تساعد في تجنب أخطاء حد السرعة.',
    maxTokenLabel: 'الحد الأقصى للرموز:',
    maxTokenHelp: 'الحد الأقصى لعدد الرموز لاستدعاءات API.',
    toggleBlueBackgroundLabel: 'خلفية زرقاء للنص المترجم:',
    toggleBlueBackgroundHelp: 'تبديل ما إذا كان يجب تطبيق خلفية زرقاء على النصوص المترجمة.',
    autoTranslationLabel: 'الترجمة التلقائية:',
    autoTranslationHelp: 'إذا تم تمكينه، سيتم ترجمة النصوص المراد ترجمتها تلقائيًا.',
    showProgressPopupLabel: 'إظهار نافذة التقدم:',
    showProgressPopupHelp: 'تبديل ما إذا كان يجب عرض نافذة منبثقة أثناء الترجمة.',
    excludeListLabel: 'قائمة المواقع المستبعدة:',
    excludeListHelp: 'أدخل كل URL في سطر جديد. لن يتم ترجمة المواقع المدرجة هنا تلقائيًا.',
    saveBtn: 'حفظ الإعدادات',
    savedSettings: 'تم حفظ الإعدادات!'
  },
  bn: {
    pageTitle: 'LLM ওয়েবসাইট অনুবাদক সেটিংস',
    header: 'LLM ওয়েবসাইট অনুবাদক সেটিংস',
    apiProviderLabel: 'API প্রদানকারী:',
    apiProviderHelp: 'অনুবাদের জন্য ব্যবহার করার জন্য API প্রদানকারী নির্বাচন করুন।',
    apiKeyLabel: 'API কী:',
    apiKeyHelpGemini: '<a href="https://ai.google.dev/" target="_blank">Google AI Studio</a> থেকে আপনার API কী পান।',
    apiKeyHelpOpenAI: '<a href="https://platform.openai.com/" target="_blank">OpenAI</a> থেকে আপনার API কী পান।',
    apiKeyHelpDeepSeek: '<a href="https://deepseek.com/" target="_blank">DeepSeek</a> থেকে আপনার API কী পান।',
    apiKeyHelpAnthropic: '<a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a> থেকে আপনার API কী পান।',
    apiKeyHelpXAI: '<a href="https://xai.com/" target="_blank">xAI</a> থেকে আপনার API কী পান।',
    apiKeyPlaceholderGemini: 'আপনার জেমিনি API কী লিখুন',
    apiKeyPlaceholderOpenAI: 'আপনার OpenAI API কী লিখুন',
    apiKeyPlaceholderDeepSeek: 'আপনার DeepSeek API কী লিখুন',
    apiKeyPlaceholderAnthropic: 'আপনার Anthropic API কী লিখুন',
    apiKeyPlaceholderXAI: 'আপনার xAI API কী লিখুন',
    aiModelLabel: 'AI মডেল:',
    aiModelHelpGemini: 'যদি ফাঁকা রাখা হয়, তবে gemini-2.0-flash-lite ব্যবহার করা হবে।',
    aiModelHelpOpenAI: 'যদি ফাঁকা রাখা হয়, তবে gpt-4o-mini ব্যবহার করা হবে।',
    aiModelHelpDeepSeek: 'যদি ফাঁকা রাখা হয়, তবে deepseek-chat ব্যবহার করা হবে।',
    aiModelHelpAnthropic: 'যদি ফাঁকা রাখা হয়, তবে claude-3-5-haiku-20241022 ব্যবহার করা হবে।',
    aiModelHelpXAI: 'যদি ফাঁকা রাখা হয়, তবে grok-2-1212 ব্যবহার করা হবে।',
    aiModelPlaceholderGemini: 'যেমন, gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'যেমন, gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'যেমন, deepseek-chat',
    aiModelPlaceholderAnthropic: 'যেমন, claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'যেমন, grok-2-1212',
    batchSizeLabel: 'ব্যাচের আকার (টেক্সটের সংখ্যা):',
    batchSizeHelp: 'একবারে অনুবাদ করার জন্য টেক্সটের সংখ্যা। বেশি হলে দক্ষতা বাড়ে, কিন্তু অতিরিক্ত হলে ত্রুটি হতে পারে।',
    maxBatchLengthLabel: 'সর্বাধিক ব্যাচের দৈর্ঘ্য (অক্ষর):',
    maxBatchLengthHelp: 'একটি ব্যাচে মোট সর্বাধিক অক্ষর। এটি অতিক্রম করলে ব্যাচটি বিভক্ত হবে।',
    delayBetweenRequestsLabel: 'অনুরোধের মধ্যে বিলম্ব (মিলিসেকেন্ড):',
    delayBetweenRequestsHelp: 'API কলের মধ্যে অপেক্ষার সময়। দীর্ঘ বিলম্ব হার সীমা ত্রুটি এড়াতে সাহায্য করতে পারে।',
    maxTokenLabel: 'সর্বাধিক টোকেন:',
    maxTokenHelp: 'API অনুরোধের জন্য সর্বাধিক টোকেনের সংখ্যা।',
    toggleBlueBackgroundLabel: 'অনুবাদিত টেক্সটের নীল পটভূমি:',
    toggleBlueBackgroundHelp: 'অনুবাদিত টেক্সটে নীল পটভূমি প্রয়োগ করা হবে কিনা তা টগল করুন।',
    autoTranslationLabel: 'স্বয়ংক্রিয় অনুবাদ:',
    autoTranslationHelp: 'যদি সক্ষম করা হয়, তবে অনুবাদ করার জন্য টেক্সটগুলি স্বয়ংক্রিয়ভাবে অনুবাদিত হবে।',
    showProgressPopupLabel: 'অগ্রগতি পপআপ দেখান:',
    showProgressPopupHelp: 'অনুবাদের সময় অগ্রগতি দেখানো পপআপ প্রদর্শন করা হবে কিনা তা টগল করুন।',
    excludeListLabel: 'বাদ দেওয়া সাইটগুলির তালিকা:',
    excludeListHelp: 'প্রতিটি URL একটি নতুন লাইনে লিখুন। এখানে তালিকাভুক্ত সাইটগুলি স্বয়ংক্রিয়ভাবে অনুবাদিত হবে না।',
    saveBtn: 'সেটিংস সংরক্ষণ করুন',
    savedSettings: 'সেটিংস সংরক্ষিত হয়েছে!'
  },
  id: {
    pageTitle: 'Pengaturan Penerjemah Situs Web LLM',
    header: 'Pengaturan Penerjemah Situs Web LLM',
    apiProviderLabel: 'Penyedia API:',
    apiProviderHelp: 'Pilih penyedia API untuk digunakan dalam penerjemahan.',
    apiKeyLabel: 'Kunci API:',
    apiKeyHelpGemini: 'Dapatkan kunci API Anda dari <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>.',
    apiKeyHelpOpenAI: 'Dapatkan kunci API Anda dari <a href="https://platform.openai.com/" target="_blank">OpenAI</a>.',
    apiKeyHelpDeepSeek: 'Dapatkan kunci API Anda dari <a href="https://deepseek.com/" target="_blank">DeepSeek</a>.',
    apiKeyHelpAnthropic: 'Dapatkan kunci API Anda dari <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>.',
    apiKeyHelpXAI: 'Dapatkan kunci API Anda dari <a href="https://xai.com/" target="_blank">xAI</a>.',
    apiKeyPlaceholderGemini: 'Masukkan kunci API Gemini Anda',
    apiKeyPlaceholderOpenAI: 'Masukkan kunci API OpenAI Anda',
    apiKeyPlaceholderDeepSeek: 'Masukkan kunci API DeepSeek Anda',
    apiKeyPlaceholderAnthropic: 'Masukkan kunci API Anthropic Anda',
    apiKeyPlaceholderXAI: 'Masukkan kunci API xAI Anda',
    aiModelLabel: 'Model AI:',
    aiModelHelpGemini: 'Jika dibiarkan kosong, gemini-2.0-flash-lite akan digunakan.',
    aiModelHelpOpenAI: 'Jika dibiarkan kosong, gpt-4o-mini akan digunakan.',
    aiModelHelpDeepSeek: 'Jika dibiarkan kosong, deepseek-chat akan digunakan.',
    aiModelHelpAnthropic: 'Jika dibiarkan kosong, claude-3-5-haiku-20241022 akan digunakan.',
    aiModelHelpXAI: 'Jika dibiarkan kosong, grok-2-1212 akan digunakan.',
    aiModelPlaceholderGemini: 'mis., gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'mis., gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'mis., deepseek-chat',
    aiModelPlaceholderAnthropic: 'mis., claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'mis., grok-2-1212',
    batchSizeLabel: 'Ukuran Batch (Jumlah Teks):',
    batchSizeHelp: 'Jumlah teks yang diterjemahkan sekaligus. Lebih tinggi lebih efisien, tetapi terlalu banyak dapat menyebabkan kesalahan.',
    maxBatchLengthLabel: 'Panjang Batch Maksimum (Karakter):',
    maxBatchLengthHelp: 'Jumlah maksimum karakter dalam sebuah batch. Jika melebihi, batch akan dibagi.',
    delayBetweenRequestsLabel: 'Penundaan Antara Permintaan (ms):',
    delayBetweenRequestsHelp: 'Waktu tunggu antara panggilan API. Penundaan yang lebih lama dapat membantu menghindari kesalahan batas kecepatan.',
    maxTokenLabel: 'Token Maksimum:',
    maxTokenHelp: 'Jumlah token maksimum untuk permintaan API.',
    toggleBlueBackgroundLabel: 'Latar Belakang Biru untuk Teks Terjemahan:',
    toggleBlueBackgroundHelp: 'Beralih apakah akan menerapkan latar belakang biru pada teks terjemahan.',
    autoTranslationLabel: 'Terjemahan Otomatis:',
    autoTranslationHelp: 'Jika diaktifkan, teks yang akan diterjemahkan akan diterjemahkan secara otomatis.',
    showProgressPopupLabel: 'Tampilkan Popup Kemajuan:',
    showProgressPopupHelp: 'Beralih apakah akan menampilkan popup selama penerjemahan.',
    excludeListLabel: 'Daftar Situs yang Dikecualikan:',
    excludeListHelp: 'Masukkan setiap URL pada baris baru. Situs yang tercantum di sini tidak akan diterjemahkan secara otomatis.',
    saveBtn: 'Simpan Pengaturan',
    savedSettings: 'Pengaturan disimpan!'
  },
  tr: {
    pageTitle: 'LLM Web Sitesi Çevirmeni Ayarları',
    header: 'LLM Web Sitesi Çevirmeni Ayarları',
    apiProviderLabel: 'API Sağlayıcı:',
    apiProviderHelp: 'Çeviri için kullanılacak API sağlayıcısını seçin.',
    apiKeyLabel: 'API Anahtarı:',
    apiKeyHelpGemini: '<a href="https://ai.google.dev/" target="_blank">Google AI Studio</a>\'dan API anahtarınızı alın.',
    apiKeyHelpOpenAI: '<a href="https://platform.openai.com/" target="_blank">OpenAI</a>\'dan API anahtarınızı alın.',
    apiKeyHelpDeepSeek: '<a href="https://deepseek.com/" target="_blank">DeepSeek</a>\'dan API anahtarınızı alın.',
    apiKeyHelpAnthropic: '<a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>\'dan API anahtarınızı alın.',
    apiKeyHelpXAI: '<a href="https://xai.com/" target="_blank">xAI</a>\'dan API anahtarınızı alın.',
    apiKeyPlaceholderGemini: 'Gemini API anahtarınızı girin',
    apiKeyPlaceholderOpenAI: 'OpenAI API anahtarınızı girin',
    apiKeyPlaceholderDeepSeek: 'DeepSeek API anahtarınızı girin',
    apiKeyPlaceholderAnthropic: 'Anthropic API anahtarınızı girin',
    apiKeyPlaceholderXAI: 'xAI API anahtarınızı girin',
    aiModelLabel: 'AI Modeli:',
    aiModelHelpGemini: 'Boş bırakılırsa, gemini-2.0-flash-lite kullanılır.',
    aiModelHelpOpenAI: 'Boş bırakılırsa, gpt-4o-mini kullanılır.',
    aiModelHelpDeepSeek: 'Boş bırakılırsa, deepseek-chat kullanılır.',
    aiModelHelpAnthropic: 'Boş bırakılırsa, claude-3-5-haiku-20241022 kullanılır.',
    aiModelHelpXAI: 'Boş bırakılırsa, grok-2-1212 kullanılır.',
    aiModelPlaceholderGemini: 'ör., gemini-2.0-flash-lite',
    aiModelPlaceholderOpenAI: 'ör., gpt-4o-mini',
    aiModelPlaceholderDeepSeek: 'ör., deepseek-chat',
    aiModelPlaceholderAnthropic: 'ör., claude-3-5-haiku-20241022',
    aiModelPlaceholderXAI: 'ör., grok-2-1212',
    batchSizeLabel: 'Toplu Boyutu (Metin Sayısı):',
    batchSizeHelp: 'Bir seferde çevrilecek metin sayısı. Daha yüksek verimlidir, ancak çok fazla hata oluşturabilir.',
    maxBatchLengthLabel: 'Maksimum Toplu Uzunluğu (Karakter):',
    maxBatchLengthHelp: 'Bir topluda maksimum karakter sayısı. Aşılırsa, toplu bölünecektir.',
    delayBetweenRequestsLabel: 'İstekler Arası Gecikme (ms):',
    delayBetweenRequestsHelp: 'API çağrıları arasındaki bekleme süresi. Daha uzun gecikmeler, oran sınır hatalarını önlemeye yardımcı olabilir.',
    maxTokenLabel: 'Maksimum Token:',
    maxTokenHelp: 'API istekleri için maksimum token sayısı.',
    toggleBlueBackgroundLabel: 'Çevrilen Metin Mavi Arka Planı:',
    toggleBlueBackgroundHelp: 'Çevrilen metinlere mavi arka plan uygulanmasını değiştirin.',
    autoTranslationLabel: 'Otomatik Çeviri:',
    autoTranslationHelp: 'Etkinleştirilirse, çevrilecek metinler otomatik olarak çevrilecektir.',
    showProgressPopupLabel: 'İlerleme Penceresini Göster:',
    showProgressPopupHelp: 'Çeviri sırasında ilerleme penceresini gösterip göstermemeyi değiştirin.',
    excludeListLabel: 'Hariç Tutulan Sitelerin Listesi:',
    excludeListHelp: 'Her URL\'yi yeni bir satıra girin. Burada listelenen siteler otomatik olarak çevrilmeyecektir.',
    saveBtn: 'Ayarları Kaydet',
    savedSettings: 'Ayarlar kaydedildi!'
  }
};