import React, { useState, useCallback, useEffect } from "react";
import {
  Grid,
  Column,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TextInput,
  Select,
  SelectItem,
  TextArea,
  DatePicker,
  DatePickerInput,
  NumberInput,
  Checkbox,
  InlineNotification,
  Tag,
  Tile,
  ProgressIndicator,
  ProgressStep
} from "@carbon/react";
import { FormattedMessage, useIntl } from "react-intl";
import { Play, Checkmark, Error, Information } from "@carbon/react/icons";

/**
 * Page 4: Molecular Testing (PCR/RT-PCR) for Virology Laboratory
 * Handles PCR setup, execution, and result analysis for viral detection
 */
const VirologyMolecularTestingPage = ({
  notebookId,
  data = {},
  onChange,
  readOnly = false,
  required = false
}) => {
  const intl = useIntl();

  // Component state
  const [tests, setTests] = useState(data.molecularTests || []);
  const [selectedTest, setSelectedTest] = useState(null);
  const [newTest, setNewTest] = useState({
    testId: "",
    sampleIds: [],
    testType: "",
    protocol: "",
    primers: "",
    probes: "",
    controls: {
      positive: false,
      negative: false,
      internal: false
    },
    thermocycler: "",
    runDate: "",
    operator: "",
    notes: ""
  });
  const [testResults, setTestResults] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Test types and protocols
  const testTypes = [
    "RT-PCR (Reverse Transcription PCR)",
    "Real-time PCR (qPCR)",
    "Nested PCR",
    "Multiplex PCR",
    "Digital PCR",
    "Loop-mediated Isothermal Amplification (LAMP)",
    "Nucleic Acid Sequencing",
    "Viral Load Quantification"
  ];

  const protocols = [
    "CDC COVID-19 Protocol",
    "WHO Influenza Protocol",
    "In-house RSV Protocol",
    "Commercial Kit - Brand A",
    "Commercial Kit - Brand B",
    "Custom Protocol",
    "Other"
  ];

  const thermocyclers = [
    "Applied Biosystems 7500",
    "Bio-Rad CFX96",
    "Roche LightCycler",
    "Thermo Fisher QuantStudio",
    "Other"
  ];

  // Update parent component when data changes
  useEffect(() => {
    if (onChange) {
      onChange({
        ...data,
        molecularTests: tests,
        testResults: testResults,
        testingComplete: tests.length > 0 && tests.every(t => t.status === "Complete"),
        lastUpdated: new Date().toISOString()
      });
    }
  }, [tests, testResults, data, onChange]);

  // Validate test setup
  const validateTest = useCallback((test) => {
    const errors = {};

    if (!test.testId?.trim()) {
      errors.testId = "Test ID is required";
    }

    if (!test.testType) {
      errors.testType = "Test type is required";
    }

    if (!test.protocol) {
      errors.protocol = "Protocol is required";
    }

    if (!test.thermocycler) {
      errors.thermocycler = "Thermocycler selection is required";
    }

    if (!test.runDate) {
      errors.runDate = "Run date is required";
    }

    if (!test.operator?.trim()) {
      errors.operator = "Operator name is required";
    }

    return errors;
  }, []);

  // Add new test
  const handleAddTest = useCallback(() => {
    const errors = validateTest(newTest);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      const testWithMetadata = {
        ...newTest,
        id: Date.now().toString(),
        status: "Setup",
        createdDate: new Date().toISOString(),
        progress: 0
      };

      setTests(prev => [...prev, testWithMetadata]);

      // Reset form
      setNewTest({
        testId: "",
        sampleIds: [],
        testType: "",
        protocol: "",
        primers: "",
        probes: "",
        controls: {
          positive: false,
          negative: false,
          internal: false
        },
        thermocycler: "",
        runDate: "",
        operator: "",
        notes: ""
      });
    }
  }, [newTest, validateTest]);

  // Start test run
  const handleStartTest = useCallback((testId) => {
    setTests(prev => prev.map(test =>
      test.id === testId
        ? { ...test, status: "Running", startTime: new Date().toISOString(), progress: 25 }
        : test
    ));

    // Simulate test progress
    const progressInterval = setInterval(() => {
      setTests(prev => prev.map(test => {
        if (test.id === testId && test.status === "Running") {
          const newProgress = Math.min(test.progress + 15, 100);
          const newStatus = newProgress >= 100 ? "Complete" : "Running";

          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return { ...test, status: newStatus, progress: newProgress, endTime: new Date().toISOString() };
          }

          return { ...test, progress: newProgress };
        }
        return test;
      }));
    }, 2000); // Simulate progress every 2 seconds

  }, []);

  // Record test results
  const handleRecordResults = useCallback((testId, results) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: results
    }));

    setTests(prev => prev.map(test =>
      test.id === testId
        ? { ...test, status: "Complete", results: results }
        : test
    ));
  }, []);

  // Get test status color
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Setup": return "blue";
      case "Running": return "orange";
      case "Complete": return "green";
      case "Failed": return "red";
      default: return "gray";
    }
  }, []);

  // Get test progress steps
  const getTestProgressSteps = useCallback((test) => {
    const steps = [
      { label: "Setup", complete: true },
      { label: "Running", complete: test.status !== "Setup" },
      { label: "Analysis", complete: test.status === "Complete" },
      { label: "Results", complete: test.status === "Complete" && testResults[test.id] }
    ];

    return steps;
  }, [testResults]);

  // Table headers
  const tableHeaders = [
    {
      key: "testId",
      header: intl.formatMessage({ id: "notebook.virology.molecular.testId" })
    },
    {
      key: "testType",
      header: intl.formatMessage({ id: "notebook.virology.molecular.testType" })
    },
    {
      key: "protocol",
      header: intl.formatMessage({ id: "notebook.virology.molecular.protocol" })
    },
    {
      key: "status",
      header: intl.formatMessage({ id: "notebook.virology.molecular.status" })
    },
    {
      key: "progress",
      header: intl.formatMessage({ id: "notebook.virology.molecular.progress" })
    },
    {
      key: "actions",
      header: intl.formatMessage({ id: "notebook.virology.molecular.actions" })
    }
  ];

  return (
    <div className="virology-molecular-testing">
      {/* Page Header */}
      <div className="page-header">
        <h3>
          <FormattedMessage id="notebook.virology.page.molecularTesting.title" />
          {required && <span className="required-indicator"> *</span>}
        </h3>
        <p>
          <FormattedMessage id="notebook.virology.page.molecularTesting.description" />
        </p>
      </div>

      <Grid>
        {/* Test Setup Form */}
        {!readOnly && (
          <Column lg={16}>
            <Tile className="test-setup-form">
              <h4>
                <FormattedMessage id="notebook.virology.molecular.setup.title" />
              </h4>

              <Grid>
                <Column lg={4}>
                  <TextInput
                    id="testId"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.molecular.form.testId" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newTest.testId}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      testId: e.target.value
                    }))}
                    invalid={!!validationErrors.testId}
                    invalidText={validationErrors.testId}
                  />
                </Column>

                <Column lg={4}>
                  <Select
                    id="testType"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.molecular.form.testType" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newTest.testType}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      testType: e.target.value
                    }))}
                    invalid={!!validationErrors.testType}
                    invalidText={validationErrors.testType}
                  >
                    <SelectItem value="" text="Select test type" />
                    {testTypes.map(type => (
                      <SelectItem key={type} value={type} text={type} />
                    ))}
                  </Select>
                </Column>

                <Column lg={4}>
                  <Select
                    id="protocol"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.molecular.form.protocol" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newTest.protocol}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      protocol: e.target.value
                    }))}
                    invalid={!!validationErrors.protocol}
                    invalidText={validationErrors.protocol}
                  >
                    <SelectItem value="" text="Select protocol" />
                    {protocols.map(protocol => (
                      <SelectItem key={protocol} value={protocol} text={protocol} />
                    ))}
                  </Select>
                </Column>

                <Column lg={4}>
                  <Select
                    id="thermocycler"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.molecular.form.thermocycler" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newTest.thermocycler}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      thermocycler: e.target.value
                    }))}
                    invalid={!!validationErrors.thermocycler}
                    invalidText={validationErrors.thermocycler}
                  >
                    <SelectItem value="" text="Select thermocycler" />
                    {thermocyclers.map(cycler => (
                      <SelectItem key={cycler} value={cycler} text={cycler} />
                    ))}
                  </Select>
                </Column>

                <Column lg={4}>
                  <DatePicker datePickerType="single">
                    <DatePickerInput
                      id="runDate"
                      labelText={
                        <>
                          <FormattedMessage id="notebook.virology.molecular.form.runDate" />
                          <span className="required"> *</span>
                        </>
                      }
                      value={newTest.runDate}
                      onChange={(e) => setNewTest(prev => ({
                        ...prev,
                        runDate: e.target.value
                      }))}
                      invalid={!!validationErrors.runDate}
                      invalidText={validationErrors.runDate}
                    />
                  </DatePicker>
                </Column>

                <Column lg={4}>
                  <TextInput
                    id="operator"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.molecular.form.operator" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newTest.operator}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      operator: e.target.value
                    }))}
                    invalid={!!validationErrors.operator}
                    invalidText={validationErrors.operator}
                  />
                </Column>

                {/* Controls */}
                <Column lg={12}>
                  <fieldset className="controls-fieldset">
                    <legend>
                      <FormattedMessage id="notebook.virology.molecular.form.controls" />
                    </legend>
                    <div className="controls-grid">
                      <Checkbox
                        id="positiveControl"
                        labelText={<FormattedMessage id="notebook.virology.molecular.control.positive" />}
                        checked={newTest.controls.positive}
                        onChange={(checked) => setNewTest(prev => ({
                          ...prev,
                          controls: { ...prev.controls, positive: checked }
                        }))}
                      />
                      <Checkbox
                        id="negativeControl"
                        labelText={<FormattedMessage id="notebook.virology.molecular.control.negative" />}
                        checked={newTest.controls.negative}
                        onChange={(checked) => setNewTest(prev => ({
                          ...prev,
                          controls: { ...prev.controls, negative: checked }
                        }))}
                      />
                      <Checkbox
                        id="internalControl"
                        labelText={<FormattedMessage id="notebook.virology.molecular.control.internal" />}
                        checked={newTest.controls.internal}
                        onChange={(checked) => setNewTest(prev => ({
                          ...prev,
                          controls: { ...prev.controls, internal: checked }
                        }))}
                      />
                    </div>
                  </fieldset>
                </Column>

                <Column lg={16}>
                  <TextArea
                    id="notes"
                    labelText={<FormattedMessage id="notebook.virology.molecular.form.notes" />}
                    value={newTest.notes}
                    onChange={(e) => setNewTest(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </Column>

                <Column lg={16}>
                  <Button
                    kind="primary"
                    onClick={handleAddTest}
                    disabled={readOnly}
                  >
                    <FormattedMessage id="notebook.virology.molecular.action.setupTest" />
                  </Button>
                </Column>
              </Grid>
            </Tile>
          </Column>
        )}

        {/* Tests Table */}
        <Column lg={16}>
          <DataTable
            rows={tests.map(test => ({
              id: test.id,
              testId: test.testId,
              testType: test.testType,
              protocol: test.protocol,
              status: (
                <Tag type={getStatusColor(test.status)}>
                  {test.status}
                </Tag>
              ),
              progress: (
                <div className="progress-cell">
                  <span>{test.progress || 0}%</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${test.progress || 0}%` }}
                    />
                  </div>
                </div>
              ),
              actions: (
                <div className="action-buttons">
                  {test.status === "Setup" && (
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Play}
                      onClick={() => handleStartTest(test.id)}
                      disabled={readOnly}
                    >
                      Start
                    </Button>
                  )}
                  {test.status === "Complete" && !testResults[test.id] && (
                    <Button
                      kind="secondary"
                      size="sm"
                      renderIcon={Information}
                      onClick={() => setSelectedTest(test)}
                      disabled={readOnly}
                    >
                      Record Results
                    </Button>
                  )}
                  {testResults[test.id] && (
                    <Tag type="green">
                      <Checkmark size={16} />
                      Results Recorded
                    </Tag>
                  )}
                </div>
              )
            }))}
            headers={tableHeaders}
          >
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <TableContainer title={intl.formatMessage({ id: "notebook.virology.molecular.tests.title" })}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeaderCell key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeaderCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map(cell => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          {tests.length === 0 && (
            <div className="empty-state">
              <p>
                <FormattedMessage id="notebook.virology.molecular.empty.noTests" />
              </p>
            </div>
          )}
        </Column>

        {/* Test Progress Details */}
        {tests.length > 0 && (
          <Column lg={16}>
            <Tile className="progress-summary">
              <h4>
                <FormattedMessage id="notebook.virology.molecular.progress.title" />
              </h4>

              {tests.map(test => (
                <div key={test.id} className="test-progress">
                  <h5>{test.testId} - {test.testType}</h5>
                  <ProgressIndicator currentIndex={
                    test.status === "Setup" ? 0 :
                    test.status === "Running" ? 1 :
                    test.status === "Complete" ? 3 : 0
                  }>
                    {getTestProgressSteps(test).map((step, index) => (
                      <ProgressStep
                        key={index}
                        label={step.label}
                        complete={step.complete}
                      />
                    ))}
                  </ProgressIndicator>
                </div>
              ))}
            </Tile>
          </Column>
        )}
      </Grid>
    </div>
  );
};

export default VirologyMolecularTestingPage;