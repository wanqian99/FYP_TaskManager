"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _utils = require("../utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const RendererHelper = ({
  currentPath,
  currentColor,
  currentThickness,
  currentOpacity,
  paths,
  height,
  width,
  roundPoints,
  currentPathTolerance,
  Renderer
}) => {
  const mergedPaths = (0, _react.useMemo)(() => [...paths, {
    color: currentColor,
    path: [(0, _utils.createSVGPath)(currentPath, currentPathTolerance, roundPoints)],
    thickness: currentThickness,
    opacity: currentOpacity,
    data: [currentPath]
  }], [currentColor, currentThickness, currentPath, currentOpacity, paths, currentPathTolerance, roundPoints]);
  return /*#__PURE__*/_react.default.createElement(Renderer, {
    height: height,
    width: width,
    paths: mergedPaths
  });
};

var _default = RendererHelper;
exports.default = _default;
//# sourceMappingURL=RendererHelper.js.map