import React, { useState, useCallback, useMemo } from "react";
import {
  Modal,
  FileUploader,
  Select,
  SelectItem,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  InlineNotification,
  Loading,
  FormGroup,
  Checkbox,
  TextInput,
  ProgressBar
} from "@carbon/react";
import { FormattedMessage, useIntl } from "react-intl";
import { Upload, CheckmarkFilled, ErrorFilled } from "@carbon/react/icons";

/**
 * CSV manifest import modal for Virology Laboratory workflow
 * Provides column mapping interface, preview and validation functionality
 * Handles file upload, parsing, and sample import operations
 */
const VirologyManifestImportModal = ({
  isOpen,
  onClose,
  onImportComplete,
  notebookId
}) => {
  const intl = useIntl();

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("upload"); // upload, mapping, preview, import
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

  // Configuration options
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [delimiter, setDelimiter] = useState(",");

  // Define virology-specific field mappings
  const virologyFields = [
    // Required fields
    {
      key: "sampleId",
      labelKey: "notebook.virology.manifest.field.sampleId",
      required: true,
      description: "Unique sample identifier"
    },
    {
      key: "patientId",
      labelKey: "notebook.virology.manifest.field.patientId",
      required: true,
      description: "Patient identification number"
    },
    {
      key: "collectionDate",
      labelKey: "notebook.virology.manifest.field.collectionDate",
      required: true,
      description: "Date sample was collected (YYYY-MM-DD)"
    },
    {
      key: "sampleType",
      labelKey: "notebook.virology.manifest.field.sampleType",
      required: true,
      description: "Type of specimen (serum, plasma, swab, etc.)"
    },
    {
      key: "testRequested",
      labelKey: "notebook.virology.manifest.field.testRequested",
      required: true,
      description: "Virology test requested"
    },
    // Optional fields
    {
      key: "clinicalHistory",
      labelKey: "notebook.virology.manifest.field.clinicalHistory",
      required: false,
      description: "Patient clinical history"
    },
    {
      key: "symptoms",
      labelKey: "notebook.virology.manifest.field.symptoms",
      required: false,
      description: "Patient symptoms"
    },
    {
      key: "suspectedVirus",
      labelKey: "notebook.virology.manifest.field.suspectedVirus",
      required: false,
      description: "Suspected viral pathogen"
    },
    {
      key: "collectionSite",
      labelKey: "notebook.virology.manifest.field.collectionSite",
      required: false,
      description: "Anatomical collection site"
    },
    {
      key: "transportMedium",
      labelKey: "notebook.virology.manifest.field.transportMedium",
      required: false,
      description: "Transport medium used"
    },
    {
      key: "storageConditions",
      labelKey: "notebook.virology.manifest.field.storageConditions",
      required: false,
      description: "Storage temperature and conditions"
    },
    {
      key: "priority",
      labelKey: "notebook.virology.manifest.field.priority",
      required: false,
      description: "Test priority level"
    },
    {
      key: "requestingPhysician",
      labelKey: "notebook.virology.manifest.field.requestingPhysician",
      required: false,
      description: "Requesting physician name"
    },
    {
      key: "department",
      labelKey: "notebook.virology.manifest.field.department",
      required: false,
      description: "Requesting department"
    },
    {
      key: "isolationSource",
      labelKey: "notebook.virology.manifest.field.isolationSource",
      required: false,
      description: "Virus isolation source"
    },
    {
      key: "passageHistory",
      labelKey: "notebook.virology.manifest.field.passageHistory",
      required: false,
      description: "Cell culture passage history"
    },
    {
      key: "viralLoad",
      labelKey: "notebook.virology.manifest.field.viralLoad",
      required: false,
      description: "Viral load (if known)"
    },
    {
      key: "comments",
      labelKey: "notebook.virology.manifest.field.comments",
      required: false,
      description: "Additional comments"
    }
  ];

  // Required field validation
  const requiredFields = useMemo(() =>
    virologyFields.filter(field => field.required),
    [virologyFields]
  );

  // File upload handler
  const handleFileUpload = useCallback(async (files) => {
    if (files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);
    setIsLoading(true);

    try {
      // Read file and parse CSV headers
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error("Empty file");
      }

      const headers = lines[0].split(delimiter).map(header => header.trim());
      setCsvHeaders(headers);

      // Auto-map columns if possible
      const autoMapping = {};
      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');

        virologyFields.forEach(field => {
          const fieldKey = field.key.toLowerCase();
          if (normalizedHeader.includes(fieldKey) ||
              normalizedHeader.includes(fieldKey.replace(/([A-Z])/g, '_$1').toLowerCase())) {
            autoMapping[field.key] = header;
          }
        });
      });

      setColumnMapping(autoMapping);
      setCurrentStep("mapping");
    } catch (error) {
      console.error("Error reading file:", error);
      setValidationErrors([{
        row: 0,
        field: "file",
        message: "Error reading file: " + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [delimiter]);

  // Column mapping change handler
  const handleColumnMappingChange = useCallback((fieldKey, csvColumn) => {
    setColumnMapping(prev => ({
      ...prev,
      [fieldKey]: csvColumn
    }));
  }, []);

  // Preview manifest data
  const handlePreviewManifest = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Add column mapping to form data
      Object.entries(columnMapping).forEach(([field, column]) => {
        formData.append(field + 'Column', column);
      });
      formData.append('hasHeaderRow', hasHeaderRow);
      formData.append('delimiter', delimiter);

      const response = await fetch('/rest/virology-manifest/preview-manifest', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Preview failed');
      }

      const result = await response.json();
      setPreviewData(result);
      setValidationErrors(result.parseErrors || []);
      setCurrentStep("preview");
    } catch (error) {
      console.error("Error previewing manifest:", error);
      setValidationErrors([{
        row: 0,
        field: "preview",
        message: "Error previewing manifest: " + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, columnMapping, hasHeaderRow, delimiter]);

  // Import manifest data
  const handleImportManifest = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setImportProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Add column mapping to form data
      Object.entries(columnMapping).forEach(([field, column]) => {
        formData.append(field + 'Column', column);
      });
      formData.append('hasHeaderRow', hasHeaderRow);
      formData.append('delimiter', delimiter);

      const response = await fetch('/rest/virology-manifest/import-manifest', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      setImportResults(result);
      setImportProgress(100);
      setCurrentStep("complete");

      if (result.success && onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      console.error("Error importing manifest:", error);
      setValidationErrors([{
        row: 0,
        field: "import",
        message: "Error importing manifest: " + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, columnMapping, hasHeaderRow, delimiter, onImportComplete]);

  // Check if all required fields are mapped
  const isRequiredMappingComplete = useMemo(() => {
    return requiredFields.every(field => columnMapping[field.key]);
  }, [requiredFields, columnMapping]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setSelectedFile(null);
    setColumnMapping({});
    setCsvHeaders([]);
    setPreviewData(null);
    setValidationErrors([]);
    setCurrentStep("upload");
    setImportProgress(0);
    setImportResults(null);
  }, []);

  // Modal close handler
  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading={
        <FormattedMessage id="notebook.virology.manifest.modal.title" />
      }
      primaryButtonText={
        currentStep === "mapping" ?
          intl.formatMessage({ id: "notebook.virology.manifest.button.preview" }) :
        currentStep === "preview" ?
          intl.formatMessage({ id: "notebook.virology.manifest.button.import" }) :
          intl.formatMessage({ id: "label.button.close" })
      }
      secondaryButtonText={
        currentStep !== "complete" ?
          intl.formatMessage({ id: "label.button.cancel" }) : null
      }
      onRequestSubmit={
        currentStep === "mapping" ? handlePreviewManifest :
        currentStep === "preview" ? handleImportManifest :
        handleClose
      }
      onSecondarySubmit={currentStep !== "complete" ? handleClose : null}
      primaryButtonDisabled={
        isLoading ||
        (currentStep === "mapping" && !isRequiredMappingComplete) ||
        (currentStep === "preview" && validationErrors.length > 0)
      }
      size="lg"
    >
      {isLoading && (
        <Loading description="Processing..." />
      )}

      {/* Step 1: File Upload */}
      {currentStep === "upload" && (
        <div className="virology-manifest-upload">
          <FormattedMessage id="notebook.virology.manifest.upload.instructions" />

          <FileUploader
            accept=".csv,.txt"
            buttonLabel={intl.formatMessage({ id: "notebook.virology.manifest.upload.button" })}
            filenameStatus="edit"
            iconDescription={intl.formatMessage({ id: "notebook.virology.manifest.upload.icon" })}
            labelDescription={intl.formatMessage({ id: "notebook.virology.manifest.upload.description" })}
            labelTitle={intl.formatMessage({ id: "notebook.virology.manifest.upload.title" })}
            onUpload={handleFileUpload}
          />

          <FormGroup>
            <Checkbox
              id="hasHeaderRow"
              labelText={intl.formatMessage({ id: "notebook.virology.manifest.options.headerRow" })}
              checked={hasHeaderRow}
              onChange={(checked) => setHasHeaderRow(checked)}
            />

            <TextInput
              id="delimiter"
              labelText={intl.formatMessage({ id: "notebook.virology.manifest.options.delimiter" })}
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
            />
          </FormGroup>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {currentStep === "mapping" && (
        <div className="virology-manifest-mapping">
          <h4>
            <FormattedMessage id="notebook.virology.manifest.mapping.title" />
          </h4>
          <p>
            <FormattedMessage id="notebook.virology.manifest.mapping.instructions" />
          </p>

          <div className="mapping-grid">
            {virologyFields.map(field => (
              <div key={field.key} className="mapping-field">
                <Select
                  id={`mapping-${field.key}`}
                  labelText={
                    <>
                      {intl.formatMessage({ id: field.labelKey })}
                      {field.required && <span className="required"> *</span>}
                    </>
                  }
                  helperText={field.description}
                  value={columnMapping[field.key] || ""}
                  onChange={(e) => handleColumnMappingChange(field.key, e.target.value)}
                >
                  <SelectItem value="" text="-- Select Column --" />
                  {csvHeaders.map(header => (
                    <SelectItem key={header} value={header} text={header} />
                  ))}
                </Select>
              </div>
            ))}
          </div>

          {!isRequiredMappingComplete && (
            <InlineNotification
              kind="warning"
              title="Required Fields"
              subtitle="Please map all required fields before proceeding"
            />
          )}
        </div>
      )}

      {/* Step 3: Preview */}
      {currentStep === "preview" && (
        <div className="virology-manifest-preview">
          <h4>
            <FormattedMessage id="notebook.virology.manifest.preview.title" />
          </h4>

          {validationErrors.length > 0 && (
            <InlineNotification
              kind="error"
              title="Validation Errors"
              subtitle={`Found ${validationErrors.length} error(s) in the manifest`}
            >
              <ul>
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>
                    Row {error.row}: {error.field} - {error.message}
                  </li>
                ))}
                {validationErrors.length > 5 && (
                  <li>... and {validationErrors.length - 5} more errors</li>
                )}
              </ul>
            </InlineNotification>
          )}

          {previewData && (
            <DataTable
              rows={previewData.rows.slice(0, 10)}
              headers={[
                { key: "sampleId", header: "Sample ID" },
                { key: "patientId", header: "Patient ID" },
                { key: "sampleType", header: "Sample Type" },
                { key: "collectionDate", header: "Collection Date" },
                { key: "testRequested", header: "Test Requested" }
              ]}
            >
              {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                <TableContainer>
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
          )}

          <p>
            <FormattedMessage
              id="notebook.virology.manifest.preview.summary"
              values={{
                total: previewData?.rows?.length || 0,
                errors: validationErrors.length
              }}
            />
          </p>
        </div>
      )}

      {/* Step 4: Import Complete */}
      {currentStep === "complete" && (
        <div className="virology-manifest-complete">
          {importResults?.success ? (
            <>
              <div className="success-icon">
                <CheckmarkFilled size={32} />
              </div>
              <h4>
                <FormattedMessage id="notebook.virology.manifest.complete.success" />
              </h4>
              <p>
                <FormattedMessage
                  id="notebook.virology.manifest.complete.summary"
                  values={{
                    created: importResults.samplesCreated,
                    updated: importResults.samplesUpdated
                  }}
                />
              </p>
            </>
          ) : (
            <>
              <div className="error-icon">
                <ErrorFilled size={32} />
              </div>
              <h4>
                <FormattedMessage id="notebook.virology.manifest.complete.error" />
              </h4>
              <p>{importResults?.errorMessage}</p>
            </>
          )}
        </div>
      )}

      {/* Progress Bar for Import */}
      {currentStep === "import" && (
        <ProgressBar
          label="Importing samples..."
          value={importProgress}
          max={100}
        />
      )}

      {/* Error Display */}
      {validationErrors.length > 0 && currentStep !== "preview" && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={validationErrors[0]?.message}
        />
      )}
    </Modal>
  );
};

export default VirologyManifestImportModal;