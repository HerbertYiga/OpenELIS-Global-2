import React from "react";
import { FormattedMessage } from "react-intl";

const VirologySerologyTestingPage = ({ notebookId, data = {}, onChange, readOnly = false, required = false }) => {
  return (
    <div className="virology-serology-testing">
      <div className="page-header">
        <h3><FormattedMessage id="notebook.virology.page.serologyTesting.title" />{required && <span className="required-indicator"> *</span>}</h3>
        <p><FormattedMessage id="notebook.virology.page.serologyTesting.description" /></p>
      </div>
      <div className="placeholder-content"><p>Serology & antibody testing functionality will be implemented here.</p></div>
    </div>
  );
};

export default VirologySerologyTestingPage;