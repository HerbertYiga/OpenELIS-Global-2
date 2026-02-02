# Virology Laboratory Workflow Implementation

## Overview

This implementation provides a comprehensive Virology Laboratory workflow for the OpenELIS system, adapted from the existing Genomics & Bioinformatics Laboratory (GBD) structure. The workflow supports viral sample processing, testing, and result management.

## Features

### 10-Page Workflow
1. **Sample Reception & Registration** - Sample intake and manifest import
2. **Sample Preparation & Processing** - Sample processing and aliquoting
3. **Viral Culture & Isolation** - Virus culture and isolation procedures
4. **Molecular Testing (PCR/RT-PCR)** - Molecular diagnostic testing
5. **Antigen Testing** - Rapid antigen testing procedures
6. **Serology & Antibody Testing** - Serological testing workflows
7. **Microscopy & Staining** - Microscopic examination procedures
8. **Quality Control & Validation** - QC and validation procedures
9. **Results Analysis & Interpretation** - Result analysis and reporting
10. **Storage & Documentation** - Sample storage and documentation

### Role-Based Access Control (RBAC)
- **5 System Roles**: Lab Technician, Microbiologist, Manager, Principal Investigator, Data Manager
- **3 Permission Levels**: VIEW (read-only), UPDATE (edit), FULL (complete control)
- **Page-specific access**: Each role has different permissions per workflow page

### Manifest Import System
- CSV file import with 18+ configurable fields
- Column mapping interface with auto-detection
- Data validation and error reporting
- Preview functionality before import
- Support for both required and optional fields

## File Structure

### Database Migrations
- `src/main/resources/liquibase/3.4.x.x/001-virology-notebook-template.xml` - Creates workflow template
- `src/main/resources/liquibase/3.4.x.x/002-virology-system-roles.xml` - Creates system roles
- `src/main/resources/liquibase/3.4.x.x/003-virology-page-roles.xml` - Page-level access control
- `src/main/resources/liquibase/3.4.x.x/004-virology-permission-levels.xml` - Action-level permissions
- `src/main/resources/liquibase/3.4.x.x/005-create-virology-lab-unit.xml` - Creates lab unit
- `src/main/resources/liquibase/3.4.x.x/006-add-virology-roles-to-alllabunits.xml` - Admin access setup

### Backend Components
- `VirologyManifestImportController.java` - REST endpoints for manifest import
- `VirologyManifestImportService.java` - Service interface
- `VirologyManifestImportServiceImpl.java` - Service implementation
- `VirologyManifestImportForm.java` - Form class for column mapping

### Frontend Components
- `VirologyWorkflowTab.js` - Main workflow container component
- `VirologyManifestImportModal.js` - CSV import modal
- `useVirologyPermissions.js` - React hook for permission management
- Page Components:
  - `VirologySampleReceptionPageEnhanced.js` - Sample reception (complete implementation)
  - `VirologyMolecularTestingPage.js` - Molecular testing (complete implementation)
  - Additional page placeholders for remaining 8 pages

### Integration
- Modified `NoteBookInstanceEntryForm.js` to conditionally render VirologyWorkflowTab
- Added 80+ localization keys to `frontend/src/languages/en.json`

### Test Data
- `test-data/Virology_Manifest_Sample.csv` - Sample manifest for testing import functionality

## Usage

### Setup
1. Run database migrations to create virology tables and roles
2. Assign users to appropriate virology roles
3. Create a notebook template with title "Virology Laboratory"

### Workflow Usage
1. Create a new notebook entry using the Virology Laboratory template
2. Navigate to the Workflow tab
3. The system will automatically render the VirologyWorkflowTab component
4. Progress through the 10-page workflow based on role permissions
5. Use manifest import to bulk import samples from CSV files

### Manifest Import
1. Click "Import Manifest" on the Sample Reception page
2. Upload a CSV file with sample data
3. Map CSV columns to virology fields
4. Preview and validate data
5. Import samples into the system

## Permission System

### Role Hierarchy (Highest to Lowest)
1. Virology Principal Investigator - Full access to all pages
2. Virology Manager - Management oversight and control
3. Virology Microbiologist - Technical operations and analysis
4. Virology Data Manager - Data management and reporting
5. Virology Lab Technician - Basic laboratory operations

### Permission Matrix
| Page | Technician | Microbiologist | Manager | PI | Data Manager |
|------|-----------|----------------|---------|----|-----------  |
| Sample Reception | UPDATE | UPDATE | FULL | FULL | VIEW |
| Sample Preparation | UPDATE | UPDATE | FULL | FULL | - |
| Viral Culture | - | UPDATE | FULL | FULL | - |
| Molecular Testing | UPDATE | UPDATE | FULL | FULL | - |
| Antigen Testing | UPDATE | UPDATE | FULL | FULL | - |
| Serology Testing | UPDATE | UPDATE | FULL | FULL | - |
| Microscopy | UPDATE | UPDATE | FULL | FULL | - |
| Quality Control | - | - | FULL | FULL | - |
| Results Analysis | - | UPDATE | FULL | FULL | VIEW |
| Storage | UPDATE | UPDATE | FULL | FULL | VIEW |

## Configuration

### Required CSV Fields
- Sample ID (unique identifier)
- Patient ID (patient identifier)
- Collection Date (YYYY-MM-DD format)
- Sample Type (serum, swab, etc.)
- Test Requested (type of test)

### Optional CSV Fields
- Clinical History
- Symptoms
- Suspected Virus
- Collection Site
- Transport Medium
- Storage Conditions
- Priority
- Requesting Physician
- Department
- Isolation Source
- Passage History
- Viral Load
- Comments

## Development Notes

### Extension Points
- Additional page components can be implemented by following the pattern in existing pages
- New test types can be added to the molecular testing configuration
- Additional roles can be created through database migrations
- Custom validation rules can be added to the manifest import service

### Performance Considerations
- Manifest import is designed for batch processing of up to 1000 samples
- Permission checks are cached at the hook level for performance
- Large datasets should be paginated in the UI components

### Future Enhancements
- Integration with LIMS systems
- Automated result interpretation
- Report generation and export
- Integration with external viral databases
- Electronic signature support for critical results

## Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure user has appropriate virology role assigned
2. **Manifest Import Fails**: Check CSV format and required field mapping
3. **Workflow Not Showing**: Verify notebook template title is exactly "Virology Laboratory"
4. **Database Errors**: Ensure all migration files have been executed

### Support
For technical support or feature requests, consult the OpenELIS documentation or contact the development team.