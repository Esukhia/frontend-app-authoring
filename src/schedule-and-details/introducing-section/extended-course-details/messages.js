import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  extendedTitleLabel: {
    id: 'course-authoring.schedule-section.introducing.title.label',
    defaultMessage: 'Course requirement',
  },
  extendedTitleHelpText: {
    id: 'course-authoring.schedule-section.introducing.title.help-text',
    defaultMessage: 'Describe requirements for taking this course. Limit to 500 characters.',
  },
  extendedTitleAriaLabel: {
    id: 'course-authoring.schedule-section.introducing.title.aria-label',
    defaultMessage: 'Show course requirement',
  },
  extendedSubtitleLabel: {
    id: 'course-authoring.schedule-section.introducing.subtitle.label',
    defaultMessage: 'Course subtitle',
  },
  extendedSubtitleHelpText: {
    id: 'course-authoring.schedule-section.introducing.subtitle.help-text',
    defaultMessage: 'Displayed as subtitle on the course details page. Limit to 150 characters.',
  },
  extendedSubtitleAriaLabel: {
    id: 'course-authoring.schedule-section.introducing.subtitle.aria-label',
    defaultMessage: 'Show course subtitle',
  },
  extendedDurationLabel: {
    id: 'course-authoring.schedule-section.introducing.duration.label',
    defaultMessage: 'Course duration',
  },
  extendedDurationHelpText: {
    id: 'course-authoring.schedule-section.introducing.duration.help-text',
    defaultMessage: 'Displayed on the course details page. Limit to 50 characters.',
  },
  extendedDurationAriaLabel: {
    id: 'course-authoring.schedule-section.introducing.duration.aria-label',
    defaultMessage: 'Show course duration',
  },
  extendedDescriptionLabel: {
    id: 'course-authoring.schedule-section.introducing.description.label',
    defaultMessage: 'Course description',
  },
  extendedDescriptionHelpText: {
    id: 'course-authoring.schedule-section.introducing.description.help-text',
    defaultMessage: 'Displayed on the course details page. Limit to 1000 characters.',
  },
  extendedDescriptionAriaLabel: {
    id: 'course-authoring.schedule-section.introducing.description.aria-label',
    defaultMessage: 'Show course description',
  },
  courseDurationLabel: {
    id: 'course.details.duration.label',
    defaultMessage: 'Course Duration',
    description: 'Label for the expected course completion time',
  },
  courseDurationHelpText: {
    id: 'course.details.duration.helpText',
    defaultMessage: 'Estimated time required for a learner to complete this course (e.g., 5 Weeks). Displayed on the course details page',
    description: 'Help text for the course duration field',
  },
  courseDurationPlaceholder: {
    id: 'course.duration.placeholder',
    defaultMessage: 'Enter duration',
    description: 'Placeholder text for course duration input field',
  },
});

export default messages;
