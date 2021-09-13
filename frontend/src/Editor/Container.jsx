import React, { useCallback, useState, useEffect } from 'react';
import { useDrop, useDragLayer } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { DraggableBox } from './DraggableBox';
import { snapToGrid as doSnapToGrid } from './snapToGrid';
import update from 'immutability-helper';
import { componentTypes } from './Components/components';
import {computeComponentName } from '@/_helpers/utils';

const styles = {
    width: 1290,
    height: 1200,
    position: 'absolute',
};

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export const Container = ({ 
        mode, 
        snapToGrid, 
        onComponentClick, 
        onEvent, 
        appDefinition, 
        appDefinitionChanged, 
        currentState, 
        onComponentOptionChanged, 
        onComponentOptionsChanged,
        appLoading
    }) => {

    const components = appDefinition.components || [];

    const [boxes, setBoxes] = useState(components);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        setBoxes(components);
    }, [components]);

    const moveBox = useCallback((id, left, top) => {
        setBoxes(update(boxes, {
            [id]: {
                $merge: { left, top },
            },
        }));
        console.log('new boxes - 1', boxes);
    }, [boxes]);

    useEffect(() => {
        console.log('new boxes - 2', boxes);
        appDefinitionChanged({...appDefinition, components: boxes});
    }, [boxes]);

    const { draggingState} = useDragLayer((monitor) => ({
        draggingState: monitor.isDragging(),
    }));

    useEffect(() => {
        setIsDragging(draggingState);
    }, [draggingState]);

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.BOX,
        drop(item, monitor) {

            if(item.left === undefined || item.top === undefined) {
                item.left = 20;
                item.top = 60;
            }

            let componentData = {};
            let componentMeta = {};
            let id = item.id;

            const delta = monitor.getDifferenceFromInitialOffset();

            let left = 0;
            let top = 0;

            // Component already exists and this is just a reposition event
            if(id) {
                componentData = item.component;
                left = Math.round(item.left + delta.x);
                top = Math.round(item.top + delta.y);
            } else {
                //  This is a new component 
                componentMeta = componentTypes.find(component => component.component === item.component.component);
                console.log('adding new component');
                componentData = JSON.parse(JSON.stringify(componentMeta));
                componentData.name = computeComponentName(componentData.component, boxes);

                const canvasBoundingRect = document.getElementsByClassName('canvas-area')[0].getBoundingClientRect();
                const offsetFromTopOfWindow = canvasBoundingRect.y - 56;
                const offsetFromLeftOfWindow = canvasBoundingRect.x;

                left = Math.round(monitor.getSourceClientOffset().x - offsetFromLeftOfWindow);
                top = Math.round(monitor.getSourceClientOffset().y - 56 - offsetFromTopOfWindow);

                id = uuidv4();
            }

            if (snapToGrid) {
                [left, top] = doSnapToGrid(left, top);
            }

            setBoxes({
                ...boxes, 
                [id]: { 
                    top: top, 
                    left: left,
                    width: item.width > 0 ? item.width : componentMeta.defaultSize.width,
                    height: item.height > 0 ? item.height: componentMeta.defaultSize.height,
                    component: componentData
                }
            })

            
            return undefined;
        },
    }), [moveBox]);

    function onResizeStop(id, width, height, e, direction, ref, d) {
        const delta_width = d.width;
        const dela_height = d.height;
        
        setBoxes(update(boxes, {
            [id]: {
                $merge: { width: delta_width + width, height: dela_height + height }
            },
        }));
    }

    function paramUpdated(id, param, value) {
        if(Object.keys(value).length > 0) {
             setBoxes(update(boxes, {
                [id]: {
                    $merge: { 
                        component: {
                            ...boxes[id].component,
                            definition: {
                                ...boxes[id].component.definition,
                                properties: {
                                    ...boxes[id].component.definition.properties,
                                    [param]: value
                                }
                            }
                        }
                    } 
                },
            }));
        }
    }

    return (<div ref={drop} style={styles} className={`real-canvas ${isDragging || isResizing ? ' show-grid' : ''}`}>
			{Object.keys(boxes).map((key) => (<DraggableBox 
                onComponentClick={onComponentClick} 
                onEvent={onEvent}
                onComponentOptionChanged={onComponentOptionChanged}
                onComponentOptionsChanged={onComponentOptionsChanged}
                key={key} 
                currentState={currentState}
                onResizeStop={onResizeStop}
                paramUpdated={paramUpdated}
                id={key} {...boxes[key]} 
                mode={mode}
                resizingStatusChanged={(isResizing) => setIsResizing(isResizing)}
                inCanvas={true} />
            ))}

            {(Object.keys(boxes).length == 0 && !appLoading && !isDragging) && 
                <div className="mx-auto mt-5 w-50 p-5 bg-light no-components-box">
                    <center>You haven't added any components yet. Drag components from the right sidebar and drop here.</center>
                </div>
            }
            {appLoading && 
                <div className="mx-auto mt-5 w-50 p-5">
                    <center>
                        <div class="progress progress-sm w-50">
                            <div class="progress-bar progress-bar-indeterminate"></div>
                        </div>
                    </center>
                </div>
            }
		</div>);
};
