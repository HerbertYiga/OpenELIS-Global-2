import React from "react";
import { FormattedMessage } from "react-intl";

const VirologyQualityControlPage = ({ notebookId, data = {}, onChange, readOnly = false, required = false }) => {
  return (
    <div className="virology-quality-control">
      <div className="page-header">
        <h3><FormattedMessage id="notebook.virology.page.qualityControl.title" />{required && <span className="required-indicator"> *</span>}</h3>
        <p><FormattedMessage id="notebook.virology.page.qualityControl.description" /></p>
      </div>
      <div className="placeholder-content"><p>Quality control & validation functionality will be implemented here.</p></div>
    </div>
  );
};

export default VirologyQualityControlPage;