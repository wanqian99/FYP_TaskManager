"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSVGPath = void 0;

var _simplifySvgPath = _interopRequireDefault(require("@luncheon/simplify-svg-path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createSVGPath = (points, tolerance, roundPoints) => {
  if (points.length > 1) {
    try {
      return (0, _simplifySvgPath.default)(points, {
        precision: roundPoints ? 0 : 5,
        tolerance
      });
    } catch (error) {
      console.log(error);
    }
  } else if (points.length === 1) {
    return `M${points[0][0]},${points[0][1]} L${points[0][0]},${points[0][1]}`;
  }

  return '';
};

exports.createSVGPath = createSVGPath;
//# sourceMappingURL=utils.js.map