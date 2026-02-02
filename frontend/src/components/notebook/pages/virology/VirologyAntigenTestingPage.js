import React from "react";
import { FormattedMessage } from "react-intl";

const VirologyAntigenTestingPage = ({ notebookId, data = {}, onChange, readOnly = false, required = false }) => {
  return (
    <div className="virology-antigen-testing">
      <div className="page-header">
        <h3>
          <FormattedMessage id="notebook.virology.page.antigenTesting.title" />
          {required && <span className="required-indicator"> *</span>}
        </h3>
        <p><FormattedMessage id="notebook.virology.page.antigenTesting.description" /></p>
      </div>
      <div className="placeholder-content">
        <p>Antigen testing functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default VirologyAntigenTestingPage;