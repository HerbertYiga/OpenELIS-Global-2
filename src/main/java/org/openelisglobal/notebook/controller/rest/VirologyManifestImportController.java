package org.openelisglobal.notebook.controller.rest;

import org.openelisglobal.common.controller.BaseController;
import org.openelisglobal.notebook.form.VirologyManifestImportForm;
import org.openelisglobal.notebook.service.VirologyManifestImportService;
import org.openelisglobal.notebook.service.VirologyManifestImportService.ParsedManifest;
import org.openelisglobal.notebook.service.VirologyManifestImportService.VirologyManifestImportResult;
import org.openelisglobal.sample.valueholder.SampleTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * REST controller for Virology Laboratory manifest import functionality.
 * Provides endpoints for sample type retrieval, manifest preview, and import operations.
 */
@RestController
@RequestMapping("/rest/virology-manifest")
@PreAuthorize("hasRole('ROLE_USER')")
public class VirologyManifestImportController extends BaseController {

    @Autowired
    private VirologyManifestImportService virologyManifestImportService;

    @Autowired
    private SampleTypeService sampleTypeService;

    /**
     * Get all available sample types for virology workflow
     *
     * @return ResponseEntity containing list of sample types
     */
    @GetMapping("/sample-types")
    @PreAuthorize("hasAnyRole('ROLE_Virology Lab Technician', 'ROLE_Virology Microbiologist', " +
                 "'ROLE_Virology Manager', 'ROLE_Virology Principal Investigator', 'ROLE_Virology Data Manager')")
    public ResponseEntity<List<String>> getSampleTypes() {
        try {
            List<String> sampleTypes = sampleTypeService.getAllSampleTypeNames();
            return ResponseEntity.ok(sampleTypes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Preview virology manifest before importing to validate data and show preview
     *
     * @param file CSV file to preview
     * @param form Column mapping configuration
     * @param request HTTP request
     * @return ResponseEntity containing parsed manifest with validation results
     */
    @PostMapping("/preview-manifest")
    @PreAuthorize("hasAnyRole('ROLE_Virology Lab Technician', 'ROLE_Virology Microbiologist', " +
                 "'ROLE_Virology Manager', 'ROLE_Virology Principal Investigator')")
    public ResponseEntity<ParsedManifest> previewManifest(
            @RequestParam("file") MultipartFile file,
            @ModelAttribute VirologyManifestImportForm form,
            HttpServletRequest request) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            ParsedManifest result = virologyManifestImportService.parseManifest(file, form);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Import virology manifest and create samples in the system
     *
     * @param file CSV file to import
     * @param form Column mapping configuration
     * @param request HTTP request
     * @return ResponseEntity containing import results
     */
    @PostMapping("/import-manifest")
    @PreAuthorize("hasAnyRole('ROLE_Virology Manager', 'ROLE_Virology Principal Investigator')")
    public ResponseEntity<VirologyManifestImportResult> importManifest(
            @RequestParam("file") MultipartFile file,
            @ModelAttribute VirologyManifestImportForm form,
            HttpServletRequest request) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // First validate the manifest
            ParsedManifest parsedManifest = virologyManifestImportService.parseManifest(file, form);
            if (!parsedManifest.getParseErrors().isEmpty()) {
                VirologyManifestImportResult result = new VirologyManifestImportResult();
                result.setSuccess(false);
                result.setErrorMessage("Manifest contains validation errors. Please fix and try again.");
                return ResponseEntity.badRequest().body(result);
            }

            // Import the samples
            VirologyManifestImportResult result = virologyManifestImportService.importSamples(parsedManifest, getSysUserId(request));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            VirologyManifestImportResult result = new VirologyManifestImportResult();
            result.setSuccess(false);
            result.setErrorMessage("Error importing manifest: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}