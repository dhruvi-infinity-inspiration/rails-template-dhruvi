 (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: typeof console !== "undefined" ? console : void 0,
        WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => (/* @__PURE__ */ new Date()).getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordMessage() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart",
          "remote": "remote"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer3) {
          this.open = this.open.bind(this);
          this.consumer = consumer3;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data2) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data2));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error) {
              logger_default.log("Failed to reopen WebSocket", error);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        triedToReconnect() {
          return this.monitor.reconnectAttempts > 0;
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          this.monitor.recordMessage();
          switch (type) {
            case message_types.welcome:
              if (this.triedToReconnect()) {
                this.reconnectAttempted = true;
              }
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return null;
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              if (this.reconnectAttempted) {
                this.reconnectAttempted = false;
                return this.subscriptions.notify(identifier, "connected", { reconnected: true });
              } else {
                return this.subscriptions.notify(identifier, "connected", { reconnected: false });
              }
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer3, params = {}, mixin) {
          this.consumer = consumer3;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data2 = {}) {
          data2.action = action;
          return this.send(data2);
        }
        send(data2) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data2) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer3) {
          this.consumer = consumer3;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        // Private
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
          this.subprotocols = [];
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data2) {
          return this.connection.send(data2);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
        addSubProtocol(subprotocol) {
          this.subprotocols = [...this.subprotocols, subprotocol];
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name2) {
    const element = document.head.querySelector(`meta[name='action-cable-${name2}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // ../../node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  var turbo_es2017_esm_exports = {};
  __export(turbo_es2017_esm_exports, {
    FetchEnctype: () => FetchEnctype,
    FetchMethod: () => FetchMethod,
    FetchRequest: () => FetchRequest,
    FetchResponse: () => FetchResponse,
    FrameElement: () => FrameElement,
    FrameLoadingStyle: () => FrameLoadingStyle,
    FrameRenderer: () => FrameRenderer,
    PageRenderer: () => PageRenderer,
    PageSnapshot: () => PageSnapshot,
    StreamActions: () => StreamActions,
    StreamElement: () => StreamElement,
    StreamSourceElement: () => StreamSourceElement,
    cache: () => cache,
    clearCache: () => clearCache,
    config: () => config,
    connectStreamSource: () => connectStreamSource,
    disconnectStreamSource: () => disconnectStreamSource,
    fetch: () => fetchWithTurboHeaders,
    fetchEnctypeFromString: () => fetchEnctypeFromString,
    fetchMethodFromString: () => fetchMethodFromString,
    isSafe: () => isSafe,
    navigator: () => navigator$1,
    registerAdapter: () => registerAdapter,
    renderStreamMessage: () => renderStreamMessage,
    session: () => session,
    setConfirmMethod: () => setConfirmMethod,
    setFormMode: () => setFormMode,
    setProgressBarDelay: () => setProgressBarDelay,
    start: () => start,
    visit: () => visit
  });
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function") return;
    prototype.requestSubmit = function(submitter2) {
      if (submitter2) {
        validateSubmitter(submitter2, this);
        submitter2.click();
      } else {
        submitter2 = document.createElement("input");
        submitter2.type = "submit";
        submitter2.hidden = true;
        this.appendChild(submitter2);
        submitter2.click();
        this.removeChild(submitter2);
      }
    };
    function validateSubmitter(submitter2, form2) {
      submitter2 instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter2.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter2.form == form2 || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name2) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name2);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return candidate?.type == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter2 = findSubmitterFromClickTarget(event.target);
    if (submitter2 && submitter2.form) {
      submittersByForm.set(submitter2.form, submitter2);
    }
  }
  (function() {
    if ("submitter" in Event.prototype) return;
    let prototype = window.Event.prototype;
    if ("SubmitEvent" in window) {
      const prototypeOfSubmitEvent = window.SubmitEvent.prototype;
      if (/Apple Computer/.test(navigator.vendor) && !("submitter" in prototypeOfSubmitEvent)) {
        prototype = prototypeOfSubmitEvent;
      } else {
        return;
      }
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle = {
    eager: "eager",
    lazy: "lazy"
  };
  var FrameElement = class _FrameElement extends HTMLElement {
    static delegateConstructor = void 0;
    loaded = Promise.resolve();
    static get observedAttributes() {
      return ["disabled", "loading", "src"];
    }
    constructor() {
      super();
      this.delegate = new _FrameElement.delegateConstructor(this);
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name2) {
      if (name2 == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name2 == "src") {
        this.delegate.sourceURLChanged();
      } else if (name2 == "disabled") {
        this.delegate.disabledChanged();
      }
    }
    /**
     * Gets the URL to lazily load source HTML from
     */
    get src() {
      return this.getAttribute("src");
    }
    /**
     * Sets the URL to lazily load source HTML from
     */
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    /**
     * Gets the refresh mode for the frame.
     */
    get refresh() {
      return this.getAttribute("refresh");
    }
    /**
     * Sets the refresh mode for the frame.
     */
    set refresh(value) {
      if (value) {
        this.setAttribute("refresh", value);
      } else {
        this.removeAttribute("refresh");
      }
    }
    get shouldReloadWithMorph() {
      return this.src && this.refresh === "morph";
    }
    /**
     * Determines if the element is loading
     */
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    /**
     * Sets the value of if the element is loading
     */
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    /**
     * Gets the disabled state of the frame.
     *
     * If disabled, no requests will be intercepted by the frame.
     */
    get disabled() {
      return this.hasAttribute("disabled");
    }
    /**
     * Sets the disabled state of the frame.
     *
     * If disabled, no requests will be intercepted by the frame.
     */
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    /**
     * Gets the autoscroll state of the frame.
     *
     * If true, the frame will be scrolled into view automatically on update.
     */
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    /**
     * Sets the autoscroll state of the frame.
     *
     * If true, the frame will be scrolled into view automatically on update.
     */
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    /**
     * Determines if the element has finished loading
     */
    get complete() {
      return !this.delegate.isLoading;
    }
    /**
     * Gets the active state of the frame.
     *
     * If inactive, source changes will not be observed.
     */
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    /**
     * Sets the active state of the frame.
     *
     * If inactive, source changes will not be observed.
     */
    get isPreview() {
      return this.ownerDocument?.documentElement?.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  var drive = {
    enabled: true,
    progressBarDelay: 500,
    unvisitableExtensions: /* @__PURE__ */ new Set(
      [
        ".7z",
        ".aac",
        ".apk",
        ".avi",
        ".bmp",
        ".bz2",
        ".css",
        ".csv",
        ".deb",
        ".dmg",
        ".doc",
        ".docx",
        ".exe",
        ".gif",
        ".gz",
        ".heic",
        ".heif",
        ".ico",
        ".iso",
        ".jpeg",
        ".jpg",
        ".js",
        ".json",
        ".m4a",
        ".mkv",
        ".mov",
        ".mp3",
        ".mp4",
        ".mpeg",
        ".mpg",
        ".msi",
        ".ogg",
        ".ogv",
        ".pdf",
        ".pkg",
        ".png",
        ".ppt",
        ".pptx",
        ".rar",
        ".rtf",
        ".svg",
        ".tar",
        ".tif",
        ".tiff",
        ".txt",
        ".wav",
        ".webm",
        ".webp",
        ".wma",
        ".wmv",
        ".xls",
        ".xlsx",
        ".xml",
        ".zip"
      ]
    )
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce2 = getCspNonce();
      if (cspNonce2) {
        createdScriptElement.nonce = cspNonce2;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name: name2, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name2, value);
    }
  }
  function createDocumentFragment(html) {
    const template2 = document.createElement("template");
    template2.innerHTML = html;
    return template2.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function cancelEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function nextRepaint() {
    if (document.visibilityState === "hidden") {
      return nextEventLoopTick();
    } else {
      return nextAnimationFrame();
    }
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element?.getAttribute(attributeName))) {
      if (typeof value == "string") return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name2) {
    return document.querySelector(`meta[name="${name2}"]`);
  }
  function getMetaContent(name2) {
    const element = getMetaElement(name2);
    return element && element.content;
  }
  function getCspNonce() {
    const element = getMetaElement("csp-nonce");
    if (element) {
      const { nonce, content } = element;
      return nonce == "" ? content : nonce;
    }
  }
  function setMetaContent(name2, content) {
    let element = getMetaElement(name2);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name2);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || element.getRootNode()?.host, selector);
    }
  }
  function elementIsFocusable(element) {
    const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
    return !!element && element.closest(inertDisabledOrHidden) == null && typeof element.focus == "function";
  }
  function queryAutofocusableElement(elementOrDocumentFragment) {
    return Array.from(elementOrDocumentFragment.querySelectorAll("[autofocus]")).find(elementIsFocusable);
  }
  async function around(callback, reader) {
    const before2 = reader();
    callback();
    await nextAnimationFrame();
    const after2 = reader();
    return [before2, after2];
  }
  function doesNotTargetIFrame(name2) {
    if (name2 === "_blank") {
      return false;
    } else if (name2) {
      for (const element of document.getElementsByName(name2)) {
        if (element instanceof HTMLIFrameElement) return false;
      }
      return true;
    } else {
      return true;
    }
  }
  function findLinkFromClickTarget(target) {
    return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
  }
  function getLocationForLink(link2) {
    return expandURL(link2.getAttribute("href") || "");
  }
  function debounce(fn, delay) {
    let timeoutId = null;
    return (...args) => {
      const callback = () => fn.apply(this, args);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }
  var submitter = {
    "aria-disabled": {
      beforeSubmit: (submitter2) => {
        submitter2.setAttribute("aria-disabled", "true");
        submitter2.addEventListener("click", cancelEvent);
      },
      afterSubmit: (submitter2) => {
        submitter2.removeAttribute("aria-disabled");
        submitter2.removeEventListener("click", cancelEvent);
      }
    },
    "disabled": {
      beforeSubmit: (submitter2) => submitter2.disabled = true,
      afterSubmit: (submitter2) => submitter2.disabled = false
    }
  };
  var Config = class {
    #submitter = null;
    constructor(config2) {
      Object.assign(this, config2);
    }
    get submitter() {
      return this.#submitter;
    }
    set submitter(value) {
      this.#submitter = submitter[value] || value;
    }
  };
  var forms = new Config({
    mode: "on",
    submitter: "disabled"
  });
  var config = {
    drive,
    forms
  };
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction$1(form2, submitter2) {
    const action = submitter2?.getAttribute("formaction") || form2.getAttribute("action") || form2.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isPrefixedBy(baseURL, url) {
    const prefix2 = getPrefix(url);
    return baseURL.href === expandURL(prefix2).href || baseURL.href.startsWith(prefix2);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && !config.drive.unvisitableExtensions.has(getExtension(location2));
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response2) {
      this.response = response2;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name2) {
      return this.response.headers.get(name2);
    }
  };
  var LimitedSet = class extends Set {
    constructor(maxSize) {
      super();
      this.maxSize = maxSize;
    }
    add(value) {
      if (this.size >= this.maxSize) {
        const iterator = this.values();
        const oldestValue = iterator.next().value;
        this.delete(oldestValue);
      }
      super.add(value);
    }
  };
  var recentRequests = new LimitedSet(20);
  var nativeFetch = window.fetch;
  function fetchWithTurboHeaders(url, options = {}) {
    const modifiedHeaders = new Headers(options.headers || {});
    const requestUID = uuid();
    recentRequests.add(requestUID);
    modifiedHeaders.append("X-Turbo-Request-Id", requestUID);
    return nativeFetch(url, {
      ...options,
      headers: modifiedHeaders
    });
  }
  function fetchMethodFromString(method2) {
    switch (method2.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchMethod = {
    get: "get",
    post: "post",
    put: "put",
    patch: "patch",
    delete: "delete"
  };
  function fetchEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FetchEnctype.multipart:
        return FetchEnctype.multipart;
      case FetchEnctype.plain:
        return FetchEnctype.plain;
      default:
        return FetchEnctype.urlEncoded;
    }
  }
  var FetchEnctype = {
    urlEncoded: "application/x-www-form-urlencoded",
    multipart: "multipart/form-data",
    plain: "text/plain"
  };
  var FetchRequest = class {
    abortController = new AbortController();
    #resolveRequestPromise = (_value) => {
    };
    constructor(delegate2, method2, location2, requestBody = new URLSearchParams(), target = null, enctype = FetchEnctype.urlEncoded) {
      const [url, body] = buildResourceAndBody(expandURL(location2), method2, requestBody, enctype);
      this.delegate = delegate2;
      this.url = url;
      this.target = target;
      this.fetchOptions = {
        credentials: "same-origin",
        redirect: "follow",
        method: method2.toUpperCase(),
        headers: { ...this.defaultHeaders },
        body,
        signal: this.abortSignal,
        referrer: this.delegate.referrer?.href
      };
      this.enctype = enctype;
    }
    get method() {
      return this.fetchOptions.method;
    }
    set method(value) {
      const fetchBody = this.isSafe ? this.url.searchParams : this.fetchOptions.body || new FormData();
      const fetchMethod = fetchMethodFromString(value) || FetchMethod.get;
      this.url.search = "";
      const [url, body] = buildResourceAndBody(this.url, fetchMethod, fetchBody, this.enctype);
      this.url = url;
      this.fetchOptions.body = body;
      this.fetchOptions.method = fetchMethod.toUpperCase();
    }
    get headers() {
      return this.fetchOptions.headers;
    }
    set headers(value) {
      this.fetchOptions.headers = value;
    }
    get body() {
      if (this.isSafe) {
        return this.url.searchParams;
      } else {
        return this.fetchOptions.body;
      }
    }
    set body(value) {
      this.fetchOptions.body = value;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      const event = await this.#allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        if (event.detail.fetchRequest) {
          this.response = event.detail.fetchRequest.response;
        } else {
          this.response = fetchWithTurboHeaders(this.url.href, fetchOptions);
        }
        const response2 = await this.response;
        return await this.receive(response2);
      } catch (error) {
        if (error.name !== "AbortError") {
          if (this.#willDelegateErrorHandling(error)) {
            this.delegate.requestErrored(this, error);
          }
          throw error;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response2) {
      const fetchResponse = new FetchResponse(response2);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isSafe() {
      return isSafe(this.method);
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async #allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.#resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.#resolveRequestPromise
        },
        target: this.target
      });
      this.url = event.detail.url;
      if (event.defaultPrevented) await requestInterception;
      return event;
    }
    #willDelegateErrorHandling(error) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error }
      });
      return !event.defaultPrevented;
    }
  };
  function isSafe(fetchMethod) {
    return fetchMethodFromString(fetchMethod) == FetchMethod.get;
  }
  function buildResourceAndBody(resource, method2, requestBody, enctype) {
    const searchParams = Array.from(requestBody).length > 0 ? new URLSearchParams(entriesExcludingFiles(requestBody)) : resource.searchParams;
    if (isSafe(method2)) {
      return [mergeIntoURLSearchParams(resource, searchParams), null];
    } else if (enctype == FetchEnctype.urlEncoded) {
      return [resource, searchParams];
    } else {
      return [resource, requestBody];
    }
  }
  function entriesExcludingFiles(requestBody) {
    const entries2 = [];
    for (const [name2, value] of requestBody) {
      if (value instanceof File) continue;
      else entries2.push([name2, value]);
    }
    return entries2;
  }
  function mergeIntoURLSearchParams(url, requestBody) {
    const searchParams = new URLSearchParams(entriesExcludingFiles(requestBody));
    url.search = searchParams.toString();
    return url;
  }
  var AppearanceObserver = class {
    started = false;
    constructor(delegate2, element) {
      this.delegate = delegate2;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
    intersect = (entries2) => {
      const lastEntry = entries2.slice(-1)[0];
      if (lastEntry?.isIntersecting) {
        this.delegate.elementAppearedInViewport(this.element);
      }
    };
  };
  var StreamMessage = class {
    static contentType = "text/vnd.turbo-stream.html";
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
  };
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var PREFETCH_DELAY = 100;
  var PrefetchCache = class {
    #prefetchTimeout = null;
    #prefetched = null;
    get(url) {
      if (this.#prefetched && this.#prefetched.url === url && this.#prefetched.expire > Date.now()) {
        return this.#prefetched.request;
      }
    }
    setLater(url, request2, ttl) {
      this.clear();
      this.#prefetchTimeout = setTimeout(() => {
        request2.perform();
        this.set(url, request2, ttl);
        this.#prefetchTimeout = null;
      }, PREFETCH_DELAY);
    }
    set(url, request2, ttl) {
      this.#prefetched = { url, request: request2, expire: new Date((/* @__PURE__ */ new Date()).getTime() + ttl) };
    }
    clear() {
      if (this.#prefetchTimeout) clearTimeout(this.#prefetchTimeout);
      this.#prefetched = null;
    }
  };
  var cacheTtl = 10 * 1e3;
  var prefetchCache = new PrefetchCache();
  var FormSubmissionState = {
    initialized: "initialized",
    requesting: "requesting",
    waiting: "waiting",
    receiving: "receiving",
    stopping: "stopping",
    stopped: "stopped"
  };
  var FormSubmission = class _FormSubmission {
    state = FormSubmissionState.initialized;
    static confirmMethod(message) {
      return Promise.resolve(confirm(message));
    }
    constructor(delegate2, formElement, submitter2, mustRedirect = false) {
      const method2 = getMethod(formElement, submitter2);
      const action = getAction(getFormAction(formElement, submitter2), method2);
      const body = buildFormData(formElement, submitter2);
      const enctype = getEnctype(formElement, submitter2);
      this.delegate = delegate2;
      this.formElement = formElement;
      this.submitter = submitter2;
      this.fetchRequest = new FetchRequest(this, method2, action, body, formElement, enctype);
      this.mustRedirect = mustRedirect;
    }
    get method() {
      return this.fetchRequest.method;
    }
    set method(value) {
      this.fetchRequest.method = value;
    }
    get action() {
      return this.fetchRequest.url.toString();
    }
    set action(value) {
      this.fetchRequest.url = expandURL(value);
    }
    get body() {
      return this.fetchRequest.body;
    }
    get enctype() {
      return this.fetchRequest.enctype;
    }
    get isSafe() {
      return this.fetchRequest.isSafe;
    }
    get location() {
      return this.fetchRequest.url;
    }
    // The submission process
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const confirmMethod = typeof config.forms.confirm === "function" ? config.forms.confirm : _FormSubmission.confirmMethod;
        const answer = await confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    // Fetch request delegate
    prepareRequest(request2) {
      if (!request2.isSafe) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request2.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request2)) {
        request2.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      this.state = FormSubmissionState.waiting;
      if (this.submitter) config.forms.submitter.beforeSubmit(this.submitter);
      this.setSubmitsWith();
      markAsBusy(this.formElement);
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request2, response2) {
      prefetchCache.clear();
      this.result = { success: response2.succeeded, fetchResponse: response2 };
    }
    requestSucceededWithResponse(request2, response2) {
      if (response2.clientError || response2.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response2);
        return;
      }
      prefetchCache.clear();
      if (this.requestMustRedirect(request2) && responseSucceededWithoutRedirect(response2)) {
        const error = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response2 };
        this.delegate.formSubmissionSucceededWithResponse(this, response2);
      }
    }
    requestFailedWithResponse(request2, response2) {
      this.result = { success: false, fetchResponse: response2 };
      this.delegate.formSubmissionFailedWithResponse(this, response2);
    }
    requestErrored(request2, error) {
      this.result = { success: false, error };
      this.delegate.formSubmissionErrored(this, error);
    }
    requestFinished(_request) {
      this.state = FormSubmissionState.stopped;
      if (this.submitter) config.forms.submitter.afterSubmit(this.submitter);
      this.resetSubmitterText();
      clearBusyState(this.formElement);
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: { formSubmission: this, ...this.result }
      });
      this.delegate.formSubmissionFinished(this);
    }
    // Private
    setSubmitsWith() {
      if (!this.submitter || !this.submitsWith) return;
      if (this.submitter.matches("button")) {
        this.originalSubmitText = this.submitter.innerHTML;
        this.submitter.innerHTML = this.submitsWith;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        this.originalSubmitText = input.value;
        input.value = this.submitsWith;
      }
    }
    resetSubmitterText() {
      if (!this.submitter || !this.originalSubmitText) return;
      if (this.submitter.matches("button")) {
        this.submitter.innerHTML = this.originalSubmitText;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        input.value = this.originalSubmitText;
      }
    }
    requestMustRedirect(request2) {
      return !request2.isSafe && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request2) {
      return !request2.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
    get submitsWith() {
      return this.submitter?.getAttribute("data-turbo-submits-with");
    }
  };
  function buildFormData(formElement, submitter2) {
    const formData = new FormData(formElement);
    const name2 = submitter2?.getAttribute("name");
    const value = submitter2?.getAttribute("value");
    if (name2) {
      formData.append(name2, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response2) {
    return response2.statusCode == 200 && !response2.redirected;
  }
  function getFormAction(formElement, submitter2) {
    const formElementAction = typeof formElement.action === "string" ? formElement.action : null;
    if (submitter2?.hasAttribute("formaction")) {
      return submitter2.getAttribute("formaction") || "";
    } else {
      return formElement.getAttribute("action") || formElementAction || "";
    }
  }
  function getAction(formAction, fetchMethod) {
    const action = expandURL(formAction);
    if (isSafe(fetchMethod)) {
      action.search = "";
    }
    return action;
  }
  function getMethod(formElement, submitter2) {
    const method2 = submitter2?.getAttribute("formmethod") || formElement.getAttribute("method") || "";
    return fetchMethodFromString(method2.toLowerCase()) || FetchMethod.get;
  }
  function getEnctype(formElement, submitter2) {
    return fetchEnctypeFromString(submitter2?.getAttribute("formenctype") || formElement.enctype);
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      return queryAutofocusableElement(this.element);
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id) {
      return getPermanentElementById(this.element, id);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id) {
    return node.querySelector(`#${id}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    started = false;
    constructor(delegate2, eventTarget) {
      this.delegate = delegate2;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
    submitCaptured = () => {
      this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
      this.eventTarget.addEventListener("submit", this.submitBubbled, false);
    };
    submitBubbled = (event) => {
      if (!event.defaultPrevented) {
        const form2 = event.target instanceof HTMLFormElement ? event.target : void 0;
        const submitter2 = event.submitter || void 0;
        if (form2 && submissionDoesNotDismissDialog(form2, submitter2) && submissionDoesNotTargetIFrame(form2, submitter2) && this.delegate.willSubmitForm(form2, submitter2)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.delegate.formSubmitted(form2, submitter2);
        }
      }
    };
  };
  function submissionDoesNotDismissDialog(form2, submitter2) {
    const method2 = submitter2?.getAttribute("formmethod") || form2.getAttribute("method");
    return method2 != "dialog";
  }
  function submissionDoesNotTargetIFrame(form2, submitter2) {
    const target = submitter2?.getAttribute("formtarget") || form2.getAttribute("target");
    return doesNotTargetIFrame(target);
  }
  var View = class {
    #resolveRenderPromise = (_value) => {
    };
    #resolveInterceptionPromise = (_value) => {
    };
    constructor(delegate2, element) {
      this.delegate = delegate2;
      this.element = element;
    }
    // Scrolling
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    // Rendering
    async render(renderer) {
      const { isPreview, shouldRender, willRender, newSnapshot: snapshot } = renderer;
      const shouldInvalidate = willRender;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.#resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.#resolveInterceptionPromise = resolve);
          const options = { resume: this.#resolveInterceptionPromise, render: this.renderer.renderElement, renderMethod: this.renderer.renderMethod };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender) await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview, this.renderer.renderMethod);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.#resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else if (shouldInvalidate) {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    markVisitDirection(direction) {
      this.element.setAttribute("data-turbo-visit-direction", direction);
    }
    unmarkVisitDirection() {
      this.element.removeAttribute("data-turbo-visit-direction");
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    missing() {
      this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate2, element) {
      this.delegate = delegate2;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    clickBubbled = (event) => {
      if (this.clickEventIsSignificant(event)) {
        this.clickEvent = event;
      } else {
        delete this.clickEvent;
      }
    };
    linkClicked = (event) => {
      if (this.clickEvent && this.clickEventIsSignificant(event)) {
        if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
          this.clickEvent.preventDefault();
          event.preventDefault();
          this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
        }
      }
      delete this.clickEvent;
    };
    willVisit = (_event) => {
      delete this.clickEvent;
    };
    clickEventIsSignificant(event) {
      const target = event.composed ? event.target?.parentElement : event.target;
      const element = findLinkFromClickTarget(target) || target;
      return element instanceof Element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    started = false;
    constructor(delegate2, eventTarget) {
      this.delegate = delegate2;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickCaptured = () => {
      this.eventTarget.removeEventListener("click", this.clickBubbled, false);
      this.eventTarget.addEventListener("click", this.clickBubbled, false);
    };
    clickBubbled = (event) => {
      if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
        const target = event.composedPath && event.composedPath()[0] || event.target;
        const link2 = findLinkFromClickTarget(target);
        if (link2 && doesNotTargetIFrame(link2.target)) {
          const location2 = getLocationForLink(link2);
          if (this.delegate.willFollowLinkToLocation(link2, location2, event)) {
            event.preventDefault();
            this.delegate.followedLinkToLocation(link2, location2);
          }
        }
      }
    };
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
  };
  var FormLinkClickObserver = class {
    constructor(delegate2, element) {
      this.delegate = delegate2;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    // Link hover observer delegate
    canPrefetchRequestToLocation(link2, location2) {
      return false;
    }
    prefetchAndCacheRequestToLocation(link2, location2) {
      return;
    }
    // Link click observer delegate
    willFollowLinkToLocation(link2, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link2, location2, originalEvent) && (link2.hasAttribute("data-turbo-method") || link2.hasAttribute("data-turbo-stream"));
    }
    followedLinkToLocation(link2, location2) {
      const form2 = document.createElement("form");
      const type = "hidden";
      for (const [name2, value] of location2.searchParams) {
        form2.append(Object.assign(document.createElement("input"), { type, name: name2, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form2.setAttribute("data-turbo", "true");
      form2.setAttribute("action", action.href);
      form2.setAttribute("hidden", "");
      const method2 = link2.getAttribute("data-turbo-method");
      if (method2) form2.setAttribute("method", method2);
      const turboFrame = link2.getAttribute("data-turbo-frame");
      if (turboFrame) form2.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link2);
      if (turboAction) form2.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link2.getAttribute("data-turbo-confirm");
      if (turboConfirm) form2.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link2.hasAttribute("data-turbo-stream");
      if (turboStream) form2.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link2, location2, form2);
      document.body.appendChild(form2);
      form2.addEventListener("turbo:submit-end", () => form2.remove(), { once: true });
      requestAnimationFrame(() => form2.requestSubmit());
    }
  };
  var Bardo = class {
    static async preservingPermanentElements(delegate2, permanentElementMap, callback) {
      const bardo = new this(delegate2, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    constructor(delegate2, permanentElementMap) {
      this.delegate = delegate2;
      this.permanentElementMap = permanentElementMap;
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder?.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    #activeElement = null;
    static renderElement(currentElement, newElement) {
    }
    constructor(currentSnapshot, newSnapshot, isPreview, willRender = true) {
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = this.constructor.renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get shouldAutofocus() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    render() {
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      if (this.shouldAutofocus) {
        const element = this.connectedSnapshot.firstAutofocusableElement;
        if (element) {
          element.focus();
        }
      }
    }
    // Bardo delegate
    enteringBardo(currentPermanentElement) {
      if (this.#activeElement) return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.#activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.#activeElement) && this.#activeElement instanceof HTMLElement) {
        this.#activeElement.focus();
        this.#activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
    get renderMethod() {
      return "replace";
    }
  };
  var FrameRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = frameElement.ownerDocument?.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    constructor(delegate2, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate2;
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextRepaint();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextRepaint();
      this.focusFirstAutofocusableElement();
      await nextRepaint();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var Idiomorph = function() {
    const noOp = () => {
    };
    const defaults = {
      morphStyle: "outerHTML",
      callbacks: {
        beforeNodeAdded: noOp,
        afterNodeAdded: noOp,
        beforeNodeMorphed: noOp,
        afterNodeMorphed: noOp,
        beforeNodeRemoved: noOp,
        afterNodeRemoved: noOp,
        beforeAttributeUpdated: noOp
      },
      head: {
        style: "merge",
        shouldPreserve: (elt) => elt.getAttribute("im-preserve") === "true",
        shouldReAppend: (elt) => elt.getAttribute("im-re-append") === "true",
        shouldRemove: noOp,
        afterHeadMorphed: noOp
      },
      restoreFocus: true
    };
    function morph(oldNode, newContent, config2 = {}) {
      oldNode = normalizeElement(oldNode);
      const newNode = normalizeParent(newContent);
      const ctx = createMorphContext(oldNode, newNode, config2);
      const morphedNodes = saveAndRestoreFocus(ctx, () => {
        return withHeadBlocking(
          ctx,
          oldNode,
          newNode,
          /** @param {MorphContext} ctx */
          (ctx2) => {
            if (ctx2.morphStyle === "innerHTML") {
              morphChildren2(ctx2, oldNode, newNode);
              return Array.from(oldNode.childNodes);
            } else {
              return morphOuterHTML(ctx2, oldNode, newNode);
            }
          }
        );
      });
      ctx.pantry.remove();
      return morphedNodes;
    }
    function morphOuterHTML(ctx, oldNode, newNode) {
      const oldParent = normalizeParent(oldNode);
      let childNodes = Array.from(oldParent.childNodes);
      const index = childNodes.indexOf(oldNode);
      const rightMargin = childNodes.length - (index + 1);
      morphChildren2(
        ctx,
        oldParent,
        newNode,
        // these two optional params are the secret sauce
        oldNode,
        // start point for iteration
        oldNode.nextSibling
        // end point for iteration
      );
      childNodes = Array.from(oldParent.childNodes);
      return childNodes.slice(index, childNodes.length - rightMargin);
    }
    function saveAndRestoreFocus(ctx, fn) {
      if (!ctx.config.restoreFocus) return fn();
      let activeElement2 = (
        /** @type {HTMLInputElement|HTMLTextAreaElement|null} */
        document.activeElement
      );
      if (!(activeElement2 instanceof HTMLInputElement || activeElement2 instanceof HTMLTextAreaElement)) {
        return fn();
      }
      const { id: activeElementId, selectionStart, selectionEnd } = activeElement2;
      const results = fn();
      if (activeElementId && activeElementId !== document.activeElement?.id) {
        activeElement2 = ctx.target.querySelector(`#${activeElementId}`);
        activeElement2?.focus();
      }
      if (activeElement2 && !activeElement2.selectionEnd && selectionEnd) {
        activeElement2.setSelectionRange(selectionStart, selectionEnd);
      }
      return results;
    }
    const morphChildren2 = /* @__PURE__ */ function() {
      function morphChildren3(ctx, oldParent, newParent, insertionPoint = null, endPoint = null) {
        if (oldParent instanceof HTMLTemplateElement && newParent instanceof HTMLTemplateElement) {
          oldParent = oldParent.content;
          newParent = newParent.content;
        }
        insertionPoint ||= oldParent.firstChild;
        for (const newChild of newParent.childNodes) {
          if (insertionPoint && insertionPoint != endPoint) {
            const bestMatch = findBestMatch(
              ctx,
              newChild,
              insertionPoint,
              endPoint
            );
            if (bestMatch) {
              if (bestMatch !== insertionPoint) {
                removeNodesBetween(ctx, insertionPoint, bestMatch);
              }
              morphNode(bestMatch, newChild, ctx);
              insertionPoint = bestMatch.nextSibling;
              continue;
            }
          }
          if (newChild instanceof Element && ctx.persistentIds.has(newChild.id)) {
            const movedChild = moveBeforeById(
              oldParent,
              newChild.id,
              insertionPoint,
              ctx
            );
            morphNode(movedChild, newChild, ctx);
            insertionPoint = movedChild.nextSibling;
            continue;
          }
          const insertedNode = createNode(
            oldParent,
            newChild,
            insertionPoint,
            ctx
          );
          if (insertedNode) {
            insertionPoint = insertedNode.nextSibling;
          }
        }
        while (insertionPoint && insertionPoint != endPoint) {
          const tempNode = insertionPoint;
          insertionPoint = insertionPoint.nextSibling;
          removeNode(ctx, tempNode);
        }
      }
      function createNode(oldParent, newChild, insertionPoint, ctx) {
        if (ctx.callbacks.beforeNodeAdded(newChild) === false) return null;
        if (ctx.idMap.has(newChild)) {
          const newEmptyChild = document.createElement(
            /** @type {Element} */
            newChild.tagName
          );
          oldParent.insertBefore(newEmptyChild, insertionPoint);
          morphNode(newEmptyChild, newChild, ctx);
          ctx.callbacks.afterNodeAdded(newEmptyChild);
          return newEmptyChild;
        } else {
          const newClonedChild = document.importNode(newChild, true);
          oldParent.insertBefore(newClonedChild, insertionPoint);
          ctx.callbacks.afterNodeAdded(newClonedChild);
          return newClonedChild;
        }
      }
      const findBestMatch = /* @__PURE__ */ function() {
        function findBestMatch2(ctx, node, startPoint, endPoint) {
          let softMatch = null;
          let nextSibling = node.nextSibling;
          let siblingSoftMatchCount = 0;
          let cursor = startPoint;
          while (cursor && cursor != endPoint) {
            if (isSoftMatch(cursor, node)) {
              if (isIdSetMatch(ctx, cursor, node)) {
                return cursor;
              }
              if (softMatch === null) {
                if (!ctx.idMap.has(cursor)) {
                  softMatch = cursor;
                }
              }
            }
            if (softMatch === null && nextSibling && isSoftMatch(cursor, nextSibling)) {
              siblingSoftMatchCount++;
              nextSibling = nextSibling.nextSibling;
              if (siblingSoftMatchCount >= 2) {
                softMatch = void 0;
              }
            }
            if (cursor.contains(document.activeElement)) break;
            cursor = cursor.nextSibling;
          }
          return softMatch || null;
        }
        function isIdSetMatch(ctx, oldNode, newNode) {
          let oldSet = ctx.idMap.get(oldNode);
          let newSet = ctx.idMap.get(newNode);
          if (!newSet || !oldSet) return false;
          for (const id of oldSet) {
            if (newSet.has(id)) {
              return true;
            }
          }
          return false;
        }
        function isSoftMatch(oldNode, newNode) {
          const oldElt = (
            /** @type {Element} */
            oldNode
          );
          const newElt = (
            /** @type {Element} */
            newNode
          );
          return oldElt.nodeType === newElt.nodeType && oldElt.tagName === newElt.tagName && // If oldElt has an `id` with possible state and it doesn't match newElt.id then avoid morphing.
          // We'll still match an anonymous node with an IDed newElt, though, because if it got this far,
          // its not persistent, and new nodes can't have any hidden state.
          (!oldElt.id || oldElt.id === newElt.id);
        }
        return findBestMatch2;
      }();
      function removeNode(ctx, node) {
        if (ctx.idMap.has(node)) {
          moveBefore(ctx.pantry, node, null);
        } else {
          if (ctx.callbacks.beforeNodeRemoved(node) === false) return;
          node.parentNode?.removeChild(node);
          ctx.callbacks.afterNodeRemoved(node);
        }
      }
      function removeNodesBetween(ctx, startInclusive, endExclusive) {
        let cursor = startInclusive;
        while (cursor && cursor !== endExclusive) {
          let tempNode = (
            /** @type {Node} */
            cursor
          );
          cursor = cursor.nextSibling;
          removeNode(ctx, tempNode);
        }
        return cursor;
      }
      function moveBeforeById(parentNode, id, after2, ctx) {
        const target = (
          /** @type {Element} - will always be found */
          ctx.target.querySelector(`#${id}`) || ctx.pantry.querySelector(`#${id}`)
        );
        removeElementFromAncestorsIdMaps(target, ctx);
        moveBefore(parentNode, target, after2);
        return target;
      }
      function removeElementFromAncestorsIdMaps(element, ctx) {
        const id = element.id;
        while (element = element.parentNode) {
          let idSet = ctx.idMap.get(element);
          if (idSet) {
            idSet.delete(id);
            if (!idSet.size) {
              ctx.idMap.delete(element);
            }
          }
        }
      }
      function moveBefore(parentNode, element, after2) {
        if (parentNode.moveBefore) {
          try {
            parentNode.moveBefore(element, after2);
          } catch (e) {
            parentNode.insertBefore(element, after2);
          }
        } else {
          parentNode.insertBefore(element, after2);
        }
      }
      return morphChildren3;
    }();
    const morphNode = /* @__PURE__ */ function() {
      function morphNode2(oldNode, newContent, ctx) {
        if (ctx.ignoreActive && oldNode === document.activeElement) {
          return null;
        }
        if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false) {
          return oldNode;
        }
        if (oldNode instanceof HTMLHeadElement && ctx.head.ignore) ;
        else if (oldNode instanceof HTMLHeadElement && ctx.head.style !== "morph") {
          handleHeadElement(
            oldNode,
            /** @type {HTMLHeadElement} */
            newContent,
            ctx
          );
        } else {
          morphAttributes(oldNode, newContent, ctx);
          if (!ignoreValueOfActiveElement(oldNode, ctx)) {
            morphChildren2(ctx, oldNode, newContent);
          }
        }
        ctx.callbacks.afterNodeMorphed(oldNode, newContent);
        return oldNode;
      }
      function morphAttributes(oldNode, newNode, ctx) {
        let type = newNode.nodeType;
        if (type === 1) {
          const oldElt = (
            /** @type {Element} */
            oldNode
          );
          const newElt = (
            /** @type {Element} */
            newNode
          );
          const oldAttributes = oldElt.attributes;
          const newAttributes = newElt.attributes;
          for (const newAttribute of newAttributes) {
            if (ignoreAttribute(newAttribute.name, oldElt, "update", ctx)) {
              continue;
            }
            if (oldElt.getAttribute(newAttribute.name) !== newAttribute.value) {
              oldElt.setAttribute(newAttribute.name, newAttribute.value);
            }
          }
          for (let i = oldAttributes.length - 1; 0 <= i; i--) {
            const oldAttribute = oldAttributes[i];
            if (!oldAttribute) continue;
            if (!newElt.hasAttribute(oldAttribute.name)) {
              if (ignoreAttribute(oldAttribute.name, oldElt, "remove", ctx)) {
                continue;
              }
              oldElt.removeAttribute(oldAttribute.name);
            }
          }
          if (!ignoreValueOfActiveElement(oldElt, ctx)) {
            syncInputValue(oldElt, newElt, ctx);
          }
        }
        if (type === 8 || type === 3) {
          if (oldNode.nodeValue !== newNode.nodeValue) {
            oldNode.nodeValue = newNode.nodeValue;
          }
        }
      }
      function syncInputValue(oldElement, newElement, ctx) {
        if (oldElement instanceof HTMLInputElement && newElement instanceof HTMLInputElement && newElement.type !== "file") {
          let newValue = newElement.value;
          let oldValue = oldElement.value;
          syncBooleanAttribute(oldElement, newElement, "checked", ctx);
          syncBooleanAttribute(oldElement, newElement, "disabled", ctx);
          if (!newElement.hasAttribute("value")) {
            if (!ignoreAttribute("value", oldElement, "remove", ctx)) {
              oldElement.value = "";
              oldElement.removeAttribute("value");
            }
          } else if (oldValue !== newValue) {
            if (!ignoreAttribute("value", oldElement, "update", ctx)) {
              oldElement.setAttribute("value", newValue);
              oldElement.value = newValue;
            }
          }
        } else if (oldElement instanceof HTMLOptionElement && newElement instanceof HTMLOptionElement) {
          syncBooleanAttribute(oldElement, newElement, "selected", ctx);
        } else if (oldElement instanceof HTMLTextAreaElement && newElement instanceof HTMLTextAreaElement) {
          let newValue = newElement.value;
          let oldValue = oldElement.value;
          if (ignoreAttribute("value", oldElement, "update", ctx)) {
            return;
          }
          if (newValue !== oldValue) {
            oldElement.value = newValue;
          }
          if (oldElement.firstChild && oldElement.firstChild.nodeValue !== newValue) {
            oldElement.firstChild.nodeValue = newValue;
          }
        }
      }
      function syncBooleanAttribute(oldElement, newElement, attributeName, ctx) {
        const newLiveValue = newElement[attributeName], oldLiveValue = oldElement[attributeName];
        if (newLiveValue !== oldLiveValue) {
          const ignoreUpdate = ignoreAttribute(
            attributeName,
            oldElement,
            "update",
            ctx
          );
          if (!ignoreUpdate) {
            oldElement[attributeName] = newElement[attributeName];
          }
          if (newLiveValue) {
            if (!ignoreUpdate) {
              oldElement.setAttribute(attributeName, "");
            }
          } else {
            if (!ignoreAttribute(attributeName, oldElement, "remove", ctx)) {
              oldElement.removeAttribute(attributeName);
            }
          }
        }
      }
      function ignoreAttribute(attr, element, updateType, ctx) {
        if (attr === "value" && ctx.ignoreActiveValue && element === document.activeElement) {
          return true;
        }
        return ctx.callbacks.beforeAttributeUpdated(attr, element, updateType) === false;
      }
      function ignoreValueOfActiveElement(possibleActiveElement, ctx) {
        return !!ctx.ignoreActiveValue && possibleActiveElement === document.activeElement && possibleActiveElement !== document.body;
      }
      return morphNode2;
    }();
    function withHeadBlocking(ctx, oldNode, newNode, callback) {
      if (ctx.head.block) {
        const oldHead = oldNode.querySelector("head");
        const newHead = newNode.querySelector("head");
        if (oldHead && newHead) {
          const promises = handleHeadElement(oldHead, newHead, ctx);
          return Promise.all(promises).then(() => {
            const newCtx = Object.assign(ctx, {
              head: {
                block: false,
                ignore: true
              }
            });
            return callback(newCtx);
          });
        }
      }
      return callback(ctx);
    }
    function handleHeadElement(oldHead, newHead, ctx) {
      let added = [];
      let removed = [];
      let preserved = [];
      let nodesToAppend = [];
      let srcToNewHeadNodes = /* @__PURE__ */ new Map();
      for (const newHeadChild of newHead.children) {
        srcToNewHeadNodes.set(newHeadChild.outerHTML, newHeadChild);
      }
      for (const currentHeadElt of oldHead.children) {
        let inNewContent = srcToNewHeadNodes.has(currentHeadElt.outerHTML);
        let isReAppended = ctx.head.shouldReAppend(currentHeadElt);
        let isPreserved = ctx.head.shouldPreserve(currentHeadElt);
        if (inNewContent || isPreserved) {
          if (isReAppended) {
            removed.push(currentHeadElt);
          } else {
            srcToNewHeadNodes.delete(currentHeadElt.outerHTML);
            preserved.push(currentHeadElt);
          }
        } else {
          if (ctx.head.style === "append") {
            if (isReAppended) {
              removed.push(currentHeadElt);
              nodesToAppend.push(currentHeadElt);
            }
          } else {
            if (ctx.head.shouldRemove(currentHeadElt) !== false) {
              removed.push(currentHeadElt);
            }
          }
        }
      }
      nodesToAppend.push(...srcToNewHeadNodes.values());
      let promises = [];
      for (const newNode of nodesToAppend) {
        let newElt = (
          /** @type {ChildNode} */
          document.createRange().createContextualFragment(newNode.outerHTML).firstChild
        );
        if (ctx.callbacks.beforeNodeAdded(newElt) !== false) {
          if ("href" in newElt && newElt.href || "src" in newElt && newElt.src) {
            let resolve;
            let promise = new Promise(function(_resolve) {
              resolve = _resolve;
            });
            newElt.addEventListener("load", function() {
              resolve();
            });
            promises.push(promise);
          }
          oldHead.appendChild(newElt);
          ctx.callbacks.afterNodeAdded(newElt);
          added.push(newElt);
        }
      }
      for (const removedElement of removed) {
        if (ctx.callbacks.beforeNodeRemoved(removedElement) !== false) {
          oldHead.removeChild(removedElement);
          ctx.callbacks.afterNodeRemoved(removedElement);
        }
      }
      ctx.head.afterHeadMorphed(oldHead, {
        added,
        kept: preserved,
        removed
      });
      return promises;
    }
    const createMorphContext = /* @__PURE__ */ function() {
      function createMorphContext2(oldNode, newContent, config2) {
        const { persistentIds, idMap } = createIdMaps(oldNode, newContent);
        const mergedConfig = mergeDefaults(config2);
        const morphStyle = mergedConfig.morphStyle || "outerHTML";
        if (!["innerHTML", "outerHTML"].includes(morphStyle)) {
          throw `Do not understand how to morph style ${morphStyle}`;
        }
        return {
          target: oldNode,
          newContent,
          config: mergedConfig,
          morphStyle,
          ignoreActive: mergedConfig.ignoreActive,
          ignoreActiveValue: mergedConfig.ignoreActiveValue,
          restoreFocus: mergedConfig.restoreFocus,
          idMap,
          persistentIds,
          pantry: createPantry(),
          callbacks: mergedConfig.callbacks,
          head: mergedConfig.head
        };
      }
      function mergeDefaults(config2) {
        let finalConfig = Object.assign({}, defaults);
        Object.assign(finalConfig, config2);
        finalConfig.callbacks = Object.assign(
          {},
          defaults.callbacks,
          config2.callbacks
        );
        finalConfig.head = Object.assign({}, defaults.head, config2.head);
        return finalConfig;
      }
      function createPantry() {
        const pantry = document.createElement("div");
        pantry.hidden = true;
        document.body.insertAdjacentElement("afterend", pantry);
        return pantry;
      }
      function findIdElements(root) {
        let elements = Array.from(root.querySelectorAll("[id]"));
        if (root.id) {
          elements.push(root);
        }
        return elements;
      }
      function populateIdMapWithTree(idMap, persistentIds, root, elements) {
        for (const elt of elements) {
          if (persistentIds.has(elt.id)) {
            let current = elt;
            while (current) {
              let idSet = idMap.get(current);
              if (idSet == null) {
                idSet = /* @__PURE__ */ new Set();
                idMap.set(current, idSet);
              }
              idSet.add(elt.id);
              if (current === root) break;
              current = current.parentElement;
            }
          }
        }
      }
      function createIdMaps(oldContent, newContent) {
        const oldIdElements = findIdElements(oldContent);
        const newIdElements = findIdElements(newContent);
        const persistentIds = createPersistentIds(oldIdElements, newIdElements);
        let idMap = /* @__PURE__ */ new Map();
        populateIdMapWithTree(idMap, persistentIds, oldContent, oldIdElements);
        const newRoot = newContent.__idiomorphRoot || newContent;
        populateIdMapWithTree(idMap, persistentIds, newRoot, newIdElements);
        return { persistentIds, idMap };
      }
      function createPersistentIds(oldIdElements, newIdElements) {
        let duplicateIds = /* @__PURE__ */ new Set();
        let oldIdTagNameMap = /* @__PURE__ */ new Map();
        for (const { id, tagName } of oldIdElements) {
          if (oldIdTagNameMap.has(id)) {
            duplicateIds.add(id);
          } else {
            oldIdTagNameMap.set(id, tagName);
          }
        }
        let persistentIds = /* @__PURE__ */ new Set();
        for (const { id, tagName } of newIdElements) {
          if (persistentIds.has(id)) {
            duplicateIds.add(id);
          } else if (oldIdTagNameMap.get(id) === tagName) {
            persistentIds.add(id);
          }
        }
        for (const id of duplicateIds) {
          persistentIds.delete(id);
        }
        return persistentIds;
      }
      return createMorphContext2;
    }();
    const { normalizeElement, normalizeParent } = /* @__PURE__ */ function() {
      const generatedByIdiomorph = /* @__PURE__ */ new WeakSet();
      function normalizeElement2(content) {
        if (content instanceof Document) {
          return content.documentElement;
        } else {
          return content;
        }
      }
      function normalizeParent2(newContent) {
        if (newContent == null) {
          return document.createElement("div");
        } else if (typeof newContent === "string") {
          return normalizeParent2(parseContent(newContent));
        } else if (generatedByIdiomorph.has(
          /** @type {Element} */
          newContent
        )) {
          return (
            /** @type {Element} */
            newContent
          );
        } else if (newContent instanceof Node) {
          if (newContent.parentNode) {
            return createDuckTypedParent(newContent);
          } else {
            const dummyParent = document.createElement("div");
            dummyParent.append(newContent);
            return dummyParent;
          }
        } else {
          const dummyParent = document.createElement("div");
          for (const elt of [...newContent]) {
            dummyParent.append(elt);
          }
          return dummyParent;
        }
      }
      function createDuckTypedParent(newContent) {
        return (
          /** @type {Element} */
          /** @type {unknown} */
          {
            childNodes: [newContent],
            /** @ts-ignore - cover your eyes for a minute, tsc */
            querySelectorAll: (s) => {
              const elements = newContent.querySelectorAll(s);
              return newContent.matches(s) ? [newContent, ...elements] : elements;
            },
            /** @ts-ignore */
            insertBefore: (n, r) => newContent.parentNode.insertBefore(n, r),
            /** @ts-ignore */
            moveBefore: (n, r) => newContent.parentNode.moveBefore(n, r),
            // for later use with populateIdMapWithTree to halt upwards iteration
            get __idiomorphRoot() {
              return newContent;
            }
          }
        );
      }
      function parseContent(newContent) {
        let parser = new DOMParser();
        let contentWithSvgsRemoved = newContent.replace(
          /<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,
          ""
        );
        if (contentWithSvgsRemoved.match(/<\/html>/) || contentWithSvgsRemoved.match(/<\/head>/) || contentWithSvgsRemoved.match(/<\/body>/)) {
          let content = parser.parseFromString(newContent, "text/html");
          if (contentWithSvgsRemoved.match(/<\/html>/)) {
            generatedByIdiomorph.add(content);
            return content;
          } else {
            let htmlElement = content.firstChild;
            if (htmlElement) {
              generatedByIdiomorph.add(htmlElement);
            }
            return htmlElement;
          }
        } else {
          let responseDoc = parser.parseFromString(
            "<body><template>" + newContent + "</template></body>",
            "text/html"
          );
          let content = (
            /** @type {HTMLTemplateElement} */
            responseDoc.body.querySelector("template").content
          );
          generatedByIdiomorph.add(content);
          return content;
        }
      }
      return { normalizeElement: normalizeElement2, normalizeParent: normalizeParent2 };
    }();
    return {
      morph,
      defaults
    };
  }();
  function morphElements(currentElement, newElement, { callbacks, ...options } = {}) {
    Idiomorph.morph(currentElement, newElement, {
      ...options,
      callbacks: new DefaultIdiomorphCallbacks(callbacks)
    });
  }
  function morphChildren(currentElement, newElement) {
    morphElements(currentElement, newElement.childNodes, {
      morphStyle: "innerHTML"
    });
  }
  var DefaultIdiomorphCallbacks = class {
    #beforeNodeMorphed;
    constructor({ beforeNodeMorphed } = {}) {
      this.#beforeNodeMorphed = beforeNodeMorphed || (() => true);
    }
    beforeNodeAdded = (node) => {
      return !(node.id && node.hasAttribute("data-turbo-permanent") && document.getElementById(node.id));
    };
    beforeNodeMorphed = (currentElement, newElement) => {
      if (currentElement instanceof Element) {
        if (!currentElement.hasAttribute("data-turbo-permanent") && this.#beforeNodeMorphed(currentElement, newElement)) {
          const event = dispatch("turbo:before-morph-element", {
            cancelable: true,
            target: currentElement,
            detail: { currentElement, newElement }
          });
          return !event.defaultPrevented;
        } else {
          return false;
        }
      }
    };
    beforeAttributeUpdated = (attributeName, target, mutationType) => {
      const event = dispatch("turbo:before-morph-attribute", {
        cancelable: true,
        target,
        detail: { attributeName, mutationType }
      });
      return !event.defaultPrevented;
    };
    beforeNodeRemoved = (node) => {
      return this.beforeNodeMorphed(node);
    };
    afterNodeMorphed = (currentElement, newElement) => {
      if (currentElement instanceof Element) {
        dispatch("turbo:morph-element", {
          target: currentElement,
          detail: { currentElement, newElement }
        });
      }
    };
  };
  var MorphingFrameRenderer = class extends FrameRenderer {
    static renderElement(currentElement, newElement) {
      dispatch("turbo:before-frame-morph", {
        target: currentElement,
        detail: { currentElement, newElement }
      });
      morphChildren(currentElement, newElement);
    }
    async preservingPermanentElements(callback) {
      return await callback();
    }
  };
  var ProgressBar = class _ProgressBar {
    static animationDuration = 300;
    /*ms*/
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${_ProgressBar.animationDuration}ms ease-out,
          opacity ${_ProgressBar.animationDuration / 2}ms ${_ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    hiding = false;
    value = 0;
    visible = false;
    constructor() {
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    // Private
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, _ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, _ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    trickle = () => {
      this.setValue(this.value + Math.random() / 100);
    };
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = _ProgressBar.defaultCSS;
      const cspNonce2 = getCspNonce();
      if (cspNonce2) {
        element.nonce = cspNonce2;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
  };
  var HeadSnapshot = class extends Snapshot {
    detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
      const { outerHTML } = element;
      const details = outerHTML in result ? result[outerHTML] : {
        type: elementType(element),
        tracked: elementIsTracked(element),
        elements: []
      };
      return {
        ...result,
        [outerHTML]: {
          ...details,
          elements: [...details.elements, element]
        }
      };
    }, {});
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name2) {
      const element = this.findMetaElementByName(name2);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name2) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const {
          elements: [element]
        } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name2) ? element : result;
      }, void 0 | void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name2) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name2;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class _PageSnapshot extends Snapshot {
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ documentElement, body, head }) {
      return new this(documentElement, body, new HeadSnapshot(head));
    }
    constructor(documentElement, body, headSnapshot) {
      super(body);
      this.documentElement = documentElement;
      this.headSnapshot = headSnapshot;
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions) option.selected = false;
        for (const option of source.selectedOptions) clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new _PageSnapshot(this.documentElement, clonedElement, this.headSnapshot);
    }
    get lang() {
      return this.documentElement.getAttribute("lang");
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      const root = this.getSetting("root") ?? "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    get prefersViewTransitions() {
      return this.headSnapshot.getMetaValue("view-transition") === "same-origin";
    }
    get shouldMorphPage() {
      return this.getSetting("refresh-method") === "morph";
    }
    get shouldPreserveScrollPosition() {
      return this.getSetting("refresh-scroll") === "preserve";
    }
    // Private
    getSetting(name2) {
      return this.headSnapshot.getMetaValue(`turbo-${name2}`);
    }
  };
  var ViewTransitioner = class {
    #viewTransitionStarted = false;
    #lastOperation = Promise.resolve();
    renderChange(useViewTransition, render) {
      if (useViewTransition && this.viewTransitionsAvailable && !this.#viewTransitionStarted) {
        this.#viewTransitionStarted = true;
        this.#lastOperation = this.#lastOperation.then(async () => {
          await document.startViewTransition(render).finished;
        });
      } else {
        this.#lastOperation = this.#lastOperation.then(render);
      }
      return this.#lastOperation;
    }
    get viewTransitionsAvailable() {
      return document.startViewTransition;
    }
  };
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var TimingMetric = {
    visitStart: "visitStart",
    requestStart: "requestStart",
    requestEnd: "requestEnd",
    visitEnd: "visitEnd"
  };
  var VisitState = {
    initialized: "initialized",
    started: "started",
    canceled: "canceled",
    failed: "failed",
    completed: "completed"
  };
  var SystemStatusCode = {
    networkFailure: 0,
    timeoutFailure: -1,
    contentTypeMismatch: -2
  };
  var Direction = {
    advance: "forward",
    restore: "back",
    replace: "none"
  };
  var Visit = class {
    identifier = uuid();
    // Required by turbo-ios
    timingMetrics = {};
    followedRedirect = false;
    historyChanged = false;
    scrolled = false;
    shouldCacheSnapshot = true;
    acceptsStreamResponse = false;
    snapshotCached = false;
    state = VisitState.initialized;
    viewTransitioner = new ViewTransitioner();
    constructor(delegate2, location2, restorationIdentifier, options = {}) {
      this.delegate = delegate2;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const {
        action,
        historyChanged,
        referrer,
        snapshot,
        snapshotHTML,
        response: response2,
        visitCachedSnapshot,
        willRender,
        updateHistory,
        shouldCacheSnapshot,
        acceptsStreamResponse,
        direction
      } = {
        ...defaultOptions,
        ...options
      };
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response2;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.isPageRefresh = this.view.isPageRefresh(this);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
      this.direction = direction || Direction[action];
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.adapter.visitCompleted(this);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
        this.delegate.visitCompleted(this);
      }
    }
    changeHistory() {
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === this.referrer?.href ? "replace" : this.action;
        const method2 = getHistoryMethodForAction(actionForHistory);
        this.history.update(method2, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response2 = this.response) {
      this.response = response2;
      if (response2) {
        const { statusCode } = response2;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot) this.cacheSnapshot();
          if (this.view.renderPromise) await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            const snapshot = PageSnapshot.fromHTMLString(responseHTML);
            await this.renderPageSnapshot(snapshot, false);
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage || this.isPageRefresh) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise) await this.view.renderPromise;
            await this.renderPageSnapshot(snapshot, isPreview);
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      if (this.redirectedToLocation && !this.followedRedirect && this.response?.redirected) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    // Fetch request delegate
    prepareRequest(request2) {
      if (this.acceptsStreamResponse) {
        request2.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request2, response2) {
      const responseHTML = await response2.responseHTML;
      const { redirected, statusCode } = response2;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response2.redirected ? response2.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request2, response2) {
      const responseHTML = await response2.responseHTML;
      const { redirected, statusCode } = response2;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    // Scrolling
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded && !this.view.shouldPreserveScrollPosition(this)) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    // Instrumentation
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
    }
    getTimingMetrics() {
      return { ...this.timingMetrics };
    }
    // Private
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = document.visibilityState === "hidden" ? setTimeout(() => resolve(), 0) : requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    async renderPageSnapshot(snapshot, isPreview) {
      await this.viewTransitioner.renderChange(this.view.shouldTransitionTo(snapshot), async () => {
        await this.view.renderPage(snapshot, isPreview, this.willRender, this);
        this.performScroll();
      });
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    progressBar = new ProgressBar();
    constructor(session2) {
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      if (locationIsVisitable(location2, this.navigator.rootLocation)) {
        this.navigator.startVisit(location2, options?.restorationIdentifier || uuid(), options);
      } else {
        window.location.href = location2.toString();
      }
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
    }
    visitCompleted(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitRendered(_visit) {
    }
    // Link prefetching
    linkPrefetchingIsEnabledForLocation(location2) {
      return true;
    }
    // Form Submission Delegate
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    // Private
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    showProgressBar = () => {
      this.progressBar.show();
    };
    reload(reason) {
      dispatch("turbo:reload", { detail: reason });
      window.location.href = this.location?.toString() || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    selector = "[data-turbo-temporary]";
    deprecatedSelector = "[data-turbo-cache=false]";
    started = false;
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    removeTemporaryElements = (_event) => {
      for (const element of this.temporaryElements) {
        element.remove();
      }
    };
    get temporaryElements() {
      return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
    }
    get temporaryElementsWithDeprecation() {
      const elements = document.querySelectorAll(this.deprecatedSelector);
      if (elements.length) {
        console.warn(
          `The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`
        );
      }
      return [...elements];
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    // Link interceptor delegate
    shouldInterceptLinkClick(element, _location, _event) {
      return this.#shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.#findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    // Form submit observer delegate
    willSubmitForm(element, submitter2) {
      return element.closest("turbo-frame") == null && this.#shouldSubmit(element, submitter2) && this.#shouldRedirect(element, submitter2);
    }
    formSubmitted(element, submitter2) {
      const frame = this.#findFrameElement(element, submitter2);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter2);
      }
    }
    #shouldSubmit(form2, submitter2) {
      const action = getAction$1(form2, submitter2);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL(meta?.content ?? "/");
      return this.#shouldRedirect(form2, submitter2) && locationIsVisitable(action, rootLocation);
    }
    #shouldRedirect(element, submitter2) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter2) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.#findFrameElement(element, submitter2);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    #findFrameElement(element, submitter2) {
      const id = submitter2?.getAttribute("data-turbo-frame") || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    location;
    restorationIdentifier = uuid();
    restorationData = {};
    started = false;
    pageLoaded = false;
    currentIndex = 0;
    constructor(delegate2) {
      this.delegate = delegate2;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.currentIndex = history.state?.turbo?.restorationIndex || 0;
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method2, location2, restorationIdentifier = uuid()) {
      if (method2 === history.pushState) ++this.currentIndex;
      const state = { turbo: { restorationIdentifier, restorationIndex: this.currentIndex } };
      method2.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    // Restoration data
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = {
        ...restorationData,
        ...additionalData
      };
    }
    // Scroll restoration
    assumeControlOfScrollRestoration() {
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = history.scrollRestoration ?? "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    // Event handlers
    onPopState = (event) => {
      if (this.shouldHandlePopState()) {
        const { turbo } = event.state || {};
        if (turbo) {
          this.location = new URL(window.location.href);
          const { restorationIdentifier, restorationIndex } = turbo;
          this.restorationIdentifier = restorationIdentifier;
          const direction = restorationIndex > this.currentIndex ? "forward" : "back";
          this.delegate.historyPoppedToLocationWithRestorationIdentifierAndDirection(this.location, restorationIdentifier, direction);
          this.currentIndex = restorationIndex;
        }
      }
    };
    onPageLoad = async (_event) => {
      await nextMicrotask();
      this.pageLoaded = true;
    };
    // Private
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var LinkPrefetchObserver = class {
    started = false;
    #prefetchedLink = null;
    constructor(delegate2, eventTarget) {
      this.delegate = delegate2;
      this.eventTarget = eventTarget;
    }
    start() {
      if (this.started) return;
      if (this.eventTarget.readyState === "loading") {
        this.eventTarget.addEventListener("DOMContentLoaded", this.#enable, { once: true });
      } else {
        this.#enable();
      }
    }
    stop() {
      if (!this.started) return;
      this.eventTarget.removeEventListener("mouseenter", this.#tryToPrefetchRequest, {
        capture: true,
        passive: true
      });
      this.eventTarget.removeEventListener("mouseleave", this.#cancelRequestIfObsolete, {
        capture: true,
        passive: true
      });
      this.eventTarget.removeEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
      this.started = false;
    }
    #enable = () => {
      this.eventTarget.addEventListener("mouseenter", this.#tryToPrefetchRequest, {
        capture: true,
        passive: true
      });
      this.eventTarget.addEventListener("mouseleave", this.#cancelRequestIfObsolete, {
        capture: true,
        passive: true
      });
      this.eventTarget.addEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
      this.started = true;
    };
    #tryToPrefetchRequest = (event) => {
      if (getMetaContent("turbo-prefetch") === "false") return;
      const target = event.target;
      const isLink = target.matches && target.matches("a[href]:not([target^=_]):not([download])");
      if (isLink && this.#isPrefetchable(target)) {
        const link2 = target;
        const location2 = getLocationForLink(link2);
        if (this.delegate.canPrefetchRequestToLocation(link2, location2)) {
          this.#prefetchedLink = link2;
          const fetchRequest = new FetchRequest(
            this,
            FetchMethod.get,
            location2,
            new URLSearchParams(),
            target
          );
          prefetchCache.setLater(location2.toString(), fetchRequest, this.#cacheTtl);
        }
      }
    };
    #cancelRequestIfObsolete = (event) => {
      if (event.target === this.#prefetchedLink) this.#cancelPrefetchRequest();
    };
    #cancelPrefetchRequest = () => {
      prefetchCache.clear();
      this.#prefetchedLink = null;
    };
    #tryToUsePrefetchedRequest = (event) => {
      if (event.target.tagName !== "FORM" && event.detail.fetchOptions.method === "GET") {
        const cached = prefetchCache.get(event.detail.url.toString());
        if (cached) {
          event.detail.fetchRequest = cached;
        }
        prefetchCache.clear();
      }
    };
    prepareRequest(request2) {
      const link2 = request2.target;
      request2.headers["X-Sec-Purpose"] = "prefetch";
      const turboFrame = link2.closest("turbo-frame");
      const turboFrameTarget = link2.getAttribute("data-turbo-frame") || turboFrame?.getAttribute("target") || turboFrame?.id;
      if (turboFrameTarget && turboFrameTarget !== "_top") {
        request2.headers["Turbo-Frame"] = turboFrameTarget;
      }
    }
    // Fetch request interface
    requestSucceededWithResponse() {
    }
    requestStarted(fetchRequest) {
    }
    requestErrored(fetchRequest) {
    }
    requestFinished(fetchRequest) {
    }
    requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
    }
    requestFailedWithResponse(fetchRequest, fetchResponse) {
    }
    get #cacheTtl() {
      return Number(getMetaContent("turbo-prefetch-cache-time")) || cacheTtl;
    }
    #isPrefetchable(link2) {
      const href = link2.getAttribute("href");
      if (!href) return false;
      if (unfetchableLink(link2)) return false;
      if (linkToTheSamePage(link2)) return false;
      if (linkOptsOut(link2)) return false;
      if (nonSafeLink(link2)) return false;
      if (eventPrevented(link2)) return false;
      return true;
    }
  };
  var unfetchableLink = (link2) => {
    return link2.origin !== document.location.origin || !["http:", "https:"].includes(link2.protocol) || link2.hasAttribute("target");
  };
  var linkToTheSamePage = (link2) => {
    return link2.pathname + link2.search === document.location.pathname + document.location.search || link2.href.startsWith("#");
  };
  var linkOptsOut = (link2) => {
    if (link2.getAttribute("data-turbo-prefetch") === "false") return true;
    if (link2.getAttribute("data-turbo") === "false") return true;
    const turboPrefetchParent = findClosestRecursively(link2, "[data-turbo-prefetch]");
    if (turboPrefetchParent && turboPrefetchParent.getAttribute("data-turbo-prefetch") === "false") return true;
    return false;
  };
  var nonSafeLink = (link2) => {
    const turboMethod = link2.getAttribute("data-turbo-method");
    if (turboMethod && turboMethod.toLowerCase() !== "get") return true;
    if (isUJS(link2)) return true;
    if (link2.hasAttribute("data-turbo-confirm")) return true;
    if (link2.hasAttribute("data-turbo-stream")) return true;
    return false;
  };
  var isUJS = (link2) => {
    return link2.hasAttribute("data-remote") || link2.hasAttribute("data-behavior") || link2.hasAttribute("data-confirm") || link2.hasAttribute("data-method");
  };
  var eventPrevented = (link2) => {
    const event = dispatch("turbo:before-prefetch", { target: link2, cancelable: true });
    return event.defaultPrevented;
  };
  var Navigator = class {
    constructor(delegate2) {
      this.delegate = delegate2;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        this.delegate.visitProposedToLocation(location2, options);
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, {
        referrer: this.location,
        ...options
      });
      this.currentVisit.start();
    }
    submitForm(form2, submitter2) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form2, submitter2, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get rootLocation() {
      return this.view.snapshot.rootLocation;
    }
    get history() {
      return this.delegate.history;
    }
    // Form submission delegate
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.isSafe;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.#getActionForFormSubmission(formSubmission, fetchResponse);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        if (!snapshot.shouldPreserveScrollPosition) {
          this.view.scrollToTop();
        }
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error) {
      console.error(error);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    // Link prefetching
    linkPrefetchingIsEnabledForLocation(location2) {
      if (typeof this.adapter.linkPrefetchingIsEnabledForLocation === "function") {
        return this.adapter.linkPrefetchingIsEnabledForLocation(location2);
      }
      return true;
    }
    // Visit delegate
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
      delete this.currentVisit;
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    // Visits
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    #getActionForFormSubmission(formSubmission, fetchResponse) {
      const { submitter: submitter2, formElement } = formSubmission;
      return getVisitAction(submitter2, formElement) || this.#getDefaultAction(fetchResponse);
    }
    #getDefaultAction(fetchResponse) {
      const sameLocationRedirect = fetchResponse.redirected && fetchResponse.location.href === this.location?.href;
      return sameLocationRedirect ? "replace" : "advance";
    }
  };
  var PageStage = {
    initial: 0,
    loading: 1,
    interactive: 2,
    complete: 3
  };
  var PageObserver = class {
    stage = PageStage.initial;
    started = false;
    constructor(delegate2) {
      this.delegate = delegate2;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    interpretReadyState = () => {
      const { readyState } = this;
      if (readyState == "interactive") {
        this.pageIsInteractive();
      } else if (readyState == "complete") {
        this.pageIsComplete();
      }
    };
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    pageWillUnload = () => {
      this.delegate.pageWillUnload();
    };
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    started = false;
    constructor(delegate2) {
      this.delegate = delegate2;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    onScroll = () => {
      this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
    };
    // Private
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => {
        withAutofocusFromFragment(fragment, () => {
          withPreservedFocus(() => {
            document.documentElement.appendChild(fragment);
          });
        });
      });
    }
    // Bardo delegate
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
        if (elementInStream) {
          permanentElementMap[id] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  async function withAutofocusFromFragment(fragment, callback) {
    const generatedID = `turbo-stream-autofocus-${uuid()}`;
    const turboStreams = fragment.querySelectorAll("turbo-stream");
    const elementWithAutofocus = firstAutofocusableElementInStreams(turboStreams);
    let willAutofocusId = null;
    if (elementWithAutofocus) {
      if (elementWithAutofocus.id) {
        willAutofocusId = elementWithAutofocus.id;
      } else {
        willAutofocusId = generatedID;
      }
      elementWithAutofocus.id = willAutofocusId;
    }
    callback();
    await nextRepaint();
    const hasNoActiveElement = document.activeElement == null || document.activeElement == document.body;
    if (hasNoActiveElement && willAutofocusId) {
      const elementToAutofocus = document.getElementById(willAutofocusId);
      if (elementIsFocusable(elementToAutofocus)) {
        elementToAutofocus.focus();
      }
      if (elementToAutofocus && elementToAutofocus.id == generatedID) {
        elementToAutofocus.removeAttribute("id");
      }
    }
  }
  async function withPreservedFocus(callback) {
    const [activeElementBeforeRender, activeElementAfterRender] = await around(callback, () => document.activeElement);
    const restoreFocusTo = activeElementBeforeRender && activeElementBeforeRender.id;
    if (restoreFocusTo) {
      const elementToFocus = document.getElementById(restoreFocusTo);
      if (elementIsFocusable(elementToFocus) && elementToFocus != activeElementAfterRender) {
        elementToFocus.focus();
      }
    }
  }
  function firstAutofocusableElementInStreams(nodeListOfStreamElements) {
    for (const streamElement of nodeListOfStreamElements) {
      const elementWithAutofocus = queryAutofocusableElement(streamElement.templateElement.content);
      if (elementWithAutofocus) return elementWithAutofocus;
    }
    return null;
  }
  var StreamObserver = class {
    sources = /* @__PURE__ */ new Set();
    #started = false;
    constructor(delegate2) {
      this.delegate = delegate2;
    }
    start() {
      if (!this.#started) {
        this.#started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.#started) {
        this.#started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    inspectFetchResponse = (event) => {
      const response2 = fetchResponseFromEvent(event);
      if (response2 && fetchResponseIsStream(response2)) {
        event.preventDefault();
        this.receiveMessageResponse(response2);
      }
    };
    receiveMessageEvent = (event) => {
      if (this.#started && typeof event.data == "string") {
        this.receiveMessageHTML(event.data);
      }
    };
    async receiveMessageResponse(response2) {
      const html = await response2.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    const fetchResponse = event.detail?.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response2) {
    const contentType = response2.contentType ?? "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      this.#setLanguage();
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    #setLanguage() {
      const { documentElement } = this.currentSnapshot;
      const { lang } = this.newSnapshot;
      if (lang) {
        documentElement.setAttribute("lang", lang);
      } else {
        documentElement.removeAttribute("lang");
      }
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
      if (this.willRender) {
        this.removeUnusedDynamicStylesheetElements();
      }
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    removeUnusedDynamicStylesheetElements() {
      for (const element of this.unusedDynamicStylesheetElements) {
        document.head.removeChild(element);
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get unusedDynamicStylesheetElements() {
      return this.oldHeadStylesheetElements.filter((element) => {
        return element.getAttribute("data-turbo-track") === "dynamic";
      });
    }
    get oldHeadStylesheetElements() {
      return this.currentHeadSnapshot.getStylesheetElementsNotInSnapshot(this.newHeadSnapshot);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var MorphingPageRenderer = class extends PageRenderer {
    static renderElement(currentElement, newElement) {
      morphElements(currentElement, newElement, {
        callbacks: {
          beforeNodeMorphed: (element) => !canRefreshFrame(element)
        }
      });
      for (const frame of currentElement.querySelectorAll("turbo-frame")) {
        if (canRefreshFrame(frame)) frame.reload();
      }
      dispatch("turbo:morph", { detail: { currentElement, newElement } });
    }
    async preservingPermanentElements(callback) {
      return await callback();
    }
    get renderMethod() {
      return "morph";
    }
    get shouldAutofocus() {
      return false;
    }
  };
  function canRefreshFrame(frame) {
    return frame instanceof FrameElement && frame.src && frame.refresh === "morph" && !frame.closest("[data-turbo-permanent]");
  }
  var SnapshotCache = class {
    keys = [];
    snapshots = {};
    constructor(size) {
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    // Private
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1) this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    snapshotCache = new SnapshotCache(10);
    lastRenderedLocation = new URL(location.href);
    forceReloaded = false;
    shouldTransitionTo(newSnapshot) {
      return this.snapshot.prefersViewTransitions && newSnapshot.prefersViewTransitions;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const shouldMorphPage = this.isPageRefresh(visit2) && this.snapshot.shouldMorphPage;
      const rendererClass = shouldMorphPage ? MorphingPageRenderer : PageRenderer;
      const renderer = new rendererClass(this.snapshot, snapshot, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2?.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2?.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    isPageRefresh(visit2) {
      return !visit2 || this.lastRenderedLocation.pathname === visit2.location.pathname && visit2.action === "replace";
    }
    shouldPreserveScrollPosition(visit2) {
      return this.isPageRefresh(visit2) && this.snapshot.shouldPreserveScrollPosition;
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    selector = "a[data-turbo-preload]";
    constructor(delegate2, snapshotCache) {
      this.delegate = delegate2;
      this.snapshotCache = snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", this.#preloadAll);
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    stop() {
      document.removeEventListener("DOMContentLoaded", this.#preloadAll);
    }
    preloadOnLoadLinksForView(element) {
      for (const link2 of element.querySelectorAll(this.selector)) {
        if (this.delegate.shouldPreloadLink(link2)) {
          this.preloadURL(link2);
        }
      }
    }
    async preloadURL(link2) {
      const location2 = new URL(link2.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      const fetchRequest = new FetchRequest(this, FetchMethod.get, location2, new URLSearchParams(), link2);
      await fetchRequest.perform();
    }
    // Fetch request delegate
    prepareRequest(fetchRequest) {
      fetchRequest.headers["X-Sec-Purpose"] = "prefetch";
    }
    async requestSucceededWithResponse(fetchRequest, fetchResponse) {
      try {
        const responseHTML = await fetchResponse.responseHTML;
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        this.snapshotCache.put(fetchRequest.url, snapshot);
      } catch (_) {
      }
    }
    requestStarted(fetchRequest) {
    }
    requestErrored(fetchRequest) {
    }
    requestFinished(fetchRequest) {
    }
    requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
    }
    requestFailedWithResponse(fetchRequest, fetchResponse) {
    }
    #preloadAll = () => {
      this.preloadOnLoadLinksForView(document.body);
    };
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.#setCacheControl("");
    }
    exemptPageFromCache() {
      this.#setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.#setCacheControl("no-preview");
    }
    #setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var Session = class {
    navigator = new Navigator(this);
    history = new History(this);
    view = new PageView(this, document.documentElement);
    adapter = new BrowserAdapter(this);
    pageObserver = new PageObserver(this);
    cacheObserver = new CacheObserver();
    linkPrefetchObserver = new LinkPrefetchObserver(this, document);
    linkClickObserver = new LinkClickObserver(this, window);
    formSubmitObserver = new FormSubmitObserver(this, document);
    scrollObserver = new ScrollObserver(this);
    streamObserver = new StreamObserver(this);
    formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
    frameRedirector = new FrameRedirector(this, document.documentElement);
    streamMessageRenderer = new StreamMessageRenderer();
    cache = new Cache(this);
    enabled = true;
    started = false;
    #pageRefreshDebouncePeriod = 150;
    constructor(recentRequests2) {
      this.recentRequests = recentRequests2;
      this.preloader = new Preloader(this, this.view.snapshotCache);
      this.debouncedRefresh = this.refresh;
      this.pageRefreshDebouncePeriod = this.pageRefreshDebouncePeriod;
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.linkPrefetchObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.linkPrefetchObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.preloader.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        const action = options.action || getVisitAction(frameElement);
        frameElement.delegate.proposeVisitIfNavigatedWithAction(frameElement, action);
        frameElement.src = location2.toString();
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    refresh(url, requestId) {
      const isRecentRequest = requestId && this.recentRequests.has(requestId);
      const isCurrentUrl = url === document.baseURI;
      if (!isRecentRequest && !this.navigator.currentVisit && isCurrentUrl) {
        this.visit(url, { action: "replace", shouldCacheSnapshot: false });
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      console.warn(
        "Please replace `session.setProgressBarDelay(delay)` with `session.progressBarDelay = delay`. The function is deprecated and will be removed in a future version of Turbo.`"
      );
      this.progressBarDelay = delay;
    }
    set progressBarDelay(delay) {
      config.drive.progressBarDelay = delay;
    }
    get progressBarDelay() {
      return config.drive.progressBarDelay;
    }
    set drive(value) {
      config.drive.enabled = value;
    }
    get drive() {
      return config.drive.enabled;
    }
    set formMode(value) {
      config.forms.mode = value;
    }
    get formMode() {
      return config.forms.mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    get pageRefreshDebouncePeriod() {
      return this.#pageRefreshDebouncePeriod;
    }
    set pageRefreshDebouncePeriod(value) {
      this.refresh = debounce(this.debouncedRefresh.bind(this), value);
      this.#pageRefreshDebouncePeriod = value;
    }
    // Preloader delegate
    shouldPreloadLink(element) {
      const isUnsafe = element.hasAttribute("data-turbo-method");
      const isStream = element.hasAttribute("data-turbo-stream");
      const frameTarget = element.getAttribute("data-turbo-frame");
      const frame = frameTarget == "_top" ? null : document.getElementById(frameTarget) || findClosestRecursively(element, "turbo-frame:not([disabled])");
      if (isUnsafe || isStream || frame instanceof FrameElement) {
        return false;
      } else {
        const location2 = new URL(element.href);
        return this.elementIsNavigatable(element) && locationIsVisitable(location2, this.snapshot.rootLocation);
      }
    }
    // History delegate
    historyPoppedToLocationWithRestorationIdentifierAndDirection(location2, restorationIdentifier, direction) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true,
          direction
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    // Scroll observer delegate
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    // Form click observer delegate
    willSubmitFormLinkToLocation(link2, location2) {
      return this.elementIsNavigatable(link2) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    // Link hover observer delegate
    canPrefetchRequestToLocation(link2, location2) {
      return this.elementIsNavigatable(link2) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.navigator.linkPrefetchingIsEnabledForLocation(location2);
    }
    // Link click observer delegate
    willFollowLinkToLocation(link2, location2, event) {
      return this.elementIsNavigatable(link2) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link2, location2, event);
    }
    followedLinkToLocation(link2, location2) {
      const action = this.getActionForLink(link2);
      const acceptsStreamResponse = link2.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    // Navigator delegate
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    // Visit delegate
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
        this.view.markVisitDirection(visit2.direction);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      this.view.unmarkVisitDirection();
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    // Form submit observer delegate
    willSubmitForm(form2, submitter2) {
      const action = getAction$1(form2, submitter2);
      return this.submissionIsNavigatable(form2, submitter2) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form2, submitter2) {
      this.navigator.submitForm(form2, submitter2);
    }
    // Page observer delegate
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    // Stream observer delegate
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    // Page view delegate
    viewWillCacheSnapshot() {
      if (!this.navigator.currentVisit?.silent) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const {
        defaultPrevented,
        detail: { render }
      } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview, renderMethod) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender(renderMethod);
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    // Frame element
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    // Application events
    applicationAllowsFollowingLinkToLocation(link2, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link2, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link2, location2, event) {
      return dispatch("turbo:click", {
        target: link2,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: { newBody, ...options },
        cancelable: true
      });
    }
    notifyApplicationAfterRender(renderMethod) {
      return dispatch("turbo:render", { detail: { renderMethod } });
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(
        new HashChangeEvent("hashchange", {
          oldURL: oldURL.toString(),
          newURL: newURL.toString()
        })
      );
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    // Helpers
    submissionIsNavigatable(form2, submitter2) {
      if (config.forms.mode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter2 ? this.elementIsNavigatable(submitter2) : true;
        if (config.forms.mode == "optin") {
          return submitterIsNavigatable && form2.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form2);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (config.drive.enabled || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    // Private
    getActionForLink(link2) {
      return getVisitAction(link2) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var session = new Session(recentRequests);
  var { cache, navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn(
      "Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
    );
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    console.warn(
      "Please replace `Turbo.setProgressBarDelay(delay)` with `Turbo.config.drive.progressBarDelay = delay`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
    );
    config.drive.progressBarDelay = delay;
  }
  function setConfirmMethod(confirmMethod) {
    console.warn(
      "Please replace `Turbo.setConfirmMethod(confirmMethod)` with `Turbo.config.forms.confirm = confirmMethod`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
    );
    config.forms.confirm = confirmMethod;
  }
  function setFormMode(mode) {
    console.warn(
      "Please replace `Turbo.setFormMode(mode)` with `Turbo.config.forms.mode = mode`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
    );
    config.forms.mode = mode;
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    fetch: fetchWithTurboHeaders,
    config,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode
  });
  var TurboFrameMissingError = class extends Error {
  };
  var FrameController = class {
    fetchResponseLoaded = (_fetchResponse) => Promise.resolve();
    #currentFetchRequest = null;
    #resolveVisitPromise = () => {
    };
    #connected = false;
    #hasBeenLoaded = false;
    #ignoredAttributes = /* @__PURE__ */ new Set();
    #shouldMorphFrame = false;
    action = null;
    constructor(element) {
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    // Frame delegate
    connect() {
      if (!this.#connected) {
        this.#connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.#loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.#connected) {
        this.#connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.#loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.#isIgnoringChangesTo("src")) return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.#hasBeenLoaded) {
        this.#loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { refresh, src } = this.element;
      this.#shouldMorphFrame = src && refresh === "morph";
      this.element.removeAttribute("complete");
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.#loadSourceURL();
      }
    }
    async #loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.#visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.#hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const document2 = parseHTMLDocument(html);
          const pageSnapshot = PageSnapshot.fromDocument(document2);
          if (pageSnapshot.isVisitable) {
            await this.#loadFrameResponse(fetchResponse, document2);
          } else {
            await this.#handleUnvisitableFrameResponse(fetchResponse);
          }
        }
      } finally {
        this.#shouldMorphFrame = false;
        this.fetchResponseLoaded = () => Promise.resolve();
      }
    }
    // Appearance observer delegate
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, getVisitAction(element));
      this.#loadSourceURL();
    }
    // Form link click observer delegate
    willSubmitFormLinkToLocation(link2) {
      return this.#shouldInterceptNavigation(link2);
    }
    submittedFormLinkToLocation(link2, _location, form2) {
      const frame = this.#findFrameElement(link2);
      if (frame) form2.setAttribute("data-turbo-frame", frame.id);
    }
    // Link interceptor delegate
    shouldInterceptLinkClick(element, _location, _event) {
      return this.#shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.#navigateFrame(element, location2);
    }
    // Form submit observer delegate
    willSubmitForm(element, submitter2) {
      return element.closest("turbo-frame") == this.element && this.#shouldInterceptNavigation(element, submitter2);
    }
    formSubmitted(element, submitter2) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter2);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    // Fetch request delegate
    prepareRequest(request2) {
      request2.headers["Turbo-Frame"] = this.id;
      if (this.currentNavigationElement?.hasAttribute("data-turbo-stream")) {
        request2.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.#resolveVisitPromise();
    }
    async requestSucceededWithResponse(request2, response2) {
      await this.loadResponse(response2);
      this.#resolveVisitPromise();
    }
    async requestFailedWithResponse(request2, response2) {
      await this.loadResponse(response2);
      this.#resolveVisitPromise();
    }
    requestErrored(request2, error) {
      console.error(error);
      this.#resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    // Form submission delegate
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.#findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response2) {
      const frame = this.#findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(formSubmission.submitter, formSubmission.formElement, frame));
      frame.delegate.loadResponse(response2);
      if (!formSubmission.isSafe) {
        session.clearCache();
      }
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
      session.clearCache();
    }
    formSubmissionErrored(formSubmission, error) {
      console.error(error);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.#findFrameElement(formElement));
    }
    // View delegate
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: { newFrame, ...options },
        cancelable: true
      });
      const {
        defaultPrevented,
        detail: { render }
      } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview, _renderMethod) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    // Frame renderer delegate
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    visitCachedSnapshot = ({ element }) => {
      const frame = element.querySelector("#" + this.element.id);
      if (frame && this.previousFrameElement) {
        frame.replaceChildren(...this.previousFrameElement.children);
      }
      delete this.previousFrameElement;
    };
    // Private
    async #loadFrameResponse(fetchResponse, document2) {
      const newFrameElement = await this.extractForeignFrameElement(document2.body);
      const rendererClass = this.#shouldMorphFrame ? MorphingFrameRenderer : FrameRenderer;
      if (newFrameElement) {
        const snapshot = new Snapshot(newFrameElement);
        const renderer = new rendererClass(this, this.view.snapshot, snapshot, false, false);
        if (this.view.renderPromise) await this.view.renderPromise;
        this.changeHistory();
        await this.view.render(renderer);
        this.complete = true;
        session.frameRendered(fetchResponse, this.element);
        session.frameLoaded(this.element);
        await this.fetchResponseLoaded(fetchResponse);
      } else if (this.#willHandleFrameMissingFromResponse(fetchResponse)) {
        this.#handleFrameMissingFromResponse(fetchResponse);
      }
    }
    async #visit(url) {
      const request2 = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      this.#currentFetchRequest?.cancel();
      this.#currentFetchRequest = request2;
      return new Promise((resolve) => {
        this.#resolveVisitPromise = () => {
          this.#resolveVisitPromise = () => {
          };
          this.#currentFetchRequest = null;
          resolve();
        };
        request2.perform();
      });
    }
    #navigateFrame(element, url, submitter2) {
      const frame = this.#findFrameElement(element, submitter2);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(submitter2, element, frame));
      this.#withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, action = null) {
      this.action = action;
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = async (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = await fetchResponse.responseHTML;
            const response2 = { statusCode, redirected, responseHTML };
            const options = {
              response: response2,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action) options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method2 = getHistoryMethodForAction(this.action);
        session.history.update(method2, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    async #handleUnvisitableFrameResponse(fetchResponse) {
      console.warn(
        `The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`
      );
      await this.#visitResponse(fetchResponse.response);
    }
    #willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response2 = fetchResponse.response;
      const visit2 = async (url, options) => {
        if (url instanceof Response) {
          this.#visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response: response2, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    #handleFrameMissingFromResponse(fetchResponse) {
      this.view.missing();
      this.#throwFrameMissingError(fetchResponse);
    }
    #throwFrameMissingError(fetchResponse) {
      const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
      throw new TurboFrameMissingError(message);
    }
    async #visitResponse(response2) {
      const wrapped = new FetchResponse(response2);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    #findFrameElement(element, submitter2) {
      const id = getAttribute("data-turbo-frame", submitter2, element) || this.element.getAttribute("target");
      return getFrameElementById(id) ?? this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error) {
        console.error(error);
        return new FrameElement();
      }
      return null;
    }
    #formActionIsVisitable(form2, submitter2) {
      const action = getAction$1(form2, submitter2);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    #shouldInterceptNavigation(element, submitter2) {
      const id = getAttribute("data-turbo-frame", submitter2, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.#formActionIsVisitable(element, submitter2)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter2 && !session.elementIsNavigatable(submitter2)) {
        return false;
      }
      return true;
    }
    // Computed properties
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.#ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL ?? null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.#resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      if (value) {
        this.element.setAttribute("complete", "");
      } else {
        this.element.removeAttribute("complete");
      }
    }
    get isActive() {
      return this.element.isActive && this.#connected;
    }
    get rootLocation() {
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = meta?.content ?? "/";
      return expandURL(root);
    }
    #isIgnoringChangesTo(attributeName) {
      return this.#ignoredAttributes.has(attributeName);
    }
    #ignoringChangesToAttribute(attributeName, callback) {
      this.#ignoredAttributes.add(attributeName);
      callback();
      this.#ignoredAttributes.delete(attributeName);
    }
    #withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => e.parentElement?.insertBefore(this.templateContent, e.nextSibling));
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => e.parentElement?.insertBefore(this.templateContent, e));
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      const method2 = this.getAttribute("method");
      this.targetElements.forEach((targetElement) => {
        if (method2 === "morph") {
          morphElements(targetElement, this.templateContent);
        } else {
          targetElement.replaceWith(this.templateContent);
        }
      });
    },
    update() {
      const method2 = this.getAttribute("method");
      this.targetElements.forEach((targetElement) => {
        if (method2 === "morph") {
          morphChildren(targetElement, this.templateContent);
        } else {
          targetElement.innerHTML = "";
          targetElement.append(this.templateContent);
        }
      });
    },
    refresh() {
      session.refresh(this.baseURI, this.requestId);
    }
  };
  var StreamElement = class _StreamElement extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error) {
        console.error(error);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      return this.renderPromise ??= (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextRepaint();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch {
      }
    }
    /**
     * Removes duplicate children (by ID)
     */
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    /**
     * Gets the list of duplicate children (i.e. those with the same ID)
     */
    get duplicateChildren() {
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.getAttribute("id"));
      const newChildrenIds = [...this.templateContent?.children || []].filter((c) => !!c.getAttribute("id")).map((c) => c.getAttribute("id"));
      return existingChildren.filter((c) => newChildrenIds.includes(c.getAttribute("id")));
    }
    /**
     * Gets the action function to be performed.
     */
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.#raise("unknown action");
      }
      this.#raise("action attribute is missing");
    }
    /**
     * Gets the target elements which the template will be rendered to.
     */
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.#raise("target or targets attribute is missing");
      }
    }
    /**
     * Gets the contents of the main `<template>`.
     */
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    /**
     * Gets the main `<template>` used for rendering
     */
    get templateElement() {
      if (this.firstElementChild === null) {
        const template2 = this.ownerDocument.createElement("template");
        this.appendChild(template2);
        return template2;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.#raise("first child element must be a <template> element");
    }
    /**
     * Gets the current action.
     */
    get action() {
      return this.getAttribute("action");
    }
    /**
     * Gets the current target (an element ID) to which the result will
     * be rendered.
     */
    get target() {
      return this.getAttribute("target");
    }
    /**
     * Gets the current "targets" selector (a CSS selector)
     */
    get targets() {
      return this.getAttribute("targets");
    }
    /**
     * Reads the request-id attribute
     */
    get requestId() {
      return this.getAttribute("request-id");
    }
    #raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      return (this.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: _StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      const element = this.ownerDocument?.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      const elements = this.ownerDocument?.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    streamSource = null;
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        this.streamSource.close();
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element) return;
    if (element.hasAttribute("data-turbo-suppress-warning")) return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(
          unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `,
          element.outerHTML
        );
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = { ...Turbo, StreamActions };
  start();

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer4 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer4();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object") return obj;
    if (obj instanceof Date || obj instanceof RegExp) return obj;
    if (Array.isArray(obj)) return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m2, x) {
        return "_" + x.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    static observedAttributes = ["channel", "signed-stream-name"];
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, {
        received: this.dispatchMessageEvent.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription) this.subscription.unsubscribe();
      this.subscriptionDisconnected();
    }
    attributeChangedCallback() {
      if (this.subscription) {
        this.disconnectedCallback();
        this.connectedCallback();
      }
    }
    dispatchMessageEvent(data2) {
      const event = new MessageEvent("message", { data: data2 });
      return this.dispatchEvent(event);
    }
    subscriptionConnected() {
      this.setAttribute("connected", "");
    }
    subscriptionDisconnected() {
      this.removeAttribute("connected");
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form2, detail: { fetchOptions } } = event;
      form2.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter: submitter2 } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method2 = determineFetchMethod(submitter2, body, form2);
        if (!/get/i.test(method2)) {
          if (/post/i.test(method2)) {
            body.delete("_method");
          } else {
            body.set("_method", method2);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter2, body, form2) {
    const formMethod = determineFormMethod(submitter2);
    const overrideMethod = body.get("_method");
    const method2 = form2.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method2;
    }
  }
  function determineFormMethod(submitter2) {
    if (submitter2 instanceof HTMLButtonElement || submitter2 instanceof HTMLInputElement) {
      if (submitter2.name === "_method") {
        return submitter2.value;
      } else if (submitter2.hasAttribute("formmethod")) {
        return submitter2.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  window.Turbo = turbo_es2017_esm_exports;
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // ../../node_modules/@rails/actioncable/app/assets/javascripts/actioncable.esm.js
  var adapters = {
    logger: typeof console !== "undefined" ? console : void 0,
    WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
  };
  var logger = {
    log(...messages) {
      if (this.enabled) {
        messages.push(Date.now());
        adapters.logger.log("[ActionCable]", ...messages);
      }
    }
  };
  var now2 = () => (/* @__PURE__ */ new Date()).getTime();
  var secondsSince2 = (time) => (now2() - time) / 1e3;
  var ConnectionMonitor2 = class {
    constructor(connection) {
      this.visibilityDidChange = this.visibilityDidChange.bind(this);
      this.connection = connection;
      this.reconnectAttempts = 0;
    }
    start() {
      if (!this.isRunning()) {
        this.startedAt = now2();
        delete this.stoppedAt;
        this.startPolling();
        addEventListener("visibilitychange", this.visibilityDidChange);
        logger.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
      }
    }
    stop() {
      if (this.isRunning()) {
        this.stoppedAt = now2();
        this.stopPolling();
        removeEventListener("visibilitychange", this.visibilityDidChange);
        logger.log("ConnectionMonitor stopped");
      }
    }
    isRunning() {
      return this.startedAt && !this.stoppedAt;
    }
    recordMessage() {
      this.pingedAt = now2();
    }
    recordConnect() {
      this.reconnectAttempts = 0;
      delete this.disconnectedAt;
      logger.log("ConnectionMonitor recorded connect");
    }
    recordDisconnect() {
      this.disconnectedAt = now2();
      logger.log("ConnectionMonitor recorded disconnect");
    }
    startPolling() {
      this.stopPolling();
      this.poll();
    }
    stopPolling() {
      clearTimeout(this.pollTimeout);
    }
    poll() {
      this.pollTimeout = setTimeout(() => {
        this.reconnectIfStale();
        this.poll();
      }, this.getPollInterval());
    }
    getPollInterval() {
      const { staleThreshold, reconnectionBackoffRate } = this.constructor;
      const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
      const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
      const jitter = jitterMax * Math.random();
      return staleThreshold * 1e3 * backoff * (1 + jitter);
    }
    reconnectIfStale() {
      if (this.connectionIsStale()) {
        logger.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince2(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
        this.reconnectAttempts++;
        if (this.disconnectedRecently()) {
          logger.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince2(this.disconnectedAt)} s`);
        } else {
          logger.log("ConnectionMonitor reopening");
          this.connection.reopen();
        }
      }
    }
    get refreshedAt() {
      return this.pingedAt ? this.pingedAt : this.startedAt;
    }
    connectionIsStale() {
      return secondsSince2(this.refreshedAt) > this.constructor.staleThreshold;
    }
    disconnectedRecently() {
      return this.disconnectedAt && secondsSince2(this.disconnectedAt) < this.constructor.staleThreshold;
    }
    visibilityDidChange() {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          if (this.connectionIsStale() || !this.connection.isOpen()) {
            logger.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
            this.connection.reopen();
          }
        }, 200);
      }
    }
  };
  ConnectionMonitor2.staleThreshold = 6;
  ConnectionMonitor2.reconnectionBackoffRate = 0.15;
  var INTERNAL = {
    message_types: {
      welcome: "welcome",
      disconnect: "disconnect",
      ping: "ping",
      confirmation: "confirm_subscription",
      rejection: "reject_subscription"
    },
    disconnect_reasons: {
      unauthorized: "unauthorized",
      invalid_request: "invalid_request",
      server_restart: "server_restart",
      remote: "remote"
    },
    default_mount_path: "/cable",
    protocols: ["actioncable-v1-json", "actioncable-unsupported"]
  };
  var { message_types: message_types2, protocols: protocols2 } = INTERNAL;
  var supportedProtocols2 = protocols2.slice(0, protocols2.length - 1);
  var indexOf2 = [].indexOf;
  var Connection2 = class {
    constructor(consumer3) {
      this.open = this.open.bind(this);
      this.consumer = consumer3;
      this.subscriptions = this.consumer.subscriptions;
      this.monitor = new ConnectionMonitor2(this);
      this.disconnected = true;
    }
    send(data2) {
      if (this.isOpen()) {
        this.webSocket.send(JSON.stringify(data2));
        return true;
      } else {
        return false;
      }
    }
    open() {
      if (this.isActive()) {
        logger.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
        return false;
      } else {
        const socketProtocols = [...protocols2, ...this.consumer.subprotocols || []];
        logger.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
        if (this.webSocket) {
          this.uninstallEventHandlers();
        }
        this.webSocket = new adapters.WebSocket(this.consumer.url, socketProtocols);
        this.installEventHandlers();
        this.monitor.start();
        return true;
      }
    }
    close({ allowReconnect } = {
      allowReconnect: true
    }) {
      if (!allowReconnect) {
        this.monitor.stop();
      }
      if (this.isOpen()) {
        return this.webSocket.close();
      }
    }
    reopen() {
      logger.log(`Reopening WebSocket, current state is ${this.getState()}`);
      if (this.isActive()) {
        try {
          return this.close();
        } catch (error) {
          logger.log("Failed to reopen WebSocket", error);
        } finally {
          logger.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
          setTimeout(this.open, this.constructor.reopenDelay);
        }
      } else {
        return this.open();
      }
    }
    getProtocol() {
      if (this.webSocket) {
        return this.webSocket.protocol;
      }
    }
    isOpen() {
      return this.isState("open");
    }
    isActive() {
      return this.isState("open", "connecting");
    }
    triedToReconnect() {
      return this.monitor.reconnectAttempts > 0;
    }
    isProtocolSupported() {
      return indexOf2.call(supportedProtocols2, this.getProtocol()) >= 0;
    }
    isState(...states) {
      return indexOf2.call(states, this.getState()) >= 0;
    }
    getState() {
      if (this.webSocket) {
        for (let state in adapters.WebSocket) {
          if (adapters.WebSocket[state] === this.webSocket.readyState) {
            return state.toLowerCase();
          }
        }
      }
      return null;
    }
    installEventHandlers() {
      for (let eventName in this.events) {
        const handler = this.events[eventName].bind(this);
        this.webSocket[`on${eventName}`] = handler;
      }
    }
    uninstallEventHandlers() {
      for (let eventName in this.events) {
        this.webSocket[`on${eventName}`] = function() {
        };
      }
    }
  };
  Connection2.reopenDelay = 500;
  Connection2.prototype.events = {
    message(event) {
      if (!this.isProtocolSupported()) {
        return;
      }
      const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
      this.monitor.recordMessage();
      switch (type) {
        case message_types2.welcome:
          if (this.triedToReconnect()) {
            this.reconnectAttempted = true;
          }
          this.monitor.recordConnect();
          return this.subscriptions.reload();
        case message_types2.disconnect:
          logger.log(`Disconnecting. Reason: ${reason}`);
          return this.close({
            allowReconnect: reconnect
          });
        case message_types2.ping:
          return null;
        case message_types2.confirmation:
          this.subscriptions.confirmSubscription(identifier);
          if (this.reconnectAttempted) {
            this.reconnectAttempted = false;
            return this.subscriptions.notify(identifier, "connected", {
              reconnected: true
            });
          } else {
            return this.subscriptions.notify(identifier, "connected", {
              reconnected: false
            });
          }
        case message_types2.rejection:
          return this.subscriptions.reject(identifier);
        default:
          return this.subscriptions.notify(identifier, "received", message);
      }
    },
    open() {
      logger.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
      this.disconnected = false;
      if (!this.isProtocolSupported()) {
        logger.log("Protocol is unsupported. Stopping monitor and disconnecting.");
        return this.close({
          allowReconnect: false
        });
      }
    },
    close(event) {
      logger.log("WebSocket onclose event");
      if (this.disconnected) {
        return;
      }
      this.disconnected = true;
      this.monitor.recordDisconnect();
      return this.subscriptions.notifyAll("disconnected", {
        willAttemptReconnect: this.monitor.isRunning()
      });
    },
    error() {
      logger.log("WebSocket onerror event");
    }
  };
  var extend2 = function(object, properties) {
    if (properties != null) {
      for (let key in properties) {
        const value = properties[key];
        object[key] = value;
      }
    }
    return object;
  };
  var Subscription2 = class {
    constructor(consumer3, params = {}, mixin) {
      this.consumer = consumer3;
      this.identifier = JSON.stringify(params);
      extend2(this, mixin);
    }
    perform(action, data2 = {}) {
      data2.action = action;
      return this.send(data2);
    }
    send(data2) {
      return this.consumer.send({
        command: "message",
        identifier: this.identifier,
        data: JSON.stringify(data2)
      });
    }
    unsubscribe() {
      return this.consumer.subscriptions.remove(this);
    }
  };
  var SubscriptionGuarantor2 = class {
    constructor(subscriptions) {
      this.subscriptions = subscriptions;
      this.pendingSubscriptions = [];
    }
    guarantee(subscription) {
      if (this.pendingSubscriptions.indexOf(subscription) == -1) {
        logger.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
        this.pendingSubscriptions.push(subscription);
      } else {
        logger.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
      }
      this.startGuaranteeing();
    }
    forget(subscription) {
      logger.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
      this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
    }
    startGuaranteeing() {
      this.stopGuaranteeing();
      this.retrySubscribing();
    }
    stopGuaranteeing() {
      clearTimeout(this.retryTimeout);
    }
    retrySubscribing() {
      this.retryTimeout = setTimeout(() => {
        if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
          this.pendingSubscriptions.map((subscription) => {
            logger.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
            this.subscriptions.subscribe(subscription);
          });
        }
      }, 500);
    }
  };
  var Subscriptions2 = class {
    constructor(consumer3) {
      this.consumer = consumer3;
      this.guarantor = new SubscriptionGuarantor2(this);
      this.subscriptions = [];
    }
    create(channelName, mixin) {
      const channel = channelName;
      const params = typeof channel === "object" ? channel : {
        channel
      };
      const subscription = new Subscription2(this.consumer, params, mixin);
      return this.add(subscription);
    }
    add(subscription) {
      this.subscriptions.push(subscription);
      this.consumer.ensureActiveConnection();
      this.notify(subscription, "initialized");
      this.subscribe(subscription);
      return subscription;
    }
    remove(subscription) {
      this.forget(subscription);
      if (!this.findAll(subscription.identifier).length) {
        this.sendCommand(subscription, "unsubscribe");
      }
      return subscription;
    }
    reject(identifier) {
      return this.findAll(identifier).map((subscription) => {
        this.forget(subscription);
        this.notify(subscription, "rejected");
        return subscription;
      });
    }
    forget(subscription) {
      this.guarantor.forget(subscription);
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
      return subscription;
    }
    findAll(identifier) {
      return this.subscriptions.filter((s) => s.identifier === identifier);
    }
    reload() {
      return this.subscriptions.map((subscription) => this.subscribe(subscription));
    }
    notifyAll(callbackName, ...args) {
      return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
    }
    notify(subscription, callbackName, ...args) {
      let subscriptions;
      if (typeof subscription === "string") {
        subscriptions = this.findAll(subscription);
      } else {
        subscriptions = [subscription];
      }
      return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
    }
    subscribe(subscription) {
      if (this.sendCommand(subscription, "subscribe")) {
        this.guarantor.guarantee(subscription);
      }
    }
    confirmSubscription(identifier) {
      logger.log(`Subscription confirmed ${identifier}`);
      this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
    }
    sendCommand(subscription, command) {
      const { identifier } = subscription;
      return this.consumer.send({
        command,
        identifier
      });
    }
  };
  var Consumer2 = class {
    constructor(url) {
      this._url = url;
      this.subscriptions = new Subscriptions2(this);
      this.connection = new Connection2(this);
      this.subprotocols = [];
    }
    get url() {
      return createWebSocketURL2(this._url);
    }
    send(data2) {
      return this.connection.send(data2);
    }
    connect() {
      return this.connection.open();
    }
    disconnect() {
      return this.connection.close({
        allowReconnect: false
      });
    }
    ensureActiveConnection() {
      if (!this.connection.isActive()) {
        return this.connection.open();
      }
    }
    addSubProtocol(subprotocol) {
      this.subprotocols = [...this.subprotocols, subprotocol];
    }
  };
  function createWebSocketURL2(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  function createConsumer3(url = getConfig2("url") || INTERNAL.default_mount_path) {
    return new Consumer2(url);
  }
  function getConfig2(name2) {
    const element = document.head.querySelector(`meta[name='action-cable-${name2}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }

  // channels/consumer.js
  var consumer_default = createConsumer3();

  // ../../node_modules/cable_ready/node_modules/morphdom/dist/morphdom-esm.js
  var DOCUMENT_FRAGMENT_NODE = 11;
  function morphAttrs(fromNode, toNode) {
    var toNodeAttrs = toNode.attributes;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
      attr = toNodeAttrs[i];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      attrValue = attr.value;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        if (fromValue !== attrValue) {
          if (attr.prefix === "xmlns") {
            attrName = attr.name;
          }
          fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
        }
      } else {
        fromValue = fromNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          fromNode.setAttribute(attrName, attrValue);
        }
      }
    }
    var fromNodeAttrs = fromNode.attributes;
    for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
      attr = fromNodeAttrs[d];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          fromNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!toNode.hasAttribute(attrName)) {
          fromNode.removeAttribute(attrName);
        }
      }
    }
  }
  var range;
  var NS_XHTML = "http://www.w3.org/1999/xhtml";
  var doc = typeof document === "undefined" ? void 0 : document;
  var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
  var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
  function createFragmentFromTemplate(str) {
    var template2 = doc.createElement("template");
    template2.innerHTML = str;
    return template2.content.childNodes[0];
  }
  function createFragmentFromRange(str) {
    if (!range) {
      range = doc.createRange();
      range.selectNode(doc.body);
    }
    var fragment = range.createContextualFragment(str);
    return fragment.childNodes[0];
  }
  function createFragmentFromWrap(str) {
    var fragment = doc.createElement("body");
    fragment.innerHTML = str;
    return fragment.childNodes[0];
  }
  function toElement(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT) {
      return createFragmentFromTemplate(str);
    } else if (HAS_RANGE_SUPPORT) {
      return createFragmentFromRange(str);
    }
    return createFragmentFromWrap(str);
  }
  function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;
    if (fromNodeName === toNodeName) {
      return true;
    }
    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
      return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
      return toNodeName === fromNodeName.toUpperCase();
    } else {
      return false;
    }
  }
  function createElementNS(name2, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name2) : doc.createElementNS(namespaceURI, name2);
  }
  function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
      var nextChild = curChild.nextSibling;
      toEl.appendChild(curChild);
      curChild = nextChild;
    }
    return toEl;
  }
  function syncBooleanAttrProp(fromEl, toEl, name2) {
    if (fromEl[name2] !== toEl[name2]) {
      fromEl[name2] = toEl[name2];
      if (fromEl[name2]) {
        fromEl.setAttribute(name2, "");
      } else {
        fromEl.removeAttribute(name2);
      }
    }
  }
  var specialElHandlers = {
    OPTION: function(fromEl, toEl) {
      var parentNode = fromEl.parentNode;
      if (parentNode) {
        var parentName = parentNode.nodeName.toUpperCase();
        if (parentName === "OPTGROUP") {
          parentNode = parentNode.parentNode;
          parentName = parentNode && parentNode.nodeName.toUpperCase();
        }
        if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
          if (fromEl.hasAttribute("selected") && !toEl.selected) {
            fromEl.setAttribute("selected", "selected");
            fromEl.removeAttribute("selected");
          }
          parentNode.selectedIndex = -1;
        }
      }
      syncBooleanAttrProp(fromEl, toEl, "selected");
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
      syncBooleanAttrProp(fromEl, toEl, "checked");
      syncBooleanAttrProp(fromEl, toEl, "disabled");
      if (fromEl.value !== toEl.value) {
        fromEl.value = toEl.value;
      }
      if (!toEl.hasAttribute("value")) {
        fromEl.removeAttribute("value");
      }
    },
    TEXTAREA: function(fromEl, toEl) {
      var newValue = toEl.value;
      if (fromEl.value !== newValue) {
        fromEl.value = newValue;
      }
      var firstChild = fromEl.firstChild;
      if (firstChild) {
        var oldValue = firstChild.nodeValue;
        if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
          return;
        }
        firstChild.nodeValue = newValue;
      }
    },
    SELECT: function(fromEl, toEl) {
      if (!toEl.hasAttribute("multiple")) {
        var selectedIndex = -1;
        var i = 0;
        var curChild = fromEl.firstChild;
        var optgroup;
        var nodeName;
        while (curChild) {
          nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
          if (nodeName === "OPTGROUP") {
            optgroup = curChild;
            curChild = optgroup.firstChild;
          } else {
            if (nodeName === "OPTION") {
              if (curChild.hasAttribute("selected")) {
                selectedIndex = i;
                break;
              }
              i++;
            }
            curChild = curChild.nextSibling;
            if (!curChild && optgroup) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          }
        }
        fromEl.selectedIndex = selectedIndex;
      }
    }
  };
  var ELEMENT_NODE = 1;
  var DOCUMENT_FRAGMENT_NODE$1 = 11;
  var TEXT_NODE = 3;
  var COMMENT_NODE = 8;
  function noop() {
  }
  function defaultGetNodeKey(node) {
    if (node) {
      return node.getAttribute && node.getAttribute("id") || node.id;
    }
  }
  function morphdomFactory(morphAttrs3) {
    return function morphdom3(fromNode, toNode, options) {
      if (!options) {
        options = {};
      }
      if (typeof toNode === "string") {
        if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
          var toNodeHtml = toNode;
          toNode = doc.createElement("html");
          toNode.innerHTML = toNodeHtml;
        } else {
          toNode = toElement(toNode);
        }
      }
      var getNodeKey = options.getNodeKey || defaultGetNodeKey;
      var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
      var onNodeAdded = options.onNodeAdded || noop;
      var onBeforeElUpdated = options.onBeforeElUpdated || noop;
      var onElUpdated = options.onElUpdated || noop;
      var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
      var onNodeDiscarded = options.onNodeDiscarded || noop;
      var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
      var childrenOnly = options.childrenOnly === true;
      var fromNodesLookup = /* @__PURE__ */ Object.create(null);
      var keyedRemovalList = [];
      function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
      }
      function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (node.nodeType === ELEMENT_NODE) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = void 0;
            if (skipKeyedNodes && (key = getNodeKey(curChild))) {
              addKeyedRemoval(key);
            } else {
              onNodeDiscarded(curChild);
              if (curChild.firstChild) {
                walkDiscardedChildNodes(curChild, skipKeyedNodes);
              }
            }
            curChild = curChild.nextSibling;
          }
        }
      }
      function removeNode(node, parentNode, skipKeyedNodes) {
        if (onBeforeNodeDiscarded(node) === false) {
          return;
        }
        if (parentNode) {
          parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
      }
      function indexTree(node) {
        if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = getNodeKey(curChild);
            if (key) {
              fromNodesLookup[key] = curChild;
            }
            indexTree(curChild);
            curChild = curChild.nextSibling;
          }
        }
      }
      indexTree(fromNode);
      function handleNodeAdded(el) {
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
          var nextSibling = curChild.nextSibling;
          var key = getNodeKey(curChild);
          if (key) {
            var unmatchedFromEl = fromNodesLookup[key];
            if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
              curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
              morphEl(unmatchedFromEl, curChild);
            } else {
              handleNodeAdded(curChild);
            }
          } else {
            handleNodeAdded(curChild);
          }
          curChild = nextSibling;
        }
      }
      function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        while (curFromNodeChild) {
          var fromNextSibling = curFromNodeChild.nextSibling;
          if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
      }
      function morphEl(fromEl, toEl, childrenOnly2) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
          delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly2) {
          if (onBeforeElUpdated(fromEl, toEl) === false) {
            return;
          }
          morphAttrs3(fromEl, toEl);
          onElUpdated(fromEl);
          if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
            return;
          }
        }
        if (fromEl.nodeName !== "TEXTAREA") {
          morphChildren2(fromEl, toEl);
        } else {
          specialElHandlers.TEXTAREA(fromEl, toEl);
        }
      }
      function morphChildren2(fromEl, toEl) {
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling;
        var toNextSibling;
        var matchingFromEl;
        outer: while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
            fromEl.appendChild(matchingFromEl);
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
              }
              fromEl.appendChild(curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
        cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers[fromEl.nodeName];
        if (specialElHandler) {
          specialElHandler(fromEl, toEl);
        }
      }
      var morphedNode = fromNode;
      var morphedNodeType = morphedNode.nodeType;
      var toNodeType = toNode.nodeType;
      if (!childrenOnly) {
        if (morphedNodeType === ELEMENT_NODE) {
          if (toNodeType === ELEMENT_NODE) {
            if (!compareNodeNames(fromNode, toNode)) {
              onNodeDiscarded(fromNode);
              morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
            }
          } else {
            morphedNode = toNode;
          }
        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
          if (toNodeType === morphedNodeType) {
            if (morphedNode.nodeValue !== toNode.nodeValue) {
              morphedNode.nodeValue = toNode.nodeValue;
            }
            return morphedNode;
          } else {
            morphedNode = toNode;
          }
        }
      }
      if (morphedNode === toNode) {
        onNodeDiscarded(fromNode);
      } else {
        if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
          return;
        }
        morphEl(morphedNode, toNode, childrenOnly);
        if (keyedRemovalList) {
          for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
            var elToRemove = fromNodesLookup[keyedRemovalList[i]];
            if (elToRemove) {
              removeNode(elToRemove, elToRemove.parentNode, false);
            }
          }
        }
      }
      if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        if (morphedNode.actualize) {
          morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
        }
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
      }
      return morphedNode;
    };
  }
  var morphdom = morphdomFactory(morphAttrs);
  var morphdom_esm_default = morphdom;

  // ../../node_modules/cable_ready/dist/cable_ready.js
  var name = "cable_ready";
  var version = "5.0.6";
  var description = "CableReady helps you create great real-time user experiences by making it simple to trigger client-side DOM changes from server-side Ruby.";
  var keywords = ["ruby", "rails", "websockets", "actioncable", "cable", "ssr", "stimulus_reflex", "client-side", "dom"];
  var homepage = "https://cableready.stimulusreflex.com";
  var bugs = "https://github.com/stimulusreflex/cable_ready/issues";
  var repository = "https://github.com/stimulusreflex/cable_ready";
  var license = "MIT";
  var author = "Nathan Hopkins <natehop@gmail.com>";
  var contributors = ["Andrew Mason <andrewmcodes@protonmail.com>", "Julian Rubisch <julian@julianrubisch.at>", "Marco Roth <marco.roth@intergga.ch>", "Nathan Hopkins <natehop@gmail.com>"];
  var main = "./dist/cable_ready.js";
  var module = "./dist/cable_ready.js";
  var browser = "./dist/cable_ready.js";
  var unpkg = "./dist/cable_ready.umd.js";
  var umd = "./dist/cable_ready.umd.js";
  var files = ["dist/*", "javascript/*"];
  var scripts = {
    lint: "yarn run format --check",
    format: "yarn run prettier-standard ./javascript/**/*.js rollup.config.mjs",
    build: "yarn rollup -c",
    watch: "yarn rollup -wc",
    test: "web-test-runner javascript/test/**/*.test.js",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs && cp ./docs/_redirects ./docs/.vitepress/dist",
    "docs:preview": "vitepress preview docs"
  };
  var dependencies = {
    morphdom: "2.6.1"
  };
  var devDependencies = {
    "@open-wc/testing": "^4.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.3.0",
    "@rollup/plugin-terser": "^0.4.4",
    "@web/dev-server-esbuild": "^1.0.3",
    "@web/dev-server-rollup": "^0.6.4",
    "@web/test-runner": "^0.19.0",
    "prettier-standard": "^16.4.1",
    rollup: "^4.25.0",
    sinon: "^19.0.2",
    vite: "^5.4.10",
    vitepress: "^1.5.0",
    "vitepress-plugin-search": "^1.0.4-alpha.22"
  };
  var packageInfo = {
    name,
    version,
    description,
    keywords,
    homepage,
    bugs,
    repository,
    license,
    author,
    contributors,
    main,
    module,
    browser,
    import: "./dist/cable_ready.js",
    unpkg,
    umd,
    files,
    scripts,
    dependencies,
    devDependencies
  };
  var inputTags = {
    INPUT: true,
    TEXTAREA: true,
    SELECT: true
  };
  var mutableTags = {
    INPUT: true,
    TEXTAREA: true,
    OPTION: true
  };
  var textInputTypes = {
    "datetime-local": true,
    "select-multiple": true,
    "select-one": true,
    color: true,
    date: true,
    datetime: true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    textarea: true,
    time: true,
    url: true,
    week: true
  };
  var activeElement;
  var ActiveElement = {
    get element() {
      return activeElement;
    },
    set(element) {
      activeElement = element;
    }
  };
  var isTextInput = (element) => inputTags[element.tagName] && textInputTypes[element.type];
  var assignFocus = (selector) => {
    const element = selector && selector.nodeType === Node.ELEMENT_NODE ? selector : document.querySelector(selector);
    const focusElement = element || ActiveElement.element;
    if (focusElement && focusElement.focus) focusElement.focus();
  };
  var dispatch2 = (element, name2, detail = {}) => {
    const init = {
      bubbles: true,
      cancelable: true,
      detail
    };
    const event = new CustomEvent(name2, init);
    element.dispatchEvent(event);
    if (window.jQuery) window.jQuery(element).trigger(name2, detail);
  };
  var xpathToElement = (xpath) => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  var xpathToElementArray = (xpath, reverse = false) => {
    const snapshotList = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const snapshots = [];
    for (let i = 0; i < snapshotList.snapshotLength; i++) {
      snapshots.push(snapshotList.snapshotItem(i));
    }
    return reverse ? snapshots.reverse() : snapshots;
  };
  var getClassNames = (names) => Array.from(names).flat();
  var processElements = (operation, callback) => {
    Array.from(operation.selectAll ? operation.element : [operation.element]).forEach(callback);
  };
  var kebabize = createCompounder(function(result, word, index) {
    return result + (index ? "-" : "") + word.toLowerCase();
  });
  function createCompounder(callback) {
    return function(str) {
      return words(str).reduce(callback, "");
    };
  }
  var words = (str) => {
    str = str == null ? "" : str;
    return str.match(/([A-Z]{2,}|[0-9]+|[A-Z]?[a-z]+|[A-Z])/g) || [];
  };
  var operate = (operation, callback) => {
    if (!operation.cancel) {
      operation.delay ? setTimeout(callback, operation.delay) : callback();
      return true;
    }
    return false;
  };
  var before = (target, operation) => dispatch2(target, `cable-ready:before-${kebabize(operation.operation)}`, operation);
  var after = (target, operation) => dispatch2(target, `cable-ready:after-${kebabize(operation.operation)}`, operation);
  function debounce2(fn, delay = 250) {
    let timer;
    return (...args) => {
      const callback = () => fn.apply(this, args);
      if (timer) clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
  }
  function handleErrors(response2) {
    if (!response2.ok) throw Error(response2.statusText);
    return response2;
  }
  function safeScalar(val) {
    if (val !== void 0 && !["string", "number", "boolean"].includes(typeof val)) console.warn(`Operation expects a string, number or boolean, but got ${val} (${typeof val})`);
    return val != null ? val : "";
  }
  function safeString(str) {
    if (str !== void 0 && typeof str !== "string") console.warn(`Operation expects a string, but got ${str} (${typeof str})`);
    return str != null ? String(str) : "";
  }
  function safeArray(arr) {
    if (arr !== void 0 && !Array.isArray(arr)) console.warn(`Operation expects an array, but got ${arr} (${typeof arr})`);
    return arr != null ? Array.from(arr) : [];
  }
  function safeObject(obj) {
    if (obj !== void 0 && typeof obj !== "object") console.warn(`Operation expects an object, but got ${obj} (${typeof obj})`);
    return obj != null ? Object(obj) : {};
  }
  function safeStringOrArray(elem) {
    if (elem !== void 0 && !Array.isArray(elem) && typeof elem !== "string") console.warn(`Operation expects an Array or a String, but got ${elem} (${typeof elem})`);
    return elem == null ? "" : Array.isArray(elem) ? Array.from(elem) : String(elem);
  }
  function fragmentToString(fragment) {
    return new XMLSerializer().serializeToString(fragment);
  }
  async function graciouslyFetch(url, additionalHeaders) {
    try {
      const response2 = await fetch(url, {
        headers: {
          "X-REQUESTED-WITH": "XmlHttpRequest",
          ...additionalHeaders
        }
      });
      if (response2 == void 0) return;
      handleErrors(response2);
      return response2;
    } catch (e) {
      console.error(`Could not fetch ${url}`);
    }
  }
  var BoundedQueue = class {
    constructor(maxSize) {
      this.maxSize = maxSize;
      this.queue = [];
    }
    push(item) {
      if (this.isFull()) {
        this.shift();
      }
      this.queue.push(item);
    }
    shift() {
      return this.queue.shift();
    }
    isFull() {
      return this.queue.length === this.maxSize;
    }
  };
  var utils = Object.freeze({
    __proto__: null,
    BoundedQueue,
    after,
    assignFocus,
    before,
    debounce: debounce2,
    dispatch: dispatch2,
    fragmentToString,
    getClassNames,
    graciouslyFetch,
    handleErrors,
    isTextInput,
    kebabize,
    operate,
    processElements,
    safeArray,
    safeObject,
    safeScalar,
    safeString,
    safeStringOrArray,
    xpathToElement,
    xpathToElementArray
  });
  var shouldMorph = (operation) => (fromEl, toEl) => !shouldMorphCallbacks.map((callback) => typeof callback === "function" ? callback(operation, fromEl, toEl) : true).includes(false);
  var didMorph = (operation) => (el) => {
    didMorphCallbacks.forEach((callback) => {
      if (typeof callback === "function") callback(operation, el);
    });
  };
  var verifyNotMutable = (detail, fromEl, toEl) => {
    if (!mutableTags[fromEl.tagName] && fromEl.isEqualNode(toEl)) return false;
    return true;
  };
  var verifyNotContentEditable = (detail, fromEl, toEl) => {
    if (fromEl === ActiveElement.element && fromEl.isContentEditable) return false;
    return true;
  };
  var verifyNotPermanent = (detail, fromEl, toEl) => {
    const { permanentAttributeName } = detail;
    if (!permanentAttributeName) return true;
    const permanent = fromEl.closest(`[${permanentAttributeName}]`);
    if (!permanent && fromEl === ActiveElement.element && isTextInput(fromEl)) {
      const ignore = {
        value: true
      };
      Array.from(toEl.attributes).forEach((attribute) => {
        if (!ignore[attribute.name]) fromEl.setAttribute(attribute.name, attribute.value);
      });
      return false;
    }
    return !permanent;
  };
  var shouldMorphCallbacks = [verifyNotMutable, verifyNotPermanent, verifyNotContentEditable];
  var didMorphCallbacks = [];
  var morph_callbacks = Object.freeze({
    __proto__: null,
    didMorph,
    didMorphCallbacks,
    shouldMorph,
    shouldMorphCallbacks,
    verifyNotContentEditable,
    verifyNotMutable,
    verifyNotPermanent
  });
  var Operations = {
    // DOM Mutations
    append: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.insertAdjacentHTML("beforeend", safeScalar(html));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    graft: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { parent, focusSelector } = operation;
          const parentElement = document.querySelector(parent);
          if (parentElement) {
            parentElement.appendChild(element);
            assignFocus(focusSelector);
          }
        });
        after(element, operation);
      });
    },
    innerHtml: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.innerHTML = safeScalar(html);
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    insertAdjacentHtml: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, position, focusSelector } = operation;
          element.insertAdjacentHTML(position || "beforeend", safeScalar(html));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    insertAdjacentText: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { text, position, focusSelector } = operation;
          element.insertAdjacentText(position || "beforeend", safeScalar(text));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    outerHtml: (operation) => {
      processElements(operation, (element) => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.outerHTML = safeScalar(html);
          assignFocus(focusSelector);
        });
        after(parent ? parent.children[idx] : document.documentElement, operation);
      });
    },
    prepend: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.insertAdjacentHTML("afterbegin", safeScalar(html));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    remove: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { focusSelector } = operation;
          element.remove();
          assignFocus(focusSelector);
        });
        after(document, operation);
      });
    },
    replace: (operation) => {
      processElements(operation, (element) => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.outerHTML = safeScalar(html);
          assignFocus(focusSelector);
        });
        after(parent ? parent.children[idx] : document.documentElement, operation);
      });
    },
    textContent: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { text, focusSelector } = operation;
          element.textContent = safeScalar(text);
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    // Element Property Mutations
    addCssClass: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2 } = operation;
          element.classList.add(...getClassNames([safeStringOrArray(name2)]));
        });
        after(element, operation);
      });
    },
    removeAttribute: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2 } = operation;
          element.removeAttribute(safeString(name2));
        });
        after(element, operation);
      });
    },
    removeCssClass: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2 } = operation;
          element.classList.remove(...getClassNames([safeStringOrArray(name2)]));
          if (element.classList.length === 0) element.removeAttribute("class");
        });
        after(element, operation);
      });
    },
    setAttribute: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2, value } = operation;
          element.setAttribute(safeString(name2), safeScalar(value));
        });
        after(element, operation);
      });
    },
    setDatasetProperty: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2, value } = operation;
          element.dataset[safeString(name2)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setProperty: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2, value } = operation;
          if (name2 in element) element[safeString(name2)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setStyle: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2, value } = operation;
          element.style[safeString(name2)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setStyles: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { styles } = operation;
          for (let [name2, value] of Object.entries(styles)) element.style[safeString(name2)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setValue: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { value } = operation;
          element.value = safeScalar(value);
        });
        after(element, operation);
      });
    },
    // DOM Events and Meta-Operations
    dispatchEvent: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name2, detail } = operation;
          dispatch2(element, safeString(name2), safeObject(detail));
        });
        after(element, operation);
      });
    },
    setMeta: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { name: name2, content } = operation;
        let meta = document.head.querySelector(`meta[name='${name2}']`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = safeString(name2);
          document.head.appendChild(meta);
        }
        meta.content = safeScalar(content);
      });
      after(document, operation);
    },
    setTitle: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { title } = operation;
        document.title = safeScalar(title);
      });
      after(document, operation);
    },
    // Browser Manipulations
    clearStorage: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.clear();
      });
      after(document, operation);
    },
    go: (operation) => {
      before(window, operation);
      operate(operation, () => {
        const { delta } = operation;
        history.go(delta);
      });
      after(window, operation);
    },
    pushState: (operation) => {
      before(window, operation);
      operate(operation, () => {
        const { state, title, url } = operation;
        history.pushState(safeObject(state), safeString(title), safeString(url));
      });
      after(window, operation);
    },
    redirectTo: (operation) => {
      before(window, operation);
      operate(operation, () => {
        let { url, action, turbo } = operation;
        action = action || "advance";
        url = safeString(url);
        if (turbo === void 0) turbo = true;
        if (turbo) {
          if (window.Turbo) window.Turbo.visit(url, {
            action
          });
          if (window.Turbolinks) window.Turbolinks.visit(url, {
            action
          });
          if (!window.Turbo && !window.Turbolinks) window.location.href = url;
        } else {
          window.location.href = url;
        }
      });
      after(window, operation);
    },
    reload: (operation) => {
      before(window, operation);
      operate(operation, () => {
        window.location.reload();
      });
      after(window, operation);
    },
    removeStorageItem: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { key, type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.removeItem(safeString(key));
      });
      after(document, operation);
    },
    replaceState: (operation) => {
      before(window, operation);
      operate(operation, () => {
        const { state, title, url } = operation;
        history.replaceState(safeObject(state), safeString(title), safeString(url));
      });
      after(window, operation);
    },
    scrollIntoView: (operation) => {
      const { element } = operation;
      before(element, operation);
      operate(operation, () => {
        element.scrollIntoView(operation);
      });
      after(element, operation);
    },
    setCookie: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { cookie } = operation;
        document.cookie = safeScalar(cookie);
      });
      after(document, operation);
    },
    setFocus: (operation) => {
      const { element } = operation;
      before(element, operation);
      operate(operation, () => {
        assignFocus(element);
      });
      after(element, operation);
    },
    setStorageItem: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { key, value, type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.setItem(safeString(key), safeScalar(value));
      });
      after(document, operation);
    },
    // Notifications
    consoleLog: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { message, level } = operation;
        level && ["warn", "info", "error"].includes(level) ? console[level](message) : console.log(message);
      });
      after(document, operation);
    },
    consoleTable: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { data: data2, columns } = operation;
        console.table(data2, safeArray(columns));
      });
      after(document, operation);
    },
    notification: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { title, options } = operation;
        Notification.requestPermission().then((result) => {
          operation.permission = result;
          if (result === "granted") new Notification(safeString(title), safeObject(options));
        });
      });
      after(document, operation);
    },
    // Morph operations
    morph: (operation) => {
      processElements(operation, (element) => {
        const { html } = operation;
        const template2 = document.createElement("template");
        template2.innerHTML = String(safeScalar(html)).trim();
        operation.content = template2.content;
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, () => {
          const { childrenOnly, focusSelector } = operation;
          morphdom_esm_default(element, childrenOnly ? template2.content : template2.innerHTML, {
            childrenOnly: !!childrenOnly,
            onBeforeElUpdated: shouldMorph(operation),
            onElUpdated: didMorph(operation)
          });
          assignFocus(focusSelector);
        });
        after(parent ? parent.children[idx] : document.documentElement, operation);
      });
    }
  };
  var operations = Operations;
  var add = (newOperations) => {
    operations = {
      ...operations,
      ...newOperations
    };
  };
  var addOperations = (operations2) => {
    add(operations2);
  };
  var addOperation = (name2, operation) => {
    const operations2 = {};
    operations2[name2] = operation;
    add(operations2);
  };
  var OperationStore = {
    get all() {
      return operations;
    }
  };
  var missingElement = "warn";
  var MissingElement = {
    get behavior() {
      return missingElement;
    },
    set(value) {
      if (["warn", "ignore", "event", "exception"].includes(value)) missingElement = value;
      else console.warn("Invalid 'onMissingElement' option. Defaulting to 'warn'.");
    }
  };
  var perform = (operations2, options = {
    onMissingElement: MissingElement.behavior
  }) => {
    const batches = {};
    operations2.forEach((operation) => {
      if (!!operation.batch) batches[operation.batch] = batches[operation.batch] ? ++batches[operation.batch] : 1;
    });
    operations2.forEach((operation) => {
      const name2 = operation.operation;
      try {
        if (operation.selector) {
          if (operation.xpath) {
            operation.element = operation.selectAll ? xpathToElementArray(operation.selector) : xpathToElement(operation.selector);
          } else {
            operation.element = operation.selectAll ? document.querySelectorAll(operation.selector) : document.querySelector(operation.selector);
          }
        } else {
          operation.element = document;
        }
        if (operation.element || options.onMissingElement !== "ignore") {
          ActiveElement.set(document.activeElement);
          const cableReadyOperation = OperationStore.all[name2];
          if (cableReadyOperation) {
            cableReadyOperation(operation);
            if (!!operation.batch && --batches[operation.batch] === 0) dispatch2(document, "cable-ready:batch-complete", {
              batch: operation.batch
            });
          } else {
            console.error(`CableReady couldn't find the "${name2}" operation. Make sure you use the camelized form when calling an operation method.`);
          }
        }
      } catch (e) {
        if (operation.element) {
          console.error(`CableReady detected an error in ${name2 || "operation"}: ${e.message}. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`);
          console.error(e);
        } else {
          const warning = `CableReady ${name2 || ""} operation failed due to missing DOM element for selector: '${operation.selector}'`;
          switch (options.onMissingElement) {
            case "ignore":
              break;
            case "event":
              dispatch2(document, "cable-ready:missing-element", {
                warning,
                operation
              });
              break;
            case "exception":
              throw warning;
            default:
              console.warn(warning);
          }
        }
      }
    });
  };
  var performAsync = (operations2, options = {
    onMissingElement: MissingElement.behavior
  }) => new Promise((resolve, reject) => {
    try {
      resolve(perform(operations2, options));
    } catch (err) {
      reject(err);
    }
  });
  var SubscribingElement = class extends HTMLElement {
    static get tagName() {
      throw new Error("Implement the tagName() getter in the inheriting class");
    }
    static define() {
      if (!customElements.get(this.tagName)) {
        customElements.define(this.tagName, this);
      }
    }
    disconnectedCallback() {
      if (this.channel) this.channel.unsubscribe();
    }
    createSubscription(consumer3, channel, receivedCallback) {
      this.channel = consumer3.subscriptions.create({
        channel,
        identifier: this.identifier
      }, {
        received: receivedCallback
      });
    }
    get preview() {
      return document.documentElement.hasAttribute("data-turbolinks-preview") || document.documentElement.hasAttribute("data-turbo-preview");
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
  };
  var consumer2;
  var BACKOFF = [25, 50, 75, 100, 200, 250, 500, 800, 1e3, 2e3];
  var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var getConsumerWithRetry = async (retry = 0) => {
    if (consumer2) return consumer2;
    if (retry >= BACKOFF.length) {
      throw new Error("Couldn't obtain a Action Cable consumer within 5s");
    }
    await wait(BACKOFF[retry]);
    return await getConsumerWithRetry(retry + 1);
  };
  var CableConsumer = {
    setConsumer(value) {
      consumer2 = value;
    },
    get consumer() {
      return consumer2;
    },
    async getConsumer() {
      return await getConsumerWithRetry();
    }
  };
  var StreamFromElement = class extends SubscribingElement {
    static get tagName() {
      return "cable-ready-stream-from";
    }
    async connectedCallback() {
      if (this.preview) return;
      const consumer3 = await CableConsumer.getConsumer();
      if (consumer3) {
        this.createSubscription(consumer3, "CableReady::Stream", this.performOperations.bind(this));
      } else {
        console.error("The `cable_ready_stream_from` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
    }
    performOperations(data2) {
      if (data2.cableReady) perform(data2.operations, {
        onMissingElement: this.onMissingElement
      });
    }
    get onMissingElement() {
      const value = this.getAttribute("missing") || MissingElement.behavior;
      if (["warn", "ignore", "event"].includes(value)) return value;
      else {
        console.warn("Invalid 'missing' attribute. Defaulting to 'warn'.");
        return "warn";
      }
    }
  };
  var debugging = false;
  var Debug = {
    get enabled() {
      return debugging;
    },
    get disabled() {
      return !debugging;
    },
    get value() {
      return debugging;
    },
    set(value) {
      debugging = !!value;
    },
    set debug(value) {
      debugging = !!value;
    }
  };
  var request = (data2, blocks) => {
    if (Debug.disabled) return;
    const message = `\u2191 Updatable request affecting ${blocks.length} element(s): `;
    console.log(message, {
      elements: blocks.map((b) => b.element),
      identifiers: blocks.map((b) => b.element.getAttribute("identifier")),
      data: data2
    });
    return message;
  };
  var cancel = (timestamp, reason) => {
    if (Debug.disabled) return;
    const duration = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u274C Updatable request canceled after ${duration}ms: ${reason}`;
    console.log(message);
    return message;
  };
  var response = (timestamp, element, urls) => {
    if (Debug.disabled) return;
    const duration = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u2193 Updatable response: All URLs fetched in ${duration}ms`;
    console.log(message, {
      element,
      urls
    });
    return message;
  };
  var morphStart = (timestamp, element) => {
    if (Debug.disabled) return;
    const duration = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u21BB Updatable morph: starting after ${duration}ms`;
    console.log(message, {
      element
    });
    return message;
  };
  var morphEnd = (timestamp, element) => {
    if (Debug.disabled) return;
    const duration = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u21BA Updatable morph: completed after ${duration}ms`;
    console.log(message, {
      element
    });
    return message;
  };
  var Log = {
    request,
    cancel,
    response,
    morphStart,
    morphEnd
  };
  var AppearanceObserver2 = class {
    constructor(delegate2, element = null) {
      this.delegate = delegate2;
      this.element = element || delegate2;
      this.started = false;
      this.intersecting = false;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
        this.observeVisibility();
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
        this.unobserveVisibility();
      }
    }
    observeVisibility = () => {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    };
    unobserveVisibility = () => {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    };
    intersect = (entries2) => {
      entries2.forEach((entry) => {
        if (entry.target === this.element) {
          if (entry.isIntersecting && document.visibilityState === "visible") {
            this.intersecting = true;
            this.delegate.appearedInViewport();
          } else {
            this.intersecting = false;
            this.delegate.disappearedFromViewport();
          }
        }
      });
    };
    handleVisibilityChange = (event) => {
      if (document.visibilityState === "visible" && this.intersecting) {
        this.delegate.appearedInViewport();
      } else {
        this.delegate.disappearedFromViewport();
      }
    };
  };
  var template = `
<style>
  :host {
    display: block;
  }
</style>
<slot></slot>
`;
  var UpdatesForElement = class extends SubscribingElement {
    static get tagName() {
      return "cable-ready-updates-for";
    }
    constructor() {
      super();
      const shadowRoot = this.attachShadow({
        mode: "open"
      });
      shadowRoot.innerHTML = template;
      this.triggerElementLog = new BoundedQueue(10);
      this.targetElementLog = new BoundedQueue(10);
      this.appearanceObserver = new AppearanceObserver2(this);
      this.visible = false;
      this.didTransitionToVisible = false;
    }
    async connectedCallback() {
      if (this.preview) return;
      this.update = debounce2(this.update.bind(this), this.debounce);
      const consumer3 = await CableConsumer.getConsumer();
      if (consumer3) {
        this.createSubscription(consumer3, "CableReady::Stream", this.update);
      } else {
        console.error("The `cable_ready_updates_for` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
      if (this.observeAppearance) {
        this.appearanceObserver.start();
      }
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.observeAppearance) {
        this.appearanceObserver.stop();
      }
    }
    async update(data2) {
      this.lastUpdateTimestamp = /* @__PURE__ */ new Date();
      const blocks = Array.from(document.querySelectorAll(this.query), (element) => new Block(element)).filter((block) => block.shouldUpdate(data2));
      this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.request(data2, blocks)}`);
      if (blocks.length === 0) {
        this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.cancel(this.lastUpdateTimestamp, "All elements filtered out")}`);
        return;
      }
      if (blocks[0].element !== this && !this.didTransitionToVisible) {
        this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.cancel(this.lastUpdateTimestamp, "Update already requested")}`);
        return;
      }
      ActiveElement.set(document.activeElement);
      this.html = {};
      const uniqueUrls = [...new Set(blocks.map((block) => block.url))];
      await Promise.all(uniqueUrls.map(async (url) => {
        if (!this.html.hasOwnProperty(url)) {
          const response2 = await graciouslyFetch(url, {
            "X-Cable-Ready": "update"
          });
          this.html[url] = await response2.text();
        }
      }));
      this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.response(this.lastUpdateTimestamp, this, uniqueUrls)}`);
      this.index = {};
      blocks.forEach((block) => {
        this.index.hasOwnProperty(block.url) ? this.index[block.url]++ : this.index[block.url] = 0;
        block.process(data2, this.html, this.index, this.lastUpdateTimestamp);
      });
    }
    appearedInViewport() {
      if (!this.visible) {
        this.didTransitionToVisible = true;
        this.update({});
      }
      this.visible = true;
    }
    disappearedFromViewport() {
      this.visible = false;
    }
    get query() {
      return `${this.tagName}[identifier="${this.identifier}"]`;
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
    get debounce() {
      return this.hasAttribute("debounce") ? parseInt(this.getAttribute("debounce")) : 20;
    }
    get observeAppearance() {
      return this.hasAttribute("observe-appearance");
    }
  };
  var Block = class {
    constructor(element) {
      this.element = element;
    }
    async process(data2, html, fragmentsIndex, startTimestamp) {
      const blockIndex = fragmentsIndex[this.url];
      const template2 = document.createElement("template");
      this.element.setAttribute("updating", "updating");
      template2.innerHTML = String(html[this.url]).trim();
      await this.resolveTurboFrames(template2.content);
      const fragments = template2.content.querySelectorAll(this.query);
      if (fragments.length <= blockIndex) {
        console.warn(`Update aborted due to insufficient number of elements. The offending url is ${this.url}, the offending element is:`, this.element);
        return;
      }
      const operation = {
        element: this.element,
        html: fragments[blockIndex],
        permanentAttributeName: "data-ignore-updates"
      };
      dispatch2(this.element, "cable-ready:before-update", operation);
      this.element.targetElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.morphStart(startTimestamp, this.element)}`);
      morphdom_esm_default(this.element, fragments[blockIndex], {
        childrenOnly: true,
        onBeforeElUpdated: shouldMorph(operation),
        onElUpdated: (_) => {
          this.element.removeAttribute("updating");
          this.element.didTransitionToVisible = false;
          dispatch2(this.element, "cable-ready:after-update", operation);
          assignFocus(operation.focusSelector);
        }
      });
      this.element.targetElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.morphEnd(startTimestamp, this.element)}`);
    }
    async resolveTurboFrames(documentFragment) {
      const reloadingTurboFrames = [...documentFragment.querySelectorAll('turbo-frame[src]:not([loading="lazy"])')];
      return Promise.all(reloadingTurboFrames.map((frame) => new Promise(async (resolve) => {
        const frameResponse = await graciouslyFetch(frame.getAttribute("src"), {
          "Turbo-Frame": frame.id,
          "X-Cable-Ready": "update"
        });
        const frameTemplate = document.createElement("template");
        frameTemplate.innerHTML = await frameResponse.text();
        await this.resolveTurboFrames(frameTemplate.content);
        const selector = `turbo-frame#${frame.id}`;
        const frameContent = frameTemplate.content.querySelector(selector);
        const content = frameContent ? frameContent.innerHTML.trim() : "";
        documentFragment.querySelector(selector).innerHTML = content;
        resolve();
      })));
    }
    shouldUpdate(data2) {
      return !this.ignoresInnerUpdates && this.hasChangesSelectedForUpdate(data2) && (!this.observeAppearance || this.visible);
    }
    hasChangesSelectedForUpdate(data2) {
      const only = this.element.getAttribute("only");
      return !(only && data2.changed && !only.split(" ").some((attribute) => data2.changed.includes(attribute)));
    }
    get ignoresInnerUpdates() {
      return this.element.hasAttribute("ignore-inner-updates") && this.element.hasAttribute("performing-inner-update");
    }
    get url() {
      return this.element.hasAttribute("url") ? this.element.getAttribute("url") : location.href;
    }
    get identifier() {
      return this.element.identifier;
    }
    get query() {
      return this.element.query;
    }
    get visible() {
      return this.element.visible;
    }
    get observeAppearance() {
      return this.element.observeAppearance;
    }
  };
  var registerInnerUpdates = () => {
    document.addEventListener("stimulus-reflex:before", (event) => {
      recursiveMarkUpdatesForElements(event.detail.element);
    });
    document.addEventListener("stimulus-reflex:after", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.detail.element);
      });
    });
    document.addEventListener("turbo:submit-start", (event) => {
      recursiveMarkUpdatesForElements(event.target);
    });
    document.addEventListener("turbo:submit-end", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.target);
      });
    });
    document.addEventListener("turbo-boost:command:start", (event) => {
      recursiveMarkUpdatesForElements(event.target);
    });
    document.addEventListener("turbo-boost:command:finish", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.target);
      });
    });
    document.addEventListener("turbo-boost:command:error", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.target);
      });
    });
  };
  var recursiveMarkUpdatesForElements = (leaf) => {
    const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("cable-ready-updates-for");
    if (closestUpdatesFor) {
      closestUpdatesFor.setAttribute("performing-inner-update", "");
      recursiveMarkUpdatesForElements(closestUpdatesFor);
    }
  };
  var recursiveUnmarkUpdatesForElements = (leaf) => {
    const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("cable-ready-updates-for");
    if (closestUpdatesFor) {
      closestUpdatesFor.removeAttribute("performing-inner-update");
      recursiveUnmarkUpdatesForElements(closestUpdatesFor);
    }
  };
  var defineElements = () => {
    registerInnerUpdates();
    StreamFromElement.define();
    UpdatesForElement.define();
  };
  var initialize = (initializeOptions = {}) => {
    const { consumer: consumer3, onMissingElement, debug } = initializeOptions;
    Debug.set(!!debug);
    if (consumer3) {
      CableConsumer.setConsumer(consumer3);
    } else {
      console.error("CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`.");
    }
    if (onMissingElement) {
      MissingElement.set(onMissingElement);
    }
    defineElements();
  };
  var global = {
    perform,
    performAsync,
    shouldMorphCallbacks,
    didMorphCallbacks,
    initialize,
    addOperation,
    addOperations,
    version: packageInfo.version,
    cable: CableConsumer,
    get DOMOperations() {
      console.warn("DEPRECATED: Please use `CableReady.operations` instead of `CableReady.DOMOperations`");
      return OperationStore.all;
    },
    get operations() {
      return OperationStore.all;
    },
    get consumer() {
      return CableConsumer.consumer;
    }
  };
  window.CableReady = global;

  // ../../node_modules/morphdom/dist/morphdom-esm.js
  var DOCUMENT_FRAGMENT_NODE2 = 11;
  function morphAttrs2(fromNode, toNode) {
    var toNodeAttrs = toNode.attributes;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE2 || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE2) {
      return;
    }
    for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
      attr = toNodeAttrs[i];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      attrValue = attr.value;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        if (fromValue !== attrValue) {
          if (attr.prefix === "xmlns") {
            attrName = attr.name;
          }
          fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
        }
      } else {
        fromValue = fromNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          fromNode.setAttribute(attrName, attrValue);
        }
      }
    }
    var fromNodeAttrs = fromNode.attributes;
    for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
      attr = fromNodeAttrs[d];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          fromNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!toNode.hasAttribute(attrName)) {
          fromNode.removeAttribute(attrName);
        }
      }
    }
  }
  var range2;
  var NS_XHTML2 = "http://www.w3.org/1999/xhtml";
  var doc2 = typeof document === "undefined" ? void 0 : document;
  var HAS_TEMPLATE_SUPPORT2 = !!doc2 && "content" in doc2.createElement("template");
  var HAS_RANGE_SUPPORT2 = !!doc2 && doc2.createRange && "createContextualFragment" in doc2.createRange();
  function createFragmentFromTemplate2(str) {
    var template2 = doc2.createElement("template");
    template2.innerHTML = str;
    return template2.content.childNodes[0];
  }
  function createFragmentFromRange2(str) {
    if (!range2) {
      range2 = doc2.createRange();
      range2.selectNode(doc2.body);
    }
    var fragment = range2.createContextualFragment(str);
    return fragment.childNodes[0];
  }
  function createFragmentFromWrap2(str) {
    var fragment = doc2.createElement("body");
    fragment.innerHTML = str;
    return fragment.childNodes[0];
  }
  function toElement2(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT2) {
      return createFragmentFromTemplate2(str);
    } else if (HAS_RANGE_SUPPORT2) {
      return createFragmentFromRange2(str);
    }
    return createFragmentFromWrap2(str);
  }
  function compareNodeNames2(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;
    if (fromNodeName === toNodeName) {
      return true;
    }
    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
      return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
      return toNodeName === fromNodeName.toUpperCase();
    } else {
      return false;
    }
  }
  function createElementNS2(name2, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML2 ? doc2.createElement(name2) : doc2.createElementNS(namespaceURI, name2);
  }
  function moveChildren2(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
      var nextChild = curChild.nextSibling;
      toEl.appendChild(curChild);
      curChild = nextChild;
    }
    return toEl;
  }
  function syncBooleanAttrProp2(fromEl, toEl, name2) {
    if (fromEl[name2] !== toEl[name2]) {
      fromEl[name2] = toEl[name2];
      if (fromEl[name2]) {
        fromEl.setAttribute(name2, "");
      } else {
        fromEl.removeAttribute(name2);
      }
    }
  }
  var specialElHandlers2 = {
    OPTION: function(fromEl, toEl) {
      var parentNode = fromEl.parentNode;
      if (parentNode) {
        var parentName = parentNode.nodeName.toUpperCase();
        if (parentName === "OPTGROUP") {
          parentNode = parentNode.parentNode;
          parentName = parentNode && parentNode.nodeName.toUpperCase();
        }
        if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
          if (fromEl.hasAttribute("selected") && !toEl.selected) {
            fromEl.setAttribute("selected", "selected");
            fromEl.removeAttribute("selected");
          }
          parentNode.selectedIndex = -1;
        }
      }
      syncBooleanAttrProp2(fromEl, toEl, "selected");
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
      syncBooleanAttrProp2(fromEl, toEl, "checked");
      syncBooleanAttrProp2(fromEl, toEl, "disabled");
      if (fromEl.value !== toEl.value) {
        fromEl.value = toEl.value;
      }
      if (!toEl.hasAttribute("value")) {
        fromEl.removeAttribute("value");
      }
    },
    TEXTAREA: function(fromEl, toEl) {
      var newValue = toEl.value;
      if (fromEl.value !== newValue) {
        fromEl.value = newValue;
      }
      var firstChild = fromEl.firstChild;
      if (firstChild) {
        var oldValue = firstChild.nodeValue;
        if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
          return;
        }
        firstChild.nodeValue = newValue;
      }
    },
    SELECT: function(fromEl, toEl) {
      if (!toEl.hasAttribute("multiple")) {
        var selectedIndex = -1;
        var i = 0;
        var curChild = fromEl.firstChild;
        var optgroup;
        var nodeName;
        while (curChild) {
          nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
          if (nodeName === "OPTGROUP") {
            optgroup = curChild;
            curChild = optgroup.firstChild;
          } else {
            if (nodeName === "OPTION") {
              if (curChild.hasAttribute("selected")) {
                selectedIndex = i;
                break;
              }
              i++;
            }
            curChild = curChild.nextSibling;
            if (!curChild && optgroup) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          }
        }
        fromEl.selectedIndex = selectedIndex;
      }
    }
  };
  var ELEMENT_NODE2 = 1;
  var DOCUMENT_FRAGMENT_NODE$12 = 11;
  var TEXT_NODE2 = 3;
  var COMMENT_NODE2 = 8;
  function noop2() {
  }
  function defaultGetNodeKey2(node) {
    if (node) {
      return node.getAttribute && node.getAttribute("id") || node.id;
    }
  }
  function morphdomFactory2(morphAttrs3) {
    return function morphdom3(fromNode, toNode, options) {
      if (!options) {
        options = {};
      }
      if (typeof toNode === "string") {
        if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
          var toNodeHtml = toNode;
          toNode = doc2.createElement("html");
          toNode.innerHTML = toNodeHtml;
        } else {
          toNode = toElement2(toNode);
        }
      } else if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE$12) {
        toNode = toNode.firstElementChild;
      }
      var getNodeKey = options.getNodeKey || defaultGetNodeKey2;
      var onBeforeNodeAdded = options.onBeforeNodeAdded || noop2;
      var onNodeAdded = options.onNodeAdded || noop2;
      var onBeforeElUpdated = options.onBeforeElUpdated || noop2;
      var onElUpdated = options.onElUpdated || noop2;
      var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop2;
      var onNodeDiscarded = options.onNodeDiscarded || noop2;
      var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop2;
      var skipFromChildren = options.skipFromChildren || noop2;
      var addChild = options.addChild || function(parent, child) {
        return parent.appendChild(child);
      };
      var childrenOnly = options.childrenOnly === true;
      var fromNodesLookup = /* @__PURE__ */ Object.create(null);
      var keyedRemovalList = [];
      function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
      }
      function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (node.nodeType === ELEMENT_NODE2) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = void 0;
            if (skipKeyedNodes && (key = getNodeKey(curChild))) {
              addKeyedRemoval(key);
            } else {
              onNodeDiscarded(curChild);
              if (curChild.firstChild) {
                walkDiscardedChildNodes(curChild, skipKeyedNodes);
              }
            }
            curChild = curChild.nextSibling;
          }
        }
      }
      function removeNode(node, parentNode, skipKeyedNodes) {
        if (onBeforeNodeDiscarded(node) === false) {
          return;
        }
        if (parentNode) {
          parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
      }
      function indexTree(node) {
        if (node.nodeType === ELEMENT_NODE2 || node.nodeType === DOCUMENT_FRAGMENT_NODE$12) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = getNodeKey(curChild);
            if (key) {
              fromNodesLookup[key] = curChild;
            }
            indexTree(curChild);
            curChild = curChild.nextSibling;
          }
        }
      }
      indexTree(fromNode);
      function handleNodeAdded(el) {
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
          var nextSibling = curChild.nextSibling;
          var key = getNodeKey(curChild);
          if (key) {
            var unmatchedFromEl = fromNodesLookup[key];
            if (unmatchedFromEl && compareNodeNames2(curChild, unmatchedFromEl)) {
              curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
              morphEl(unmatchedFromEl, curChild);
            } else {
              handleNodeAdded(curChild);
            }
          } else {
            handleNodeAdded(curChild);
          }
          curChild = nextSibling;
        }
      }
      function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        while (curFromNodeChild) {
          var fromNextSibling = curFromNodeChild.nextSibling;
          if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
      }
      function morphEl(fromEl, toEl, childrenOnly2) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
          delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly2) {
          var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
          if (beforeUpdateResult === false) {
            return;
          } else if (beforeUpdateResult instanceof HTMLElement) {
            fromEl = beforeUpdateResult;
            indexTree(fromEl);
          }
          morphAttrs3(fromEl, toEl);
          onElUpdated(fromEl);
          if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
            return;
          }
        }
        if (fromEl.nodeName !== "TEXTAREA") {
          morphChildren2(fromEl, toEl);
        } else {
          specialElHandlers2.TEXTAREA(fromEl, toEl);
        }
      }
      function morphChildren2(fromEl, toEl) {
        var skipFrom = skipFromChildren(fromEl, toEl);
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling;
        var toNextSibling;
        var matchingFromEl;
        outer: while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (!skipFrom && curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE2) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                        curFromNodeKey = getNodeKey(curFromNodeChild);
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames2(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE2 || curFromNodeType == COMMENT_NODE2) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames2(matchingFromEl, curToNodeChild)) {
            if (!skipFrom) {
              addChild(fromEl, matchingFromEl);
            }
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc2);
              }
              addChild(fromEl, curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
        cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers2[fromEl.nodeName];
        if (specialElHandler) {
          specialElHandler(fromEl, toEl);
        }
      }
      var morphedNode = fromNode;
      var morphedNodeType = morphedNode.nodeType;
      var toNodeType = toNode.nodeType;
      if (!childrenOnly) {
        if (morphedNodeType === ELEMENT_NODE2) {
          if (toNodeType === ELEMENT_NODE2) {
            if (!compareNodeNames2(fromNode, toNode)) {
              onNodeDiscarded(fromNode);
              morphedNode = moveChildren2(fromNode, createElementNS2(toNode.nodeName, toNode.namespaceURI));
            }
          } else {
            morphedNode = toNode;
          }
        } else if (morphedNodeType === TEXT_NODE2 || morphedNodeType === COMMENT_NODE2) {
          if (toNodeType === morphedNodeType) {
            if (morphedNode.nodeValue !== toNode.nodeValue) {
              morphedNode.nodeValue = toNode.nodeValue;
            }
            return morphedNode;
          } else {
            morphedNode = toNode;
          }
        }
      }
      if (morphedNode === toNode) {
        onNodeDiscarded(fromNode);
      } else {
        if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
          return;
        }
        morphEl(morphedNode, toNode, childrenOnly);
        if (keyedRemovalList) {
          for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
            var elToRemove = fromNodesLookup[keyedRemovalList[i]];
            if (elToRemove) {
              removeNode(elToRemove, elToRemove.parentNode, false);
            }
          }
        }
      }
      if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        if (morphedNode.actualize) {
          morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc2);
        }
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
      }
      return morphedNode;
    };
  }
  var morphdom2 = morphdomFactory2(morphAttrs2);
  var morphdom_esm_default2 = morphdom2;

  // ../../node_modules/mrujs/dist/index.module.js
  var submittersByForm2 = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget2(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element != null ? element.closest("input, button") : null;
    if (candidate != null && candidate.type === "submit") {
      return candidate;
    }
    return null;
  }
  function clickCaptured2(event) {
    const submitter2 = findSubmitterFromClickTarget2(event.target);
    if ((submitter2 === null || submitter2 === void 0 ? void 0 : submitter2.form) != null) {
      submittersByForm2.set(submitter2.form, submitter2);
    }
  }
  (function() {
    let prototype = Event.prototype;
    const isSafari = navigator.vendor.includes("Apple Computer");
    if ("SubmitEvent" in window) {
      if (!isSafari)
        return;
      prototype = window.SubmitEvent.prototype;
    }
    if ("submitter" in prototype)
      return;
    addEventListener("click", clickCaptured2, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type === "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm2.get(this.target);
        }
        return void 0;
      }
    });
  })();
  var _a;
  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    } else if (Array.from != null) {
      return Array.from(value);
    } else {
      return [].slice.call(value);
    }
  }
  var m = (_a = Element.prototype.matches) !== null && _a !== void 0 ? _a : Element.prototype.webkitMatchesSelector;
  function matches$1(element, selector) {
    if (!(element instanceof Element)) {
      return false;
    }
    if (typeof selector === "string") {
      return m.call(element, selector);
    }
    return m.call(element, selector.selector) && !m.call(element, selector.exclude);
  }
  var form = "form";
  var link = "a";
  if (window.Turbo != null) {
    form = 'form[data-turbo="false"]';
    link = 'a[data-turbo="false"]';
  }
  var data = "data-";
  var remote = `${data}remote`;
  var method = `${data}method`;
  var confirm$2 = `${data}confirm`;
  var disable = `${data}disable`;
  var disableWith = `${disable}-with`;
  var BASE_SELECTORS = {
    remoteSelector: `a[${remote}="true"], a[${method}], form[${remote}="true"]`,
    // Link elements bound by rails-ujs
    linkClickSelector: `a[${confirm$2}], ${link}[${method}], ${link}[${remote}]:not([disabled]), ${link}[${disableWith}], ${link}[${disable}]`,
    // Button elements bound by rails-ujs
    buttonClickSelector: {
      selector: `button[${remote}]:not([form]), button[${confirm$2}]:not([form]), button[${disableWith}]:not([form]), button[${disable}]:not([form])`,
      exclude: "form button"
    },
    // Select elements bound by rails-ujs
    inputChangeSelector: `select[${remote}], input[${remote}], textarea[${remote}]`,
    // Form elements bound by rails-ujs
    formSubmitSelector: `${form}`,
    // Form input elements bound by rails-ujs
    formInputClickSelector: "form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])",
    // Form input elements disabled during form submission
    formDisableSelector: `input[${disableWith}]:enabled, button[${disableWith}]:enabled, textarea[${disableWith}]:enabled, input[${disable}]:enabled, button[${disable}]:enabled, textarea[${disable}]:enabled`,
    // Form input elements re-enabled after form submission
    formEnableSelector: `input[${disableWith}]:disabled, button[${disableWith}]:disabled, textarea[${disableWith}]:disabled, input[${disable}]:disabled, button[${disable}]:disabled, textarea[${disable}]:disabled`,
    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: `a[${disableWith}], a[${disable}]`,
    // Button onClick disable selector with possible reenable after remote submission
    buttonDisableSelector: `button[data-remote][${disableWith}], button[data-remote][${disable}]`,
    fileInputSelector: "fileInputSelector: 'input[name][type=file]:not([disabled])'"
  };
  function addListeners(conditions, callbacks) {
    conditions.forEach((condition) => {
      const { selectors, event } = condition;
      const selectorString = selectors.map(selectorToString).join(", ");
      $$1(selectorString).forEach((el) => {
        selectors.forEach((selector) => {
          if (matches$1(el, selector)) {
            callbacks.forEach((callback) => el.addEventListener(event, callback));
          }
        });
      });
    });
  }
  function removeListeners(conditions, callbacks) {
    conditions.forEach((condition) => {
      const { selectors, event } = condition;
      const selectorString = selectors.map(selectorToString).join(", ");
      $$1(selectorString).forEach((el) => {
        selectors.forEach((selector) => {
          if (matches$1(el, selector)) {
            callbacks.forEach((callback) => el.removeEventListener(event, callback));
          }
        });
      });
    });
  }
  function attachObserverCallback(conditions, nodeList, callbacks) {
    conditions.forEach((condition) => {
      condition.selectors.forEach((selector) => {
        nodeList.forEach((node) => {
          if (matches$1(node, selector)) {
            callbacks.forEach((cb) => node.addEventListener(condition.event, cb));
          }
          if (node instanceof Element) {
            node.querySelectorAll(selectorToString(selector)).forEach((el) => {
              callbacks.forEach((cb) => el.addEventListener(condition.event, cb));
            });
          }
        });
      });
    });
  }
  function formElements$1(form2, selector) {
    if (matches$1(form2, "form")) {
      return Array.from(form2.elements).filter((el) => matches$1(el, selector));
    }
    return toArray(form2.querySelectorAll(selectorToString(selector)));
  }
  function $$1(selector) {
    return toArray(document.querySelectorAll(selector));
  }
  function selectorToString(selector) {
    let str;
    if (typeof selector === "string") {
      str = selector;
    } else {
      str = selector.selector;
    }
    return str;
  }
  var EVENT_DEFAULTS = {
    bubbles: true,
    cancelable: true
  };
  function dispatch3(name2, options = {}) {
    const event = new CustomEvent(name2, { ...EVENT_DEFAULTS, ...options });
    this.dispatchEvent(event);
    return event;
  }
  function fire$1(element, name2, options = {}) {
    const event = dispatch3.call(element, name2, options);
    return !event.defaultPrevented;
  }
  function stopEverything$1(event) {
    if (event.target != null)
      fire$1(event.target, "ujs:everythingStopped");
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  var prefix = "ajax";
  var AJAX_EVENTS = {
    /**
     * Before the ajax event gets sent.
     * You can view what data will be sent via: `event.detail.formData`
     */
    ajaxBefore: `${prefix}:before`,
    /**
     * Just prior to sending the fetch request
     */
    ajaxBeforeSend: `${prefix}:beforeSend`,
    /**
     * When the fetch request is sent. You can view whats being sent via:
     * `event.detail.formData`
     */
    ajaxSend: `${prefix}:send`,
    /**
     * When a response error occurs. IE: 400, 404, 422, 500, etc (any status code not between 200 - 299)
     * The response error can be viewed via: `event.detail.response`
     */
    ajaxResponseError: `${prefix}:response:error`,
    /**
     * Catches errors with requests such as Network errors.
     */
    ajaxRequestError: `${prefix}:request:error`,
    /**
     * When a >= 200 and <= 299 response is returned
     * You can view the full response via: `event.detail.response`
     */
    ajaxSuccess: `${prefix}:success`,
    /**
     * A unified event to catch both Response and Request errors.
     * You can view the error via: `event.detail.error`
     * This will also generate an error in your console.log
     */
    ajaxError: `${prefix}:error`,
    /**
     * After any fetch request, regardless of outcome
     * Does not have any accessible data besides the event itself
     */
    ajaxComplete: `${prefix}:complete`,
    ajaxStopped: `${prefix}:stopped`,
    ajaxBeforeNavigation: `${prefix}:beforeNavigation`
    // NOT CURRENTLY IMPLEMENTED
    // /**
    //  * when there are blank required fields in a form, submits anyway if stopped
    //  */
    // ajaxAbortedRequired: `${prefix}:aborted:required`,
    // /**
    //  * if there are non-blank input:file fields in a form, aborts if stopped
    //  */
    // ajaxAbortedFile: `${prefix}:aborted:file`
  };
  function delegate$1(element, selector, eventType, handler) {
    element.addEventListener(eventType, (event) => {
      let target = event.target;
      while (!(!(target instanceof Element) || matches$1(target, selector))) {
        target = target.parentNode;
      }
      if (target instanceof Element && handler.call(target, event) === false) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }
  function findSubmitter(event) {
    var _a2;
    if (event.submitter instanceof HTMLElement) {
      return event.submitter;
    }
    return (_a2 = event.detail) === null || _a2 === void 0 ? void 0 : _a2.submitter;
  }
  function expandUrl(locateable) {
    return new URL(locateable.toString(), document.baseURI);
  }
  function urlsAreEqual2(left, right) {
    return expandUrl(left).href === expandUrl(right).href;
  }
  function mergeHeaders(...sources) {
    const main2 = {};
    for (const source of sources) {
      for (const [header, value] of source) {
        main2[header] = value;
      }
    }
    return new Headers(main2);
  }
  function isGetRequest(method2) {
    return method2.toLowerCase() === "get";
  }
  function FetchResponse$1(response2) {
    let _text;
    let _json;
    const succeeded = response2.ok;
    const status = response2.status;
    const failed = !succeeded;
    const clientError = response2.status >= 400 && response2.status <= 499;
    const serverError = response2.status >= 500 && response2.status <= 599;
    const redirected = response2.redirected;
    const location2 = expandUrl(response2.url);
    const contentType = getHeader("content-type");
    const isHtml = Boolean(contentType === null || contentType === void 0 ? void 0 : contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/));
    const isJson = Boolean(contentType === null || contentType === void 0 ? void 0 : contentType.toLowerCase().match(/(^application\/json|\.json)/));
    async function text() {
      if (_text != null)
        return _text;
      _text = await response2.clone().text();
      return _text;
    }
    async function html() {
      if (isHtml)
        return await text();
      return await Promise.reject(response2);
    }
    async function json() {
      if (isJson) {
        if (_json != null)
          return _json;
        _json = JSON.parse(await text());
        return _json;
      }
      return await Promise.reject(response2);
    }
    function getHeader(name2) {
      return response2.headers.get(name2);
    }
    return {
      succeeded,
      failed,
      redirected,
      clientError,
      serverError,
      location: location2,
      contentType,
      getHeader,
      isHtml,
      isJson,
      text,
      html,
      json,
      response: response2,
      status
    };
  }
  function buildFormElementFormData(element, submitter2) {
    const formData = new FormData(element);
    let name2;
    let value;
    if (submitter2 != null) {
      name2 = submitter2.getAttribute("name");
      value = submitter2.getAttribute("value");
    }
    if (name2 != null && value != null && formData.get(name2) !== value) {
      formData.append(name2, value);
    }
    return formData;
  }
  var FormEncTypes = {
    urlEncoded: "application/x-www-form-urlencoded",
    multipart: "multipart/form-data",
    plain: "text/plain"
  };
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEncTypes.multipart:
        return FormEncTypes.multipart;
      case FormEncTypes.plain:
        return FormEncTypes.plain;
      default:
        return FormEncTypes.urlEncoded;
    }
  }
  function formDataToStrings(formData) {
    return [...formData].reduce((entries2, [name2, value]) => {
      return entries2.concat(typeof value === "string" ? [[name2, value]] : []);
    }, []);
  }
  function urlEncodeFormData(formData) {
    return new URLSearchParams(formDataToStrings(formData));
  }
  var BASE_ACCEPT_HEADERS = {
    "*": "*/*",
    any: "*/*",
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  };
  function findResponseTypeHeader(responseType) {
    var _a2, _b, _c;
    const mimeTypes = (_b = (_a2 = window.mrujs) === null || _a2 === void 0 ? void 0 : _a2.mimeTypes) !== null && _b !== void 0 ? _b : BASE_ACCEPT_HEADERS;
    const acceptHeaders = {
      ...mimeTypes
    };
    if (responseType == null) {
      return (_c = acceptHeaders === null || acceptHeaders === void 0 ? void 0 : acceptHeaders.any) !== null && _c !== void 0 ? _c : "*/*";
    }
    responseType = responseType.trim();
    if (acceptHeaders != null && Object.keys(acceptHeaders).includes(responseType)) {
      responseType = acceptHeaders[responseType];
    }
    if (responseType.includes("*/*"))
      return responseType;
    return `${responseType}, */*; q=0.01`;
  }
  function isInsignificantClick(event) {
    return event.target != null && event.target.isContentEditable || event.defaultPrevented || event.button > 0 || // Only left clicks!
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  }
  function preventInsignificantClick$1(event) {
    var _a2, _b, _c, _d;
    const method2 = (((_b = (_a2 = event.target) === null || _a2 === void 0 ? void 0 : _a2.getAttribute) === null || _b === void 0 ? void 0 : _b.call(_a2, "data-method")) || ((_d = (_c = event.target) === null || _c === void 0 ? void 0 : _c.form) === null || _d === void 0 ? void 0 : _d.method) || "get").toLowerCase();
    if (method2 === "get") {
      return;
    }
    if (isInsignificantClick(event)) {
      stopEverything$1(event);
    }
  }
  function getCookieValue2(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie.trim() !== "" ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie != null) {
        const value = cookie.split("=").slice(1).join("=");
        return value.trim() !== "" ? decodeURIComponent(value) : void 0;
      }
    }
    return void 0;
  }
  function getMetaContent2(str) {
    var _a2;
    const elements = $$1(`meta[name="${str}"]`);
    const element = elements[elements.length - 1];
    return (_a2 = element === null || element === void 0 ? void 0 : element.content) !== null && _a2 !== void 0 ? _a2 : void 0;
  }
  function Csrf() {
    return {
      name: "Csrf",
      connect: connect$3,
      disconnect: disconnect$3,
      observerCallback
    };
  }
  function connect$3() {
    refreshCSRFTokens$1();
  }
  function disconnect$3() {
  }
  function observerCallback(nodeList) {
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      if (isCsrfToken(node)) {
        refreshCSRFTokens$1();
      }
    }
  }
  function refreshCSRFTokens$1() {
    const token = csrfToken$1();
    const param = csrfParam$1();
    if (token != null && param != null) {
      $$1(`form input[name="${param}"]`).forEach((input) => {
        const inputEl = input;
        inputEl.value = token;
      });
    }
  }
  function isCsrfToken(node) {
    if (node instanceof HTMLMetaElement) {
      return node.matches('meta[name="csrf-token]"');
    }
    return false;
  }
  function csrfToken$1() {
    var _a2;
    return (_a2 = getCookieValue2(csrfParam$1())) !== null && _a2 !== void 0 ? _a2 : getMetaContent2("csrf-token");
  }
  function csrfParam$1() {
    return getMetaContent2("csrf-param");
  }
  function CSRFProtection$1(request2) {
    const token = csrfToken$1();
    const str = "X-CSRF-TOKEN";
    if (token != null && request2.headers.get(str) == null)
      request2.headers.set("X-CSRF-TOKEN", token);
  }
  function FetchRequest$1(input, options = {}) {
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    let headers;
    let url;
    let method2 = "get";
    let request2;
    let _isGetRequest = false;
    method2 = getMethod$1(options);
    _isGetRequest = isGetRequest(method2);
    const body = getBody$2(options);
    if (input instanceof Request) {
      url = getUrl(input.url, _isGetRequest, body);
      request2 = createRequestFromRequest(input);
    } else {
      url = getUrl(input, _isGetRequest, body);
      request2 = createRequestFromLocateable();
    }
    if (!_isGetRequest)
      CSRFProtection$1(request2);
    headers = request2.headers;
    const params = url.searchParams;
    return {
      request: request2,
      method: method2,
      url,
      body,
      params,
      abortController,
      abortSignal,
      cancel: cancel2,
      headers,
      isGetRequest: _isGetRequest
    };
    function defaultHeaders() {
      const headers2 = new Headers({
        Accept: "*/*",
        "X-REQUESTED-WITH": "XmlHttpRequest"
      });
      return headers2;
    }
    function cancel2(event) {
      abortController.abort();
      if (event != null) {
        stopEverything$1(event);
        const { element } = event.detail;
        dispatch3.call(element, AJAX_EVENTS.ajaxStopped, {
          detail: { ...event.detail }
        });
      }
    }
    function createRequestFromRequest(input2) {
      headers = mergeHeaders(defaultHeaders(), input2.headers);
      const mergedOptions = { ...defaultRequestOptions(), ...input2 };
      if (_isGetRequest)
        delete mergedOptions.body;
      return new Request(url, mergedOptions);
    }
    function createRequestFromLocateable() {
      headers = mergeHeaders(defaultHeaders(), new Headers(options.headers));
      const mergedOptions = { ...defaultRequestOptions(), ...options };
      mergedOptions.headers = headers;
      if (_isGetRequest)
        delete mergedOptions.body;
      return new Request(url, mergedOptions);
    }
    function defaultRequestOptions() {
      const options2 = {
        method: method2,
        headers,
        credentials: "same-origin",
        redirect: "follow",
        signal: abortSignal
      };
      if (_isGetRequest) {
        return options2;
      }
      options2.body = body;
      return options2;
    }
  }
  function getUrl(url, getRequest, body) {
    const location2 = expandUrl(url);
    if (!getRequest)
      return location2;
    return mergeFormDataEntries(location2, entries(body));
  }
  function entries(body) {
    return body instanceof URLSearchParams ? Array.from(body.entries()) : [];
  }
  function getBody$2(input) {
    var _a2;
    return (_a2 = input.body) !== null && _a2 !== void 0 ? _a2 : new URLSearchParams();
  }
  function getMethod$1(input) {
    var _a2, _b;
    return (_b = (_a2 = input.method) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) !== null && _b !== void 0 ? _b : "get";
  }
  function mergeFormDataEntries(url, entries2) {
    const currentSearchParams = new URLSearchParams(url.search);
    for (const [name2, value] of entries2) {
      if (value instanceof File)
        continue;
      if (name2 === "authenticity_token")
        continue;
      if (currentSearchParams.has(name2)) {
        currentSearchParams.delete(name2);
        url.searchParams.set(name2, value);
      } else {
        url.searchParams.append(name2, value);
      }
    }
    return url;
  }
  function FormSubmission2(element, submitter2) {
    const url = expandUrl(getAction2(element, submitter2));
    const options = getOptions(element, submitter2);
    const fetchRequest = FetchRequest$1(url, options);
    const request2 = fetchRequest.request;
    return {
      fetchRequest,
      request: request2,
      element,
      submitter: submitter2
    };
  }
  function getOptions(element, submitter2) {
    const method2 = getMethod2(element, submitter2);
    const headers = getHeaders$1(element);
    const options = {
      method: method2,
      headers
    };
    options.body = getBody$1(element, method2, submitter2);
    return options;
  }
  function getHeaders$1(element) {
    let responseType;
    if (element != null) {
      responseType = element.dataset.type;
    }
    const acceptHeader = findResponseTypeHeader(responseType);
    const headers = new Headers({ Accept: acceptHeader });
    headers.set("Accept", acceptHeader);
    return headers;
  }
  function getFormData$1(element, submitter2) {
    return buildFormElementFormData(element, submitter2);
  }
  function getMethod2(element, submitter2) {
    var _a2, _b;
    const method2 = (_b = (_a2 = submitter2 === null || submitter2 === void 0 ? void 0 : submitter2.getAttribute("formmethod")) !== null && _a2 !== void 0 ? _a2 : element.getAttribute("method")) !== null && _b !== void 0 ? _b : "get";
    return method2.toLowerCase();
  }
  function getAction2(element, submitter2) {
    var _a2, _b;
    const action = (_b = (_a2 = submitter2 === null || submitter2 === void 0 ? void 0 : submitter2.getAttribute("formaction")) !== null && _a2 !== void 0 ? _a2 : element.getAttribute("action")) !== null && _b !== void 0 ? _b : "";
    return action;
  }
  function getBody$1(element, method2, submitter2) {
    const formData = getFormData$1(element, submitter2);
    if (getEncType(element, submitter2) === FormEncTypes.urlEncoded || isGetRequest(method2)) {
      return urlEncodeFormData(formData);
    } else {
      return formData;
    }
  }
  function getEncType(element, submitter2) {
    var _a2, _b;
    const elementEncType = element.getAttribute("enctype");
    const encType = (_b = (_a2 = submitter2 === null || submitter2 === void 0 ? void 0 : submitter2.getAttribute("formenctype")) !== null && _a2 !== void 0 ? _a2 : elementEncType) !== null && _b !== void 0 ? _b : FormEncTypes.urlEncoded;
    const encString = formEnctypeFromString(encType);
    return encString;
  }
  function ElementDisabler() {
    const callbacks = [disableElement$1];
    let queries = [];
    function initialize2() {
      queries = getQueries$5();
    }
    function connect2() {
      addListeners(queries, callbacks);
    }
    function disconnect2() {
      removeListeners(queries, callbacks);
    }
    function observerCallback2(nodeList) {
      attachObserverCallback(queries, nodeList, callbacks);
    }
    return {
      name: "ElementDisabler",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2,
      queries
    };
  }
  function getQueries$5() {
    const { formSubmitSelector: formSubmitSelector2, linkClickSelector: linkClickSelector2, buttonClickSelector: buttonClickSelector2, inputChangeSelector: inputChangeSelector2 } = window.mrujs;
    return [
      { event: "click", selectors: [buttonClickSelector2, linkClickSelector2] },
      { event: "ajax:send", selectors: [formSubmitSelector2] },
      { event: "turbo:submit-start", selectors: ["form"] },
      { event: "change", selectors: [inputChangeSelector2] }
    ];
  }
  function disableElement$1(event) {
    let element;
    if (event instanceof Event) {
      element = event.target;
    } else {
      element = event;
    }
    if (element == null)
      return;
    const { linkDisableSelector: linkDisableSelector2, buttonDisableSelector: buttonDisableSelector2, formDisableSelector: formDisableSelector2, formSubmitSelector: formSubmitSelector2 } = window.mrujs;
    if (matches$1(element, linkDisableSelector2)) {
      disableLinkElement(element);
    } else if (matches$1(element, buttonDisableSelector2) || matches$1(element, formDisableSelector2)) {
      disableFormElement(element);
    } else if (matches$1(element, formSubmitSelector2)) {
      disableFormElements(element);
    }
  }
  function disableFormElements(form2) {
    formElements$1(form2, window.mrujs.formDisableSelector).forEach((el) => disableFormElement(el));
  }
  function disableFormElement(element) {
    if (element.dataset.ujsDisabled != null)
      return;
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      if (matches$1(element, "button")) {
        element.dataset.ujsEnableWith = element.innerHTML;
        element.innerHTML = replacement;
      } else {
        element.dataset.ujsEnableWith = element.value;
        element.value = replacement;
      }
    }
    element.dataset.ujsDisabled = "true";
    setTimeout(() => {
      element.disabled = true;
    });
  }
  function disableLinkElement(element) {
    if (element.dataset.ujsDisabled != null)
      return;
    const replacement = element.dataset.disableWith;
    if (replacement != null) {
      element.dataset.ujsEnableWith = element.innerHTML;
      element.innerHTML = replacement;
    }
    element.addEventListener("click", stopEverything$1);
    element.dataset.ujsDisabled = "true";
  }
  function FormSubmitDispatcher() {
    return {
      name: "FormSubmitDispatcher",
      connect: connect$2,
      disconnect: disconnect$2
    };
  }
  function connect$2() {
    attachListeners("addEventListener");
  }
  function disconnect$2() {
    attachListeners("removeEventListener");
  }
  function startFormSubmission(event) {
    if (event.defaultPrevented) {
      return;
    }
    const element = findTarget(event);
    const submitter2 = findSubmitter(event);
    if (element.dataset.remote !== "true")
      return;
    if (shouldNotSubmit(element))
      return;
    if (shouldNotSubmit(submitter2))
      return;
    if (submitter2 != null) {
      disableElement$1(submitter2);
    }
    event.preventDefault();
    const { fetchRequest, request: request2 } = FormSubmission2(element, submitter2);
    const detail = { element, fetchRequest, request: request2, submitter: submitter2 };
    dispatch3.call(element, AJAX_EVENTS.ajaxBefore, { detail });
  }
  function startFetchRequest(event) {
    const { element, fetchRequest, request: request2, submitter: submitter2 } = event.detail;
    if (event.defaultPrevented || shouldNotSubmit(element) || shouldNotSubmit(submitter2)) {
      dispatchStopped(event);
      return;
    }
    dispatch3.call(element, AJAX_EVENTS.ajaxBeforeSend, {
      detail: { element, fetchRequest, request: request2, submitter: submitter2 }
    });
  }
  function sendFetchRequest(event) {
    const { element, request: request2, submitter: submitter2 } = event.detail;
    if (event.defaultPrevented || shouldNotSubmit(element) || shouldNotSubmit(submitter2)) {
      dispatchStopped(event);
      return;
    }
    dispatch3.call(element, AJAX_EVENTS.ajaxSend, { detail: { ...event.detail } });
    window.fetch(request2).then((resp) => {
      const fetchResponse = FetchResponse$1(resp);
      const { response: response2 } = fetchResponse;
      dispatchResponse({ ...event.detail, fetchResponse, response: response2 });
    }).catch((error) => dispatchRequestError({ ...event.detail, error }));
  }
  function dispatchComplete(event) {
    if (event.defaultPrevented) {
      dispatchStopped(event);
      return;
    }
    dispatch3.call(findTarget(event), AJAX_EVENTS.ajaxComplete, {
      detail: { ...event.detail }
    });
  }
  function dispatchResponse({ element, fetchRequest, request: request2, fetchResponse, response: response2, submitter: submitter2 }) {
    const status = response2 === null || response2 === void 0 ? void 0 : response2.status;
    if ((fetchResponse === null || fetchResponse === void 0 ? void 0 : fetchResponse.succeeded) === true) {
      dispatch3.call(element, AJAX_EVENTS.ajaxSuccess, {
        detail: { element, fetchRequest, request: request2, fetchResponse, response: response2, submitter: submitter2, status }
      });
      return;
    }
    dispatch3.call(element, AJAX_EVENTS.ajaxResponseError, {
      detail: { element, fetchRequest, request: request2, fetchResponse, response: response2, submitter: submitter2, status }
    });
  }
  function dispatchRequestError({ element, fetchRequest, request: request2, error, submitter: submitter2 }) {
    dispatch3.call(element, AJAX_EVENTS.ajaxRequestError, {
      detail: { element, fetchRequest, request: request2, error, submitter: submitter2 }
    });
  }
  function dispatchError(event) {
    if (event.defaultPrevented) {
      dispatchStopped(event);
      return;
    }
    dispatch3.call(findTarget(event), AJAX_EVENTS.ajaxError, {
      detail: { ...event.detail }
    });
  }
  function dispatchStopped(event) {
    dispatch3.call(findTarget(event), AJAX_EVENTS.ajaxStopped, {
      detail: { ...event.detail }
    });
  }
  function attachListeners(fn) {
    document[fn]("submit", startFormSubmission);
    document[fn](AJAX_EVENTS.ajaxBefore, startFetchRequest);
    document[fn](AJAX_EVENTS.ajaxBeforeSend, sendFetchRequest);
    document[fn](AJAX_EVENTS.ajaxSuccess, dispatchComplete);
    document[fn](AJAX_EVENTS.ajaxRequestError, dispatchError);
    document[fn](AJAX_EVENTS.ajaxResponseError, dispatchError);
    document[fn](AJAX_EVENTS.ajaxError, dispatchComplete);
  }
  function findTarget(event) {
    return event.target;
  }
  function shouldNotSubmit(element) {
    return (element === null || element === void 0 ? void 0 : element.dataset.ujsSubmit) === "false";
  }
  function RemoteWatcher() {
    let query;
    function initialize2() {
      query = window.mrujs.remoteSelector;
    }
    function connect2() {
      $$1(query).forEach((el) => {
        addTurboFalse(el);
      });
    }
    function disconnect2() {
    }
    function observerCallback2(nodeList) {
      nodeList.forEach((node) => {
        if (matches$1(node, window.mrujs.remoteSelector)) {
          addTurboFalse(node);
        }
        if (node instanceof Element) {
          node.querySelectorAll(query).forEach((el) => {
            addTurboFalse(el);
          });
        }
      });
    }
    return {
      name: "RemoteWatcher",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2
    };
  }
  function addTurboFalse(el) {
    if (el == null)
      return;
    if (el.getAttribute("data-turbo") != null)
      return;
    el.setAttribute("data-turbo", "false");
  }
  function ClickHandler() {
    const callbacks = [preventInsignificantClick$1];
    let queries = [];
    function initialize2() {
      queries = getQueries$4();
    }
    function connect2() {
      addListeners(queries, callbacks);
    }
    function disconnect2() {
      removeListeners(queries, callbacks);
    }
    function observerCallback2(nodeList) {
      attachObserverCallback(queries, nodeList, callbacks);
    }
    return {
      name: "ClickHandler",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2,
      queries,
      callbacks
    };
  }
  function getQueries$4() {
    const { linkClickSelector: linkClickSelector2, buttonClickSelector: buttonClickSelector2, formInputClickSelector: formInputClickSelector2 } = window.mrujs;
    return [
      {
        event: "click",
        selectors: [
          linkClickSelector2,
          buttonClickSelector2,
          formInputClickSelector2
        ]
      }
    ];
  }
  function Confirm() {
    const callbacks = [handleConfirm$1];
    let queries = [];
    function initialize2() {
      queries = getQueries$3();
    }
    function connect2() {
      addListeners(queries, callbacks);
    }
    function disconnect2() {
      removeListeners(queries, callbacks);
    }
    function observerCallback2(nodeList) {
      attachObserverCallback(queries, nodeList, callbacks);
    }
    return {
      name: "Confirm",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2,
      queries,
      callbacks
    };
  }
  function handleConfirm$1(event) {
    if (!allowAction(event)) {
      stopEverything$1(event);
    }
  }
  function allowAction(event) {
    if (event.currentTarget == null)
      return true;
    const element = event.currentTarget;
    const message = element.dataset.confirm;
    if (message == null)
      return true;
    let answer = false;
    try {
      answer = window.mrujs.confirm(message);
    } catch (e) {
      console.warn('The following error was encountered when calling: "mrujs.confirm"\n\n');
      console.error(e);
    }
    const firedEvent = dispatch3.call(element, "confirm:complete", { detail: { answer } });
    return answer && !firedEvent.defaultPrevented;
  }
  function getQueries$3() {
    const { linkClickSelector: linkClickSelector2, buttonClickSelector: buttonClickSelector2, formInputClickSelector: formInputClickSelector2, inputChangeSelector: inputChangeSelector2, formSubmitSelector: formSubmitSelector2 } = window.mrujs;
    return [
      {
        event: "click",
        selectors: [
          linkClickSelector2,
          buttonClickSelector2,
          formInputClickSelector2
        ]
      },
      {
        event: "change",
        selectors: [
          inputChangeSelector2
        ]
      },
      {
        event: "submit",
        selectors: [
          formSubmitSelector2
        ]
      }
    ];
  }
  function MethodSubmission(element) {
    var _a2, _b;
    const method2 = getElementMethod(element);
    let maskedMethod;
    if ((_a2 = window.mrujs) === null || _a2 === void 0 ? void 0 : _a2.maskLinkMethods) {
      maskedMethod = getMaskedMethod(method2);
    }
    const href = (_b = element.getAttribute("href")) !== null && _b !== void 0 ? _b : element.dataset.url;
    if (href == null) {
      throw Error(`No 'href' or 'data-url' found on ${JSON.stringify(element)}`);
    }
    const url = expandUrl(href);
    const options = {
      headers: getHeaders(element)
    };
    options.method = maskedMethod !== null && maskedMethod !== void 0 ? maskedMethod : method2;
    if (!isGetRequest(method2))
      options.body = getBody(method2, element);
    const fetchRequest = FetchRequest$1(url, options);
    return {
      request: fetchRequest.request,
      fetchRequest
    };
  }
  function getHeaders(element) {
    let responseType;
    if (element != null) {
      responseType = element.dataset.type;
    }
    const acceptHeader = findResponseTypeHeader(responseType);
    const headers = new Headers({ Accept: acceptHeader });
    headers.set("Accept", acceptHeader);
    return headers;
  }
  function getFormData(method2) {
    var _a2;
    const formData = new FormData();
    if ((_a2 = window.mrujs) === null || _a2 === void 0 ? void 0 : _a2.maskLinkMethods) {
      formData.append("_method", method2);
    }
    return formData;
  }
  function getElementMethod(element) {
    const method2 = element.dataset.method || "get";
    return method2.toLowerCase();
  }
  function getMaskedMethod(method2) {
    return isGetRequest(method2) ? "get" : "post";
  }
  function getBody(method2, element) {
    const encodedFormData = urlEncodeFormData(getFormData(method2));
    const elName = element.getAttribute("name");
    const elValue = element.value;
    if (elName != null && elValue != null)
      encodedFormData.append(elName, elValue);
    const additionalParams = parseParams(element.getAttribute("data-params"));
    if (additionalParams == null)
      return encodedFormData;
    for (const [key, value] of additionalParams) {
      if (value == null)
        continue;
      const val = value.toString();
      const isString = typeof val === "string" || val instanceof String;
      if (!isString)
        continue;
      encodedFormData.append(key, val.toString());
    }
    return encodedFormData;
  }
  function parseParams(params) {
    if (params == null)
      return void 0;
    if (containsEncodedComponents(params)) {
      params = decodeURIComponent(params);
    }
    try {
      return Object.entries(JSON.parse(params));
    } catch (_a2) {
    }
    try {
      return new URLSearchParams(params).entries();
    } catch (_b) {
    }
    return void 0;
  }
  function containsEncodedComponents(x) {
    return decodeURI(x) !== decodeURIComponent(x);
  }
  function Method() {
    const callbacks = [handleMethod$1];
    let queries = [];
    function initialize2() {
      queries = getQueries$2();
    }
    function connect2() {
      addListeners(queries, callbacks);
    }
    function disconnect2() {
      removeListeners(queries, callbacks);
    }
    function observerCallback2(nodeList) {
      attachObserverCallback(queries, nodeList, callbacks);
    }
    return {
      name: "Method",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2,
      queries,
      callbacks
    };
  }
  function handleMethod$1(event) {
    var _a2;
    const element = event.currentTarget;
    if (event instanceof MouseEvent && isInsignificantClick(event)) {
      return;
    }
    if (element.dataset.remote === "false")
      return;
    if (element.dataset.method == null && element.dataset.remote !== "true")
      return;
    const href = (_a2 = element.getAttribute("href")) !== null && _a2 !== void 0 ? _a2 : element.dataset.url;
    if (href == null)
      return;
    event.preventDefault();
    const submitter2 = event.target;
    const linkSubmission = MethodSubmission(element);
    const { fetchRequest, request: request2 } = linkSubmission;
    dispatch3.call(element, AJAX_EVENTS.ajaxBeforeSend, {
      detail: { element, fetchRequest, request: request2, submitter: submitter2 }
    });
  }
  function getQueries$2() {
    const { linkClickSelector: linkClickSelector2, inputChangeSelector: inputChangeSelector2, buttonClickSelector: buttonClickSelector2 } = window.mrujs;
    return [
      {
        event: "click",
        selectors: [
          linkClickSelector2,
          buttonClickSelector2
        ]
      },
      {
        event: "change",
        selectors: [
          inputChangeSelector2
        ]
      }
    ];
  }
  var ALLOWABLE_ACTIONS = [
    "advance",
    "replace",
    "restore"
  ];
  function NavigationAdapter() {
    const obj = {
      name: "NavigationAdapter",
      connect: connect$1,
      disconnect: disconnect$1,
      cacheContains,
      cacheHTML,
      prefetch,
      navigate
    };
    Object.defineProperties(obj, {
      adapter: { get: function() {
        return findAdapter();
      } },
      snapshotCache: { get: function() {
        return findSnapshotCache(findAdapter());
      } }
    });
    return obj;
  }
  function connect$1() {
    document.addEventListener("ajax:complete", beforeNavigation);
    document.addEventListener("ajax:beforeNavigation", navigateViaEvent);
  }
  function disconnect$1() {
    document.removeEventListener("ajax:complete", beforeNavigation);
    document.removeEventListener("ajax:beforeNavigation", navigateViaEvent);
  }
  function beforeNavigation(event) {
    if (event.defaultPrevented)
      return;
    dispatch3.call(event.detail.element, "ajax:beforeNavigation", { detail: { ...event.detail } });
  }
  function findAdapter() {
    if (useTurbolinks())
      return window.Turbolinks;
    if (useTurbo())
      return window.Turbo;
    return void 0;
  }
  function useTurbolinks() {
    if (window.Turbolinks == null)
      return false;
    if (window.Turbolinks.supported !== true)
      return false;
    return true;
  }
  function useTurbo() {
    if (window.Turbo == null)
      return false;
    return true;
  }
  async function prefetch(url) {
    const expandedUrl = expandUrl(url);
    const response2 = await window.mrujs.fetch(expandedUrl, { method: "get" });
    if (response2 == null)
      return;
    const fetchResponse = FetchResponse$1(response2);
    if (!fetchResponse.isHtml)
      return;
    const html = await fetchResponse.html();
    cacheHTML({ html, url });
  }
  function cacheHTML({ html, url }) {
    const expandedUrl = expandUrl(url);
    const snapshot = generateSnapshotFromHtml(html);
    putSnapshotInCache(expandedUrl, snapshot);
  }
  function findSnapshotCache(adapter) {
    if (adapter == null)
      return void 0;
    if (useTurbolinks())
      return adapter.controller.cache;
    if (useTurbo())
      return adapter.navigator.view.snapshotCache;
    return void 0;
  }
  function cacheContains(url) {
    var _a2;
    const expandedUrl = expandUrl(url);
    const snapshotCache = findSnapshotCache(findAdapter());
    return (_a2 = snapshotCache === null || snapshotCache === void 0 ? void 0 : snapshotCache.has(expandedUrl)) !== null && _a2 !== void 0 ? _a2 : false;
  }
  function navigateViaEvent(event) {
    if (event.defaultPrevented)
      return;
    const { element, fetchResponse, fetchRequest } = event.detail;
    if (!shouldNavigate(element, fetchResponse))
      return;
    navigate(element, fetchRequest, fetchResponse);
  }
  function shouldNavigate(element, fetchResponse) {
    if (element.dataset.ujsNavigate === "false")
      return false;
    if (fetchResponse == null)
      return false;
    if (!fetchResponse.isHtml)
      return false;
    if (element instanceof HTMLFormElement && fetchResponse.succeeded && !fetchResponse.redirected) {
      console.error("Successful form submissions must redirect");
      return false;
    }
    return true;
  }
  function navigate(element, request2, response2, action) {
    action = action !== null && action !== void 0 ? action : determineAction(element);
    let location2 = expandUrl(window.location.href);
    if (request2 === null || request2 === void 0 ? void 0 : request2.isGetRequest)
      location2 = request2.url;
    if (response2.redirected)
      location2 = response2.location;
    const currentLocation = window.location.href;
    const isSamePage = urlsAreEqual2(location2, currentLocation);
    let errorRenderer = "morphdom";
    if (window.mrujs.errorRenderer === "turbo" || element.getAttribute("data-ujs-error-renderer") === "turbo") {
      errorRenderer = "turbo";
    }
    const shouldMorph2 = element.getAttribute("data-ujs-morph");
    const adapter = findAdapter();
    if (response2.failed || isSamePage || adapter == null || shouldMorph2 === "true") {
      morphResponse(element, response2, !isSamePage, errorRenderer);
      return;
    }
    adapter.clearCache();
    preventDoubleVisit(response2, location2, action);
  }
  function putSnapshotInCache(location2, snapshot) {
    if (snapshot === "")
      return;
    const snapshotCache = findSnapshotCache(findAdapter());
    snapshotCache === null || snapshotCache === void 0 ? void 0 : snapshotCache.put(expandUrl(location2), snapshot);
  }
  function generateSnapshotFromHtml(html) {
    var _a2, _b, _c;
    const adapter = findAdapter();
    if (adapter == null)
      return "";
    if (useTurbolinks()) {
      return (_a2 = adapter.Snapshot.wrap(html)) !== null && _a2 !== void 0 ? _a2 : "";
    }
    if (useTurbo() && canSnapshot()) {
      return (_c = (_b = adapter.PageSnapshot) === null || _b === void 0 ? void 0 : _b.fromHTMLString(html)) !== null && _c !== void 0 ? _c : "";
    }
    return "";
  }
  function canSnapshot() {
    const adapter = findAdapter();
    if (adapter == null)
      return false;
    if (useTurbolinks())
      return true;
    if (useTurbo()) {
      if (adapter.PageSnapshot == null) {
        console.warn("The version of Turbo you are currently using does not support snapshot generation. Please consider upgrading your version of Turbo.");
        return false;
      }
      return true;
    }
    return false;
  }
  function preventDoubleVisit(response2, location2, action) {
    const adapter = findAdapter();
    if (adapter == null)
      return;
    response2.html().then((html) => {
      cacheHTML({ html, url: location2 });
      action = "restore";
      adapter.visit(location2, { action });
    }).catch((error) => console.error(error));
  }
  function morphResponse(element, response2, pushState = false, errorRenderer = "morphdom") {
    if (!response2.isHtml)
      return;
    response2.html().then((html) => {
      var _a2;
      if (errorRenderer === "turbo") {
        renderError(html);
      } else if (errorRenderer === "morphdom") {
        const selectorString = element.getAttribute("data-ujs-morph-root");
        let selector = document.documentElement;
        if (selectorString != null) {
          if (selectorString.trim() === "") {
            selector = element;
          } else {
            selector = (_a2 = document.querySelector(selectorString)) !== null && _a2 !== void 0 ? _a2 : document.documentElement;
          }
        }
        morphHtml(html, selector);
      }
      if (pushState) {
        window.history.pushState({}, "", response2.location);
      }
    }).catch((error) => {
      console.error(error);
    });
  }
  function morphHtml(html, selector = document.documentElement) {
    const template2 = document.createElement("template");
    template2.innerHTML = String(html).trim();
    const content = selector === document.documentElement ? template2.innerHTML : template2.content;
    document.dispatchEvent(new CustomEvent("ujs:beforeMorph"));
    morphdom_esm_default2(selector, content, { childrenOnly: true });
    document.dispatchEvent(new CustomEvent("ujs:afterMorph"));
  }
  function renderError(html) {
    const adapter = findAdapter();
    adapter === null || adapter === void 0 ? void 0 : adapter.navigator.view.renderError(generateSnapshotFromHtml(html));
  }
  function determineAction(element) {
    var _a2, _b;
    let action = (_b = (_a2 = element.dataset.turbolinksAction) !== null && _a2 !== void 0 ? _a2 : element.dataset.turboAction) !== null && _b !== void 0 ? _b : "advance";
    if (!ALLOWABLE_ACTIONS.includes(action)) {
      action = "advance";
    }
    return action;
  }
  function DisabledElementChecker() {
    const callbacks = [handleDisabledElement$1];
    let queries = [];
    function initialize2() {
      queries = getQueries$1();
    }
    function connect2() {
      addListeners(queries, callbacks);
    }
    function disconnect2() {
      removeListeners(queries, callbacks);
    }
    function observerCallback2(nodeList) {
      attachObserverCallback(queries, nodeList, callbacks);
    }
    return {
      name: "DisabledElementChecker",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2,
      queries,
      callbacks
    };
  }
  function getQueries$1() {
    const { linkClickSelector: linkClickSelector2, buttonClickSelector: buttonClickSelector2, inputChangeSelector: inputChangeSelector2, formSubmitSelector: formSubmitSelector2, formInputClickSelector: formInputClickSelector2 } = window.mrujs;
    return [
      { event: "click", selectors: [buttonClickSelector2, linkClickSelector2, formInputClickSelector2] },
      { event: "change", selectors: [inputChangeSelector2] },
      { event: "submit", selectors: [formSubmitSelector2] }
    ];
  }
  function handleDisabledElement$1(event) {
    if (this.disabled === true)
      stopEverything$1(event);
  }
  function ElementEnabler() {
    const callbacks = [enableElement$1];
    let queries = [];
    function initialize2() {
      queries = getQueries();
    }
    function connect2() {
      addListeners(queries, callbacks);
    }
    function disconnect2() {
      removeListeners(queries, callbacks);
    }
    function observerCallback2(nodeList) {
      attachObserverCallback(queries, nodeList, callbacks);
    }
    return {
      name: "ElementEnabler",
      initialize: initialize2,
      connect: connect2,
      disconnect: disconnect2,
      observerCallback: observerCallback2,
      callbacks
    };
  }
  function getQueries() {
    const { formSubmitSelector: formSubmitSelector2, buttonDisableSelector: buttonDisableSelector2, linkDisableSelector: linkDisableSelector2, inputChangeSelector: inputChangeSelector2 } = window.mrujs;
    const selectors = [
      linkDisableSelector2,
      buttonDisableSelector2,
      formSubmitSelector2,
      inputChangeSelector2
    ];
    return [
      { event: AJAX_EVENTS.ajaxComplete, selectors },
      { event: AJAX_EVENTS.ajaxStopped, selectors },
      { event: "turbo:submit-end", selectors }
    ];
  }
  function enableElement$1(trigger) {
    let element = trigger;
    if (trigger instanceof Event)
      element = trigger.target;
    const { linkDisableSelector: linkDisableSelector2, buttonDisableSelector: buttonDisableSelector2, formEnableSelector: formEnableSelector2, formSubmitSelector: formSubmitSelector2 } = window.mrujs;
    if (matches$1(element, linkDisableSelector2)) {
      enableLinkElement(element);
      return;
    }
    if (matches$1(element, buttonDisableSelector2) || matches$1(element, formEnableSelector2)) {
      enableFormElement(element);
      return;
    }
    if (matches$1(element, formSubmitSelector2)) {
      enableFormElements(element);
    }
  }
  function enableLinkElement(element) {
    const originalText = element.dataset.ujsEnableWith;
    if (originalText != null) {
      element.innerHTML = originalText;
      element.removeAttribute("data-ujs-enable-with");
    }
    element.removeEventListener("click", stopEverything$1);
    element.removeAttribute("data-ujs-disabled");
  }
  function enableFormElements(form2) {
    const elements = formElements$1(form2, window.mrujs.formEnableSelector);
    elements.forEach(enableFormElement);
  }
  function enableFormElement(element) {
    const originalText = element.dataset.ujsEnableWith;
    if (originalText != null) {
      if (matches$1(element, "button")) {
        element.innerHTML = originalText;
      } else {
        element.value = originalText;
      }
      element.removeAttribute("data-ujs-enable-with");
    }
    element.disabled = false;
    element.removeAttribute("data-ujs-disabled");
  }
  function AddedNodesObserver(callback) {
    const observer = new MutationObserver(callback);
    function connect2() {
      observer.observe(document, { childList: true, subtree: true, attributes: true });
    }
    function disconnect2() {
      observer.disconnect();
    }
    return {
      name: "AddedNodesObserver",
      connect: connect2,
      disconnect: disconnect2
    };
  }
  function Mrujs(obj = {}) {
    var _a2;
    obj.connected = false;
    obj = { ...BASE_SELECTORS };
    obj.FetchResponse = FetchResponse$1;
    obj.FetchRequest = FetchRequest$1;
    obj.addedNodesObserver = AddedNodesObserver(addedNodesCallback);
    obj.remoteWatcher = RemoteWatcher();
    obj.elementEnabler = ElementEnabler();
    obj.elementDisabler = ElementDisabler();
    obj.disabledElementChecker = DisabledElementChecker();
    obj.navigationAdapter = NavigationAdapter();
    obj.clickHandler = ClickHandler();
    obj.confirmClass = Confirm();
    obj.csrf = Csrf();
    obj.method = Method();
    obj.formSubmitDispatcher = FormSubmitDispatcher();
    const corePlugins = [
      obj.addedNodesObserver,
      obj.remoteWatcher,
      obj.csrf,
      obj.elementEnabler,
      obj.clickHandler,
      obj.disabledElementChecker,
      obj.confirmClass,
      obj.elementDisabler,
      obj.method,
      obj.formSubmitDispatcher,
      obj.navigationAdapter
    ];
    obj.corePlugins = corePlugins;
    const plugins = (_a2 = obj.plugins) !== null && _a2 !== void 0 ? _a2 : [];
    obj.plugins = plugins;
    const allPlugins = corePlugins.concat(plugins);
    obj.allPlugins = allPlugins;
    obj.maskLinkMethods = true;
    obj.mimeTypes = { ...BASE_ACCEPT_HEADERS };
    obj.stop = stop;
    obj.restart = restart;
    obj.fetch = fetch2;
    obj.urlEncodeFormData = urlEncodeFormData;
    obj.registerMimeTypes = registerMimeTypes;
    obj.enableElement = enableElement$1;
    obj.enableFormElements = enableFormElements;
    obj.enableFormElement = enableFormElement;
    obj.disableElement = disableElement$1;
    obj.stopEverything = stopEverything$1;
    obj.dispatch = dispatch3;
    obj.addListeners = addListeners;
    obj.removeListeners = removeListeners;
    obj.attachObserverCallback = attachObserverCallback;
    obj.expandUrl = expandUrl;
    obj.findSubmitter = findSubmitter;
    obj.$ = $$1;
    obj.CSRFProtection = CSRFProtection$1;
    obj.csrfParam = csrfParam$1;
    obj.csrfToken = csrfToken$1;
    obj.cspNonce = cspNonce$1;
    obj.confirm = confirm$1;
    obj.handleConfirm = handleConfirm$1;
    obj.handleDisabledElement = handleDisabledElement$1;
    obj.handleMethod = handleMethod$1;
    obj.start = start$1;
    obj.preventInsignificantClick = preventInsignificantClick$1;
    obj.refreshCSRFTokens = refreshCSRFTokens$1;
    obj.delegate = delegate$1;
    obj.fire = fire$1;
    obj.formElements = formElements$1;
    obj.matches = matches$1;
    obj.toArray = toArray;
    obj.prefetch = obj.navigationAdapter.prefetch;
    return obj;
  }
  function start$1(options = {}) {
    var _a2;
    window.Rails = window.mrujs = this;
    if (window.mrujs.connected) {
      return window.mrujs;
    }
    Object.assign(this, options);
    this.allPlugins = this.corePlugins.concat(this.plugins);
    for (let i = 0; i < this.allPlugins.length; i++) {
      const plugin = this.allPlugins[i];
      (_a2 = plugin.initialize) === null || _a2 === void 0 ? void 0 : _a2.call(plugin);
    }
    connect();
    return this;
  }
  function stop() {
    disconnect();
  }
  function restart() {
    disconnect();
    connect();
  }
  function connect() {
    var _a2;
    reEnableDisabledElements();
    window.addEventListener("pageshow", reEnableDisabledElements);
    for (let i = 0; i < window.mrujs.allPlugins.length; i++) {
      const plugin = window.mrujs.allPlugins[i];
      (_a2 = plugin.connect) === null || _a2 === void 0 ? void 0 : _a2.call(plugin);
    }
    window.mrujs.connected = true;
  }
  function disconnect() {
    var _a2;
    window.removeEventListener("pageshow", reEnableDisabledElements);
    for (let i = 0; i < window.mrujs.allPlugins.length; i++) {
      const plugin = window.mrujs.allPlugins[i];
      (_a2 = plugin.disconnect) === null || _a2 === void 0 ? void 0 : _a2.call(plugin);
    }
    window.mrujs.connected = false;
  }
  function confirm$1(message) {
    return window.confirm(message);
  }
  function addedNodesCallback(mutationList, _observer) {
    for (const mutation of mutationList) {
      let addedNodes;
      if (mutation.type === "attributes") {
        addedNodes = [mutation.target];
      } else {
        addedNodes = Array.from(mutation.addedNodes);
      }
      window.setTimeout(() => {
        var _a2;
        for (let i = 0; i < window.mrujs.allPlugins.length; i++) {
          const plugin = window.mrujs.allPlugins[i];
          (_a2 = plugin.observerCallback) === null || _a2 === void 0 ? void 0 : _a2.call(plugin, addedNodes);
        }
      }, 0);
    }
  }
  function fetch2(input, options = {}) {
    let { element, submitter: submitter2, dispatchEvents } = options;
    delete options.element;
    delete options.submitter;
    delete options.dispatchEvents;
    const fetchRequest = FetchRequest$1(input, options);
    if (dispatchEvents === true) {
      if (element == null)
        element = document.documentElement;
      dispatch3.call(element, AJAX_EVENTS.ajaxBeforeSend, {
        detail: { element, fetchRequest, request: fetchRequest.request, submitter: submitter2 }
      });
      return void 0;
    }
    return window.fetch(fetchRequest.request);
  }
  function registerMimeTypes(mimeTypes) {
    mimeTypes.forEach((mimeType) => {
      const { shortcut, header } = mimeType;
      window.mrujs.mimeTypes[shortcut] = header;
    });
    return window.mrujs.mimeTypes;
  }
  function reEnableDisabledElements() {
    const { formEnableSelector: formEnableSelector2, linkDisableSelector: linkDisableSelector2 } = window.mrujs;
    $$1(`${formEnableSelector2}, ${linkDisableSelector2}`).forEach((element) => {
      const el = element;
      enableElement$1(el);
    });
  }
  function cspNonce$1() {
    return getMetaContent2("csp-nonce");
  }
  var mrujs = Mrujs();
  var { $, CSRFProtection, buttonClickSelector, buttonDisableSelector, cspNonce, csrfParam, csrfToken, confirm: confirm2, delegate, disableElement, enableElement, fileInputSelector, fire, formDisableSelector, formElements, formEnableSelector, formInputClickSelector, formSubmitSelector, handleConfirm, handleDisabledElement, handleMethod, inputChangeSelector, linkClickSelector, linkDisableSelector, matches, preventInsignificantClick, refreshCSRFTokens, start: start2, stopEverything, FetchResponse: FetchResponse2, FetchRequest: FetchRequest2 } = mrujs;

  // ../../node_modules/mrujs/plugins/dist/plugins.module.js
  var CableCar = class {
    constructor(cableReady, { mimeType } = {}) {
      this.cableReady = cableReady;
      this.mimeType = mimeType !== null && mimeType !== void 0 ? mimeType : "text/vnd.cable-ready.json";
      this.boundPerform = this.perform.bind(this);
    }
    get name() {
      return "CableCar";
    }
    initialize() {
      const anyHeader = window.mrujs.mimeTypes.any;
      window.mrujs.registerMimeTypes([
        { shortcut: "any", header: `${this.mimeType}, ${anyHeader}` },
        { shortcut: "cablecar", header: this.mimeType }
      ]);
    }
    connect() {
      document.addEventListener("ajax:beforeNavigation", this.boundPerform);
    }
    disconnect() {
      document.removeEventListener("ajax:beforeNavigation", this.boundPerform);
    }
    perform(event) {
      const fetchResponse = event.detail.fetchResponse;
      if ((fetchResponse === null || fetchResponse === void 0 ? void 0 : fetchResponse.contentType) == null)
        return;
      if (!this.isCableReadyResponse(fetchResponse.contentType))
        return;
      event.preventDefault();
      fetchResponse.json().then((response2) => {
        this.cableReady.perform(response2);
      }).catch((err) => {
        console.error(err);
      });
    }
    isCableReadyResponse(contentType) {
      return Boolean(contentType.includes(this.mimeType));
    }
  };

  // application.js
  mrujs.start({
    plugins: [new CableCar(global)]
  });
})();
/*! Bundled license information:

@hotwired/turbo/dist/turbo.es2017-esm.js:
  (*!
  Turbo 8.0.13
  Copyright © 2025 37signals LLC
   *)
*/
//# sourceMappingURL=application.js.map
