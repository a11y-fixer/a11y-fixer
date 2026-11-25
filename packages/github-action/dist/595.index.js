export const id = 595;
export const ids = [595];
export const modules = {

/***/ 18595:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  createOpenAI: () => (/* binding */ createOpenAI)
});

// UNUSED EXPORTS: Experimental_OpenAIRealtimeModel, Experimental_OpenAIRealtimeModelLive, Experimental_OpenAISpeechTranslationModel, Experimental_OpenAITranslationModel, VERSION, openai

// EXTERNAL MODULE: ../../node_modules/.pnpm/@ai-sdk+provider-utils@5.0.83_zod@4.6.7/node_modules/@ai-sdk/provider-utils/dist/index.js + 2 modules
var dist = __webpack_require__(28472);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@workflow+serde@4.1.0/node_modules/@workflow/serde/dist/index.js
var serde_dist = __webpack_require__(23428);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@ai-sdk+provider-utils@5.0.83_zod@4.6.7/node_modules/@ai-sdk/provider-utils/dist/experimental-extraction/index.js
var experimental_extraction = __webpack_require__(21523);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@ai-sdk+provider@4.0.39/node_modules/@ai-sdk/provider/dist/index.js
var provider_dist = __webpack_require__(30647);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/schemas.js + 1 modules
var classic_schemas = __webpack_require__(3726);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/api.js
var api = __webpack_require__(48144);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/coerce.js


function string(params) {
    return core._coercedString(schemas.ZodString, params);
}
function number(params) {
    return api/* _coercedNumber */.qG(classic_schemas/* ZodNumber */.rSt, params);
}
function coerce_boolean(params) {
    return core._coercedBoolean(schemas.ZodBoolean, params);
}
function bigint(params) {
    return core._coercedBigint(schemas.ZodBigInt, params);
}
function date(params) {
    return core._coercedDate(schemas.ZodDate, params);
}

;// CONCATENATED MODULE: ../../node_modules/.pnpm/@ai-sdk+openai@4.0.123_zod@4.6.7/node_modules/@ai-sdk/openai/dist/index.js




//#region src/openai-config.ts
function prepareOpenAIConfigForWorkflowDeserialize(config) {
	if (config.provider == null) throw new Error("OpenAI model is missing provider after workflow deserialization.");
	return {
		...config,
		provider: config.provider,
		url: typeof config.url === "function" ? config.url : ({ path }) => {
			if (config.baseURL == null) throw new Error("OpenAI model is missing baseURL after workflow deserialization.");
			return `${config.baseURL}${path}`;
		},
		headers: typeof config.headers === "function" ? config.headers : config.headers == null ? void 0 : () => config.headers
	};
}
//#endregion
//#region src/openai-error.ts
const openaiErrorDataSchema = () => classic_schemas/* object */.Ikc({ error: classic_schemas/* object */.Ikc({
	message: classic_schemas/* string */.YjP(),
	type: classic_schemas/* string */.YjP().nullish(),
	param: classic_schemas/* any */.bzn().nullish(),
	code: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), classic_schemas/* number */.aig()]).nullish()
}) });
const openaiErrorDataSchemaValidator = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(openaiErrorDataSchema()));
const openaiFailedResponseHandler = (0,dist/* createJsonErrorResponseHandler */.sl)({
	errorSchema: openaiErrorDataSchemaValidator,
	errorToMessage: (data) => data.error.message
});
//#endregion
//#region src/openai-decision-model-options.ts
const openaiDecisionModelOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	/** An opaque end-user identifier for safety monitoring, up to 128 characters. */
	safetyIdentifier: classic_schemas/* string */.YjP().max(128).optional(),
	promptCacheKey: classic_schemas/* string */.YjP().optional()
})));
//#endregion
//#region src/openai-decision-model.ts
const probability = () => classic_schemas/* number */.aig().min(0).max(1);
const responseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	model: classic_schemas/* string */.YjP().nullish(),
	usage: classic_schemas/* object */.Ikc({
		input_tokens: classic_schemas/* number */.aig().nullish(),
		input_tokens_details: classic_schemas/* object */.Ikc({
			cached_tokens: classic_schemas/* number */.aig().nullish(),
			cache_write_tokens: classic_schemas/* number */.aig().nullish()
		}).nullish(),
		output_tokens: classic_schemas/* number */.aig().nullish(),
		output_tokens_details: classic_schemas/* object */.Ikc({ reasoning_tokens: classic_schemas/* number */.aig().nullish() }).nullish(),
		total_tokens: classic_schemas/* number */.aig().nullish()
	}).nullish(),
	answers: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("refusal"),
			name: classic_schemas/* string */.YjP().nullable()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("predicate"),
			name: classic_schemas/* string */.YjP(),
			probability: probability()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("choice"),
			name: classic_schemas/* string */.YjP(),
			choice: classic_schemas/* string */.YjP(),
			confidence: probability().nullish(),
			probabilities: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				value: classic_schemas/* string */.YjP(),
				probability: probability()
			}))
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("score"),
			name: classic_schemas/* string */.YjP(),
			score: classic_schemas/* number */.aig(),
			confidence: probability().nullish(),
			probabilities: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				value: classic_schemas/* number */.aig().int().nonnegative(),
				probability: probability()
			}))
		})
	]))
})));
var DecisionOpenAIModel = class DecisionOpenAIModel {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.supportedQuestionTypes = [
			"choice",
			"score",
			"boolean"
		];
	}
	get provider() {
		return this.config.provider;
	}
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new DecisionOpenAIModel(options.modelId, prepareOpenAIConfigForWorkflowDeserialize(options.config));
	}
	/** @deprecated Use `doDecide` instead. */
	doEvaluate(options) {
		return this.doDecide(options);
	}
	async doDecide({ state, questions, maxOutputTokens, reasoning, headers, abortSignal, providerOptions }) {
		const openaiOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openaiDecisionModelOptions
		});
		const { value: response, rawValue, responseHeaders } = await (0,dist/* postJsonToApi */.GU)({
			url: this.config.url({
				path: "/decisions",
				modelId: this.modelId
			}),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), headers),
			body: {
				model: this.modelId,
				safety_identifier: openaiOptions?.safetyIdentifier,
				prompt_cache_key: openaiOptions?.promptCacheKey,
				input: [{
					role: "user",
					content: state.map((part) => {
						if (part.type === "text") return {
							type: "input_text",
							text: part.text
						};
						if (part.type === "json") return isInputJsonData(part.value) ? {
							type: "input_json",
							data: part.value
						} : {
							type: "input_text",
							text: JSON.stringify(part.value)
						};
						if (part.data.type !== "data") throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `OpenAI decision file input: ${part.mediaType} (${part.data.type})` });
						const mediaType = (0,dist/* isFullMediaType */.Cs)(part.mediaType) ? part.mediaType : (0,dist/* detectMediaType */.sM)({
							data: part.data.data,
							topLevelType: "image"
						});
						if (![
							"image/png",
							"image/jpeg",
							"image/webp",
							"image/gif"
						].includes(mediaType ?? "")) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `OpenAI decision image media type: ${part.mediaType}` });
						const detail = part.providerOptions?.openai?.imageDetail;
						return {
							type: "input_image",
							image_url: `data:${mediaType};base64,${typeof part.data.data === "string" ? part.data.data : (0,dist/* convertUint8ArrayToBase64 */.n_)(part.data.data)}`,
							...detail != null && { detail }
						};
					})
				}],
				questions: Object.entries(questions).map(([name, question]) => {
					const instructions = question.instructions == null ? question.instructions : toText(question.instructions);
					switch (question.type) {
						case "boolean": return {
							type: "predicate",
							name,
							instructions: [
								instructions,
								question.criteria?.true == null ? void 0 : `Criteria for true:\n${toText(question.criteria.true)}`,
								question.criteria?.false == null ? void 0 : `Criteria for false:\n${toText(question.criteria.false)}`
							].filter((part) => part != null).join("\n\n")
						};
						case "choice": return {
							type: "choice",
							name,
							instructions,
							choices: Object.entries(question.criteria).map(([value, description]) => ({
								value,
								...description == null ? {} : { description: toText(description) }
							}))
						};
						case "score": return {
							type: "score",
							name,
							instructions,
							levels: question.criteria.map((description, index) => ({
								label: String(index),
								...description == null ? {} : { description: toText(description) }
							}))
						};
					}
				})
			},
			abortSignal,
			fetch: this.config.fetch,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(responseSchema)
		});
		const answers = Object.fromEntries(response.answers.map((answer) => {
			if (answer.type === "refusal") {
				if (answer.name === null) throw new provider_dist/* InvalidResponseDataError */.xn({
					data: rawValue,
					message: "OpenAI Decisions refused an unnamed question."
				});
				return [answer.name, { type: "refusal" }];
			}
			if (answer.type === "predicate") return [answer.name, {
				type: "boolean",
				probability: answer.probability
			}];
			const probabilities = Object.fromEntries(answer.probabilities.map(({ value, probability }) => [value, probability]));
			if (Object.keys(probabilities).length !== answer.probabilities.length) throw new provider_dist/* InvalidResponseDataError */.xn({
				data: rawValue,
				message: "Decisions returned duplicate probability values."
			});
			return [answer.name, answer.type === "choice" ? {
				type: "choice",
				choice: answer.choice,
				probabilities
			} : {
				type: "score",
				score: answer.score,
				probabilities
			}];
		}));
		const names = response.answers.map((answer) => answer.name);
		if (names.length !== Object.keys(questions).length || new Set(names).size !== names.length || names.some((name) => typeof name !== "string" || !Object.prototype.hasOwnProperty.call(questions, name))) throw new provider_dist/* InvalidResponseDataError */.xn({
			data: rawValue,
			message: "Decisions must return exactly one answer for every question."
		});
		return {
			answers,
			usage: response.usage == null ? void 0 : {
				inputTokens: response.usage.input_tokens ?? void 0,
				outputTokens: response.usage.output_tokens ?? void 0
			},
			rounding: {
				probabilityDecimals: 2,
				scoreDecimals: 2
			},
			warnings: [
				...maxOutputTokens != null ? [{
					type: "unsupported",
					feature: "maxOutputTokens"
				}] : [],
				...reasoning != null ? [{
					type: "unsupported",
					feature: "reasoning"
				}] : [],
				...Object.keys(providerOptions?.openai ?? {}).filter((option) => !SUPPORTED_PROVIDER_OPTIONS.has(option)).map((option) => ({
					type: "unsupported",
					feature: `providerOptions.openai.${option}`
				}))
			],
			providerMetadata: { openai: {
				...response.usage == null ? {} : { usage: response.usage },
				confidence: Object.fromEntries(response.answers.flatMap((answer) => (answer.type === "choice" || answer.type === "score") && answer.confidence != null ? [[answer.name, answer.confidence]] : []))
			} },
			response: {
				modelId: response.model ?? this.modelId,
				headers: responseHeaders,
				body: rawValue
			}
		};
	}
};
const SUPPORTED_PROVIDER_OPTIONS = /* @__PURE__ */ new Set(["safetyIdentifier", "promptCacheKey"]);
function toText(input) {
	return typeof input === "string" ? input : JSON.stringify(input);
}
const INPUT_JSON_MAX_DEPTH = 32;
const INPUT_JSON_MAX_VALUES = 1e4;
const INPUT_JSON_MAX_BYTES = 262144;
function isInputJsonData(value) {
	return (Array.isArray(value) ? value.length > 0 && value.every(isJSONObject$1) : isJSONObject$1(value)) && fitsInputJsonLimits(value);
}
function fitsInputJsonLimits(value) {
	let count = 0;
	const visit = (node, depth) => {
		count += 1;
		if (count > INPUT_JSON_MAX_VALUES) return false;
		if (node === null || typeof node !== "object") return true;
		if (depth > INPUT_JSON_MAX_DEPTH) return false;
		return (Array.isArray(node) ? node : Object.values(node)).every((child) => visit(child, depth + 1));
	};
	return visit(value, 1) && new TextEncoder().encode(JSON.stringify(value)).length <= INPUT_JSON_MAX_BYTES;
}
function isJSONObject$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
//#endregion
//#region src/openai-model-catalog.ts
/**
* Options accepted under `providerOptions.openai`. Language options are the
* Responses API options. The `satisfies` check keeps this list in sync with
* the option schema.
*/
const openaiProviderOptions = { language: {
	conversation: { description: "OpenAI Conversation ID to continue." },
	include: { description: "Extra fields to include in the response." },
	includeWebSearchSources: { description: "Include web search action sources." },
	instructions: { description: "Instructions for the model." },
	logprobs: { description: "Return token log probabilities." },
	maxToolCalls: { description: "Maximum number of built-in tool calls." },
	metadata: { description: "Metadata to store with the generation." },
	parallelToolCalls: { description: "Whether to use parallel tool calls." },
	previousResponseId: { description: "Previous response ID to continue." },
	promptCacheKey: { description: "Cache key for prompt caching." },
	promptCacheOptions: { description: "Prompt cache mode, TTL, prewarm, and diagnostics." },
	promptCacheRetention: { description: "Prompt cache retention policy." },
	reasoningEffort: { description: "Reasoning effort." },
	reasoningEffortUpdate: { description: "Reasoning effort update from this response onward." },
	reasoningMode: { description: "Standard or pro reasoning mode." },
	reasoningContext: { description: "Which reasoning items can be used." },
	reasoningSummary: { description: "Reasoning summary output." },
	safetyIdentifier: { description: "Identifier for safety monitoring." },
	serviceTier: { description: "Service tier for the request." },
	store: { description: "Whether to store the generation." },
	passThroughUnsupportedFiles: { description: "Send non-image file types as generic input files." },
	strictJsonSchema: { description: "Use strict JSON schema validation." },
	textVerbosity: { description: "Verbosity of text responses." },
	textFormat: { description: "Stable request-level text format." },
	truncation: { description: "Output truncation behavior." },
	user: { description: "End-user identifier for abuse monitoring." },
	systemMessageMode: { description: "System message role override." },
	forceReasoning: { description: "Treat the model as a reasoning model." },
	contextManagement: { description: "Server-side context compaction." },
	compactionTrigger: { description: "Request explicit compaction." },
	allowedTools: { description: "Restrict callable tools to a subset." }
} };
const atReasoningEffortNone = { condition: "Only when reasoning effort is none." };
const exceptSearchPreviewChat = { condition: "Not supported by Chat Completions search preview models." };
const logprobsAtReasoningEffortNoneInChat = { condition: "Chat Completions requires reasoning effort none; Responses support is model-dependent." };
const logprobsNotWhileReasoningInChat = { condition: "Not supported by Chat Completions while reasoning; Responses support is model-dependent." };
const openaiLanguageModelRows = Object.entries({
	"gpt-6.2-astra": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: false,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-6.2-sol": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: false,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-6-astra": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: false,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-6.1-sol": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: false,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-6.1-terra": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: atReasoningEffortNone,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-6-luna": {
		endpoints: [
			"chat",
			"responses",
			"decision"
		],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: atReasoningEffortNone,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-6-sol": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: atReasoningEffortNone,
		asyncTools: true,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: true,
		promptCacheRetention: false,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: true,
		systemMessageMode: "developer"
	},
	"gpt-5.6": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: false,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.6-luna": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: false,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.6-sol": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: false,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.6-terra": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: true,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: false,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.5": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-pro": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-mini": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-nano": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.3-chat-latest": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: ["medium"],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.2-pro": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.2-chat-latest": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: ["medium"],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.2": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.1-codex-mini": {
		endpoints: ["responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.1-codex": {
		endpoints: ["responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.1-chat-latest": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: ["medium"],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.1": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-pro": {
		endpoints: ["responses"],
		documented: true,
		reasoningEfforts: ["high"],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"minimal",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-mini": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"minimal",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-nano": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: [
			"minimal",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-codex": {
		endpoints: ["responses"],
		documented: true,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-chat-latest": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system",
		objectGeneration: false,
		tools: {
			usage: false,
			streaming: false
		}
	},
	"gpt-4.1": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4.1-mini": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4.1-nano": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-mini": {
		endpoints: ["chat", "responses"],
		documented: true,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-3.5-turbo": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-3.5-turbo-0125": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-3.5-turbo-1106": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-3.5-turbo-16k": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4.1-2025-04-14": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4.1-mini-2025-04-14": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4.1-nano-2025-04-14": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-2024-05-13": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-2024-08-06": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-2024-11-20": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-audio-preview": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-audio-preview-2024-12-17": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-audio-preview-2025-06-03": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-mini-2024-07-18": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-mini-audio-preview": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-mini-audio-preview-2024-12-17": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-mini-search-preview": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: exceptSearchPreviewChat,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: false,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-mini-search-preview-2025-03-11": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: exceptSearchPreviewChat,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: false,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-search-preview": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: exceptSearchPreviewChat,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: false,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-4o-search-preview-2025-03-11": {
		endpoints: ["chat"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: exceptSearchPreviewChat,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: false,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-5-2025-08-07": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"minimal",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-mini-2025-08-07": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"minimal",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-nano-2025-08-07": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"minimal",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.1-2025-11-13": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.2-2025-12-11": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.2-pro-2025-12-11": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-2026-03-05": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-mini-2026-03-17": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-nano-2026-03-17": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.4-pro-2026-03-05": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.5-2026-04-23": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	o1: {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"o1-2024-12-17": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	o3: {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"o3-2025-04-16": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"o3-mini": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"o3-mini-2025-01-31": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"o4-mini": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"o4-mini-2025-04-16": {
		endpoints: ["chat", "responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5-pro-2025-10-06": {
		endpoints: ["responses"],
		documented: false,
		reasoningEfforts: ["high"],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.1-codex-max": {
		endpoints: ["responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.2-codex": {
		endpoints: ["responses"],
		documented: false,
		reasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: false,
		temperature: false,
		topP: false,
		logprobs: logprobsNotWhileReasoningInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-5.3-codex": {
		endpoints: ["responses"],
		documented: false,
		reasoningEfforts: [
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		],
		samplingAtReasoningEffortNone: true,
		temperature: atReasoningEffortNone,
		topP: atReasoningEffortNone,
		logprobs: logprobsAtReasoningEffortNoneInChat,
		asyncTools: false,
		flexProcessing: true,
		priorityProcessing: true,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "developer"
	},
	"gpt-3.5-turbo-instruct": {
		endpoints: ["completion"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	},
	"gpt-3.5-turbo-instruct-0914": {
		endpoints: ["completion"],
		documented: false,
		reasoningEfforts: void 0,
		samplingAtReasoningEffortNone: false,
		temperature: true,
		topP: true,
		logprobs: true,
		asyncTools: false,
		flexProcessing: false,
		priorityProcessing: false,
		configurationUpdates: false,
		promptCacheRetention: true,
		promptCacheOptions: false,
		chatTemperature: true,
		chatFunctionToolsWithReasoning: true,
		responsesLogprobsRequireNonReasoning: false,
		systemMessageMode: "system"
	}
});
/** Entries for every listed model ID, documented or not. */
const openaiListedLanguageModelEntries = Object.fromEntries(openaiLanguageModelRows.map(([modelId, row]) => [modelId, createOpenAILanguageModelEntry(row)]));
const openaiLanguageModelEntries = Object.fromEntries(openaiLanguageModelRows.filter(([, row]) => row.documented).map(([modelId]) => [modelId, openaiListedLanguageModelEntries[modelId]]));
function createOpenAILanguageModelEntry(row) {
	const documentedSupport = row.documented ? true : "unknown";
	return withProviderOptions({
		capabilities: { language: {
			inputs: {
				image: documentedSupport,
				audio: row.documented ? false : "unknown"
			},
			objectGeneration: row.objectGeneration ?? documentedSupport,
			tools: {
				usage: row.tools?.usage ?? documentedSupport,
				streaming: row.tools?.streaming ?? documentedSupport,
				async: row.asyncTools
			},
			reasoning: {
				support: row.reasoningEfforts != null,
				efforts: row.reasoningEfforts,
				sampling: row.samplingAtReasoningEffortNone ? "reasoning-effort-none" : "unsupported"
			},
			sampling: {
				temperature: row.temperature,
				topP: row.topP,
				logprobs: row.logprobs
			},
			serviceTiers: {
				flex: row.flexProcessing,
				priority: row.priorityProcessing
			},
			configurationUpdates: row.configurationUpdates,
			promptCache: {
				retention: row.promptCacheRetention,
				options: row.promptCacheOptions
			},
			endpoints: {
				chat: {
					temperatureWithoutReasoning: row.chatTemperature,
					functionToolsWithReasoning: row.chatFunctionToolsWithReasoning
				},
				responses: { logprobsRequireNonReasoning: row.responsesLogprobsRequireNonReasoning }
			}
		} },
		requestConfig: { language: { systemMessageMode: row.systemMessageMode } }
	}, documentedSupport);
}
/**
* Generic rows for model IDs that are not in the matrix. A row cannot vary by
* model ID, so each one holds the most broadly compatible values.
*
* `unknownModel` is used for fine-tunes, custom deployments, and any other ID.
* Nothing is assumed about the model: requests use the standard format and
* model-specific request features are omitted with a warning.
*/
const unknownModel = {
	endpoints: [],
	documented: false,
	reasoningEfforts: void 0,
	samplingAtReasoningEffortNone: false,
	temperature: "unknown",
	topP: "unknown",
	logprobs: "unknown",
	asyncTools: false,
	flexProcessing: false,
	priorityProcessing: false,
	configurationUpdates: false,
	promptCacheRetention: true,
	promptCacheOptions: false,
	chatTemperature: true,
	chatFunctionToolsWithReasoning: true,
	responsesLogprobsRequireNonReasoning: false,
	systemMessageMode: "system"
};
const unknownReasoningModelEntry = createOpenAILanguageModelEntry({
	endpoints: [],
	documented: false,
	reasoningEfforts: [
		"low",
		"medium",
		"high",
		"xhigh",
		"max"
	],
	samplingAtReasoningEffortNone: false,
	temperature: false,
	topP: false,
	logprobs: false,
	asyncTools: true,
	flexProcessing: true,
	priorityProcessing: true,
	configurationUpdates: true,
	promptCacheRetention: false,
	promptCacheOptions: true,
	chatTemperature: true,
	chatFunctionToolsWithReasoning: true,
	responsesLogprobsRequireNonReasoning: true,
	systemMessageMode: "developer"
});
const unknownModelEntry = createOpenAILanguageModelEntry(unknownModel);
/**
* The only capability decision made from a model ID: whether an unlisted ID is
* an OpenAI reasoning model (o-series, or GPT-5 and later except the GPT-5 chat
* models). Reasoning models need a different request format, so new OpenAI
* models keep working before they are added to the matrix.
*/
function isUnlistedReasoningModelId(modelId) {
	if (/^o\d+(?:-|$)/.test(modelId)) return true;
	const gpt = /^gpt-(\d+)(\.\d+)?(?:-(.+))?$/.exec(modelId);
	return gpt != null && Number(gpt[1]) >= 5 && !(gpt[2] == null && (gpt[3]?.startsWith("chat") ?? false));
}
/**
* Declares per-option support. Options default to `support`; exceptions reuse
* the entry's capabilities.
*/
function withProviderOptions(entry, support) {
	const { language } = entry.capabilities;
	return {
		...entry,
		providerOptions: { language: declareProviderOptions(openaiProviderOptions.language, support, {
			logprobs: language.sampling.logprobs,
			maxToolCalls: language.tools.usage,
			parallelToolCalls: language.tools.usage,
			allowedTools: language.tools.usage,
			reasoningEffort: language.reasoning.support,
			reasoningSummary: language.reasoning.support,
			reasoningMode: language.reasoning.support,
			reasoningContext: language.reasoning.support,
			reasoningEffortUpdate: language.configurationUpdates,
			promptCacheOptions: language.promptCache.options,
			promptCacheRetention: language.promptCache.retention
		}) }
	};
}
/** Applies one default support value to every option, except the listed ones. */
function declareProviderOptions(definitions, support, exceptions) {
	return Object.fromEntries(Object.keys(definitions).map((option) => [option, exceptions[option] ?? support]));
}
const openaiEmbeddingModelEntries = {
	"text-embedding-3-large": { capabilities: { embedding: {
		defaultDimensions: 3072,
		customDimensions: true
	} } },
	"text-embedding-3-small": { capabilities: { embedding: {
		defaultDimensions: 1536,
		customDimensions: true
	} } },
	"text-embedding-ada-002": { capabilities: { embedding: {
		defaultDimensions: 1536,
		customDimensions: false
	} } }
};
const gptImageSizes = [
	"1024x1024",
	"1536x1024",
	"1024x1536"
];
const customImageSizes = { description: "Standard presets and custom dimensions" };
const openaiImageModelEntries = {
	"gpt-image-2.6-flare": {
		capabilities: { image: {
			sizes: customImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-2.6-sunburst": {
		capabilities: { image: {
			sizes: customImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-2.5-flare": {
		capabilities: { image: {
			sizes: customImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-2.5-sunburst": {
		capabilities: { image: {
			sizes: customImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-2": {
		capabilities: { image: {
			sizes: gptImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-1.5": {
		capabilities: { image: {
			sizes: gptImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-1-mini": {
		capabilities: { image: {
			sizes: gptImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"gpt-image-1": {
		capabilities: { image: {
			sizes: gptImageSizes,
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	},
	"dall-e-3": {
		capabilities: { image: {
			sizes: [
				"1024x1024",
				"1792x1024",
				"1024x1792"
			],
			fileInput: false,
			maskInput: false,
			maxImagesPerCall: 1
		} },
		requestConfig: { image: { responseFormat: "b64_json" } }
	},
	"dall-e-2": {
		capabilities: { image: {
			sizes: [
				"256x256",
				"512x512",
				"1024x1024"
			],
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "b64_json" } }
	}
};
const imageModelAliases = {
	"gpt-image-2.5-flare-2026-09-08": openaiImageModelEntries["gpt-image-2.5-flare"],
	"gpt-image-2.5-sunburst-2026-09-08": openaiImageModelEntries["gpt-image-2.5-sunburst"],
	"chatgpt-image-latest": {
		capabilities: { image: {
			sizes: { description: "Unknown" },
			fileInput: true,
			maskInput: true,
			maxImagesPerCall: 10
		} },
		requestConfig: { image: { responseFormat: "provider-default" } }
	}
};
function resolveOpenAIImageModelEntry(modelId) {
	if (Object.prototype.hasOwnProperty.call(openaiImageModelEntries, modelId)) return openaiImageModelEntries[modelId];
	if (Object.prototype.hasOwnProperty.call(imageModelAliases, modelId)) return imageModelAliases[modelId];
	return {
		capabilities: { image: {
			sizes: { description: "Unknown" },
			fileInput: "unknown",
			maskInput: "unknown",
			maxImagesPerCall: modelId.startsWith("gpt-image-") ? 10 : 1
		} },
		requestConfig: { image: { responseFormat: modelId.startsWith("chatgpt-image-") || modelId.startsWith("gpt-image-") ? "provider-default" : "b64_json" } }
	};
}
Object.fromEntries(Object.entries({
	...openaiImageModelEntries,
	...imageModelAliases
}).map(([modelId, entry]) => [modelId, entry.capabilities.image.maxImagesPerCall ?? 1]));
const defaultTranscriptionRequestConfig = { languageField: "language" };
const openaiTranscriptionModelEntries = {
	"whisper-1": {
		capabilities: { transcription: {
			transcription: true,
			streaming: false,
			streamingDelay: false,
			duration: true,
			segments: true,
			language: true
		} },
		requestConfig: { transcription: {
			...defaultTranscriptionRequestConfig,
			responseFormat: "verbose_json"
		} }
	},
	"gpt-4o-mini-transcribe": {
		capabilities: { transcription: {
			transcription: true,
			streaming: false,
			streamingDelay: false,
			duration: false,
			segments: false,
			language: false
		} },
		requestConfig: { transcription: defaultTranscriptionRequestConfig }
	},
	"gpt-4o-transcribe": {
		capabilities: { transcription: {
			transcription: true,
			streaming: false,
			streamingDelay: false,
			duration: false,
			segments: false,
			language: false
		} },
		requestConfig: { transcription: defaultTranscriptionRequestConfig }
	},
	"gpt-4o-transcribe-diarize": {
		capabilities: { transcription: {
			transcription: true,
			streaming: false,
			streamingDelay: false,
			duration: true,
			segments: true,
			language: false
		} },
		requestConfig: { transcription: {
			...defaultTranscriptionRequestConfig,
			responseFormat: "diarized_json",
			chunkingStrategy: "auto"
		} }
	},
	"gpt-transcribe": {
		capabilities: { transcription: {
			transcription: true,
			streaming: true,
			streamingDelay: false,
			duration: false,
			segments: false,
			language: true
		} },
		requestConfig: { transcription: { languageField: "languages" } }
	},
	"gpt-live-transcribe": {
		capabilities: { transcription: {
			transcription: false,
			streaming: true,
			streamingDelay: true,
			duration: false,
			segments: false,
			language: false
		} },
		requestConfig: { transcription: { languageField: "languages" } }
	},
	"gpt-realtime-whisper": {
		capabilities: { transcription: {
			transcription: false,
			streaming: true,
			streamingDelay: true,
			duration: false,
			segments: false,
			language: false
		} },
		requestConfig: { transcription: defaultTranscriptionRequestConfig }
	},
	"gpt-4o-mini-transcribe-2025-03-20": void 0,
	"gpt-4o-mini-transcribe-2025-12-15": void 0
};
const transcriptionSnapshotModelIds = [
	"gpt-transcribe",
	"gpt-live-transcribe",
	"gpt-realtime-whisper"
];
function resolveOpenAITranscriptionModelEntry(modelId) {
	if (Object.prototype.hasOwnProperty.call(openaiTranscriptionModelEntries, modelId)) {
		const entry = openaiTranscriptionModelEntries[modelId];
		if (entry != null) return entry;
	}
	for (const baseModelId of transcriptionSnapshotModelIds) if (modelId.startsWith(`${baseModelId}-`)) return openaiTranscriptionModelEntries[baseModelId];
	return {
		capabilities: { transcription: {
			transcription: "unknown",
			streaming: "unknown",
			streamingDelay: "unknown",
			duration: "unknown",
			segments: "unknown",
			language: "unknown"
		} },
		requestConfig: { transcription: defaultTranscriptionRequestConfig }
	};
}
const openaiSpeechTranslationModelEntries = { "gpt-realtime-translate": { capabilities: { speechTranslation: {
	translatedAudio: true,
	translatedText: true,
	sourceTranscript: true
} } } };
const openaiSpeechModelEntries = {
	"tts-1": { capabilities: { speech: { instructions: false } } },
	"tts-1-hd": { capabilities: { speech: { instructions: false } } },
	"gpt-4o-mini-tts": { capabilities: { speech: { instructions: true } } },
	"gpt-4o-mini-tts-2025-03-20": void 0,
	"gpt-4o-mini-tts-2025-12-15": void 0,
	"tts-1-1106": void 0,
	"tts-1-hd-1106": void 0
};
const liveModelEntry = {
	capabilities: { realtime: {
		conversation: "continuous",
		transports: ["websocket", "webrtc"],
		connections: ["server-websocket", "webrtc"]
	} },
	requestConfig: { realtime: {
		api: "live",
		startup: "session-start",
		finalization: "session-close"
	} }
};
const realtimeModelEntry = {
	capabilities: { realtime: {
		conversation: "turn-based",
		transports: ["websocket"],
		connections: ["client-secret-websocket", "server-websocket"]
	} },
	requestConfig: { realtime: {
		api: "realtime",
		startup: "session-update",
		finalization: "transport-close"
	} }
};
const realtimeModelEntries = {
	"gpt-live-1": liveModelEntry,
	"gpt-realtime": realtimeModelEntry
};
/** Keep the existing realtime interface's shape while deriving it from the catalog. */
const openaiLiveRealtimeCapabilities = {
	...liveModelEntry.capabilities.realtime,
	startup: liveModelEntry.requestConfig.realtime.startup,
	finalization: liveModelEntry.requestConfig.realtime.finalization
};
/**
* The catalog consumed by request builders and documentation. Source declarations
* are grouped by operation; entries for the same model combine their sections.
* An absent section is undeclared, not an instruction to reject a request.
*/
const openaiModelCatalog = combineModelEntries([
	openaiLanguageModelEntries,
	openaiEmbeddingModelEntries,
	openaiImageModelEntries,
	openaiTranscriptionModelEntries,
	openaiSpeechTranslationModelEntries,
	openaiSpeechModelEntries,
	realtimeModelEntries
]);
function combineModelEntries(catalogs) {
	const entries = /* @__PURE__ */ new Map();
	for (const catalog of catalogs) for (const [modelId, entry] of Object.entries(catalog)) {
		if (entry == null) continue;
		const previous = entries.get(modelId);
		entries.set(modelId, {
			capabilities: {
				...previous?.capabilities,
				...entry.capabilities
			},
			...previous?.providerOptions != null || entry.providerOptions != null ? { providerOptions: {
				...previous?.providerOptions,
				...entry.providerOptions
			} } : {},
			...previous?.requestConfig != null || entry.requestConfig != null ? { requestConfig: {
				...previous?.requestConfig,
				...entry.requestConfig
			} } : {}
		});
	}
	return Object.fromEntries(entries);
}
function findModelEntry(modelId) {
	return Object.prototype.hasOwnProperty.call(openaiModelCatalog, modelId) ? openaiModelCatalog[modelId] : void 0;
}
function getOpenAILanguageModelEntry(modelId) {
	const baseModelId = modelId.replace(/-\d{4}-\d{2}-\d{2}$/, "");
	for (const id of [modelId, baseModelId]) if (Object.prototype.hasOwnProperty.call(openaiListedLanguageModelEntries, id)) return openaiListedLanguageModelEntries[id];
	return isUnlistedReasoningModelId(modelId) ? unknownReasoningModelEntry : unknownModelEntry;
}
function getOpenAIImageModelEntry(modelId) {
	const entry = findModelEntry(modelId);
	return entry?.capabilities.image != null && entry.requestConfig?.image != null ? {
		capabilities: { image: entry.capabilities.image },
		requestConfig: { image: entry.requestConfig.image }
	} : resolveOpenAIImageModelEntry(modelId);
}
function getOpenAITranscriptionModelEntry(modelId) {
	const entry = findModelEntry(modelId);
	return entry?.capabilities.transcription != null && entry.requestConfig?.transcription != null ? {
		capabilities: { transcription: entry.capabilities.transcription },
		requestConfig: { transcription: entry.requestConfig.transcription }
	} : resolveOpenAITranscriptionModelEntry(modelId);
}
function getOpenAIRealtimeModelEntry(modelId, api) {
	const entry = findModelEntry(modelId);
	if (entry?.capabilities.realtime != null && entry.requestConfig?.realtime != null && (api == null || entry.requestConfig.realtime.api === api)) return {
		capabilities: { realtime: entry.capabilities.realtime },
		requestConfig: { realtime: entry.requestConfig.realtime }
	};
	return api === "live" ? liveModelEntry : realtimeModelEntry;
}
//#endregion
//#region src/openai-stream-error.ts
/**
* Converts an OpenAI stream error frame into provider-owned metadata that AI
* SDK Core can normalize without duplicating OpenAI error-code semantics.
*/
function createOpenAIProviderStreamError(frame) {
	const streamError = parseStreamError(frame);
	if (streamError == null) return;
	const statusCode = getStatusCode(streamError);
	return (0,dist/* createProviderStreamError */.iH)({
		message: streamError.message,
		type: streamError.type ?? void 0,
		code: streamError.code ?? void 0,
		statusCode,
		isRetryable: isRetryableStreamError(streamError, statusCode),
		data: frame
	});
}
async function throwIfOpenAIStreamErrorBeforeOutput({ stream, getError, isOutputChunk, isAcceptedChunk, acceptedGraceMs = 50, url, requestBodyValues, responseHeaders }) {
	const [streamForEarlyError, streamForConsumer] = stream.tee();
	const reader = streamForEarlyError.getReader();
	let drainAfterError = false;
	try {
		let accepted = false;
		while (true) {
			let result;
			if (accepted) {
				const raced = await raceWithTimeout(reader.read(), acceptedGraceMs);
				if (raced.timedOut) return streamForConsumer;
				result = raced.value;
			} else result = await reader.read();
			if (result.done) return streamForConsumer;
			const chunk = result.value;
			if (!chunk.success) return streamForConsumer;
			const errorFrame = getError(chunk.value);
			if (errorFrame != null) {
				drainAfterError = true;
				drainReader(reader).catch(() => {});
				drainReader(streamForConsumer.getReader()).catch(() => {});
				throw createOpenAIStreamError({
					frame: errorFrame,
					url,
					requestBodyValues,
					responseHeaders
				});
			}
			if (isOutputChunk(chunk.value)) return streamForConsumer;
			if (!accepted && isAcceptedChunk?.(chunk.value) === true) accepted = true;
		}
	} finally {
		if (!drainAfterError) {
			reader.cancel().catch(() => {});
			reader.releaseLock();
		}
	}
}
async function drainReader(reader) {
	try {
		while (!(await reader.read()).done);
	} catch {} finally {
		reader.releaseLock();
	}
}
async function raceWithTimeout(promise, timeoutMs) {
	let timer;
	const wrapped = promise.then((value) => ({
		timedOut: false,
		value
	}));
	try {
		const raced = await Promise.race([wrapped, new Promise((resolve) => {
			timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
		})]);
		if (raced.timedOut) wrapped.catch(() => {});
		return raced;
	} finally {
		clearTimeout(timer);
	}
}
function createOpenAIStreamError({ frame, url, requestBodyValues, responseHeaders }) {
	const streamError = createOpenAIProviderStreamError(frame);
	return new provider_dist/* APICallError */.hL({
		message: streamError?.message ?? "OpenAI stream failed before any output was generated",
		url,
		requestBodyValues,
		statusCode: streamError?.statusCode ?? 500,
		responseHeaders,
		responseBody: JSON.stringify(frame),
		data: frame,
		isRetryable: streamError?.isRetryable
	});
}
function parseStreamError(frame) {
	const value = asRecord$1(frame);
	if (value == null) return;
	if (value.type === "response.failed") {
		const responseError = asRecord$1(asRecord$1(value.response)?.error);
		return typeof responseError?.message === "string" ? {
			message: responseError.message,
			code: getStringOrNumber(responseError.code),
			type: "response.failed"
		} : void 0;
	}
	const error = asRecord$1(value.error) ?? value;
	return typeof error.message === "string" && (asRecord$1(value.error) != null || typeof error.type === "string" || "code" in error || "param" in error) ? {
		message: error.message,
		code: getStringOrNumber(error.code),
		type: typeof error.type === "string" ? error.type : void 0
	} : void 0;
}
function getStatusCode(error) {
	const explicitStatusCode = getHttpStatusCode(error.code);
	if (explicitStatusCode != null) return explicitStatusCode;
	const discriminator = [error.code, error.type].filter((value) => typeof value === "string" || typeof value === "number").join(" ").toLowerCase();
	if (["insufficient_quota", "rate_limit"].some((term) => discriminator.includes(term))) return 429;
	if (discriminator.includes("authentication")) return 401;
	if (discriminator.includes("permission")) return 403;
	if (discriminator.includes("not_found")) return 404;
	if ([
		"invalid",
		"bad_request",
		"context_length"
	].some((term) => discriminator.includes(term))) return 400;
	if (discriminator.includes("overload")) return 503;
	if (discriminator.includes("timeout")) return 504;
	return 500;
}
function asRecord$1(value) {
	return typeof value === "object" && value != null ? value : void 0;
}
function getStringOrNumber(value) {
	return typeof value === "string" || typeof value === "number" ? value : void 0;
}
function isHttpErrorStatusCode(value) {
	return Number.isInteger(value) && value >= 400 && value <= 599;
}
function getHttpStatusCode(value) {
	const statusCode = typeof value === "string" && /^\d{3}$/.test(value) ? Number(value) : value;
	return typeof statusCode === "number" && isHttpErrorStatusCode(statusCode) ? statusCode : void 0;
}
function isRetryableStatusCode(statusCode) {
	return statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500;
}
function isRetryableStreamError(error, statusCode) {
	if (error.code === "insufficient_quota" || error.type === "insufficient_quota") return false;
	return isRetryableStatusCode(statusCode);
}
//#endregion
//#region src/resolve-openai-reasoning-effort.ts
const allOpenAIReasoningEfforts = [
	"none",
	"minimal",
	"low",
	"medium",
	"high",
	"xhigh",
	"max"
];
/** Resolve portable reasoning against the efforts declared by the catalog. */
function resolveOpenAIReasoningEffort({ providerReasoningEffort, reasoning, supportedReasoningEfforts, warnings }) {
	return (0,dist/* mapReasoningToProviderEffort */.jv)({
		reasoning,
		providerOptionsEffort: providerReasoningEffort,
		effortMap: Object.fromEntries((supportedReasoningEfforts ?? allOpenAIReasoningEfforts).map((effort) => [effort, effort])),
		warnings
	});
}
//#endregion
//#region src/chat/convert-openai-chat-usage.ts
function convertOpenAIChatUsage(usage) {
	if (usage == null) return (0,dist/* createNullLanguageModelUsage */.EK)();
	const promptTokens = usage.prompt_tokens ?? 0;
	const completionTokens = usage.completion_tokens ?? 0;
	const cachedTokens = usage.prompt_tokens_details?.cached_tokens ?? 0;
	const cacheWriteTokens = usage.prompt_tokens_details?.cache_write_tokens ?? void 0;
	const reasoningTokens = usage.completion_tokens_details?.reasoning_tokens ?? 0;
	return {
		inputTokens: {
			total: promptTokens,
			noCache: promptTokens - cachedTokens - (cacheWriteTokens ?? 0),
			cacheRead: cachedTokens,
			cacheWrite: cacheWriteTokens
		},
		outputTokens: {
			total: completionTokens,
			text: Math.max(0, completionTokens - reasoningTokens),
			reasoning: reasoningTokens
		},
		raw: usage
	};
}
//#endregion
//#region src/chat/openai-chat-language-model-options.ts
const openaiLanguageModelChatOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	/**
	* Modify the likelihood of specified tokens appearing in the completion.
	*
	* Accepts a JSON object that maps tokens (specified by their token ID in
	* the GPT tokenizer) to an associated bias value from -100 to 100.
	*/
	logitBias: classic_schemas/* record */.g1P(number(), classic_schemas/* number */.aig()).optional(),
	/**
	* Return the log probabilities of the tokens.
	*
	* Setting to true will return the log probabilities of the tokens that
	* were generated.
	*
	* Setting to a number will return the log probabilities of the top n
	* tokens that were generated.
	*/
	logprobs: classic_schemas/* union */.KCZ([classic_schemas/* boolean */.zMY(), classic_schemas/* number */.aig()]).optional(),
	/**
	* Whether to enable parallel function calling during tool use. Default to true.
	*/
	parallelToolCalls: classic_schemas/* boolean */.zMY().optional(),
	/**
	* A unique identifier representing your end-user, which can help OpenAI to
	* monitor and detect abuse.
	*/
	user: classic_schemas/* string */.YjP().optional(),
	/**
	* Reasoning effort for reasoning models. Defaults to `medium`.
	*/
	reasoningEffort: classic_schemas/* enum */.k5n([
		"none",
		"minimal",
		"low",
		"medium",
		"high",
		"xhigh",
		"max"
	]).optional(),
	/**
	* Maximum number of completion tokens to generate. Useful for reasoning models.
	*/
	maxCompletionTokens: classic_schemas/* number */.aig().optional(),
	/**
	* Whether to enable persistence in responses API.
	*/
	store: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Metadata to associate with the request.
	*/
	metadata: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP().max(64), classic_schemas/* string */.YjP().max(512)).optional(),
	/**
	* Parameters for prediction mode.
	*/
	prediction: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* any */.bzn()).optional(),
	/**
	* Service tier for the request.
	* - 'auto': Default service tier. The request will be processed with the service tier configured in the
	*           Project settings. Unless otherwise configured, the Project will use 'default'.
	* - 'flex': 50% cheaper processing at the cost of increased latency. Only available for o3 and o4-mini models.
	* - 'priority': Higher-speed processing with predictably low latency at premium cost. Available for Enterprise customers.
	* - 'fast': OpenAI's newer name for the 'priority' tier. Interchangeable with it.
	* - 'ultrafast': Access-controlled Ultrafast processing. Only available for gpt-5.6-sol.
	* - 'default': The request will be processed with the standard pricing and performance for the selected model.
	*
	* @default 'auto'
	*/
	serviceTier: classic_schemas/* enum */.k5n([
		"auto",
		"flex",
		"priority",
		"fast",
		"ultrafast",
		"default"
	]).optional(),
	/**
	* Whether to use strict JSON schema validation.
	*
	* @default true
	*/
	strictJsonSchema: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Controls the verbosity of the model's responses.
	* Lower values will result in more concise responses, while higher values will result in more verbose responses.
	*/
	textVerbosity: classic_schemas/* enum */.k5n([
		"low",
		"medium",
		"high"
	]).optional(),
	/**
	* A cache key for prompt caching. Allows manual control over prompt caching behavior.
	* Useful for improving cache hit rates and working around automatic caching issues.
	*/
	promptCacheKey: classic_schemas/* string */.YjP().optional(),
	/**
	* Prompt cache behavior for GPT-5.6 and later models.
	* `mode` controls whether OpenAI also places an implicit breakpoint.
	* `ttl` sets the minimum cache lifetime and currently only supports 30 minutes.
	*/
	promptCacheOptions: classic_schemas/* object */.Ikc({
		mode: classic_schemas/* enum */.k5n(["implicit", "explicit"]).optional(),
		ttl: classic_schemas/* literal */.euz("30m").optional()
	}).optional(),
	/**
	* The retention policy for the prompt cache.
	* - 'in_memory': Default. Standard prompt caching behavior.
	* - '24h': Extended prompt caching that keeps cached prefixes active for up to 24 hours.
	*          Available for models before GPT-5.6 that support extended caching.
	*
	* @deprecated For GPT-5.6 and later models, use `promptCacheOptions.ttl`.
	*
	* @default 'in_memory'
	*/
	promptCacheRetention: classic_schemas/* enum */.k5n(["in_memory", "24h"]).optional(),
	/**
	* A stable identifier used to help detect users of your application
	* that may be violating OpenAI's usage policies. The IDs should be a
	* string that uniquely identifies each user. We recommend hashing their
	* username or email address, in order to avoid sending us any identifying
	* information.
	*/
	safetyIdentifier: classic_schemas/* string */.YjP().optional(),
	/**
	* Override the system message mode for this model.
	* - 'system': Use the 'system' role for system messages (default for most models)
	* - 'developer': Use the 'developer' role for system messages (used by reasoning models)
	* - 'remove': Remove system messages entirely
	*
	* If not specified, the mode is automatically determined based on the model.
	*/
	systemMessageMode: classic_schemas/* enum */.k5n([
		"system",
		"developer",
		"remove"
	]).optional(),
	/**
	* Force treating this model as a reasoning model.
	*
	* This is useful for "stealth" reasoning models (e.g. via a custom baseURL)
	* where the model ID is not recognized by the SDK's allowlist.
	*
	* When enabled, the SDK applies reasoning-model parameter compatibility rules
	* and defaults `systemMessageMode` to `developer` unless overridden.
	*/
	forceReasoning: classic_schemas/* boolean */.zMY().optional()
})));
const openaiChatMessageProviderOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ 
/** The participant name on a system, developer, user, or assistant message. */
name: classic_schemas/* string */.YjP().optional() })));
//#endregion
//#region src/chat/convert-to-openai-chat-messages.ts
function serializeToolCallArguments$1(input) {
	if (typeof input === "string") try {
		const parsed = (0,dist/* secureJsonParse */.ZA)(input);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return "{}";
		return input;
	} catch {
		return "{}";
	}
	return (0,dist/* stringifyWithBigIntAndCycles */.f3)(typeof input === "object" && input !== null && !Array.isArray(input) ? input : {});
}
function getPromptCacheBreakpoint$1(providerOptions) {
	return providerOptions?.openai?.promptCacheBreakpoint;
}
async function convertToOpenAIChatMessages({ prompt, systemMessageMode = "system" }) {
	const messages = [];
	const warnings = [];
	for (const { role, content, providerOptions } of prompt) {
		const name = (await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openaiChatMessageProviderOptions
		}))?.name;
		switch (role) {
			case "system":
				switch (systemMessageMode) {
					case "system": {
						const promptCacheBreakpoint = getPromptCacheBreakpoint$1(providerOptions);
						messages.push({
							role: "system",
							...name != null && { name },
							content: promptCacheBreakpoint == null ? content : [{
								type: "text",
								text: content,
								prompt_cache_breakpoint: promptCacheBreakpoint
							}]
						});
						break;
					}
					case "developer": {
						const promptCacheBreakpoint = getPromptCacheBreakpoint$1(providerOptions);
						messages.push({
							role: "developer",
							...name != null && { name },
							content: promptCacheBreakpoint == null ? content : [{
								type: "text",
								text: content,
								prompt_cache_breakpoint: promptCacheBreakpoint
							}]
						});
						break;
					}
					case "remove":
						warnings.push({
							type: "other",
							message: "system messages are removed for this model"
						});
						break;
					default: throw new Error(`Unsupported system message mode: ${systemMessageMode}`);
				}
				break;
			case "user":
				if (content.length === 1 && content[0].type === "text" && getPromptCacheBreakpoint$1(content[0].providerOptions) == null) {
					messages.push({
						role: "user",
						content: content[0].text,
						...name != null && { name }
					});
					break;
				}
				messages.push({
					role: "user",
					...name != null && { name },
					content: content.map((part, index) => {
						switch (part.type) {
							case "text": {
								const promptCacheBreakpoint = getPromptCacheBreakpoint$1(part.providerOptions);
								return {
									type: "text",
									text: part.text,
									...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
								};
							}
							case "file": {
								const promptCacheBreakpoint = getPromptCacheBreakpoint$1(part.providerOptions);
								switch (part.data.type) {
									case "reference": return {
										type: "file",
										file: { file_id: (0,dist/* resolveProviderReference */.p5)({
											reference: part.data.reference,
											provider: "openai"
										}) },
										...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
									};
									case "text": throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "text file parts" });
									case "url":
									case "data": {
										const topLevel = (0,dist/* getTopLevelMediaType */.yu)(part.mediaType);
										if (topLevel === "image") return {
											type: "image_url",
											image_url: {
												url: part.data.type === "url" ? part.data.url.toString() : `data:${(0,dist/* resolveFullMediaType */.SL)({ part })};base64,${(0,dist/* convertToBase64 */.ej)(part.data.data)}`,
												detail: part.providerOptions?.openai?.imageDetail
											},
											...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
										};
										else if (topLevel === "audio") {
											if (part.data.type === "url") throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "audio file parts with URLs" });
											const fullMediaType = (0,dist/* resolveFullMediaType */.SL)({ part });
											switch (fullMediaType) {
												case "audio/wav": return {
													type: "input_audio",
													input_audio: {
														data: (0,dist/* convertToBase64 */.ej)(part.data.data),
														format: "wav"
													},
													...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
												};
												case "audio/mp3":
												case "audio/mpeg": return {
													type: "input_audio",
													input_audio: {
														data: (0,dist/* convertToBase64 */.ej)(part.data.data),
														format: "mp3"
													},
													...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
												};
												default: throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `audio content parts with media type ${fullMediaType}` });
											}
										}
										{
											const fullMediaType = (0,dist/* resolveFullMediaType */.SL)({ part });
											if (fullMediaType !== "application/pdf") throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `file part media type ${fullMediaType}` });
											if (part.data.type === "url") throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "PDF file parts with URLs" });
											return {
												type: "file",
												file: {
													filename: part.filename ?? `part-${index}.pdf`,
													file_data: `data:application/pdf;base64,${(0,dist/* convertToBase64 */.ej)(part.data.data)}`
												},
												...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
											};
										}
									}
								}
							}
						}
					})
				});
				break;
			case "assistant": {
				let text = "";
				const textParts = [];
				let hasPromptCacheBreakpoint = false;
				const toolCalls = [];
				for (const part of content) switch (part.type) {
					case "text": {
						const promptCacheBreakpoint = getPromptCacheBreakpoint$1(part.providerOptions);
						text += part.text;
						textParts.push({
							type: "text",
							text: part.text,
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						});
						hasPromptCacheBreakpoint ||= promptCacheBreakpoint != null;
						break;
					}
					case "tool-call": toolCalls.push({
						id: part.toolCallId,
						type: "function",
						function: {
							name: part.toolName,
							arguments: serializeToolCallArguments$1(part.input)
						}
					});
				}
				messages.push({
					role: "assistant",
					...name != null && { name },
					content: hasPromptCacheBreakpoint ? textParts : toolCalls.length > 0 ? text || null : text,
					tool_calls: toolCalls.length > 0 ? toolCalls : void 0
				});
				break;
			}
			case "tool":
				if (name != null) warnings.push({
					type: "unsupported",
					feature: "message name on tool messages"
				});
				for (const toolResponse of content) {
					if (toolResponse.type === "tool-approval-response") continue;
					const output = toolResponse.output;
					const promptCacheBreakpoint = (output.type === "content" ? output.value.map((part) => getPromptCacheBreakpoint$1(part.providerOptions)).find((breakpoint) => breakpoint != null) : getPromptCacheBreakpoint$1(output.providerOptions)) ?? getPromptCacheBreakpoint$1(toolResponse.providerOptions);
					let contentValue;
					switch (output.type) {
						case "text":
							contentValue = output.value;
							break;
						case "error-text":
						case "error-json":
							contentValue = (0,dist/* stringifyWithBigIntAndCycles */.f3)({ error: output.value });
							break;
						case "execution-denied":
							contentValue = output.reason ?? "Tool call execution denied.";
							break;
						case "content":
						case "json": contentValue = (0,dist/* stringifyWithBigIntAndCycles */.f3)(output.value);
					}
					messages.push({
						role: "tool",
						tool_call_id: toolResponse.toolCallId,
						content: promptCacheBreakpoint == null ? contentValue : [{
							type: "text",
							text: contentValue,
							prompt_cache_breakpoint: promptCacheBreakpoint
						}]
					});
				}
				break;
			default: throw new Error(`Unsupported role: ${role}`);
		}
	}
	return {
		messages,
		warnings
	};
}
//#endregion
//#region src/chat/get-response-metadata.ts
function getResponseMetadata$1({ id, model, created }) {
	return (0,dist/* createLanguageModelResponseMetadata */.qX)({
		id,
		model,
		created: created || void 0
	});
}
//#endregion
//#region src/chat/map-openai-finish-reason.ts
function mapOpenAIFinishReason$1({ finishReason, hasRefusal = false }) {
	switch (finishReason) {
		case "stop": return hasRefusal ? "content-filter" : "stop";
		case "length": return "length";
		case "content_filter": return "content-filter";
		case "function_call":
		case "tool_calls": return "tool-calls";
		default: return "other";
	}
}
//#endregion
//#region src/chat/openai-chat-api.ts
const openaiChatResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP().nullish(),
	created: classic_schemas/* number */.aig().nullish(),
	model: classic_schemas/* string */.YjP().nullish(),
	choices: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		message: classic_schemas/* object */.Ikc({
			role: classic_schemas/* literal */.euz("assistant").nullish(),
			content: classic_schemas/* string */.YjP().nullish(),
			refusal: classic_schemas/* string */.YjP().nullish(),
			audio: classic_schemas/* object */.Ikc({ transcript: classic_schemas/* string */.YjP().nullish() }).nullish(),
			tool_calls: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				id: classic_schemas/* string */.YjP().nullish(),
				type: classic_schemas/* literal */.euz("function"),
				function: classic_schemas/* object */.Ikc({
					name: classic_schemas/* string */.YjP(),
					arguments: classic_schemas/* string */.YjP()
				})
			})).nullish(),
			annotations: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("url_citation"),
				url_citation: classic_schemas/* object */.Ikc({
					start_index: classic_schemas/* number */.aig(),
					end_index: classic_schemas/* number */.aig(),
					url: classic_schemas/* string */.YjP(),
					title: classic_schemas/* string */.YjP()
				})
			})).nullish()
		}),
		index: classic_schemas/* number */.aig(),
		logprobs: classic_schemas/* object */.Ikc({
			content: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				token: classic_schemas/* string */.YjP(),
				logprob: classic_schemas/* number */.aig(),
				top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					token: classic_schemas/* string */.YjP(),
					logprob: classic_schemas/* number */.aig()
				}))
			})).nullish(),
			refusal: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				token: classic_schemas/* string */.YjP(),
				logprob: classic_schemas/* number */.aig(),
				top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					token: classic_schemas/* string */.YjP(),
					logprob: classic_schemas/* number */.aig()
				}))
			})).nullish()
		}).nullish(),
		finish_reason: classic_schemas/* string */.YjP().nullish()
	})),
	usage: classic_schemas/* object */.Ikc({
		prompt_tokens: classic_schemas/* number */.aig().nullish(),
		completion_tokens: classic_schemas/* number */.aig().nullish(),
		total_tokens: classic_schemas/* number */.aig().nullish(),
		prompt_tokens_details: classic_schemas/* object */.Ikc({
			cached_tokens: classic_schemas/* number */.aig().nullish(),
			cache_write_tokens: classic_schemas/* number */.aig().nullish()
		}).nullish(),
		completion_tokens_details: classic_schemas/* object */.Ikc({
			reasoning_tokens: classic_schemas/* number */.aig().nullish(),
			accepted_prediction_tokens: classic_schemas/* number */.aig().nullish(),
			rejected_prediction_tokens: classic_schemas/* number */.aig().nullish()
		}).nullish()
	}).nullish()
})));
const openaiChatChunkSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* union */.KCZ([classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP().nullish(),
	created: classic_schemas/* number */.aig().nullish(),
	model: classic_schemas/* string */.YjP().nullish(),
	choices: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		delta: classic_schemas/* object */.Ikc({
			role: classic_schemas/* enum */.k5n(["assistant"]).nullish(),
			content: classic_schemas/* string */.YjP().nullish(),
			refusal: classic_schemas/* string */.YjP().nullish(),
			tool_calls: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				index: classic_schemas/* number */.aig(),
				id: classic_schemas/* string */.YjP().nullish(),
				type: classic_schemas/* literal */.euz("function").nullish(),
				function: classic_schemas/* object */.Ikc({
					name: classic_schemas/* string */.YjP().nullish(),
					arguments: classic_schemas/* string */.YjP().nullish()
				})
			})).nullish(),
			annotations: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("url_citation"),
				url_citation: classic_schemas/* object */.Ikc({
					start_index: classic_schemas/* number */.aig(),
					end_index: classic_schemas/* number */.aig(),
					url: classic_schemas/* string */.YjP(),
					title: classic_schemas/* string */.YjP()
				})
			})).nullish()
		}).nullish(),
		logprobs: classic_schemas/* object */.Ikc({
			content: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				token: classic_schemas/* string */.YjP(),
				logprob: classic_schemas/* number */.aig(),
				top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					token: classic_schemas/* string */.YjP(),
					logprob: classic_schemas/* number */.aig()
				}))
			})).nullish(),
			refusal: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				token: classic_schemas/* string */.YjP(),
				logprob: classic_schemas/* number */.aig(),
				top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					token: classic_schemas/* string */.YjP(),
					logprob: classic_schemas/* number */.aig()
				}))
			})).nullish()
		}).nullish(),
		finish_reason: classic_schemas/* string */.YjP().nullish(),
		index: classic_schemas/* number */.aig()
	})),
	usage: classic_schemas/* object */.Ikc({
		prompt_tokens: classic_schemas/* number */.aig().nullish(),
		completion_tokens: classic_schemas/* number */.aig().nullish(),
		total_tokens: classic_schemas/* number */.aig().nullish(),
		prompt_tokens_details: classic_schemas/* object */.Ikc({
			cached_tokens: classic_schemas/* number */.aig().nullish(),
			cache_write_tokens: classic_schemas/* number */.aig().nullish()
		}).nullish(),
		completion_tokens_details: classic_schemas/* object */.Ikc({
			reasoning_tokens: classic_schemas/* number */.aig().nullish(),
			accepted_prediction_tokens: classic_schemas/* number */.aig().nullish(),
			rejected_prediction_tokens: classic_schemas/* number */.aig().nullish()
		}).nullish()
	}).nullish()
}), openaiErrorDataSchema()])));
//#endregion
//#region src/normalize-openai-json-schema.ts
/**
* Normalizes JSON Schema for OpenAI structured outputs.
*
* OpenAI does not support the JSON Schema `propertyNames` keyword. Property
* names in JSON objects are always strings, so string-based constraints can be
* left to client-side validation after removing the keyword. This
* compatibility layer does not rewrite non-string property name schemas.
*
* OpenAI also does not support regex lookaround in JSON Schema `pattern`
* values. Those patterns are removed and left to client-side validation.
*
* Zod 4 represents recursive references as singleton `allOf` schemas. OpenAI
* does not support `allOf`, but a singleton local reference can be rewritten
* to a direct reference without changing its validation behavior.
*/
function normalizeOpenAIJsonSchema(schema) {
	let removedPropertyNames = false;
	let removedLookaroundPattern = false;
	const normalizedSchema = normalizeSchema(schema, true);
	const warnings = [];
	if (removedPropertyNames) warnings.push({
		type: "compatibility",
		feature: "JSON Schema propertyNames",
		details: "OpenAI does not support JSON Schema propertyNames. It was removed before sending the schema, so OpenAI will not enforce property-name constraints."
	});
	if (removedLookaroundPattern) warnings.push({
		type: "compatibility",
		feature: "JSON Schema pattern with regex lookaround",
		details: "OpenAI does not support regex lookaround in JSON Schema patterns. The pattern was removed before sending the schema, so OpenAI will not enforce that constraint."
	});
	return {
		schema: normalizedSchema,
		warnings
	};
	function normalizeSchema(schema, isRoot = false) {
		const propertyNames = schema.propertyNames;
		if (propertyNames != null) {
			if (typeof propertyNames === "boolean" || propertyNames.type != null && propertyNames.type !== "string") throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "JSON Schema propertyNames that does not use a string schema" });
			removedPropertyNames = true;
		}
		const normalizedSchema = { ...schema };
		delete normalizedSchema.propertyNames;
		if (normalizedSchema.pattern != null && containsRegexLookaround(normalizedSchema.pattern)) {
			delete normalizedSchema.pattern;
			removedLookaroundPattern = true;
		}
		if (normalizedSchema.properties != null) normalizedSchema.properties = normalizeSchemaRecord(normalizedSchema.properties);
		if (normalizedSchema.patternProperties != null) normalizedSchema.patternProperties = normalizeSchemaRecord(normalizedSchema.patternProperties);
		if (normalizedSchema.additionalProperties != null) normalizedSchema.additionalProperties = normalizeDefinition(normalizedSchema.additionalProperties);
		if (normalizedSchema.additionalItems != null) normalizedSchema.additionalItems = normalizeDefinition(normalizedSchema.additionalItems);
		if (normalizedSchema.items != null) normalizedSchema.items = Array.isArray(normalizedSchema.items) ? normalizedSchema.items.map(normalizeDefinition) : normalizeDefinition(normalizedSchema.items);
		if (normalizedSchema.contains != null) normalizedSchema.contains = normalizeDefinition(normalizedSchema.contains);
		if (normalizedSchema.not != null) normalizedSchema.not = normalizeDefinition(normalizedSchema.not);
		if (normalizedSchema.allOf != null) normalizedSchema.allOf = normalizedSchema.allOf.map(normalizeDefinition);
		if (normalizedSchema.anyOf != null) normalizedSchema.anyOf = normalizedSchema.anyOf.map(normalizeDefinition);
		if (normalizedSchema.oneOf != null) normalizedSchema.oneOf = normalizedSchema.oneOf.map(normalizeDefinition);
		if (normalizedSchema.definitions != null) normalizedSchema.definitions = normalizeSchemaRecord(normalizedSchema.definitions);
		if (normalizedSchema.$defs != null) normalizedSchema.$defs = normalizeSchemaRecord(normalizedSchema.$defs);
		if (normalizedSchema.dependencies != null) normalizedSchema.dependencies = Object.fromEntries(Object.entries(normalizedSchema.dependencies).map(([key, dependency]) => [key, Array.isArray(dependency) ? dependency : normalizeDefinition(dependency)]));
		for (const keyword of [
			"if",
			"then",
			"else"
		]) {
			const conditionalSchema = normalizedSchema[keyword];
			if (conditionalSchema != null) normalizedSchema[keyword] = normalizeDefinition(conditionalSchema);
		}
		const reference = getSingletonReference(normalizedSchema);
		if (reference == null) return normalizedSchema;
		const { allOf: _allOf, ...schemaWithoutAllOf } = normalizedSchema;
		if (!isRoot) return {
			...schemaWithoutAllOf,
			$ref: reference
		};
		const referencedSchema = getLocalReferenceSchema(reference, normalizedSchema);
		if (referencedSchema == null) return normalizedSchema;
		return {
			...referencedSchema,
			...schemaWithoutAllOf
		};
	}
	function getSingletonReference(schema) {
		if (schema.allOf?.length !== 1) return;
		const [allOfSchema] = schema.allOf;
		return typeof allOfSchema === "object" && allOfSchema != null && Object.keys(allOfSchema).length === 1 && typeof allOfSchema.$ref === "string" ? allOfSchema.$ref : void 0;
	}
	function getLocalReferenceSchema(reference, schema) {
		const match = /^#\/(definitions|\$defs)\/(.+)$/.exec(reference);
		if (match == null) return;
		const [, keyword, encodedName] = match;
		const name = encodedName.replace(/~1/g, "/").replace(/~0/g, "~");
		const definition = keyword === "definitions" ? schema.definitions?.[name] : schema.$defs?.[name];
		return typeof definition === "object" && definition != null ? definition : void 0;
	}
	function normalizeSchemaRecord(schemas) {
		return Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [key, normalizeDefinition(schema)]));
	}
	function normalizeDefinition(definition) {
		return typeof definition === "boolean" ? definition : normalizeSchema(definition);
	}
}
function containsRegexLookaround(pattern) {
	let escaped = false;
	let inCharacterClass = false;
	for (let index = 0; index < pattern.length; index++) {
		const character = pattern[index];
		if (escaped) {
			escaped = false;
			continue;
		}
		if (character === "\\") {
			escaped = true;
			continue;
		}
		if (character === "[") {
			inCharacterClass = true;
			continue;
		}
		if (character === "]") {
			inCharacterClass = false;
			continue;
		}
		if (!inCharacterClass && character === "(" && pattern[index + 1] === "?") {
			const lookaroundPrefix = pattern[index + 2];
			if (lookaroundPrefix === "=" || lookaroundPrefix === "!") return true;
			if (lookaroundPrefix === "<" && (pattern[index + 3] === "=" || pattern[index + 3] === "!")) return true;
		}
	}
	return false;
}
//#endregion
//#region src/chat/openai-chat-prepare-tools.ts
function prepareChatTools({ tools, toolChoice }) {
	tools = tools?.length ? tools : void 0;
	const toolWarnings = [];
	if (tools == null) return {
		tools: void 0,
		toolChoice: void 0,
		toolWarnings
	};
	const openaiTools = [];
	for (const tool of tools) switch (tool.type) {
		case "function": {
			const normalizedInputSchema = normalizeOpenAIJsonSchema(tool.inputSchema);
			toolWarnings.push(...normalizedInputSchema.warnings);
			openaiTools.push({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: normalizedInputSchema.schema,
					...tool.strict != null ? { strict: tool.strict } : {}
				}
			});
			break;
		}
		default: toolWarnings.push({
			type: "unsupported",
			feature: `tool type: ${tool.type}`
		});
	}
	if (toolChoice == null) return {
		tools: openaiTools,
		toolChoice: void 0,
		toolWarnings
	};
	const type = toolChoice.type;
	switch (type) {
		case "auto":
		case "none":
		case "required": return {
			tools: openaiTools,
			toolChoice: type,
			toolWarnings
		};
		case "tool": return {
			tools: openaiTools,
			toolChoice: {
				type: "function",
				function: { name: toolChoice.toolName }
			},
			toolWarnings
		};
		default: throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `tool choice type: ${type}` });
	}
}
//#endregion
//#region src/chat/openai-chat-language-model.ts
var OpenAIChatLanguageModel = class OpenAIChatLanguageModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAIChatLanguageModel(options.modelId, options.config);
	}
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.supportedUrls = { "image/*": [/^https?:\/\/.*$/] };
		this.modelId = modelId;
		this.config = config;
	}
	get provider() {
		return this.config.provider;
	}
	async getArgs({ prompt, maxOutputTokens, temperature, topP, topK, frequencyPenalty, presencePenalty, stopSequences, responseFormat, seed, tools, toolChoice, reasoning, providerOptions }) {
		const warnings = [];
		const providerOptionsNames = this.config.provider.includes("azure") ? ["openai", "azure"] : ["openai"];
		const openaiOptions = (await (0,dist/* resolveProviderOptions */.Wo)({
			providerOptions,
			namespaces: providerOptionsNames,
			resolution: "merge",
			schema: openaiLanguageModelChatOptions
		})).options ?? {};
		const { capabilities: { language: modelCapabilities }, requestConfig: { language: modelRequestConfig } } = getOpenAILanguageModelEntry(this.modelId);
		const requiresNoReasoningEffort = !modelCapabilities.endpoints.chat.functionToolsWithReasoning && openaiOptions.reasoningEffort == null && (tools?.some((tool) => tool.type === "function") ?? false);
		if (requiresNoReasoningEffort && (0,dist/* isCustomReasoning */.g6)(reasoning) && reasoning !== "none") warnings.push({
			type: "compatibility",
			feature: "reasoning",
			details: `${this.modelId} does not support function tools with reasoning in the Chat Completions API. reasoning effort set to "none". Use the Responses API to combine reasoning with function tools.`
		});
		const resolvedReasoningEffort = requiresNoReasoningEffort ? "none" : resolveOpenAIReasoningEffort({
			providerReasoningEffort: openaiOptions.reasoningEffort,
			reasoning,
			supportedReasoningEfforts: modelCapabilities.reasoning.efforts?.filter((effort) => effort !== "max"),
			warnings
		});
		const isReasoningModel = openaiOptions.forceReasoning ?? modelCapabilities.reasoning.support === true;
		if (topK != null) warnings.push({
			type: "unsupported",
			feature: "topK"
		});
		if (providerOptionsNames.some((name) => providerOptions?.[name]?.reasoningSummary != null)) warnings.push({
			type: "unsupported",
			feature: "reasoningSummary",
			details: "reasoningSummary is only supported by the Responses API, not the Chat Completions API"
		});
		const { messages, warnings: messageWarnings } = await convertToOpenAIChatMessages({
			prompt,
			systemMessageMode: openaiOptions.systemMessageMode ?? (isReasoningModel ? "developer" : modelRequestConfig.systemMessageMode)
		});
		warnings.push(...messageWarnings);
		const strictJsonSchema = openaiOptions.strictJsonSchema ?? true;
		const normalizedResponseFormatSchema = responseFormat?.type === "json" && responseFormat.schema != null ? normalizeOpenAIJsonSchema(responseFormat.schema) : void 0;
		if (normalizedResponseFormatSchema != null) warnings.push(...normalizedResponseFormatSchema.warnings);
		const baseArgs = {
			model: this.config.requestModelId ?? this.modelId,
			logit_bias: openaiOptions.logitBias,
			logprobs: openaiOptions.logprobs === true || typeof openaiOptions.logprobs === "number" ? true : void 0,
			top_logprobs: typeof openaiOptions.logprobs === "number" ? openaiOptions.logprobs : typeof openaiOptions.logprobs === "boolean" ? openaiOptions.logprobs ? 0 : void 0 : void 0,
			user: openaiOptions.user,
			parallel_tool_calls: openaiOptions.parallelToolCalls,
			max_tokens: maxOutputTokens,
			temperature,
			top_p: topP,
			frequency_penalty: frequencyPenalty,
			presence_penalty: presencePenalty,
			response_format: responseFormat?.type === "json" ? normalizedResponseFormatSchema != null ? {
				type: "json_schema",
				json_schema: {
					schema: normalizedResponseFormatSchema.schema,
					strict: strictJsonSchema,
					name: responseFormat.name ?? "response",
					description: responseFormat.description
				}
			} : { type: "json_object" } : void 0,
			stop: stopSequences,
			seed,
			verbosity: openaiOptions.textVerbosity,
			max_completion_tokens: openaiOptions.maxCompletionTokens,
			store: openaiOptions.store,
			metadata: openaiOptions.metadata,
			prediction: openaiOptions.prediction,
			reasoning_effort: resolvedReasoningEffort,
			service_tier: openaiOptions.serviceTier,
			prompt_cache_key: openaiOptions.promptCacheKey,
			prompt_cache_options: openaiOptions.promptCacheOptions,
			prompt_cache_retention: openaiOptions.promptCacheRetention,
			safety_identifier: openaiOptions.safetyIdentifier,
			messages
		};
		if (!modelCapabilities.promptCache.retention && baseArgs.prompt_cache_retention != null) {
			baseArgs.prompt_cache_retention = void 0;
			warnings.push({
				type: "unsupported",
				feature: "promptCacheRetention",
				details: "promptCacheRetention is not supported by GPT-6 and later models; use promptCacheOptions instead"
			});
		}
		if (isReasoningModel) {
			if (resolvedReasoningEffort !== "none" || modelCapabilities.reasoning.sampling !== "reasoning-effort-none") {
				if (baseArgs.temperature != null) {
					baseArgs.temperature = void 0;
					warnings.push({
						type: "unsupported",
						feature: "temperature",
						details: "temperature is not supported for reasoning models"
					});
				}
				if (baseArgs.top_p != null) {
					baseArgs.top_p = void 0;
					warnings.push({
						type: "unsupported",
						feature: "topP",
						details: "topP is not supported for reasoning models"
					});
				}
				if (baseArgs.logprobs != null) {
					baseArgs.logprobs = void 0;
					warnings.push({
						type: "other",
						message: "logprobs is not supported for reasoning models"
					});
				}
			}
			if (baseArgs.frequency_penalty != null) {
				baseArgs.frequency_penalty = void 0;
				warnings.push({
					type: "unsupported",
					feature: "frequencyPenalty",
					details: "frequencyPenalty is not supported for reasoning models"
				});
			}
			if (baseArgs.presence_penalty != null) {
				baseArgs.presence_penalty = void 0;
				warnings.push({
					type: "unsupported",
					feature: "presencePenalty",
					details: "presencePenalty is not supported for reasoning models"
				});
			}
			if (baseArgs.logit_bias != null) {
				baseArgs.logit_bias = void 0;
				warnings.push({
					type: "other",
					message: "logitBias is not supported for reasoning models"
				});
			}
			if (baseArgs.top_logprobs != null) {
				baseArgs.top_logprobs = void 0;
				warnings.push({
					type: "other",
					message: "topLogprobs is not supported for reasoning models"
				});
			}
			if (baseArgs.max_tokens != null) {
				if (baseArgs.max_completion_tokens == null) baseArgs.max_completion_tokens = baseArgs.max_tokens;
				baseArgs.max_tokens = void 0;
			}
		} else if (!modelCapabilities.endpoints.chat.temperatureWithoutReasoning) {
			if (baseArgs.temperature != null) {
				baseArgs.temperature = void 0;
				warnings.push({
					type: "unsupported",
					feature: "temperature",
					details: "temperature is not supported for the search preview models and has been removed."
				});
			}
		}
		if (openaiOptions.serviceTier === "flex" && !modelCapabilities.serviceTiers.flex) {
			warnings.push({
				type: "unsupported",
				feature: "serviceTier",
				details: "flex processing is only available for o3, o4-mini, and gpt-5 models"
			});
			baseArgs.service_tier = void 0;
		}
		if ((openaiOptions.serviceTier === "priority" || openaiOptions.serviceTier === "fast") && !modelCapabilities.serviceTiers.priority) {
			warnings.push({
				type: "unsupported",
				feature: "serviceTier",
				details: "priority processing is only available for supported models (gpt-4, gpt-5, gpt-5-mini, o3, o4-mini) and requires Enterprise access. gpt-5-nano is not supported"
			});
			baseArgs.service_tier = void 0;
		}
		const { tools: openaiTools, toolChoice: openaiToolChoice, toolWarnings } = prepareChatTools({
			tools,
			toolChoice
		});
		return {
			args: {
				...baseArgs,
				tools: openaiTools,
				tool_choice: openaiToolChoice
			},
			warnings: [...warnings, ...toolWarnings]
		};
	}
	async doGenerate(options) {
		const { args: body, warnings } = await this.getArgs(options);
		const url = this.config.url({
			path: "/chat/completions",
			modelId: this.config.requestModelId ?? this.modelId
		});
		const { responseHeaders, value: response, rawValue: rawResponse } = await (0,dist/* postJsonToApi */.GU)({
			url,
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiChatResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const choice = response.choices[0];
		if (choice == null) throw new provider_dist/* InvalidResponseDataError */.xn({
			data: rawResponse,
			message: "Response did not contain any choices."
		});
		const content = [];
		const text = choice.message.content != null && choice.message.content.length > 0 ? choice.message.content : choice.message.audio?.transcript;
		if (text != null && text.length > 0) content.push({
			type: "text",
			text
		});
		const refusal = choice.message.refusal;
		const hasRefusal = refusal != null && refusal.length > 0;
		if (hasRefusal) content.push({
			type: "text",
			text: refusal
		});
		for (const toolCall of choice.message.tool_calls ?? []) content.push({
			type: "tool-call",
			toolCallId: toolCall.id || (0,dist/* generateId */.$C)(),
			toolName: toolCall.function.name,
			input: toolCall.function.arguments
		});
		for (const annotation of choice.message.annotations ?? []) content.push({
			type: "source",
			sourceType: "url",
			id: (0,dist/* generateId */.$C)(),
			url: annotation.url_citation.url,
			title: annotation.url_citation.title
		});
		const completionTokenDetails = response.usage?.completion_tokens_details;
		const providerMetadata = { openai: {} };
		if (completionTokenDetails?.accepted_prediction_tokens != null) providerMetadata.openai.acceptedPredictionTokens = completionTokenDetails?.accepted_prediction_tokens;
		if (completionTokenDetails?.rejected_prediction_tokens != null) providerMetadata.openai.rejectedPredictionTokens = completionTokenDetails?.rejected_prediction_tokens;
		const contentLogprobs = choice.logprobs?.content;
		const refusalLogprobs = choice.logprobs?.refusal;
		if (contentLogprobs != null || refusalLogprobs != null) providerMetadata.openai.logprobs = [...contentLogprobs ?? [], ...refusalLogprobs ?? []];
		return {
			content,
			finishReason: {
				unified: mapOpenAIFinishReason$1({
					finishReason: choice.finish_reason,
					hasRefusal
				}),
				raw: choice.finish_reason ?? void 0
			},
			usage: convertOpenAIChatUsage(response.usage),
			request: {
				body,
				url
			},
			response: {
				...getResponseMetadata$1(response),
				headers: responseHeaders,
				body: rawResponse
			},
			warnings,
			providerMetadata
		};
	}
	async doStream(options) {
		const { args, warnings } = await this.getArgs(options);
		const body = {
			...args,
			stream: true,
			stream_options: { include_usage: true }
		};
		const url = this.config.url({
			path: "/chat/completions",
			modelId: this.config.requestModelId ?? this.modelId
		});
		const { responseHeaders, value: response } = await (0,dist/* postJsonToApi */.GU)({
			url,
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createEventSourceResponseHandler */.Ds)(openaiChatChunkSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const checkedResponse = await throwIfOpenAIStreamErrorBeforeOutput({
			stream: response,
			getError: (chunk) => "error" in chunk ? chunk.error : void 0,
			isOutputChunk: isOpenAIChatOutputChunk,
			url,
			requestBodyValues: body,
			responseHeaders
		});
		let toolCallTracker;
		let finishReason = {
			unified: "interrupted",
			raw: void 0
		};
		let usage = void 0;
		let metadataExtracted = false;
		let isActiveText = false;
		let hasRefusal = false;
		let rawFinishReason = void 0;
		let hasLogprobs = false;
		const streamedLogprobs = [];
		const providerMetadata = { openai: {} };
		return {
			stream: checkedResponse.pipeThrough(new TransformStream({
				start(controller) {
					toolCallTracker = new dist/* StreamingToolCallTracker */.HE(controller, {
						generateId: dist/* generateId */.$C,
						typeValidation: "if-present"
					});
					controller.enqueue({
						type: "stream-start",
						warnings
					});
				},
				transform(chunk, controller) {
					if (options.includeRawChunks) controller.enqueue({
						type: "raw",
						rawValue: chunk.rawValue
					});
					if (!chunk.success) {
						finishReason = {
							unified: "error",
							raw: void 0
						};
						rawFinishReason = void 0;
						controller.enqueue({
							type: "error",
							error: chunk.error
						});
						return;
					}
					const value = chunk.value;
					if ("error" in value) {
						finishReason = {
							unified: "error",
							raw: void 0
						};
						rawFinishReason = void 0;
						controller.enqueue({
							type: "error",
							error: createOpenAIProviderStreamError(value.error) ?? value.error
						});
						return;
					}
					if (!metadataExtracted) {
						const metadata = getResponseMetadata$1(value);
						if (Object.values(metadata).some(Boolean)) {
							metadataExtracted = true;
							controller.enqueue({
								type: "response-metadata",
								...getResponseMetadata$1(value)
							});
						}
					}
					if (value.usage != null) {
						usage = value.usage;
						if (value.usage.completion_tokens_details?.accepted_prediction_tokens != null) providerMetadata.openai.acceptedPredictionTokens = value.usage.completion_tokens_details?.accepted_prediction_tokens;
						if (value.usage.completion_tokens_details?.rejected_prediction_tokens != null) providerMetadata.openai.rejectedPredictionTokens = value.usage.completion_tokens_details?.rejected_prediction_tokens;
					}
					const choice = value.choices[0];
					if (choice?.finish_reason != null) rawFinishReason = choice.finish_reason;
					if (choice?.logprobs != null) {
						const contentLogprobs = choice.logprobs.content;
						const refusalLogprobs = choice.logprobs.refusal;
						if (contentLogprobs != null || refusalLogprobs != null) {
							hasLogprobs = true;
							streamedLogprobs.push(...contentLogprobs ?? [], ...refusalLogprobs ?? []);
						}
					}
					if (choice?.delta == null) return;
					const delta = choice.delta;
					const textDeltas = [];
					if (delta.content != null && delta.content.length > 0) textDeltas.push(delta.content);
					if (delta.refusal != null && delta.refusal.length > 0) {
						hasRefusal = true;
						textDeltas.push(delta.refusal);
					}
					if (textDeltas.length === 0 && delta.content === "") textDeltas.push(delta.content);
					for (const textDelta of textDeltas) {
						if (!isActiveText) {
							controller.enqueue({
								type: "text-start",
								id: "0"
							});
							isActiveText = true;
						}
						controller.enqueue({
							type: "text-delta",
							id: "0",
							delta: textDelta
						});
					}
					if (delta.tool_calls != null) for (const toolCallDelta of delta.tool_calls) toolCallTracker.processDelta(toolCallDelta);
					if (delta.annotations != null) for (const annotation of delta.annotations) controller.enqueue({
						type: "source",
						sourceType: "url",
						id: (0,dist/* generateId */.$C)(),
						url: annotation.url_citation.url,
						title: annotation.url_citation.title
					});
				},
				flush(controller) {
					if (isActiveText) controller.enqueue({
						type: "text-end",
						id: "0"
					});
					toolCallTracker.flush();
					if (rawFinishReason != null) finishReason = {
						unified: mapOpenAIFinishReason$1({
							finishReason: rawFinishReason,
							hasRefusal
						}),
						raw: rawFinishReason
					};
					if (hasLogprobs) providerMetadata.openai.logprobs = streamedLogprobs;
					controller.enqueue({
						type: "finish",
						finishReason,
						usage: convertOpenAIChatUsage(usage),
						...providerMetadata != null ? { providerMetadata } : {}
					});
				}
			})),
			request: {
				body,
				url
			},
			response: { headers: responseHeaders }
		};
	}
};
function isOpenAIChatOutputChunk(chunk) {
	if ("error" in chunk) return false;
	return chunk.choices.some((choice) => {
		const delta = choice.delta;
		return delta?.content != null && delta.content.length > 0 || delta?.refusal != null && delta.refusal.length > 0 || delta?.tool_calls != null && delta.tool_calls.length > 0 || delta?.annotations != null && delta.annotations.length > 0;
	});
}
//#endregion
//#region src/completion/convert-openai-completion-usage.ts
function convertOpenAICompletionUsage(usage) {
	if (usage == null) return (0,dist/* createNullLanguageModelUsage */.EK)();
	const promptTokens = usage.prompt_tokens ?? 0;
	const completionTokens = usage.completion_tokens ?? 0;
	return {
		inputTokens: {
			total: usage.prompt_tokens ?? void 0,
			noCache: promptTokens,
			cacheRead: void 0,
			cacheWrite: void 0
		},
		outputTokens: {
			total: usage.completion_tokens ?? void 0,
			text: completionTokens,
			reasoning: void 0
		},
		raw: usage
	};
}
//#endregion
//#region src/completion/convert-to-openai-completion-prompt.ts
function convertToOpenAICompletionPrompt({ prompt, user = "user", assistant = "assistant" }) {
	let text = "";
	if (prompt[0].role === "system") {
		text += `${prompt[0].content}\n\n`;
		prompt = prompt.slice(1);
	}
	for (const { role, content } of prompt) switch (role) {
		case "system": throw new provider_dist/* InvalidPromptError */.M3({
			message: `Unexpected system message in prompt: ${content}`,
			prompt
		});
		case "user": {
			const userMessage = content.map((part) => {
				switch (part.type) {
					case "text": return part.text;
				}
			}).filter(Boolean).join("");
			text += `${user}:\n${userMessage}\n\n`;
			break;
		}
		case "assistant": {
			const assistantMessage = content.map((part) => {
				switch (part.type) {
					case "text": return part.text;
					case "tool-call": throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "tool-call messages" });
				}
			}).join("");
			text += `${assistant}:\n${assistantMessage}\n\n`;
			break;
		}
		case "tool": throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "tool messages" });
		default: throw new Error(`Unsupported role: ${role}`);
	}
	text += `${assistant}:\n`;
	return {
		prompt: text,
		stopSequences: [`\n${user}:`]
	};
}
//#endregion
//#region src/completion/map-openai-finish-reason.ts
function mapOpenAIFinishReason(finishReason) {
	switch (finishReason) {
		case "stop": return "stop";
		case "length": return "length";
		case "content_filter": return "content-filter";
		case "function_call":
		case "tool_calls": return "tool-calls";
		default: return "other";
	}
}
//#endregion
//#region src/completion/openai-completion-api.ts
const openaiCompletionResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP().nullish(),
	created: classic_schemas/* number */.aig().nullish(),
	model: classic_schemas/* string */.YjP().nullish(),
	choices: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		text: classic_schemas/* string */.YjP(),
		finish_reason: classic_schemas/* string */.YjP(),
		logprobs: classic_schemas/* object */.Ikc({
			tokens: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
			token_logprobs: classic_schemas/* array */.YOg(classic_schemas/* number */.aig()),
			top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* number */.aig())).nullish()
		}).nullish()
	})),
	usage: classic_schemas/* object */.Ikc({
		prompt_tokens: classic_schemas/* number */.aig(),
		completion_tokens: classic_schemas/* number */.aig(),
		total_tokens: classic_schemas/* number */.aig()
	}).nullish()
})));
const openaiCompletionChunkSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* union */.KCZ([classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP().nullish(),
	created: classic_schemas/* number */.aig().nullish(),
	model: classic_schemas/* string */.YjP().nullish(),
	choices: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		text: classic_schemas/* string */.YjP(),
		finish_reason: classic_schemas/* string */.YjP().nullish(),
		index: classic_schemas/* number */.aig(),
		logprobs: classic_schemas/* object */.Ikc({
			tokens: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
			token_logprobs: classic_schemas/* array */.YOg(classic_schemas/* number */.aig()),
			top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* number */.aig())).nullish()
		}).nullish()
	})),
	usage: classic_schemas/* object */.Ikc({
		prompt_tokens: classic_schemas/* number */.aig(),
		completion_tokens: classic_schemas/* number */.aig(),
		total_tokens: classic_schemas/* number */.aig()
	}).nullish()
}), openaiErrorDataSchema()])));
//#endregion
//#region src/completion/openai-completion-language-model-options.ts
const openaiLanguageModelCompletionOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	/**
	* Echo back the prompt in addition to the completion.
	*/
	echo: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Modify the likelihood of specified tokens appearing in the completion.
	*
	* Accepts a JSON object that maps tokens (specified by their token ID in
	* the GPT tokenizer) to an associated bias value from -100 to 100. You
	* can use this tokenizer tool to convert text to token IDs. Mathematically,
	* the bias is added to the logits generated by the model prior to sampling.
	* The exact effect will vary per model, but values between -1 and 1 should
	* decrease or increase likelihood of selection; values like -100 or 100
	* should result in a ban or exclusive selection of the relevant token.
	*
	* As an example, you can pass {"50256": -100} to prevent the <|endoftext|>
	* token from being generated.
	*/
	logitBias: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* number */.aig()).optional(),
	/**
	* The suffix that comes after a completion of inserted text.
	*/
	suffix: classic_schemas/* string */.YjP().optional(),
	/**
	* A unique identifier representing your end-user, which can help OpenAI to
	* monitor and detect abuse. Learn more.
	*/
	user: classic_schemas/* string */.YjP().optional(),
	/**
	* Return the log probabilities of the tokens. Including logprobs will increase
	* the response size and can slow down response times. However, it can
	* be useful to better understand how the model is behaving.
	* Setting to true will return the log probabilities of the tokens that
	* were generated.
	* Setting to a number will return the log probabilities of the top n
	* tokens that were generated.
	*/
	logprobs: classic_schemas/* union */.KCZ([classic_schemas/* boolean */.zMY(), classic_schemas/* number */.aig()]).optional()
})));
//#endregion
//#region src/completion/openai-completion-language-model.ts
var OpenAICompletionLanguageModel = class OpenAICompletionLanguageModel {
	get providerOptionsName() {
		return this.config.provider.split(".")[0].trim();
	}
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAICompletionLanguageModel(options.modelId, options.config);
	}
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.supportedUrls = {};
		this.modelId = modelId;
		this.config = config;
	}
	get provider() {
		return this.config.provider;
	}
	async getArgs({ prompt, maxOutputTokens, temperature, topP, topK, frequencyPenalty, presencePenalty, stopSequences: userStopSequences, responseFormat, tools, toolChoice, seed, providerOptions }) {
		const warnings = [];
		const openaiOptions = (await (0,dist/* resolveProviderOptions */.Wo)({
			providerOptions,
			namespaces: ["openai", this.providerOptionsName],
			resolution: "merge",
			schema: openaiLanguageModelCompletionOptions
		})).options ?? {};
		if (topK != null) warnings.push({
			type: "unsupported",
			feature: "topK"
		});
		if (tools?.length) warnings.push({
			type: "unsupported",
			feature: "tools"
		});
		if (toolChoice != null) warnings.push({
			type: "unsupported",
			feature: "toolChoice"
		});
		if (responseFormat != null && responseFormat.type !== "text") warnings.push({
			type: "unsupported",
			feature: "responseFormat",
			details: "JSON response format is not supported."
		});
		const { prompt: completionPrompt, stopSequences } = convertToOpenAICompletionPrompt({ prompt });
		const stop = [...stopSequences ?? [], ...userStopSequences ?? []];
		return {
			args: {
				model: this.config.requestModelId ?? this.modelId,
				echo: openaiOptions.echo,
				logit_bias: openaiOptions.logitBias,
				logprobs: openaiOptions?.logprobs === true ? 0 : openaiOptions?.logprobs === false ? void 0 : openaiOptions?.logprobs,
				suffix: openaiOptions.suffix,
				user: openaiOptions.user,
				max_tokens: maxOutputTokens,
				temperature,
				top_p: topP,
				frequency_penalty: frequencyPenalty,
				presence_penalty: presencePenalty,
				seed,
				prompt: completionPrompt,
				stop: stop.length > 0 ? stop : void 0
			},
			warnings
		};
	}
	async doGenerate(options) {
		const { args, warnings } = await this.getArgs(options);
		const { responseHeaders, value: response, rawValue: rawResponse } = await (0,dist/* postJsonToApi */.GU)({
			url: this.config.url({
				path: "/completions",
				modelId: this.config.requestModelId ?? this.modelId
			}),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body: args,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiCompletionResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const choice = response.choices[0];
		const providerMetadata = { openai: {} };
		if (choice.logprobs != null) providerMetadata.openai.logprobs = choice.logprobs;
		return {
			content: [{
				type: "text",
				text: choice.text
			}],
			usage: convertOpenAICompletionUsage(response.usage),
			finishReason: {
				unified: mapOpenAIFinishReason(choice.finish_reason),
				raw: choice.finish_reason ?? void 0
			},
			request: { body: args },
			response: {
				...(0,dist/* createLanguageModelResponseMetadata */.qX)(response),
				headers: responseHeaders,
				body: rawResponse
			},
			providerMetadata,
			warnings
		};
	}
	async doStream(options) {
		const { args, warnings } = await this.getArgs(options);
		const body = {
			...args,
			stream: true,
			stream_options: { include_usage: true }
		};
		const url = this.config.url({
			path: "/completions",
			modelId: this.config.requestModelId ?? this.modelId
		});
		const { responseHeaders, value: response } = await (0,dist/* postJsonToApi */.GU)({
			url,
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createEventSourceResponseHandler */.Ds)(openaiCompletionChunkSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const checkedResponse = await throwIfOpenAIStreamErrorBeforeOutput({
			stream: response,
			getError: (chunk) => "error" in chunk ? chunk.error : void 0,
			isOutputChunk: isOpenAICompletionOutputChunk,
			url,
			requestBodyValues: body,
			responseHeaders
		});
		let finishReason = {
			unified: "interrupted",
			raw: void 0
		};
		const providerMetadata = { openai: {} };
		let usage = void 0;
		let isFirstChunk = true;
		return {
			stream: checkedResponse.pipeThrough(new TransformStream({
				start(controller) {
					controller.enqueue({
						type: "stream-start",
						warnings
					});
				},
				transform(chunk, controller) {
					if (options.includeRawChunks) controller.enqueue({
						type: "raw",
						rawValue: chunk.rawValue
					});
					if (!chunk.success) {
						finishReason = {
							unified: "error",
							raw: void 0
						};
						controller.enqueue({
							type: "error",
							error: chunk.error
						});
						return;
					}
					const value = chunk.value;
					if ("error" in value) {
						finishReason = {
							unified: "error",
							raw: void 0
						};
						controller.enqueue({
							type: "error",
							error: createOpenAIProviderStreamError(value.error) ?? value.error
						});
						return;
					}
					if (isFirstChunk) {
						isFirstChunk = false;
						controller.enqueue({
							type: "response-metadata",
							...(0,dist/* createLanguageModelResponseMetadata */.qX)(value)
						});
						controller.enqueue({
							type: "text-start",
							id: "0"
						});
					}
					if (value.usage != null) usage = value.usage;
					const choice = value.choices[0];
					if (choice?.finish_reason != null) finishReason = {
						unified: mapOpenAIFinishReason(choice.finish_reason),
						raw: choice.finish_reason
					};
					if (choice?.logprobs != null) providerMetadata.openai.logprobs = choice.logprobs;
					if (choice?.text != null && choice.text.length > 0) controller.enqueue({
						type: "text-delta",
						id: "0",
						delta: choice.text
					});
				},
				flush(controller) {
					if (!isFirstChunk) controller.enqueue({
						type: "text-end",
						id: "0"
					});
					controller.enqueue({
						type: "finish",
						finishReason,
						providerMetadata,
						usage: convertOpenAICompletionUsage(usage)
					});
				}
			})),
			request: { body },
			response: { headers: responseHeaders }
		};
	}
};
function isOpenAICompletionOutputChunk(chunk) {
	return !("error" in chunk) && chunk.choices.some((choice) => choice.text.length > 0);
}
//#endregion
//#region src/embedding/openai-embedding-model-options.ts
const openaiEmbeddingModelOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	/**
	* The number of dimensions the resulting output embeddings should have.
	* Only supported in text-embedding-3 and later models.
	*/
	dimensions: classic_schemas/* number */.aig().optional(),
	/**
	* A unique identifier representing your end-user, which can help OpenAI to
	* monitor and detect abuse. Learn more.
	*/
	user: classic_schemas/* string */.YjP().optional()
})));
//#endregion
//#region src/embedding/openai-embedding-api.ts
const openaiTextEmbeddingResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	data: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({ embedding: classic_schemas/* array */.YOg(classic_schemas/* number */.aig()) })),
	usage: classic_schemas/* object */.Ikc({ prompt_tokens: classic_schemas/* number */.aig() }).nullish()
})));
//#endregion
//#region src/embedding/openai-embedding-model.ts
var OpenAIEmbeddingModel = class OpenAIEmbeddingModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAIEmbeddingModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.maxEmbeddingsPerCall = 2048;
		this[dist/* EXPERIMENTAL_EMBEDDING_MODEL_MAX_INPUT_BYTES_PER_CALL */.cI] = 3e5;
		this.supportsParallelCalls = true;
		this.modelId = modelId;
		this.config = config;
	}
	async doEmbed({ values, dimensions, headers, abortSignal, providerOptions }) {
		if (values.length > this.maxEmbeddingsPerCall) throw new provider_dist/* TooManyEmbeddingValuesForCallError */.Ch({
			provider: this.provider,
			modelId: this.modelId,
			maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
			values
		});
		const openaiOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openaiEmbeddingModelOptions
		}) ?? {};
		const { responseHeaders, value: response, rawValue } = await (0,dist/* postJsonToApi */.GU)({
			url: this.config.url({
				path: "/embeddings",
				modelId: this.modelId
			}),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), headers),
			body: {
				model: this.modelId,
				input: values,
				encoding_format: "float",
				dimensions: openaiOptions.dimensions ?? dimensions,
				user: openaiOptions.user
			},
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiTextEmbeddingResponseSchema),
			abortSignal,
			fetch: this.config.fetch
		});
		return {
			warnings: [],
			embeddings: response.data.map((item) => item.embedding),
			usage: response.usage ? { tokens: response.usage.prompt_tokens } : void 0,
			response: {
				headers: responseHeaders,
				body: rawValue
			}
		};
	}
};
//#endregion
//#region src/files/openai-files-api.ts
const openaiFilesResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	object: classic_schemas/* string */.YjP().nullish(),
	bytes: classic_schemas/* number */.aig().nullish(),
	created_at: classic_schemas/* number */.aig().nullish(),
	filename: classic_schemas/* string */.YjP().nullish(),
	purpose: classic_schemas/* string */.YjP().nullish(),
	status: classic_schemas/* string */.YjP().nullish(),
	expires_at: classic_schemas/* number */.aig().nullish()
})));
const openaiFileDeleteResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	object: classic_schemas/* string */.YjP().nullish(),
	deleted: classic_schemas/* boolean */.zMY()
})));
//#endregion
//#region src/files/openai-files-options.ts
const openaiFilesOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	purpose: classic_schemas/* string */.YjP().optional(),
	expiresAfter: classic_schemas/* number */.aig().optional()
})));
//#endregion
//#region src/files/openai-files.ts
var OpenAIFiles = class {
	get provider() {
		return this.config.provider;
	}
	constructor(config) {
		this.config = config;
		this.specificationVersion = "v4";
	}
	getFileId(file) {
		const fileId = file.openai;
		if (fileId == null || fileId.trim() === "") throw new provider_dist/* InvalidArgumentError */.Di({
			argument: "file",
			message: "file reference is missing an 'openai' file id."
		});
		return fileId;
	}
	async getHeaders(headers) {
		return (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), headers);
	}
	async uploadFile({ data, mediaType, filename, abortSignal, headers, providerOptions }) {
		let openaiOptions;
		try {
			openaiOptions = await (0,dist/* parseProviderOptions */.xI)({
				provider: "openai",
				providerOptions,
				schema: openaiFilesOptionsSchema
			});
		} catch (error) {
			if (data.type === "stream") await data.stream.cancel(error).catch(() => {});
			throw error;
		}
		const purpose = openaiOptions?.purpose ?? "assistants";
		const requestHeaders = await this.getHeaders(headers);
		const url = `${this.config.baseURL}/files`;
		let response;
		if (data.type === "stream") {
			const parts = [{
				type: "field",
				name: "purpose",
				value: purpose
			}];
			if (openaiOptions?.expiresAfter != null) parts.push({
				type: "field",
				name: "expires_after[anchor]",
				value: "created_at"
			}, {
				type: "field",
				name: "expires_after[seconds]",
				value: String(openaiOptions.expiresAfter)
			});
			parts.push({
				type: "file",
				name: "file",
				filename,
				mediaType,
				content: data.stream
			});
			({value: response} = await (0,dist/* postMultipartStreamToApi */.st)({
				url,
				headers: requestHeaders,
				parts,
				failedResponseHandler: openaiFailedResponseHandler,
				successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiFilesResponseSchema),
				abortSignal,
				fetch: this.config.fetch
			}));
		} else {
			const fileBytes = (0,dist/* convertInlineFileDataToUint8Array */.XQ)(data);
			const blob = new Blob([fileBytes], { type: mediaType });
			const formData = new FormData();
			if (filename != null) formData.append("file", blob, filename);
			else formData.append("file", blob);
			formData.append("purpose", purpose);
			if (openaiOptions?.expiresAfter != null) {
				formData.append("expires_after[anchor]", "created_at");
				formData.append("expires_after[seconds]", String(openaiOptions.expiresAfter));
			}
			({value: response} = await (0,dist/* postFormDataToApi */.S)({
				url,
				headers: requestHeaders,
				formData,
				failedResponseHandler: openaiFailedResponseHandler,
				successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiFilesResponseSchema),
				abortSignal,
				fetch: this.config.fetch
			}));
		}
		return {
			warnings: [],
			providerReference: { openai: response.id },
			...response.filename ?? filename ? { filename: response.filename ?? filename } : {},
			...mediaType != null ? { mediaType } : {},
			...response.bytes != null ? { byteSize: response.bytes } : {},
			...response.created_at != null ? { createdAt: /* @__PURE__ */ new Date(response.created_at * 1e3) } : {},
			...response.expires_at != null ? { expiresAt: /* @__PURE__ */ new Date(response.expires_at * 1e3) } : {},
			providerMetadata: { openai: this.toFileMetadata(response) }
		};
	}
	async getFileMetadata({ file, abortSignal, headers }) {
		const fileId = this.getFileId(file);
		const { value: response } = await (0,dist/* getFromApi */.$b)({
			url: `${this.config.baseURL}/files/${(0,dist/* encodePathSegment */.$9)(fileId)}`,
			headers: await this.getHeaders(headers),
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiFilesResponseSchema),
			abortSignal,
			fetch: this.config.fetch,
			validateUrl: false
		});
		return {
			warnings: [],
			providerReference: { openai: response.id },
			...response.filename != null ? { filename: response.filename } : {},
			...response.bytes != null ? { byteSize: response.bytes } : {},
			...response.created_at != null ? { createdAt: /* @__PURE__ */ new Date(response.created_at * 1e3) } : {},
			...response.expires_at != null ? { expiresAt: /* @__PURE__ */ new Date(response.expires_at * 1e3) } : {},
			providerMetadata: { openai: this.toFileMetadata(response) }
		};
	}
	async downloadFile({ file, abortSignal, headers }) {
		const fileId = this.getFileId(file);
		const { value: content, responseHeaders } = await (0,dist/* getFromApi */.$b)({
			url: `${this.config.baseURL}/files/${(0,dist/* encodePathSegment */.$9)(fileId)}/content`,
			headers: await this.getHeaders(headers),
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createBinaryStreamResponseHandler */.JM)(),
			abortSignal,
			fetch: this.config.fetch,
			validateUrl: false
		});
		const mediaType = responseHeaders?.["content-type"]?.split(";")[0].trim();
		return {
			warnings: [],
			content,
			...mediaType ? { mediaType } : {}
		};
	}
	async deleteFile({ file, abortSignal, headers }) {
		const fileId = this.getFileId(file);
		const { value: response } = await (0,dist/* deleteFromApi */._$)({
			url: `${this.config.baseURL}/files/${(0,dist/* encodePathSegment */.$9)(fileId)}`,
			headers: await this.getHeaders(headers),
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiFileDeleteResponseSchema),
			abortSignal,
			fetch: this.config.fetch
		});
		return {
			warnings: [],
			providerReference: { openai: response.id },
			deleted: response.deleted
		};
	}
	toFileMetadata(response) {
		return {
			...response.filename != null ? { filename: response.filename } : {},
			...response.purpose != null ? { purpose: response.purpose } : {},
			...response.bytes != null ? { bytes: response.bytes } : {},
			...response.created_at != null ? { createdAt: response.created_at } : {},
			...response.status != null ? { status: response.status } : {},
			...response.expires_at != null ? { expiresAt: response.expires_at } : {}
		};
	}
};
//#endregion
//#region src/image/openai-image-api.ts
const openaiImageResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	created: classic_schemas/* number */.aig().nullish(),
	data: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		b64_json: classic_schemas/* string */.YjP(),
		revised_prompt: classic_schemas/* string */.YjP().nullish()
	})),
	background: classic_schemas/* string */.YjP().nullish(),
	output_format: classic_schemas/* string */.YjP().nullish(),
	size: classic_schemas/* string */.YjP().nullish(),
	quality: classic_schemas/* string */.YjP().nullish(),
	usage: classic_schemas/* object */.Ikc({
		input_tokens: classic_schemas/* number */.aig().nullish(),
		output_tokens: classic_schemas/* number */.aig().nullish(),
		total_tokens: classic_schemas/* number */.aig().nullish(),
		input_tokens_details: classic_schemas/* object */.Ikc({
			image_tokens: classic_schemas/* number */.aig().nullish(),
			text_tokens: classic_schemas/* number */.aig().nullish()
		}).nullish()
	}).nullish()
})));
//#endregion
//#region src/image/openai-image-model-options.ts
function hasDefaultResponseFormat(modelId) {
	return getOpenAIImageModelEntry(modelId).requestConfig.image.responseFormat === "provider-default";
}
function getMaxImagesPerCall(modelId) {
	return getOpenAIImageModelEntry(modelId).capabilities.image.maxImagesPerCall ?? 1;
}
const baseImageModelOptionsObject = () => classic_schemas/* object */.Ikc({
	/**
	* Quality of the generated image(s).
	*
	* Valid values: `standard`, `hd`, `low`, `medium`, `high`, `xhigh`, `max`, `auto`.
	* `xhigh` and `max` are supported by GPT Image 2.5 models.
	*/
	quality: classic_schemas/* enum */.k5n([
		"standard",
		"hd",
		"low",
		"medium",
		"high",
		"xhigh",
		"max",
		"auto"
	]).optional(),
	/**
	* Background behavior for the generated image(s).
	*
	* If `transparent`, the output format must support transparency
	* (i.e. `png` or `webp`).
	*/
	background: classic_schemas/* enum */.k5n([
		"transparent",
		"opaque",
		"auto"
	]).optional(),
	/**
	* Format in which the generated image(s) are returned.
	*/
	outputFormat: classic_schemas/* enum */.k5n([
		"png",
		"jpeg",
		"webp"
	]).optional(),
	/**
	* How much detail the model puts into the image. Supported by GPT Image
	* 2.6 models. The API defaults to `high`.
	*/
	complexity: classic_schemas/* enum */.k5n([
		"low",
		"medium",
		"high"
	]).optional(),
	/**
	* Compression level (0-100) for the generated image(s). Applies to the
	* `jpeg` and `webp` output formats.
	*/
	outputCompression: classic_schemas/* number */.aig().int().min(0).max(100).optional(),
	/**
	* A unique identifier representing your end-user, which can help OpenAI
	* to monitor and detect abuse.
	*/
	user: classic_schemas/* string */.YjP().optional(),
	/**
	* A stable identifier used to help detect users of your application that
	* may be violating OpenAI's usage policies. Should be a hashed username
	* or email address.
	*/
	safetyIdentifier: classic_schemas/* string */.YjP().max(128).optional()
});
(0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(baseImageModelOptionsObject()));
/**
* Shape of the OpenAI image generation options. Exported so that routers
* that also call the OpenAI image API (e.g. Azure) can accept these options
* under their own providerOptions key.
*/
const openaiImageModelGenerationOptionsShape = () => baseImageModelOptionsObject().extend({
	/**
	* Style of the generated image. `vivid` produces hyper-real and
	* dramatic images; `natural` produces more subdued, less hyper-real
	* looking images.
	*/
	style: classic_schemas/* enum */.k5n(["vivid", "natural"]).optional(),
	/**
	* Format in which the generated image(s) are returned. `gif` produces
	* an animated GIF and is supported by GPT Image 2.6 models.
	*/
	outputFormat: classic_schemas/* enum */.k5n([
		"png",
		"jpeg",
		"webp",
		"gif"
	]).optional(),
	/**
	* Number of frames (2-64) of an animated GIF. Only applies to the `gif`
	* output format. The API defaults to 9.
	*/
	frameCount: classic_schemas/* number */.aig().int().min(2).max(64).optional(),
	/**
	* Duration of each frame in milliseconds (20-2000) of an animated GIF.
	* The API rounds it to the nearest 10 ms. Only applies to the `gif`
	* output format. The API defaults to 200.
	*/
	frameDurationMs: classic_schemas/* number */.aig().int().min(20).max(2e3).optional(),
	/**
	* Content moderation level for the generated image(s). `low` applies
	* less restrictive filtering.
	*/
	moderation: classic_schemas/* enum */.k5n(["auto", "low"]).optional()
}).shape;
const openaiImageModelGenerationOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc(openaiImageModelGenerationOptionsShape())));
/**
* Shape of the OpenAI image edit options. Exported so that routers can accept
* these options under their own providerOptions key.
*/
const openaiImageModelEditOptionsShape = () => baseImageModelOptionsObject().extend({
	/**
	* Fidelity of the output image(s) to the input image(s).
	*/
	inputFidelity: classic_schemas/* enum */.k5n(["high", "low"]).optional(),
	/**
	* A transparent PNG overlaid on the first input image to mark up the
	* regions to change, as an HTTPS URL or a base64 data URL. It must match
	* the dimensions of the first image. Supported by GPT Image 2.5 and 2.6
	* models. Cannot be combined with a `mask`.
	*/
	markup: classic_schemas/* string */.YjP().optional(),
	/**
	* Content moderation level for the edited image(s). `low` applies
	* less restrictive filtering. Supported by GPT Image models.
	*/
	moderation: classic_schemas/* enum */.k5n(["auto", "low"]).optional()
}).shape;
const openaiImageModelEditOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc(openaiImageModelEditOptionsShape())));
//#endregion
//#region src/image/openai-image-model.ts
var OpenAIImageModel = class OpenAIImageModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAIImageModel(options.modelId, options.config);
	}
	get maxImagesPerCall() {
		return getMaxImagesPerCall(this.modelId);
	}
	get supportsFileInputs() {
		if (this.config.imageInputCapabilities != null) return this.config.imageInputCapabilities.supportsFileInputs;
		const support = getOpenAIImageModelEntry(this.modelId).capabilities.image.fileInput;
		return typeof support === "boolean" ? support : void 0;
	}
	get supportsMaskInputs() {
		if (this.config.imageInputCapabilities != null) return this.config.imageInputCapabilities.supportsMaskInputs;
		const support = getOpenAIImageModelEntry(this.modelId).capabilities.image.maskInput;
		return typeof support === "boolean" ? support : void 0;
	}
	get provider() {
		return this.config.provider;
	}
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	async doGenerate({ prompt, files, mask, n, size, aspectRatio, seed, providerOptions, headers, abortSignal }) {
		const warnings = [];
		if (aspectRatio != null) warnings.push({
			type: "unsupported",
			feature: "aspectRatio",
			details: "This model does not support aspect ratio. Use `size` instead."
		});
		if (seed != null) warnings.push({
			type: "unsupported",
			feature: "seed"
		});
		const currentDate = this.config._internal?.currentDate?.() ?? /* @__PURE__ */ new Date();
		if (files != null) {
			const openaiOptions = await (0,dist/* parseProviderOptions */.xI)({
				provider: "openai",
				providerOptions,
				schema: openaiImageModelEditOptions
			}) ?? {};
			if (mask != null && openaiOptions.markup != null) throw new provider_dist/* InvalidArgumentError */.Di({
				argument: "providerOptions.openai.markup",
				message: "`markup` cannot be combined with `mask`."
			});
			const { value: response, responseHeaders } = await (0,dist/* postFormDataToApi */.S)({
				url: this.config.url({
					path: "/images/edits",
					modelId: this.modelId
				}),
				headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), headers),
				formData: (0,dist/* convertToFormData */.jW)({
					model: this.modelId,
					prompt,
					image: await Promise.all(files.map((file) => file.type === "file" ? new Blob([file.data instanceof Uint8Array ? new Blob([file.data], { type: file.mediaType }) : new Blob([(0,dist/* convertBase64ToUint8Array */.Z9)(file.data)], { type: file.mediaType })], { type: file.mediaType }) : (0,dist/* downloadBlob */.WN)(file.url, {
						abortSignal,
						fetch: this.config.downloadFetch ?? this.config.fetch
					}))),
					mask: mask != null ? await fileToBlob(mask, abortSignal, this.config.downloadFetch ?? this.config.fetch) : void 0,
					markup: openaiOptions.markup != null ? await markupToBlob(openaiOptions.markup, abortSignal, this.config.downloadFetch ?? this.config.fetch) : void 0,
					n,
					size,
					quality: openaiOptions.quality,
					background: openaiOptions.background,
					output_format: openaiOptions.outputFormat,
					output_compression: openaiOptions.outputCompression,
					complexity: openaiOptions.complexity,
					input_fidelity: openaiOptions.inputFidelity,
					moderation: openaiOptions.moderation,
					user: openaiOptions.user,
					safety_identifier: openaiOptions.safetyIdentifier
				}),
				failedResponseHandler: openaiFailedResponseHandler,
				successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiImageResponseSchema),
				abortSignal,
				fetch: this.config.fetch
			});
			return {
				images: response.data.map((item) => item.b64_json),
				warnings,
				usage: response.usage != null ? {
					inputTokens: response.usage.input_tokens ?? void 0,
					outputTokens: response.usage.output_tokens ?? void 0,
					totalTokens: response.usage.total_tokens ?? void 0
				} : void 0,
				response: {
					timestamp: currentDate,
					modelId: this.modelId,
					headers: responseHeaders
				},
				providerMetadata: { openai: { images: response.data.map((item, index) => ({
					...item.revised_prompt ? { revisedPrompt: item.revised_prompt } : {},
					created: response.created ?? void 0,
					size: response.size ?? void 0,
					quality: response.quality ?? void 0,
					background: response.background ?? void 0,
					outputFormat: response.output_format ?? void 0,
					...distributeTokenDetails(response.usage?.input_tokens_details, index, response.data.length)
				})) } }
			};
		}
		const openaiOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openaiImageModelGenerationOptions
		}) ?? {};
		const { value: response, responseHeaders } = await (0,dist/* postJsonToApi */.GU)({
			url: this.config.url({
				path: "/images/generations",
				modelId: this.modelId
			}),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), headers),
			body: {
				model: this.modelId,
				prompt,
				n,
				size,
				quality: openaiOptions.quality,
				style: openaiOptions.style,
				background: openaiOptions.background,
				moderation: openaiOptions.moderation,
				output_format: openaiOptions.outputFormat,
				output_compression: openaiOptions.outputCompression,
				complexity: openaiOptions.complexity,
				frame_count: openaiOptions.frameCount,
				frame_duration_ms: openaiOptions.frameDurationMs,
				user: openaiOptions.user,
				safety_identifier: openaiOptions.safetyIdentifier,
				...!hasDefaultResponseFormat(this.modelId) ? { response_format: "b64_json" } : {}
			},
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiImageResponseSchema),
			abortSignal,
			fetch: this.config.fetch
		});
		return {
			images: response.data.map((item) => item.b64_json),
			warnings,
			usage: response.usage != null ? {
				inputTokens: response.usage.input_tokens ?? void 0,
				outputTokens: response.usage.output_tokens ?? void 0,
				totalTokens: response.usage.total_tokens ?? void 0
			} : void 0,
			response: {
				timestamp: currentDate,
				modelId: this.modelId,
				headers: responseHeaders
			},
			providerMetadata: { openai: { images: response.data.map((item, index) => ({
				...item.revised_prompt ? { revisedPrompt: item.revised_prompt } : {},
				created: response.created ?? void 0,
				size: response.size ?? void 0,
				quality: response.quality ?? void 0,
				background: response.background ?? void 0,
				outputFormat: response.output_format ?? void 0,
				...distributeTokenDetails(response.usage?.input_tokens_details, index, response.data.length)
			})) } }
		};
	}
};
/**
* Distributes input token details evenly across images, with the remainder
* assigned to the last image so that summing across all entries gives the
* exact total.
*/
function distributeTokenDetails(details, index, total) {
	if (details == null) return {};
	const result = {};
	if (details.image_tokens != null) {
		const base = Math.floor(details.image_tokens / total);
		const remainder = details.image_tokens - base * (total - 1);
		result.imageTokens = index === total - 1 ? remainder : base;
	}
	if (details.text_tokens != null) {
		const base = Math.floor(details.text_tokens / total);
		const remainder = details.text_tokens - base * (total - 1);
		result.textTokens = index === total - 1 ? remainder : base;
	}
	return result;
}
async function markupToBlob(markup, abortSignal, fetch) {
	const dataUrl = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(markup);
	if (dataUrl == null) return (0,dist/* downloadBlob */.WN)(markup, {
		abortSignal,
		fetch
	});
	if (dataUrl[2] == null) throw new provider_dist/* InvalidArgumentError */.Di({
		argument: "providerOptions.openai.markup",
		message: "`markup` data URLs must be base64 encoded."
	});
	return new Blob([(0,dist/* convertBase64ToUint8Array */.Z9)(dataUrl[3])], { type: dataUrl[1] || "image/png" });
}
async function fileToBlob(file, abortSignal, fetch) {
	if (!file) return void 0;
	if (file.type === "url") return (0,dist/* downloadBlob */.WN)(file.url, {
		abortSignal,
		fetch
	});
	const data = file.data instanceof Uint8Array ? file.data : (0,dist/* convertBase64ToUint8Array */.Z9)(file.data);
	return new Blob([data], { type: file.mediaType });
}
//#endregion
//#region src/tool/apply-patch.ts
/**
* Schema for the apply_patch input - what the model sends.
*
* Refer the official spec here: https://platform.openai.com/docs/api-reference/responses/create#responses_create-input-input_item_list-item-apply_patch_tool_call
*
*/
const applyPatchInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	callId: classic_schemas/* string */.YjP(),
	operation: classic_schemas/* discriminatedUnion */.gMt("type", [
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("create_file"),
			path: classic_schemas/* string */.YjP(),
			diff: classic_schemas/* string */.YjP()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("delete_file"),
			path: classic_schemas/* string */.YjP()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("update_file"),
			path: classic_schemas/* string */.YjP(),
			diff: classic_schemas/* string */.YjP()
		})
	])
})));
/**
* Schema for the apply_patch output - what we send back.
*/
const applyPatchOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	status: classic_schemas/* enum */.k5n(["completed", "failed"]),
	output: classic_schemas/* string */.YjP().optional()
})));
(0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({})));
/**
* The apply_patch tool lets GPT-5.1 create, update, and delete files in your
* codebase using structured diffs. Instead of just suggesting edits, the model
* emits patch operations that your application applies and then reports back on,
* enabling iterative, multi-step code editing workflows.
*/
const applyPatch = (0,dist/* createProviderDefinedToolFactoryWithOutputSchema */.J2)({
	id: "openai.apply_patch",
	inputSchema: applyPatchInputSchema,
	outputSchema: applyPatchOutputSchema
});
//#endregion
//#region src/redact-openai-tool-credentials.ts
/** OpenAI owns both the SDK configuration paths and their wire equivalents. */
function redactOpenAIToolArgs(type, args, wireFormat = false) {
	if (type === "mcp") return {
		...args,
		...args.authorization != null ? { authorization: "[redacted]" } : {},
		...isRecord$1(args.headers) ? { headers: Object.fromEntries(Object.keys(args.headers).map((name) => [name, "[redacted]"])) } : {}
	};
	const key = type === "code_interpreter" ? "container" : type === "shell" ? "environment" : void 0;
	if (key == null || !isRecord$1(args[key])) return args;
	const container = args[key];
	const policyKey = wireFormat ? "network_policy" : "networkPolicy";
	const secretsKey = wireFormat ? "domain_secrets" : "domainSecrets";
	const policy = container[policyKey];
	if (!isRecord$1(policy) || !Array.isArray(policy[secretsKey])) return args;
	return {
		...args,
		[key]: {
			...container,
			[policyKey]: {
				...policy,
				[secretsKey]: policy[secretsKey].map((secret) => isRecord$1(secret) && "value" in secret ? {
					...secret,
					value: "[redacted]"
				} : secret)
			}
		}
	};
}
/** Preserve raw request/response bodies while providing a safe telemetry view. */
function withOpenAIResponseRedaction(value) {
	if (!isRecord$1(value) || !Array.isArray(value.tools)) return value;
	return (0,dist/* withTelemetryRedaction */.jN)(value, (body) => ({
		...body,
		tools: body.tools.map((tool) => isRecord$1(tool) ? redactOpenAIToolArgs(tool.type, tool, true) : tool)
	}));
}
function isRecord$1(value) {
	return value != null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/tool/code-interpreter.ts
const codeInterpreterInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	code: classic_schemas/* string */.YjP().nullish(),
	containerId: classic_schemas/* string */.YjP()
})));
const codeInterpreterOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ outputs: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("logs"),
	logs: classic_schemas/* string */.YjP()
}), classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("image"),
	url: classic_schemas/* string */.YjP()
})])).nullish() })));
const codeInterpreterArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ container: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), classic_schemas/* object */.Ikc({
	fileIds: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional(),
	memoryLimit: classic_schemas/* enum */.k5n([
		"1g",
		"4g",
		"16g",
		"64g"
	]).optional(),
	networkPolicy: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("disabled") }), classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("allowlist"),
		allowedDomains: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
		domainSecrets: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
			domain: classic_schemas/* string */.YjP(),
			name: classic_schemas/* string */.YjP(),
			value: classic_schemas/* string */.YjP()
		})).optional()
	})]).optional()
})]).optional() })));
const codeInterpreterToolFactory = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.code_interpreter",
	redactArgs: (args) => redactOpenAIToolArgs("code_interpreter", args),
	inputSchema: codeInterpreterInputSchema,
	outputSchema: codeInterpreterOutputSchema
});
const codeInterpreter = (args = {}) => {
	return codeInterpreterToolFactory(args);
};
//#endregion
//#region src/tool/computer.ts
const safetyCheckSchema = () => classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	code: classic_schemas/* string */.YjP().optional(),
	message: classic_schemas/* string */.YjP().optional()
});
const computerActionSchema = () => classic_schemas/* discriminatedUnion */.gMt("type", [
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("click"),
		button: classic_schemas/* enum */.k5n([
			"left",
			"right",
			"wheel",
			"back",
			"forward"
		]),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("double_click"),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("drag"),
		path: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
			x: classic_schemas/* number */.aig(),
			y: classic_schemas/* number */.aig()
		})),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("keypress"),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP())
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("move"),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}),
	classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("screenshot") }),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("scroll"),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		scrollX: classic_schemas/* number */.aig(),
		scrollY: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("type"),
		text: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("wait") })
]);
const computerInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	actions: classic_schemas/* array */.YOg(computerActionSchema()),
	pendingSafetyChecks: classic_schemas/* array */.YOg(safetyCheckSchema()),
	status: classic_schemas/* enum */.k5n([
		"in_progress",
		"completed",
		"incomplete"
	])
})));
const computerOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	output: classic_schemas/* union */.KCZ([classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("computer_screenshot"),
		imageUrl: classic_schemas/* string */.YjP(),
		fileId: classic_schemas/* string */.YjP().optional(),
		detail: classic_schemas/* enum */.k5n([
			"auto",
			"low",
			"high",
			"original"
		]).optional()
	}), classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("computer_screenshot"),
		fileId: classic_schemas/* string */.YjP(),
		imageUrl: classic_schemas/* string */.YjP().optional(),
		detail: classic_schemas/* enum */.k5n([
			"auto",
			"low",
			"high",
			"original"
		]).optional()
	})]),
	acknowledgedSafetyChecks: classic_schemas/* array */.YOg(safetyCheckSchema()).optional()
})));
const computerToolFactory = (0,dist/* createProviderDefinedToolFactoryWithOutputSchema */.J2)({
	id: "openai.computer",
	inputSchema: computerInputSchema,
	outputSchema: computerOutputSchema
});
const computer = (options = {}) => computerToolFactory(options);
//#endregion
//#region src/tool/custom.ts
const customArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	description: classic_schemas/* string */.YjP().optional(),
	async: classic_schemas/* boolean */.zMY().optional(),
	format: classic_schemas/* union */.KCZ([classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("grammar"),
		syntax: classic_schemas/* enum */.k5n(["regex", "lark"]),
		definition: classic_schemas/* string */.YjP()
	}), classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("text") })]).optional()
})));
const customInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* string */.YjP()));
const customToolFactory = (0,dist/* createProviderDefinedToolFactory */.hL)({
	id: "openai.custom",
	inputSchema: customInputSchema
});
const customTool = (args) => customToolFactory(args);
//#endregion
//#region src/tool/file-search.ts
const comparisonFilterSchema = () => classic_schemas/* object */.Ikc({
	key: classic_schemas/* string */.YjP(),
	type: classic_schemas/* enum */.k5n([
		"eq",
		"ne",
		"gt",
		"gte",
		"lt",
		"lte",
		"in",
		"nin"
	]),
	value: classic_schemas/* union */.KCZ([
		classic_schemas/* string */.YjP(),
		classic_schemas/* number */.aig(),
		classic_schemas/* boolean */.zMY(),
		classic_schemas/* array */.YOg(classic_schemas/* string */.YjP())
	])
});
let cachedCompoundFilterSchema;
const compoundFilterSchema = () => cachedCompoundFilterSchema ??= classic_schemas/* object */.Ikc({
	type: classic_schemas/* enum */.k5n(["and", "or"]),
	filters: classic_schemas/* array */.YOg(classic_schemas/* union */.KCZ([comparisonFilterSchema(), classic_schemas/* lazy */.RZV(() => compoundFilterSchema())]))
});
const fileSearchArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	vectorStoreIds: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
	maxNumResults: classic_schemas/* number */.aig().optional(),
	ranking: classic_schemas/* object */.Ikc({
		ranker: classic_schemas/* string */.YjP().optional(),
		scoreThreshold: classic_schemas/* number */.aig().optional()
	}).optional(),
	filters: classic_schemas/* union */.KCZ([comparisonFilterSchema(), compoundFilterSchema()]).optional()
})));
const fileSearchOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	queries: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
	results: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		attributes: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* unknown */.L5J()),
		fileId: classic_schemas/* string */.YjP(),
		filename: classic_schemas/* string */.YjP(),
		score: classic_schemas/* number */.aig(),
		text: classic_schemas/* string */.YjP()
	})).nullable()
})));
const fileSearch = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.file_search",
	inputSchema: classic_schemas/* object */.Ikc({}),
	outputSchema: fileSearchOutputSchema
});
//#endregion
//#region src/tool/image-generation.ts
const imageGenerationArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	action: classic_schemas/* enum */.k5n([
		"generate",
		"edit",
		"auto"
	]).optional(),
	background: classic_schemas/* enum */.k5n([
		"auto",
		"opaque",
		"transparent"
	]).optional(),
	inputFidelity: classic_schemas/* enum */.k5n(["low", "high"]).optional(),
	inputImageMask: classic_schemas/* object */.Ikc({
		fileId: classic_schemas/* string */.YjP().optional(),
		imageUrl: classic_schemas/* string */.YjP().optional()
	}).optional(),
	model: classic_schemas/* string */.YjP().optional(),
	moderation: classic_schemas/* enum */.k5n(["auto", "low"]).optional(),
	outputCompression: classic_schemas/* number */.aig().int().min(0).max(100).optional(),
	outputFormat: classic_schemas/* enum */.k5n([
		"png",
		"jpeg",
		"webp"
	]).optional(),
	partialImages: classic_schemas/* number */.aig().int().min(0).max(3).optional(),
	quality: classic_schemas/* enum */.k5n([
		"auto",
		"low",
		"medium",
		"high",
		"xhigh",
		"max"
	]).optional(),
	size: classic_schemas/* union */.KCZ([classic_schemas/* enum */.k5n([
		"1024x1024",
		"1024x1536",
		"1536x1024",
		"auto"
	]), classic_schemas/* string */.YjP().regex(/^\d+x\d+$/)]).optional()
}).strict()));
const imageGenerationInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({})));
const imageGenerationOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ result: classic_schemas/* string */.YjP() })));
const imageGenerationToolFactory = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.image_generation",
	inputSchema: imageGenerationInputSchema,
	outputSchema: imageGenerationOutputSchema
});
const imageGeneration = (args = {}) => {
	return imageGenerationToolFactory(args);
};
//#endregion
//#region src/tool/local-shell.ts
const localShellInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ action: classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("exec"),
	command: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
	timeoutMs: classic_schemas/* number */.aig().optional(),
	user: classic_schemas/* string */.YjP().optional(),
	workingDirectory: classic_schemas/* string */.YjP().optional(),
	env: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* string */.YjP()).optional()
}) })));
const localShellOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ output: classic_schemas/* string */.YjP() })));
const localShell = (0,dist/* createProviderDefinedToolFactoryWithOutputSchema */.J2)({
	id: "openai.local_shell",
	inputSchema: localShellInputSchema,
	outputSchema: localShellOutputSchema
});
//#endregion
//#region src/tool/shell.ts
const shellInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ action: classic_schemas/* object */.Ikc({
	commands: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
	timeoutMs: classic_schemas/* number */.aig().optional(),
	maxOutputLength: classic_schemas/* number */.aig().optional()
}) })));
const shellOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	maxOutputLength: classic_schemas/* number */.aig().optional(),
	output: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		stdout: classic_schemas/* string */.YjP(),
		stderr: classic_schemas/* string */.YjP(),
		outcome: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("timeout") }), classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("exit"),
			exitCode: classic_schemas/* number */.aig()
		})])
	}))
})));
const shellSkillsSchema = () => classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("skillReference"),
	providerReference: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* string */.YjP()),
	version: classic_schemas/* string */.YjP().optional()
}), classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("inline"),
	name: classic_schemas/* string */.YjP(),
	description: classic_schemas/* string */.YjP(),
	source: classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("base64"),
		mediaType: classic_schemas/* literal */.euz("application/zip"),
		data: classic_schemas/* string */.YjP()
	})
})])).optional();
const shellArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ environment: classic_schemas/* union */.KCZ([
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("containerAuto"),
		fileIds: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional(),
		memoryLimit: classic_schemas/* enum */.k5n([
			"1g",
			"4g",
			"16g",
			"64g"
		]).optional(),
		networkPolicy: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("disabled") }), classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("allowlist"),
			allowedDomains: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
			domainSecrets: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				domain: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				value: classic_schemas/* string */.YjP()
			})).optional()
		})]).optional(),
		skills: shellSkillsSchema()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("containerReference"),
		containerId: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("local").optional(),
		skills: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
			name: classic_schemas/* string */.YjP(),
			description: classic_schemas/* string */.YjP(),
			path: classic_schemas/* string */.YjP()
		})).optional()
	})
]).optional() })));
const shell = (0,dist/* createProviderDefinedToolFactoryWithOutputSchema */.J2)({
	id: "openai.shell",
	redactArgs: (args) => redactOpenAIToolArgs("shell", args),
	inputSchema: shellInputSchema,
	outputSchema: shellOutputSchema
});
//#endregion
//#region src/tool/tool-search.ts
const toolSearchArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	execution: classic_schemas/* enum */.k5n(["server", "client"]).optional(),
	description: classic_schemas/* string */.YjP().optional(),
	parameters: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* unknown */.L5J()).optional()
})));
const toolSearchInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	arguments: classic_schemas/* unknown */.L5J().optional(),
	call_id: classic_schemas/* string */.YjP().nullish()
})));
const toolSearchOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ tools: classic_schemas/* array */.YOg(classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* unknown */.L5J())) })));
const toolSearchToolFactory = (0,dist/* createProviderDefinedToolFactoryWithOutputSchema */.J2)({
	id: "openai.tool_search",
	inputSchema: toolSearchInputSchema,
	outputSchema: toolSearchOutputSchema
});
const toolSearch = (args = {}) => toolSearchToolFactory(args);
//#endregion
//#region src/tool/web-search.ts
const webSearchArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	externalWebAccess: classic_schemas/* boolean */.zMY().optional(),
	filters: classic_schemas/* object */.Ikc({
		allowedDomains: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional(),
		blockedDomains: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}).optional(),
	searchContextSize: classic_schemas/* enum */.k5n([
		"low",
		"medium",
		"high"
	]).optional(),
	userLocation: classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("approximate"),
		country: classic_schemas/* string */.YjP().optional(),
		city: classic_schemas/* string */.YjP().optional(),
		region: classic_schemas/* string */.YjP().optional(),
		timezone: classic_schemas/* string */.YjP().optional()
	}).optional()
})));
const webSearchInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({})));
const webSearchOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	action: classic_schemas/* discriminatedUnion */.gMt("type", [
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("search"),
			query: classic_schemas/* string */.YjP().optional(),
			queries: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("openPage"),
			url: classic_schemas/* string */.YjP().nullish()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("findInPage"),
			url: classic_schemas/* string */.YjP().nullish(),
			pattern: classic_schemas/* string */.YjP().nullish()
		})
	]).optional(),
	sources: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("url"),
		url: classic_schemas/* string */.YjP()
	}), classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("api"),
		name: classic_schemas/* string */.YjP()
	})])).optional()
})));
const webSearchToolFactory = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.web_search",
	inputSchema: webSearchInputSchema,
	outputSchema: webSearchOutputSchema
});
const webSearch = (args = {}) => webSearchToolFactory(args);
//#endregion
//#region src/tool/web-search-preview.ts
const webSearchPreviewArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	searchContextSize: classic_schemas/* enum */.k5n([
		"low",
		"medium",
		"high"
	]).optional(),
	userLocation: classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("approximate"),
		country: classic_schemas/* string */.YjP().optional(),
		city: classic_schemas/* string */.YjP().optional(),
		region: classic_schemas/* string */.YjP().optional(),
		timezone: classic_schemas/* string */.YjP().optional()
	}).optional()
})));
const webSearchPreviewInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({})));
const webSearchPreviewOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ action: classic_schemas/* discriminatedUnion */.gMt("type", [
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("search"),
		query: classic_schemas/* string */.YjP().optional()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("openPage"),
		url: classic_schemas/* string */.YjP().nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("findInPage"),
		url: classic_schemas/* string */.YjP().nullish(),
		pattern: classic_schemas/* string */.YjP().nullish()
	})
]).optional() })));
const webSearchPreview = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.web_search_preview",
	inputSchema: webSearchPreviewInputSchema,
	outputSchema: webSearchPreviewOutputSchema
});
//#endregion
//#region src/tool/mcp.ts
let cachedJsonValueSchema$1;
const jsonValueSchema$1 = () => cachedJsonValueSchema$1 ??= classic_schemas/* lazy */.RZV(() => classic_schemas/* union */.KCZ([
	classic_schemas/* string */.YjP(),
	classic_schemas/* number */.aig(),
	classic_schemas/* boolean */.zMY(),
	classic_schemas/* null */.chJ(),
	classic_schemas/* array */.YOg(jsonValueSchema$1()),
	classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), jsonValueSchema$1())
]));
const mcpArgsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	serverLabel: classic_schemas/* string */.YjP(),
	allowedTools: classic_schemas/* union */.KCZ([classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()), classic_schemas/* object */.Ikc({
		readOnly: classic_schemas/* boolean */.zMY().optional(),
		toolNames: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	})]).optional(),
	authorization: classic_schemas/* string */.YjP().optional(),
	connectorId: classic_schemas/* string */.YjP().optional(),
	headers: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* string */.YjP()).optional(),
	requireApproval: classic_schemas/* union */.KCZ([classic_schemas/* enum */.k5n(["always", "never"]), classic_schemas/* object */.Ikc({ never: classic_schemas/* object */.Ikc({ toolNames: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional() }).optional() })]).optional(),
	serverDescription: classic_schemas/* string */.YjP().optional(),
	serverUrl: classic_schemas/* string */.YjP().optional(),
	tunnelId: classic_schemas/* string */.YjP().optional()
}).refine((v) => v.serverUrl != null || v.connectorId != null || v.tunnelId != null, "One of serverUrl, connectorId, or tunnelId must be provided.").refine((v) => v.tunnelId == null || v.serverUrl == null && v.connectorId == null, "tunnelId cannot be combined with serverUrl or connectorId.")));
const mcpInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({})));
const mcpOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("call"),
	serverLabel: classic_schemas/* string */.YjP(),
	name: classic_schemas/* string */.YjP(),
	arguments: classic_schemas/* string */.YjP(),
	output: classic_schemas/* string */.YjP().nullish(),
	error: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), jsonValueSchema$1()]).optional()
})));
const mcpToolFactory = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.mcp",
	redactArgs: (args) => redactOpenAIToolArgs("mcp", args),
	inputSchema: mcpInputSchema,
	outputSchema: mcpOutputSchema
});
const mcp = (args) => mcpToolFactory(args);
//#endregion
//#region src/tool/programmatic-tool-calling.ts
const programmaticToolCallingInputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	code: classic_schemas/* string */.YjP(),
	fingerprint: classic_schemas/* string */.YjP()
})));
const programmaticToolCallingOutputSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	result: classic_schemas/* string */.YjP(),
	status: classic_schemas/* enum */.k5n(["completed", "incomplete"])
})));
const programmaticToolCallingFactory = (0,dist/* createProviderExecutedToolFactory */.z)({
	id: "openai.programmatic_tool_calling",
	inputSchema: programmaticToolCallingInputSchema,
	outputSchema: programmaticToolCallingOutputSchema,
	supportsDeferredResults: true
});
const programmaticToolCalling = () => (0,dist/* experimental_toolCaller */.rV)(programmaticToolCallingFactory({}), {
	type: "provider",
	prepareProviderOptions: (providerOptions) => {
		const openaiOptions = providerOptions?.openai;
		return {
			...providerOptions,
			openai: {
				...openaiOptions,
				allowedCallers: [.../* @__PURE__ */ new Set([...openaiOptions?.allowedCallers ?? [], "programmatic"])]
			}
		};
	}
});
//#endregion
//#region src/openai-tools.ts
const openaiTools = {
	/**
	* The apply_patch tool lets GPT-5.1 create, update, and delete files in your
	* codebase using structured diffs. Instead of just suggesting edits, the model
	* emits patch operations that your application applies and then reports back on,
	* enabling iterative, multi-step code editing workflows.
	*
	*/
	applyPatch,
	/**
	* Custom tools let callers constrain model output to a grammar (regex or
	* Lark syntax). The model returns a `custom_tool_call` output item whose
	* `input` field is a string matching the specified grammar.
	*
	* @param description - An optional description of the tool.
	* @param async - Whether the model can continue without waiting for the tool result.
	* @param format - The output format constraint (grammar type, syntax, and definition).
	*/
	customTool,
	/**
	* The Code Interpreter tool allows models to write and run Python code in a
	* sandboxed environment to solve complex problems in domains like data analysis,
	* coding, and math.
	*
	* @param container - The container to use for the code interpreter.
	*/
	codeInterpreter,
	/**
	* The computer tool allows models to operate a browser or desktop through
	* batched UI actions. Your application executes the actions and returns an
	* updated screenshot.
	*
	* WARNING: Run computer use in an isolated environment, treat on-screen
	* content as untrusted, and require confirmation for consequential actions.
	*/
	computer,
	/**
	* File search is a tool available in the Responses API. It enables models to
	* retrieve information in a knowledge base of previously uploaded files through
	* semantic and keyword search.
	*
	* @param vectorStoreIds - The vector store IDs to use for the file search.
	* @param maxNumResults - The maximum number of results to return.
	* @param ranking - The ranking options to use for the file search.
	* @param filters - The filters to use for the file search.
	*/
	fileSearch,
	/**
	* The image generation tool allows you to generate images using a text prompt,
	* and optionally image inputs. It leverages the GPT Image model,
	* and automatically optimizes text inputs for improved performance.
	*
	* @param background - Background type for the generated image. One of 'auto', 'opaque', or 'transparent'.
	* @param inputFidelity - Input fidelity for the generated image. One of 'low' or 'high'.
	* @param inputImageMask - Optional mask for inpainting. Contains fileId and/or imageUrl.
	* @param model - The image generation model to use. Default: gpt-image-1.
	* @param moderation - Moderation level for the generated image. Default: 'auto'.
	* @param outputCompression - Compression level for the output image (0-100).
	* @param outputFormat - The output format of the generated image. One of 'png', 'jpeg', or 'webp'.
	* @param partialImages - Number of partial images to generate in streaming mode (0-3).
	* @param quality - The quality of the generated image. One of 'auto', 'low', 'medium', 'high', 'xhigh', or 'max'. 'xhigh' and 'max' require a GPT Image 2.5 model.
	* @param size - The size of the generated image. One of 'auto', '1024x1024', '1024x1536', or '1536x1024'.
	*/
	imageGeneration,
	/**
	* Local shell is a tool that allows agents to run shell commands locally
	* on a machine you or the user provides.
	*
	* Supported models: `gpt-5-codex`
	*/
	localShell,
	/**
	* The shell tool allows the model to interact with your local computer through
	* a controlled command-line interface. The model proposes shell commands; your
	* integration executes them and returns the outputs.
	*
	* Available through the Responses API for use with GPT-5.1.
	*
	* WARNING: Running arbitrary shell commands can be dangerous. Always sandbox
	* execution or add strict allow-/deny-lists before forwarding a command to
	* the system shell.
	*/
	shell,
	/**
	* Web search allows models to access up-to-date information from the internet
	* and provide answers with sourced citations.
	*
	* @deprecated Use `webSearch` instead.
	*
	* @param searchContextSize - The search context size to use for the web search.
	* @param userLocation - The user location to use for the web search.
	*/
	webSearchPreview,
	/**
	* Web search allows models to access up-to-date information from the internet
	* and provide answers with sourced citations.
	*
	* @param filters - The filters to use for the web search.
	* @param searchContextSize - The search context size to use for the web search.
	* @param userLocation - The user location to use for the web search.
	*/
	webSearch,
	/**
	* MCP (Model Context Protocol) allows models to call tools exposed by
	* remote MCP servers, service connectors, or Secure MCP tunnels.
	*
	* @param serverLabel - Label to identify the MCP server.
	* @param allowedTools - Allowed tool names or filter object.
	* @param authorization - OAuth access token for the MCP server or connector (including tunneled servers).
	* @param connectorId - Identifier for a service connector.
	* @param headers - Optional headers to include in MCP requests.
	* @param requireApproval - Approval policy ('always'|'never'|filter object).
	* @param serverDescription - Optional description of the server.
	* @param serverUrl - URL for the MCP server.
	* @param tunnelId - Identifier for an OpenAI Secure MCP tunnel.
	*/
	mcp,
	/**
	* Programmatic Tool Calling lets OpenAI Responses models write and execute
	* JavaScript that orchestrates eligible tools.
	*/
	programmaticToolCalling,
	/**
	* Tool search allows the model to dynamically search for and load deferred
	* tools into the model's context as needed. This helps reduce overall token
	* usage, cost, and latency by only loading tools when the model needs them.
	*
	* To use tool search, mark functions or namespaces with `defer_loading: true`
	* in the tools array. The model will use tool search to load these tools
	* when it determines they are needed.
	*/
	toolSearch
};
//#endregion
//#region src/responses/convert-openai-responses-usage.ts
function convertOpenAIResponsesUsage(usage) {
	if (usage == null) return (0,dist/* createNullLanguageModelUsage */.EK)();
	const inputTokens = usage.input_tokens;
	const outputTokens = usage.output_tokens;
	const cachedTokens = usage.input_tokens_details?.cached_tokens ?? 0;
	const cacheWriteTokens = usage.input_tokens_details?.cache_write_tokens ?? void 0;
	const reasoningTokens = usage.output_tokens_details?.reasoning_tokens ?? 0;
	return {
		inputTokens: {
			total: inputTokens,
			noCache: inputTokens - cachedTokens - (cacheWriteTokens ?? 0),
			cacheRead: cachedTokens,
			cacheWrite: cacheWriteTokens
		},
		outputTokens: {
			total: outputTokens,
			text: outputTokens - reasoningTokens,
			reasoning: reasoningTokens
		},
		raw: usage
	};
}
//#endregion
//#region src/responses/map-openai-responses-finish-reason.ts
function mapOpenAIResponseFinishReason({ finishReason, hasFunctionCall, hasRefusal = false }) {
	switch (finishReason) {
		case void 0:
		case null:
			if (hasFunctionCall) return "tool-calls";
			return hasRefusal ? "content-filter" : "stop";
		case "max_output_tokens": return "length";
		case "content_filter": return "content-filter";
		default: return hasFunctionCall ? "tool-calls" : "other";
	}
}
//#endregion
//#region src/responses/openai-responses-api.ts
let cachedJsonValueSchema;
const jsonValueSchema = () => cachedJsonValueSchema ??= classic_schemas/* lazy */.RZV(() => classic_schemas/* union */.KCZ([
	classic_schemas/* string */.YjP(),
	classic_schemas/* number */.aig(),
	classic_schemas/* boolean */.zMY(),
	classic_schemas/* null */.chJ(),
	classic_schemas/* array */.YOg(jsonValueSchema()),
	classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), jsonValueSchema().optional())
]));
const jsonObjectSchema = () => classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), jsonValueSchema().optional());
const openaiResponsesInputTransformationSchema = () => classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP().nullish(),
	type: classic_schemas/* string */.YjP(),
	action: classic_schemas/* string */.YjP(),
	reason: classic_schemas/* string */.YjP()
});
const openaiResponsesPromptCacheDiagnosticsSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* string */.YjP(),
	reason: classic_schemas/* string */.YjP().nullish(),
	cache_missed_tokens: classic_schemas/* number */.aig().nullish(),
	comparison_reusable_tokens: classic_schemas/* number */.aig().nullish()
});
const openaiResponsesUsageSchema = () => classic_schemas/* intersection */.E$q(jsonObjectSchema(), classic_schemas/* object */.Ikc({
	input_tokens: classic_schemas/* number */.aig(),
	input_tokens_details: classic_schemas/* intersection */.E$q(jsonObjectSchema(), classic_schemas/* object */.Ikc({
		cached_tokens: classic_schemas/* number */.aig().nullish(),
		cache_write_tokens: classic_schemas/* number */.aig().nullish(),
		cache_write_tokens_details: classic_schemas/* intersection */.E$q(jsonObjectSchema(), classic_schemas/* object */.Ikc({
			ttl_30m_tokens: classic_schemas/* number */.aig().nullish(),
			ttl_12h_tokens: classic_schemas/* number */.aig().nullish()
		})).nullish(),
		orchestration_input_tokens: classic_schemas/* number */.aig().nullish(),
		orchestration_input_cached_tokens: classic_schemas/* number */.aig().nullish()
	})).nullish(),
	output_tokens: classic_schemas/* number */.aig(),
	output_tokens_details: classic_schemas/* intersection */.E$q(jsonObjectSchema(), classic_schemas/* object */.Ikc({
		reasoning_tokens: classic_schemas/* number */.aig().nullish(),
		orchestration_output_tokens: classic_schemas/* number */.aig().nullish()
	})).nullish(),
	total_tokens: classic_schemas/* number */.aig().optional()
}));
const openaiResponsesComputerSafetyCheckSchema = () => classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	code: classic_schemas/* string */.YjP().nullish(),
	message: classic_schemas/* string */.YjP().nullish()
});
const openaiResponsesComputerActionSchema = () => classic_schemas/* discriminatedUnion */.gMt("type", [
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("click"),
		button: classic_schemas/* enum */.k5n([
			"left",
			"right",
			"wheel",
			"back",
			"forward"
		]),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("double_click"),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("drag"),
		path: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
			x: classic_schemas/* number */.aig(),
			y: classic_schemas/* number */.aig()
		})),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("keypress"),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP())
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("move"),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish()
	}),
	classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("screenshot") }),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("scroll"),
		x: classic_schemas/* number */.aig(),
		y: classic_schemas/* number */.aig(),
		scroll_x: classic_schemas/* number */.aig(),
		scroll_y: classic_schemas/* number */.aig(),
		keys: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("type"),
		text: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("wait") })
]);
const openaiResponsesComputerCallSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("computer_call"),
	id: classic_schemas/* string */.YjP(),
	call_id: classic_schemas/* string */.YjP().nullish(),
	status: classic_schemas/* enum */.k5n([
		"in_progress",
		"completed",
		"incomplete"
	]),
	action: openaiResponsesComputerActionSchema().nullish(),
	actions: classic_schemas/* array */.YOg(openaiResponsesComputerActionSchema()).nullish(),
	pending_safety_checks: classic_schemas/* array */.YOg(openaiResponsesComputerSafetyCheckSchema()).nullish()
});
const openaiResponsesToolCallerSchema = () => classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("direct") }), classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("program"),
	caller_id: classic_schemas/* string */.YjP()
})]);
const openaiResponsesProgramSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("program"),
	id: classic_schemas/* string */.YjP(),
	call_id: classic_schemas/* string */.YjP(),
	code: classic_schemas/* string */.YjP(),
	fingerprint: classic_schemas/* string */.YjP()
});
const openaiResponsesProgramOutputSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("program_output"),
	id: classic_schemas/* string */.YjP(),
	call_id: classic_schemas/* string */.YjP(),
	result: classic_schemas/* string */.YjP(),
	status: classic_schemas/* enum */.k5n(["completed", "incomplete"])
});
const openaiResponsesLocalShellCallSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("local_shell_call"),
	id: classic_schemas/* string */.YjP(),
	call_id: classic_schemas/* string */.YjP(),
	action: classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("exec"),
		command: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
		timeout_ms: classic_schemas/* number */.aig().optional(),
		user: classic_schemas/* string */.YjP().optional(),
		working_directory: classic_schemas/* string */.YjP().optional(),
		env: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* string */.YjP()).optional()
	})
});
const openaiResponsesNestedErrorChunkSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("error"),
	sequence_number: classic_schemas/* number */.aig(),
	error: classic_schemas/* object */.Ikc({
		type: classic_schemas/* string */.YjP(),
		code: classic_schemas/* string */.YjP().nullish(),
		message: classic_schemas/* string */.YjP(),
		param: classic_schemas/* string */.YjP().nullish()
	})
});
const openaiResponsesErrorChunkSchema = () => classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("error"),
	sequence_number: classic_schemas/* number */.aig(),
	code: classic_schemas/* string */.YjP().nullish(),
	message: classic_schemas/* string */.YjP(),
	param: classic_schemas/* string */.YjP().nullish()
});
/**
* Chunk types explicitly modeled by openaiResponsesChunkSchema. Keep this set
* in sync with the union below. OpenAI's complete event catalog:
* https://developers.openai.com/api/reference/resources/responses/streaming-events
*/
const openaiResponsesModeledChunkTypes = /* @__PURE__ */ new Set([
	"error",
	"response.apply_patch_call_operation_diff.delta",
	"response.apply_patch_call_operation_diff.done",
	"response.code_interpreter_call_code.delta",
	"response.code_interpreter_call_code.done",
	"response.completed",
	"response.created",
	"response.custom_tool_call_input.delta",
	"response.failed",
	"response.function_call_arguments.delta",
	"response.function_call_arguments.done",
	"response.image_generation_call.partial_image",
	"response.in_progress",
	"response.incomplete",
	"response.output_item.added",
	"response.output_item.done",
	"response.output_text.annotation.added",
	"response.output_text.delta",
	"response.refusal.delta",
	"response.refusal.done",
	"response.reasoning_summary_part.added",
	"response.reasoning_summary_part.done",
	"response.reasoning_summary_text.delta"
]);
/**
* Output item types explicitly modeled by both output item event schemas below.
* OpenAI's complete ResponseOutputItem schema:
* https://developers.openai.com/api/reference/resources/responses#(resource)%20responses%20%3E%20(model)%20response_output_item%20%3E%20(schema)
*/
const openaiResponsesModeledOutputItemTypes = /* @__PURE__ */ new Set([
	"apply_patch_call",
	"code_interpreter_call",
	"compaction",
	"computer_call",
	"custom_tool_call",
	"file_search_call",
	"function_call",
	"image_generation_call",
	"local_shell_call",
	"mcp_approval_request",
	"mcp_call",
	"mcp_list_tools",
	"message",
	"program",
	"program_output",
	"reasoning",
	"shell_call",
	"shell_call_output",
	"tool_search_call",
	"tool_search_output",
	"web_search_call"
]);
function isModeledOpenAIResponsesChunk(value) {
	if (typeof value.type !== "string" || !openaiResponsesModeledChunkTypes.has(value.type)) return false;
	if (value.type !== "response.output_item.added" && value.type !== "response.output_item.done") return true;
	if (!(0,dist/* isRecord */.u4)(value.item) || typeof value.item.type !== "string") return true;
	return openaiResponsesModeledOutputItemTypes.has(value.item.type);
}
const openaiResponsesChunkSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* union */.KCZ([
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.output_text.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig().nullish(),
		delta: classic_schemas/* string */.YjP(),
		logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
			token: classic_schemas/* string */.YjP(),
			logprob: classic_schemas/* number */.aig(),
			top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				token: classic_schemas/* string */.YjP(),
				logprob: classic_schemas/* number */.aig()
			}))
		})).nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.refusal.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig().nullish(),
		content_index: classic_schemas/* number */.aig().nullish(),
		delta: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.refusal.done"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig().nullish(),
		content_index: classic_schemas/* number */.aig().nullish(),
		refusal: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* enum */.k5n(["response.completed", "response.incomplete"]),
		response: classic_schemas/* object */.Ikc({
			prompt_cache_diagnostics: openaiResponsesPromptCacheDiagnosticsSchema().nullish(),
			input_transformations: classic_schemas/* array */.YOg(openaiResponsesInputTransformationSchema()).nullish(),
			incomplete_details: classic_schemas/* object */.Ikc({ reason: classic_schemas/* string */.YjP() }).nullish(),
			usage: openaiResponsesUsageSchema().nullish(),
			reasoning: classic_schemas/* object */.Ikc({ context: classic_schemas/* string */.YjP().nullish() }).nullish(),
			service_tier: classic_schemas/* string */.YjP().nullish()
		})
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.failed"),
		sequence_number: classic_schemas/* number */.aig(),
		response: classic_schemas/* object */.Ikc({
			prompt_cache_diagnostics: openaiResponsesPromptCacheDiagnosticsSchema().nullish(),
			input_transformations: classic_schemas/* array */.YOg(openaiResponsesInputTransformationSchema()).nullish(),
			error: classic_schemas/* object */.Ikc({
				code: classic_schemas/* string */.YjP().nullish(),
				message: classic_schemas/* string */.YjP()
			}).nullish(),
			incomplete_details: classic_schemas/* object */.Ikc({ reason: classic_schemas/* string */.YjP() }).nullish(),
			usage: openaiResponsesUsageSchema().nullish(),
			reasoning: classic_schemas/* object */.Ikc({ context: classic_schemas/* string */.YjP().nullish() }).nullish(),
			service_tier: classic_schemas/* string */.YjP().nullish()
		})
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.created"),
		response: classic_schemas/* object */.Ikc({
			id: classic_schemas/* string */.YjP(),
			created_at: classic_schemas/* number */.aig(),
			model: classic_schemas/* string */.YjP(),
			service_tier: classic_schemas/* string */.YjP().nullish()
		})
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.in_progress"),
		response: classic_schemas/* object */.Ikc({
			id: classic_schemas/* string */.YjP(),
			created_at: classic_schemas/* number */.aig(),
			model: classic_schemas/* string */.YjP(),
			service_tier: classic_schemas/* string */.YjP().nullish()
		})
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.output_item.added"),
		output_index: classic_schemas/* number */.aig(),
		item: classic_schemas/* discriminatedUnion */.gMt("type", [
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("message"),
				id: classic_schemas/* string */.YjP(),
				phase: classic_schemas/* enum */.k5n(["commentary", "final_answer"]).nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("reasoning"),
				id: classic_schemas/* string */.YjP(),
				encrypted_content: classic_schemas/* string */.YjP().nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("function_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				arguments: classic_schemas/* string */.YjP(),
				async: classic_schemas/* boolean */.zMY().nullish(),
				namespace: classic_schemas/* string */.YjP().nullish(),
				caller: openaiResponsesToolCallerSchema().nullish()
			}),
			openaiResponsesProgramSchema(),
			openaiResponsesProgramOutputSchema(),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("web_search_call"),
				id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* string */.YjP()
			}),
			openaiResponsesComputerCallSchema(),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("file_search_call"),
				id: classic_schemas/* string */.YjP()
			}),
			openaiResponsesLocalShellCallSchema(),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("image_generation_call"),
				id: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("code_interpreter_call"),
				id: classic_schemas/* string */.YjP(),
				container_id: classic_schemas/* string */.YjP(),
				code: classic_schemas/* string */.YjP().nullable(),
				outputs: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("logs"),
					logs: classic_schemas/* string */.YjP()
				}), classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("image"),
					url: classic_schemas/* string */.YjP()
				})])).nullable(),
				status: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("mcp_call"),
				id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* string */.YjP(),
				approval_request_id: classic_schemas/* string */.YjP().nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("mcp_list_tools"),
				id: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("mcp_approval_request"),
				id: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("apply_patch_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* enum */.k5n(["in_progress", "completed"]),
				operation: classic_schemas/* discriminatedUnion */.gMt("type", [
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("create_file"),
						path: classic_schemas/* string */.YjP(),
						diff: classic_schemas/* string */.YjP()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("delete_file"),
						path: classic_schemas/* string */.YjP()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("update_file"),
						path: classic_schemas/* string */.YjP(),
						diff: classic_schemas/* string */.YjP()
					})
				])
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("custom_tool_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				input: classic_schemas/* string */.YjP(),
				async: classic_schemas/* boolean */.zMY().nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("shell_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				action: classic_schemas/* object */.Ikc({
					commands: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
					timeout_ms: classic_schemas/* number */.aig().nullish(),
					max_output_length: classic_schemas/* number */.aig().nullish()
				})
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("compaction"),
				id: classic_schemas/* string */.YjP(),
				encrypted_content: classic_schemas/* string */.YjP().nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("shell_call_output"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				max_output_length: classic_schemas/* number */.aig().nullish(),
				output: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					stdout: classic_schemas/* string */.YjP(),
					stderr: classic_schemas/* string */.YjP(),
					outcome: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("timeout") }), classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("exit"),
						exit_code: classic_schemas/* number */.aig()
					})])
				}))
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("tool_search_call"),
				id: classic_schemas/* string */.YjP(),
				execution: classic_schemas/* enum */.k5n(["server", "client"]),
				call_id: classic_schemas/* string */.YjP().nullable(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				arguments: classic_schemas/* unknown */.L5J()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("tool_search_output"),
				id: classic_schemas/* string */.YjP(),
				execution: classic_schemas/* enum */.k5n(["server", "client"]),
				call_id: classic_schemas/* string */.YjP().nullable(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				tools: classic_schemas/* array */.YOg(classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), jsonValueSchema().optional()))
			})
		])
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.output_item.done"),
		output_index: classic_schemas/* number */.aig(),
		item: classic_schemas/* discriminatedUnion */.gMt("type", [
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("message"),
				id: classic_schemas/* string */.YjP(),
				phase: classic_schemas/* enum */.k5n(["commentary", "final_answer"]).nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("reasoning"),
				id: classic_schemas/* string */.YjP(),
				encrypted_content: classic_schemas/* string */.YjP().nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("function_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				arguments: classic_schemas/* string */.YjP(),
				async: classic_schemas/* boolean */.zMY().nullish(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				namespace: classic_schemas/* string */.YjP().nullish(),
				caller: openaiResponsesToolCallerSchema().nullish()
			}),
			openaiResponsesProgramSchema(),
			openaiResponsesProgramOutputSchema(),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("custom_tool_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				input: classic_schemas/* string */.YjP(),
				async: classic_schemas/* boolean */.zMY().nullish(),
				status: classic_schemas/* literal */.euz("completed")
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("code_interpreter_call"),
				id: classic_schemas/* string */.YjP(),
				code: classic_schemas/* string */.YjP().nullable(),
				container_id: classic_schemas/* string */.YjP(),
				outputs: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("logs"),
					logs: classic_schemas/* string */.YjP()
				}), classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("image"),
					url: classic_schemas/* string */.YjP()
				})])).nullable()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("image_generation_call"),
				id: classic_schemas/* string */.YjP(),
				result: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("web_search_call"),
				id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* string */.YjP(),
				action: classic_schemas/* discriminatedUnion */.gMt("type", [
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("search"),
						query: classic_schemas/* string */.YjP().nullish(),
						queries: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish(),
						sources: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
							type: classic_schemas/* literal */.euz("url"),
							url: classic_schemas/* string */.YjP()
						}), classic_schemas/* object */.Ikc({
							type: classic_schemas/* literal */.euz("api"),
							name: classic_schemas/* string */.YjP()
						})])).nullish()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("open_page"),
						url: classic_schemas/* string */.YjP().nullish()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("find_in_page"),
						url: classic_schemas/* string */.YjP().nullish(),
						pattern: classic_schemas/* string */.YjP().nullish()
					})
				]).nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("file_search_call"),
				id: classic_schemas/* string */.YjP(),
				queries: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
				results: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					attributes: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* union */.KCZ([
						classic_schemas/* string */.YjP(),
						classic_schemas/* number */.aig(),
						classic_schemas/* boolean */.zMY()
					])),
					file_id: classic_schemas/* string */.YjP(),
					filename: classic_schemas/* string */.YjP(),
					score: classic_schemas/* number */.aig(),
					text: classic_schemas/* string */.YjP()
				})).nullish()
			}),
			openaiResponsesLocalShellCallSchema(),
			openaiResponsesComputerCallSchema(),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("mcp_call"),
				id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* string */.YjP(),
				arguments: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				server_label: classic_schemas/* string */.YjP(),
				output: classic_schemas/* string */.YjP().nullish(),
				error: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), classic_schemas/* object */.Ikc({
					type: classic_schemas/* string */.YjP().optional(),
					code: classic_schemas/* union */.KCZ([classic_schemas/* number */.aig(), classic_schemas/* string */.YjP()]).optional(),
					message: classic_schemas/* string */.YjP().optional()
				}).loose()]).nullish(),
				approval_request_id: classic_schemas/* string */.YjP().nullish()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("mcp_list_tools"),
				id: classic_schemas/* string */.YjP(),
				server_label: classic_schemas/* string */.YjP(),
				tools: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					name: classic_schemas/* string */.YjP(),
					description: classic_schemas/* string */.YjP().optional(),
					input_schema: classic_schemas/* any */.bzn(),
					annotations: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* unknown */.L5J()).optional()
				})),
				error: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), classic_schemas/* object */.Ikc({
					type: classic_schemas/* string */.YjP().optional(),
					code: classic_schemas/* union */.KCZ([classic_schemas/* number */.aig(), classic_schemas/* string */.YjP()]).optional(),
					message: classic_schemas/* string */.YjP().optional()
				}).loose()]).optional()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("mcp_approval_request"),
				id: classic_schemas/* string */.YjP(),
				server_label: classic_schemas/* string */.YjP(),
				name: classic_schemas/* string */.YjP(),
				arguments: classic_schemas/* string */.YjP(),
				approval_request_id: classic_schemas/* string */.YjP().optional()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("apply_patch_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* enum */.k5n(["in_progress", "completed"]),
				operation: classic_schemas/* discriminatedUnion */.gMt("type", [
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("create_file"),
						path: classic_schemas/* string */.YjP(),
						diff: classic_schemas/* string */.YjP()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("delete_file"),
						path: classic_schemas/* string */.YjP()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("update_file"),
						path: classic_schemas/* string */.YjP(),
						diff: classic_schemas/* string */.YjP()
					})
				])
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("shell_call"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				action: classic_schemas/* object */.Ikc({
					commands: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
					timeout_ms: classic_schemas/* number */.aig().nullish(),
					max_output_length: classic_schemas/* number */.aig().nullish()
				})
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("compaction"),
				id: classic_schemas/* string */.YjP(),
				encrypted_content: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("shell_call_output"),
				id: classic_schemas/* string */.YjP(),
				call_id: classic_schemas/* string */.YjP(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				max_output_length: classic_schemas/* number */.aig().nullish(),
				output: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					stdout: classic_schemas/* string */.YjP(),
					stderr: classic_schemas/* string */.YjP(),
					outcome: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("timeout") }), classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("exit"),
						exit_code: classic_schemas/* number */.aig()
					})])
				}))
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("tool_search_call"),
				id: classic_schemas/* string */.YjP(),
				execution: classic_schemas/* enum */.k5n(["server", "client"]),
				call_id: classic_schemas/* string */.YjP().nullable(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				arguments: classic_schemas/* unknown */.L5J()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("tool_search_output"),
				id: classic_schemas/* string */.YjP(),
				execution: classic_schemas/* enum */.k5n(["server", "client"]),
				call_id: classic_schemas/* string */.YjP().nullable(),
				status: classic_schemas/* enum */.k5n([
					"in_progress",
					"completed",
					"incomplete"
				]),
				tools: classic_schemas/* array */.YOg(classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), jsonValueSchema().optional()))
			})
		])
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.function_call_arguments.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		delta: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.function_call_arguments.done"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		arguments: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.custom_tool_call_input.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		delta: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.image_generation_call.partial_image"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		partial_image_b64: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.code_interpreter_call_code.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		delta: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.code_interpreter_call_code.done"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		code: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.output_text.annotation.added"),
		annotation: classic_schemas/* discriminatedUnion */.gMt("type", [
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("url_citation"),
				start_index: classic_schemas/* number */.aig(),
				end_index: classic_schemas/* number */.aig(),
				url: classic_schemas/* string */.YjP(),
				title: classic_schemas/* string */.YjP()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("file_citation"),
				file_id: classic_schemas/* string */.YjP(),
				filename: classic_schemas/* string */.YjP(),
				index: classic_schemas/* number */.aig()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("container_file_citation"),
				container_id: classic_schemas/* string */.YjP(),
				file_id: classic_schemas/* string */.YjP(),
				filename: classic_schemas/* string */.YjP(),
				start_index: classic_schemas/* number */.aig(),
				end_index: classic_schemas/* number */.aig()
			}),
			classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("file_path"),
				file_id: classic_schemas/* string */.YjP(),
				index: classic_schemas/* number */.aig()
			})
		])
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.reasoning_summary_part.added"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig().nullish(),
		summary_index: classic_schemas/* number */.aig()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.reasoning_summary_text.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig().nullish(),
		summary_index: classic_schemas/* number */.aig(),
		delta: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.reasoning_summary_part.done"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig().nullish(),
		summary_index: classic_schemas/* number */.aig()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.apply_patch_call_operation_diff.delta"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		delta: classic_schemas/* string */.YjP(),
		obfuscation: classic_schemas/* string */.YjP().nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("response.apply_patch_call_operation_diff.done"),
		item_id: classic_schemas/* string */.YjP(),
		output_index: classic_schemas/* number */.aig(),
		diff: classic_schemas/* string */.YjP()
	}),
	openaiResponsesNestedErrorChunkSchema(),
	openaiResponsesErrorChunkSchema(),
	classic_schemas/* object */.Ikc({ type: classic_schemas/* string */.YjP() }).loose().refine((value) => !isModeledOpenAIResponsesChunk(value), { message: "Known response chunk failed schema validation" }).transform((value) => ({
		type: "unknown_chunk",
		message: value.type
	}))
])));
const openaiResponsesResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP().optional(),
	created_at: classic_schemas/* number */.aig().optional(),
	error: classic_schemas/* object */.Ikc({
		message: classic_schemas/* string */.YjP(),
		type: classic_schemas/* string */.YjP(),
		param: classic_schemas/* string */.YjP().nullish(),
		code: classic_schemas/* string */.YjP()
	}).nullish(),
	model: classic_schemas/* string */.YjP().optional(),
	output: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("message"),
			role: classic_schemas/* literal */.euz("assistant"),
			id: classic_schemas/* string */.YjP(),
			phase: classic_schemas/* enum */.k5n(["commentary", "final_answer"]).nullish(),
			content: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("output_text"),
				text: classic_schemas/* string */.YjP(),
				logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
					token: classic_schemas/* string */.YjP(),
					logprob: classic_schemas/* number */.aig(),
					top_logprobs: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
						token: classic_schemas/* string */.YjP(),
						logprob: classic_schemas/* number */.aig()
					}))
				})).nullish(),
				annotations: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("url_citation"),
						start_index: classic_schemas/* number */.aig(),
						end_index: classic_schemas/* number */.aig(),
						url: classic_schemas/* string */.YjP(),
						title: classic_schemas/* string */.YjP()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("file_citation"),
						file_id: classic_schemas/* string */.YjP(),
						filename: classic_schemas/* string */.YjP(),
						index: classic_schemas/* number */.aig()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("container_file_citation"),
						container_id: classic_schemas/* string */.YjP(),
						file_id: classic_schemas/* string */.YjP(),
						filename: classic_schemas/* string */.YjP(),
						start_index: classic_schemas/* number */.aig(),
						end_index: classic_schemas/* number */.aig()
					}),
					classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("file_path"),
						file_id: classic_schemas/* string */.YjP(),
						index: classic_schemas/* number */.aig()
					})
				]))
			}), classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("refusal"),
				refusal: classic_schemas/* string */.YjP()
			})]))
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("web_search_call"),
			id: classic_schemas/* string */.YjP(),
			status: classic_schemas/* string */.YjP(),
			action: classic_schemas/* discriminatedUnion */.gMt("type", [
				classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("search"),
					query: classic_schemas/* string */.YjP().nullish(),
					queries: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).nullish(),
					sources: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("url"),
						url: classic_schemas/* string */.YjP()
					}), classic_schemas/* object */.Ikc({
						type: classic_schemas/* literal */.euz("api"),
						name: classic_schemas/* string */.YjP()
					})])).nullish()
				}),
				classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("open_page"),
					url: classic_schemas/* string */.YjP().nullish()
				}),
				classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("find_in_page"),
					url: classic_schemas/* string */.YjP().nullish(),
					pattern: classic_schemas/* string */.YjP().nullish()
				})
			]).nullish()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("file_search_call"),
			id: classic_schemas/* string */.YjP(),
			queries: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
			results: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				attributes: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* union */.KCZ([
					classic_schemas/* string */.YjP(),
					classic_schemas/* number */.aig(),
					classic_schemas/* boolean */.zMY()
				])),
				file_id: classic_schemas/* string */.YjP(),
				filename: classic_schemas/* string */.YjP(),
				score: classic_schemas/* number */.aig(),
				text: classic_schemas/* string */.YjP()
			})).nullish()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("code_interpreter_call"),
			id: classic_schemas/* string */.YjP(),
			code: classic_schemas/* string */.YjP().nullable(),
			container_id: classic_schemas/* string */.YjP(),
			outputs: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("logs"),
				logs: classic_schemas/* string */.YjP()
			}), classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("image"),
				url: classic_schemas/* string */.YjP()
			})])).nullable()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("image_generation_call"),
			id: classic_schemas/* string */.YjP(),
			result: classic_schemas/* string */.YjP()
		}),
		openaiResponsesLocalShellCallSchema(),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("function_call"),
			call_id: classic_schemas/* string */.YjP(),
			name: classic_schemas/* string */.YjP(),
			arguments: classic_schemas/* string */.YjP(),
			id: classic_schemas/* string */.YjP(),
			async: classic_schemas/* boolean */.zMY().nullish(),
			namespace: classic_schemas/* string */.YjP().nullish(),
			caller: openaiResponsesToolCallerSchema().nullish()
		}),
		openaiResponsesProgramSchema(),
		openaiResponsesProgramOutputSchema(),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("custom_tool_call"),
			call_id: classic_schemas/* string */.YjP(),
			name: classic_schemas/* string */.YjP(),
			input: classic_schemas/* string */.YjP(),
			id: classic_schemas/* string */.YjP(),
			async: classic_schemas/* boolean */.zMY().nullish()
		}),
		openaiResponsesComputerCallSchema(),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("reasoning"),
			id: classic_schemas/* string */.YjP(),
			encrypted_content: classic_schemas/* string */.YjP().nullish(),
			summary: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				type: classic_schemas/* literal */.euz("summary_text"),
				text: classic_schemas/* string */.YjP()
			}))
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("mcp_call"),
			id: classic_schemas/* string */.YjP(),
			status: classic_schemas/* string */.YjP(),
			arguments: classic_schemas/* string */.YjP(),
			name: classic_schemas/* string */.YjP(),
			server_label: classic_schemas/* string */.YjP(),
			output: classic_schemas/* string */.YjP().nullish(),
			error: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), classic_schemas/* object */.Ikc({
				type: classic_schemas/* string */.YjP().optional(),
				code: classic_schemas/* union */.KCZ([classic_schemas/* number */.aig(), classic_schemas/* string */.YjP()]).optional(),
				message: classic_schemas/* string */.YjP().optional()
			}).loose()]).nullish(),
			approval_request_id: classic_schemas/* string */.YjP().nullish()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("mcp_list_tools"),
			id: classic_schemas/* string */.YjP(),
			server_label: classic_schemas/* string */.YjP(),
			tools: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				name: classic_schemas/* string */.YjP(),
				description: classic_schemas/* string */.YjP().optional(),
				input_schema: classic_schemas/* any */.bzn(),
				annotations: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* unknown */.L5J()).optional()
			})),
			error: classic_schemas/* union */.KCZ([classic_schemas/* string */.YjP(), classic_schemas/* object */.Ikc({
				type: classic_schemas/* string */.YjP().optional(),
				code: classic_schemas/* union */.KCZ([classic_schemas/* number */.aig(), classic_schemas/* string */.YjP()]).optional(),
				message: classic_schemas/* string */.YjP().optional()
			}).loose()]).optional()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("mcp_approval_request"),
			id: classic_schemas/* string */.YjP(),
			server_label: classic_schemas/* string */.YjP(),
			name: classic_schemas/* string */.YjP(),
			arguments: classic_schemas/* string */.YjP(),
			approval_request_id: classic_schemas/* string */.YjP().optional()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("apply_patch_call"),
			id: classic_schemas/* string */.YjP(),
			call_id: classic_schemas/* string */.YjP(),
			status: classic_schemas/* enum */.k5n(["in_progress", "completed"]),
			operation: classic_schemas/* discriminatedUnion */.gMt("type", [
				classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("create_file"),
					path: classic_schemas/* string */.YjP(),
					diff: classic_schemas/* string */.YjP()
				}),
				classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("delete_file"),
					path: classic_schemas/* string */.YjP()
				}),
				classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("update_file"),
					path: classic_schemas/* string */.YjP(),
					diff: classic_schemas/* string */.YjP()
				})
			])
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("shell_call"),
			id: classic_schemas/* string */.YjP(),
			call_id: classic_schemas/* string */.YjP(),
			status: classic_schemas/* enum */.k5n([
				"in_progress",
				"completed",
				"incomplete"
			]),
			action: classic_schemas/* object */.Ikc({
				commands: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()),
				timeout_ms: classic_schemas/* number */.aig().nullish(),
				max_output_length: classic_schemas/* number */.aig().nullish()
			})
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("compaction"),
			id: classic_schemas/* string */.YjP(),
			encrypted_content: classic_schemas/* string */.YjP()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("shell_call_output"),
			id: classic_schemas/* string */.YjP(),
			call_id: classic_schemas/* string */.YjP(),
			status: classic_schemas/* enum */.k5n([
				"in_progress",
				"completed",
				"incomplete"
			]),
			max_output_length: classic_schemas/* number */.aig().nullish(),
			output: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
				stdout: classic_schemas/* string */.YjP(),
				stderr: classic_schemas/* string */.YjP(),
				outcome: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("timeout") }), classic_schemas/* object */.Ikc({
					type: classic_schemas/* literal */.euz("exit"),
					exit_code: classic_schemas/* number */.aig()
				})])
			}))
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("tool_search_call"),
			id: classic_schemas/* string */.YjP(),
			execution: classic_schemas/* enum */.k5n(["server", "client"]),
			call_id: classic_schemas/* string */.YjP().nullable(),
			status: classic_schemas/* enum */.k5n([
				"in_progress",
				"completed",
				"incomplete"
			]),
			arguments: classic_schemas/* unknown */.L5J()
		}),
		classic_schemas/* object */.Ikc({
			type: classic_schemas/* literal */.euz("tool_search_output"),
			id: classic_schemas/* string */.YjP(),
			execution: classic_schemas/* enum */.k5n(["server", "client"]),
			call_id: classic_schemas/* string */.YjP().nullable(),
			status: classic_schemas/* enum */.k5n([
				"in_progress",
				"completed",
				"incomplete"
			]),
			tools: classic_schemas/* array */.YOg(classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), jsonValueSchema().optional()))
		})
	])).optional(),
	service_tier: classic_schemas/* string */.YjP().nullish(),
	prompt_cache_diagnostics: openaiResponsesPromptCacheDiagnosticsSchema().nullish(),
	input_transformations: classic_schemas/* array */.YOg(openaiResponsesInputTransformationSchema()).nullish(),
	reasoning: classic_schemas/* object */.Ikc({ context: classic_schemas/* string */.YjP().nullish() }).nullish(),
	incomplete_details: classic_schemas/* object */.Ikc({ reason: classic_schemas/* string */.YjP() }).nullish(),
	usage: openaiResponsesUsageSchema().nullish()
})));
//#endregion
//#region src/responses/openai-responses-text-format.ts
const openaiResponsesTextFormatSchema = () => classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("text") }), classic_schemas/* object */.Ikc({
	type: classic_schemas/* literal */.euz("json_schema"),
	name: classic_schemas/* string */.YjP().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
	schema: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* json */.Pq9()),
	description: classic_schemas/* string */.YjP().optional(),
	strict: classic_schemas/* boolean */.zMY().optional()
})]);
function normalizeOpenAIResponsesTextFormat(format, warnings) {
	if (format.type === "text") return format;
	const normalized = normalizeOpenAIJsonSchema(format.schema);
	warnings.push(...normalized.warnings);
	return {
		...format,
		schema: normalized.schema
	};
}
const openaiLanguageModelResponsesOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	/**
	* The ID of the OpenAI Conversation to continue.
	* You must create a conversation first via the OpenAI API.
	* Cannot be used in conjunction with `previousResponseId`.
	* Defaults to `undefined`.
	* @see https://platform.openai.com/docs/api-reference/conversations/create
	*/
	conversation: classic_schemas/* string */.YjP().nullish(),
	/**
	* The set of extra fields to include in the response (advanced, usually not needed).
	* Example values: 'reasoning.encrypted_content', 'file_search_call.results', 'web_search_call.results', 'message.output_text.logprobs'.
	*/
	include: classic_schemas/* array */.YOg(classic_schemas/* enum */.k5n([
		"reasoning.encrypted_content",
		"file_search_call.results",
		"web_search_call.results",
		"message.output_text.logprobs"
	])).nullish(),
	/**
	* Whether to automatically include web search action sources in the
	* response. Disable this for OpenAI-compatible providers that do not
	* support the `web_search_call.action.sources` include value.
	*
	* Defaults to `true`.
	*/
	includeWebSearchSources: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Instructions for the model.
	* They can be used to change the system or developer message when continuing a conversation using the `previousResponseId` option.
	* Defaults to `undefined`.
	*/
	instructions: classic_schemas/* string */.YjP().nullish(),
	/**
	* Return the log probabilities of the tokens. Including logprobs will increase
	* the response size and can slow down response times. However, it can
	* be useful to better understand how the model is behaving.
	*
	* Setting to true will return the log probabilities of the tokens that
	* were generated.
	*
	* Setting to a number will return the log probabilities of the top n
	* tokens that were generated.
	*
	* @see https://platform.openai.com/docs/api-reference/responses/create
	* @see https://cookbook.openai.com/examples/using_logprobs
	*/
	logprobs: classic_schemas/* union */.KCZ([classic_schemas/* boolean */.zMY(), classic_schemas/* number */.aig().min(1).max(20)]).optional(),
	/**
	* The maximum number of total calls to built-in tools that can be processed in a response.
	* This maximum number applies across all built-in tool calls, not per individual tool.
	* Any further attempts to call a tool by the model will be ignored.
	*/
	maxToolCalls: classic_schemas/* number */.aig().nullish(),
	/**
	* Additional metadata to store with the generation.
	*/
	metadata: classic_schemas/* any */.bzn().nullish(),
	/**
	* Whether to use parallel tool calls. Defaults to `true`.
	*/
	parallelToolCalls: classic_schemas/* boolean */.zMY().nullish(),
	/**
	* The ID of the previous response. You can use it to continue a conversation.
	* Defaults to `undefined`.
	*/
	previousResponseId: classic_schemas/* string */.YjP().nullish(),
	/**
	* Sets a cache key to tie this prompt to cached prefixes for better caching performance.
	*/
	promptCacheKey: classic_schemas/* string */.YjP().nullish(),
	/**
	* Prompt cache behavior for GPT-5.6 and later models.
	* `mode` controls whether OpenAI also places an implicit breakpoint.
	* `ttl` sets the minimum cache lifetime: `'30m'` (default) or `'12h'`.
	* `prewarm` writes the prompt to the cache without generating output.
	*/
	promptCacheOptions: classic_schemas/* object */.Ikc({
		mode: classic_schemas/* enum */.k5n(["implicit", "explicit"]).optional(),
		ttl: classic_schemas/* enum */.k5n(["30m", "12h"]).optional(),
		prewarm: classic_schemas/* boolean */.zMY().optional(),
		comparisonResponseId: classic_schemas/* string */.YjP().optional()
	}).optional(),
	/**
	* The retention policy for the prompt cache.
	* - 'in_memory': Default. Standard prompt caching behavior.
	* - '24h': Extended prompt caching that keeps cached prefixes active for up to 24 hours.
	*          Available for models before GPT-5.6 that support extended caching.
	*
	* @deprecated For GPT-5.6 and later models, use `promptCacheOptions.ttl`.
	*
	* @default 'in_memory'
	*/
	promptCacheRetention: classic_schemas/* enum */.k5n(["in_memory", "24h"]).nullish(),
	/**
	* Reasoning effort for reasoning models. Defaults to `medium`. If you use
	* `providerOptions` to set the `reasoningEffort` option, this model setting will be ignored.
	* GPT-5.6 supports 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'.
	* Supported values vary by model.
	*/
	reasoningEffort: classic_schemas/* string */.YjP().nullish(),
	/**
	* Updates the reasoning effort for GPT-6 and later models starting with this response
	* without changing the request-level reasoning effort. This preserves the
	* request prefix for prompt caching.
	*
	* Only supported by GPT-6 and later models in standard, single-agent mode. Cannot be
	* combined with automatic compaction or automatic truncation.
	* Supported efforts vary by model; 'none' is supported by GPT-6 Sol and Luna.
	*/
	reasoningEffortUpdate: classic_schemas/* enum */.k5n([
		"none",
		"low",
		"medium",
		"high",
		"xhigh",
		"max"
	]).optional(),
	/**
	* Controls how much model work GPT-5.6 performs before returning a final answer.
	* `standard` is the default. `pro` increases quality, latency, and token usage.
	*/
	reasoningMode: classic_schemas/* enum */.k5n(["standard", "pro"]).optional(),
	/**
	* Controls which available reasoning items GPT-5.6 can use.
	* `auto` uses the model default, `current_turn` excludes reasoning from earlier
	* turns, and `all_turns` makes compatible earlier reasoning available.
	*/
	reasoningContext: classic_schemas/* enum */.k5n([
		"auto",
		"current_turn",
		"all_turns"
	]).optional(),
	/**
	* Controls reasoning summary output from the model.
	* Set to "auto" to automatically receive the richest level available,
	* or "detailed" for comprehensive summaries.
	*/
	reasoningSummary: classic_schemas/* string */.YjP().nullish(),
	/**
	* The identifier for safety monitoring and tracking.
	*/
	safetyIdentifier: classic_schemas/* string */.YjP().nullish(),
	/**
	* Service tier for the request.
	* Set to 'flex' for 50% cheaper processing at the cost of increased latency (available for o3, o4-mini, and gpt-5 models).
	* Set to 'priority' for faster processing with Enterprise access (available for gpt-4, gpt-5, gpt-5-mini, o3, o4-mini; gpt-5-nano is not supported).
	* Set to 'fast' for the same tier as 'priority' (OpenAI's newer name for it).
	* Set to 'ultrafast' for access-controlled Ultrafast processing (available only for gpt-5.6-sol).
	*
	* Defaults to 'auto'.
	*/
	serviceTier: classic_schemas/* enum */.k5n([
		"auto",
		"flex",
		"priority",
		"fast",
		"ultrafast",
		"default"
	]).nullish(),
	/**
	* Whether to store the generation. Defaults to `true`.
	*/
	store: classic_schemas/* boolean */.zMY().nullish(),
	/**
	* Whether to pass through non-image file types as generic input files.
	*
	* By default, inline file inputs are restricted to images and PDFs.
	* Enable this when the target OpenAI Responses model supports additional
	* file media types, such as text/csv.
	*/
	passThroughUnsupportedFiles: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Whether to use strict JSON schema validation.
	* Defaults to `true`.
	*/
	strictJsonSchema: classic_schemas/* boolean */.zMY().nullish(),
	/**
	* Controls the verbosity of the model's responses. Lower values ('low') will result
	* in more concise responses, while higher values ('high') will result in more verbose responses.
	* Valid values: 'low', 'medium', 'high'.
	*/
	textVerbosity: classic_schemas/* enum */.k5n([
		"low",
		"medium",
		"high"
	]).nullish(),
	/**
	* Override the request-level text format without changing Output parsing.
	* Keep this initial format stable when replaying textFormatUpdate messages.
	*/
	textFormat: openaiResponsesTextFormatSchema().optional(),
	/**
	* Controls output truncation. 'auto' (default) performs truncation automatically;
	* 'disabled' turns truncation off.
	*/
	truncation: classic_schemas/* enum */.k5n(["auto", "disabled"]).nullish(),
	/**
	* A unique identifier representing your end-user, which can help OpenAI to
	* monitor and detect abuse.
	* Defaults to `undefined`.
	* @see https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids
	*/
	user: classic_schemas/* string */.YjP().nullish(),
	/**
	* Override the system message mode for this model.
	* - 'system': Use the 'system' role for system messages (default for most models)
	* - 'developer': Use the 'developer' role for system messages (used by reasoning models)
	* - 'remove': Remove system messages entirely
	*
	* If not specified, the mode is automatically determined based on the model.
	*/
	systemMessageMode: classic_schemas/* enum */.k5n([
		"system",
		"developer",
		"remove"
	]).optional(),
	/**
	* Force treating this model as a reasoning model.
	*
	* This is useful for "stealth" reasoning models (e.g. via a custom baseURL)
	* where the model ID is not recognized by the SDK's allowlist.
	*
	* When enabled, the SDK applies reasoning-model parameter compatibility rules
	* and defaults `systemMessageMode` to `developer` unless overridden.
	*/
	forceReasoning: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Enable server-side context management (compaction).
	*/
	contextManagement: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("compaction"),
		compactThreshold: classic_schemas/* number */.aig()
	})).nullish(),
	/**
	* Request explicit server-side compaction by appending a
	* `compaction_trigger` item to the Responses input.
	*/
	compactionTrigger: classic_schemas/* boolean */.zMY().optional(),
	/**
	* Restrict the callable tools to a subset while keeping the full tools
	* list intact, so prompt caching is preserved across requests with
	* different allowlists.
	*
	* When set, this overrides the request-level `toolChoice` and emits
	* `tool_choice: { type: "allowed_tools", mode, tools }` on the wire.
	*
	* @see https://developers.openai.com/api/reference/resources/responses/methods/create#(resource)%20responses%20%3E%20(model)%20tool_choice_allowed%20%3E%20(schema)
	*/
	allowedTools: classic_schemas/* object */.Ikc({
		toolNames: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).min(1),
		mode: classic_schemas/* enum */.k5n(["auto", "required"]).optional()
	}).optional()
})));
const openaiResponsesSystemMessageOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	/**
	* Emit a configuration update at this position in Responses history.
	* Requires empty system message content and the same supported
	* configuration as the request-level reasoningEffortUpdate option.
	* Unsupported historical updates throw instead of being omitted.
	*
	* @see https://developers.openai.com/api/docs/guides/reasoning#change-reasoning-mid-conversation
	*/
	reasoningEffortUpdate: classic_schemas/* enum */.k5n([
		"none",
		"low",
		"medium",
		"high",
		"xhigh",
		"max"
	]).optional(),
	/**
	* Replace the response format at this position in history. Requires empty
	* system message content and the same compatibility as reasoning updates.
	*/
	textFormatUpdate: openaiResponsesTextFormatSchema().optional(),
	/** Tool definitions to load at this position in history. Requires empty system message content. */
	additionalTools: classic_schemas/* array */.YOg(openaiResponsesAdditionalToolSchema()).optional()
})));
const openaiResponsesToolResultOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ 
/** Tool definitions to load immediately after this ordinary tool result. */
additionalTools: classic_schemas/* array */.YOg(openaiResponsesAdditionalToolSchema()).optional() })));
function openaiResponsesFunctionToolDefinitionSchema() {
	return classic_schemas/* strictObject */.rej({
		type: classic_schemas/* literal */.euz("function"),
		name: classic_schemas/* string */.YjP().min(1),
		description: classic_schemas/* string */.YjP().optional(),
		parameters: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* json */.Pq9()),
		strict: classic_schemas/* boolean */.zMY().optional(),
		defer_loading: classic_schemas/* boolean */.zMY().optional()
	});
}
function openaiResponsesAdditionalToolSchema() {
	return classic_schemas/* discriminatedUnion */.gMt("type", [
		openaiResponsesFunctionToolDefinitionSchema(),
		classic_schemas/* strictObject */.rej({
			type: classic_schemas/* literal */.euz("custom"),
			name: classic_schemas/* string */.YjP().min(1),
			description: classic_schemas/* string */.YjP().optional(),
			format: classic_schemas/* discriminatedUnion */.gMt("type", [classic_schemas/* strictObject */.rej({ type: classic_schemas/* literal */.euz("text") }), classic_schemas/* strictObject */.rej({
				type: classic_schemas/* literal */.euz("grammar"),
				syntax: classic_schemas/* enum */.k5n(["regex", "lark"]),
				definition: classic_schemas/* string */.YjP()
			})]).optional()
		}),
		classic_schemas/* strictObject */.rej({
			type: classic_schemas/* literal */.euz("namespace"),
			name: classic_schemas/* string */.YjP().min(1),
			description: classic_schemas/* string */.YjP(),
			tools: classic_schemas/* array */.YOg(openaiResponsesFunctionToolDefinitionSchema()).min(1)
		})
	]);
}
//#endregion
//#region src/responses/expand-parallel-tool-call.ts
const parallelToolName = "parallel";
const recipientNamePrefix = "functions.";
function getParallelToolCallMetadata({ providerOptions, providerOptionsName }) {
	const metadata = providerOptions?.[providerOptionsName]?.parallelToolCall;
	if (!(0,provider_dist/* isJSONObject */.k9)(metadata) || typeof metadata.itemId !== "string" || typeof metadata.toolCallId !== "string" || typeof metadata.toolName !== "string" || metadata.input !== void 0 && typeof metadata.input !== "string" || typeof metadata.index !== "number" || !Number.isInteger(metadata.index) || typeof metadata.count !== "number" || !Number.isInteger(metadata.count) || metadata.index < 0 || metadata.count <= metadata.index) return;
	return metadata;
}
function isUndeclaredParallelToolCall({ toolName, tools }) {
	return toolName === parallelToolName && !tools.some((tool) => tool.name === parallelToolName);
}
/**
* Expands the internal parallel tool wrapper that OpenAI models can emit as a
* regular function call. The wrapper is only recognized when every nested
* recipient is a declared client-side function tool.
*/
async function expandParallelToolCall({ toolCall, tools, providerOptionsName, itemId }) {
	if (!isUndeclaredParallelToolCall({
		toolName: toolCall.toolName,
		tools
	})) return;
	const parsedInput = await (0,dist/* safeParseJSON */.N8)({ text: toolCall.input });
	if (!parsedInput.success || !(0,provider_dist/* isJSONObject */.k9)(parsedInput.value)) return;
	const toolUses = parsedInput.value.tool_uses;
	if (!Array.isArray(toolUses) || toolUses.length === 0) return;
	const availableToolNames = new Set(tools.map((tool) => tool.name));
	const expandedToolCalls = [];
	for (const [index, toolUse] of toolUses.entries()) {
		if (!(0,provider_dist/* isJSONObject */.k9)(toolUse)) return;
		const recipientName = toolUse.recipient_name;
		const parameters = toolUse.parameters;
		if (typeof recipientName !== "string" || !recipientName.startsWith(recipientNamePrefix) || !(0,provider_dist/* isJSONObject */.k9)(parameters)) return;
		const toolName = recipientName.slice(10);
		if (toolName.length === 0 || !availableToolNames.has(toolName)) return;
		expandedToolCalls.push({
			type: "tool-call",
			toolCallId: `${toolCall.toolCallId}_${index}`,
			toolName,
			input: JSON.stringify(parameters),
			providerMetadata: { [providerOptionsName]: { parallelToolCall: {
				itemId,
				toolCallId: toolCall.toolCallId,
				toolName: toolCall.toolName,
				...index === 0 && { input: toolCall.input },
				index,
				count: toolUses.length
			} } }
		});
	}
	return expandedToolCalls;
}
//#endregion
//#region src/responses/convert-to-openai-responses-input.ts
function serializeToolCallArguments(input) {
	if (typeof input === "string") try {
		(0,dist/* secureJsonParse */.ZA)(input);
		return input;
	} catch {
		return (0,dist/* stringifyWithBigIntAndCycles */.f3)(input);
	}
	return (0,dist/* stringifyWithBigIntAndCycles */.f3)(input === void 0 ? {} : input);
}
function mapToolCaller(caller) {
	return caller == null ? void 0 : caller.type === "program" ? {
		type: "program",
		caller_id: caller.callerId
	} : caller;
}
async function convertWebSearchToolResultOutput({ output, id }) {
	if (output.type !== "json") return;
	const validation = await (0,dist/* safeValidateTypes */.ZZ)({
		value: output.value,
		schema: webSearchOutputSchema
	});
	if (!validation.success || validation.value.action == null) return;
	const { action, sources } = validation.value;
	switch (action.type) {
		case "search": return {
			type: "web_search_call",
			id,
			status: "completed",
			action: {
				type: "search",
				...action.query != null && { query: action.query },
				...action.queries != null && { queries: action.queries },
				...sources != null && { sources }
			}
		};
		case "openPage": return {
			type: "web_search_call",
			id,
			status: "completed",
			action: {
				type: "open_page",
				url: action.url
			}
		};
		case "findInPage": return {
			type: "web_search_call",
			id,
			status: "completed",
			action: {
				type: "find_in_page",
				url: action.url,
				pattern: action.pattern
			}
		};
	}
}
async function convertFunctionToolResultOutput({ output, toolName, outputSchemaToolNames, promptCacheBreakpoint, providerOptionsName, warnings }) {
	const hasOutputSchema = outputSchemaToolNames?.has(toolName);
	const convertScalarOutput = (value) => promptCacheBreakpoint == null ? value : [{
		type: "input_text",
		text: value,
		prompt_cache_breakpoint: promptCacheBreakpoint
	}];
	switch (output.type) {
		case "text": return convertScalarOutput(hasOutputSchema ? (0,dist/* stringifyWithBigIntAndCycles */.f3)(output.value) : output.value);
		case "error-text":
		case "error-json": return convertScalarOutput((0,dist/* stringifyWithBigIntAndCycles */.f3)({ error: output.value }));
		case "execution-denied": {
			const reason = output.reason ?? "Tool call execution denied.";
			return convertScalarOutput(hasOutputSchema ? (0,dist/* stringifyWithBigIntAndCycles */.f3)(reason) : reason);
		}
		case "json": return convertScalarOutput((0,dist/* stringifyWithBigIntAndCycles */.f3)(output.value));
		case "content": return output.value.map((item) => {
			const promptCacheBreakpoint = getPromptCacheBreakpoint(item.providerOptions, providerOptionsName);
			switch (item.type) {
				case "text": return {
					type: "input_text",
					text: item.text,
					...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
				};
				case "file": {
					const topLevel = (0,dist/* getTopLevelMediaType */.yu)(item.mediaType);
					const imageDetail = item.providerOptions?.[providerOptionsName]?.imageDetail;
					if (item.data.type === "reference") {
						const fileId = (0,dist/* resolveProviderReference */.p5)({
							reference: item.data.reference,
							provider: providerOptionsName
						});
						if (topLevel === "image") return {
							type: "input_image",
							file_id: fileId,
							detail: imageDetail,
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						};
						return {
							type: "input_file",
							file_id: fileId,
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						};
					}
					if (item.data.type === "data") {
						const fullMediaType = (0,dist/* resolveFullMediaType */.SL)({ part: item });
						if (topLevel === "image") return {
							type: "input_image",
							image_url: `data:${fullMediaType};base64,${(0,dist/* convertToBase64 */.ej)(item.data.data)}`,
							detail: imageDetail,
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						};
						return {
							type: "input_file",
							filename: item.filename ?? "data",
							file_data: `data:${fullMediaType};base64,${(0,dist/* convertToBase64 */.ej)(item.data.data)}`,
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						};
					}
					if (item.data.type === "url") {
						if (topLevel === "image") return {
							type: "input_image",
							image_url: item.data.url.toString(),
							detail: imageDetail,
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						};
						return {
							type: "input_file",
							file_url: item.data.url.toString(),
							...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
						};
					}
					warnings.push({
						type: "other",
						message: `unsupported tool content part type: ${item.type} with data type: ${item.data.type}`
					});
					return;
				}
				default:
					warnings.push({
						type: "other",
						message: `unsupported tool content part type: ${item.type}`
					});
					return;
			}
		}).filter(dist/* isNonNullable */.R);
	}
}
function hasSameParallelToolCall(first, second) {
	return first.itemId === second.itemId && first.toolCallId === second.toolCallId && first.toolName === second.toolName && (first.input === void 0 || second.input === void 0 || first.input === second.input) && first.count === second.count;
}
function collectCompleteParallelToolResultGroups({ prompt, providerOptionsName }) {
	const pendingGroups = /* @__PURE__ */ new Map();
	for (const message of prompt) {
		if (message.role !== "tool") continue;
		for (const part of message.content) {
			if (part.type !== "tool-result") continue;
			const metadata = getParallelToolCallMetadata({
				providerOptions: part.providerOptions,
				providerOptionsName
			});
			if (metadata == null) continue;
			const existing = pendingGroups.get(metadata.toolCallId);
			if (existing == null) {
				pendingGroups.set(metadata.toolCallId, {
					metadata,
					results: /* @__PURE__ */ new Map([[metadata.index, part]]),
					invalid: false
				});
				continue;
			}
			if (!hasSameParallelToolCall(existing.metadata, metadata) || existing.results.has(metadata.index)) {
				existing.invalid = true;
				continue;
			}
			if (existing.metadata.input === void 0 && metadata.input !== void 0) existing.metadata = metadata;
			existing.results.set(metadata.index, part);
		}
	}
	const completeGroups = /* @__PURE__ */ new Map();
	for (const [toolCallId, group] of pendingGroups) {
		if (group.invalid || group.results.size !== group.metadata.count || group.metadata.input === void 0) continue;
		const results = Array.from({ length: group.metadata.count }, (_, index) => group.results.get(index));
		if (results.every(dist/* isNonNullable */.R)) completeGroups.set(toolCallId, {
			metadata: {
				...group.metadata,
				input: group.metadata.input
			},
			results
		});
	}
	return completeGroups;
}
function getPromptCacheBreakpoint(providerOptions, providerOptionsName) {
	return providerOptions?.[providerOptionsName]?.promptCacheBreakpoint;
}
function getScalarToolResultPromptCacheBreakpoint({ output, toolResultProviderOptions, providerOptionsName }) {
	return output.type === "content" ? void 0 : getPromptCacheBreakpoint(output.providerOptions, providerOptionsName) ?? getPromptCacheBreakpoint(toolResultProviderOptions, providerOptionsName);
}
/**
* This is soft-deprecated. Use provider references instead. Kept for backward compatibility
* with the `fileIdPrefixes` option.
*
* TODO: remove in v8
*/
function isFileId(data, prefixes) {
	if (!prefixes) return false;
	return prefixes.some((prefix) => data.startsWith(prefix));
}
async function convertToOpenAIResponsesInput({ prompt, toolNameMapping, systemMessageMode, providerOptionsName, explicitMessageItemType = false, fileIdPrefixes, passThroughUnsupportedFiles = false, store, isReasoningModel = false, hasConversation = false, hasPreviousResponseId = false, hasLocalShellTool = false, hasShellTool = false, hasApplyPatchTool = false, hasComputerTool = false, toolSearchToolName, customProviderToolNames, outputSchemaToolNames, findAdditionalToolDefinition, configurationUpdateUnsupportedReason }) {
	let input = [];
	const warnings = [];
	const seenAdditionalToolWarnings = /* @__PURE__ */ new Set();
	const droppedAdditionalToolNames = /* @__PURE__ */ new Set();
	const processedApprovalIds = /* @__PURE__ */ new Set();
	const programmaticToolCallIds = /* @__PURE__ */ new Set();
	const parallelToolResultGroups = hasConversation || hasPreviousResponseId ? collectCompleteParallelToolResultGroups({
		prompt,
		providerOptionsName
	}) : /* @__PURE__ */ new Map();
	const emittedParallelToolCalls = /* @__PURE__ */ new Set();
	const emittedParallelToolResults = /* @__PURE__ */ new Set();
	for (const { role, content, providerOptions } of prompt) switch (role) {
		case "system": {
			let options = await (0,dist/* parseProviderOptions */.xI)({
				provider: providerOptionsName,
				providerOptions,
				schema: openaiResponsesSystemMessageOptionsSchema
			});
			if (options == null && providerOptionsName !== "openai") options = await (0,dist/* parseProviderOptions */.xI)({
				provider: "openai",
				providerOptions,
				schema: openaiResponsesSystemMessageOptionsSchema
			});
			const effort = options?.reasoningEffortUpdate;
			const textFormat = options?.textFormatUpdate;
			const additionalTools = options?.additionalTools;
			if (effort != null || textFormat != null || additionalTools != null) {
				const hasConfigurationUpdate = effort != null || textFormat != null;
				const feature = effort != null ? "reasoningEffortUpdate" : textFormat != null ? "textFormatUpdate" : "additionalTools";
				const unsupportedReason = content !== "" ? `Message-level ${feature} requires empty system message content.` : hasConfigurationUpdate ? configurationUpdateUnsupportedReason : void 0;
				if (unsupportedReason != null) throw new provider_dist/* UnsupportedFunctionalityError */.b8({
					functionality: `Message-level ${feature}`,
					message: unsupportedReason
				});
				if (hasConfigurationUpdate) input.push({
					type: "configuration_update",
					...effort != null && { reasoning: { effort } },
					...textFormat != null && { text: { format: normalizeOpenAIResponsesTextFormat(textFormat, warnings) } }
				});
				const resolvedAdditionalTools = await filterAdditionalTools({
					additionalTools,
					findAdditionalToolDefinition,
					seenWarnings: seenAdditionalToolWarnings,
					droppedToolNames: droppedAdditionalToolNames,
					warnings
				});
				if (resolvedAdditionalTools != null) input.push({
					type: "additional_tools",
					role: "developer",
					tools: resolvedAdditionalTools
				});
				break;
			}
			switch (systemMessageMode) {
				case "system": {
					const promptCacheBreakpoint = getPromptCacheBreakpoint(providerOptions, providerOptionsName);
					input.push({
						...explicitMessageItemType && { type: "message" },
						role: "system",
						content: promptCacheBreakpoint == null ? content : [{
							type: "input_text",
							text: content,
							prompt_cache_breakpoint: promptCacheBreakpoint
						}]
					});
					break;
				}
				case "developer": {
					const promptCacheBreakpoint = getPromptCacheBreakpoint(providerOptions, providerOptionsName);
					input.push({
						...explicitMessageItemType && { type: "message" },
						role: "developer",
						content: promptCacheBreakpoint == null ? content : [{
							type: "input_text",
							text: content,
							prompt_cache_breakpoint: promptCacheBreakpoint
						}]
					});
					break;
				}
				case "remove":
					warnings.push({
						type: "other",
						message: "system messages are removed for this model"
					});
					break;
				default: throw new Error(`Unsupported system message mode: ${systemMessageMode}`);
			}
			break;
		}
		case "user":
			input.push({
				...explicitMessageItemType && { type: "message" },
				role: "user",
				content: content.map((part, index) => {
					switch (part.type) {
						case "text": {
							const promptCacheBreakpoint = getPromptCacheBreakpoint(part.providerOptions, providerOptionsName);
							return {
								type: "input_text",
								text: part.text,
								...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
							};
						}
						case "file": {
							const promptCacheBreakpoint = getPromptCacheBreakpoint(part.providerOptions, providerOptionsName);
							switch (part.data.type) {
								case "reference": {
									const fileId = (0,dist/* resolveProviderReference */.p5)({
										reference: part.data.reference,
										provider: providerOptionsName
									});
									if ((0,dist/* getTopLevelMediaType */.yu)(part.mediaType) === "image") return {
										type: "input_image",
										file_id: fileId,
										detail: part.providerOptions?.[providerOptionsName]?.imageDetail,
										...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
									};
									return {
										type: "input_file",
										file_id: fileId,
										...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
									};
								}
								case "text": throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "text file parts" });
								case "url":
								case "data": if ((0,dist/* getTopLevelMediaType */.yu)(part.mediaType) === "image") return {
									type: "input_image",
									...part.data.type === "url" ? { image_url: part.data.url.toString() } : typeof part.data.data === "string" && isFileId(part.data.data, fileIdPrefixes) ? { file_id: part.data.data } : { image_url: `data:${(0,dist/* resolveFullMediaType */.SL)({ part })};base64,${(0,dist/* convertToBase64 */.ej)(part.data.data)}` },
									detail: part.providerOptions?.[providerOptionsName]?.imageDetail,
									...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
								};
								else {
									if (part.data.type === "url") return {
										type: "input_file",
										file_url: part.data.url.toString(),
										...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
									};
									const fullMediaType = (0,dist/* resolveFullMediaType */.SL)({ part });
									if (fullMediaType !== "application/pdf" && !passThroughUnsupportedFiles) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `file part media type ${fullMediaType}` });
									return {
										type: "input_file",
										...typeof part.data.data === "string" && isFileId(part.data.data, fileIdPrefixes) ? { file_id: part.data.data } : {
											filename: part.filename ?? (fullMediaType === "application/pdf" ? `part-${index}.pdf` : `part-${index}`),
											file_data: `data:${fullMediaType};base64,${(0,dist/* convertToBase64 */.ej)(part.data.data)}`
										},
										...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
									};
								}
							}
						}
					}
				})
			});
			break;
		case "assistant": {
			const reasoningMessages = {};
			const emittedTextItemIds = /* @__PURE__ */ new Set();
			let hasPrecedingReasoning = false;
			for (const part of content) switch (part.type) {
				case "text": {
					const providerOptions = part.providerOptions?.[providerOptionsName];
					const id = providerOptions?.itemId;
					const phase = providerOptions?.phase;
					if (hasConversation && id != null) break;
					if (store && id != null && (!isReasoningModel || hasPrecedingReasoning)) {
						if (!emittedTextItemIds.has(id)) {
							emittedTextItemIds.add(id);
							input.push({
								type: "item_reference",
								id
							});
						}
						break;
					}
					input.push({
						...explicitMessageItemType && { type: "message" },
						role: "assistant",
						content: part.text,
						...phase != null && { phase }
					});
					break;
				}
				case "tool-call": {
					const parallelToolCallMetadata = getParallelToolCallMetadata({
						providerOptions: part.providerOptions,
						providerOptionsName
					});
					const parallelToolResultGroup = parallelToolCallMetadata == null ? void 0 : parallelToolResultGroups.get(parallelToolCallMetadata.toolCallId);
					if (parallelToolCallMetadata != null && parallelToolResultGroup != null && hasSameParallelToolCall(parallelToolResultGroup.metadata, parallelToolCallMetadata)) {
						if (!emittedParallelToolCalls.has(parallelToolResultGroup.metadata.toolCallId)) {
							emittedParallelToolCalls.add(parallelToolResultGroup.metadata.toolCallId);
							if (!hasConversation) input.push({
								type: "function_call",
								call_id: parallelToolResultGroup.metadata.toolCallId,
								name: parallelToolResultGroup.metadata.toolName,
								arguments: parallelToolResultGroup.metadata.input
							});
						}
						break;
					}
					const id = part.providerOptions?.[providerOptionsName]?.itemId ?? part.providerMetadata?.[providerOptionsName]?.itemId;
					const namespace = part.providerOptions?.[providerOptionsName]?.namespace ?? part.providerMetadata?.[providerOptionsName]?.namespace;
					const isAsync = part.providerOptions?.[providerOptionsName]?.async ?? part.providerMetadata?.[providerOptionsName]?.async;
					const caller = part.providerOptions?.[providerOptionsName]?.caller;
					if (caller?.type === "program") programmaticToolCallIds.add(part.toolCallId);
					if (hasConversation && id != null) break;
					const resolvedToolName = toolNameMapping.toProviderToolName(part.toolName);
					if (part.toolName === toolSearchToolName) {
						if (store && id != null) {
							input.push({
								type: "item_reference",
								id
							});
							break;
						}
						const parsedInput = typeof part.input === "string" ? await (0,dist/* parseJSON */.y6)({
							text: part.input,
							schema: toolSearchInputSchema
						}) : await (0,dist/* validateTypes */.k5)({
							value: part.input,
							schema: toolSearchInputSchema
						});
						const execution = parsedInput.call_id != null ? "client" : "server";
						input.push({
							type: "tool_search_call",
							id: id ?? part.toolCallId,
							execution,
							call_id: parsedInput.call_id ?? null,
							status: "completed",
							arguments: parsedInput.arguments
						});
						break;
					}
					if (resolvedToolName === "programmatic_tool_calling") {
						if (store && id != null) {
							input.push({
								type: "item_reference",
								id
							});
							break;
						}
						const parsedInput = await (0,dist/* validateTypes */.k5)({
							value: part.input,
							schema: programmaticToolCallingInputSchema
						});
						input.push({
							type: "program",
							id: id ?? part.toolCallId,
							call_id: part.toolCallId,
							code: parsedInput.code,
							fingerprint: parsedInput.fingerprint
						});
						break;
					}
					if (part.providerExecuted) {
						if (store && id != null) input.push({
							type: "item_reference",
							id
						});
						if (store || !hasShellTool || resolvedToolName !== "shell") break;
					}
					const isProviderDefinedToolCall = hasLocalShellTool && resolvedToolName === "local_shell" || hasShellTool && resolvedToolName === "shell" || hasApplyPatchTool && resolvedToolName === "apply_patch" || hasComputerTool && resolvedToolName === "computer" || (customProviderToolNames?.has(resolvedToolName) ?? false);
					if (hasPreviousResponseId && store && id != null && isProviderDefinedToolCall) break;
					if (store && id != null && isProviderDefinedToolCall) {
						input.push({
							type: "item_reference",
							id
						});
						break;
					}
					if (hasLocalShellTool && resolvedToolName === "local_shell") {
						const parsedInput = await (0,dist/* validateTypes */.k5)({
							value: part.input,
							schema: localShellInputSchema
						});
						input.push({
							type: "local_shell_call",
							call_id: part.toolCallId,
							id,
							action: {
								type: "exec",
								command: parsedInput.action.command,
								timeout_ms: parsedInput.action.timeoutMs,
								user: parsedInput.action.user,
								working_directory: parsedInput.action.workingDirectory,
								env: parsedInput.action.env
							}
						});
						break;
					}
					if (hasShellTool && resolvedToolName === "shell") {
						const parsedInput = await (0,dist/* validateTypes */.k5)({
							value: part.input,
							schema: shellInputSchema
						});
						input.push({
							type: "shell_call",
							call_id: part.toolCallId,
							id,
							status: "completed",
							action: {
								commands: parsedInput.action.commands,
								timeout_ms: parsedInput.action.timeoutMs,
								max_output_length: parsedInput.action.maxOutputLength
							}
						});
						break;
					}
					if (hasApplyPatchTool && resolvedToolName === "apply_patch") {
						const parsedInput = await (0,dist/* validateTypes */.k5)({
							value: part.input,
							schema: applyPatchInputSchema
						});
						input.push({
							type: "apply_patch_call",
							call_id: parsedInput.callId,
							id,
							status: "completed",
							operation: parsedInput.operation
						});
						break;
					}
					if (hasComputerTool && resolvedToolName === "computer") {
						const parsedInput = await (0,dist/* validateTypes */.k5)({
							value: part.input,
							schema: computerInputSchema
						});
						input.push({
							type: "computer_call",
							call_id: part.toolCallId,
							id,
							status: parsedInput.status,
							actions: parsedInput.actions.map((action) => {
								switch (action.type) {
									case "click":
									case "double_click":
									case "move": return {
										...action,
										keys: action.keys
									};
									case "drag": return {
										...action,
										keys: action.keys
									};
									case "scroll": return {
										type: "scroll",
										x: action.x,
										y: action.y,
										scroll_x: action.scrollX,
										scroll_y: action.scrollY,
										keys: action.keys
									};
									default: return action;
								}
							}),
							pending_safety_checks: parsedInput.pendingSafetyChecks.map((safetyCheck) => ({
								id: safetyCheck.id,
								code: safetyCheck.code,
								message: safetyCheck.message
							}))
						});
						break;
					}
					if (customProviderToolNames?.has(resolvedToolName)) {
						input.push({
							type: "custom_tool_call",
							call_id: part.toolCallId,
							name: resolvedToolName,
							input: typeof part.input === "string" ? part.input : (0,dist/* stringifyWithBigIntAndCycles */.f3)(part.input),
							...isAsync != null && { async: isAsync },
							id
						});
						break;
					}
					input.push({
						type: "function_call",
						call_id: part.toolCallId,
						name: resolvedToolName,
						arguments: serializeToolCallArguments(part.input),
						...isAsync != null && { async: isAsync },
						...namespace != null && { namespace },
						...caller != null && { caller: mapToolCaller(caller) }
					});
					break;
				}
				case "tool-result": {
					if (part.output.type === "execution-denied" || part.output.type === "json" && typeof part.output.value === "object" && part.output.value != null && "type" in part.output.value && part.output.value.type === "execution-denied") break;
					if (hasConversation) break;
					const resolvedResultToolName = toolNameMapping.toProviderToolName(part.toolName);
					if (resolvedResultToolName === "web_search" || resolvedResultToolName === "web_search_preview") {
						const itemId = (part.providerOptions?.[providerOptionsName])?.itemId ?? part.toolCallId;
						if (store) {
							input.push({
								type: "item_reference",
								id: itemId
							});
							break;
						}
						const webSearchCall = await convertWebSearchToolResultOutput({
							output: part.output,
							id: itemId
						});
						if (webSearchCall != null) {
							input.push(webSearchCall);
							break;
						}
					}
					if (part.toolName === toolSearchToolName) {
						const itemId = part.providerOptions?.[providerOptionsName]?.itemId ?? part.providerMetadata?.[providerOptionsName]?.itemId ?? part.toolCallId;
						if (store) input.push({
							type: "item_reference",
							id: itemId
						});
						else if (part.output.type === "json") {
							const parsedOutput = await (0,dist/* validateTypes */.k5)({
								value: part.output.value,
								schema: toolSearchOutputSchema
							});
							input.push({
								type: "tool_search_output",
								id: itemId,
								execution: "server",
								call_id: null,
								status: "completed",
								tools: parsedOutput.tools
							});
						}
						break;
					}
					if (resolvedResultToolName === "programmatic_tool_calling") {
						const itemId = part.providerOptions?.[providerOptionsName]?.itemId ?? part.providerMetadata?.[providerOptionsName]?.itemId ?? part.toolCallId;
						if (store) input.push({
							type: "item_reference",
							id: itemId
						});
						else if (part.output.type === "json") {
							const parsedOutput = await (0,dist/* validateTypes */.k5)({
								value: part.output.value,
								schema: programmaticToolCallingOutputSchema
							});
							input.push({
								type: "program_output",
								id: itemId,
								call_id: part.toolCallId,
								result: parsedOutput.result,
								status: parsedOutput.status
							});
						}
						break;
					}
					if (hasShellTool && resolvedResultToolName === "shell") {
						if (part.output.type === "json") {
							const parsedOutput = await (0,dist/* validateTypes */.k5)({
								value: part.output.value,
								schema: shellOutputSchema
							});
							input.push({
								type: "shell_call_output",
								call_id: part.toolCallId,
								...parsedOutput.maxOutputLength != null && { max_output_length: parsedOutput.maxOutputLength },
								output: parsedOutput.output.map((item) => ({
									stdout: item.stdout,
									stderr: item.stderr,
									outcome: item.outcome.type === "timeout" ? { type: "timeout" } : {
										type: "exit",
										exit_code: item.outcome.exitCode
									}
								}))
							});
						}
						break;
					}
					if (store) {
						const itemId = (part.providerOptions?.[providerOptionsName])?.itemId ?? part.toolCallId;
						input.push({
							type: "item_reference",
							id: itemId
						});
					} else warnings.push({
						type: "other",
						message: `Results for OpenAI tool ${part.toolName} are not sent to the API when store is false`
					});
					break;
				}
				case "reasoning": {
					hasPrecedingReasoning = true;
					const providerOptions = await (0,dist/* parseProviderOptions */.xI)({
						provider: providerOptionsName,
						providerOptions: part.providerOptions,
						schema: openaiResponsesReasoningProviderOptionsSchema
					});
					const reasoningId = providerOptions?.itemId;
					if ((hasConversation || hasPreviousResponseId) && reasoningId != null) break;
					if (reasoningId != null) {
						const reasoningMessage = reasoningMessages[reasoningId];
						if (store) {
							if (reasoningMessage === void 0) {
								input.push({
									type: "item_reference",
									id: reasoningId
								});
								reasoningMessages[reasoningId] = {
									type: "reasoning",
									id: reasoningId,
									summary: []
								};
							}
						} else {
							const summaryParts = [];
							if (part.text.length > 0) summaryParts.push({
								type: "summary_text",
								text: part.text
							});
							else if (reasoningMessage !== void 0) warnings.push({
								type: "other",
								message: `Cannot append empty reasoning part to existing reasoning sequence. Skipping reasoning part: ${(0,dist/* stringifyWithBigIntAndCycles */.f3)(part)}.`
							});
							if (reasoningMessage === void 0) {
								reasoningMessages[reasoningId] = {
									type: "reasoning",
									id: reasoningId,
									encrypted_content: providerOptions?.reasoningEncryptedContent,
									summary: summaryParts
								};
								input.push(reasoningMessages[reasoningId]);
							} else {
								reasoningMessage.summary.push(...summaryParts);
								if (providerOptions?.reasoningEncryptedContent != null) reasoningMessage.encrypted_content = providerOptions.reasoningEncryptedContent;
							}
						}
					} else {
						const encryptedContent = providerOptions?.reasoningEncryptedContent;
						if (encryptedContent != null) {
							const summaryParts = [];
							if (part.text.length > 0) summaryParts.push({
								type: "summary_text",
								text: part.text
							});
							input.push({
								type: "reasoning",
								encrypted_content: encryptedContent,
								summary: summaryParts
							});
						} else warnings.push({
							type: "other",
							message: `Non-OpenAI reasoning parts are not supported. Skipping reasoning part: ${(0,dist/* stringifyWithBigIntAndCycles */.f3)(part)}.`
						});
					}
					break;
				}
				case "custom": if (part.kind === "openai.compaction") {
					const providerOptions = part.providerOptions?.[providerOptionsName];
					const id = providerOptions?.itemId;
					if (hasConversation && id != null) break;
					if (store && id != null) {
						input.push({
							type: "item_reference",
							id
						});
						break;
					}
					const encryptedContent = providerOptions?.encryptedContent;
					if (id != null) input.push({
						type: "compaction",
						id,
						encrypted_content: encryptedContent
					});
				}
			}
			break;
		}
		case "tool":
			for (const part of content) {
				if (part.type === "tool-approval-response") {
					const approvalResponse = part;
					if (processedApprovalIds.has(approvalResponse.approvalId)) continue;
					processedApprovalIds.add(approvalResponse.approvalId);
					if (store && !hasConversation && !hasPreviousResponseId) input.push({
						type: "item_reference",
						id: approvalResponse.approvalId
					});
					input.push({
						type: "mcp_approval_response",
						approval_request_id: approvalResponse.approvalId,
						approve: approvalResponse.approved
					});
					continue;
				}
				const parallelToolCallMetadata = getParallelToolCallMetadata({
					providerOptions: part.providerOptions,
					providerOptionsName
				});
				const parallelToolResultGroup = parallelToolCallMetadata == null ? void 0 : parallelToolResultGroups.get(parallelToolCallMetadata.toolCallId);
				if (parallelToolCallMetadata != null && parallelToolResultGroup != null && hasSameParallelToolCall(parallelToolResultGroup.metadata, parallelToolCallMetadata)) {
					if (!emittedParallelToolResults.has(parallelToolResultGroup.metadata.toolCallId)) {
						emittedParallelToolResults.add(parallelToolResultGroup.metadata.toolCallId);
						const toolOutputs = await Promise.all(parallelToolResultGroup.results.map(async (result) => {
							const promptCacheBreakpoint = getScalarToolResultPromptCacheBreakpoint({
								output: result.output,
								toolResultProviderOptions: result.providerOptions,
								providerOptionsName
							});
							return {
								output: await convertFunctionToolResultOutput({
									output: result.output,
									toolName: result.toolName,
									outputSchemaToolNames,
									providerOptionsName,
									warnings
								}),
								promptCacheBreakpoint
							};
						}));
						const serializedToolOutputs = toolOutputs.map(({ output }) => typeof output === "string" ? output : (0,dist/* stringifyWithBigIntAndCycles */.f3)(output));
						const hasPromptCacheBreakpoint = toolOutputs.some(({ promptCacheBreakpoint }) => promptCacheBreakpoint != null);
						input.push({
							type: "function_call_output",
							call_id: parallelToolResultGroup.metadata.toolCallId,
							output: hasPromptCacheBreakpoint ? serializedToolOutputs.map((text, index) => ({
								type: "input_text",
								text: index === 0 ? text : `\n${text}`,
								...toolOutputs[index].promptCacheBreakpoint != null && { prompt_cache_breakpoint: toolOutputs[index].promptCacheBreakpoint }
							})) : serializedToolOutputs.join("\n")
						});
						for (const result of parallelToolResultGroup.results) {
							const additionalTools = await resolveAdditionalTools({
								providerOptions: result.providerOptions,
								providerOptionsName,
								findAdditionalToolDefinition,
								seenWarnings: seenAdditionalToolWarnings,
								droppedToolNames: droppedAdditionalToolNames,
								warnings
							});
							if (additionalTools != null) input.push({
								type: "additional_tools",
								role: "developer",
								tools: additionalTools
							});
						}
					}
					continue;
				}
				const output = part.output;
				if (output.type === "execution-denied") {
					if ((output.providerOptions?.openai)?.approvalId) continue;
				}
				const resolvedToolName = toolNameMapping.toProviderToolName(part.toolName);
				if (part.toolName === toolSearchToolName && output.type === "json") {
					const parsedOutput = await (0,dist/* validateTypes */.k5)({
						value: output.value,
						schema: toolSearchOutputSchema
					});
					input.push({
						type: "tool_search_output",
						execution: "client",
						call_id: part.toolCallId,
						status: "completed",
						tools: parsedOutput.tools
					});
					continue;
				}
				if (hasLocalShellTool && resolvedToolName === "local_shell" && output.type === "json") {
					const parsedOutput = await (0,dist/* validateTypes */.k5)({
						value: output.value,
						schema: localShellOutputSchema
					});
					input.push({
						type: "local_shell_call_output",
						call_id: part.toolCallId,
						output: parsedOutput.output
					});
					continue;
				}
				if (hasShellTool && resolvedToolName === "shell" && output.type === "json") {
					const parsedOutput = await (0,dist/* validateTypes */.k5)({
						value: output.value,
						schema: shellOutputSchema
					});
					input.push({
						type: "shell_call_output",
						call_id: part.toolCallId,
						...parsedOutput.maxOutputLength != null && { max_output_length: parsedOutput.maxOutputLength },
						output: parsedOutput.output.map((item) => ({
							stdout: item.stdout,
							stderr: item.stderr,
							outcome: item.outcome.type === "timeout" ? { type: "timeout" } : {
								type: "exit",
								exit_code: item.outcome.exitCode
							}
						}))
					});
					continue;
				}
				if (hasApplyPatchTool && part.toolName === "apply_patch" && output.type === "json") {
					const parsedOutput = await (0,dist/* validateTypes */.k5)({
						value: output.value,
						schema: applyPatchOutputSchema
					});
					input.push({
						type: "apply_patch_call_output",
						call_id: part.toolCallId,
						status: parsedOutput.status,
						output: parsedOutput.output
					});
					continue;
				}
				if (hasComputerTool && resolvedToolName === "computer" && output.type === "json") {
					const parsedOutput = await (0,dist/* validateTypes */.k5)({
						value: output.value,
						schema: computerOutputSchema
					});
					input.push({
						type: "computer_call_output",
						call_id: part.toolCallId,
						output: {
							type: "computer_screenshot",
							image_url: parsedOutput.output.imageUrl,
							file_id: parsedOutput.output.fileId,
							detail: parsedOutput.output.detail
						},
						acknowledged_safety_checks: parsedOutput.acknowledgedSafetyChecks?.map((safetyCheck) => ({
							id: safetyCheck.id,
							code: safetyCheck.code,
							message: safetyCheck.message
						}))
					});
					continue;
				}
				if (customProviderToolNames?.has(resolvedToolName)) {
					const promptCacheBreakpoint = getScalarToolResultPromptCacheBreakpoint({
						output,
						toolResultProviderOptions: part.providerOptions,
						providerOptionsName
					});
					const convertScalarOutput = (value) => promptCacheBreakpoint == null ? value : [{
						type: "input_text",
						text: value,
						prompt_cache_breakpoint: promptCacheBreakpoint
					}];
					let outputValue;
					switch (output.type) {
						case "text":
							outputValue = convertScalarOutput(output.value);
							break;
						case "error-text":
						case "error-json":
							outputValue = convertScalarOutput((0,dist/* stringifyWithBigIntAndCycles */.f3)({ error: output.value }));
							break;
						case "execution-denied":
							outputValue = convertScalarOutput(output.reason ?? "Tool call execution denied.");
							break;
						case "json":
							outputValue = convertScalarOutput((0,dist/* stringifyWithBigIntAndCycles */.f3)(output.value));
							break;
						case "content":
							outputValue = output.value.map((item) => {
								const promptCacheBreakpoint = getPromptCacheBreakpoint(item.providerOptions, providerOptionsName);
								switch (item.type) {
									case "text": return {
										type: "input_text",
										text: item.text,
										...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
									};
									case "file": {
										const topLevel = (0,dist/* getTopLevelMediaType */.yu)(item.mediaType);
										const imageDetail = item.providerOptions?.[providerOptionsName]?.imageDetail;
										if (item.data.type === "data") {
											const fullMediaType = (0,dist/* resolveFullMediaType */.SL)({ part: item });
											if (topLevel === "image") return {
												type: "input_image",
												image_url: `data:${fullMediaType};base64,${(0,dist/* convertToBase64 */.ej)(item.data.data)}`,
												detail: imageDetail,
												...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
											};
											return {
												type: "input_file",
												filename: item.filename ?? "data",
												file_data: `data:${fullMediaType};base64,${(0,dist/* convertToBase64 */.ej)(item.data.data)}`,
												...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
											};
										}
										if (item.data.type === "url") {
											if (topLevel === "image") return {
												type: "input_image",
												image_url: item.data.url.toString(),
												detail: imageDetail,
												...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
											};
											return {
												type: "input_file",
												file_url: item.data.url.toString(),
												...promptCacheBreakpoint != null && { prompt_cache_breakpoint: promptCacheBreakpoint }
											};
										}
										warnings.push({
											type: "other",
											message: `unsupported custom tool content part type: ${item.type} with data type: ${item.data.type}`
										});
										return;
									}
									default:
										warnings.push({
											type: "other",
											message: `unsupported custom tool content part type: ${item.type}`
										});
										return;
								}
							}).filter(dist/* isNonNullable */.R);
							break;
						default: outputValue = "";
					}
					input.push({
						type: "custom_tool_call_output",
						call_id: part.toolCallId,
						output: outputValue
					});
					continue;
				}
				const resultCaller = part.providerOptions?.[providerOptionsName]?.caller;
				if (output.type === "execution-denied" && (resultCaller?.type === "program" || programmaticToolCallIds.has(part.toolCallId))) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "execution-denied results for programmatic tool calls" });
				const contentValue = await convertFunctionToolResultOutput({
					output,
					toolName: part.toolName,
					outputSchemaToolNames,
					promptCacheBreakpoint: getScalarToolResultPromptCacheBreakpoint({
						output,
						toolResultProviderOptions: part.providerOptions,
						providerOptionsName
					}),
					providerOptionsName,
					warnings
				});
				const caller = mapToolCaller(resultCaller);
				input.push({
					type: "function_call_output",
					call_id: part.toolCallId,
					output: contentValue,
					...caller != null && { caller }
				});
				const additionalTools = await resolveAdditionalTools({
					providerOptions: part.providerOptions,
					providerOptionsName,
					findAdditionalToolDefinition,
					seenWarnings: seenAdditionalToolWarnings,
					droppedToolNames: droppedAdditionalToolNames,
					warnings
				});
				if (additionalTools != null) input.push({
					type: "additional_tools",
					role: "developer",
					tools: additionalTools
				});
			}
			break;
		default: throw new Error(`Unsupported role: ${role}`);
	}
	if (!store && input.some((item) => "type" in item && item.type === "reasoning" && item.encrypted_content == null)) {
		warnings.push({
			type: "other",
			message: "Reasoning parts without encrypted content are not supported when store is false. Skipping reasoning parts."
		});
		input = input.filter((item) => !("type" in item) || item.type !== "reasoning" || item.encrypted_content != null);
	}
	if (droppedAdditionalToolNames.size > 0) warnings.push({
		type: "unsupported",
		feature: "additionalTools",
		details: `additional tool definitions are only sent for tools registered in the request; dropped the definitions of unregistered tools: ${formatDroppedToolNames(droppedAdditionalToolNames)}`
	});
	return {
		input,
		warnings
	};
}
const openaiResponsesReasoningProviderOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	itemId: classic_schemas/* string */.YjP().nullish(),
	reasoningEncryptedContent: classic_schemas/* string */.YjP().nullish()
})));
async function parseToolResultAdditionalTools({ providerOptions, providerOptionsName }) {
	const options = await (0,dist/* parseProviderOptions */.xI)({
		provider: providerOptionsName,
		providerOptions,
		schema: openaiResponsesToolResultOptionsSchema
	});
	if (options?.additionalTools != null || providerOptionsName === "openai") return options?.additionalTools;
	return (await (0,dist/* parseProviderOptions */.xI)({
		provider: "openai",
		providerOptions,
		schema: openaiResponsesToolResultOptionsSchema
	}))?.additionalTools;
}
/**
* Replaces `additionalTools` entries from a tool result with the definitions of
* the tools registered for this request.
*/
async function resolveAdditionalTools({ providerOptions, providerOptionsName, findAdditionalToolDefinition, seenWarnings, droppedToolNames, warnings }) {
	return filterAdditionalTools({
		additionalTools: await parseToolResultAdditionalTools({
			providerOptions,
			providerOptionsName
		}),
		findAdditionalToolDefinition,
		seenWarnings,
		droppedToolNames,
		warnings
	});
}
/**
* Replaces `additionalTools` entries from the prompt with the definitions of
* the tools registered for this request.
*
* Prompts can contain replayed conversation history, so their tool definitions
* are not trusted. An entry only selects a registered tool: the provider sends
* the definition derived from the registered tool, and entries for tools that
* are not registered are dropped.
*/
async function filterAdditionalTools({ additionalTools, findAdditionalToolDefinition, seenWarnings, droppedToolNames, warnings }) {
	if (additionalTools == null || additionalTools.length === 0) return;
	const resolvedTools = [];
	const seenDefinitions = /* @__PURE__ */ new Set();
	for (const additionalTool of additionalTools) {
		const resolved = await findAdditionalToolDefinition?.({
			type: additionalTool.type,
			name: additionalTool.name
		});
		if (resolved == null) {
			droppedToolNames.add(additionalTool.name);
			continue;
		}
		for (const warning of resolved.warnings) {
			const signature = JSON.stringify(warning);
			if (!seenWarnings.has(signature)) {
				seenWarnings.add(signature);
				warnings.push(warning);
			}
		}
		if (resolved.definition == null) continue;
		pushDefinitionMismatchWarning({
			additionalTool,
			definition: resolved.definition,
			seenWarnings,
			warnings
		});
		const definition = narrowNamespaceDefinition({
			registeredDefinition: resolved.definition,
			additionalTool,
			droppedToolNames
		});
		if (definition == null) continue;
		const signature = JSON.stringify(definition);
		if (seenDefinitions.has(signature)) continue;
		seenDefinitions.add(signature);
		resolvedTools.push(definition);
	}
	return resolvedTools.length > 0 ? resolvedTools : void 0;
}
/**
* A namespace entry names the tools to load. Send only the registered tools of
* the namespace that the entry names, so an entry cannot load more of a
* namespace than it asked for.
*/
function narrowNamespaceDefinition({ registeredDefinition, additionalTool, droppedToolNames }) {
	if (registeredDefinition.type !== "namespace" || additionalTool.type !== "namespace") return registeredDefinition;
	const requestedToolNames = new Set(additionalTool.tools.map((tool) => tool.name));
	const registeredToolNames = new Set(registeredDefinition.tools.map((tool) => tool.name));
	for (const toolName of requestedToolNames) if (!registeredToolNames.has(toolName)) droppedToolNames.add(toolName);
	const tools = registeredDefinition.tools.filter((tool) => requestedToolNames.has(tool.name));
	return tools.length > 0 ? {
		...registeredDefinition,
		tools
	} : void 0;
}
/**
* The entry in the history is not sent, so a `strict` or `defer_loading` value
* that differs from the registered tool is ignored. Warn instead of silently
* changing the behavior the entry asks for.
*/
function pushDefinitionMismatchWarning({ additionalTool, definition, seenWarnings, warnings }) {
	if (additionalTool.type !== "function" || definition.type !== "function") return;
	const mismatchedFields = [];
	if (additionalTool.strict != null && additionalTool.strict !== definition.strict) mismatchedFields.push("strict");
	if (additionalTool.defer_loading != null && additionalTool.defer_loading !== (definition.defer_loading ?? false)) mismatchedFields.push("defer_loading");
	if (mismatchedFields.length === 0) return;
	const warning = {
		type: "unsupported",
		feature: `additionalTools entry "${definition.name}"`,
		details: `the history entry sets ${mismatchedFields.join(" and ")} differently from the registered tool; the registered definition is sent`
	};
	const signature = JSON.stringify(warning);
	if (!seenWarnings.has(signature)) {
		seenWarnings.add(signature);
		warnings.push(warning);
	}
}
function formatDroppedToolNames(names) {
	const maxNames = 5;
	const maxNameLength = 80;
	const formattedNames = [...names].slice(0, maxNames).map((name) => JSON.stringify(name.length > maxNameLength ? `${name.slice(0, maxNameLength)}...` : name));
	return names.size > maxNames ? `${formattedNames.join(", ")} and ${names.size - maxNames} more` : formattedNames.join(", ");
}
//#endregion
//#region src/responses/map-openai-responses-annotation.ts
function mapOpenAIResponsesAnnotationSource(annotation, providerOptionsName, id) {
	if (annotation.type === "url_citation") return {
		type: "source",
		sourceType: "url",
		id,
		url: annotation.url,
		title: annotation.title
	};
	const filename = annotation.type === "file_path" ? annotation.file_id : annotation.filename;
	return {
		type: "source",
		sourceType: "document",
		id,
		mediaType: annotation.type === "file_path" ? "application/octet-stream" : "text/plain",
		title: filename,
		filename,
		providerMetadata: { [providerOptionsName]: {
			type: annotation.type,
			fileId: annotation.file_id,
			...annotation.type === "container_file_citation" ? { containerId: annotation.container_id } : { index: annotation.index }
		} }
	};
}
function mapOpenAIResponsesCitations(annotations, providerOptionsName) {
	return annotations.flatMap((annotation) => annotation.type === "file_path" ? [] : [{
		source: mapOpenAIResponsesAnnotationSource(annotation, providerOptionsName, annotation.type === "url_citation" ? annotation.url : annotation.file_id),
		..."start_index" in annotation ? {
			startIndex: annotation.start_index,
			endIndex: annotation.end_index
		} : {}
	}]);
}
//#endregion
//#region src/responses/openai-responses-prepare-tools.ts
async function prepareResponsesTools({ tools, toolChoice, allowedTools, toolNameMapping, customProviderToolNames, outputSchemaToolNames, supportsAsyncToolCalling = true, providerOptionsName = "openai" }) {
	tools = tools?.length ? tools : void 0;
	const toolWarnings = [];
	if (tools == null) return {
		tools: void 0,
		toolChoice: void 0,
		toolWarnings
	};
	const openaiTools = [];
	const namespaceTools = /* @__PURE__ */ new Map();
	const resolvedCustomProviderToolNames = customProviderToolNames ?? /* @__PURE__ */ new Set();
	const allowedToolResolutions = /* @__PURE__ */ new Map();
	const allowedToolAliases = /* @__PURE__ */ new Map();
	const recordAllowedTool = (toolName, resolution, canonicalName) => {
		allowedToolResolutions.set(toolName, resolution);
		if (canonicalName == null || canonicalName === toolName) return;
		const existingAlias = allowedToolAliases.get(canonicalName);
		if (existingAlias == null) allowedToolAliases.set(canonicalName, resolution);
		else if (existingAlias !== "ambiguous" && !isSameAllowedTool(existingAlias, resolution)) allowedToolAliases.set(canonicalName, "ambiguous");
	};
	for (const tool of tools) switch (tool.type) {
		case "function": {
			const openaiOptions = tool.providerOptions?.[providerOptionsName] ?? tool.providerOptions?.openai;
			if (openaiOptions?.outputSchema != null) outputSchemaToolNames?.add(tool.name);
			if (openaiOptions?.omitFromRequestTools === true) {
				recordAllowedTool(tool.name, {
					supported: false,
					reason: "tools omitted from the request tools array cannot be allow-listed"
				}, void 0);
				if (allowedTools == null && toolChoice?.type === "tool" && toolChoice.toolName === tool.name) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `forcing tool "${tool.name}" omitted from the request tools array; use automatic tool choice for history-loaded tools` });
				break;
			}
			const openaiFunctionTool = prepareFunctionTool({
				tool,
				options: openaiOptions,
				toolWarnings,
				async: resolveAsyncToolOption({
					value: openaiOptions?.async,
					supportsAsyncToolCalling,
					toolName: tool.name,
					toolWarnings
				})
			});
			const namespace = openaiOptions?.namespace;
			if (namespace == null) openaiTools.push(openaiFunctionTool);
			else {
				let namespaceTool = namespaceTools.get(namespace.name);
				if (namespaceTool == null) {
					namespaceTool = {
						type: "namespace",
						name: namespace.name,
						description: namespace.description,
						tools: []
					};
					namespaceTools.set(namespace.name, namespaceTool);
					openaiTools.push(namespaceTool);
				} else if (namespaceTool.description !== namespace.description) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `conflicting descriptions for OpenAI tool namespace "${namespace.name}"` });
				namespaceTool.tools.push(openaiFunctionTool);
			}
			recordAllowedTool(tool.name, namespace != null ? {
				supported: false,
				reason: "tools inside an OpenAI tool namespace are not visible to tool_choice.allowed_tools"
			} : openaiOptions?.deferLoading === true ? {
				supported: false,
				reason: "deferred tools are not visible to tool_choice.allowed_tools"
			} : {
				supported: true,
				entry: {
					type: "function",
					name: tool.name
				}
			}, void 0);
			break;
		}
		case "provider": {
			const openaiToolCountBefore = openaiTools.length;
			switch (tool.id) {
				case "openai.file_search": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: fileSearchArgsSchema
					});
					openaiTools.push({
						type: "file_search",
						vector_store_ids: args.vectorStoreIds,
						max_num_results: args.maxNumResults,
						ranking_options: args.ranking ? {
							ranker: args.ranking.ranker,
							score_threshold: args.ranking.scoreThreshold
						} : void 0,
						filters: args.filters
					});
					break;
				}
				case "openai.local_shell":
					openaiTools.push({ type: "local_shell" });
					break;
				case "openai.shell": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: shellArgsSchema
					});
					openaiTools.push({
						type: "shell",
						...args.environment && { environment: mapShellEnvironment(args.environment) }
					});
					break;
				}
				case "openai.apply_patch":
					openaiTools.push({ type: "apply_patch" });
					break;
				case "openai.computer":
					openaiTools.push({ type: "computer" });
					break;
				case "openai.web_search_preview": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: webSearchPreviewArgsSchema
					});
					openaiTools.push({
						type: "web_search_preview",
						search_context_size: args.searchContextSize,
						user_location: args.userLocation
					});
					break;
				}
				case "openai.web_search": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: webSearchArgsSchema
					});
					openaiTools.push({
						type: "web_search",
						filters: args.filters != null ? {
							allowed_domains: args.filters.allowedDomains,
							blocked_domains: args.filters.blockedDomains
						} : void 0,
						external_web_access: args.externalWebAccess,
						search_context_size: args.searchContextSize,
						user_location: args.userLocation
					});
					break;
				}
				case "openai.code_interpreter": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: codeInterpreterArgsSchema
					});
					openaiTools.push({
						type: "code_interpreter",
						container: args.container == null ? {
							type: "auto",
							file_ids: void 0
						} : typeof args.container === "string" ? args.container : {
							type: "auto",
							file_ids: args.container.fileIds,
							memory_limit: args.container.memoryLimit,
							network_policy: args.container.networkPolicy == null ? void 0 : args.container.networkPolicy.type === "disabled" ? { type: "disabled" } : {
								type: "allowlist",
								allowed_domains: args.container.networkPolicy.allowedDomains,
								domain_secrets: args.container.networkPolicy.domainSecrets
							}
						}
					});
					break;
				}
				case "openai.image_generation": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: imageGenerationArgsSchema
					});
					openaiTools.push({
						type: "image_generation",
						action: args.action,
						background: args.background,
						input_fidelity: args.inputFidelity,
						input_image_mask: args.inputImageMask ? {
							file_id: args.inputImageMask.fileId,
							image_url: args.inputImageMask.imageUrl
						} : void 0,
						model: args.model,
						moderation: args.moderation,
						partial_images: args.partialImages,
						quality: args.quality,
						output_compression: args.outputCompression,
						output_format: args.outputFormat,
						size: args.size
					});
					break;
				}
				case "openai.mcp": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: mcpArgsSchema
					});
					const mapApprovalFilter = (filter) => ({ tool_names: filter.toolNames });
					const requireApproval = args.requireApproval;
					const requireApprovalParam = requireApproval == null ? void 0 : typeof requireApproval === "string" ? requireApproval : requireApproval.never != null ? { never: mapApprovalFilter(requireApproval.never) } : void 0;
					openaiTools.push({
						type: "mcp",
						server_label: args.serverLabel,
						allowed_tools: Array.isArray(args.allowedTools) ? args.allowedTools : args.allowedTools ? {
							read_only: args.allowedTools.readOnly,
							tool_names: args.allowedTools.toolNames
						} : void 0,
						authorization: args.authorization,
						connector_id: args.connectorId,
						headers: args.headers,
						require_approval: requireApprovalParam ?? "never",
						server_description: args.serverDescription,
						server_url: args.serverUrl,
						tunnel_id: args.tunnelId
					});
					break;
				}
				case "openai.custom": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: customArgsSchema
					});
					openaiTools.push({
						type: "custom",
						name: tool.name,
						description: args.description,
						...resolveAsyncToolOption({
							value: args.async,
							supportsAsyncToolCalling,
							toolName: tool.name,
							toolWarnings
						}) != null ? { async: args.async } : {},
						format: args.format
					});
					resolvedCustomProviderToolNames.add(tool.name);
					break;
				}
				case "openai.programmatic_tool_calling":
					openaiTools.push({ type: "programmatic_tool_calling" });
					break;
				case "openai.tool_search": {
					const args = await (0,dist/* validateTypes */.k5)({
						value: tool.args,
						schema: toolSearchArgsSchema
					});
					openaiTools.push({
						type: "tool_search",
						...args.execution != null ? { execution: args.execution } : {},
						...args.description != null ? { description: args.description } : {},
						...args.parameters != null ? { parameters: args.parameters } : {}
					});
					break;
				}
			}
			if (openaiTools.length > openaiToolCountBefore) {
				const openaiTool = openaiTools[openaiToolCountBefore];
				recordAllowedTool(tool.name, toAllowedToolResolution(openaiTool), toolNameMapping?.toProviderToolName(tool.name));
			}
			break;
		}
		default: toolWarnings.push({
			type: "unsupported",
			feature: `function tool ${tool}`
		});
	}
	if (allowedTools != null) {
		const allowedToolEntries = [];
		const droppedToolNames = [];
		for (const name of allowedTools.toolNames) {
			const directResolution = allowedToolResolutions.get(name);
			const resolution = directResolution ?? allowedToolAliases.get(name);
			if (directResolution != null && allowedToolAliases.has(name)) toolWarnings.push({
				type: "unsupported",
				feature: `allowedTools entry "${name}"`,
				details: "this name is both a tool name and the provider tool name of another tool in this request; the tool with this name is allowed"
			});
			if (resolution === "ambiguous") {
				toolWarnings.push({
					type: "unsupported",
					feature: `allowedTools entry "${name}"`,
					details: "several tools in this request share this provider tool name; use the tool name from the tools for this request instead"
				});
				droppedToolNames.push(name);
				continue;
			}
			if (resolution == null) {
				toolWarnings.push({
					type: "unsupported",
					feature: `allowedTools entry "${name}"`,
					details: "the tool is not part of the tools for this request and is sent as a function tool"
				});
				allowedToolEntries.push({
					type: "function",
					name: toolNameMapping?.toProviderToolName(name) ?? name
				});
				continue;
			}
			if (!resolution.supported) {
				toolWarnings.push({
					type: "unsupported",
					feature: `allowedTools entry "${name}"`,
					details: `${resolution.reason}; the tool is removed from the allowed tools`
				});
				droppedToolNames.push(name);
				continue;
			}
			allowedToolEntries.push(resolution.entry);
		}
		if (allowedToolEntries.length === 0) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `allowedTools with only tools that cannot be allow-listed (${droppedToolNames.join(", ")})` });
		return {
			tools: openaiTools,
			toolChoice: {
				type: "allowed_tools",
				mode: allowedTools.mode ?? "auto",
				tools: allowedToolEntries
			},
			toolWarnings
		};
	}
	if (toolChoice == null) return {
		tools: openaiTools,
		toolChoice: void 0,
		toolWarnings
	};
	const type = toolChoice.type;
	switch (type) {
		case "auto":
		case "none":
		case "required": return {
			tools: openaiTools,
			toolChoice: type,
			toolWarnings
		};
		case "tool": {
			const resolvedToolName = toolNameMapping?.toProviderToolName(toolChoice.toolName) ?? toolChoice.toolName;
			return {
				tools: openaiTools,
				toolChoice: resolvedToolName === "code_interpreter" || resolvedToolName === "file_search" || resolvedToolName === "image_generation" || resolvedToolName === "web_search_preview" || resolvedToolName === "web_search" || resolvedToolName === "mcp" || resolvedToolName === "apply_patch" || resolvedToolName === "computer" || resolvedToolName === "programmatic_tool_calling" ? { type: resolvedToolName } : resolvedCustomProviderToolNames.has(resolvedToolName) ? {
					type: "custom",
					name: resolvedToolName
				} : {
					type: "function",
					name: resolvedToolName
				},
				toolWarnings
			};
		}
		default: throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `tool choice type: ${type}` });
	}
}
/**
* Resolves an `additionalTools` entry from the prompt to the definition of the
* tool registered for this request.
*
* Prompts contain replayable conversation history, so a supplied entry only
* selects a registered tool: the provider sends the definition derived from
* that tool, never the definition text from the history. Only the selected tool
* is prepared, so registered tools that the history does not reference are not
* processed at all.
*/
async function findAdditionalToolDefinition({ tools, additionalTool, providerOptionsName = "openai", allowedToolNames }) {
	const warnings = [];
	if (additionalTool.type === "namespace") {
		const namespaceTools = [];
		let description;
		for (const tool of tools ?? []) {
			if (tool.type !== "function") continue;
			const openaiOptions = getOpenAIToolOptions(tool, providerOptionsName);
			const namespace = openaiOptions?.namespace;
			if (namespace?.name !== additionalTool.name) continue;
			if (description == null) description = namespace.description;
			else if (description !== namespace.description) warnings.push({
				type: "unsupported",
				feature: `conflicting descriptions for OpenAI tool namespace "${namespace.name}"`,
				details: "the first registered description is used for the loaded namespace"
			});
			if (openaiOptions?.allowedCallers != null) {
				warnings.push({
					type: "unsupported",
					feature: `additionalTools namespace "${additionalTool.name}"`,
					details: `tool "${tool.name}" restricts allowed callers, which a definition loaded from history cannot express; it is not loaded`
				});
				continue;
			}
			const toolWarnings = openaiOptions?.omitFromRequestTools === true ? warnings : [];
			namespaceTools.push(toAdditionalFunctionTool(prepareFunctionTool({
				tool,
				options: openaiOptions,
				toolWarnings,
				async: void 0
			})));
		}
		if (description == null) return;
		if (allowedToolNames != null) return {
			definition: void 0,
			warnings: [{
				type: "unsupported",
				feature: `additionalTools namespace "${additionalTool.name}"`,
				details: "tool namespaces cannot be loaded while allowedTools restricts the callable tools; the entry is not loaded"
			}]
		};
		if (namespaceTools.length === 0) return {
			definition: void 0,
			warnings
		};
		return {
			definition: {
				type: "namespace",
				name: additionalTool.name,
				description,
				tools: namespaceTools
			},
			warnings
		};
	}
	for (const tool of tools ?? []) {
		if (additionalTool.type === "function" && tool.type === "function") {
			const openaiOptions = getOpenAIToolOptions(tool, providerOptionsName);
			if (tool.name !== additionalTool.name || openaiOptions?.namespace != null) continue;
			if (allowedToolNames != null && !allowedToolNames.has(tool.name)) return {
				definition: void 0,
				warnings: [{
					type: "unsupported",
					feature: `additionalTools entry "${tool.name}"`,
					details: "the tool is not part of allowedTools for this request; the entry is not loaded"
				}]
			};
			if (openaiOptions?.allowedCallers != null) return {
				definition: void 0,
				warnings: [{
					type: "unsupported",
					feature: `additionalTools entry "${tool.name}"`,
					details: "the registered tool restricts allowed callers, which a definition loaded from history cannot express; the entry is not loaded"
				}]
			};
			const omitFromRequestTools = openaiOptions?.omitFromRequestTools === true;
			return {
				definition: toAdditionalFunctionTool(prepareFunctionTool({
					tool,
					options: openaiOptions,
					toolWarnings: omitFromRequestTools ? warnings : [],
					async: void 0
				})),
				warnings: omitFromRequestTools ? warnings : []
			};
		}
		if (additionalTool.type === "custom" && tool.type === "provider" && tool.id === "openai.custom" && tool.name === additionalTool.name) {
			if (allowedToolNames != null && !allowedToolNames.has(tool.name)) return {
				definition: void 0,
				warnings: [{
					type: "unsupported",
					feature: `additionalTools entry "${tool.name}"`,
					details: "the tool is not part of allowedTools for this request; the entry is not loaded"
				}]
			};
			const args = await (0,dist/* validateTypes */.k5)({
				value: tool.args,
				schema: customArgsSchema
			});
			return {
				definition: {
					type: "custom",
					name: tool.name,
					description: args.description,
					format: args.format
				},
				warnings
			};
		}
	}
}
function getOpenAIToolOptions(tool, providerOptionsName) {
	return tool.providerOptions?.[providerOptionsName] ?? tool.providerOptions?.openai;
}
function allowedToolKey(entry) {
	switch (entry.type) {
		case "mcp": return `mcp:${entry.server_label}`;
		case "function":
		case "custom": return `${entry.type}:${entry.name}`;
		default: return entry.type;
	}
}
function isSameAllowedTool(a, b) {
	if (a.supported && b.supported) return allowedToolKey(a.entry) === allowedToolKey(b.entry);
	if (!a.supported && !b.supported) return a.reason === b.reason;
	return false;
}
function toAllowedToolResolution(tool) {
	switch (tool.type) {
		case "custom": return {
			supported: true,
			entry: {
				type: "custom",
				name: tool.name
			}
		};
		case "mcp": return {
			supported: true,
			entry: {
				type: "mcp",
				server_label: tool.server_label
			}
		};
		case "file_search":
		case "web_search":
		case "web_search_preview":
		case "image_generation":
		case "code_interpreter":
		case "computer":
		case "apply_patch":
		case "shell":
		case "local_shell":
		case "programmatic_tool_calling": return {
			supported: true,
			entry: { type: tool.type }
		};
		default: return {
			supported: false,
			reason: `OpenAI does not support ${tool.type} tools in tool_choice.allowed_tools`
		};
	}
}
function toAdditionalFunctionTool({ name, description, parameters, strict, defer_loading }) {
	return {
		type: "function",
		name,
		description,
		parameters,
		strict,
		...defer_loading != null ? { defer_loading } : {}
	};
}
function prepareFunctionTool({ tool, options, toolWarnings, async }) {
	const deferLoading = options?.deferLoading;
	const normalizedInputSchema = normalizeOpenAIJsonSchema(tool.inputSchema);
	const normalizedOutputSchema = options?.outputSchema != null ? normalizeOpenAIJsonSchema(options.outputSchema) : void 0;
	toolWarnings.push(...normalizedInputSchema.warnings, ...normalizedOutputSchema?.warnings ?? []);
	return {
		type: "function",
		name: tool.name,
		description: tool.description,
		parameters: normalizedInputSchema.schema,
		...async != null ? { async } : {},
		strict: tool.strict ?? false,
		...deferLoading != null ? { defer_loading: deferLoading } : {},
		...options?.allowedCallers != null ? { allowed_callers: options.allowedCallers } : {},
		...options?.outputSchema != null ? { output_schema: normalizedOutputSchema?.schema } : {}
	};
}
function resolveAsyncToolOption({ value, supportsAsyncToolCalling, toolName, toolWarnings }) {
	if (value !== true || supportsAsyncToolCalling) return value;
	toolWarnings.push({
		type: "unsupported",
		feature: `async tool calling for "${toolName}"`,
		details: "Async tool calling is only supported by GPT-6 and later models."
	});
}
function mapShellEnvironment(environment) {
	if (environment.type === "containerReference") return {
		type: "container_reference",
		container_id: environment.containerId
	};
	if (environment.type === "containerAuto") {
		const env = environment;
		return {
			type: "container_auto",
			file_ids: env.fileIds,
			memory_limit: env.memoryLimit,
			network_policy: env.networkPolicy == null ? void 0 : env.networkPolicy.type === "disabled" ? { type: "disabled" } : {
				type: "allowlist",
				allowed_domains: env.networkPolicy.allowedDomains,
				domain_secrets: env.networkPolicy.domainSecrets
			},
			skills: mapShellSkills(env.skills)
		};
	}
	return {
		type: "local",
		skills: environment.skills
	};
}
function mapShellSkills(skills) {
	return skills?.map((skill) => skill.type === "skillReference" ? {
		type: "skill_reference",
		skill_id: (0,dist/* resolveProviderReference */.p5)({
			reference: skill.providerReference ?? {},
			provider: "openai"
		}),
		version: skill.version ?? "latest"
	} : {
		type: "inline",
		name: skill.name,
		description: skill.description,
		source: {
			type: "base64",
			media_type: skill.source.mediaType,
			data: skill.source.data
		}
	});
}
//#endregion
//#region src/responses/openai-responses-language-model.ts
/**
* Extracts a mapping from MCP approval request IDs to their corresponding tool call IDs
* from the prompt. When an MCP tool requires approval, we generate a tool call ID to track
* the pending approval in our system. When the user responds to the approval (and we
* continue the conversation), we need to map the approval request ID back to our tool call ID
* so that tool results reference the correct tool call.
*/
function extractApprovalRequestIdToToolCallIdMapping(prompt) {
	const mapping = {};
	for (const message of prompt) {
		if (message.role !== "assistant") continue;
		for (const part of message.content) {
			if (part.type !== "tool-call") continue;
			const approvalRequestId = part.providerOptions?.openai?.approvalRequestId;
			if (approvalRequestId != null) mapping[approvalRequestId] = part.toolCallId;
		}
	}
	return mapping;
}
function mapComputerAction(action) {
	switch (action.type) {
		case "click": return {
			type: "click",
			button: action.button,
			x: action.x,
			y: action.y,
			...action.keys != null && { keys: action.keys }
		};
		case "double_click": return {
			type: "double_click",
			x: action.x,
			y: action.y,
			...action.keys != null && { keys: action.keys }
		};
		case "drag": return {
			type: "drag",
			path: action.path,
			...action.keys != null && { keys: action.keys }
		};
		case "keypress": return action;
		case "move": return {
			type: "move",
			x: action.x,
			y: action.y,
			...action.keys != null && { keys: action.keys }
		};
		case "screenshot": return action;
		case "scroll": return {
			type: "scroll",
			x: action.x,
			y: action.y,
			scrollX: action.scroll_x,
			scrollY: action.scroll_y,
			...action.keys != null && { keys: action.keys }
		};
		case "type": return action;
		case "wait": return action;
	}
}
function mapComputerCallInput({ action, actions, pending_safety_checks, status }) {
	return {
		actions: (actions ?? (action != null ? [action] : [])).map(mapComputerAction),
		pendingSafetyChecks: pending_safety_checks?.map((safetyCheck) => ({
			id: safetyCheck.id,
			...safetyCheck.code != null && { code: safetyCheck.code },
			...safetyCheck.message != null && { message: safetyCheck.message }
		})) ?? [],
		status
	};
}
const openaiResponsesSupportedUrls = {
	"image/*": [/^https?:\/\/.*$/],
	"application/pdf": [/^https?:\/\/.*$/]
};
/**
* Enforces OpenAI's configuration update restrictions,
* returning a string describing the unsupported reason if any.
*
* @see https://developers.openai.com/api/docs/guides/reasoning#change-reasoning-mid-conversation
*/
function getConfigurationUpdateUnsupportedReason({ modelCapabilities, options }) {
	if (!modelCapabilities.configurationUpdates) return "Configuration updates are only supported by GPT-6 and later models";
	if (options?.reasoningMode === "pro" || options?.contextManagement != null || options?.truncation === "auto") return "Configuration updates require standard reasoning mode without automatic compaction or automatic truncation";
}
var OpenAIResponsesLanguageModel = class OpenAIResponsesLanguageModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAIResponsesLanguageModel(options.modelId, prepareOpenAIConfigForWorkflowDeserialize(options.config));
	}
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.supportedUrls = openaiResponsesSupportedUrls;
		this.modelId = modelId;
		this.config = config;
	}
	get provider() {
		return this.config.provider;
	}
	static async prepareRequest({ modelId, config, options: { maxOutputTokens, temperature, stopSequences, topP, topK, presencePenalty, frequencyPenalty, seed, prompt, reasoning, providerOptions, tools, toolChoice, responseFormat } }) {
		const warnings = [];
		const { capabilities: { language: modelCapabilities }, requestConfig: { language: modelRequestConfig } } = getOpenAILanguageModelEntry(modelId);
		if (topK != null) warnings.push({
			type: "unsupported",
			feature: "topK"
		});
		if (seed != null) warnings.push({
			type: "unsupported",
			feature: "seed"
		});
		if (presencePenalty != null) warnings.push({
			type: "unsupported",
			feature: "presencePenalty"
		});
		if (frequencyPenalty != null) warnings.push({
			type: "unsupported",
			feature: "frequencyPenalty"
		});
		if (stopSequences != null) warnings.push({
			type: "unsupported",
			feature: "stopSequences"
		});
		const providerOptionsName = config.provider.includes("azure") ? "azure" : "openai";
		const { options: openaiOptions } = await (0,dist/* resolveProviderOptions */.Wo)({
			providerOptions,
			namespaces: [providerOptionsName, "openai"],
			resolution: "first",
			schema: openaiLanguageModelResponsesOptionsSchema
		});
		const resolvedReasoningEffort = resolveOpenAIReasoningEffort({
			providerReasoningEffort: openaiOptions?.reasoningEffort,
			reasoning,
			supportedReasoningEfforts: modelCapabilities.reasoning.efforts,
			warnings
		});
		const resolvedReasoningSummary = openaiOptions?.reasoningSummary !== void 0 ? openaiOptions.reasoningSummary : resolvedReasoningEffort != null && resolvedReasoningEffort !== "none" ? "detailed" : void 0;
		const isReasoningModel = openaiOptions?.forceReasoning ?? modelCapabilities.reasoning.support === true;
		if (openaiOptions?.conversation && openaiOptions?.previousResponseId) warnings.push({
			type: "unsupported",
			feature: "conversation",
			details: "conversation and previousResponseId cannot be used together"
		});
		const toolNameMapping = (0,dist/* createToolNameMapping */.CR)({
			tools,
			providerToolNames: {
				"openai.code_interpreter": "code_interpreter",
				"openai.computer": "computer",
				"openai.file_search": "file_search",
				"openai.image_generation": "image_generation",
				"openai.local_shell": "local_shell",
				"openai.shell": "shell",
				"openai.web_search": "web_search",
				"openai.web_search_preview": "web_search_preview",
				"openai.mcp": "mcp",
				"openai.apply_patch": "apply_patch",
				"openai.tool_search": "tool_search",
				"openai.programmatic_tool_calling": "programmatic_tool_calling"
			}
		});
		const customProviderToolNames = /* @__PURE__ */ new Set();
		const outputSchemaToolNames = /* @__PURE__ */ new Set();
		const { tools: openaiTools, toolChoice: openaiToolChoice, toolWarnings } = await prepareResponsesTools({
			tools,
			toolChoice,
			allowedTools: openaiOptions?.allowedTools ?? void 0,
			toolNameMapping,
			customProviderToolNames,
			outputSchemaToolNames,
			supportsAsyncToolCalling: modelCapabilities.tools.async,
			providerOptionsName
		});
		const additionalToolResolutions = /* @__PURE__ */ new Map();
		const allowedToolNames = openaiOptions?.allowedTools != null ? new Set(openaiOptions.allowedTools.toolNames.map((name) => toolNameMapping.toProviderToolName(name))) : void 0;
		const findAdditionalToolForRequest = ({ type, name }) => {
			const key = `${type}:${name}`;
			let resolution = additionalToolResolutions.get(key);
			if (resolution == null) {
				resolution = findAdditionalToolDefinition({
					tools,
					providerOptionsName,
					additionalTool: {
						type,
						name
					},
					allowedToolNames
				});
				additionalToolResolutions.set(key, resolution);
			}
			return resolution;
		};
		const configurationUpdateUnsupportedReason = getConfigurationUpdateUnsupportedReason({
			modelCapabilities,
			options: openaiOptions
		});
		const { input, warnings: inputWarnings } = await convertToOpenAIResponsesInput({
			prompt,
			toolNameMapping,
			systemMessageMode: openaiOptions?.systemMessageMode ?? (isReasoningModel ? "developer" : modelRequestConfig.systemMessageMode),
			providerOptionsName,
			configurationUpdateUnsupportedReason,
			explicitMessageItemType: config.explicitMessageItemType,
			fileIdPrefixes: config.fileIdPrefixes,
			passThroughUnsupportedFiles: openaiOptions?.passThroughUnsupportedFiles ?? false,
			store: openaiOptions?.store ?? true,
			isReasoningModel,
			hasConversation: openaiOptions?.conversation != null,
			hasPreviousResponseId: openaiOptions?.previousResponseId != null,
			hasLocalShellTool: hasOpenAITool("openai.local_shell"),
			hasShellTool: hasOpenAITool("openai.shell"),
			hasApplyPatchTool: hasOpenAITool("openai.apply_patch"),
			hasComputerTool: hasOpenAITool("openai.computer"),
			toolSearchToolName: getOpenAIToolName("openai.tool_search"),
			customProviderToolNames: customProviderToolNames.size > 0 ? customProviderToolNames : void 0,
			outputSchemaToolNames: outputSchemaToolNames.size > 0 ? outputSchemaToolNames : void 0,
			findAdditionalToolDefinition: findAdditionalToolForRequest
		});
		warnings.push(...inputWarnings);
		const supportedReasoningEfforts = modelCapabilities.reasoning.efforts;
		const getUpdateEffortUnsupportedReason = (effort) => effort != null && supportedReasoningEfforts?.includes(effort) === false ? `${modelId} only supports the following reasoning efforts: ${supportedReasoningEfforts.join(", ")}` : void 0;
		for (const item of input) if (item.type === "configuration_update") {
			const unsupportedReason = getUpdateEffortUnsupportedReason(item.reasoning?.effort);
			if (unsupportedReason != null) throw new provider_dist/* UnsupportedFunctionalityError */.b8({
				functionality: "Message-level reasoningEffortUpdate",
				message: unsupportedReason
			});
		}
		const reasoningEffortUpdate = openaiOptions?.reasoningEffortUpdate;
		const requestUpdateUnsupportedReason = configurationUpdateUnsupportedReason ?? getUpdateEffortUnsupportedReason(reasoningEffortUpdate);
		if (reasoningEffortUpdate != null && requestUpdateUnsupportedReason != null) warnings.push({
			type: "unsupported",
			feature: "reasoningEffortUpdate",
			details: requestUpdateUnsupportedReason
		});
		else if (reasoningEffortUpdate != null) {
			const firstItem = input[0];
			if (firstItem?.type !== "configuration_update" || firstItem.reasoning?.effort !== reasoningEffortUpdate) input.unshift({
				type: "configuration_update",
				reasoning: { effort: reasoningEffortUpdate }
			});
		}
		for (let i = 1; i < input.length; i++) if (input[i - 1].type === "configuration_update" && input[i].type === "configuration_update") throw new provider_dist/* UnsupportedFunctionalityError */.b8({
			functionality: "Adjacent configuration updates",
			message: "Configuration updates cannot be consecutive. Set reasoningEffortUpdate and textFormatUpdate in the same empty system message, and omit request-level reasoningEffortUpdate when using message-level updates."
		});
		if (openaiOptions?.compactionTrigger) input.push({ type: "compaction_trigger" });
		const strictJsonSchema = openaiOptions?.strictJsonSchema ?? true;
		const normalizedResponseFormatSchema = openaiOptions?.textFormat == null && responseFormat?.type === "json" && responseFormat.schema != null ? normalizeOpenAIJsonSchema(responseFormat.schema) : void 0;
		if (normalizedResponseFormatSchema != null) warnings.push(...normalizedResponseFormatSchema.warnings);
		const requestTextFormat = openaiOptions?.textFormat != null ? normalizeOpenAIResponsesTextFormat(openaiOptions.textFormat, warnings) : void 0;
		let include = openaiOptions?.include;
		function addInclude(key) {
			if (include == null) include = [key];
			else if (!include.includes(key)) include = [...include, key];
		}
		function getOpenAIToolName(id) {
			return tools?.find((tool) => tool.type === "provider" && tool.id === id)?.name;
		}
		function hasOpenAITool(id) {
			return getOpenAIToolName(id) != null;
		}
		const topLogprobs = typeof openaiOptions?.logprobs === "number" ? openaiOptions?.logprobs : openaiOptions?.logprobs === true ? 20 : void 0;
		if (topLogprobs) addInclude("message.output_text.logprobs");
		const webSearchToolName = (tools?.find((tool) => tool.type === "provider" && (tool.id === "openai.web_search" || tool.id === "openai.web_search_preview")))?.name;
		if (webSearchToolName && config.supportsWebSearchSourcesInclude !== false && openaiOptions?.includeWebSearchSources !== false) addInclude("web_search_call.action.sources");
		if (hasOpenAITool("openai.code_interpreter")) addInclude("code_interpreter_call.outputs");
		const store = openaiOptions?.store;
		if (store === false && isReasoningModel) addInclude("reasoning.encrypted_content");
		const baseArgs = {
			model: config.requestModelId ?? modelId,
			input,
			temperature,
			top_p: topP,
			max_output_tokens: maxOutputTokens,
			...(responseFormat?.type === "json" || requestTextFormat != null || openaiOptions?.textVerbosity) && { text: {
				...requestTextFormat != null ? { format: requestTextFormat } : responseFormat?.type === "json" && { format: normalizedResponseFormatSchema != null ? {
					type: "json_schema",
					strict: strictJsonSchema,
					name: responseFormat.name ?? "response",
					description: responseFormat.description,
					schema: normalizedResponseFormatSchema.schema
				} : { type: "json_object" } },
				...openaiOptions?.textVerbosity && { verbosity: openaiOptions.textVerbosity }
			} },
			conversation: openaiOptions?.conversation,
			max_tool_calls: openaiOptions?.maxToolCalls,
			metadata: openaiOptions?.metadata,
			parallel_tool_calls: openaiOptions?.parallelToolCalls,
			previous_response_id: openaiOptions?.previousResponseId,
			store,
			user: openaiOptions?.user,
			instructions: openaiOptions?.instructions,
			service_tier: openaiOptions?.serviceTier,
			include,
			prompt_cache_key: openaiOptions?.promptCacheKey,
			prompt_cache_options: openaiOptions?.promptCacheOptions && {
				mode: openaiOptions.promptCacheOptions.mode,
				ttl: openaiOptions.promptCacheOptions.ttl,
				prewarm: openaiOptions.promptCacheOptions.prewarm,
				comparison_response_id: openaiOptions.promptCacheOptions.comparisonResponseId
			},
			prompt_cache_retention: openaiOptions?.promptCacheRetention,
			safety_identifier: openaiOptions?.safetyIdentifier,
			top_logprobs: topLogprobs,
			truncation: openaiOptions?.truncation,
			...openaiOptions?.contextManagement && { context_management: openaiOptions.contextManagement.map((cm) => ({
				type: cm.type,
				compact_threshold: cm.compactThreshold
			})) },
			...isReasoningModel && (resolvedReasoningEffort != null || resolvedReasoningSummary != null || openaiOptions?.reasoningMode != null || openaiOptions?.reasoningContext != null) && { reasoning: {
				...resolvedReasoningEffort != null && { effort: resolvedReasoningEffort },
				...resolvedReasoningSummary != null && { summary: resolvedReasoningSummary },
				...openaiOptions?.reasoningMode != null && { mode: openaiOptions.reasoningMode },
				...openaiOptions?.reasoningContext != null && { context: openaiOptions.reasoningContext }
			} }
		};
		if (!modelCapabilities.promptCache.retention && baseArgs.prompt_cache_retention != null) {
			baseArgs.prompt_cache_retention = void 0;
			warnings.push({
				type: "unsupported",
				feature: "promptCacheRetention",
				details: "promptCacheRetention is not supported by GPT-6 and later models; use promptCacheOptions instead"
			});
		}
		if (isReasoningModel) {
			let effectiveReasoningEffort = resolvedReasoningEffort;
			for (const item of input) if (item.type === "configuration_update") effectiveReasoningEffort = item.reasoning?.effort ?? effectiveReasoningEffort;
			if (!(effectiveReasoningEffort === "none" && modelCapabilities.reasoning.sampling === "reasoning-effort-none")) {
				if (baseArgs.temperature != null) {
					baseArgs.temperature = void 0;
					warnings.push({
						type: "unsupported",
						feature: "temperature",
						details: "temperature is not supported for reasoning models"
					});
				}
				if (baseArgs.top_p != null) {
					baseArgs.top_p = void 0;
					warnings.push({
						type: "unsupported",
						feature: "topP",
						details: "topP is not supported for reasoning models"
					});
				}
				if (modelCapabilities.endpoints.responses.logprobsRequireNonReasoning && (baseArgs.top_logprobs != null || baseArgs.include?.includes("message.output_text.logprobs"))) {
					baseArgs.top_logprobs = void 0;
					const filteredInclude = baseArgs.include?.filter((value) => value !== "message.output_text.logprobs");
					baseArgs.include = filteredInclude != null && filteredInclude.length > 0 ? filteredInclude : void 0;
					warnings.push({
						type: "unsupported",
						feature: "logprobs",
						details: "logprobs is not supported for reasoning models"
					});
				}
			}
		} else {
			if (openaiOptions?.reasoningEffort != null) warnings.push({
				type: "unsupported",
				feature: "reasoningEffort",
				details: "reasoningEffort is not supported for non-reasoning models"
			});
			if (openaiOptions?.reasoningSummary != null) warnings.push({
				type: "unsupported",
				feature: "reasoningSummary",
				details: "reasoningSummary is not supported for non-reasoning models"
			});
			if (openaiOptions?.reasoningMode != null) warnings.push({
				type: "unsupported",
				feature: "reasoningMode",
				details: "reasoningMode is not supported for non-reasoning models"
			});
			if (openaiOptions?.reasoningContext != null) warnings.push({
				type: "unsupported",
				feature: "reasoningContext",
				details: "reasoningContext is not supported for non-reasoning models"
			});
		}
		if (openaiOptions?.serviceTier === "flex" && !modelCapabilities.serviceTiers.flex) {
			warnings.push({
				type: "unsupported",
				feature: "serviceTier",
				details: "flex processing is only available for o3, o4-mini, and gpt-5 models"
			});
			delete baseArgs.service_tier;
		}
		if ((openaiOptions?.serviceTier === "priority" || openaiOptions?.serviceTier === "fast") && !modelCapabilities.serviceTiers.priority) {
			warnings.push({
				type: "unsupported",
				feature: "serviceTier",
				details: "priority processing is only available for supported models (gpt-4, gpt-5, gpt-5-mini, o3, o4-mini) and requires Enterprise access. gpt-5-nano is not supported"
			});
			delete baseArgs.service_tier;
		}
		const shellToolEnvType = (tools?.find((tool) => tool.type === "provider" && tool.id === "openai.shell"))?.args?.environment?.type;
		const isShellProviderExecuted = shellToolEnvType === "containerAuto" || shellToolEnvType === "containerReference";
		return {
			webSearchToolName,
			args: withOpenAIResponseRedaction({
				...baseArgs,
				tools: openaiTools,
				tool_choice: openaiToolChoice
			}),
			warnings: [...warnings, ...toolWarnings],
			store,
			toolNameMapping,
			providerOptionsName,
			isShellProviderExecuted
		};
	}
	getArgs(options) {
		return OpenAIResponsesLanguageModel.prepareRequest({
			modelId: this.modelId,
			config: this.config,
			options
		});
	}
	async doGenerate(options) {
		const { args: body, warnings, webSearchToolName, toolNameMapping, providerOptionsName, isShellProviderExecuted } = await this.getArgs(options);
		const url = this.config.url({
			path: "/responses",
			modelId: this.config.requestModelId ?? this.modelId
		});
		const approvalRequestIdToDummyToolCallIdFromPrompt = extractApprovalRequestIdToToolCallIdMapping(options.prompt);
		const { responseHeaders, value: response, rawValue: rawResponse } = await (0,dist/* postJsonToApi */.GU)({
			url,
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiResponsesResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		if (response.error) throw new provider_dist/* APICallError */.hL({
			message: response.error.message,
			url,
			requestBodyValues: body,
			statusCode: 400,
			responseHeaders,
			responseBody: rawResponse,
			isRetryable: false
		});
		if (response.output == null) {
			const detail = response.incomplete_details?.reason;
			throw new provider_dist/* APICallError */.hL({
				message: detail ? `Responses API returned no output (${detail})` : "Responses API returned no output",
				url,
				requestBodyValues: body,
				statusCode: 500,
				responseHeaders,
				responseBody: rawResponse,
				isRetryable: false
			});
		}
		const content = [];
		const logprobs = [];
		const functionTools = options.tools?.filter((tool) => tool.type === "function") ?? [];
		const hasWebSearchActionSources = response.output.some((part) => part.type === "web_search_call" && part.action?.type === "search" && part.action.sources?.some((source) => source.type === "url"));
		const hasFileSearchResults = response.output.some((part) => part.type === "file_search_call" && (part.results?.length ?? 0) > 0);
		const retrievedFileIds = /* @__PURE__ */ new Set();
		let hasFunctionCall = false;
		const hostedToolSearchCallIds = [];
		let hasRefusal = false;
		let structuredOutputText;
		for (const part of response.output) switch (part.type) {
			case "reasoning":
				if (part.summary.length === 0) part.summary.push({
					type: "summary_text",
					text: ""
				});
				for (const summary of part.summary) content.push({
					type: "reasoning",
					text: summary.text,
					providerMetadata: { [providerOptionsName]: {
						itemId: part.id,
						reasoningEncryptedContent: part.encrypted_content ?? null
					} }
				});
				break;
			case "image_generation_call":
				content.push({
					type: "tool-call",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName("image_generation"),
					input: "{}",
					providerExecuted: true
				});
				content.push({
					type: "tool-result",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName("image_generation"),
					result: { result: part.result }
				});
				break;
			case "tool_search_call": {
				const toolCallId = part.call_id ?? part.id;
				const isHosted = part.execution === "server";
				if (isHosted) hostedToolSearchCallIds.push(toolCallId);
				content.push({
					type: "tool-call",
					toolCallId,
					toolName: toolNameMapping.toCustomToolName("tool_search"),
					input: JSON.stringify({
						arguments: part.arguments,
						call_id: part.call_id
					}),
					...isHosted ? { providerExecuted: true } : {},
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			}
			case "tool_search_output": {
				const toolCallId = part.call_id ?? hostedToolSearchCallIds.shift() ?? part.id;
				content.push({
					type: "tool-result",
					toolCallId,
					toolName: toolNameMapping.toCustomToolName("tool_search"),
					result: { tools: part.tools },
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			}
			case "local_shell_call":
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName: toolNameMapping.toCustomToolName("local_shell"),
					input: JSON.stringify({ action: part.action }),
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			case "shell_call":
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName: toolNameMapping.toCustomToolName("shell"),
					input: JSON.stringify({ action: {
						commands: part.action.commands,
						timeoutMs: part.action.timeout_ms ?? void 0,
						maxOutputLength: part.action.max_output_length ?? void 0
					} }),
					...isShellProviderExecuted && { providerExecuted: true },
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			case "shell_call_output":
				content.push({
					type: "tool-result",
					toolCallId: part.call_id,
					toolName: toolNameMapping.toCustomToolName("shell"),
					result: {
						...part.max_output_length != null && { maxOutputLength: part.max_output_length },
						output: part.output.map((item) => ({
							stdout: item.stdout,
							stderr: item.stderr,
							outcome: item.outcome.type === "exit" ? {
								type: "exit",
								exitCode: item.outcome.exit_code
							} : { type: "timeout" }
						}))
					}
				});
				break;
			case "message":
				if (options.responseFormat?.type === "json" && part.phase === "final_answer") structuredOutputText = part.content.map((contentPart) => contentPart.type === "output_text" ? contentPart.text : contentPart.refusal).join("");
				for (const contentPart of part.content) {
					if (contentPart.type === "refusal") {
						hasRefusal = true;
						content.push({
							type: "text",
							text: contentPart.refusal,
							providerMetadata: { [providerOptionsName]: {
								itemId: part.id,
								...part.phase != null && { phase: part.phase }
							} }
						});
						continue;
					}
					if (options.providerOptions?.[providerOptionsName]?.logprobs && contentPart.logprobs) logprobs.push(contentPart.logprobs);
					const providerMetadata = {
						itemId: part.id,
						...part.phase != null && { phase: part.phase },
						...contentPart.annotations.length > 0 && { annotations: contentPart.annotations }
					};
					content.push({
						type: "text",
						text: contentPart.text,
						...contentPart.annotations.some((annotation) => annotation.type !== "file_path") && { citations: mapOpenAIResponsesCitations(contentPart.annotations, providerOptionsName) },
						providerMetadata: { [providerOptionsName]: providerMetadata }
					});
					for (const annotation of contentPart.annotations) {
						if (annotation.type === "url_citation" && hasWebSearchActionSources || annotation.type === "file_citation" && hasFileSearchResults) continue;
						content.push(mapOpenAIResponsesAnnotationSource(annotation, providerOptionsName, this.config.generateId?.() ?? (0,dist/* generateId */.$C)()));
					}
				}
				break;
			case "function_call": {
				hasFunctionCall = true;
				const expandedToolCalls = await expandParallelToolCall({
					toolCall: {
						toolCallId: part.call_id,
						toolName: part.name,
						input: part.arguments
					},
					tools: functionTools,
					providerOptionsName,
					itemId: part.id
				});
				if (expandedToolCalls != null) {
					content.push(...expandedToolCalls);
					break;
				}
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName: part.name,
					input: part.arguments,
					providerMetadata: { [providerOptionsName]: {
						itemId: part.id,
						...part.async != null && { async: part.async },
						...part.namespace != null && { namespace: part.namespace },
						...part.caller != null && { caller: part.caller.type === "program" ? {
							type: "program",
							callerId: part.caller.caller_id
						} : part.caller }
					} }
				});
				break;
			}
			case "program":
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName: toolNameMapping.toCustomToolName("programmatic_tool_calling"),
					input: JSON.stringify({
						code: part.code,
						fingerprint: part.fingerprint
					}),
					providerExecuted: true,
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			case "program_output":
				content.push({
					type: "tool-result",
					toolCallId: part.call_id,
					toolName: toolNameMapping.toCustomToolName("programmatic_tool_calling"),
					result: {
						result: part.result,
						status: part.status
					},
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			case "custom_tool_call": {
				hasFunctionCall = true;
				const toolName = toolNameMapping.toCustomToolName(part.name);
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName,
					input: JSON.stringify(part.input),
					providerMetadata: { [providerOptionsName]: {
						itemId: part.id,
						...part.async != null && { async: part.async }
					} }
				});
				break;
			}
			case "web_search_call":
				content.push({
					type: "tool-call",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName(webSearchToolName ?? "web_search"),
					input: JSON.stringify({}),
					providerExecuted: true
				});
				content.push({
					type: "tool-result",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName(webSearchToolName ?? "web_search"),
					...mapWebSearchResult(part)
				});
				if (part.action?.type === "search") {
					for (const source of part.action.sources ?? []) if (source.type === "url") content.push({
						type: "source",
						sourceType: "url",
						id: this.config.generateId?.() ?? (0,dist/* generateId */.$C)(),
						url: source.url
					});
				}
				break;
			case "mcp_call": {
				const toolCallId = part.approval_request_id != null ? approvalRequestIdToDummyToolCallIdFromPrompt[part.approval_request_id] ?? part.id : part.id;
				const toolName = `mcp.${part.name}`;
				content.push({
					type: "tool-call",
					toolCallId,
					toolName,
					input: part.arguments,
					providerExecuted: true,
					dynamic: true
				});
				content.push({
					type: "tool-result",
					toolCallId,
					toolName,
					result: {
						type: "call",
						serverLabel: part.server_label,
						name: part.name,
						arguments: part.arguments,
						...part.output != null ? { output: part.output } : {},
						...part.error != null ? { error: part.error } : {}
					},
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			}
			case "mcp_list_tools": break;
			case "mcp_approval_request": {
				const approvalRequestId = part.approval_request_id ?? part.id;
				const dummyToolCallId = this.config.generateId?.() ?? (0,dist/* generateId */.$C)();
				const toolName = `mcp.${part.name}`;
				content.push({
					type: "tool-call",
					toolCallId: dummyToolCallId,
					toolName,
					input: part.arguments,
					providerExecuted: true,
					dynamic: true
				});
				content.push({
					type: "tool-approval-request",
					approvalId: approvalRequestId,
					toolCallId: dummyToolCallId
				});
				break;
			}
			case "computer_call": {
				if (part.call_id == null) {
					content.push({
						type: "tool-call",
						toolCallId: part.id,
						toolName: toolNameMapping.toCustomToolName("computer_use"),
						input: "",
						providerExecuted: true
					});
					content.push({
						type: "tool-result",
						toolCallId: part.id,
						toolName: toolNameMapping.toCustomToolName("computer_use"),
						result: {
							type: "computer_use_tool_result",
							status: part.status
						}
					});
					break;
				}
				hasFunctionCall = true;
				const toolName = toolNameMapping.toCustomToolName("computer");
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName,
					input: JSON.stringify(mapComputerCallInput(part)),
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			}
			case "file_search_call":
				content.push({
					type: "tool-call",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName("file_search"),
					input: "{}",
					providerExecuted: true
				});
				content.push({
					type: "tool-result",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName("file_search"),
					result: {
						queries: part.queries,
						results: part.results?.map((result) => ({
							attributes: result.attributes,
							fileId: result.file_id,
							filename: result.filename,
							score: result.score,
							text: result.text
						})) ?? null
					}
				});
				for (const result of part.results ?? []) {
					if (retrievedFileIds.has(result.file_id)) continue;
					retrievedFileIds.add(result.file_id);
					content.push({
						type: "source",
						sourceType: "document",
						id: this.config.generateId?.() ?? (0,dist/* generateId */.$C)(),
						mediaType: "text/plain",
						title: result.filename,
						filename: result.filename,
						providerMetadata: { [providerOptionsName]: {
							type: "file_search",
							fileId: result.file_id
						} }
					});
				}
				break;
			case "code_interpreter_call":
				content.push({
					type: "tool-call",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName("code_interpreter"),
					input: JSON.stringify({
						code: part.code,
						containerId: part.container_id
					}),
					providerExecuted: true
				});
				content.push({
					type: "tool-result",
					toolCallId: part.id,
					toolName: toolNameMapping.toCustomToolName("code_interpreter"),
					result: { outputs: part.outputs }
				});
				break;
			case "apply_patch_call":
				hasFunctionCall = true;
				content.push({
					type: "tool-call",
					toolCallId: part.call_id,
					toolName: toolNameMapping.toCustomToolName("apply_patch"),
					input: JSON.stringify({
						callId: part.call_id,
						operation: part.operation
					}),
					providerMetadata: { [providerOptionsName]: { itemId: part.id } }
				});
				break;
			case "compaction": content.push({
				type: "custom",
				kind: "openai.compaction",
				providerMetadata: { [providerOptionsName]: {
					type: "compaction",
					itemId: part.id,
					encryptedContent: part.encrypted_content
				} }
			});
		}
		const providerMetadata = { [providerOptionsName]: {
			responseId: response.id,
			...logprobs.length > 0 ? { logprobs } : {},
			...typeof response.service_tier === "string" ? { serviceTier: response.service_tier } : {},
			...response.reasoning?.context != null ? { reasoningContext: response.reasoning.context } : {},
			...response.prompt_cache_diagnostics != null ? { promptCacheDiagnostics: response.prompt_cache_diagnostics } : {},
			...response.input_transformations != null ? { inputTransformations: response.input_transformations } : {}
		} };
		const usage = response.usage;
		return {
			content,
			...structuredOutputText !== void 0 && { structuredOutputText },
			finishReason: {
				unified: mapOpenAIResponseFinishReason({
					finishReason: response.incomplete_details?.reason,
					hasFunctionCall,
					hasRefusal
				}),
				raw: response.incomplete_details?.reason ?? void 0
			},
			usage: convertOpenAIResponsesUsage(usage),
			request: { body },
			response: {
				id: response.id,
				timestamp: /* @__PURE__ */ new Date(response.created_at * 1e3),
				modelId: response.model,
				headers: responseHeaders,
				body: withOpenAIResponseRedaction(rawResponse)
			},
			providerMetadata,
			warnings
		};
	}
	async doStream(options) {
		const { args: body, warnings, webSearchToolName, toolNameMapping, store, providerOptionsName, isShellProviderExecuted } = await this.getArgs(options);
		const url = this.config.url({
			path: "/responses",
			modelId: this.config.requestModelId ?? this.modelId
		});
		const { responseHeaders, value: response } = await (0,dist/* postJsonToApi */.GU)({
			url,
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body: withOpenAIResponseRedaction({
				...body,
				stream: true
			}),
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createEventSourceResponseHandler */.Ds)(openaiResponsesChunkSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const checkedResponse = await throwIfOpenAIStreamErrorBeforeOutput({
			stream: response,
			getError: (chunk) => isErrorChunk(chunk) || isResponseFailedChunk(chunk) && chunk.response.error != null ? chunk : void 0,
			isOutputChunk: isResponseOutputChunk,
			isAcceptedChunk: isResponseInProgressChunk,
			url,
			requestBodyValues: body,
			responseHeaders
		});
		const self = this;
		const approvalRequestIdToDummyToolCallIdFromPrompt = extractApprovalRequestIdToToolCallIdMapping(options.prompt);
		const functionTools = options.tools?.filter((tool) => tool.type === "function") ?? [];
		const approvalRequestIdToDummyToolCallIdFromStream = /* @__PURE__ */ new Map();
		let finishReason = {
			unified: "interrupted",
			raw: void 0
		};
		let usage = void 0;
		const logprobs = [];
		let responseId = null;
		const ongoingToolCalls = {};
		let ongoingAnnotations = [];
		let hasWebSearchActionSources = false;
		let hasFileSearchResults = false;
		const retrievedFileIds = /* @__PURE__ */ new Set();
		const fallbackAnnotations = [];
		let activeMessagePhase;
		let hasFunctionCall = false;
		let hasRefusal = false;
		const activeReasoning = {};
		const activeOutputItemIds = {};
		const resolveOutputItemId = ({ itemId, outputIndex }) => outputIndex == null ? itemId : activeOutputItemIds[outputIndex] ?? itemId;
		let serviceTier;
		let reasoningContext;
		let promptCacheDiagnostics;
		let inputTransformations;
		const hostedToolSearchCallIds = [];
		let encounteredStreamError = false;
		return {
			stream: checkedResponse.pipeThrough(new TransformStream({
				start(controller) {
					controller.enqueue({
						type: "stream-start",
						warnings
					});
				},
				transform(chunk, controller) {
					if (options.includeRawChunks) controller.enqueue({
						type: "raw",
						rawValue: chunk.rawValue
					});
					if (!chunk.success) {
						const error = isOpenAIChatCompletionChunk(chunk.rawValue) ? createOpenAIResponsesChatCompletionsMismatchError({
							value: chunk.rawValue,
							cause: chunk.error,
							url,
							requestBodyValues: body,
							responseHeaders
						}) : chunk.error;
						encounteredStreamError = true;
						finishReason = {
							unified: "error",
							raw: void 0
						};
						controller.enqueue({
							type: "error",
							error
						});
						return;
					}
					const value = chunk.value;
					if (isResponseOutputItemAddedChunk(value)) {
						if (value.item.type === "function_call") {
							const suppressInputStreaming = isUndeclaredParallelToolCall({
								toolName: value.item.name,
								tools: functionTools
							});
							ongoingToolCalls[value.output_index] = {
								toolName: value.item.name,
								toolCallId: value.item.call_id,
								suppressInputStreaming,
								bufferedInputDeltas: suppressInputStreaming ? [] : void 0,
								async: value.item.async
							};
							if (!suppressInputStreaming) controller.enqueue({
								type: "tool-input-start",
								id: value.item.call_id,
								toolName: value.item.name
							});
						} else if (value.item.type === "custom_tool_call") {
							const toolName = toolNameMapping.toCustomToolName(value.item.name);
							ongoingToolCalls[value.output_index] = {
								toolName,
								toolCallId: value.item.call_id,
								async: value.item.async
							};
							controller.enqueue({
								type: "tool-input-start",
								id: value.item.call_id,
								toolName,
								inputEncoding: "text"
							});
						} else if (value.item.type === "web_search_call") {
							ongoingToolCalls[value.output_index] = {
								toolName: toolNameMapping.toCustomToolName(webSearchToolName ?? "web_search"),
								toolCallId: value.item.id
							};
							controller.enqueue({
								type: "tool-input-start",
								id: value.item.id,
								toolName: toolNameMapping.toCustomToolName(webSearchToolName ?? "web_search"),
								providerExecuted: true
							});
							controller.enqueue({
								type: "tool-input-end",
								id: value.item.id
							});
							controller.enqueue({
								type: "tool-call",
								toolCallId: value.item.id,
								toolName: toolNameMapping.toCustomToolName(webSearchToolName ?? "web_search"),
								input: JSON.stringify({}),
								providerExecuted: true
							});
						} else if (value.item.type === "computer_call") {
							const toolCallId = value.item.call_id ?? value.item.id;
							ongoingToolCalls[value.output_index] = {
								toolName: toolNameMapping.toCustomToolName("computer"),
								toolCallId
							};
							controller.enqueue({
								type: "tool-input-start",
								id: toolCallId,
								toolName: toolNameMapping.toCustomToolName("computer")
							});
						} else if (value.item.type === "code_interpreter_call") {
							ongoingToolCalls[value.output_index] = {
								toolName: toolNameMapping.toCustomToolName("code_interpreter"),
								toolCallId: value.item.id,
								codeInterpreter: { containerId: value.item.container_id }
							};
							controller.enqueue({
								type: "tool-input-start",
								id: value.item.id,
								toolName: toolNameMapping.toCustomToolName("code_interpreter"),
								providerExecuted: true
							});
							controller.enqueue({
								type: "tool-input-delta",
								id: value.item.id,
								delta: `{"containerId":"${value.item.container_id}","code":"`
							});
						} else if (value.item.type === "file_search_call") controller.enqueue({
							type: "tool-call",
							toolCallId: value.item.id,
							toolName: toolNameMapping.toCustomToolName("file_search"),
							input: "{}",
							providerExecuted: true
						});
						else if (value.item.type === "image_generation_call") controller.enqueue({
							type: "tool-call",
							toolCallId: value.item.id,
							toolName: toolNameMapping.toCustomToolName("image_generation"),
							input: "{}",
							providerExecuted: true
						});
						else if (value.item.type === "tool_search_call") {
							const toolCallId = value.item.id;
							const toolName = toolNameMapping.toCustomToolName("tool_search");
							const isHosted = value.item.execution === "server";
							ongoingToolCalls[value.output_index] = {
								toolName,
								toolCallId,
								toolSearchExecution: value.item.execution ?? "server"
							};
							if (isHosted) controller.enqueue({
								type: "tool-input-start",
								id: toolCallId,
								toolName,
								providerExecuted: true
							});
						} else if (value.item.type === "tool_search_output") {} else if (value.item.type === "mcp_call" || value.item.type === "mcp_list_tools" || value.item.type === "mcp_approval_request") {} else if (value.item.type === "apply_patch_call") {
							const { call_id: callId, operation } = value.item;
							ongoingToolCalls[value.output_index] = {
								toolName: toolNameMapping.toCustomToolName("apply_patch"),
								toolCallId: callId,
								applyPatch: {
									hasDiff: operation.type === "delete_file",
									endEmitted: operation.type === "delete_file"
								}
							};
							controller.enqueue({
								type: "tool-input-start",
								id: callId,
								toolName: toolNameMapping.toCustomToolName("apply_patch")
							});
							if (operation.type === "delete_file") {
								const inputString = JSON.stringify({
									callId,
									operation
								});
								controller.enqueue({
									type: "tool-input-delta",
									id: callId,
									delta: inputString
								});
								controller.enqueue({
									type: "tool-input-end",
									id: callId
								});
							} else controller.enqueue({
								type: "tool-input-delta",
								id: callId,
								delta: `{"callId":"${escapeJSONDelta(callId)}","operation":{"type":"${escapeJSONDelta(operation.type)}","path":"${escapeJSONDelta(operation.path)}","diff":"`
							});
						} else if (value.item.type === "shell_call") ongoingToolCalls[value.output_index] = {
							toolName: toolNameMapping.toCustomToolName("shell"),
							toolCallId: value.item.call_id
						};
						else if (value.item.type === "shell_call_output") {} else if (value.item.type === "message") {
							activeOutputItemIds[value.output_index] = value.item.id;
							ongoingAnnotations = [];
							activeMessagePhase = value.item.phase ?? void 0;
							controller.enqueue({
								type: "text-start",
								id: value.item.id,
								providerMetadata: { [providerOptionsName]: {
									itemId: value.item.id,
									...value.item.phase != null && { phase: value.item.phase }
								} }
							});
						} else if (isResponseOutputItemAddedChunk(value) && value.item.type === "reasoning") {
							activeOutputItemIds[value.output_index] = value.item.id;
							activeReasoning[value.item.id] = {
								encryptedContent: value.item.encrypted_content,
								summaryParts: { 0: "active" }
							};
							controller.enqueue({
								type: "reasoning-start",
								id: `${value.item.id}:0`,
								providerMetadata: { [providerOptionsName]: {
									itemId: value.item.id,
									reasoningEncryptedContent: value.item.encrypted_content ?? null
								} }
							});
						}
					} else if (isResponseOutputItemDoneChunk(value)) {
						if (value.item.type === "message") {
							const itemId = resolveOutputItemId({
								itemId: value.item.id,
								outputIndex: value.output_index
							});
							const phase = value.item.phase ?? activeMessagePhase;
							activeMessagePhase = void 0;
							controller.enqueue({
								type: "text-end",
								id: itemId,
								...ongoingAnnotations.some((annotation) => annotation.type !== "file_path") && { citations: mapOpenAIResponsesCitations(ongoingAnnotations, providerOptionsName) },
								providerMetadata: { [providerOptionsName]: {
									itemId,
									...phase != null && { phase },
									...ongoingAnnotations.length > 0 && { annotations: ongoingAnnotations }
								} }
							});
							activeOutputItemIds[value.output_index] = void 0;
						} else if (value.item.type === "function_call") {
							const item = value.item;
							const ongoingToolCall = ongoingToolCalls[value.output_index];
							ongoingToolCalls[value.output_index] = void 0;
							hasFunctionCall = true;
							const suppressInputStreaming = ongoingToolCall?.suppressInputStreaming ?? isUndeclaredParallelToolCall({
								toolName: item.name,
								tools: functionTools
							});
							const enqueueUnexpandedToolCall = () => {
								if (suppressInputStreaming) {
									controller.enqueue({
										type: "tool-input-start",
										id: item.call_id,
										toolName: item.name
									});
									const bufferedInputDeltas = ongoingToolCall?.bufferedInputDeltas ?? [];
									if (bufferedInputDeltas.length > 0) for (const delta of bufferedInputDeltas) controller.enqueue({
										type: "tool-input-delta",
										id: item.call_id,
										delta
									});
									else if (item.arguments.length > 0) controller.enqueue({
										type: "tool-input-delta",
										id: item.call_id,
										delta: item.arguments
									});
								}
								controller.enqueue({
									type: "tool-input-end",
									id: item.call_id,
									...item.namespace != null && { providerMetadata: { [providerOptionsName]: { namespace: item.namespace } } }
								});
								controller.enqueue({
									type: "tool-call",
									toolCallId: item.call_id,
									toolName: item.name,
									input: item.arguments,
									providerMetadata: { [providerOptionsName]: {
										itemId: item.id,
										...item.async != null ? { async: item.async } : ongoingToolCall?.async != null ? { async: ongoingToolCall.async } : {},
										...item.namespace != null && { namespace: item.namespace },
										...item.caller != null && { caller: item.caller.type === "program" ? {
											type: "program",
											callerId: item.caller.caller_id
										} : item.caller }
									} }
								});
							};
							if (!suppressInputStreaming) {
								enqueueUnexpandedToolCall();
								return;
							}
							return expandParallelToolCall({
								toolCall: {
									toolCallId: item.call_id,
									toolName: item.name,
									input: item.arguments
								},
								tools: functionTools,
								providerOptionsName,
								itemId: item.id
							}).then((expandedToolCalls) => {
								if (expandedToolCalls == null) {
									enqueueUnexpandedToolCall();
									return;
								}
								for (const toolCall of expandedToolCalls) {
									controller.enqueue({
										type: "tool-input-start",
										id: toolCall.toolCallId,
										toolName: toolCall.toolName
									});
									controller.enqueue({
										type: "tool-input-delta",
										id: toolCall.toolCallId,
										delta: toolCall.input
									});
									controller.enqueue({
										type: "tool-input-end",
										id: toolCall.toolCallId
									});
									controller.enqueue(toolCall);
								}
							});
						} else if (value.item.type === "program") controller.enqueue({
							type: "tool-call",
							toolCallId: value.item.call_id,
							toolName: toolNameMapping.toCustomToolName("programmatic_tool_calling"),
							input: JSON.stringify({
								code: value.item.code,
								fingerprint: value.item.fingerprint
							}),
							providerExecuted: true,
							providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
						});
						else if (value.item.type === "program_output") controller.enqueue({
							type: "tool-result",
							toolCallId: value.item.call_id,
							toolName: toolNameMapping.toCustomToolName("programmatic_tool_calling"),
							result: {
								result: value.item.result,
								status: value.item.status
							},
							providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
						});
						else if (value.item.type === "custom_tool_call") {
							const ongoingToolCall = ongoingToolCalls[value.output_index];
							ongoingToolCalls[value.output_index] = void 0;
							hasFunctionCall = true;
							const toolName = toolNameMapping.toCustomToolName(value.item.name);
							controller.enqueue({
								type: "tool-input-end",
								id: value.item.call_id
							});
							controller.enqueue({
								type: "tool-call",
								toolCallId: value.item.call_id,
								toolName,
								input: JSON.stringify(value.item.input),
								providerMetadata: { [providerOptionsName]: {
									itemId: value.item.id,
									...value.item.async != null ? { async: value.item.async } : ongoingToolCall?.async != null ? { async: ongoingToolCall.async } : {}
								} }
							});
						} else if (value.item.type === "web_search_call") {
							ongoingToolCalls[value.output_index] = void 0;
							controller.enqueue({
								type: "tool-result",
								toolCallId: value.item.id,
								toolName: toolNameMapping.toCustomToolName(webSearchToolName ?? "web_search"),
								...mapWebSearchResult(value.item)
							});
							if (value.item.action?.type === "search") {
								for (const source of value.item.action.sources ?? []) if (source.type === "url") {
									hasWebSearchActionSources = true;
									controller.enqueue({
										type: "source",
										sourceType: "url",
										id: self.config.generateId?.() ?? (0,dist/* generateId */.$C)(),
										url: source.url
									});
								}
							}
						} else if (value.item.type === "computer_call") {
							ongoingToolCalls[value.output_index] = void 0;
							if (value.item.call_id == null) {
								controller.enqueue({
									type: "tool-input-end",
									id: value.item.id
								});
								controller.enqueue({
									type: "tool-call",
									toolCallId: value.item.id,
									toolName: toolNameMapping.toCustomToolName("computer_use"),
									input: "",
									providerExecuted: true
								});
								controller.enqueue({
									type: "tool-result",
									toolCallId: value.item.id,
									toolName: toolNameMapping.toCustomToolName("computer_use"),
									result: {
										type: "computer_use_tool_result",
										status: value.item.status
									}
								});
								return;
							}
							hasFunctionCall = true;
							const toolName = toolNameMapping.toCustomToolName("computer");
							const input = JSON.stringify(mapComputerCallInput(value.item));
							controller.enqueue({
								type: "tool-input-delta",
								id: value.item.call_id,
								delta: input
							});
							controller.enqueue({
								type: "tool-input-end",
								id: value.item.call_id
							});
							controller.enqueue({
								type: "tool-call",
								toolCallId: value.item.call_id,
								toolName,
								input,
								providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
							});
						} else if (value.item.type === "file_search_call") {
							ongoingToolCalls[value.output_index] = void 0;
							controller.enqueue({
								type: "tool-result",
								toolCallId: value.item.id,
								toolName: toolNameMapping.toCustomToolName("file_search"),
								result: {
									queries: value.item.queries,
									results: value.item.results?.map((result) => ({
										attributes: result.attributes,
										fileId: result.file_id,
										filename: result.filename,
										score: result.score,
										text: result.text
									})) ?? null
								}
							});
							for (const result of value.item.results ?? []) {
								hasFileSearchResults = true;
								if (retrievedFileIds.has(result.file_id)) continue;
								retrievedFileIds.add(result.file_id);
								controller.enqueue({
									type: "source",
									sourceType: "document",
									id: self.config.generateId?.() ?? (0,dist/* generateId */.$C)(),
									mediaType: "text/plain",
									title: result.filename,
									filename: result.filename,
									providerMetadata: { [providerOptionsName]: {
										type: "file_search",
										fileId: result.file_id
									} }
								});
							}
						} else if (value.item.type === "code_interpreter_call") {
							ongoingToolCalls[value.output_index] = void 0;
							controller.enqueue({
								type: "tool-result",
								toolCallId: value.item.id,
								toolName: toolNameMapping.toCustomToolName("code_interpreter"),
								result: { outputs: value.item.outputs }
							});
						} else if (value.item.type === "image_generation_call") controller.enqueue({
							type: "tool-result",
							toolCallId: value.item.id,
							toolName: toolNameMapping.toCustomToolName("image_generation"),
							result: { result: value.item.result }
						});
						else if (value.item.type === "tool_search_call") {
							const toolCall = ongoingToolCalls[value.output_index];
							const isHosted = value.item.execution === "server";
							if (toolCall != null) {
								const toolCallId = isHosted ? toolCall.toolCallId : value.item.call_id ?? value.item.id;
								if (isHosted) hostedToolSearchCallIds.push(toolCallId);
								else controller.enqueue({
									type: "tool-input-start",
									id: toolCallId,
									toolName: toolCall.toolName
								});
								controller.enqueue({
									type: "tool-input-end",
									id: toolCallId
								});
								controller.enqueue({
									type: "tool-call",
									toolCallId,
									toolName: toolCall.toolName,
									input: JSON.stringify({
										arguments: value.item.arguments,
										call_id: isHosted ? null : toolCallId
									}),
									...isHosted ? { providerExecuted: true } : {},
									providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
								});
							}
							ongoingToolCalls[value.output_index] = void 0;
						} else if (value.item.type === "tool_search_output") {
							const toolCallId = value.item.call_id ?? hostedToolSearchCallIds.shift() ?? value.item.id;
							controller.enqueue({
								type: "tool-result",
								toolCallId,
								toolName: toolNameMapping.toCustomToolName("tool_search"),
								result: { tools: value.item.tools },
								providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
							});
						} else if (value.item.type === "mcp_call") {
							ongoingToolCalls[value.output_index] = void 0;
							const approvalRequestId = value.item.approval_request_id ?? void 0;
							const aliasedToolCallId = approvalRequestId != null ? approvalRequestIdToDummyToolCallIdFromStream.get(approvalRequestId) ?? approvalRequestIdToDummyToolCallIdFromPrompt[approvalRequestId] ?? value.item.id : value.item.id;
							const toolName = `mcp.${value.item.name}`;
							controller.enqueue({
								type: "tool-call",
								toolCallId: aliasedToolCallId,
								toolName,
								input: value.item.arguments,
								providerExecuted: true,
								dynamic: true
							});
							controller.enqueue({
								type: "tool-result",
								toolCallId: aliasedToolCallId,
								toolName,
								result: {
									type: "call",
									serverLabel: value.item.server_label,
									name: value.item.name,
									arguments: value.item.arguments,
									...value.item.output != null ? { output: value.item.output } : {},
									...value.item.error != null ? { error: value.item.error } : {}
								},
								providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
							});
						} else if (value.item.type === "mcp_list_tools") ongoingToolCalls[value.output_index] = void 0;
						else if (value.item.type === "apply_patch_call") {
							const toolCall = ongoingToolCalls[value.output_index];
							if (toolCall?.applyPatch && !toolCall.applyPatch.endEmitted && value.item.operation.type !== "delete_file") {
								if (!toolCall.applyPatch.hasDiff) controller.enqueue({
									type: "tool-input-delta",
									id: toolCall.toolCallId,
									delta: escapeJSONDelta(value.item.operation.diff)
								});
								controller.enqueue({
									type: "tool-input-delta",
									id: toolCall.toolCallId,
									delta: "\"}}"
								});
								controller.enqueue({
									type: "tool-input-end",
									id: toolCall.toolCallId
								});
								toolCall.applyPatch.endEmitted = true;
							}
							if (toolCall && value.item.status === "completed") {
								hasFunctionCall = true;
								controller.enqueue({
									type: "tool-call",
									toolCallId: toolCall.toolCallId,
									toolName: toolNameMapping.toCustomToolName("apply_patch"),
									input: JSON.stringify({
										callId: value.item.call_id,
										operation: value.item.operation
									}),
									providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
								});
							}
							ongoingToolCalls[value.output_index] = void 0;
						} else if (value.item.type === "mcp_approval_request") {
							ongoingToolCalls[value.output_index] = void 0;
							const dummyToolCallId = self.config.generateId?.() ?? (0,dist/* generateId */.$C)();
							const approvalRequestId = value.item.approval_request_id ?? value.item.id;
							approvalRequestIdToDummyToolCallIdFromStream.set(approvalRequestId, dummyToolCallId);
							const toolName = `mcp.${value.item.name}`;
							controller.enqueue({
								type: "tool-call",
								toolCallId: dummyToolCallId,
								toolName,
								input: value.item.arguments,
								providerExecuted: true,
								dynamic: true
							});
							controller.enqueue({
								type: "tool-approval-request",
								approvalId: approvalRequestId,
								toolCallId: dummyToolCallId
							});
						} else if (value.item.type === "local_shell_call") {
							ongoingToolCalls[value.output_index] = void 0;
							controller.enqueue({
								type: "tool-call",
								toolCallId: value.item.call_id,
								toolName: toolNameMapping.toCustomToolName("local_shell"),
								input: JSON.stringify({ action: {
									type: "exec",
									command: value.item.action.command,
									timeoutMs: value.item.action.timeout_ms,
									user: value.item.action.user,
									workingDirectory: value.item.action.working_directory,
									env: value.item.action.env
								} }),
								providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
							});
						} else if (value.item.type === "shell_call") {
							ongoingToolCalls[value.output_index] = void 0;
							controller.enqueue({
								type: "tool-call",
								toolCallId: value.item.call_id,
								toolName: toolNameMapping.toCustomToolName("shell"),
								input: JSON.stringify({ action: {
									commands: value.item.action.commands,
									timeoutMs: value.item.action.timeout_ms ?? void 0,
									maxOutputLength: value.item.action.max_output_length ?? void 0
								} }),
								...isShellProviderExecuted && { providerExecuted: true },
								providerMetadata: { [providerOptionsName]: { itemId: value.item.id } }
							});
						} else if (value.item.type === "shell_call_output") controller.enqueue({
							type: "tool-result",
							toolCallId: value.item.call_id,
							toolName: toolNameMapping.toCustomToolName("shell"),
							result: {
								...value.item.max_output_length != null && { maxOutputLength: value.item.max_output_length },
								output: value.item.output.map((item) => ({
									stdout: item.stdout,
									stderr: item.stderr,
									outcome: item.outcome.type === "exit" ? {
										type: "exit",
										exitCode: item.outcome.exit_code
									} : { type: "timeout" }
								}))
							}
						});
						else if (value.item.type === "reasoning") {
							const itemId = resolveOutputItemId({
								itemId: value.item.id,
								outputIndex: value.output_index
							});
							const activeReasoningPart = activeReasoning[itemId];
							if (activeReasoningPart != null) {
								const summaryPartIndices = Object.entries(activeReasoningPart.summaryParts).filter(([_, status]) => status === "active" || status === "can-conclude").map(([summaryIndex]) => summaryIndex);
								for (const summaryIndex of summaryPartIndices) controller.enqueue({
									type: "reasoning-end",
									id: `${itemId}:${summaryIndex}`,
									providerMetadata: { [providerOptionsName]: {
										itemId,
										reasoningEncryptedContent: value.item.encrypted_content ?? null
									} }
								});
								delete activeReasoning[itemId];
							}
							activeOutputItemIds[value.output_index] = void 0;
						} else if (value.item.type === "compaction") controller.enqueue({
							type: "custom",
							kind: "openai.compaction",
							providerMetadata: { [providerOptionsName]: {
								type: "compaction",
								itemId: value.item.id,
								encryptedContent: value.item.encrypted_content
							} }
						});
					} else if (isResponseFunctionCallArgumentsDeltaChunk(value)) {
						const toolCall = ongoingToolCalls[value.output_index];
						if (toolCall != null) {
							if (toolCall.suppressInputStreaming) toolCall.bufferedInputDeltas?.push(value.delta);
							else controller.enqueue({
								type: "tool-input-delta",
								id: toolCall.toolCallId,
								delta: value.delta
							});
						}
					} else if (isResponseCustomToolCallInputDeltaChunk(value)) {
						const toolCall = ongoingToolCalls[value.output_index];
						if (toolCall != null) controller.enqueue({
							type: "tool-input-delta",
							id: toolCall.toolCallId,
							delta: value.delta
						});
					} else if (isResponseApplyPatchCallOperationDiffDeltaChunk(value)) {
						const toolCall = ongoingToolCalls[value.output_index];
						if (toolCall?.applyPatch) {
							controller.enqueue({
								type: "tool-input-delta",
								id: toolCall.toolCallId,
								delta: escapeJSONDelta(value.delta)
							});
							toolCall.applyPatch.hasDiff = true;
						}
					} else if (isResponseApplyPatchCallOperationDiffDoneChunk(value)) {
						const toolCall = ongoingToolCalls[value.output_index];
						if (toolCall?.applyPatch && !toolCall.applyPatch.endEmitted) {
							if (!toolCall.applyPatch.hasDiff) {
								controller.enqueue({
									type: "tool-input-delta",
									id: toolCall.toolCallId,
									delta: escapeJSONDelta(value.diff)
								});
								toolCall.applyPatch.hasDiff = true;
							}
							controller.enqueue({
								type: "tool-input-delta",
								id: toolCall.toolCallId,
								delta: "\"}}"
							});
							controller.enqueue({
								type: "tool-input-end",
								id: toolCall.toolCallId
							});
							toolCall.applyPatch.endEmitted = true;
						}
					} else if (isResponseImageGenerationCallPartialImageChunk(value)) controller.enqueue({
						type: "tool-result",
						toolCallId: value.item_id,
						toolName: toolNameMapping.toCustomToolName("image_generation"),
						result: { result: value.partial_image_b64 },
						preliminary: true
					});
					else if (isResponseCodeInterpreterCallCodeDeltaChunk(value)) {
						const toolCall = ongoingToolCalls[value.output_index];
						if (toolCall != null) controller.enqueue({
							type: "tool-input-delta",
							id: toolCall.toolCallId,
							delta: escapeJSONDelta(value.delta)
						});
					} else if (isResponseCodeInterpreterCallCodeDoneChunk(value)) {
						const toolCall = ongoingToolCalls[value.output_index];
						if (toolCall != null) {
							controller.enqueue({
								type: "tool-input-delta",
								id: toolCall.toolCallId,
								delta: "\"}"
							});
							controller.enqueue({
								type: "tool-input-end",
								id: toolCall.toolCallId
							});
							controller.enqueue({
								type: "tool-call",
								toolCallId: toolCall.toolCallId,
								toolName: toolNameMapping.toCustomToolName("code_interpreter"),
								input: JSON.stringify({
									code: value.code,
									containerId: toolCall.codeInterpreter.containerId
								}),
								providerExecuted: true
							});
						}
					} else if (isResponseCreatedChunk(value)) {
						responseId = value.response.id;
						controller.enqueue({
							type: "response-metadata",
							id: value.response.id,
							timestamp: /* @__PURE__ */ new Date(value.response.created_at * 1e3),
							modelId: value.response.model
						});
					} else if (isTextDeltaChunk(value)) {
						const itemId = resolveOutputItemId({
							itemId: value.item_id,
							outputIndex: value.output_index
						});
						controller.enqueue({
							type: "text-delta",
							id: itemId,
							delta: value.delta
						});
						if (options.providerOptions?.[providerOptionsName]?.logprobs && value.logprobs) logprobs.push(value.logprobs);
					} else if (isRefusalDeltaChunk(value)) {
						hasRefusal = true;
						const itemId = resolveOutputItemId({
							itemId: value.item_id,
							outputIndex: value.output_index
						});
						controller.enqueue({
							type: "text-delta",
							id: itemId,
							delta: value.delta
						});
					} else if (isRefusalDoneChunk(value)) hasRefusal = true;
					else if (value.type === "response.reasoning_summary_part.added") {
						const itemId = resolveOutputItemId({
							itemId: value.item_id,
							outputIndex: value.output_index
						});
						if (value.summary_index > 0) {
							const activeReasoningPart = activeReasoning[itemId];
							if (activeReasoningPart != null) {
								activeReasoningPart.summaryParts[value.summary_index] = "active";
								for (const summaryIndex of Object.keys(activeReasoningPart.summaryParts)) if (activeReasoningPart.summaryParts[summaryIndex] === "can-conclude") {
									controller.enqueue({
										type: "reasoning-end",
										id: `${itemId}:${summaryIndex}`,
										providerMetadata: { [providerOptionsName]: { itemId } }
									});
									activeReasoningPart.summaryParts[summaryIndex] = "concluded";
								}
								controller.enqueue({
									type: "reasoning-start",
									id: `${itemId}:${value.summary_index}`,
									providerMetadata: { [providerOptionsName]: {
										itemId,
										reasoningEncryptedContent: activeReasoningPart.encryptedContent ?? null
									} }
								});
							}
						}
					} else if (value.type === "response.reasoning_summary_text.delta") {
						const itemId = resolveOutputItemId({
							itemId: value.item_id,
							outputIndex: value.output_index
						});
						controller.enqueue({
							type: "reasoning-delta",
							id: `${itemId}:${value.summary_index}`,
							delta: value.delta,
							providerMetadata: { [providerOptionsName]: { itemId } }
						});
					} else if (value.type === "response.reasoning_summary_part.done") {
						const itemId = resolveOutputItemId({
							itemId: value.item_id,
							outputIndex: value.output_index
						});
						const activeReasoningPart = activeReasoning[itemId];
						if (activeReasoningPart != null) {
							if (store) {
								controller.enqueue({
									type: "reasoning-end",
									id: `${itemId}:${value.summary_index}`,
									providerMetadata: { [providerOptionsName]: { itemId } }
								});
								activeReasoningPart.summaryParts[value.summary_index] = "concluded";
							} else activeReasoningPart.summaryParts[value.summary_index] = "can-conclude";
						}
					} else if (isResponseFinishedChunk(value)) {
						if (!encounteredStreamError) finishReason = {
							unified: mapOpenAIResponseFinishReason({
								finishReason: value.response.incomplete_details?.reason,
								hasFunctionCall,
								hasRefusal
							}),
							raw: value.response.incomplete_details?.reason ?? void 0
						};
						usage = value.response.usage ?? void 0;
						promptCacheDiagnostics = value.response.prompt_cache_diagnostics ?? void 0;
						inputTransformations = value.response.input_transformations ?? void 0;
						if (typeof value.response.service_tier === "string") serviceTier = value.response.service_tier;
						if (value.response.reasoning?.context != null) reasoningContext = value.response.reasoning.context;
					} else if (isResponseFailedChunk(value)) {
						promptCacheDiagnostics = value.response.prompt_cache_diagnostics ?? void 0;
						inputTransformations = value.response.input_transformations ?? void 0;
						const incompleteReason = value.response.incomplete_details?.reason;
						finishReason = {
							unified: incompleteReason ? mapOpenAIResponseFinishReason({
								finishReason: incompleteReason,
								hasFunctionCall
							}) : "error",
							raw: incompleteReason ?? "error"
						};
						usage = value.response.usage ?? void 0;
						if (value.response.reasoning?.context != null) reasoningContext = value.response.reasoning.context;
						if (!encounteredStreamError && value.response.error != null) {
							encounteredStreamError = true;
							const error = {
								type: "response.failed",
								sequence_number: value.sequence_number,
								response: {
									error: value.response.error,
									incomplete_details: value.response.incomplete_details,
									service_tier: value.response.service_tier
								}
							};
							controller.enqueue({
								type: "error",
								error: createOpenAIProviderStreamError(error) ?? error
							});
						}
					} else if (isResponseAnnotationAddedChunk(value)) {
						ongoingAnnotations.push(value.annotation);
						if (value.annotation.type === "url_citation" || value.annotation.type === "file_citation") fallbackAnnotations.push(value.annotation);
						else controller.enqueue(mapOpenAIResponsesAnnotationSource(value.annotation, providerOptionsName, self.config.generateId?.() ?? (0,dist/* generateId */.$C)()));
					} else if (isErrorChunk(value)) {
						encounteredStreamError = true;
						finishReason = {
							unified: "error",
							raw: "error"
						};
						controller.enqueue({
							type: "error",
							error: createOpenAIProviderStreamError(value) ?? value
						});
					}
				},
				flush(controller) {
					for (const annotation of fallbackAnnotations) {
						if (annotation.type === "url_citation" && hasWebSearchActionSources || annotation.type === "file_citation" && hasFileSearchResults) continue;
						controller.enqueue(mapOpenAIResponsesAnnotationSource(annotation, providerOptionsName, self.config.generateId?.() ?? (0,dist/* generateId */.$C)()));
					}
					for (const toolCall of Object.values(ongoingToolCalls)) {
						if (!toolCall?.suppressInputStreaming) continue;
						controller.enqueue({
							type: "tool-input-start",
							id: toolCall.toolCallId,
							toolName: toolCall.toolName
						});
						for (const delta of toolCall.bufferedInputDeltas ?? []) controller.enqueue({
							type: "tool-input-delta",
							id: toolCall.toolCallId,
							delta
						});
					}
					const providerMetadata = { [providerOptionsName]: {
						responseId,
						...logprobs.length > 0 ? { logprobs } : {},
						...serviceTier !== void 0 ? { serviceTier } : {},
						...reasoningContext !== void 0 ? { reasoningContext } : {},
						...promptCacheDiagnostics !== void 0 ? { promptCacheDiagnostics } : {},
						...inputTransformations !== void 0 ? { inputTransformations } : {}
					} };
					controller.enqueue({
						type: "finish",
						finishReason,
						usage: convertOpenAIResponsesUsage(usage),
						providerMetadata
					});
				}
			})),
			request: { body },
			response: { headers: responseHeaders }
		};
	}
};
function isTextDeltaChunk(chunk) {
	return chunk.type === "response.output_text.delta";
}
function isRefusalDeltaChunk(chunk) {
	return chunk.type === "response.refusal.delta";
}
function isRefusalDoneChunk(chunk) {
	return chunk.type === "response.refusal.done";
}
function isOpenAIChatCompletionChunk(value) {
	const chunk = asRecord(value);
	return chunk != null && Array.isArray(chunk.choices) && typeof chunk.type !== "string";
}
function createOpenAIResponsesChatCompletionsMismatchError({ value, cause, url, requestBodyValues, responseHeaders }) {
	return new provider_dist/* APICallError */.hL({
		message: "Received a Chat Completions stream while using the OpenAI Responses API. The default OpenAI provider model uses the Responses API. If your custom baseURL targets a Chat Completions-compatible endpoint, use openai.chat('model-id') or createOpenAI(...).chat('model-id') instead. You can also use @ai-sdk/openai-compatible for OpenAI-compatible providers.",
		url,
		requestBodyValues,
		responseHeaders,
		responseBody: JSON.stringify(value),
		cause,
		data: value,
		isRetryable: false
	});
}
function asRecord(value) {
	return typeof value === "object" && value != null ? value : void 0;
}
function isResponseOutputItemDoneChunk(chunk) {
	return chunk.type === "response.output_item.done";
}
function isResponseFinishedChunk(chunk) {
	return chunk.type === "response.completed" || chunk.type === "response.incomplete";
}
function isResponseFailedChunk(chunk) {
	return chunk.type === "response.failed";
}
function isResponseCreatedChunk(chunk) {
	return chunk.type === "response.created";
}
function isResponseFunctionCallArgumentsDeltaChunk(chunk) {
	return chunk.type === "response.function_call_arguments.delta";
}
function isResponseCustomToolCallInputDeltaChunk(chunk) {
	return chunk.type === "response.custom_tool_call_input.delta";
}
function isResponseImageGenerationCallPartialImageChunk(chunk) {
	return chunk.type === "response.image_generation_call.partial_image";
}
function isResponseCodeInterpreterCallCodeDeltaChunk(chunk) {
	return chunk.type === "response.code_interpreter_call_code.delta";
}
function isResponseCodeInterpreterCallCodeDoneChunk(chunk) {
	return chunk.type === "response.code_interpreter_call_code.done";
}
function isResponseApplyPatchCallOperationDiffDeltaChunk(chunk) {
	return chunk.type === "response.apply_patch_call_operation_diff.delta";
}
function isResponseApplyPatchCallOperationDiffDoneChunk(chunk) {
	return chunk.type === "response.apply_patch_call_operation_diff.done";
}
function isResponseOutputItemAddedChunk(chunk) {
	return chunk.type === "response.output_item.added";
}
function isResponseAnnotationAddedChunk(chunk) {
	return chunk.type === "response.output_text.annotation.added";
}
function isErrorChunk(chunk) {
	return chunk.type === "error";
}
function isResponseInProgressChunk(chunk) {
	return chunk.type === "response.in_progress";
}
function isResponseOutputChunk(chunk) {
	return !(chunk.type === "response.created" || chunk.type === "response.in_progress" || chunk.type === "response.failed" || chunk.type === "error" || chunk.type === "unknown_chunk");
}
function mapWebSearchResult({ action, status }) {
	return status === "completed" ? { result: mapWebSearchOutput(action) } : {
		isError: true,
		result: { status }
	};
}
function mapWebSearchOutput(action) {
	if (action == null) return {};
	switch (action.type) {
		case "search": return {
			action: {
				type: "search",
				query: action.query ?? void 0,
				...action.queries != null && { queries: action.queries }
			},
			...action.sources != null && { sources: action.sources }
		};
		case "open_page": return { action: {
			type: "openPage",
			url: action.url
		} };
		case "find_in_page": return { action: {
			type: "findInPage",
			url: action.url,
			pattern: action.pattern
		} };
	}
}
function escapeJSONDelta(delta) {
	return JSON.stringify(delta).slice(1, -1);
}
//#endregion
//#region src/openai-batch.ts
const openaiBatchEndpoint = "/v1/responses";
const openaiBatchInputFileDefaultExpiresAfterSeconds = 172800;
const openaiBatchProviderOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({ 
/**
* TTL in seconds for the uploaded batch input file, measured from
* upload time. OpenAI accepts integers between 3600 (1 hour) and
* 2592000 (30 days) inclusive. Defaults to 48 hours.
*/
inputFileExpiresAfter: classic_schemas/* number */.aig().int().min(3600).max(2592e3).optional() })));
function assertTextBatchRequests(requests) {
	for (const request of requests) {
		const requestType = request.type;
		if (requestType !== "text") throw new provider_dist/* UnsupportedFunctionalityError */.b8({
			functionality: `batch request type: ${requestType}`,
			message: `The OpenAI Batch API does not support batch requests with type "${requestType}".`
		});
	}
}
const openaiBatchResponseZodSchema = () => classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	status: classic_schemas/* string */.YjP(),
	output_file_id: classic_schemas/* string */.YjP().nullish(),
	error_file_id: classic_schemas/* string */.YjP().nullish(),
	created_at: classic_schemas/* number */.aig().nullish(),
	expires_at: classic_schemas/* number */.aig().nullish(),
	request_counts: classic_schemas/* object */.Ikc({
		total: classic_schemas/* number */.aig().nullish(),
		completed: classic_schemas/* number */.aig().nullish(),
		failed: classic_schemas/* number */.aig().nullish()
	}).nullish(),
	errors: classic_schemas/* object */.Ikc({ data: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		code: classic_schemas/* string */.YjP().nullish(),
		message: classic_schemas/* string */.YjP().nullish()
	})).nullish() }).nullish()
});
const openaiBatchResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(openaiBatchResponseZodSchema()));
const openaiBatchResultLineSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	custom_id: classic_schemas/* string */.YjP(),
	response: classic_schemas/* object */.Ikc({
		status_code: classic_schemas/* number */.aig(),
		request_id: classic_schemas/* string */.YjP().nullish(),
		body: classic_schemas/* unknown */.L5J()
	}).nullish(),
	error: classic_schemas/* object */.Ikc({
		code: classic_schemas/* string */.YjP(),
		message: classic_schemas/* string */.YjP()
	}).nullish()
})));
const openaiBatchListResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	data: classic_schemas/* array */.YOg(openaiBatchResponseZodSchema()),
	has_more: classic_schemas/* boolean */.zMY(),
	last_id: classic_schemas/* string */.YjP().nullish()
})));
var OpenAIBatch = class {
	constructor(options) {
		this.options = options;
		this.specificationVersion = "v4";
		this.supportedUrls = openaiResponsesSupportedUrls;
		this.provider = options.provider;
	}
	async doStartBatch(options) {
		assertTextBatchRequests(options.requests);
		validateSingleModel(options.requests);
		const fileParts = [];
		const warnings = options.webhookUrl == null ? [] : [{ warning: {
			type: "unsupported",
			feature: "webhookUrl",
			details: "The OpenAI Batch API does not support per-batch webhook URLs."
		} }];
		const inputFileExpiresAfterSeconds = (await this.parseBatchProviderOptions(options.providerOptions))?.inputFileExpiresAfter ?? openaiBatchInputFileDefaultExpiresAfterSeconds;
		for (const request of options.requests) {
			const preparedRequest = await this.prepareRequest(request);
			fileParts.push(JSON.stringify({
				custom_id: request.id,
				method: "POST",
				url: openaiBatchEndpoint,
				body: preparedRequest.body
			}), "\n");
			for (const warning of preparedRequest.warnings) warnings.push({
				requestId: request.id,
				warning
			});
			for (const tool of request.options.tools ?? []) if (tool.type === "provider" && !openAIBatchConvertibleProviderToolIds.has(tool.id)) warnings.push({
				requestId: request.id,
				warning: {
					type: "unsupported",
					feature: `batch result conversion for tool "${tool.name}"`,
					details: "OpenAI may return output for this tool that AI SDK text batches cannot currently convert."
				}
			});
		}
		const filename = "batch.jsonl";
		const file = new Blob(fileParts, { type: "application/jsonl" });
		fileParts.length = 0;
		const formData = new FormData();
		formData.append("file", file, filename);
		formData.append("purpose", "batch");
		formData.append("expires_after[anchor]", "created_at");
		formData.append("expires_after[seconds]", String(inputFileExpiresAfterSeconds));
		const { value: uploadedFile } = await (0,dist/* postToApi */.SP)({
			url: this.getUrl("/files"),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.options.config.headers), options.headers),
			body: {
				content: formData,
				values: {
					purpose: "batch",
					"expires_after[anchor]": "created_at",
					"expires_after[seconds]": String(inputFileExpiresAfterSeconds),
					file: {
						name: filename,
						type: file.type,
						size: file.size
					}
				}
			},
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiFilesResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.options.config.fetch
		});
		const { value: batch } = await (0,dist/* postJsonToApi */.GU)({
			url: this.getUrl("/batches"),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.options.config.headers), options.headers),
			body: {
				input_file_id: uploadedFile.id,
				endpoint: openaiBatchEndpoint,
				completion_window: "24h"
			},
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiBatchResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.options.config.fetch
		});
		const inputFileExpiresAt = convertUnixTimestamp(uploadedFile.expires_at);
		return {
			batchId: batch.id,
			...convertOpenAIBatchStatus(batch),
			providerMetadata: { openai: {
				inputFileId: uploadedFile.id,
				...inputFileExpiresAt != null ? { inputFileExpiresAt } : {}
			} },
			warnings
		};
	}
	async parseBatchProviderOptions(providerOptions) {
		const providerOptionsName = this.options.config.provider.includes("azure") ? "azure" : "openai";
		let batchOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: providerOptionsName,
			providerOptions,
			schema: openaiBatchProviderOptionsSchema
		});
		if (batchOptions == null && providerOptionsName !== "openai") batchOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openaiBatchProviderOptionsSchema
		});
		return batchOptions;
	}
	async doGetBatchStatus(options) {
		return convertOpenAIBatchStatus(await this.retrieveBatch(options));
	}
	async doCancelBatch(options) {
		await (0,dist/* postJsonToApi */.GU)({
			url: this.getUrl(`/batches/${encodeURIComponent(options.batchId)}/cancel`),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.options.config.headers), options.headers),
			body: {},
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiBatchResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.options.config.fetch
		});
		return {};
	}
	async doListBatches(options) {
		const url = new URL(this.getUrl("/batches"));
		if (options.limit != null) url.searchParams.set("limit", String(options.limit));
		if (options.cursor != null) url.searchParams.set("after", options.cursor);
		const { value: page } = await (0,dist/* getFromApi */.$b)({
			url: url.toString(),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.options.config.headers), options.headers),
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiBatchListResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.options.config.fetch,
			validateUrl: false
		});
		return {
			batches: page.data.map((batch) => ({
				batchId: batch.id,
				...convertOpenAIBatchStatus(batch)
			})),
			...page.has_more && page.last_id != null ? { nextCursor: page.last_id } : {}
		};
	}
	async doGetBatchResults(options) {
		const batch = await this.retrieveBatch(options);
		const batchStatus = convertOpenAIBatchStatus(batch);
		if (batchStatus.status === "pending") throw new provider_dist/* InvalidArgumentError */.Di({
			argument: "batchId",
			message: `OpenAI batch "${options.batchId}" is not complete.`
		});
		const fileIds = [batch.output_file_id, batch.error_file_id].filter((fileId) => fileId != null);
		if (batchStatus.status === "completed" && fileIds.length === 0) throw new provider_dist/* InvalidResponseDataError */.xn({
			data: batch,
			message: `OpenAI batch "${options.batchId}" completed without batch output.`
		});
		const iterator = this.iterateBatchResults({
			fileIds,
			options
		});
		return (0,dist/* convertAsyncIteratorToReadableStream */.NR)(iterator);
	}
	async retrieveBatch(options) {
		const { value: batch } = await (0,dist/* getFromApi */.$b)({
			url: this.getUrl(`/batches/${encodeURIComponent(options.batchId)}`),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.options.config.headers), options.headers),
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiBatchResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.options.config.fetch,
			validateUrl: false
		});
		return batch;
	}
	async *iterateBatchResults({ fileIds, options }) {
		for (const fileId of fileIds) {
			const { value: lines } = await (0,dist/* getFromApi */.$b)({
				url: this.getUrl(`/files/${encodeURIComponent(fileId)}/content`),
				headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.options.config.headers), options.headers),
				failedResponseHandler: openaiFailedResponseHandler,
				successfulResponseHandler: (0,dist/* createJsonLinesResponseHandler */.ny)(openaiBatchResultLineSchema, { maxLineBytes: this.options.maxLineBytes }),
				abortSignal: options.abortSignal,
				fetch: this.options.config.fetch,
				validateUrl: false
			});
			for await (const line of lines) yield await this.convertResultLine(line);
		}
	}
	async convertResultLine(line) {
		if (line.error != null) {
			const error = {
				message: line.error.message,
				code: line.error.code
			};
			if (line.error.code === "batch_cancelled") return {
				type: "text",
				id: line.custom_id,
				status: "cancelled",
				error
			};
			if (line.error.code === "batch_expired") return {
				type: "text",
				id: line.custom_id,
				status: "expired",
				error
			};
			return {
				type: "text",
				id: line.custom_id,
				status: "failed",
				error
			};
		}
		if (line.response == null) return {
			type: "text",
			id: line.custom_id,
			status: "failed",
			error: {
				message: "OpenAI returned a batch result without a response or error.",
				code: "invalid_batch_result"
			}
		};
		if (line.response.status_code < 200 || line.response.status_code >= 300) return {
			type: "text",
			id: line.custom_id,
			status: "failed",
			error: await convertOpenAIErrorResponse({
				body: line.response.body,
				statusCode: line.response.status_code
			})
		};
		const conversion = await convertOpenAIBatchResult(line.response.body);
		if (!conversion.success) return {
			type: "text",
			id: line.custom_id,
			status: "failed",
			error: conversion.error
		};
		return {
			type: "text",
			id: line.custom_id,
			status: "succeeded",
			result: conversion.result
		};
	}
	async prepareRequest(request) {
		const { args: body, warnings } = await OpenAIResponsesLanguageModel.prepareRequest({
			modelId: request.modelId,
			config: this.options.config,
			options: request.options
		});
		return {
			body,
			warnings
		};
	}
	getUrl(path) {
		return this.options.config.url({
			path,
			modelId: ""
		});
	}
};
function validateSingleModel(requests) {
	const modelId = requests[0]?.modelId;
	for (const request of requests) if (request.modelId !== modelId) throw new provider_dist/* InvalidArgumentError */.Di({
		argument: "requests",
		message: `The OpenAI Batch API requires all requests in a batch to use the same model. Found "${modelId}" and "${request.modelId}".`
	});
}
const openAIBatchConvertibleProviderToolIds = /* @__PURE__ */ new Set([
	"openai.code_interpreter",
	"openai.custom",
	"openai.file_search",
	"openai.web_search",
	"openai.web_search_preview"
]);
function convertOpenAIBatchStatus(batch) {
	const status = mapOpenAIBatchStatus(batch.status);
	const firstError = batch.errors?.data?.[0];
	const requestCounts = convertOpenAIRequestCounts(batch.request_counts);
	const createdAt = convertUnixTimestamp(batch.created_at);
	const expiresAt = convertUnixTimestamp(batch.expires_at);
	return {
		status,
		rawStatus: batch.status,
		...requestCounts != null ? { requestCounts } : {},
		...firstError != null ? { error: {
			message: firstError.message ?? "OpenAI batch failed.",
			...firstError.code != null ? { code: firstError.code } : {}
		} } : {},
		...createdAt != null ? { createdAt } : {},
		...expiresAt != null ? { expiresAt } : {}
	};
}
function mapOpenAIBatchStatus(rawStatus) {
	switch (rawStatus) {
		case "completed": return "completed";
		case "failed":
		case "expired":
		case "cancelled": return "failed";
		default: return "pending";
	}
}
function convertOpenAIRequestCounts(counts) {
	const total = counts?.total;
	const completed = counts?.completed;
	const failed = counts?.failed;
	return (0,dist/* normalizeBatchRequestCounts */.F8)({
		total,
		pending: total != null && completed != null && failed != null ? total - completed - failed : void 0,
		completed,
		failed
	});
}
function convertUnixTimestamp(value) {
	if (value == null || !Number.isFinite(value)) return;
	const date = /* @__PURE__ */ new Date(value * 1e3);
	return Number.isNaN(date.getTime()) ? void 0 : date.toISOString();
}
async function convertOpenAIErrorResponse({ body, statusCode }) {
	const result = await (0,dist/* safeValidateTypes */.ZZ)({
		value: body,
		schema: openaiErrorDataSchemaValidator
	});
	if (!result.success) return {
		message: `OpenAI batch request failed with status code ${statusCode}.`,
		statusCode
	};
	return {
		message: result.value.error.message,
		type: result.value.error.type ?? void 0,
		code: result.value.error.code != null ? String(result.value.error.code) : void 0,
		statusCode
	};
}
async function convertOpenAIBatchResult(body) {
	const validation = await (0,dist/* safeValidateTypes */.ZZ)({
		value: body,
		schema: openaiResponsesResponseSchema
	});
	if (!validation.success) return {
		success: false,
		error: {
			message: "OpenAI returned an invalid Responses batch result.",
			code: "invalid_response"
		}
	};
	const response = validation.value;
	if (response.error != null) return {
		success: false,
		error: {
			message: response.error.message,
			type: response.error.type,
			code: response.error.code
		}
	};
	if (response.output == null) {
		const detail = response.incomplete_details?.reason;
		return {
			success: false,
			error: {
				message: detail != null ? `OpenAI Responses returned no output (${detail}).` : "OpenAI Responses returned no output.",
				code: "invalid_response"
			}
		};
	}
	const content = [];
	const logprobs = [];
	let hasFunctionCall = false;
	let hasRefusal = false;
	for (const part of response.output) switch (part.type) {
		case "reasoning": {
			const summaries = part.summary.length > 0 ? part.summary : [{
				type: "summary_text",
				text: ""
			}];
			for (const summary of summaries) content.push({
				type: "reasoning",
				text: summary.text,
				providerMetadata: { openai: {
					itemId: part.id,
					reasoningEncryptedContent: part.encrypted_content ?? null
				} }
			});
			break;
		}
		case "message":
			for (const contentPart of part.content) {
				if (contentPart.type === "refusal") {
					hasRefusal = true;
					content.push({
						type: "text",
						text: contentPart.refusal
					});
					continue;
				}
				content.push({
					type: "text",
					text: contentPart.text
				});
				if (contentPart.logprobs != null) logprobs.push(contentPart.logprobs);
			}
			break;
		case "function_call":
			hasFunctionCall = true;
			content.push({
				type: "tool-call",
				toolCallId: part.call_id,
				toolName: part.name,
				input: part.arguments,
				providerMetadata: { openai: {
					itemId: part.id,
					...part.namespace != null && { namespace: part.namespace },
					...part.caller != null && { caller: part.caller.type === "program" ? {
						type: "program",
						callerId: part.caller.caller_id
					} : part.caller }
				} }
			});
			break;
		case "custom_tool_call":
			hasFunctionCall = true;
			content.push({
				type: "tool-call",
				toolCallId: part.call_id,
				toolName: part.name,
				input: JSON.stringify(part.input),
				providerMetadata: { openai: { itemId: part.id } }
			});
			break;
		case "web_search_call":
			content.push({
				type: "tool-call",
				toolCallId: part.id,
				toolName: "web_search",
				input: "{}",
				providerExecuted: true,
				dynamic: true
			});
			content.push({
				type: "tool-result",
				toolCallId: part.id,
				toolName: "web_search",
				...mapWebSearchResult(part),
				dynamic: true
			});
			break;
		case "file_search_call":
			content.push({
				type: "tool-call",
				toolCallId: part.id,
				toolName: "file_search",
				input: "{}",
				providerExecuted: true,
				dynamic: true
			});
			content.push({
				type: "tool-result",
				toolCallId: part.id,
				toolName: "file_search",
				result: {
					queries: part.queries,
					results: part.results?.map((result) => ({
						attributes: result.attributes,
						fileId: result.file_id,
						filename: result.filename,
						score: result.score,
						text: result.text
					})) ?? null
				},
				dynamic: true
			});
			break;
		case "code_interpreter_call":
			content.push({
				type: "tool-call",
				toolCallId: part.id,
				toolName: "code_interpreter",
				input: JSON.stringify({
					code: part.code,
					containerId: part.container_id
				}),
				providerExecuted: true,
				dynamic: true
			});
			content.push({
				type: "tool-result",
				toolCallId: part.id,
				toolName: "code_interpreter",
				result: { outputs: part.outputs },
				dynamic: true
			});
			break;
		default: return {
			success: false,
			error: {
				message: `OpenAI returned an unsupported "${part.type}" output item in an AI SDK text batch.`,
				code: "unsupported_content"
			}
		};
	}
	const providerMetadata = { openai: {
		responseId: response.id,
		...logprobs.length > 0 ? { logprobs } : {},
		...typeof response.service_tier === "string" ? { serviceTier: response.service_tier } : {},
		...response.reasoning?.context != null ? { reasoningContext: response.reasoning.context } : {},
		...response.prompt_cache_diagnostics != null ? { promptCacheDiagnostics: response.prompt_cache_diagnostics } : {},
		...response.input_transformations != null ? { inputTransformations: response.input_transformations } : {}
	} };
	return {
		success: true,
		result: {
			content,
			finishReason: {
				unified: mapOpenAIResponseFinishReason({
					finishReason: response.incomplete_details?.reason,
					hasFunctionCall,
					hasRefusal
				}),
				raw: response.incomplete_details?.reason ?? void 0
			},
			usage: convertOpenAIResponsesUsage(response.usage),
			response: {
				id: response.id,
				timestamp: response.created_at != null ? /* @__PURE__ */ new Date(response.created_at * 1e3) : void 0,
				modelId: response.model
			},
			providerMetadata,
			warnings: []
		}
	};
}
//#endregion
//#region src/live/openai-realtime-model-live-options.ts
const serverEventSelectorSchema = classic_schemas/* strictObject */.rej({
	type: classic_schemas/* string */.YjP(),
	responseEvent: classic_schemas/* string */.YjP().optional()
}).refine((selector) => selector.type === "response.event" === (selector.responseEvent !== void 0), "responseEvent is required for response.event and forbidden for other event types.");
const openaiRealtimeModelLiveOptionsSchema = classic_schemas/* strictObject */.rej({
	client: classic_schemas/* strictObject */.rej({ dataChannel: classic_schemas/* strictObject */.rej({
		allowedClientEvents: classic_schemas/* union */.KCZ([classic_schemas/* literal */.euz("all"), classic_schemas/* array */.YOg(classic_schemas/* string */.YjP())]).optional(),
		allowedServerEvents: classic_schemas/* union */.KCZ([classic_schemas/* literal */.euz("all"), classic_schemas/* array */.YOg(serverEventSelectorSchema)]).optional()
	}) }).optional(),
	delegation: classic_schemas/* strictObject */.rej({ type: classic_schemas/* literal */.euz("client") }).nullable().optional(),
	input: classic_schemas/* array */.YOg(classic_schemas/* discriminatedUnion */.gMt("role", [classic_schemas/* strictObject */.rej({
		type: classic_schemas/* literal */.euz("message"),
		role: classic_schemas/* enum */.k5n(["developer", "user"]),
		content: classic_schemas/* tuple */.PVZ([classic_schemas/* strictObject */.rej({
			type: classic_schemas/* literal */.euz("input_text"),
			text: classic_schemas/* string */.YjP()
		})])
	}), classic_schemas/* strictObject */.rej({
		type: classic_schemas/* literal */.euz("message"),
		role: classic_schemas/* literal */.euz("assistant"),
		content: classic_schemas/* tuple */.PVZ([classic_schemas/* strictObject */.rej({
			type: classic_schemas/* enum */.k5n(["text", "output_text"]),
			text: classic_schemas/* string */.YjP()
		})])
	})])).max(128).optional(),
	store: classic_schemas/* boolean */.zMY().optional(),
	voice: classic_schemas/* strictObject */.rej({ id: classic_schemas/* string */.YjP().min(1) }).optional()
});
//#endregion
//#region src/live/openai-live-session-config.ts
const audioFormatSchema = classic_schemas/* union */.KCZ([classic_schemas/* strictObject */.rej({
	type: classic_schemas/* literal */.euz("audio/pcm"),
	rate: classic_schemas/* union */.KCZ([classic_schemas/* literal */.euz(16e3), classic_schemas/* literal */.euz(24e3)])
}), classic_schemas/* strictObject */.rej({
	type: classic_schemas/* enum */.k5n(["audio/pcma", "audio/pcmu"]),
	rate: classic_schemas/* literal */.euz(8e3)
})]);
function buildOpenAILiveSessionConfig(config, modelId, transport = "websocket") {
	for (const key of Object.keys(config)) if (![
		"instructions",
		"voice",
		"inputAudioFormat",
		"outputAudioFormat",
		"providerOptions"
	].includes(key)) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `OpenAI Live session setting: ${key}` });
	if (classic_schemas/* object */.Ikc({ delegation: classic_schemas/* object */.Ikc({ type: classic_schemas/* literal */.euz("responses") }) }).safeParse(config.providerOptions?.openai).success) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "OpenAI Live Responses delegation; only client delegation is supported" });
	const options = openaiRealtimeModelLiveOptionsSchema.parse(config.providerOptions?.openai ?? {});
	if (options.client !== void 0 && transport !== "webrtc") throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "OpenAI Live client permissions outside WebRTC startup" });
	if (options.voice != null && config.voice != null) throw new provider_dist/* InvalidArgumentError */.Di({
		argument: "voice",
		message: "Choose either voice or providerOptions.openai.voice."
	});
	if (transport === "webrtc" && (config.inputAudioFormat !== void 0 || config.outputAudioFormat !== void 0)) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "Fixed audio formats for OpenAI Live WebRTC; audio is negotiated through SDP" });
	const inputFormat = config.inputAudioFormat == null ? void 0 : audioFormatSchema.parse(config.inputAudioFormat);
	const outputFormat = config.outputAudioFormat == null ? void 0 : audioFormatSchema.parse(config.outputAudioFormat);
	if (inputFormat != null && outputFormat != null && (inputFormat.type !== outputFormat.type || inputFormat.rate !== outputFormat.rate)) throw new provider_dist/* InvalidArgumentError */.Di({
		argument: "outputAudioFormat",
		message: "OpenAI Live requires the same input and output audio format."
	});
	return {
		model: modelId,
		...config.instructions !== void 0 ? { instructions: config.instructions } : {},
		audio: {
			...transport === "websocket" ? { format: inputFormat ?? outputFormat ?? {
				type: "audio/pcm",
				rate: 24e3
			} } : {},
			output: { voice: options.voice ?? config.voice ?? "marin" }
		},
		...options.delegation !== void 0 ? { delegation: options.delegation } : {},
		...options.client !== void 0 ? { client: { data_channel: {
			...options.client.dataChannel.allowedClientEvents !== void 0 ? { allowed_client_events: options.client.dataChannel.allowedClientEvents } : {},
			...options.client.dataChannel.allowedServerEvents !== void 0 ? { allowed_server_events: options.client.dataChannel.allowedServerEvents === "all" ? "all" : options.client.dataChannel.allowedServerEvents.map((selector) => ({
				type: selector.type,
				...selector.responseEvent !== void 0 ? { response_event: selector.responseEvent } : {}
			})) } : {}
		} } } : {},
		...options.input !== void 0 ? { input: options.input } : {},
		...options.store !== void 0 ? { store: options.store } : {}
	};
}
//#endregion
//#region src/live/openai-live-event-mapper.ts
const sessionSchema = classic_schemas/* object */.Ikc({ id: classic_schemas/* string */.YjP().min(1) });
const startedSessionSchema = sessionSchema.extend({ delegation: classic_schemas/* object */.Ikc({ type: classic_schemas/* enum */.k5n(["client", "responses"]) }).nullish() });
const usageSchema = classic_schemas/* object */.Ikc({ seconds: classic_schemas/* number */.aig().nonnegative() });
const transcriptFields = {
	delta: classic_schemas/* string */.YjP(),
	start_ms: classic_schemas/* number */.aig().nonnegative(),
	end_ms: classic_schemas/* number */.aig().nonnegative()
};
const acknowledgmentFields = { client_event_id: classic_schemas/* string */.YjP().nullish() };
const appendAcknowledgmentFields = {
	...acknowledgmentFields,
	start_ms: classic_schemas/* number */.aig().nonnegative(),
	end_ms: classic_schemas/* number */.aig().nonnegative()
};
const serverEventSchema = classic_schemas/* discriminatedUnion */.gMt("type", [
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.started"),
		session: startedSessionSchema
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.closed"),
		session: sessionSchema.nullish(),
		usage: usageSchema,
		reason: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.usage.updated"),
		usage: usageSchema,
		context_window: classic_schemas/* object */.Ikc({ usage_ratio: classic_schemas/* number */.aig().min(0).max(1) }).nullish()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.output_audio.delta"),
		delta: classic_schemas/* string */.YjP()
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.input_transcript.delta"),
		...transcriptFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.output_transcript.delta"),
		...transcriptFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.delegation.created"),
		offset_ms: classic_schemas/* number */.aig().nonnegative().nullish(),
		delegation: classic_schemas/* object */.Ikc({
			id: classic_schemas/* string */.YjP().min(1),
			target: classic_schemas/* enum */.k5n(["client", "responses"]).nullish(),
			response_id: classic_schemas/* string */.YjP().min(1).nullish()
		})
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.updated"),
		session: sessionSchema,
		...acknowledgmentFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.input_audio.muted"),
		...acknowledgmentFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.input_audio.unmuted"),
		...acknowledgmentFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.instructions.appended"),
		...appendAcknowledgmentFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.thinking.appended"),
		...appendAcknowledgmentFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("session.commentary.appended"),
		...appendAcknowledgmentFields
	}),
	classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("error"),
		error: classic_schemas/* object */.Ikc({
			message: classic_schemas/* string */.YjP(),
			code: classic_schemas/* string */.YjP().nullish(),
			client_event_id: classic_schemas/* string */.YjP().nullish()
		})
	})
]);
const knownTypes = new Set(serverEventSchema.options.map((schema) => schema.shape.type.value));
const envelopeSchema = classic_schemas/* object */.Ikc({ type: classic_schemas/* string */.YjP() });
function createOpenAILiveServerEventParser() {
	return (raw) => parseOpenAILiveServerEvent(raw);
}
function parseOpenAILiveServerEvent(raw) {
	return [parseServerEvent(raw)];
}
function parseServerEvent(raw) {
	const envelope = envelopeSchema.safeParse(raw);
	if (envelope.success && !knownTypes.has(envelope.data.type)) return {
		type: "custom",
		rawType: envelope.data.type,
		raw
	};
	const parsed = serverEventSchema.safeParse(raw);
	if (!parsed.success) return {
		type: "error",
		code: "invalid_server_event",
		message: "Invalid OpenAI Live server event.",
		raw
	};
	const event = parsed.data;
	if ("start_ms" in event && event.end_ms < event.start_ms) return {
		type: "error",
		code: "invalid_server_event",
		message: "Invalid OpenAI Live event time interval.",
		raw
	};
	switch (event.type) {
		case "session.started": return {
			type: "session-started",
			sessionId: event.session.id,
			delegationMode: event.session.delegation?.type === "responses" ? "provider" : "client",
			raw
		};
		case "session.closed": return {
			type: "session-closed",
			sessionId: event.session?.id,
			usage: event.usage,
			reason: event.reason,
			raw
		};
		case "session.usage.updated": return {
			type: "session-usage",
			usage: event.usage,
			contextWindowUsageRatio: event.context_window?.usage_ratio,
			raw
		};
		case "session.output_audio.delta": return {
			type: "audio-chunk",
			delta: event.delta,
			raw
		};
		case "session.input_transcript.delta":
		case "session.output_transcript.delta": return {
			type: "transcript-fragment",
			speaker: event.type === "session.input_transcript.delta" ? "user" : "assistant",
			delta: event.delta,
			startMs: event.start_ms,
			endMs: event.end_ms,
			raw
		};
		case "session.delegation.created": return {
			type: "delegation-created",
			delegationId: event.delegation.id,
			target: event.delegation.target === "responses" ? "provider" : event.delegation.target ?? void 0,
			offsetMs: event.offset_ms ?? void 0,
			...event.delegation.response_id != null ? { responseId: event.delegation.response_id } : {},
			raw
		};
		case "error": return {
			type: "error",
			message: event.error.message,
			code: event.error.code ?? void 0,
			clientEventId: event.error.client_event_id ?? void 0,
			raw
		};
		case "session.updated": return {
			type: "command-acknowledged",
			command: "session.update",
			clientEventId: event.client_event_id ?? void 0,
			raw
		};
		case "session.input_audio.muted":
		case "session.input_audio.unmuted": return {
			type: "command-acknowledged",
			command: event.type.slice(0, -1),
			clientEventId: event.client_event_id ?? void 0,
			raw
		};
		case "session.instructions.appended":
		case "session.thinking.appended":
		case "session.commentary.appended": return {
			type: "command-acknowledged",
			command: event.type.slice(0, -2),
			clientEventId: event.client_event_id ?? void 0,
			raw
		};
	}
}
function serializeOpenAILiveClientEvent(event, modelId) {
	const eventId = "eventId" in event && event.eventId !== void 0 ? { event_id: event.eventId } : {};
	switch (event.type) {
		case "session-start": return {
			type: "session.start",
			session: buildOpenAILiveSessionConfig(event.config, modelId),
			...eventId
		};
		case "session-update": throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "OpenAI Live session-update; startup settings are immutable; use context-append or input-audio-mute/input-audio-unmute" });
		case "session-close": return {
			type: "session.close",
			...eventId
		};
		case "input-audio-append": return {
			type: "session.input_audio.append",
			audio: event.audio,
			...eventId
		};
		case "input-audio-mute": return {
			type: "session.input_audio.mute",
			...eventId
		};
		case "input-audio-unmute": return {
			type: "session.input_audio.unmute",
			...eventId
		};
		case "context-append": {
			const context = classic_schemas/* object */.Ikc({
				content: classic_schemas/* string */.YjP(),
				delegationId: classic_schemas/* string */.YjP().min(1).nullable()
			}).parse(event);
			return {
				type: `session.${classic_schemas/* strictObject */.rej({ channel: classic_schemas/* enum */.k5n([
					"instructions",
					"thinking",
					"commentary"
				]).optional() }).parse(event.providerOptions?.openai ?? {}).channel ?? "thinking"}.append`,
				content: context.content,
				delegation_id: context.delegationId,
				...eventId
			};
		}
		default: throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `OpenAI Live command: ${event.type}; use continuous audio and context-append instead of voice-turn commands` });
	}
}
//#endregion
//#region src/live/openai-realtime-model-live.ts
const webRTCSessionSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	session: classic_schemas/* object */.Ikc({ id: classic_schemas/* string */.YjP().min(1) }),
	transport: classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("webrtc"),
		sdp: classic_schemas/* string */.YjP().min(1)
	})
})));
var OpenAIRealtimeModelLive = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
		this.capabilities = openaiLiveRealtimeCapabilities;
	}
	get provider() {
		return this.config.provider;
	}
	getWebRTCConfig() {
		return { dataChannelLabel: "oai-events" };
	}
	getServerWebSocketConfig(options) {
		this.assertConversationIntent(options);
		return (0,dist/* resolveWith */.H)(this.config.headers, (configHeaders) => {
			const url = new URL(`${this.config.baseURL}/live/sessions`);
			url.protocol = url.protocol === "http:" ? "ws:" : "wss:";
			const headers = {};
			for (const [key, value] of Object.entries(configHeaders)) if (value !== void 0) headers[key] = value;
			return {
				url: url.toString(),
				headers
			};
		});
	}
	async doCreateWebRTCSession({ sdp, sessionConfig = {}, abortSignal }) {
		const session = buildOpenAILiveSessionConfig(sessionConfig, this.modelId, "webrtc");
		const { value } = await (0,dist/* postJsonToApi */.GU)({
			url: `${this.config.baseURL}/live/sessions`,
			headers: await (0,dist/* resolve */.hd)(this.config.headers),
			body: {
				session,
				transport: {
					type: "webrtc",
					sdp: classic_schemas/* string */.YjP().min(1).parse(sdp)
				}
			},
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(webRTCSessionSchema),
			abortSignal,
			fetch: this.config.fetch
		});
		return {
			sessionId: value.session.id,
			sdp: value.transport.sdp
		};
	}
	parseServerEvent(raw) {
		return parseOpenAILiveServerEvent(raw);
	}
	createServerEventParser() {
		return createOpenAILiveServerEventParser();
	}
	assertConversationIntent(options) {
		if (options?.intent != null && options.intent !== "conversation") throw new Error(`OpenAI Live session intent '${options.intent}' is not supported.`);
	}
	serializeClientEvent(event, options) {
		this.assertConversationIntent(options);
		return serializeOpenAILiveClientEvent(event, this.modelId);
	}
	buildSessionConfig(config, options) {
		this.assertConversationIntent(options);
		return buildOpenAILiveSessionConfig(config, this.modelId);
	}
};
//#endregion
//#region src/realtime/openai-realtime-event-mapper.ts
/**
* Parses a raw OpenAI Realtime API server event into a normalized event.
*/
function parseOpenAIRealtimeServerEvent(raw) {
	const event = raw;
	const type = event.type;
	switch (type) {
		case "session.created": return {
			type: "session-created",
			sessionId: event.session?.id,
			raw
		};
		case "session.updated": return {
			type: "session-updated",
			raw
		};
		case "input_audio_buffer.speech_started": return {
			type: "speech-started",
			itemId: event.item_id,
			raw
		};
		case "input_audio_buffer.speech_stopped": return {
			type: "speech-stopped",
			itemId: event.item_id,
			raw
		};
		case "input_audio_buffer.committed": return {
			type: "audio-committed",
			itemId: event.item_id,
			previousItemId: event.previous_item_id,
			raw
		};
		case "conversation.item.added": return {
			type: "conversation-item-added",
			itemId: event.item?.id ?? event.item_id,
			item: event.item,
			raw
		};
		case "conversation.item.input_audio_transcription.completed": {
			const usage = mapTranscriptionUsage(event.usage);
			return {
				type: "input-transcription-completed",
				itemId: event.item_id,
				transcript: event.transcript ?? "",
				...usage != null ? { usage } : {},
				raw
			};
		}
		case "response.created": return {
			type: "response-created",
			responseId: event.response?.id ?? event.response_id,
			raw
		};
		case "response.done": {
			const usage = mapResponseUsage(event.response?.usage);
			return {
				type: "response-done",
				responseId: event.response?.id ?? event.response_id,
				status: event.response?.status ?? "completed",
				...usage != null ? { usage } : {},
				raw
			};
		}
		case "response.output_item.added": return {
			type: "output-item-added",
			responseId: event.response_id,
			itemId: event.item?.id ?? event.item_id,
			raw
		};
		case "response.output_item.done": return {
			type: "output-item-done",
			responseId: event.response_id,
			itemId: event.item?.id ?? event.item_id,
			raw
		};
		case "response.content_part.added": return {
			type: "content-part-added",
			responseId: event.response_id,
			itemId: event.item_id,
			raw
		};
		case "response.content_part.done": return {
			type: "content-part-done",
			responseId: event.response_id,
			itemId: event.item_id,
			raw
		};
		case "response.output_audio.delta": return {
			type: "audio-delta",
			responseId: event.response_id,
			itemId: event.item_id,
			delta: event.delta,
			raw
		};
		case "response.output_audio.done": return {
			type: "audio-done",
			responseId: event.response_id,
			itemId: event.item_id,
			raw
		};
		case "response.output_audio_transcript.delta": return {
			type: "audio-transcript-delta",
			responseId: event.response_id,
			itemId: event.item_id,
			delta: event.delta,
			raw
		};
		case "response.output_audio_transcript.done": return {
			type: "audio-transcript-done",
			responseId: event.response_id,
			itemId: event.item_id,
			transcript: event.transcript,
			raw
		};
		case "response.output_text.delta": return {
			type: "text-delta",
			responseId: event.response_id,
			itemId: event.item_id,
			delta: event.delta,
			raw
		};
		case "response.output_text.done": return {
			type: "text-done",
			responseId: event.response_id,
			itemId: event.item_id,
			text: event.text,
			raw
		};
		case "response.function_call_arguments.delta": return {
			type: "function-call-arguments-delta",
			responseId: event.response_id,
			itemId: event.item_id,
			callId: event.call_id,
			delta: event.delta,
			raw
		};
		case "response.function_call_arguments.done": return {
			type: "function-call-arguments-done",
			responseId: event.response_id,
			itemId: event.item_id,
			callId: event.call_id,
			name: event.name,
			arguments: event.arguments,
			raw
		};
		case "error": return {
			type: "error",
			message: event.error?.message ?? event.message ?? "Unknown error",
			code: event.error?.code ?? event.code,
			clientEventId: event.error?.event_id ?? void 0,
			raw
		};
		default: return {
			type: "custom",
			rawType: type,
			raw
		};
	}
}
/**
* Maps OpenAI realtime `response.done` usage to normalized usage.
*
* Input buckets are reported gross (cache-inclusive) with the cached portion
* surfaced separately, so consumers can apply their own cached-vs-uncached
* billing split without re-reading `raw`.
*/
function mapResponseUsage(usage) {
	if (usage == null) return void 0;
	const input = usage.input_token_details;
	const output = usage.output_token_details;
	const cached = input?.cached_tokens_details;
	return compactUsage({
		inputTokens: usage.input_tokens,
		outputTokens: usage.output_tokens,
		cachedInputTokens: input?.cached_tokens,
		inputAudioTokens: input?.audio_tokens,
		inputTextTokens: input?.text_tokens,
		outputAudioTokens: output?.audio_tokens,
		outputTextTokens: output?.text_tokens,
		cachedInputAudioTokens: cached?.audio_tokens,
		cachedInputTextTokens: cached?.text_tokens
	});
}
/**
* Maps OpenAI realtime transcription-completed usage to normalized usage.
* Duration-billed transcription reports `seconds`; token-billed reports tokens.
*/
function mapTranscriptionUsage(usage) {
	if (usage == null) return void 0;
	if (usage.type === "duration") return usage.seconds != null ? { seconds: usage.seconds } : void 0;
	const input = usage.input_token_details;
	return compactUsage({
		inputTokens: usage.input_tokens,
		outputTokens: usage.output_tokens,
		inputAudioTokens: input?.audio_tokens,
		inputTextTokens: input?.text_tokens,
		outputTextTokens: usage.output_tokens
	});
}
/** Drop `undefined` fields; return `undefined` when nothing is observable. */
function compactUsage(usage) {
	const result = {};
	for (const [key, value] of Object.entries(usage)) if (value != null) result[key] = value;
	return Object.keys(result).length > 0 ? result : void 0;
}
/**
* Serializes a normalized client event into OpenAI's Realtime API format.
*/
function serializeOpenAIRealtimeClientEvent(event, modelId, options) {
	assertSupportedOpenAIIntent(options?.intent);
	switch (event.type) {
		case "session-update": return {
			type: "session.update",
			session: buildOpenAISessionConfig(event.config, modelId, options),
			...event.eventId != null ? { event_id: event.eventId } : {}
		};
		case "input-audio-append": return {
			type: "input_audio_buffer.append",
			audio: event.audio,
			...event.eventId != null ? { event_id: event.eventId } : {}
		};
		case "input-audio-commit": return { type: "input_audio_buffer.commit" };
		case "input-audio-clear": return { type: "input_audio_buffer.clear" };
		case "conversation-item-create": {
			const item = event.item;
			switch (item.type) {
				case "text-message": return {
					type: "conversation.item.create",
					item: {
						type: "message",
						role: item.role,
						content: [{
							type: "input_text",
							text: item.text
						}]
					}
				};
				case "audio-message": return {
					type: "conversation.item.create",
					item: {
						type: "message",
						role: item.role,
						content: [{
							type: "input_audio",
							audio: item.audio
						}]
					}
				};
				case "function-call-output": return {
					type: "conversation.item.create",
					item: {
						type: "function_call_output",
						call_id: item.callId,
						output: item.output
					}
				};
			}
			break;
		}
		case "conversation-item-truncate": return {
			type: "conversation.item.truncate",
			item_id: event.itemId,
			content_index: event.contentIndex,
			audio_end_ms: event.audioEndMs
		};
		case "response-create": return {
			type: "response.create",
			...event.options != null ? { response: {
				...event.options.modalities != null ? { output_modalities: event.options.modalities } : {},
				...event.options.instructions != null ? { instructions: event.options.instructions } : {},
				...event.options.metadata != null ? { metadata: event.options.metadata } : {}
			} } : {}
		};
		case "response-cancel": return { type: "response.cancel" };
	}
}
/**
* Builds an OpenAI-specific session configuration from a normalized config.
*/
function buildOpenAISessionConfig(config, modelId, options) {
	const intent = options?.intent ?? "conversation";
	assertSupportedOpenAIIntent(intent);
	if (intent === "transcription") {
		for (const key of [
			"instructions",
			"voice",
			"outputModalities",
			"outputAudioFormat",
			"outputAudioTranscription",
			"tools"
		]) if (config[key] != null) throw new Error(`OpenAI realtime transcription sessions do not support '${key}'.`);
	}
	const session = {
		type: intent === "transcription" ? "transcription" : "realtime",
		...intent === "conversation" ? { model: modelId } : {}
	};
	if (intent === "conversation" && config.instructions != null) session.instructions = config.instructions;
	if (intent === "conversation" && config.outputModalities != null) session.output_modalities = config.outputModalities;
	const audio = {};
	if (intent === "transcription" || config.inputAudioFormat != null || config.inputAudioTranscription != null || config.turnDetection != null) {
		const input = {};
		if (config.inputAudioFormat != null) input.format = {
			type: config.inputAudioFormat.type,
			...config.inputAudioFormat.rate != null ? { rate: config.inputAudioFormat.rate } : {}
		};
		if (config.turnDetection != null) {
			if (config.turnDetection.type === "disabled") input.turn_detection = null;
			else {
				const td = { type: config.turnDetection.type === "server-vad" ? "server_vad" : "semantic_vad" };
				if (config.turnDetection.threshold != null) td.threshold = config.turnDetection.threshold;
				if (config.turnDetection.silenceDurationMs != null) td.silence_duration_ms = config.turnDetection.silenceDurationMs;
				if (config.turnDetection.prefixPaddingMs != null) td.prefix_padding_ms = config.turnDetection.prefixPaddingMs;
				input.turn_detection = td;
			}
		}
		if (intent === "transcription") input.transcription = {
			model: config.inputAudioTranscription?.model ?? modelId,
			...config.inputAudioTranscription?.language != null ? { language: config.inputAudioTranscription.language } : {},
			...config.inputAudioTranscription?.prompt != null ? { prompt: config.inputAudioTranscription.prompt } : {}
		};
		else if (config.inputAudioTranscription != null) input.transcription = {
			model: config.inputAudioTranscription.model ?? "gpt-realtime-whisper",
			...config.inputAudioTranscription.language != null ? { language: config.inputAudioTranscription.language } : {},
			...config.inputAudioTranscription.prompt != null ? { prompt: config.inputAudioTranscription.prompt } : {}
		};
		audio.input = input;
	}
	if (intent === "conversation" && (config.outputAudioFormat != null || config.voice != null)) {
		const output = {};
		if (config.outputAudioFormat != null) output.format = {
			type: config.outputAudioFormat.type,
			...config.outputAudioFormat.rate != null ? { rate: config.outputAudioFormat.rate } : {}
		};
		if (config.voice != null) output.voice = config.voice;
		audio.output = output;
	}
	if (Object.keys(audio).length > 0) session.audio = audio;
	if (intent === "conversation" && config.tools != null && config.tools.length > 0) {
		session.tools = config.tools.map((tool) => ({
			type: tool.type,
			name: tool.name,
			description: tool.description,
			parameters: tool.parameters
		}));
		session.tool_choice = "auto";
	}
	if (config.providerOptions != null) Object.assign(session, config.providerOptions);
	return session;
}
function assertSupportedOpenAIIntent(intent) {
	if (intent != null && intent !== "conversation" && intent !== "transcription") throw new Error(`OpenAI realtime session intent '${intent}' is not supported.`);
}
//#endregion
//#region src/realtime/openai-realtime-model.ts
var OpenAIRealtimeModel = class {
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.capabilities = {
			conversation: "turn-based",
			transports: ["websocket"],
			connections: ["client-secret-websocket", "server-websocket"]
		};
		this.modelId = modelId;
		this.provider = config.provider;
		this.config = config;
	}
	async doCreateClientSecret(options) {
		const fetchFn = this.config.fetch ?? fetch;
		const url = `${this.config.baseURL}/realtime/client_secrets`;
		const session = options.sessionConfig != null ? buildOpenAISessionConfig(options.sessionConfig, this.modelId) : {
			type: "realtime",
			model: this.modelId
		};
		const response = await fetchFn(url, {
			method: "POST",
			headers: {
				...await (0,dist/* resolve */.hd)(this.config.headers),
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				session,
				...options.expiresAfterSeconds != null ? { expires_after: {
					anchor: "created_at",
					seconds: options.expiresAfterSeconds
				} } : {}
			})
		});
		if (!response.ok) {
			const text = await response.text();
			throw new Error(`OpenAI realtime client secret request failed: ${response.status} ${text}`);
		}
		const data = await response.json();
		return {
			token: data.value,
			url: `wss://${new URL(this.config.baseURL).host}/v1/realtime?model=${encodeURIComponent(this.modelId)}`,
			expiresAt: data.expires_at
		};
	}
	getWebSocketConfig(options) {
		return {
			url: options.url,
			protocols: ["realtime", `openai-insecure-api-key.${options.token}`]
		};
	}
	getServerWebSocketConfig(options) {
		return (0,dist/* resolveWith */.H)(this.config.headers, (headers) => ({
			url: buildServerUrl(this.config.baseURL, this.modelId, options?.intent ?? "conversation"),
			headers: (0,dist/* removeUndefinedEntries */.RG)(headers)
		}));
	}
	parseServerEvent(raw) {
		return parseOpenAIRealtimeServerEvent(raw);
	}
	serializeClientEvent(event, options) {
		return serializeOpenAIRealtimeClientEvent(event, this.modelId, options);
	}
	buildSessionConfig(config, options) {
		return buildOpenAISessionConfig(config, this.modelId, options);
	}
};
/**
* Builds the upstream realtime WebSocket URL for a server-initiated connection.
* Transcription keeps the model in `session.update`; a `?model=` here would
* open a voice session instead.
*/
function buildServerUrl(baseURL, modelId, intent) {
	const url = new URL(baseURL);
	const base = `${url.protocol === "http:" ? "ws:" : "wss:"}//${url.host}${url.pathname.replace(/\/$/, "")}`;
	switch (intent) {
		case "transcription": return `${base}/realtime?intent=transcription`;
		case "conversation": return `${base}/realtime?model=${encodeURIComponent(modelId)}`;
		default: throw new Error(`OpenAI realtime session intent '${intent}' is not supported.`);
	}
}
//#endregion
//#region src/realtime/openai-realtime-factory.ts
function resolveRealtimeApi(modelId, { api } = {}) {
	if (api !== void 0) {
		if (api !== "live" && api !== "realtime") throw new provider_dist/* InvalidArgumentError */.Di({
			argument: "api",
			message: "OpenAI realtime api must be \"live\" or \"realtime\"."
		});
		return api;
	}
	return getOpenAIRealtimeModelEntry(modelId).requestConfig.realtime.api;
}
function createOpenAIRealtimeFactory(config) {
	const createModel = (modelId, options) => {
		const api = resolveRealtimeApi(modelId, options);
		const modelConfig = {
			...config,
			provider: `${config.provider}.${api}`
		};
		return api === "live" ? new OpenAIRealtimeModelLive(modelId, modelConfig) : new OpenAIRealtimeModel(modelId, modelConfig);
	};
	return Object.assign(createModel, { getToken: async (options) => {
		const model = createModel(options.model, options);
		if (model instanceof OpenAIRealtimeModelLive) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: "Short-lived OpenAI credentials for the Live API. Use server WebSocket setup via getServerWebSocketConfig() with a server-side API key instead." });
		const secret = await model.doCreateClientSecret({
			sessionConfig: options.sessionConfig,
			expiresAfterSeconds: options.expiresAfterSeconds
		});
		return {
			token: secret.token,
			url: secret.url,
			expiresAt: secret.expiresAt
		};
	} });
}
//#endregion
//#region src/speech/openai-speech-model-options.ts
/**
* Shape of the OpenAI speech model options. Exported so that routers that
* also call the OpenAI speech API (e.g. Azure) can accept these options under
* their own providerOptions key.
*/
const openaiSpeechModelOptionsShape = () => ({
	instructions: classic_schemas/* string */.YjP().nullish(),
	speed: classic_schemas/* number */.aig().min(.25).max(4).nullish()
});
const openaiSpeechModelOptionsSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc(openaiSpeechModelOptionsShape())));
//#endregion
//#region src/speech/openai-speech-model.ts
var OpenAISpeechModel = class OpenAISpeechModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAISpeechModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	async getArgs({ text, voice = "alloy", outputFormat = "mp3", speed, instructions, language, providerOptions }) {
		const warnings = [];
		const openAIOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openaiSpeechModelOptionsSchema
		});
		const requestBody = {
			model: this.modelId,
			input: text,
			voice,
			response_format: "mp3",
			speed,
			instructions
		};
		if (outputFormat) {
			if ([
				"mp3",
				"opus",
				"aac",
				"flac",
				"wav",
				"pcm"
			].includes(outputFormat)) requestBody.response_format = outputFormat;
			else warnings.push({
				type: "unsupported",
				feature: "outputFormat",
				details: `Unsupported output format: ${outputFormat}. Using mp3 instead.`
			});
		}
		if (openAIOptions) {
			const speechModelOptions = {
				speed: openAIOptions.speed ?? void 0,
				instructions: openAIOptions.instructions ?? void 0
			};
			for (const key in speechModelOptions) {
				const value = speechModelOptions[key];
				if (value !== void 0) requestBody[key] = value;
			}
		}
		if (language) warnings.push({
			type: "unsupported",
			feature: "language",
			details: `OpenAI speech models do not support language selection. Language parameter "${language}" was ignored.`
		});
		return {
			requestBody,
			warnings
		};
	}
	async doGenerate(options) {
		const currentDate = this.config._internal?.currentDate?.() ?? /* @__PURE__ */ new Date();
		const { requestBody, warnings } = await this.getArgs(options);
		const { value: audio, responseHeaders, rawValue: rawResponse } = await (0,dist/* postJsonToApi */.GU)({
			url: this.config.url({
				path: "/audio/speech",
				modelId: this.modelId
			}),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			body: requestBody,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createBinaryResponseHandler */.HD)(),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		return {
			audio,
			warnings,
			request: { body: JSON.stringify(requestBody) },
			response: {
				timestamp: currentDate,
				modelId: this.modelId,
				headers: responseHeaders,
				body: rawResponse
			}
		};
	}
};
//#endregion
//#region src/transcription/openai-transcription-api.ts
const openaiTranscriptionResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	text: classic_schemas/* string */.YjP(),
	language: classic_schemas/* string */.YjP().nullish(),
	languages: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({ code: classic_schemas/* string */.YjP() })).nullish(),
	duration: classic_schemas/* number */.aig().nullish(),
	words: classic_schemas/* array */.YOg(classic_schemas/* object */.Ikc({
		word: classic_schemas/* string */.YjP(),
		start: classic_schemas/* number */.aig(),
		end: classic_schemas/* number */.aig()
	})).nullish(),
	segments: classic_schemas/* array */.YOg(classic_schemas/* union */.KCZ([classic_schemas/* object */.Ikc({
		id: classic_schemas/* number */.aig(),
		seek: classic_schemas/* number */.aig(),
		start: classic_schemas/* number */.aig(),
		end: classic_schemas/* number */.aig(),
		text: classic_schemas/* string */.YjP(),
		tokens: classic_schemas/* array */.YOg(classic_schemas/* number */.aig()),
		temperature: classic_schemas/* number */.aig(),
		avg_logprob: classic_schemas/* number */.aig(),
		compression_ratio: classic_schemas/* number */.aig(),
		no_speech_prob: classic_schemas/* number */.aig()
	}), classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("transcript.text.segment"),
		id: classic_schemas/* string */.YjP(),
		start: classic_schemas/* number */.aig(),
		end: classic_schemas/* number */.aig(),
		text: classic_schemas/* string */.YjP(),
		speaker: classic_schemas/* string */.YjP()
	})])).nullish(),
	usage: classic_schemas/* record */.g1P(classic_schemas/* string */.YjP(), classic_schemas/* json */.Pq9()).nullish()
})));
//#endregion
//#region src/transcription/openai-transcription-model-options.ts
/**
* Shape of the OpenAI transcription model options. Exported so that routers
* that also call the OpenAI transcription API (e.g. Azure) can accept these
* options under their own providerOptions key.
*/
const openAITranscriptionModelOptionsShape = () => ({
	/**
	* Additional information to include in the transcription response.
	*/
	include: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional(),
	/**
	* The language of the input audio in ISO-639-1 format.
	*/
	language: classic_schemas/* string */.YjP().optional(),
	/**
	* Expected languages for REST transcription, e.g. with gpt-transcribe.
	* Use this instead of language. The API validates model support.
	*/
	languages: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional(),
	/**
	* Vocabulary hints for REST transcription, e.g. names or technical terms.
	* The API validates model support.
	*/
	keywords: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional(),
	/**
	* An optional text to guide the model's style or continue a previous audio segment.
	*/
	prompt: classic_schemas/* string */.YjP().optional(),
	/**
	* The sampling temperature, between 0 and 1.
	* @default 0
	*/
	temperature: classic_schemas/* number */.aig().min(0).max(1).default(0).optional(),
	/**
	* The timestamp granularities to populate for this transcription.
	* Defaults to ['segment'] when the response format is verbose_json.
	*/
	timestampGranularities: classic_schemas/* array */.YOg(classic_schemas/* enum */.k5n(["word", "segment"])).optional(),
	/**
	* The format of the transcription response.
	*/
	responseFormat: classic_schemas/* enum */.k5n([
		"json",
		"verbose_json",
		"diarized_json"
	]).optional(),
	/**
	* Controls how the audio is split into chunks before transcription.
	*/
	chunkingStrategy: classic_schemas/* union */.KCZ([classic_schemas/* literal */.euz("auto"), classic_schemas/* object */.Ikc({
		type: classic_schemas/* literal */.euz("server_vad"),
		threshold: classic_schemas/* number */.aig().min(0).max(1).optional(),
		prefixPaddingMs: classic_schemas/* number */.aig().int().min(0).optional(),
		silenceDurationMs: classic_schemas/* number */.aig().int().min(0).optional()
	})]).optional(),
	/**
	* Options for streaming transcription models such as `gpt-live-transcribe`.
	*/
	streaming: classic_schemas/* object */.Ikc({
		/**
		* Latency/accuracy tradeoff for realtime transcription.
		*/
		delay: classic_schemas/* enum */.k5n([
			"minimal",
			"low",
			"medium",
			"high",
			"xhigh"
		]).optional(),
		/**
		* Additional fields to include in realtime transcription events.
		*/
		include: classic_schemas/* array */.YOg(classic_schemas/* string */.YjP()).optional()
	}).optional()
});
const openAITranscriptionModelOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc(openAITranscriptionModelOptionsShape())));
//#endregion
//#region src/transcription/openai-transcription-model.ts
const languageMap = {
	afrikaans: "af",
	arabic: "ar",
	armenian: "hy",
	azerbaijani: "az",
	belarusian: "be",
	bosnian: "bs",
	bulgarian: "bg",
	catalan: "ca",
	chinese: "zh",
	croatian: "hr",
	czech: "cs",
	danish: "da",
	dutch: "nl",
	english: "en",
	estonian: "et",
	finnish: "fi",
	french: "fr",
	galician: "gl",
	german: "de",
	greek: "el",
	hebrew: "he",
	hindi: "hi",
	hungarian: "hu",
	icelandic: "is",
	indonesian: "id",
	italian: "it",
	japanese: "ja",
	kannada: "kn",
	kazakh: "kk",
	korean: "ko",
	latvian: "lv",
	lithuanian: "lt",
	macedonian: "mk",
	malay: "ms",
	marathi: "mr",
	maori: "mi",
	nepali: "ne",
	norwegian: "no",
	persian: "fa",
	polish: "pl",
	portuguese: "pt",
	romanian: "ro",
	russian: "ru",
	serbian: "sr",
	slovak: "sk",
	slovenian: "sl",
	spanish: "es",
	swahili: "sw",
	swedish: "sv",
	tagalog: "tl",
	tamil: "ta",
	thai: "th",
	turkish: "tr",
	ukrainian: "uk",
	urdu: "ur",
	vietnamese: "vi",
	welsh: "cy"
};
function isLanguageCode(language) {
	return language != null && /^[a-z]{2}$/.test(language);
}
var OpenAITranscriptionModel = class OpenAITranscriptionModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAITranscriptionModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	async getArgs({ audio, mediaType, providerOptions, timestampGranularities: requestedTimestampGranularities }) {
		const warnings = [];
		const openAIOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions,
			schema: openAITranscriptionModelOptions
		});
		const formData = new FormData();
		const blob = audio instanceof Uint8Array ? new Blob([audio]) : new Blob([(0,dist/* convertBase64ToUint8Array */.Z9)(audio)]);
		formData.append("model", this.modelId);
		const fileExtension = (0,dist/* mediaTypeToExtension */.HQ)(mediaType);
		formData.append("file", new File([blob], "audio", { type: mediaType }), `audio.${fileExtension}`);
		const { transcription: requestConfig } = getOpenAITranscriptionModelEntry(this.modelId).requestConfig;
		const responseFormat = openAIOptions?.responseFormat ?? requestConfig.responseFormat;
		const timestampGranularities = openAIOptions?.timestampGranularities ?? requestedTimestampGranularities ?? (responseFormat === "verbose_json" ? ["segment"] : void 0);
		for (const granularity of requestedTimestampGranularities ?? []) if (openAIOptions?.timestampGranularities != null && !openAIOptions.timestampGranularities.includes(granularity)) warnings.push({
			type: "unsupported",
			feature: "timestampGranularities",
			details: `The "${granularity}" timestamp granularity is excluded by providerOptions.openai.timestampGranularities.`
		});
		for (const granularity of timestampGranularities ?? []) if (responseFormat !== "verbose_json" && !(responseFormat === "diarized_json" && granularity === "segment")) warnings.push({
			type: "unsupported",
			feature: openAIOptions?.timestampGranularities != null ? "providerOptions.openai.timestampGranularities" : "timestampGranularities",
			details: `OpenAI transcription with the ${responseFormat ?? "default JSON"} response format does not support ${granularity} timestamps.`
		});
		const chunkingStrategy = openAIOptions?.chunkingStrategy ?? requestConfig.chunkingStrategy;
		const transcriptionModelOptions = {
			response_format: responseFormat,
			include: openAIOptions?.include,
			language: openAIOptions?.language,
			languages: openAIOptions?.languages,
			keywords: openAIOptions?.keywords,
			prompt: openAIOptions?.prompt,
			temperature: openAIOptions?.temperature,
			timestamp_granularities: responseFormat === "verbose_json" ? timestampGranularities : void 0
		};
		for (const [key, value] of Object.entries(transcriptionModelOptions)) if (value != null) {
			if (Array.isArray(value)) for (const item of value) formData.append(`${key}[]`, String(item));
			else formData.append(key, String(value));
		}
		if (chunkingStrategy != null) formData.append("chunking_strategy", typeof chunkingStrategy === "string" ? chunkingStrategy : JSON.stringify({
			type: chunkingStrategy.type,
			...chunkingStrategy.threshold != null && { threshold: chunkingStrategy.threshold },
			...chunkingStrategy.prefixPaddingMs != null && { prefix_padding_ms: chunkingStrategy.prefixPaddingMs },
			...chunkingStrategy.silenceDurationMs != null && { silence_duration_ms: chunkingStrategy.silenceDurationMs }
		}));
		return {
			formData,
			warnings
		};
	}
	async doGenerate(options) {
		if (getOpenAITranscriptionModelEntry(this.modelId).capabilities.transcription.transcription === false) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `non-streaming transcription with ${this.modelId}` });
		const currentDate = this.config._internal?.currentDate?.() ?? /* @__PURE__ */ new Date();
		const { formData, warnings } = await this.getArgs(options);
		const { value: response, responseHeaders, rawValue: rawResponse } = await (0,dist/* postFormDataToApi */.S)({
			url: this.config.url({
				path: "/audio/transcriptions",
				modelId: this.modelId
			}),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers),
			formData,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiTranscriptionResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const language = (isLanguageCode(response.language) ? response.language : response.language != null && Object.prototype.hasOwnProperty.call(languageMap, response.language) ? languageMap[response.language] : void 0) ?? (response.languages?.length === 1 && isLanguageCode(response.languages[0].code) ? response.languages[0].code : void 0);
		const diarizedSegments = response.segments?.flatMap((segment) => "speaker" in segment ? [{
			text: segment.text,
			startSecond: segment.start,
			endSecond: segment.end,
			speaker: segment.speaker
		}] : []);
		const words = response.words?.map((word) => ({
			text: word.word,
			startSecond: word.start,
			endSecond: word.end
		}));
		return {
			text: response.text,
			segments: response.segments?.map((segment) => ({
				text: segment.text,
				startSecond: segment.start,
				endSecond: segment.end
			})) ?? words ?? [],
			...words != null && words.length > 0 ? { words } : {},
			language,
			durationInSeconds: response.duration ?? (response.usage?.type === "duration" && typeof response.usage.seconds === "number" ? response.usage.seconds : void 0),
			warnings,
			...response.usage != null && { usage: response.usage },
			response: {
				timestamp: currentDate,
				modelId: this.modelId,
				headers: responseHeaders,
				body: rawResponse
			},
			...(diarizedSegments != null && diarizedSegments.length > 0 || response.languages != null) && { providerMetadata: { openai: {
				...diarizedSegments != null && diarizedSegments.length > 0 && { segments: diarizedSegments },
				...response.languages != null && { languages: response.languages }
			} } }
		};
	}
	async doStream(options) {
		const entry = getOpenAITranscriptionModelEntry(this.modelId);
		if (entry.capabilities.transcription.streaming !== true) throw new provider_dist/* UnsupportedFunctionalityError */.b8({ functionality: `streaming transcription with ${this.modelId}` });
		const currentDate = this.config._internal?.currentDate?.() ?? /* @__PURE__ */ new Date();
		const openAIOptions = await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions: options.providerOptions,
			schema: openAITranscriptionModelOptions
		});
		const warnings = [];
		const rawOpenAIOptions = options.providerOptions?.openai ?? {};
		for (const option of [
			"include",
			"languages",
			"keywords",
			"prompt",
			"temperature",
			"timestampGranularities"
		]) if (rawOpenAIOptions[option] != null) warnings.push({
			type: "unsupported",
			feature: `providerOptions.openai.${option}`,
			details: `OpenAI streaming transcription does not support ${option}.`
		});
		const supportsDelay = entry.capabilities.transcription.streamingDelay === true;
		if (!supportsDelay && openAIOptions?.streaming?.delay != null) warnings.push({
			type: "unsupported",
			feature: "providerOptions.openai.streaming.delay",
			details: `OpenAI streaming transcription with ${this.modelId} does not support delay.`
		});
		const headers = (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers);
		const sessionUpdate = buildOpenAIRealtimeTranscriptionSession({
			modelId: this.modelId,
			inputAudioFormat: options.inputAudioFormat,
			providerOptions: openAIOptions,
			supportsDelay
		});
		return {
			request: { body: sessionUpdate },
			response: {
				timestamp: currentDate,
				modelId: this.modelId
			},
			stream: createOpenAIRealtimeTranscriptionStream({
				webSocket: this.config.webSocket,
				url: (0,dist/* toWebSocketUrl */.S8)(this.config.url({
					path: "/realtime?intent=transcription",
					modelId: this.modelId
				})),
				headers,
				sessionUpdate,
				language: openAIOptions?.language,
				warnings,
				audio: options.audio,
				abortSignal: options.abortSignal,
				includeRawChunks: options.includeRawChunks
			})
		};
	}
};
function createOpenAIRealtimeTranscriptionStream({ webSocket, url, headers, sessionUpdate, language, warnings, audio, abortSignal, includeRawChunks }) {
	let finished = false;
	let cleanup = () => {};
	return new ReadableStream({
		start: (controller) => {
			const realtimeConnection = getOpenAIRealtimeConnection$1(headers);
			let audioReader;
			let connection;
			cleanup = (closeCode) => {
				if (audioReader != null) audioReader.cancel().catch(() => {});
				else audio.cancel().catch(() => {});
				connection?.close(closeCode);
			};
			const finishWithError = (error) => {
				if (finished) return;
				finished = true;
				cleanup();
				controller.error(error);
			};
			const finish = (text, id) => {
				if (finished) return;
				finished = true;
				if (id != null) controller.enqueue({
					type: "transcript-final",
					id,
					text
				});
				controller.enqueue({
					type: "finish",
					text,
					segments: [],
					language
				});
				controller.close();
				cleanup(1e3);
			};
			const sendAudio = async (socket) => {
				audioReader = audio.getReader();
				try {
					while (true) {
						const { done, value } = await audioReader.read();
						if (done || finished) break;
						socket.send(JSON.stringify({
							type: "input_audio_buffer.append",
							audio: (0,dist/* convertToBase64 */.ej)(value)
						}));
						await (0,dist/* waitForWebSocketBufferDrain */.E8)(socket);
					}
				} finally {
					audioReader.releaseLock();
					audioReader = void 0;
				}
				if (!finished) socket.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
			};
			connection = (0,dist/* connectToWebSocket */.L8)({
				url,
				protocols: realtimeConnection.protocols,
				headers: realtimeConnection.headers,
				webSocket,
				abortSignal,
				onAbort: finishWithError,
				onProcessingError: finishWithError,
				onOpen: (socket) => {
					controller.enqueue({
						type: "stream-start",
						warnings
					});
					socket.send(JSON.stringify(sessionUpdate));
					sendAudio(socket).catch(finishWithError);
				},
				onMessageText: async (text) => {
					const parsed = await (0,dist/* safeParseJSON */.N8)({ text });
					if (!parsed.success) return;
					const raw = parsed.value;
					if (includeRawChunks) controller.enqueue({
						type: "raw",
						rawValue: raw
					});
					switch (raw.type) {
						case "conversation.item.input_audio_transcription.delta":
							controller.enqueue({
								type: "transcript-delta",
								id: raw.item_id,
								delta: raw.delta ?? ""
							});
							break;
						case "conversation.item.input_audio_transcription.completed":
							finish(raw.transcript ?? "", raw.item_id);
							break;
						case "error": finishWithError(new Error(raw.error?.message ?? "OpenAI realtime error"));
					}
				},
				onSocketError: () => {
					finishWithError(/* @__PURE__ */ new Error("OpenAI realtime transcription error"));
				},
				onClose: () => {
					if (finished) return;
					finished = true;
					cleanup();
					controller.close();
				}
			});
		},
		cancel: () => {
			if (finished) return;
			finished = true;
			cleanup();
		}
	});
}
function buildOpenAIRealtimeTranscriptionSession({ modelId, inputAudioFormat, providerOptions, supportsDelay }) {
	return {
		type: "session.update",
		session: {
			type: "transcription",
			audio: { input: {
				format: {
					type: inputAudioFormat.type,
					...inputAudioFormat.rate != null ? { rate: inputAudioFormat.rate } : {}
				},
				transcription: {
					model: modelId,
					...providerOptions?.language != null ? getOpenAITranscriptionModelEntry(modelId).requestConfig.transcription.languageField === "languages" ? { languages: [providerOptions.language] } : { language: providerOptions.language } : {},
					...supportsDelay && providerOptions?.streaming?.delay != null ? { delay: providerOptions.streaming.delay } : {}
				},
				turn_detection: null
			} },
			...providerOptions?.streaming?.include != null ? { include: providerOptions.streaming.include } : {}
		}
	};
}
function getOpenAIRealtimeConnection$1(headers) {
	let authorization;
	for (const [key, value] of Object.entries(headers)) if (key.toLowerCase() === "authorization" && value != null) authorization = value;
	const token = authorization?.match(/^bearer\s+(.+)$/i)?.[1];
	if (token == null) return {
		protocols: ["realtime"],
		headers
	};
	return {
		protocols: ["realtime", `openai-insecure-api-key.${token}`],
		headers: Object.fromEntries(Object.entries(headers).filter(([key]) => key.toLowerCase() !== "authorization"))
	};
}
//#endregion
//#region src/speech-translation/openai-speech-translation-model-options.ts
const openAISpeechTranslationModelOptions = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({})));
//#endregion
//#region src/speech-translation/openai-speech-translation-model.ts
var OpenAISpeechTranslationModel = class OpenAISpeechTranslationModel {
	static [serde_dist/* WORKFLOW_SERIALIZE */.V](model) {
		return (0,dist/* serializeModelOptions */.Qf)({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [serde_dist/* WORKFLOW_DESERIALIZE */.C](options) {
		return new OpenAISpeechTranslationModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	async doStream(options) {
		if (options.targetLanguage == null) throw new provider_dist/* InvalidArgumentError */.Di({
			argument: "targetLanguage",
			message: `targetLanguage is required for translation model '${this.modelId}'.`
		});
		const currentDate = this.config._internal?.currentDate?.() ?? /* @__PURE__ */ new Date();
		await (0,dist/* parseProviderOptions */.xI)({
			provider: "openai",
			providerOptions: options.providerOptions,
			schema: openAISpeechTranslationModelOptions
		});
		const warnings = [];
		validateOpenAISpeechTranslationInputAudioFormat(options.inputAudioFormat);
		if (options.sourceLanguage != null) warnings.push({
			type: "unsupported",
			feature: "sourceLanguage",
			details: "The OpenAI Realtime translation API auto-detects the source language and does not accept a source language."
		});
		if (options.outputAudioFormat != null) warnings.push({
			type: "unsupported",
			feature: "outputAudioFormat",
			details: "The OpenAI Realtime translation API always outputs 24kHz 16-bit PCM audio and does not accept an output audio format."
		});
		const headers = (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers), options.headers);
		const sessionUpdate = buildOpenAIRealtimeSpeechTranslationSession({ targetLanguage: options.targetLanguage });
		return {
			request: { body: sessionUpdate },
			response: {
				timestamp: currentDate,
				modelId: this.modelId
			},
			stream: createOpenAIRealtimeSpeechTranslationStream({
				webSocket: this.config.webSocket,
				url: (0,dist/* toWebSocketUrl */.S8)(this.config.url({
					path: `/realtime/translations?model=${encodeURIComponent(this.modelId)}`,
					modelId: this.modelId
				})),
				headers,
				sessionUpdate,
				warnings,
				audio: options.audio,
				abortSignal: options.abortSignal,
				includeRawChunks: options.includeRawChunks
			})
		};
	}
};
function createOpenAIRealtimeSpeechTranslationStream({ webSocket, url, headers, sessionUpdate, warnings, audio, abortSignal, includeRawChunks }) {
	let finished = false;
	let cleanup = () => {};
	return new ReadableStream({
		start: (controller) => {
			const realtimeConnection = getOpenAIRealtimeConnection(headers);
			let audioReader;
			let connection;
			let sourceText = "";
			let translationText = "";
			cleanup = (closeCode) => {
				if (audioReader != null) audioReader.cancel().catch(() => {});
				else audio.cancel().catch(() => {});
				connection?.close(closeCode);
			};
			const finishWithError = (error) => {
				if (finished) return;
				finished = true;
				cleanup();
				controller.error(error);
			};
			const finish = () => {
				if (finished) return;
				finished = true;
				if (sourceText !== "") controller.enqueue({
					type: "source-transcript-final",
					text: sourceText
				});
				if (translationText !== "") controller.enqueue({
					type: "output-text-final",
					text: translationText
				});
				controller.enqueue({
					type: "finish",
					sourceText,
					outputText: translationText,
					usage: void 0
				});
				controller.close();
				cleanup(1e3);
			};
			const sendAudio = async (socket) => {
				audioReader = audio.getReader();
				try {
					while (true) {
						const { done, value } = await audioReader.read();
						if (done || finished) break;
						socket.send(JSON.stringify({
							type: "session.input_audio_buffer.append",
							audio: (0,dist/* convertToBase64 */.ej)(value)
						}));
						await (0,dist/* waitForWebSocketBufferDrain */.E8)(socket);
					}
				} finally {
					audioReader.releaseLock();
					audioReader = void 0;
				}
				if (!finished) socket.send(JSON.stringify({ type: "session.close" }));
			};
			connection = (0,dist/* connectToWebSocket */.L8)({
				url,
				protocols: realtimeConnection.protocols,
				headers: realtimeConnection.headers,
				webSocket,
				abortSignal,
				onAbort: finishWithError,
				onProcessingError: finishWithError,
				onOpen: (socket) => {
					controller.enqueue({
						type: "stream-start",
						warnings
					});
					socket.send(JSON.stringify(sessionUpdate));
					sendAudio(socket).catch(finishWithError);
				},
				onMessageText: async (text) => {
					if (finished) return;
					const parsed = await (0,dist/* safeParseJSON */.N8)({ text });
					if (!parsed.success) return;
					const raw = parsed.value;
					if (includeRawChunks) controller.enqueue({
						type: "raw",
						rawValue: raw
					});
					switch (raw.type) {
						case "session.output_audio.delta":
							if (raw.delta) controller.enqueue({
								type: "audio",
								audio: raw.delta
							});
							break;
						case "session.output_transcript.delta":
							translationText += raw.delta ?? "";
							controller.enqueue({
								type: "output-text-delta",
								delta: raw.delta ?? ""
							});
							break;
						case "session.input_transcript.delta":
							sourceText += raw.delta ?? "";
							controller.enqueue({
								type: "source-transcript-delta",
								delta: raw.delta ?? ""
							});
							break;
						case "session.closed":
							finish();
							break;
						case "error": controller.enqueue({
							type: "error",
							error: new Error(raw.error?.message ?? "OpenAI realtime error")
						});
					}
				},
				onSocketError: () => {
					finishWithError(/* @__PURE__ */ new Error("OpenAI realtime translation error"));
				},
				onClose: ({ code, reason }) => {
					if (finished) return;
					finishWithError(/* @__PURE__ */ new Error(`OpenAI realtime translation WebSocket closed unexpectedly before finishing (code ${code ?? "unknown"}${reason ? `, reason: ${reason}` : ""}).`));
				}
			});
		},
		cancel: () => {
			if (finished) return;
			finished = true;
			cleanup();
		}
	});
}
function buildOpenAIRealtimeSpeechTranslationSession({ targetLanguage }) {
	return {
		type: "session.update",
		session: { audio: {
			input: {
				transcription: { model: "gpt-realtime-whisper" },
				noise_reduction: null
			},
			output: { language: targetLanguage }
		} }
	};
}
function validateOpenAISpeechTranslationInputAudioFormat(inputAudioFormat) {
	if (inputAudioFormat.type !== "audio/pcm" || inputAudioFormat.rate != null && inputAudioFormat.rate !== 24e3) throw new provider_dist/* InvalidArgumentError */.Di({
		argument: "inputAudioFormat",
		message: "The OpenAI Realtime translation API only supports 24kHz 16-bit PCM input audio."
	});
}
function getOpenAIRealtimeConnection(headers) {
	let authorization;
	for (const [key, value] of Object.entries(headers)) if (key.toLowerCase() === "authorization" && value != null) authorization = value;
	const token = authorization?.match(/^bearer\s+(.+)$/i)?.[1];
	if (token == null) return {
		protocols: ["realtime"],
		headers
	};
	return {
		protocols: ["realtime", `openai-insecure-api-key.${token}`],
		headers: Object.fromEntries(Object.entries(headers).filter(([key]) => key.toLowerCase() !== "authorization"))
	};
}
//#endregion
//#region src/skills/openai-skills-api.ts
const openaiSkillResponseSchema = (0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	name: classic_schemas/* string */.YjP().nullish(),
	description: classic_schemas/* string */.YjP().nullish(),
	default_version: classic_schemas/* string */.YjP().nullish(),
	latest_version: classic_schemas/* string */.YjP().nullish(),
	created_at: classic_schemas/* number */.aig(),
	updated_at: classic_schemas/* number */.aig().nullish()
})));
(0,dist/* lazySchema */.ID)(() => (0,dist/* zodSchema */.C_)(classic_schemas/* object */.Ikc({
	id: classic_schemas/* string */.YjP(),
	version: classic_schemas/* string */.YjP().nullish(),
	name: classic_schemas/* string */.YjP().nullish(),
	description: classic_schemas/* string */.YjP().nullish()
})));
//#endregion
//#region src/skills/openai-skills.ts
var OpenAISkills = class {
	get provider() {
		return this.config.provider;
	}
	constructor(config) {
		this.config = config;
		this.specificationVersion = "v4";
	}
	async uploadSkill(params) {
		const warnings = [];
		if (params.displayTitle != null) warnings.push({
			type: "unsupported",
			feature: "displayTitle"
		});
		const formData = new FormData();
		for (const file of params.files) {
			const content = (0,dist/* convertInlineFileDataToUint8Array */.XQ)(file.data);
			formData.append("files[]", new Blob([content]), file.path);
		}
		const { value: response } = await (0,dist/* postFormDataToApi */.S)({
			url: this.config.url({ path: "/skills" }),
			headers: (0,dist/* combineHeaders */.m2)(await (0,dist/* resolve */.hd)(this.config.headers)),
			formData,
			failedResponseHandler: openaiFailedResponseHandler,
			successfulResponseHandler: (0,dist/* createJsonResponseHandler */.cV)(openaiSkillResponseSchema),
			fetch: this.config.fetch
		});
		return {
			providerReference: { openai: response.id },
			...response.name != null ? { name: response.name } : {},
			...response.description != null ? { description: response.description } : {},
			...response.latest_version != null ? { latestVersion: response.latest_version } : {},
			providerMetadata: { openai: {
				...response.default_version != null ? { defaultVersion: response.default_version } : {},
				...response.created_at != null ? { createdAt: response.created_at } : {},
				...response.updated_at != null ? { updatedAt: response.updated_at } : {}
			} },
			warnings
		};
	}
};
//#endregion
//#region src/version.ts
const VERSION = "4.0.123";
//#endregion
//#region src/openai-provider.ts
/**
* Create an OpenAI provider instance.
*/
function createOpenAI(options = {}) {
	const baseURL = (0,dist/* withoutTrailingSlash */.ae)((0,dist/* validateBaseURL */.Nv)((0,dist/* loadOptionalSetting */.x3)({
		settingValue: options.baseURL,
		environmentVariableName: "OPENAI_BASE_URL"
	}))) ?? "https://api.openai.com/v1";
	const providerName = options.name ?? "openai";
	const getHeaders = () => (0,dist/* resolveWith */.H)(options.apiKey, (apiKey) => (0,dist/* withUserAgentSuffix */.WZ)({
		Authorization: `Bearer ${(0,dist/* loadApiKey */.WL)({
			apiKey,
			environmentVariableName: "OPENAI_API_KEY",
			description: "OpenAI"
		})}`,
		"OpenAI-Organization": options.organization,
		"OpenAI-Project": options.project,
		...options.headers
	}, `ai-sdk-openai/${VERSION}`));
	const createChatModel = (modelId) => new OpenAIChatLanguageModel(modelId, {
		provider: `${providerName}.chat`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createCompletionModel = (modelId) => new OpenAICompletionLanguageModel(modelId, {
		provider: `${providerName}.completion`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createEmbeddingModel = (modelId) => new OpenAIEmbeddingModel(modelId, {
		provider: `${providerName}.embedding`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createImageModel = (modelId) => new OpenAIImageModel(modelId, {
		provider: `${providerName}.image`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createTranscriptionModel = (modelId) => new OpenAITranscriptionModel(modelId, {
		provider: `${providerName}.transcription`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch,
		webSocket: options.webSocket
	});
	const createSpeechTranslationModel = (modelId) => new OpenAISpeechTranslationModel(modelId, {
		provider: `${providerName}.speech-translation`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch,
		webSocket: options.webSocket
	});
	const createSpeechModel = (modelId) => new OpenAISpeechModel(modelId, {
		provider: `${providerName}.speech`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createFiles = () => new OpenAIFiles({
		provider: `${providerName}.files`,
		baseURL,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createSkills = () => new OpenAISkills({
		provider: `${providerName}.skills`,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createLanguageModel = (modelId) => {
		if (new.target) throw new Error("The OpenAI model function cannot be called with the new keyword.");
		return createResponsesModel(modelId);
	};
	const createResponsesModel = (modelId) => {
		return new OpenAIResponsesLanguageModel(modelId, {
			provider: `${providerName}.responses`,
			baseURL,
			url: ({ path }) => `${baseURL}${path}`,
			headers: getHeaders,
			fetch: options.fetch,
			fileIdPrefixes: ["file-"]
		});
	};
	const createBatch = () => new OpenAIBatch({
		provider: `${providerName}.batch`,
		maxLineBytes: options.batchResultDownloads?.maxLineBytes,
		config: {
			provider: `${providerName}.responses`,
			baseURL,
			url: ({ path }) => `${baseURL}${path}`,
			headers: getHeaders,
			fetch: options.fetch,
			fileIdPrefixes: ["file-"]
		}
	});
	const provider = function(modelId) {
		return createLanguageModel(modelId);
	};
	provider.specificationVersion = "v4";
	provider.languageModel = createLanguageModel;
	provider.chat = createChatModel;
	provider.completion = createCompletionModel;
	provider.responses = createResponsesModel;
	provider.decisionModel = (modelId) => new DecisionOpenAIModel(modelId, {
		baseURL,
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch,
		provider: `${providerName}.decision`
	});
	provider.evaluationModel = provider.decisionModel;
	provider.extractionModel = (modelId) => new experimental_extraction/* Experimental_ExtractionLanguageModel */.k({
		model: createLanguageModel(modelId),
		provider: `${providerName}.extraction`
	});
	provider.embedding = createEmbeddingModel;
	provider.embeddingModel = createEmbeddingModel;
	provider.textEmbedding = createEmbeddingModel;
	provider.textEmbeddingModel = createEmbeddingModel;
	provider.image = createImageModel;
	provider.imageModel = createImageModel;
	provider.transcription = createTranscriptionModel;
	provider.transcriptionModel = createTranscriptionModel;
	provider.translation = createSpeechTranslationModel;
	provider.speechTranslationModel = createSpeechTranslationModel;
	provider.speech = createSpeechModel;
	provider.speechModel = createSpeechModel;
	provider.files = createFiles;
	provider.skills = createSkills;
	provider.experimental_batch = createBatch;
	provider.experimental_realtime = createOpenAIRealtimeFactory({
		provider: providerName,
		baseURL,
		headers: getHeaders,
		fetch: options.fetch
	});
	provider.tools = openaiTools;
	return provider;
}
/**
* Default OpenAI provider instance.
*/
const openai = createOpenAI();
//#endregion


//# sourceMappingURL=index.js.map

/***/ })

};
