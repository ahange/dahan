import React from 'react';
import usePopover from '../../_hooks/use-popover';
import { LeftSidebarItem } from './sidebar-item';
import { DataSourceManager } from '../DataSourceManager';
import { dataBaseSources, apiSources, DataSourceTypes } from '../DataSourceManager/DataSourceTypes';

export const LeftSidebarDataSources = ({ appId, darkMode, dataSources = [], dataSourcesChanged }) => {
  const [open, trigger, content] = usePopover(false);
  const [showDataSourceManagerModal, toggleDataSourceManagerModal] = React.useState(false);
  const [selectedDataSource, setSelectedDataSource] = React.useState(null);
  const [toggleOptions, setToggleOptions] = React.useState(false);

  const renderDataSource = (dataSource) => {
    const sourceMeta = DataSourceTypes.find((source) => source.kind === dataSource.kind);
    return (
      <tr
        role="button"
        key={sourceMeta.kind.toLowerCase()}
        onClick={() => {
          setSelectedDataSource(dataSource);
          toggleDataSourceManagerModal(true);
        }}
      >
        <td>
          <img
            src={`/assets/images/icons/editor/datasources/${sourceMeta.kind.toLowerCase()}.svg`}
            width="20"
            height="20"
          />{' '}
          {dataSource.name}
        </td>
      </tr>
    );
  };

  const renderBody = () => {
    if(toggleOptions) {
      return dataBaseSources.concat(apiSources)?.map((source) => renderDataSource(source))
    }

    return dataSources?.map((source) => renderDataSource(source))
  }

  return (
    <>
      <LeftSidebarItem tip="Add or edit datasources" {...trigger} icon="database" className="left-sidebar-item" />
      <div {...content} className={`card popover datasources-popover ${open ? 'show' : 'hide'}`}>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-vcenter table-nowrap">
              <tbody>{renderBody()}</tbody>
            </table>
            {dataSources?.length === 0 && (
              <center className="p-2 text-muted">
                You haven&apos;t added any datasources yet. <br />
              </center>
            )}
            <center>
              <button onClick={() => setToggleOptions(!toggleOptions)} className="btn btn-sm btn-outline-azure mt-3">
                { toggleOptions ? 'Cancel' : 'Add datasource' }
              </button>
            </center>
          </div>
        </div>
      </div>
      <DataSourceManager
        appId={appId}
        showDataSourceManagerModal={showDataSourceManagerModal}
        darkMode={darkMode}
        hideModal={() => {
          setSelectedDataSource(null);
          toggleDataSourceManagerModal(false);
        }}
        dataSourcesChanged={dataSourcesChanged}
        showDataSourceManagerModal={showDataSourceManagerModal}
        selectedDataSource={selectedDataSource}
      />
    </>
  );
};
