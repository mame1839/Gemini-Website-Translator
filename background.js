// background.js

// エラーメッセージの多言語対応
const errorTranslations = {
  en: {
    apiKeyNotSet: 'API key is not set',
    jsonParseFailed: 'Failed to parse JSON response',
    jsonExtractFailed: 'Failed to extract JSON from response',
    apiLimitReached: 'API request limit reached. Please try again later.'
  },
  ja: {
    apiKeyNotSet: 'APIキーが設定されていません',
    jsonParseFailed: '翻訳結果のJSON解析に失敗しました',
    jsonExtractFailed: '翻訳結果からJSONを抽出できませんでした',
    apiLimitReached: 'APIリクエスト制限に達しました。しばらくしてから再試行してください。'
  },
  fr: {
    apiKeyNotSet: 'La clé API n\'est pas définie',
    jsonParseFailed: 'Échec de l\'analyse de la réponse JSON',
    jsonExtractFailed: 'Impossible d\'extraire le JSON de la réponse',
    apiLimitReached: 'Limite de requêtes API atteinte. Veuillez réessayer plus tard.'
  },
  de: {
    apiKeyNotSet: 'API-Schlüssel ist nicht gesetzt',
    jsonParseFailed: 'Fehler beim Parsen der JSON-Antwort',
    jsonExtractFailed: 'JSON aus der Antwort konnte nicht extrahiert werden',
    apiLimitReached: 'API-Anfragelimit erreicht. Bitte versuchen Sie es später erneut.'
  },
  es: {
    apiKeyNotSet: 'La clave API no está configurada',
    jsonParseFailed: 'Error al analizar la respuesta JSON',
    jsonExtractFailed: 'No se pudo extraer JSON de la respuesta',
    apiLimitReached: 'Se alcanzó el límite de solicitudes API. Inténtelo de nuevo más tarde.'
  },
  it: {
    apiKeyNotSet: 'La chiave API non è impostata',
    jsonParseFailed: 'Analisi della risposta JSON non riuscita',
    jsonExtractFailed: 'Impossibile estrarre JSON dalla risposta',
    apiLimitReached: 'Limite di richieste API raggiunto. Riprova più tardi.'
  },
  pt: {
    apiKeyNotSet: 'A chave API não está definida',
    jsonParseFailed: 'Falha ao analisar a resposta JSON',
    jsonExtractFailed: 'Falha ao extrair JSON da resposta',
    apiLimitReached: 'Limite de solicitações API atingido. Tente novamente mais tarde.'
  },
  ru: {
    apiKeyNotSet: 'API-ключ не установлен',
    jsonParseFailed: 'Не удалось разобрать JSON-ответ',
    jsonExtractFailed: 'Не удалось извлечь JSON из ответа',
    apiLimitReached: 'Достигнут предел запросов API. Пожалуйста, попробуйте позже.'
  },
  zh: {
    apiKeyNotSet: 'API密钥未设置',
    jsonParseFailed: '解析JSON响应失败',
    jsonExtractFailed: '无法从响应中提取JSON',
    apiLimitReached: '已达到API请求限制。请稍后再试。'
  },
  ko: {
    apiKeyNotSet: 'API 키가 설정되지 않았습니다',
    jsonParseFailed: 'JSON 응답 구문 분석 실패',
    jsonExtractFailed: '응답에서 JSON을 추출하지 못했습니다',
    apiLimitReached: 'API 요청 한도에 도달했습니다. 나중에 다시 시도해 주세요.'
  },
  hi: {
    apiKeyNotSet: 'API कुंजी सेट नहीं है',
    jsonParseFailed: 'JSON प्रतिक्रिया का विश्लेषण करने में विफल',
    jsonExtractFailed: 'प्रतिक्रिया से JSON निकालने में विफल',
    apiLimitReached: 'API अनुरोध सीमा तक पहुंच गई है। कृपया बाद में पुन: प्रयास करें।'
  },
  ar: {
    apiKeyNotSet: 'لم يتم تعيين مفتاح API',
    jsonParseFailed: 'فشل في تحليل استجابة JSON',
    jsonExtractFailed: 'فشل في استخراج JSON من الاستجابة',
    apiLimitReached: 'تم الوصول إلى حد طلبات API. يرجى المحاولة مرة أخرى لاحقًا.'
  },
  bn: {
    apiKeyNotSet: 'API কী সেট করা হয়নি',
    jsonParseFailed: 'JSON প্রতিক্রিয়া পার্স করতে ব্যর্থ',
    jsonExtractFailed: 'প্রতিক্রিয়া থেকে JSON নিষ্কাশন করতে ব্যর্থ',
    apiLimitReached: 'API অনুরোধের সীমা পৌঁছে গেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
  },
  id: {
    apiKeyNotSet: 'Kunci API tidak diatur',
    jsonParseFailed: 'Gagal mengurai respons JSON',
    jsonExtractFailed: 'Gagal mengekstrak JSON dari respons',
    apiLimitReached: 'Batas permintaan API tercapai. Silakan coba lagi nanti.'
  },
  tr: {
    apiKeyNotSet: 'API anahtarı ayarlanmadı',
    jsonParseFailed: 'JSON yanıtı ayrıştırılamadı',
    jsonExtractFailed: 'Yanıttan JSON çıkarılamadı',
    apiLimitReached: 'API istek sınırına ulaşıldı. Lütfen daha sonra tekrar deneyin.'
  }
};

// コンテキストメニューの多言語対応
const contextMenuTranslations = {
  en: "Toggle Translation",
  ja: "翻訳の切り替え",
  fr: "Basculer la traduction",
  de: "Übersetzung umschalten",
  es: "Alternar traducción",
  it: "Attiva/disattiva traduzione",
  pt: "Alternar tradução",
  ru: "Переключить перевод",
  zh: "切换翻译",
  ko: "번역 전환",
  hi: "अनुवाद टॉगल करें",
  ar: "تبديل الترجمة",
  bn: "অনুবাদ টগল করুন",
  id: "Alihkan Terjemahan",
  tr: "Çeviriyi Değiştir"
};

// リクエストキューと処理状態を管理する変数
let requestQueue = [];
let isProcessing = false;
let delayBetweenRequests = 2500; // デフォルト値を2500msに変更

// ストレージからリクエスト間隔を取得
chrome.storage.local.get(['delayBetweenRequests'], function(items) {
  if (items.delayBetweenRequests) {
    delayBetweenRequests = parseInt(items.delayBetweenRequests, 10);
  }
});

// ストレージの変更を監視してリクエスト間隔を更新
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.delayBetweenRequests) {
    delayBetweenRequests = parseInt(changes.delayBetweenRequests.newValue, 10);
  }
});

// インストール時処理
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  
  chrome.storage.local.get(['batchSize', 'maxBatchLength', 'delayBetweenRequests', 'maxToken'], function(items) {
    if (!items.batchSize) chrome.storage.local.set({ batchSize: 80 }); // 80に変更
    if (!items.maxBatchLength) chrome.storage.local.set({ maxBatchLength: 5000 }); // 5000に変更
    if (!items.delayBetweenRequests) chrome.storage.local.set({ delayBetweenRequests: 2500 }); // 2500に変更
    if (!items.maxToken) chrome.storage.local.set({ maxToken: 8192 });
  });

  chrome.storage.local.get(['apiProvider', 'geminiApiKey', 'openaiApiKey', 'deepseekApiKey', 'anthropicApiKey', 'xaiApiKey'], function(items) {
    if (!items.apiProvider) chrome.storage.local.set({ apiProvider: 'gemini' });
    if (!items.geminiApiKey) chrome.storage.local.set({ geminiApiKey: '' });
    if (!items.openaiApiKey) chrome.storage.local.set({ openaiApiKey: '' });
    if (!items.deepseekApiKey) chrome.storage.local.set({ deepseekApiKey: '' });
    if (!items.anthropicApiKey) chrome.storage.local.set({ anthropicApiKey: '' });
    if (!items.xaiApiKey) chrome.storage.local.set({ xaiApiKey: '' });
  });

  chrome.storage.local.get(['targetLanguage'], function(items) {
    const lang = items.targetLanguage || 'en';
    chrome.contextMenus.create({
      id: "toggleTranslation",
      title: contextMenuTranslations[lang] || contextMenuTranslations.en,
      contexts: ["all"]
    });
  });
});

// メッセージ受信時の処理
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "translateBatch") {
    requestQueue.push({ request, sender, sendResponse });
    processQueue();
    return true;
  } else if (sender.tab && (request.action === "updateProgress" ||
                           request.action === "translationComplete" ||
                           request.action === "translationError")) {
    chrome.runtime.sendMessage(request, function(response) {
      if (chrome.runtime.lastError) {}
    });
  }
  return false;
});

// コンテキストメニュークリック時の処理
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "toggleTranslation") {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTranslation" });
  }
});

// ストレージ変更時の処理
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.targetLanguage) {
    const newLang = changes.targetLanguage.newValue || 'en';
    chrome.contextMenus.update("toggleTranslation", {
      title: contextMenuTranslations[newLang] || contextMenuTranslations.en
    });
  }
});

// キューを処理する関数
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  const concurrencyLimit = 10;
  const activeTasks = [];

  while (requestQueue.length > 0) {
    while (activeTasks.length < concurrencyLimit && requestQueue.length > 0) {
      const { request, sender, sendResponse } = requestQueue.shift();
      const task = (async () => {
        try {
          const translations = await translateTextBatch(
            request.batch,
            request.targetLanguage,
            request.apiProvider
          );
          sendResponse({ success: true, translations });
        } catch (error) {
          if (error.message.includes('apiLimitReached')) {
            sendResponse({ success: false, error: error.message });
          } else {
            sendResponse({ success: false, error: error.message });
          }
        }
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      })().catch(err => {
        console.error('Task failed:', err);
      });
      activeTasks.push(task);
    }

    if (activeTasks.length > 0) {
      await Promise.race(activeTasks);
      for (let i = activeTasks.length - 1; i >= 0; i--) {
        if (await Promise.resolve(activeTasks[i]).then(() => true).catch(() => true)) {
          activeTasks.splice(i, 1);
        }
      }
    }
  }

  await Promise.allSettled(activeTasks);
  isProcessing = false;
}

// APIリクエストを送信する関数
async function translateTextBatch(batch, targetLanguage, apiProvider) {
  if (apiProvider === 'gemini') {
    return await translateTextBatchWithGemini(batch, targetLanguage);
  } else if (apiProvider === 'openai') {
    return await translateWithOpenAI(batch, targetLanguage);
  } else if (apiProvider === 'deepseek') {
    return await translateWithDeepSeek(batch, targetLanguage);
  } else if (apiProvider === 'anthropic') {
    return await translateWithAnthropic(batch, targetLanguage);
  } else if (apiProvider === 'xai') {
    return await translateWithXAI(batch, targetLanguage);
  }
  throw new Error('Unsupported API provider');
}

// Gemini APIでの翻訳処理
async function translateTextBatchWithGemini(textItems, targetLanguage) {
  const { targetLanguage: userLang } = await new Promise(resolve => chrome.storage.local.get(['targetLanguage'], resolve));
  const lang = userLang || 'en';
  const tr = errorTranslations[lang] || errorTranslations.en;

  const { geminiApiKey: apiKey, geminiModel: model, maxToken } = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey', 'geminiModel', 'maxToken'], resolve));
  if (!apiKey) {
    throw new Error(tr.apiKeyNotSet);
  }
  let actualModel = (model || '').trim() || 'gemini-2.0-flash-lite';
  const maxTokenValue = maxToken || 8192;

  const MAX_RETRIES = 3;
  let currentRetry = 0;

  const tryTranslate = async () => {
    try {
      const textObjects = textItems.map(it => ({ id: it.id, text: it.text }));
      const prompt = `
あなたはプロの翻訳家です。以下のJSON配列内の各オブジェクトについて、"text"フィールドの内容を文脈に沿って${getLanguageName(targetLanguage)}に翻訳してください。各オブジェクトは一意な"id"フィールドを持っており、出力時にもその"id"を必ず維持してください。
【注意点】
- 固有名詞、プログラムコード、数値の単位など、翻訳するのに相応しくないと考えられるものはそのままにしてください。
- 翻訳結果は文脈に沿った自然な表現にしてください。
- 出力は以下のJSON形式に厳密に従ってください。
- 以下のJSON形式以外の文章は一切出力しないでください。
[
    {"id": "元のテキストのID", "translation": "翻訳されたテキスト"}
]
入力テキスト: ${JSON.stringify(textObjects)}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: maxTokenValue }
        })
      });
      const data = await response.json();

      if (data.error) {
        if (data.error.code === 429) {
          throw new Error(tr.apiLimitReached);
        } else {
          throw new Error(`Gemini API Error: ${data.error.message}`);
        }
      }

      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          return jsonResponse;
        } catch (parseError) {
          throw new Error(tr.jsonParseFailed);
        }
      } else {
        throw new Error(tr.jsonExtractFailed);
      }
    } catch (error) {
      if (currentRetry < MAX_RETRIES && !error.message.includes(tr.apiLimitReached)) {
        currentRetry++;
        const delay = Math.pow(2, currentRetry) * 1000;
        await sleep(delay);
        return tryTranslate();
      } else {
        throw error;
      }
    }
  };

  return tryTranslate();
}

// OpenAI APIでの翻訳処理
async function translateWithOpenAI(textItems, targetLanguage) {
  const { targetLanguage: userLang } = await new Promise(resolve => chrome.storage.local.get(['targetLanguage'], resolve));
  const lang = userLang || 'en';
  const tr = errorTranslations[lang] || errorTranslations.en;

  const { openaiApiKey: apiKey, openaiModel: model, maxToken } = await new Promise(resolve => chrome.storage.local.get(['openaiApiKey', 'openaiModel', 'maxToken'], resolve));
  if (!apiKey) {
    throw new Error(tr.apiKeyNotSet);
  }
  let actualModel = (model || '').trim() || 'gpt-4o-mini';
  const maxTokenValue = maxToken || 8192;

  const MAX_RETRIES = 3;
  let currentRetry = 0;

  const tryTranslate = async () => {
    try {
      const textObjects = textItems.map(it => ({ id: it.id, text: it.text }));
      const prompt = `
あなたはプロの翻訳家です。以下のJSON配列内の各オブジェクトについて、"text"フィールドの内容を文脈に沿って${getLanguageName(targetLanguage)}に翻訳してください。各オブジェクトは一意な"id"フィールドを持っており、出力時にもその"id"を必ず維持してください。
【注意点】
- 固有名詞、プログラムコード、数値の単位など、翻訳するのに相応しくないと考えられるものはそのままにしてください。
- 翻訳結果は文脈に沿った自然な表現にしてください。
- 出力は以下のJSON形式に厳密に従ってください。
- 以下のJSON形式以外の文章は一切出力しないでください。
[
    {"id": "元のテキストのID", "translation": "翻訳されたテキスト"}
]
入力テキスト: ${JSON.stringify(textObjects)}
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: actualModel.startsWith('o1') ? 1 : 0.1,
          max_tokens: actualModel.startsWith('o1') ? undefined : maxTokenValue,
          ...(actualModel.startsWith('o1') ? { max_completion_tokens: maxTokenValue } : {})
        })
      });
      const data = await response.json();

      if (data.error) {
        if (data.error.code === 429) {
          throw new Error(tr.apiLimitReached);
        } else {
          throw new Error(`OpenAI API Error: ${data.error.message}`);
        }
      }

      const responseText = data.choices[0].message.content;
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          return jsonResponse;
        } catch (parseError) {
          throw new Error(tr.jsonParseFailed);
        }
      } else {
        throw new Error(tr.jsonExtractFailed);
      }
    } catch (error) {
      if (currentRetry < MAX_RETRIES && !error.message.includes(tr.apiLimitReached)) {
        currentRetry++;
        const delay = Math.pow(2, currentRetry) * 1000;
        await sleep(delay);
        return tryTranslate();
      } else {
        throw error;
      }
    }
  };

  return tryTranslate();
}

// DeepSeek APIでの翻訳処理
async function translateWithDeepSeek(textItems, targetLanguage) {
  const { targetLanguage: userLang } = await new Promise(resolve => chrome.storage.local.get(['targetLanguage'], resolve));
  const lang = userLang || 'en';
  const tr = errorTranslations[lang] || errorTranslations.en;

  const { deepseekApiKey: apiKey, deepseekModel: model, maxToken } = await new Promise(resolve => chrome.storage.local.get(['deepseekApiKey', 'deepseekModel', 'maxToken'], resolve));
  if (!apiKey) {
    throw new Error(tr.apiKeyNotSet);
  }
  let actualModel = (model || '').trim() || 'deepseek-chat';
  const maxTokenValue = maxToken || 8192;

  const MAX_RETRIES = 3;
  let currentRetry = 0;

  const tryTranslate = async () => {
    try {
      const textObjects = textItems.map(it => ({ id: it.id, text: it.text }));
      const prompt = `
あなたはプロの翻訳家です。以下のJSON配列内の各オブジェクトについて、"text"フィールドの内容を文脈に沿って${getLanguageName(targetLanguage)}に翻訳してください。各オブジェクトは一意な"id"フィールドを持っており、出力時にもその"id"を必ず維持してください。
【注意点】
- 固有名詞、プログラムコード、数値の単位など、翻訳するのに相応しくないと考えられるものはそのままにしてください。
- 翻訳結果は文脈に沿った自然な表現にしてください。
- 出力は以下のJSON形式に厳密に従ってください。
- 以下のJSON形式以外の文章は一切出力しないでください。
[
    {"id": "元のテキストのID", "translation": "翻訳されたテキスト"}
]
入力テキスト: ${JSON.stringify(textObjects)}
`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: maxTokenValue
        })
      });
      const data = await response.json();

      if (data.error) {
        if (data.error.code === 429) {
          throw new Error(tr.apiLimitReached);
        } else {
          throw new Error(`DeepSeek API Error: ${data.error.message}`);
        }
      }

      const responseText = data.choices[0].message.content;
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          return jsonResponse;
        } catch (parseError) {
          throw new Error(tr.jsonParseFailed);
        }
      } else {
        throw new Error(tr.jsonExtractFailed);
      }
    } catch (error) {
      if (currentRetry < MAX_RETRIES && !error.message.includes(tr.apiLimitReached)) {
        currentRetry++;
        const delay = Math.pow(2, currentRetry) * 1000;
        await sleep(delay);
        return tryTranslate();
      } else {
        throw error;
      }
    }
  };

  return tryTranslate();
}

// Anthropic APIでの翻訳処理
async function translateWithAnthropic(textItems, targetLanguage) {
  const { targetLanguage: userLang } = await new Promise(resolve => chrome.storage.local.get(['targetLanguage'], resolve));
  const lang = userLang || 'en';
  const tr = errorTranslations[lang] || errorTranslations.en;

  const { anthropicApiKey: apiKey, anthropicModel: model, maxToken } = await new Promise(resolve => chrome.storage.local.get(['anthropicApiKey', 'anthropicModel', 'maxToken'], resolve));
  if (!apiKey) {
    throw new Error(tr.apiKeyNotSet);
  }
  let actualModel = (model || '').trim() || 'claude-3-5-haiku-20241022';
  const maxTokenValue = maxToken || 8192;

  const MAX_RETRIES = 3;
  let currentRetry = 0;

  const tryTranslate = async () => {
    try {
      const textObjects = textItems.map(it => ({ id: it.id, text: it.text }));
      const prompt = `あなたはプロの翻訳家です。以下のJSON配列内の各オブジェクトについて、"text"フィールドの内容を文脈に沿って${getLanguageName(targetLanguage)}に翻訳してください。各オブジェクトは一意な"id"フィールドを持っており、出力時にもその"id"を必ず維持してください。
【注意点】
- 固有名詞、プログラムコード、数値の単位など、翻訳するのに相応しくないと考えられるものはそのままにしてください。
- 翻訳結果は文脈に沿った自然な表現にしてください。
- 出力は以下のJSON形式に厳密に従ってください。
- 以下のJSON形式以外の文章は一切出力しないでください。
[
    {"id": "元のテキストのID", "translation": "翻訳されたテキスト"}
]
入力テキスト: ${JSON.stringify(textObjects)}
`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokenValue,
          temperature: 0.1
        })
      });
      const data = await response.json();

      if (data.error) {
        if (data.error.type === 'rate_limit_error') {
          throw new Error(tr.apiLimitReached);
        } else {
          throw new Error(`Anthropic API Error: ${data.error.message}`);
        }
      }

      const responseText = data.content[0].text;
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          return jsonResponse;
        } catch (parseError) {
          throw new Error(tr.jsonParseFailed);
        }
      } else {
        throw new Error(tr.jsonExtractFailed);
      }
    } catch (error) {
      if (currentRetry < MAX_RETRIES && !error.message.includes(tr.apiLimitReached)) {
        currentRetry++;
        const delay = Math.pow(2, currentRetry) * 1000;
        await sleep(delay);
        return tryTranslate();
      } else {
        throw error;
      }
    }
  };

  return tryTranslate();
}

// xAI APIでの翻訳処理
async function translateWithXAI(textItems, targetLanguage) {
  const { targetLanguage: userLang } = await new Promise(resolve => chrome.storage.local.get(['targetLanguage'], resolve));
  const lang = userLang || 'en';
  const tr = errorTranslations[lang] || errorTranslations.en;

  const { xaiApiKey: apiKey, xaiModel: model, maxToken } = await new Promise(resolve => chrome.storage.local.get(['xaiApiKey', 'xaiModel', 'maxToken'], resolve));
  if (!apiKey) {
    throw new Error(tr.apiKeyNotSet);
  }
  let actualModel = (model || '').trim() || 'grok-2-1212';
  const maxTokenValue = maxToken || 8192;

  const MAX_RETRIES = 3;
  let currentRetry = 0;

  const tryTranslate = async () => {
    try {
      const textObjects = textItems.map(it => ({ id: it.id, text: it.text }));
      const prompt = `
あなたはプロの翻訳家です。以下のJSON配列内の各オブジェクトについて、"text"フィールドの内容を文脈に沿って${getLanguageName(targetLanguage)}に翻訳してください。各オブジェクトは一意な"id"フィールドを持っており、出力時にもその"id"を必ず維持してください。
【注意点】
- 固有名詞、プログラムコード、数値の単位など、翻訳するのに相応しくないと考えられるものはそのままにしてください。
- 翻訳結果は文脈に沿った自然な表現にしてください。
- 出力は以下のJSON形式に厳密に従ってください。
- 以下のJSON形式以外の文章は一切出力しないでください。
[
    {"id": "元のテキストのID", "translation": "翻訳されたテキスト"}
]
入力テキスト: ${JSON.stringify(textObjects)}
`;

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: maxTokenValue
        })
      });
      const data = await response.json();

      if (data.error) {
        if (data.error.code === 429) {
          throw new Error(tr.apiLimitReached);
        } else {
          throw new Error(`xAI API Error: ${data.error.message}`);
        }
      }

      const responseText = data.choices[0].message.content;
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          return jsonResponse;
        } catch (parseError) {
          throw new Error(tr.jsonParseFailed);
        }
      } else {
        throw new Error(tr.jsonExtractFailed);
      }
    } catch (error) {
      if (currentRetry < MAX_RETRIES && !error.message.includes(tr.apiLimitReached)) {
        currentRetry++;
        const delay = Math.pow(2, currentRetry) * 1000;
        await sleep(delay);
        return tryTranslate();
      } else {
        throw error;
      }
    }
  };

  return tryTranslate();
}

// 言語コードから言語名を取得する関数
function getLanguageName(langCode) {
  const languageNames = {
    en: 'English',
    ja: '日本語',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    zh: '中文',
    ko: '한국어',
    hi: 'हिन्दी',
    ar: 'العربية',
    bn: 'বাংলা',
    id: 'Bahasa Indonesia',
    tr: 'Türkçe'
  };
  return languageNames[langCode] || 'Unknown';
}

// スリープ関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}