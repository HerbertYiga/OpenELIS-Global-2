package org.openelisglobal.notebook.service;

import org.openelisglobal.notebook.form.VirologyManifestImportForm;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Service interface for Virology Laboratory manifest import operations.
 * Handles parsing, validation, and import of virology sample manifests.
 */
public interface VirologyManifestImportService {

    /**
     * Parse and validate a virology manifest file
     *
     * @param file CSV file containing virology sample data
     * @param form Column mapping configuration
     * @return ParsedManifest containing validated data and any errors
     * @throws Exception if file cannot be processed
     */
    ParsedManifest parseManifest(MultipartFile file, VirologyManifestImportForm form) throws Exception;

    /**
     * Import samples from a parsed manifest into the system
     *
     * @param parsedManifest Validated manifest data
     * @param userId User ID performing the import
     * @return VirologyManifestImportResult with import status and results
     * @throws Exception if import fails
     */
    VirologyManifestImportResult importSamples(ParsedManifest parsedManifest, String userId) throws Exception;

    /**
     * Data structure representing a single row in the virology manifest
     */
    class VirologyManifestRow {
        private String sampleId;
        private String patientId;
        private String collectionDate;
        private String sampleType;
        private String clinicalHistory;
        private String symptoms;
        private String suspectedVirus;
        private String collectionSite;
        private String transportMedium;
        private String storageConditions;
        private String priority;
        private String requestingPhysician;
        private String department;
        private String testRequested;
        private String isolationSource;
        private String passageHistory;
        private String viralLoad;
        private String comments;

        // Constructors, getters, and setters
        public VirologyManifestRow() {}

        public String getSampleId() { return sampleId; }
        public void setSampleId(String sampleId) { this.sampleId = sampleId; }

        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }

        public String getCollectionDate() { return collectionDate; }
        public void setCollectionDate(String collectionDate) { this.collectionDate = collectionDate; }

        public String getSampleType() { return sampleType; }
        public void setSampleType(String sampleType) { this.sampleType = sampleType; }

        public String getClinicalHistory() { return clinicalHistory; }
        public void setClinicalHistory(String clinicalHistory) { this.clinicalHistory = clinicalHistory; }

        public String getSymptoms() { return symptoms; }
        public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

        public String getSuspectedVirus() { return suspectedVirus; }
        public void setSuspectedVirus(String suspectedVirus) { this.suspectedVirus = suspectedVirus; }

        public String getCollectionSite() { return collectionSite; }
        public void setCollectionSite(String collectionSite) { this.collectionSite = collectionSite; }

        public String getTransportMedium() { return transportMedium; }
        public void setTransportMedium(String transportMedium) { this.transportMedium = transportMedium; }

        public String getStorageConditions() { return storageConditions; }
        public void setStorageConditions(String storageConditions) { this.storageConditions = storageConditions; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getRequestingPhysician() { return requestingPhysician; }
        public void setRequestingPhysician(String requestingPhysician) { this.requestingPhysician = requestingPhysician; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public String getTestRequested() { return testRequested; }
        public void setTestRequested(String testRequested) { this.testRequested = testRequested; }

        public String getIsolationSource() { return isolationSource; }
        public void setIsolationSource(String isolationSource) { this.isolationSource = isolationSource; }

        public String getPassageHistory() { return passageHistory; }
        public void setPassageHistory(String passageHistory) { this.passageHistory = passageHistory; }

        public String getViralLoad() { return viralLoad; }
        public void setViralLoad(String viralLoad) { this.viralLoad = viralLoad; }

        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }

    /**
     * Data structure representing a validation error in the manifest
     */
    class ParseError {
        private int row;
        private String field;
        private String message;

        public ParseError(int row, String field, String message) {
            this.row = row;
            this.field = field;
            this.message = message;
        }

        // Getters
        public int getRow() { return row; }
        public String getField() { return field; }
        public String getMessage() { return message; }
    }

    /**
     * Data structure containing parsed manifest data and validation results
     */
    class ParsedManifest {
        private List<VirologyManifestRow> rows;
        private List<ParseError> parseErrors;
        private Map<String, String> columnMapping;

        public ParsedManifest() {}

        public List<VirologyManifestRow> getRows() { return rows; }
        public void setRows(List<VirologyManifestRow> rows) { this.rows = rows; }

        public List<ParseError> getParseErrors() { return parseErrors; }
        public void setParseErrors(List<ParseError> parseErrors) { this.parseErrors = parseErrors; }

        public Map<String, String> getColumnMapping() { return columnMapping; }
        public void setColumnMapping(Map<String, String> columnMapping) { this.columnMapping = columnMapping; }
    }

    /**
     * Data structure containing import operation results
     */
    class VirologyManifestImportResult {
        private boolean success;
        private String errorMessage;
        private int samplesCreated;
        private int samplesUpdated;
        private List<String> createdSampleIds;

        public VirologyManifestImportResult() {}

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public int getSamplesCreated() { return samplesCreated; }
        public void setSamplesCreated(int samplesCreated) { this.samplesCreated = samplesCreated; }

        public int getSamplesUpdated() { return samplesUpdated; }
        public void setSamplesUpdated(int samplesUpdated) { this.samplesUpdated = samplesUpdated; }

        public List<String> getCreatedSampleIds() { return createdSampleIds; }
        public void setCreatedSampleIds(List<String> createdSampleIds) { this.createdSampleIds = createdSampleIds; }
    }
}