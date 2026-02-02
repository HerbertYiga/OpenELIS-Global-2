package org.openelisglobal.notebook.service;

import com.opencsv.CSVReader;
import org.openelisglobal.notebook.form.VirologyManifestImportForm;
import org.openelisglobal.sample.service.SampleService;
import org.openelisglobal.sample.valueholder.Sample;
import org.openelisglobal.samplehuman.service.SampleHumanService;
import org.openelisglobal.patient.service.PatientService;
import org.openelisglobal.patient.valueholder.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Implementation of VirologyManifestImportService for handling virology sample manifest operations.
 * Provides CSV parsing, validation, and sample import functionality for virology laboratory workflow.
 */
@Service
@Transactional
public class VirologyManifestImportServiceImpl implements VirologyManifestImportService {

    @Autowired
    private SampleService sampleService;

    @Autowired
    private SampleHumanService sampleHumanService;

    @Autowired
    private PatientService patientService;

    private final SimpleDateFormat[] dateFormats = {
        new SimpleDateFormat("yyyy-MM-dd"),
        new SimpleDateFormat("MM/dd/yyyy"),
        new SimpleDateFormat("dd/MM/yyyy"),
        new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
    };

    @Override
    public ParsedManifest parseManifest(MultipartFile file, VirologyManifestImportForm form) throws Exception {
        ParsedManifest result = new ParsedManifest();
        List<VirologyManifestRow> rows = new ArrayList<>();
        List<ParseError> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] headers = reader.readNext(); // Read header row
            if (headers == null) {
                throw new Exception("Empty CSV file");
            }

            // Create column mapping from headers and form configuration
            Map<String, Integer> columnIndexMap = createColumnMapping(headers, form);
            result.setColumnMapping(getColumnMappingDisplay(columnIndexMap, headers));

            String[] line;
            int rowNumber = 1; // Start from 1 (excluding header)

            while ((line = reader.readNext()) != null) {
                rowNumber++;

                if (isEmptyRow(line)) {
                    continue; // Skip empty rows
                }

                VirologyManifestRow row = parseRow(line, columnIndexMap, rowNumber, errors);
                if (row != null) {
                    rows.add(row);
                }
            }

            result.setRows(rows);
            result.setParseErrors(errors);

            // Perform additional validation
            validateManifestData(result);

        } catch (Exception e) {
            throw new Exception("Error parsing CSV file: " + e.getMessage(), e);
        }

        return result;
    }

    @Override
    public VirologyManifestImportResult importSamples(ParsedManifest parsedManifest, String userId) throws Exception {
        VirologyManifestImportResult result = new VirologyManifestImportResult();
        List<String> createdSampleIds = new ArrayList<>();
        int samplesCreated = 0;
        int samplesUpdated = 0;

        try {
            for (VirologyManifestRow row : parsedManifest.getRows()) {
                try {
                    // Check if sample already exists
                    Sample existingSample = sampleService.getSampleByAccessionNumber(row.getSampleId());

                    if (existingSample != null) {
                        // Update existing sample
                        updateSampleFromRow(existingSample, row, userId);
                        samplesUpdated++;
                    } else {
                        // Create new sample
                        Sample newSample = createSampleFromRow(row, userId);
                        createdSampleIds.add(newSample.getAccessionNumber());
                        samplesCreated++;
                    }
                } catch (Exception e) {
                    throw new Exception("Error processing sample " + row.getSampleId() + ": " + e.getMessage(), e);
                }
            }

            result.setSuccess(true);
            result.setSamplesCreated(samplesCreated);
            result.setSamplesUpdated(samplesUpdated);
            result.setCreatedSampleIds(createdSampleIds);

        } catch (Exception e) {
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    private Map<String, Integer> createColumnMapping(String[] headers, VirologyManifestImportForm form) {
        Map<String, Integer> columnMap = new HashMap<>();

        // Map form column configurations to header indices
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].trim();

            // Check configured mappings from form
            if (form.getSampleIdColumn() != null && form.getSampleIdColumn().equals(header)) {
                columnMap.put("sampleId", i);
            } else if (form.getPatientIdColumn() != null && form.getPatientIdColumn().equals(header)) {
                columnMap.put("patientId", i);
            } else if (form.getCollectionDateColumn() != null && form.getCollectionDateColumn().equals(header)) {
                columnMap.put("collectionDate", i);
            } else if (form.getSampleTypeColumn() != null && form.getSampleTypeColumn().equals(header)) {
                columnMap.put("sampleType", i);
            } else if (form.getClinicalHistoryColumn() != null && form.getClinicalHistoryColumn().equals(header)) {
                columnMap.put("clinicalHistory", i);
            }
            // Add more mappings as needed for other columns
        }

        return columnMap;
    }

    private Map<String, String> getColumnMappingDisplay(Map<String, Integer> columnIndexMap, String[] headers) {
        Map<String, String> displayMapping = new HashMap<>();

        for (Map.Entry<String, Integer> entry : columnIndexMap.entrySet()) {
            displayMapping.put(entry.getKey(), headers[entry.getValue()]);
        }

        return displayMapping;
    }

    private boolean isEmptyRow(String[] line) {
        if (line == null || line.length == 0) {
            return true;
        }

        for (String cell : line) {
            if (cell != null && !cell.trim().isEmpty()) {
                return false;
            }
        }

        return true;
    }

    private VirologyManifestRow parseRow(String[] line, Map<String, Integer> columnMap, int rowNumber, List<ParseError> errors) {
        VirologyManifestRow row = new VirologyManifestRow();
        boolean hasRequiredFields = true;

        // Parse required fields
        if (columnMap.containsKey("sampleId")) {
            String sampleId = getColumnValue(line, columnMap.get("sampleId"));
            if (sampleId == null || sampleId.trim().isEmpty()) {
                errors.add(new ParseError(rowNumber, "sampleId", "Sample ID is required"));
                hasRequiredFields = false;
            } else {
                row.setSampleId(sampleId.trim());
            }
        } else {
            errors.add(new ParseError(rowNumber, "sampleId", "Sample ID column not mapped"));
            hasRequiredFields = false;
        }

        if (columnMap.containsKey("patientId")) {
            String patientId = getColumnValue(line, columnMap.get("patientId"));
            if (patientId == null || patientId.trim().isEmpty()) {
                errors.add(new ParseError(rowNumber, "patientId", "Patient ID is required"));
                hasRequiredFields = false;
            } else {
                row.setPatientId(patientId.trim());
            }
        }

        if (columnMap.containsKey("sampleType")) {
            String sampleType = getColumnValue(line, columnMap.get("sampleType"));
            if (sampleType == null || sampleType.trim().isEmpty()) {
                errors.add(new ParseError(rowNumber, "sampleType", "Sample Type is required"));
                hasRequiredFields = false;
            } else {
                row.setSampleType(sampleType.trim());
            }
        }

        // Parse collection date with validation
        if (columnMap.containsKey("collectionDate")) {
            String collectionDate = getColumnValue(line, columnMap.get("collectionDate"));
            if (collectionDate != null && !collectionDate.trim().isEmpty()) {
                if (isValidDate(collectionDate.trim())) {
                    row.setCollectionDate(collectionDate.trim());
                } else {
                    errors.add(new ParseError(rowNumber, "collectionDate", "Invalid date format"));
                }
            }
        }

        // Parse optional fields
        if (columnMap.containsKey("clinicalHistory")) {
            row.setClinicalHistory(getColumnValue(line, columnMap.get("clinicalHistory")));
        }

        // Add more field parsing as needed...

        return hasRequiredFields ? row : null;
    }

    private String getColumnValue(String[] line, int index) {
        if (index < 0 || index >= line.length) {
            return null;
        }
        return line[index];
    }

    private boolean isValidDate(String dateStr) {
        for (SimpleDateFormat format : dateFormats) {
            try {
                format.parse(dateStr);
                return true;
            } catch (ParseException e) {
                // Continue trying other formats
            }
        }
        return false;
    }

    private void validateManifestData(ParsedManifest manifest) {
        List<ParseError> errors = manifest.getParseErrors();
        Set<String> sampleIds = new HashSet<>();

        // Check for duplicate sample IDs
        for (int i = 0; i < manifest.getRows().size(); i++) {
            VirologyManifestRow row = manifest.getRows().get(i);
            String sampleId = row.getSampleId();

            if (sampleIds.contains(sampleId)) {
                errors.add(new ParseError(i + 2, "sampleId", "Duplicate sample ID: " + sampleId));
            } else {
                sampleIds.add(sampleId);
            }
        }
    }

    private Sample createSampleFromRow(VirologyManifestRow row, String userId) throws Exception {
        Sample sample = new Sample();

        // Set basic sample properties
        sample.setAccessionNumber(row.getSampleId());
        sample.setEnteredDate(new Date());
        sample.setReceivedDate(new Date());

        // Parse and set collection date
        if (row.getCollectionDate() != null) {
            Date collectionDate = parseDate(row.getCollectionDate());
            if (collectionDate != null) {
                sample.setCollectionDate(collectionDate);
            }
        }

        // Set sample type, clinical history, etc.
        // This would require additional mapping to internal sample types

        // Save sample
        sampleService.save(sample);

        // Create patient relationship if needed
        if (row.getPatientId() != null) {
            Patient patient = patientService.getPatientByNationalId(row.getPatientId());
            if (patient != null) {
                // Link sample to patient
                // This would require SampleHuman entity creation
            }
        }

        return sample;
    }

    private void updateSampleFromRow(Sample sample, VirologyManifestRow row, String userId) throws Exception {
        // Update sample properties from manifest row
        if (row.getCollectionDate() != null) {
            Date collectionDate = parseDate(row.getCollectionDate());
            if (collectionDate != null) {
                sample.setCollectionDate(collectionDate);
            }
        }

        // Update other properties as needed
        sampleService.update(sample);
    }

    private Date parseDate(String dateStr) {
        for (SimpleDateFormat format : dateFormats) {
            try {
                return format.parse(dateStr);
            } catch (ParseException e) {
                // Continue trying other formats
            }
        }
        return null;
    }
}