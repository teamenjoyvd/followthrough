/**
 * Human-readable labels for action_type values in action_log.
 * Used by /history feed and undo toast labels.
 */
export const ACTION_LOG_LABELS: Record<string, string> = {
  markDone: 'Marked done',
  snoozeContact: 'Snoozed',
  pinContact: 'Added to focus list',
  unpinContact: 'Removed from focus list',
  updateContact: 'Updated contact',
  updateContactDescription: 'Edited notes',
  updatePipelineStatus: 'Changed pipeline status',
  moveContact: 'Moved in pipeline',
  logCall: 'Logged a call',
  logEmail: 'Logged an email',
  logNote: 'Added a note',
  markInboxItemRead: 'Marked inbox item read',
  addPhoneNumber: 'Added phone number',
  updatePhoneNumber: 'Updated phone number',
  deletePhoneNumber: 'Deleted phone number',
  addSocialLink: 'Added social link',
  updateSocialLink: 'Updated social link',
  deleteSocialLink: 'Deleted social link',
  addToWorkingList: 'Added to focus list',
  removeFromWorkingList: 'Removed from focus list',
  createContact: 'Created contact',
  deleteContact: 'Deleted contact',
  bulkDeleteContacts: 'Bulk deleted contacts',
  deleteInteraction: 'Deleted interaction',
  rollbackCSVImport: 'Rolled back CSV import',
  disconnectGoogle: 'Disconnected Google',
  bulkUpdateContacts: 'Bulk updated contacts',
  updateProfile: 'Updated profile',
  updateFollowupRules: 'Updated follow-up rules',
}

/**
 * Returns a display label for any action_type string, including undo_ variants.
 */
export function getActionLabel(actionType: string): string {
  if (actionType.startsWith('undo_')) {
    const original = actionType.slice(5)
    const originalLabel = ACTION_LOG_LABELS[original]
    return originalLabel ? `Undid: ${originalLabel}` : `Undid: ${original}`
  }
  return ACTION_LOG_LABELS[actionType] ?? actionType
}
