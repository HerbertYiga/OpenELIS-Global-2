import React from "react";
import { FormattedMessage } from "react-intl";

/**
 * Page 2: Sample Preparation & Processing for Virology Laboratory
 * Handles sample processing, aliquoting, and preparation for testing
 */
const VirologySamplePreparationPage = ({
  notebookId,
  data = {},
  onChange,
  readOnly = false,
  required = false
}) => {
  return (
    <div className="virology-sample-preparation">
      <div className="page-header">
        <h3>
          <FormattedMessage id="notebook.virology.page.samplePreparation.title" />
          {required && <span className="required-indicator"> *</span>}
        </h3>
        <p>
          <FormattedMessage id="notebook.virology.page.samplePreparation.description" />
        </p>
      </div>

      <div className="placeholder-content">
        <p>Sample preparation functionality will be implemented here.</p>
        <p>This page will include:</p>
        <ul>
          <li>Sample aliquoting and labeling</li>
          <li>Storage preparation</li>
          <li>Pre-processing quality checks</li>
          <li>Sample tracking and documentation</li>
        </ul>
      </div>
    </div>
  );
};

export default VirologySamplePreparationPage;