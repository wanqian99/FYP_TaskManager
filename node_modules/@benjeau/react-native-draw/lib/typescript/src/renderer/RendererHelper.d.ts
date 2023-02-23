import React from 'react';
import type { PathDataType, PathType } from '../types';
export interface RendererProps {
    paths: PathType[];
    height: number;
    width: number;
}
interface RendererHelperProps {
    currentPath: PathDataType;
    currentColor: string;
    currentThickness: number;
    currentOpacity: number;
    paths: PathType[];
    height: number;
    width: number;
    roundPoints: boolean;
    currentPathTolerance: number;
    Renderer: React.FC<RendererProps>;
}
declare const RendererHelper: React.FC<RendererHelperProps>;
export default RendererHelper;
