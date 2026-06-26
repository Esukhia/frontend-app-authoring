import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Form, Icon, IconButton,
} from '@openedx/paragon';
import {
  AutoAwesome as SparkleIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
} from '@openedx/paragon/icons';

import ChatMessageBubble from './ChatMessageBubble';
import {
  applySectionEdits, getSectionSession, resetSectionSession, streamSectionChat,
  type ChatMessageData,
} from './data/api';
import { stripPhaseMarker, stripSectionEdits } from './utils';
import messages from './messages';

interface SectionOption {
  usageKey: string;
  displayName: string;
}

interface Props {
  courseId: string;
  isOpen: boolean;
  sections: SectionOption[];
  onClose: () => void;
  onApplied: (summary: {
    sectionName: string;
    counts: { updated: number; created: number; deleted: number; reordered: number };
  }) => void;
}

// Strip the SECTION_EDITS block FIRST: stripPhaseMarker's greedy leading-marker
// regex would otherwise eat the "===SECTION_EDITS_START===" opener and leave the
// raw JSON behind.
const cleanForDisplay = (text: string) => stripPhaseMarker(stripSectionEdits(text));

/**
 * Right-side drawer that edits ONE section conversationally. The creator picks a
 * section, chats with Sherab (themed on the section's zero-to-hero arc), and
 * commits the proposed edits with the Apply button. Each section keeps its own
 * thread so switching the dropdown is non-destructive.
 */
const SectionEditorSidebar = ({
  courseId, isOpen, sections, onClose, onApplied,
}: Props) => {
  const intl = useIntl();
  const [selectedKey, setSelectedKey] = useState('');
  const [chatBySection, setChatBySection] = useState<Record<string, ChatMessageData[]>>({});
  const [canApplyBySection, setCanApplyBySection] = useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  const threadEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textareaRef = useRef<any>(null);
  // Sections we've already loaded/initialised this page session, so re-renders
  // don't re-fetch or fire duplicate openers.
  const loadedRef = useRef<Set<string>>(new Set());

  const chatMessages = selectedKey ? (chatBySection[selectedKey] || []) : [];
  const canApply = selectedKey ? Boolean(canApplyBySection[selectedKey]) : false;

  const appendMessage = useCallback((key: string, message: ChatMessageData) => {
    setChatBySection((prev) => ({ ...prev, [key]: [...(prev[key] || []), message] }));
  }, []);

  const runChat = useCallback(async (sectionKey: string, message: string, opts: { editMessageId?: number } = {}) => {
    setError('');
    setCanApplyBySection((prev) => ({ ...prev, [sectionKey]: false }));
    setIsStreaming(true);
    setStreamingText('');

    const tagUserMessage = (id: number) => setChatBySection((prev) => {
      const thread = [...(prev[sectionKey] || [])];
      for (let i = thread.length - 1; i >= 0; i -= 1) {
        if (thread[i].role === 'user' && thread[i].id === undefined) {
          thread[i] = { ...thread[i], id };
          break;
        }
      }
      return { ...prev, [sectionKey]: thread };
    });

    try {
      const {
        fullText, canApply: applyable, assistantMessageId,
      } = await streamSectionChat(courseId, sectionKey, message, {
        editMessageId: opts.editMessageId,
        onToken: (text) => setStreamingText((prev) => prev + text),
        onUserMessageId: tagUserMessage,
      });
      appendMessage(sectionKey, {
        role: 'assistant',
        content: cleanForDisplay(fullText),
        id: assistantMessageId,
      });
      setCanApplyBySection((prev) => ({ ...prev, [sectionKey]: applyable }));
    } catch (e) {
      const detail = e instanceof Error && e.message ? e.message : '';
      setError(detail || intl.formatMessage(messages.genericError));
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  }, [courseId, intl, appendMessage]);

  // Initialise a section the first time it's opened: resume its saved
  // conversation if there is one, otherwise greet (backend seeds the
  // zero-to-hero framing).
  const initSection = useCallback(async (sectionKey: string) => {
    if (loadedRef.current.has(sectionKey)) { return; }
    loadedRef.current.add(sectionKey);
    setIsLoadingThread(true);
    try {
      const session = await getSectionSession(courseId, sectionKey);
      if (session.messages && session.messages.length) {
        setChatBySection((prev) => ({
          ...prev,
          [sectionKey]: session.messages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
        }));
        setCanApplyBySection((prev) => ({ ...prev, [sectionKey]: Boolean(session.canApply) }));
        setIsLoadingThread(false);
      } else {
        setIsLoadingThread(false);
        runChat(sectionKey, '');
      }
    } catch (e) {
      // If resume fails, fall back to greeting so the section is still usable.
      setIsLoadingThread(false);
      runChat(sectionKey, '');
    }
  }, [courseId, runChat]);

  useEffect(() => {
    if (isOpen && selectedKey) { initSection(selectedKey); }
  }, [isOpen, selectedKey, initSection]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  useEffect(() => {
    if (isOpen && selectedKey && !isStreaming && !isApplying) {
      textareaRef.current?.focus();
    }
  }, [isOpen, selectedKey, isStreaming, isApplying]);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const handleSend = () => {
    const message = inputValue.trim();
    if (!message || isStreaming || !selectedKey) { return; }
    appendMessage(selectedKey, { role: 'user', content: message });
    setInputValue('');
    resetTextareaHeight();
    runChat(selectedKey, message);
  };

  const handleEditMessage = (index: number, newContent: string) => {
    const target = chatMessages[index];
    const text = newContent.trim();
    if (!target || target.role !== 'user' || target.id === undefined) { return; }
    if (!text || isStreaming || isApplying || !selectedKey) { return; }
    setChatBySection((prev) => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []).slice(0, index), { role: 'user', content: text }],
    }));
    runChat(selectedKey, text, { editMessageId: target.id });
  };

  const handleSelectSection = (key: string) => {
    setSelectedKey(key);
    setError('');
    setInputValue('');
    setStreamingText('');
  };

  const handleApply = async () => {
    if (!canApply || isApplying || !selectedKey) { return; }
    setIsApplying(true);
    setError('');
    try {
      const result = await applySectionEdits(courseId, selectedKey);
      setCanApplyBySection((prev) => ({ ...prev, [selectedKey]: false }));
      onApplied({ sectionName: result.sectionName, counts: result.counts });
    } catch (e) {
      const detail = e instanceof Error && e.message ? e.message : '';
      setError(detail || intl.formatMessage(messages.genericError));
    } finally {
      setIsApplying(false);
    }
  };

  // Clear the current section's conversation and greet fresh.
  const handleStartOver = async () => {
    if (!selectedKey || isStreaming || isApplying) { return; }
    setError('');
    setCanApplyBySection((prev) => ({ ...prev, [selectedKey]: false }));
    try {
      await resetSectionSession(courseId, selectedKey);
    } catch (e) {
      // Even if the server delete fails, clear the UI so the user can restart.
    }
    setChatBySection((prev) => ({ ...prev, [selectedKey]: [] }));
    runChat(selectedKey, '');
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) { return undefined; }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) { return null; }

  const panel = (
    <>
      <style>
        {`.ai-section-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.35);
            z-index: 1050;
          }
          .ai-section-panel {
            position: fixed;
            top: 4.5rem;
            right: 1.5rem;
            bottom: 1.5rem;
            width: min(94vw, 640px);
            display: flex;
            flex-direction: column;
            background: #fff;
            border-radius: 0.75rem;
            border: 1px solid rgba(106, 75, 255, 0.16);
            box-shadow: 0 1.5rem 3.5rem rgba(15, 14, 40, 0.28);
            overflow: hidden;
            z-index: 1051;
          }
          .ai-section-spinner {
            display: inline-block; width: 1rem; height: 1rem;
            border: 2px solid currentColor; border-right-color: transparent;
            border-radius: 50%; animation: ai-section-spin 0.75s linear infinite;
            vertical-align: -0.125em;
          }
          @keyframes ai-section-spin { to { transform: rotate(360deg); } }
          .ai-chat-edit-btn { opacity: 0; transition: opacity 0.15s ease-in-out; }
          .ai-chat-bubble-row:hover .ai-chat-edit-btn, .ai-chat-edit-btn:focus { opacity: 1; }
          .ai-section-composer { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
          .ai-section-composer:focus-within { border-color: #6a4bff; box-shadow: 0 0 0 1px #6a4bff; }`}
      </style>

      {/* Backdrop */}
      <div className="ai-section-backdrop" onClick={onClose} role="presentation" />

      {/* Panel */}
      <div className="ai-section-panel" role="dialog" aria-modal="true" aria-label={intl.formatMessage(messages.sectionEditorTitle)}>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between border-bottom px-4 py-3" style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center">
            <span className="text-primary mr-2 d-flex" aria-hidden>
              <Icon src={SparkleIcon} />
            </span>
            <span className="h4 mb-0">{intl.formatMessage(messages.sectionEditorTitle)}</span>
          </div>
          <IconButton
            src={CloseIcon}
            iconAs={Icon}
            alt={intl.formatMessage(messages.closeSidebar)}
            onClick={onClose}
          />
        </div>

        {/* Section picker */}
        <div className="px-4 pt-3 pb-2" style={{ flexShrink: 0 }}>
          <Form.Label className="small font-weight-bold mb-1 d-block">
            {intl.formatMessage(messages.sectionSelectLabel)}
          </Form.Label>
          <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <Form.Control
              as="select"
              value={selectedKey}
              onChange={(e) => handleSelectSection(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">{intl.formatMessage(messages.sectionSelectPlaceholder)}</option>
              {sections.map((s) => (
                <option key={s.usageKey} value={s.usageKey}>{s.displayName}</option>
              ))}
            </Form.Control>
            {selectedKey && (
              <button
                type="button"
                onClick={handleStartOver}
                disabled={isStreaming || isApplying || chatMessages.length === 0}
                aria-label={intl.formatMessage(messages.resetButton)}
                title={intl.formatMessage(messages.resetButton)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: isStreaming || isApplying || chatMessages.length === 0 ? 'default' : 'pointer',
                  color: isStreaming || isApplying || chatMessages.length === 0 ? '#c0c0c0' : '#6a4bff',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <RefreshIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            )}
          </div>
        </div>

        {!selectedKey ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center text-muted" style={{ flex: 1, padding: '0 1.5rem' }}>
            <span className="text-gray-300 mb-2" aria-hidden>
              <Icon src={SparkleIcon} style={{ width: '2.5rem', height: '2.5rem' }} />
            </span>
            <p className="mb-0">{intl.formatMessage(messages.sectionSelectHint)}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="px-4 pb-2" style={{ flexShrink: 0 }}>
                <Alert variant="danger" className="mb-0" onClose={() => setError('')} dismissible>{error}</Alert>
              </div>
            )}

            {/* Thread — scrollable outer, inner spacer pins messages to bottom */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '1rem 1.5rem',
              }}
              >
                {/* Spacer pushes messages to the bottom when thread is short */}
                <div style={{ flex: 1 }} />
                {isLoadingThread && chatMessages.length === 0 && (
                  <div className="d-flex align-items-center text-muted">
                    <span className="ai-section-spinner mr-2" aria-hidden="true" />
                    {intl.formatMessage(messages.thinking)}
                  </div>
                )}
                {chatMessages.map((message, idx) => (
                  <ChatMessageBubble
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    author={message.role}
                    content={message.content}
                    canEdit={message.role === 'user' && message.id !== undefined && !isStreaming && !isApplying}
                    onEdit={(newContent) => handleEditMessage(idx, newContent)}
                  />
                ))}
                {isStreaming && (
                  streamingText
                    ? <ChatMessageBubble author="assistant" content={cleanForDisplay(streamingText)} />
                    : (
                      <div className="d-flex align-items-center text-muted">
                        <span className="ai-section-spinner mr-2" aria-hidden="true" />
                        {intl.formatMessage(messages.thinking)}
                      </div>
                    )
                )}
                <div ref={threadEndRef} />
              </div>
            </div>

            {/* Composer + apply footer */}
            <div className="border-top px-4 pt-3 pb-3" style={{ flexShrink: 0 }}>
              <div
                className="ai-section-composer d-flex align-items-end rounded border bg-white px-3 py-2 mb-2"
                style={{ gap: '0.5rem' }}
              >
                <Form.Control
                  ref={textareaRef}
                  as="textarea"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onInput={(e) => {
                    const el = e.currentTarget as HTMLTextAreaElement;
                    el.style.height = 'auto';
                    const maxH = 120;
                    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
                    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={intl.formatMessage(messages.inputPlaceholder)}
                  disabled={isStreaming || isApplying}
                  style={{
                    resize: 'none',
                    overflowY: 'hidden',
                    minHeight: '1.75rem',
                    border: 'none',
                    boxShadow: 'none',
                    padding: '0.125rem 0',
                    flex: 1,
                    background: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isStreaming || isApplying || !inputValue.trim()}
                  aria-label={intl.formatMessage(messages.sendButton)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: inputValue.trim() && !isStreaming ? 'pointer' : 'default',
                    color: inputValue.trim() && !isStreaming ? '#6a4bff' : '#c0c0c0',
                    padding: '0.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SendIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted">{intl.formatMessage(messages.sectionApplyHint)}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  disabled={!canApply || isApplying}
                >
                  {isApplying && <span className="ai-section-spinner mr-2" aria-hidden="true" />}
                  {isApplying
                    ? intl.formatMessage(messages.sectionApplying)
                    : intl.formatMessage(messages.sectionApplyButton)}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  return createPortal(panel, document.body);
};

export default SectionEditorSidebar;
