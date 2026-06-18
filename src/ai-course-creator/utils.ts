export const COURSE_JSON_START = '===COURSE_JSON_START===';
export const COURSE_JSON_END = '===COURSE_JSON_END===';

export const SECTION_EDITS_START = '===SECTION_EDITS_START===';
export const SECTION_EDITS_END = '===SECTION_EDITS_END===';

export const PHASE_MARKER_RE = /===SHERAB_PHASE:\d+===/g;

// Matches a complete OR partially-streamed marker at the very start of a message,
// e.g. "===", "===SHERAB_PHASE", "===SHERAB_PHASE:2", "===SHERAB_PHASE:2===".
// Since every message now begins with a marker, this prevents it from briefly
// flashing on screen while the first tokens stream in.
const LEADING_PARTIAL_MARKER_RE = /^={2,3}[A-Z_]*:?\d*={0,3}/;

export const stripPhaseMarker = (text: string): string => text
  .replace(PHASE_MARKER_RE, '')
  .replace(LEADING_PARTIAL_MARKER_RE, '')
  .trim();

/**
 * Remove the machine-readable COURSE_JSON block (and anything after an opening
 * marker that hasn't closed yet) so it is never shown to the user, even while
 * the reply is still streaming in.
 */
export const stripCourseJson = (text: string): string => {
  const startIdx = text.indexOf(COURSE_JSON_START);
  if (startIdx === -1) {
    return text;
  }
  const before = text.slice(0, startIdx);
  const endIdx = text.indexOf(COURSE_JSON_END);
  const after = endIdx === -1 ? '' : text.slice(endIdx + COURSE_JSON_END.length);
  return (before + after).trim();
};

/**
 * Remove the machine-readable SECTION_EDITS block from a per-section editor
 * reply. Handles the still-open case while streaming (drops everything from the
 * opening marker on, plus a partially-typed opening marker at the tail) so the
 * raw JSON never flashes on screen.
 */
export const stripSectionEdits = (text: string): string => {
  const startIdx = text.indexOf(SECTION_EDITS_START);
  if (startIdx !== -1) {
    const before = text.slice(0, startIdx);
    const endIdx = text.indexOf(SECTION_EDITS_END);
    const after = endIdx === -1 ? '' : text.slice(endIdx + SECTION_EDITS_END.length);
    return (before + after).trim();
  }
  // Hide a partial opening marker as it streams in (e.g. "===SECTION_ED").
  return text.replace(/===S?E?C?T?I?O?N?_?E?D?I?T?S?_?S?T?A?R?T?=*$/, '').trim();
};
