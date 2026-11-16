export const id = 567;
export const ids = [567];
export const modules = {

/***/ 73266:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  W: () => (/* binding */ DEFAULT_MAX_DOWNLOAD_SIZE),
  nV: () => (/* binding */ DownloadError),
  cI: () => (/* binding */ EMBEDDING_MODEL_MAX_INPUT_BYTES_PER_CALL),
  ao: () => (/* binding */ EMBEDDING_MODEL_PROVIDER_OPTIONS_TRANSFORMER),
  be: () => (/* binding */ SPEECH_STREAM_START_FRAME_TYPE),
  Vw: () => (/* binding */ SPEECH_STREAM_TEXT_DELTA_FRAME_TYPE),
  BR: () => (/* binding */ SPEECH_STREAM_TEXT_DONE_FRAME_TYPE),
  Et: () => (/* binding */ TRANSCRIPTION_STREAM_AUDIO_DONE_FRAME_TYPE),
  dG: () => (/* binding */ TRANSCRIPTION_STREAM_START_FRAME_TYPE),
  HE: () => (/* binding */ StreamingToolCallTracker),
  _j: () => (/* binding */ asArray),
  mD: () => (/* binding */ asSchema),
  aI: () => (/* binding */ cancelResponseBody),
  m2: () => (/* binding */ combineHeaders),
  L8: () => (/* binding */ connectToWebSocket),
  NR: () => (/* binding */ convertAsyncIteratorToReadableStream),
  Z9: () => (/* binding */ convertBase64ToUint8Array),
  XQ: () => (/* binding */ convertInlineFileDataToUint8Array),
  hr: () => (/* binding */ convertJsonResponseToolStream),
  ej: () => (/* binding */ convertToBase64),
  jW: () => (/* binding */ convertToFormData),
  n_: () => (/* binding */ convertUint8ArrayToBase64),
  HD: () => (/* binding */ createBinaryResponseHandler),
  JM: () => (/* binding */ createBinaryStreamResponseHandler),
  Ds: () => (/* binding */ createEventSourceResponseHandler),
  hK: () => (/* binding */ createIdGenerator),
  sl: () => (/* binding */ createJsonErrorResponseHandler),
  ny: () => (/* binding */ createJsonLinesResponseHandler),
  cV: () => (/* binding */ createJsonResponseHandler),
  qX: () => (/* binding */ createLanguageModelResponseMetadata),
  EK: () => (/* binding */ createNullLanguageModelUsage),
  hL: () => (/* binding */ createProviderDefinedToolFactory),
  J2: () => (/* binding */ createProviderDefinedToolFactoryWithOutputSchema),
  z: () => (/* binding */ createProviderExecutedToolFactory),
  iH: () => (/* binding */ createProviderStreamError),
  CR: () => (/* binding */ createToolNameMapping),
  cb: () => (/* binding */ delay),
  _$: () => (/* binding */ deleteFromApi),
  sM: () => (/* binding */ detectMediaType),
  WN: () => (/* binding */ downloadBlob),
  $9: () => (/* binding */ encodePathSegment),
  o8: () => (/* binding */ executeTool),
  ls: () => (/* binding */ getToolCaller),
  mY: () => (/* binding */ parseSpeechStreamPart),
  CY: () => (/* binding */ parseTranscriptionStreamPart),
  rV: () => (/* binding */ toolCaller),
  CI: () => (/* binding */ fetchUntrustedUrl),
  ur: () => (/* binding */ filterNullable),
  $C: () => (/* binding */ generateId),
  $b: () => (/* binding */ getFromApi),
  G1: () => (/* binding */ getRuntimeEnvironmentUserAgent),
  yu: () => (/* binding */ getTopLevelMediaType),
  zf: () => (/* binding */ isAbortError),
  mw: () => (/* binding */ isArrayBuffer),
  Pe: () => (/* binding */ isBuffer),
  g6: () => (/* binding */ isCustomReasoning),
  v0: () => (/* binding */ isExecutableTool),
  Cs: () => (/* binding */ isFullMediaType),
  R: () => (/* binding */ isNonNullable),
  bt: () => (/* binding */ isProviderReference),
  ks: () => (/* binding */ isProviderStreamError),
  u4: () => (/* binding */ isRecord),
  J6: () => (/* binding */ isSameOrigin),
  mg: () => (/* binding */ isUint8Array),
  qs: () => (/* binding */ isUrlSupported),
  ID: () => (/* binding */ lazySchema),
  WL: () => (/* binding */ loadApiKey),
  x3: () => (/* binding */ loadOptionalSetting),
  sq: () => (/* binding */ mapReasoningToProviderBudget),
  jv: () => (/* binding */ mapReasoningToProviderEffort),
  HQ: () => (/* binding */ mediaTypeToExtension),
  F8: () => (/* binding */ normalizeBatchRequestCounts),
  qx: () => (/* binding */ normalizeHeaders),
  y6: () => (/* binding */ parseJSON),
  _Z: () => (/* binding */ parseJsonEventStream),
  xI: () => (/* binding */ parseProviderOptions),
  S: () => (/* binding */ postFormDataToApi),
  GU: () => (/* binding */ postJsonToApi),
  st: () => (/* binding */ postMultipartStreamToApi),
  SP: () => (/* binding */ postToApi),
  cS: () => (/* binding */ readResponseWithSizeLimit),
  IR: () => (/* binding */ redactTelemetryValue),
  RG: () => (/* binding */ removeUndefinedEntries),
  hd: () => (/* binding */ resolve),
  SL: () => (/* binding */ resolveFullMediaType),
  Wo: () => (/* binding */ resolveProviderOptions),
  p5: () => (/* binding */ resolveProviderReference),
  H: () => (/* binding */ resolveWith),
  yW: () => (/* binding */ retryWithExponentialBackoff),
  N8: () => (/* binding */ safeParseJSON),
  ZZ: () => (/* binding */ safeValidateTypes),
  ZA: () => (/* binding */ secureJsonParse),
  Qf: () => (/* binding */ serializeModelOptions),
  f3: () => (/* binding */ stringifyWithBigIntAndCycles),
  S8: () => (/* binding */ toWebSocketUrl),
  Nv: () => (/* binding */ validateBaseURL),
  k5: () => (/* binding */ validateTypes),
  E8: () => (/* binding */ waitForWebSocketBufferDrain),
  jN: () => (/* binding */ withTelemetryRedaction),
  WZ: () => (/* binding */ withUserAgentSuffix),
  ae: () => (/* binding */ withoutTrailingSlash),
  C_: () => (/* binding */ zodSchema)
});

// UNUSED EXPORTS: DelayedPromise, EventSourceParserStream, SerializationError, VERSION, WORKFLOW_DESERIALIZE, WORKFLOW_SERIALIZE, convertImageModelFileToDataUri, createStatusCodeErrorResponseHandler, dynamicTool, experimental_parseSpeechStreamClientFrame, experimental_parseTranscriptionStreamClientFrame, experimental_serializeSpeechStreamPart, experimental_serializeTranscriptionStreamPart, extractLines, extractResponseHeaders, fetchWithValidatedEndpoint, fetchWithValidatedRedirects, getErrorMessage, getWebSocketConstructor, injectJsonInstructionIntoMessages, isBrowserRuntime, isParsableJson, isValidHostnamePart, jsonSchema, loadSetting, readWebSocketMessageText, stripFileExtension, tool, validateDownloadUrl

// EXTERNAL MODULE: ../../node_modules/.pnpm/@ai-sdk+provider@4.0.38/node_modules/@ai-sdk/provider/dist/index.js
var dist = __webpack_require__(66110);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/parse.js + 1 modules
var parse = __webpack_require__(23353);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/core.js
var core = __webpack_require__(48149);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/json-schema-processors.js
var json_schema_processors = __webpack_require__(72514);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/locales/en.js
var en = __webpack_require__(54611);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/eventsource-parser@3.1.1/node_modules/eventsource-parser/dist/index.js
class ParseError extends Error {
  constructor(message, options) {
    super(message), this.name = "ParseError", this.type = options.type, this.field = options.field, this.value = options.value, this.line = options.line;
  }
}
const LF = 10, CR = 13, SPACE = 32;
function noop(_arg) {
}
function createParser(config) {
  if (typeof config == "function")
    throw new TypeError(
      "`config` must be an object, got a function instead. Did you mean `createParser({onEvent: fn})`?"
    );
  const { onEvent = noop, onError = noop, onRetry = noop, onComment, maxBufferSize } = config, pendingFragments = [];
  let pendingFragmentsLength = 0, isFirstChunk = !0, id, data = "", dataLines = 0, eventType, terminated = !1;
  function feed(chunk) {
    if (terminated)
      throw new Error(
        "Cannot feed parser: it was terminated after exceeding the configured max buffer size. Call `reset()` to resume parsing."
      );
    if (isFirstChunk && (isFirstChunk = !1, chunk.charCodeAt(0) === 239 && chunk.charCodeAt(1) === 187 && chunk.charCodeAt(2) === 191 && (chunk = chunk.slice(3))), pendingFragments.length === 0) {
      const trailing2 = processLines(chunk);
      trailing2 !== "" && (pendingFragments.push(trailing2), pendingFragmentsLength = trailing2.length), checkBufferSize();
      return;
    }
    if (chunk.indexOf(`
`) === -1 && chunk.indexOf("\r") === -1) {
      pendingFragments.push(chunk), pendingFragmentsLength += chunk.length, checkBufferSize();
      return;
    }
    pendingFragments.push(chunk);
    const input = pendingFragments.join("");
    pendingFragments.length = 0, pendingFragmentsLength = 0;
    const trailing = processLines(input);
    trailing !== "" && (pendingFragments.push(trailing), pendingFragmentsLength = trailing.length), checkBufferSize();
  }
  function checkBufferSize() {
    maxBufferSize !== void 0 && (pendingFragmentsLength + data.length <= maxBufferSize || (terminated = !0, pendingFragments.length = 0, pendingFragmentsLength = 0, id = void 0, data = "", dataLines = 0, eventType = void 0, onError(
      new ParseError(`Buffered data exceeded max buffer size of ${maxBufferSize} characters`, {
        type: "max-buffer-size-exceeded"
      })
    )));
  }
  function processLines(chunk) {
    let searchIndex = 0;
    if (chunk.indexOf("\r") === -1) {
      let lfIndex = chunk.indexOf(`
`, searchIndex);
      for (; lfIndex !== -1; ) {
        if (searchIndex === lfIndex) {
          dataLines > 0 && onEvent({ id, event: eventType, data }), id = void 0, data = "", dataLines = 0, eventType = void 0, searchIndex = lfIndex + 1, lfIndex = chunk.indexOf(`
`, searchIndex);
          continue;
        }
        const firstCharCode = chunk.charCodeAt(searchIndex);
        if (isDataPrefix(chunk, searchIndex, firstCharCode)) {
          const valueStart = chunk.charCodeAt(searchIndex + 5) === SPACE ? searchIndex + 6 : searchIndex + 5, value = chunk.slice(valueStart, lfIndex);
          if (dataLines === 0 && chunk.charCodeAt(lfIndex + 1) === LF) {
            onEvent({ id, event: eventType, data: value }), id = void 0, data = "", eventType = void 0, searchIndex = lfIndex + 2, lfIndex = chunk.indexOf(`
`, searchIndex);
            continue;
          }
          data = dataLines === 0 ? value : `${data}
${value}`, dataLines++;
        } else isEventPrefix(chunk, searchIndex, firstCharCode) ? eventType = chunk.slice(
          chunk.charCodeAt(searchIndex + 6) === SPACE ? searchIndex + 7 : searchIndex + 6,
          lfIndex
        ) || void 0 : parseLine(chunk, searchIndex, lfIndex);
        searchIndex = lfIndex + 1, lfIndex = chunk.indexOf(`
`, searchIndex);
      }
      return chunk.slice(searchIndex);
    }
    for (; searchIndex < chunk.length; ) {
      const crIndex = chunk.indexOf("\r", searchIndex), lfIndex = chunk.indexOf(`
`, searchIndex);
      let lineEnd = -1;
      if (crIndex !== -1 && lfIndex !== -1 ? lineEnd = crIndex < lfIndex ? crIndex : lfIndex : crIndex !== -1 ? crIndex === chunk.length - 1 ? lineEnd = -1 : lineEnd = crIndex : lfIndex !== -1 && (lineEnd = lfIndex), lineEnd === -1)
        break;
      parseLine(chunk, searchIndex, lineEnd), searchIndex = lineEnd + 1, chunk.charCodeAt(searchIndex - 1) === CR && chunk.charCodeAt(searchIndex) === LF && searchIndex++;
    }
    return chunk.slice(searchIndex);
  }
  function parseLine(chunk, start, end) {
    if (start === end) {
      dispatchEvent();
      return;
    }
    const firstCharCode = chunk.charCodeAt(start);
    if (isDataPrefix(chunk, start, firstCharCode)) {
      const valueStart = chunk.charCodeAt(start + 5) === SPACE ? start + 6 : start + 5, value2 = chunk.slice(valueStart, end);
      data = dataLines === 0 ? value2 : `${data}
${value2}`, dataLines++;
      return;
    }
    if (isEventPrefix(chunk, start, firstCharCode)) {
      eventType = chunk.slice(chunk.charCodeAt(start + 6) === SPACE ? start + 7 : start + 6, end) || void 0;
      return;
    }
    if (firstCharCode === 105 && chunk.charCodeAt(start + 1) === 100 && chunk.charCodeAt(start + 2) === 58) {
      const value2 = chunk.slice(chunk.charCodeAt(start + 3) === SPACE ? start + 4 : start + 3, end);
      value2.includes("\0") || (id = value2);
      return;
    }
    if (firstCharCode === 58) {
      if (onComment) {
        const line2 = chunk.slice(start, end);
        onComment(line2.slice(chunk.charCodeAt(start + 1) === SPACE ? 2 : 1));
      }
      return;
    }
    const line = chunk.slice(start, end), fieldSeparatorIndex = line.indexOf(":");
    if (fieldSeparatorIndex === -1) {
      processField(line, "", line);
      return;
    }
    const field = line.slice(0, fieldSeparatorIndex), offset = line.charCodeAt(fieldSeparatorIndex + 1) === SPACE ? 2 : 1, value = line.slice(fieldSeparatorIndex + offset);
    processField(field, value, line);
  }
  function processField(field, value, line) {
    switch (field) {
      case "event":
        eventType = value || void 0;
        break;
      case "data":
        data = dataLines === 0 ? value : `${data}
${value}`, dataLines++;
        break;
      case "id":
        value.includes("\0") || (id = value);
        break;
      case "retry":
        /^\d+$/.test(value) ? onRetry(parseInt(value, 10)) : onError(
          new ParseError(`Invalid \`retry\` value: "${value}"`, {
            type: "invalid-retry",
            value,
            line
          })
        );
        break;
      default:
        onError(
          new ParseError(
            `Unknown field "${field.length > 20 ? `${field.slice(0, 20)}\u2026` : field}"`,
            { type: "unknown-field", field, value, line }
          )
        );
        break;
    }
  }
  function dispatchEvent() {
    dataLines > 0 && onEvent({
      id,
      event: eventType,
      data
    }), id = void 0, data = "", dataLines = 0, eventType = void 0;
  }
  function reset(options = {}) {
    if (options.consume && pendingFragments.length > 0) {
      const incompleteLine = pendingFragments.join("");
      parseLine(incompleteLine, 0, incompleteLine.length);
    }
    isFirstChunk = !0, id = void 0, data = "", dataLines = 0, eventType = void 0, pendingFragments.length = 0, pendingFragmentsLength = 0, terminated = !1;
  }
  return { feed, reset };
}
function isDataPrefix(chunk, i, firstCharCode) {
  return firstCharCode === 100 && chunk.charCodeAt(i + 1) === 97 && chunk.charCodeAt(i + 2) === 116 && chunk.charCodeAt(i + 3) === 97 && chunk.charCodeAt(i + 4) === 58;
}
function isEventPrefix(chunk, i, firstCharCode) {
  return firstCharCode === 101 && chunk.charCodeAt(i + 1) === 118 && chunk.charCodeAt(i + 2) === 101 && chunk.charCodeAt(i + 3) === 110 && chunk.charCodeAt(i + 4) === 116 && chunk.charCodeAt(i + 5) === 58;
}

//# sourceMappingURL=index.js.map

;// CONCATENATED MODULE: ../../node_modules/.pnpm/eventsource-parser@3.1.1/node_modules/eventsource-parser/dist/stream.js


class EventSourceParserStream extends TransformStream {
  constructor({ onError, onRetry, onComment, maxBufferSize } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error) {
            typeof onError == "function" && onError(error), (onError === "terminate" || error.type === "max-buffer-size-exceeded") && controller.error(error);
          },
          onRetry,
          onComment,
          maxBufferSize
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
}

//# sourceMappingURL=stream.js.map

// EXTERNAL MODULE: ../../node_modules/.pnpm/@workflow+serde@4.1.0/node_modules/@workflow/serde/dist/index.js
var serde_dist = __webpack_require__(23428);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/@ai-sdk+provider-utils@5.0.81_zod@4.6.7/node_modules/@ai-sdk/provider-utils/dist/index.js






//#region src/as-array.ts
/**
* Normalizes a possibly undefined or non-array value into an array.
*/
function asArray(value) {
	return value === void 0 ? [] : Array.isArray(value) ? value : [value];
}
//#endregion
//#region src/combine-headers.ts
function combineHeaders(...headers) {
	return headers.reduce((combinedHeaders, currentHeaders) => ({
		...combinedHeaders,
		...currentHeaders
	}), {});
}
//#endregion
//#region src/remove-undefined-entries.ts
/**
* Removes entries from a record where the value is null or undefined.
* @param record - The input object whose entries may be null or undefined.
* @returns A new object containing only entries with non-null and non-undefined values.
*/
function removeUndefinedEntries(record) {
	return Object.fromEntries(Object.entries(record).filter(([_key, value]) => value != null));
}
//#endregion
//#region src/delay.ts
/**
* Creates a Promise that resolves after a specified delay
* @param delayInMs - The delay duration in milliseconds. If null or undefined, resolves immediately.
* @param signal - Optional AbortSignal to cancel the delay
* @returns A Promise that resolves after the specified delay
* @throws {DOMException} When the signal is aborted
*/
async function delay(delayInMs, options) {
	if (delayInMs == null) return;
	const signal = options?.abortSignal;
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(createAbortError());
			return;
		}
		const timeoutId = setTimeout(() => {
			cleanup();
			resolve();
		}, delayInMs);
		const cleanup = () => {
			clearTimeout(timeoutId);
			signal?.removeEventListener("abort", onAbort);
		};
		const onAbort = () => {
			cleanup();
			reject(createAbortError());
		};
		signal?.addEventListener("abort", onAbort);
	});
}
function createAbortError() {
	return new DOMException("Delay was aborted", "AbortError");
}
//#endregion
//#region src/websocket.ts
function getWebSocketConstructor(webSocket) {
	const WebSocketConstructor = webSocket ?? globalThis.WebSocket;
	if (WebSocketConstructor == null) throw new Error("No WebSocket implementation available.");
	return WebSocketConstructor;
}
/**
* Converts an http(s) URL to the corresponding ws(s) URL.
*/
function toWebSocketUrl(url) {
	const wsUrl = new URL(url);
	if (wsUrl.protocol === "http:") wsUrl.protocol = "ws:";
	else if (wsUrl.protocol === "https:") wsUrl.protocol = "wss:";
	return wsUrl;
}
const textDecoder$1 = new TextDecoder();
/**
* Reads WebSocket message data as text, handling string, binary,
* and Blob payloads.
*/
async function readWebSocketMessageText(data) {
	if (typeof data === "string") return data;
	if (data instanceof ArrayBuffer) return textDecoder$1.decode(data);
	if (ArrayBuffer.isView(data)) return textDecoder$1.decode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return data.text();
	return String(data);
}
const WEBSOCKET_OPEN_STATE = 1;
/**
* Waits until the socket's send buffer drains below `highWaterMark` bytes.
* No-op for implementations that do not expose `bufferedAmount`. There is no
* portable drain event, so this polls. Returns as soon as the socket is no
* longer open or the signal aborts — `bufferedAmount` never drains on a
* closed socket, so waiting on would poll forever.
*/
async function waitForWebSocketBufferDrain(socket, { highWaterMark = 1048576, pollIntervalMs = 20, abortSignal } = {}) {
	while (socket.readyState === WEBSOCKET_OPEN_STATE && (socket.bufferedAmount ?? 0) > highWaterMark) {
		if (abortSignal?.aborted === true) return;
		await delay(pollIntervalMs);
	}
}
//#endregion
//#region src/connect-to-websocket.ts
/**
* Opens a WebSocket for a provider model, owning the transport-generic layer
* (analogous to `postToApi` for HTTP): constructor resolution, header hygiene,
* abort wiring, and message decoding. Callers own the URL, the auth channel
* (subprotocols vs headers), and the wire protocol.
*/
function connectToWebSocket({ url, protocols, headers, webSocket, abortSignal, onOpen, onMessageText, onProcessingError, onSocketError, onClose, onAbort }) {
	let socket;
	let abortListener;
	const close = (code) => {
		if (abortListener != null) {
			abortSignal?.removeEventListener("abort", abortListener);
			abortListener = void 0;
		}
		try {
			socket?.close(code);
		} catch {}
	};
	if (abortSignal?.aborted) {
		onAbort?.(abortSignal.reason ?? /* @__PURE__ */ new Error("Aborted"));
		return {
			socket: void 0,
			close
		};
	}
	try {
		socket = new (getWebSocketConstructor(webSocket))(url, protocols, { headers: removeUndefinedEntries(headers ?? {}) });
	} catch (error) {
		onProcessingError(error);
		return {
			socket: void 0,
			close
		};
	}
	if (abortSignal != null && onAbort != null) {
		abortListener = () => onAbort(abortSignal.reason ?? /* @__PURE__ */ new Error("Aborted"));
		abortSignal.addEventListener("abort", abortListener, { once: true });
	}
	const openedSocket = socket;
	socket.onopen = () => {
		try {
			onOpen?.(openedSocket);
		} catch (error) {
			onProcessingError(error);
		}
	};
	let tail = Promise.resolve();
	socket.onmessage = (event) => {
		tail = tail.then(() => readWebSocketMessageText(event.data)).then((text) => onMessageText(text)).catch(onProcessingError);
	};
	socket.onerror = () => {
		tail = tail.then(() => onSocketError?.()).catch(onProcessingError);
	};
	socket.onclose = (event) => {
		const closeEvent = event;
		const code = typeof closeEvent?.code === "number" ? closeEvent.code : void 0;
		const reason = typeof closeEvent?.reason === "string" ? closeEvent.reason : void 0;
		tail = tail.then(() => onClose?.({
			code,
			reason
		})).catch(onProcessingError);
	};
	return {
		socket,
		close
	};
}
//#endregion
//#region src/convert-async-iterator-to-readable-stream.ts
/**
* Converts an AsyncIterator to a ReadableStream.
*
* @template T - The type of elements produced by the AsyncIterator.
* @param { <T>} iterator - The AsyncIterator to convert.
* @returns {ReadableStream<T>} - A ReadableStream that provides the same data as the AsyncIterator.
*/
function convertAsyncIteratorToReadableStream(iterator) {
	let cancelled = false;
	return new ReadableStream({
		/**
		* Called when the consumer wants to pull more data from the stream.
		*
		* @param {ReadableStreamDefaultController<T>} controller - The controller to enqueue data into the stream.
		* @returns {Promise<void>}
		*/
		async pull(controller) {
			if (cancelled) return;
			try {
				const { value, done } = await iterator.next();
				if (done) controller.close();
				else controller.enqueue(value);
			} catch (error) {
				controller.error(error);
			}
		},
		/**
		* Called when the consumer cancels the stream.
		*/
		async cancel(reason) {
			cancelled = true;
			if (iterator.return) try {
				await iterator.return(reason);
			} catch {}
		}
	});
}
//#endregion
//#region src/uint8-utils.ts
const { btoa, atob } = globalThis;
function convertBase64ToUint8Array(base64String) {
	const base64Url = base64String.replace(/-/g, "+").replace(/_/g, "/");
	const latin1string = atob(base64Url);
	const bytes = new Uint8Array(latin1string.length);
	for (let i = 0; i < latin1string.length; i++) bytes[i] = latin1string.charCodeAt(i);
	return bytes;
}
function convertUint8ArrayToBase64(array) {
	if (typeof globalThis.Buffer?.from === "function") return globalThis.Buffer.from(array.buffer, array.byteOffset, array.byteLength).toString("base64");
	const chunks = [];
	const chunkSize = 4096;
	for (let i = 0; i < array.length; i += chunkSize) chunks.push(String.fromCodePoint(...array.subarray(i, i + chunkSize)));
	return btoa(chunks.join(""));
}
const typedArrayTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get;
const arrayBufferByteLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
function isUint8Array(value) {
	return ArrayBuffer.isView(value) && typedArrayTag.call(value) === "Uint8Array";
}
function isArrayBuffer(value) {
	if (typeof value !== "object" || value === null || !("byteLength" in value)) return false;
	try {
		arrayBufferByteLength.call(value);
		return true;
	} catch {
		return false;
	}
}
function convertToBase64(value) {
	return isUint8Array(value) ? convertUint8ArrayToBase64(value) : value;
}
//#endregion
//#region src/convert-inline-file-data-to-uint8-array.ts
/**
* Converts inline file data (a tagged `data` or `text` shape) into raw bytes.
*
* - `{ type: 'text', text }` → UTF-8 encoded bytes
* - `{ type: 'data', data: Uint8Array | Buffer }` → returned as-is
* - `{ type: 'data', data: ArrayBuffer }` → wrapped in a `Uint8Array`
* - `{ type: 'data', data: string }` → decoded as base64
*
* `{ type: 'stream' }` data is rejected: providers without streaming upload
* support funnel here and surface a clear `UnsupportedFunctionalityError`.
*/
function convertInlineFileDataToUint8Array(data) {
	if (data.type === "stream") {
		const error = new dist/* UnsupportedFunctionalityError */.b8({ functionality: "streaming file upload" });
		data.stream.cancel(error).catch(() => {});
		throw error;
	}
	if (data.type === "text") return new TextEncoder().encode(data.text);
	if (data.data instanceof Uint8Array) return data.data;
	if (isUint8Array(data.data)) return new Uint8Array(data.data.buffer, data.data.byteOffset, data.data.byteLength);
	if (isArrayBuffer(data.data)) return new Uint8Array(data.data);
	return convertBase64ToUint8Array(data.data);
}
//#endregion
//#region src/convert-image-model-file-to-data-uri.ts
/**
* Convert an ImageModelV4File to a URL or data URI string.
*
* If the file is a URL, it returns the URL as-is.
* If the file is base64 data, it returns a data URI with the base64 data.
* If the file is a Uint8Array, it converts it to base64 and returns a data URI.
*/
function convertImageModelFileToDataUri(file) {
	if (file.type === "url") return file.url;
	return `data:${file.mediaType};base64,${typeof file.data === "string" ? file.data : convertUint8ArrayToBase64(file.data)}`;
}
//#endregion
//#region src/convert-json-response-tool-stream.ts
/**
* Providers that cannot use native structured output for a request can use a
* JSON response tool instead. This utility converts that tool's streamed input
* into text events so the SDK can parse it as structured output.
*
* Conversational text is suppressed. Application tool calls pass through so the
* caller can execute them. A response containing only the JSON tool finishes
* with `stop`; a response containing application calls keeps its finish reason.
*/
function convertJsonResponseToolStream(toolName) {
	const responseToolIds = /* @__PURE__ */ new Set();
	const responseToolsWithDeltas = /* @__PURE__ */ new Set();
	let hasResponseTool = false;
	let hasApplicationTool = false;
	return new TransformStream({ transform(part, controller) {
		switch (part.type) {
			case "text-start":
			case "text-delta":
			case "text-end": return;
			case "tool-input-start":
				if (part.toolName === toolName) {
					responseToolIds.add(part.id);
					controller.enqueue({
						type: "text-start",
						id: part.id,
						...part.providerMetadata && { providerMetadata: part.providerMetadata }
					});
					return;
				}
				break;
			case "tool-input-delta":
				if (responseToolIds.has(part.id)) {
					if (part.delta.length > 0) responseToolsWithDeltas.add(part.id);
					controller.enqueue({
						type: "text-delta",
						id: part.id,
						delta: part.delta,
						...part.providerMetadata && { providerMetadata: part.providerMetadata }
					});
					return;
				}
				break;
			case "tool-input-end":
				if (responseToolIds.has(part.id)) return;
				break;
			case "tool-call":
				if (part.toolName === toolName) {
					if (!responseToolsWithDeltas.has(part.toolCallId)) controller.enqueue({
						type: "text-delta",
						id: part.toolCallId,
						delta: part.input,
						...part.providerMetadata && { providerMetadata: part.providerMetadata }
					});
					controller.enqueue({
						type: "text-end",
						id: part.toolCallId,
						...part.providerMetadata && { providerMetadata: part.providerMetadata }
					});
					hasResponseTool = true;
					return;
				}
				if (!part.providerExecuted) hasApplicationTool = true;
				break;
			case "finish": if (hasResponseTool && !hasApplicationTool && part.finishReason.unified === "tool-calls") {
				controller.enqueue({
					...part,
					finishReason: {
						...part.finishReason,
						unified: "stop"
					}
				});
				return;
			}
		}
		controller.enqueue(part);
	} });
}
//#endregion
//#region src/convert-to-form-data.ts
/**
* Converts an input object to FormData for multipart/form-data requests.
*
* Handles the following cases:
* - `null` or `undefined` values are skipped
* - Arrays with a single element are appended as a single value
* - Arrays with multiple elements are appended with `[]` suffix (e.g., `image[]`)
*   unless `useArrayBrackets` is set to `false`
* - All other values are appended directly
*
* @param input - The input object to convert. Use a generic type for type validation.
* @param options - Optional configuration object.
* @param options.useArrayBrackets - Whether to add `[]` suffix for multi-element arrays.
*   Defaults to `true`. Set to `false` for APIs that expect repeated keys without brackets.
* @returns A FormData object containing the input values.
*
* @example
* ```ts
* type MyInput = {
*   model: string;
*   prompt: string;
*   images: Blob[];
* };
*
* const formData = convertToFormData<MyInput>({
*   model: 'gpt-image-1',
*   prompt: 'A cat',
*   images: [blob1, blob2],
* });
* ```
*/
function convertToFormData(input, options = {}) {
	const { useArrayBrackets = true } = options;
	const formData = new FormData();
	for (const [key, value] of Object.entries(input)) {
		if (value == null) continue;
		if (Array.isArray(value)) {
			if (value.length === 1) {
				formData.append(key, value[0]);
				continue;
			}
			const arrayKey = useArrayBrackets ? `${key}[]` : key;
			for (const item of value) formData.append(arrayKey, item);
			continue;
		}
		formData.append(key, value);
	}
	return formData;
}
//#endregion
//#region src/create-language-model-response-metadata.ts
/**
* Converts common provider response fields into language model response
* metadata.
*/
function createLanguageModelResponseMetadata({ id, model, created }) {
	return {
		id: id ?? void 0,
		modelId: model ?? void 0,
		timestamp: created != null ? /* @__PURE__ */ new Date(created * 1e3) : void 0
	};
}
//#endregion
//#region src/create-null-language-model-usage.ts
/**
* Creates an empty language model usage result for unavailable usage data.
*/
function createNullLanguageModelUsage() {
	return {
		inputTokens: {
			total: void 0,
			noCache: void 0,
			cacheRead: void 0,
			cacheWrite: void 0
		},
		outputTokens: {
			total: void 0,
			text: void 0,
			reasoning: void 0
		},
		raw: void 0
	};
}
//#endregion
//#region src/create-tool-name-mapping.ts
/**
* @param tools - Tools that were passed to the language model.
* @param providerToolNames - Maps the provider tool ids to the provider tool names.
*/
function createToolNameMapping({ tools = [], providerToolNames }) {
	const customToolNameToProviderToolName = {};
	const providerToolNameToCustomToolName = {};
	for (const tool of tools) if (tool.type === "provider" && tool.id in providerToolNames) {
		const providerToolName = providerToolNames[tool.id];
		customToolNameToProviderToolName[tool.name] = providerToolName;
		providerToolNameToCustomToolName[providerToolName] = tool.name;
	}
	return {
		toProviderToolName: (customToolName) => customToolNameToProviderToolName[customToolName] ?? customToolName,
		toCustomToolName: (providerToolName) => providerToolNameToCustomToolName[providerToolName] ?? providerToolName
	};
}
//#endregion
//#region src/create-provider-stream-error.ts
const marker$2 = Symbol.for("vercel.ai.providerStreamError");
/**
* Adds provider-owned status and retry metadata to a stream error payload
* without requiring provider packages to depend on AI SDK Core.
*/
function createProviderStreamError({ message, type, code, statusCode, isRetryable, data }) {
	const error = {
		message,
		type,
		code,
		statusCode,
		isRetryable,
		data
	};
	Object.defineProperty(error, marker$2, { value: true });
	return error;
}
function isProviderStreamError(error) {
	return typeof error === "object" && error != null && error[marker$2] === true;
}
//#endregion
//#region src/delayed-promise.ts
/**
* Delayed promise. It is only constructed once the value is accessed.
* This is useful to avoid unhandled promise rejections when the promise is created
* but not accessed.
*/
var DelayedPromise = class {
	constructor() {
		this.status = { type: "pending" };
		this._resolve = void 0;
		this._reject = void 0;
	}
	get promise() {
		if (this._promise) return this._promise;
		this._promise = new Promise((resolve, reject) => {
			if (this.status.type === "resolved") resolve(this.status.value);
			else if (this.status.type === "rejected") reject(this.status.error);
			this._resolve = resolve;
			this._reject = reject;
		});
		return this._promise;
	}
	resolve(value) {
		this.status = {
			type: "resolved",
			value
		};
		if (this._promise) this._resolve?.(value);
	}
	reject(error) {
		this.status = {
			type: "rejected",
			error
		};
		if (this._promise) this._reject?.(error);
	}
	isResolved() {
		return this.status.type === "resolved";
	}
	isRejected() {
		return this.status.type === "rejected";
	}
	isPending() {
		return this.status.type === "pending";
	}
};
//#endregion
//#region src/extract-response-headers.ts
/**
* Extracts the headers from a response object and returns them as a key-value object.
*
* @param response - The response object to extract headers from.
* @returns The headers as a key-value object.
*/
function extractResponseHeaders(response) {
	return Object.fromEntries([...response.headers]);
}
//#endregion
//#region src/get-runtime-environment-user-agent.ts
function getRuntimeEnvironmentUserAgent(globalThisAny = globalThis) {
	if (globalThisAny.navigator?.userAgent) return globalThisAny.navigator.userAgent.toLowerCase();
	if (globalThisAny.process?.versions?.node) return `node.js/${globalThisAny.process.version}`;
	if (globalThisAny.EdgeRuntime) return "vercel-edge";
	return "";
}
//#endregion
//#region src/is-abort-error.ts
function isAbortError(error) {
	return (error instanceof Error || typeof DOMException === "function" && error instanceof DOMException) && (error.name === "AbortError" || error.name === "ResponseAborted" || error.name === "TimeoutError");
}
//#endregion
//#region src/handle-fetch-error.ts
const FETCH_FAILED_ERROR_MESSAGES = ["fetch failed", "failed to fetch"];
const RETRYABLE_NETWORK_ERROR_CODES = /* @__PURE__ */ new Set([
	"ConnectionRefused",
	"ConnectionClosed",
	"FailedToOpenSocket",
	"ECONNRESET",
	"ECONNREFUSED",
	"ETIMEDOUT",
	"EPIPE",
	"UND_ERR_SOCKET",
	"UND_ERR_HEADERS_TIMEOUT",
	"UND_ERR_BODY_TIMEOUT",
	"UND_ERR_CONNECT_TIMEOUT"
]);
function findNetworkError(error) {
	const visited = /* @__PURE__ */ new Set();
	let current = error;
	while (current instanceof Error && !visited.has(current)) {
		visited.add(current);
		const errorWithCode = current;
		if (typeof errorWithCode.code === "string" && RETRYABLE_NETWORK_ERROR_CODES.has(errorWithCode.code)) return errorWithCode;
		current = current.cause;
	}
}
function handleFetchError({ error, url, requestBodyValues }) {
	if (isAbortError(error)) return error;
	if (error instanceof TypeError && FETCH_FAILED_ERROR_MESSAGES.includes(error.message.toLowerCase())) {
		const cause = error.cause;
		if (cause != null) return new dist/* APICallError */.hL({
			message: `Cannot connect to API: ${cause.message}`,
			cause,
			url,
			requestBodyValues,
			isRetryable: true
		});
	}
	const networkError = findNetworkError(error);
	if (networkError != null) {
		if (dist/* APICallError */.hL.isInstance(error)) return new dist/* APICallError */.hL({
			message: error.message,
			cause: error.cause,
			url: error.url,
			requestBodyValues: error.requestBodyValues,
			statusCode: error.statusCode,
			responseHeaders: error.responseHeaders,
			responseBody: error.responseBody,
			data: error.data,
			isRetryable: true
		});
		return new dist/* APICallError */.hL({
			message: `Cannot connect to API: ${error instanceof Error ? error.message : networkError.message}`,
			cause: error,
			url,
			requestBodyValues,
			isRetryable: true
		});
	}
	return error;
}
//#endregion
//#region src/version.ts
const VERSION = "5.0.81";
//#endregion
//#region src/normalize-headers.ts
/**
* Normalizes different header inputs into a plain record with lower-case keys.
* Entries with `undefined` or `null` values are removed.
*
* @param headers - Input headers (`Headers`, tuples array, plain record) to normalize.
* @returns A record containing the normalized header entries.
*/
function normalizeHeaders(headers) {
	if (headers == null) return {};
	const normalized = {};
	if (headers instanceof Headers) headers.forEach((value, key) => {
		normalized[key.toLowerCase()] = value;
	});
	else {
		if (!Array.isArray(headers)) headers = Object.entries(headers);
		for (const [key, value] of headers) if (value != null) normalized[key.toLowerCase()] = value;
	}
	return normalized;
}
//#endregion
//#region src/with-user-agent-suffix.ts
/**
* Appends suffix parts to the `user-agent` header.
* If a `user-agent` header already exists, the suffix parts are appended to it.
* If no `user-agent` header exists, a new one is created with the suffix parts.
* Automatically removes undefined entries from the headers.
*
* @param headers - The original headers.
* @param userAgentSuffixParts - The parts to append to the `user-agent` header.
* @returns The new headers with the `user-agent` header set or updated.
*/
function withUserAgentSuffix(headers, ...userAgentSuffixParts) {
	const normalizedHeaders = new Headers(normalizeHeaders(headers));
	const currentUserAgentHeader = normalizedHeaders.get("user-agent") || "";
	normalizedHeaders.set("user-agent", [currentUserAgentHeader, ...userAgentSuffixParts].filter(Boolean).join(" "));
	return Object.fromEntries(normalizedHeaders.entries());
}
//#endregion
//#region src/delete-from-api.ts
const getOriginalFetch$3 = () => globalThis.fetch;
/**
* Sends a DELETE request. For URLs built from developer-configured endpoints
* only — there is no untrusted-URL validation path (use `getFromApi` with
* `validateUrl` for response-supplied URLs).
*/
const deleteFromApi = async ({ url, headers = {}, failedResponseHandler, successfulResponseHandler, abortSignal, fetch = getOriginalFetch$3() }) => {
	try {
		const response = await fetch(url, {
			method: "DELETE",
			headers: withUserAgentSuffix(headers, `ai-sdk-provider-utils/${VERSION}`, getRuntimeEnvironmentUserAgent()),
			signal: abortSignal
		});
		const responseHeaders = extractResponseHeaders(response);
		if (!response.ok) {
			let errorInformation;
			try {
				errorInformation = await failedResponseHandler({
					response,
					url,
					requestBodyValues: {}
				});
			} catch (error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
				throw new dist/* APICallError */.hL({
					message: "Failed to process error response",
					cause: error,
					statusCode: response.status,
					url,
					responseHeaders,
					requestBodyValues: {}
				});
			}
			throw errorInformation.value;
		}
		try {
			return await successfulResponseHandler({
				response,
				url,
				requestBodyValues: {}
			});
		} catch (error) {
			if (error instanceof Error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
			}
			throw new dist/* APICallError */.hL({
				message: "Failed to process successful response",
				cause: error,
				statusCode: response.status,
				url,
				responseHeaders,
				requestBodyValues: {}
			});
		}
	} catch (error) {
		throw handleFetchError({
			error,
			url,
			requestBodyValues: {}
		});
	}
};
//#endregion
//#region src/detect-media-type.ts
const imageMediaTypeSignatures = [
	{
		mediaType: "image/gif",
		bytesPrefix: [
			71,
			73,
			70,
			56,
			55,
			97
		]
	},
	{
		mediaType: "image/gif",
		bytesPrefix: [
			71,
			73,
			70,
			56,
			57,
			97
		]
	},
	{
		mediaType: "image/png",
		bytesPrefix: [
			137,
			80,
			78,
			71
		]
	},
	{
		mediaType: "image/jpeg",
		bytesPrefix: [255, 216]
	},
	{
		mediaType: "image/webp",
		bytesPrefix: [
			82,
			73,
			70,
			70,
			null,
			null,
			null,
			null,
			87,
			69,
			66,
			80
		]
	},
	{
		mediaType: "image/bmp",
		bytesPrefix: [
			66,
			77,
			null,
			null,
			null,
			null,
			0,
			0,
			0,
			0
		]
	},
	{
		mediaType: "image/tiff",
		bytesPrefix: [
			73,
			73,
			42,
			0
		]
	},
	{
		mediaType: "image/tiff",
		bytesPrefix: [
			77,
			77,
			0,
			42
		]
	},
	{
		mediaType: "image/avif",
		bytesPrefix: [
			0,
			0,
			0,
			null,
			102,
			116,
			121,
			112,
			97,
			118,
			105,
			102
		]
	},
	{
		mediaType: "image/heic",
		bytesPrefix: [
			0,
			0,
			0,
			null,
			102,
			116,
			121,
			112,
			104,
			101,
			105,
			99
		]
	}
];
const documentMediaTypeSignatures = [{
	mediaType: "application/pdf",
	bytesPrefix: [
		37,
		80,
		68,
		70
	]
}];
const audioMediaTypeSignaturesWithoutMp4 = [
	{
		mediaType: "audio/aac",
		bytesPrefix: [255, 240]
	},
	{
		mediaType: "audio/aac",
		bytesPrefix: [255, 241]
	},
	{
		mediaType: "audio/aac",
		bytesPrefix: [255, 248]
	},
	{
		mediaType: "audio/aac",
		bytesPrefix: [255, 249]
	},
	{
		mediaType: "audio/mpeg",
		bytesPrefix: [255, 251]
	},
	{
		mediaType: "audio/mpeg",
		bytesPrefix: [255, 250]
	},
	{
		mediaType: "audio/mpeg",
		bytesPrefix: [255, 243]
	},
	{
		mediaType: "audio/mpeg",
		bytesPrefix: [255, 242]
	},
	{
		mediaType: "audio/mpeg",
		bytesPrefix: [255, 227]
	},
	{
		mediaType: "audio/mpeg",
		bytesPrefix: [255, 226]
	},
	{
		mediaType: "audio/wav",
		bytesPrefix: [
			82,
			73,
			70,
			70,
			null,
			null,
			null,
			null,
			87,
			65,
			86,
			69
		]
	},
	{
		mediaType: "audio/ogg",
		bytesPrefix: [
			79,
			103,
			103,
			83
		]
	},
	{
		mediaType: "audio/flac",
		bytesPrefix: [
			102,
			76,
			97,
			67
		]
	},
	{
		mediaType: "audio/aac",
		bytesPrefix: [
			64,
			21,
			0,
			0
		]
	},
	{
		mediaType: "audio/webm",
		bytesPrefix: [
			26,
			69,
			223,
			163
		]
	}
];
const audioMediaTypeSignatures = [...audioMediaTypeSignaturesWithoutMp4, {
	mediaType: "audio/mp4",
	bytesPrefix: [
		0,
		0,
		0,
		null,
		102,
		116,
		121,
		112
	]
}];
const videoMediaTypeSignatures = [
	{
		mediaType: "video/mp4",
		bytesPrefix: [
			0,
			0,
			0,
			null,
			102,
			116,
			121,
			112
		]
	},
	{
		mediaType: "video/webm",
		bytesPrefix: [
			26,
			69,
			223,
			163
		]
	},
	{
		mediaType: "video/quicktime",
		bytesPrefix: [
			0,
			0,
			0,
			20,
			102,
			116,
			121,
			112,
			113,
			116
		]
	},
	{
		mediaType: "video/x-msvideo",
		bytesPrefix: [
			82,
			73,
			70,
			70
		]
	}
];
const DEFAULT_SNIFF_BYTES = 18;
const ID3_SCAN_BYTES = 131084;
function decodePrefix(data, maxBytes) {
	if (typeof data !== "string") return data.length > maxBytes ? data.subarray(0, maxBytes) : data;
	const maxChars = Math.ceil(maxBytes / 3) * 4;
	const bytes = convertBase64ToUint8Array(data.substring(0, Math.min(data.length, maxChars)));
	return bytes.length > maxBytes ? bytes.subarray(0, maxBytes) : bytes;
}
function hasID3(bytes) {
	return bytes.length > 10 && bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51;
}
const stripID3 = (bytes) => {
	const id3Size = (bytes[6] & 127) << 21 | (bytes[7] & 127) << 14 | (bytes[8] & 127) << 7 | bytes[9] & 127;
	return bytes.subarray(id3Size + 10);
};
function detectMediaTypeBySignatures({ data, signatures }) {
	let bytes = decodePrefix(data, DEFAULT_SNIFF_BYTES);
	if (hasID3(bytes)) bytes = stripID3(decodePrefix(data, ID3_SCAN_BYTES));
	for (const signature of signatures) if (bytes.length >= signature.bytesPrefix.length && signature.bytesPrefix.every((byte, index) => byte === null || bytes[index] === byte)) return signature.mediaType;
}
const topLevelSignatureTables = {
	image: imageMediaTypeSignatures,
	audio: audioMediaTypeSignatures,
	video: videoMediaTypeSignatures,
	application: documentMediaTypeSignatures
};
/**
* Detect the IANA media type of a file from its raw bytes or base64 string.
*
* - When `topLevelType` is omitted, every known signature is considered
*   (image, audio, video, and application). Returns `undefined` when the
*   bytes do not match any known signature.
* - When `topLevelType` is provided, only signatures for that top-level
*   segment are considered. Returns `undefined` for unsupported segments
*   (e.g. `"text"`) or when no signature matches.
*/
function detectMediaType({ data, topLevelType }) {
	if (topLevelType === void 0) return detectMediaTypeBySignatures({
		data,
		signatures: [
			...imageMediaTypeSignatures,
			...documentMediaTypeSignatures,
			...audioMediaTypeSignaturesWithoutMp4,
			...videoMediaTypeSignatures
		]
	});
	if (!Object.prototype.hasOwnProperty.call(topLevelSignatureTables, topLevelType)) return;
	return detectMediaTypeBySignatures({
		data,
		signatures: topLevelSignatureTables[topLevelType]
	});
}
/**
* Returns the top-level segment of a media type (the portion before `/`).
*
* Examples:
*   - `"image/png"` -> `"image"`
*   - `"image/*"` -> `"image"`
*   - `"image"` -> `"image"`
*   - `"image/"` -> `"image"`
*   - `""` -> `""`
*   - `"/"` -> `""`
*/
function getTopLevelMediaType(mediaType) {
	const slashIndex = mediaType.indexOf("/");
	return slashIndex === -1 ? mediaType : mediaType.substring(0, slashIndex);
}
/**
* Returns `true` only when the given media type has a non-empty, non-wildcard
* subtype (i.e. matches the form `type/subtype`, and `subtype` is not `*`).
*
* Examples:
*   - `"image/png"` -> `true`
*   - `"image/*"` -> `false`
*   - `"image"` -> `false`
*   - `"image/"` -> `false`
*   - `""` -> `false`
*   - `"/"` -> `false`
*/
function isFullMediaType(mediaType) {
	const slashIndex = mediaType.indexOf("/");
	if (slashIndex === -1) return false;
	const subtype = mediaType.substring(slashIndex + 1);
	return subtype.length > 0 && subtype !== "*";
}
//#endregion
//#region src/cancel-response-body.ts
/**
* Cancels a response body to release the underlying connection.
*
* When a fetch Response is rejected without consuming its body (e.g. a failed
* status code, an open-redirect rejection, or a Content-Length that exceeds the
* size limit), the underlying TCP socket is not returned to the connection pool
* and may stay open until the process runs out of file descriptors. Cancelling
* the body avoids this leak.
*
* Errors thrown while cancelling are ignored: the body may already be locked,
* disturbed, or absent, none of which should mask the original rejection.
*/
async function cancelResponseBody(response) {
	try {
		await response.body?.cancel();
	} catch {}
}
//#endregion
//#region src/download-error.ts
const name$1 = "AI_DownloadError";
const marker$1 = `vercel.ai.error.${name$1}`;
const symbol$1 = Symbol.for(marker$1);
var DownloadError = class extends dist/* AISDKError */.bD {
	constructor({ url, statusCode, statusText, cause, message = cause == null ? `Failed to download ${url}: ${statusCode} ${statusText}` : `Failed to download ${url}: ${cause}` }) {
		super({
			name: name$1,
			message,
			cause
		});
		this[symbol$1] = true;
		this.url = url;
		this.statusCode = statusCode;
		this.statusText = statusText;
	}
	static isInstance(error) {
		return dist/* AISDKError */.bD.hasMarker(error, marker$1);
	}
};
//#endregion
//#region src/is-browser-runtime.ts
/**
* Returns `true` when running in a browser.
*
* Detection keys on the presence of a global `window`, matching the browser
* check used elsewhere in this package (see `getRuntimeEnvironmentUserAgent`)
* so the SDK has a single, consistent definition of "browser". Server runtimes
* (Node.js, Deno, Bun, edge/workers) do not define `window`.
*/
function isBrowserRuntime(globalThisAny = globalThis) {
	return globalThisAny.window != null;
}
//#endregion
//#region src/is-same-origin.ts
/**
* Returns true when `url` has the same origin (scheme + host + port) as
* `baseUrl`.
*
* Used to decide whether provider credentials may be attached to a request to a
* URL taken from a provider response (e.g. a polling or media-download URL).
* Credentials must only be sent to the provider's own origin; a response that
* names a foreign host (a CDN, or an attacker-controlled host if the response
* is tampered with) must not receive the API key.
*
* Returns false if either value is not a valid absolute URL (fail-closed).
*/
function isSameOrigin(url, baseUrl) {
	try {
		return new URL(url).origin === new URL(baseUrl).origin;
	} catch {
		return false;
	}
}
//#endregion
//#region src/sanitize-request-headers.ts
/**
* Request headers stripped before fetching an untrusted URL: host/virtual-host
* routing, proxy/origin spoofing, cloud-metadata, cookies, and hop-by-hop
* transport headers (RFC 7230 §6.1).
*
* `Authorization` and other credential-bearing caller headers (e.g. `x-key`)
* are intentionally not listed because trusted provider requests may need
* them. `fetchUntrustedUrl` separately restricts an untrusted first hop to an
* explicit allowlist of non-credential request metadata. Both it and
* `fetchWithValidatedRedirects` drop all caller headers except the user-agent
* on a cross-origin redirect.
*/
const BLOCKED_REQUEST_HEADERS = [
	"connection",
	"keep-alive",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
	"host",
	"forwarded",
	"proxy-authorization",
	"via",
	"x-forwarded-for",
	"x-forwarded-host",
	"x-forwarded-proto",
	"x-real-ip",
	"metadata",
	"metadata-flavor",
	"x-aws-ec2-metadata-token",
	"x-metadata-token",
	"cookie",
	"set-cookie"
];
/**
* Returns a fresh `Headers` built from `input` with {@link BLOCKED_REQUEST_HEADERS}
* removed. The input is never mutated.
*/
function sanitizeRequestHeaders(input) {
	const headers = new Headers(input);
	for (const name of BLOCKED_REQUEST_HEADERS) headers.delete(name);
	return headers;
}
//#endregion
//#region src/validate-download-url.ts
/**
* Validates that a URL is safe to download from, blocking private/internal addresses
* to prevent SSRF attacks.
*
* This function performs string/literal-IP checks only. DNS validation must
* be provided by the fetch transport or network egress controls.
*
* @param url - The URL string to validate.
* @throws DownloadError if the URL is unsafe.
*/
function validateDownloadUrl(url) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		throw new DownloadError({
			url,
			message: `Invalid URL: ${url}`
		});
	}
	if (parsed.protocol === "data:") return;
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new DownloadError({
		url,
		message: `URL scheme must be http, https, or data, got ${parsed.protocol}`
	});
	const hostname = parsed.hostname.toLowerCase().replace(/\.+$/, "");
	if (!hostname) throw new DownloadError({
		url,
		message: `URL must have a hostname`
	});
	if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".localhost") || hostname.endsWith(".internal")) throw new DownloadError({
		url,
		message: `URL with hostname ${hostname} is not allowed`
	});
	if (hostname.startsWith("[") && hostname.endsWith("]")) {
		if (isPrivateIPv6(hostname.slice(1, -1))) throw new DownloadError({
			url,
			message: `URL with IPv6 address ${hostname} is not allowed`
		});
		return;
	}
	if (isIPv4(hostname)) {
		if (isPrivateIPv4(hostname)) throw new DownloadError({
			url,
			message: `URL with IP address ${hostname} is not allowed`
		});
	}
}
function isIPv4(hostname) {
	const parts = hostname.split(".");
	if (parts.length !== 4) return false;
	return parts.every((part) => {
		const num = Number(part);
		return Number.isInteger(num) && num >= 0 && num <= 255 && String(num) === part;
	});
}
function isPrivateIPv4(ip) {
	const [a, b, c] = ip.split(".").map(Number);
	if (a === 0) return true;
	if (a === 10) return true;
	if (a === 100 && b >= 64 && b <= 127) return true;
	if (a === 127) return true;
	if (a === 169 && b === 254) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 192 && b === 0 && c === 0) return true;
	if (a === 192 && b === 0 && c === 2) return true;
	if (a === 192 && b === 168) return true;
	if (a === 198 && (b === 18 || b === 19)) return true;
	if (a === 198 && b === 51 && c === 100) return true;
	if (a === 203 && b === 0 && c === 113) return true;
	if (a >= 224) return true;
	return false;
}
/**
* Expands an IPv6 address string into its 8 16-bit groups, handling `::`
* compression and an optional dotted-decimal IPv4 tail (e.g. `::ffff:127.0.0.1`).
*
* @returns the 8 groups, or null if the input is not a parseable IPv6 address.
*/
function parseIPv6(ip) {
	let address = ip.toLowerCase();
	const zoneIndex = address.indexOf("%");
	if (zoneIndex !== -1) address = address.slice(0, zoneIndex);
	const halves = address.split("::");
	if (halves.length > 2) return null;
	const toGroups = (segment) => {
		if (segment === "") return [];
		const groups = [];
		const parts = segment.split(":");
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (part.includes(".")) {
				if (i !== parts.length - 1 || !isIPv4(part)) return null;
				const [a, b, c, d] = part.split(".").map(Number);
				groups.push(a << 8 | b, c << 8 | d);
				continue;
			}
			if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
			groups.push(parseInt(part, 16));
		}
		return groups;
	};
	const head = toGroups(halves[0]);
	if (head === null) return null;
	if (halves.length === 2) {
		const tail = toGroups(halves[1]);
		if (tail === null) return null;
		const fill = 8 - head.length - tail.length;
		if (fill < 0) return null;
		return [
			...head,
			...new Array(fill).fill(0),
			...tail
		];
	}
	return head.length === 8 ? head : null;
}
function isPrivateIPv6(ip) {
	const groups = parseIPv6(ip);
	if (groups === null) return true;
	const topZero = (count) => groups.slice(0, count).every((group) => group === 0);
	if (topZero(7) && (groups[7] === 0 || groups[7] === 1)) return true;
	if ((groups[0] & 65024) === 64512) return true;
	if ((groups[0] & 65472) === 65152) return true;
	if ((groups[0] & 65472) === 65216) return true;
	if ((groups[0] & 65280) === 65280) return true;
	if (groups[0] === 8193 && groups[1] === 3512) return true;
	if (groups[0] === 16383 && (groups[1] & 61440) === 0) return true;
	if (topZero(6) || topZero(5) && groups[5] === 65535 || topZero(4) && groups[4] === 65535 && groups[5] === 0 || groups[0] === 100 && groups[1] === 65435 && groups[2] === 0 && groups[3] === 0 && groups[4] === 0 && groups[5] === 0 || groups[0] === 100 && groups[1] === 65435 && groups[2] === 1) return isPrivateIPv4(`${groups[6] >> 8 & 255}.${groups[6] & 255}.${groups[7] >> 8 & 255}.${groups[7] & 255}`);
	return false;
}
//#endregion
//#region src/fetch-with-validated-redirects.ts
const MAX_DOWNLOAD_REDIRECTS = 10;
const REDIRECT_STATUS_CODES = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
/**
* Fetches one validated URL without following redirects.
*
* Uses the supplied fetch or the runtime's global fetch. URL validation does
* not resolve DNS; inject a transport such as guarded-fetch on Node.js
* when connection-time DNS validation is needed.
* Redirects are rejected by default. Callers using `redirect: 'manual'` must
* validate the Location target before issuing another request.
*/
async function fetchWithValidatedEndpoint({ url, init, fetch: customFetch, trustedOrigin, redirect = "error", requireDnsValidation = false }) {
	const urlText = url.toString();
	if (!(trustedOrigin !== void 0 && isSameOrigin(urlText, trustedOrigin))) {
		validateDownloadUrl(urlText);
		if (requireDnsValidation && (customFetch == null || customFetch === globalThis.fetch) && !(isBrowserRuntime() && typeof document !== "undefined")) throw new DownloadError({
			url: urlText,
			message: "This server runtime requires a custom fetch with connect-time DNS validation for untrusted URLs"
		});
	}
	return await (customFetch ?? globalThis.fetch)(url, {
		...init,
		redirect
	});
}
/**
* Fetches a URL while enforcing the download guard on every hop.
*
* Redirects are followed manually (`redirect: 'manual'`) so each hop is
* validated with {@link validateDownloadUrl} *before* it is requested. Relying
* on the default `redirect: 'follow'` would issue the request to a redirect
* target (e.g. an internal address) before we ever see its URL, defeating the
* guard.
*
* Manually followed redirects from HTTPS to HTTP are rejected before requesting
* the target.
*
* Request headers are also protected: {@link sanitizeRequestHeaders} strips
* proxy/metadata/cookie/hop-by-hop headers before the first request, and all
* caller headers except `User-Agent` are dropped on a cross-origin redirect.
* Credentials and custom headers are preserved on the first hop for backwards
* compatibility. The caller must ensure that the initial URL may receive them.
* Use `fetchUntrustedUrl` for URLs that require first-hop credential isolation.
* The fetch spec only strips `Authorization` on cross-origin redirects because
* in a browser, CORS preflighting protects custom headers; there is no CORS on
* the server, so provider API keys carried in custom headers (e.g. `x-key`)
* must be dropped here as well.
*
* A `redirect: 'manual'` request yields an unreadable opaque response in the
* browser (and in other spec-compliant fetch implementations), so the redirect
* target cannot be validated here. In a real browser this is safe to follow
* natively because reaching an internal network is not possible (fetch is
* constrained by CORS and cannot reach a server's internal network or
* cloud-metadata). On any other runtime we cannot validate the hop, so we fail
* closed rather than follow it blindly and bypass the guard.
*
* A hop that is same-origin with `trustedOrigin` (the developer-configured
* provider endpoint) skips target validation: that origin is exactly what an
* unvalidated, config-derived request would fetch anyway, and validating it
* would break legitimate self-hosted / localhost deployments whose response
* URLs point back at the configured host. Hops on any other origin are always
* validated.
*
* The returned response is the final (non-redirect) response. The caller is
* responsible for checking `response.ok` and reading the body.
*
* URL validation does not resolve DNS. Use guarded-fetch on Node.js
* for connection-time DNS validation, or enforce network egress restrictions.
*
* @throws DownloadError if a hop is unsafe, the redirect limit is exceeded, or
* a redirect cannot be validated on a non-browser runtime.
*/
async function fetchWithValidatedRedirects({ url, headers, abortSignal, maxRedirects = MAX_DOWNLOAD_REDIRECTS, fetch: customFetch, trustedOrigin }) {
	let currentHeaders = headers === void 0 ? void 0 : sanitizeRequestHeaders(headers);
	const perHopInit = (redirect) => {
		const init = {
			signal: abortSignal,
			redirect
		};
		if (currentHeaders !== void 0) init.headers = new Headers(currentHeaders);
		return init;
	};
	let currentUrl = url;
	for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
		if (!(trustedOrigin !== void 0 && isSameOrigin(currentUrl, trustedOrigin))) validateDownloadUrl(currentUrl);
		const fetch = customFetch ?? globalThis.fetch;
		const response = await fetch(currentUrl, perHopInit("manual"));
		if (response.type === "opaqueredirect") {
			if (!isBrowserRuntime()) throw new DownloadError({
				url,
				message: `Redirect from ${currentUrl} could not be validated and was blocked`
			});
			return await fetch(currentUrl, perHopInit("follow"));
		}
		const location = response.headers?.get("location");
		if (REDIRECT_STATUS_CODES.has(response.status) && location) {
			cancelResponseBody(response);
			const nextUrl = new URL(location, currentUrl).toString();
			if (new URL(currentUrl).protocol === "https:" && new URL(nextUrl).protocol === "http:") throw new DownloadError({
				url,
				message: "Redirect from HTTPS to HTTP was blocked"
			});
			if (currentHeaders !== void 0 && !isSameOrigin(nextUrl, currentUrl)) {
				const userAgent = currentHeaders.get("user-agent");
				currentHeaders = new Headers(userAgent == null ? void 0 : { "user-agent": userAgent });
			}
			currentUrl = nextUrl;
			continue;
		}
		return response;
	}
	throw new DownloadError({
		url,
		message: `Too many redirects (max ${maxRedirects})`
	});
}
//#endregion
//#region src/fetch-untrusted-url.ts
const SAFE_UNTRUSTED_FIRST_HOP_HEADERS = /* @__PURE__ */ new Set([
	"accept",
	"accept-language",
	"baggage",
	"cache-control",
	"idempotency-key",
	"if-match",
	"if-modified-since",
	"if-none-match",
	"if-range",
	"if-unmodified-since",
	"pragma",
	"range",
	"traceparent",
	"tracestate",
	"user-agent",
	"x-correlation-id",
	"x-request-id"
]);
/**
* Fetches an untrusted URL with first-hop credential isolation and validated
* redirects. Uses the URL validation, runtime fetch transport, redirect
* limits, and cross-origin header stripping of {@link fetchWithValidatedRedirects}.
* Inject guarded-fetch on Node.js for connect-time DNS validation.
*
* Without a matching `credentialedOrigin` (or `trustedOrigin` when it is
* omitted), only allowlisted request metadata is sent on the first hop.
* Arbitrary caller headers require an explicit matching origin because vendor
* credential names cannot be inferred safely. Proxy, metadata, cookie, and
* hop-by-hop headers are sanitized even for a matching origin.
*
* `trustedOrigin` also exempts same-origin hops from URL validation, allowing
* developer-configured private endpoints. Both origin options must come from
* developer configuration, never from untrusted response data.
*
* This is an opt-in alternative to `fetchWithValidatedRedirects`, whose
* existing first-hop header behavior is preserved for compatibility.
*/
async function fetchUntrustedUrl({ headers, credentialedOrigin, untrustedFirstHopHeaders, ...options }) {
	let firstHopHeaders;
	if (headers !== void 0) {
		firstHopHeaders = sanitizeRequestHeaders(headers);
		const origin = credentialedOrigin ?? options.trustedOrigin;
		if (origin === void 0 || !isSameOrigin(options.url, origin)) {
			const allowedHeaders = /* @__PURE__ */ new Set([...SAFE_UNTRUSTED_FIRST_HOP_HEADERS, ...(untrustedFirstHopHeaders ?? []).map((name) => name.toLowerCase())]);
			firstHopHeaders = new Headers([...firstHopHeaders].filter(([name]) => allowedHeaders.has(name)));
		}
	}
	return fetchWithValidatedRedirects({
		...options,
		headers: firstHopHeaders
	});
}
//#endregion
//#region src/read-response-with-size-limit.ts
/**
* Default maximum download size: 2 GiB.
*
* `fetch().arrayBuffer()` has ~2x peak memory overhead (undici buffers the
* body internally, then creates the JS ArrayBuffer), so very large downloads
* risk exceeding the default V8 heap limit on 64-bit systems and terminating
* the process with an out-of-memory error.
*
* Setting this limit converts an unrecoverable OOM crash into a catchable
* `DownloadError`.
*/
const DEFAULT_MAX_DOWNLOAD_SIZE = 2147483648;
/**
* Reads a fetch Response body with a size limit to prevent memory exhaustion.
*
* Checks the Content-Length header for early rejection, then reads the body
* incrementally via ReadableStream and aborts with a DownloadError when the
* limit is exceeded.
*
* @param response - The fetch Response to read.
* @param url - The URL being downloaded (used in error messages).
* @param maxBytes - Maximum allowed bytes. Defaults to DEFAULT_MAX_DOWNLOAD_SIZE.
* @param onChunk - Optional. Receives each chunk instead of the chunks being
* collected, so the body is not held in memory, and the returned array is empty.
* The chunk may be a view on a larger buffer, copy what you keep.
* @returns A Uint8Array containing the response body.
* @throws DownloadError if the response exceeds maxBytes.
*/
async function readResponseWithSizeLimit({ response, url, maxBytes = DEFAULT_MAX_DOWNLOAD_SIZE, onChunk }) {
	const contentLength = response.headers.get("content-length");
	if (contentLength != null) {
		const length = parseInt(contentLength, 10);
		if (!isNaN(length) && length > maxBytes) {
			await cancelResponseBody(response);
			throw new DownloadError({
				url,
				message: `Download of ${url} exceeded maximum size of ${maxBytes} bytes (Content-Length: ${length}).`
			});
		}
	}
	const body = response.body;
	if (body == null) return /* @__PURE__ */ new Uint8Array(0);
	const reader = body.getReader();
	const chunks = [];
	let totalBytes = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			totalBytes += value.length;
			if (totalBytes > maxBytes) throw new DownloadError({
				url,
				message: `Download of ${url} exceeded maximum size of ${maxBytes} bytes.`
			});
			if (onChunk != null) {
				onChunk(value);
				continue;
			}
			chunks.push(value.byteLength < value.buffer.byteLength ? new Uint8Array(value) : value);
		}
	} finally {
		try {
			await reader.cancel();
		} catch {} finally {
			reader.releaseLock();
		}
	}
	const result = new Uint8Array(onChunk != null ? 0 : totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	return result;
}
//#endregion
//#region src/download-blob.ts
/**
* Download a file from a URL and return it as a Blob.
*
* @param url - The URL to download from.
* @param options - Optional settings for the download.
* @param options.maxBytes - Maximum allowed download size in bytes. Defaults to 100 MiB.
* @param options.abortSignal - An optional abort signal to cancel the download.
* @param options.fetch - Fetch transport, e.g. guarded-fetch for DNS validation on Node.js.
* @returns A Promise that resolves to the downloaded Blob.
*
* @throws DownloadError if the download fails or exceeds maxBytes.
*/
async function downloadBlob(url, options) {
	try {
		const response = await fetchUntrustedUrl({
			url,
			abortSignal: options?.abortSignal,
			fetch: options?.fetch
		});
		if (!response.ok) {
			await cancelResponseBody(response);
			throw new DownloadError({
				url,
				statusCode: response.status,
				statusText: response.statusText
			});
		}
		const data = await readResponseWithSizeLimit({
			response,
			url,
			maxBytes: options?.maxBytes ?? 2147483648
		});
		const contentType = response.headers.get("content-type") ?? void 0;
		return new Blob([data], contentType ? { type: contentType } : void 0);
	} catch (error) {
		if (DownloadError.isInstance(error)) throw error;
		throw new DownloadError({
			url,
			cause: error
		});
	}
}
//#endregion
//#region src/embedding-model-capabilities.ts
/**
* Symbol for exposing the UTF-8 input byte budget of an embedding model.
*
* This capability is experimental and intentionally lives outside the versioned
* embedding model specification.
*/
const EMBEDDING_MODEL_MAX_INPUT_BYTES_PER_CALL = Symbol.for("vercel.ai.embeddingModel.maxInputBytesPerCall");
/**
* Symbol for transforming provider options for an automatically batched
* embedding model call.
*
* This capability is experimental and intentionally lives outside the versioned
* embedding model specification.
*/
const EMBEDDING_MODEL_PROVIDER_OPTIONS_TRANSFORMER = Symbol.for("vercel.ai.embeddingModel.providerOptionsTransformer");
//#endregion
//#region src/encode-path-segment.ts
/**
* Encodes a raw identifier as one URL path segment, including standalone dot
* segments that URL parsers would otherwise normalize. Pass unencoded values;
* for resource paths with intentional slashes, encode each segment separately.
*/
function encodePathSegment(value) {
	const encodedValue = encodeURIComponent(value);
	return encodedValue === "." ? "%252E" : encodedValue === ".." ? "%252E%252E" : encodedValue;
}
//#endregion
//#region src/extract-lines.ts
/**
* Extracts a 1-based inclusive line range from `text`, auto-detecting the
* file's line ending (`\r\n`, `\n`, or `\r`, in that priority).
*
* Mixed line endings are not supported: detection picks one and uses it for
* both the split and the rejoin, so files that mix conventions will not slice
* cleanly. When neither `startLine` nor `endLine` is provided, the input is
* returned unchanged. `endLine` past EOF clamps to the last line.
*/
function extractLines({ text, startLine, endLine }) {
	if (startLine == null && endLine == null) return text;
	const lineEnding = text.includes("\r\n") ? "\r\n" : text.includes("\n") ? "\n" : text.includes("\r") ? "\r" : "\n";
	const lines = text.split(lineEnding);
	const start = Math.max(1, startLine ?? 1) - 1;
	const end = Math.min(lines.length, endLine ?? lines.length);
	return lines.slice(start, end).join(lineEnding);
}
//#endregion
//#region src/filter-nullable.ts
/**
* Filters `null` and `undefined` values out of a list of values.
*
* @param values - The values to filter.
* @returns A new array containing only non-nullish values.
*/
function filterNullable(...values) {
	return values.filter((value) => value != null);
}
//#endregion
//#region src/generate-id.ts
/**
* Creates an ID generator.
* The total length of the ID is the sum of the prefix, separator, and random part length.
* Not cryptographically secure.
*
* @param alphabet - The alphabet to use for the ID. Default: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.
* @param prefix - The prefix of the ID to generate. Optional.
* @param separator - The separator between the prefix and the random part of the ID. Default: '-'.
* @param size - The size of the random part of the ID to generate. Default: 16.
*/
const createIdGenerator = ({ prefix, size = 16, alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", separator = "-" } = {}) => {
	const generator = () => {
		const alphabetLength = alphabet.length;
		const chars = new Array(size);
		for (let i = 0; i < size; i++) chars[i] = alphabet[Math.random() * alphabetLength | 0];
		return chars.join("");
	};
	if (prefix == null) return generator;
	if (alphabet.includes(separator)) throw new dist/* InvalidArgumentError */.Di({
		argument: "separator",
		message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
	});
	return () => `${prefix}${separator}${generator()}`;
};
/**
* Generates a 16-character random string to use for IDs.
* Not cryptographically secure.
*/
const generateId = createIdGenerator();
//#endregion
//#region src/get-from-api.ts
const getOriginalFetch$2 = () => globalThis.fetch;
const getFromApi = async ({ url, headers = {}, successfulResponseHandler, failedResponseHandler, abortSignal, fetch, validateUrl, credentialedOrigin, trustedOrigin }) => {
	try {
		const requestFetch = fetch ?? getOriginalFetch$2();
		const requestHeaders = withUserAgentSuffix(credentialedOrigin !== void 0 && !isSameOrigin(url, credentialedOrigin) ? {} : headers, `ai-sdk-provider-utils/${VERSION}`, getRuntimeEnvironmentUserAgent());
		const response = validateUrl ? await fetchWithValidatedRedirects({
			url,
			headers: requestHeaders,
			abortSignal,
			fetch,
			trustedOrigin
		}) : await requestFetch(url, {
			method: "GET",
			headers: requestHeaders,
			signal: abortSignal
		});
		const responseHeaders = extractResponseHeaders(response);
		if (!response.ok) {
			let errorInformation;
			try {
				errorInformation = await failedResponseHandler({
					response,
					url,
					requestBodyValues: {}
				});
			} catch (error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
				throw new dist/* APICallError */.hL({
					message: "Failed to process error response",
					cause: error,
					statusCode: response.status,
					url,
					responseHeaders,
					requestBodyValues: {}
				});
			}
			throw errorInformation.value;
		}
		try {
			return await successfulResponseHandler({
				response,
				url,
				requestBodyValues: {}
			});
		} catch (error) {
			if (error instanceof Error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
			}
			throw new dist/* APICallError */.hL({
				message: "Failed to process successful response",
				cause: error,
				statusCode: response.status,
				url,
				responseHeaders,
				requestBodyValues: {}
			});
		}
	} catch (error) {
		throw handleFetchError({
			error,
			url,
			requestBodyValues: {}
		});
	}
};
//#endregion
//#region src/inject-json-instruction.ts
const DEFAULT_SCHEMA_PREFIX = "JSON schema:";
const DEFAULT_SCHEMA_SUFFIX = "You MUST answer with a JSON object that matches the JSON schema above.";
const DEFAULT_GENERIC_SUFFIX = "You MUST answer with JSON.";
function injectJsonInstruction({ prompt, schema, schemaPrefix = schema != null ? DEFAULT_SCHEMA_PREFIX : void 0, schemaSuffix = schema != null ? DEFAULT_SCHEMA_SUFFIX : DEFAULT_GENERIC_SUFFIX }) {
	return [
		prompt != null && prompt.length > 0 ? prompt : void 0,
		prompt != null && prompt.length > 0 ? "" : void 0,
		schemaPrefix,
		schema != null ? JSON.stringify(schema) : void 0,
		schemaSuffix
	].filter((line) => line != null).join("\n");
}
function injectJsonInstructionIntoMessages({ messages, schema, schemaPrefix, schemaSuffix }) {
	const systemMessage = messages[0]?.role === "system" ? { ...messages[0] } : {
		role: "system",
		content: ""
	};
	systemMessage.content = injectJsonInstruction({
		prompt: systemMessage.content,
		schema,
		schemaPrefix,
		schemaSuffix
	});
	return [systemMessage, ...messages[0]?.role === "system" ? messages.slice(1) : messages];
}
//#endregion
//#region src/is-buffer.ts
/**
* Type-guard for Node.js `Buffer` instances.
*
* Uses optional chaining on `globalThis.Buffer` so it returns `false` in
* runtimes where `Buffer` is not available (e.g. CloudFlare Workers).
*/
function isBuffer(value) {
	return globalThis.Buffer?.isBuffer(value) ?? false;
}
//#endregion
//#region src/is-non-nullable.ts
/**
* Type guard that checks whether a value is not `null` or `undefined`.
*
* @template T - The type of the value to check.
* @param value - The value to check.
* @returns `true` if the value is neither `null` nor `undefined`, otherwise `false`.
*/
function isNonNullable(value) {
	return value != null;
}
//#endregion
//#region src/is-provider-reference.ts
/**
* Checks whether a value is a provider reference (a mapping of provider names
* to provider-specific identifiers) as opposed to raw bytes, a URL, or a
* tagged `{ type: ... }` object.
*/
function isProviderReference(data) {
	return typeof data === "object" && data !== null && !isUint8Array(data) && !(data instanceof URL) && !isArrayBuffer(data) && !isBuffer(data) && !("type" in data);
}
//#endregion
//#region src/is-record.ts
/**
* Checks whether a value is a non-null, non-array object.
*/
function isRecord(value) {
	return value != null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/is-url-supported.ts
/**
* Checks if the given URL is supported natively by the model.
*
* @param mediaType - The media type of the URL. Case-insensitive. May be a full
*                    `type/subtype`, a wildcard `type/*`, or just the
*                    top-level segment (e.g. `image`).
* @param url - The URL to check.
* @param supportedUrls - A record where keys are case-insensitive media types (or '*')
*                        and values are arrays of RegExp patterns for URLs.
*
* @returns `true` if the URL matches a pattern under the specific media type
*          or the wildcard '*', `false` otherwise.
*/
function isUrlSupported({ mediaType, url, supportedUrls }) {
	mediaType = mediaType.toLowerCase();
	const isTopLevelOnly = !mediaType.includes("/");
	return Object.entries(supportedUrls).map(([key, value]) => {
		const mediaType = key.toLowerCase();
		return mediaType === "*" || mediaType === "*/*" ? {
			mediaTypePrefix: "",
			regexes: value
		} : {
			mediaTypePrefix: mediaType.replace(/\*/, ""),
			regexes: value
		};
	}).filter(({ mediaTypePrefix }) => {
		if (mediaTypePrefix === "") return true;
		if (isTopLevelOnly) return `${mediaType}/` === mediaTypePrefix;
		return mediaTypePrefix.endsWith("/") ? mediaType.startsWith(mediaTypePrefix) : mediaType === mediaTypePrefix;
	}).flatMap(({ regexes }) => regexes).some((pattern) => testRegExpFromStart(pattern, url));
}
function testRegExpFromStart(pattern, value) {
	if (!pattern.global && !pattern.sticky) return pattern.test(value);
	const lastIndex = pattern.lastIndex;
	pattern.lastIndex = 0;
	try {
		return pattern.test(value);
	} finally {
		pattern.lastIndex = lastIndex;
	}
}
//#endregion
//#region src/is-valid-hostname-part.ts
/**
* Checks whether a value is a valid ASCII hostname part: 1–63 letters, digits,
* or hyphens, without a leading or trailing hyphen.
*
* Use this before inserting a resource name, region, or location into a
* generated hostname. Rejects values such as `evil.example.com/#` and
* `user@localhost:8080/#` that could change the request destination.
*/
function isValidHostnamePart(value) {
	return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.exec(value)?.[0] === value;
}
//#endregion
//#region src/load-api-key.ts
function loadApiKey({ apiKey, environmentVariableName, apiKeyParameterName = "apiKey", description }) {
	if (typeof apiKey === "string") return apiKey;
	if (apiKey != null) throw new dist/* LoadAPIKeyError */.Kq({ message: `${description} API key must be a string.` });
	if (typeof process === "undefined") throw new dist/* LoadAPIKeyError */.Kq({ message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter. Environment variables are not supported in this environment.` });
	apiKey = process.env[environmentVariableName];
	if (apiKey == null) throw new dist/* LoadAPIKeyError */.Kq({ message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter or the ${environmentVariableName} environment variable.` });
	if (typeof apiKey !== "string") throw new dist/* LoadAPIKeyError */.Kq({ message: `${description} API key must be a string. The value of the ${environmentVariableName} environment variable is not a string.` });
	return apiKey;
}
//#endregion
//#region src/load-optional-setting.ts
/**
* Loads an optional `string` setting from the environment or a parameter.
*
* @param settingValue - The setting value.
* @param environmentVariableName - The environment variable name.
* @returns The setting value.
*/
function loadOptionalSetting({ settingValue, environmentVariableName }) {
	if (typeof settingValue === "string") return settingValue;
	if (settingValue != null || typeof process === "undefined") return;
	settingValue = process.env[environmentVariableName];
	if (settingValue == null || typeof settingValue !== "string") return;
	return settingValue;
}
//#endregion
//#region src/load-setting.ts
/**
* Loads a `string` setting from the environment or a parameter.
*
* @param settingValue - The setting value.
* @param environmentVariableName - The environment variable name.
* @param settingName - The setting name.
* @param description - The description of the setting.
* @returns The setting value.
*/
function loadSetting({ settingValue, environmentVariableName, settingName, description }) {
	if (typeof settingValue === "string") return settingValue;
	if (settingValue != null) throw new LoadSettingError({ message: `${description} setting must be a string.` });
	if (typeof process === "undefined") throw new LoadSettingError({ message: `${description} setting is missing. Pass it using the '${settingName}' parameter. Environment variables are not supported in this environment.` });
	settingValue = process.env[environmentVariableName];
	if (settingValue == null) throw new LoadSettingError({ message: `${description} setting is missing. Pass it using the '${settingName}' parameter or the ${environmentVariableName} environment variable.` });
	if (typeof settingValue !== "string") throw new LoadSettingError({ message: `${description} setting must be a string. The value of the ${environmentVariableName} environment variable is not a string.` });
	return settingValue;
}
//#endregion
//#region src/map-reasoning-to-provider.ts
/**
* Reasoning levels in ascending order.
*/
const REASONING_LEVELS = [
	"minimal",
	"low",
	"medium",
	"high",
	"xhigh",
	"max"
];
function isCustomReasoning(reasoning) {
	return reasoning !== void 0 && reasoning !== "provider-default";
}
/**
* Maps a top-level reasoning value to a provider-specific effort string.
*
* A `providerOptionsEffort` (the reasoning effort set in provider options) is
* returned unchanged. Otherwise, `undefined` and `'provider-default'` return
* `undefined`, and other reasoning values are mapped with the effort map.
*
* The effort map should only contain the values that the model supports. An
* unsupported value maps to the next lower supported level, or the next higher
* one if there is no lower level. `'none'` is never used as a fallback, so an
* unsupported `'none'` maps to the lowest supported level.
*
* Pushes a compatibility warning if the effort that is sent differs from the
* requested value, or an unsupported warning if the effort map is empty.
*
* @returns The provider options effort, the mapped effort string, or
*   `undefined` if no effort should be sent.
*/
function mapReasoningToProviderEffort({ reasoning, effortMap, providerOptionsEffort, warnings }) {
	if (providerOptionsEffort != null) return providerOptionsEffort;
	if (!isCustomReasoning(reasoning)) return;
	const index = REASONING_LEVELS.indexOf(reasoning);
	const level = [
		reasoning,
		...REASONING_LEVELS.slice(0, Math.max(index, 0)).reverse(),
		...REASONING_LEVELS.slice(index + 1)
	].find((candidate) => effortMap[candidate] != null);
	if (level == null) {
		warnings.push({
			type: "unsupported",
			feature: "reasoning",
			details: `reasoning "${reasoning}" is not supported by this model.`
		});
		return;
	}
	const mapped = effortMap[level];
	if (mapped !== reasoning) warnings.push({
		type: "compatibility",
		feature: "reasoning",
		details: `reasoning "${reasoning}" is not directly supported by this model. mapped to effort "${mapped}".`
	});
	return mapped;
}
const DEFAULT_REASONING_BUDGET_PERCENTAGES = {
	minimal: .02,
	low: .1,
	medium: .3,
	high: .6,
	xhigh: .9,
	max: .95
};
/**
* Maps a top-level reasoning value to an absolute token budget by multiplying
* the model's max output tokens by a percentage for the level. Levels missing
* from `budgetPercentages` use the default percentages. The result is clamped
* between `minReasoningBudget` (default 1024) and `maxReasoningBudget`.
*
* Handle `'none'` before calling this function when the model can disable
* reasoning. Otherwise, `'none'` maps to `minReasoningBudget` with a
* compatibility warning.
*
* @returns The computed token budget.
*/
function mapReasoningToProviderBudget({ reasoning, maxOutputTokens, maxReasoningBudget, minReasoningBudget = 1024, budgetPercentages, warnings }) {
	if (reasoning === "none") {
		warnings.push({
			type: "compatibility",
			feature: "reasoning",
			details: `reasoning "none" is not supported by this model. mapped to the minimum reasoning budget of ${minReasoningBudget} tokens.`
		});
		return minReasoningBudget;
	}
	const percentage = budgetPercentages?.[reasoning] ?? DEFAULT_REASONING_BUDGET_PERCENTAGES[reasoning];
	return Math.min(maxReasoningBudget, Math.max(minReasoningBudget, Math.round(maxOutputTokens * percentage)));
}
//#endregion
//#region src/media-type-to-extension.ts
/**
* Maps a media type to its corresponding file extension.
* It was originally introduced to set a filename for audio file uploads
* in https://github.com/vercel/ai/pull/8159.
*
* @param mediaType The media type to map.
* @returns The corresponding file extension
* @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
*/
function mediaTypeToExtension(mediaType) {
	const [_type, subtype = ""] = mediaType.toLowerCase().split("/");
	return {
		mpeg: "mp3",
		"x-wav": "wav",
		opus: "ogg",
		mp4: "m4a",
		"x-m4a": "m4a"
	}[subtype] ?? subtype;
}
//#endregion
//#region src/normalize-batch-request-counts.ts
/**
* Normalizes complete batch request counts.
*
* Returns `undefined` when any count is missing, is not a non-negative safe
* integer, or when the item counts do not add up to the total.
*/
function normalizeBatchRequestCounts({ total, pending, completed, failed }) {
	if (isNonNegativeSafeInteger(total) && isNonNegativeSafeInteger(pending) && isNonNegativeSafeInteger(completed) && isNonNegativeSafeInteger(failed) && pending + completed + failed === total) return {
		total,
		pending,
		completed,
		failed
	};
}
function isNonNegativeSafeInteger(value) {
	return value != null && Number.isSafeInteger(value) && value >= 0;
}
//#endregion
//#region src/secure-json-parse.ts
const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
function _parse(text) {
	const obj = JSON.parse(text);
	if (obj === null || typeof obj !== "object") return obj;
	if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) return obj;
	return filter(obj);
}
function filter(obj) {
	let next = [obj];
	while (next.length) {
		const nodes = next;
		next = [];
		for (const node of nodes) {
			if (Object.prototype.hasOwnProperty.call(node, "__proto__")) throw new SyntaxError("Object contains forbidden prototype property");
			if (Object.prototype.hasOwnProperty.call(node, "constructor") && node.constructor !== null && typeof node.constructor === "object" && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) throw new SyntaxError("Object contains forbidden prototype property");
			for (const key in node) {
				const value = node[key];
				if (value && typeof value === "object") next.push(value);
			}
		}
	}
	return obj;
}
function secureJsonParse(text) {
	const { stackTraceLimit } = Error;
	try {
		Error.stackTraceLimit = 0;
	} catch {
		return _parse(text);
	}
	try {
		return _parse(text);
	} finally {
		Error.stackTraceLimit = stackTraceLimit;
	}
}
//#endregion
//#region src/add-additional-properties-to-json-schema.ts
/**
* Recursively adds additionalProperties: false to object schemas that do not
* define a schema for their additional properties. This is necessary because
* some providers (e.g. OpenAI) do not support additionalProperties: true.
*/
function addAdditionalPropertiesToJsonSchema(jsonSchema) {
	if (jsonSchema.type === "object" || Array.isArray(jsonSchema.type) && jsonSchema.type.includes("object")) {
		const { additionalProperties } = jsonSchema;
		jsonSchema.additionalProperties = additionalProperties != null && typeof additionalProperties !== "boolean" ? visit(additionalProperties) : false;
		const { properties } = jsonSchema;
		if (properties != null) for (const key of Object.keys(properties)) properties[key] = visit(properties[key]);
	}
	if (jsonSchema.items != null) jsonSchema.items = Array.isArray(jsonSchema.items) ? jsonSchema.items.map(visit) : visit(jsonSchema.items);
	if (jsonSchema.anyOf != null) jsonSchema.anyOf = jsonSchema.anyOf.map(visit);
	if (jsonSchema.allOf != null) jsonSchema.allOf = jsonSchema.allOf.map(visit);
	if (jsonSchema.oneOf != null) jsonSchema.oneOf = jsonSchema.oneOf.map(visit);
	const { definitions } = jsonSchema;
	if (definitions != null) for (const key of Object.keys(definitions)) definitions[key] = visit(definitions[key]);
	return jsonSchema;
}
function visit(def) {
	if (typeof def === "boolean") return def;
	return addAdditionalPropertiesToJsonSchema(def);
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/options.ts
const ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
const defaultOptions = {
	name: void 0,
	$refStrategy: "root",
	basePath: ["#"],
	effectStrategy: "input",
	pipeStrategy: "all",
	dateStrategy: "format:date-time",
	mapStrategy: "entries",
	removeAdditionalStrategy: "passthrough",
	allowedAdditionalProperties: true,
	rejectedAdditionalProperties: false,
	definitionPath: "definitions",
	strictUnions: false,
	definitions: {},
	errorMessages: false,
	patternStrategy: "escape",
	applyRegexFlags: false,
	emailStrategy: "format:email",
	base64Strategy: "contentEncoding:base64",
	nameStrategy: "ref"
};
const getDefaultOptions = (options) => typeof options === "string" ? {
	...defaultOptions,
	name: options
} : {
	...defaultOptions,
	...options
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/any.ts
function parseAnyDef() {
	return {};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/array.ts
function parseArrayDef(def, refs) {
	const res = { type: "array" };
	if (def.type?._def && def.type?._def?.typeName !== "ZodAny") res.items = parseDef(def.type._def, {
		...refs,
		currentPath: [...refs.currentPath, "items"]
	});
	if (def.minLength) res.minItems = def.minLength.value;
	if (def.maxLength) res.maxItems = def.maxLength.value;
	if (def.exactLength) {
		res.minItems = def.exactLength.value;
		res.maxItems = def.exactLength.value;
	}
	return res;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/bigint.ts
function parseBigintDef(def) {
	const res = {
		type: "integer",
		format: "int64"
	};
	if (!def.checks) return res;
	for (const check of def.checks) switch (check.kind) {
		case "min":
			if (check.inclusive) res.minimum = check.value;
			else res.exclusiveMinimum = check.value;
			break;
		case "max":
			if (check.inclusive) res.maximum = check.value;
			else res.exclusiveMaximum = check.value;
			break;
		case "multipleOf": res.multipleOf = check.value;
	}
	return res;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/boolean.ts
function parseBooleanDef() {
	return { type: "boolean" };
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/branded.ts
function parseBrandedDef(_def, refs) {
	return parseDef(_def.type._def, refs);
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/catch.ts
const parseCatchDef = (def, refs) => {
	return parseDef(def.innerType._def, refs);
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/date.ts
function parseDateDef(def, refs, overrideDateStrategy) {
	const strategy = overrideDateStrategy ?? refs.dateStrategy;
	if (Array.isArray(strategy)) return { anyOf: strategy.map((item) => parseDateDef(def, refs, item)) };
	switch (strategy) {
		case "string":
		case "format:date-time": return {
			type: "string",
			format: "date-time"
		};
		case "format:date": return {
			type: "string",
			format: "date"
		};
		case "integer": return integerDateParser(def);
	}
}
const integerDateParser = (def) => {
	const res = {
		type: "integer",
		format: "unix-time"
	};
	for (const check of def.checks) switch (check.kind) {
		case "min":
			res.minimum = check.value;
			break;
		case "max": res.maximum = check.value;
	}
	return res;
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/default.ts
function parseDefaultDef(_def, refs) {
	return {
		...parseDef(_def.innerType._def, refs),
		default: _def.defaultValue()
	};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/effects.ts
function parseEffectsDef(_def, refs) {
	return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : parseAnyDef();
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/enum.ts
function parseEnumDef(def) {
	return {
		type: "string",
		enum: Array.from(def.values)
	};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/intersection.ts
const isJsonSchema7AllOfType = (type) => {
	if ("type" in type && type.type === "string") return false;
	return "allOf" in type;
};
function parseIntersectionDef(def, refs) {
	const allOf = [parseDef(def.left._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"allOf",
			"0"
		]
	}), parseDef(def.right._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"allOf",
			"1"
		]
	})].filter((x) => !!x);
	const mergedAllOf = [];
	allOf.forEach((schema) => {
		if (isJsonSchema7AllOfType(schema)) mergedAllOf.push(...schema.allOf);
		else {
			let nestedSchema = schema;
			if ("additionalProperties" in schema && schema.additionalProperties === false) {
				const { additionalProperties: _additionalProperties, ...rest } = schema;
				nestedSchema = rest;
			}
			mergedAllOf.push(nestedSchema);
		}
	});
	return mergedAllOf.length ? { allOf: mergedAllOf } : void 0;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/literal.ts
function parseLiteralDef(def) {
	const parsedType = typeof def.value;
	if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") return { type: Array.isArray(def.value) ? "array" : "object" };
	return {
		type: parsedType === "bigint" ? "integer" : parsedType,
		const: def.value
	};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/string.ts
let emojiRegex = void 0;
/**
* Generated from the regular expressions found here as of 2024-05-22:
* https://github.com/colinhacks/zod/blob/master/src/types.ts.
*
* Expressions with /i flag have been changed accordingly.
*/
const zodPatterns = {
	/**
	* `c` was changed to `[cC]` to replicate /i flag
	*/
	cuid: /^[cC][^\s-]{8,}$/,
	cuid2: /^[0-9a-z]+$/,
	ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
	/**
	* `a-z` was added to replicate /i flag
	*/
	email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/,
	/**
	* Constructed a valid Unicode RegExp
	*
	* Lazily instantiate since this type of regex isn't supported
	* in all envs (e.g. React Native).
	*
	* See:
	* https://github.com/colinhacks/zod/issues/2433
	* Fix in Zod:
	* https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
	*/
	emoji: () => {
		if (emojiRegex === void 0) emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
		return emojiRegex;
	},
	/**
	* Unused
	*/
	uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
	/**
	* Unused
	*/
	ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
	ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
	/**
	* Unused
	*/
	ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
	ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
	base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
	base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
	nanoid: /^[a-zA-Z0-9_-]{21}$/,
	jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function parseStringDef(def, refs) {
	const res = { type: "string" };
	if (def.checks) for (const check of def.checks) switch (check.kind) {
		case "min":
			res.minLength = typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value;
			break;
		case "max":
			res.maxLength = typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value;
			break;
		case "email":
			switch (refs.emailStrategy) {
				case "format:email":
					addFormat(res, "email", check.message, refs);
					break;
				case "format:idn-email":
					addFormat(res, "idn-email", check.message, refs);
					break;
				case "pattern:zod": addPattern(res, zodPatterns.email, check.message, refs);
			}
			break;
		case "url":
			addFormat(res, "uri", check.message, refs);
			break;
		case "uuid":
			addFormat(res, "uuid", check.message, refs);
			break;
		case "regex":
			addPattern(res, check.regex, check.message, refs);
			break;
		case "cuid":
			addPattern(res, zodPatterns.cuid, check.message, refs);
			break;
		case "cuid2":
			addPattern(res, zodPatterns.cuid2, check.message, refs);
			break;
		case "startsWith":
			addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
			break;
		case "endsWith":
			addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
			break;
		case "datetime":
			addFormat(res, "date-time", check.message, refs);
			break;
		case "date":
			addFormat(res, "date", check.message, refs);
			break;
		case "time":
			addFormat(res, "time", check.message, refs);
			break;
		case "duration":
			addFormat(res, "duration", check.message, refs);
			break;
		case "length":
			res.minLength = typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value;
			res.maxLength = typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value;
			break;
		case "includes":
			addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
			break;
		case "ip":
			if (check.version !== "v6") addFormat(res, "ipv4", check.message, refs);
			if (check.version !== "v4") addFormat(res, "ipv6", check.message, refs);
			break;
		case "base64url":
			addPattern(res, zodPatterns.base64url, check.message, refs);
			break;
		case "jwt":
			addPattern(res, zodPatterns.jwt, check.message, refs);
			break;
		case "cidr":
			if (check.version !== "v6") addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
			if (check.version !== "v4") addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
			break;
		case "emoji":
			addPattern(res, zodPatterns.emoji(), check.message, refs);
			break;
		case "ulid":
			addPattern(res, zodPatterns.ulid, check.message, refs);
			break;
		case "base64":
			switch (refs.base64Strategy) {
				case "format:binary":
					addFormat(res, "binary", check.message, refs);
					break;
				case "contentEncoding:base64":
					res.contentEncoding = "base64";
					break;
				case "pattern:zod": addPattern(res, zodPatterns.base64, check.message, refs);
			}
			break;
		case "nanoid": addPattern(res, zodPatterns.nanoid, check.message, refs);
	}
	return res;
}
function escapeLiteralCheckValue(literal, refs) {
	return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
const ALPHA_NUMERIC = /* @__PURE__ */ new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
function escapeNonAlphaNumeric(source) {
	let result = "";
	for (let i = 0; i < source.length; i++) {
		if (!ALPHA_NUMERIC.has(source[i])) result += "\\";
		result += source[i];
	}
	return result;
}
function addFormat(schema, value, message, refs) {
	if (schema.format || schema.anyOf?.some((x) => x.format)) {
		if (!schema.anyOf) schema.anyOf = [];
		if (schema.format) {
			schema.anyOf.push({ format: schema.format });
			delete schema.format;
		}
		schema.anyOf.push({
			format: value,
			...message && refs.errorMessages && { errorMessage: { format: message } }
		});
	} else schema.format = value;
}
function addPattern(schema, regex, message, refs) {
	if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
		if (!schema.allOf) schema.allOf = [];
		if (schema.pattern) {
			schema.allOf.push({ pattern: schema.pattern });
			delete schema.pattern;
		}
		schema.allOf.push({
			pattern: stringifyRegExpWithFlags(regex, refs),
			...message && refs.errorMessages && { errorMessage: { pattern: message } }
		});
	} else schema.pattern = stringifyRegExpWithFlags(regex, refs);
}
function stringifyRegExpWithFlags(regex, refs) {
	if (!refs.applyRegexFlags || !regex.flags) return regex.source;
	const flags = {
		i: regex.flags.includes("i"),
		m: regex.flags.includes("m"),
		s: regex.flags.includes("s")
	};
	const source = flags.i ? regex.source.toLowerCase() : regex.source;
	let pattern = "";
	let isEscaped = false;
	let inCharGroup = false;
	let inCharRange = false;
	for (let i = 0; i < source.length; i++) {
		if (isEscaped) {
			pattern += source[i];
			isEscaped = false;
			continue;
		}
		if (flags.i) {
			if (inCharGroup) {
				if (source[i].match(/[a-z]/)) {
					if (inCharRange) {
						pattern += source[i];
						pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
						inCharRange = false;
					} else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
						pattern += source[i];
						inCharRange = true;
					} else pattern += `${source[i]}${source[i].toUpperCase()}`;
					continue;
				}
			} else if (source[i].match(/[a-z]/)) {
				pattern += `[${source[i]}${source[i].toUpperCase()}]`;
				continue;
			}
		}
		if (flags.m) {
			if (source[i] === "^") {
				pattern += `(^|(?<=[\r\n]))`;
				continue;
			} else if (source[i] === "$") {
				pattern += `($|(?=[\r\n]))`;
				continue;
			}
		}
		if (flags.s && source[i] === ".") {
			pattern += inCharGroup ? `${source[i]}\r\n` : `[${source[i]}\r\n]`;
			continue;
		}
		pattern += source[i];
		if (source[i] === "\\") isEscaped = true;
		else if (inCharGroup && source[i] === "]") inCharGroup = false;
		else if (!inCharGroup && source[i] === "[") inCharGroup = true;
	}
	try {
		new RegExp(pattern);
	} catch {
		console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
		return regex.source;
	}
	return pattern;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/record.ts
function parseRecordDef(def, refs) {
	const schema = {
		type: "object",
		additionalProperties: parseDef(def.valueType._def, {
			...refs,
			currentPath: [...refs.currentPath, "additionalProperties"]
		}) ?? refs.allowedAdditionalProperties
	};
	if (def.keyType?._def.typeName === "ZodString" && def.keyType._def.checks?.length) {
		const { type: _type, ...keyType } = parseStringDef(def.keyType._def, refs);
		return {
			...schema,
			propertyNames: keyType
		};
	} else if (def.keyType?._def.typeName === "ZodEnum") return {
		...schema,
		propertyNames: { enum: def.keyType._def.values }
	};
	else if (def.keyType?._def.typeName === "ZodBranded" && def.keyType._def.type._def.typeName === "ZodString" && def.keyType._def.type._def.checks?.length) {
		const { type: _type, ...keyType } = parseBrandedDef(def.keyType._def, refs);
		return {
			...schema,
			propertyNames: keyType
		};
	}
	return schema;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/map.ts
function parseMapDef(def, refs) {
	if (refs.mapStrategy === "record") return parseRecordDef(def, refs);
	return {
		type: "array",
		maxItems: 125,
		items: {
			type: "array",
			items: [parseDef(def.keyType._def, {
				...refs,
				currentPath: [
					...refs.currentPath,
					"items",
					"items",
					"0"
				]
			}) || parseAnyDef(), parseDef(def.valueType._def, {
				...refs,
				currentPath: [
					...refs.currentPath,
					"items",
					"items",
					"1"
				]
			}) || parseAnyDef()],
			minItems: 2,
			maxItems: 2
		}
	};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/native-enum.ts
function parseNativeEnumDef(def) {
	const object = def.values;
	const actualValues = Object.keys(def.values).filter((key) => {
		return typeof object[object[key]] !== "number";
	}).map((key) => object[key]);
	const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
	return {
		type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
		enum: actualValues
	};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/never.ts
function parseNeverDef() {
	return { not: parseAnyDef() };
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/null.ts
function parseNullDef() {
	return { type: "null" };
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/union.ts
const primitiveMappings = {
	ZodString: "string",
	ZodNumber: "number",
	ZodBigInt: "integer",
	ZodBoolean: "boolean",
	ZodNull: "null"
};
function parseUnionDef(def, refs) {
	const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
	if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
		const types = options.reduce((types, x) => {
			const type = primitiveMappings[x._def.typeName];
			return type && !types.includes(type) ? [...types, type] : types;
		}, []);
		return { type: types.length > 1 ? types : types[0] };
	} else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
		const types = options.reduce((acc, x) => {
			const type = typeof x._def.value;
			switch (type) {
				case "string":
				case "number":
				case "boolean": return [...acc, type];
				case "bigint": return [...acc, "integer"];
				case "object": if (x._def.value === null) return [...acc, "null"];
				default: return acc;
			}
		}, []);
		if (types.length === options.length) {
			const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
			return {
				type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
				enum: options.reduce((acc, x) => {
					return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
				}, [])
			};
		}
	} else if (options.every((x) => x._def.typeName === "ZodEnum")) return {
		type: "string",
		enum: options.reduce((acc, x) => [...acc, ...x._def.values.filter((x) => !acc.includes(x))], [])
	};
	return asAnyOf(def, refs);
}
const asAnyOf = (def, refs) => {
	const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"anyOf",
			`${i}`
		]
	})).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
	return anyOf.length ? { anyOf } : void 0;
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/nullable.ts
function parseNullableDef(def, refs) {
	if ([
		"ZodString",
		"ZodNumber",
		"ZodBigInt",
		"ZodBoolean",
		"ZodNull"
	].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) return { type: [primitiveMappings[def.innerType._def.typeName], "null"] };
	const base = parseDef(def.innerType._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"anyOf",
			"0"
		]
	});
	return base && { anyOf: [base, { type: "null" }] };
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/number.ts
function parseNumberDef(def) {
	const res = { type: "number" };
	if (!def.checks) return res;
	for (const check of def.checks) switch (check.kind) {
		case "int":
			res.type = "integer";
			break;
		case "min":
			if (check.inclusive) res.minimum = check.value;
			else res.exclusiveMinimum = check.value;
			break;
		case "max":
			if (check.inclusive) res.maximum = check.value;
			else res.exclusiveMaximum = check.value;
			break;
		case "multipleOf": res.multipleOf = check.value;
	}
	return res;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/object.ts
function parseObjectDef(def, refs) {
	const result = {
		type: "object",
		properties: {}
	};
	const required = [];
	const shape = def.shape();
	for (const propName in shape) {
		let propDef = shape[propName];
		if (propDef === void 0 || propDef._def === void 0) continue;
		const propOptional = safeIsOptional(propDef);
		const parsedDef = parseDef(propDef._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"properties",
				propName
			],
			propertyPath: [
				...refs.currentPath,
				"properties",
				propName
			]
		});
		if (parsedDef === void 0) continue;
		result.properties[propName] = parsedDef;
		if (!propOptional) required.push(propName);
	}
	if (required.length) result.required = required;
	const additionalProperties = decideAdditionalProperties(def, refs);
	if (additionalProperties !== void 0) result.additionalProperties = additionalProperties;
	return result;
}
function decideAdditionalProperties(def, refs) {
	if (def.catchall._def.typeName !== "ZodNever") return parseDef(def.catchall._def, {
		...refs,
		currentPath: [...refs.currentPath, "additionalProperties"]
	});
	switch (def.unknownKeys) {
		case "passthrough": return refs.allowedAdditionalProperties;
		case "strict": return refs.rejectedAdditionalProperties;
		case "strip": return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
	}
}
function safeIsOptional(schema) {
	try {
		return schema.isOptional();
	} catch {
		return true;
	}
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/optional.ts
const parseOptionalDef = (def, refs) => {
	if (refs.currentPath.toString() === refs.propertyPath?.toString()) return parseDef(def.innerType._def, refs);
	const innerSchema = parseDef(def.innerType._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"anyOf",
			"1"
		]
	});
	return innerSchema ? { anyOf: [{ not: parseAnyDef() }, innerSchema] } : parseAnyDef();
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/pipeline.ts
const parsePipelineDef = (def, refs) => {
	if (refs.pipeStrategy === "input") return parseDef(def.in._def, refs);
	else if (refs.pipeStrategy === "output") return parseDef(def.out._def, refs);
	const inputSchema = parseDef(def.in._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"allOf",
			"0"
		]
	});
	return { allOf: [inputSchema, parseDef(def.out._def, {
		...refs,
		currentPath: [
			...refs.currentPath,
			"allOf",
			inputSchema ? "1" : "0"
		]
	})].filter((schema) => schema !== void 0) };
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/promise.ts
function parsePromiseDef(def, refs) {
	return parseDef(def.type._def, refs);
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/set.ts
function parseSetDef(def, refs) {
	const schema = {
		type: "array",
		uniqueItems: true,
		items: parseDef(def.valueType._def, {
			...refs,
			currentPath: [...refs.currentPath, "items"]
		})
	};
	if (def.minSize) schema.minItems = def.minSize.value;
	if (def.maxSize) schema.maxItems = def.maxSize.value;
	return schema;
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/tuple.ts
function parseTupleDef(def, refs) {
	if (def.rest) return {
		type: "array",
		minItems: def.items.length,
		items: def.items.map((x, i) => parseDef(x._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"items",
				`${i}`
			]
		})).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
		additionalItems: parseDef(def.rest._def, {
			...refs,
			currentPath: [...refs.currentPath, "additionalItems"]
		})
	};
	else return {
		type: "array",
		minItems: def.items.length,
		maxItems: def.items.length,
		items: def.items.map((x, i) => parseDef(x._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"items",
				`${i}`
			]
		})).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
	};
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/undefined.ts
function parseUndefinedDef() {
	return { not: parseAnyDef() };
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/unknown.ts
function parseUnknownDef() {
	return parseAnyDef();
}
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parsers/readonly.ts
const parseReadonlyDef = (def, refs) => {
	return parseDef(def.innerType._def, refs);
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/select-parser.ts
const selectParser = (def, typeName, refs) => {
	switch (typeName) {
		case "ZodString": return parseStringDef(def, refs);
		case "ZodNumber": return parseNumberDef(def);
		case "ZodObject": return parseObjectDef(def, refs);
		case "ZodBigInt": return parseBigintDef(def);
		case "ZodBoolean": return parseBooleanDef();
		case "ZodDate": return parseDateDef(def, refs);
		case "ZodUndefined": return parseUndefinedDef();
		case "ZodNull": return parseNullDef();
		case "ZodArray": return parseArrayDef(def, refs);
		case "ZodUnion":
		case "ZodDiscriminatedUnion": return parseUnionDef(def, refs);
		case "ZodIntersection": return parseIntersectionDef(def, refs);
		case "ZodTuple": return parseTupleDef(def, refs);
		case "ZodRecord": return parseRecordDef(def, refs);
		case "ZodLiteral": return parseLiteralDef(def);
		case "ZodEnum": return parseEnumDef(def);
		case "ZodNativeEnum": return parseNativeEnumDef(def);
		case "ZodNullable": return parseNullableDef(def, refs);
		case "ZodOptional": return parseOptionalDef(def, refs);
		case "ZodMap": return parseMapDef(def, refs);
		case "ZodSet": return parseSetDef(def, refs);
		case "ZodLazy": return () => def.getter()._def;
		case "ZodPromise": return parsePromiseDef(def, refs);
		case "ZodNaN":
		case "ZodNever": return parseNeverDef();
		case "ZodEffects": return parseEffectsDef(def, refs);
		case "ZodAny": return parseAnyDef();
		case "ZodUnknown": return parseUnknownDef();
		case "ZodDefault": return parseDefaultDef(def, refs);
		case "ZodBranded": return parseBrandedDef(def, refs);
		case "ZodReadonly": return parseReadonlyDef(def, refs);
		case "ZodCatch": return parseCatchDef(def, refs);
		case "ZodPipeline": return parsePipelineDef(def, refs);
		case "ZodFunction":
		case "ZodVoid":
		case "ZodSymbol": return;
		default:
 /* c8 ignore next */
		return ((_) => void 0)(typeName);
	}
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/get-relative-path.ts
const getRelativePath = (pathA, pathB) => {
	let i = 0;
	for (; i < pathA.length && i < pathB.length; i++) if (pathA[i] !== pathB[i]) break;
	return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/parse-def.ts
function parseDef(def, refs, forceResolution = false) {
	const seenItem = refs.seen.get(def);
	if (refs.override) {
		const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
		if (overrideResult !== ignoreOverride) return overrideResult;
	}
	if (seenItem && !forceResolution) {
		const seenSchema = get$ref(seenItem, refs);
		if (seenSchema !== void 0) return seenSchema;
	}
	const newItem = {
		def,
		path: refs.currentPath,
		jsonSchema: void 0
	};
	refs.seen.set(def, newItem);
	const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
	const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
	if (jsonSchema) addMeta(def, refs, jsonSchema);
	if (refs.postProcess) {
		const postProcessResult = refs.postProcess(jsonSchema, def, refs);
		newItem.jsonSchema = jsonSchema;
		return postProcessResult;
	}
	newItem.jsonSchema = jsonSchema;
	return jsonSchema;
}
const get$ref = (item, refs) => {
	switch (refs.$refStrategy) {
		case "root": return { $ref: item.path.join("/") };
		case "relative": return { $ref: getRelativePath(refs.currentPath, item.path) };
		case "none":
		case "seen":
			if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
				console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
				return parseAnyDef();
			}
			return refs.$refStrategy === "seen" ? parseAnyDef() : void 0;
	}
};
const addMeta = (def, refs, jsonSchema) => {
	if (def.description) jsonSchema.description = def.description;
	return jsonSchema;
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/refs.ts
const getRefs = (options) => {
	const _options = getDefaultOptions(options);
	const currentPath = _options.name !== void 0 ? [
		..._options.basePath,
		_options.definitionPath,
		_options.name
	] : _options.basePath;
	return {
		..._options,
		currentPath,
		propertyPath: void 0,
		seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [def._def, {
			def: def._def,
			path: [
				..._options.basePath,
				_options.definitionPath,
				name
			],
			jsonSchema: void 0
		}]))
	};
};
//#endregion
//#region src/to-json-schema/zod3-to-json-schema/zod3-to-json-schema.ts
const zod3ToJsonSchema = (schema, options) => {
	const refs = getRefs(options);
	let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name, schema]) => ({
		...acc,
		[name]: parseDef(schema._def, {
			...refs,
			currentPath: [
				...refs.basePath,
				refs.definitionPath,
				name
			]
		}, true) ?? parseAnyDef()
	}), {}) : void 0;
	const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
	const main = parseDef(schema._def, name === void 0 ? refs : {
		...refs,
		currentPath: [
			...refs.basePath,
			refs.definitionPath,
			name
		]
	}, false) ?? parseAnyDef();
	const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
	if (title !== void 0) main.title = title;
	const combined = name === void 0 ? definitions ? {
		...main,
		[refs.definitionPath]: definitions
	} : main : {
		$ref: [
			...refs.$refStrategy === "relative" ? [] : refs.basePath,
			refs.definitionPath,
			name
		].join("/"),
		[refs.definitionPath]: {
			...definitions,
			[name]: main
		}
	};
	combined.$schema = "http://json-schema.org/draft-07/schema#";
	return combined;
};
//#endregion
//#region src/schema.ts
/**
* Used to mark schemas so we can support both Zod and custom schemas.
*/
const schemaSymbol = Symbol.for("vercel.ai.schema");
/**
* Creates a schema with deferred creation.
* This is important to reduce the startup time of the library
* and to avoid initializing unused validators.
*
* @param createValidator A function that creates a schema.
* @returns A function that returns a schema.
*/
function lazySchema(createSchema) {
	let schema;
	return () => {
		if (schema == null) schema = createSchema();
		return schema;
	};
}
/**
* Create a schema using a JSON Schema.
*
* @param jsonSchema The JSON Schema for the schema.
* @param options.validate Optional. A validation function for the schema.
*/
function jsonSchema(jsonSchema, { validate } = {}) {
	return {
		[schemaSymbol]: true,
		_type: void 0,
		get jsonSchema() {
			if (typeof jsonSchema === "function") jsonSchema = jsonSchema();
			return jsonSchema;
		},
		validate
	};
}
function isSchema(value) {
	return typeof value === "object" && value !== null && schemaSymbol in value && value[schemaSymbol] === true && "jsonSchema" in value && "validate" in value;
}
function asSchema(schema) {
	return schema == null ? jsonSchema({
		type: "object",
		properties: {},
		additionalProperties: false
	}) : isSchema(schema) ? schema : "~standard" in schema ? schema["~standard"].vendor === "zod" ? zodSchema(schema) : standardSchema(schema) : schema();
}
function standardSchema(standardSchema) {
	return jsonSchema(() => {
		if (!hasStandardJsonSchema(standardSchema)) throw new Error(`Standard schema vendor '${standardSchema["~standard"].vendor}' does not support JSON Schema conversion.`);
		return addAdditionalPropertiesToJsonSchema(standardSchema["~standard"].jsonSchema.input({ target: "draft-07" }));
	}, { validate: async (value) => {
		const result = await standardSchema["~standard"].validate(value);
		return "value" in result ? {
			success: true,
			value: result.value
		} : {
			success: false,
			error: new dist/* TypeValidationError */.iM({
				value,
				cause: result.issues
			})
		};
	} });
}
function hasStandardJsonSchema(schema) {
	return schema["~standard"].jsonSchema != null;
}
function zod3Schema(zodSchema, options) {
	const useReferences = options?.useReferences ?? false;
	return jsonSchema(() => zod3ToJsonSchema(zodSchema, { $refStrategy: useReferences ? "root" : "none" }), { validate: async (value) => {
		const result = await zodSchema.safeParseAsync(value);
		return result.success ? {
			success: true,
			value: result.data
		} : {
			success: false,
			error: result.error
		};
	} });
}
function zod4Schema(zodSchema, options) {
	if (!(0,core/* config */.$W)().localeError) (0,core/* config */.$W)((0,en/* default */.A)());
	const useReferences = options?.useReferences ?? false;
	return jsonSchema(() => addAdditionalPropertiesToJsonSchema((0,json_schema_processors/* toJSONSchema */.bl)(zodSchema, {
		target: "draft-7",
		io: "input",
		reused: useReferences ? "ref" : "inline"
	})), { validate: async (value) => {
		const result = await (0,parse/* safeParseAsync */.bp)(zodSchema, value);
		return result.success ? {
			success: true,
			value: result.data
		} : {
			success: false,
			error: result.error
		};
	} });
}
function isZod4Schema(zodSchema) {
	return "_zod" in zodSchema;
}
function zodSchema(zodSchema, options) {
	if (isZod4Schema(zodSchema)) return zod4Schema(zodSchema, options);
	else return zod3Schema(zodSchema, options);
}
//#endregion
//#region src/validate-types.ts
/**
* Validates the types of an unknown object using a schema and
* return a strongly-typed object.
*
* @template T - The type of the object to validate.
* @param {string} options.value - The object to validate.
* @param {Validator<T>} options.schema - The schema to use for validating the JSON.
* @param {TypeValidationContext} options.context - Optional context about what is being validated.
* @returns {Promise<T>} - The typed object.
*/
async function validateTypes({ value, schema, context }) {
	const result = await safeValidateTypes({
		value,
		schema,
		context
	});
	if (!result.success) throw dist/* TypeValidationError */.iM.wrap({
		value,
		cause: result.error,
		context
	});
	return result.value;
}
/**
* Safely validates the types of an unknown object using a schema and
* return a strongly-typed object.
*
* @template T - The type of the object to validate.
* @param {string} options.value - The JSON object to validate.
* @param {Validator<T>} options.schema - The schema to use for validating the JSON.
* @param {TypeValidationContext} options.context - Optional context about what is being validated.
* @returns An object with either a `success` flag and the parsed and typed data, or a `success` flag and an error object.
*/
async function safeValidateTypes({ value, schema, context }) {
	const actualSchema = asSchema(schema);
	try {
		if (actualSchema.validate == null) return {
			success: true,
			value,
			rawValue: value
		};
		const result = await actualSchema.validate(value);
		if (result.success) return {
			success: true,
			value: result.value,
			rawValue: value
		};
		return {
			success: false,
			error: dist/* TypeValidationError */.iM.wrap({
				value,
				cause: result.error,
				context
			}),
			rawValue: value
		};
	} catch (error) {
		return {
			success: false,
			error: dist/* TypeValidationError */.iM.wrap({
				value,
				cause: error,
				context
			}),
			rawValue: value
		};
	}
}
//#endregion
//#region src/parse-json.ts
async function parseJSON({ text, schema }) {
	try {
		const value = secureJsonParse(text);
		if (schema == null) return value;
		return await validateTypes({
			value,
			schema
		});
	} catch (error) {
		if (dist/* JSONParseError */.u6.isInstance(error) || dist/* TypeValidationError */.iM.isInstance(error)) throw error;
		throw new dist/* JSONParseError */.u6({
			text,
			cause: error
		});
	}
}
async function safeParseJSON({ text, schema }) {
	try {
		const value = secureJsonParse(text);
		if (schema == null) return {
			success: true,
			value,
			rawValue: value
		};
		return await safeValidateTypes({
			value,
			schema
		});
	} catch (error) {
		return {
			success: false,
			error: dist/* JSONParseError */.u6.isInstance(error) ? error : new dist/* JSONParseError */.u6({
				text,
				cause: error
			}),
			rawValue: void 0
		};
	}
}
function isParsableJson(input) {
	try {
		secureJsonParse(input);
		return true;
	} catch {
		return false;
	}
}
//#endregion
//#region src/parse-json-event-stream.ts
/**
* Parses a JSON event stream into a stream of parsed JSON objects.
*/
function parseJsonEventStream({ stream, schema }) {
	return stream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).pipeThrough(new TransformStream({ async transform({ data }, controller) {
		if (data === "[DONE]") return;
		controller.enqueue(await safeParseJSON({
			text: data,
			schema
		}));
	} }));
}
//#endregion
//#region src/parse-provider-options.ts
async function parseProviderOptions({ provider, providerOptions, schema }) {
	if (providerOptions?.[provider] == null) return;
	const parsedProviderOptions = await safeValidateTypes({
		value: providerOptions[provider],
		schema
	});
	if (!parsedProviderOptions.success) throw new dist/* InvalidArgumentError */.Di({
		argument: "providerOptions",
		message: `invalid ${provider} provider options`,
		cause: parsedProviderOptions.error
	});
	return parsedProviderOptions.value;
}
//#endregion
//#region src/resolve-provider-options.ts
/**
* Parses provider options that a model accepts under more than one
* `providerOptions` namespace, e.g. a canonical key plus a provider-specific
* or legacy alias.
*
* Each present namespace is validated against `schema` exactly like
* `parseProviderOptions` does, so an invalid namespace throws.
*
* @returns the resolved options (`undefined` when no namespace is present)
* and the namespaces that contributed to them, in resolution order.
*/
async function resolveProviderOptions({ providerOptions, namespaces, resolution, schema }) {
	const parsed = [];
	const matched = [];
	for (const namespace of new Set(namespaces)) {
		const options = await parseProviderOptions({
			provider: namespace,
			providerOptions,
			schema
		});
		if (options == null) continue;
		if (resolution === "first") return {
			options,
			namespaces: [namespace]
		};
		parsed.push(options);
		matched.push(namespace);
	}
	return {
		options: parsed.length === 0 ? void 0 : Object.assign({}, ...parsed),
		namespaces: matched
	};
}
//#endregion
//#region src/post-multipart-stream-to-api.ts
const getOriginalFetch$1 = () => globalThis.fetch;
function escapeMultipartHeaderValue(value) {
	return value.replace(/[\r\n]/g, "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
function createMultipartBody(parts, boundary) {
	const encoder = new TextEncoder();
	let disposed = false;
	let activeReader;
	const enteredStreams = /* @__PURE__ */ new Set();
	async function* emitParts() {
		for (const part of parts) {
			if (disposed) return;
			const disposition = `--${boundary}\r\nContent-Disposition: form-data; name="${escapeMultipartHeaderValue(part.name)}"`;
			if (part.type === "field") {
				yield encoder.encode(`${disposition}\r\n\r\n${part.value}\r\n`);
				continue;
			}
			const filenameParameter = `; filename="${escapeMultipartHeaderValue(part.filename ?? "blob")}"`;
			const mediaType = (part.mediaType ?? "application/octet-stream").replace(/[\r\n]/g, "");
			yield encoder.encode(`${disposition}${filenameParameter}\r\nContent-Type: ${mediaType}\r\n\r\n`);
			if (part.content instanceof Uint8Array) yield part.content;
			else {
				const reader = part.content.getReader();
				activeReader = reader;
				enteredStreams.add(part.content);
				let finished = false;
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done || disposed) {
							finished = done;
							break;
						}
						yield value;
					}
				} finally {
					activeReader = void 0;
					if (!finished) await reader.cancel().catch(() => {});
					reader.releaseLock();
				}
				if (disposed) return;
			}
			yield encoder.encode("\r\n");
		}
		yield encoder.encode(`--${boundary}--\r\n`);
	}
	return {
		stream: convertAsyncIteratorToReadableStream(emitParts()),
		async dispose(reason) {
			if (disposed) return;
			disposed = true;
			const reader = activeReader;
			if (reader != null) await reader.cancel(reason).catch(() => {});
			for (const part of parts) if (part.type === "file" && !(part.content instanceof Uint8Array) && !enteredStreams.has(part.content)) await part.content.cancel(reason).catch(() => {});
		}
	};
}
/**
* POSTs a multipart/form-data body as a request stream, so file parts backed
* by a `ReadableStream` are sent without buffering the full file in memory.
*
* Requires a fetch implementation that supports streaming request bodies
* (`duplex: 'half'`). Callers with fully buffered payloads can keep using
* `postFormDataToApi`.
*/
const postMultipartStreamToApi = async ({ url, headers = {}, parts, failedResponseHandler, successfulResponseHandler, abortSignal, fetch = getOriginalFetch$1() }) => {
	const boundary = `ai-sdk-multipart-${generateId()}`;
	const requestBodyValues = Object.fromEntries(parts.map((part) => [part.name, part.type === "field" ? part.value : `<file:${part.filename ?? part.name}>`]));
	const body = createMultipartBody(parts, boundary);
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: withUserAgentSuffix({
				...headers,
				"Content-Type": `multipart/form-data; boundary=${boundary}`
			}, `ai-sdk-provider-utils/${VERSION}`, getRuntimeEnvironmentUserAgent()),
			body: body.stream,
			duplex: "half",
			signal: abortSignal
		});
		const responseHeaders = extractResponseHeaders(response);
		if (!response.ok) {
			let errorInformation;
			try {
				errorInformation = await failedResponseHandler({
					response,
					url,
					requestBodyValues
				});
			} catch (error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
				throw new dist/* APICallError */.hL({
					message: "Failed to process error response",
					cause: error,
					statusCode: response.status,
					url,
					responseHeaders,
					requestBodyValues
				});
			}
			throw errorInformation.value;
		}
		try {
			return await successfulResponseHandler({
				response,
				url,
				requestBodyValues
			});
		} catch (error) {
			if (error instanceof Error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
			}
			throw new dist/* APICallError */.hL({
				message: "Failed to process successful response",
				cause: error,
				statusCode: response.status,
				url,
				responseHeaders,
				requestBodyValues
			});
		}
	} catch (error) {
		await body.dispose(error);
		throw handleFetchError({
			error,
			url,
			requestBodyValues
		});
	}
};
//#endregion
//#region src/post-to-api.ts
const getOriginalFetch = () => globalThis.fetch;
const postJsonToApi = async ({ url, headers, body, failedResponseHandler, successfulResponseHandler, abortSignal, fetch }) => await postToApi({
	url,
	headers: {
		"Content-Type": "application/json",
		...headers
	},
	body: {
		content: JSON.stringify(body),
		values: body
	},
	failedResponseHandler,
	successfulResponseHandler,
	abortSignal,
	fetch
});
const postFormDataToApi = async ({ url, headers, formData, failedResponseHandler, successfulResponseHandler, abortSignal, fetch }) => await postToApi({
	url,
	headers,
	body: {
		content: formData,
		values: Object.fromEntries(formData.entries())
	},
	failedResponseHandler,
	successfulResponseHandler,
	abortSignal,
	fetch
});
const postToApi = async ({ url, headers = {}, body, successfulResponseHandler, failedResponseHandler, abortSignal, fetch = getOriginalFetch() }) => {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: withUserAgentSuffix(headers, `ai-sdk-provider-utils/${VERSION}`, getRuntimeEnvironmentUserAgent()),
			body: body.content,
			signal: abortSignal
		});
		const responseHeaders = extractResponseHeaders(response);
		if (!response.ok) {
			let errorInformation;
			try {
				errorInformation = await failedResponseHandler({
					response,
					url,
					requestBodyValues: body.values
				});
			} catch (error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
				throw new dist/* APICallError */.hL({
					message: "Failed to process error response",
					cause: error,
					statusCode: response.status,
					url,
					responseHeaders,
					requestBodyValues: body.values
				});
			}
			throw errorInformation.value;
		}
		try {
			return await successfulResponseHandler({
				response,
				url,
				requestBodyValues: body.values
			});
		} catch (error) {
			if (error instanceof Error) {
				if (isAbortError(error) || dist/* APICallError */.hL.isInstance(error)) throw error;
			}
			throw new dist/* APICallError */.hL({
				message: "Failed to process successful response",
				cause: error,
				statusCode: response.status,
				url,
				responseHeaders,
				requestBodyValues: body.values
			});
		}
	} catch (error) {
		throw handleFetchError({
			error,
			url,
			requestBodyValues: body.values
		});
	}
};
//#endregion
//#region src/types/tool.ts
function tool(tool) {
	return tool;
}
/**
* Define a dynamic tool.
*/
function dynamicTool(tool) {
	return {
		...tool,
		type: "dynamic"
	};
}
//#endregion
//#region src/telemetry-redaction.ts
const telemetryRedaction = Symbol.for("vercel.ai.telemetry.redact");
/**
* Attach a provider-owned telemetry view without changing the original value.
* The annotation is not serialized or included in enumerable application data.
* Keep the annotated object when forwarding tool arguments or provider metadata.
*/
function withTelemetryRedaction(value, redact) {
	return Object.create(Object.getPrototypeOf(value), {
		...Object.getOwnPropertyDescriptors(value),
		[telemetryRedaction]: {
			value: redact,
			configurable: true
		}
	});
}
/** Apply the provider's telemetry view, leaving unannotated values unchanged. */
function redactTelemetryValue(value) {
	if (value == null || typeof value !== "object") return value;
	const redact = Object.getOwnPropertyDescriptor(value, telemetryRedaction)?.value;
	if (typeof redact !== "function") return value;
	try {
		return redact(value);
	} catch {
		return;
	}
}
//#endregion
//#region src/provider-defined-tool-factory.ts
function createProviderDefinedToolFactory({ id, inputSchema, redactArgs }) {
	return ({ execute, outputSchema, needsApproval, toModelOutput, onInputStart, onInputDelta, onInputAvailable, ...args }) => tool({
		type: "provider",
		isProviderExecuted: false,
		id,
		args: redactArgs == null ? args : withTelemetryRedaction(args, redactArgs),
		inputSchema,
		outputSchema,
		execute,
		needsApproval,
		toModelOutput,
		onInputStart,
		onInputDelta,
		onInputAvailable
	});
}
function createProviderDefinedToolFactoryWithOutputSchema({ id, inputSchema, outputSchema, redactArgs }) {
	return ({ execute, needsApproval, toModelOutput, onInputStart, onInputDelta, onInputAvailable, ...args }) => tool({
		type: "provider",
		isProviderExecuted: false,
		id,
		args: redactArgs == null ? args : withTelemetryRedaction(args, redactArgs),
		inputSchema,
		outputSchema,
		execute,
		needsApproval,
		toModelOutput,
		onInputStart,
		onInputDelta,
		onInputAvailable
	});
}
//#endregion
//#region src/provider-executed-tool-factory.ts
function createProviderExecutedToolFactory({ id, inputSchema, outputSchema, supportsDeferredResults, redactArgs }) {
	return ({ onInputStart, onInputDelta, onInputAvailable, ...args }) => tool({
		type: "provider",
		isProviderExecuted: true,
		id,
		args: redactArgs == null ? args : withTelemetryRedaction(args, redactArgs),
		inputSchema,
		outputSchema,
		onInputStart,
		onInputDelta,
		onInputAvailable,
		supportsDeferredResults
	});
}
//#endregion
//#region src/resolve.ts
/**
* Resolves a value that could be a raw value, a Promise, a function returning a value,
* or a function returning a Promise.
*/
async function resolve(value) {
	if (typeof value === "function") value = value();
	return value;
}
/**
* Resolves and transforms a value, preserving synchronous results. This allows
* synchronous credentials to remain usable by workflow serialization while
* asynchronous credentials are awaited by request handlers.
*/
function resolveWith(value, transform) {
	const resolved = typeof value === "function" ? value() : value;
	if (resolved != null && (typeof resolved === "object" || typeof resolved === "function") && typeof resolved.then === "function") return Promise.resolve(resolved).then(transform);
	return transform(resolved);
}
//#endregion
//#region src/resolve-full-media-type.ts
/**
* Resolves a file part's media type to a full `type/subtype` form required by
* providers whose API demands the full IANA media type.
*
* - If `part.mediaType` is already a full media type (e.g. `image/png`), it is
*   returned as-is.
* - Otherwise, when inline bytes are available (`part.data.type === 'data'`),
*   the subtype is sniffed from the bytes using the signature table that
*   corresponds to the top-level segment.
* - When neither applies (e.g. top-level-only with a URL source, or bytes that
*   cannot be detected), an `UnsupportedFunctionalityError` is thrown.
*/
function resolveFullMediaType({ part }) {
	if (isFullMediaType(part.mediaType)) return part.mediaType;
	if (part.data.type === "data") {
		const detected = detectMediaType({
			data: part.data.data,
			topLevelType: getTopLevelMediaType(part.mediaType)
		});
		if (detected) return detected;
		throw new dist/* UnsupportedFunctionalityError */.b8({ functionality: `file of media type "${part.mediaType}" must specify subtype since it could not be auto-detected` });
	}
	throw new dist/* UnsupportedFunctionalityError */.b8({ functionality: `file of media type "${part.mediaType}" must specify subtype since it is not passed as inline bytes` });
}
//#endregion
//#region src/resolve-provider-reference.ts
/**
* Resolves a provider reference to the provider-specific identifier for the
* given provider. Throws `NoSuchProviderReferenceError` if the provider is not
* found in the reference mapping.
*/
function resolveProviderReference({ reference, provider }) {
	const id = reference[provider];
	if (id != null) return id;
	throw new dist/* NoSuchProviderReferenceError */.vb({
		provider,
		reference
	});
}
//#endregion
//#region src/retry-with-exponential-backoff.ts
/**
* Retries a failed operation with exponential backoff.
*/
const retryWithExponentialBackoff = ({ maxRetries = 2, initialDelayInMs = 2e3, backoffFactor = 2, abortSignal, shouldRetry, getDelayInMs = ({ exponentialBackoffDelay }) => exponentialBackoffDelay, createRetryError = ({ message }) => new Error(message) }) => async (f) => retryWithExponentialBackoffInternal(f, {
	maxRetries,
	delayInMs: initialDelayInMs,
	backoffFactor,
	abortSignal,
	shouldRetry,
	getDelayInMs,
	createRetryError
});
async function retryWithExponentialBackoffInternal(f, { maxRetries, delayInMs, backoffFactor, abortSignal, shouldRetry, getDelayInMs, createRetryError }, errors = []) {
	try {
		return await f();
	} catch (error) {
		if (isAbortError(error)) throw error;
		if (maxRetries === 0) throw error;
		const errorMessage = (0,dist/* getErrorMessage */.u1)(error);
		const newErrors = [...errors, error];
		const tryNumber = newErrors.length;
		if (tryNumber > maxRetries) throw createRetryError({
			message: `Failed after ${tryNumber} attempts. Last error: ${errorMessage}`,
			reason: "maxRetriesExceeded",
			errors: newErrors
		});
		if (await shouldRetry(error) && tryNumber <= maxRetries) {
			await delay(getDelayInMs({
				error,
				exponentialBackoffDelay: delayInMs
			}), { abortSignal });
			return retryWithExponentialBackoffInternal(f, {
				maxRetries,
				delayInMs: backoffFactor * delayInMs,
				backoffFactor,
				abortSignal,
				shouldRetry,
				getDelayInMs,
				createRetryError
			}, newErrors);
		}
		if (tryNumber === 1) throw error;
		throw createRetryError({
			message: `Failed after ${tryNumber} attempts with non-retryable error: '${errorMessage}'`,
			reason: "errorNotRetryable",
			errors: newErrors
		});
	}
}
//#endregion
//#region src/json-binary-field-scanner.ts
/**
* Streaming extraction of large base64 strings from a JSON response body.
*
* A JSON response that carries an image or a file is mostly one very long
* base64 string. The regular pipeline (collect chunks, concatenate, decode to
* text, `JSON.parse`, decode base64) holds about four copies of that string at
* once. The scanner reads the body chunk by chunk instead: strings at the
* configured paths are decoded to bytes while they stream in, and the text that
* is handed to `JSON.parse` (the "skeleton") holds a short placeholder in their
* place.
*
* - The skeleton is the original body except for the extracted strings, so
*   `secureJsonParse` still sees every key (a base64 string cannot contain a
*   quote, so it cannot hide one).
* - A string is extracted only if it is canonical standard-alphabet base64
*   (length divisible by 4, `=` only as the final padding, zero trailing bits,
*   no escape sequences or whitespace). The bytes are then exactly what `atob`
*   gives for it. Everything else stays a string. What was decoded before a
*   string turned out not to qualify is encoded back, which gives the original
*   characters.
*/
/** Strings that decode to fewer bytes stay strings. */
const DEFAULT_BINARY_FIELD_MIN_BYTES = 65536;
const QUOTE = 34;
const BACKSLASH = 92;
const EQUALS = 61;
const COMMA = 44;
const COLON = 58;
const LEFT_BRACE = 123;
const RIGHT_BRACE = 125;
const LEFT_BRACKET = 91;
const RIGHT_BRACKET = 93;
const OUTSIDE = 0;
const KEY = 1;
const SKIP = 2;
const BLOB = 3;
/**
* Compiles paths such as `images[*]` or `content[*].data.data`: plain object
* keys (letters, digits, `_` and `-`) joined by `.`, and `[*]` for every
* element of an array. Keys are compared with the raw bytes of the key in the
* body, so a key written with an escape sequence never matches.
*/
function compileBinaryFieldPaths(paths) {
	const root = /* @__PURE__ */ new Map();
	for (const path of paths) {
		if (!/^(?:[\w-]+|\[\*])(?:\.[\w-]+|\[\*])*$/.test(path)) throw new dist/* InvalidArgumentError */.Di({
			argument: "experimental_binaryFields",
			message: `Invalid binary field path "${path}"`
		});
		let node = root;
		for (const segment of path.match(/\[\*]|[\w-]+/g)) {
			const edges = segment === "[*]" ? [null] : new TextEncoder().encode(`${segment}"`);
			for (const edge of edges) {
				let next = node.get(edge);
				if (next === void 0) node.set(edge, next = /* @__PURE__ */ new Map());
				node = next;
			}
		}
		node.set(true, node);
	}
	return root;
}
function join(parts, length) {
	const bytes = new Uint8Array(length);
	let at = 0;
	for (const part of parts) {
		bytes.set(part, at);
		at += part.length;
	}
	return bytes;
}
function createJsonBinaryFieldScanner(paths, minBytes = DEFAULT_BINARY_FIELD_MIN_BYTES) {
	const sextet = (/* @__PURE__ */ new Uint8Array(256)).fill(64);
	for (let index = 0; index < 64; index++) sextet["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(index)] = index;
	const encoder = new TextEncoder();
	const pieces = [];
	let piece = /* @__PURE__ */ new Uint8Array(65536);
	let pieceLength = 0;
	let size = 0;
	const binaries = /* @__PURE__ */ new Map();
	const frames = [];
	let skipped = 0;
	let mode = OUTSIDE;
	let escaped = false;
	let last = 0;
	let key;
	let segments = [];
	let segment = /* @__PURE__ */ new Uint8Array(0);
	let at = 0;
	let total = 0;
	let bits = 0;
	let chars = 0;
	let padding = 0;
	const add = (bytes) => {
		for (let offset = 0; offset < bytes.length;) {
			const length = Math.min(piece.length - pieceLength, bytes.length - offset);
			piece.set(bytes.subarray(offset, offset + length), pieceLength);
			pieceLength += length;
			offset += length;
			size += length;
			if (pieceLength === piece.length) {
				pieces.push(piece);
				piece = /* @__PURE__ */ new Uint8Array(65536);
				pieceLength = 0;
			}
		}
	};
	const emit = (chunk, start, end) => add(chunk.subarray(start, end));
	const reset = () => {
		segments = [];
		segment = /* @__PURE__ */ new Uint8Array(0);
		at = 0;
		total = 0;
		bits = 0;
		chars = 0;
		padding = 0;
	};
	const grow = () => {
		if (at > 0) segments.push(segment.subarray(0, at));
		segment = new Uint8Array(Math.min(Math.max(total, 4096), 4 << 20));
		at = 0;
	};
	const rest = () => bits << (4 - chars) * 6;
	const restore = () => {
		for (const part of [...segments, segment.subarray(0, at)]) add(encoder.encode(convertUint8ArrayToBase64(part)));
		const group = rest();
		add(encoder.encode(convertUint8ArrayToBase64(Uint8Array.of(group >> 16, group >> 8, group)).slice(0, chars) + "=".repeat(padding)));
		reset();
	};
	const closeBlob = () => {
		mode = OUTSIDE;
		const tail = chars && chars - 1;
		if (padding === (4 - chars) % 4 && !(bits & (1 << (4 - chars) * 2) - 1) && total + tail >= minBytes) {
			const group = rest();
			const bytes = join([...segments, segment.subarray(0, at)], total + tail);
			for (let index = 0; index < tail; index++) bytes[total + index] = group >> 16 - 8 * index;
			const placeholder = `[binary data: ${bytes.length} bytes; ref ${crypto.getRandomValues(/* @__PURE__ */ new Uint32Array(2)).join("-")}]`;
			binaries.set(placeholder, bytes);
			add(encoder.encode(placeholder));
			reset();
		} else restore();
	};
	const push = (chunk) => {
		let from = 0;
		const { length } = chunk;
		for (let index = 0; index < length; index++) {
			let byte = chunk[index];
			if (mode === BLOB) {
				if (padding === 0) {
					let pending = bits;
					let count = chars;
					for (let value; index < length && (value = sextet[chunk[index]]) < 64; index++) {
						pending = pending << 6 | value;
						if (++count === 4) {
							if (at + 3 > segment.length) grow();
							segment[at++] = pending >> 16;
							segment[at++] = pending >> 8;
							segment[at++] = pending;
							total += 3;
							pending = 0;
							count = 0;
						}
					}
					bits = pending;
					chars = count;
				}
				if (index >= length) break;
				byte = chunk[index];
				if (byte === QUOTE) {
					closeBlob();
					from = index;
				} else if (byte === EQUALS && chars > 1 && padding < 4 - chars) padding++;
				else {
					restore();
					mode = SKIP;
					from = index--;
				}
			} else if (mode !== OUTSIDE) {
				if (mode === KEY) key = key?.get(byte);
				if (escaped) escaped = false;
				else if (byte === BACKSLASH) escaped = true;
				else if (byte === QUOTE) {
					if (mode === KEY) frames.at(-1).next = key;
					mode = OUTSIDE;
				}
			} else if (byte === QUOTE) {
				const frame = frames.at(-1);
				if (skipped > 0) mode = SKIP;
				else if (frame?.keys && (last === LEFT_BRACE || last === COMMA)) {
					mode = KEY;
					key = frame.keys;
				} else if ((frame ? frame.next : paths)?.get(true)) {
					mode = BLOB;
					emit(chunk, from, index + 1);
				} else mode = SKIP;
			} else if (byte === LEFT_BRACE || byte === LEFT_BRACKET) {
				last = byte;
				const frame = frames.at(-1);
				const node = skipped > 0 ? void 0 : frame ? frame.next : paths;
				const items = node?.get(null);
				if (byte === LEFT_BRACE && node) frames.push({ keys: node });
				else if (byte === LEFT_BRACKET && items) frames.push({
					keys: null,
					next: items
				});
				else skipped++;
			} else if (byte === RIGHT_BRACE || byte === RIGHT_BRACKET) {
				if (skipped > 0) skipped--;
				else frames.pop();
			} else if (byte === COMMA || byte === COLON) last = byte;
		}
		if (mode !== BLOB) emit(chunk, from, length);
	};
	const finish = () => {
		if (mode === BLOB) restore();
		return {
			text: new TextDecoder().decode(join([...pieces, piece.subarray(0, pieceLength)], size)),
			binaries
		};
	};
	return {
		push,
		finish
	};
}
/**
* Replaces the placeholders in a parsed value with the bytes they stand for.
* Objects and arrays are copied, the parsed value is not modified. A
* placeholder holds a random number, so a string that equals one is ours.
*/
function replaceBinaryFieldPlaceholders(value, binaries) {
	if (typeof value === "string") return binaries.get(value) ?? value;
	if (Array.isArray(value)) return value.map((item) => replaceBinaryFieldPlaceholders(item, binaries));
	if (value != null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, replaceBinaryFieldPlaceholders(item, binaries)]));
	return value;
}
/**
* Makes `JSON.stringify` give the placeholder for each of the arrays, instead
* of `{"0":…,"1":…}` with an entry for every byte: 24 MiB of bytes would
* become a string of more than 300 MB. That is what a validator, or the code
* that reports its issues, does with a value it puts into an error message.
* The property is not enumerable, so the arrays look the same otherwise.
* Returns the function that removes it again.
*/
function maskBinariesInJson(binaries) {
	for (const [placeholder, bytes] of binaries) Object.defineProperty(bytes, "toJSON", {
		value: () => placeholder,
		configurable: true
	});
	return () => {
		for (const bytes of binaries.values()) Reflect.deleteProperty(bytes, "toJSON");
	};
}
/**
* Wraps a schema so that it validates the extracted bytes in place of their
* placeholders. The value parsed from the skeleton, and the value of the
* validation error of the response, keep the placeholders: reporting an error
* never prints the bytes.
*
* The errors of the schema itself may hold the bytes: a Standard Schema
* validator wraps the value it was given into an error, and the issues it
* reports may carry the offending input. So that their messages do not grow
* with the image, the arrays stringify as their placeholders, and keep doing
* so as long as an error can refer to them. When the validation succeeds the
* arrays are plain again, for whoever receives them.
*/
function withBinaryFields(schema, binaries) {
	if (binaries.size === 0) return schema;
	const actualSchema = asSchema(schema);
	return jsonSchema({}, { validate: async (value) => {
		const replaced = replaceBinaryFieldPlaceholders(value, binaries);
		const unmask = maskBinariesInJson(binaries);
		const result = actualSchema.validate ? await actualSchema.validate(replaced) : {
			success: true,
			value: replaced
		};
		if (result.success) unmask();
		return result;
	} });
}
//#endregion
//#region src/response-handler.ts
const textDecoder = new TextDecoder();
const DEFAULT_MAX_JSON_LINE_BYTES = 67108864;
function wrapResponseBodyStream({ stream, url, requestBodyValues, statusCode, responseHeaders }) {
	const reader = stream.getReader();
	let readerReleased = false;
	const releaseReader = () => {
		if (!readerReleased) {
			reader.releaseLock();
			readerReleased = true;
		}
	};
	return new ReadableStream({
		async pull(controller) {
			try {
				const { done, value } = await reader.read();
				if (done) {
					releaseReader();
					controller.close();
				} else controller.enqueue(value);
			} catch (error) {
				releaseReader();
				if (isAbortError(error)) {
					controller.error(error);
					return;
				}
				controller.error(handleFetchError({
					error: new dist/* APICallError */.hL({
						message: "Failed to process successful response",
						cause: error,
						statusCode,
						url,
						responseHeaders,
						requestBodyValues
					}),
					url,
					requestBodyValues
				}));
			}
		},
		async cancel(reason) {
			try {
				await reader.cancel(reason);
			} finally {
				releaseReader();
			}
		}
	});
}
async function readResponseBodyAsText({ response, url }) {
	return textDecoder.decode(await readResponseWithSizeLimit({
		response,
		url
	}));
}
const createJsonErrorResponseHandler = ({ errorSchema, errorToMessage, isRetryable }) => async ({ response, url, requestBodyValues }) => {
	const responseBody = await readResponseBodyAsText({
		response,
		url
	});
	const responseHeaders = extractResponseHeaders(response);
	if (responseBody.trim() === "") return {
		responseHeaders,
		value: new dist/* APICallError */.hL({
			message: response.statusText,
			url,
			requestBodyValues,
			statusCode: response.status,
			responseHeaders,
			responseBody,
			isRetryable: isRetryable?.(response)
		})
	};
	try {
		const parsedError = await parseJSON({
			text: responseBody,
			schema: errorSchema
		});
		return {
			responseHeaders,
			value: new dist/* APICallError */.hL({
				message: errorToMessage(parsedError),
				url,
				requestBodyValues,
				statusCode: response.status,
				responseHeaders,
				responseBody,
				data: parsedError,
				isRetryable: isRetryable?.(response, parsedError)
			})
		};
	} catch {
		return {
			responseHeaders,
			value: new dist/* APICallError */.hL({
				message: response.statusText,
				url,
				requestBodyValues,
				statusCode: response.status,
				responseHeaders,
				responseBody,
				isRetryable: isRetryable?.(response)
			})
		};
	}
};
const createEventSourceResponseHandler = (chunkSchema) => async ({ response, url, requestBodyValues }) => {
	const responseHeaders = extractResponseHeaders(response);
	if (response.body == null) throw new dist/* EmptyResponseBodyError */.Tt({});
	return {
		responseHeaders,
		value: parseJsonEventStream({
			stream: wrapResponseBodyStream({
				stream: response.body,
				url,
				requestBodyValues,
				statusCode: response.status,
				responseHeaders
			}),
			schema: chunkSchema
		})
	};
};
const createJsonResponseHandler = (responseSchema, { experimental_binaryFields } = {}) => {
	const binaryFieldPaths = experimental_binaryFields?.length ? compileBinaryFieldPaths(experimental_binaryFields) : void 0;
	return async ({ response, url, requestBodyValues }) => {
		let responseBody;
		let schema = responseSchema;
		if (binaryFieldPaths == null) responseBody = await readResponseBodyAsText({
			response,
			url
		});
		else {
			const scanner = createJsonBinaryFieldScanner(binaryFieldPaths);
			await readResponseWithSizeLimit({
				response,
				url,
				onChunk: scanner.push
			});
			const scanned = scanner.finish();
			responseBody = scanned.text;
			schema = withBinaryFields(responseSchema, scanned.binaries);
		}
		const parsedResult = await safeParseJSON({
			text: responseBody,
			schema
		});
		const responseHeaders = extractResponseHeaders(response);
		if (!parsedResult.success) throw new dist/* APICallError */.hL({
			message: "Invalid JSON response",
			cause: parsedResult.error,
			statusCode: response.status,
			responseHeaders,
			responseBody,
			url,
			requestBodyValues
		});
		return {
			responseHeaders,
			value: parsedResult.value,
			rawValue: parsedResult.rawValue
		};
	};
};
const createJsonLinesResponseHandler = (responseSchema, { maxLineBytes = DEFAULT_MAX_JSON_LINE_BYTES } = {}) => {
	if (!Number.isSafeInteger(maxLineBytes) || maxLineBytes <= 0) throw new dist/* InvalidArgumentError */.Di({
		argument: "maxLineBytes",
		message: "maxLineBytes must be a positive safe integer."
	});
	return async ({ response, url }) => {
		const responseHeaders = extractResponseHeaders(response);
		if (response.body == null) throw new dist/* EmptyResponseBodyError */.Tt({});
		return {
			responseHeaders,
			value: parseJsonLines({
				stream: response.body,
				schema: responseSchema,
				url,
				maxLineBytes
			})
		};
	};
};
async function* parseJsonLines({ stream, schema, url, maxLineBytes }) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let lineBytes = 0;
	let finished = false;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				finished = true;
				buffer += decoder.decode();
				break;
			}
			let offset = 0;
			while (offset < value.length) {
				const lineEnd = value.indexOf(10, offset);
				const segmentEnd = lineEnd === -1 ? value.length : lineEnd;
				lineBytes += segmentEnd - offset;
				if (lineBytes > maxLineBytes) throw new DownloadError({
					message: `JSON Lines response exceeded maximum line size of ${maxLineBytes} bytes.`,
					url
				});
				const decodeEnd = lineEnd === -1 ? segmentEnd : lineEnd + 1;
				buffer += decoder.decode(value.subarray(offset, decodeEnd), { stream: true });
				if (lineEnd === -1) break;
				const line = buffer.slice(0, -1).replace(/\r$/, "");
				buffer = "";
				lineBytes = 0;
				offset = decodeEnd;
				if (line.trim().length > 0) yield await parseJSON({
					text: line,
					schema
				});
			}
		}
		const finalLine = buffer.replace(/\r$/, "");
		if (finalLine.trim().length > 0) yield await parseJSON({
			text: finalLine,
			schema
		});
	} finally {
		if (!finished) await reader.cancel().catch(() => {});
		reader.releaseLock();
	}
}
const createBinaryResponseHandler = () => async ({ response, url, requestBodyValues }) => {
	const responseHeaders = extractResponseHeaders(response);
	if (!response.body) throw new dist/* APICallError */.hL({
		message: "Response body is empty",
		url,
		requestBodyValues,
		statusCode: response.status,
		responseHeaders,
		responseBody: void 0
	});
	try {
		const buffer = await response.arrayBuffer();
		return {
			responseHeaders,
			value: new Uint8Array(buffer)
		};
	} catch (error) {
		throw new dist/* APICallError */.hL({
			message: "Failed to read response as array buffer",
			url,
			requestBodyValues,
			statusCode: response.status,
			responseHeaders,
			responseBody: void 0,
			cause: error
		});
	}
};
/**
* Passes the response body through as a `ReadableStream<Uint8Array>` without
* buffering it (unlike `createBinaryResponseHandler`). The consumer is
* responsible for draining or cancelling the stream.
*/
const createBinaryStreamResponseHandler = () => async ({ response, url, requestBodyValues }) => {
	const responseHeaders = extractResponseHeaders(response);
	if (response.body == null) throw new dist/* EmptyResponseBodyError */.Tt({});
	return {
		responseHeaders,
		value: wrapResponseBodyStream({
			stream: response.body,
			url,
			requestBodyValues,
			statusCode: response.status,
			responseHeaders
		})
	};
};
const createStatusCodeErrorResponseHandler = () => async ({ response, url, requestBodyValues }) => {
	const responseHeaders = extractResponseHeaders(response);
	const responseBody = await readResponseBodyAsText({
		response,
		url
	});
	return {
		responseHeaders,
		value: new APICallError({
			message: response.statusText,
			url,
			requestBodyValues,
			statusCode: response.status,
			responseHeaders,
			responseBody
		})
	};
};
//#endregion
//#region src/is-json-serializable.ts
/**
* Checks whether a value can cross a workflow serialization boundary.
*
* The check accepts JSON-like primitives, arrays, and plain objects whose
* nested values are also serializable. It rejects functions, symbols,
* bigints, and non-plain objects such as class instances, dates, and regexes.
*/
function isJSONSerializable(value) {
	if (value === null || value === void 0) return true;
	const type = typeof value;
	if (type === "string" || type === "number" || type === "boolean") return true;
	if (type === "function" || type === "symbol" || type === "bigint") return false;
	if (Array.isArray(value)) return value.every(isJSONSerializable);
	if (Object.getPrototypeOf(value) === Object.prototype) return Object.values(value).every(isJSONSerializable);
	return false;
}
//#endregion
//#region src/serialization-error.ts
const dist_name = "AI_SerializationError";
const marker = `vercel.ai.error.${dist_name}`;
const symbol = Symbol.for(marker);
var SerializationError = class extends dist/* AISDKError */.bD {
	constructor({ message = "Failed to serialize value.", cause } = {}) {
		super({
			name: dist_name,
			message,
			cause
		});
		this[symbol] = true;
	}
	static isInstance(error) {
		return dist/* AISDKError */.bD.hasMarker(error, marker);
	}
};
//#endregion
//#region src/serialize-model-options.ts
/**
* Serializes a model instance for workflow step boundaries.
* Returns the `modelId` plus the JSON-serializable config properties.
*
* Non-serializable values are omitted. As a special case, a
* function-valued `headers` property is resolved during serialization
* and included if the returned value is JSON-serializable.
*
* Used as the body of `static [WORKFLOW_SERIALIZE]` in provider models.
*
* @example
* ```ts
* static [WORKFLOW_SERIALIZE](model: MyLanguageModel) {
*   return serializeModelOptions({
*     modelId: model.modelId,
*     config: model.config,
*   });
* }
* ```
*/
function serializeModelOptions(options) {
	const serializableConfig = {};
	for (const [key, value] of Object.entries(options.config)) if (key === "headers") {
		const resolvedHeaders = resolveSync(value);
		if (isJSONSerializable(resolvedHeaders)) serializableConfig[key] = resolvedHeaders;
	} else if (isJSONSerializable(value)) serializableConfig[key] = value;
	return {
		modelId: options.modelId,
		config: serializableConfig
	};
}
function resolveSync(value) {
	let next = value;
	if (typeof value === "function") next = value();
	if (next instanceof Promise) throw new SerializationError({ message: "Cannot serialize asynchronous model options." });
	return next;
}
//#endregion
//#region src/speech-stream-envelope.ts
/**
* Experimental speech-stream WebSocket envelope (v1): the standard
* serialization of `Experimental_StreamingSpeechModelV4.doStream` over a WebSocket. Clients (e.g.
* the `@ai-sdk/gateway` provider) encode with this module and servers (e.g.
* AI Gateway) decode with it, so the two sides cannot drift.
*
* Envelope rules:
*
* 1. The client sends exactly one `speech-stream.start` TEXT frame first.
* 2. Input text rides `speech-stream.text-delta` TEXT frames, in order. A
*    frame may carry its text part's `voice` and `providerOptions`. A long
*    part may span several frames: `voice` is repeated on each, and
*    `providerOptions` appear on the first only, so they must describe an
*    event at the start of the part (e.g. a turn break), not a setting. An
*    empty `delta` is valid and carries only part metadata; it does not end
*    the input.
* 3. The client signals the end of the input text with the
*    `speech-stream.text-done` TEXT frame; a plain close without it is an
*    abort.
* 4. Every server→client TEXT frame is one JSON-serialized
*    `SpeechModelV4StreamPart` (flattened, no wrapper). `audio` payloads are
*    base64 strings. `Date` values (`response-metadata.timestamp`) serialize
*    to ISO 8601 strings and are revived by `parseSpeechStreamPart`. `Error`
*    payloads in `error` parts serialize as `{ name, message }`; servers may
*    instead send `{ type, message }`, where `type` names an error class the
*    client can map to a typed error (e.g. `invalid_request_error`).
* 5. The server closes with code 1000 after the `finish` part. Over this
*    envelope an `error` part is terminal: the server sends it on failure and
*    then closes non-1000. A close without a prior `finish` is an error.
* 6. Unknown frame/part types are ignored in both directions (forward
*    compatibility).
* 7. Servers may enforce a maximum frame size (the AI Gateway rejects frames
*    over 256 KiB); clients should keep text-delta frames under 64 KiB.
* 8. Connection establishment (URL, auth) is transport-specific and out of
*    scope.
*
* The envelope validates frame shape only; server policy layers on top. Both
* parsers use `secureJsonParse`, so frames carrying `__proto__` /
* `constructor.prototype` keys are rejected rather than parsed.
*/
/** Type of the first client TEXT frame. */
const SPEECH_STREAM_START_FRAME_TYPE = "speech-stream.start";
/** Type of the client TEXT frame that carries one input text delta. */
const SPEECH_STREAM_TEXT_DELTA_FRAME_TYPE = "speech-stream.text-delta";
/** Type of the client TEXT frame that signals the end of the input text. */
const SPEECH_STREAM_TEXT_DONE_FRAME_TYPE = "speech-stream.text-done";
const optionalStartFrameFields = {
	instructions: "string",
	language: "string",
	speed: "number",
	voice: "string",
	includeRawChunks: "boolean"
};
/**
* Server-side: parse a client TEXT frame. Validates envelope shape only and
* rejects prototype-pollution payloads. Never throws.
*/
function parseSpeechStreamClientFrame(text) {
	let value;
	try {
		value = secureJsonParse(text);
	} catch {
		return {
			type: "invalid",
			message: "malformed JSON"
		};
	}
	if (!isRecord(value)) return {
		type: "invalid",
		message: "frame must be a JSON object"
	};
	if (typeof value.type !== "string") return {
		type: "invalid",
		message: "frame type must be a string"
	};
	switch (value.type) {
		case SPEECH_STREAM_START_FRAME_TYPE: {
			for (const [field, type] of Object.entries(optionalStartFrameFields)) if (value[field] !== void 0 && typeof value[field] !== type) return {
				type: "invalid",
				message: `${field} must be a ${type} when present`
			};
			if (value.outputFormat !== void 0 && !isAudioFormat(value.outputFormat)) return {
				type: "invalid",
				message: "outputFormat must be an audio format object ({ type, rate? }) when present"
			};
			if (value.providerOptions !== void 0 && !isProviderOptions(value.providerOptions)) return {
				type: "invalid",
				message: "providerOptions must be an object of provider objects when present"
			};
			const frame = { type: SPEECH_STREAM_START_FRAME_TYPE };
			for (const field of Object.keys(optionalStartFrameFields)) if (value[field] !== void 0) frame[field] = value[field];
			if (value.outputFormat !== void 0) {
				const { type, rate } = value.outputFormat;
				frame.outputFormat = {
					type,
					...rate !== void 0 && { rate }
				};
			}
			if (value.providerOptions !== void 0) frame.providerOptions = value.providerOptions;
			return {
				type: "start",
				frame
			};
		}
		case SPEECH_STREAM_TEXT_DELTA_FRAME_TYPE:
			if (typeof value.delta !== "string") return {
				type: "invalid",
				message: "text-delta frame must have a string delta"
			};
			if (value.voice !== void 0 && typeof value.voice !== "string") return {
				type: "invalid",
				message: "text-delta voice must be a string when present"
			};
			if (value.providerOptions !== void 0 && !isProviderOptions(value.providerOptions)) return {
				type: "invalid",
				message: "text-delta providerOptions must be an object of provider objects when present"
			};
			return {
				type: "text-delta",
				delta: value.delta,
				...value.voice !== void 0 && { voice: value.voice },
				...value.providerOptions !== void 0 && { providerOptions: value.providerOptions }
			};
		case SPEECH_STREAM_TEXT_DONE_FRAME_TYPE: return { type: "text-done" };
		default: return { type: "unknown" };
	}
}
/**
* Server-side: serialize a speech stream part as one TEXT frame. Binary audio
* is base64-encoded and `Error` payloads serialize as `{ name, message }`.
* Returns `undefined` for payloads that are not JSON-serializable; callers
* drop the frame.
*/
function serializeSpeechStreamPart(part) {
	try {
		if (part.type === "audio" && part.audio instanceof Uint8Array) return JSON.stringify({
			...part,
			audio: convertUint8ArrayToBase64(part.audio)
		});
		if (part.type === "error" && isError$1(part.error)) return JSON.stringify({
			...part,
			error: {
				name: part.error.name,
				message: part.error.message
			}
		});
		return JSON.stringify(part);
	} catch {
		return;
	}
}
function isError$1(value) {
	return value instanceof Error || Object.prototype.toString.call(value) === "[object Error]";
}
/**
* Client-side: parse a server TEXT frame into a speech stream part. Returns
* `undefined` for malformed or unsafe JSON, unknown part types, and known
* part types whose fields are missing or mistyped. Revives
* `response-metadata.timestamp` to a `Date`.
*/
function parseSpeechStreamPart(text) {
	let value;
	try {
		value = secureJsonParse(text);
	} catch {
		return;
	}
	if (!isRecord(value)) return;
	const part = value;
	switch (part.type) {
		case "stream-start": {
			if (!Array.isArray(part.warnings)) return;
			const warnings = part.warnings.filter((warning) => !isUnknownWarningType(warning));
			return warnings.every(isWarning$1) ? {
				...part,
				warnings
			} : void 0;
		}
		case "audio": return isString$1(part.audio) && isAudioFormat(part.audioFormat) && isOptional$1(part.id, isString$1) && isOptional$1(part.providerMetadata, isRecord) ? part : void 0;
		case "finish": return isOptional$1(part.usage, isUsage) && isOptional$1(part.providerMetadata, isRecord) ? part : void 0;
		case "response-metadata": {
			if (!(isOptional$1(part.modelId, isString$1) && isOptional$1(part.headers, isRecord))) return;
			const timestamp = part.timestamp;
			if (timestamp == null) return {
				...part,
				timestamp: void 0
			};
			if (typeof timestamp !== "string") return;
			const revived = new Date(timestamp);
			return Number.isNaN(revived.getTime()) ? void 0 : {
				...part,
				timestamp: revived
			};
		}
		case "raw": return "rawValue" in part ? part : void 0;
		case "error": return "error" in part ? part : void 0;
		default: return;
	}
}
function isString$1(value) {
	return typeof value === "string";
}
function isOptional$1(value, check) {
	return value === void 0 || check(value);
}
const knownWarningTypes = /* @__PURE__ */ new Set([
	"compatibility",
	"deprecated",
	"other",
	"unsupported"
]);
function isUnknownWarningType(value) {
	return isRecord(value) && isString$1(value.type) && !knownWarningTypes.has(value.type);
}
function isWarning$1(value) {
	if (!isRecord(value)) return false;
	switch (value.type) {
		case "compatibility":
		case "unsupported": return isString$1(value.feature) && isOptional$1(value.details, isString$1);
		case "deprecated": return isString$1(value.setting) && isString$1(value.message);
		case "other": return isString$1(value.message);
		default: return false;
	}
}
function isProviderOptions(value) {
	return isRecord(value) && Object.values(value).every(isRecord);
}
function isAudioFormat(value) {
	return isRecord(value) && isString$1(value.type) && value.type.length > 0 && isOptional$1(value.rate, (rate) => typeof rate === "number" && Number.isFinite(rate) && rate > 0);
}
function isUsage(value) {
	return isRecord(value) && [
		"inputCharacters",
		"inputTokens",
		"outputTokens"
	].every((key) => isOptional$1(value[key], (count) => typeof count === "number"));
}
//#endregion
//#region src/streaming-tool-call-argument-state.ts
function startsWithStructuredValue(value) {
	if (typeof value !== "string") return false;
	const firstCharacter = value.trimStart()[0];
	return firstCharacter === "{" || firstCharacter === "[";
}
/**
* Incrementally tracks whether streamed tool-call arguments contain a complete
* structured JSON value. This is intentionally structural rather than a JSON
* parse: a currently parsable scalar can still be the prefix of a later value.
*/
var StreamingToolCallArgumentState = class {
	constructor(initialValue = "") {
		this.structure = { kind: "undetermined" };
		this.append(initialValue);
	}
	get hasCompleteStructuredValue() {
		return this.structure.kind === "structured" && this.structure.complete === true;
	}
	append(delta) {
		let nextStructure = this.structure;
		for (const character of delta) {
			if (nextStructure.kind === "undetermined") {
				if (/\s/.test(character)) continue;
				if (character !== "{" && character !== "[") {
					nextStructure = { kind: "other" };
					continue;
				}
				nextStructure = {
					kind: "structured",
					stack: [character],
					inString: false,
					escaped: false,
					complete: false
				};
				continue;
			}
			if (nextStructure.kind !== "structured" || nextStructure.complete) continue;
			if (nextStructure.inString) {
				if (nextStructure.escaped) nextStructure.escaped = false;
				else if (character === "\\") nextStructure.escaped = true;
				else if (character === "\"") nextStructure.inString = false;
				continue;
			}
			if (character === "\"") nextStructure.inString = true;
			else if (character === "{" || character === "[") nextStructure.stack.push(character);
			else if (character === "}" || character === "]") {
				const expectedOpening = character === "}" ? "{" : "[";
				if (nextStructure.stack.at(-1) !== expectedOpening) {
					nextStructure = { kind: "other" };
					continue;
				}
				nextStructure.stack.pop();
				if (nextStructure.stack.length === 0) nextStructure.complete = true;
			}
		}
		this.structure = nextStructure;
	}
};
//#endregion
//#region src/streaming-tool-call-tracker.ts
/**
* Tracks streaming tool call state across multiple deltas from an
* OpenAI-compatible chat completion stream. Handles argument accumulation,
* emits tool-input-start/delta/end and tool-call events, and finalizes
* unfinished tool calls on flush.
*
* Used by openai, openai-compatible, groq, deepseek, alibaba, mistral, and
* moonshotai providers.
*/
var StreamingToolCallTracker = class {
	constructor(controller, options = {}) {
		this.toolCalls = [];
		this.toolCallsById = /* @__PURE__ */ new Map();
		this.toolCallsByIndex = /* @__PURE__ */ new Map();
		this.usedToolCallIds = /* @__PURE__ */ new Set();
		this.nextGeneratedIdSuffixes = /* @__PURE__ */ new Map();
		this.controller = controller;
		this._generateId = options.generateId ?? generateId;
		this.typeValidation = options.typeValidation ?? "none";
		this.extractMetadata = options.extractMetadata;
		this.buildToolCallProviderMetadata = options.buildToolCallProviderMetadata;
	}
	/**
	* Process a tool call delta from a streaming response chunk.
	* Emits tool-input-start, tool-input-delta, tool-input-end, and tool-call
	* events as appropriate.
	*/
	processDelta(toolCallDelta) {
		const wireName = toolCallDelta.function?.name;
		const hasBlankName = typeof wireName === "string" && wireName.trim().length === 0;
		const wireId = this.getNonBlankString(toolCallDelta.id);
		const name = this.getNonBlankString(wireName);
		const argumentsDelta = toolCallDelta.function?.arguments;
		const { index } = toolCallDelta;
		const resolution = this.resolveToolCall({
			wireId,
			index,
			name,
			hasExplicitCallStart: name != null && startsWithStructuredValue(argumentsDelta),
			hasEmptyArguments: argumentsDelta == null || argumentsDelta.trim().length === 0
		});
		if (resolution.kind === "ambiguous") return;
		let toolCall;
		if (resolution.kind === "new") {
			if (hasBlankName) return;
			toolCall = this.processNewToolCall(toolCallDelta, {
				wireId,
				index,
				name
			});
		} else {
			toolCall = resolution.toolCall;
			if (wireId != null) this.associateWireId(toolCall, wireId);
			this.processExistingToolCall(toolCall, toolCallDelta);
		}
		if (index != null) this.associateIndex(toolCall, index);
	}
	/**
	* Finalize any unfinished tool calls. Should be called during the stream's
	* flush handler to ensure all tool calls are properly completed.
	*/
	flush() {
		const toolCalls = this.toolCalls.every((toolCall) => toolCall.index != null) ? [...this.toolCalls].sort((a, b) => a.index - b.index || a.sequence - b.sequence) : this.toolCalls;
		for (const toolCall of toolCalls) if (!toolCall.hasFinished) this.finishToolCall(toolCall);
	}
	/**
	* Correlation precedence for streamed deltas:
	*
	* | ID evidence | index/name evidence | start evidence | resolution |
	* | --- | --- | --- | --- |
	* | known | matching | any | matching call, new call, or ambiguity |
	* | known | conflicting | named | new call |
	* | unseen | matching | structured start | new call |
	* | unseen | matching | named empty arguments | incomplete call, new call, or ambiguity |
	* | unseen | matching | continuation | matching call or ambiguity |
	* | absent | matching | any | matching call, new call, or ambiguity |
	* | absent | absent | named | new call |
	* | absent | absent | unnamed | sole unfinished call, new call, or ambiguity |
	*/
	resolveToolCall({ wireId, index, name, hasExplicitCallStart, hasEmptyArguments }) {
		const indexedToolCalls = index != null ? this.toolCallsByIndex.get(index) : void 0;
		const matchingIndexedToolCalls = this.filterToolCallsByName(indexedToolCalls, name);
		if (wireId != null) {
			const toolCallsWithId = this.toolCallsById.get(wireId);
			if (toolCallsWithId != null) {
				if (index != null) {
					const matchingToolCalls = matchingIndexedToolCalls.filter((toolCall) => toolCallsWithId.has(toolCall));
					const matchingToolCall = this.resolveMatchingToolCall(matchingToolCalls, hasExplicitCallStart);
					if (matchingToolCall.kind !== "new") return matchingToolCall;
					if (name != null) return { kind: "new" };
					if (indexedToolCalls != null) return { kind: "ambiguous" };
					return this.resolveMatchingToolCall([...toolCallsWithId], false);
				}
				if (name != null) {
					const matchingToolCalls = [...toolCallsWithId].filter((toolCall) => toolCall.function.name === name);
					return this.resolveMatchingToolCall(matchingToolCalls, hasExplicitCallStart);
				}
				return this.resolveMatchingToolCall([...toolCallsWithId], false);
			}
			if (matchingIndexedToolCalls.length > 0) return hasExplicitCallStart ? { kind: "new" } : this.resolveMatchingToolCall(matchingIndexedToolCalls, name != null && hasEmptyArguments);
			return { kind: "new" };
		}
		if (indexedToolCalls != null) return this.resolveMatchingToolCall(matchingIndexedToolCalls, hasExplicitCallStart);
		if (name != null) return { kind: "new" };
		const unfinishedToolCalls = this.toolCalls.filter((toolCall) => !toolCall.hasFinished);
		return this.resolveMatchingToolCall(unfinishedToolCalls, false);
	}
	filterToolCallsByName(toolCalls, name) {
		if (toolCalls == null) return [];
		return [...toolCalls].filter((toolCall) => name == null || toolCall.function.name === name);
	}
	resolveMatchingToolCall(toolCalls, hasExplicitCallStart) {
		if (toolCalls.length === 0) return { kind: "new" };
		const continuableToolCalls = toolCalls.filter((toolCall) => !toolCall.argumentState.hasCompleteStructuredValue);
		if (!hasExplicitCallStart && toolCalls.length === 1) return {
			kind: "existing",
			toolCall: toolCalls[0]
		};
		if (continuableToolCalls.length === 1) return {
			kind: "existing",
			toolCall: continuableToolCalls[0]
		};
		if (continuableToolCalls.length > 1 || !hasExplicitCallStart) return { kind: "ambiguous" };
		return { kind: "new" };
	}
	processNewToolCall(toolCallDelta, { wireId, index, name }) {
		if (this.typeValidation === "required") {
			if (toolCallDelta.type !== "function") throw new dist/* InvalidResponseDataError */.xn({
				data: toolCallDelta,
				message: `Expected 'function' type.`
			});
		} else if (this.typeValidation === "if-present") {
			if (toolCallDelta.type != null && toolCallDelta.type !== "function") throw new dist/* InvalidResponseDataError */.xn({
				data: toolCallDelta,
				message: `Expected 'function' type.`
			});
		}
		if (name == null) throw new dist/* InvalidResponseDataError */.xn({
			data: toolCallDelta,
			message: `Expected 'function.name' to be a string.`
		});
		const id = this.createToolCallId(wireId);
		this.controller.enqueue({
			type: "tool-input-start",
			id,
			toolName: name
		});
		const metadata = this.extractMetadata?.(toolCallDelta);
		const initialArguments = toolCallDelta.function?.arguments ?? "";
		const toolCall = {
			id,
			index: index ?? void 0,
			sequence: this.toolCalls.length,
			type: "function",
			function: {
				name,
				arguments: initialArguments
			},
			argumentState: new StreamingToolCallArgumentState(initialArguments),
			hasFinished: false,
			metadata
		};
		this.toolCalls.push(toolCall);
		if (wireId != null) this.associateWireId(toolCall, wireId);
		if (toolCall.function.arguments.length > 0) this.controller.enqueue({
			type: "tool-input-delta",
			id: toolCall.id,
			delta: toolCall.function.arguments
		});
		return toolCall;
	}
	associateWireId(toolCall, wireId) {
		let toolCallsWithId = this.toolCallsById.get(wireId);
		if (toolCallsWithId == null) {
			toolCallsWithId = /* @__PURE__ */ new Set();
			this.toolCallsById.set(wireId, toolCallsWithId);
		}
		toolCallsWithId.add(toolCall);
	}
	associateIndex(toolCall, index) {
		let toolCallsWithIndex = this.toolCallsByIndex.get(index);
		if (toolCallsWithIndex == null) {
			toolCallsWithIndex = /* @__PURE__ */ new Set();
			this.toolCallsByIndex.set(index, toolCallsWithIndex);
		}
		toolCallsWithIndex.add(toolCall);
	}
	createToolCallId(wireId) {
		if (wireId != null && !this.usedToolCallIds.has(wireId)) {
			this.usedToolCallIds.add(wireId);
			return wireId;
		}
		const generatedId = this.getNonBlankString(this._generateId()) ?? "tool-call";
		if (!this.usedToolCallIds.has(generatedId)) {
			this.usedToolCallIds.add(generatedId);
			return generatedId;
		}
		const initialSuffix = this.nextGeneratedIdSuffixes.get(generatedId) ?? 1;
		const maximumSuffix = initialSuffix + this.usedToolCallIds.size;
		for (let suffix = initialSuffix; suffix <= maximumSuffix; suffix++) {
			const suffixedId = `${generatedId}-${suffix}`;
			if (!this.usedToolCallIds.has(suffixedId)) {
				this.usedToolCallIds.add(suffixedId);
				this.nextGeneratedIdSuffixes.set(generatedId, suffix + 1);
				return suffixedId;
			}
		}
		throw new Error("Failed to create a unique tool call ID.");
	}
	getNonBlankString(value) {
		return value != null && value.trim().length > 0 ? value : void 0;
	}
	processExistingToolCall(toolCall, toolCallDelta) {
		if (toolCall.hasFinished) return;
		if (toolCallDelta.function?.arguments != null) {
			toolCall.argumentState.append(toolCallDelta.function.arguments);
			toolCall.function.arguments += toolCallDelta.function.arguments;
			this.controller.enqueue({
				type: "tool-input-delta",
				id: toolCall.id,
				delta: toolCallDelta.function.arguments
			});
		}
	}
	finishToolCall(toolCall) {
		this.controller.enqueue({
			type: "tool-input-end",
			id: toolCall.id
		});
		const providerMetadata = this.buildToolCallProviderMetadata?.(toolCall.metadata);
		this.controller.enqueue({
			type: "tool-call",
			toolCallId: toolCall.id,
			toolName: toolCall.function.name,
			input: toolCall.function.arguments,
			...providerMetadata ? { providerMetadata } : {}
		});
		toolCall.hasFinished = true;
	}
};
//#endregion
//#region src/strip-file-extension.ts
/**
* Strips file extension segments from a filename.
*
* Examples:
* - "report.pdf" -> "report"
* - "archive.tar.gz" -> "archive"
* - "filename" -> "filename"
*/
function stripFileExtension(filename) {
	const firstDotIndex = filename.indexOf(".");
	return firstDotIndex === -1 ? filename : filename.slice(0, firstDotIndex);
}
//#endregion
//#region src/transcription-stream-envelope.ts
/**
* Experimental transcription-stream WebSocket envelope (v1): the standard
* serialization of `TranscriptionModelV4.doStream` over a WebSocket. Clients
* (e.g. the `@ai-sdk/gateway` provider) encode with this module and servers
* (e.g. AI Gateway) decode with it, so the two sides cannot drift.
*
* Envelope rules:
*
* 1. The client sends exactly one `transcription-stream.start` TEXT frame
*    first.
* 2. Audio rides BINARY frames containing raw bytes in the declared
*    `inputAudioFormat` (base64 string chunks are decoded before sending).
* 3. The client signals end of audio with the
*    `transcription-stream.audio-done` TEXT frame; a plain close without it
*    is an abort.
* 4. Every server→client TEXT frame is one JSON-serialized
*    `TranscriptionModelV4StreamPart` (flattened, no wrapper). Payloads must
*    be JSON-serializable. `Date` values (`response-metadata.timestamp`)
*    serialize to ISO 8601 strings and are revived by
*    `parseTranscriptionStreamPart`. `Error` payloads in `error` parts
*    serialize as `{ name, message }`.
* 5. The server closes with code 1000 after the `finish` part; on failure it
*    sends an `error` part and closes non-1000. A close without a prior
*    `finish` is an error.
* 6. Unknown frame/part types are ignored in both directions (forward
*    compatibility).
* 7. Servers may enforce a maximum frame size (the AI Gateway rejects frames
*    over 256 KiB); clients should split audio into frames of at most
*    64 KiB.
* 8. Connection establishment (URL, auth) is transport-specific and out of
*    scope.
*
* The envelope validates frame shape only; server policy (accepted audio
* formats, required `rate`, size limits) layers on top. Both parsers use
* `secureJsonParse`, so frames carrying `__proto__` / `constructor.prototype`
* keys are rejected (prototype-pollution protection) rather than parsed.
*/
/** Type of the first client TEXT frame. */
const TRANSCRIPTION_STREAM_START_FRAME_TYPE = "transcription-stream.start";
/** Type of the client TEXT frame that signals the end of the audio input. */
const TRANSCRIPTION_STREAM_AUDIO_DONE_FRAME_TYPE = "transcription-stream.audio-done";
/**
* Server-side: parse a client TEXT frame. Validates envelope shape only and
* rejects prototype-pollution payloads (parsed with `secureJsonParse`). Never
* throws.
*/
function parseTranscriptionStreamClientFrame(text) {
	let value;
	try {
		value = secureJsonParse(text);
	} catch {
		return {
			type: "invalid",
			message: "malformed JSON"
		};
	}
	if (value == null || typeof value !== "object" || Array.isArray(value)) return {
		type: "invalid",
		message: "frame must be a JSON object"
	};
	const frame = value;
	if (typeof frame.type !== "string") return {
		type: "invalid",
		message: "frame type must be a string"
	};
	switch (frame.type) {
		case TRANSCRIPTION_STREAM_START_FRAME_TYPE: {
			const inputAudioFormat = frame.inputAudioFormat;
			if (inputAudioFormat == null || typeof inputAudioFormat !== "object" || Array.isArray(inputAudioFormat) || typeof inputAudioFormat.type !== "string") return {
				type: "invalid",
				message: "start frame must have an inputAudioFormat object with a string type"
			};
			if (inputAudioFormat.rate !== void 0 && typeof inputAudioFormat.rate !== "number") return {
				type: "invalid",
				message: "inputAudioFormat.rate must be a number when present"
			};
			if (frame.providerOptions !== void 0 && (frame.providerOptions == null || typeof frame.providerOptions !== "object" || Array.isArray(frame.providerOptions))) return {
				type: "invalid",
				message: "providerOptions must be an object when present"
			};
			if (frame.includeRawChunks !== void 0 && typeof frame.includeRawChunks !== "boolean") return {
				type: "invalid",
				message: "includeRawChunks must be a boolean when present"
			};
			return {
				type: "start",
				frame
			};
		}
		case TRANSCRIPTION_STREAM_AUDIO_DONE_FRAME_TYPE: return { type: "audio-done" };
		default: return { type: "unknown" };
	}
}
/**
* Server-side: serialize a transcription stream part as one TEXT frame.
* `Error` payloads in `error` parts serialize as `{ name, message }` —
* `Error` properties are non-enumerable, so a plain `JSON.stringify` would
* serialize them to `{}` and lose the message end-to-end. Returns
* `undefined` for payloads that are not JSON-serializable (envelope rule 4,
* e.g. bigint or cyclic values); callers drop the frame.
*/
function serializeTranscriptionStreamPart(part) {
	try {
		if (part.type === "error" && isError(part.error)) return JSON.stringify({
			...part,
			error: {
				name: part.error.name,
				message: part.error.message
			}
		});
		return JSON.stringify(part);
	} catch {
		return;
	}
}
function isError(value) {
	return value instanceof Error || Object.prototype.toString.call(value) === "[object Error]";
}
/**
* Client-side: parse a server TEXT frame into a transcription stream part.
* Returns `undefined` for malformed or unsafe (prototype-polluting) JSON
* (parsed with `secureJsonParse`), unknown part types, and known part types
* whose required or optional fields are missing or mistyped (including
* warning and segment elements) — downstream SDK code dereferences those
* fields, so a drifted server must not crash or pollute the stream.
* Revives `response-metadata.timestamp` to a `Date`.
*/
function parseTranscriptionStreamPart(text) {
	let value;
	try {
		value = secureJsonParse(text);
	} catch {
		return;
	}
	if (value == null || typeof value !== "object" || Array.isArray(value)) return;
	const part = value;
	switch (part.type) {
		case "stream-start": return Array.isArray(part.warnings) && part.warnings.every(isWarning) ? part : void 0;
		case "transcript-delta": return isString(part.delta) && isOptional(part.id, isString) && isOptional(part.providerMetadata, isRecord) ? part : void 0;
		case "transcript-partial": return isString(part.text) && isOptional(part.id, isString) && isOptional(part.startSecond, isNumber) && isOptional(part.durationInSeconds, isNumber) && isOptional(part.channelIndex, isNumber) && isOptional(part.providerMetadata, isRecord) ? part : void 0;
		case "transcript-final": return isString(part.text) && isOptional(part.id, isString) && isOptional(part.startSecond, isNumber) && isOptional(part.endSecond, isNumber) && isOptional(part.channelIndex, isNumber) && isOptional(part.providerMetadata, isRecord) ? part : void 0;
		case "finish": return isString(part.text) && Array.isArray(part.segments) && part.segments.every(isSegment) && isOptional(part.language, isString) && isOptional(part.durationInSeconds, isNumber) && isOptional(part.usage, isRecord) && isOptional(part.providerMetadata, isRecord) ? part : void 0;
		case "response-metadata": {
			if (!(isOptional(part.modelId, isString) && isOptional(part.headers, isRecord))) return;
			const timestamp = part.timestamp;
			if (timestamp == null) return {
				...part,
				timestamp: void 0
			};
			if (typeof timestamp !== "string") return;
			const revived = new Date(timestamp);
			return Number.isNaN(revived.getTime()) ? void 0 : {
				...part,
				timestamp: revived
			};
		}
		case "raw": return "rawValue" in part ? part : void 0;
		case "error": return "error" in part ? part : void 0;
		default: return;
	}
}
function isString(value) {
	return typeof value === "string";
}
function isNumber(value) {
	return typeof value === "number";
}
function isOptional(value, check) {
	return value === void 0 || check(value);
}
function isWarning(value) {
	return isRecord(value) && isString(value.type);
}
function isSegment(value) {
	return isRecord(value) && isString(value.text) && isNumber(value.startSecond) && isNumber(value.endSecond);
}
//#endregion
//#region src/validate-base-url.ts
function validateBaseURL(baseURL) {
	if (baseURL?.trim() === "") throw new dist/* InvalidArgumentError */.Di({
		argument: "baseURL",
		message: "baseURL must be a non-empty string."
	});
	return baseURL;
}
//#endregion
//#region src/without-trailing-slash.ts
function withoutTrailingSlash(url) {
	return url?.replace(/\/$/, "");
}
//#endregion
//#region src/types/executable-tool.ts
/**
* Checks whether a tool exposes an execute function.
*/
function isExecutableTool(tool) {
	return tool != null && typeof tool.execute === "function";
}
//#endregion
//#region src/is-async-iterable.ts
function isAsyncIterable(obj) {
	return obj != null && typeof obj[Symbol.asyncIterator] === "function";
}
//#endregion
//#region src/types/execute-tool.ts
/**
* Executes a tool function and normalizes its results into a stream of outputs.
*
* - If the tool's `execute` function returns an `AsyncIterable`, each yielded value is emitted as
*   `{ type: "preliminary", output }`. After iteration completes, the last yielded value is emitted
*   again as `{ type: "final", output }`.
* - If the tool returns a direct value or Promise, a single `{ type: "final", output }` is yielded.
*
* @param params.tool The tool whose `execute` function should be invoked.
* @param params.input The input value to pass to the tool.
* @param params.options Additional options for tool execution.
* @yields A preliminary output for each streamed value, followed by a final output, or a single final
* output for non-streaming tools.
*/
async function* executeTool({ tool, input, options }) {
	const result = tool.execute(input, options);
	if (isAsyncIterable(result)) {
		let lastOutput;
		for await (const output of result) {
			lastOutput = output;
			yield {
				type: "preliminary",
				output
			};
		}
		yield {
			type: "final",
			output: lastOutput
		};
	} else yield {
		type: "final",
		output: await result
	};
}
//#endregion
//#region src/types/tool-caller.ts
function toolCaller(tool, definition) {
	return Object.defineProperty({ ...tool }, "experimental_toolCaller", { value: definition });
}
function getToolCaller(tool) {
	return tool?.experimental_toolCaller;
}
//#endregion
//#region src/stringify-with-bigint-and-cycles.ts
/**
* Serializes a value as JSON, representing BigInt values as decimal strings and
* ancestor cycles as "[Circular]". Reused objects, toJSON methods, and other JSON
* serialization behavior are preserved. Getters and toJSON methods may throw.
*/
function stringifyWithBigIntAndCycles(value) {
	const ancestors = [];
	return JSON.stringify(value, function(_key, value) {
		if (typeof value === "bigint") return value.toString();
		if (typeof value !== "object" || value === null) return value;
		while (ancestors.length > 0 && ancestors.at(-1) !== this) ancestors.pop();
		if (ancestors.includes(value)) return "[Circular]";
		ancestors.push(value);
		return value;
	});
}
//#endregion


//# sourceMappingURL=index.js.map

/***/ }),

/***/ 66110:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ch: () => (/* binding */ TooManyEmbeddingValuesForCallError),
/* harmony export */   Di: () => (/* binding */ InvalidArgumentError),
/* harmony export */   Kq: () => (/* binding */ LoadAPIKeyError),
/* harmony export */   LB: () => (/* binding */ DecisionUnsupportedQuestionTypeError),
/* harmony export */   M3: () => (/* binding */ InvalidPromptError),
/* harmony export */   Tt: () => (/* binding */ EmptyResponseBodyError),
/* harmony export */   Uc: () => (/* binding */ ExtractionUnsupportedFieldTypeError),
/* harmony export */   b8: () => (/* binding */ UnsupportedFunctionalityError),
/* harmony export */   bD: () => (/* binding */ AISDKError),
/* harmony export */   eM: () => (/* binding */ NoSuchModelError),
/* harmony export */   hL: () => (/* binding */ APICallError),
/* harmony export */   iM: () => (/* binding */ TypeValidationError),
/* harmony export */   k9: () => (/* binding */ isJSONObject),
/* harmony export */   u1: () => (/* binding */ getErrorMessage),
/* harmony export */   u6: () => (/* binding */ JSONParseError),
/* harmony export */   vb: () => (/* binding */ NoSuchProviderReferenceError),
/* harmony export */   xn: () => (/* binding */ InvalidResponseDataError)
/* harmony export */ });
/* unused harmony exports Experimental_DecisionRefusalError, Experimental_EvaluationUnsupportedQuestionTypeError, Experimental_ExtractionRefusalError, LoadSettingError, NoContentGeneratedError, isJSONArray, isJSONValue */
//#region src/errors/ai-sdk-error.ts
/**
* Symbol used for identifying AI SDK Error instances.
* Enables checking if an error is an instance of AISDKError across package versions.
*/
const marker$18 = "vercel.ai.error";
const symbol$18 = Symbol.for(marker$18);
/**
* Custom error class for AI SDK related errors.
* @extends Error
*/
var AISDKError = class AISDKError extends Error {
	/**
	* Creates an AI SDK Error.
	*
	* @param {Object} params - The parameters for creating the error.
	* @param {string} params.name - The name of the error.
	* @param {string} params.message - The error message.
	* @param {unknown} [params.cause] - The underlying cause of the error.
	*/
	constructor({ name, message, cause }) {
		super(message);
		this[symbol$18] = true;
		this.name = name;
		this.cause = cause;
	}
	/**
	* Checks if the given error is an AI SDK Error.
	* @param {unknown} error - The error to check.
	* @returns {boolean} True if the error is an AI SDK Error, false otherwise.
	*/
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$18);
	}
	static hasMarker(error, marker) {
		const markerSymbol = Symbol.for(marker);
		return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
	}
};
//#endregion
//#region src/errors/decision-unsupported-question-type-error.ts
const name$17 = "AI_DecisionUnsupportedQuestionTypeError";
const marker$17 = `vercel.ai.error.${name$17}`;
const symbol$17 = Symbol.for(marker$17);
/**
* A decision model does not support the type of a requested question.
*/
var DecisionUnsupportedQuestionTypeError = class extends AISDKError {
	constructor({ questionId, questionType, provider, modelId, message = `Question "${questionId}" has type "${questionType}", which is not supported by provider "${provider}" and model "${modelId}".` }) {
		super({
			name: name$17,
			message
		});
		this[symbol$17] = true;
		this.questionId = questionId;
		this.questionType = questionType;
		this.provider = provider;
		this.modelId = modelId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$17);
	}
};
//#endregion
//#region src/errors/api-call-error.ts
const name$16 = "AI_APICallError";
const marker$16 = `vercel.ai.error.${name$16}`;
const symbol$16 = Symbol.for(marker$16);
var APICallError = class extends AISDKError {
	constructor({ message, url, requestBodyValues, statusCode, responseHeaders, responseBody, cause, isRetryable = statusCode != null && (statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500), data }) {
		super({
			name: name$16,
			message,
			cause
		});
		this[symbol$16] = true;
		this.url = url;
		this.requestBodyValues = requestBodyValues;
		this.statusCode = statusCode;
		this.responseHeaders = responseHeaders;
		this.responseBody = responseBody;
		this.isRetryable = isRetryable;
		this.data = data;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$16);
	}
};
//#endregion
//#region src/errors/empty-response-body-error.ts
const name$15 = "AI_EmptyResponseBodyError";
const marker$15 = `vercel.ai.error.${name$15}`;
const symbol$15 = Symbol.for(marker$15);
var EmptyResponseBodyError = class extends AISDKError {
	constructor({ message = "Empty response body" } = {}) {
		super({
			name: name$15,
			message
		});
		this[symbol$15] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$15);
	}
};
//#endregion
//#region src/errors/decision-refusal-error.ts
const name$14 = "AI_DecisionRefusalError";
const marker$14 = `vercel.ai.error.${name$14}`;
const symbol$14 = Symbol.for(marker$14);
/**
* A decision model declined to answer one or more questions.
*/
var DecisionRefusalError = class extends AISDKError {
	constructor({ questionIds, provider, modelId, message = `Decision model "${modelId}" from provider "${provider}" refused ${questionIds.length === 1 ? "question" : "questions"} ${questionIds.map((id) => JSON.stringify(id)).join(", ")}.` }) {
		super({
			name: name$14,
			message
		});
		this[symbol$14] = true;
		this.questionIds = questionIds;
		this.provider = provider;
		this.modelId = modelId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$14);
	}
};
//#endregion
//#region src/errors/extraction-refusal-error.ts
const name$13 = "AI_ExtractionRefusalError";
const marker$13 = `vercel.ai.error.${name$13}`;
const symbol$13 = Symbol.for(marker$13);
/**
* An extraction model declined to extract one or more fields.
*/
var ExtractionRefusalError = class extends AISDKError {
	constructor({ fieldIds, provider, modelId, message = `Extraction model "${modelId}" from provider "${provider}" refused ${fieldIds.length === 1 ? "field" : "fields"} ${fieldIds.map((id) => JSON.stringify(id)).join(", ")}.` }) {
		super({
			name: name$13,
			message
		});
		this[symbol$13] = true;
		this.fieldIds = fieldIds;
		this.provider = provider;
		this.modelId = modelId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$13);
	}
};
//#endregion
//#region src/errors/extraction-unsupported-field-type-error.ts
const name$12 = "AI_ExtractionUnsupportedFieldTypeError";
const marker$12 = `vercel.ai.error.${name$12}`;
const symbol$12 = Symbol.for(marker$12);
/**
* An extraction model does not support the type of a requested field.
*/
var ExtractionUnsupportedFieldTypeError = class extends AISDKError {
	constructor({ fieldId, fieldType, provider, modelId, message = `Field "${fieldId}" has type "${fieldType}", which is not supported by provider "${provider}" and model "${modelId}".` }) {
		super({
			name: name$12,
			message
		});
		this[symbol$12] = true;
		this.fieldId = fieldId;
		this.fieldType = fieldType;
		this.provider = provider;
		this.modelId = modelId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$12);
	}
};
//#endregion
//#region src/errors/get-error-message.ts
function getErrorMessage(error) {
	if (error == null) return "unknown error";
	if (typeof error === "string") return error;
	if (error instanceof Error) return error.toString();
	return JSON.stringify(error);
}
//#endregion
//#region src/errors/invalid-argument-error.ts
const name$11 = "AI_InvalidArgumentError";
const marker$11 = `vercel.ai.error.${name$11}`;
const symbol$11 = Symbol.for(marker$11);
/**
* A function argument is invalid.
*/
var InvalidArgumentError = class extends AISDKError {
	constructor({ message, cause, argument }) {
		super({
			name: name$11,
			message,
			cause
		});
		this[symbol$11] = true;
		this.argument = argument;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$11);
	}
};
//#endregion
//#region src/errors/invalid-prompt-error.ts
const name$10 = "AI_InvalidPromptError";
const marker$10 = `vercel.ai.error.${name$10}`;
const symbol$10 = Symbol.for(marker$10);
/**
* A prompt is invalid. This error should be thrown by providers when they cannot
* process a prompt.
*/
var InvalidPromptError = class extends AISDKError {
	constructor({ prompt, message, cause }) {
		super({
			name: name$10,
			message: `Invalid prompt: ${message}`,
			cause
		});
		this[symbol$10] = true;
		this.prompt = prompt;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$10);
	}
};
//#endregion
//#region src/errors/invalid-response-data-error.ts
const name$9 = "AI_InvalidResponseDataError";
const marker$9 = `vercel.ai.error.${name$9}`;
const symbol$9 = Symbol.for(marker$9);
/**
* Server returned a response with invalid data content.
* This should be thrown by providers when they cannot parse the response from the API.
*/
var InvalidResponseDataError = class extends AISDKError {
	constructor({ data, message = `Invalid response data: ${JSON.stringify(data)}.` }) {
		super({
			name: name$9,
			message
		});
		this[symbol$9] = true;
		this.data = data;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$9);
	}
};
//#endregion
//#region src/errors/json-parse-error.ts
const name$8 = "AI_JSONParseError";
const marker$8 = `vercel.ai.error.${name$8}`;
const symbol$8 = Symbol.for(marker$8);
var JSONParseError = class extends AISDKError {
	constructor({ text, cause }) {
		super({
			name: name$8,
			message: `JSON parsing failed: Text: ${text}.\nError message: ${getErrorMessage(cause)}`,
			cause
		});
		this[symbol$8] = true;
		this.text = text;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$8);
	}
};
//#endregion
//#region src/errors/load-api-key-error.ts
const name$7 = "AI_LoadAPIKeyError";
const marker$7 = `vercel.ai.error.${name$7}`;
const symbol$7 = Symbol.for(marker$7);
var LoadAPIKeyError = class extends AISDKError {
	constructor({ message }) {
		super({
			name: name$7,
			message
		});
		this[symbol$7] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$7);
	}
};
//#endregion
//#region src/errors/load-setting-error.ts
const name$6 = "AI_LoadSettingError";
const marker$6 = `vercel.ai.error.${name$6}`;
const symbol$6 = Symbol.for(marker$6);
var LoadSettingError = class extends AISDKError {
	constructor({ message }) {
		super({
			name: name$6,
			message
		});
		this[symbol$6] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$6);
	}
};
//#endregion
//#region src/errors/no-content-generated-error.ts
const name$5 = "AI_NoContentGeneratedError";
const marker$5 = `vercel.ai.error.${name$5}`;
const symbol$5 = Symbol.for(marker$5);
/**
* Thrown when the AI provider fails to generate any content.
*/
var NoContentGeneratedError = class extends AISDKError {
	constructor({ message = "No content generated." } = {}) {
		super({
			name: name$5,
			message
		});
		this[symbol$5] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$5);
	}
};
//#endregion
//#region src/errors/no-such-model-error.ts
const name$4 = "AI_NoSuchModelError";
const marker$4 = `vercel.ai.error.${name$4}`;
const symbol$4 = Symbol.for(marker$4);
var NoSuchModelError = class extends AISDKError {
	constructor({ errorName = name$4, modelId, modelType, message = `No such ${modelType}: ${modelId}` }) {
		super({
			name: errorName,
			message
		});
		this[symbol$4] = true;
		this.modelId = modelId;
		this.modelType = modelType;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$4);
	}
};
//#endregion
//#region src/errors/no-such-provider-reference-error.ts
const name$3 = "AI_NoSuchProviderReferenceError";
const marker$3 = `vercel.ai.error.${name$3}`;
const symbol$3 = Symbol.for(marker$3);
/**
* Thrown when a provider reference cannot be resolved because the specified
* provider is not found in the provider reference mapping.
*/
var NoSuchProviderReferenceError = class extends AISDKError {
	constructor({ provider, reference, message = `No provider reference found for provider '${provider}'. Available providers: ${Object.keys(reference).join(", ")}` }) {
		super({
			name: name$3,
			message
		});
		this[symbol$3] = true;
		this.provider = provider;
		this.reference = reference;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$3);
	}
};
//#endregion
//#region src/errors/too-many-embedding-values-for-call-error.ts
const name$2 = "AI_TooManyEmbeddingValuesForCallError";
const marker$2 = `vercel.ai.error.${name$2}`;
const symbol$2 = Symbol.for(marker$2);
var TooManyEmbeddingValuesForCallError = class extends AISDKError {
	constructor(options) {
		super({
			name: name$2,
			message: `Too many values for a single embedding call. The ${options.provider} model "${options.modelId}" can only embed up to ${options.maxEmbeddingsPerCall} values per call, but ${options.values.length} values were provided.`
		});
		this[symbol$2] = true;
		this.provider = options.provider;
		this.modelId = options.modelId;
		this.maxEmbeddingsPerCall = options.maxEmbeddingsPerCall;
		this.values = options.values;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$2);
	}
};
//#endregion
//#region src/errors/type-validation-error.ts
const name$1 = "AI_TypeValidationError";
const marker$1 = `vercel.ai.error.${name$1}`;
const symbol$1 = Symbol.for(marker$1);
var TypeValidationError = class TypeValidationError extends AISDKError {
	constructor({ value, cause, context }) {
		let contextPrefix = "Type validation failed";
		if (context?.field) contextPrefix += ` for ${context.field}`;
		if (context?.entityName || context?.entityId) {
			contextPrefix += " (";
			const parts = [];
			if (context.entityName) parts.push(context.entityName);
			if (context.entityId) parts.push(`id: "${context.entityId}"`);
			contextPrefix += parts.join(", ");
			contextPrefix += ")";
		}
		super({
			name: name$1,
			message: `${contextPrefix}: Value: ${JSON.stringify(value)}.\nError message: ${getErrorMessage(cause)}`,
			cause
		});
		this[symbol$1] = true;
		this.value = value;
		this.context = context;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$1);
	}
	/**
	* Wraps an error into a TypeValidationError.
	* If the cause is already a TypeValidationError with the same value and context, it returns the cause.
	* Otherwise, it creates a new TypeValidationError.
	*
	* @param {Object} params - The parameters for wrapping the error.
	* @param {unknown} params.value - The value that failed validation.
	* @param {unknown} params.cause - The original error or cause of the validation failure.
	* @param {TypeValidationContext} params.context - Optional context about what is being validated.
	* @returns {TypeValidationError} A TypeValidationError instance.
	*/
	static wrap({ value, cause, context }) {
		if (TypeValidationError.isInstance(cause) && cause.value === value && cause.context?.field === context?.field && cause.context?.entityName === context?.entityName && cause.context?.entityId === context?.entityId) return cause;
		return new TypeValidationError({
			value,
			cause,
			context
		});
	}
};
//#endregion
//#region src/errors/unsupported-functionality-error.ts
const name = "AI_UnsupportedFunctionalityError";
const marker = `vercel.ai.error.${name}`;
const symbol = Symbol.for(marker);
var UnsupportedFunctionalityError = class extends AISDKError {
	constructor({ functionality, message = `'${functionality}' functionality not supported.` }) {
		super({
			name,
			message
		});
		this[symbol] = true;
		this.functionality = functionality;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker);
	}
};
//#endregion
//#region src/errors/index.ts
/** @deprecated Use `Experimental_DecisionUnsupportedQuestionTypeError` instead. */
const Experimental_EvaluationUnsupportedQuestionTypeError = (/* unused pure expression or super */ null && (DecisionUnsupportedQuestionTypeError));
//#endregion
//#region src/json-value/is-json.ts
function isJSONValue(value) {
	if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return true;
	if (Array.isArray(value)) return value.every(isJSONValue);
	if (typeof value === "object") return Object.entries(value).every(([key, val]) => typeof key === "string" && (val === void 0 || isJSONValue(val)));
	return false;
}
function isJSONArray(value) {
	return Array.isArray(value) && value.every(isJSONValue);
}
function isJSONObject(value) {
	return value != null && typeof value === "object" && Object.entries(value).every(([key, val]) => typeof key === "string" && (val === void 0 || isJSONValue(val)));
}
//#endregion


//# sourceMappingURL=index.js.map

/***/ }),

/***/ 23428:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   C: () => (/* binding */ WORKFLOW_DESERIALIZE),
/* harmony export */   V: () => (/* binding */ WORKFLOW_SERIALIZE)
/* harmony export */ });
/**
 * Symbol used to define custom serialization for user-defined class instances.
 * The static method should accept an instance and return serializable data.
 *
 * @example
 * ```ts
 * import { WORKFLOW_SERIALIZE, WORKFLOW_DESERIALIZE } from '@workflow/serde';
 *
 * class MyClass {
 *   constructor(public value: string) {}
 *
 *   static [WORKFLOW_SERIALIZE](instance: MyClass) {
 *     return { value: instance.value };
 *   }
 *
 *   static [WORKFLOW_DESERIALIZE](data: { value: string }) {
 *     return new MyClass(data.value);
 *   }
 * }
 * ```
 */
const WORKFLOW_SERIALIZE = Symbol.for('workflow-serialize');
/**
 * Symbol used to define custom deserialization for user-defined class instances.
 * The static method should accept serialized data and return a class instance.
 *
 * @see WORKFLOW_SERIALIZE for usage example
 */
const WORKFLOW_DESERIALIZE = Symbol.for('workflow-deserialize');
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 23353:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  D4: () => (/* binding */ decode),
  Re: () => (/* binding */ decodeAsync),
  lF: () => (/* binding */ encode),
  X$: () => (/* binding */ encodeAsync),
  qg: () => (/* binding */ parse_parse),
  EJ: () => (/* binding */ parseAsync),
  ex: () => (/* binding */ safeDecode),
  yR: () => (/* binding */ safeDecodeAsync),
  wy: () => (/* binding */ safeEncode),
  EM: () => (/* binding */ safeEncodeAsync),
  xL: () => (/* binding */ safeParse),
  bp: () => (/* binding */ safeParseAsync)
});

// UNUSED EXPORTS: validate, validateAsync

// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/parse.js
var parse = __webpack_require__(96735);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/errors.js
var errors = __webpack_require__(89053);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/core.js
var core_core = __webpack_require__(48149);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/util.js
var util = __webpack_require__(24366);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/errors.js



/* Prototypes that already carry the lazy helper methods. Seeded with the
 * intrinsics so that `init` on a foreign object — it accepts any object —
 * can never install an accessor onto a prototype we do not own. */
const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
/* Helper methods live as non-enumerable lazy getters on the shared
 * prototype instead of own properties on every instance. On first
 * access the getter allocates the per-instance closure and caches it
 * as a non-enumerable own property, so detached usage still works and
 * the allocation only happens for methods actually touched. */
function _lazyMethod(proto, key, make) {
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: false,
        get() {
            const value = make(this);
            Object.defineProperty(this, key, { value, configurable: true, writable: true });
            return value;
        },
        set(value) {
            Object.defineProperty(this, key, { value, configurable: true, writable: true });
        },
    });
}
const initializer = (inst, issues) => {
    errors/* $ZodError */.a$.init(inst, issues);
    inst.name = "ZodError";
    const proto = Object.getPrototypeOf(inst);
    if (_installedErrorProtos.has(proto))
        return;
    _installedErrorProtos.add(proto);
    _lazyMethod(proto, "format", (self) => (mapper) => errors/* formatError */.Wk(self, mapper));
    _lazyMethod(proto, "flatten", (self) => (mapper) => errors/* flattenError */.JM(self, mapper));
    _lazyMethod(proto, "addIssue", (self) => (issue) => {
        self.issues.push(issue);
        self.message = JSON.stringify(self.issues, util/* jsonStringifyReplacer */.k8, 2);
    });
    _lazyMethod(proto, "addIssues", (self) => (issues) => {
        self.issues.push(...issues);
        self.message = JSON.stringify(self.issues, util/* jsonStringifyReplacer */.k8, 2);
    });
    Object.defineProperty(proto, "isEmpty", {
        configurable: true,
        enumerable: false,
        get() {
            return this.issues.length === 0;
        },
    });
};
const ZodError = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodError", initializer)));
const ZodRealError = /*@__PURE__*/ core_core/* $constructor */.xI("ZodError", initializer, undefined, {
    Parent: Error,
});
// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;

;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/parse.js


const parse_parse = /* @__PURE__ */ parse/* _parse */.Tj(ZodRealError);
const parseAsync = /* @__PURE__ */ parse/* _parseAsync */.Rb(ZodRealError);
const safeParse = /* @__PURE__ */ parse/* _safeParse */.Od(ZodRealError);
const safeParseAsync = /* @__PURE__ */ parse/* _safeParseAsync */.wG(ZodRealError);

// Codec functions
const encode = /* @__PURE__ */ parse/* _encode */.Mv(ZodRealError);
const decode = /* @__PURE__ */ parse/* _decode */.e2(ZodRealError);
const encodeAsync = /* @__PURE__ */ parse/* _encodeAsync */.GW(ZodRealError);
const decodeAsync = /* @__PURE__ */ parse/* _decodeAsync */.or(ZodRealError);
const safeEncode = /* @__PURE__ */ parse/* _safeEncode */.rh(ZodRealError);
const safeDecode = /* @__PURE__ */ parse/* _safeDecode */.VS(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ parse/* _safeEncodeAsync */.v_(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ parse/* _safeDecodeAsync */.R3(ZodRealError);


/***/ }),

/***/ 3726:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  rSt: () => (/* binding */ ZodNumber),
  bzn: () => (/* binding */ any),
  YOg: () => (/* binding */ array),
  zMY: () => (/* binding */ schemas_boolean),
  IeY: () => (/* binding */ custom),
  gMt: () => (/* binding */ discriminatedUnion),
  k5n: () => (/* binding */ _enum),
  Nlp: () => (/* binding */ _instanceof),
  E$q: () => (/* binding */ intersection),
  Pq9: () => (/* binding */ json),
  RZV: () => (/* binding */ lazy),
  euz: () => (/* binding */ literal),
  _H3: () => (/* binding */ looseObject),
  ZmZ: () => (/* binding */ never),
  chJ: () => (/* binding */ _null),
  aig: () => (/* binding */ number),
  Ikc: () => (/* binding */ object),
  jgl: () => (/* binding */ partialRecord),
  g1P: () => (/* binding */ record),
  rej: () => (/* binding */ strictObject),
  YjP: () => (/* binding */ string),
  PVZ: () => (/* binding */ tuple),
  KCZ: () => (/* binding */ union),
  L5J: () => (/* binding */ unknown)
});

// UNUSED EXPORTS: ZodAny, ZodArray, ZodBase64, ZodBase64URL, ZodBigInt, ZodBigIntFormat, ZodBoolean, ZodCIDRv4, ZodCIDRv6, ZodCUID, ZodCUID2, ZodCatch, ZodCodec, ZodCreditCard, ZodCustom, ZodCustomStringFormat, ZodDate, ZodDefault, ZodDiscriminatedUnion, ZodE164, ZodEmail, ZodEmoji, ZodEnum, ZodExactOptional, ZodFile, ZodFunction, ZodGUID, ZodIBAN, ZodIPv4, ZodIPv6, ZodISODate, ZodISODateTime, ZodISODuration, ZodISOTime, ZodInstanceOf, ZodIntersection, ZodJWT, ZodKSUID, ZodLazy, ZodLiteral, ZodMAC, ZodMap, ZodNaN, ZodNanoID, ZodNever, ZodNonOptional, ZodNull, ZodNullable, ZodNumberFormat, ZodObject, ZodOptional, ZodPipe, ZodPrefault, ZodPreprocess, ZodPromise, ZodReadonly, ZodRecord, ZodSet, ZodString, ZodStringFormat, ZodSuccess, ZodSymbol, ZodTemplateLiteral, ZodTransform, ZodTuple, ZodType, ZodULID, ZodURL, ZodUUID, ZodUndefined, ZodUnion, ZodUnknown, ZodVoid, ZodXID, ZodXor, _ZodString, _default, _function, base64, base64url, bigint, catch, check, cidrv4, cidrv6, codec, creditCard, cuid, cuid2, currencyCode, date, describe, e164, email, emoji, exactOptional, file, float32, float64, function, guid, hash, hex, hostname, httpUrl, iban, int, int32, int64, invertCodec, ipv4, ipv6, jwt, keyof, ksuid, looseRecord, mac, map, meta, nan, nanoid, nativeEnum, nonoptional, nullable, nullish, optional, pipe, prefault, preprocess, promise, readonly, refine, set, stringFormat, stringbool, success, superRefine, symbol, templateLiteral, transform, uint32, uint64, ulid, undefined, url, uuid, uuidv4, uuidv6, uuidv7, void, xid, xor

// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/core.js
var core_core = __webpack_require__(48149);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/util.js
var core_util = __webpack_require__(24366);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/memoizer.js

class $ZodCyclicError extends Error {
    constructor() {
        super(`Cannot parse a reference cycle that closes through a transform`);
        this.name = "ZodCyclicError";
    }
}
/** Keyed off the context object every schema in one parse call already shares. */
const STATE = "~memo";
const NO_ISSUES = [];
// a value a cycle can close through
function isRef(value) {
    return value !== null && typeof value === "object";
}
// Receivers prefix paths in place, so the cache and every hand-out need their own copies.
function cloneIssues(issues) {
    return issues.map((iss) => (iss.path ? { ...iss, path: iss.path.slice() } : { ...iss }));
}
const recursive = /*@__PURE__*/ new WeakMap();
/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
const NONE = 0;
const ASSUMED = 1;
const PROVEN = 2;
/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst, stack, resolve) {
    const cached = recursive.get(inst);
    if (cached !== undefined)
        return cached ? PROVEN : NONE;
    // Relative to the walk in progress, so not cached.
    if (stack.has(inst))
        return PROVEN;
    stack.add(inst);
    let result = NONE;
    const check = (child) => {
        if (result !== PROVEN && child?._zod) {
            const answer = isRecursive(child, stack, resolve);
            if (answer > result)
                result = answer;
        }
    };
    // `Reflect.ownKeys` rather than `Object.keys`, so a cycle through a declared symbol key is still seen
    const shape = (sh, spread) => {
        let answer = NONE;
        for (const key of Reflect.ownKeys(sh)) {
            const desc = Object.getOwnPropertyDescriptor(sh, key);
            // an object resolves its shape by spread, so a key it does not enumerate is never parsed; `z.properties` reads every own key and so keeps them all
            if (spread && !desc.enumerable)
                continue;
            // resolving runs user code, and a factory mints a fresh subtree per read, so an edge the walk can't follow counts as a cycle
            const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
            if (child > answer)
                answer = child;
        }
        return answer;
    };
    const merge = (answer) => {
        if (answer > result)
            result = answer;
    };
    const def = inst._zod.def;
    const kind = def.type;
    switch (kind) {
        case "object": {
            const raw = core_util/* rawShape */.MO(def);
            // a def with no raw shape answers `shape` from an accessor of its own, and running that can mint a whole fresh subtree
            merge(raw ? shape(raw, true) : ASSUMED);
            check(def.catchall);
            break;
        }
        case "array":
            check(def.element);
            break;
        case "tuple":
            for (const el of def.items)
                check(el);
            check(def.rest);
            break;
        case "record":
        case "map":
            check(def.keyType);
            check(def.valueType);
            break;
        case "set":
            check(def.valueType);
            break;
        case "union":
            for (const el of def.options)
                check(el);
            break;
        case "intersection":
            check(def.left);
            check(def.right);
            break;
        case "optional":
        case "nullable":
        case "default":
        case "prefault":
        case "catch":
        case "readonly":
        case "nonoptional":
        case "promise":
        case "success":
            check(def.innerType);
            break;
        case "pipe":
            check(def.in);
            check(def.out);
            break;
        case "function":
            check(def.input);
            check(def.output);
            break;
        // `$ZodLazy` caches its inner on the def, so a resolved edge is followed exactly
        case "lazy": {
            const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : undefined);
            // walked with resolution off: one hop sees past the deferral, and a lazy that yields only another unresolved lazy is generative, so it stops there
            merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
            break;
        }
        // a leaf by choice: `parts` are regex fragments, not data positions
        case "template_literal":
        // leaves
        case "string":
        case "number":
        case "int":
        case "boolean":
        case "bigint":
        case "symbol":
        case "undefined":
        case "null":
        case "void":
        case "never":
        case "any":
        case "unknown":
        case "date":
        case "nan":
        case "enum":
        case "literal":
        case "file":
        case "transform":
        case "custom":
            break;
        default: {
            // a new built-in kind becomes a compile error here
            kind;
            // a user-defined kind can still hold children, and only its author knows where, so fall back to scanning the def — skipping accessors, since reading one can run user code
            for (const key in def) {
                const desc = Object.getOwnPropertyDescriptor(def, key);
                if (!desc || desc.get)
                    continue;
                const value = desc.value;
                if (!value || typeof value !== "object")
                    continue;
                if (value._zod)
                    check(value);
                else if (Array.isArray(value))
                    for (const el of value)
                        check(el);
            }
        }
    }
    stack.delete(inst);
    return settle(inst, result);
}
/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
function settle(inst, answer) {
    if (answer !== ASSUMED)
        recursive.set(inst, answer === PROVEN);
    return answer;
}
/**
 * Whether one parse can re-enter this schema, i.e. its subtree contains a cycle.
 * Exported for `z.compile`, which refuses to compile such a schema: cycle
 * breaking is driven from here off state keyed on the parse context, and a
 * generated fast path has no context to key on.
 */
function isRecursiveSchema(inst) {
    // z.compile never parses, so nothing would ever resolve a lazy for it; it runs once and already treats a throw here as recursive
    return isRecursive(inst, new Set(), true) !== NONE;
}
function bucketFor(state, inst) {
    let bucket = state.buckets.get(inst);
    if (!bucket) {
        bucket = new WeakMap();
        state.buckets.set(inst, bucket);
    }
    return bucket;
}
// Set immediately before delegating to core and cleared immediately after, so `alloc` registers only for a visit this module is driving.
let handoff;
// Allocated but unfinished entries. `alloc` and the matching pop both happen in the synchronous part of a parse, so they nest even when children are async, and one stack serves every schema.
const memoizer_open = [];
const memo = {
    alloc(_inst, payload, empty) {
        const bucket = handoff;
        if (!bucket)
            return empty;
        handoff = undefined;
        const entry = { value: empty, issues: null };
        bucket.set(payload.value, entry);
        memoizer_open.push(entry);
        return empty;
    },
    guard(inst) {
        var _a;
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred.push(() => {
            const base = inst._zod.parse;
            const wrapped = (payload, ctx) => {
                // The value is a placeholder a back-edge is still waiting on, so the cycle closes through this transform. Its output can't exist in time to bind.
                if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value))
                    throw new $ZodCyclicError();
                return base(payload, ctx);
            };
            inst._zod.parse = wrapped;
            if (inst._zod.run === base)
                inst._zod.run = wrapped;
        });
    },
    attach(inst) {
        var _a;
        let isRecursiveInst;
        let rechecked = false;
        // a recursive schema is re-entered many times per parse and its bucket never changes
        let lastCtx;
        let lastBucket;
        // Wraps `parse` in a deferred so it sees the container's final parse. Core's own deferred copies `parse` into `run` when there are no checks, and it ran first, so `run` is patched to match; with checks, `run` reads `parse` dynamically.
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred.push(() => {
            const base = inst._zod.parse;
            const wrapped = (payload, ctx) => {
                if (isRecursiveInst === undefined) {
                    const walked = isRecursive(inst, new Set(), false);
                    if (walked === NONE) {
                        // Nothing here can ever fire, so take it back out.
                        inst._zod.parse = base;
                        if (inst._zod.run === wrapped)
                            inst._zod.run = base;
                        return base(payload, ctx);
                    }
                    // this parse resolves the deferred edges on its own path, so ask once more before latching
                    if (walked === PROVEN || rechecked)
                        isRecursiveInst = true;
                    else
                        rechecked = true;
                }
                const input = payload.value;
                if (!isRef(input))
                    return base(payload, ctx);
                let state = ctx[STATE];
                if (!state) {
                    state = { buckets: new WeakMap(), backEdges: undefined };
                    ctx[STATE] = state;
                }
                let bucket;
                if (lastCtx === ctx) {
                    bucket = lastBucket;
                }
                else {
                    bucket = bucketFor(state, inst);
                    lastCtx = ctx;
                    lastBucket = bucket;
                }
                const hit = bucket.get(input);
                if (hit) {
                    payload.value = hit.value;
                    if (hit.issues) {
                        if (hit.issues.length)
                            payload.issues.push(...cloneIssues(hit.issues));
                    }
                    else {
                        // Still being parsed: its own checks cover it, so skip them here.
                        payload.memo = true;
                        state.backEdges ?? (state.backEdges = new WeakSet());
                        state.backEdges.add(hit.value);
                    }
                    return payload;
                }
                handoff = bucket;
                const depth = memoizer_open.length;
                const result = base(payload, ctx);
                handoff = undefined;
                // A container that rejected its input outright allocated nothing.
                const entry = memoizer_open.length > depth ? memoizer_open.pop() : undefined;
                // Both paths written out so the sync one allocates no closure. It runs once per node, and capturing here cost more than everything else combined.
                if (result instanceof Promise) {
                    return result.then((r) => {
                        if (entry)
                            entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
                        return r;
                    });
                }
                if (entry)
                    entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
                return result;
            };
            inst._zod.parse = wrapped;
            if (inst._zod.run === base)
                inst._zod.run = wrapped;
        });
    },
};
/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
function memoizer() {
    return memo;
}
/** Whether this value is a node a back-edge resolved to before it finished. */
function isBackEdge(ctx, value) {
    const backEdges = ctx[STATE]?.backEdges;
    return backEdges !== undefined && isRef(value) && backEdges.has(value);
}

// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/schemas.js + 2 modules
var schemas = __webpack_require__(97385);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/registries.js
var registries = __webpack_require__(56045);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/api.js
var api = __webpack_require__(48144);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/json-schema-processors.js
var json_schema_processors = __webpack_require__(72514);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/to-json-schema.js
var to_json_schema = __webpack_require__(75920);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/locales/en.js
var en = __webpack_require__(54611);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/parse.js + 1 modules
var parse = __webpack_require__(23353);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/parse.js
var core_parse = __webpack_require__(96735);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/schemas.js








// Register English as the default locale on first ZodType construction. Hooked into the `ZodType` `$constructor` (rather than a top-level `config(en())` in `external.ts`) so bundlers honoring `sideEffects: false` can't tree-shake it out — see #5953, #5725. An explicit `z.config(z.locales.xx())` call wins regardless of order, since this only sets the default when none is present.
function _ensureDefaultLocale() {
    if (!core_core/* globalConfig */.cr.localeError)
        core_core/* config */.$W((0,en/* default */.A)());
}
// the default memoizer is read by the core container init, which runs before `ZodType.init`, so each container calls this first
function _ensureDefaultMemoizer() {
    if (!core_core/* globalConfig */.cr.memoizer)
        core_core/* config */.$W({ memoizer: memoizer() });
}
const ZodType = /*@__PURE__*/ core_core/* $constructor */.xI("ZodType", (inst, def) => {
    _ensureDefaultLocale();
    schemas/* $ZodType */.W4.init(inst, def);
    inst.def = def;
    inst.type = def.type;
    return inst;
}, {
    check(...chks) {
        const def = this.def;
        return this.clone(core_util/* mergeDefs */.zM(def, {
            checks: [
                ...(def.checks ?? []),
                ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch),
            ],
        }), { parent: true });
    },
    with(...chks) {
        return this.check(...chks);
    },
    clone(def, params) {
        return core_util/* clone */.o8(this, def, params);
    },
    brand() {
        return this;
    },
    register(reg, meta) {
        reg.add(this, meta);
        return this;
    },
    refine(check, params) {
        return this.check(refine(check, params));
    },
    superRefine(refinement, params) {
        return this.check(superRefine(refinement, params));
    },
    overwrite(fn) {
        return this.check(api/* _overwrite */.bS(fn));
    },
    optional() {
        return optional(this);
    },
    exactOptional() {
        return exactOptional(this);
    },
    nullable() {
        return nullable(this);
    },
    nullish() {
        return optional(nullable(this));
    },
    nonoptional(params) {
        return nonoptional(this, params);
    },
    array() {
        return array(this);
    },
    or(arg) {
        return union([this, arg]);
    },
    and(arg) {
        return intersection(this, arg);
    },
    transform(tx) {
        return pipe(this, transform(tx));
    },
    default(d) {
        return _default(this, d);
    },
    prefault(d) {
        return prefault(this, d);
    },
    catch(params) {
        return _catch(this, params);
    },
    pipe(target) {
        return pipe(this, target);
    },
    readonly() {
        return readonly(this);
    },
    describe(description) {
        const cl = this.clone();
        registries/* globalRegistry */.fd.add(cl, { description });
        return cl;
    },
    meta(...args) {
        // overloaded: meta() returns the registered metadata, meta(data) returns a clone with `data` registered. The mapped type picks up the second overload, so we accept variadic any-args and return `any` to satisfy both at runtime.
        if (args.length === 0)
            return registries/* globalRegistry */.fd.get(this);
        const cl = this.clone();
        registries/* globalRegistry */.fd.add(cl, args[0]);
        return cl;
    },
    isOptional() {
        return this.safeParse(undefined).success;
    },
    isNullable() {
        return this.safeParse(null).success;
    },
    apply(fn, ...args) {
        return args.length === 0 ? fn(this) : fn(this, ...args);
    },
    // Overrides core's `~standard` to add `jsonSchema`. Must stay a prototype entry: redefining it per instance demotes instances to dictionary mode.
    get "~standard"() {
        return core_util/* hide */.jD(this, "~standard", {
            ...schemas/* standardProps */.YK(this),
            jsonSchema: {
                input: (0,to_json_schema/* createStandardJSONSchemaMethod */.uE)(this, "input"),
                output: (0,to_json_schema/* createStandardJSONSchemaMethod */.uE)(this, "output"),
            },
        });
    },
    set "~standard"(value) {
        core_util/* own */.qh(this, "~standard", value);
    },
    parse: function _parse(data, params) {
        return parse/* parse */.qg(this, data, params, { callee: _parse });
    },
    parseAsync: async function _parseAsync(data, params) {
        return await parse/* parseAsync */.EJ(this, data, params, { callee: _parseAsync });
    },
    safeParse(data, params) {
        return parse/* safeParse */.xL(this, data, params);
    },
    async safeParseAsync(data, params) {
        return parse/* safeParseAsync */.bp(this, data, params);
    },
    // `spa` is an alias: same function object as `safeParseAsync`, as before.
    get spa() {
        return this?.safeParseAsync;
    },
    set spa(value) {
        core_util/* own */.qh(this, "spa", value);
    },
    validate(data, params) {
        return core_parse/* validate */.tf(this, data, params);
    },
    validateAsync(data, params) {
        return core_parse/* validateAsync */.F0(this, data, params);
    },
    encode: function _encode(data, params) {
        return parse/* encode */.lF(this, data, params, { callee: _encode });
    },
    decode: function _decode(data, params) {
        return parse/* decode */.D4(this, data, params, { callee: _decode });
    },
    encodeAsync: async function _encodeAsync(data, params) {
        return await parse/* encodeAsync */.X$(this, data, params, { callee: _encodeAsync });
    },
    decodeAsync: async function _decodeAsync(data, params) {
        return await parse/* decodeAsync */.Re(this, data, params, { callee: _decodeAsync });
    },
    safeEncode(data, params) {
        return parse/* safeEncode */.wy(this, data, params);
    },
    safeDecode(data, params) {
        return parse/* safeDecode */.ex(this, data, params);
    },
    async safeEncodeAsync(data, params) {
        return parse/* safeEncodeAsync */.EM(this, data, params);
    },
    async safeDecodeAsync(data, params) {
        return parse/* safeDecodeAsync */.yR(this, data, params);
    },
    toJSONSchema(params) {
        return (0,to_json_schema/* createToJSONSchemaMethod */.OA)(this, {})(params);
    },
    // Reads through to the registry on every access, so it must not cache.
    get description() {
        return registries/* globalRegistry */.fd.get(this)?.description;
    },
    // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
    get _def() {
        return this._zod.def;
    },
});
/** @internal */
const _ZodString = /*@__PURE__*/ core_core/* $constructor */.xI("_ZodString", (inst, def) => {
    schemas/* $ZodString */.$v.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* stringProcessor */.SW(inst, ctx, json, params);
}, 
/*@__PURE__*/ core_util/* derived */.un({
    format: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).format ?? null,
    minLength: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).minimum ?? null,
    maxLength: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).maximum ?? null,
}, {
    regex(...args) {
        return this.check(api/* _regex */.Fk(...args));
    },
    includes(...args) {
        return this.check(api/* _includes */.dR(...args));
    },
    startsWith(...args) {
        return this.check(api/* _startsWith */.$S(...args));
    },
    endsWith(...args) {
        return this.check(api/* _endsWith */.ER(...args));
    },
    min(...args) {
        return this.check(api/* _minLength */.m9(...args));
    },
    max(...args) {
        return this.check(api/* _maxLength */.Eb(...args));
    },
    length(...args) {
        return this.check(api/* _length */.YA(...args));
    },
    nonempty(...args) {
        return this.check(api/* _minLength */.m9(1, ...args));
    },
    lowercase(params) {
        return this.check(api/* _lowercase */.hH(params));
    },
    uppercase(params) {
        return this.check(api/* _uppercase */.qF(params));
    },
    trim() {
        return this.check(api/* _trim */.WN());
    },
    normalize(...args) {
        return this.check(api/* _normalize */.lo(...args));
    },
    toLowerCase() {
        return this.check(api/* _toLowerCase */.Il());
    },
    toUpperCase() {
        return this.check(api/* _toUpperCase */.xY());
    },
    slugify() {
        return this.check(api/* _slugify */.TL());
    },
}));
const ZodString = /*@__PURE__*/ core_core/* $constructor */.xI("ZodString", (inst, def) => {
    schemas/* $ZodString */.$v.init(inst, def);
    _ZodString.init(inst, def);
}, {
    email(params) {
        return this.check(api/* _email */.Mu(ZodEmail, params));
    },
    url(params) {
        return this.check(api/* _url */.Fn(ZodURL, params));
    },
    jwt(params) {
        return this.check(api/* _jwt */.rk(ZodJWT, params));
    },
    emoji(params) {
        return this.check(api/* _emoji */.aC(ZodEmoji, params));
    },
    guid(params) {
        return this.check(api/* _guid */.tB(ZodGUID, params));
    },
    uuid(params) {
        return this.check(api/* _uuid */.Be(ZodUUID, params));
    },
    uuidv4(params) {
        return this.check(api/* _uuidv4 */.nA(ZodUUID, params));
    },
    uuidv6(params) {
        return this.check(api/* _uuidv6 */.pY(ZodUUID, params));
    },
    uuidv7(params) {
        return this.check(api/* _uuidv7 */.wA(ZodUUID, params));
    },
    nanoid(params) {
        return this.check(api/* _nanoid */.Dl(ZodNanoID, params));
    },
    cuid(params) {
        return this.check(api/* _cuid */.fs(ZodCUID, params));
    },
    cuid2(params) {
        return this.check(api/* _cuid2 */.Bj(ZodCUID2, params));
    },
    ulid(params) {
        return this.check(api/* _ulid */.Ct(ZodULID, params));
    },
    base64(params) {
        return this.check(api/* _base64 */.rt(ZodBase64, params));
    },
    base64url(params) {
        return this.check(api/* _base64url */.cU(ZodBase64URL, params));
    },
    xid(params) {
        return this.check(api/* _xid */.Pw(ZodXID, params));
    },
    ksuid(params) {
        return this.check(api/* _ksuid */._z(ZodKSUID, params));
    },
    ipv4(params) {
        return this.check(api/* _ipv4 */.Ny(ZodIPv4, params));
    },
    ipv6(params) {
        return this.check(api/* _ipv6 */.$O(ZodIPv6, params));
    },
    cidrv4(params) {
        return this.check(api/* _cidrv4 */.Uy(ZodCIDRv4, params));
    },
    cidrv6(params) {
        return this.check(api/* _cidrv6 */.gP(ZodCIDRv6, params));
    },
    e164(params) {
        return this.check(api/* _e164 */.KB(ZodE164, params));
    },
    datetime(params) {
        return this.check(api/* _isoDateTime */.G1(ZodISODateTime, params));
    },
    date(params) {
        return this.check(api/* _isoDate */.db(ZodISODate, params));
    },
    time(params) {
        return this.check(api/* _isoTime */.Kn(ZodISOTime, params));
    },
    duration(params) {
        return this.check(api/* _isoDuration */.f2(ZodISODuration, params));
    },
});
function string(params) {
    return api/* _string */.Rl(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ core_core/* $constructor */.xI("ZodStringFormat", (inst, def) => {
    schemas/* $ZodStringFormat */.EY.init(inst, def);
    _ZodString.init(inst, def);
});
const ZodISODateTime = /*@__PURE__*/ core_core/* $constructor */.xI("ZodISODateTime", (inst, def) => {
    schemas/* $ZodISODateTime */.Ko.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodISODate = /*@__PURE__*/ core_core/* $constructor */.xI("ZodISODate", (inst, def) => {
    schemas/* $ZodISODate */.v1.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodISOTime = /*@__PURE__*/ core_core/* $constructor */.xI("ZodISOTime", (inst, def) => {
    schemas/* $ZodISOTime */.Ax.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodISODuration = /*@__PURE__*/ core_core/* $constructor */.xI("ZodISODuration", (inst, def) => {
    schemas/* $ZodISODuration */.$N.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ core_core/* $constructor */.xI("ZodEmail", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodEmail */.qG.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function email(params) {
    return core._email(ZodEmail, params);
}
const ZodGUID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodGUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodGUID */.Zc.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function guid(params) {
    return core._guid(ZodGUID, params);
}
const ZodUUID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodUUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodUUID */.Zn.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function uuid(params) {
    return core._uuid(ZodUUID, params);
}
function uuidv4(params) {
    return core._uuidv4(ZodUUID, params);
}
// ZodUUIDv6
function uuidv6(params) {
    return core._uuidv6(ZodUUID, params);
}
// ZodUUIDv7
function uuidv7(params) {
    return core._uuidv7(ZodUUID, params);
}
const ZodURL = /*@__PURE__*/ core_core/* $constructor */.xI("ZodURL", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodURL */.VY.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function url(params) {
    return core._url(ZodURL, params);
}
function httpUrl(params) {
    return core._url(ZodURL, {
        protocol: regexes.httpProtocol,
        hostname: regexes.domain,
        ...util.normalizeParams(params),
    });
}
const ZodEmoji = /*@__PURE__*/ core_core/* $constructor */.xI("ZodEmoji", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodEmoji */.cG.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function emoji(params) {
    return core._emoji(ZodEmoji, params);
}
const ZodNanoID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNanoID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodNanoID */.Py.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function nanoid(params) {
    return core._nanoid(ZodNanoID, params);
}
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
const ZodCUID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodCUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodCUID */.bl.init(inst, def);
    ZodStringFormat.init(inst, def);
});
/**
 * Validates a CUID v1 string.
 *
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link cuid2 | `z.cuid2()`} instead.
 * See https://github.com/paralleldrive/cuid.
 */
function cuid(params) {
    return core._cuid(ZodCUID, params);
}
const ZodCUID2 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodCUID2", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodCUID2 */.Zu.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function cuid2(params) {
    return core._cuid2(ZodCUID2, params);
}
const ZodULID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodULID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodULID */.g5.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function ulid(params) {
    return core._ulid(ZodULID, params);
}
const ZodXID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodXID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodXID */.TF.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function xid(params) {
    return core._xid(ZodXID, params);
}
const ZodKSUID = /*@__PURE__*/ core_core/* $constructor */.xI("ZodKSUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodKSUID */.GY.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function ksuid(params) {
    return core._ksuid(ZodKSUID, params);
}
const ZodIPv4 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodIPv4", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodIPv4 */.Lc.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function ipv4(params) {
    return core._ipv4(ZodIPv4, params);
}
const ZodMAC = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodMAC", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    core.$ZodMAC.init(inst, def);
    ZodStringFormat.init(inst, def);
})));
function mac(params) {
    return core._mac(ZodMAC, params);
}
const ZodIPv6 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodIPv6", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodIPv6 */.Zy.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function ipv6(params) {
    return core._ipv6(ZodIPv6, params);
}
const ZodCIDRv4 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodCIDRv4", (inst, def) => {
    schemas/* $ZodCIDRv4 */.CI.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function cidrv4(params) {
    return core._cidrv4(ZodCIDRv4, params);
}
const ZodCIDRv6 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodCIDRv6", (inst, def) => {
    schemas/* $ZodCIDRv6 */.Cn.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function cidrv6(params) {
    return core._cidrv6(ZodCIDRv6, params);
}
const ZodBase64 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodBase64", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodBase64 */.Dq.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function base64(params) {
    return core._base64(ZodBase64, params);
}
const ZodBase64URL = /*@__PURE__*/ core_core/* $constructor */.xI("ZodBase64URL", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodBase64URL */.CQ.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function base64url(params) {
    return core._base64url(ZodBase64URL, params);
}
const ZodE164 = /*@__PURE__*/ core_core/* $constructor */.xI("ZodE164", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodE164 */.Oy.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function e164(params) {
    return core._e164(ZodE164, params);
}
const ZodCreditCard = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodCreditCard", (inst, def) => {
    core.$ZodCreditCard.init(inst, def);
    ZodStringFormat.init(inst, def);
})));
function creditCard(params) {
    return core._creditCard(ZodCreditCard, params);
}
const ZodIBAN = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodIBAN", (inst, def) => {
    core.$ZodIBAN.init(inst, def);
    ZodStringFormat.init(inst, def);
})));
function iban(params) {
    return core._iban(ZodIBAN, params);
}
const ZodJWT = /*@__PURE__*/ core_core/* $constructor */.xI("ZodJWT", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    schemas/* $ZodJWT */.h8.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function jwt(params) {
    return core._jwt(ZodJWT, params);
}
const ZodCustomStringFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodCustomStringFormat", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    core.$ZodCustomStringFormat.init(inst, def);
    ZodStringFormat.init(inst, def);
})));
function stringFormat(format, fnOrRegex, _params = {}) {
    return core._stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
}
function hostname(_params) {
    return core._stringFormat(ZodCustomStringFormat, "hostname", regexes.hostname, _params);
}
function hex(_params) {
    return core._stringFormat(ZodCustomStringFormat, "hex", regexes.hex, _params);
}
function currencyCode(_params) {
    return core._stringFormat(ZodCustomStringFormat, "currency_code", regexes.currencyCode, _params);
}
function hash(alg, params) {
    const enc = params?.enc ?? "hex";
    const format = `${alg}_${enc}`;
    const regex = core.regexes[format];
    if (!regex)
        throw new Error(`Unrecognized hash format: ${format}`);
    return core._stringFormat(ZodCustomStringFormat, format, regex, params);
}
const ZodNumber = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNumber", (inst, def) => {
    schemas/* $ZodNumber */.vz.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* numberProcessor */.Wg(inst, ctx, json, params);
    inst.isFinite = true;
}, 
/*@__PURE__*/ core_util/* derived */.un({
    minValue: (inst) => {
        const { minimum, exclusiveMinimum } = json_schema_processors/* aggregateChecks */.Fs(inst);
        return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
    },
    maxValue: (inst) => {
        const { maximum, exclusiveMaximum } = json_schema_processors/* aggregateChecks */.Fs(inst);
        return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
    },
    isInt: (inst) => {
        const { isInt, multipleOf } = json_schema_processors/* aggregateChecks */.Fs(inst);
        return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
    },
    format: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).format ?? null,
}, {
    gt(value, params) {
        return this.check(api/* _gt */.Tx(value, params));
    },
    gte(value, params) {
        return this.check(api/* _gte */.qm(value, params));
    },
    min(value, params) {
        return this.check(api/* _gte */.qm(value, params));
    },
    lt(value, params) {
        return this.check(api/* _lt */.Au(value, params));
    },
    lte(value, params) {
        return this.check(api/* _lte */.Zm(value, params));
    },
    max(value, params) {
        return this.check(api/* _lte */.Zm(value, params));
    },
    int(params) {
        return this.check(schemas_int(params));
    },
    safe(params) {
        return this.check(schemas_int(params));
    },
    positive(params) {
        return this.check(api/* _gt */.Tx(0, params));
    },
    nonnegative(params) {
        return this.check(api/* _gte */.qm(0, params));
    },
    negative(params) {
        return this.check(api/* _lt */.Au(0, params));
    },
    nonpositive(params) {
        return this.check(api/* _lte */.Zm(0, params));
    },
    multipleOf(value, params) {
        return this.check(api/* _multipleOf */.Hi(value, params));
    },
    step(value, params) {
        return this.check(api/* _multipleOf */.Hi(value, params));
    },
    finite() {
        return this;
    },
}));
function number(params) {
    return api/* _number */.F7(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNumberFormat", (inst, def) => {
    schemas/* $ZodNumberFormat */.I.init(inst, def);
    ZodNumber.init(inst, def);
});
function schemas_int(params) {
    return api/* _int */.LK(ZodNumberFormat, params);
}
function float32(params) {
    return core._float32(ZodNumberFormat, params);
}
function float64(params) {
    return core._float64(ZodNumberFormat, params);
}
function int32(params) {
    return core._int32(ZodNumberFormat, params);
}
function uint32(params) {
    return core._uint32(ZodNumberFormat, params);
}
const ZodBoolean = /*@__PURE__*/ core_core/* $constructor */.xI("ZodBoolean", (inst, def) => {
    schemas/* $ZodBoolean */.sF.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* booleanProcessor */.dO(inst, ctx, json, params);
});
function schemas_boolean(params) {
    return api/* _boolean */._L(ZodBoolean, params);
}
const ZodBigInt = /*@__PURE__*/ core_core/* $constructor */.xI("ZodBigInt", (inst, def) => {
    schemas/* $ZodBigInt */.BN.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* bigintProcessor */.Y8(inst, ctx, json, params);
}, 
/*@__PURE__*/ core_util/* derived */.un({
    minValue: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).minimum ?? null,
    maxValue: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).maximum ?? null,
    format: (inst) => json_schema_processors/* aggregateChecks */.Fs(inst).format ?? null,
}, {
    gte(value, params) {
        return this.check(api/* _gte */.qm(value, params));
    },
    min(value, params) {
        return this.check(api/* _gte */.qm(value, params));
    },
    gt(value, params) {
        return this.check(api/* _gt */.Tx(value, params));
    },
    lt(value, params) {
        return this.check(api/* _lt */.Au(value, params));
    },
    lte(value, params) {
        return this.check(api/* _lte */.Zm(value, params));
    },
    max(value, params) {
        return this.check(api/* _lte */.Zm(value, params));
    },
    positive(params) {
        return this.check(api/* _gt */.Tx(BigInt(0), params));
    },
    negative(params) {
        return this.check(api/* _lt */.Au(BigInt(0), params));
    },
    nonpositive(params) {
        return this.check(api/* _lte */.Zm(BigInt(0), params));
    },
    nonnegative(params) {
        return this.check(api/* _gte */.qm(BigInt(0), params));
    },
    multipleOf(value, params) {
        return this.check(api/* _multipleOf */.Hi(value, params));
    },
}));
function bigint(params) {
    return core._bigint(ZodBigInt, params);
}
const ZodBigIntFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodBigIntFormat", (inst, def) => {
    core.$ZodBigIntFormat.init(inst, def);
    ZodBigInt.init(inst, def);
})));
function int64(params) {
    return core._int64(ZodBigIntFormat, params);
}
function uint64(params) {
    return core._uint64(ZodBigIntFormat, params);
}
const ZodSymbol = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodSymbol", (inst, def) => {
    core.$ZodSymbol.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.symbolProcessor(inst, ctx, json, params);
})));
function symbol(params) {
    return core._symbol(ZodSymbol, params);
}
const ZodUndefined = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodUndefined", (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.undefinedProcessor(inst, ctx, json, params);
})));
function _undefined(params) {
    return core._undefined(ZodUndefined, params);
}

const ZodNull = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNull", (inst, def) => {
    schemas/* $ZodNull */.x8.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* nullProcessor */.In(inst, ctx, json, params);
});
function _null(params) {
    return api/* _null */.jw(ZodNull, params);
}

const ZodAny = /*@__PURE__*/ core_core/* $constructor */.xI("ZodAny", (inst, def) => {
    schemas/* $ZodAny */.Gb.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* anyProcessor */.NX(inst, ctx, json, params);
});
function any() {
    return api/* _any */.KA(ZodAny);
}
const ZodUnknown = /*@__PURE__*/ core_core/* $constructor */.xI("ZodUnknown", (inst, def) => {
    schemas/* $ZodUnknown */.GP.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* unknownProcessor */.NV(inst, ctx, json, params);
});
function unknown() {
    return api/* _unknown */.em(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNever", (inst, def) => {
    schemas/* $ZodNever */.Um.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* neverProcessor */.RH(inst, ctx, json, params);
});
function never(params) {
    return api/* _never */.G8(ZodNever, params);
}
const ZodVoid = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodVoid", (inst, def) => {
    core.$ZodVoid.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.voidProcessor(inst, ctx, json, params);
})));
function _void(params) {
    return core._void(ZodVoid, params);
}

const ZodDate = /*@__PURE__*/ core_core/* $constructor */.xI("ZodDate", (inst, def) => {
    schemas/* $ZodDate */.o5.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* dateProcessor */.Fl(inst, ctx, json, params);
    inst.min = (value, params) => inst.check(api/* _gte */.qm(value, params));
    inst.max = (value, params) => inst.check(api/* _lte */.Zm(value, params));
}, 
/*@__PURE__*/ core_util/* derived */.un({
    minDate: (inst) => {
        const { minimum } = json_schema_processors/* aggregateChecks */.Fs(inst);
        return minimum ? new Date(minimum) : null;
    },
    maxDate: (inst) => {
        const { maximum } = json_schema_processors/* aggregateChecks */.Fs(inst);
        return maximum ? new Date(maximum) : null;
    },
}, {}));
function date(params) {
    return core._date(ZodDate, params);
}
const ZodArray = /*@__PURE__*/ core_core/* $constructor */.xI("ZodArray", (inst, def) => {
    _ensureDefaultMemoizer();
    schemas/* $ZodArray */.$p.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* arrayProcessor */.cY(inst, ctx, json, params);
    inst.element = def.element;
}, {
    min(n, params) {
        return this.check(api/* _minLength */.m9(n, params));
    },
    nonempty(params) {
        return this.check(api/* _minLength */.m9(1, params));
    },
    max(n, params) {
        return this.check(api/* _maxLength */.Eb(n, params));
    },
    length(n, params) {
        return this.check(api/* _length */.YA(n, params));
    },
    unwrap() {
        return this.element;
    },
});
function array(element, params) {
    return api/* _array */.dZ(ZodArray, element, params);
}
// .keyof
function keyof(schema) {
    const shape = schema._zod.def.shape;
    return _enum(Object.keys(shape));
}
const ZodObject = /*@__PURE__*/ core_core/* $constructor */.xI("ZodObject", (inst, def) => {
    _ensureDefaultMemoizer();
    schemas/* $ZodObjectJIT */.w.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* objectProcessor */.Ec(inst, ctx, json, params);
    core_util/* installLazyProp */.X(inst, "shape", (self) => self._zod.def.shape, false);
}, {
    keyof() {
        return _enum(Object.keys(this._zod.def.shape));
    },
    catchall(catchall) {
        // `mergeDefs` rather than a spread: spreading reads `shape`, and resolving it can mint a whole fresh subtree
        return this.clone(core_util/* mergeDefs */.zM(this._zod.def, { catchall: catchall }));
    },
    passthrough() {
        return this.clone(core_util/* mergeDefs */.zM(this._zod.def, { catchall: unknown() }));
    },
    loose() {
        return this.clone(core_util/* mergeDefs */.zM(this._zod.def, { catchall: unknown() }));
    },
    strict() {
        return this.clone(core_util/* mergeDefs */.zM(this._zod.def, { catchall: never() }));
    },
    strip() {
        return this.clone(core_util/* mergeDefs */.zM(this._zod.def, { catchall: undefined }));
    },
    extend(incoming) {
        return core_util/* extend */.X$(this, incoming);
    },
    safeExtend(incoming) {
        return core_util/* safeExtend */.W0(this, incoming);
    },
    merge(other) {
        return core_util/* merge */.h1(this, other);
    },
    pick(mask) {
        return core_util/* pick */.Up(this, mask);
    },
    omit(mask) {
        return core_util/* omit */.cJ(this, mask);
    },
    partial(...args) {
        return core_util/* partial */.OH(ZodOptional, this, args[0]);
    },
    exactPartial(...args) {
        return core_util/* partial */.OH(ZodExactOptional, this, args[0], "exactPartial");
    },
    required(...args) {
        return core_util/* required */.mw(ZodNonOptional, this, args[0]);
    },
});
function object(shape, params) {
    const def = {
        type: "object",
        shape: shape ?? {},
        ...core_util/* normalizeParams */.A2(params),
    };
    return new ZodObject(def);
}
// strictObject
function strictObject(shape, params) {
    return new ZodObject({
        type: "object",
        shape,
        catchall: never(),
        ...core_util/* normalizeParams */.A2(params),
    });
}
// looseObject
function looseObject(shape, params) {
    return new ZodObject({
        type: "object",
        shape,
        catchall: unknown(),
        ...core_util/* normalizeParams */.A2(params),
    });
}
const ZodUnion = /*@__PURE__*/ core_core/* $constructor */.xI("ZodUnion", (inst, def) => {
    schemas/* $ZodUnion */.cu.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* unionProcessor */.iC(inst, ctx, json, params);
    inst.options = def.options;
});
function union(options, params) {
    return new ZodUnion({
        type: "union",
        options: options,
        ...core_util/* normalizeParams */.A2(params),
    });
}
const ZodXor = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodXor", (inst, def) => {
    ZodUnion.init(inst, def);
    core.$ZodXor.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.unionProcessor(inst, ctx, json, params);
    inst.options = def.options;
})));
/** Creates an exclusive union (XOR) where exactly one option must match.
 * Unlike regular unions that succeed when any option matches, xor fails if
 * zero or more than one option matches the input. */
function xor(options, params) {
    return new ZodXor({
        type: "union",
        options: options,
        inclusive: false,
        ...util.normalizeParams(params),
    });
}
const ZodDiscriminatedUnion = /*@__PURE__*/ core_core/* $constructor */.xI("ZodDiscriminatedUnion", (inst, def) => {
    ZodUnion.init(inst, def);
    schemas/* $ZodDiscriminatedUnion */.P0.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
    // const [options, params] = args;
    return new ZodDiscriminatedUnion({
        type: "union",
        options: options,
        discriminator,
        ...core_util/* normalizeParams */.A2(params),
    });
}
const ZodIntersection = /*@__PURE__*/ core_core/* $constructor */.xI("ZodIntersection", (inst, def) => {
    schemas/* $ZodIntersection */.LJ.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* intersectionProcessor */.i_(inst, ctx, json, params);
});
function intersection(left, right) {
    return new ZodIntersection({
        type: "intersection",
        left: left,
        right: right,
    });
}
const ZodTuple = /*@__PURE__*/ core_core/* $constructor */.xI("ZodTuple", (inst, def) => {
    _ensureDefaultMemoizer();
    schemas/* $ZodTuple */.G3.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* tupleProcessor */.CN(inst, ctx, json, params);
}, {
    rest(rest) {
        return this.clone({
            ...this._zod.def,
            rest: rest,
        });
    },
    partial() {
        const def = this._zod.def;
        // a refinement was authored against the full arity; partialing would run it on a shorter array
        if (def.checks?.length)
            throw new Error(".partial() cannot be used on tuple schemas containing refinements");
        return this.clone({
            ...def,
            items: def.items.map((item) => new ZodOptional({ type: "optional", innerType: item })),
        });
    },
});
function tuple(items, _paramsOrRest, _params) {
    const hasRest = _paramsOrRest instanceof schemas/* $ZodType */.W4;
    const params = hasRest ? _params : _paramsOrRest;
    const rest = hasRest ? _paramsOrRest : null;
    return new ZodTuple({
        type: "tuple",
        items: items,
        rest,
        ...core_util/* normalizeParams */.A2(params),
    });
}
const ZodRecord = /*@__PURE__*/ core_core/* $constructor */.xI("ZodRecord", (inst, def) => {
    _ensureDefaultMemoizer();
    schemas/* $ZodRecord */.h.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* recordProcessor */.GC(inst, ctx, json, params);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
    // v3-compat: z.record(valueType, params?) — defaults keyType to z.string()
    if (!valueType || !valueType._zod) {
        return new ZodRecord({
            type: "record",
            keyType: string(),
            valueType: keyType,
            ...core_util/* normalizeParams */.A2(valueType),
        });
    }
    return new ZodRecord({
        type: "record",
        keyType,
        valueType: valueType,
        ...core_util/* normalizeParams */.A2(params),
    });
}
// type alksjf = core.output<core.$ZodRecordKey>;
function partialRecord(keyType, valueType, params) {
    return new ZodRecord({
        type: "record",
        keyType,
        valueType: valueType,
        ...core_util/* normalizeParams */.A2(params),
        partial: true,
    });
}
function looseRecord(keyType, valueType, params) {
    return new ZodRecord({
        type: "record",
        keyType,
        valueType: valueType,
        mode: "loose",
        ...util.normalizeParams(params),
    });
}
const ZodMap = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodMap", (inst, def) => {
    _ensureDefaultMemoizer();
    core.$ZodMap.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.mapProcessor(inst, ctx, json, params);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
    inst.min = (...args) => inst.check(core._minSize(...args));
    inst.nonempty = (params) => inst.check(core._minSize(1, params));
    inst.max = (...args) => inst.check(core._maxSize(...args));
    inst.size = (...args) => inst.check(core._size(...args));
})));
function map(keyType, valueType, params) {
    return new ZodMap({
        type: "map",
        keyType: keyType,
        valueType: valueType,
        ...util.normalizeParams(params),
    });
}
const ZodSet = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodSet", (inst, def) => {
    _ensureDefaultMemoizer();
    core.$ZodSet.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.setProcessor(inst, ctx, json, params);
    inst.min = (...args) => inst.check(core._minSize(...args));
    inst.nonempty = (params) => inst.check(core._minSize(1, params));
    inst.max = (...args) => inst.check(core._maxSize(...args));
    inst.size = (...args) => inst.check(core._size(...args));
})));
function set(valueType, params) {
    return new ZodSet({
        type: "set",
        valueType: valueType,
        ...util.normalizeParams(params),
    });
}
const ZodEnum = /*@__PURE__*/ core_core/* $constructor */.xI("ZodEnum", (inst, def) => {
    schemas/* $ZodEnum */.VO.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* enumProcessor */.C0(inst, ctx, json, params);
    inst.enum = def.entries;
    // reuse the parsed value set so a numeric TS enum's reverse-mapping keys stay out
    inst.options = [...inst._zod.values];
    const keys = new Set(Object.keys(def.entries));
    inst.extract = (values, params) => {
        const newEntries = {};
        for (const value of values) {
            if (keys.has(value)) {
                newEntries[value] = def.entries[value];
            }
            else
                throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
            ...def,
            checks: [],
            ...core_util/* normalizeParams */.A2(params),
            entries: newEntries,
        });
    };
    inst.exclude = (values, params) => {
        const newEntries = { ...def.entries };
        for (const value of values) {
            if (keys.has(value)) {
                delete newEntries[value];
            }
            else
                throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
            ...def,
            checks: [],
            ...core_util/* normalizeParams */.A2(params),
            entries: newEntries,
        });
    };
});
function _enum(values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    return new ZodEnum({
        type: "enum",
        entries,
        ...core_util/* normalizeParams */.A2(params),
    });
}

/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
function nativeEnum(entries, params) {
    return new ZodEnum({
        type: "enum",
        entries,
        ...util.normalizeParams(params),
    });
}
const ZodLiteral = /*@__PURE__*/ core_core/* $constructor */.xI("ZodLiteral", (inst, def) => {
    schemas/* $ZodLiteral */.nu.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* literalProcessor */.Yv(inst, ctx, json, params);
    inst.values = new Set(def.values);
    Object.defineProperty(inst, "value", {
        get() {
            if (def.values.length > 1) {
                throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
            }
            return def.values[0];
        },
    });
});
function literal(value, params) {
    return new ZodLiteral({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...core_util/* normalizeParams */.A2(params),
    });
}
const ZodFile = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodFile", (inst, def) => {
    core.$ZodFile.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.fileProcessor(inst, ctx, json, params);
    inst.min = (size, params) => inst.check(core._minSize(size, params));
    inst.max = (size, params) => inst.check(core._maxSize(size, params));
    inst.mime = (types, params) => inst.check(core._mime(Array.isArray(types) ? types : [types], params));
})));
function file(params) {
    return core._file(ZodFile, params);
}
const ZodTransform = /*@__PURE__*/ core_core/* $constructor */.xI("ZodTransform", (inst, def) => {
    _ensureDefaultMemoizer();
    schemas/* $ZodTransform */.Wc.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* transformProcessor */.xi(inst, ctx, json, params);
    inst._zod.parse = (payload, _ctx) => {
        if (_ctx.direction === "backward") {
            throw new core_core/* $ZodEncodeError */.cV(inst.constructor.name);
        }
        payload.addIssue = (issue) => {
            if (typeof issue === "string") {
                payload.issues.push(core_util/* issue */.sn(issue, payload.value, def));
            }
            else {
                // for Zod 3 backwards compatibility
                const _issue = issue;
                if (_issue.fatal)
                    _issue.continue = false;
                _issue.code ?? (_issue.code = "custom");
                if (!("input" in _issue))
                    _issue.input = payload.value;
                _issue.inst ?? (_issue.inst = inst);
                // _issue.continue ??= true;
                payload.issues.push(core_util/* issue */.sn(_issue));
            }
        };
        const output = def.transform(payload.value, payload);
        if (output instanceof Promise) {
            return output.then((output) => {
                payload.value = output;
                return payload;
            });
        }
        payload.value = output;
        return payload;
    };
});
function transform(fn) {
    return new ZodTransform({
        type: "transform",
        transform: fn,
    });
}
const ZodOptional = /*@__PURE__*/ core_core/* $constructor */.xI("ZodOptional", (inst, def) => {
    schemas/* $ZodOptional */.ig.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* optionalProcessor */.$k(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
    return new ZodOptional({
        type: "optional",
        innerType: innerType,
    });
}
const ZodExactOptional = /*@__PURE__*/ core_core/* $constructor */.xI("ZodExactOptional", (inst, def) => {
    schemas/* $ZodExactOptional */.RL.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* optionalProcessor */.$k(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
    return new ZodExactOptional({
        type: "optional",
        innerType: innerType,
    });
}
const ZodNullable = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNullable", (inst, def) => {
    schemas/* $ZodNullable */.qc.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* nullableProcessor */.yq(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
    return new ZodNullable({
        type: "nullable",
        innerType: innerType,
    });
}
// nullish
function nullish(innerType) {
    return optional(nullable(innerType));
}
const ZodDefault = /*@__PURE__*/ core_core/* $constructor */.xI("ZodDefault", (inst, def) => {
    schemas/* $ZodDefault */.rv.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* defaultProcessor */.mh(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
    return new ZodDefault({
        type: "default",
        innerType: innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : core_util/* shallowClone */.yG(defaultValue);
        },
    });
}
const ZodPrefault = /*@__PURE__*/ core_core/* $constructor */.xI("ZodPrefault", (inst, def) => {
    schemas/* $ZodPrefault */.VF.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* prefaultProcessor */.A(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
    return new ZodPrefault({
        type: "prefault",
        innerType: innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : core_util/* shallowClone */.yG(defaultValue);
        },
    });
}
const ZodNonOptional = /*@__PURE__*/ core_core/* $constructor */.xI("ZodNonOptional", (inst, def) => {
    schemas/* $ZodNonOptional */.N$.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* nonoptionalProcessor */.cR(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
    return new ZodNonOptional({
        type: "nonoptional",
        innerType: innerType,
        ...core_util/* normalizeParams */.A2(params),
    });
}
const ZodSuccess = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodSuccess", (inst, def) => {
    core.$ZodSuccess.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.successProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
})));
function success(innerType) {
    return new ZodSuccess({
        type: "success",
        innerType: innerType,
    });
}
const ZodCatch = /*@__PURE__*/ core_core/* $constructor */.xI("ZodCatch", (inst, def) => {
    schemas/* $ZodCatch */.t$.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* catchProcessor */.Q9(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
    return new ZodCatch({
        type: "catch",
        innerType: innerType,
        catchValue: (typeof catchValue === "function" ? catchValue : core_util/* constantCatch */.SS(catchValue)),
    });
}

const ZodNaN = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodNaN", (inst, def) => {
    core.$ZodNaN.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.nanProcessor(inst, ctx, json, params);
})));
function nan(params) {
    return core._nan(ZodNaN, params);
}
const ZodPipe = /*@__PURE__*/ core_core/* $constructor */.xI("ZodPipe", (inst, def) => {
    schemas/* $ZodPipe */._m.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* pipeProcessor */.fs(inst, ctx, json, params);
    inst.in = def.in;
    inst.out = def.out;
});
function pipe(in_, out) {
    return new ZodPipe({
        type: "pipe",
        in: in_,
        out: out,
        // ...util.normalizeParams(params),
    });
}
const ZodCodec = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodCodec", (inst, def) => {
    ZodPipe.init(inst, def);
    core.$ZodCodec.init(inst, def);
})));
function codec(in_, out, params) {
    return new ZodCodec({
        type: "pipe",
        in: in_,
        out: out,
        transform: params.decode,
        reverseTransform: params.encode,
    });
}
function invertCodec(codec) {
    const def = codec._zod.def;
    return new ZodCodec({
        type: "pipe",
        in: def.out,
        out: def.in,
        transform: def.reverseTransform,
        reverseTransform: def.transform,
    });
}
const ZodPreprocess = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodPreprocess", (inst, def) => {
    ZodPipe.init(inst, def);
    core.$ZodPreprocess.init(inst, def);
})));
const ZodReadonly = /*@__PURE__*/ core_core/* $constructor */.xI("ZodReadonly", (inst, def) => {
    schemas/* $ZodReadonly */.Sb.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* readonlyProcessor */.$X(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
    return new ZodReadonly({
        type: "readonly",
        innerType: innerType,
    });
}
const ZodTemplateLiteral = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodTemplateLiteral", (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.templateLiteralProcessor(inst, ctx, json, params);
})));
function templateLiteral(parts, params) {
    return new ZodTemplateLiteral({
        type: "template_literal",
        parts,
        ...util.normalizeParams(params),
    });
}
const ZodLazy = /*@__PURE__*/ core_core/* $constructor */.xI("ZodLazy", (inst, def) => {
    schemas/* $ZodLazy */.kU.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* lazyProcessor */.Tr(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.getter();
});
function lazy(getter) {
    return new ZodLazy({
        type: "lazy",
        getter: getter,
    });
}
const ZodPromise = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodPromise", (inst, def) => {
    core.$ZodPromise.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.promiseProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
})));
function promise(innerType) {
    return new ZodPromise({
        type: "promise",
        innerType: innerType,
    });
}
const ZodFunction = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("ZodFunction", (inst, def) => {
    core.$ZodFunction.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.functionProcessor(inst, ctx, json, params);
})));
function _function(params) {
    return new ZodFunction({
        type: "function",
        input: Array.isArray(params?.input) ? tuple(params?.input) : (params?.input ?? array(unknown())),
        output: params?.output ?? unknown(),
    });
}

const ZodCustom = /*@__PURE__*/ core_core/* $constructor */.xI("ZodCustom", (inst, def) => {
    schemas/* $ZodCustom */.b0.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => json_schema_processors/* customProcessor */.A6(inst, ctx, json, params);
});
// custom checks
function check(fn) {
    const ch = new core.$ZodCheck({
        check: "custom",
        // ...util.normalizeParams(params),
    });
    ch._zod.check = fn;
    return ch;
}
function custom(fn, _params) {
    return api/* _custom */.FO(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
    return api/* _refine */.fU(ZodCustom, fn, _params);
}
// superRefine
function superRefine(fn, params) {
    return api/* _superRefine */.MB(fn, params);
}
// Re-export describe and meta from core
const describe = api/* describe */.q0;
const meta = api/* meta */.mI;
const ZodInstanceOf = /*@__PURE__*/ core_core/* $constructor */.xI("ZodInstanceOf", (inst, def) => {
    ZodCustom.init(inst, def);
}, {
    properties(shape, params) {
        // asserts in place, so the narrowed output type is truthful without a wrapper
        return this.check(api/* _properties */.T2(shape, params));
    },
});
function _instanceof(cls, params = {}) {
    const inst = new ZodInstanceOf({
        type: "custom",
        check: "custom",
        fn: (data) => data instanceof cls,
        abort: true,
        ...core_util/* normalizeParams */.A2(params),
    });
    inst._zod.bag.Class = cls;
    // Override check to emit invalid_type instead of custom
    inst._zod.check = (payload) => {
        if (!(payload.value instanceof cls)) {
            payload.issues.push({
                code: "invalid_type",
                expected: cls.name,
                input: payload.value,
                inst,
                path: [...(inst._zod.def.path ?? [])],
            });
        }
    };
    return inst;
}

// stringbool
const stringbool = (...args) => core._stringbool({
    Codec: ZodCodec,
    Boolean: ZodBoolean,
    String: ZodString,
}, ...args);
function json(params) {
    const jsonSchema = lazy(() => {
        return union([string(params), number(), schemas_boolean(), _null(), array(jsonSchema), record(string(), jsonSchema)]);
    });
    return jsonSchema;
}
// preprocess
function preprocess(fn, schema) {
    return new ZodPreprocess({
        type: "pipe",
        in: transform(fn),
        out: schema,
    });
}


/***/ }),

/***/ 48144:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $O: () => (/* binding */ _ipv6),
/* harmony export */   $S: () => (/* binding */ _startsWith),
/* harmony export */   Au: () => (/* binding */ _lt),
/* harmony export */   Be: () => (/* binding */ _uuid),
/* harmony export */   Bj: () => (/* binding */ _cuid2),
/* harmony export */   Ct: () => (/* binding */ _ulid),
/* harmony export */   Dl: () => (/* binding */ _nanoid),
/* harmony export */   ER: () => (/* binding */ _endsWith),
/* harmony export */   Eb: () => (/* binding */ _maxLength),
/* harmony export */   F7: () => (/* binding */ _number),
/* harmony export */   FO: () => (/* binding */ _custom),
/* harmony export */   Fk: () => (/* binding */ _regex),
/* harmony export */   Fn: () => (/* binding */ _url),
/* harmony export */   G1: () => (/* binding */ _isoDateTime),
/* harmony export */   G8: () => (/* binding */ _never),
/* harmony export */   Hi: () => (/* binding */ _multipleOf),
/* harmony export */   Il: () => (/* binding */ _toLowerCase),
/* harmony export */   KA: () => (/* binding */ _any),
/* harmony export */   KB: () => (/* binding */ _e164),
/* harmony export */   Kn: () => (/* binding */ _isoTime),
/* harmony export */   LK: () => (/* binding */ _int),
/* harmony export */   MB: () => (/* binding */ _superRefine),
/* harmony export */   Mu: () => (/* binding */ _email),
/* harmony export */   NC: () => (/* binding */ _positive),
/* harmony export */   Ny: () => (/* binding */ _ipv4),
/* harmony export */   Pw: () => (/* binding */ _xid),
/* harmony export */   Rl: () => (/* binding */ _string),
/* harmony export */   T2: () => (/* binding */ _properties),
/* harmony export */   TL: () => (/* binding */ _slugify),
/* harmony export */   Tx: () => (/* binding */ _gt),
/* harmony export */   UI: () => (/* binding */ _nonnegative),
/* harmony export */   Uy: () => (/* binding */ _cidrv4),
/* harmony export */   WN: () => (/* binding */ _trim),
/* harmony export */   YA: () => (/* binding */ _length),
/* harmony export */   Zm: () => (/* binding */ _lte),
/* harmony export */   _L: () => (/* binding */ _boolean),
/* harmony export */   _z: () => (/* binding */ _ksuid),
/* harmony export */   aC: () => (/* binding */ _emoji),
/* harmony export */   bS: () => (/* binding */ _overwrite),
/* harmony export */   cU: () => (/* binding */ _base64url),
/* harmony export */   dR: () => (/* binding */ _includes),
/* harmony export */   dZ: () => (/* binding */ _array),
/* harmony export */   db: () => (/* binding */ _isoDate),
/* harmony export */   em: () => (/* binding */ _unknown),
/* harmony export */   f2: () => (/* binding */ _isoDuration),
/* harmony export */   fU: () => (/* binding */ _refine),
/* harmony export */   fs: () => (/* binding */ _cuid),
/* harmony export */   gP: () => (/* binding */ _cidrv6),
/* harmony export */   hH: () => (/* binding */ _lowercase),
/* harmony export */   jw: () => (/* binding */ _null),
/* harmony export */   lo: () => (/* binding */ _normalize),
/* harmony export */   m9: () => (/* binding */ _minLength),
/* harmony export */   mI: () => (/* binding */ meta),
/* harmony export */   nA: () => (/* binding */ _uuidv4),
/* harmony export */   pY: () => (/* binding */ _uuidv6),
/* harmony export */   q0: () => (/* binding */ describe),
/* harmony export */   qF: () => (/* binding */ _uppercase),
/* harmony export */   qG: () => (/* binding */ _coercedNumber),
/* harmony export */   qm: () => (/* binding */ _gte),
/* harmony export */   rk: () => (/* binding */ _jwt),
/* harmony export */   rt: () => (/* binding */ _base64),
/* harmony export */   tB: () => (/* binding */ _guid),
/* harmony export */   wA: () => (/* binding */ _uuidv7),
/* harmony export */   xY: () => (/* binding */ _toUpperCase)
/* harmony export */ });
/* unused harmony exports _coercedString, _mac, _creditCard, _iban, TimePrecision, _float32, _float64, _int32, _uint32, _coercedBoolean, _bigint, _coercedBigint, _int64, _uint64, _symbol, _undefined, _void, _date, _coercedDate, _nan, _max, _min, _negative, _nonpositive, _maxSize, _minSize, _size, _property, _mime, _union, _xor, _discriminatedUnion, _intersection, _tuple, _record, _map, _set, _enum, _nativeEnum, _literal, _file, _transform, _optional, _nullable, _default, _nonoptional, _success, _catch, _pipe, _readonly, _templateLiteral, _lazy, _promise, _check, _stringbool, _stringFormat */
/* harmony import */ var _checks_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5519);
/* harmony import */ var _registries_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(56045);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24366);




function snapshotChecks(def) {
    if (def.checks)
        def.checks = [...def.checks];
    return def;
}
// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
    return new Class(snapshotChecks({ type: "string", ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params) }));
}
// @__NO_SIDE_EFFECTS__
function _coercedString(Class, params) {
    return new Class(snapshotChecks({ type: "string", coerce: true, ...util.normalizeParams(params) }));
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
    return new Class({
        type: "string",
        format: "email",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
    return new Class({
        type: "string",
        format: "guid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v4",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v6",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v7",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
    return new Class({
        type: "string",
        format: "url",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _emoji(Class, params) {
    return new Class({
        type: "string",
        format: "emoji",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
    return new Class({
        type: "string",
        format: "nanoid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link _cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
    return new Class({
        type: "string",
        format: "cuid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
    return new Class({
        type: "string",
        format: "cuid2",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
    return new Class({
        type: "string",
        format: "ulid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
    return new Class({
        type: "string",
        format: "xid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
    return new Class({
        type: "string",
        format: "ksuid",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
    return new Class({
        type: "string",
        format: "ipv4",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
    return new Class({
        type: "string",
        format: "ipv6",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _mac(Class, params) {
    return new Class({
        type: "string",
        format: "mac",
        check: "string_format",
        abort: false,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
    return new Class({
        type: "string",
        format: "cidrv4",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
    return new Class({
        type: "string",
        format: "cidrv6",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
    return new Class({
        type: "string",
        format: "base64",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
    return new Class({
        type: "string",
        format: "base64url",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
    return new Class({
        type: "string",
        format: "e164",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _creditCard(Class, params) {
    return new Class({
        type: "string",
        format: "credit_card",
        check: "string_format",
        abort: false,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _iban(Class, params) {
    return new Class({
        type: "string",
        format: "iban",
        check: "string_format",
        abort: false,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
    return new Class({
        type: "string",
        format: "jwt",
        check: "string_format",
        abort: false,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
const TimePrecision = {
    Any: null,
    Minute: -1,
    Second: 0,
    Millisecond: 3,
    Microsecond: 6,
};
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
    return new Class({
        type: "string",
        format: "datetime",
        check: "string_format",
        offset: false,
        local: false,
        precision: null,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
    return new Class({
        type: "string",
        format: "date",
        check: "string_format",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
    return new Class({
        type: "string",
        format: "time",
        check: "string_format",
        precision: null,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
    return new Class({
        type: "string",
        format: "duration",
        check: "string_format",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
    return new Class(snapshotChecks({ type: "number", checks: [], ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params) }));
}
// @__NO_SIDE_EFFECTS__
function _coercedNumber(Class, params) {
    return new Class(snapshotChecks({ type: "number", coerce: true, checks: [], ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params) }));
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "safeint",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _float32(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "float32",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _float64(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "float64",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _int32(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "int32",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uint32(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "uint32",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class, params) {
    return new Class({
        type: "boolean",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedBoolean(Class, params) {
    return new Class({
        type: "boolean",
        coerce: true,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _bigint(Class, params) {
    return new Class({
        type: "bigint",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedBigint(Class, params) {
    return new Class({
        type: "bigint",
        coerce: true,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _int64(Class, params) {
    return new Class({
        type: "bigint",
        check: "bigint_format",
        abort: false,
        format: "int64",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uint64(Class, params) {
    return new Class({
        type: "bigint",
        check: "bigint_format",
        abort: false,
        format: "uint64",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _symbol(Class, params) {
    return new Class({
        type: "symbol",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _undefined(Class, params) {
    return new Class({
        type: "undefined",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _null(Class, params) {
    return new Class({
        type: "null",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _any(Class) {
    return new Class({
        type: "any",
    });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
    return new Class({
        type: "unknown",
    });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
    return new Class({
        type: "never",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _void(Class, params) {
    return new Class({
        type: "void",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _date(Class, params) {
    return new Class({
        type: "date",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedDate(Class, params) {
    return new Class({
        type: "date",
        coerce: true,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _nan(Class, params) {
    return new Class({
        type: "nan",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckLessThan */ .sm({
        check: "less_than",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        value,
        inclusive: false,
    });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckLessThan */ .sm({
        check: "less_than",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        value,
        inclusive: true,
    });
}

// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckGreaterThan */ .J_({
        check: "greater_than",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        value,
        inclusive: false,
    });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckGreaterThan */ .J_({
        check: "greater_than",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        value,
        inclusive: true,
    });
}

// @__NO_SIDE_EFFECTS__
function _positive(params) {
    return _gt(0, params);
}
// negative
// @__NO_SIDE_EFFECTS__
function _negative(params) {
    return _lt(0, params);
}
// nonpositive
// @__NO_SIDE_EFFECTS__
function _nonpositive(params) {
    return _lte(0, params);
}
// nonnegative
// @__NO_SIDE_EFFECTS__
function _nonnegative(params) {
    return _gte(0, params);
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckMultipleOf */ .Jk({
        check: "multiple_of",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        value,
    });
}
// @__NO_SIDE_EFFECTS__
function _maxSize(maximum, params) {
    return new checks.$ZodCheckMaxSize({
        check: "max_size",
        ...util.normalizeParams(params),
        maximum,
    });
}
// @__NO_SIDE_EFFECTS__
function _minSize(minimum, params) {
    return new checks.$ZodCheckMinSize({
        check: "min_size",
        ...util.normalizeParams(params),
        minimum,
    });
}
// @__NO_SIDE_EFFECTS__
function _size(size, params) {
    return new checks.$ZodCheckSizeEquals({
        check: "size_equals",
        ...util.normalizeParams(params),
        size,
    });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
    const ch = new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckMaxLength */ .Yk({
        check: "max_length",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        maximum,
    });
    return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckMinLength */ .Kk({
        check: "min_length",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        minimum,
    });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckLengthEquals */ .RM({
        check: "length_equals",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        length,
    });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckRegex */ .DG({
        check: "string_format",
        format: "regex",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        pattern,
    });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckLowerCase */ .NI({
        check: "string_format",
        format: "lowercase",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckUpperCase */ .kH({
        check: "string_format",
        format: "uppercase",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckIncludes */ .Tt({
        check: "string_format",
        format: "includes",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        includes,
    });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckStartsWith */ .J({
        check: "string_format",
        format: "starts_with",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        prefix,
    });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckEndsWith */ .E6({
        check: "string_format",
        format: "ends_with",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
        suffix,
    });
}
// @__NO_SIDE_EFFECTS__
function _property(property, schema, params) {
    return new checks.$ZodCheckProperty({
        check: "property",
        property,
        schema,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _properties(shape, params) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckProperties */ .nJ({
        check: "properties",
        shape,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _mime(types, params) {
    return new checks.$ZodCheckMimeType({
        check: "mime_type",
        mime: types,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
    return new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheckOverwrite */ .v$({
        check: "overwrite",
        tx,
    });
}
// normalize
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
    return _overwrite((input) => input.normalize(form));
}
// trim
// @__NO_SIDE_EFFECTS__
function _trim() {
    return _overwrite((input) => input.trim());
}
// toLowerCase
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
    return _overwrite((input) => input.toLowerCase());
}
// toUpperCase
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
    return _overwrite((input) => input.toUpperCase());
}
// slugify
// @__NO_SIDE_EFFECTS__
function _slugify() {
    return _overwrite((input) => _util_js__WEBPACK_IMPORTED_MODULE_0__/* .slugify */ .Yv(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
    return new Class({
        type: "array",
        element,
        // get element() {
        //   return element;
        // },
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _union(Class, options, params) {
    return new Class({
        type: "union",
        options,
        ...util.normalizeParams(params),
    });
}
function _xor(Class, options, params) {
    return new Class({
        type: "union",
        options,
        inclusive: false,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _discriminatedUnion(Class, discriminator, options, params) {
    return new Class({
        type: "union",
        options: options,
        discriminator,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _intersection(Class, left, right) {
    return new Class({
        type: "intersection",
        left,
        right,
    });
}
// export function _tuple(
//   Class: util.SchemaClass<schemas.$ZodTuple>,
//   items: [],
//   params?: string | $ZodTupleParams
// ): schemas.$ZodTuple<[], null>;
// @__NO_SIDE_EFFECTS__
function _tuple(Class, items, _paramsOrRest, _params) {
    const hasRest = _paramsOrRest instanceof schemas.$ZodType;
    const params = hasRest ? _params : _paramsOrRest;
    const rest = hasRest ? _paramsOrRest : null;
    return new Class({
        type: "tuple",
        items,
        rest,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _record(Class, keyType, valueType, params) {
    return new Class({
        type: "record",
        keyType,
        valueType,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _map(Class, keyType, valueType, params) {
    return new Class({
        type: "map",
        keyType,
        valueType,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _set(Class, valueType, params) {
    return new Class({
        type: "set",
        valueType,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _enum(Class, values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    // if (Array.isArray(values)) {
    //   for (const value of values) {
    //     entries[value] = value;
    //   }
    // } else {
    //   Object.assign(entries, values);
    // }
    // const entries: util.EnumLike = {};
    // for (const val of values) {
    //   entries[val] = val;
    // }
    return new Class({
        type: "enum",
        entries,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
function _nativeEnum(Class, entries, params) {
    return new Class({
        type: "enum",
        entries,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _literal(Class, value, params) {
    return new Class({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _file(Class, params) {
    return new Class({
        type: "file",
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _transform(Class, fn) {
    return new Class({
        type: "transform",
        transform: fn,
    });
}
// @__NO_SIDE_EFFECTS__
function _optional(Class, innerType) {
    return new Class({
        type: "optional",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _nullable(Class, innerType) {
    return new Class({
        type: "nullable",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _default(Class, innerType, defaultValue) {
    return new Class({
        type: "default",
        innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : util.shallowClone(defaultValue);
        },
    });
}
// @__NO_SIDE_EFFECTS__
function _nonoptional(Class, innerType, params) {
    return new Class({
        type: "nonoptional",
        innerType,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _success(Class, innerType) {
    return new Class({
        type: "success",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _catch(Class, innerType, catchValue) {
    return new Class({
        type: "catch",
        innerType,
        catchValue: (typeof catchValue === "function" ? catchValue : util.constantCatch(catchValue)),
    });
}
// @__NO_SIDE_EFFECTS__
function _pipe(Class, in_, out) {
    return new Class({
        type: "pipe",
        in: in_,
        out,
    });
}
// @__NO_SIDE_EFFECTS__
function _readonly(Class, innerType) {
    return new Class({
        type: "readonly",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _templateLiteral(Class, parts, params) {
    return new Class({
        type: "template_literal",
        parts,
        ...util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _lazy(Class, getter) {
    return new Class({
        type: "lazy",
        getter,
    });
}
// @__NO_SIDE_EFFECTS__
function _promise(Class, innerType) {
    return new Class({
        type: "promise",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _custom(Class, fn, _params) {
    const norm = _util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(_params);
    norm.abort ?? (norm.abort = true); // default to abort:false
    const schema = new Class({
        type: "custom",
        check: "custom",
        fn: fn,
        ...norm,
    });
    return schema;
}
// same as _custom but defaults to abort:false
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
    const schema = new Class({
        type: "custom",
        check: "custom",
        fn: fn,
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(_params),
    });
    return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
    const ch = _check((payload) => {
        payload.addIssue = (issue) => {
            if (typeof issue === "string") {
                payload.issues.push(_util_js__WEBPACK_IMPORTED_MODULE_0__/* .issue */ .sn(issue, payload.value, ch._zod.def));
            }
            else {
                // for Zod 3 backwards compatibility
                const _issue = issue;
                if (_issue.fatal)
                    _issue.continue = false;
                _issue.code ?? (_issue.code = "custom");
                if (!("input" in _issue))
                    _issue.input = payload.value;
                _issue.inst ?? (_issue.inst = ch);
                _issue.continue ?? (_issue.continue = !ch._zod.def.abort); // abort is always undefined, so this is always true...
                payload.issues.push(_util_js__WEBPACK_IMPORTED_MODULE_0__/* .issue */ .sn(_issue));
            }
        };
        return fn(payload.value, payload);
    }, params);
    return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
    const ch = new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheck */ .QP({
        check: "custom",
        ..._util_js__WEBPACK_IMPORTED_MODULE_0__/* .normalizeParams */ .A2(params),
    });
    ch._zod.check = fn;
    return ch;
}
// @__NO_SIDE_EFFECTS__
function describe(description) {
    const ch = new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheck */ .QP({ check: "describe" });
    ch._zod.onattach = [
        (inst) => {
            const existing = _registries_js__WEBPACK_IMPORTED_MODULE_2__/* .globalRegistry */ .fd.get(inst) ?? {};
            _registries_js__WEBPACK_IMPORTED_MODULE_2__/* .globalRegistry */ .fd.add(inst, { ...existing, description });
        },
    ];
    ch._zod.check = () => { }; // no-op check
    return ch;
}
// @__NO_SIDE_EFFECTS__
function meta(metadata) {
    const ch = new _checks_js__WEBPACK_IMPORTED_MODULE_1__/* .$ZodCheck */ .QP({ check: "meta" });
    ch._zod.onattach = [
        (inst) => {
            const existing = _registries_js__WEBPACK_IMPORTED_MODULE_2__/* .globalRegistry */ .fd.get(inst) ?? {};
            _registries_js__WEBPACK_IMPORTED_MODULE_2__/* .globalRegistry */ .fd.add(inst, { ...existing, ...metadata });
        },
    ];
    ch._zod.check = () => { }; // no-op check
    return ch;
}
// @__NO_SIDE_EFFECTS__
function _stringbool(Classes, _params) {
    const params = util.normalizeParams(_params);
    let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
    let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
    if (params.case !== "sensitive") {
        truthyArray = truthyArray.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
        falsyArray = falsyArray.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
    }
    const truthySet = new Set(truthyArray);
    const falsySet = new Set(falsyArray);
    const _Codec = Classes.Codec ?? schemas.$ZodCodec;
    const _Boolean = Classes.Boolean ?? schemas.$ZodBoolean;
    const _String = Classes.String ?? schemas.$ZodString;
    const stringSchema = new _String({ type: "string", error: params.error });
    const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
    const codec = new _Codec({
        type: "pipe",
        in: stringSchema,
        out: booleanSchema,
        transform: ((input, payload) => {
            let data = input;
            if (params.case !== "sensitive")
                data = data.toLowerCase();
            if (truthySet.has(data)) {
                return true;
            }
            else if (falsySet.has(data)) {
                return false;
            }
            else {
                payload.issues.push({
                    code: "invalid_value",
                    expected: "stringbool",
                    values: [...truthySet, ...falsySet],
                    input: payload.value,
                    inst: codec,
                    continue: false,
                });
                return {};
            }
        }),
        reverseTransform: ((input, _payload) => {
            if (input === true) {
                return truthyArray[0] || "true";
            }
            else {
                return falsyArray[0] || "false";
            }
        }),
        error: params.error,
    });
    codec._zod.bag.truthy = truthyArray;
    codec._zod.bag.falsy = falsyArray;
    codec._zod.bag.case = params.case ?? "insensitive";
    return codec;
}
// @__NO_SIDE_EFFECTS__
function _stringFormat(Class, format, fnOrRegex, _params = {}) {
    const params = util.normalizeParams(_params);
    const def = {
        check: "string_format",
        type: "string",
        format,
        fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
        ...params,
    };
    if (fnOrRegex instanceof RegExp) {
        def.pattern = fnOrRegex;
    }
    const inst = new Class(def);
    return inst;
}


/***/ }),

/***/ 5519:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DG: () => (/* binding */ $ZodCheckRegex),
/* harmony export */   E6: () => (/* binding */ $ZodCheckEndsWith),
/* harmony export */   J: () => (/* binding */ $ZodCheckStartsWith),
/* harmony export */   J_: () => (/* binding */ $ZodCheckGreaterThan),
/* harmony export */   Jk: () => (/* binding */ $ZodCheckMultipleOf),
/* harmony export */   KH: () => (/* binding */ $ZodCheckNumberFormat),
/* harmony export */   Kk: () => (/* binding */ $ZodCheckMinLength),
/* harmony export */   NI: () => (/* binding */ $ZodCheckLowerCase),
/* harmony export */   QP: () => (/* binding */ $ZodCheck),
/* harmony export */   RM: () => (/* binding */ $ZodCheckLengthEquals),
/* harmony export */   Tt: () => (/* binding */ $ZodCheckIncludes),
/* harmony export */   Yk: () => (/* binding */ $ZodCheckMaxLength),
/* harmony export */   kH: () => (/* binding */ $ZodCheckUpperCase),
/* harmony export */   nJ: () => (/* binding */ $ZodCheckProperties),
/* harmony export */   ql: () => (/* binding */ $ZodCheckStringFormat),
/* harmony export */   sm: () => (/* binding */ $ZodCheckLessThan),
/* harmony export */   v$: () => (/* binding */ $ZodCheckOverwrite)
/* harmony export */ });
/* unused harmony exports $ZodCheckBigIntFormat, $ZodCheckMaxSize, $ZodCheckMinSize, $ZodCheckSizeEquals, $ZodCheckProperty, $ZodCheckMimeType */
/* harmony import */ var _core_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48149);
/* harmony import */ var _regexes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(63983);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(24366);
// import { $ZodType } from "./schemas.js";



const $ZodCheck = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheck", (inst, def) => {
    var _a;
    inst._zod ?? (inst._zod = {});
    inst._zod.def = def;
    (_a = inst._zod).onattach ?? (_a.onattach = []);
});
/** Default `when` for size-based checks: run only on non-nullish values with a `size`. */
const _whenHasSize = (payload) => {
    const val = payload.value;
    return !util.nullish(val) && val.size !== undefined;
};
/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
const _whenHasLength = (payload) => {
    const val = payload.value;
    return !_util_js__WEBPACK_IMPORTED_MODULE_1__/* .nullish */ .cl(val) && val.length !== undefined;
};
const numericOriginMap = {
    number: "number",
    bigint: "bigint",
    object: "date",
};
const $ZodCheckLessThan = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckLessThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
            return;
        }
        payload.issues.push({
            origin: numericOriginMap[typeof payload.value] ?? origin,
            code: "too_big",
            maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckGreaterThan = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckGreaterThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
            return;
        }
        payload.issues.push({
            origin: numericOriginMap[typeof payload.value] ?? origin,
            code: "too_small",
            minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckMultipleOf = 
/*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckMultipleOf", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
            throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint"
            ? // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
                def.value !== BigInt(0) && payload.value % def.value === BigInt(0)
            : _util_js__WEBPACK_IMPORTED_MODULE_1__/* .floatSafeRemainder */ .LG(payload.value, def.value) === 0;
        if (isMultiple)
            return;
        payload.issues.push({
            origin: typeof payload.value,
            code: "not_multiple_of",
            divisor: def.value,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckNumberFormat = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckNumberFormat", (inst, def) => {
    $ZodCheck.init(inst, def); // no format checks
    def.format = def.format || "float64";
    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = _util_js__WEBPACK_IMPORTED_MODULE_1__/* .NUMBER_FORMAT_RANGES */ .zH[def.format];
    inst._zod.check = (payload) => {
        const input = payload.value;
        if (isInt) {
            if (!Number.isInteger(input)) {
                // invalid_format issue
                // payload.issues.push({
                //   expected: def.format,
                //   format: def.format,
                //   code: "invalid_format",
                //   input,
                //   inst,
                // });
                // invalid_type issue
                payload.issues.push({
                    expected: origin,
                    format: def.format,
                    code: "invalid_type",
                    continue: false,
                    input,
                    inst,
                });
                return;
                // not_multiple_of issue
                // payload.issues.push({
                //   code: "not_multiple_of",
                //   origin: "number",
                //   input,
                //   inst,
                //   divisor: 1,
                // });
            }
            if (!Number.isSafeInteger(input)) {
                if (input > 0) {
                    // too_big
                    payload.issues.push({
                        input,
                        code: "too_big",
                        maximum: Number.MAX_SAFE_INTEGER,
                        note: "Integers must be within the safe integer range.",
                        inst,
                        origin,
                        inclusive: true,
                        continue: !def.abort,
                    });
                }
                else {
                    // too_small
                    payload.issues.push({
                        input,
                        code: "too_small",
                        minimum: Number.MIN_SAFE_INTEGER,
                        note: "Integers must be within the safe integer range.",
                        inst,
                        origin,
                        inclusive: true,
                        continue: !def.abort,
                    });
                }
                return;
            }
        }
        if (input < minimum) {
            payload.issues.push({
                origin: "number",
                input,
                code: "too_small",
                minimum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
        if (input > maximum) {
            payload.issues.push({
                origin: "number",
                input,
                code: "too_big",
                maximum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodCheckBigIntFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckBigIntFormat", (inst, def) => {
    $ZodCheck.init(inst, def); // no format checks
    const [minimum, maximum] = util.BIGINT_FORMAT_RANGES[def.format];
    inst._zod.check = (payload) => {
        const input = payload.value;
        if (input < minimum) {
            payload.issues.push({
                origin: "bigint",
                input,
                code: "too_small",
                minimum: minimum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
        if (input > maximum) {
            payload.issues.push({
                origin: "bigint",
                input,
                code: "too_big",
                maximum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
    };
})));
const $ZodCheckMaxSize = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckMaxSize", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = _whenHasSize);
    inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size <= def.maximum)
            return;
        payload.issues.push({
            origin: util.getSizableOrigin(input),
            code: "too_big",
            maximum: def.maximum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckMinSize = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckMinSize", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = _whenHasSize);
    inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size >= def.minimum)
            return;
        payload.issues.push({
            origin: util.getSizableOrigin(input),
            code: "too_small",
            minimum: def.minimum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckSizeEquals = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckSizeEquals", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = _whenHasSize);
    inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size === def.size)
            return;
        const tooBig = size > def.size;
        payload.issues.push({
            origin: util.getSizableOrigin(input),
            ...(tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size }),
            inclusive: true,
            exact: true,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckMaxLength = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckMaxLength", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
    inst._zod.check = (payload) => {
        const input = payload.value;
        const units = input.length;
        // Strings are measured in Unicode code points, not UTF-16 units. A code point is at most two units, so a string that already fits in units fits in code points; only an overflow has to be counted.
        const length = typeof input === "string" && units > def.maximum ? _util_js__WEBPACK_IMPORTED_MODULE_1__/* .codePointLength */ .O7(input) : units;
        if (length <= def.maximum)
            return;
        const origin = _util_js__WEBPACK_IMPORTED_MODULE_1__/* .getLengthableOrigin */ .Rc(input);
        payload.issues.push({
            origin,
            code: "too_big",
            maximum: def.maximum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckMinLength = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckMinLength", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
    inst._zod.check = (payload) => {
        const input = payload.value;
        const units = input.length;
        // A code point is one or two UTF-16 units, so fewer units than the floor can never reach it and twice the floor always clears it. Only in between is the exact count in doubt.
        const length = typeof input === "string" && units >= def.minimum && units < def.minimum * 2
            ? _util_js__WEBPACK_IMPORTED_MODULE_1__/* .codePointLength */ .O7(input)
            : units;
        if (length >= def.minimum)
            return;
        const origin = _util_js__WEBPACK_IMPORTED_MODULE_1__/* .getLengthableOrigin */ .Rc(input);
        payload.issues.push({
            origin,
            code: "too_small",
            minimum: def.minimum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckLengthEquals = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckLengthEquals", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
    inst._zod.check = (payload) => {
        const input = payload.value;
        const units = input.length;
        // A code point is one or two UTF-16 units, so outside `[length, length * 2]` units the target is missed either way — and missed in the same direction in both measures.
        const length = typeof input === "string" && units >= def.length && units <= def.length * 2
            ? _util_js__WEBPACK_IMPORTED_MODULE_1__/* .codePointLength */ .O7(input)
            : units;
        if (length === def.length)
            return;
        const origin = _util_js__WEBPACK_IMPORTED_MODULE_1__/* .getLengthableOrigin */ .Rc(input);
        const tooBig = length > def.length;
        payload.issues.push({
            origin,
            ...(tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length }),
            inclusive: true,
            exact: true,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckStringFormat = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckStringFormat", (inst, def) => {
    var _a, _b;
    $ZodCheck.init(inst, def);
    if (def.pattern)
        (_a = inst._zod).check ?? (_a.check = (payload) => {
            def.pattern.lastIndex = 0;
            if (def.pattern.test(payload.value))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: def.format,
                input: payload.value,
                ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
                inst,
                continue: !def.abort,
            });
        });
    else
        (_b = inst._zod).check ?? (_b.check = () => { });
});
const $ZodCheckRegex = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckRegex", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "regex",
            input: payload.value,
            pattern: def.pattern.toString(),
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckLowerCase = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckLowerCase", (inst, def) => {
    def.pattern ?? (def.pattern = _regexes_js__WEBPACK_IMPORTED_MODULE_2__/* .lowercase */ .AC);
    $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckUpperCase", (inst, def) => {
    def.pattern ?? (def.pattern = _regexes_js__WEBPACK_IMPORTED_MODULE_2__/* .uppercase */ .Zv);
    $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckIncludes", (inst, def) => {
    $ZodCheck.init(inst, def);
    const escapedRegex = _util_js__WEBPACK_IMPORTED_MODULE_1__/* .escapeRegex */ .sD(def.includes);
    // `String.prototype.includes(sub, position)` matches `sub` at `position`
    // OR LATER, so the pattern must allow at least `position` leading chars
    // (`{N,}`), not exactly `position` chars (`{N}`).
    const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
    def.pattern = pattern;
    inst._zod.check = (payload) => {
        if (payload.value.includes(def.includes, def.position))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: def.includes,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckStartsWith = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckStartsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`^${_util_js__WEBPACK_IMPORTED_MODULE_1__/* .escapeRegex */ .sD(def.prefix)}.*`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.check = (payload) => {
        if (payload.value.startsWith(def.prefix))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: def.prefix,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckEndsWith = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckEndsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`.*${_util_js__WEBPACK_IMPORTED_MODULE_1__/* .escapeRegex */ .sD(def.suffix)}$`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.check = (payload) => {
        if (payload.value.endsWith(def.suffix))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: def.suffix,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
///////////////////////////////////
/////    $ZodCheckProperty    /////
///////////////////////////////////
function handleCheckPropertyResult(result, payload, property) {
    if (result.issues.length) {
        payload.issues.push(..._util_js__WEBPACK_IMPORTED_MODULE_1__/* .prefixIssues */ .lQ(property, result.issues));
    }
}
const $ZodCheckProperty = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckProperty", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
        const result = def.schema._zod.run({
            value: payload.value[def.property],
            issues: [],
        }, {});
        if (result instanceof Promise) {
            return result.then((result) => handleCheckPropertyResult(result, payload, def.property));
        }
        handleCheckPropertyResult(result, payload, def.property);
        return;
    };
})));
const $ZodCheckProperties = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckProperties", (inst, def) => {
    $ZodCheck.init(inst, def);
    _util_js__WEBPACK_IMPORTED_MODULE_1__/* .hide */ .jD(inst, Symbol.iterator, function* () {
        yield inst;
    });
    // key and schema snapshotted together: reading one live and the other cached lets a later mutation of the caller's shape object pair a stale key with a missing schema
    let entries;
    inst._zod.check = (payload) => {
        // the base schema already typed the value, so only a nullish one is rejected here: the properties read on a primitive too, matching z.property() on a string's length
        if (payload.value == null) {
            payload.issues.push({ expected: "object", code: "invalid_type", input: payload.value, inst });
            return undefined;
        }
        entries ?? (entries = Reflect.ownKeys(def.shape).map((key) => [key, def.shape[key]]));
        const input = payload.value;
        let proms;
        for (const [key, schema] of entries) {
            const result = schema._zod.run({ value: input[key], issues: [] }, {});
            if (result instanceof Promise) {
                proms ?? (proms = []);
                proms.push(result.then((result) => handleCheckPropertyResult(result, payload, key)));
            }
            else {
                handleCheckPropertyResult(result, payload, key);
            }
        }
        if (proms)
            return Promise.all(proms).then(() => undefined);
        return undefined;
    };
});
const $ZodCheckMimeType = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckMimeType", (inst, def) => {
    $ZodCheck.init(inst, def);
    const mimeSet = new Set(def.mime);
    inst._zod.check = (payload) => {
        if (mimeSet.has(payload.value.type))
            return;
        payload.issues.push({
            code: "invalid_value",
            values: def.mime,
            input: payload.value.type,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckOverwrite = /*@__PURE__*/ _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$constructor */ .xI("$ZodCheckOverwrite", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
        payload.value = def.tx(payload.value);
    };
});


/***/ }),

/***/ 48149:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $W: () => (/* binding */ config),
/* harmony export */   GT: () => (/* binding */ $ZodAsyncError),
/* harmony export */   cV: () => (/* binding */ $ZodEncodeError),
/* harmony export */   cr: () => (/* binding */ globalConfig),
/* harmony export */   tm: () => (/* binding */ NEVER),
/* harmony export */   xI: () => (/* binding */ $constructor)
/* harmony export */ });
/* unused harmony export $brand */
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24366);
var _a;

/** A special constant with type `never` */
const NEVER = /*@__PURE__*/ Object.freeze({
    status: "aborted",
});
/* Shared descriptor for installing `_zod`; defineProperty reads it
 * synchronously, so reusing one object avoids a per-instance allocation. */
const _zodDesc = { value: undefined, enumerable: false };
// null where suppressing the capture would be unrecoverable: `parse()` puts the frames back with `captureStackTrace`, so without it the throw would lose its stack. also latched to null once `stackTraceLimit` proves unassignable, which a realm can do at any point by hardening Error
let _E = "captureStackTrace" in Error ? Error : null;
// v8 captures a stack trace inside the Error constructor, which dominates a failed parse; costs only the frames, and parse() restores those. the constructor must RUN: Object.create is cheaper and passes instanceof, but Error.isError and util.types.isNativeError check an internal slot
function newError(Definition) {
    const E = _E;
    if (E) {
        const saved = E.stackTraceLimit;
        if (typeof saved === "number") {
            try {
                E.stackTraceLimit = 0;
            }
            catch {
                _E = null;
                return new Definition();
            }
            try {
                return new Definition();
            }
            finally {
                E.stackTraceLimit = saved;
            }
        }
    }
    return new Definition();
}
function $constructor(name, initializer, 
/** This trait's members, installed once on every prototype that composes it. They cannot be declared in the initializer above: that runs per instance, and the prototype is shared. */
proto, params) {
    // Prototype for this constructor's `_zod` internals. Lazily-derived fields (`values`, `pattern`, `optin`, …) install here once rather than as an accessor on every instance.
    const zodProto = {};
    // Assigning the fields in the constructor body is what gives instances in-object slots; building the object literally and reparenting it costs a second allocation and a generic property copy.
    function Internals(def) {
        this.def = def;
        this.constr = _;
        this.traits = new Set();
    }
    Internals.prototype = zodProto;
    const protoMembers = proto;
    // One trait's members land on every prototype whose chain composes it, so the answer is per prototype rather than per trait.
    const initialized = protoMembers && new WeakSet();
    function init(inst, def) {
        if (!inst._zod) {
            _zodDesc.value = new Internals(def);
            try {
                Object.defineProperty(inst, "_zod", _zodDesc);
            }
            finally {
                // Cleared even on throw, so the shared descriptor never leaks one instance's internals into the next.
                _zodDesc.value = undefined;
            }
        }
        else if (inst._zod.traits.has(name)) {
            return;
        }
        inst._zod.traits.add(name);
        initializer(inst, def);
        if (initialized) {
            // `super(def)` from a user subclass gives `this` a prototype the subclass owns, and installing there would overwrite whatever the subclass declared. `constr` built the instance, so its prototype is the one below the subclass's that should carry the members. A receiver whose chain never reaches that prototype installs on its own, which for a plain object handed straight to `init` means `Object.prototype` — unchanged from before.
            const own = Object.getPrototypeOf(inst);
            const ctorProto = inst._zod.constr.prototype;
            let up = own;
            while (up && up !== ctorProto)
                up = Object.getPrototypeOf(up);
            const target = up ?? own;
            if (!initialized.has(target)) {
                initialized.add(target);
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .members */ .ol)(target, protoMembers);
            }
        }
        // support prototype modifications; for-in avoids the array allocation of Object.keys on the (usually empty) prototype
        const proto = _.prototype;
        for (const k in proto) {
            if (!Object.prototype.hasOwnProperty.call(proto, k))
                continue;
            if (!(k in inst)) {
                inst[k] = proto[k].bind(inst);
            }
        }
    }
    // doesn't work if Parent has a constructor with arguments
    const Parent = params?.Parent ?? Object;
    class Definition extends Parent {
    }
    Object.defineProperty(Definition, "name", { value: name });
    function _(def) {
        const inst = params?.Parent ? newError(Definition) : this;
        init(inst, def);
        const deferred = inst._zod.deferred;
        if (deferred) {
            for (const fn of deferred) {
                fn();
            }
            // Released: initializers run once, and the list would otherwise be retained for the schema's lifetime.
            inst._zod.deferred = undefined;
        }
        // Global post-processor hook. Internal: installed by `import "zod/compile"` to enable AOT compilation for every constructed schema. Runs last, once the instance is fully built, because it hands the instance to compile(). The post-processor is expected to be reentrancy-guarded by its own implementation.
        const pp = globalThis.__zod_globalConfig?.postProcessor;
        if (pp)
            pp(inst);
        return inst;
    }
    Object.defineProperty(_, "init", { value: init });
    Object.defineProperty(_, Symbol.hasInstance, {
        value: (inst) => {
            if (params?.Parent && inst instanceof params.Parent)
                return true;
            return inst?._zod?.traits?.has(name);
        },
    });
    Object.defineProperty(_, "name", { value: name });
    return _;
}
//////////////////////////////   UTILITIES   ///////////////////////////////////////
const $brand = /*@__PURE__*/ (/* unused pure expression or super */ null && (Symbol("zod_brand")));
class $ZodAsyncError extends Error {
    constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
}
class $ZodEncodeError extends Error {
    constructor(name) {
        super(`Encountered unidirectional transform during encode: ${name}`);
        this.name = "ZodEncodeError";
    }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
    if (newConfig)
        Object.assign(globalConfig, newConfig);
    return globalConfig;
}


/***/ }),

/***/ 89053:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JM: () => (/* binding */ flattenError),
/* harmony export */   Kd: () => (/* binding */ $ZodRealError),
/* harmony export */   Wk: () => (/* binding */ formatError),
/* harmony export */   a$: () => (/* binding */ $ZodError)
/* harmony export */ });
/* unused harmony exports treeifyError, toDotPath, prettifyError */
/* harmony import */ var _core_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(48149);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24366);


/* Computing the message eagerly is expensive (pretty-printed JSON of all
 * issues), so defer it until first read. The accessor functions and
 * descriptors are shared across instances to keep error construction
 * cheap; the computed message is cached on the internals object. The
 * setter preserves plain assignment semantics for consumers that
 * overwrite `message`. */
function _getMessage() {
    const internals = this._zod;
    internals.message ?? (internals.message = JSON.stringify(internals.def, _util_js__WEBPACK_IMPORTED_MODULE_0__/* .jsonStringifyReplacer */ .k8, 2));
    return internals.message;
}
function _setMessage(value) {
    this._zod.message = value;
}
const _messageDesc = {
    get: _getMessage,
    set: _setMessage,
    enumerable: true,
    configurable: true,
};
const _issuesDesc = { value: undefined, enumerable: false };
/* Prototypes that already carry the lazy `toString`. Seeded with the
 * intrinsics so that `init` on a foreign object — it accepts any object —
 * can never install an accessor onto a prototype we do not own. */
const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
const initializer = (inst, def) => {
    inst.name = "$ZodError";
    // `_zod` is already non-enumerable: $constructor's init defined it with this same descriptor
    _issuesDesc.value = def;
    Object.defineProperty(inst, "issues", _issuesDesc);
    // Clear the shared slot; a retained `value` pins the last error's issues.
    _issuesDesc.value = undefined;
    Object.defineProperty(inst, "message", _messageDesc);
    /* `toString` lives as a non-enumerable lazy getter on the shared
     * prototype; on first access it caches a per-instance closure so
     * detached usage still works. */
    const proto = Object.getPrototypeOf(inst);
    if (!_installedToString.has(proto)) {
        _installedToString.add(proto);
        Object.defineProperty(proto, "toString", {
            configurable: true,
            enumerable: false,
            get() {
                const value = () => this.message;
                Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
                return value;
            },
            set(value) {
                Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
            },
        });
    }
};
const $ZodError = (0,_core_js__WEBPACK_IMPORTED_MODULE_1__/* .$constructor */ .xI)("$ZodError", initializer);
const $ZodRealError = (0,_core_js__WEBPACK_IMPORTED_MODULE_1__/* .$constructor */ .xI)("$ZodError", initializer, undefined, {
    Parent: Error,
});
/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
 * ("toString", "constructor") would otherwise read through to the prototype, and assigning
 * "__proto__" would hit the setter instead of creating a key. */
function node(obj, key, make) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === "__proto__") {
            Object.defineProperty(obj, key, { value: make(), writable: true, enumerable: true, configurable: true });
        }
        else {
            obj[key] = make();
        }
    }
    return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of error.issues) {
        if (sub.path.length > 0) {
            node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
        }
        else {
            formErrors.push(mapper(sub));
        }
    }
    return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
    const fieldErrors = { _errors: [] };
    const processError = (error, path = []) => {
        for (const issue of error.issues) {
            if (issue.code === "invalid_union" && issue.errors.length) {
                issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
            }
            else if (issue.code === "invalid_key") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else if (issue.code === "invalid_element") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else {
                const fullpath = [...path, ...issue.path];
                if (fullpath.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < fullpath.length) {
                        const el = fullpath[i];
                        const terminal = i === fullpath.length - 1;
                        // `_errors` is reserved by this legacy format, so merge a matching path segment into the current node instead of treating its array as a child.
                        if (el === "_errors") {
                            if (terminal)
                                curr._errors.push(mapper(issue));
                            i++;
                            continue;
                        }
                        // A path element may collide with an inherited property name such as
                        // "__proto__" or "constructor". Truthiness checks read the prototype
                        // (so no node is created, then ._errors.push throws), and bracket
                        // assignment of "__proto__" hits the setter instead of creating an
                        // own key. Guard the read with hasOwnProperty and create the node
                        // with defineProperty so any path element becomes a real own key.
                        if (!Object.prototype.hasOwnProperty.call(curr, el)) {
                            Object.defineProperty(curr, el, {
                                value: { _errors: [] },
                                enumerable: true,
                                writable: true,
                                configurable: true,
                            });
                        }
                        const node = curr[el];
                        if (terminal) {
                            node._errors.push(mapper(issue));
                        }
                        curr = node;
                        i++;
                    }
                }
            }
        }
    };
    processError(error);
    return fieldErrors;
}
function treeifyError(error, mapper = (issue) => issue.message) {
    const result = { errors: [] };
    const processError = (error, path = []) => {
        var _a;
        for (const issue of error.issues) {
            if (issue.code === "invalid_union" && issue.errors.length) {
                // regular union error
                issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
            }
            else if (issue.code === "invalid_key") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else if (issue.code === "invalid_element") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else {
                const fullpath = [...path, ...issue.path];
                if (fullpath.length === 0) {
                    result.errors.push(mapper(issue));
                    continue;
                }
                let curr = result;
                let i = 0;
                while (i < fullpath.length) {
                    const el = fullpath[i];
                    const terminal = i === fullpath.length - 1;
                    if (typeof el === "string") {
                        curr.properties ?? (curr.properties = {});
                        // el may collide with an inherited property name ("__proto__",
                        // "constructor", ...); ??= reads the prototype so the node is never
                        // created and curr.errors.push throws. Guard with hasOwnProperty and
                        // create the node with defineProperty so "__proto__" becomes a real
                        // own key rather than invoking the prototype setter.
                        if (!Object.prototype.hasOwnProperty.call(curr.properties, el)) {
                            Object.defineProperty(curr.properties, el, {
                                value: { errors: [] },
                                enumerable: true,
                                writable: true,
                                configurable: true,
                            });
                        }
                        curr = curr.properties[el];
                    }
                    else {
                        curr.items ?? (curr.items = []);
                        (_a = curr.items)[el] ?? (_a[el] = { errors: [] });
                        curr = curr.items[el];
                    }
                    if (terminal) {
                        curr.errors.push(mapper(issue));
                    }
                    i++;
                }
            }
        }
    };
    processError(error);
    return result;
}
/** Format a ZodError as a human-readable string in the following form.
 *
 * From
 *
 * ```ts
 * ZodError {
 *   issues: [
 *     {
 *       expected: 'string',
 *       code: 'invalid_type',
 *       path: [ 'username' ],
 *       message: 'Invalid input: expected string'
 *     },
 *     {
 *       expected: 'number',
 *       code: 'invalid_type',
 *       path: [ 'favoriteNumbers', 1 ],
 *       message: 'Invalid input: expected number'
 *     }
 *   ];
 * }
 * ```
 *
 * to
 *
 * ```
 * username
 *   ✖ Expected number, received string at "username
 * favoriteNumbers[0]
 *   ✖ Invalid input: expected number
 * ```
 */
function toDotPath(_path) {
    const segs = [];
    const path = _path.map((seg) => (typeof seg === "object" ? seg.key : seg));
    for (const seg of path) {
        if (typeof seg === "number")
            segs.push(`[${seg}]`);
        else if (typeof seg === "symbol")
            segs.push(`[${JSON.stringify(String(seg))}]`);
        else if (/[^\w$]/.test(seg))
            segs.push(`[${JSON.stringify(seg)}]`);
        else {
            if (segs.length)
                segs.push(".");
            segs.push(seg);
        }
    }
    return segs.join("");
}
function prettifyError(error) {
    const lines = [];
    // sort by path length
    const issues = [...error.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
    // Process each issue
    for (const issue of issues) {
        lines.push(`✖ ${issue.message}`);
        if (issue.path?.length)
            lines.push(`  → at ${toDotPath(issue.path)}`);
    }
    // Convert Map to formatted string
    return lines.join("\n");
}


/***/ }),

/***/ 72514:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $X: () => (/* binding */ readonlyProcessor),
/* harmony export */   $k: () => (/* binding */ optionalProcessor),
/* harmony export */   A: () => (/* binding */ prefaultProcessor),
/* harmony export */   A6: () => (/* binding */ customProcessor),
/* harmony export */   C0: () => (/* binding */ enumProcessor),
/* harmony export */   CN: () => (/* binding */ tupleProcessor),
/* harmony export */   Ec: () => (/* binding */ objectProcessor),
/* harmony export */   Fl: () => (/* binding */ dateProcessor),
/* harmony export */   Fs: () => (/* binding */ aggregateChecks),
/* harmony export */   GC: () => (/* binding */ recordProcessor),
/* harmony export */   In: () => (/* binding */ nullProcessor),
/* harmony export */   NV: () => (/* binding */ unknownProcessor),
/* harmony export */   NX: () => (/* binding */ anyProcessor),
/* harmony export */   Q9: () => (/* binding */ catchProcessor),
/* harmony export */   RH: () => (/* binding */ neverProcessor),
/* harmony export */   SW: () => (/* binding */ stringProcessor),
/* harmony export */   Tr: () => (/* binding */ lazyProcessor),
/* harmony export */   Wg: () => (/* binding */ numberProcessor),
/* harmony export */   Y8: () => (/* binding */ bigintProcessor),
/* harmony export */   Yv: () => (/* binding */ literalProcessor),
/* harmony export */   bl: () => (/* binding */ toJSONSchema),
/* harmony export */   cR: () => (/* binding */ nonoptionalProcessor),
/* harmony export */   cY: () => (/* binding */ arrayProcessor),
/* harmony export */   dO: () => (/* binding */ booleanProcessor),
/* harmony export */   fs: () => (/* binding */ pipeProcessor),
/* harmony export */   iC: () => (/* binding */ unionProcessor),
/* harmony export */   i_: () => (/* binding */ intersectionProcessor),
/* harmony export */   mh: () => (/* binding */ defaultProcessor),
/* harmony export */   xi: () => (/* binding */ transformProcessor),
/* harmony export */   yq: () => (/* binding */ nullableProcessor)
/* harmony export */ });
/* unused harmony exports symbolProcessor, undefinedProcessor, voidProcessor, nanProcessor, templateLiteralProcessor, fileProcessor, successProcessor, functionProcessor, mapProcessor, setProcessor, promiseProcessor, allProcessors */
/* harmony import */ var _regexes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(63983);
/* harmony import */ var _schemas_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(97385);
/* harmony import */ var _to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(75920);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24366);




const narrowMin = (agg, key, value) => {
    if (agg[key] === undefined || value > agg[key])
        agg[key] = value;
};
const narrowMax = (agg, key, value) => {
    if (agg[key] === undefined || value < agg[key])
        agg[key] = value;
};
const narrowBoth = (agg, value) => {
    narrowMin(agg, "minimum", value);
    narrowMax(agg, "maximum", value);
};
const addDivisor = (agg, value) => {
    agg.multipleOf ?? (agg.multipleOf = []);
    if (!agg.multipleOf.includes(value))
        agg.multipleOf.push(value);
};
const addPattern = (agg, pattern) => {
    agg.patterns ?? (agg.patterns = new Set());
    agg.patterns.add(pattern);
};
const intersectMime = (agg, mime) => {
    agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
// last-wins, matching the bag's historical write order; the flag keeps an integer format from being lost to a later float one
const setFormat = (agg, format) => {
    agg.format = format;
    if (format.includes("int"))
        agg.isInt = true;
};
const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
const formatContributor = (ranges) => (agg, def) => {
    setFormat(agg, def.format);
    const [minimum, maximum] = ranges[def.format];
    narrowMin(agg, "minimum", minimum);
    narrowMax(agg, "maximum", maximum);
};
const contributors = {
    greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
    less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
    multiple_of: (agg, def) => addDivisor(agg, def.value),
    number_format: formatContributor(_util_js__WEBPACK_IMPORTED_MODULE_0__/* .NUMBER_FORMAT_RANGES */ .zH),
    bigint_format: formatContributor(_util_js__WEBPACK_IMPORTED_MODULE_0__/* .BIGINT_FORMAT_RANGES */ .NR),
    min_length: minContributor,
    max_length: maxContributor,
    length_equals: (agg, def) => narrowBoth(agg, def.length),
    min_size: minContributor,
    max_size: maxContributor,
    size_equals: (agg, def) => narrowBoth(agg, def.size),
    string_format: (agg, def) => {
        setFormat(agg, def.format);
        if (def.pattern)
            addPattern(agg, def.pattern);
        if (def.format === "base64" || def.format === "base64url")
            agg.contentEncoding = def.format;
        if (def.local || def.precision === -1)
            agg.laxFormat = true;
    },
    mime_type: (agg, def) => intersectMime(agg, def.mime),
};
function aggregateChecks(schema) {
    const agg = {};
    const def = schema._zod.def;
    // a format schema is its own first check, same rule as $ZodType init
    const list = schema._zod.traits.has("$ZodCheck")
        ? [schema, ...(def.checks ?? [])]
        : (def.checks ?? []);
    for (const ch of list)
        contributors[ch._zod.def.check]?.(agg, ch._zod.def);
    // reconcile with the bag so third-party onattach contributions still land; first-party residue is never tighter than the fold, so merging it back is idempotent for one and additive for the other
    const bag = schema._zod.bag;
    if (bag.minimum !== undefined)
        narrowMin(agg, "minimum", bag.minimum);
    if (bag.exclusiveMinimum !== undefined)
        narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
    if (bag.maximum !== undefined)
        narrowMax(agg, "maximum", bag.maximum);
    if (bag.exclusiveMaximum !== undefined)
        narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
    if (bag.multipleOf !== undefined)
        addDivisor(agg, bag.multipleOf);
    if (bag.format !== undefined) {
        agg.format ?? (agg.format = bag.format);
        if (bag.format.includes("int"))
            agg.isInt = true;
    }
    if (bag.mime)
        intersectMime(agg, bag.mime);
    for (const pattern of bag.patterns ?? [])
        addPattern(agg, pattern);
    return agg;
}
const formatMap = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: "", // do not set
};
// ==================== SIMPLE TYPE PROCESSORS ====================
// the runtime patterns are lax so parse paths never overflow the regex stack; the emitted schema swaps in the exact block forms, which zod itself never executes
const exactPatterns = new Map([
    [_schemas_js__WEBPACK_IMPORTED_MODULE_1__/* .base64Charset */ .cq, _regexes_js__WEBPACK_IMPORTED_MODULE_2__/* .base64 */ .K3],
    [_schemas_js__WEBPACK_IMPORTED_MODULE_1__/* .base64urlCharset */ .xE, _regexes_js__WEBPACK_IMPORTED_MODULE_2__/* .base64url */ .r0],
]);
const exactPattern = (p) => exactPatterns.get(p) ?? p;
const stringProcessor = (schema, ctx, _json, _params) => {
    const json = _json;
    json.type = "string";
    const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
    if (typeof minimum === "number")
        json.minLength = minimum;
    if (typeof maximum === "number")
        json.maxLength = maximum;
    // custom pattern overrides format
    if (format) {
        json.format = formatMap[format] ?? format;
        if (json.format === "")
            delete json.format; // empty format is not valid
        // `z.iso.time()` is never full-time, and `laxFormat` carries the datetime shapes that also accept what their keyword forbids
        if (format === "time" || laxFormat) {
            delete json.format;
        }
    }
    if (contentEncoding)
        json.contentEncoding = contentEncoding;
    if (patterns && patterns.size > 0) {
        const patternList = [...patterns].map(exactPattern);
        if (patternList.length === 1)
            json.pattern = patternList[0].source;
        else if (patternList.length > 1) {
            json.allOf = [
                ...patternList.map((regex) => ({
                    ...(ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0"
                        ? { type: "string" }
                        : {}),
                    pattern: regex.source,
                })),
            ];
        }
    }
};
const numberProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
    json.type = isInt ? "integer" : "number";
    // when both minimum and exclusiveMinimum exist, pick the more restrictive one
    const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
    const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
    const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
    if (exMin) {
        if (legacy) {
            json.minimum = exclusiveMinimum;
            json.exclusiveMinimum = true;
        }
        else {
            json.exclusiveMinimum = exclusiveMinimum;
        }
    }
    else if (typeof minimum === "number") {
        json.minimum = minimum;
    }
    if (exMax) {
        if (legacy) {
            json.maximum = exclusiveMaximum;
            json.exclusiveMaximum = true;
        }
        else {
            json.exclusiveMaximum = exclusiveMaximum;
        }
    }
    else if (typeof maximum === "number") {
        json.maximum = maximum;
    }
    if (multipleOf) {
        // JSON Schema requires a divisor strictly greater than zero, and a non-finite one does not survive JSON at all. A negative divisor accepts exactly what its absolute value accepts, so it still maps; zero, NaN and Infinity have no keyword form.
        const divisors = new Set();
        for (const divisor of multipleOf) {
            if (Number.isFinite(divisor) && divisor !== 0)
                divisors.add(Math.abs(divisor));
            else
                (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
        }
        // chained divisors are a conjunction the keyword cannot carry alone, so extras ride an allOf, same as stacked patterns
        const [first, ...rest] = divisors;
        if (first !== undefined)
            json.multipleOf = first;
        if (rest.length)
            json.allOf = [...(json.allOf ?? []), ...rest.map((m) => ({ multipleOf: m }))];
    }
};
const booleanProcessor = (_schema, _ctx, json, _params) => {
    json.type = "boolean";
};
const bigintProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "BigInt cannot be represented in JSON Schema");
};
const symbolProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Symbols cannot be represented in JSON Schema");
};
const nullProcessor = (_schema, ctx, json, _params) => {
    if (ctx.target === "openapi-3.0") {
        json.type = "string";
        json.nullable = true;
        json.enum = [null];
    }
    else {
        json.type = "null";
    }
};
const undefinedProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Undefined cannot be represented in JSON Schema");
};
const voidProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Void cannot be represented in JSON Schema");
};
const neverProcessor = (_schema, _ctx, json, _params) => {
    json.not = {};
};
const anyProcessor = (_schema, _ctx, _json, _params) => {
    // empty schema accepts anything
};
const unknownProcessor = (_schema, _ctx, _json, _params) => {
    // empty schema accepts anything
};
const dateProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Date cannot be represented in JSON Schema");
};
const enumProcessor = (schema, _ctx, json, _params) => {
    const def = schema._zod.def;
    const values = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .getEnumValues */ .w5)(def.entries);
    // an empty enum accepts nothing, same as z.never()
    if (values.length === 0) {
        json.not = {};
        return;
    }
    // Number enums can have both string and number values
    if (values.every((v) => typeof v === "number"))
        json.type = "number";
    if (values.every((v) => typeof v === "string"))
        json.type = "string";
    json.enum = values;
};
const literalProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    // a literal with no values accepts nothing, same as z.never()
    if (def.values.length === 0) {
        json.not = {};
        return;
    }
    const vals = [];
    for (const val of def.values) {
        if (val === undefined) {
            // a custom schema replaces the whole literal, so there is nothing left to accumulate
            if ((0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema"))
                return;
            // otherwise do not add to vals
        }
        else if (typeof val === "bigint") {
            if ((0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema"))
                return;
            vals.push(Number(val));
        }
        else {
            vals.push(val);
        }
    }
    if (vals.length === 0) {
        // do nothing (an undefined literal was stripped)
    }
    else if (vals.length === 1) {
        const val = vals[0];
        json.type = val === null ? "null" : typeof val;
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
            json.enum = [val];
        }
        else {
            json.const = val;
        }
    }
    else {
        if (vals.every((v) => typeof v === "number"))
            json.type = "number";
        if (vals.every((v) => typeof v === "string"))
            json.type = "string";
        if (vals.every((v) => typeof v === "boolean"))
            json.type = "boolean";
        if (vals.every((v) => v === null))
            json.type = "null";
        json.enum = vals;
    }
};
const nanProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "NaN cannot be represented in JSON Schema");
};
const templateLiteralProcessor = (schema, _ctx, json, _params) => {
    const _json = json;
    const pattern = schema._zod.pattern;
    if (!pattern)
        throw new Error("Pattern not found in template literal");
    _json.type = "string";
    _json.pattern = pattern.source;
};
const fileProcessor = (schema, _ctx, json, _params) => {
    const _json = json;
    _json.type = "string";
    _json.format = "binary";
    _json.contentEncoding = "binary";
    const { minimum, maximum, mime } = aggregateChecks(schema);
    if (minimum !== undefined)
        _json.minLength = minimum;
    if (maximum !== undefined)
        _json.maxLength = maximum;
    if (!mime)
        return;
    // an empty intersection means the mime checks share no value, so nothing passes at runtime; `anyOf` must be non-empty, so the false schema is `not: {}`
    if (mime.length === 0)
        _json.not = {};
    else if (mime.length === 1)
        _json.contentMediaType = mime[0];
    // only contentMediaType differs, so the shared props stay at the root
    else
        _json.anyOf = mime.map((m) => ({ contentMediaType: m }));
};
const successProcessor = (_schema, _ctx, json, _params) => {
    json.type = "boolean";
};
const customProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
const functionProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Function types cannot be represented in JSON Schema");
};
const transformProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
const mapProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Map cannot be represented in JSON Schema");
};
const setProcessor = (schema, ctx, json, params) => {
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Set cannot be represented in JSON Schema");
};
// ==================== COMPOSITE TYPE PROCESSORS ====================
const arrayProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    const { minimum, maximum } = aggregateChecks(schema);
    if (typeof minimum === "number")
        json.minItems = minimum;
    if (typeof maximum === "number")
        json.maxItems = maximum;
    json.type = "array";
    json.items = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.element, ctx, {
        ...params,
        path: [...params.path, "items"],
    });
};
// Transform and catch set `optin = "optional"` at runtime so the parser lets them observe an
// absent key, but their declared input type stays required. An input JSON Schema describes the
// declared type, so resolve past them to the schema that actually carries the optionality.
// Used by both `objectProcessor` (for `required`) and `tupleProcessor` (for `minItems`); see
// wiki/optionality.md, "The JSON Schema emitter reads the *static* value".
function inputOptin(schema) {
    const def = schema._zod.def;
    if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) {
        return inputOptin(def.out);
    }
    if (def.type === "catch") {
        return inputOptin(def.innerType);
    }
    return schema._zod.optin;
}
const objectProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    const shape = def.shape;
    // dropping it while still emitting `additionalProperties: false` would emit a schema that rejects data this one requires
    const symbolKeys = Object.getOwnPropertySymbols(shape);
    if (symbolKeys.length &&
        (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) {
        return;
    }
    json.type = "object";
    json.properties = {};
    for (const key in shape) {
        // assignProp so a __proto__ key becomes an own property instead of hitting the inherited setter on the plain {} we build into
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .assignProp */ .Vy)(json.properties, key, (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(shape[key], ctx, {
            ...params,
            path: [...params.path, "properties", key],
        }));
    }
    // required keys
    const requiredKeys = [];
    for (const key of Object.keys(shape)) {
        const field = def.shape[key];
        if (ctx.io === "input" ? inputOptin(field) === undefined : field._zod.optout === undefined) {
            requiredKeys.push(key);
        }
    }
    if (requiredKeys.length > 0) {
        json.required = requiredKeys;
    }
    // catchall
    if (def.catchall?._zod.def.type === "never") {
        // strict
        json.additionalProperties = false;
    }
    else if (!def.catchall) {
        // regular
        if (ctx.io === "output")
            json.additionalProperties = false;
    }
    else if (def.catchall) {
        json.additionalProperties = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.catchall, ctx, {
            ...params,
            path: [...params.path, "additionalProperties"],
        });
    }
};
const unionProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    // Exclusive unions (inclusive === false) use oneOf (exactly one match) instead of anyOf (one or more matches). This includes both z.xor() and discriminated unions
    const isExclusive = def.inclusive === false;
    const options = def.options.map((x, i) => (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(x, ctx, {
        ...params,
        path: [...params.path, isExclusive ? "oneOf" : "anyOf", i],
    }));
    if (isExclusive) {
        json.oneOf = options;
    }
    else {
        json.anyOf = options;
    }
};
const intersectionProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    const a = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.left, ctx, {
        ...params,
        path: [...params.path, "allOf", 0],
    });
    const b = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.right, ctx, {
        ...params,
        path: [...params.path, "allOf", 1],
    });
    const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
    const allOf = [
        ...(isSimpleIntersection(a) ? a.allOf : [a]),
        ...(isSimpleIntersection(b) ? b.allOf : [b]),
    ];
    json.allOf = allOf;
    // Recorded innermost first, so a nested intersection has already folded by the time this one is considered. The array is the handle rather than the schema, because a wrapper that inherits this schema shares the same array; `finalize` folds every object holding it. See `foldIntersection`.
    ctx.intersections.push(allOf);
};
const tupleProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    json.type = "array";
    const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
    const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
    const prefixItems = def.items.map((x, i) => (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(x, ctx, {
        ...params,
        path: [...params.path, prefixPath, i],
    }));
    const rest = def.rest
        ? (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.rest, ctx, {
            ...params,
            path: [...params.path, restPath, ...(ctx.target === "openapi-3.0" ? [def.items.length] : [])],
        })
        : null;
    let minItems = def.items.length;
    while (minItems > 0) {
        const item = def.items[minItems - 1];
        const optional = ctx.io === "input" ? inputOptin(item) !== undefined : item._zod.optout === "optional";
        if (!optional)
            break;
        minItems--;
    }
    const maxItems = def.items.length;
    const isClosed = !def.rest;
    if (ctx.target === "draft-2020-12") {
        json.prefixItems = prefixItems;
        if (isClosed) {
            json.items = false;
        }
        else if (rest) {
            json.items = rest;
        }
        if (minItems > 0)
            json.minItems = minItems;
        if (isClosed)
            json.maxItems = maxItems;
    }
    else if (ctx.target === "openapi-3.0") {
        json.items = {
            anyOf: prefixItems,
        };
        if (rest) {
            json.items.anyOf.push(rest);
        }
        if (minItems > 0)
            json.minItems = minItems;
        if (isClosed)
            json.maxItems = maxItems;
    }
    else {
        json.items = prefixItems;
        if (isClosed) {
            json.additionalItems = false;
        }
        else if (rest) {
            json.additionalItems = rest;
        }
        if (minItems > 0)
            json.minItems = minItems;
        if (isClosed)
            json.maxItems = maxItems;
    }
    // explicit user-defined length checks take precedence
    const { minimum, maximum } = aggregateChecks(schema);
    if (typeof minimum === "number")
        json.minItems = minimum;
    if (typeof maximum === "number")
        json.maxItems = maximum;
};
/** JSON object keys are always strings, so a numeric record key schema is re-expressed over the
 * numeric-string form the record parser matches. Deferred to `finalize`, after the flatten: a key
 * behind a wrapper only carries its own `type` before then, and a union key only has its branches.
 *
 * A numeric bound cannot apply to a property name, so `minimum` and its siblings are dropped rather
 * than carried over: keeping them beside `type: "string"` reproduces the match-nothing schema this
 * exists to fix. A key that carries one therefore emits wider than the record parses — `z.record(z.number().min(5), V)`
 * accepts `"3"` — which is the deliberate trade, since throwing on it would reject an ordinary schema
 * outright. */
function stringifyKeyNames(bySchema, json, visited) {
    // an extracted key that rewrites cannot go on sharing its definition — the string form a key position needs is not the number form every other reference wants — so it inlines. One that does not rewrite keeps the `$ref`.
    if (json.$ref) {
        // a recursive key holds its own reference inside its definition, so a node already on the path is left alone rather than resolved again
        if (visited.has(json))
            return json;
        visited.add(json);
        const def = bySchema.get(json)?.def;
        if (!def)
            return json;
        const inlined = stringifyKeyNames(bySchema, def, visited);
        return inlined === def ? json : inlined;
    }
    for (const keyword of ["anyOf", "oneOf"]) {
        const branches = json[keyword];
        if (!Array.isArray(branches))
            continue;
        const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
        // rebuilding regardless would detach a key that had nothing to re-express, dropping its `$ref` and leaking the internal `id`
        if (mapped.some((branch, i) => branch !== branches[i]))
            json = { ...json, [keyword]: mapped };
    }
    // a member that already admits a string leaves the key unconstrained, so the node's own type re-expresses only when every member is numeric
    const types = Array.isArray(json.type) ? json.type : [json.type];
    const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
    // a heterogeneous key carries no type at all, so its numeric members are caught here instead
    const values = json.enum ?? (json.const !== undefined ? [json.const] : undefined);
    if (!numericType && !values?.some((v) => typeof v === "number"))
        return json;
    const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
    if (rest.enum)
        rest.enum = rest.enum.map((v) => (typeof v === "number" ? String(v) : v));
    else if (typeof rest.const === "number")
        rest.const = String(rest.const);
    // a heterogeneous key keeps its absent type: the stringified members already say what a key may be
    if (!numericType)
        return rest;
    rest.type = "string";
    if (!values)
        rest.pattern = (types.includes("number") ? _regexes_js__WEBPACK_IMPORTED_MODULE_2__/* .number */ .ai : _regexes_js__WEBPACK_IMPORTED_MODULE_2__/* .integer */ .nd).source;
    return rest;
}
/** Every record of one conversion, so the carriers are found in a single pass rather than once per record. */
const pendingRecords = new WeakMap();
function rewriteKeyNames(ctx) {
    // an extracted key is resolved by the object `extractToDef` left in its place, so the map is built once rather than searched per reference. `_zod.toJSONSchema` can hand the same object to two schemas, so the first entry carrying a body wins, as a search would have found it.
    const bySchema = new Map();
    for (const entry of ctx.seen.values()) {
        if (entry.def && !bySchema.has(entry.schema))
            bySchema.set(entry.schema, entry);
    }
    const rewrites = new Map();
    for (const record of pendingRecords.get(ctx) ?? []) {
        const seen = ctx.seen.get(record);
        const names = (seen?.def ?? seen?.schema)?.propertyNames;
        if (!names || names === true || rewrites.has(names))
            continue;
        const rewritten = stringifyKeyNames(bySchema, names, new Set());
        if (rewritten !== names)
            rewrites.set(names, rewritten);
    }
    if (!rewrites.size)
        return;
    // the flatten has already copied each record's own properties onto every wrapper by reference, and an extracted body is another such copy, so every carrier holding a rewritten key is updated together
    for (const entry of ctx.seen.values()) {
        for (const carrier of [entry.schema, entry.def]) {
            const rewritten = carrier && rewrites.get(carrier.propertyNames);
            if (rewritten)
                carrier.propertyNames = rewritten;
        }
    }
}
const recordProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    json.type = "object";
    // For looseRecord with regex patterns, use patternProperties. This correctly represents "only validate keys matching the pattern" semantics and composes well with allOf (intersections)
    const keyType = def.keyType;
    const patterns = aggregateChecks(keyType).patterns;
    if (def.mode === "loose" && patterns && patterns.size > 0) {
        // Use patternProperties for looseRecord with regex patterns
        const valueSchema = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.valueType, ctx, {
            ...params,
            path: [...params.path, "patternProperties", "*"],
        });
        json.patternProperties = {};
        for (const pattern of patterns) {
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .assignProp */ .Vy)(json.patternProperties, exactPattern(pattern).source, valueSchema);
        }
    }
    else {
        // Default behavior: use propertyNames + additionalProperties
        if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
            json.propertyNames = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.keyType, ctx, {
                ...params,
                path: [...params.path, "propertyNames"],
            });
            let pending = pendingRecords.get(ctx);
            if (!pending) {
                pending = [];
                pendingRecords.set(ctx, pending);
                ctx.deferred.push(() => rewriteKeyNames(ctx));
            }
            pending.push(schema);
        }
        json.additionalProperties = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.valueType, ctx, {
            ...params,
            path: [...params.path, "additionalProperties"],
        });
    }
    // Add required for keys with discrete values (enum, literal, etc.)
    const keyValues = keyType._zod.values;
    // Every key shares one value schema, so an optional-in value makes the whole key set omittable on input. Output keeps them: the exhaustive branch assigns every key, even one whose value came back undefined.
    const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== undefined;
    if (keyValues && !def.partial && !omittableOnInput) {
        const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
        if (validKeyValues.length > 0) {
            json.required = validKeyValues.map(String);
        }
    }
};
const nullableProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    const inner = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    if (ctx.target === "openapi-3.0") {
        seen.ref = def.innerType;
        json.nullable = true;
    }
    else {
        json.anyOf = [inner, { type: "null" }];
    }
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
};
/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
 * A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
 * unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
const UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
    let unrepresentable = false;
    const serialized = JSON.stringify(value, (_, val) => {
        if (typeof val !== "bigint")
            return val;
        unrepresentable = true;
        return null;
    });
    if (!unrepresentable)
        return JSON.parse(serialized);
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
    return UNREPRESENTABLE_DEFAULT;
}
const defaultProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
    if (value !== UNREPRESENTABLE_DEFAULT)
        json.default = value;
};
const prefaultProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    if (ctx.io !== "input")
        return;
    const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
    if (value !== UNREPRESENTABLE_DEFAULT)
        json._prefault = value;
};
const catchProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    let catchValue;
    try {
        catchValue = def.catchValue(undefined);
    }
    catch {
        (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .handleUnrepresentable */ ._S)(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
        return;
    }
    json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    const inIsTransform = def.in._zod.traits.has("$ZodTransform");
    const innerType = ctx.io === "input" ? (inIsTransform ? def.out : def.in) : def.out;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    json.readOnly = true;
};
const promiseProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
};
const optionalProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
};
const lazyProcessor = (schema, ctx, _json, params) => {
    const innerType = schema._zod.innerType;
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = innerType;
};
// ==================== ALL PROCESSORS ====================
const allProcessors = {
    string: stringProcessor,
    number: numberProcessor,
    boolean: booleanProcessor,
    bigint: bigintProcessor,
    symbol: symbolProcessor,
    null: nullProcessor,
    undefined: undefinedProcessor,
    void: voidProcessor,
    never: neverProcessor,
    any: anyProcessor,
    unknown: unknownProcessor,
    date: dateProcessor,
    enum: enumProcessor,
    literal: literalProcessor,
    nan: nanProcessor,
    template_literal: templateLiteralProcessor,
    file: fileProcessor,
    success: successProcessor,
    custom: customProcessor,
    function: functionProcessor,
    transform: transformProcessor,
    map: mapProcessor,
    set: setProcessor,
    array: arrayProcessor,
    object: objectProcessor,
    union: unionProcessor,
    intersection: intersectionProcessor,
    tuple: tupleProcessor,
    record: recordProcessor,
    nullable: nullableProcessor,
    nonoptional: nonoptionalProcessor,
    default: defaultProcessor,
    prefault: prefaultProcessor,
    catch: catchProcessor,
    pipe: pipeProcessor,
    readonly: readonlyProcessor,
    promise: promiseProcessor,
    optional: optionalProcessor,
    lazy: lazyProcessor,
};
function toJSONSchema(input, params) {
    if ("_idmap" in input) {
        // Registry case
        const registry = input;
        const ctx = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .initializeContext */ .az)({ ...params, processors: allProcessors });
        const defs = {};
        // First pass: process all schemas to build the seen map
        for (const entry of registry._idmap.entries()) {
            const [_, schema] = entry;
            (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(schema, ctx);
        }
        const schemas = {};
        const external = {
            registry,
            uri: params?.uri,
            defs,
        };
        // Update the context with external configuration
        ctx.external = external;
        // Second pass: emit each schema
        for (const entry of registry._idmap.entries()) {
            const [key, schema] = entry;
            (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .extractDefs */ .Wb)(ctx, schema);
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .assignProp */ .Vy)(schemas, key, (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .finalize */ .jE)(ctx, schema));
        }
        if (Object.keys(defs).length > 0) {
            const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
            schemas.__shared = {
                [defsSegment]: defs,
            };
        }
        return { schemas };
    }
    // Single schema case
    const ctx = (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .initializeContext */ .az)({ ...params, processors: allProcessors });
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .processSchema */ .Lp)(input, ctx);
    (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .extractDefs */ .Wb)(ctx, input);
    return (0,_to_json_schema_js__WEBPACK_IMPORTED_MODULE_3__/* .finalize */ .jE)(ctx, input);
}


/***/ }),

/***/ 96735:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EJ: () => (/* binding */ parseAsync),
/* harmony export */   F0: () => (/* binding */ validateAsync),
/* harmony export */   GW: () => (/* binding */ _encodeAsync),
/* harmony export */   Mv: () => (/* binding */ _encode),
/* harmony export */   Od: () => (/* binding */ _safeParse),
/* harmony export */   R3: () => (/* binding */ _safeDecodeAsync),
/* harmony export */   Rb: () => (/* binding */ _parseAsync),
/* harmony export */   Tj: () => (/* binding */ _parse),
/* harmony export */   VS: () => (/* binding */ _safeDecode),
/* harmony export */   bp: () => (/* binding */ safeParseAsync),
/* harmony export */   e2: () => (/* binding */ _decode),
/* harmony export */   or: () => (/* binding */ _decodeAsync),
/* harmony export */   qg: () => (/* binding */ parse),
/* harmony export */   rh: () => (/* binding */ _safeEncode),
/* harmony export */   tf: () => (/* binding */ validate),
/* harmony export */   v_: () => (/* binding */ _safeEncodeAsync),
/* harmony export */   wG: () => (/* binding */ _safeParseAsync),
/* harmony export */   xL: () => (/* binding */ safeParse)
/* harmony export */ });
/* unused harmony exports encode, decode, encodeAsync, decodeAsync, safeEncode, safeDecode, safeEncodeAsync, safeDecodeAsync */
/* harmony import */ var _core_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48149);
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(89053);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(24366);



// Always both keys, so the `_params` read site in `_parse` sees one object shape rather than two.
function finalizeParams(callee, params) {
    return { callee: params?.callee ?? callee, Err: params?.Err };
}
const _parse = (_Err) => {
    const fn = (schema, value, _ctx, _params) => {
        const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
        const result = schema._zod.run({ value, issues: [] }, ctx);
        if (result instanceof Promise) {
            throw new _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$ZodAsyncError */ .GT();
        }
        if (result.issues.length) {
            const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => _util_js__WEBPACK_IMPORTED_MODULE_1__/* .finalizeIssue */ .iR(iss, ctx, _core_js__WEBPACK_IMPORTED_MODULE_0__/* .config */ .$W())));
            _util_js__WEBPACK_IMPORTED_MODULE_1__/* .captureStackTrace */ .gx(e, _params?.callee ?? fn);
            throw e;
        }
        return result.value;
    };
    return fn;
};
const parse = /* @__PURE__*/ _parse(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _parseAsync = (_Err) => {
    const fn = async (schema, value, _ctx, params) => {
        const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
        let result = schema._zod.run({ value, issues: [] }, ctx);
        if (result instanceof Promise)
            result = await result;
        if (result.issues.length) {
            const e = new (params?.Err ?? _Err)(result.issues.map((iss) => _util_js__WEBPACK_IMPORTED_MODULE_1__/* .finalizeIssue */ .iR(iss, ctx, _core_js__WEBPACK_IMPORTED_MODULE_0__/* .config */ .$W())));
            _util_js__WEBPACK_IMPORTED_MODULE_1__/* .captureStackTrace */ .gx(e, params?.callee ?? fn);
            throw e;
        }
        return result.value;
    };
    return fn;
};
const parseAsync = /* @__PURE__*/ _parseAsync(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _safeParse = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$ZodAsyncError */ .GT();
    }
    return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
};
const safeParse = /* @__PURE__*/ _safeParse(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
// the error is built on the first read of `error`: finalizing the issues and constructing the instance is most of a failing parse, and a caller that only branches on `success` never pays it. a getter in the literal keeps this small; the alternative, one shared accessor descriptor plus a hidden state slot, reads ~15% faster but costs ~75 B gzipped in every bundle
function failure(Err, issues, ctx) {
    let error;
    return {
        success: false,
        get error() {
            if (!error) {
                error = new Err(issues.map((iss) => _util_js__WEBPACK_IMPORTED_MODULE_1__/* .finalizeIssue */ .iR(iss, ctx, _core_js__WEBPACK_IMPORTED_MODULE_0__/* .config */ .$W())));
                // finalizeIssue drops `input`, so the built error holds nothing; keeping the raw issues past this point pins the parsed value for the life of the result
                issues = undefined;
                ctx = undefined;
            }
            return error;
        },
        set error(e) {
            error = e;
            // a replacement makes the getter's branch unreachable, so the captures have to go here too
            issues = undefined;
            ctx = undefined;
        },
    };
}
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
};
const safeParseAsync = /* @__PURE__*/ _safeParseAsync(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
// registry mirrors of the compiler's sentinels, so this module never imports the compiler
const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
// Deliberately tiny, because v8 will not inline a body carrying the fallback's object literals and throw. Everything that is not the compiled happy path lives in validateFallback, and that split is worth ~35% on a compiled schema.
const validate = ((schema, value, _ctx) => {
    const validator = schema._zod.bag.validator;
    if (validator !== undefined) {
        if (validator(value) !== COMPILE_INVALID)
            return true;
        // a definite sentinel means the runtime would reject, so skip the re-parse; a ctx can still change the answer
        if (validator.definite === true && _ctx === undefined)
            return false;
    }
    return validateFallback(schema, value, _ctx);
});
function validateFallback(schema, value, _ctx) {
    const ctx = _ctx
        ? { ..._ctx, async: false, abortEarly: true }
        : { async: false, abortEarly: true };
    const fallbackRun = schema._zod.bag.fallbackRun;
    let result;
    if (fallbackRun) {
        // skip nested fast paths on the fallback, so user callbacks keep the at-most-twice bound
        ctx[COMPILE_FALLBACK] = true;
        result = fallbackRun({ value, issues: [] }, ctx);
    }
    else {
        result = schema._zod.run({ value, issues: [] }, ctx);
    }
    if (result instanceof Promise) {
        throw new _core_js__WEBPACK_IMPORTED_MODULE_0__/* .$ZodAsyncError */ .GT();
    }
    return result.issues.length === 0;
}
// no fast path: the compiler keeps async parses on the runtime, because a promise-returning callback that is not declared async compiles to a throw
const validateAsync = async (schema, value, _ctx) => {
    const ctx = _ctx
        ? { ..._ctx, async: true, abortEarly: true }
        : { async: true, abortEarly: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    return result.issues.length === 0;
};
const _encode = (_Err) => {
    const parse = _parse(_Err);
    const fn = (schema, value, _ctx, _params) => {
        const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
        return parse(schema, value, ctx, finalizeParams(fn, _params));
    };
    return fn;
};
const encode = /* @__PURE__*/ _encode(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _decode = (_Err) => {
    const parse = _parse(_Err);
    const fn = (schema, value, _ctx, _params) => {
        return parse(schema, value, _ctx, finalizeParams(fn, _params));
    };
    return fn;
};
const decode = /* @__PURE__*/ _decode(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _encodeAsync = (_Err) => {
    const parseAsync = _parseAsync(_Err);
    const fn = async (schema, value, _ctx, _params) => {
        const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
        return (await parseAsync(schema, value, ctx, finalizeParams(fn, _params)));
    };
    return fn;
};
const encodeAsync = /* @__PURE__*/ _encodeAsync(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _decodeAsync = (_Err) => {
    const parseAsync = _parseAsync(_Err);
    const fn = async (schema, value, _ctx, _params) => {
        return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
    };
    return fn;
};
const decodeAsync = /* @__PURE__*/ _decodeAsync(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _safeEncode = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return _safeParse(_Err)(schema, value, ctx);
};
const safeEncode = /* @__PURE__*/ _safeEncode(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _safeDecode = (_Err) => (schema, value, _ctx) => {
    return _safeParse(_Err)(schema, value, _ctx);
};
const safeDecode = /* @__PURE__*/ _safeDecode(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return _safeParseAsync(_Err)(schema, value, ctx);
};
const safeEncodeAsync = /* @__PURE__*/ _safeEncodeAsync(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
    return _safeParseAsync(_Err)(schema, value, _ctx);
};
const safeDecodeAsync = /* @__PURE__*/ _safeDecodeAsync(_errors_js__WEBPACK_IMPORTED_MODULE_2__/* .$ZodRealError */ .Kd);


/***/ }),

/***/ 63983:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AC: () => (/* binding */ lowercase),
/* harmony export */   Ak: () => (/* binding */ nanoid),
/* harmony export */   D2: () => (/* binding */ nanoidOfLength),
/* harmony export */   F: () => (/* binding */ httpProtocol),
/* harmony export */   Gl: () => (/* binding */ cuid2),
/* harmony export */   K3: () => (/* binding */ base64),
/* harmony export */   Os: () => (/* binding */ guid),
/* harmony export */   Rp: () => (/* binding */ email),
/* harmony export */   Z0: () => (/* binding */ ulid),
/* harmony export */   Zg: () => (/* binding */ emoji),
/* harmony export */   Zv: () => (/* binding */ uppercase),
/* harmony export */   ai: () => (/* binding */ number),
/* harmony export */   ch: () => (/* binding */ _null),
/* harmony export */   fO: () => (/* binding */ ksuid),
/* harmony export */   gF: () => (/* binding */ cuid),
/* harmony export */   gp: () => (/* binding */ anyString),
/* harmony export */   hQ: () => (/* binding */ e164),
/* harmony export */   kB: () => (/* binding */ time),
/* harmony export */   kM: () => (/* binding */ xid),
/* harmony export */   l7: () => (/* binding */ cidrv6),
/* harmony export */   nd: () => (/* binding */ integer),
/* harmony export */   o: () => (/* binding */ bigint),
/* harmony export */   p0: () => (/* binding */ duration),
/* harmony export */   p6: () => (/* binding */ date),
/* harmony export */   r0: () => (/* binding */ base64url),
/* harmony export */   uR: () => (/* binding */ uuid),
/* harmony export */   uX: () => (/* binding */ ipv4),
/* harmony export */   ug: () => (/* binding */ ipv6),
/* harmony export */   w$: () => (/* binding */ datetime),
/* harmony export */   zM: () => (/* binding */ boolean),
/* harmony export */   zr: () => (/* binding */ cidrv4)
/* harmony export */ });
/* unused harmony exports extendedDuration, uuid4, uuid6, uuid7, html5Email, rfc5322Email, unicodeEmail, idnEmail, browserEmail, mac, hostname, domain, creditCard, currencyCode, iban, string, undefined, hex, md5_hex, md5_base64, md5_base64url, sha1_hex, sha1_base64, sha1_base64url, sha256_hex, sha256_base64, sha256_base64url, sha384_hex, sha384_base64, sha384_base64url, sha512_hex, sha512_base64, sha512_base64url */

/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
    return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** Implements ISO 8601-2 extensions like explicit +- prefixes, mixing weeks with other units, and fractional/negative components. */
const extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
    if (!version)
        return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
    return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
const uuid4 = /*@__PURE__*/ (/* unused pure expression or super */ null && (uuid(4)));
const uuid6 = /*@__PURE__*/ (/* unused pure expression or super */ null && (uuid(6)));
const uuid7 = /*@__PURE__*/ (/* unused pure expression or super */ null && (uuid(7)));
/** Practical email validation */
const email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
/** Equivalent to the HTML5 input[type=email] validation implemented by browsers. Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email */
const html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/** The classic emailregex.com regex for RFC 5322-compliant emails */
const rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/** A loose regex that allows Unicode characters, enforces length limits, and that's about it. */
const unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
const idnEmail = (/* unused pure expression or super */ null && (unicodeEmail));
const browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
// Single character class, not an alternation: the two properties overlap (U+1F9B0-U+1F9B3), so `(A|B)+` backtracks exponentially on a failed match. The leading lookahead then demands one anchor — a pictograph, a regional indicator, or the enclosing keycap — because `\p{Emoji_Component}` on its own covers ASCII digits, `#`, `*`, ZWJ, variation selectors and skin tone modifiers, none of which is an emoji without a base.
const _emoji = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
    return new RegExp(_emoji, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const mac = (delimiter) => {
    const escapedDelim = util.escapeRegex(delimiter ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
};
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
// export const hostname: RegExp = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
const hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
const domain = /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
const httpProtocol = /^https?$/;
// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces) E.164: leading digit must be 1-9; total digits (excluding '+') between 7-15
const e164 = /^\+[1-9]\d{6,14}$/;
// Credit card shape: 12–19 digits, optionally separated by single spaces or single hyphens. ISO/IEC 7812 caps the PAN at 19 digits; 12 is the shortest issued length (Maestro).
const creditCard = /^\d(?:[ -]?\d){11,18}$/;
// ISO 4217 alpha codes from the SIX list, regenerated by scripts/update-iso-4217.ts
const currencyCode = /^(?:AED|AFN|ALL|AMD|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BHD|BIF|BMD|BND|BOB|BOV|BRL|BSD|BTN|BWP|BYN|BZD|CAD|CDF|CHE|CHF|CHW|CLF|CLP|CNY|COP|COU|CRC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|GBP|GEL|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HTG|HUF|IDR|ILS|INR|IQD|IRR|ISK|JMD|JOD|JPY|KES|KGS|KHR|KMF|KPW|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LSL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRU|MUR|MVR|MWK|MXN|MXV|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RSD|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|SLE|SOS|SRD|SSP|STN|SVC|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TWD|TZS|UAH|UGX|USD|USN|UYI|UYU|UYW|UZS|VED|VES|VND|VUV|WST|XAD|XAF|XAG|XAU|XBA|XBB|XBC|XBD|XCD|XCG|XDR|XOF|XPD|XPF|XPT|XSU|XTS|XUA|XXX|YER|ZAR|ZMW|ZWG)$/;
// iban electronic format: 2-letter country, check digits 02-98 (the only values `98 - remainder` can produce), 11-30 bban characters
const iban = /^[A-Z]{2}(?!00|01|99)\d{2}[A-Z0-9]{11,30}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
/** Anchors a pattern source. The interpolation lives here rather than at the call site because
 * esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
 * will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
function anchor(source) {
    return new RegExp(`^${source}$`);
}
const date = /*@__PURE__*/ anchor(dateSource);
function timeSource(args) {
    const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
    const regex = typeof args.precision === "number"
        ? args.precision === -1
            ? `${hhmm}`
            : args.precision === 0
                ? `${hhmm}:[0-5]\\d`
                : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`
        : args.seconds
            ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?`
            : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
    return regex;
}
function time(args) {
    return new RegExp(`^${timeSource(args)}$`);
}
// Adapted from https://stackoverflow.com/a/3143231
function datetime(args) {
    const opts = ["Z"];
    // if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`);
    if (args.offset)
        opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
    // RFC 3339 mandates seconds wherever the time carries a `Z` or an offset, so only the unqualified form `local` adds may omit them
    const qualified = `${timeSource({ precision: args.precision, seconds: true })}(?:${opts.join("|")})`;
    const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
    return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
// the unbounded form of `string()` as a literal, so every plain string shares one instance instead of building its own
const anyString = /^[\s\S]{0,}$/;
const string = (params) => {
    const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
    return new RegExp(`^${regex}$`);
};
const bigint = /^-?\d+n?$/;
const integer = /^-?\d+$/;
const number = /^-?\d+(?:\.\d+)?$/;
const boolean = /^(?:true|false)$/i;
const _null = /^null$/i;

const _undefined = /^undefined$/i;

// regex for string with no uppercase letters
const lowercase = /^[^A-Z]*$/;
// regex for string with no lowercase letters
const uppercase = /^[^a-z]*$/;
// regex for hexadecimal strings (any length)
const hex = /^[0-9a-fA-F]*$/;
// Hash regexes for different algorithms and encodings
// Helper function to create base64 regex with exact length and padding
function fixedBase64(bodyLength, padding) {
    return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}
// Helper function to create base64url regex with exact length (no padding)
function fixedBase64url(length) {
    return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
}
// MD5 (16 bytes): base64 = 24 chars total (22 + "==")
const md5_hex = /^[0-9a-fA-F]{32}$/;
const md5_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(22, "==")));
const md5_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(22)));
// SHA1 (20 bytes): base64 = 28 chars total (27 + "=")
const sha1_hex = /^[0-9a-fA-F]{40}$/;
const sha1_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(27, "=")));
const sha1_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(27)));
// SHA256 (32 bytes): base64 = 44 chars total (43 + "=")
const sha256_hex = /^[0-9a-fA-F]{64}$/;
const sha256_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(43, "=")));
const sha256_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(43)));
// SHA384 (48 bytes): base64 = 64 chars total (no padding)
const sha384_hex = /^[0-9a-fA-F]{96}$/;
const sha384_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(64, "")));
const sha384_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(64)));
// SHA512 (64 bytes): base64 = 88 chars total (86 + "==")
const sha512_hex = /^[0-9a-fA-F]{128}$/;
const sha512_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(86, "==")));
const sha512_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(86)));


/***/ }),

/***/ 56045:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fd: () => (/* binding */ globalRegistry)
/* harmony export */ });
/* unused harmony exports $output, $input, $ZodRegistry, registry */
var _a;
const $output = /*@__PURE__*/ (/* unused pure expression or super */ null && (Symbol("ZodOutput")));
const $input = /*@__PURE__*/ (/* unused pure expression or super */ null && (Symbol("ZodInput")));
class $ZodRegistry {
    constructor() {
        this._map = new WeakMap();
        this._idmap = new Map();
    }
    add(schema, ..._meta) {
        const meta = _meta[0];
        this._map.set(schema, meta);
        if (meta && typeof meta === "object" && "id" in meta) {
            this._idmap.set(meta.id, schema);
        }
        return this;
    }
    clear() {
        this._map = new WeakMap();
        this._idmap = new Map();
        return this;
    }
    remove(schema) {
        const meta = this._map.get(schema);
        if (meta && typeof meta === "object" && "id" in meta) {
            this._idmap.delete(meta.id);
        }
        this._map.delete(schema);
        return this;
    }
    get(schema) {
        // return this._map.get(schema) as any;
        // inherit metadata
        const p = schema._zod.parent;
        if (p) {
            const pm = { ...(this.get(p) ?? {}) };
            delete pm.id; // do not inherit id
            const f = { ...pm, ...this._map.get(schema) };
            return Object.keys(f).length ? f : undefined;
        }
        return this._map.get(schema);
    }
    has(schema) {
        return this._map.has(schema);
    }
}
// registries
function registry() {
    return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;


/***/ }),

/***/ 97385:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Gb: () => (/* binding */ $ZodAny),
  $p: () => (/* binding */ $ZodArray),
  Dq: () => (/* binding */ $ZodBase64),
  CQ: () => (/* binding */ $ZodBase64URL),
  BN: () => (/* binding */ $ZodBigInt),
  sF: () => (/* binding */ $ZodBoolean),
  CI: () => (/* binding */ $ZodCIDRv4),
  Cn: () => (/* binding */ $ZodCIDRv6),
  bl: () => (/* binding */ $ZodCUID),
  Zu: () => (/* binding */ $ZodCUID2),
  t$: () => (/* binding */ $ZodCatch),
  b0: () => (/* binding */ $ZodCustom),
  o5: () => (/* binding */ $ZodDate),
  rv: () => (/* binding */ $ZodDefault),
  P0: () => (/* binding */ $ZodDiscriminatedUnion),
  Oy: () => (/* binding */ $ZodE164),
  qG: () => (/* binding */ $ZodEmail),
  cG: () => (/* binding */ $ZodEmoji),
  VO: () => (/* binding */ $ZodEnum),
  RL: () => (/* binding */ $ZodExactOptional),
  Zc: () => (/* binding */ $ZodGUID),
  Lc: () => (/* binding */ $ZodIPv4),
  Zy: () => (/* binding */ $ZodIPv6),
  v1: () => (/* binding */ $ZodISODate),
  Ko: () => (/* binding */ $ZodISODateTime),
  $N: () => (/* binding */ $ZodISODuration),
  Ax: () => (/* binding */ $ZodISOTime),
  LJ: () => (/* binding */ $ZodIntersection),
  h8: () => (/* binding */ $ZodJWT),
  GY: () => (/* binding */ $ZodKSUID),
  kU: () => (/* binding */ $ZodLazy),
  nu: () => (/* binding */ $ZodLiteral),
  Py: () => (/* binding */ $ZodNanoID),
  Um: () => (/* binding */ $ZodNever),
  N$: () => (/* binding */ $ZodNonOptional),
  x8: () => (/* binding */ $ZodNull),
  qc: () => (/* binding */ $ZodNullable),
  vz: () => (/* binding */ $ZodNumber),
  I: () => (/* binding */ $ZodNumberFormat),
  L8: () => (/* binding */ $ZodObject),
  w: () => (/* binding */ $ZodObjectJIT),
  ig: () => (/* binding */ $ZodOptional),
  _m: () => (/* binding */ $ZodPipe),
  VF: () => (/* binding */ $ZodPrefault),
  Sb: () => (/* binding */ $ZodReadonly),
  h: () => (/* binding */ $ZodRecord),
  $v: () => (/* binding */ $ZodString),
  EY: () => (/* binding */ $ZodStringFormat),
  Wc: () => (/* binding */ $ZodTransform),
  G3: () => (/* binding */ $ZodTuple),
  W4: () => (/* binding */ $ZodType),
  g5: () => (/* binding */ $ZodULID),
  VY: () => (/* binding */ $ZodURL),
  Zn: () => (/* binding */ $ZodUUID),
  cu: () => (/* binding */ $ZodUnion),
  GP: () => (/* binding */ $ZodUnknown),
  TF: () => (/* binding */ $ZodXID),
  cq: () => (/* binding */ base64Charset),
  xE: () => (/* binding */ base64urlCharset),
  YK: () => (/* binding */ standardProps)
});

// UNUSED EXPORTS: $ZodBigIntFormat, $ZodCodec, $ZodCreditCard, $ZodCustomStringFormat, $ZodFile, $ZodFunction, $ZodIBAN, $ZodMAC, $ZodMap, $ZodNaN, $ZodPreprocess, $ZodPromise, $ZodSet, $ZodSuccess, $ZodSymbol, $ZodTemplateLiteral, $ZodUndefined, $ZodVoid, $ZodXor, URL_BAD_FORMAT, URL_UNPARSEABLE, canParseURL, clone, getDiscriminatedOption, isValidBase64, isValidBase64URL, isValidCIDRv6, isValidCreditCard, isValidIBAN, isValidIPv6, isValidJWT, mergeValues, parseURLObject, stripTabAndNewline, urlHostnameOk, urlProtocolOk, validateURL

// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/checks.js
var core_checks = __webpack_require__(5519);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/core.js
var core_core = __webpack_require__(48149);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/doc.js
class Doc {
    constructor(args = [], closed = {}) {
        this.content = [];
        this.indent = 0;
        this.args = args;
        this.closed = closed;
    }
    // the compiler catches a child's throw and keeps writing into this doc, so the indent has to unwind with it
    indented(fn) {
        this.indent += 1;
        try {
            fn(this);
        }
        finally {
            this.indent -= 1;
        }
    }
    write(arg) {
        if (typeof arg === "function") {
            arg(this, { execution: "sync" });
            arg(this, { execution: "async" });
            return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
            this.content.push(line);
        }
    }
    compile() {
        const F = Function;
        const content = this?.content ?? [``];
        const factory = new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`);
        return factory(...Object.values(this.closed));
    }
}

// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/regexes.js
var core_regexes = __webpack_require__(63983);
// EXTERNAL MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/util.js
var core_util = __webpack_require__(24366);
;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/versions.js
const version = {
    major: 4,
    minor: 6,
    patch: 7,
};

;// CONCATENATED MODULE: ../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/schemas.js







const $ZodType = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.def = def; // set _def property
    inst._zod.bag = inst._zod.bag || {}; // initialize _bag object
    inst._zod.version = version;
    const defChecks = inst._zod.def.checks;
    // if inst is itself a checks.$ZodCheck, run it as a check
    const checks = inst._zod.traits.has("$ZodCheck")
        ? [inst, ...(defChecks ?? [])]
        : defChecks?.length
            ? [...defChecks]
            : [];
    for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
            fn(inst);
        }
    }
    if (checks.length === 0) {
        // deferred initializer inst._zod.parse is not yet defined
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred?.push(() => {
            inst._zod.run = inst._zod.parse;
        });
    }
    else {
        const runChecks = (payload, checks, ctx) => {
            if (payload.memo)
                return payload;
            let isAborted = core_util/* aborted */.QH(payload);
            let asyncResult;
            for (const ch of checks) {
                if (ch._zod.def.when) {
                    if (core_util/* explicitlyAborted */.rL(payload))
                        continue;
                    const shouldRun = ch._zod.def.when(payload);
                    if (!shouldRun)
                        continue;
                }
                else if (isAborted) {
                    continue;
                }
                const currLen = payload.issues.length;
                const _ = ch._zod.check(payload);
                if (_ instanceof Promise && ctx?.async === false) {
                    throw new core_core/* $ZodAsyncError */.GT();
                }
                if (asyncResult || _ instanceof Promise) {
                    asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                        await _;
                        const nextLen = payload.issues.length;
                        if (nextLen === currLen)
                            return;
                        core_util/* attachSchema */.d3(payload.issues, currLen, inst);
                        if (!isAborted)
                            isAborted = core_util/* aborted */.QH(payload, currLen);
                    });
                }
                else {
                    const nextLen = payload.issues.length;
                    if (nextLen === currLen)
                        continue;
                    core_util/* attachSchema */.d3(payload.issues, currLen, inst);
                    if (!isAborted)
                        isAborted = core_util/* aborted */.QH(payload, currLen);
                }
            }
            if (asyncResult) {
                return asyncResult.then(() => {
                    return payload;
                });
            }
            return payload;
        };
        const handleCanaryResult = (canary, payload, ctx) => {
            // abort if the canary is aborted
            if (core_util/* aborted */.QH(canary)) {
                canary.aborted = true;
                return canary;
            }
            // run checks first, then
            const checkResult = runChecks(payload, checks, ctx);
            if (checkResult instanceof Promise) {
                if (ctx.async === false)
                    throw new core_core/* $ZodAsyncError */.GT();
                return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
            }
            return inst._zod.parse(checkResult, ctx);
        };
        inst._zod.run = (payload, ctx) => {
            if (ctx.skipChecks) {
                return inst._zod.parse(payload, ctx);
            }
            if (ctx.direction === "backward") {
                // run canary initial pass (no checks)
                const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
                if (canary instanceof Promise) {
                    return canary.then((canary) => {
                        return handleCanaryResult(canary, payload, ctx);
                    });
                }
                return handleCanaryResult(canary, payload, ctx);
            }
            // forward
            const result = inst._zod.parse(payload, ctx);
            if (result instanceof Promise) {
                if (ctx.async === false)
                    throw new core_core/* $ZodAsyncError */.GT();
                return result.then((result) => runChecks(result, checks, ctx));
            }
            return runChecks(result, checks, ctx);
        };
    }
}, {
    // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
    get "~standard"() {
        return core_util/* hide */.jD(this, "~standard", standardProps(this));
    },
    set "~standard"(value) {
        core_util/* own */.qh(this, "~standard", value);
    },
});
/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
// a Standard Schema result only reports issues, so a failure finalizes them straight off the raw payload: no ZodError, and no lazy result to read through
const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => core_util/* finalizeIssue */.iR(iss, ctx, core_core/* config */.$W())) } : { value: r.value };
async function validateAsync(inst, value) {
    const ctx = { async: true };
    return toStandardResult((await inst._zod.run({ value, issues: [] }, ctx)), ctx);
}
function standardProps(inst) {
    return {
        validate: (value) => {
            const ctx = { async: false };
            try {
                const r = inst._zod.run({ value, issues: [] }, ctx);
                if (!(r instanceof Promise))
                    return toStandardResult(r, ctx);
            }
            catch (_) { }
            // async function so a synchronously throwing check rejects instead of escaping validate
            return validateAsync(inst, value);
        },
        vendor: "zod",
        version: 1,
    };
}

const $ZodString = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodString", (inst, def) => {
    $ZodType.init(inst, def);
    // a format's own pattern, else unbounded; a template literal derives the check-aware form itself
    inst._zod.pattern = def.pattern ?? core_regexes/* anyString */.gp;
    inst._zod.parse = (payload, _) => {
        if (def.coerce)
            try {
                payload.value = String(payload.value);
            }
            catch (_) { }
        if (typeof payload.value === "string")
            return payload;
        payload.issues.push({
            expected: "string",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodStringFormat = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodStringFormat", (inst, def) => {
    // check initialization must come first
    core_checks/* $ZodCheckStringFormat */.ql.init(inst, def);
    $ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodGUID", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* guid */.Os);
    $ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodUUID", (inst, def) => {
    if (def.version) {
        const versionMap = {
            v1: 1,
            v2: 2,
            v3: 3,
            v4: 4,
            v5: 5,
            v6: 6,
            v7: 7,
            v8: 8,
        };
        const v = versionMap[def.version];
        if (v === undefined)
            throw new Error(`Invalid UUID version: "${def.version}"`);
        def.pattern ?? (def.pattern = core_regexes/* uuid */.uR(v));
    }
    else
        def.pattern ?? (def.pattern = core_regexes/* uuid */.uR());
    $ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodEmail", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* email */.Rp);
    $ZodStringFormat.init(inst, def);
});
/** The `://` guard rejected the input before the URL constructor saw it. */
const URL_BAD_FORMAT = 1;
/** The URL parser rejected the input. */
const URL_UNPARSEABLE = 2;
function canParseURL(input) {
    try {
        if (typeof URL !== "undefined" && typeof URL.canParse === "function")
            return URL.canParse(input);
        new URL(input);
        return true;
    }
    catch {
        return false;
    }
}
function validateURL(trimmed, def) {
    if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) {
        return canParseURL(trimmed) || URL_UNPARSEABLE;
    }
    return parseURLObject(trimmed, def);
}
/** Parses a URL while preserving the non-normalizing HTTP guard. */
function parseURLObject(trimmed, def) {
    // When normalize is off, require :// for http/https URLs. This prevents strings like "http:example.com" or "https:/path" from being silently accepted
    if (!def.normalize && def.protocol?.source === core_regexes/* httpProtocol */.F.source && !/^https?:\/\//i.test(trimmed)) {
        return URL_BAD_FORMAT;
    }
    try {
        if (typeof URL !== "undefined") {
            const URLStatic = URL;
            if (typeof URLStatic.parse === "function")
                return URLStatic.parse(trimmed) ?? URL_UNPARSEABLE;
        }
        // @ts-ignore
        return new URL(trimmed);
    }
    catch {
        return URL_UNPARSEABLE;
    }
}
const asciiTabOrNewline = /[\t\n\r]/g;
/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
function stripTabAndNewline(value) {
    return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
    hostname.lastIndex = 0;
    return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
    protocol.lastIndex = 0;
    return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
const $ZodURL = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodURL", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        try {
            // Trim whitespace from input
            const trimmed = payload.value.trim();
            const url = validateURL(trimmed, def);
            if (url === URL_BAD_FORMAT) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "url",
                    note: "Invalid URL format",
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
                return;
            }
            if (url === URL_UNPARSEABLE) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "url",
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
                return;
            }
            if (url === true) {
                payload.value = stripTabAndNewline(trimmed);
                return;
            }
            if (def.hostname && !urlHostnameOk(url, def.hostname)) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "url",
                    note: "Invalid hostname",
                    pattern: def.hostname.source,
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
            }
            if (def.protocol && !urlProtocolOk(url, def.protocol)) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "url",
                    note: "Invalid protocol",
                    pattern: def.protocol.source,
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
            }
            // Set the output value based on normalize flag
            payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
            return;
        }
        catch (_) {
            payload.issues.push({
                code: "invalid_format",
                format: "url",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodEmoji = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodEmoji", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* emoji */.Zg());
    $ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNanoID", (inst, def) => {
    if (def.length !== undefined && (!Number.isInteger(def.length) || def.length < 1))
        throw new Error(`Invalid nanoid length: ${def.length}`);
    def.pattern ?? (def.pattern = def.length === undefined ? core_regexes/* nanoid */.Ak : core_regexes/* nanoidOfLength */.D2(def.length));
    $ZodStringFormat.init(inst, def);
});
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
const $ZodCUID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodCUID", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* cuid */.gF);
    $ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodCUID2", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* cuid2 */.Gl);
    $ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodULID", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* ulid */.Z0);
    $ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodXID", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* xid */.kM);
    $ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodKSUID", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* ksuid */.fO);
    $ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodISODateTime", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* datetime */.w$(def));
    $ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodISODate", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* date */.p6);
    $ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodISOTime", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* time */.kB(def));
    $ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodISODuration", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* duration */.p0);
    $ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodIPv4", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* ipv4 */.uX);
    $ZodStringFormat.init(inst, def);
});
/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
    if (!ipv6Alphabet.test(value))
        return false;
    return canParseURL(`http://[${value}]`);
}
const $ZodIPv6 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodIPv6", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* ipv6 */.ug);
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (!isValidIPv6(payload.value)) {
            payload.issues.push({
                code: "invalid_format",
                format: "ipv6",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodMAC = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodMAC", (inst, def) => {
    def.pattern ?? (def.pattern = regexes.mac(def.delimiter));
    $ZodStringFormat.init(inst, def);
})));
const $ZodCIDRv4 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodCIDRv4", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* cidrv4 */.zr);
    $ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
    const parts = value.split("/");
    if (parts.length !== 2)
        return false;
    const [address, prefix] = parts;
    if (!prefix)
        return false;
    const prefixNum = Number(prefix);
    if (`${prefixNum}` !== prefix)
        return false;
    if (prefixNum < 0 || prefixNum > 128)
        return false;
    return isValidIPv6(address);
}
const $ZodCIDRv6 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodCIDRv6", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* cidrv6 */.l7); // not used for validation
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (!isValidCIDRv6(payload.value)) {
            payload.issues.push({
                code: "invalid_format",
                format: "cidrv6",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64(data) {
    if (data === "")
        return true;
    // atob ignores whitespace, so reject it up front.
    if (/\s/.test(data))
        return false;
    if (data.length % 4 !== 0)
        return false;
    try {
        // @ts-ignore
        atob(data);
        return true;
    }
    catch {
        return false;
    }
}
// lax on purpose: the quantified regexes.base64 overflows the regex stack on multi-MB input and its leading ^$| alternation leaks through template-literal composition; isValidBase64 enforces length and padding
const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
const $ZodBase64 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodBase64", (inst, def) => {
    def.pattern ?? (def.pattern = base64Charset);
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidBase64(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "base64",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
//////////////////////////////   ZodBase64URL   //////////////////////////////
// lax on purpose: the quantified regexes.base64url overflows the regex stack on multi-MB input; isValidBase64 enforces length on the padded string
const base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
    if (!base64urlCharset.test(data))
        return false;
    const base64 = data.replace(/[-_]/g, (c) => (c === "-" ? "+" : "/"));
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return isValidBase64(padded);
}
const $ZodBase64URL = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodBase64URL", (inst, def) => {
    def.pattern ?? (def.pattern = base64urlCharset);
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidBase64URL(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodE164 = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodE164", (inst, def) => {
    def.pattern ?? (def.pattern = core_regexes/* e164 */.hQ);
    $ZodStringFormat.init(inst, def);
});
//////////////////////////////   ZodCreditCard   //////////////////////////////
const CC_SANITIZE = /[- ]/g;
/** Luhn checksum on a digit-only string. Adapted from valibot (MIT). */
function isLuhnAlgo(digits) {
    let length = digits.length;
    let bit = 1;
    let sum = 0;
    while (length) {
        const value = digits.charCodeAt(--length) - 48;
        bit ^= 1;
        sum += bit ? [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][value] : value;
    }
    return sum % 10 === 0;
}
function isValidCreditCard(input) {
    if (!regexes.creditCard.test(input))
        return false;
    return isLuhnAlgo(input.replace(CC_SANITIZE, ""));
}
const $ZodCreditCard = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCreditCard", (inst, def) => {
    // Shape only — the Luhn check below is not expressible as a pattern, so consumers of `pattern` (JSON Schema, template literals) get the length and separator rules alone.
    def.pattern ?? (def.pattern = regexes.creditCard);
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidCreditCard(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "credit_card",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
})));
//////////////////////////////   ZodIBAN   //////////////////////////////
// iso 7064 mod 97-10 checksum without BigInt
function isIso7064Mod97(iban) {
    let remainder = 0;
    const len = iban.length;
    for (let i = 4; i < len; i++) {
        const code = iban.charCodeAt(i);
        remainder = (code >= 65 ? remainder * 100 + (code - 55) : remainder * 10 + (code - 48)) % 97;
    }
    for (let i = 0; i < 4; i++) {
        const code = iban.charCodeAt(i);
        remainder = (code >= 65 ? remainder * 100 + (code - 55) : remainder * 10 + (code - 48)) % 97;
    }
    return remainder === 1;
}
function isValidIBAN(input) {
    if (!regexes.iban.test(input))
        return false;
    return isIso7064Mod97(input);
}
const $ZodIBAN = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodIBAN", (inst, def) => {
    // shape only — checksum is not expressible as a pattern
    def.pattern ?? (def.pattern = regexes.iban);
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidIBAN(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "iban",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
})));
//////////////////////////////   ZodJWT   //////////////////////////////
function isValidJWT(token, algorithm = null) {
    try {
        const tokensParts = token.split(".");
        if (tokensParts.length !== 3)
            return false;
        const [header] = tokensParts;
        if (!header)
            return false;
        // @ts-ignore
        const parsedHeader = JSON.parse(atob(header));
        if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
            return false;
        if (!parsedHeader.alg)
            return false;
        if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
            return false;
        return true;
    }
    catch {
        return false;
    }
}
const $ZodJWT = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodJWT", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidJWT(payload.value, def.alg))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCustomStringFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCustomStringFormat", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (def.fn(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: def.format,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodNumber = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNumber", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = core_regexes/* number */.ai;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Number(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
            return payload;
        }
        const received = typeof input === "number"
            ? Number.isNaN(input)
                ? "NaN"
                : !Number.isFinite(input)
                    ? String(input)
                    : undefined
            : undefined;
        payload.issues.push({
            expected: "number",
            code: "invalid_type",
            input,
            inst,
            ...(received ? { received } : {}),
        });
        return payload;
    };
});
const $ZodNumberFormat = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNumberFormat", (inst, def) => {
    core_checks/* $ZodCheckNumberFormat */.KH.init(inst, def);
    $ZodNumber.init(inst, def); // no format checks
});
const $ZodBoolean = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodBoolean", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = core_regexes/* boolean */.zM;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Boolean(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "boolean")
            return payload;
        payload.issues.push({
            expected: "boolean",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
});
const $ZodBigInt = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodBigInt", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = core_regexes/* bigint */.o;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = BigInt(payload.value);
            }
            catch (_) { }
        if (typeof payload.value === "bigint")
            return payload;
        payload.issues.push({
            expected: "bigint",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodBigIntFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodBigIntFormat", (inst, def) => {
    checks.$ZodCheckBigIntFormat.init(inst, def);
    $ZodBigInt.init(inst, def); // no format checks
})));
const $ZodSymbol = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodSymbol", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "symbol")
            return payload;
        payload.issues.push({
            expected: "symbol",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodUndefined = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodUndefined", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = regexes.undefined;
    inst._zod.values = new Set([undefined]);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
            return payload;
        payload.issues.push({
            expected: "undefined",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodNull = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNull", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = core_regexes/* null */.ch;
    inst._zod.values = new Set([null]);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input === null)
            return payload;
        payload.issues.push({
            expected: "null",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
});
const $ZodAny = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodAny", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
});
const $ZodUnknown = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodUnknown", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNever", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        payload.issues.push({
            expected: "never",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodVoid = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodVoid", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
            return payload;
        payload.issues.push({
            expected: "void",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodDate = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodDate", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce) {
            try {
                payload.value = new Date(payload.value);
            }
            catch (_err) { }
        }
        const input = payload.value;
        const isDate = input instanceof Date;
        const isValidDate = isDate && !Number.isNaN(input.getTime());
        if (isValidDate)
            return payload;
        payload.issues.push({
            expected: "date",
            code: "invalid_type",
            input,
            ...(isDate ? { received: "Invalid Date" } : {}),
            inst,
        });
        return payload;
    };
});
// an oversized container fails its leading size checks before any element is parsed
function capSize(inst, size) {
    const caps = core_util/* sizeCaps */.hi(inst._zod.def.checks);
    if (!caps.length)
        return;
    const cap = Math.min(...caps.map((c) => c[0]));
    const parse = inst._zod.parse;
    inst._zod.parse = (payload, ctx) => {
        const n = size(payload.value);
        if (n > cap && !ctx?.skipChecks && ctx?.direction !== "backward") {
            for (const [max, ch] of core_util/* sizeCaps */.hi(inst._zod.def.checks)) {
                if (n > max && ch._zod.def.when(payload)) {
                    const start = payload.issues.length;
                    ch._zod.check(payload);
                    // the value is still the raw input, so no later check may read it
                    payload.issues[start].continue = false;
                    core_util/* attachSchema */.d3(payload.issues, start, inst);
                    return payload;
                }
            }
        }
        return parse(payload, ctx);
    };
}
const arraySize = (input) => (Array.isArray(input) ? input.length : -1);
const mapSize = (input) => (input instanceof Map ? input.size : -1);
const setSize = (input) => (input instanceof Set ? input.size : -1);
function handleArrayResult(result, final, index) {
    if (result.issues.length) {
        final.issues.push(...core_util/* prefixIssues */.lQ(index, result.issues));
    }
    final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodArray", (inst, def) => {
    $ZodType.init(inst, def);
    const memo = core_core/* globalConfig */.cr.memoizer;
    memo?.attach(inst);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
            payload.issues.push({
                expected: "array",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
        const proms = [];
        const abortEarly = ctx?.abortEarly;
        for (let i = 0; i < input.length; i++) {
            const item = input[i];
            const result = def.element._zod.run({
                value: item,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                proms.push(result.then((result) => handleArrayResult(result, payload, i)));
            }
            else {
                handleArrayResult(result, payload, i);
                // the element's payload is authoritative here, since handleArrayResult forwards every issue; an object's is not, because it drops a failed absent optional
                if (abortEarly && result.issues.length !== 0 && core_util/* aborted */.QH(result))
                    break;
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => payload);
        }
        return payload; //handleArrayResultsAsync(parseResults, final);
    };
    capSize(inst, arraySize);
});
function handlePropertyResult(result, final, key, input, optin, optout) {
    const isPresent = key in input;
    const isOptionalOut = optout === "optional";
    // The middle rung means "absence permitted, nothing supplied in its place", so an absent key contributes nothing — whatever the schema made of `undefined` is invented, not substituted. Only `optional` reaches this with a value: `defaulted` substitutes, and a schema that isn't optional-out has to keep the key.
    if (!isPresent && isOptionalOut && optin === "optional") {
        return;
    }
    if (result.issues.length) {
        // For optional-in/out schemas, ignore errors on absent keys.
        if (optin !== undefined && isOptionalOut && !isPresent) {
            return;
        }
        final.issues.push(...core_util/* prefixIssues */.lQ(key, result.issues));
    }
    if (!isPresent && optin === undefined) {
        if (!result.issues.length) {
            final.issues.push({
                code: "invalid_type",
                expected: "nonoptional",
                input: undefined,
                path: [key],
            });
        }
        return;
    }
    if (result.value === undefined) {
        if (isPresent || (optin === "defaulted" && !isOptionalOut)) {
            final.value[key] = undefined;
        }
    }
    else {
        final.value[key] = result.value;
    }
}
// one shared instance; a fresh [] per schema cost 56 bytes retained
const NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
    const keys = Object.keys(def.shape);
    const ownSymbols = Object.getOwnPropertySymbols(def.shape);
    const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
    // aliases `keys` when there are no symbols, so a string-only shape keeps one array
    const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
    for (const k of allKeys) {
        if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
            throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
        }
    }
    const okeys = core_util/* optionalKeys */.NM(def.shape);
    return {
        ...def,
        allKeys,
        symbolKeys,
        // string-only: handleCatchall matches it against `for...in`, which never yields a symbol
        keySet: new Set(keys),
        numKeys: keys.length,
        optionalKeys: new Set(okeys),
    };
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
    const unrecognized = [];
    const keySet = def.keySet;
    const _catchall = def.catchall._zod;
    const t = _catchall.def.type;
    const optin = _catchall.optin;
    const optout = _catchall.optout;
    // starts at 0, not the current length: the shape phase already ran and may have aborted
    let seen = 0;
    for (const key in input) {
        if (abortEarly && payload.issues.length !== seen) {
            if (core_util/* aborted */.QH(payload, seen))
                break;
            seen = payload.issues.length;
        }
        // Must precede the __proto__ branch: a declared key is not unrecognized, even though the shape loop deliberately strips __proto__ from the parsed output.
        if (keySet.has(key))
            continue;
        // Don't copy an undeclared __proto__ into the result; assignment to a plain {} would replace the result prototype. But in strict mode it is still an unknown key, so report it before skipping.
        if (key === "__proto__") {
            if (t === "never")
                unrecognized.push(key);
            continue;
        }
        if (t === "never") {
            unrecognized.push(key);
            continue;
        }
        const r = _catchall.run({ value: input[key], issues: [] }, ctx);
        if (r instanceof Promise) {
            proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
        }
        else {
            handlePropertyResult(r, payload, key, input, optin, optout);
        }
    }
    if (unrecognized.length) {
        payload.issues.push({
            code: "unrecognized_keys",
            keys: unrecognized,
            input,
            inst,
            // Describes the shape of the input, not the validity of the parsed value, so it never aborts. The parse still fails; the schema's own checks just get to run first, and an enclosing intersection can reconcile the key against a sibling operand.
            continue: true,
        });
    }
    if (!proms.length)
        return payload;
    return Promise.all(proms).then(() => {
        return payload;
    });
}
const $ZodObject = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodObject", (inst, def) => {
    // requires cast because technically $ZodObject doesn't extend
    $ZodType.init(inst, def);
    const desc = Object.getOwnPropertyDescriptor(def, "shape");
    // a cloned def carries its source's accessor, which knows the shape it answers from; adopting that keeps the clone's keys readable without running it
    const sh = desc?.get ? desc.get.raw : (def.shape ?? {});
    if (sh) {
        // Freezes the shape on first read, so its getters resolve once and every later read sees the same schemas.
        const get = () => {
            const newSh = { ...sh };
            Object.defineProperty(def, "shape", { value: newSh });
            get.raw = newSh;
            return newSh;
        };
        get.raw = sh;
        Object.defineProperty(def, "shape", { get });
    }
    const _normalized = core_util/* cached */.PO(() => normalizeDef(def));
    core_util/* defineLazyInternal */.v5(inst, "propValues", (zod) => {
        const shape = zod.def.shape;
        const propValues = {};
        for (const key in shape) {
            const field = shape[key]._zod;
            if (field.values) {
                if (!Object.prototype.hasOwnProperty.call(propValues, key)) {
                    core_util/* assignProp */.Vy(propValues, key, new Set());
                }
                for (const v of field.values)
                    propValues[key].add(v);
                // An omittable slot reads back as undefined at a discriminator lookup, so it has to claim undefined: two options that can both omit the key are not discriminable on it.
                if (field.optin !== undefined)
                    propValues[key].add(undefined);
            }
        }
        return propValues;
    });
    const isObject = core_util/* isObject */.Gv;
    const catchall = def.catchall;
    let value;
    const memo = core_core/* globalConfig */.cr.memoizer;
    memo?.attach(inst);
    inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject(input)) {
            payload.issues.push({
                expected: "object",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
        const proms = [];
        const shape = value.shape;
        const abortEarly = ctx?.abortEarly;
        let seen = payload.issues.length;
        for (const key of value.allKeys) {
            if (abortEarly && payload.issues.length !== seen) {
                if (core_util/* aborted */.QH(payload, seen))
                    break;
                seen = payload.issues.length;
            }
            if (key === "__proto__")
                continue;
            const el = shape[key];
            const optin = el._zod.optin;
            const optout = el._zod.optout;
            const r = el._zod.run({ value: input[key], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
            }
            else {
                handlePropertyResult(r, payload, key, input, optin, optout);
            }
        }
        if (!catchall) {
            return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
    };
});
const $ZodObjectJIT = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodObjectJIT", (inst, def) => {
    // requires cast because technically $ZodObject doesn't extend
    $ZodObject.init(inst, def);
    const superParse = inst._zod.parse;
    const _normalized = core_util/* cached */.PO(() => normalizeDef(def));
    const memo = core_core/* globalConfig */.cr.memoizer;
    const generateFastpass = (shape) => {
        const normalized = _normalized.value;
        const syms = normalized.symbolKeys;
        // a symbol has no source literal, so it is read as `syms[i]` off the closed-over scope
        const doc = new Doc(["payload", "ctx"], { shape, inst, memo, syms });
        const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        // prefixes in place, like util.prefixIssues. newResult must land before the early return: a catchall runs after this and would otherwise write onto the caller's input
        const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
        doc.write(`const input = payload.value;`);
        const ids = Object.create(null);
        let counter = 0;
        for (const key of normalized.allKeys) {
            ids[key] = `key_${counter++}`;
        }
        // A: preserve key order {
        doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
        for (const key of normalized.allKeys) {
            if (key === "__proto__")
                continue;
            const id = ids[key];
            const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : core_util/* esc */.UQ(key);
            const isPresent = `${k} in input`;
            const schema = shape[key];
            const optin = schema?._zod?.optin;
            const isOptionalIn = optin !== undefined;
            const isOptionalOut = schema?._zod?.optout === "optional";
            doc.write(`const ${id} = ${parseStr(k)};`);
            if (isOptionalIn && isOptionalOut) {
                // For optional-in/out schemas, ignore errors on absent keys — and, like the interpreted path, drop the value produced alongside them. The middle rung goes further: it permits absence without supplying anything in its place, so an absent key contributes nothing at all.
                const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
                doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
            }
            else if (!isOptionalIn) {
                doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
            }
            else {
                doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
                if (optin === "defaulted") {
                    doc.write(`newResult[${k}] = ${id}.value;`);
                }
                else {
                    doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
                }
            }
        }
        doc.write(`payload.value = newResult;`);
        doc.write(`return payload;`);
        // closing `shape` in is what pays: turbofan specializes the parser against that one shape object, so every `shape[k]._zod.run` folds to a known callee. as a parameter it stays a generic load and measures 13% slower even with the forwarding frame gone
        return doc.compile();
    };
    let fastpass;
    const isObject = core_util/* isObject */.Gv;
    const jit = !core_core/* globalConfig */.cr.jitless;
    const allowsEval = core_util/* allowsEval */.hI;
    const fastEnabled = jit && allowsEval.value; // && !def.catchall;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject(input)) {
            payload.issues.push({
                expected: "object",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
            // always synchronous
            if (!fastpass)
                fastpass = generateFastpass(def.shape);
            payload = fastpass(payload, ctx);
            if (!catchall)
                return payload;
            return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
        }
        return superParse(payload, ctx);
    };
});
function handleUnionResults(results, final, inst, ctx) {
    for (const result of results) {
        if (result.issues.length === 0) {
            final.value = result.value;
            return final;
        }
    }
    const nonaborted = results.filter((r) => !core_util/* aborted */.QH(r));
    if (nonaborted.length === 1) {
        final.value = nonaborted[0].value;
        return nonaborted[0];
    }
    final.issues.push({
        code: "invalid_union",
        input: final.value,
        inst,
        errors: results.map((result) => result.issues.map((iss) => core_util/* finalizeIssue */.iR(iss, ctx, core_core/* config */.$W()))),
    });
    return final;
}
const $ZodUnion = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodUnion", (inst, def) => {
    $ZodType.init(inst, def);
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted")
        ? "defaulted"
        : zod.def.options.some((o) => o._zod.optin !== undefined)
            ? "optional"
            : undefined);
    core_util/* defineLazyInternal */.v5(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => {
        if (zod.def.options.every((o) => o._zod.values)) {
            return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
        }
        return undefined;
    });
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => {
        if (zod.def.options.every((o) => o._zod.pattern)) {
            const patterns = zod.def.options.map((o) => o._zod.pattern);
            return new RegExp(`^(${patterns.map((p) => core_util/* cleanRegex */.p6(p.source)).join("|")})$`);
        }
        return undefined;
    });
    const first = def.options.length === 1 ? def.options[0]._zod.run : null;
    inst._zod.parse = (payload, ctx) => {
        if (first) {
            return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
            const result = option._zod.run({
                value: payload.value,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                results.push(result);
                async = true;
            }
            else {
                if (result.issues.length === 0)
                    return result;
                results.push(result);
            }
        }
        if (!async)
            return handleUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results) => {
            return handleUnionResults(results, payload, inst, ctx);
        });
    };
});
function handleExclusiveUnionResults(results, final, inst, ctx) {
    const matches = [];
    for (let i = 0; i < results.length; i++) {
        if (results[i].issues.length === 0)
            matches.push(i);
    }
    if (matches.length === 1) {
        final.value = results[matches[0]].value;
        return final;
    }
    if (matches.length === 0) {
        // No matches - same as regular union
        final.issues.push({
            code: "invalid_union",
            input: final.value,
            inst,
            errors: results.map((result) => result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
        });
    }
    else {
        // Multiple matches - exclusive union failure
        final.issues.push({
            code: "invalid_union",
            input: final.value,
            inst,
            errors: [],
            inclusive: false,
            matches,
        });
    }
    return final;
}
const $ZodXor = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodXor", (inst, def) => {
    $ZodUnion.init(inst, def);
    def.inclusive = false;
    const first = def.options.length === 1 ? def.options[0]._zod.run : null;
    inst._zod.parse = (payload, ctx) => {
        if (first) {
            return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
            const result = option._zod.run({
                value: payload.value,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                results.push(result);
                async = true;
            }
            else {
                results.push(result);
            }
        }
        if (!async)
            return handleExclusiveUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results) => {
            return handleExclusiveUnionResults(results, payload, inst, ctx);
        });
    };
})));
/** Returns the option whose discriminator claims `value`, or throws if ambiguous. */
function getDiscriminatedOption(union, value) {
    const internals = union._zod;
    let map = internals.bag.optionsMap;
    if (!map) {
        map = discriminatorMap(internals.def);
        internals.bag.optionsMap = map;
    }
    const option = map.get(value);
    if (option === null)
        throw new Error(`Ambiguous discriminator value "${String(value)}"`);
    return option;
}
function discriminatorMap(def) {
    const map = new Map();
    for (const option of def.options) {
        const values = option._zod.propValues?.[def.discriminator];
        if (!values || values.size === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
        for (const value of values) {
            if (map.has(value)) {
                if (value !== undefined)
                    throw new Error(`Duplicate discriminator value "${String(value)}"`);
                // keep the collision marked so a later member cannot reclaim it
                map.set(value, null);
            }
            else {
                map.set(value, option);
            }
        }
    }
    return map;
}
const $ZodDiscriminatedUnion = 
/*@__PURE__*/
core_core/* $constructor */.xI("$ZodDiscriminatedUnion", (inst, def) => {
    def.inclusive = false;
    $ZodUnion.init(inst, def);
    const _super = inst._zod.parse;
    core_util/* defineLazyInternal */.v5(inst, "propValues", (zod) => {
        const propValues = {};
        let undefinedCount = 0;
        for (const option of zod.def.options) {
            const pv = option._zod.propValues;
            if (!pv || Object.keys(pv).length === 0)
                throw new Error(`Invalid discriminated union option at index "${zod.def.options.indexOf(option)}"`);
            if (pv[zod.def.discriminator]?.has(undefined))
                undefinedCount++;
            for (const [k, v] of Object.entries(pv)) {
                if (!Object.prototype.hasOwnProperty.call(propValues, k)) {
                    core_util/* assignProp */.Vy(propValues, k, new Set());
                }
                for (const val of v) {
                    propValues[k].add(val);
                }
            }
        }
        if (!zod.def.unionFallback && undefinedCount > 1)
            propValues[zod.def.discriminator]?.delete(undefined);
        return propValues;
    });
    // Checked now rather than in the lookup map below, so an option that lacks the discriminator fails at the `discriminatedUnion` call instead of on the first object parsed. Options whose shape cannot be enumerated without resolving it — pipes and lazies — are left to the map.
    def.options.forEach((option, i) => {
        const propShape = core_util/* rawShape */.MO(option._zod.def);
        if (propShape && !Object.prototype.hasOwnProperty.call(propShape, def.discriminator)) {
            throw new Error(`Invalid discriminated union option at index "${i}"`);
        }
    });
    const disc = core_util/* cached */.PO(() => discriminatorMap(def));
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!core_util/* isObject */.Gv(input)) {
            payload.issues.push({
                code: "invalid_type",
                expected: "object",
                input,
                inst,
            });
            return payload;
        }
        const value = input?.[def.discriminator];
        const opt = disc.value.get(value);
        // forward metadata cannot choose an encoder for an absent tag
        if (opt && (value !== undefined || ctx.direction !== "backward")) {
            return opt._zod.run(payload, ctx);
        }
        // Fall back to union matching when the fast discriminator path fails:
        // - explicitly enabled via unionFallback, or
        // - during backward direction (encode), since codec-based discriminators have different values in forward vs backward directions
        if (def.unionFallback || ctx.direction === "backward") {
            return _super(payload, ctx);
        }
        // no matching discriminator
        payload.issues.push({
            code: "invalid_union",
            errors: [],
            note: "No matching discriminator",
            discriminator: def.discriminator,
            options: Array.from(disc.value.keys()).filter((value) => disc.value.get(value) !== null),
            input,
            path: [def.discriminator],
            inst,
        });
        return payload;
    };
});
const $ZodIntersection = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodIntersection", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        const left = def.left._zod.run({ value: input, issues: [] }, ctx);
        const right = def.right._zod.run({ value: input, issues: [] }, ctx);
        const async = left instanceof Promise || right instanceof Promise;
        if (async) {
            return Promise.all([left, right]).then(([left, right]) => {
                return handleIntersectionResults(payload, left, right);
            });
        }
        return handleIntersectionResults(payload, left, right);
    };
});
function mergeValues(a, b) {
    // const aType = parse.t(a);
    // const bType = parse.t(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    if (a instanceof Date && b instanceof Date && +a === +b) {
        return { valid: true, data: a };
    }
    if (core_util/* isPlainObject */.Qd(a) && core_util/* isPlainObject */.Qd(b)) {
        const bKeys = Object.keys(b);
        const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        if (Object.prototype.hasOwnProperty.call(newObj, "__proto__"))
            delete newObj.__proto__;
        for (const key of sharedKeys) {
            if (key === "__proto__")
                continue;
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return {
                    valid: false,
                    mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
                };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return { valid: false, mergeErrorPath: [] };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return {
                    valid: false,
                    mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
                };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
    // Track which side(s) reject each key. A key rejection is reported only when BOTH sides reject it, so a key owned by one branch survives the other's key schema. strictObject reports these as unrecognized_keys; a record with an open key schema reports one invalid_key per key.
    const unrecKeys = new Map();
    let unrecIssue;
    const keyIssues = new Map();
    const collect = (iss, side) => {
        let keys;
        if (iss.code === "unrecognized_keys" && !iss.path?.length) {
            unrecIssue ?? (unrecIssue = iss);
            keys = iss.keys;
        }
        else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
            const k = String(iss.path[0]);
            if (!keyIssues.has(k))
                keyIssues.set(k, iss);
            keys = [k];
        }
        else {
            return false;
        }
        for (const k of keys) {
            if (!unrecKeys.has(k))
                unrecKeys.set(k, {});
            unrecKeys.get(k)[side] = true;
        }
        return true;
    };
    for (const iss of left.issues) {
        if (!collect(iss, "l"))
            result.issues.push(iss);
    }
    for (const iss of right.issues) {
        if (!collect(iss, "r"))
            result.issues.push(iss);
    }
    // Report only keys rejected by BOTH sides
    const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
    if (bothKeys.length) {
        const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
        if (aggregated.length)
            result.issues.push({ ...unrecIssue, keys: aggregated });
        for (const k of bothKeys) {
            if (!aggregated.includes(k) && keyIssues.has(k))
                result.issues.push(keyIssues.get(k));
        }
    }
    const merged = mergeValues(left.value, right.value);
    if (!merged.valid) {
        if (core_util/* aborted */.QH(result))
            return result;
        throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
    }
    result.value = merged.data;
    return result;
}
const $ZodTuple = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodTuple", (inst, def) => {
    $ZodType.init(inst, def);
    const items = def.items;
    const memo = core_core/* globalConfig */.cr.memoizer;
    memo?.attach(inst);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
            payload.issues.push({
                input,
                inst,
                expected: "tuple",
                code: "invalid_type",
            });
            return payload;
        }
        payload.value = memo ? memo.alloc(inst, payload, [], ctx) : [];
        const proms = [];
        const optinStart = getTupleOptStart(items, "optin");
        const optoutStart = getTupleOptStart(items, "optout");
        if (!def.rest) {
            if (input.length < optinStart) {
                payload.issues.push({
                    code: "too_small",
                    minimum: optinStart,
                    inclusive: true,
                    input,
                    inst,
                    origin: "array",
                });
                return payload;
            }
            if (input.length > items.length) {
                payload.issues.push({
                    code: "too_big",
                    maximum: items.length,
                    inclusive: true,
                    input,
                    inst,
                    origin: "array",
                });
            }
        }
        // Run every item in parallel, collecting results into an indexed array. The post-processing in `handleTupleResults` walks them in order so it can decide whether an absent optional-output error can truncate the tail or must be reported to preserve required output.
        const itemResults = new Array(items.length);
        // only tracked when there is a rest loop to skip
        const abortEarly = def.rest ? ctx?.abortEarly : undefined;
        let itemAborted = false;
        for (let i = 0; i < items.length; i++) {
            const r = items[i]._zod.run({ value: input[i], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((rr) => {
                    itemResults[i] = rr;
                }));
            }
            else {
                itemResults[i] = r;
                if (abortEarly && !itemAborted && r.issues.length)
                    itemAborted = core_util/* aborted */.QH(r);
            }
        }
        // sound because rest is non-empty exactly when every fixed index is present, the one case handleTupleResults cannot discard an item's issues
        if (def.rest && !itemAborted) {
            let i = items.length - 1;
            const rest = input.slice(items.length);
            let seen = payload.issues.length;
            for (const el of rest) {
                if (abortEarly && payload.issues.length !== seen) {
                    if (core_util/* aborted */.QH(payload, seen))
                        break;
                    seen = payload.issues.length;
                }
                i++;
                const result = def.rest._zod.run({ value: el, issues: [] }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((r) => handleTupleResult(r, payload, i)));
                }
                else {
                    handleTupleResult(result, payload, i);
                }
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
        }
        return handleTupleResults(itemResults, payload, items, input, optoutStart);
    };
});
function getTupleOptStart(items, key) {
    for (let i = items.length - 1; i >= 0; i--) {
        // optin is a three-rung ladder so any rung above `undefined` permits an absent slot; optout stays two-valued.
        const omittable = key === "optin" ? items[i]._zod.optin !== undefined : items[i]._zod.optout === "optional";
        if (!omittable)
            return i + 1;
    }
    return 0;
}
function handleTupleResult(result, final, index) {
    if (result.issues.length) {
        final.issues.push(...core_util/* prefixIssues */.lQ(index, result.issues));
    }
    final.value[index] = result.value;
}
function handleTupleResults(itemResults, final, items, input, optoutStart) {
    // Walk results in order. Mirror $ZodObject's swallow-on-absent-optional rule, but only after `optoutStart`: the first index where the output tuple tail can be absent.
    for (let i = 0; i < items.length; i++) {
        const r = itemResults[i];
        const isPresent = i < input.length;
        // The array analog of `handlePropertyResult`'s absent-key early return: the middle rung permits absence without supplying anything in its place, so the tail truncates here instead of materializing whatever the item made of `undefined`.
        if (!isPresent && i >= optoutStart && items[i]._zod.optin === "optional") {
            final.value.length = i;
            break;
        }
        if (r.issues.length) {
            if (!isPresent && i >= optoutStart) {
                final.value.length = i;
                break;
            }
            final.issues.push(...core_util/* prefixIssues */.lQ(i, r.issues));
        }
        final.value[i] = r.value;
    }
    // Drop trailing slots that produced `undefined` for absent input
    // (the array analog of an absent optional key on an object). The
    // `i >= input.length` floor is critical: an explicit `undefined`
    // *inside* the input must be preserved even when the schema is
    // optional-out (e.g. `z.string().or(z.undefined())` accepting an
    // explicit undefined value).
    for (let i = final.value.length - 1; i >= input.length; i--) {
        if (items[i]._zod.optout === "optional" && final.value[i] === undefined) {
            final.value.length = i;
        }
        else {
            break;
        }
    }
    return final;
}
const $ZodRecord = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodRecord", (inst, def) => {
    $ZodType.init(inst, def);
    const memo = core_core/* globalConfig */.cr.memoizer;
    memo?.attach(inst);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!core_util/* isPlainObject */.Qd(input)) {
            payload.issues.push({
                expected: "record",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        // no guard in either loop below: a record's invalid_key aborts but an enclosing intersection can reconcile it, so a stopped loop hides keys the sibling does not own and the intersection then rejects nothing
        const proms = [];
        const values = def.keyType._zod.values;
        if (values && !def.partial) {
            payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
            const recordKeys = new Set();
            for (const key of values) {
                if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
                    recordKeys.add(typeof key === "number" ? key.toString() : key);
                    // A declared __proto__ is stripped but is not an unrecognized key.
                    if (key === "__proto__")
                        continue;
                    const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                    if (keyResult instanceof Promise) {
                        throw new Error("Async schemas not supported in object keys currently");
                    }
                    if (keyResult.issues.length) {
                        payload.issues.push({
                            code: "invalid_key",
                            origin: "record",
                            issues: keyResult.issues.map((iss) => core_util/* finalizeIssue */.iR(iss, ctx, core_core/* config */.$W())),
                            input: key,
                            path: [key],
                            inst,
                        });
                        continue;
                    }
                    const outKey = keyResult.value;
                    if (outKey === "__proto__")
                        continue;
                    const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                    if (result instanceof Promise) {
                        proms.push(result.then((result) => {
                            if (result.issues.length) {
                                payload.issues.push(...core_util/* prefixIssues */.lQ(key, result.issues));
                            }
                            payload.value[outKey] = result.value;
                        }));
                    }
                    else {
                        if (result.issues.length) {
                            payload.issues.push(...core_util/* prefixIssues */.lQ(key, result.issues));
                        }
                        payload.value[outKey] = result.value;
                    }
                }
            }
            let unrecognized;
            for (const key in input) {
                if (!recordKeys.has(key)) {
                    if (def.mode === "loose") {
                        // skip __proto__ so it can't replace the result prototype via the assignment setter on the plain {} we build into
                        if (key === "__proto__")
                            continue;
                        payload.value[key] = input[key];
                    }
                    else {
                        unrecognized = unrecognized ?? [];
                        unrecognized.push(key);
                    }
                }
            }
            if (unrecognized && unrecognized.length > 0) {
                payload.issues.push({
                    code: "unrecognized_keys",
                    input,
                    inst,
                    keys: unrecognized,
                    continue: true,
                });
            }
        }
        else {
            payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
            // An enumerable key schema declares which keys the record owns, so a key outside the set is unrecognized. A non-enumerable one (regex, refine) is a constraint every key must satisfy, so a failing key is invalid. Only the former is reconcilable against the other side of an intersection.
            let unrecognized;
            // Reflect.ownKeys for Symbol-key support; filter non-enumerable to match z.object()
            for (const key of Reflect.ownKeys(input)) {
                if (key === "__proto__")
                    continue;
                if (!Object.prototype.propertyIsEnumerable.call(input, key))
                    continue;
                let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                if (keyResult instanceof Promise) {
                    throw new Error("Async schemas not supported in object keys currently");
                }
                // Numeric string fallback: if key is a numeric string and failed, retry with Number(key). This handles z.number(), z.literal([1, 2, 3]), and unions containing numeric literals
                const checkNumericKey = typeof key === "string" && core_regexes/* number */.ai.test(key) && keyResult.issues.length;
                if (checkNumericKey) {
                    const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
                    if (retryResult instanceof Promise) {
                        throw new Error("Async schemas not supported in object keys currently");
                    }
                    if (retryResult.issues.length === 0) {
                        keyResult = retryResult;
                    }
                }
                if (keyResult.issues.length) {
                    if (def.mode === "loose") {
                        // Pass through unchanged
                        payload.value[key] = input[key];
                    }
                    else if (values) {
                        unrecognized = unrecognized ?? [];
                        unrecognized.push(key);
                    }
                    else {
                        // Default "strict" behavior: error on invalid key
                        payload.issues.push({
                            code: "invalid_key",
                            origin: "record",
                            issues: keyResult.issues.map((iss) => core_util/* finalizeIssue */.iR(iss, ctx, core_core/* config */.$W())),
                            input: key,
                            path: [key],
                            inst,
                        });
                    }
                    continue;
                }
                // the guard above tests the raw input key, but the key schema can normalize an ordinary key into __proto__; re-check the key we actually write under
                const outKey = keyResult.value;
                if (outKey === "__proto__")
                    continue;
                const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((result) => {
                        if (result.issues.length) {
                            payload.issues.push(...core_util/* prefixIssues */.lQ(key, result.issues));
                        }
                        payload.value[outKey] = result.value;
                    }));
                }
                else {
                    if (result.issues.length) {
                        payload.issues.push(...core_util/* prefixIssues */.lQ(key, result.issues));
                    }
                    payload.value[outKey] = result.value;
                }
            }
            if (unrecognized && unrecognized.length > 0) {
                payload.issues.push({
                    code: "unrecognized_keys",
                    input,
                    inst,
                    keys: unrecognized,
                    continue: true,
                });
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => payload);
        }
        return payload;
    };
});
const $ZodMap = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodMap", (inst, def) => {
    $ZodType.init(inst, def);
    const memo = core.globalConfig.memoizer;
    memo?.attach(inst);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Map)) {
            payload.issues.push({
                expected: "map",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        const proms = [];
        payload.value = memo ? memo.alloc(inst, payload, new Map(), ctx) : new Map();
        const abortEarly = ctx?.abortEarly;
        let seen = payload.issues.length;
        for (const [key, value] of input) {
            if (abortEarly && payload.issues.length !== seen) {
                if (util.aborted(payload, seen))
                    break;
                seen = payload.issues.length;
            }
            const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
            const valueResult = def.valueType._zod.run({ value: value, issues: [] }, ctx);
            if (keyResult instanceof Promise || valueResult instanceof Promise) {
                proms.push(Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
                    handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
                }));
            }
            else {
                handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
            }
        }
        if (proms.length)
            return Promise.all(proms).then(() => payload);
        return payload;
    };
    capSize(inst, mapSize);
})));
function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
    if (keyResult.issues.length) {
        if (util.propertyKeyTypes.has(typeof key)) {
            final.issues.push(...util.prefixIssues(key, keyResult.issues));
        }
        else {
            final.issues.push({
                code: "invalid_key",
                origin: "map",
                input,
                inst,
                issues: keyResult.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())),
            });
        }
    }
    if (valueResult.issues.length) {
        if (util.propertyKeyTypes.has(typeof key)) {
            final.issues.push(...util.prefixIssues(key, valueResult.issues));
        }
        else {
            final.issues.push({
                origin: "map",
                code: "invalid_element",
                input,
                inst,
                key: key,
                issues: valueResult.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())),
            });
        }
    }
    final.value.set(keyResult.value, valueResult.value);
}
const $ZodSet = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodSet", (inst, def) => {
    $ZodType.init(inst, def);
    const memo = core.globalConfig.memoizer;
    memo?.attach(inst);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Set)) {
            payload.issues.push({
                input,
                inst,
                expected: "set",
                code: "invalid_type",
            });
            return payload;
        }
        const proms = [];
        payload.value = memo ? memo.alloc(inst, payload, new Set(), ctx) : new Set();
        const abortEarly = ctx?.abortEarly;
        let seen = payload.issues.length;
        for (const item of input) {
            if (abortEarly && payload.issues.length !== seen) {
                if (util.aborted(payload, seen))
                    break;
                seen = payload.issues.length;
            }
            const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
            if (result instanceof Promise) {
                proms.push(result.then((result) => handleSetResult(result, payload)));
            }
            else
                handleSetResult(result, payload);
        }
        if (proms.length)
            return Promise.all(proms).then(() => payload);
        return payload;
    };
    capSize(inst, setSize);
})));
function handleSetResult(result, final) {
    if (result.issues.length) {
        final.issues.push(...result.issues);
    }
    final.value.add(result.value);
}
const $ZodEnum = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodEnum", (inst, def) => {
    $ZodType.init(inst, def);
    const values = core_util/* getEnumValues */.w5(def.entries);
    const valuesSet = new Set(values);
    inst._zod.values = valuesSet;
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => {
        const patternValues = core_util/* getEnumValues */.w5(zod.def.entries).filter((k) => core_util/* propertyKeyTypes */.qQ.has(typeof k));
        // unmatchable fallback, RE2-safe: an empty alternation would compile to /^()$/, which matches ""
        return new RegExp(patternValues.length ? `^(${patternValues.map((o) => core_util/* escapeRegex */.sD(o.toString())).join("|")})$` : "^[^\\s\\S]$");
    });
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (valuesSet.has(input)) {
            return payload;
        }
        payload.issues.push({
            code: "invalid_value",
            values,
            input,
            inst,
        });
        return payload;
    };
});
const $ZodLiteral = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    const values = new Set(def.values);
    inst._zod.values = values;
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => {
        const vals = zod.def.values;
        // unmatchable fallback, RE2-safe: an empty alternation would compile to /^()$/, which matches ""
        return new RegExp(vals.length
            ? `^(${vals
                .map((o) => typeof o === "string" ? core_util/* escapeRegex */.sD(o) : o ? core_util/* escapeRegex */.sD(o.toString()) : String(o))
                .join("|")})$`
            : "^[^\\s\\S]$");
    });
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (values.has(input)) {
            return payload;
        }
        payload.issues.push({
            code: "invalid_value",
            values: def.values,
            input,
            inst,
        });
        return payload;
    };
});
const $ZodFile = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodFile", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        // @ts-ignore
        if (input instanceof File)
            return payload;
        payload.issues.push({
            expected: "file",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodTransform = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodTransform", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    core_core/* globalConfig */.cr.memoizer?.guard(inst);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            throw new core_core/* $ZodEncodeError */.cV(inst.constructor.name);
        }
        const _out = def.transform(payload.value, payload);
        if (ctx.async) {
            const output = _out instanceof Promise ? _out : Promise.resolve(_out);
            return output.then((output) => {
                payload.value = output;
                return payload;
            });
        }
        if (_out instanceof Promise) {
            throw new core_core/* $ZodAsyncError */.GT();
        }
        payload.value = _out;
        return payload;
    };
});
function handleOptionalResult(payload, result) {
    // A substituting schema that still failed has no usable answer; yield undefined. Its issues are simply dropped: it ran on a payload of its own, so there is no shared array to truncate and nothing of the caller's to lose with it.
    payload.value = result.issues.length ? undefined : result.value;
    return payload;
}
const $ZodOptional = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodOptional", (inst, def) => {
    $ZodType.init(inst, def);
    // .optional() propagates absence rather than substituting for it, so a defaulted inner keeps its rung.
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
    inst._zod.optout = "optional";
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => {
        const values = zod.def.innerType._zod.values;
        return values ? new Set([...values, undefined]) : undefined;
    });
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => {
        const pattern = zod.def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${core_util/* cleanRegex */.p6(pattern.source)})?$`) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        if (payload.value === undefined) {
            // Only the top rung substitutes a value for absence; everything else leaves it intact, which is what .optional() means.
            if (def.innerType._zod.optin !== "defaulted")
                return payload;
            // Its own payload, for the same reason $ZodCatch gets one: a pipe forwards an unrecognized key through the caller's issues array, and this must not read that as the substituting schema failing and drop it.
            const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
            if (result instanceof Promise)
                return result.then((result) => handleOptionalResult(payload, result));
            return handleOptionalResult(payload, result);
        }
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodExactOptional = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodExactOptional", (inst, def) => {
    // Call parent init - inherits optin/optout = "optional"
    $ZodOptional.init(inst, def);
    // Override values/pattern to NOT add undefined
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => zod.def.innerType._zod.values);
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
    // Override parse to just delegate (no undefined handling)
    inst._zod.parse = (payload, ctx) => {
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodNullable = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNullable", (inst, def) => {
    $ZodType.init(inst, def);
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.def.innerType._zod.optin);
    core_util/* defineLazyInternal */.v5(inst, "optout", (zod) => zod.def.innerType._zod.optout);
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => {
        const pattern = zod.def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${core_util/* cleanRegex */.p6(pattern.source)}|null)$`) : undefined;
    });
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => {
        return zod.def.innerType._zod.values ? new Set([...zod.def.innerType._zod.values, null]) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        // Forward direction (decode): allow null to pass through
        if (payload.value === null)
            return payload;
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodDefault = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodDefault", (inst, def) => {
    $ZodType.init(inst, def);
    // inst._zod.qin = "true";
    inst._zod.optin = "defaulted";
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => zod.def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        // Forward direction (decode): apply defaults for undefined input
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
            /**
             * $ZodDefault returns the default value immediately in forward direction.
             * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
            return payload;
        }
        // Forward direction: continue with default handling
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleDefaultResult(result, def));
        }
        return handleDefaultResult(result, def);
    };
});
function handleDefaultResult(payload, def) {
    if (payload.value === undefined) {
        payload.value = def.defaultValue;
    }
    return payload;
}
const $ZodPrefault = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodPrefault", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "defaulted";
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => zod.def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        // Forward direction (decode): apply prefault for undefined input
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
        }
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodNonOptional = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodNonOptional", (inst, def) => {
    $ZodType.init(inst, def);
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => {
        const v = zod.def.innerType._zod.values;
        return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleNonOptionalResult(result, inst));
        }
        return handleNonOptionalResult(result, inst);
    };
});
function handleNonOptionalResult(payload, inst) {
    if (!payload.issues.length && payload.value === undefined) {
        payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: payload.value,
            inst,
        });
    }
    return payload;
}
const $ZodSuccess = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodSuccess", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            throw new core.$ZodEncodeError("ZodSuccess");
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => {
                payload.value = result.issues.length === 0;
                return payload;
            });
        }
        payload.value = result.issues.length === 0;
        return payload;
    };
})));
function handleCatchResult(payload, result, def, ctx) {
    if (!result.issues.length) {
        payload.value = result.value;
        // The value carries up, so the flag describing it has to carry with it: a back-edge into a node still being parsed must not be frozen by an enclosing readonly, and its checks belong to the node itself. Guarded so the ordinary case adds no own property.
        if (result.memo)
            payload.memo = true;
        return payload;
    }
    // Spread the inner's own payload, not ours: `value` has to stay the input the catch was handed, and the inner ran on a payload of its own so its issues are already private to this call.
    payload.value = def.catchValue({
        ...result,
        value: payload.value,
        error: {
            issues: result.issues.map((iss) => core_util/* finalizeIssue */.iR(iss, ctx, core_core/* config */.$W())),
        },
        input: payload.value,
    });
    return payload;
}
const $ZodCatch = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodCatch", (inst, def) => {
    $ZodType.init(inst, def);
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
    core_util/* defineLazyInternal */.v5(inst, "optout", (zod) => zod.def.innerType._zod.optout);
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => zod.def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        // Forward direction (decode): apply catch logic
        const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleCatchResult(payload, result, def, ctx));
        }
        return handleCatchResult(payload, result, def, ctx);
    };
});
const $ZodNaN = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodNaN", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
            payload.issues.push({
                input: payload.value,
                inst,
                expected: "nan",
                code: "invalid_type",
            });
            return payload;
        }
        return payload;
    };
})));
const $ZodPipe = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodPipe", (inst, def) => {
    $ZodType.init(inst, def);
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => zod.def.in._zod.values);
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.def.in._zod.optin);
    core_util/* defineLazyInternal */.v5(inst, "optout", (zod) => zod.def.out._zod.optout);
    core_util/* defineLazyInternal */.v5(inst, "propValues", (zod) => zod.def.in._zod.propValues);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            const right = def.out._zod.run(payload, ctx);
            if (right instanceof Promise) {
                return right.then((right) => handlePipeResult(right, def.in, ctx));
            }
            return handlePipeResult(right, def.in, ctx);
        }
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
            return left.then((left) => handlePipeResult(left, def.out, ctx));
        }
        return handlePipeResult(left, def.out, ctx);
    };
});
function handlePipeResult(left, next, ctx) {
    // Any issue stops the pipe, so a failing refinement never feeds its transform. An unrecognized key is the exception: it describes the input's extra properties, not the value being piped, and an enclosing intersection may yet reconcile it.
    if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
        // prevent further checks
        left.aborted = true;
        return left;
    }
    return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
const $ZodCodec = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCodec", (inst, def) => {
    $ZodType.init(inst, def);
    util.defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
    util.defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
    util.defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
    util.defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
    inst._zod.parse = (payload, ctx) => {
        const direction = ctx.direction || "forward";
        if (direction === "forward") {
            const left = def.in._zod.run(payload, ctx);
            if (left instanceof Promise) {
                return left.then((left) => handleCodecAResult(left, def, ctx));
            }
            return handleCodecAResult(left, def, ctx);
        }
        else {
            const right = def.out._zod.run(payload, ctx);
            if (right instanceof Promise) {
                return right.then((right) => handleCodecAResult(right, def, ctx));
            }
            return handleCodecAResult(right, def, ctx);
        }
    };
})));
function handleCodecAResult(result, def, ctx) {
    if (result.issues.length) {
        // prevent further checks
        result.aborted = true;
        return result;
    }
    const direction = ctx.direction || "forward";
    if (direction === "forward") {
        const transformed = def.transform(result.value, result);
        if (transformed instanceof Promise) {
            return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
        }
        return handleCodecTxResult(result, transformed, def.out, ctx);
    }
    else {
        const transformed = def.reverseTransform(result.value, result);
        if (transformed instanceof Promise) {
            return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
        }
        return handleCodecTxResult(result, transformed, def.in, ctx);
    }
}
function handleCodecTxResult(left, value, nextSchema, ctx) {
    // Check if transform added any issues
    if (left.issues.length) {
        left.aborted = true;
        return left;
    }
    return nextSchema._zod.run({ value, issues: left.issues }, ctx);
}
const $ZodPreprocess = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodPreprocess", (inst, def) => {
    $ZodPipe.init(inst, def);
})));
const $ZodReadonly = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodReadonly", (inst, def) => {
    $ZodType.init(inst, def);
    core_util/* defineLazyInternal */.v5(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
    core_util/* defineLazyInternal */.v5(inst, "values", (zod) => zod.def.innerType._zod.values);
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
    core_util/* defineLazyInternal */.v5(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then(handleReadonlyResult);
        }
        return handleReadonlyResult(result);
    };
});
function handleReadonlyResult(payload) {
    // A repeat visit hands back a node that is still being built; freezing it here would make the rest of its keys fail to assign.
    if (!payload.memo)
        payload.value = Object.freeze(payload.value);
    return payload;
}
// a leaf's pattern source with its own checks folded in: the last pattern-carrying check wins, else length bounds narrow the catch-all, else an integer format narrows the number form. the fold lives here instead of on `_zod.pattern` so a bundle without template literals never pays for it
function leafPattern(schema) {
    const def = schema._zod.def;
    let pattern = def.pattern;
    let isInt = !!def.format?.includes("int");
    let minimum;
    let maximum;
    for (const ch of def.checks ?? []) {
        const d = ch._zod.def;
        if (d.pattern)
            pattern = d.pattern;
        isInt || (isInt = !!d.format?.includes("int"));
        const lo = d.minimum ?? d.length;
        const hi = d.maximum ?? d.length;
        if (lo !== undefined && (minimum === undefined || lo > minimum))
            minimum = lo;
        if (hi !== undefined && (maximum === undefined || hi < maximum))
            maximum = hi;
    }
    if (pattern)
        return pattern.source;
    // an empty range matches nothing at runtime, and `{8,5}` is not a legal quantifier
    if (minimum !== undefined && maximum !== undefined && minimum > maximum)
        return "(?!)";
    if (minimum !== undefined || maximum !== undefined)
        return regexes.string({ minimum, maximum }).source;
    const own = schema._zod.pattern;
    return (isInt && own === regexes.number ? regexes.integer : own)?.source;
}
// a part's pattern source. a wrapper's pattern embeds its inner pattern's source verbatim, so the folded form is substituted in place without knowing the wrapper's own composition; a union's options are joined the way the union builds its own pattern
function partPattern(schema) {
    const def = schema._zod.def;
    const own = schema._zod.pattern?.source;
    // lazy resolves its inner on the internals, not the def
    const inner = def.innerType ?? schema._zod.innerType;
    if (inner) {
        const before = inner._zod.pattern?.source;
        const after = partPattern(inner);
        if (own && before && after && after !== before) {
            return own.replace(util.cleanRegex(before), () => util.cleanRegex(after));
        }
        return own;
    }
    if (def.options) {
        const sources = def.options.map(partPattern);
        if (sources.every(Boolean))
            return `^(${sources.map((s) => util.cleanRegex(s)).join("|")})$`;
    }
    return leafPattern(schema);
}
const $ZodTemplateLiteral = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodTemplateLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    const regexParts = [];
    for (const part of def.parts) {
        if (typeof part === "object" && part !== null) {
            // is Zod schema
            const source = partPattern(part);
            if (!source) {
                throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
            }
            regexParts.push(util.cleanRegex(source));
        }
        else if (part === null || util.primitiveTypes.has(typeof part)) {
            regexParts.push(util.escapeRegex(`${part}`));
        }
        else {
            throw new Error(`Invalid template literal part: ${part}`);
        }
    }
    inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
    inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "string") {
            payload.issues.push({
                input: payload.value,
                inst,
                expected: "string",
                code: "invalid_type",
            });
            return payload;
        }
        inst._zod.pattern.lastIndex = 0;
        if (!inst._zod.pattern.test(payload.value)) {
            payload.issues.push({
                input: payload.value,
                inst,
                code: "invalid_format",
                format: def.format ?? "template_literal",
                pattern: inst._zod.pattern.source,
            });
            return payload;
        }
        return payload;
    };
})));
const $ZodFunction = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodFunction", (inst, def) => {
    $ZodType.init(inst, def);
    // Defined, not assigned: the classic prototype exposes `_def` as a getter with no setter.
    Object.defineProperty(inst, "_def", { value: def });
    inst._zod.def = def;
    inst.implement = (func) => {
        if (typeof func !== "function") {
            throw new Error("implement() must be called with a function");
        }
        // Defined inline so the closure stays anonymous: binding it to a `const` first names it, which costs 256 bytes per implemented function.
        return Object.defineProperty(function (...args) {
            const parsedArgs = inst._def.input ? parse(inst._def.input, args) : args;
            const result = Reflect.apply(func, this, parsedArgs);
            if (inst._def.output) {
                return parse(inst._def.output, result);
            }
            return result;
        }, "_zod", { value: inst._zod, enumerable: false });
    };
    inst.implementAsync = (func) => {
        if (typeof func !== "function") {
            throw new Error("implementAsync() must be called with a function");
        }
        return Object.defineProperty(async function (...args) {
            const parsedArgs = inst._def.input ? await parseAsync(inst._def.input, args) : args;
            const result = await Reflect.apply(func, this, parsedArgs);
            if (inst._def.output) {
                return await parseAsync(inst._def.output, result);
            }
            return result;
        }, "_zod", { value: inst._zod, enumerable: false });
    };
    inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "function") {
            payload.issues.push({
                code: "invalid_type",
                expected: "function",
                input: payload.value,
                inst,
            });
            return payload;
        }
        // Check if output is a promise type to determine if we should use async implementation
        const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
        if (hasPromiseOutput) {
            payload.value = inst.implementAsync(payload.value);
        }
        else {
            payload.value = inst.implement(payload.value);
        }
        return payload;
    };
    inst.input = (...args) => {
        const F = inst.constructor;
        if (Array.isArray(args[0])) {
            return new F({
                type: "function",
                input: new $ZodTuple({
                    type: "tuple",
                    items: args[0],
                    rest: args[1],
                }),
                output: inst._def.output,
            });
        }
        return new F({
            type: "function",
            input: args[0],
            output: inst._def.output,
        });
    };
    inst.output = (output) => {
        const F = inst.constructor;
        return new F({
            type: "function",
            input: inst._def.input,
            output,
        });
    };
    return inst;
})));
const $ZodPromise = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodPromise", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
    };
})));
const $ZodLazy = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodLazy", (inst, def) => {
    $ZodType.init(inst, def);
    // Cache the resolved inner type on the shared `def` so all clones of this lazy (e.g. via `.describe()`/`.meta()`) share the same inner instance, preserving identity for cycle detection on recursive schemas.
    core_util/* defineLazy */.gJ(inst._zod, "innerType", () => {
        const d = def;
        if (!d._cachedInner)
            d._cachedInner = def.getter();
        return d._cachedInner;
    });
    core_util/* defineLazyInternal */.v5(inst, "pattern", (zod) => zod.innerType?._zod?.pattern);
    core_util/* defineLazyInternal */.v5(inst, "propValues", (zod) => zod.innerType?._zod?.propValues);
    core_util/* defineLazyInternal */.v5(inst, "optin", (zod) => zod.innerType?._zod?.optin ?? undefined);
    core_util/* defineLazyInternal */.v5(inst, "optout", (zod) => zod.innerType?._zod?.optout ?? undefined);
    inst._zod.parse = (payload, ctx) => {
        const inner = inst._zod.innerType;
        return inner._zod.run(payload, ctx);
    };
});
const $ZodCustom = /*@__PURE__*/ core_core/* $constructor */.xI("$ZodCustom", (inst, def) => {
    core_checks/* $ZodCheck */.QP.init(inst, def);
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _) => {
        return payload;
    };
    inst._zod.check = (payload) => {
        const input = payload.value;
        const r = def.fn(input);
        if (r instanceof Promise) {
            return r.then((r) => handleRefineResult(r, payload, input, inst));
        }
        handleRefineResult(r, payload, input, inst);
        return;
    };
});
function handleRefineResult(result, payload, input, inst) {
    if (!result) {
        const _iss = {
            code: "custom",
            input,
            inst, // incorporates params.error into issue reporting
            path: [...(inst._zod.def.path ?? [])], // incorporates params.error into issue reporting
            continue: !inst._zod.def.abort,
            // params: inst._zod.def.params,
        };
        if (inst._zod.def.params)
            _iss.params = inst._zod.def.params;
        payload.issues.push(core_util/* issue */.sn(_iss));
    }
}


/***/ }),

/***/ 75920:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Lp: () => (/* binding */ processSchema),
/* harmony export */   OA: () => (/* binding */ createToJSONSchemaMethod),
/* harmony export */   Wb: () => (/* binding */ extractDefs),
/* harmony export */   _S: () => (/* binding */ handleUnrepresentable),
/* harmony export */   az: () => (/* binding */ initializeContext),
/* harmony export */   jE: () => (/* binding */ finalize),
/* harmony export */   uE: () => (/* binding */ createStandardJSONSchemaMethod)
/* harmony export */ });
/* unused harmony export process */
/* harmony import */ var _registries_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(56045);
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24366);


function assignProps(target, ...sources) {
    for (const source of sources) {
        for (const key of Reflect.ownKeys(source)) {
            if (Object.prototype.propertyIsEnumerable.call(source, key)) {
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .assignProp */ .Vy)(target, key, source[key]);
            }
        }
    }
    return target;
}
// function initializeContext<T extends schemas.$ZodType>(inputs: JSONSchemaGeneratorParams<T>): ToJSONSchemaContext<T> {
//   return {
//     processor: inputs.processor,
//     metadataRegistry: inputs.metadata ?? globalRegistry,
//     target: inputs.target ?? "draft-2020-12",
//     unrepresentable: inputs.unrepresentable ?? "throw",
//   };
// }
function initializeContext(params) {
    // Normalize target: convert old non-hyphenated versions to hyphenated versions
    let target = params?.target ?? "draft-2020-12";
    if (target === "draft-4")
        target = "draft-04";
    if (target === "draft-7")
        target = "draft-07";
    return {
        processors: params.processors ?? {},
        metadataRegistry: params?.metadata ?? _registries_js__WEBPACK_IMPORTED_MODULE_1__/* .globalRegistry */ .fd,
        target,
        unrepresentable: params?.unrepresentable ?? "throw",
        override: params?.override ?? (() => { }),
        io: params?.io ?? "output",
        counter: 0,
        seen: new Map(),
        sharedDefsExtractedFor: undefined,
        sharedEmitDoneFor: undefined,
        cycles: params?.cycles ?? "ref",
        reused: params?.reused ?? "inline",
        intersections: [],
        deferred: [],
        external: params?.external ?? undefined,
    };
}
/**
 * Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
 * `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
 * custom JSON Schema was written into `json`, in which case the caller must not write its own.
 */
function handleUnrepresentable(schema, ctx, json, params, message) {
    const result = typeof ctx.unrepresentable === "function"
        ? ctx.unrepresentable({ zodSchema: schema, path: params.path, message })
        : ctx.unrepresentable;
    if (result === "any")
        return false;
    if (result === undefined || result === "throw")
        throw new Error(message);
    Object.assign(json, result);
    return true;
}
// never rename this back to `process`: bundler polyfills inject a top-level `const process` that a lexical declaration of the same name collides with (#6397)
function processSchema(schema, ctx, _params = { path: [], schemaPath: [] }) {
    var _a;
    const def = schema._zod.def;
    // check for schema in seens
    const seen = ctx.seen.get(schema);
    if (seen) {
        seen.count++;
        // check if cycle
        const isCycle = _params.schemaPath.includes(schema);
        if (isCycle) {
            seen.cycle = _params.path;
        }
        return seen.schema;
    }
    // initialize
    const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
    ctx.seen.set(schema, result);
    ctx.sharedDefsExtractedFor = undefined;
    ctx.sharedEmitDoneFor = undefined;
    // custom method overrides default behavior
    const overrideSchema = schema._zod.toJSONSchema?.();
    if (overrideSchema) {
        result.schema = overrideSchema;
    }
    else {
        const params = {
            ..._params,
            schemaPath: [..._params.schemaPath, schema],
            path: _params.path,
        };
        if (schema._zod.processJSONSchema) {
            schema._zod.processJSONSchema(ctx, result.schema, params);
        }
        else {
            const _json = result.schema;
            const processor = ctx.processors[def.type];
            if (!processor) {
                throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
            }
            processor(schema, ctx, _json, params);
        }
        const parent = schema._zod.parent;
        if (parent) {
            // Also set ref if processor didn't (for inheritance)
            if (!result.ref)
                result.ref = parent;
            processSchema(parent, ctx, params);
            ctx.seen.get(parent).isParent = true;
        }
    }
    // metadata
    const meta = ctx.metadataRegistry.get(schema);
    if (meta)
        assignProps(result.schema, meta);
    if (ctx.io === "input" && isTransforming(schema)) {
        // examples/defaults only apply to output type of pipe
        delete result.schema.examples;
        delete result.schema.default;
    }
    // set prefault as default
    if (ctx.io === "input" && "_prefault" in result.schema)
        (_a = result.schema).default ?? (_a.default = result.schema._prefault);
    delete result.schema._prefault;
    // pulling fresh from ctx.seen in case it was overwritten
    const _result = ctx.seen.get(schema);
    return _result.schema;
}
/** @deprecated Renamed to `processSchema`. An export alias declares no binding, so it is safe to keep. */

// Escape a reference token for use in a JSON Pointer fragment (RFC 6901): `~` becomes `~0` and `/` becomes `~1`. The `~` replacement must run first.
function encodeJSONPointerSegment(segment) {
    return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema
// params: EmitParams
) {
    // iterate over seen map;
    const root = ctx.seen.get(schema);
    if (!root)
        throw new Error("Unprocessed schema. This is a bug in Zod.");
    // With `external` set, every registered schema resolves through the external branch of `makeURI`, so the root branch below produces the same ref the external branch would — this pass is identical whichever schema it is called with, and only needs to run once.
    if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external)
        return;
    // Track ids to detect duplicates across different schemas
    const idToSchema = new Map();
    for (const entry of ctx.seen.entries()) {
        const id = ctx.metadataRegistry.get(entry[0])?.id;
        if (id) {
            const existing = idToSchema.get(id);
            if (existing && existing !== entry[0]) {
                throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
            }
            idToSchema.set(id, entry[0]);
        }
    }
    // returns a ref to the schema defId will be empty if the ref points to an external schema (or #)
    const makeURI = (entry) => {
        // comparing the seen objects because sometimes multiple schemas map to the same seen object. e.g. lazy
        // external is configured
        const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
        if (ctx.external) {
            const externalId = ctx.external.registry.get(entry[0])?.id; // ?? "__shared";// `__schema${ctx.counter++}`;
            // check if schema is in the external registry
            const uriGenerator = ctx.external.uri ?? ((id) => id);
            if (externalId) {
                return { ref: uriGenerator(externalId) };
            }
            // otherwise, add to __shared
            const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
            entry[1].defId = id; // set defId so it will be reused if needed
            return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}` };
        }
        const uriPrefix = `#`;
        const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
        // an id-less root has nowhere to be extracted to, so it stays inline and self-references as `#`
        if (entry[1] === root && !entry[1].schema.id) {
            return { ref: uriPrefix };
        }
        // self-contained schema
        const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
        return { defId, ref: defUriPrefix + encodeJSONPointerSegment(defId) };
    };
    // stored cached version in `def` property remove all properties, set $ref
    const extractToDef = (entry) => {
        // if the schema is already a reference, do not extract it
        if (entry[1].schema.$ref) {
            return;
        }
        const seen = entry[1];
        const { ref, defId } = makeURI(entry);
        seen.def = { ...seen.schema };
        // defId won't be set if the schema is a reference to an external schema or if the schema is the root schema
        if (defId)
            seen.defId = defId;
        // wipe away all properties except $ref
        const schema = seen.schema;
        for (const key in schema) {
            delete schema[key];
        }
        schema.$ref = ref;
    };
    // throw on cycles
    // break cycles
    if (ctx.cycles === "throw") {
        for (const entry of ctx.seen.entries()) {
            const seen = entry[1];
            if (seen.cycle) {
                throw new Error("Cycle detected: " +
                    `#/${seen.cycle?.join("/")}/<root>` +
                    '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
            }
        }
    }
    // extract schemas into $defs
    for (const entry of ctx.seen.entries()) {
        const seen = entry[1];
        // convert root schema to # $ref
        if (schema === entry[0]) {
            extractToDef(entry); // this has special handling for the root schema
            continue;
        }
        // extract schemas that are in the external registry
        if (ctx.external) {
            const ext = ctx.external.registry.get(entry[0])?.id;
            if (schema !== entry[0] && ext) {
                extractToDef(entry);
                continue;
            }
        }
        // extract schemas with `id` meta
        const id = ctx.metadataRegistry.get(entry[0])?.id;
        if (id) {
            extractToDef(entry);
            continue;
        }
        // break cycles
        if (seen.cycle) {
            // any
            extractToDef(entry);
            continue;
        }
        // extract reused schemas
        if (seen.count > 1) {
            if (ctx.reused === "ref") {
                extractToDef(entry);
            }
        }
    }
    if (ctx.external)
        ctx.sharedDefsExtractedFor = ctx.external;
}
/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
function compactTypeUnion(schema) {
    const options = schema.anyOf;
    if (!Array.isArray(options) || options.length === 0 || schema.type !== undefined)
        return;
    const types = [];
    for (const option of options) {
        if (!option || typeof option !== "object")
            return;
        // A branch that is itself a compactible union folds into this one — nested `anyOf` and a flat `type` array say the same thing. Compacting it first also makes the result independent of the order this pass walks the seen map in.
        compactTypeUnion(option);
        const keys = Object.keys(option);
        if (keys.length !== 1 || keys[0] !== "type")
            return;
        const type = option.type;
        for (const member of Array.isArray(type) ? type : [type]) {
            if (typeof member !== "string")
                return;
            if (!types.includes(member))
                types.push(member);
        }
    }
    delete schema.anyOf;
    // A `type` array must be non-empty and unique (metaschema); a single member is spelled as a bare string.
    schema.type = types.length === 1 ? types[0] : types;
}
/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
 * an annotation like `description` — makes a member unfoldable, so a constraint this does not
 * understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
const FOLDABLE_KEYS = new Set(["type", "properties", "required", "additionalProperties"]);
const UNION_KEYS = ["oneOf", "anyOf"];
/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
function undeclaredConstraint(member) {
    const extra = member.additionalProperties;
    if (extra === undefined || extra === false || typeof extra !== "object" || extra === null)
        return null;
    return Object.keys(extra).length ? extra : null;
}
/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
function foldObjects(members) {
    const objects = [];
    for (const member of members) {
        // A boolean subschema is legal JSON Schema and carries no keywords to fold.
        if (typeof member !== "object" || member.type !== "object")
            return null;
        for (const key in member) {
            if (!FOLDABLE_KEYS.has(key))
                return null;
        }
        objects.push(member);
    }
    const properties = {};
    const required = new Set();
    for (const object of objects) {
        for (const key in object.properties) {
            // `in` would report a `__proto__` key as already present via the prototype chain and skip it.
            if (Object.prototype.hasOwnProperty.call(properties, key))
                continue;
            // Every member constrains this key: the ones that declare it say how, and a `catchall` member constrains it too even though it does not name it. The key has to satisfy all of them, which is the same intersection one level down.
            const parts = [];
            for (const other of objects) {
                const part = other.properties?.[key] ?? undeclaredConstraint(other);
                if (part === null || part === undefined)
                    continue;
                if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part)))
                    parts.push(part);
            }
            const merged = parts.length === 1
                ? parts[0]
                : (foldObjects(parts) ?? { allOf: parts });
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .assignProp */ .Vy)(properties, key, merged);
        }
        for (const key of object.required ?? [])
            required.add(key);
    }
    const folded = { type: "object", properties };
    if (required.size)
        folded.required = [...required];
    // A key no member declares is rejected only when every member rejects it, so the fold is closed only when every member is. Otherwise it carries whatever the `catchall` members demand of such a key.
    if (objects.every((object) => object.additionalProperties === false)) {
        folded.additionalProperties = false;
    }
    else {
        const constraints = [];
        for (const object of objects) {
            const constraint = undeclaredConstraint(object);
            if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint)))
                constraints.push(constraint);
        }
        if (constraints.length === 1)
            folded.additionalProperties = constraints[0];
        else if (constraints.length > 1)
            folded.additionalProperties = { allOf: constraints };
    }
    return folded;
}
/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
 * closed object members reject each other's keys and the schema validates nothing. Zod's parser
 * pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
 * *every* side rejects it — so the emitted schema has to pool them too, and folding the members
 * into one object is the encoding that says so on every target.
 *
 * This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
 * machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
 * keeps its reference and its own closedness rather than being inlined as a stale copy. */
function foldIntersection(json) {
    const allOf = json.allOf;
    if (!Array.isArray(allOf) || allOf.length < 2)
        return;
    // An `override` runs before this pass and may have written object keywords onto the intersection itself. Those are deliberate, so decline rather than overwrite them.
    for (const key of FOLDABLE_KEYS)
        if (key in json)
            return;
    // An intersection distributes over a union: `A & (X | Y)` is `(A & X) | (A & Y)`. Only the first union is distributed over; a second one stays among the members every branch folds against, where it fails the object check and declines the whole intersection rather than multiplying out.
    const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
    let folded = null;
    if (!unions.length) {
        folded = foldObjects(allOf);
    }
    else {
        const union = unions[0];
        const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
        if (Object.keys(union).length !== 1)
            return;
        const rest = allOf.filter((m) => m !== union);
        const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
        if (branches.some((b) => !b))
            return;
        folded = { [keyword]: branches };
    }
    if (!folded)
        return;
    delete json.allOf;
    assignProps(json, folded);
}
function finalize(ctx, schema) {
    const root = ctx.seen.get(schema);
    if (!root)
        throw new Error("Unprocessed schema. This is a bug in Zod.");
    // flatten refs - inherit properties from parent schemas
    const flattenRef = (zodSchema) => {
        const seen = ctx.seen.get(zodSchema);
        // already processed
        if (seen.ref === null)
            return;
        const schema = seen.def ?? seen.schema;
        const _cached = { ...schema };
        const ref = seen.ref;
        seen.ref = null; // prevent infinite recursion
        if (ref) {
            flattenRef(ref);
            const refSeen = ctx.seen.get(ref);
            const refSchema = refSeen.schema;
            // merge referenced schema into current
            if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
                // older drafts can't combine $ref with other properties
                schema.allOf = schema.allOf ?? [];
                schema.allOf.push(refSchema);
            }
            else {
                assignProps(schema, refSchema);
            }
            // restore child's own properties (child wins)
            assignProps(schema, _cached);
            const isParentRef = zodSchema._zod.parent === ref;
            // For parent chain, child is a refinement - remove parent-only properties
            if (isParentRef) {
                for (const key in schema) {
                    if (key === "$ref" || key === "allOf")
                        continue;
                    if (!(key in _cached)) {
                        delete schema[key];
                    }
                }
            }
            // When ref was extracted to $defs, remove properties that match the definition
            if (refSchema.$ref && refSeen.def) {
                for (const key in schema) {
                    if (key === "$ref" || key === "allOf")
                        continue;
                    if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
                        delete schema[key];
                    }
                }
            }
        }
        // If parent was extracted (has $ref), propagate $ref to this schema. This handles cases like: readonly().meta({id}).describe() where processor sets ref to innerType but parent should be referenced
        const parent = zodSchema._zod.parent;
        if (parent && parent !== ref) {
            // Ensure parent is processed first so its def has inherited properties
            flattenRef(parent);
            const parentSeen = ctx.seen.get(parent);
            if (parentSeen?.schema.$ref) {
                schema.$ref = parentSeen.schema.$ref;
                // De-duplicate with parent's definition
                if (parentSeen.def) {
                    for (const key in schema) {
                        if (key === "$ref" || key === "allOf")
                            continue;
                        if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
                            delete schema[key];
                        }
                    }
                }
            }
        }
        // execute overrides
        ctx.override({
            zodSchema: zodSchema,
            jsonSchema: schema,
            path: seen.path ?? [],
        });
    };
    // Flattening walks the whole map and clears each `ref` as it goes, so a second call over the same map is a no-op scan. Skip it outright once it has run for a registry conversion.
    if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
        for (const entry of [...ctx.seen.entries()].reverse()) {
            flattenRef(entry[0]);
        }
        if (ctx.target !== "openapi-3.0") {
            for (const entry of ctx.seen.entries()) {
                compactTypeUnion(entry[1].def ?? entry[1].schema);
            }
        }
        for (const rewrite of ctx.deferred)
            rewrite();
        // After flattening, every member that was extracted is a `$ref`, so the fold sees the final shape. A schema that inherits an intersection — through `z.lazy`, or any `ref` chain — holds the same `allOf` array, so fold by array identity to catch every copy.
        if (ctx.intersections.length) {
            const carriers = new Map();
            for (const seen of ctx.seen.values()) {
                for (const json of [seen.schema, seen.def]) {
                    const allOf = json?.allOf;
                    if (!Array.isArray(allOf))
                        continue;
                    const existing = carriers.get(allOf);
                    if (existing)
                        existing.push(json);
                    else
                        carriers.set(allOf, [json]);
                }
            }
            for (const allOf of ctx.intersections) {
                for (const json of carriers.get(allOf) ?? [])
                    foldIntersection(json);
            }
        }
    }
    const result = {};
    if (ctx.target === "draft-2020-12") {
        result.$schema = "https://json-schema.org/draft/2020-12/schema";
    }
    else if (ctx.target === "draft-07") {
        result.$schema = "http://json-schema.org/draft-07/schema#";
    }
    else if (ctx.target === "draft-04") {
        result.$schema = "http://json-schema.org/draft-04/schema#";
    }
    else if (ctx.target === "openapi-3.0") {
        // OpenAPI 3.0 schema objects should not include a $schema property
    }
    else {
        // Arbitrary string values are allowed but won't have a $schema property set
    }
    if (ctx.external?.uri) {
        const id = ctx.external.registry.get(schema)?.id;
        if (!id)
            throw new Error("Schema is missing an `id` property");
        result.$id = ctx.external.uri(id);
    }
    // when the root was extracted into $defs, `root.schema` is the `$ref` wrapper and `root.def` is the body that now lives under $defs
    assignProps(result, root.defId ? root.schema : (root.def ?? root.schema));
    // The `id` in `.meta()` is a Zod-specific registration tag used to extract schemas into $defs — it is not user-facing JSON Schema metadata. Strip it from the output body where it would otherwise leak. The id is preserved implicitly via the $defs key (and via $ref paths).
    const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
    if (rootMetaId !== undefined && result.id === rootMetaId)
        delete result.id;
    // build defs object. With `external`, `defs` is the shared object every schema writes into, so the same entries are reassigned on every call. Without it, `defs` is fresh per call and must be rebuilt.
    const defs = ctx.external?.defs ?? {};
    if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
        for (const entry of ctx.seen.entries()) {
            const seen = entry[1];
            if (seen.def && seen.defId) {
                if (seen.def.id === seen.defId)
                    delete seen.def.id;
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__/* .assignProp */ .Vy)(defs, seen.defId, seen.def);
            }
        }
    }
    if (ctx.external)
        ctx.sharedEmitDoneFor = ctx.external;
    // set definitions in result
    if (ctx.external) {
    }
    else {
        if (Object.keys(defs).length > 0) {
            if (ctx.target === "draft-2020-12") {
                result.$defs = defs;
            }
            else {
                result.definitions = defs;
            }
        }
    }
    try {
        // this "finalizes" this schema and ensures all cycles are removed each call to finalize() is functionally independent though the seen map is shared
        const finalized = JSON.parse(JSON.stringify(result));
        Object.defineProperty(finalized, "~standard", {
            value: {
                ...schema["~standard"],
                jsonSchema: {
                    input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
                    output: createStandardJSONSchemaMethod(schema, "output", ctx.processors),
                },
            },
            enumerable: false,
            writable: false,
        });
        return finalized;
    }
    catch (_err) {
        throw new Error("Error converting schema to JSON.");
    }
}
function isTransforming(_schema, _ctx) {
    const ctx = _ctx ?? { seen: new Set() };
    if (ctx.seen.has(_schema))
        return false;
    ctx.seen.add(_schema);
    const def = _schema._zod.def;
    if (def.type === "transform")
        return true;
    if (def.type === "array")
        return isTransforming(def.element, ctx);
    if (def.type === "set")
        return isTransforming(def.valueType, ctx);
    if (def.type === "lazy")
        return isTransforming(def.getter(), ctx);
    if (def.type === "promise" ||
        def.type === "optional" ||
        def.type === "nonoptional" ||
        def.type === "nullable" ||
        def.type === "readonly" ||
        def.type === "default" ||
        def.type === "prefault" ||
        def.type === "catch") {
        return isTransforming(def.innerType, ctx);
    }
    if (def.type === "intersection") {
        return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
    }
    if (def.type === "record" || def.type === "map") {
        return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
    }
    if (def.type === "pipe") {
        if (_schema._zod.traits.has("$ZodCodec"))
            return true;
        return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
    }
    if (def.type === "object") {
        for (const key in def.shape) {
            if (isTransforming(def.shape[key], ctx))
                return true;
        }
        return false;
    }
    if (def.type === "union") {
        for (const option of def.options) {
            if (isTransforming(option, ctx))
                return true;
        }
        return false;
    }
    if (def.type === "tuple") {
        for (const item of def.items) {
            if (isTransforming(item, ctx))
                return true;
        }
        if (def.rest && isTransforming(def.rest, ctx))
            return true;
        return false;
    }
    return false;
}
/**
 * Creates a toJSONSchema method for a schema instance.
 * This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
 */
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
    const ctx = initializeContext({ ...params, processors });
    processSchema(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
    const { libraryOptions, target } = params ?? {};
    const ctx = initializeContext({ ...(libraryOptions ?? {}), target, io, processors });
    processSchema(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
};


/***/ }),

/***/ 24366:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A2: () => (/* binding */ normalizeParams),
/* harmony export */   B7: () => (/* binding */ stringifyPrimitive),
/* harmony export */   GW: () => (/* binding */ parsedType),
/* harmony export */   Gv: () => (/* binding */ isObject),
/* harmony export */   LG: () => (/* binding */ floatSafeRemainder),
/* harmony export */   MO: () => (/* binding */ rawShape),
/* harmony export */   NM: () => (/* binding */ optionalKeys),
/* harmony export */   NR: () => (/* binding */ BIGINT_FORMAT_RANGES),
/* harmony export */   O7: () => (/* binding */ codePointLength),
/* harmony export */   OH: () => (/* binding */ partial),
/* harmony export */   PO: () => (/* binding */ cached),
/* harmony export */   QH: () => (/* binding */ aborted),
/* harmony export */   Qd: () => (/* binding */ isPlainObject),
/* harmony export */   Rc: () => (/* binding */ getLengthableOrigin),
/* harmony export */   SS: () => (/* binding */ constantCatch),
/* harmony export */   UQ: () => (/* binding */ esc),
/* harmony export */   Up: () => (/* binding */ pick),
/* harmony export */   Vy: () => (/* binding */ assignProp),
/* harmony export */   W0: () => (/* binding */ safeExtend),
/* harmony export */   X: () => (/* binding */ installLazyProp),
/* harmony export */   X$: () => (/* binding */ extend),
/* harmony export */   Yv: () => (/* binding */ slugify),
/* harmony export */   cJ: () => (/* binding */ omit),
/* harmony export */   cl: () => (/* binding */ nullish),
/* harmony export */   d3: () => (/* binding */ attachSchema),
/* harmony export */   gJ: () => (/* binding */ defineLazy),
/* harmony export */   gx: () => (/* binding */ captureStackTrace),
/* harmony export */   h1: () => (/* binding */ merge),
/* harmony export */   hI: () => (/* binding */ allowsEval),
/* harmony export */   hi: () => (/* binding */ sizeCaps),
/* harmony export */   iR: () => (/* binding */ finalizeIssue),
/* harmony export */   jD: () => (/* binding */ hide),
/* harmony export */   jw: () => (/* binding */ joinValues),
/* harmony export */   k8: () => (/* binding */ jsonStringifyReplacer),
/* harmony export */   lQ: () => (/* binding */ prefixIssues),
/* harmony export */   mw: () => (/* binding */ required),
/* harmony export */   o8: () => (/* binding */ clone),
/* harmony export */   ol: () => (/* binding */ members),
/* harmony export */   p6: () => (/* binding */ cleanRegex),
/* harmony export */   qQ: () => (/* binding */ propertyKeyTypes),
/* harmony export */   qh: () => (/* binding */ own),
/* harmony export */   rL: () => (/* binding */ explicitlyAborted),
/* harmony export */   sD: () => (/* binding */ escapeRegex),
/* harmony export */   sn: () => (/* binding */ issue),
/* harmony export */   un: () => (/* binding */ derived),
/* harmony export */   v5: () => (/* binding */ defineLazyInternal),
/* harmony export */   w5: () => (/* binding */ getEnumValues),
/* harmony export */   yG: () => (/* binding */ shallowClone),
/* harmony export */   zH: () => (/* binding */ NUMBER_FORMAT_RANGES),
/* harmony export */   zM: () => (/* binding */ mergeDefs)
/* harmony export */ });
/* unused harmony exports assertEqual, assertNotEqual, toZod, assertIs, assertNever, assert, objectClone, cloneDef, getElementAtPath, promiseAllObject, randomString, numKeys, getParsedType, primitiveTypes, createTransparentProxy, unwrapMessage, getSizableOrigin, cleanEnum, base64ToUint8Array, uint8ArrayToBase64, base64urlToUint8Array, uint8ArrayToBase64url, hexToUint8Array, uint8ArrayToHex, Class, CONSTANT_CATCH */
/* harmony import */ var _core_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48149);

// functions
function assertEqual(val) {
    return val;
}
function assertNotEqual(val) {
    return val;
}
function toZod() {
    return (schema) => schema;
}
function assertIs(_arg) { }
function assertNever(_x) {
    throw new Error("Unexpected value in exhaustive check");
}
function assert(_) { }
function getEnumValues(entries) {
    const numericValues = Object.values(entries).filter((v) => typeof v === "number");
    const values = Object.entries(entries)
        .filter(([k, _]) => numericValues.indexOf(+k) === -1)
        .map(([_, v]) => v);
    return values;
}
function joinValues(array, separator = "|") {
    return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
        return value.toString();
    return value;
}
// the accessor lives on a shared prototype: an own accessor makes every box a dictionary-mode object (~360 B and a slow load per read against ~100 B and an inlined getter here)
class Cached {
    constructor(getter) {
        this._getter = getter;
        this._value = undefined;
    }
    get value() {
        const getter = this._getter;
        if (getter !== undefined) {
            this._value = getter();
            this._getter = undefined;
        }
        return this._value;
    }
}
function cached(getter) {
    return new Cached(getter);
}
function nullish(input) {
    return input === null || input === undefined;
}
function cleanRegex(source) {
    const start = source.startsWith("^") ? 1 : 0;
    const end = source.endsWith("$") ? source.length - 1 : source.length;
    return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
    const ratio = val / step;
    const roundedRatio = Math.round(ratio);
    // `val` and `step` each round to a double before the division rounds again, so a true decimal multiple's quotient can sit up to 1.5 of these scaled epsilons from the integer. A 1x tolerance therefore rejected 2.03 as a multiple of 0.07; 4x covers the worst case with margin.
    const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
    if (Math.abs(ratio - roundedRatio) < tolerance)
        return 0;
    return ratio - roundedRatio;
}
const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
function defineLazy(object, key, getter) {
    let value = undefined;
    Object.defineProperty(object, key, {
        get() {
            if (value === EVALUATING) {
                // Circular reference detected, return undefined to break the cycle
                return undefined;
            }
            if (value === undefined) {
                value = EVALUATING;
                value = getter();
            }
            return value;
        },
        set(v) {
            Object.defineProperty(object, key, {
                value: v,
                // configurable: true,
            });
            // object[key] = v;
        },
        configurable: true,
    });
}
function objectClone(obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
    Object.defineProperty(target, prop, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}
/**
 * Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
 *
 * Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
 */
function rawShape(def) {
    const desc = Object.getOwnPropertyDescriptor(def, "shape");
    return desc?.get ? desc.get.raw : desc?.value;
}
// where a builder reads its source's keys and descriptors, resolving only a shape a def answers for itself. A shape resolves by object spread, so only its enumerable keys are ever part of it.
function sourceShape(schema) {
    return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
// a key whose value is not settled yet, self-caching so every read after the first gets the same one
function deferProp(target, key, getter) {
    Object.defineProperty(target, key, {
        get() {
            const value = getter();
            assignProp(this, key, value);
            return value;
        },
        enumerable: true,
        configurable: true,
    });
}
// Writes a settled key. A plain assignment is much cheaper than `defineProperty` and produces the same descriptor, but it runs whatever setter already answers to the key — an accessor this shape deferred, or an inherited one, which `__proto__` has on every object and prototype pollution can add for any name.
function putProp(target, key, value) {
    if (key in target)
        assignProp(target, key, value);
    else
        target[key] = value;
}
/**
 * Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
 *
 * A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
 */
function mirrorShape(target, source, keys, wrap) {
    const raw = sourceShape(source);
    for (const key of keys) {
        const desc = Object.getOwnPropertyDescriptor(raw, key);
        if (!desc.enumerable)
            continue;
        if (desc.get) {
            deferProp(target, key, () => {
                const value = source._zod.def.shape[key];
                return wrap ? wrap(value, key) : value;
            });
        }
        else
            putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
    }
}
// same, for a plain shape a caller passed rather than a schema's
function mirrorProps(target, source) {
    for (const key of Reflect.ownKeys(source)) {
        const desc = Object.getOwnPropertyDescriptor(source, key);
        if (!desc.enumerable)
            continue;
        if (desc.get)
            deferProp(target, key, () => source[key]);
        else
            putProp(target, key, desc.value);
    }
}
function mergeDefs(...defs) {
    const mergedDescriptors = {};
    for (const def of defs) {
        const descriptors = Object.getOwnPropertyDescriptors(def);
        Object.assign(mergedDescriptors, descriptors);
    }
    return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
    return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
    if (!path)
        return obj;
    return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
    const keys = Object.keys(promisesObj);
    const promises = keys.map((key) => promisesObj[key]);
    return Promise.all(promises).then((results) => {
        const resolvedObj = {};
        for (let i = 0; i < keys.length; i++) {
            resolvedObj[keys[i]] = results[i];
        }
        return resolvedObj;
    });
}
function randomString(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
function esc(str) {
    return JSON.stringify(str);
}
function slugify(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
const captureStackTrace = ("captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => { });
function isObject(data) {
    return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = /* @__PURE__*/ cached(() => {
    // Skip the probe under `jitless`: strict CSPs report the caught `new Function` as a `securitypolicyviolation` even though the throw is swallowed.
    if (_core_js__WEBPACK_IMPORTED_MODULE_0__/* .globalConfig */ .cr.jitless) {
        return false;
    }
    // @ts-ignore
    if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
    }
    try {
        const F = Function;
        new F("");
        return true;
    }
    catch (_) {
        return false;
    }
});
function isPlainObject(o) {
    if (isObject(o) === false)
        return false;
    // modified constructor
    const ctor = o.constructor;
    if (ctor === undefined)
        return true;
    if (typeof ctor !== "function")
        return true;
    // modified prototype
    const prot = ctor.prototype;
    if (isObject(prot) === false)
        return false;
    // ctor doesn't have static `isPrototypeOf`
    if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
        return false;
    }
    return true;
}
function shallowClone(o) {
    if (isPlainObject(o))
        return { ...o };
    if (Array.isArray(o))
        return [...o];
    if (o instanceof Map)
        return new Map(o);
    if (o instanceof Set)
        return new Set(o);
    return o;
}
function numKeys(data) {
    let keyCount = 0;
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            keyCount++;
        }
    }
    return keyCount;
}
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return "undefined";
        case "string":
            return "string";
        case "number":
            return Number.isNaN(data) ? "nan" : "number";
        case "boolean":
            return "boolean";
        case "function":
            return "function";
        case "bigint":
            return "bigint";
        case "symbol":
            return "symbol";
        case "object":
            if (Array.isArray(data)) {
                return "array";
            }
            if (data === null) {
                return "null";
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return "promise";
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return "map";
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return "set";
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return "date";
            }
            // @ts-ignore
            if (typeof File !== "undefined" && data instanceof File) {
                return "file";
            }
            return "object";
        default:
            throw new Error(`Unknown data type: ${t}`);
    }
};
const propertyKeyTypes = /* @__PURE__*/ new Set(["string", "number", "symbol"]);
const primitiveTypes = /* @__PURE__*/ new Set([
    "string",
    "number",
    "bigint",
    "boolean",
    "symbol",
    "undefined",
]);
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// zod-specific utils
function clone(inst, def, params) {
    const cl = new inst._zod.constr(def ?? inst._zod.def);
    if (!def || params?.parent)
        cl._zod.parent = inst;
    return cl;
}
function normalizeParams(_params) {
    const params = _params;
    if (!params)
        return {};
    if (typeof params === "string")
        return { error: () => params };
    if (params?.message !== undefined) {
        if (params?.error !== undefined)
            throw new Error("Cannot specify both `message` and `error` params");
        params.error = params.message;
    }
    delete params.message;
    if (typeof params.error === "string")
        return { ...params, error: () => params.error };
    return params;
}
function createTransparentProxy(getter) {
    let target;
    return new Proxy({}, {
        get(_, prop, receiver) {
            target ?? (target = getter());
            return Reflect.get(target, prop, receiver);
        },
        set(_, prop, value, receiver) {
            target ?? (target = getter());
            return Reflect.set(target, prop, value, receiver);
        },
        has(_, prop) {
            target ?? (target = getter());
            return Reflect.has(target, prop);
        },
        deleteProperty(_, prop) {
            target ?? (target = getter());
            return Reflect.deleteProperty(target, prop);
        },
        ownKeys(_) {
            target ?? (target = getter());
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(_, prop) {
            target ?? (target = getter());
            return Reflect.getOwnPropertyDescriptor(target, prop);
        },
        defineProperty(_, prop, descriptor) {
            target ?? (target = getter());
            return Reflect.defineProperty(target, prop, descriptor);
        },
    });
}
function stringifyPrimitive(value) {
    if (typeof value === "bigint")
        return value.toString() + "n";
    if (typeof value === "string")
        return `"${value}"`;
    return `${value}`;
}
function optionalKeys(shape) {
    return Object.keys(shape).filter((k) => {
        return shape[k]._zod.optin !== undefined && shape[k]._zod.optout === "optional";
    });
}
// Wrapped in a `@__PURE__` IIFE: esbuild never tree-shakes a top-level initializer that contains a member access on `Number`, so the bare object literal survived into every bundle.
const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-3.4028234663852886e38, 3.4028234663852886e38],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
}))();
const BIGINT_FORMAT_RANGES = {
    int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
    uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")],
};
function pick(schema, mask) {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        throw new Error(".pick() cannot be used on object schemas containing refinements");
    }
    const newShape = {};
    mirrorShape(newShape, schema, maskedKeys(schema, mask));
    return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}
// the mask keys that select something, checked against the source's shape without resolving it
function maskedKeys(schema, mask) {
    const raw = sourceShape(schema);
    const keys = [];
    // `for...in` skips symbols, so a symbol in the mask would select nothing
    for (const key of Reflect.ownKeys(mask)) {
        if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) {
            throw new Error(`Unrecognized key: "${String(key)}"`);
        }
        if (mask[key])
            keys.push(key);
    }
    return keys;
}
function omit(schema, mask) {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        throw new Error(".omit() cannot be used on object schemas containing refinements");
    }
    const omitted = new Set(maskedKeys(schema, mask));
    const newShape = {};
    mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
    return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}
function extend(schema, shape) {
    if (!isPlainObject(shape)) {
        throw new Error("Invalid input to extend: expected a plain object");
    }
    const checks = schema._zod.def.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        // Only throw if new shape overlaps with existing shape. Use getOwnPropertyDescriptor to check key existence without accessing values
        const existingShape = sourceShape(schema);
        for (const key of Reflect.ownKeys(shape)) {
            if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
                throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
            }
        }
    }
    return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
// the source's keys, then the caller's overlaid on top
function extended(schema, shape) {
    const newShape = {};
    mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
    mirrorProps(newShape, shape);
    return newShape;
}
function safeExtend(schema, shape) {
    if (!isPlainObject(shape)) {
        throw new Error("Invalid input to safeExtend: expected a plain object");
    }
    return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
    if (!b?._zod?.def) {
        throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
    }
    if (a._zod.def.checks?.length) {
        throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
    }
    const newShape = {};
    mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
    mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
    const def = mergeDefs(a._zod.def, {
        shape: newShape,
        get catchall() {
            return b._zod.def.catchall;
        },
        checks: b._zod.def.checks ?? [],
    });
    return clone(a, def);
}
function partial(Class, schema, mask, name = "partial") {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
    }
    const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
    const newShape = {};
    mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class &&
        ((value, key) => (selected && !selected.has(key) ? value : new Class({ type: "optional", innerType: value }))));
    return clone(schema, mergeDefs(schema._zod.def, { shape: newShape, checks: [] }));
}
function required(Class, schema, mask) {
    const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
    const newShape = {};
    mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => 
    // overwrite with non-optional
    selected && !selected.has(key) ? value : new Class({ type: "nonoptional", innerType: value }));
    return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
// invalid_type | too_big | too_small | invalid_format | not_multiple_of | unrecognized_keys | invalid_union | invalid_key | invalid_element | invalid_value | custom
function aborted(x, startIndex = 0) {
    if (x.aborted === true)
        return true;
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue !== true) {
            return true;
        }
    }
    return false;
}
// Checks for explicit abort (continue === false), as opposed to implicit abort (continue === undefined). Used to respect `abort: true` in .refine() even for checks that have a `when` function.
function explicitlyAborted(x, startIndex = 0) {
    if (x.aborted === true)
        return true;
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue === false) {
            return true;
        }
    }
    return false;
}
function prefixIssues(path, issues) {
    return issues.map((iss) => {
        var _a;
        (_a = iss).path ?? (_a.path = []);
        iss.path.unshift(path);
        return iss;
    });
}
function unwrapMessage(message) {
    return typeof message === "string" ? message : message?.message;
}
/* A check holds no link back to the schema it is attached to — the same check instance is shared by every clone of that schema — so the owner is stamped onto the issues a check just raised, at the only point where both are in scope. Runs on the failure path only; `start` is the issue count from before the check ran. */
/** The leading size checks of `defChecks` that set an upper bound, each paired with it. */
function sizeCaps(defChecks) {
    const caps = [];
    for (const ch of defChecks ?? []) {
        const d = ch._zod.def;
        // a later check may rewrite the value
        if (!/_(length|size)$|_equals$/.test(d.check))
            break;
        const max = d.maximum ?? d.length ?? d.size;
        if (max >= 0)
            caps.push([max, ch]);
    }
    return caps;
}
function attachSchema(issues, start, inst) {
    var _a;
    for (let i = start; i < issues.length; i++) {
        (_a = issues[i]).schema ?? (_a.schema = inst);
    }
}
function finalizeIssue(iss, ctx, config) {
    var _a;
    // A schema that raised an issue itself owns it outright, and outranks any stamp an enclosing check left in `attachSchema`. String formats and z.custom() are schema and check at once, so when they act as a check they defer to that stamp instead.
    const traits = iss.inst?._zod?.traits;
    if (traits?.has("$ZodType")) {
        if (traits.has("$ZodCheck"))
            (_a = iss).schema ?? (_a.schema = iss.inst);
        else
            iss.schema = iss.inst;
    }
    // Decreasing specificity, first map to return a message wins. `inst` is whatever raised the issue, so a check's own map outranks the owning schema's.
    const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
    const message = iss.message
        ? iss.message
        : (unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
            unwrapMessage(schemaError?.(iss)) ??
            unwrapMessage(ctx?.error?.(iss)) ??
            unwrapMessage(config.customError?.(iss)) ??
            unwrapMessage(config.localeError?.(iss)) ??
            "Invalid input");
    // an explicit own-key copy beats object rest with excluded keys, which v8 routes through a generic runtime call; Object.keys rather than for-in so an issue pushed with a prototype does not leak inherited keys, and an own __proto__ key is dropped rather than assigned through the setter
    const full = {};
    for (const k of Object.keys(iss)) {
        if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__")
            continue;
        full[k] = iss[k];
    }
    full.path ?? (full.path = []);
    full.message = message;
    if (ctx?.reportInput) {
        full.input = iss.input;
    }
    return full;
}
function getSizableOrigin(input) {
    if (input instanceof Set)
        return "set";
    if (input instanceof Map)
        return "map";
    // @ts-ignore
    if (input instanceof File)
        return "file";
    return "unknown";
}
const highSurrogate = /[\uD800-\uDBFF]/;
// Code points in `str`: a surrogate pair counts once, a lone surrogate as itself. Hand-rolled because the string iterator allocates and runs ~250x slower on this path; the regex probe exits ~50x quicker for a string with no astral characters.
function codePointLength(str) {
    const units = str.length;
    if (!highSurrogate.test(str))
        return units;
    let count = units;
    for (let i = 0; i < units - 1; i++) {
        if ((str.charCodeAt(i) & 0xfc00) === 0xd800 && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            count--;
            i++;
        }
    }
    return count;
}
function getLengthableOrigin(input) {
    if (Array.isArray(input))
        return "array";
    if (typeof input === "string")
        return "string";
    return "unknown";
}
function parsedType(data) {
    const t = typeof data;
    switch (t) {
        case "number": {
            return Number.isNaN(data) ? "nan" : "number";
        }
        case "object": {
            if (data === null) {
                return "null";
            }
            if (Array.isArray(data)) {
                return "array";
            }
            const obj = data;
            if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
                return obj.constructor.name;
            }
        }
    }
    return t;
}
function issue(...args) {
    const [iss, input, inst] = args;
    if (typeof iss === "string") {
        return {
            message: iss,
            code: "custom",
            input,
            inst,
        };
    }
    return { ...iss };
}
function cleanEnum(obj) {
    return Object.entries(obj)
        .filter(([k, _]) => {
        // return true if NaN, meaning it's not a number, thus a string key
        return Number.isNaN(Number.parseInt(k, 10));
    })
        .map((el) => el[1]);
}
// Codec utility functions
function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
function uint8ArrayToBase64(bytes) {
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
}
function base64urlToUint8Array(base64url) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    return base64ToUint8Array(base64 + padding);
}
function uint8ArrayToBase64url(bytes) {
    return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
    const cleanHex = hex.replace(/^0x/, "");
    if (cleanHex.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
    }
    return bytes;
}
function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
// instanceof
class Class {
    constructor(..._args) { }
}
//////////    PROTOTYPE INSTALLERS     //////////
//
// Members live on the prototype and materialize per instance on first read, which keeps own-property count under the step where V8 stops using inline slots. Changing anything here means re-measuring runtime, memory and bundle size together — see "The three axes" in AGENTS.md.
/**
 * Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
 *
 * Call this from a `proto` initializer, which runs once per prototype — never per instance.
 */
function members(proto, table) {
    for (const key in table) {
        const desc = Object.getOwnPropertyDescriptor(table, key);
        // a getter installs as written, so it stays live: `description` reads through to the registry on every access. not enumerable: an object literal's is, and a prototype member never was
        if (desc.get)
            Object.defineProperty(proto, key, { ...desc, enumerable: false });
        // a method materializes bound on first read, which is what keeps a detached member working: `const opt = schema.optional; opt()`
        else
            defineBound(proto, key, desc.value);
    }
}
/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
function own(inst, key, value, enumerable = true) {
    Object.defineProperty(inst, key, { configurable: true, writable: true, enumerable, value });
    return value;
}
/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
function hide(inst, key, value) {
    return own(inst, key, value, false);
}
/** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
function derived(computes, table) {
    for (const key in computes) {
        const compute = computes[key];
        // an object literal's accessor is configurable and enumerable, and `members` copies the descriptor as written
        Object.defineProperty(table, key, {
            configurable: true,
            enumerable: true,
            get() {
                return own(this, key, compute(this));
            },
            set(value) {
                own(this, key, value);
            },
        });
    }
    return table;
}
function defineBound(proto, key, fn) {
    Object.defineProperty(proto, key, {
        configurable: true,
        get() {
            // vitest's spyOn calls a prototype getter bare to find the function it wraps, so a nullish receiver answers the raw method
            return this == null ? fn : own(this, key, fn.bind(this));
        },
        set(value) {
            own(this, key, value);
        },
    });
}
/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
function claim(inst, sentinel) {
    const proto = Object.getPrototypeOf(inst);
    // Runs on every construction, so `in` rather than the costlier `hasOwnProperty.call`. Sentinels are keys the group itself defines.
    return sentinel in proto ? undefined : proto;
}
// The internals whose init chain is installing. A second call for the same one is a derived constructor overriding its base, so it must not construct another schema in between or the override is dropped.
let installing;
// Set while a getter is running, so a value that resolved through a recursion break is not memoized. One shared descriptor shadows the key for the duration, which costs no per-key allocation.
let broke = false;
const breaker = {
    configurable: true,
    get() {
        broke = true;
        return undefined;
    },
};
/**
 * Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
 * constructor, computed from the internals object itself and cached there on
 * first read. One accessor per constructor rather than one per instance.
 */
function defineLazyInternal(inst, key, compute) {
    const proto = Object.getPrototypeOf(inst._zod);
    if (key in proto && installing !== inst._zod) {
        // A repeat construction: everything is installed already. Cleared here so the reference is not held past the first construction of every type.
        installing = undefined;
        return;
    }
    installing = inst._zod;
    Object.defineProperty(proto, key, {
        configurable: true,
        get() {
            // Shadowed before computing so a re-entrant read from a recursive schema resolves to undefined instead of running the getter again.
            Object.defineProperty(this, key, breaker);
            const outer = broke;
            broke = false;
            try {
                const value = compute(this);
                // A result that resolved through a recursion break is recomputed once the graph is complete; everything else memoizes, undefined included.
                if (broke)
                    delete this[key];
                else
                    Object.defineProperty(this, key, { configurable: true, writable: true, value });
                broke = broke || outer;
                return value;
            }
            catch (err) {
                // A compute that threw memoizes nothing, so a later read runs it again and fails the same way. The shadow goes with it, since leaving it installed would answer undefined for every later read.
                delete this[key];
                broke = broke || outer;
                throw err;
            }
        },
        set(value) {
            Object.defineProperty(this, key, { configurable: true, writable: true, value });
        },
    });
}
/**
 * Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
 * data property. One accessor per constructor rather than one per instance, because an own accessor
 * puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
 */
function installLazyProp(inst, key, make, enumerable) {
    const proto = claim(inst, key);
    if (!proto)
        return;
    Object.defineProperty(proto, key, {
        configurable: true,
        get() {
            // Shadowed before computing, so a re-entrant read from a self-referential shape resolves to undefined instead of running the getter again. A data property rather than an accessor: an own accessor is the dictionary-mode transition this exists to avoid.
            const desc = { configurable: true, writable: true, enumerable, value: undefined };
            Object.defineProperty(this, key, desc);
            // a compute that throws leaves the shadow behind, so later reads answer undefined instead of re-throwing; `defineLazy` did the same, and `defineLazyInternal`'s delete-on-catch would cost bytes in every bundle for a case only a throwing user getter reaches
            desc.value = make(this);
            Object.defineProperty(this, key, desc);
            return desc.value;
        },
        set(value) {
            Object.defineProperty(this, key, { configurable: true, writable: true, enumerable, value });
        },
    });
}
/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
const CONSTANT_CATCH = "~constantCatch";
/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
function constantCatch(value) {
    const fn = () => value;
    fn[CONSTANT_CATCH] = true;
    return fn;
}


/***/ }),

/***/ 54611:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _core_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24366);

const error = () => {
    const Sizable = {
        string: { unit: "characters", verb: "to have" },
        file: { unit: "bytes", verb: "to have" },
        array: { unit: "items", verb: "to have" },
        set: { unit: "items", verb: "to have" },
        map: { unit: "entries", verb: "to have" },
    };
    function getSizing(origin) {
        return Sizable[origin] ?? null;
    }
    const FormatDictionary = {
        regex: "input",
        email: "email address",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datetime",
        date: "ISO date",
        time: "ISO time",
        duration: "ISO duration",
        ipv4: "IPv4 address",
        ipv6: "IPv6 address",
        mac: "MAC address",
        cidrv4: "IPv4 range",
        cidrv6: "IPv6 range",
        base64: "base64-encoded string",
        base64url: "base64url-encoded string",
        json_string: "JSON string",
        e164: "E.164 number",
        currency_code: "currency code",
        credit_card: "credit card number",
        iban: "IBAN",
        jwt: "JWT",
        template_literal: "input",
    };
    // type names: missing keys = do not translate (use raw value via ?? fallback)
    const TypeDictionary = {
        // Compatibility: "nan" -> "NaN" for display
        nan: "NaN",
        // All other type names omitted - they fall back to raw values via ?? operator
    };
    function getTypeName(type, input) {
        if (type === "number" && typeof input === "number" && !Number.isFinite(input)) {
            return String(input);
        }
        return TypeDictionary[type] ?? type;
    }
    return (issue) => {
        switch (issue.code) {
            case "invalid_type": {
                const expected = getTypeName(issue.expected);
                const receivedType = _core_util_js__WEBPACK_IMPORTED_MODULE_0__/* .parsedType */ .GW(issue.input);
                const received = getTypeName(receivedType, issue.input);
                return `Invalid input: expected ${expected}, received ${received}`;
            }
            case "invalid_value":
                if (issue.values.length === 1)
                    return `Invalid input: expected ${_core_util_js__WEBPACK_IMPORTED_MODULE_0__/* .stringifyPrimitive */ .B7(issue.values[0])}`;
                return `Invalid option: expected one of ${_core_util_js__WEBPACK_IMPORTED_MODULE_0__/* .joinValues */ .jw(issue.values, "|")}`;
            case "too_big": {
                const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
                const sizing = getSizing(issue.origin);
                if (sizing)
                    return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
                return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
            }
            case "too_small": {
                const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
                const sizing = getSizing(issue.origin);
                if (sizing) {
                    return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                }
                return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
            }
            case "invalid_format": {
                const _issue = issue;
                if (_issue.format === "starts_with") {
                    return `Invalid string: must start with "${_issue.prefix}"`;
                }
                if (_issue.format === "ends_with")
                    return `Invalid string: must end with "${_issue.suffix}"`;
                if (_issue.format === "includes")
                    return `Invalid string: must include "${_issue.includes}"`;
                if (_issue.format === "regex")
                    return `Invalid string: must match pattern ${_issue.pattern}`;
                return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
            }
            case "not_multiple_of":
                return `Invalid number: must be a multiple of ${issue.divisor}`;
            case "unrecognized_keys":
                return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${_core_util_js__WEBPACK_IMPORTED_MODULE_0__/* .joinValues */ .jw(issue.keys, ", ")}`;
            case "invalid_key":
                return `Invalid key in ${issue.origin}`;
            case "invalid_union":
                if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                    const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                    return `Invalid discriminator value. Expected ${opts}`;
                }
                if (issue.inclusive === false) {
                    return "Invalid input: more than one option matched";
                }
                return "Invalid input";
            case "invalid_element":
                return `Invalid value in ${issue.origin}`;
            default:
                return `Invalid input`;
        }
    };
};
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {
    return {
        localeError: error(),
    };
}


/***/ })

};
