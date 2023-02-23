import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { DrawingTool, PathType } from './types';
export interface CanvasProps {
    /**
     * Color of the brush strokes
     * @default DEFAULT_BRUSH_COLOR
     */
    color?: string;
    /**
     * Thickness of the brush strokes
     * @default DEFAULT_THICKNESS
     */
    thickness?: number;
    /**
     * Opacity of the brush strokes
     * @default DEFAULT_OPACITY
     */
    opacity?: number;
    /**
     * Paths to be already drawn
     * @default []
     */
    initialPaths?: PathType[];
    /**
     * Height of the canvas
     */
    height?: number;
    /**
     * Width of the canvas
     */
    width?: number;
    /**
     * Override the style of the container of the canvas
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Callback function when paths change
     */
    onPathsChange?: (paths: PathType[]) => any;
    /**
     * SVG simplification options
     */
    simplifyOptions?: SimplifyOptions;
    /**
     * Width of eraser (to compensate for path simplification)
     * @default DEFAULT_ERASER_SIZE
     */
    eraserSize?: number;
    /**
     * Initial tool of the canvas
     * @default DEFAULT_TOOL
     */
    tool?: DrawingTool;
    /**
     * Combine current path with the last path if it's the same color,
     * thickness, and opacity.
     *
     * **Note**: changing this value while drawing will only be effective
     * on the next change to opacity, thickness, or color change
     * @default false
     */
    combineWithLatestPath?: boolean;
    /**
     * Allows for the canvas to be drawn on, put to false if you want to disable/lock
     * the canvas
     * @default true
     */
    enabled?: boolean;
}
export interface SimplifyOptions {
    /**
     * Enable SVG path simplification on paths, except the one currently being drawn
     */
    simplifyPaths?: boolean;
    /**
     * Enable SVG path simplification on the stroke being drawn
     */
    simplifyCurrentPath?: boolean;
    /**
     * Amount of simplification to apply
     */
    amount?: number;
    /**
     * Ignore fractional part in the points. Improves performance
     */
    roundPoints?: boolean;
}
export interface CanvasRef {
    /**
     * Undo last brush stroke
     */
    undo: () => void;
    /**
     * Removes all brush strokes
     */
    clear: () => void;
    /**
     * Get brush strokes data
     */
    getPaths: () => PathType[];
    /**
     * Append a path to the current drawing paths
     * @param path Path to append/draw
     */
    addPath: (path: PathType) => void;
    /**
     * Get SVG path string of the drawing
     */
    getSvg: () => string;
}
declare const Canvas: React.ForwardRefExoticComponent<CanvasProps & React.RefAttributes<CanvasRef>>;
export default Canvas;
