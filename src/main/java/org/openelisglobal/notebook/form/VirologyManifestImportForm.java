package org.openelisglobal.notebook.form;

import org.openelisglobal.common.form.BaseForm;

/**
 * Form class for Virology Laboratory CSV manifest import column mapping configuration.
 * Contains 18 configurable fields for mapping CSV columns to virology sample metadata.
 */
public class VirologyManifestImportForm extends BaseForm {

    // Required fields (5)
    private String sampleIdColumn;
    private String patientIdColumn;
    private String collectionDateColumn;
    private String sampleTypeColumn;
    private String testRequestedColumn;

    // Optional fields (13)
    private String clinicalHistoryColumn;
    private String symptomsColumn;
    private String suspectedVirusColumn;
    private String collectionSiteColumn;
    private String transportMediumColumn;
    private String storageConditionsColumn;
    private String priorityColumn;
    private String requestingPhysicianColumn;
    private String departmentColumn;
    private String isolationSourceColumn;
    private String passageHistoryColumn;
    private String viralLoadColumn;
    private String commentsColumn;

    // Additional configuration options
    private boolean hasHeaderRow = true;
    private String delimiter = ",";
    private String encoding = "UTF-8";

    public VirologyManifestImportForm() {
        super();
    }

    // Required field getters and setters
    public String getSampleIdColumn() {
        return sampleIdColumn;
    }

    public void setSampleIdColumn(String sampleIdColumn) {
        this.sampleIdColumn = sampleIdColumn;
    }

    public String getPatientIdColumn() {
        return patientIdColumn;
    }

    public void setPatientIdColumn(String patientIdColumn) {
        this.patientIdColumn = patientIdColumn;
    }

    public String getCollectionDateColumn() {
        return collectionDateColumn;
    }

    public void setCollectionDateColumn(String collectionDateColumn) {
        this.collectionDateColumn = collectionDateColumn;
    }

    public String getSampleTypeColumn() {
        return sampleTypeColumn;
    }

    public void setSampleTypeColumn(String sampleTypeColumn) {
        this.sampleTypeColumn = sampleTypeColumn;
    }

    public String getTestRequestedColumn() {
        return testRequestedColumn;
    }

    public void setTestRequestedColumn(String testRequestedColumn) {
        this.testRequestedColumn = testRequestedColumn;
    }

    // Optional field getters and setters
    public String getClinicalHistoryColumn() {
        return clinicalHistoryColumn;
    }

    public void setClinicalHistoryColumn(String clinicalHistoryColumn) {
        this.clinicalHistoryColumn = clinicalHistoryColumn;
    }

    public String getSymptomsColumn() {
        return symptomsColumn;
    }

    public void setSymptomsColumn(String symptomsColumn) {
        this.symptomsColumn = symptomsColumn;
    }

    public String getSuspectedVirusColumn() {
        return suspectedVirusColumn;
    }

    public void setSuspectedVirusColumn(String suspectedVirusColumn) {
        this.suspectedVirusColumn = suspectedVirusColumn;
    }

    public String getCollectionSiteColumn() {
        return collectionSiteColumn;
    }

    public void setCollectionSiteColumn(String collectionSiteColumn) {
        this.collectionSiteColumn = collectionSiteColumn;
    }

    public String getTransportMediumColumn() {
        return transportMediumColumn;
    }

    public void setTransportMediumColumn(String transportMediumColumn) {
        this.transportMediumColumn = transportMediumColumn;
    }

    public String getStorageConditionsColumn() {
        return storageConditionsColumn;
    }

    public void setStorageConditionsColumn(String storageConditionsColumn) {
        this.storageConditionsColumn = storageConditionsColumn;
    }

    public String getPriorityColumn() {
        return priorityColumn;
    }

    public void setPriorityColumn(String priorityColumn) {
        this.priorityColumn = priorityColumn;
    }

    public String getRequestingPhysicianColumn() {
        return requestingPhysicianColumn;
    }

    public void setRequestingPhysicianColumn(String requestingPhysicianColumn) {
        this.requestingPhysicianColumn = requestingPhysicianColumn;
    }

    public String getDepartmentColumn() {
        return departmentColumn;
    }

    public void setDepartmentColumn(String departmentColumn) {
        this.departmentColumn = departmentColumn;
    }

    public String getIsolationSourceColumn() {
        return isolationSourceColumn;
    }

    public void setIsolationSourceColumn(String isolationSourceColumn) {
        this.isolationSourceColumn = isolationSourceColumn;
    }

    public String getPassageHistoryColumn() {
        return passageHistoryColumn;
    }

    public void setPassageHistoryColumn(String passageHistoryColumn) {
        this.passageHistoryColumn = passageHistoryColumn;
    }

    public String getViralLoadColumn() {
        return viralLoadColumn;
    }

    public void setViralLoadColumn(String viralLoadColumn) {
        this.viralLoadColumn = viralLoadColumn;
    }

    public String getCommentsColumn() {
        return commentsColumn;
    }

    public void setCommentsColumn(String commentsColumn) {
        this.commentsColumn = commentsColumn;
    }

    // Configuration option getters and setters
    public boolean isHasHeaderRow() {
        return hasHeaderRow;
    }

    public void setHasHeaderRow(boolean hasHeaderRow) {
        this.hasHeaderRow = hasHeaderRow;
    }

    public String getDelimiter() {
        return delimiter;
    }

    public void setDelimiter(String delimiter) {
        this.delimiter = delimiter;
    }

    public String getEncoding() {
        return encoding;
    }

    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }

    /**
     * Get all required field column names
     *
     * @return Array of required column mappings
     */
    public String[] getRequiredColumns() {
        return new String[]{
            sampleIdColumn,
            patientIdColumn,
            collectionDateColumn,
            sampleTypeColumn,
            testRequestedColumn
        };
    }

    /**
     * Get all optional field column names
     *
     * @return Array of optional column mappings
     */
    public String[] getOptionalColumns() {
        return new String[]{
            clinicalHistoryColumn,
            symptomsColumn,
            suspectedVirusColumn,
            collectionSiteColumn,
            transportMediumColumn,
            storageConditionsColumn,
            priorityColumn,
            requestingPhysicianColumn,
            departmentColumn,
            isolationSourceColumn,
            passageHistoryColumn,
            viralLoadColumn,
            commentsColumn
        };
    }

    /**
     * Check if all required columns are mapped
     *
     * @return true if all required columns have values
     */
    public boolean areRequiredColumnsMapped() {
        return sampleIdColumn != null && !sampleIdColumn.trim().isEmpty() &&
               patientIdColumn != null && !patientIdColumn.trim().isEmpty() &&
               collectionDateColumn != null && !collectionDateColumn.trim().isEmpty() &&
               sampleTypeColumn != null && !sampleTypeColumn.trim().isEmpty() &&
               testRequestedColumn != null && !testRequestedColumn.trim().isEmpty();
    }
}