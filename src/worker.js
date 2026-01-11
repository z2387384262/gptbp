// 作者信息保护 - 不可篡改
const AUTHOR_INFO = {
  name: "大大大",
  platform: "ddd",
  verified: true
};

// 验证作者信息完整性
function verifyAuthorInfo() {
  // 直接验证关键信息，避免编码问题
  if (AUTHOR_INFO.name !== "大大大" ||
    AUTHOR_INFO.platform !== "ddd" ||
    !AUTHOR_INFO.verified) {
    throw new Error("作者信息已被篡改，服务拒绝运行！请保持原始作者信息完整。");
  }
}

// 模型特定参数配置
function getModelOptimalParams(modelKey, modelId) {
  const baseParams = {
    stream: false  // 确保不使用流式响应
  };

  // 根据不同模型设置最优参数
  switch (modelKey) {
    case 'deepseek-r1':
      return {
        ...baseParams,
        max_tokens: 8192,        // DeepSeek支持大输出
        temperature: 0.8,        // 思维链推理需要更高创造性，范围0-5
        top_p: 0.9,              // 范围0.001-1
        top_k: 50,               // 范围1-50
        repetition_penalty: 1.1, // 范围0-2
        frequency_penalty: 0.1,  // 范围-2到2
        presence_penalty: 0.1    // 范围-2到2
      };

    case 'gpt-oss-120b':
    case 'gpt-oss-20b':
      return {
        stream: false,
        max_tokens: 4096,
        temperature: 0.6
      };

    case 'llama-4-scout':
      return {
        ...baseParams,
        max_tokens: 4096,        // 多模态模型，支持长输出
        temperature: 0.75,
        top_p: 0.95,
        repetition_penalty: 1.1,  // 使用正确的参数名
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

    case 'qwen-coder':
      return {
        ...baseParams,
        max_tokens: 8192,        // 代码模型需要长输出
        temperature: 0.3,        // 代码生成需要低随机性
        top_p: 0.8,              // 范围0-2，Qwen支持
        top_k: 30,
        repetition_penalty: 1.1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

    case 'gemma-3':
      return {
        ...baseParams,
        max_tokens: 4096,        // 多语言模型
        temperature: 0.8,
        top_p: 0.9,              // 范围0-2，Gemma支持
        top_k: 40,
        repetition_penalty: 1.0,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

    default:
      return {
        ...baseParams,
        max_tokens: 2048
      };
  }
}

// 模型配置 - 写死在代码中
const MODEL_CONFIG = {
  "deepseek-r1": {
    "id": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    "name": "DeepSeek-R1-Distill-Qwen-32B",
    "description": "思维链推理模型，支持复杂逻辑推理和数学计算",
    "context": 80000,
    "max_output": 8192,
    "input_price": 0.50,
    "output_price": 4.88,
    "input_price": 0.50,
    "output_price": 4.88,
    "use_prompt": true,
    "features": ["思维链推理", "数学计算", "代码生成"]
  },
  "gpt-oss-120b": {
    "id": "@cf/openai/gpt-oss-120b",
    "name": "OpenAI GPT-OSS-120B",
    "description": "生产级通用模型，高质量文本生成和推理",
    "context": 128000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.75,
    "use_input": true,
    "features": ["通用对话", "文本分析", "创意写作"]
  },
  "gpt-oss-20b": {
    "id": "@cf/openai/gpt-oss-20b",
    "name": "OpenAI GPT-OSS-20B",
    "description": "低延迟快速响应模型，适合实时对话",
    "context": 128000,
    "max_output": 2048,
    "input_price": 0.20,
    "output_price": 0.30,
    "input_price": 0.20,
    "output_price": 0.30,
    "input_price": 0.20,
    "output_price": 0.30,
    "use_input": true,
    "features": ["快速响应", "实时对话", "简单任务"]
  },
  "llama-3.1-70b": {
    "id": "@cf/meta/llama-3.1-70b-instruct",
    "name": "Meta Llama 3.1 70B",
    "description": "强大的开源大模型，擅长复杂任务",
    "context": 128000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.40,
    "use_messages": true,
    "features": ["通用对话", "复杂推理", "文本生成"]
  },
  "qwen-coder": {
    "id": "@cf/qwen/qwen2.5-coder-32b-instruct",
    "name": "Qwen2.5-Coder-32B",
    "description": "代码专家模型，擅长编程和技术问题",
    "context": 32768,
    "max_output": 8192,
    "input_price": 0.66,
    "output_price": 1.00,
    "use_messages": true,
    "features": ["代码生成", "调试分析", "技术文档"]
  },
  "gemma-3": {
    "id": "@cf/google/gemma-3-12b-it",
    "name": "Gemma 3 12B",
    "description": "多语言模型，支持140+种语言和文化理解",
    "context": 80000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.56,
    "use_prompt": true,
    "features": ["多语言", "文化理解", "翻译"]
  }
};

export default {
  async fetch(request, env, ctx) {
    // 验证作者信息完整性
    try {
      verifyAuthorInfo();
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        status: "服务已停止运行"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);

    // 处理CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由处理 - 根路径返回HTML页面
      if (url.pathname === '/') {
        return new Response(getHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/models') {
        return new Response(JSON.stringify(MODEL_CONFIG), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'GET') {
        return await getHistory(request, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'POST') {
        return await saveHistory(request, env, corsHeaders);
      }

      // 调试端点 - 直接返回GPT模型的原始响应
      if (url.pathname === '/api/debug-gpt' && request.method === 'POST') {
        return await debugGPT(request, env, corsHeaders);
      }

      // Roo Code / OpenAI 兼容接口 - 宽松路由匹配
      // 匹配 /v1/chat/completions, /chat/completions, 或带尾随斜杠
      if ((url.pathname.endsWith('/chat/completions') || url.pathname.endsWith('/chat/completions/')) && request.method === 'POST') {
        return await handleOpenAIChat(request, env, corsHeaders);
      }

      // 匹配 /v1/models, /models, 或带尾随斜杠
      if ((url.pathname.endsWith('/models') || url.pathname.endsWith('/models/')) && request.method === 'GET') {
        return await handleOpenAIModels(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: '服务器内部错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

// 修复handleChat函数中的GPT模型处理
async function handleChat(request, env, corsHeaders) {
  try {
    const { message, model, password, history = [] } = await request.json();

    // 验证密码
    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 测试消息处理
    if (message === 'test') {
      return new Response(JSON.stringify({ reply: 'test', model: 'test' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 验证模型
    if (!MODEL_CONFIG[model]) {
      return new Response(JSON.stringify({ error: '无效的模型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const selectedModel = MODEL_CONFIG[model];
    console.log('处理聊天请求:', { modelKey: model, modelName: selectedModel.name });

    // 构建消息历史
    const maxHistoryLength = Math.floor(selectedModel.context / 1000);
    const recentHistory = history.slice(-maxHistoryLength);

    let response;
    let reply;

    try {
      if (selectedModel.use_input) {
        // GPT模型调用，使用更明确的提示
        let userInput;
        if (message === 'test') {
          userInput = "What is the origin of the phrase Hello, World?";
        } else {
          // 给GPT更明确的中文回复指示
          userInput = `请用中文回答以下问题：${message}`;
        }

        console.log(`${selectedModel.name} 输入:`, userInput);

        response = await env.AI.run(selectedModel.id, {
          input: userInput
        });

        console.log(`${selectedModel.name} 完整响应:`, JSON.stringify(response, null, 2));
        console.log(`响应的所有键:`, Object.keys(response || {}));

        // 根据实际数据结构提取文本
        reply = extractTextFromResponse(response, selectedModel);

        console.log(`提取的文本:`, reply);

      } else if (selectedModel.use_prompt) {
        // Gemma等模型
        const promptText = recentHistory.length > 0
          ? `你是一个智能AI助手，请务必用中文回答所有问题。\n\n历史对话:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n当前问题: ${message}\n\n请用中文回答:`
          : `你是一个智能AI助手，请务必用中文回答所有问题。\n\n问题: ${message}\n\n请用中文回答:`;

        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const promptParams = {
          prompt: promptText,
          ...optimalParams
        };

        response = await env.AI.run(selectedModel.id, promptParams);
        reply = extractTextFromResponse(response, selectedModel);

      } else if (selectedModel.use_messages) {
        // 使用messages参数的模型
        const messages = [
          { role: "system", content: "你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。请确保你的回答完全使用中文，包括专业术语和代码注释。" },
          ...recentHistory.map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: `${message}\n\n请用中文回答:` }
        ];

        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const messagesParams = {
          messages,
          ...optimalParams
        };

        console.log(`${selectedModel.name} 请求参数:`, JSON.stringify(messagesParams, null, 2));
        response = await env.AI.run(selectedModel.id, messagesParams);
        console.log(`${selectedModel.name} 原始响应:`, JSON.stringify(response, null, 2));
        reply = extractTextFromResponse(response, selectedModel);
      }

    } catch (error) {
      console.error('AI模型调用失败:', error);
      throw new Error(`${selectedModel.name} 调用失败: ${error.message}`);
    }

    // 处理DeepSeek的思考标签
    if (selectedModel.id.includes('deepseek') && reply && reply.includes('<think>')) {
      const thinkEndIndex = reply.lastIndexOf('</think>');
      if (thinkEndIndex !== -1) {
        reply = reply.substring(thinkEndIndex + 8).trim();
      }
    }

    // 格式化Markdown内容
    if (reply && typeof reply === 'string') {
      reply = formatMarkdown(reply);
    } else {
      reply = reply || '抱歉，AI模型没有返回有效的回复内容。';
    }

    return new Response(JSON.stringify({
      reply: reply,
      model: selectedModel.name,
      usage: response ? response.usage : null
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({
      error: '调用AI模型时发生错误: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function getHistory(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const sessionId = url.searchParams.get('sessionId') || 'default';

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const historyData = await env.CHAT_HISTORY.get(`history:${sessionId}`);
    const history = historyData ? JSON.parse(historyData) : [];

    return new Response(JSON.stringify({ history }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get history error:', error);
    return new Response(JSON.stringify({ error: '获取历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function saveHistory(request, env, corsHeaders) {
  try {
    const { password, sessionId = 'default', history } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const maxHistoryItems = 100;
    const trimmedHistory = history.slice(-maxHistoryItems);

    await env.CHAT_HISTORY.put(`history:${sessionId}`, JSON.stringify(trimmedHistory));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Save history error:', error);
    return new Response(JSON.stringify({ error: '保存历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// GPT调试函数 - 直接返回原始响应
async function debugGPT(request, env, corsHeaders) {
  try {
    const { message, password } = await request.json();

    // 验证密码
    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('=== GPT调试模式 ===');
    console.log('输入消息:', message);

    // 最简GPT调用
    const response = await env.AI.run('@cf/openai/gpt-oss-20b', {
      input: message || 'Hello, World!'
    });

    console.log('GPT响应:', response);

    // 直接返回原始响应
    return new Response(JSON.stringify({
      debug: true,
      response: response,
      extractedText: extractTextFromResponse(response, null)
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Debug GPT error:', error);
    return new Response(JSON.stringify({
      error: '调试GPT时发生错误: ' + error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// === OpenAI 兼容 API 处理函数 ===

// 处理 /v1/models 请求
async function handleOpenAIModels(request, env, corsHeaders) {
   // 验证 Authorization Header
   const authHeader = request.headers.get('Authorization');
   if (authHeader && authHeader.replace('Bearer ', '') !== env.CHAT_PASSWORD) {
     // 为了兼容性，也可以选择不验证 models 接口，但为了安全最好验证
     // 这里暂时放宽验证或者根据需求，标准OpenAI客户端会先列出模型
   }

  const modelsList = Object.keys(MODEL_CONFIG).map(key => {
    return {
      id: key,
      object: "model",
      created: 1677610602,
      owned_by: "cloudflare-worker"
    };
  });

  return new Response(JSON.stringify({
    object: "list",
    data: modelsList
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

// 处理 /v1/chat/completions 请求
async function handleOpenAIChat(request, env, corsHeaders) {
  try {
    // 1. 验证权限
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: { message: 'Missing Authorization header', type: 'invalid_request_error', param: null, code: null } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: { message: 'Invalid API Key', type: 'invalid_request_error', param: null, code: 'invalid_api_key' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 2. 解析请求体
    const body = await request.json();
    const { model, messages, stream } = body || {};

    // 检查模型是否存在
    if (!MODEL_CONFIG[model]) {
      return new Response(JSON.stringify({ error: { message: `Model ${model} not found`, type: 'invalid_request_error', param: 'model', code: 'model_not_found' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const selectedModel = MODEL_CONFIG[model];

    // 暂时不支持流式 (Roo Code 可以配置为不使用流式, 或者我们需要实现流式)
    // 为了简化，先实现非流式
    // 强制关闭 stream，因为我们没有实现流式响应
    // 即使客户端请求 stream=true，我们也试图返回非流式
    // 注意：Roo Code 可能会对此感到困惑，但比直接报错好
    if (body && Object.prototype.hasOwnProperty.call(body, 'stream')) {
      delete body.stream;
    }

    let response;
    let replyText = "";

    // 3. 构建 Prompt 并调用 AI
    try {
      // 统一处理 prompt 模式 (DeepSeek, GPT-OSS, Gemma)
      // 这比 use_input 或 use_messages 更稳定，因为我们可以控制格式
      if (selectedModel.use_prompt || selectedModel.use_input) {
        let promptKey = "prompt";

        // 构建 Prompt 字符串
        let fullPrompt = (messages || []).reduce((acc, msg) => {
          if (!msg) return acc;
          
          let content = "";
          // 处理多模态/数组内容
          if (msg.content && Array.isArray(msg.content)) {
            content = msg.content
              .filter(c => c && c.type === 'text')
              .map(c => c.text)
              .join('\n');
          } else {
            content = (msg.content || "").toString();
          }

          let roleLabel = "";
          switch (msg.role) {
            case 'system': roleLabel = "System"; break;
            case 'user': roleLabel = "User"; break;
            case 'assistant': roleLabel = "Assistant"; break;
            case 'tool': roleLabel = "Tool Output"; break; // 将工具输出转换为文本
            default: roleLabel = "User"; break;
          }

          return acc + `${roleLabel}: ${content}\n`;
        }, "");

        // 确保以 Assistant 结尾引导生成
        fullPrompt += "Assistant:";

        // 构造参数
        let params = {};

        // GPT-OSS 必须使用 input，且不能包含 raw 参数
        if (selectedModel.use_input || selectedModel.id.includes('gpt-oss')) {
          // 极简 + 必须参数模式
          // 3030 错误可能是因为缺 max_tokens 或者多了 stream
          params = {
            input: fullPrompt,
            max_tokens: 4096
          };
        } else {
          // DeepSeek / Gemma 使用 prompt
          params = {
            prompt: fullPrompt,
            raw: true,
            ...getModelOptimalParams(model, selectedModel.id)
          };
        }

        delete params.stream;

        response = await env.AI.run(selectedModel.id, params);
        replyText = extractTextFromResponse(response, selectedModel);

      } else if (selectedModel.use_messages) {
        // Qwen, Llama, GPT-OSS (尝试消息模式)

        const validMessages = (messages || []).map(m => {
          if (!m) return { role: 'user', content: '' };
          
          let role = m.role;
          let content = "";

          // 处理 content 数组 (多模态) -> 纯文本
          if (m.content && Array.isArray(m.content)) {
            content = m.content
              .filter(c => c && c.type === 'text')
              .map(c => c.text)
              .join('\n');
          } else {
            content = (m.content || "").toString();
          }

          // 激进清洗：处理特殊角色
          // 某些模型不支持 tool, function 甚至 system
          if (['tool', 'function'].includes(role)) {
            role = 'user'; // 工具输出转为用户消息
            content = `[Tool Output]: ${content}`;
          }

          // 重要：保留 System Prompt
          // Roo Code 的 System Prompt 包含工具定义，必须保留 role="system"

          return { role, content };
        }).filter(m => m.content.trim() !== ""); // 过滤空消息

        // 强力补丁：对于 Qwen Coder，在最后追加一条 System/User 提示，强制它调用工具
        // 防止它只聊天不干活
        if (selectedModel.id.includes('qwen') || selectedModel.id.includes('deepseek')) {
          validMessages.push({
            role: 'user',
            content: "(System Note: You MUST use XML tags for tool calls. Example: <read_file><path>README.md</path></read_file>. Do NOT use markdown code blocks or [] brackets. Output the raw XML directly.)"
          });
        }

        const params = {
          messages: validMessages,
          ...getModelOptimalParams(model, selectedModel.id)
        };
        delete params.stream;

        response = await env.AI.run(selectedModel.id, params);
        replyText = extractTextFromResponse(response, selectedModel);
      }
    } catch (apiError) {
      console.error('OpenAI adapter AI error:', apiError);
      return new Response(JSON.stringify({ error: { message: apiError.message, type: 'api_error', param: null, code: null } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 修复 Qwen/DeepSeek 可能把工具调用包裹在 markdown 代码块里的问题
    // Roo Code 需要原始的 XML 标签，不能被 ```xml ... ``` 包裹
    if (replyText) {
      // 1. 尝试反转义 HTML (防止 Cloudflare 返回 &lt;)
      replyText = replyText
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');

      // 2. 移除 markdown 代码块包裹
      if (replyText.includes('<tool_code>') || replyText.includes('<read_file>') || replyText.includes('<attempt_completion>') || replyText.includes('<list_files>')) {
        replyText = replyText.replace(/```xml\s*/gi, '').replace(/```\s*/g, '');

        // 3. 格式化 XML: 在标签之间增加换行符，因为 Roo Code 的正则可能依赖换行
        // 将 >< 替换为 >\n<
        replyText = replyText.replace(/>\s*</g, '>\n<');
      }
    }

    // 4. 解析 XML 工具调用并转换为 Native OpenAI Tool Calls
    // 如果客户端期望 native tool format (如 Roo Code 使用 'openai' provider)，它会忽略 content 中的 XML
    // 所以我们需要把 XML 解析出来放到 tool_calls 字段里
    const toolCalls = parseToolCallsFromXml(replyText);

    // 如果解析出了工具调用
    let finishReason = "stop";
    let messageContent = replyText;

    if (toolCalls && toolCalls.length > 0) {
      finishReason = "tool_calls";
      // 如果是 native tool call，通常 content 应该为空或者只包含思考过程
      // 但为了稳妥，我们可以保留 content，或者为了避免重复解析问题，我们可以将其设为 null
      // 这里尝试保留 content，看 Roo Code 是否兼容
      // messageContent = null; 
    }

    // 处理 DeepSeek 的 <think> 标签 (移除)
    // 如果请求中包含可能需要工具调用的意图，但模型回复未包含 XML 工具标签，则尝试用更严格的提示重试一次
    try {
      const toolIntentRegex = /\b(read file|read_file|list files|list_files|open file|show file|read dir|list directory|ls\(|read the file|write file|write to file)\b/i;
      const xmlTagRegex = /<read_file>|<list_files>|<write_file>|<list_files>|<read_dir>/i;

      // 将原始消息内容合并为字符串以检测意图
      const allMessagesText = Array.isArray(messages) ? messages.map(m => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content))).join('\n') : '';

      if (toolIntentRegex.test(allMessagesText) && !xmlTagRegex.test(replyText || '')) {
        console.log('可能需要工具调用，但回复未包含 XML 标签，尝试重试一次以强制输出工具调用。');
        const retryResp = await attemptToolRetry(env, selectedModel, messages, model);
        if (retryResp) {
          const retryText = extractTextFromResponse(retryResp, selectedModel);
          if (xmlTagRegex.test(retryText || '')) {
            console.log('重试成功，使用重试响应中的工具调用输出。');
            replyText = retryText;
            response = retryResp;
          } else {
            console.log('重试未产出预期的 XML 工具标签，保留原始回复。');
          }
        }
      }
    } catch (retryErr) {
      console.error('工具调用重试过程出错:', retryErr);
    }
    if (selectedModel.id.includes('deepseek') && replyText.includes('<think>')) {
      const thinkEndIndex = replyText.lastIndexOf('</think>');
      if (thinkEndIndex !== -1) {
        replyText = replyText.substring(thinkEndIndex + 8).trim();
      }
    }

    // 4. 构造 OpenAI 格式响应
    const openAIResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant", // 必须是 assistant
            content: messageContent, // 必须包含 content
            tool_calls: (toolCalls && toolCalls.length > 0) ? toolCalls : undefined
          },
          finish_reason: finishReason
        }
      ],
      usage: {
        prompt_tokens: 0, // 估算或省略
        completion_tokens: 0,
        total_tokens: 0
      }
    };

    return new Response(JSON.stringify(openAIResponse), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Wrapper error:', error);
    return new Response(JSON.stringify({ error: { message: 'Internal Server Error', type: 'server_error', param: null, code: null } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 修复的响应文本提取函数
function extractTextFromResponse(response, modelConfig) {
  // 直接是字符串就返回
  if (typeof response === 'string') {
    return response.trim() || '模型返回了空响应';
  }

  // 不是对象就返回错误
  if (!response || typeof response !== 'object') {
    return 'AI模型返回了无效的响应格式';
  }

  // 检查新的 GPT 格式：response.output[1].content[0].text
  if (response.output && Array.isArray(response.output)) {
    for (const outputItem of response.output) {
      if (outputItem.type === 'message' && outputItem.content && Array.isArray(outputItem.content)) {
        for (const contentItem of outputItem.content) {
          if (contentItem.type === 'output_text' && contentItem.text) {
            return contentItem.text.trim();
          }
        }
      }
    }
  }

  // 检查旧的格式字段
  const gptFields = [
    'reply', 'response', 'result', 'content', 'text', 'output', 'answer', 'message',
    'completion', 'generated_text', 'prediction'
  ];

  for (const field of gptFields) {
    if (response[field] && typeof response[field] === 'string') {
      const text = response[field].trim();
      if (text) return text;
    }
  }

  // 检查嵌套的结果
  if (response.result && typeof response.result === 'object') {
    for (const field of gptFields) {
      if (response.result[field] && typeof response.result[field] === 'string') {
        const text = response.result[field].trim();
        if (text) return text;
      }
    }
  }

  // 检查 OpenAI 标准格式
  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content.trim() || '模型返回了空内容';
  }

  if (response.choices?.[0]?.text) {
    return response.choices[0].text.trim() || '模型返回了空内容';
  }

  // 遍历所有字符串值，找到最长的有意义文本
  let longestText = '';
  for (const [key, value] of Object.entries(response)) {
    if (typeof value === 'string' && value.trim() && value.length > longestText.length) {
      // 排除一些明显不是内容的字段
      if (!['usage', 'model', 'id', 'created', 'object'].includes(key)) {
        longestText = value.trim();
      }
    }
  }

  if (longestText) return longestText;

  // 如果还是找不到，返回完整的响应用于调试
  console.log('无法提取文本，完整响应:', JSON.stringify(response, null, 2));
  return `无法从响应中提取文本内容。响应结构: ${Object.keys(response).join(', ')}`;
}

// 解析 XML 工具调用为 OpenAI Tool Calls 格式
function parseToolCallsFromXml(text) {
  if (!text) return null;

  const toolCalls = [];
  // 匹配 <tool_name>...</tool_name>
  //这里假设工具之间通过换行或其他字符分隔，或者紧挨着
  // 简单的正则匹配顶层标签
  const toolRegex = /<(\w+)>(?:[\s\S]*?)<\/\1>/g;
  let match;

  while ((match = toolRegex.exec(text)) !== null) {
    const toolName = match[1];
    const innerContent = match[0].substring(toolName.length + 2, match[0].length - toolName.length - 3);

    // 将 XML 参数转换为 JSON 参数
    // 假设参数是 <param>value</param> 格式
    const args = {};
    const paramRegex = /<(\w+)>(?:[\s\S]*?)<\/\1>/g;
    let paramMatch;
    let hasParams = false;

    while ((paramMatch = paramRegex.exec(innerContent)) !== null) {
      hasParams = true;
      const paramName = paramMatch[1];
      const paramValue = paramMatch[0].substring(paramName.length + 2, paramMatch[0].length - paramName.length - 3);
      args[paramName] = paramValue;
    }

    // 如果没有子标签，可能整个内容就是参数，或者无参数
    // 但 Roo Code 的 XML 格式通常是嵌套的。
    // 兼容 <list_files><path>...</path></list_files>

    // 构造 tool_call 对象
    toolCalls.push({
      id: `call_${Math.random().toString(36).substring(2, 10)}`,
      type: 'function',
      function: {
        name: toolName,
        arguments: JSON.stringify(args)
      }
    });
  }

  return toolCalls.length > 0 ? toolCalls : null;
}

// 如果怀疑模型应该发起工具调用但没有返回 XML 标签，则尝试用更严格的提示重试一次
async function attemptToolRetry(env, selectedModel, originalMessages, modelKey) {
  try {
    const retryInstruction = '如果你需要调用外部工具（如读取文件或列出目录），请仅输出原始 XML 工具调用，例如：<read_file><path>README.md</path></read_file>。不要添加任何额外文字或解释。严格使用 XML 标签输出。';

    const retryMessages = Array.isArray(originalMessages) ? [...originalMessages] : [];
    retryMessages.push({ role: 'user', content: retryInstruction });

    const params = {
      messages: retryMessages,
      ...getModelOptimalParams(modelKey, selectedModel.id)
    };
    delete params.stream;

    const retryResponse = await env.AI.run(selectedModel.id, params);
    return retryResponse;
  } catch (err) {
    console.error('attemptToolRetry error:', err);
    return null;
  }
}

// 自动检测并格式化代码内容
function autoDetectAndFormatCode(text) {
  // 检测常见编程语言的模式
  const codePatterns = [
    // Python
    { pattern: /^(import\s+\w+|from\s+\w+\s+import|def\s+\w+|class\s+\w+|if\s+__name__|for\s+\w+\s+in|while\s+.+:|try:|except:)/m, lang: 'python' },
    // JavaScript
    { pattern: /^(function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+|=>\s*{|console\.log|document\.|window\.)/m, lang: 'javascript' },
    // HTML
    { pattern: /^<[^>]+>.*<\/[^>]+>$/m, lang: 'html' },
    // CSS
    { pattern: /^[^{}]*{[^{}]*}$/m, lang: 'css' },
    // SQL
    { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/mi, lang: 'sql' },
    // JSON
    { pattern: /^{\s*"[^"]+"\s*:\s*.+}$/m, lang: 'json' },
    // Shell/Bash
    { pattern: /^(#!\/bin\/|curl\s+|wget\s+|sudo\s+|apt\s+|npm\s+|pip\s+|git\s+)/m, lang: 'bash' }
  ];

  // 如果文本看起来像代码且没有被标记，自动添加代码块标记
  for (const { pattern, lang } of codePatterns) {
    if (pattern.test(text) && !text.includes('```')) {
      // 检查是否有多行且有缩进，如果是则可能是完整的代码块
      const lines = text.split('\n');
      if (lines.length > 3 && lines.some(line => line.startsWith('  ') || line.startsWith('\t'))) {
        return `\`\`\`${lang}\n${text}\n\`\`\``;
      }
    }
  }

  return text;
}

// 检测代码语言
function detectLanguage(code) {
  const langPatterns = [
    { pattern: /^(import\s|from\s.*import|def\s|class\s|if\s+__name__|print\()/m, lang: 'python' },
    { pattern: /^(function\s|const\s|let\s|var\s|console\.log|document\.|window\.)/m, lang: 'javascript' },
    { pattern: /^(<\?php|namespace\s|use\s|\$\w+\s*=)/m, lang: 'php' },
    { pattern: /^(#include|int\s+main|printf\(|cout\s*<<)/m, lang: 'cpp' },
    { pattern: /^(public\s+(class|static)|import\s+java|System\.out)/m, lang: 'java' },
    { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)/mi, lang: 'sql' },
    { pattern: /^<[^>]+>.*<\/[^>]+>/m, lang: 'html' },
    { pattern: /^[^{}]*\{[^{}]*\}/m, lang: 'css' },
    { pattern: /^(#!\/bin\/|curl\s|wget\s|sudo\s|apt\s|npm\s|pip\s|git\s)/m, lang: 'bash' },
    { pattern: /^{\s*"[^"]+"\s*:/m, lang: 'json' }
  ];

  for (const { pattern, lang } of langPatterns) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return 'text';
}

// 格式化Markdown内容
function formatMarkdown(text) {
  // 安全检查
  if (!text || typeof text !== 'string') {
    console.warn('formatMarkdown收到无效输入:', { text, type: typeof text });
    return text || '';
  }

  // 首先进行代码自动检测
  text = autoDetectAndFormatCode(text);

  // 转义HTML特殊字符
  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 处理多行代码块 - 使用简单可靠的方法
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const detectedLang = lang || detectLanguage(code);

    // 将原始代码编码为 base64，避免特殊字符问题
    const encodedCode = btoa(unescape(encodeURIComponent(code)));

    return `<div class="code-block">
      <div class="code-header">
        <span class="language">${detectedLang.toUpperCase()}</span>
        <button class="copy-btn" onclick="copyCodeBlock(this)" data-code="${encodedCode}">复制</button>
      </div>
      <pre><code class="language-${detectedLang}">${escapeHtml(code)}</code></pre>
    </div>`;
  });

  // 处理行内代码
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="inline-code">${escapeHtml(code)}</code>`;
  });

  // 处理标题
  text = text.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  // 处理粗体
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong class="md-bold">$1</strong>');

  // 处理斜体
  text = text.replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>');
  text = text.replace(/_(.*?)_/g, '<em class="md-italic">$1</em>');

  // 处理无序列表
  text = text.replace(/^\* (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^- (.*$)/gim, '<li class="md-li">$1</li>');

  // 处理有序列表
  text = text.replace(/^\d+\. (.*$)/gim, '<li class="md-li-ordered">$1</li>');

  // 包装连续的列表项
  text = text.replace(/(<li class="md-li">.*<\/li>)/s, '<ul class="md-ul">$1</ul>');
  text = text.replace(/(<li class="md-li-ordered">.*<\/li>)/s, '<ol class="md-ol">$1</ol>');

  // 处理引用
  text = text.replace(/^> (.*$)/gim, '<blockquote class="md-blockquote">$1</blockquote>');

  // 处理链接
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>');

  // 处理换行 - 但不要处理代码块内的换行
  // 先用占位符保护代码块
  const codeBlocks = [];
  text = text.replace(/<div class="code-block">[\s\S]*?<\/div>/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 处理非代码块的换行
  text = text.replace(/\n/g, '<br>');

  // 恢复代码块
  codeBlocks.forEach((block, index) => {
    text = text.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return text;
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
    <title>大大大</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { -webkit-text-size-adjust: 100%; }
        textarea, input { font-size: 16px; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; overflow: hidden; }
        .container { width: 100%; height: 100%; background: white; display: flex; flex-direction: column; overflow-y: auto; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; }
        .author-info { margin-top: 10px; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 20px; display: inline-block; cursor: pointer; transition: all 0.3s ease; }
        .author-info:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
        .author-info p { margin: 0; font-size: 14px; opacity: 0.9; }
        .author-info strong { color: #ffd700; }
        .main-content { display: flex; flex: 1; overflow: hidden; }
        .sidebar { width: 300px; min-width: 300px; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 20px; overflow-y: auto; display: block !important; visibility: visible !important; flex-shrink: 0; }
        .chat-area { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto; }
        .auth-section { 
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); 
            border: 2px solid #ff6b9d; border-radius: 15px; padding: 20px; margin-bottom: 20px; 
            box-shadow: 0 8px 16px rgba(255, 107, 157, 0.2);
        }
        .auth-section.authenticated { 
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); 
            border-color: #4facfe; 
            box-shadow: 0 8px 16px rgba(79, 172, 254, 0.2);
        }
        .model-section { margin-bottom: 20px; }
        .model-select { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 10px; }
        .model-info { background: #f1f5f9; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; }
        .input-group { margin-bottom: 15px; }
        .input-group input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; }
        .btn { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #4338ca; }
        .btn-secondary { background: #6b7280; }
        .messages { flex: 1; overflow-y: auto; padding: 20px; background: #fafafa; padding-bottom: 80px; word-break: break-word; overflow-wrap: anywhere; min-height: 0; height: 100%; }
        .message { margin-bottom: 20px; max-width: 80%; }
        .message.user { margin-left: auto; }
        .message-content { padding: 15px; border-radius: 15px; line-height: 1.6; }
        .message.user .message-content { background: #4f46e5; color: white; }
        .message.assistant .message-content { background: white; border: 1px solid #e2e8f0; }
        .input-area {
          background: white;
          border-top: 1px solid #e2e8f0;
          padding: 20px;
          position: sticky;
          bottom: 0;
          width: 100%;
          z-index: 10;
        }
        .input-container { display: flex; gap: 10px; align-items: flex-end; }
        .message-input { flex: 1; min-height: 50px; padding: 15px; border: 1px solid #d1d5db; border-radius: 12px; resize: none; }
        .send-btn { height: 50px; padding: 0 20px; background: #10b981; border-radius: 12px; }
        .loading { display: none; text-align: center; padding: 20px; color: #6b7280; }
        .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; margin: 10px 0; }
        .success { background: #f0f9ff; color: #0369a1; padding: 10px; border-radius: 8px; margin: 10px 0; }
        .code-block { 
            margin: 15px 0; 
            border-radius: 8px; 
            overflow: hidden; 
            border: 1px solid #d1d5db; 
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .code-header { 
            background: #f9fafb; 
            padding: 8px 15px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
        }
        .language { 
            font-size: 12px; 
            color: #6b7280; 
            font-weight: 500; 
            text-transform: uppercase;
        }
        .copy-btn { 
            background: #374151; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            font-size: 11px; 
            cursor: pointer; 
            transition: all 0.2s;
            font-weight: 500;
        }
        .copy-btn:hover { 
            background: #1f2937; 
            transform: translateY(-1px);
        }
        .copy-btn:active { 
            background: #111827; 
            transform: translateY(0);
        }
        pre { 
            background: #ffffff; 
            padding: 16px; 
            margin: 0; 
            overflow-x: auto; 
            line-height: 1.5;
            font-size: 14px;
        }
        code { 
            font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace; 
            font-size: 14px; 
        }
        .inline-code { 
            background: #f3f4f6; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace; 
            font-size: 13px;
            color: #374151;
            border: 1px solid #e5e7eb;
        }
        .code-block code { 
            background: none; 
            padding: 0; 
            color: #1f2937;
            white-space: pre;
            word-wrap: normal;
            overflow-wrap: normal;
        }
        
        /* Markdown 样式 */
        .md-h1 { font-size: 24px; font-weight: bold; color: #1f2937; margin: 20px 0 10px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .md-h2 { font-size: 20px; font-weight: bold; color: #374151; margin: 18px 0 8px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
        .md-h3 { font-size: 16px; font-weight: bold; color: #4b5563; margin: 15px 0 6px 0; }
        .md-bold { font-weight: bold; color: #1f2937; }
        .md-italic { font-style: italic; color: #4b5563; }
        .md-ul { margin: 10px 0; padding-left: 20px; }
        .md-ol { margin: 10px 0; padding-left: 20px; }
        .md-li { margin: 5px 0; list-style-type: disc; }
        .md-li-ordered { margin: 5px 0; list-style-type: decimal; }
        .md-blockquote { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 10px 15px; margin: 10px 0; font-style: italic; color: #4b5563; }
        .md-link { color: #3b82f6; text-decoration: underline; }
        .md-link:hover { color: #1d4ed8; }
        /* Responsive adjustments */
        /* Responsive adjustments */
        .toggle-btn { display: none; position: relative; z-index: 1100; }

        /* 新增：让 .main-content 充满剩余空间并采用弹性布局 */
        .main-content {
            flex: 1;               /* 占据父容器剩余高度 */
            display: flex;         /* 子元素（.sidebar、.chat-area）使用 flex 布局 */
        }
        
        @media (max-width: 768px) {
            .main-content { position: relative; }
            
            .sidebar { 
                position: fixed;
                top: 0;
                left: 0;
                height: 100vh;
                width: 85%; /* Slightly wider for better mobile usability */
                max-width: 320px;
                z-index: 1000;
                transform: translateX(-100%);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex !important;
                flex-direction: column;
                box-shadow: 2px 0 15px rgba(0,0,0,0.2);
            }
            
            .sidebar.show { 
                transform: translateX(0); 
            }
            
            /* Overlay for sidebar */
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 999;
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(2px);
            }
            
            .sidebar-overlay.show { 
                display: block; 
                opacity: 1; 
            }

            .toggle-btn { 
                display: inline-flex !important; 
                align-items: center;
                gap: 5px;
                background: rgba(255,255,255,0.2); 
                border: 1px solid rgba(255,255,255,0.3);
                padding: 6px 12px;
                font-size: 14px;
                height: 36px;
                margin: 0;
            }
            
            .header {
                padding: 10px 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .header h1 { 
                font-size: 18px; 
                margin: 0;
                flex: 1;
                text-align: left;
            }
            
            .header p { 
                display: none; /* Hide subtitle on mobile */
            }
            
            .author-info { 
                margin: 0;
                padding: 4px 10px;
                font-size: 11px;
                white-space: nowrap;
            }

            .message { max-width: 92%; }
            .message-content { padding: 12px; font-size: 15px; }
            .chat-area { padding-bottom: 80px; }
            
            .input-area {
                background: white;
                border-top: 1px solid #e2e8f0;
                padding: 10px;
                position: fixed;      /* 固定在视口底部 */
                bottom: 0;
                left: 0;
                width: 100%;
                z-index: 10;
            }
            .message-input { min-height: 44px; padding: 10px; font-size: 16px; /* Prevent zoom on iOS */ }
            .send-btn { height: 44px; padding: 0 15px; }
        }
    .messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #fafafa;
        padding-bottom: 80px;
        word-break: break-word;
        overflow-wrap: anywhere;
        min-height: 0;
    }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 大大大</h1>
            <p>支持多模型切换的智能聊天助手</p>
            <button class="btn toggle-btn" id="sidebarToggle" onclick="toggleSidebar()">☰ 侧边栏</button>
            <div class="author-info" onclick="window.open('https://gpt.ddd262.de5.net')">
                <p>📺 作者：<strong>大大大</strong></p>
            </div>
        </div>
        <div class="main-content">
            <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
            <div class="sidebar">
                <div class="auth-section" id="authSection">
                    <div class="input-group">
                        <label>访问密码</label>
                        <input type="password" id="passwordInput" placeholder="请输入访问密码" onkeydown="handlePasswordKeyDown(event)">
                    </div>
                    <button class="btn" onclick="authenticate()">验证</button>
                </div>
                <div class="model-section" id="modelSection" style="display: none;">
                    <h3>🎯 选择AI模型</h3>
                    <select class="model-select" id="modelSelect" onchange="updateModelInfo()">
                        <option value="">请选择模型...</option>
                    </select>
                    <div class="model-info" id="modelInfo">请先选择一个AI模型</div>
                </div>
                <div class="history-section" id="historySection" style="display: none;">
                    <h3>📚 聊天历史</h3>
                    <button class="btn btn-secondary" onclick="loadHistory()">加载历史</button>
                    <button class="btn btn-secondary" onclick="clearHistory()">清空历史</button>
                </div>
            </div>
            <div class="chat-area">
                <div class="messages" id="messages">
                    <div class="message assistant">
                        <div class="message-content">👋 欢迎使用大大大！请先输入密码验证身份，然后选择一个AI模型开始聊天。<br><br>🇨🇳 所有AI模型都已配置为使用中文回复，无论您使用什么语言提问，AI都会用中文回答您的问题。</div>
                    </div>
                </div>
                <div class="loading" id="loading">🤔 AI正在思考中...</div>
                <div class="input-area">
                    <div class="input-container">
                        <textarea class="message-input" id="messageInput" placeholder="输入您的问题..." disabled onkeydown="handleKeyDown(event)"></textarea>
                        <button class="btn send-btn" id="sendBtn" onclick="sendMessage()" disabled>发送</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        // 作者信息保护
        const AUTHOR_VERIFICATION = {
            name: "康康的订阅天地",
            platform: "YouTube",
            required: true
        };
        
        function verifyAuthorDisplay() {
            try {
                const authorElements = document.querySelectorAll('.author-info strong');
                if (authorElements.length === 0) {
                    console.warn('作者信息元素未找到，可能页面还未完全加载');
                    return true; // 页面加载期间暂时允许通过
                }
                
                for (let element of authorElements) {
                    if (!element.textContent.includes('YouTube：康康的订阅天地')) {
                        console.warn('作者信息已被篡改，已记录但不阻止运行。');
                    }
                }
                return true;
            } catch (error) {
                console.error('验证作者信息时发生错误:', error);
                return true; // 发生错误时暂时允许通过，避免破坏页面功能
            }
        }
        
        // 定期检查作者信息
        setInterval(verifyAuthorDisplay, 3000);
        
        // 全局错误处理
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('JavaScript错误:', { message, source, lineno, colno, error });
            return false; // 不阻止默认错误处理
        };
        
        // 保护侧边栏显示
        function protectSidebar() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.style.visibility = 'visible';
            }
        }
        setInterval(protectSidebar, 1000);

        // Sidebar toggle for mobile
        // Sidebar toggle for mobile
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
            if (overlay) {
                overlay.classList.toggle('show');
            }
        }
        
        let isAuthenticated = false, currentPassword = '', models = {}, chatHistory = [], currentModel = '';
        window.onload = async function() {
            // 首次验证作者信息
            if (!verifyAuthorDisplay()) return;
            try {
                const response = await fetch('/api/models');
                models = await response.json();
                populateModelSelect();
            } catch (error) { console.error('Failed to load models:', error); }
        };
        function populateModelSelect() {
            const select = document.getElementById('modelSelect');
            select.innerHTML = '<option value="">请选择模型...</option>';
            for (const [key, model] of Object.entries(models)) {
                const option = document.createElement('option');
                option.value = key; option.textContent = model.name;
                select.appendChild(option);
            }
        }
        function updateModelInfo() {
            try {
                const select = document.getElementById('modelSelect');
                const infoDiv = document.getElementById('modelInfo');
                const selectedModel = select.value;
                if (!selectedModel) { infoDiv.innerHTML = '请先选择一个AI模型'; return; }
                
                // 切换模型时加载对应模型的历史记录
                if (currentModel && currentModel !== selectedModel) {
                    chatHistory = [];
                    const messagesDiv = document.getElementById('messages');
                    messagesDiv.innerHTML = '<div class="message assistant"><div class="message-content">🔄 已切换模型，正在加载历史记录...<br><br>🇨🇳 新模型已配置为中文回复模式。</div></div>';
                }
                
                currentModel = selectedModel;
                const model = models[selectedModel];
                if (!model) {
                    infoDiv.innerHTML = '模型信息加载失败';
                    return;
                }
                const features = model.features ? model.features.join(' • ') : '';
                infoDiv.innerHTML = \`
                    <strong>\${model.name}</strong><br>
                    📝 \${model.description}<br><br>
                    🎯 <strong>特色功能:</strong><br>
                    \${features}<br><br>
                    💰 <strong>价格:</strong><br>
                    • 输入: $\${model.input_price}/百万tokens<br>
                    • 输出: $\${model.output_price}/百万tokens<br><br>
                    📏 <strong>限制:</strong><br>
                    • 上下文: \${model.context.toLocaleString()} tokens<br>
                    • 最大输出: \${model.max_output.toLocaleString()} tokens
                \`;
                if (isAuthenticated) {
                    document.getElementById('messageInput').disabled = false;
                    document.getElementById('sendBtn').disabled = false;
                    // 切换模型后自动加载对应历史记录
                    loadHistory();
                }
            } catch (error) {
                console.error('更新模型信息时发生错误:', error);
                const infoDiv = document.getElementById('modelInfo');
                if (infoDiv) {
                    infoDiv.innerHTML = '更新模型信息时发生错误';
                }
            }
        }
        async function authenticate() {
            const password = document.getElementById('passwordInput').value;
            if (!password) { showError('请输入密码'); return; }
            try {
                // 发送测试请求验证密码
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'test', model: 'deepseek-r1', password: password })
                });
                
                if (response.status === 401) {
                    showError('密码错误，请重试');
                    return;
                }
                
                isAuthenticated = true; 
                currentPassword = password;
                const authSection = document.getElementById('authSection');
                authSection.className = 'auth-section authenticated';
                authSection.innerHTML = '<p>✅ 身份验证成功！</p>';
                document.getElementById('modelSection').style.display = 'block';
                document.getElementById('historySection').style.display = 'block';
                showSuccess('验证成功！请选择AI模型开始聊天。');
            } catch (error) { 
                showError('验证失败: ' + error.message); 
            }
        }
        async function sendMessage() {
            try {
                if (!verifyAuthorDisplay()) return;
                if (!isAuthenticated || !currentModel) { showError('请先验证身份并选择模型'); return; }
                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                if (!message) return;
                addMessage('user', message); input.value = '';
                chatHistory.push({ role: 'user', content: message, timestamp: new Date() });
                document.getElementById('loading').style.display = 'block';
                document.getElementById('sendBtn').disabled = true;
                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, model: currentModel, password: currentPassword, history: chatHistory.slice(-10) })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        addMessage('assistant', data.reply, data.model, data.usage);
                        chatHistory.push({ role: 'assistant', content: data.reply, timestamp: new Date(), model: data.model });
                        await saveHistory();
                    } else { showError(data.error || '发送消息失败'); }
                } catch (error) { showError('网络错误: ' + error.message); }
                finally {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('sendBtn').disabled = false;
                }
            } catch (error) {
                console.error('发送消息时发生意外错误:', error);
                showError('发送消息时发生意外错误: ' + error.message);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('sendBtn').disabled = false;
            }
        }
        function addMessage(role, content, modelName = '', usage = null) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            let metaInfo = new Date().toLocaleTimeString();
            if (modelName) metaInfo = \`\${modelName} • \${metaInfo}\`;
            if (usage && usage.total_tokens) metaInfo += \` • \${usage.total_tokens} tokens\`;
            messageDiv.innerHTML = \`<div class="message-content">\${content}</div><div style="font-size:12px;color:#6b7280;margin-top:5px;">\${metaInfo}</div>\`;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        async function loadHistory() {
            if (!isAuthenticated || !currentModel) return;
            try {
                const sessionId = \`\${currentModel}_history\`;
                const response = await fetch(\`/api/history?password=\${encodeURIComponent(currentPassword)}&sessionId=\${sessionId}\`);
                const data = await response.json();
                if (response.ok) {
                    chatHistory = data.history || [];
                    const messagesDiv = document.getElementById('messages');
                    const modelName = models[currentModel]?.name || currentModel;
                    messagesDiv.innerHTML = \`<div class="message assistant"><div class="message-content">📚 已加载 \${modelName} 的历史记录</div></div>\`;
                    chatHistory.forEach(msg => addMessage(msg.role, msg.content, msg.model || ''));
                    if (chatHistory.length === 0) {
                        showSuccess(\`\${modelName} 暂无历史记录\`);
                    } else {
                        showSuccess(\`已加载 \${modelName} 的 \${chatHistory.length} 条历史记录\`);
                    }
                } else { showError(data.error || '加载历史记录失败'); }
            } catch (error) { showError('加载历史记录失败: ' + error.message); }
        }
        async function saveHistory() {
            if (!isAuthenticated || !currentModel) return;
            try {
                const sessionId = \`\${currentModel}_history\`;
                await fetch('/api/history', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: currentPassword, sessionId: sessionId, history: chatHistory })
                });
            } catch (error) { console.error('Save history failed:', error); }
        }
        async function clearHistory() {
            if (!currentModel) { showError('请先选择模型'); return; }
            const modelName = models[currentModel]?.name || currentModel;
            if (!confirm(\`确定要清空 \${modelName} 的所有聊天记录吗？\`)) return;
            chatHistory = []; 
            await saveHistory();
            document.getElementById('messages').innerHTML = \`<div class="message assistant"><div class="message-content">✨ \${modelName} 聊天记录已清空</div></div>\`;
            showSuccess(\`\${modelName} 聊天记录已清空\`);
        }
        function handleKeyDown(event) {
            if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }
        }
        function handlePasswordKeyDown(event) {
            if (event.key === 'Enter') { event.preventDefault(); authenticate(); }
        }
        function showError(message) {
            const div = document.createElement('div');
            div.className = 'error'; div.textContent = message;
            document.querySelector('.sidebar').appendChild(div);
            setTimeout(() => div.remove(), 5000);
        }
        function showSuccess(message) {
            const div = document.createElement('div');
            div.className = 'success'; div.textContent = message;
            document.querySelector('.sidebar').appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }
        
        // 完整的代码块复制功能
        function copyCodeBlock(button) {
            try {
                // 从按钮的 data-code 属性获取编码的代码
                const encodedCode = button.getAttribute('data-code');
                
                if (!encodedCode) {
                    throw new Error('未找到代码数据');
                }
                
                // 解码代码
                const code = decodeURIComponent(escape(atob(encodedCode)));
                
                console.log('准备复制的代码:');
                console.log(code);
                console.log('代码长度:', code.length);
                
                // 复制到剪贴板
                navigator.clipboard.writeText(code).then(() => {
                    // 显示成功状态
                    const originalText = button.textContent;
                    button.textContent = '✓ 已复制';
                    button.style.background = '#10b981';
                    button.style.color = 'white';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '#374151';
                        button.style.color = 'white';
                    }, 2000);
                    
                    console.log('✅ 代码复制成功');
                }).catch(clipboardErr => {
                    console.error('剪贴板复制失败:', clipboardErr);
                    
                    // 降级方案：选中代码文本
                    try {
                        const codeElement = button.closest('.code-block').querySelector('pre code');
                        const range = document.createRange();
                        range.selectNodeContents(codeElement);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        button.textContent = '已选中，请 Ctrl+C';
                        button.style.background = '#f59e0b';
                        
                        setTimeout(() => {
                            button.textContent = '复制';
                            button.style.background = '#374151';
                            selection.removeAllRanges();
                        }, 3000);
                        
                    } catch (selectErr) {
                        console.error('选中文本失败:', selectErr);
                        button.textContent = '复制失败';
                        button.style.background = '#ef4444';
                        
                        setTimeout(() => {
                            button.textContent = '复制';
                            button.style.background = '#374151';
                        }, 3000);
                    }
                });
                
            } catch (error) {
                console.error('代码解码失败:', error);
                button.textContent = '解码失败';
                button.style.background = '#ef4444';
                
                setTimeout(() => {
                    button.textContent = '复制';
                    button.style.background = '#374151';
                }, 3000);
            }
        }
        
        // 测试复制功能的辅助函数
        function testCopyFunction() {
            console.log('🧪 测试代码块复制功能...');
            const testCode = 'def hello_world():\\n    print("Hello, World!")\\n    return True';
            navigator.clipboard.writeText(testCode).then(() => {
                console.log('✅ 剪贴板功能正常');
            }).catch(err => {
                console.log('❌ 剪贴板功能异常2:', err);
            });
        }
        
        // 页面加载完成后测试
        setTimeout(testCopyFunction, 1000);
    </script>
</body>
</html>`;
}
