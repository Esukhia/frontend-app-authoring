import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getChatUrl = () => `${getApiBaseUrl()}/api/ai-course-creator/chat/`;
export const getUploadUrl = () => `${getApiBaseUrl()}/api/ai-course-creator/upload/`;
export const getGenerateUrl = () => `${getApiBaseUrl()}/api/ai-course-creator/generate/`;
export const getConfigUrl = () => `${getApiBaseUrl()}/api/ai-course-creator/config/`;
export const getSessionUrl = (courseId: string) => `${getApiBaseUrl()}/api/ai-course-creator/session/?course_id=${encodeURIComponent(courseId)}`;
export const getMaterialUrl = (id: number) => `${getApiBaseUrl()}/api/ai-course-creator/material/${id}/`;

export interface ChatMessageData {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created?: string;
}

export interface MaterialData {
  id: number;
  name: string;
  sourceType: string;
}

export interface SessionData {
  id: number;
  courseId: string;
  status: string;
  messages: ChatMessageData[];
  materials: MaterialData[];
  hasCourseJson: boolean;
  currentPhase: number;
  generationStatus: string;
  generationError: string;
}

export interface GenerateCounts {
  sections: number;
  subsections: number;
  units: number;
  components: number;
}

/** Read the Django CSRF token from cookies (only works same-domain). */
const getCsrfTokenFromCookie = (): string => {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
};

/**
 * Resolve a CSRF token for the Studio host.
 *
 * The MFE runs on a different domain than Studio, so the `csrftoken` cookie is
 * not readable from `document.cookie`. We fetch the token value from Studio's
 * CSRF endpoint instead; the matching cookie is still sent automatically on the
 * streaming request via `credentials: 'include'`.
 */
const resolveCsrfToken = async (): Promise<string> => {
  const fromCookie = getCsrfTokenFromCookie();
  if (fromCookie) { return fromCookie; }
  try {
    const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/csrf/api/v1/token`);
    return data.csrfToken || data.csrf_token || '';
  } catch (e) {
    return '';
  }
};

/**
 * Stream an assistant reply via Server-Sent Events.
 *
 * We use `fetch` (not the axios http client) because axios cannot expose an
 * incremental response body in the browser. Auth relies on the JWT cookies the
 * MFE already holds (`credentials: 'include'`).
 *
 * @returns the full assistant text and whether a course outline was produced.
 */
export async function streamChat(
  courseId: string,
  message: string,
  {
    onToken, signal, editMessageId, onUserMessageId,
  }: {
    onToken: (text: string) => void;
    signal?: AbortSignal;
    editMessageId?: number;
    onUserMessageId?: (id: number) => void;
  },
): Promise<{
    fullText: string;
    hasCourseJson: boolean;
    currentPhase: number;
    userMessageId?: number;
    assistantMessageId?: number;
  }> {
  const csrfToken = await resolveCsrfToken();
  const response = await fetch(getChatUrl(), {
    method: 'POST',
    credentials: 'include',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({
      course_id: courseId,
      message,
      ...(editMessageId !== undefined ? { edit_message_id: editMessageId } : {}),
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let hasCourseJson = false;
  let currentPhase = 1;
  let userMessageId: number | undefined;
  let assistantMessageId: number | undefined;

  const handleFrame = (frame: string) => {
    const line = frame.split('\n').find((l) => l.startsWith('data:'));
    if (!line) { return; }
    try {
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.type === 'meta') {
        if (payload.userMessageId) {
          userMessageId = payload.userMessageId;
          onUserMessageId?.(payload.userMessageId);
        }
      } else if (payload.type === 'token') {
        fullText += payload.text;
        onToken(payload.text);
      } else if (payload.type === 'done') {
        hasCourseJson = Boolean(payload.hasCourseJson);
        if (payload.currentPhase) { currentPhase = payload.currentPhase; }
        if (payload.userMessageId) { userMessageId = payload.userMessageId; }
        if (payload.assistantMessageId) { assistantMessageId = payload.assistantMessageId; }
      } else if (payload.type === 'error') {
        throw new Error(payload.error);
      }
    } catch (e) {
      // Ignore frames that are not valid JSON; rethrow explicit errors.
      if (e instanceof Error && e.message && !e.message.includes('JSON')) {
        throw e;
      }
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) { break; }
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';
    frames.forEach(handleFrame);
  }
  if (buffer.trim()) { handleFrame(buffer); }

  return {
    fullText, hasCourseJson, currentPhase, userMessageId, assistantMessageId,
  };
}

/** Upload a material file. */
export async function uploadMaterialFile(courseId: string, file: File): Promise<MaterialData> {
  const formData = new FormData();
  formData.append('course_id', courseId);
  formData.append('file', file);
  const { data } = await getAuthenticatedHttpClient().post(getUploadUrl(), formData);
  return camelCaseObject(data);
}

/** Add a material by URL. */
export async function uploadMaterialLink(courseId: string, url: string): Promise<MaterialData> {
  const { data } = await getAuthenticatedHttpClient().post(getUploadUrl(), { course_id: courseId, url });
  return camelCaseObject(data);
}

/**
 * Generate the full course (structure + content) and write it into the outline
 * as draft, streaming progress over SSE.
 *
 * @returns the created-block counts once the build finishes.
 */
export async function streamGenerate(
  courseId: string,
  { onProgress, signal }: { onProgress: (message: string) => void; signal?: AbortSignal },
): Promise<{ counts: GenerateCounts }> {
  const csrfToken = await resolveCsrfToken();
  const response = await fetch(getGenerateUrl(), {
    method: 'POST',
    credentials: 'include',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ course_id: courseId }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Generate request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let counts: GenerateCounts = {
    sections: 0, subsections: 0, units: 0, components: 0,
  };
  let done = false;

  const handleFrame = (frame: string) => {
    const line = frame.split('\n').find((l) => l.startsWith('data:'));
    if (!line) { return; }
    try {
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.type === 'progress') {
        onProgress(payload.message);
      } else if (payload.type === 'done') {
        counts = { ...counts, ...(payload.counts || {}) };
        done = true;
      } else if (payload.type === 'error') {
        throw new Error(payload.error);
      }
    } catch (e) {
      if (e instanceof Error && e.message && !e.message.includes('JSON')) {
        throw e;
      }
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done: streamDone } = await reader.read();
    if (streamDone) { break; }
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';
    frames.forEach(handleFrame);
  }
  if (buffer.trim()) { handleFrame(buffer); }

  if (!done) {
    throw new Error('Generation did not finish. Please try again.');
  }
  return { counts };
}

/** Whether the AI course creator is enabled on this Studio instance. */
export async function getAiConfig(): Promise<{ enabled: boolean }> {
  const { data } = await getAuthenticatedHttpClient().get(getConfigUrl());
  return camelCaseObject(data);
}

/** Fetch the existing session so the modal can resume. */
export async function getSession(courseId: string): Promise<SessionData> {
  const { data } = await getAuthenticatedHttpClient().get(getSessionUrl(courseId));
  return camelCaseObject(data);
}

/** Reset the conversation: delete the session, its messages and materials. */
export async function resetSession(courseId: string): Promise<void> {
  await getAuthenticatedHttpClient().delete(getSessionUrl(courseId));
}

/** Delete a single uploaded material. */
export async function deleteMaterial(id: number): Promise<void> {
  await getAuthenticatedHttpClient().delete(getMaterialUrl(id));
}
