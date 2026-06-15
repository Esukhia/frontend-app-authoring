export const COURSE_JSON_START = '===COURSE_JSON_START===';
export const COURSE_JSON_END = '===COURSE_JSON_END===';

export const PHASE_MARKER_RE = /===SHERAB_PHASE:\d+===/g;

export const stripPhaseMarker = (text: string): string => text.replace(PHASE_MARKER_RE, '').trim();

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
