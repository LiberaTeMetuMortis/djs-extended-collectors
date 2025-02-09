"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _utils = require("@wumpjs/utils");
var _CollectorTimer = _interopRequireDefault(require("./CollectorTimer.cjs"));
var _CollectorError = _interopRequireDefault(require("../Errors/CollectorError.cjs"));
var _VersionError = _interopRequireDefault(require("../Errors/VersionError.cjs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  Client,
  Collection
} = await import("discord.js").catch(e => new _VersionError.default(`The package named \`discord.js\` has not been downloaded. to download: npm i discord.js@latest`, {
  type: "UnvalidVersion"
})).then((v) => v);
class BaseCollector extends _utils.Emitter {
  /**
   * 
   * @param {Client} client 
   * @param {*} options 
   */
  constructor(client, options) {
    super({
      listenerLimit: options.listenerLimit
    });
    client === undefined || !(client instanceof Client) ? new _CollectorError.default("Client is not defined or not valid.", {
      type: "TypeError"
    }) : this.client = client;
    this.options = options;
    this.collected = new Collection();
    this.ended = false;
    this.timer = new _CollectorTimer.default(() => {
      this.stop("timeEnd");
      this.ended = true;
    }, this.options.time);
    this.idleTimer = new _CollectorTimer.default(() => {
      this.stop("timeEnd");
      this.ended = true;
    }, this.options.idleTime);
    this.idleTimer.on("end", () => this.stop("timeEnd"));
    this.timer.on("end", () => this.stop("timeEnd"));
  }
  handleCollect(item, ...moreArgs) {}
  stop(reason) {
    this.emit("end", this.collected, reason);
    this.endReason = reason;
    this.ended = true;
    this.timer.stopTimer();
  }
  handleDispose(item, ...moreArgs) {}
  resetTimer() {
    this.timer.resetTimer();
  }
  pauseTimer() {
    if (this.ended) return;
    this.timer.pauseTimer();
    this.emit("paused", this.collected);
  }
  resumeTimer() {
    if (this.ended) return;
    this.timer.resumeTimer();
    this.emit("resumed", this.collected);
  }
}
var _default = BaseCollector;
exports.default = _default;