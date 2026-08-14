import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  launchButton: {
    id: 'course-authoring.ai-course-creator.launch.button',
    defaultMessage: 'Create with AI assistant',
    description: 'Button on the empty course outline that opens the AI course-creator chatbot',
  },
  launchButtonDescription: {
    id: 'course-authoring.ai-course-creator.launch.description',
    defaultMessage: 'Let SherabAI interview you and build your course outline automatically.',
    description: 'Helper text under the AI assistant launch button',
  },
  modalTitle: {
    id: 'course-authoring.ai-course-creator.modal.title',
    defaultMessage: 'SherabAI · AI course designer',
    description: 'Title of the AI course-creator modal',
  },
  inputPlaceholder: {
    id: 'course-authoring.ai-course-creator.input.placeholder',
    defaultMessage: 'Type your reply…',
    description: 'Placeholder for the chat input',
  },
  sendButton: {
    id: 'course-authoring.ai-course-creator.send.button',
    defaultMessage: 'Send',
    description: 'Label for the send-message button',
  },
  thinking: {
    id: 'course-authoring.ai-course-creator.thinking',
    defaultMessage: 'SherabAI is thinking…',
    description: 'Shown while the assistant reply is streaming',
  },
  materialsHeading: {
    id: 'course-authoring.ai-course-creator.materials.heading',
    defaultMessage: 'Materials',
    description: 'Heading for the uploaded materials area',
  },
  dropzoneLabel: {
    id: 'course-authoring.ai-course-creator.dropzone.label',
    defaultMessage: 'Drop a PDF, DOCX, PPTX or text file here, or click to browse',
    description: 'Label inside the material dropzone',
  },
  addLinkButton: {
    id: 'course-authoring.ai-course-creator.add-link.button',
    defaultMessage: 'Add link',
    description: 'Button to open the inline link input',
  },
  addLinkPlaceholder: {
    id: 'course-authoring.ai-course-creator.add-link.placeholder',
    defaultMessage: 'Paste a public URL…',
    description: 'Placeholder for the inline link input',
  },
  addLinkConfirm: {
    id: 'course-authoring.ai-course-creator.add-link.confirm',
    defaultMessage: 'Add',
    description: 'Confirm button for the inline link input',
  },
  generateButton: {
    id: 'course-authoring.ai-course-creator.generate.button',
    defaultMessage: 'Generate course',
    description: 'Button that generates the full course content and writes it to the outline',
  },
  retryGenerateButton: {
    id: 'course-authoring.ai-course-creator.generate.retry',
    defaultMessage: 'Retry generation',
    description: 'Button to retry course generation after a failure',
  },
  generating: {
    id: 'course-authoring.ai-course-creator.generating',
    defaultMessage: 'Generating…',
    description: 'Shown on the button while the course is being generated',
  },
  generateStarting: {
    id: 'course-authoring.ai-course-creator.generate.starting',
    defaultMessage: 'Starting generation…',
    description: 'Initial progress message when generation begins',
  },
  generateDoneTitle: {
    id: 'course-authoring.ai-course-creator.generate.done.title',
    defaultMessage: 'Course created 🎉',
    description: 'Heading of the success panel after generation completes',
  },
  goToOutlineButton: {
    id: 'course-authoring.ai-course-creator.generate.go-to-outline',
    defaultMessage: 'Go to outline',
    description: 'Button that closes the modal and shows the freshly built outline',
  },
  generateSuccess: {
    id: 'course-authoring.ai-course-creator.generate.success',
    defaultMessage: 'Created {sections} sections, {subsections} subsections, {units} units and {components} components.',
    description: 'Toast after the course structure is created',
  },
  uploadError: {
    id: 'course-authoring.ai-course-creator.upload.error',
    defaultMessage: 'Could not add that material.',
    description: 'Error shown when a material upload fails',
  },
  genericError: {
    id: 'course-authoring.ai-course-creator.error.generic',
    defaultMessage: 'Something went wrong. Please try again.',
    description: 'Generic error message',
  },
  closeButton: {
    id: 'course-authoring.ai-course-creator.close.button',
    defaultMessage: 'Close',
    description: 'Label for the modal close button',
  },
  resetButton: {
    id: 'course-authoring.ai-course-creator.reset.button',
    defaultMessage: 'Start over',
    description: 'Button that resets the conversation',
  },
  resetConfirmTitle: {
    id: 'course-authoring.ai-course-creator.reset.confirm.title',
    defaultMessage: 'Start over?',
    description: 'Title of the reset confirmation dialog',
  },
  resetConfirm: {
    id: 'course-authoring.ai-course-creator.reset.confirm',
    defaultMessage: 'This will clear the whole conversation and all uploaded materials.',
    description: 'Body text of the reset confirmation dialog',
  },
  cancelButton: {
    id: 'course-authoring.ai-course-creator.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the reset confirmation dialog',
  },
  removeMaterial: {
    id: 'course-authoring.ai-course-creator.material.remove',
    defaultMessage: 'Remove {name}',
    description: 'Accessible label for the remove-material button',
  },
  editMessage: {
    id: 'course-authoring.ai-course-creator.message.edit',
    defaultMessage: 'Edit message',
    description: 'Accessible label for the edit button on a sent user message',
  },
  saveEdit: {
    id: 'course-authoring.ai-course-creator.message.edit.save',
    defaultMessage: 'Save & resend',
    description: 'Button that saves an edited message and resends it',
  },
  cancelEdit: {
    id: 'course-authoring.ai-course-creator.message.edit.cancel',
    defaultMessage: 'Cancel',
    description: 'Button that cancels editing a message',
  },
  editWarning: {
    id: 'course-authoring.ai-course-creator.message.edit.warning',
    defaultMessage: 'Editing this message will discard the replies that came after it.',
    description: 'Helper text shown while editing a previous message',
  },
  phaseLabel1: {
    id: 'course-authoring.ai-course-creator.phase.label.1',
    defaultMessage: 'Learner',
    description: 'Label for phase 1 (Learner Empathy) in the phase indicator',
  },
  phaseLabel2: {
    id: 'course-authoring.ai-course-creator.phase.label.2',
    defaultMessage: 'Transformation',
    description: 'Label for phase 2 (Zero-to-Hero) in the phase indicator',
  },
  phaseLabel3: {
    id: 'course-authoring.ai-course-creator.phase.label.3',
    defaultMessage: 'Assessment',
    description: 'Label for phase 3 (Assessment Design) in the phase indicator',
  },
  phaseLabel4: {
    id: 'course-authoring.ai-course-creator.phase.label.4',
    defaultMessage: 'Generate',
    description: 'Label for phase 4 (Course Generation) in the phase indicator',
  },
  // --- Per-section editor ("Edit with SherabAI") ---
  sectionBannerTitle: {
    id: 'course-authoring.ai-course-creator.section.banner.title',
    defaultMessage: 'Optimize your course with AI',
    description: 'Title of the banner above the section list that opens the section editor',
  },
  sectionBannerSubtitle: {
    id: 'course-authoring.ai-course-creator.section.banner.subtitle',
    defaultMessage: 'Generate objectives, simplify content, or get custom help for your sections.',
    description: 'Subtitle of the section-editor banner',
  },
  sectionEditButton: {
    id: 'course-authoring.ai-course-creator.section.edit.button',
    defaultMessage: 'Edit with SherabAI',
    description: 'Button that opens the per-section AI editor sidebar',
  },
  sectionEditorTitle: {
    id: 'course-authoring.ai-course-creator.section.editor.title',
    defaultMessage: 'Edit with SherabAI',
    description: 'Title of the section editor sidebar',
  },
  sectionSelectLabel: {
    id: 'course-authoring.ai-course-creator.section.select.label',
    defaultMessage: 'Choose a section to edit',
    description: 'Label for the section dropdown in the editor sidebar',
  },
  sectionSelectPlaceholder: {
    id: 'course-authoring.ai-course-creator.section.select.placeholder',
    defaultMessage: 'Select a section…',
    description: 'Placeholder option in the section dropdown',
  },
  sectionSelectHint: {
    id: 'course-authoring.ai-course-creator.section.select.hint',
    defaultMessage: 'Pick a section above to start editing it with SherabAI.',
    description: 'Hint shown before a section is selected',
  },
  zeroToHeroHeading: {
    id: 'course-authoring.ai-course-creator.section.zero-to-hero',
    defaultMessage: 'Zero-to-hero: {sectionName}',
    description: 'Sub-heading shown above the chat once a section is selected',
  },
  sectionApplyButton: {
    id: 'course-authoring.ai-course-creator.section.apply.button',
    defaultMessage: 'Apply changes',
    description: 'Button that commits the proposed section edits',
  },
  sectionApplyHint: {
    id: 'course-authoring.ai-course-creator.section.apply.hint',
    defaultMessage: 'Chat to propose changes, then apply them.',
    description: 'Helper text shown next to the apply button before changes are ready',
  },
  sectionApplyReady: {
    id: 'course-authoring.ai-course-creator.section.apply.ready',
    defaultMessage: 'Changes ready to apply (saved as draft).',
    description: 'Helper text shown when the assistant has proposed applyable changes',
  },
  sectionApplying: {
    id: 'course-authoring.ai-course-creator.section.applying',
    defaultMessage: 'Applying…',
    description: 'Shown on the apply button while edits are being committed',
  },
  sectionApplySuccess: {
    id: 'course-authoring.ai-course-creator.section.apply.success',
    defaultMessage: 'Updated “{sectionName}”: {updated} edited, {created} added, {deleted} removed.',
    description: 'Toast after section edits are applied',
  },
  closeSidebar: {
    id: 'course-authoring.ai-course-creator.section.close',
    defaultMessage: 'Close',
    description: 'Accessible label for the sidebar close button',
  },
});

export default messages;
