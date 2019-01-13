"use strict";

/* eslint-disable max-params */

const Module = require("module");
const ResolveAlias = require("./resolve-alias");

const resolveAlias = new ResolveAlias();

const ORESOLVE = Symbol("resolve-alias saved original _resolveFilename");

Module[ORESOLVE] = Module._resolveFilename;
Module._resolveFilename = function (request, mod, isMain, options) {
  return Module[ORESOLVE](resolveAlias.translate(request), mod, isMain, options);
};

module.exports = resolveAlias;
