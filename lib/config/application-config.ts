/**
 * Application configuration for controlling features
 * 
 * @file application-config.ts
 * @description Centralized configuration for application features
 */

export interface ApplicationConfig {
  /** Controls whether applications are enabled */
  applicationsEnabled: boolean;
  /** Main headline for maintenance modal */
  maintenanceTitle: string;
  /** Primary message to show when applications are disabled */
  maintenanceMessage: string;
  /** Secondary helpful message */
  maintenanceSubMessage: string;
  /** Date when applications will be enabled */
  enableDate: string;
  /** List of things users can do while waiting */
  availableActions: {
    icon: string;
    text: string;
  }[];
}

/**
 * 🚨 MAIN TOGGLE - Change this to control applications
 * 
 * true  = Applications ENABLED (normal operation)
 * false = Applications DISABLED (maintenance mode)
 */
const APPLICATIONS_ENABLED = false; // ← CHANGE THIS LINE

/**
 * Main application configuration
 */
export const APP_CONFIG: ApplicationConfig = {
  applicationsEnabled: APPLICATIONS_ENABLED,
  
  // 📝 Modal content
  maintenanceTitle: "Applications Open Soon!",
  
  maintenanceMessage: "Job applications aren't available yet, but you can get ready! Applications go live on June 29, 2025.",
  
  maintenanceSubMessage: "Get ahead of the competition by preparing now:",
  
  enableDate: "June 29, 2025",
  
  // 📋 Available actions for users
  availableActions: [
    {
      icon: "heart",
      text: "Save jobs you're interested in"
    },
    {
      icon: "user", 
      text: "Complete your profile to stand out"
    },
    {
      icon: "calendar",
      text: "Mark your calendar for June 29th"
    }
  ]
};

/**
 * Helper function to check if applications are enabled
 */
export const areApplicationsEnabled = (): boolean => {
  return APP_CONFIG.applicationsEnabled;
};

/**
 * Get the maintenance title
 */
export const getMaintenanceTitle = (): string => {
  return APP_CONFIG.maintenanceTitle;
};

/**
 * Get the maintenance message
 */
export const getMaintenanceMessage = (): string => {
  return APP_CONFIG.maintenanceMessage;
};

/**
 * Get the maintenance sub-message
 */
export const getMaintenanceSubMessage = (): string => {
  return APP_CONFIG.maintenanceSubMessage;
};

/**
 * Get the enable date
 */
export const getEnableDate = (): string => {
  return APP_CONFIG.enableDate;
};

/**
 * Get available actions
 */
export const getAvailableActions = () => {
  return APP_CONFIG.availableActions;
};
