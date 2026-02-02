import React, { useState, useEffect, useContext } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  ProgressIndicator,
  ProgressStep,
  InlineNotification,
  Loading
} from "@carbon/react";
import { FormattedMessage, useIntl } from "react-intl";
import { ConfigurationContext } from "../../layout/Layout";
import { useVirologyPermissions } from "../../../hooks/useVirologyPermissions";

// Import virology page components
import VirologySampleReceptionPageEnhanced from "../pages/virology/VirologySampleReceptionPageEnhanced";
import VirologySamplePreparationPage from "../pages/virology/VirologySamplePreparationPage";
import VirologyViralCulturePage from "../pages/virology/VirologyViralCulturePage";
import VirologyMolecularTestingPage from "../pages/virology/VirologyMolecularTestingPage";
import VirologyAntigenTestingPage from "../pages/virology/VirologyAntigenTestingPage";
import VirologySerologyTestingPage from "../pages/virology/VirologySerologyTestingPage";
import VirologyMicroscopyStainingPage from "../pages/virology/VirologyMicroscopyStainingPage";
import VirologyQualityControlPage from "../pages/virology/VirologyQualityControlPage";
import VirologyResultsAnalysisPage from "../pages/virology/VirologyResultsAnalysisPage";
import VirologyStorageDocumentationPage from "../pages/virology/VirologyStorageDocumentationPage";

/**
 * Main container component for Virology Laboratory workflow
 * Manages 10-page workflow with navigation and progress tracking
 * Integrates with role-based access control
 */
const VirologyWorkflowTab = ({
  notebookId,
  onSave,
  onCancel,
  readOnly = false,
  initialData = {}
}) => {
  const intl = useIntl();
  const { configurationProperties } = useContext(ConfigurationContext);
  const {
    hasPageAccess,
    hasPermissionLevel,
    loading: permissionsLoading,
    error: permissionsError
  } = useVirologyPermissions();

  // Workflow state
  const [selectedTab, setSelectedTab] = useState(0);
  const [workflowData, setWorkflowData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [completedPages, setCompletedPages] = useState(new Set());

  // Define the 10 workflow pages
  const workflowPages = [
    {
      id: "virology-sample-reception",
      key: "sampleReception",
      titleKey: "notebook.virology.page.sampleReception.title",
      component: VirologySampleReceptionPageEnhanced,
      required: true
    },
    {
      id: "virology-sample-preparation",
      key: "samplePreparation",
      titleKey: "notebook.virology.page.samplePreparation.title",
      component: VirologySamplePreparationPage,
      required: true
    },
    {
      id: "virology-viral-culture",
      key: "viralCulture",
      titleKey: "notebook.virology.page.viralCulture.title",
      component: VirologyViralCulturePage,
      required: false
    },
    {
      id: "virology-molecular-testing",
      key: "molecularTesting",
      titleKey: "notebook.virology.page.molecularTesting.title",
      component: VirologyMolecularTestingPage,
      required: true
    },
    {
      id: "virology-antigen-testing",
      key: "antigenTesting",
      titleKey: "notebook.virology.page.antigenTesting.title",
      component: VirologyAntigenTestingPage,
      required: false
    },
    {
      id: "virology-serology-testing",
      key: "serologyTesting",
      titleKey: "notebook.virology.page.serologyTesting.title",
      component: VirologySerologyTestingPage,
      required: false
    },
    {
      id: "virology-microscopy-staining",
      key: "microscopyStaining",
      titleKey: "notebook.virology.page.microscopyStaining.title",
      component: VirologyMicroscopyStainingPage,
      required: false
    },
    {
      id: "virology-quality-control",
      key: "qualityControl",
      titleKey: "notebook.virology.page.qualityControl.title",
      component: VirologyQualityControlPage,
      required: true
    },
    {
      id: "virology-results-analysis",
      key: "resultsAnalysis",
      titleKey: "notebook.virology.page.resultsAnalysis.title",
      component: VirologyResultsAnalysisPage,
      required: true
    },
    {
      id: "virology-storage-documentation",
      key: "storageDocumentation",
      titleKey: "notebook.virology.page.storageDocumentation.title",
      component: VirologyStorageDocumentationPage,
      required: true
    }
  ];

  // Handle page data updates
  const handlePageDataChange = (pageKey, data) => {
    setWorkflowData(prev => ({
      ...prev,
      [pageKey]: data
    }));

    // Mark page as completed if it has required data
    const page = workflowPages.find(p => p.key === pageKey);
    if (page && isPageComplete(pageKey, data)) {
      setCompletedPages(prev => new Set([...prev, pageKey]));
    } else {
      setCompletedPages(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(pageKey);
        return newSet;
      });
    }
  };

  // Check if page is complete based on required fields
  const isPageComplete = (pageKey, data) => {
    if (!data) return false;

    // Define completion criteria for each page
    switch (pageKey) {
      case "sampleReception":
        return data.samplesReceived && data.samplesReceived.length > 0;
      case "samplePreparation":
        return data.preparationMethod && data.preparationDate;
      case "molecularTesting":
        return data.testMethod && data.testResults;
      case "qualityControl":
        return data.qcResults && data.qcApproval;
      case "resultsAnalysis":
        return data.analysisComplete && data.interpretation;
      case "storageDocumentation":
        return data.storageLocation && data.storageConditions;
      default:
        return true; // Optional pages considered complete by default
    }
  };

  // Calculate workflow progress
  const getWorkflowProgress = () => {
    const requiredPages = workflowPages.filter(page => page.required);
    const completedRequired = requiredPages.filter(page =>
      completedPages.has(page.key)
    ).length;
    return Math.round((completedRequired / requiredPages.length) * 100);
  };

  // Save entire workflow
  const handleSaveWorkflow = async () => {
    setLoading(true);
    setSaveError("");

    try {
      const workflowPayload = {
        notebookId,
        workflowType: "virology",
        data: workflowData,
        completedPages: Array.from(completedPages),
        progress: getWorkflowProgress()
      };

      await onSave(workflowPayload);
    } catch (error) {
      setSaveError("Error saving workflow: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter accessible pages based on permissions
  const accessiblePages = workflowPages.filter(page =>
    hasPageAccess(page.id)
  );

  if (permissionsLoading) {
    return <Loading description="Loading permissions..." />;
  }

  if (permissionsError) {
    return (
      <InlineNotification
        kind="error"
        title="Permission Error"
        subtitle={permissionsError}
      />
    );
  }

  return (
    <div className="virology-workflow">
      {/* Workflow Header */}
      <div className="virology-workflow__header">
        <h2>
          <FormattedMessage id="notebook.virology.workflow.title" />
        </h2>

        {/* Progress Indicator */}
        <ProgressIndicator currentIndex={selectedTab} spaceEqually>
          {accessiblePages.map((page, index) => (
            <ProgressStep
              key={page.key}
              label={intl.formatMessage({ id: page.titleKey })}
              complete={completedPages.has(page.key)}
              invalid={page.required && !completedPages.has(page.key)}
            />
          ))}
        </ProgressIndicator>

        {/* Progress Summary */}
        <div className="virology-workflow__progress">
          <p>
            <FormattedMessage
              id="notebook.virology.workflow.progress"
              values={{
                progress: getWorkflowProgress(),
                completed: Array.from(completedPages).length,
                total: workflowPages.length
              }}
            />
          </p>
        </div>
      </div>

      {/* Error Display */}
      {saveError && (
        <InlineNotification
          kind="error"
          title="Save Error"
          subtitle={saveError}
          onCloseButtonClick={() => setSaveError("")}
        />
      )}

      {/* Main Workflow Tabs */}
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        type="container"
      >
        <TabList>
          {accessiblePages.map((page, index) => (
            <Tab
              key={page.key}
              disabled={!hasPermissionLevel(page.id, "VIEW")}
            >
              <span className={completedPages.has(page.key) ? "tab-completed" : ""}>
                {intl.formatMessage({ id: page.titleKey })}
              </span>
              {page.required && !completedPages.has(page.key) && (
                <span className="required-indicator"> *</span>
              )}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {accessiblePages.map((page, index) => {
            const PageComponent = page.component;
            const isReadOnly = readOnly || !hasPermissionLevel(page.id, "UPDATE");

            return (
              <TabPanel key={page.key}>
                <PageComponent
                  notebookId={notebookId}
                  data={workflowData[page.key] || {}}
                  onChange={(data) => handlePageDataChange(page.key, data)}
                  readOnly={isReadOnly}
                  required={page.required}
                />
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>

      {/* Action Buttons */}
      <div className="virology-workflow__actions">
        <Button
          kind="secondary"
          onClick={onCancel}
        >
          <FormattedMessage id="label.button.cancel" />
        </Button>

        <Button
          kind="primary"
          onClick={handleSaveWorkflow}
          disabled={loading || readOnly || !hasPermissionLevel("virology-sample-reception", "UPDATE")}
        >
          {loading ? (
            <FormattedMessage id="label.button.saving" />
          ) : (
            <FormattedMessage id="label.button.save" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default VirologyWorkflowTab;