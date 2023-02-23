"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _reactNativeGestureHandler = require("react-native-gesture-handler");

var _constants = require("./constants");

var _types = require("./types");

var _utils = require("./utils");

var _SVGRenderer = _interopRequireDefault(require("./renderer/SVGRenderer"));

var _RendererHelper = _interopRequireDefault(require("./renderer/RendererHelper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const {
  width: screenWidth,
  height: screenHeight
} = _reactNative.Dimensions.get('window');

/**
 * Generate SVG path string. Helper method for createSVGPath
 *
 * @param paths SVG path data
 * @param simplifyOptions Simplification options for the SVG drawing simplification
 * @returns SVG path strings
 */
const generateSVGPath = (path, simplifyOptions) => (0, _utils.createSVGPath)(path, simplifyOptions.simplifyPaths ? simplifyOptions.amount : 0, simplifyOptions.roundPoints);
/**
 * Generate multiple SVG path strings. If the path string is already defined, do not create a new one.
 *
 * @param paths SVG data paths
 * @param simplifyOptions Simplification options for the SVG drawing simplification
 * @returns An array of SVG path strings
 */


const generateSVGPaths = (paths, simplifyOptions) => paths.map(i => ({ ...i,
  path: i.path ? i.path : i.data.reduce((acc, data) => [...acc, generateSVGPath(data, simplifyOptions)], [])
}));

const Canvas = /*#__PURE__*/(0, _react.forwardRef)(({
  color = _constants.DEFAULT_BRUSH_COLOR,
  thickness = _constants.DEFAULT_THICKNESS,
  opacity = _constants.DEFAULT_OPACITY,
  initialPaths = [],
  style,
  height = screenHeight - 80,
  width = screenWidth,
  simplifyOptions = {},
  onPathsChange,
  eraserSize = _constants.DEFAULT_ERASER_SIZE,
  tool = _constants.DEFAULT_TOOL,
  combineWithLatestPath = false,
  enabled = true
}, ref) => {
  simplifyOptions = {
    simplifyPaths: true,
    simplifyCurrentPath: false,
    amount: 15,
    roundPoints: true,
    ...simplifyOptions
  };
  const [paths, setPaths] = (0, _react.useState)(generateSVGPaths(initialPaths, simplifyOptions));
  const [path, setPath] = (0, _react.useState)([]);
  const canvasContainerStyles = [styles.canvas, {
    height,
    width
  }, style];

  const addPointToPath = (x, y) => {
    setPath(prev => [...prev, [simplifyOptions.roundPoints ? Math.floor(x) : x, simplifyOptions.roundPoints ? Math.floor(y) : y]]);
  };

  const undo = () => {
    setPaths(list => list.reduce((acc, p, index) => {
      if (index === list.length - 1) {
        if (p.data.length > 1) {
          return [...acc, { ...p,
            data: p.data.slice(0, -1),
            path: p.path.slice(0, -1)
          }];
        }

        return acc;
      }

      return [...acc, p];
    }, []));
  };

  const clear = () => {
    setPaths([]);
    setPath([]);
  };

  const getPaths = () => paths;

  const addPath = newPath => setPaths(prev => [...prev, newPath]);

  const getSvg = () => {
    const serializePath = (d, stroke, strokeWidth, strokeOpacity) => `<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${strokeOpacity}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

    const separatePaths = p => p.path.reduce((acc, innerPath) => `${acc}${serializePath(innerPath, p.color, p.thickness, p.opacity)}`, '');

    const combinedPath = p => `${serializePath(p.path.join(' '), p.color, p.thickness, p.opacity)}`;

    const serializedPaths = paths.reduce((acc, p) => `${acc}${p.combine ? combinedPath(p) : separatePaths(p)}`, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${serializedPaths}</svg>`;
  };

  (0, _react.useImperativeHandle)(ref, () => ({
    undo,
    clear,
    getPaths,
    addPath,
    getSvg
  }));
  (0, _react.useEffect)(() => onPathsChange && onPathsChange(paths), [paths, onPathsChange]);

  const panGesture = _reactNativeGestureHandler.Gesture.Pan().onChange(({
    x,
    y
  }) => {
    switch (tool) {
      case _types.DrawingTool.Brush:
        addPointToPath(x, y);
        break;

      case _types.DrawingTool.Eraser:
        setPaths(prevPaths => prevPaths.reduce((acc, p) => {
          const filteredDataPaths = p.data.reduce((acc2, data, index) => {
            const closeToPath = data.some(([x1, y1]) => Math.abs(x1 - x) < p.thickness + eraserSize && Math.abs(y1 - y) < p.thickness + eraserSize); // If point close to path, don't include it

            if (closeToPath) {
              return acc2;
            }

            return {
              data: [...acc2.data, data],
              path: [...acc2.path, p.path[index]]
            };
          }, {
            data: [],
            path: []
          });

          if (filteredDataPaths.data.length > 0) {
            return [...acc, { ...p,
              ...filteredDataPaths
            }];
          }

          return acc;
        }, []));
        break;
    }
  }).onBegin(({
    x,
    y
  }) => {
    if (tool === _types.DrawingTool.Brush) {
      addPointToPath(x, y);
    }
  }).onEnd(() => {
    if (tool === _types.DrawingTool.Brush) {
      setPaths(prev => {
        const newSVGPath = generateSVGPath(path, simplifyOptions);

        if (prev.length === 0) {
          return [{
            color,
            path: [newSVGPath],
            data: [path],
            thickness,
            opacity,
            combine: combineWithLatestPath
          }];
        }

        const lastPath = prev[prev.length - 1]; // Check if the last path has the same properties

        if (lastPath.color === color && lastPath.thickness === thickness && lastPath.opacity === opacity) {
          lastPath.path = [...lastPath.path, newSVGPath];
          lastPath.data = [...lastPath.data, path];
          return [...prev.slice(0, -1), lastPath];
        }

        return [...prev, {
          color,
          path: [newSVGPath],
          data: [path],
          thickness,
          opacity,
          combine: combineWithLatestPath
        }];
      });
      setPath([]);
    }
  }).minPointers(1).minDistance(0).averageTouches(false).hitSlop({
    height,
    width,
    top: 0,
    left: 0
  }).shouldCancelWhenOutside(true).enabled(enabled);

  return /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureHandlerRootView, {
    style: canvasContainerStyles
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, null, /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
    gesture: panGesture
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, null, /*#__PURE__*/_react.default.createElement(_RendererHelper.default, {
    currentColor: color,
    currentOpacity: opacity,
    currentPath: path,
    currentThickness: thickness,
    currentPathTolerance: simplifyOptions.simplifyCurrentPath ? simplifyOptions.amount : 0,
    roundPoints: simplifyOptions.roundPoints,
    paths: paths,
    height: height,
    width: width,
    Renderer: _SVGRenderer.default
  })))));
});

const styles = _reactNative.StyleSheet.create({
  canvas: {
    backgroundColor: 'white'
  },
  canvasOverlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#000000'
  }
});

var _default = Canvas;
exports.default = _default;
//# sourceMappingURL=Canvas.js.map