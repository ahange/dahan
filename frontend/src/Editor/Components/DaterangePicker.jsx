import React, { useState } from 'react';
import 'react-datetime/css/react-datetime.css';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { resolveReferences } from '@/_helpers/utils';

export const DaterangePicker = function DaterangePicker({
  id,
  width,
  height,
  component,
  onComponentClick,
  currentState,
  onComponentOptionChanged
}) {
  console.log('currentState', currentState);

  const startDateProp = component.definition.properties.startDate;
  const endDateProp = component.definition.properties.endDate;
  const formatProp = component.definition.properties.format;
  const widgetVisibility = component.definition.styles?.visibility?.value || true;

  const [focusedInput, setFocusedInput] = useState(null);
  const [startDate, setStartDate] = useState(startDateProp ? startDateProp.value : null);
  const [endDate, setEndDate] = useState(endDateProp ? endDateProp.value : null);

  let parsedWidgetVisibility = widgetVisibility;
  
  try {
    parsedWidgetVisibility = resolveReferences(parsedWidgetVisibility, currentState, []);
  } catch (err) { console.log(err); }

  function onDateChange(dates) {
    const start = dates.startDate;
    const end = dates.endDate;

    if (start) {
      onComponentOptionChanged(component, 'startDate', start.format(formatProp.value));
    }

    if (end) {
      onComponentOptionChanged(component, 'endDate', end.format(formatProp.value));
    }

    setStartDate(start);
    setEndDate(end);
  }

  function focusChanged(focus) {
    setFocusedInput(focus);
  }

  return (
    <div style={{ width, height, display:parsedWidgetVisibility ? '' : 'none' }} onClick={event => {event.stopPropagation(); onComponentClick(id, component)}}>
      <DateRangePicker
        startDate={startDate}
        startDateId="startDate"
        isOutsideRange={() => false}
        endDate={endDate}
        endDateId="endDate"
        onDatesChange={(dates) => onDateChange(dates)}
        onFocusChange={(focus) => focusChanged(focus)}
        focusedInput={focusedInput}
        hideKeyboardShortcutsPanel={true}
      />
    </div>
  );
};
