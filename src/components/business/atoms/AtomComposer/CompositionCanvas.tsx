// src/components/business/atoms/AtomComposer/CompositionCanvas.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline';
import { DragDropCanvas, type AtomNode, type Connection } from '../../features/DragAndDrop';
import { classNames } from '../../../utils/dom/classNames';

interface CompositionCanvasProps {
  atoms: AtomNode[];
  connections: Connection[];
  onAtomsChange: (atoms: AtomNode[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  selectedAtomId?: string | null;
  onAtomSelect: (atomId: string | null) => void;
  readOnly?: boolean;
  className?: string;
}

export const CompositionCanvas: React.FC<CompositionCanvasProps> = ({
  atoms,
  connections,
  onAtomsChange,
  onConnectionsChange,
  selectedAtomId,
  onAtomSelect,
  readOnly = false,
  className = ''
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const minZoom = 0.25;
  const maxZoom = 2;

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(maxZoom, prev * 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(minZoom, prev / 1.2));
  }, []);

  const handleFitToView = useCallback(() => {
    if (atoms.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate bounding box of all atoms
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    atoms.forEach(atom => {
      minX = Math.min(minX, atom.position.x);
      minY = Math.min(minY, atom.position.y);
      maxX = Math.max(maxX, atom.position.x + 200); // Atom width
      maxY = Math.max(maxY, atom.position.y + 100); // Atom height
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const scaleX = (canvasRect.width * 0.8) / contentWidth;
    const scaleY = (canvasRect.height * 0.8) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, maxZoom);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const newPanX = (canvasRect.width / 2) - (centerX * newZoom);
    const newPanY = (canvasRect.height / 2) - (centerY * newZoom);
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [atoms]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) { // Middle click or Ctrl+click
      event.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const oldZoom = zoom;
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, oldZoom * zoomFactor));
      
      if (newZoom !== oldZoom) {
        const zoomChange = newZoom - oldZoom;
        const newPanX = pan.x - (mouseX - pan.x) * (zoomChange / oldZoom);
        const newPanY = pan.y - (mouseY - pan.y) * (zoomChange / oldZoom);
        
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }
    }
  }, [zoom, pan]);

  // Reset pan when panning stops
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    
    if (isPanning) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isPanning]);

  const transformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: '0 0'
  };

  return (
    <div className={classNames('relative flex flex-col h-full', className)}>
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={handleZoomIn}
              disabled={zoom >= maxZoom}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleZoomOut}
              disabled={zoom <= minZoom}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleFitToView}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              title="Fit to View"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zoom Level Indicator */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Mini Map */}
      {atoms.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-2">
            <div className="w-32 h-24 bg-slate-50 dark:bg-slate-700 rounded relative overflow-hidden">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                Mini Map
              </div>
              <ViewfinderCircleIcon className="w-4 h-4 text-slate-400 mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {/* Transformed Canvas Content */}
        <div
          className="w-full h-full origin-top-left transition-transform duration-100"
          style={transformStyle}
        >
          <DragDropCanvas
            atoms={atoms}
            connections={connections}
            onAtomsChange={onAtomsChange}
            onConnectionsChange={onConnectionsChange}
            onAtomSelect={onAtomSelect}
            selectedAtomId={selectedAtomId}
            readOnly={readOnly}
            className="w-[200%] h-[200%]" // Provide extra space for dragging
          />
        </div>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
          <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
            <div>Atoms: {atoms.length}</div>
            <div>Connections: {connections.length}</div>
            {selectedAtomId && <div>Selected: 1</div>}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {atoms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ViewfinderCircleIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Empty Canvas
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start building your composition by dragging atoms from the palette on the right.
            </p>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p>💡 <strong>Tips:</strong></p>
              <p>• Ctrl+Scroll to zoom</p>
              <p>• Middle-click to pan</p>
              <p>• Connect atoms by dragging between them</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Performance Warning */}
      {atoms.length > 50 && (
        <div className="absolute bottom-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 max-w-xs"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                ⚠️
              </div>
              <div className="ml-2">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Performance Notice
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Large compositions may impact performance. Consider grouping atoms.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};