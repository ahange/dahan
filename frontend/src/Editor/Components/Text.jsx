import React from 'react';
import { resolve } from '@/_helpers/utils';

export const Text = function Text({ id, width, height, component, onComponentClick, currentState }) {

    const text = component.definition.properties.text.value;
    const color = component.definition.styles.textColor.value;

    let data = text;
    if(currentState) {

        const matchedParams  = text.match(/\{\{(.*?)\}\}/g);

        if (matchedParams) {
            for(const param of matchedParams) {
                const resolvedParam = resolve(param, currentState, '');
                console.log('resolved param', param, resolvedParam);
                data = data.replace(param, resolvedParam);
            }
        }

    }

    
    const computedStyles = { 
        color,
        width,
        height,
    }

    return (
        <span style={computedStyles} onClick={() => onComponentClick(id, component) }>
            {data}
        </span>
    );
};
