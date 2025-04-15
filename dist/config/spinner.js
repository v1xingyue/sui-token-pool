"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinner = void 0;
const ora_1 = __importDefault(require("ora"));
const index_1 = require("./index");
class SpinnerManager {
    constructor() {
        this.spinner = null;
    }
    start(text) {
        if (this.spinner) {
            this.spinner.text = text;
        }
        else {
            this.spinner = (0, ora_1.default)({
                text,
                color: "blue",
                spinner: "dots",
            }).start();
        }
    }
    succeed(text) {
        if (this.spinner) {
            this.spinner.succeed(text);
            this.spinner = null;
            if (text) {
                index_1.logger.info(text);
            }
        }
    }
    fail(text) {
        if (this.spinner) {
            this.spinner.fail(text);
            this.spinner = null;
            if (text) {
                index_1.logger.error(text);
            }
        }
    }
    update(text) {
        if (this.spinner) {
            this.spinner.text = text;
        }
    }
    stop() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
}
exports.spinner = new SpinnerManager();
