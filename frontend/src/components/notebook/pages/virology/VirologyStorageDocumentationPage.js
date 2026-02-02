import React from "react";
import { FormattedMessage } from "react-intl";

const VirologyStorageDocumentationPage = ({ notebookId, data = {}, onChange, readOnly = false, required = false }) => {
  return (
    <div className="virology-storage-documentation">
      <div className="page-header">
        <h3><FormattedMessage id="notebook.virology.page.storageDocumentation.title" />{required && <span className="required-indicator"> *</span>}</h3>
        <p><FormattedMessage id="notebook.virology.page.storageDocumentation.description" /></p>
      </div>
      <div className="placeholder-content"><p>Storage & documentation functionality will be implemented here.</p></div>
    </div>
  );
};

export default VirologyStorageDocumentationPage;