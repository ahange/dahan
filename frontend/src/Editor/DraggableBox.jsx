import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Box } from './Box';
import { Resizable } from 're-resizable';
import { ConfigHandle } from './ConfigHandle';
import { Rnd } from "react-rnd";

const resizerClasses = {
  topRight: 'top-right',
  bottomRight: 'bottom-right',
  bottomLeft: 'bottom-left',
  topLeft: 'top-left'
};

const resizerStyles = {
  topRight: {
    width: '12px', height: '12px', right: '-6px', top: '-6px'
  },
  bottomRight: {
    width: '12px', height: '12px', right: '-6px', bottom: '-6px'
  },
  bottomLeft: {
    width: '12px', height: '12px', left: '-6px', bottom: '-6px'
  },
  topLeft: {
    width: '12px', height: '12px', left: '-6px', top: '-6px'
  }
};

function getStyles(left, top, isDragging, component) {
  const transform = `translate3d(${left}px, ${top}px, 0)`;
  return {
    position: 'absolute',
    // transform,
    // WebkitTransform: transform,
    zIndex: ['DropDown', 'Datepicker', 'DaterangePicker'].includes(component.component) ? 2 : 1,
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0 : 1,
    height: isDragging ? 0 : ''
  };
}

export const DraggableBox = function DraggableBox({
  id,
  mode,
  title,
  left,
  top,
  width,
  height,
  parent,
  component,
  index,
  inCanvas,
  onEvent,
  onComponentClick,
  currentState,
  onComponentOptionChanged,
  onComponentOptionsChanged,
  onResizeStop,
  paramUpdated,
  resizingStatusChanged,
  zoomLevel,
  containerProps,
  configHandleClicked,
  removeComponent
}) {
  const [isResizing, setResizing] = useState(false);
  const [canDrag, setCanDrag] = useState(true);
  const [mouseOver, setMouseOver] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: {
        id, left, top, width, height, title, component, zoomLevel, parent
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    [id, left, top, height, width, title, component, index, zoomLevel, parent]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [isDragging]);

  useEffect(() => {
    if (resizingStatusChanged) {
      resizingStatusChanged(isResizing);
    }
  }, [isResizing]);

  const style = {
    display: 'inline-block',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px'
  };

  let refProps = {};

  if (mode === 'edit' && canDrag) {
    refProps = {
      ref: drag
    };
  }

  function changeCanDrag(newState) {
    setCanDrag(newState);
  }

  return (
    <div>
      {inCanvas ? (
        <div 
          style={getStyles(left, top, isDragging, component)} 
          className="draggable-box"
          onMouseOver={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
        >
          
          <Rnd
            style={{ ...style }}
            size={{ width: width + 6,  height: height + 6 }}
            position={{ x: left, y: top }}
            defaultSize={{}}
            className={`resizer ${mouseOver ? 'resizer-active' : ''}`}
            onResize={() => setResizing(true)}
            resizeHandleClasses={mouseOver ? resizerClasses : {}}
            resizeHandleStyles={resizerStyles}
            disableDragging={true}
            enableResizing={mode === 'edit'}
            onResizeStop={(e, direction, ref, d, position) => {
              setResizing(false);
              onResizeStop(id, e, direction, ref, d, position);
            }}
          >
            <div ref={preview} role="DraggableBox" style={isResizing ? { opacity: 0.5 } : { opacity: 1 }}>
            {mode === 'edit' && mouseOver && 
            <ConfigHandle 
              id={id} 
              removeComponent={removeComponent}
              dragRef={refProps.ref}
              component={component}
              configHandleClicked={(id, component) => configHandleClicked(id, component)}
            /> 
          }
              <Box
                component={component}
                id={id}
                width={width}
                mode={mode}
                height={height}
                changeCanDrag={changeCanDrag}
                inCanvas={inCanvas}
                paramUpdated={paramUpdated}
                onEvent={onEvent}
                onComponentOptionChanged={onComponentOptionChanged}
                onComponentOptionsChanged={onComponentOptionsChanged}
                onComponentClick={onComponentClick}
                currentState={currentState}
                containerProps={containerProps}
              />
            </div>
          </Rnd>
        </div>
      ) : (
        <div ref={drag} role="DraggableBox" className="draggable-box">
          <Box
            component={component}
            id={id}
            mode={mode}
            inCanvas={inCanvas}
            onEvent={onEvent}
            paramUpdated={paramUpdated}
            onComponentOptionChanged={onComponentOptionChanged}
            onComponentOptionsChanged={onComponentOptionsChanged}
            onComponentClick={onComponentClick}
            currentState={currentState}
          />
        </div>
      )}
    </div>
  );
};
