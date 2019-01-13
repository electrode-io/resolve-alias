"use strict";

/* eslint-disable max-statements, no-eval, complexity */

const Path = require("path");

const xrequire = eval("require");

class ResolveAlias {
  constructor() {
    this.reset();
    this._allowAliasRealPackage = false;
  }

  reset() {
    this._aliases = {
      _cwd: { translator: process.cwd(), isReal: false }
    };
    this._enable = true;
  }

  set enable(flag) {
    this._enable = flag;
  }

  get enable() {
    return this._enable;
  }

  allowMaskingRealModule(flag) {
    this._allowAliasRealPackage = flag;
  }

  translate(request) {
    if (!this._enable || request[0] === "." || Path.isAbsolute(request)) {
      return request;
    }

    let alias = request;
    let ix = request.indexOf("/");

    const hasScope = request[0] === "@";
    const hasSlash = ix > 0;

    if (hasSlash) {
      if (hasScope) {
        const ix2 = request.indexOf("/", ix + 1);
        if (ix2 > ix) {
          ix = ix2;
          alias = request.substring(0, ix);
        } else {
          ix = request.length;
        }
      } else {
        alias = request.substring(0, ix);
      }
    } else {
      ix = request.length;
    }

    if (this._aliases.hasOwnProperty(alias)) {
      const { isReal, translator } = this._aliases[alias];

      if (isReal && !this._allowAliasRealPackage) {
        return request;
      }

      const requestPath = request.substring(ix);
      if (typeof translator === "function") {
        return translator(alias, requestPath, request);
      }

      if (translator) {
        return `${translator}${requestPath}`;
      } else if (hasSlash) {
        // no translator, just remove the alias and the first /
        // for example: 'alias/foo' => 'foo'
        // or with scope: '@alias/foo/blah' => 'blah'
        return request.substring(ix + 1);
      }
    }

    return request;
  }

  checkReal(alias, suffix) {
    const saved = this._enable;
    this._enable = false;
    try {
      xrequire.resolve(`${alias}${suffix || ""}`);
      return true;
    } catch (err) {
      return false;
    } finally {
      this._enable = saved;
    }
  }

  add(alias, translator, realOk) {
    if (
      Path.isAbsolute(alias) ||
      // alias convention:
      // 1. it can only contain one / if it's scoped with leading @
      // 2. without leading @, it can't contain any /
      // 3. it can't contain any space.
      // 4. it can contain @, $, and any thing that's not spaces or /.
      !alias.match(/^(\@[^\s]+\/[^\s\/]+|[^\.][^\s\/]+)$/)
    ) {
      throw new Error(
        `resolve-alias: add ${alias} - alias must not: \
contain space, be an absolute path, or start with .`
      );
    }

    const tof = typeof translator;
    if (tof !== "string" && tof !== "function") {
      throw new Error(
        `resolve-alias: add ${alias} - translator must be string or function - got ${tof}`
      );
    }

    const isReal = this.checkReal(alias) || this.checkReal(alias, "/package.json");
    if (!realOk && !this._allowAliasRealPackage && isReal) {
      throw new Error(`resolve-alias: add ${alias} - real package found in node_modules`);
    }

    this._aliases[alias] = { translator, isReal };
  }

  remove(alias) {
    if (this._aliases.hasOwnProperty(alias)) {
      delete this._aliases[alias];
    }
  }
}

module.exports = ResolveAlias;
