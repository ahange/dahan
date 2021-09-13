import React from 'react';

export const Text = ({ param, definition, onChange, paramType  }) => {

    const value = definition ? definition.value : '';

    return (
        <div className="field mb-2">
            <label class="form-label">{param.name}</label>
            <input type="text" onChange={(e) => onChange(param, 'value', e.target.value, paramType)} class="form-control text-field" name="" value={value} />
        </div>
    );
}
