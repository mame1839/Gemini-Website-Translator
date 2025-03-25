// background.js

// リクエストキューと処理状態を管理する変数
let requestQueue = [];
let isProcessing = false;
let delayBetweenRequests = 1000; // デフォルト値（ミリ秒）

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

// 既存のインストール時処理を保持
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  
  chrome.storage.local.get(['batchSize', 'maxBatchLength', 'delayBetweenRequests'], function(items) {
    if (!items.batchSize) chrome.storage.local.set({ batchSize: 20 });
    if (!items.maxBatchLength) chrome.storage.local.set({ maxBatchLength: 4000 });
    if (!items.delayBetweenRequests) chrome.storage.local.set({ delayBetweenRequests: 1000 });
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
      ko: "번역 전환"
    };
    chrome.contextMenus.create({
      id: "toggleTranslation",
      title: contextMenuTranslations[lang] || contextMenuTranslations.en,
      contexts: ["all"]
    });
  });
});

// メッセージ受信時の処理を拡張
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "translateBatch") {
    // リクエストをキューに追加
    requestQueue.push({ request, sender, sendResponse });
    processQueue();
    return true; // 非同期応答を保持
  } else if (sender.tab && (request.action === "updateProgress" ||
                           request.action === "translationComplete" ||
                           request.action === "translationError")) {
    chrome.runtime.sendMessage(request, function(response) {
      if (chrome.runtime.lastError) {}
    });
  }
  return false;
});

// コンテキストメニュークリック時の処理（既存）
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "toggleTranslation") {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTranslation" });
  }
});

// ストレージ変更時の処理（既存）
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.targetLanguage) {
    const newLang = changes.targetLanguage.newValue || 'en';
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
      ko: "번역 전환"
    };
    chrome.contextMenus.update("toggleTranslation", {
      title: contextMenuTranslations[newLang] || contextMenuTranslations.en
    });
  }
});

// キューを処理する関数（並列処理を追加）
async function processQueue() {
  if (isProcessing) return; // 処理中の場合は何もしない
  isProcessing = true;

  const concurrencyLimit = 5; // 最大並列処理数
  const activeTasks = []; // 実行中のタスクを管理する配列

  // キューが空になるまで処理を続ける
  while (requestQueue.length > 0) {
    // 並列処理の上限までタスクを追加
    while (activeTasks.length < concurrencyLimit && requestQueue.length > 0) {
      const { request, sender, sendResponse } = requestQueue.shift(); // キューからリクエストを取り出す
      const task = (async () => {
        try {
          // 翻訳処理を実行
          const translations = await translateTextBatch(
            request.batch,
            request.targetLanguage,
            request.apiProvider
          );
          sendResponse({ success: true, translations });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        // リクエスト間に遅延を挿入
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      })();
      activeTasks.push(task); // タスクを追加
    }

    // いずれかのタスクが完了するのを待つ
    if (activeTasks.length > 0) {
      await Promise.race(activeTasks);
      // 完了したタスクを削除
      for (let i = activeTasks.length - 1; i >= 0; i--) {
        if (await Promise.resolve(activeTasks[i]).then(() => true).catch(() => true)) {
          activeTasks.splice(i, 1);
        }
      }
    }
  }

  // すべてのタスクが完了するのを待つ
  await Promise.allSettled(activeTasks);
  isProcessing = false; // 処理終了
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
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['geminiApiKey', 'geminiModel'], async function(items) {
      const apiKey = items.geminiApiKey;
      let model = (items.geminiModel || '').trim() || 'gemini-2.0-flash-lite';
      if (!apiKey) {
        reject(new Error('Gemini APIキーが設定されていません'));
        return;
      }
      const MAX_RETRIES = 5;
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

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
              })
            }
          );
          const data = await response.json();

          if (data.error) {
            if (data.error.code === 429 && currentRetry < MAX_RETRIES) {
              currentRetry++;
              const delay = Math.pow(2, currentRetry) * 1000;
              await sleep(delay);
              return tryTranslate();
            } else {
              throw new Error(`Gemini API Error: ${data.error.message}`);
            }
          }

          const responseText = data.candidates[0].content.parts[0].text;
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              resolve(jsonResponse);
            } catch (parseError) {
              if (currentRetry < MAX_RETRIES) {
                currentRetry++;
                const delay = Math.pow(2, currentRetry) * 1000;
                await sleep(delay);
                return tryTranslate();
              } else {
                throw new Error('Gemini翻訳結果のJSON解析に失敗しました');
              }
            }
          } else if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            throw new Error('Gemini翻訳結果からJSONを抽出できませんでした');
          }
        } catch (error) {
          if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            reject(error);
          }
        }
      };
      tryTranslate();
    });
  });
}

// OpenAI APIでの翻訳処理
async function translateWithOpenAI(textItems, targetLanguage) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openaiApiKey', 'openaiModel'], async function(items) {
      const apiKey = items.openaiApiKey;
      const model = (items.openaiModel || '').trim() || 'gpt-4o-mini';
      if (!apiKey) {
        reject(new Error('OpenAI APIキーが設定されていません'));
        return;
      }
      const MAX_RETRIES = 5;
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
              model: model,
              messages: [{ role: 'user', content: prompt }],
              temperature: model.startsWith('o1') ? 1 : 0.1,
              ...(model.startsWith('o1') ? { max_completion_tokens: 8192 } : { max_tokens: 8192 })
            })
          });
          const data = await response.json();

          if (data.error) {
            if (data.error.code === 429 && currentRetry < MAX_RETRIES) {
              currentRetry++;
              const delay = Math.pow(2, currentRetry) * 1000;
              await sleep(delay);
              return tryTranslate();
            } else {
              throw new Error(`OpenAI API Error: ${data.error.message}`);
            }
          }

          const responseText = data.choices[0].message.content;
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              resolve(jsonResponse);
            } catch (parseError) {
              if (currentRetry < MAX_RETRIES) {
                currentRetry++;
                const delay = Math.pow(2, currentRetry) * 1000;
                await sleep(delay);
                return tryTranslate();
              } else {
                throw new Error('OpenAI翻訳結果のJSON解析に失敗しました');
              }
            }
          } else if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            throw new Error('OpenAI翻訳結果からJSONを抽出できませんでした');
          }
        } catch (error) {
          if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            reject(error);
          }
        }
      };
      tryTranslate();
    });
  });
}

// DeepSeek APIでの翻訳処理
async function translateWithDeepSeek(textItems, targetLanguage) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['deepseekApiKey', 'deepseekModel'], async function(items) {
      const apiKey = items.deepseekApiKey;
      const model = (items.deepseekModel || '').trim() || 'deepseek-chat';
      if (!apiKey) {
        reject(new Error('DeepSeek APIキーが設定されていません'));
        return;
      }
      const MAX_RETRIES = 5;
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
              model: model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1,
              max_tokens: 8192
            })
          });
          const data = await response.json();

          if (data.error) {
            if (data.error.code === 429 && currentRetry < MAX_RETRIES) {
              currentRetry++;
              const delay = Math.pow(2, currentRetry) * 1000;
              await sleep(delay);
              return tryTranslate();
            } else {
              throw new Error(`DeepSeek API Error: ${data.error.message}`);
            }
          }

          const responseText = data.choices[0].message.content;
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              resolve(jsonResponse);
            } catch (parseError) {
              if (currentRetry < MAX_RETRIES) {
                currentRetry++;
                const delay = Math.pow(2, currentRetry) * 1000;
                await sleep(delay);
                return tryTranslate();
              } else {
                throw new Error('DeepSeek翻訳結果のJSON解析に失敗しました');
              }
            }
          } else if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            throw new Error('DeepSeek翻訳結果からJSONを抽出できませんでした');
          }
        } catch (error) {
          if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            reject(error);
          }
        }
      };
      tryTranslate();
    });
  });
}

// Anthropic APIでの翻訳処理
async function translateWithAnthropic(textItems, targetLanguage) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['anthropicApiKey', 'anthropicModel'], async function(items) {
      const apiKey = items.anthropicApiKey;
      let model = (items.anthropicModel || '').trim() || 'claude-3-5-haiku-20241022';
      if (!apiKey) {
        reject(new Error('Anthropic APIキーが設定されていません'));
        return;
      }
      const MAX_RETRIES = 5;
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
入力テキスト: ${JSON.stringify(textObjects)}`;

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 4096
            })
          });
          const data = await response.json();

          if (data.error) {
            if (data.error.type === 'overloaded_error' && currentRetry < MAX_RETRIES) {
              currentRetry++;
              const delay = Math.pow(2, currentRetry) * 1000;
              await sleep(delay);
              return tryTranslate();
            } else {
              throw new Error(`Anthropic API Error: ${data.error.message}`);
            }
          }

          const responseText = data.content[0].text;
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              resolve(jsonResponse);
            } catch (parseError) {
              if (currentRetry < MAX_RETRIES) {
                currentRetry++;
                const delay = Math.pow(2, currentRetry) * 1000;
                await sleep(delay);
                return tryTranslate();
              } else {
                throw new Error('Anthropic翻訳結果のJSON解析に失敗しました');
              }
            }
          } else if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            throw new Error('Anthropic翻訳結果からJSONを抽出できませんでした');
          }
        } catch (error) {
          if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            reject(error);
          }
        }
      };
      tryTranslate();
    });
  });
}

// xAI APIでの翻訳処理
async function translateWithXAI(textItems, targetLanguage) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['xaiApiKey', 'xaiModel'], async function(items) {
      const apiKey = items.xaiApiKey;
      let model = (items.xaiModel || '').trim() || 'grok-2-1212';
      if (!apiKey) {
        reject(new Error('xAI APIキーが設定されていません'));
        return;
      }
      const MAX_RETRIES = 5;
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
入力テキスト: ${JSON.stringify(textObjects)}`;

          const response = await fetch('https://api.xai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1,
              max_tokens: 4096
            })
          });
          const data = await response.json();

          if (data.error) {
            if (data.error.code === 429 && currentRetry < MAX_RETRIES) {
              currentRetry++;
              const delay = Math.pow(2, currentRetry) * 1000;
              await sleep(delay);
              return tryTranslate();
            } else {
              throw new Error(`xAI API Error: ${data.error.message}`);
            }
          }

          const responseText = data.choices[0].message.content;
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              resolve(jsonResponse);
            } catch (parseError) {
              if (currentRetry < MAX_RETRIES) {
                currentRetry++;
                const delay = Math.pow(2, currentRetry) * 1000;
                await sleep(delay);
                return tryTranslate();
              } else {
                throw new Error('xAI翻訳結果のJSON解析に失敗しました');
              }
            }
          } else if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            throw new Error('xAI翻訳結果からJSONを抽出できませんでした');
          }
        } catch (error) {
          if (currentRetry < MAX_RETRIES) {
            currentRetry++;
            const delay = Math.pow(2, currentRetry) * 1000;
            await sleep(delay);
            return tryTranslate();
          } else {
            reject(error);
          }
        }
      };
      tryTranslate();
    });
  });
}

// 言語名を取得する補助関数
function getLanguageName(code) {
  const langs = {
    ja: '日本語',
    en: '英語',
    fr: 'フランス語',
    de: 'ドイツ語',
    es: 'スペイン語',
    it: 'イタリア語',
    pt: 'ポルトガル語',
    ru: 'ロシア語',
    zh: '中国語',
    ko: '韓国語'
  };
  return langs[code] || code;
}

// スリープ関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}