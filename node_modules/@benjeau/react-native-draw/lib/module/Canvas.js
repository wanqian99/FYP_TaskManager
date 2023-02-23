import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { DEFAULT_BRUSH_COLOR, DEFAULT_ERASER_SIZE, DEFAULT_OPACITY, DEFAULT_THICKNESS, DEFAULT_TOOL } from './constants';
import { DrawingTool } from './types';
import { createSVGPath } from './utils';
import SVGRenderer from './renderer/SVGRenderer';
import RendererHelper from './renderer/RendererHelper';
const {
  width: screenWidth,
  height: screenHeight
} = Dimensions.get('window');

/**
 * Generate SVG path string. Helper method for createSVGPath
 *
 * @param paths SVG path data
 * @param simplifyOptions Simplification options for the SVG drawing simplification
 * @returns SVG path strings
 */
const generateSVGPath = (path, simplifyOptions) => createSVGPath(path, simplifyOptions.simplifyPaths ? simplifyOptions.amount : 0, simplifyOptions.roundPoints);
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

const Canvas = /*#__PURE__*/forwardRef(({
  color = DEFAULT_BRUSH_COLOR,
  thickness = DEFAULT_THICKNESS,
  opacity = DEFAULT_OPACITY,
  initialPaths = [],
  style,
  height = screenHeight - 80,
  width = screenWidth,
  simplifyOptions = {},
  onPathsChange,
  eraserSize = DEFAULT_ERASER_SIZE,
  tool = DEFAULT_TOOL,
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
  const [paths, setPaths] = useState(generateSVGPaths(initialPaths, simplifyOptions));
  const [path, setPath] = useState([]);
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

  useImperativeHandle(ref, () => ({
    undo,
    clear,
    getPaths,
    addPath,
    getSvg
  }));
  useEffect(() => onPathsChange && onPathsChange(paths), [paths, onPathsChange]);
  const panGesture = Gesture.Pan().onChange(({
    x,
    y
  }) => {
    switch (tool) {
      case DrawingTool.Brush:
        addPointToPath(x, y);
        break;

      case DrawingTool.Eraser:
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
    if (tool === DrawingTool.Brush) {
      addPointToPath(x, y);
    }
  }).onEnd(() => {
    if (tool === DrawingTool.Brush) {
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
  return /*#__PURE__*/React.createElement(GestureHandlerRootView, {
    style: canvasContainerStyles
  }, /*#__PURE__*/React.createElement(Animated.View, null, /*#__PURE__*/React.createElement(GestureDetector, {
    gesture: panGesture
  }, /*#__PURE__*/React.createElement(View, null, /*#__PURE__*/React.createElement(RendererHelper, {
    currentColor: color,
    currentOpacity: opacity,
    currentPath: path,
    currentThickness: thickness,
    currentPathTolerance: simplifyOptions.simplifyCurrentPath ? simplifyOptions.amount : 0,
    roundPoints: simplifyOptions.roundPoints,
    paths: paths,
    height: height,
    width: width,
    Renderer: SVGRenderer
  })))));
});
const styles = StyleSheet.create({
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
export default Canvas;
//# sourceMappingURL=Canvas.js.map