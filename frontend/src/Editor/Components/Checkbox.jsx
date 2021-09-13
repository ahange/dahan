import React from 'react';

export const Checkbox = function Checkbox({
  id,
  width,
  height,
  component,
  onComponentClick,
  currentState,
  onComponentOptionChanged,
  onEvent
}) {

  const label = component.definition.properties.label.value;
  const textColorProperty = component.definition.styles.textColor;
  const textColor = textColorProperty ? textColorProperty.value : '#000';

  function toggleValue(e) {
    const checked = e.target.checked;
    onComponentOptionChanged(component, 'value', checked);
    if (checked) {
      onEvent('onCheck', { component });
    } else {
      onEvent('onUnCheck', { component });
    }
  }

  return (
    <div style={{ width, height }} onClick={() => onComponentClick(id, component)}>
      <label className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="checkbox"
          onClick={(e) => {
            toggleValue(e);
          }}
        />
        <span className="form-check-label" style={{color: textColor}}>{label}</span>
      </label>
    </div>
  );
};
