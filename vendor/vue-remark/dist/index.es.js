import { defineComponent as l, createElementBlock as r, openBlock as o, renderSlot as d, computed as m, Fragment as $, createTextVNode as T, toDisplayString as h, createCommentVNode as _, createElementVNode as g, normalizeClass as b, normalizeStyle as S, inject as v, ref as A, unref as I, resolveComponent as M, createBlock as k, renderList as x, resolveDynamicComponent as R, createSlots as q, withCtx as w, createVNode as H, provide as C } from "vue";
import N from "dompurify";
import { unified as z } from "unified";
import B from "remark-parse";
import E from "remark-gfm";
import { default as gt } from "remark-gfm";
import D from "remark-math";
import { default as At } from "remark-math";
const L = { key: 0 }, F = { key: 1 }, V = { key: 2 }, P = { key: 3 }, j = { key: 4 }, G = { key: 5 }, O = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Heading",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => e.node.depth === 1 ? (o(), r("h1", L, [
      d(t.$slots, "default")
    ])) : e.node.depth === 2 ? (o(), r("h2", F, [
      d(t.$slots, "default")
    ])) : e.node.depth === 3 ? (o(), r("h3", V, [
      d(t.$slots, "default")
    ])) : e.node.depth === 4 ? (o(), r("h4", P, [
      d(t.$slots, "default")
    ])) : e.node.depth === 5 ? (o(), r("h5", j, [
      d(t.$slots, "default")
    ])) : (o(), r("h6", G, [
      d(t.$slots, "default")
    ]));
  }
}), Y = { key: 1 }, J = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Paragraph",
  props: {
    node: {},
    parent: {}
  },
  setup(e) {
    const t = e, n = m(() => t.parent.children.length === 1), i = m(() => [
      "listItem",
      "blockquote"
    ].includes(t.parent.type));
    return (s, c) => i.value && n.value ? d(s.$slots, "default", { key: 0 }) : (o(), r("p", Y, [
      d(s.$slots, "default")
    ]));
  }
}), K = { key: 1 }, Q = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Text",
  props: {
    node: {},
    parent: {}
  },
  setup(e) {
    const t = e, n = m(() => t.parent.children.length === 1);
    return (i, s) => n.value ? (o(), r($, { key: 0 }, [
      T(h(e.node.value), 1)
    ], 64)) : (o(), r("span", K, h(e.node.value), 1));
  }
}), U = { key: 0 }, W = { key: 1 }, X = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "List",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => e.node.ordered ? (o(), r("ol", U, [
      d(t.$slots, "default")
    ])) : (o(), r("ul", W, [
      d(t.$slots, "default")
    ]));
  }
}), Z = ["checked"], ee = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "ListItem",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("li", null, [
      typeof e.node.checked == "boolean" ? (o(), r("input", {
        key: 0,
        type: "checkbox",
        checked: e.node.checked,
        disabled: ""
      }, null, 8, Z)) : _("", !0),
      d(t.$slots, "default")
    ]));
  }
}), te = ["href", "title"], ne = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Link",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("a", {
      href: e.node.url,
      title: e.node.title || void 0
    }, [
      d(t.$slots, "default")
    ], 8, te));
  }
}), oe = ["src", "alt", "title"], re = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Image",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("img", {
      src: e.node.url,
      alt: e.node.alt || "",
      title: e.node.title || void 0
    }, null, 8, oe));
  }
}), ie = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Strong",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("strong", null, [
      d(t.$slots, "default")
    ]));
  }
}), se = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Emphasis",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("em", null, [
      d(t.$slots, "default")
    ]));
  }
}), ae = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "InlineCode",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("code", null, h(e.node.value), 1));
  }
}), le = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Code",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("pre", null, [
      g("code", {
        class: b(e.node.lang ? `language-${e.node.lang}` : "")
      }, h(e.node.value), 3)
    ]));
  }
}), ue = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Blockquote",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("blockquote", null, [
      d(t.$slots, "default")
    ]));
  }
}), ce = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "ThematicBreak",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("hr"));
  }
}), de = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Table",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("table", null, [
      d(t.$slots, "default")
    ]));
  }
}), me = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "TableRow",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("tr", null, [
      d(t.$slots, "default")
    ]));
  }
}), he = { key: 0 }, pe = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "TableCell",
  props: {
    node: {},
    rowIndex: {},
    colIndex: {},
    align: {}
  },
  setup(e) {
    const t = e, n = m(() => Array.isArray(t.align) && t.colIndex !== void 0 && t.align[t.colIndex] ? t.align[t.colIndex] : null);
    return (i, s) => e.rowIndex === 0 ? (o(), r("th", he, [
      d(i.$slots, "default")
    ])) : (o(), r("td", {
      key: 1,
      style: S(n.value ? { textAlign: n.value } : void 0)
    }, [
      d(i.$slots, "default")
    ], 4));
  }
}), fe = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Delete",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("del", null, [
      d(t.$slots, "default")
    ]));
  }
}), _e = { role: "math" }, $e = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Math",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("div", _e, h(e.node.value), 1));
  }
}), ke = { role: "math" }, xe = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "InlineMath",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("span", ke, h(e.node.value), 1));
  }
}), ye = ["innerHTML"], ge = { key: 1 }, ve = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Html",
  props: {
    node: {}
  },
  setup(e) {
    const t = e, n = v("allowHtml", A(!1)), i = m(() => n.value ? N.sanitize(t.node.value) : null);
    return (s, c) => I(n) && i.value ? (o(), r("div", {
      key: 0,
      innerHTML: i.value
    }, null, 8, ye)) : (o(), r("pre", ge, h(e.node.value), 1));
  }
}), Ae = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Break",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("br"));
  }
}), we = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Definition",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => _("", !0);
  }
}), Ce = ["id"], Te = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "FootnoteDefinition",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("div", {
      id: `footnote-${e.node.identifier}`
    }, [
      d(t.$slots, "default")
    ], 8, Ce));
  }
}), be = ["href"], Se = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "FootnoteReference",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("sup", null, [
      g("a", {
        href: `#footnote-${e.node.identifier}`
      }, h(e.node.identifier), 9, be)
    ]));
  }
}), Ie = ["src", "alt", "title"], Me = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "ImageReference",
  props: {
    node: {}
  },
  setup(e) {
    const t = e, n = v("definitions", A([])), i = m(() => {
      var s;
      return (s = n.value) == null ? void 0 : s.find((c) => c.identifier === t.node.identifier);
    });
    return (s, c) => i.value ? (o(), r("img", {
      key: 0,
      src: i.value.url,
      alt: e.node.alt || "",
      title: i.value.title || void 0
    }, null, 8, Ie)) : _("", !0);
  }
}), Re = ["href", "title"], qe = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "LinkReference",
  props: {
    node: {}
  },
  setup(e) {
    const t = e, n = v("definitions", A([])), i = m(() => {
      var s;
      return (s = n.value) == null ? void 0 : s.find((c) => c.identifier === t.node.identifier);
    });
    return (s, c) => i.value ? (o(), r("a", {
      key: 0,
      href: i.value.url,
      title: i.value.title || void 0
    }, [
      d(s.$slots, "default")
    ], 8, Re)) : _("", !0);
  }
}), He = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Yaml",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => _("", !0);
  }
}), Ne = ["href"], ze = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Cite",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("a", {
      href: `#${e.node.value}`
    }, "[" + h(e.node.value) + "]", 9, Ne));
  }
}), Be = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Section",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("section", null, [
      d(t.$slots, "heading"),
      g("div", null, [
        d(t.$slots, "default")
      ])
    ]));
  }
}), Ee = ["data-teleport-id"], De = /* @__PURE__ */ l({
  inheritAttrs: !1,
  __name: "Teleport",
  props: {
    node: {}
  },
  setup(e) {
    return (t, n) => (o(), r("div", {
      "data-teleport-id": e.node.value,
      role: "teleport"
    }, null, 8, Ee));
  }
}), Le = {
  heading: O,
  paragraph: J,
  text: Q,
  list: X,
  listItem: ee,
  link: ne,
  image: re,
  strong: ie,
  emphasis: se,
  inlineCode: ae,
  code: le,
  blockquote: ue,
  thematicBreak: ce,
  table: de,
  tableRow: me,
  tableCell: pe,
  delete: fe,
  math: $e,
  inlineMath: xe,
  html: ve,
  break: Ae,
  definition: we,
  footnoteDefinition: Te,
  footnoteReference: Se,
  imageReference: Me,
  linkReference: qe,
  yaml: He,
  cite: ze,
  section: Be,
  teleport: De
}, Fe = { key: 1 }, Ve = /* @__PURE__ */ l({
  __name: "Renderer",
  props: {
    node: {},
    parent: {},
    align: {},
    rowIndex: {},
    colIndex: {},
    customNodeComponents: {}
  },
  setup(e) {
    const t = e;
    function n(c) {
      return c && Array.isArray(c.children) && c.children.length > 0;
    }
    function i(c) {
      return c && typeof c.heading < "u";
    }
    function s(c) {
      var p;
      return ((p = t.customNodeComponents) == null ? void 0 : p[c]) || Le[c];
    }
    return (c, p) => {
      const a = M("Renderer", !0);
      return e.node.type === "root" ? (o(!0), r($, { key: 0 }, x(e.node.children, (u, f) => (o(), k(a, {
        key: f,
        node: u,
        parent: e.node,
        "custom-node-components": e.customNodeComponents
      }, null, 8, ["node", "parent", "custom-node-components"]))), 128)) : s(e.node.type) ? (o(), k(R(s(e.node.type)), {
        key: 1,
        node: e.node,
        parent: t.parent,
        align: t.align,
        "row-index": t.rowIndex,
        "col-index": t.colIndex
      }, q({
        default: w(() => [
          n(e.node) ? (o(!0), r($, { key: 0 }, x(e.node.children, (u, f) => (o(), k(a, {
            key: f,
            node: u,
            parent: e.node,
            align: e.node.type === "table" || e.node.type === "tableRow" ? t.align || e.node.align || [] : void 0,
            "row-index": e.node.type === "table" || e.node.type === "tableRow" || e.node.type === "list" ? t.rowIndex !== void 0 ? t.rowIndex : f : void 0,
            "col-index": e.node.type === "tableRow" ? f : void 0,
            "custom-node-components": e.customNodeComponents
          }, null, 8, ["node", "parent", "align", "row-index", "col-index", "custom-node-components"]))), 128)) : _("", !0)
        ]),
        _: 2
      }, [
        i(e.node) ? {
          name: "heading",
          fn: w(() => [
            H(a, {
              node: e.node.heading,
              parent: e.node,
              "custom-node-components": e.customNodeComponents
            }, null, 8, ["node", "parent", "custom-node-components"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["node", "parent", "align", "row-index", "col-index"])) : (o(), r($, { key: 2 }, [
        n(e.node) ? (o(!0), r($, { key: 0 }, x(e.node.children, (u, f) => (o(), k(a, {
          key: f,
          node: u,
          parent: e.node,
          "custom-node-components": e.customNodeComponents
        }, null, 8, ["node", "parent", "custom-node-components"]))), 128)) : (o(), r("span", Fe, " [" + h(e.node.type) + "] ", 1))
      ], 64));
    };
  }
});
function Pe(e, t = []) {
  const n = z().use(B);
  t.forEach((c) => {
    n.use(c);
  });
  const i = n.parse(e);
  return n.runSync(i);
}
const je = {
  name: "cite",
  tokenize: Ge
};
function Ge(e, t, n) {
  return i;
  function i(u) {
    return u !== 91 ? n(u) : (e.enter("cite"), e.enter("citeSequence"), e.consume(u), s);
  }
  function s(u) {
    return u !== 91 ? n(u) : (e.consume(u), e.exit("citeSequence"), e.enter("citeText"), c);
  }
  function c(u) {
    return u !== null && u >= 48 && u <= 57 ? (e.consume(u), c) : u === 93 ? (e.exit("citeText"), e.enter("citeSequence"), e.consume(u), p) : n(u);
  }
  function p(u) {
    return u !== 93 ? n(u) : (e.consume(u), e.exit("citeSequence"), e.exit("cite"), a);
  }
  function a(u) {
    return u === 40 ? n(u) : t(u);
  }
}
function Oe() {
  return {
    text: {
      91: je
      // '['字符的ASCII码
    }
  };
}
function Ye() {
  return {
    enter: {
      cite: Je
    },
    exit: {
      cite: Ke,
      citeText: Qe
    }
  };
}
function Je(e) {
  this.enter({
    type: "cite",
    value: ""
  }, e);
}
function Ke(e) {
  this.exit(e);
}
function Qe(e) {
  const t = this.stack[this.stack.length - 1];
  t.value = this.sliceSerialize(e);
}
function Ue() {
  return {
    handlers: {
      cite: We
    }
  };
}
function We(e) {
  return `[[${e.value}]]`;
}
const ft = function() {
  const e = this.data();
  function t(n, i) {
    (e[n] ? e[n] : e[n] = []).push(i);
  }
  t("micromarkExtensions", Oe()), t("fromMarkdownExtensions", Ye()), t("toMarkdownExtensions", Ue());
};
function y(e, t = []) {
  const [n, ...i] = t;
  return {
    type: "section",
    depth: e,
    heading: n,
    children: i
  };
}
function Xe(e, t) {
  const n = [];
  let i = [];
  for (const s of e)
    i.length === 0 ? s.type === "heading" && s.depth === t ? i.push(s) : n.push(s) : s.type === "heading" && s.depth === t ? (n.push(y(t, i)), i = [], i.push(s)) : s.type === "heading" && s.depth < t ? (n.push(y(t, i)), i = [], n.push(s)) : i.push(s);
  return i.length > 0 && n.push(y(t, i)), n;
}
const _t = function() {
  return (e) => {
    let t = e.children;
    for (let n = 6; n > 0; n--)
      t = Xe(t, n);
    e.children = t;
  };
}, Ze = {
  name: "teleport",
  tokenize: et
};
function et(e, t, n) {
  return i;
  function i(a) {
    return a !== 45 ? n(a) : (e.enter("teleport"), e.enter("teleportSequence"), e.consume(a), s);
  }
  function s(a) {
    return a !== 62 ? n(a) : (e.consume(a), c);
  }
  function c(a) {
    return a !== 91 ? n(a) : (e.consume(a), e.exit("teleportSequence"), e.enter("teleportText"), p);
  }
  function p(a) {
    return a !== null && (a >= 48 && a <= 57 || a >= 65 && a <= 90 || a >= 97 && a <= 122 || a === 95 || a === 45) ? (e.consume(a), p) : a === 93 ? (e.exit("teleportText"), e.enter("teleportSequence"), e.consume(a), e.exit("teleportSequence"), e.exit("teleport"), t) : n(a);
  }
}
function tt() {
  return {
    flow: {
      45: Ze
      // 在block content中支持'-'字符
    }
  };
}
function nt() {
  return {
    enter: {
      teleport: ot
    },
    exit: {
      teleport: rt,
      teleportText: it
    }
  };
}
function ot(e) {
  this.enter({
    type: "teleport",
    value: ""
  }, e);
}
function rt(e) {
  this.exit(e);
}
function it(e) {
  const t = this.stack[this.stack.length - 1];
  t.value = this.sliceSerialize(e);
}
function st() {
  return {
    handlers: {
      teleport: at
    }
  };
}
function at(e) {
  return `->[${e.value}]`;
}
const $t = function() {
  const e = this.data();
  function t(n, i) {
    (e[n] ? e[n] : e[n] = []).push(i);
  }
  t("micromarkExtensions", tt()), t("fromMarkdownExtensions", nt()), t("toMarkdownExtensions", st());
}, lt = { class: "remark-container" }, kt = /* @__PURE__ */ l({
  __name: "index",
  props: {
    markdown: {},
    allowDangerousHtml: { type: Boolean },
    components: {},
    plugins: {}
  },
  setup(e) {
    const t = e, n = m(() => Pe(t.markdown, t.plugins || [E, D])), i = m(() => (n.value.children || []).filter((s) => s.type === "definition" && s.identifier));
    return C("definitions", i), C("allowHtml", m(() => t.allowDangerousHtml)), (s, c) => (o(), r("div", lt, [
      n.value ? (o(), k(Ve, {
        key: 0,
        node: n.value,
        "custom-node-components": e.components
      }, null, 8, ["node", "custom-node-components"])) : _("", !0)
    ]));
  }
});
export {
  kt as VueRemark,
  Pe as parse,
  ft as remarkCite,
  gt as remarkGfm,
  At as remarkMath,
  _t as remarkSection,
  $t as remarkTeleport
};
