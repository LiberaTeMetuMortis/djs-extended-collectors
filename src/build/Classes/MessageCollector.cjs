"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _BaseCollector = _interopRequireDefault(require("./Bases/BaseCollector.cjs"));
var _CollectorError = _interopRequireDefault(require("./Errors/CollectorError.cjs"));
var _VersionError = _interopRequireDefault(require("./Errors/VersionError.cjs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  Channel
} = await import("discord.js").catch(e => new _VersionError.default(`The package named \`discord.js\` has not been downloaded. to download: npm i discord.js@latest`, {
  type: "UnvalidVersion"
})).then((v) => v);
class MessageCollector extends _BaseCollector.default {
  constructor(client, channel, options = {
    time: Infinity
  }) {
    super(client, options)(channel === undefined || !(channel instanceof Channel)) ? new _CollectorError.default("Channel is not defined or not valid.", {
      type: "TypeError"
    }) : this.channel = channel;
    this.guild = channel.guild ? channel.guild : null;
    //listeners
    this.client.on("messageCreate", m => this.handleCollect(m));
    this.client.on("messageDelete", m => this.handleDispose(m));
    this.client.on("messageDeleteBulk", msgs => msgs.forEach(m => this.handleDispose(m)));
    this.client.on("messageUpdate", (oM, nM) => this.handleUpdate(oM, nM));
    this.client.on("channelDelete", c => this.handleChannelDeletion(c));
    this.client.on("guildDelete", guild => this.handleGuildDeletion(guild));
    this.client.on("threadDelete", thread => this.handleThreadDeletion(thread));
    this.once("end", collected => {
      //stopping listeners
      this.client.off("messageCreate", m => this.handleCollect(m));
      this.client.off("messageDelete", m => this.handleDispose(m));
      this.client.off("messageDeleteBulk", msgs => msgs.forEach(m => this.handleDispose(m)));
      this.client.off("messageUpdate", (oM, nM) => this.handleUpdate(oM, nM));
      this.client.off("channelDelete", c => this.handleChannelDeletion(c));
      this.client.off("guildDelete", guild => this.handleGuildDeletion(guild));
      this.client.off("threadDelete", thread => this.handleThreadDeletion(thread));
    });
  }
  handleCollect(item) {
    if (this.ended) return;
    if (this.channel.id !== item.channel.id) return;
    if (item.guild && this.guild.id !== item.guild.id) return;
    if (this.options.max && this.collected.size === this.options.max || this.collected.size > this.options.max) this.emit("limitFulled", this.collected);
    if (this.options.collectFilter && this.options.collectFilter(item) || !this.options.collectFilter) {
      if (this.emitted("limitFulled")) return;
      this.collected.set(item.id, item);
      this.emit("collect", item);
    }
  }
  handleDispose(item) {
    if (this.ended) return;
    if (this.channel.id !== item.channel.id) return;
    if (item.guild && this.guild.id !== item.guild.id) return;
    if (!this.options.dispose) return;
    if (this.options.disposeFilter && this.options.disposeFilter(item) || !this.options.disposeFilter) {
      if (this.emitted("limitFulled")) return;
      this.collected.delete(item.id);
      this.emit("dispose", item);
    }
  }
  handleUpdate(oldItem, newItem) {
    if (this.ended) return;
    if (newItem.channel.id !== this.channel.id) return;
    if (newItem.guild && newItem.guild.id === this.channel.guild?.id) return;
    if (this.options.updateFilter && this.options.updateFilter(oldItem, newItem) || !this.options.updateFilter) {
      if (this.collected.has(oldItem.id)) {
        this.collected.delete(oldItem.id);
        this.collected.set(newItem.id, newItem);
        this.emit("update", oldItem, newItem);
      }
    }
  }
  handleGuildDeletion(guild) {
    if (this.guild && this.guild.id === guild.id) this.stop("guildDelete");
  }
  handleChannelDeletion(channel) {
    if (channel.id === this.channel.id) this.stop("channelDelete");
  }
  handleThreadDeletion(thread) {
    if (this.channel.isThread() && thread.id === this.channel.id) this.stop("threadDelete");
  }
}
var _default = MessageCollector;
exports.default = _default;