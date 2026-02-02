import React from "react";
import { FormattedMessage } from "react-intl";

const VirologyResultsAnalysisPage = ({ notebookId, data = {}, onChange, readOnly = false, required = false }) => {
  return (
    <div className="virology-results-analysis">
      <div className="page-header">
        <h3><FormattedMessage id="notebook.virology.page.resultsAnalysis.title" />{required && <span className="required-indicator"> *</span>}</h3>
        <p><FormattedMessage id="notebook.virology.page.resultsAnalysis.description" /></p>
      </div>
      <div className="placeholder-content"><p>Results analysis & interpretation functionality will be implemented here.</p></div>
    </div>
  );
};

export default VirologyResultsAnalysisPage;