import React from "react";
import { FormattedMessage } from "react-intl";

const VirologyMicroscopyStainingPage = ({ notebookId, data = {}, onChange, readOnly = false, required = false }) => {
  return (
    <div className="virology-microscopy-staining">
      <div className="page-header">
        <h3><FormattedMessage id="notebook.virology.page.microscopyStaining.title" />{required && <span className="required-indicator"> *</span>}</h3>
        <p><FormattedMessage id="notebook.virology.page.microscopyStaining.description" /></p>
      </div>
      <div className="placeholder-content"><p>Microscopy & staining functionality will be implemented here.</p></div>
    </div>
  );
};

export default VirologyMicroscopyStainingPage;