import React, { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

const SVGRenderer = ({
  paths,
  height,
  width
}) => /*#__PURE__*/React.createElement(Svg, {
  height: height,
  width: width
}, paths.map(({
  color,
  path,
  thickness,
  opacity,
  combine
}, i) => combine ? /*#__PURE__*/React.createElement(SVGRendererPath, {
  key: i,
  path: path,
  color: color,
  thickness: thickness,
  opacity: opacity
}) : path.map((svgPath, j) => /*#__PURE__*/React.createElement(Path, {
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
  const memoizedPath = useMemo(() => {
    var _path$join;

    return (_path$join = path === null || path === void 0 ? void 0 : path.join(' ')) !== null && _path$join !== void 0 ? _path$join : '';
  }, [path]);
  return /*#__PURE__*/React.createElement(Path, {
    d: memoizedPath,
    fill: "none",
    stroke: color,
    strokeWidth: thickness,
    strokeLinecap: "round",
    opacity: opacity,
    strokeLinejoin: "round"
  });
};

export default SVGRenderer;
//# sourceMappingURL=SVGRenderer.js.map