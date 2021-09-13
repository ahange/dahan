import React, { memo, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Box } from './Box';
import { Resizable } from "re-resizable";

const resizerClasses = {
    topRight: 'top-right',
    bottomRight: 'bottom-right',
    bottomLeft: 'bottom-left',
    topLeft: 'top-left'
}

const resizerStyles = {
    topRight: { width: '12px', height: '12px', right: '-6px', top: '-6px' },
    bottomRight: { width: '12px', height: '12px', right: '-6px', bottom: '-6px' },
    bottomLeft: { width: '12px', height: '12px', left: '-6px', bottom: '-6px' },
    topLeft: { width: '12px', height: '12px', left: '-6px', top: '-6px' }
}

function getStyles(left, top, isDragging) {
    const transform = `translate3d(${left}px, ${top}px, 0)`;
    return {
        position: 'absolute',
        transform,
        WebkitTransform: transform,
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    };
}

export const DraggableBox = function DraggableBox({ id, title, left, top, width, height, component, index, inCanvas, onEvent, onComponentClick, currentState, onComponentOptionChanged, onResizeStop  }) {

    const [isResizing, setResizing] = useState(false);

    // useEffect(() => {
    //     setBoxes(component);
    // }, []);

    console.log('Rendering draggable box');

    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.BOX,
        item: { id, left, top, width, height, title, component },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [id, left, top, height, width, title, component, index]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    const style = {
        display: "inline-block",
        alignItems: "center",
        justifyContent: "center",
        padding: '5px'
    };

    return (
        <div>
            {inCanvas ?
                <div style={getStyles(left, top, isDragging)}>
                    <Resizable
                        style={{...style}}
                        defaultSize={{
                        }}
                        className="resizer"
                        onResize={(e) => setResizing(true)}
                        handleClasses={resizerClasses}
                        handleStyles={resizerStyles}
                        onResizeStop={(e, direction, ref, d) => { 
                            setResizing(false);
                            onResizeStop(id, width, height, e, direction, ref, d);
                        }}
                        >
                        <div ref={drag} role="DraggableBox" style={isResizing ? { opacity: 0.5 } : { opacity: 1 }}>

                            <Box 
                                component={component} 
                                id={id} 
                                width={width}
                                height={height}
                                inCanvas={inCanvas} 
                                onEvent={onEvent}
                                onComponentOptionChanged={onComponentOptionChanged}
                                onComponentClick={onComponentClick} 
                                currentState={currentState} 
                            />
                            
                        </div>
                    </Resizable>
                </div>
            :
            <div ref={drag} role="DraggableBox">
                <Box 
                    component={component} 
                    id={id} 
                    inCanvas={inCanvas} 
                    onEvent={onEvent}
                    onComponentOptionChanged={onComponentOptionChanged}
                    onComponentClick={onComponentClick} 
                    currentState={currentState} 
                />
            </div>
            }
        </div>
        
            
       );
};
