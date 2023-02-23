"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactNativeSvg = _interopRequireWildcard(require("react-native-svg"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SVGRenderer = ({
  paths,
  height,
  width
}) => /*#__PURE__*/_react.default.createElement(_reactNativeSvg.default, {
  height: height,
  width: width
}, paths.map(({
  color,
  path,
  thickness,
  opacity,
  combine
}, i) => combine ? /*#__PURE__*/_react.default.createElement(SVGRendererPath, {
  key: i,
  path: path,
  color: color,
  thickness: thickness,
  opacity: opacity
}) : path.map((svgPath, j) => /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
  key: `${i}-${j}`,
  d: svgPath,
  fill: "none",
  stroke: color,
  strokeWidth: thickness,
  strokeLinecap: "round",
  opacity: opacity,
  strokeLinejoin: "round"
}))));

const SVGRendererPath = ({
  path,
  color,
  thickness,
  opacity
}) => {
  const memoizedPath = (0, _react.useMemo)(() => {
    var _path$join;

    return (_path$join = path === null || path === void 0 ? void 0 : path.join(' ')) !== null && _path$join !== void 0 ? _path$join : '';
  }, [path]);
  return /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
    d: memoizedPath,
    fill: "none",
    stroke: color,
    strokeWidth: thickness,
    strokeLinecap: "round",
    opacity: opacity,
    strokeLinejoin: "round"
  });
};

var _default = SVGRenderer;
exports.default = _default;
//# sourceMappingURL=SVGRenderer.js.map