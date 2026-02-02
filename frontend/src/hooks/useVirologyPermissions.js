import { useState, useEffect, useCallback } from 'react';
import { getUserService } from '../components/utils/UserService';

/**
 * Custom React hook for Virology Laboratory permissions management
 * Implements 3-layer Role-Based Access Control (RBAC):
 * 1. System roles - User must have one of the virology roles
 * 2. Page access - Role must be granted access to specific workflow pages
 * 3. Action permissions - Role must have appropriate permission level (VIEW, UPDATE, FULL)
 */
const useVirologyPermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define virology system roles
  const virologyRoles = [
    'Virology Lab Technician',
    'Virology Microbiologist',
    'Virology Manager',
    'Virology Principal Investigator',
    'Virology Data Manager'
  ];

  // Define workflow page types
  const virologyPageTypes = [
    'virology-sample-reception',
    'virology-sample-preparation',
    'virology-viral-culture',
    'virology-molecular-testing',
    'virology-antigen-testing',
    'virology-serology-testing',
    'virology-microscopy-staining',
    'virology-quality-control',
    'virology-results-analysis',
    'virology-storage-documentation'
  ];

  // Permission levels
  const permissionLevels = ['VIEW', 'UPDATE', 'FULL'];

  // Fetch user roles and permissions
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user info
      const userInfo = await getUserService().getCurrentUser();
      if (!userInfo) {
        throw new Error('User not authenticated');
      }

      const currentUserRoles = userInfo.systemUserRoles || [];
      setUserRoles(currentUserRoles);

      // Check if user has any virology roles
      const hasVirologyRole = currentUserRoles.some(role =>
        virologyRoles.includes(role.role?.name)
      );

      if (!hasVirologyRole) {
        setPermissions({});
        return;
      }

      // Fetch detailed permissions for virology pages
      const permissionsResponse = await fetch('/rest/user/virology-permissions');
      if (!permissionsResponse.ok) {
        throw new Error('Failed to fetch virology permissions');
      }

      const permissionsData = await permissionsResponse.json();
      setPermissions(permissionsData);

    } catch (err) {
      console.error('Error fetching virology permissions:', err);
      setError(err.message);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if user has access to a specific virology workflow page
   * @param {string} pageType - The page type identifier
   * @returns {boolean} - True if user has access to the page
   */
  const hasPageAccess = useCallback((pageType) => {
    if (!virologyPageTypes.includes(pageType)) {
      return false;
    }

    // Check if user has any virology role
    const hasVirologyRole = userRoles.some(role =>
      virologyRoles.includes(role.role?.name)
    );

    if (!hasVirologyRole) {
      return false;
    }

    // Check page-specific access in permissions
    const pagePermissions = permissions[pageType];
    return pagePermissions && pagePermissions.hasAccess;
  }, [userRoles, permissions]);

  /**
   * Check if user has a specific permission level for a page
   * @param {string} pageType - The page type identifier
   * @param {string} level - Permission level (VIEW, UPDATE, FULL)
   * @returns {boolean} - True if user has the required permission level
   */
  const hasPermissionLevel = useCallback((pageType, level) => {
    if (!hasPageAccess(pageType)) {
      return false;
    }

    if (!permissionLevels.includes(level)) {
      return false;
    }

    const pagePermissions = permissions[pageType];
    if (!pagePermissions) {
      return false;
    }

    // Check specific permission level
    const userLevel = pagePermissions.permissionLevel;

    // Permission hierarchy: FULL > UPDATE > VIEW
    switch (level) {
      case 'VIEW':
        return ['VIEW', 'UPDATE', 'FULL'].includes(userLevel);
      case 'UPDATE':
        return ['UPDATE', 'FULL'].includes(userLevel);
      case 'FULL':
        return userLevel === 'FULL';
      default:
        return false;
    }
  }, [hasPageAccess, permissions]);

  /**
   * Check if user can read data on a specific page
   * @param {string} pageType - The page type identifier
   * @returns {boolean} - True if user can read data
   */
  const canReadPage = useCallback((pageType) => {
    return hasPermissionLevel(pageType, 'VIEW');
  }, [hasPermissionLevel]);

  /**
   * Check if user can edit data on a specific page
   * @param {string} pageType - The page type identifier
   * @returns {boolean} - True if user can edit data
   */
  const canEditPage = useCallback((pageType) => {
    return hasPermissionLevel(pageType, 'UPDATE');
  }, [hasPermissionLevel]);

  /**
   * Check if user has full control over a specific page
   * @param {string} pageType - The page type identifier
   * @returns {boolean} - True if user has full control
   */
  const canManagePage = useCallback((pageType) => {
    return hasPermissionLevel(pageType, 'FULL');
  }, [hasPermissionLevel]);

  /**
   * Get user's highest role in the virology system
   * @returns {string|null} - Highest role name or null
   */
  const getHighestVirologyRole = useCallback(() => {
    const userVirologyRoles = userRoles
      .filter(role => virologyRoles.includes(role.role?.name))
      .map(role => role.role.name);

    // Role hierarchy (highest to lowest)
    const roleHierarchy = [
      'Virology Principal Investigator',
      'Virology Manager',
      'Virology Microbiologist',
      'Virology Data Manager',
      'Virology Lab Technician'
    ];

    for (const role of roleHierarchy) {
      if (userVirologyRoles.includes(role)) {
        return role;
      }
    }

    return null;
  }, [userRoles]);

  /**
   * Check if user is in a management role (Manager or PI)
   * @returns {boolean} - True if user is in management
   */
  const isManager = useCallback(() => {
    const managementRoles = ['Virology Manager', 'Virology Principal Investigator'];
    return userRoles.some(role =>
      managementRoles.includes(role.role?.name)
    );
  }, [userRoles]);

  /**
   * Check if user can import manifest files
   * @returns {boolean} - True if user can import manifests
   */
  const canImportManifest = useCallback(() => {
    // Only certain roles can import manifests
    const importRoles = [
      'Virology Manager',
      'Virology Principal Investigator',
      'Virology Microbiologist'
    ];

    return userRoles.some(role =>
      importRoles.includes(role.role?.name)
    );
  }, [userRoles]);

  /**
   * Get all accessible pages for the current user
   * @returns {string[]} - Array of accessible page type identifiers
   */
  const getAccessiblePages = useCallback(() => {
    return virologyPageTypes.filter(pageType => hasPageAccess(pageType));
  }, [hasPageAccess]);

  /**
   * Get permission summary for all pages
   * @returns {Object} - Object mapping page types to permission details
   */
  const getPermissionSummary = useCallback(() => {
    const summary = {};

    virologyPageTypes.forEach(pageType => {
      summary[pageType] = {
        hasAccess: hasPageAccess(pageType),
        canRead: canReadPage(pageType),
        canEdit: canEditPage(pageType),
        canManage: canManagePage(pageType),
        permissionLevel: permissions[pageType]?.permissionLevel || 'NONE'
      };
    });

    return summary;
  }, [hasPageAccess, canReadPage, canEditPage, canManagePage, permissions]);

  /**
   * Check if user has any virology access at all
   * @returns {boolean} - True if user has any virology permissions
   */
  const hasVirologyAccess = useCallback(() => {
    return userRoles.some(role =>
      virologyRoles.includes(role.role?.name)
    );
  }, [userRoles]);

  // Return hook interface
  return {
    // State
    loading,
    error,
    userRoles,
    permissions,

    // Core permission checks
    hasPageAccess,
    hasPermissionLevel,

    // Convenience methods
    canReadPage,
    canEditPage,
    canManagePage,

    // Role checks
    getHighestVirologyRole,
    isManager,
    hasVirologyAccess,

    // Feature-specific checks
    canImportManifest,

    // Utility methods
    getAccessiblePages,
    getPermissionSummary,

    // Actions
    refreshPermissions: fetchPermissions
  };
};

export { useVirologyPermissions };