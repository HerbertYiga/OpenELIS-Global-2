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
  TableSelectAll,
  TableSelectRow,
  TextInput,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  TextArea,
  InlineNotification,
  Tag,
  Tile,
  ActionableNotification
} from "@carbon/react";
import { FormattedMessage, useIntl } from "react-intl";
import { Add, Upload, DocumentDownload, CheckmarkFilled } from "@carbon/react/icons";
import VirologyManifestImportModal from "../../workflow/VirologyManifestImportModal";

/**
 * Page 1: Sample Reception & Registration for Virology Laboratory
 * Handles sample intake, registration, manifest import, and batch verification
 */
const VirologySampleReceptionPageEnhanced = ({
  notebookId,
  data = {},
  onChange,
  readOnly = false,
  required = false
}) => {
  const intl = useIntl();

  // Component state
  const [samples, setSamples] = useState(data.samplesReceived || []);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [newSample, setNewSample] = useState({
    sampleId: "",
    patientId: "",
    collectionDate: "",
    sampleType: "",
    clinicalHistory: "",
    symptoms: "",
    suspectedVirus: "",
    priority: "Normal",
    requestingPhysician: "",
    department: "",
    comments: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Sample types for virology
  const sampleTypes = [
    "Serum",
    "Plasma",
    "Whole Blood",
    "Nasopharyngeal Swab",
    "Throat Swab",
    "Nasal Swab",
    "Sputum",
    "Bronchial Lavage",
    "Cerebrospinal Fluid",
    "Urine",
    "Stool",
    "Tissue",
    "Cell Culture",
    "Other"
  ];

  const priorityLevels = ["Urgent", "High", "Normal", "Low"];

  // Update parent component when data changes
  useEffect(() => {
    if (onChange) {
      onChange({
        ...data,
        samplesReceived: samples,
        receptionComplete: samples.length > 0,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [samples, data, onChange]);

  // Validate sample data
  const validateSample = useCallback((sample) => {
    const errors = {};

    if (!sample.sampleId?.trim()) {
      errors.sampleId = "Sample ID is required";
    }

    if (!sample.patientId?.trim()) {
      errors.patientId = "Patient ID is required";
    }

    if (!sample.collectionDate) {
      errors.collectionDate = "Collection date is required";
    }

    if (!sample.sampleType) {
      errors.sampleType = "Sample type is required";
    }

    // Check for duplicate sample ID
    if (sample.sampleId && samples.some(s =>
      s.sampleId === sample.sampleId && s !== sample)) {
      errors.sampleId = "Sample ID already exists";
    }

    return errors;
  }, [samples]);

  // Add new sample
  const handleAddSample = useCallback(() => {
    const errors = validateSample(newSample);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      const sampleWithId = {
        ...newSample,
        id: Date.now().toString(),
        receivedDate: new Date().toISOString(),
        status: "Received"
      };

      setSamples(prev => [...prev, sampleWithId]);
      setNewSample({
        sampleId: "",
        patientId: "",
        collectionDate: "",
        sampleType: "",
        clinicalHistory: "",
        symptoms: "",
        suspectedVirus: "",
        priority: "Normal",
        requestingPhysician: "",
        department: "",
        comments: ""
      });
      setShowSuccessMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  }, [newSample, validateSample]);

  // Remove selected samples
  const handleRemoveSamples = useCallback(() => {
    if (selectedSamples.length === 0) return;

    setSamples(prev =>
      prev.filter(sample => !selectedSamples.includes(sample.id))
    );
    setSelectedSamples([]);
  }, [selectedSamples]);

  // Handle manifest import completion
  const handleManifestImportComplete = useCallback((result) => {
    if (result.success && result.createdSampleIds) {
      // Refresh samples list or add imported samples
      // For now, we'll show a success message
      setShowSuccessMessage(true);
      setIsManifestModalOpen(false);

      // You might want to fetch the latest samples here
      console.log("Manifest import completed:", result);
    }
  }, []);

  // Export samples to CSV
  const handleExportSamples = useCallback(() => {
    if (samples.length === 0) return;

    const csvHeaders = [
      "Sample ID",
      "Patient ID",
      "Collection Date",
      "Sample Type",
      "Clinical History",
      "Symptoms",
      "Suspected Virus",
      "Priority",
      "Requesting Physician",
      "Department",
      "Status",
      "Received Date",
      "Comments"
    ];

    const csvRows = samples.map(sample => [
      sample.sampleId,
      sample.patientId,
      sample.collectionDate,
      sample.sampleType,
      sample.clinicalHistory || "",
      sample.symptoms || "",
      sample.suspectedVirus || "",
      sample.priority,
      sample.requestingPhysician || "",
      sample.department || "",
      sample.status,
      sample.receivedDate,
      sample.comments || ""
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `virology_samples_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [samples]);

  // Data table headers
  const tableHeaders = [
    {
      key: "sampleId",
      header: intl.formatMessage({ id: "notebook.virology.sample.sampleId" })
    },
    {
      key: "patientId",
      header: intl.formatMessage({ id: "notebook.virology.sample.patientId" })
    },
    {
      key: "sampleType",
      header: intl.formatMessage({ id: "notebook.virology.sample.sampleType" })
    },
    {
      key: "collectionDate",
      header: intl.formatMessage({ id: "notebook.virology.sample.collectionDate" })
    },
    {
      key: "priority",
      header: intl.formatMessage({ id: "notebook.virology.sample.priority" })
    },
    {
      key: "status",
      header: intl.formatMessage({ id: "notebook.virology.sample.status" })
    }
  ];

  return (
    <div className="virology-sample-reception">
      {/* Page Header */}
      <div className="page-header">
        <h3>
          <FormattedMessage id="notebook.virology.page.sampleReception.title" />
          {required && <span className="required-indicator"> *</span>}
        </h3>
        <p>
          <FormattedMessage id="notebook.virology.page.sampleReception.description" />
        </p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <ActionableNotification
          kind="success"
          title="Success"
          subtitle="Sample has been added successfully"
          onClose={() => setShowSuccessMessage(false)}
        />
      )}

      <Grid>
        {/* Batch Actions */}
        <Column lg={16}>
          <Tile className="action-tile">
            <div className="action-buttons">
              <Button
                kind="primary"
                renderIcon={Upload}
                onClick={() => setIsManifestModalOpen(true)}
                disabled={readOnly}
              >
                <FormattedMessage id="notebook.virology.action.importManifest" />
              </Button>

              <Button
                kind="secondary"
                renderIcon={DocumentDownload}
                onClick={handleExportSamples}
                disabled={samples.length === 0}
              >
                <FormattedMessage id="notebook.virology.action.exportSamples" />
              </Button>

              {selectedSamples.length > 0 && (
                <Button
                  kind="danger--tertiary"
                  onClick={handleRemoveSamples}
                  disabled={readOnly}
                >
                  <FormattedMessage
                    id="notebook.virology.action.removeSamples"
                    values={{ count: selectedSamples.length }}
                  />
                </Button>
              )}
            </div>

            <div className="batch-summary">
              <Tag type="blue">
                <FormattedMessage
                  id="notebook.virology.summary.totalSamples"
                  values={{ count: samples.length }}
                />
              </Tag>

              {samples.filter(s => s.priority === "Urgent").length > 0 && (
                <Tag type="red">
                  <FormattedMessage
                    id="notebook.virology.summary.urgentSamples"
                    values={{ count: samples.filter(s => s.priority === "Urgent").length }}
                  />
                </Tag>
              )}
            </div>
          </Tile>
        </Column>

        {/* Manual Sample Entry Form */}
        {!readOnly && (
          <Column lg={16}>
            <Tile className="sample-entry-form">
              <h4>
                <FormattedMessage id="notebook.virology.form.addSample.title" />
              </h4>

              <Grid>
                <Column lg={4}>
                  <TextInput
                    id="sampleId"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.form.sampleId" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newSample.sampleId}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      sampleId: e.target.value
                    }))}
                    invalid={!!validationErrors.sampleId}
                    invalidText={validationErrors.sampleId}
                  />
                </Column>

                <Column lg={4}>
                  <TextInput
                    id="patientId"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.form.patientId" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newSample.patientId}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      patientId: e.target.value
                    }))}
                    invalid={!!validationErrors.patientId}
                    invalidText={validationErrors.patientId}
                  />
                </Column>

                <Column lg={4}>
                  <DatePicker datePickerType="single">
                    <DatePickerInput
                      id="collectionDate"
                      labelText={
                        <>
                          <FormattedMessage id="notebook.virology.form.collectionDate" />
                          <span className="required"> *</span>
                        </>
                      }
                      value={newSample.collectionDate}
                      onChange={(e) => setNewSample(prev => ({
                        ...prev,
                        collectionDate: e.target.value
                      }))}
                      invalid={!!validationErrors.collectionDate}
                      invalidText={validationErrors.collectionDate}
                    />
                  </DatePicker>
                </Column>

                <Column lg={4}>
                  <Select
                    id="sampleType"
                    labelText={
                      <>
                        <FormattedMessage id="notebook.virology.form.sampleType" />
                        <span className="required"> *</span>
                      </>
                    }
                    value={newSample.sampleType}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      sampleType: e.target.value
                    }))}
                    invalid={!!validationErrors.sampleType}
                    invalidText={validationErrors.sampleType}
                  >
                    <SelectItem value="" text="Select sample type" />
                    {sampleTypes.map(type => (
                      <SelectItem key={type} value={type} text={type} />
                    ))}
                  </Select>
                </Column>

                <Column lg={8}>
                  <TextArea
                    id="clinicalHistory"
                    labelText={<FormattedMessage id="notebook.virology.form.clinicalHistory" />}
                    value={newSample.clinicalHistory}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      clinicalHistory: e.target.value
                    }))}
                    rows={2}
                  />
                </Column>

                <Column lg={8}>
                  <TextInput
                    id="symptoms"
                    labelText={<FormattedMessage id="notebook.virology.form.symptoms" />}
                    value={newSample.symptoms}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      symptoms: e.target.value
                    }))}
                  />
                </Column>

                <Column lg={4}>
                  <TextInput
                    id="suspectedVirus"
                    labelText={<FormattedMessage id="notebook.virology.form.suspectedVirus" />}
                    value={newSample.suspectedVirus}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      suspectedVirus: e.target.value
                    }))}
                  />
                </Column>

                <Column lg={4}>
                  <Select
                    id="priority"
                    labelText={<FormattedMessage id="notebook.virology.form.priority" />}
                    value={newSample.priority}
                    onChange={(e) => setNewSample(prev => ({
                      ...prev,
                      priority: e.target.value
                    }))}
                  >
                    {priorityLevels.map(priority => (
                      <SelectItem key={priority} value={priority} text={priority} />
                    ))}
                  </Select>
                </Column>

                <Column lg={16}>
                  <Button
                    kind="primary"
                    renderIcon={Add}
                    onClick={handleAddSample}
                    disabled={readOnly}
                  >
                    <FormattedMessage id="notebook.virology.action.addSample" />
                  </Button>
                </Column>
              </Grid>
            </Tile>
          </Column>
        )}

        {/* Samples Table */}
        <Column lg={16}>
          <DataTable
            rows={samples.map(sample => ({
              id: sample.id,
              sampleId: sample.sampleId,
              patientId: sample.patientId,
              sampleType: sample.sampleType,
              collectionDate: sample.collectionDate,
              priority: (
                <Tag
                  type={
                    sample.priority === "Urgent" ? "red" :
                    sample.priority === "High" ? "orange" :
                    sample.priority === "Normal" ? "blue" : "gray"
                  }
                >
                  {sample.priority}
                </Tag>
              ),
              status: (
                <Tag type="green">
                  <CheckmarkFilled size={16} />
                  {sample.status}
                </Tag>
              )
            }))}
            headers={tableHeaders}
            radio={false}
            onSelectionChange={(selectedRows) => {
              setSelectedSamples(selectedRows.map(row => row.id));
            }}
          >
            {({ rows, headers, getHeaderProps, getRowProps, getSelectionProps, getTableProps }) => (
              <TableContainer title={intl.formatMessage({ id: "notebook.virology.table.title" })}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {!readOnly && (
                        <TableSelectAll {...getSelectionProps()} />
                      )}
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
                        {!readOnly && (
                          <TableSelectRow {...getSelectionProps({ row })} />
                        )}
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

          {samples.length === 0 && (
            <div className="empty-state">
              <p>
                <FormattedMessage id="notebook.virology.empty.noSamples" />
              </p>
            </div>
          )}
        </Column>
      </Grid>

      {/* Manifest Import Modal */}
      <VirologyManifestImportModal
        isOpen={isManifestModalOpen}
        onClose={() => setIsManifestModalOpen(false)}
        onImportComplete={handleManifestImportComplete}
        notebookId={notebookId}
      />
    </div>
  );
};

export default VirologySampleReceptionPageEnhanced;