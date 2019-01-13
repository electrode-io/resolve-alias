"use strict";

const Path = require("path");
const ra = require("../..");

describe("resolve-alias", function () {
  afterEach(() => {
    ra.reset();
  });

  it("should handle _cwd", () => {
    expect(ra.enable).to.be.true;
    ra.add("cwd", process.cwd());
    expect(require.resolve("_cwd/package.json")).to.equal(Path.resolve("package.json"));
    expect(require("cwd/package.json")).to.have.property("name");
  });

  it("should handle whole request being the alias", () => {
    ra.add("_pkg-json", Path.resolve("package.json"));
    expect(require("_pkg-json")).to.have.property("name");
  });

  it("should handle translator being a function", () => {
    ra.add("foo", (alias, reqPath) => Path.join(process.cwd(), reqPath));
    expect(require("foo/package.json")).to.have.property("name");
  });

  it("should handle alias translating to empty", () => {
    ra.add("$null", "");
    ra.add("_null", "");
    expect(require("$null/electrode-archetype-njs-module-dev/package.json")).to.have.property(
      "name"
    );
    expect(() => {
      require("_null");
    }).to.throw("_null");
  });

  it("should handle non-exist alias", () => {
    expect(() => {
      require("_blah");
    }).to.throw("_blah");
  });

  it("should not allow adding alias that's a real package", () => {
    ra._allowAliasRealPackage = false;
    expect(() => ra.add("chalk", "blah")).to.throw("real package found");
  });

  it("should allow adding alias that's a real package with flag", () => {
    ra.add("chalk", "blah", true);
    expect(ra._aliases.chalk.translator).equal("blah");
  });

  it("should not translate alias that mask real package", () => {
    ra.add("chalk", "blah", true);
    ra.allowMaskingRealModule(false);
    expect(require("chalk/package.json")).to.have.property("name", "chalk");
  });

  it("should translate alias that mask real package", () => {
    ra.add("chalk", "blah", true);
    ra.allowMaskingRealModule(true);
    expect(() => require("chalk/package.json")).to.throw;
  });

  it("should allow a single / if alias has leading @", () => {
    ra.add("@blah1/foo", "electrode-archetype-njs-module-dev");
    expect(() => ra.add("@blah1/foo/", "electrode-archetype-njs-module-dev")).to.throw(
      "alias must not:"
    );
    expect(require("@blah1/foo/package.json").name).to.equal("electrode-archetype-njs-module-dev");
    const t1 = require("@blah1/foo");
    expect(t1).to.be.a("function");
  });

  it("should allow adding alias with valid name only", () => {
    expect(() => {
      ra.add(".test", "boo");
    }).to.throw("alias must not:");

    expect(() => {
      ra.add("/test", "boo");
    }).to.throw("alias must not:");
  });

  it("should allow adding alias string/function translator only", () => {
    expect(() => {
      ra.add("@test", 50);
    }).to.throw("translator must be string or function");
  });

  it("should remove alias", () => {
    ra.add("@test", "boo");
    expect(ra._aliases).has.property("@test");
    ra.remove("@test");
    ra.remove("@test"); // calling 2nd time should be ok
    expect(ra._aliases).not.has.property("@test");
  });

  it("should stop translating if not enable", () => {
    ra.enable = false;

    expect(() => {
      require("_cwd/package.json");
    }).to.throw("Cannot find module");

    ra.enable = true;
  });
});
