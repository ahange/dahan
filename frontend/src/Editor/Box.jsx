import React, { memo } from 'react';
import { Button } from './Components/Button';
import { Image } from './Components/Image';
import { Text } from './Components/Text';
import { Table } from './Components/Table';
import { TextInput } from './Components/TextInput';
import { TextArea } from './Components/TextArea';
import { Container } from './Components/Container';
import { RichTextEditor } from './Components/RichTextEditor';
import { DropDown } from './Components/DropDown';
import { Checkbox } from './Components/Checkbox';
import { Datepicker } from './Components/Datepicker';
import { DaterangePicker } from './Components/DaterangePicker';
import { Multiselect } from './Components/Multiselect';

const AllComponents = {
    Button,
    Image,
    Text,
    TextInput,
    Table,
    TextArea,
    Container,
    RichTextEditor,
    DropDown,
    Checkbox,
    Datepicker,
    DaterangePicker,
    Multiselect
}


export const Box = function Box({ id, mode, width, height, yellow, preview, component, inCanvas, onComponentClick, onEvent, currentState, onComponentOptionChanged, onComponentOptionsChanged, paramUpdated, changeCanDrag }) {
    const backgroundColor = yellow ? 'yellow' : '';

    let styles = {
        cursor: mode === "edit" ? 'move' : '',
    };

    console.log('rendering box', component);
    console.log('width, height', width, height);

    if(inCanvas) {
        styles = {
            ...styles,
        }
    }

    const ComponentToRender = AllComponents[component.component];

    return (<div style={{ ...styles, backgroundColor }} role={preview ? 'BoxPreview' : 'Box'}>

            {inCanvas ? 
                <ComponentToRender 
                    onComponentClick={onComponentClick}
                    onComponentOptionChanged={onComponentOptionChanged}
                    currentState={currentState}
                    onEvent={onEvent}
                    id={id}
                    paramUpdated={paramUpdated}
                    width={width}
                    changeCanDrag={changeCanDrag}
                    onComponentOptionsChanged={onComponentOptionsChanged}
                    height={height}
                    component={component}>
                </ComponentToRender>
            :
                <div className="row p-1 m-1" style={{cursor: 'move'}}>
                    <div className="col-auto component-image-holder p-3">
                           <div style={{width: '20px', height: '20px', backgroundSize: 'contain', backgroundImage: `url(${component.icon})`}}>
                           </div>
                    </div>
                    <div className="col">
                        <span className="component-title" >{component.displayName}</span>
                        <small className="component-description">{component.description}</small>
                    </div>
                </div>
            }
		</div>);
};
