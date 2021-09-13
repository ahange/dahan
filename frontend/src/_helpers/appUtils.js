import React from 'react';
import { toast } from 'react-toastify';
import { getDynamicVariables, resolveReferences } from '@/_helpers/utils';
import { dataqueryService } from '@/_services';
import _ from 'lodash';
import moment from 'moment';
import Tooltip from 'react-bootstrap/Tooltip';
import { history } from '@/_helpers';

export function setStateAsync(_ref, state) {
  return new Promise((resolve) => {
    _ref.setState(state, resolve);
  });
}

export function onComponentOptionsChanged(_ref, component, options) {
  const componentName = component.name;
  const components = _ref.state.currentState.components;
  let componentData = components[componentName];
  componentData = componentData || { };

  for (const option of options) {
    componentData[option[0]] = option[1];
  }

  return setStateAsync(_ref, {
    currentState: { ..._ref.state.currentState, components: { ...components, [componentName]: componentData } }
  });
}

export function onComponentOptionChanged(_ref, component, option_name, value) {
  const componentName = component.name;
  const components = _ref.state.currentState.components;
  let componentData = components[componentName];
  componentData = componentData || { };
  console.log('option_name', option_name)
  console.log('im', componentData[option_name])
  console.log('2im', componentData)
  componentData[option_name] = value;

  return setStateAsync(_ref, {
    currentState: { ..._ref.state.currentState, components: { ...components, [componentName]: componentData } }
  });
}

export function fetchOAuthToken(authUrl, dataSourceId) {
  localStorage.setItem('sourceWaitingForOAuth', dataSourceId);
  window.open(authUrl);
}

export function runTransformation(_ref, rawData, transformation) {
  const data = rawData;
  const evalFunction = Function(['data', 'moment', '_', 'currentState'], transformation);
  let result = [];

  try {
    result = evalFunction(data, moment, _, _ref.state.currentState);
  } catch (err) {
    toast.error(err.message, { hideProgressBar: true });
  }

  return result;
}

export function onComponentClick(_ref, id, component, mode = 'edit') {
  const onClickEvent = component.definition.events.onClick;
  executeAction(_ref, onClickEvent, mode);
}

export function onQueryConfirm(_ref, queryConfirmationData) {
  _ref.setState({
    showQueryConfirmation: false
  });
  runQuery(_ref, queryConfirmationData.queryId, queryConfirmationData.queryName, true);
}

export function onQueryCancel(_ref) {
  _ref.setState({
    showQueryConfirmation: false
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { hideProgressBar: true, autoClose: 3000 });
  } catch (err) {
    console.log('Failed to copy!', err);
  }
};

function executeAction(_ref, event, mode) {
  if (event) {
    if (event.actionId === 'show-alert') {
      const message = resolveReferences(event.options.message, _ref.state.currentState);
      toast(message, { hideProgressBar: true });
    }

    if (event.actionId === 'open-webpage') {
      const url = resolveReferences(event.options.url, _ref.state.currentState);
      window.open(url, '_blank');
    }

    if (event.actionId === 'go-to-app') {
      const slug = resolveReferences(event.options.slug, _ref.state.currentState);

      const url = `/applications/${slug}`;

      if(mode === 'view') {
        _ref.props.history.push(url);
      } else {
        if(confirm("The app will be opened in a new tab as the action is triggered from the editor.")) {
          window.open(url, '_blank');
        }
      }
    }

    if (event.actionId === 'run-query') {
      const { queryId, queryName } = event.options;
      return runQuery(_ref, queryId, queryName);
    }

    if (event.actionId === 'show-modal') {
      const modalId = event.options.modal;
      const modalMeta = _ref.state.appDefinition.components[modalId];

      const newState = {
        currentState: { 
          ..._ref.state.currentState,
          components: {
            ..._ref.state.currentState.components,
            [modalMeta.component.name]: {
              ..._ref.state.currentState.components[modalMeta.component.name],
              show: true
            }
          }
        }
      }

      _ref.setState(newState)
    }

    if (event.actionId === 'copy-to-clipboard') {
      const contentToCopy = resolveReferences(event.options.contentToCopy, _ref.state.currentState);
      copyToClipboard(contentToCopy);
    }
  }
}

export function onEvent(_ref, eventName, options, mode = 'edit') {
  let _self = _ref;
  console.log('Event: ', eventName);

  if (eventName === 'onRowClicked') {
    const { component, data } = options;
    const event = component.definition.events[eventName];
    _self.setState({
      currentState: {
        ..._self.state.currentState,
        components: {
          ..._self.state.currentState.components,
          [component.name]: {
            ..._self.state.currentState.components[component.name],
            selectedRow: data
          }
        }
      }
    }, () => {
      if (event.actionId) {
        executeAction(_self, event, mode);
      }
    });
  }

  if (eventName === 'onTableActionButtonClicked') {
    const { component, data, action } = options;
    const event = action.onClick;

    _self.setState({
      currentState: {
        ..._self.state.currentState,
        components: {
          ..._self.state.currentState.components,
          [component.name]: {
            ..._self.state.currentState.components[component.name],
            selectedRow: data
          }
        }
      }
    }, () => {
      if(event) {
        if (event.actionId) {
          executeAction(_self, event, mode);
        }
      } else { 
        console.log('No action is associated with this event');
      }
    });
  }

  if (eventName === 'onCheck' || eventName === 'onUnCheck') {
    const { component } = options;
    const event = (eventName === 'onCheck') ? component.definition.events.onCheck : component.definition.events.onUnCheck;

    if (event.actionId) {
      executeAction(_self, event, mode);
    }
  }

  if (['onPageChanged', 'onSearch', 'onSelectionChange'].includes(eventName)) {
    const { component } = options;
    const event = component.definition.events[eventName];

    if (event.actionId) {
      executeAction(_self, event, mode);
    }
  }

  if (['onBoundsChange', 'onCreateMarker', 'onMarkerClick'].includes(eventName)) {
    const { component } = options;
    const event = component.definition.events[eventName];

    if (event.actionId) {
      executeAction(_self, event, mode);
    }
  }

  if (eventName === 'onBulkUpdate') {
    return new Promise(function (resolve, reject) {
      onComponentOptionChanged(_self, options.component, 'isSavingChanges', true);
      executeAction(_self, { actionId: 'run-query', ...options.component.definition.events.onBulkUpdate }, mode).then(() => {
        onComponentOptionChanged(_self, options.component, 'isSavingChanges', false);
        resolve();
      });
    });
  }
}

function getQueryVariables(options, state) { 

  let queryVariables = {};

  if( typeof options === 'string' ) {
    const dynamicVariables = getDynamicVariables(options) || [];
    dynamicVariables.forEach((variable) => { 
      queryVariables[variable] = resolveReferences(variable, state);
    });
  } else if(Array.isArray(options)) { 
    options.forEach((element) => { 
      _.merge(queryVariables, getQueryVariables(element, state))
    })
  } else if(typeof options ==="object") {
    Object.keys(options).forEach((key) => {
      _.merge(queryVariables, getQueryVariables(options[key], state))
    })
  }

  return queryVariables;
}

export function previewQuery(_ref, query) {
  const options = getQueryVariables(query.options, _ref.props.currentState);

  _ref.setState({ previewLoading: true });

  return new Promise(function (resolve, reject) {
    dataqueryService.preview(query, options).then(data => {
      
      let finalData = data.data;

      if (query.options.enableTransformation) {
        finalData = runTransformation(_ref, finalData, query.options.transformation);
      }

      _ref.setState({ previewLoading: false, queryPreviewData: finalData });

      if(data.status === 'failed') {
        toast.error(`${data.message}: ${data.description}`, { position: 'bottom-center', hideProgressBar: true, autoClose: 10000 });
      } else { 
        if (data.status === 'needs_oauth') {
          const url = data.data.auth_url; // Backend generates and return sthe auth url
          fetchOAuthToken(url, query.data_source_id);
        }
        if(data.status === 'ok') {
          toast.info(`Query completed.`, {
            hideProgressBar: true,
            position: 'bottom-center',
          });
        }
      }

      resolve();
    }).catch(({ error, data } ) => {
      _ref.setState({ previewLoading: false, queryPreviewData: data });
      toast.error(error, { hideProgressBar: true, autoClose: 3000 });
      reject( { error, data });
    });;
  });
}

export function runQuery(_ref, queryId, queryName, confirmed = undefined) {
  const query = _ref.state.app.data_queries.find(query => query.id === queryId);
  let dataQuery = {};

  if (query) {
    dataQuery = JSON.parse(JSON.stringify(query));
  } else {
    toast.error('No query has been associated with the action.', { hideProgressBar: true, autoClose: 3000 });
    return;
  }

  const options = getQueryVariables(dataQuery.options, _ref.state.currentState);

  if (options.requestConfirmation) {
    if (confirmed === undefined) {
      _ref.setState({
        showQueryConfirmation: true,
        queryConfirmationData: {
          queryId, queryName
        }
      });
      return;
    }
  }

  const newState = {
    ..._ref.state.currentState,
    queries: {
      ..._ref.state.currentState.queries,
      [queryName]: {
        ..._ref.state.currentState.queries[queryName],
        isLoading: true,
        data: [],
        rawData: []
      }
    }
  };

  let _self = _ref;

  return new Promise(function (resolve, reject) {
    _self.setState({ currentState: newState }, () => {
      dataqueryService.run(queryId, options).then(data => {
        resolve();

        if (data.status === 'needs_oauth') {
          const url = data.data.auth_url; // Backend generates and return sthe auth url
          fetchOAuthToken(url, dataQuery.data_source_id);
        }

        if (data.status === 'failed') {
          toast.error(data.error.message, { hideProgressBar: true, autoClose: 3000 });
        }

        let rawData = data.data;
        let finalData = data.data;

        if (dataQuery.options.enableTransformation) {
          finalData = runTransformation(_self, rawData, dataQuery.options.transformation);
        }

        if (dataQuery.options.showSuccessNotification) {
          const notificationDuration = dataQuery.options.notificationDuration || 5;
          toast.success(dataQuery.options.successMessage, { hideProgressBar: true, autoClose: notificationDuration * 1000 });
        }

        _self.setState({
          currentState: {
            ..._self.state.currentState,
            queries: {
              ..._self.state.currentState.queries,
              [queryName]: {
                ..._self.state.currentState.queries[queryName],
                data: finalData,
                rawData,
                isLoading: false
              }
            }
          }
        });
      }).catch(( { error } ) => {
        toast.error(error, { hideProgressBar: true, autoClose: 3000 });
        _self.setState({
          currentState: {
            ..._self.state.currentState,
            queries: {
              ..._self.state.currentState.queries,
              [queryName]: {
                isLoading: false
              }
            }
          }
        });
      });
    });
  });
}

export function renderTooltip({props, text}) {
  return <Tooltip id="button-tooltip" {...props}>
    {text}
  </Tooltip>
};
