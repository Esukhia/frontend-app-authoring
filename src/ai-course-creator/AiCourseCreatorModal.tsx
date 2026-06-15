import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Alert, AlertModal, Button, Form, ModalDialog, Spinner, Stack,
} from '@openedx/paragon';
import {
  AutoAwesome as SparkleIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
} from '@openedx/paragon/icons';

import ChatMessageBubble from './ChatMessageBubble';
import MaterialDropzone from './MaterialDropzone';
import PhaseIndicator from './PhaseIndicator';
import {
  applyOutline,
  deleteMaterial,
  getSession,
  resetSession,
  streamChat,
  uploadMaterialFile,
  uploadMaterialLink,
  type ChatMessageData,
  type MaterialData,
} from './data/api';
import { stripCourseJson, stripPhaseMarker } from './utils';
import messages from './messages';

interface Props {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplied: (summary: {
    counts: { sections: number; subsections: number; units: number; components: number };
  }) => void;
}

const AiCourseCreatorModal = ({
  courseId, isOpen, onClose, onApplied,
}: Props) => {
  const intl = useIntl();
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasCourseJson, setHasCourseJson] = useState(false);
  const [error, setError] = useState('');
  const [hasInitialised, setHasInitialised] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);

  const threadEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textareaRef = useRef<any>(null);
  const scrollToBottom = useCallback(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const runChat = useCallback(async (message: string) => {
    setError('');
    setIsStreaming(true);
    setStreamingText('');
    try {
      const { fullText, hasCourseJson: produced, currentPhase: newPhase } = await streamChat(courseId, message, {
        onToken: (text) => setStreamingText((prev) => prev + text),
      });
      setChatMessages((prev) => [...prev, { role: 'assistant', content: stripPhaseMarker(stripCourseJson(fullText)) }]);
      setHasCourseJson((prev) => prev || produced);
      setCurrentPhase(newPhase);
    } catch (e) {
      const detail = e instanceof Error && e.message ? e.message : '';
      setError(detail || intl.formatMessage(messages.genericError));
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  }, [courseId, intl]);

  useEffect(() => {
    if (!isOpen || hasInitialised) { return; }
    setHasInitialised(true);
    (async () => {
      try {
        const session = await getSession(courseId);
        setMaterials(session.materials || []);
        setHasCourseJson(Boolean(session.hasCourseJson));
        setCurrentPhase(session.currentPhase || 1);
        if (session.messages && session.messages.length) {
          setChatMessages(session.messages.map((m) => ({ role: m.role, content: m.content })));
        } else {
          await runChat('');
        }
      } catch (e) {
        setError(intl.formatMessage(messages.genericError));
      }
    })();
  }, [isOpen, hasInitialised, courseId, runChat, intl]);

  useEffect(() => { scrollToBottom(); }, [chatMessages, streamingText, scrollToBottom]);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const handleSend = () => {
    const message = inputValue.trim();
    if (!message || isStreaming) { return; }
    setChatMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInputValue('');
    resetTextareaHeight();
    runChat(message);
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const material = await uploadMaterialFile(courseId, file);
      setMaterials((prev) => [...prev, material]);
    } catch (e) {
      setError(intl.formatMessage(messages.uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadLink = async (url: string) => {
    setIsUploading(true);
    setError('');
    try {
      const material = await uploadMaterialLink(courseId, url);
      setMaterials((prev) => [...prev, material]);
    } catch (e) {
      setError(intl.formatMessage(messages.uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setError(intl.formatMessage(messages.genericError));
    }
  };

  const handleReset = () => setIsResetConfirmOpen(true);

  const handleResetConfirmed = async () => {
    setIsResetConfirmOpen(false);
    setError('');
    try {
      await resetSession(courseId);
    } catch (e) {
      // Even if delete fails, reset the UI so the user can start fresh.
    }
    setChatMessages([]);
    setMaterials([]);
    setHasCourseJson(false);
    setCurrentPhase(1);
    setInputValue('');
    await runChat('');
  };

  const handleGenerate = async () => {
    setIsApplying(true);
    setError('');
    try {
      const result = await applyOutline(courseId);
      onApplied(result);
    } catch (e) {
      setError(intl.formatMessage(messages.genericError));
      setIsApplying(false);
    }
  };

  return (
    <>
      <style>
        {'.ai-sherab-modal .modal-xl { max-width: min(95vw, 1500px) !important; }'}
      </style>

      <AlertModal
        title={intl.formatMessage(messages.resetConfirmTitle)}
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        footerNode={(
          <ActionRow>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={() => setIsResetConfirmOpen(false)}>
              {intl.formatMessage(messages.cancelButton)}
            </Button>
            <Button variant="danger" onClick={handleResetConfirmed}>
              {intl.formatMessage(messages.resetButton)}
            </Button>
          </ActionRow>
        )}
      >
        <p className="mb-0">{intl.formatMessage(messages.resetConfirm)}</p>
      </AlertModal>

      <ModalDialog
        title={intl.formatMessage(messages.modalTitle)}
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        className="ai-sherab-modal"
        hasCloseButton
        isFullscreenOnMobile
        isOverflowVisible={false}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.modalTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          <div className="d-flex" style={{ gap: '1rem' }}>
            {/* Chat column */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
              <PhaseIndicator currentPhase={currentPhase} />
              <div
                className="border rounded d-flex flex-column mb-3 flex-grow-1"
                style={{ height: '55vh', overflow: 'hidden' }}
              >
                <div className="p-3 flex-grow-1" style={{ overflowY: 'auto' }}>
                  {chatMessages.map((message, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <ChatMessageBubble key={idx} author={message.role} content={message.content} />
                  ))}
                  {isStreaming && (
                    streamingText
                      ? <ChatMessageBubble author="assistant" content={stripPhaseMarker(stripCourseJson(streamingText))} />
                      : (
                        <div className="d-flex align-items-center text-muted">
                          <Spinner animation="border" size="sm" className="mr-2" screenReaderText="loading" />
                          {intl.formatMessage(messages.thinking)}
                        </div>
                      )
                  )}
                  <div ref={threadEndRef} />
                </div>
                <div className="border-top d-flex align-items-center px-3 py-2" style={{ gap: '0.5rem' }}>
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
                    disabled={isStreaming}
                    style={{
                      resize: 'none',
                      overflowY: 'hidden',
                      minHeight: '2.5rem',
                      border: 'none',
                      boxShadow: 'none',
                      padding: '0.375rem 0',
                      flex: 1,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isStreaming || !inputValue.trim()}
                    aria-label={intl.formatMessage(messages.sendButton)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: inputValue.trim() && !isStreaming ? 'pointer' : 'default',
                      color: inputValue.trim() && !isStreaming ? '#454545' : '#c0c0c0',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SendIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Side column: materials */}
            <div style={{ width: 300, flexShrink: 0, marginTop: '3.625rem' }}>
              <Stack gap={3}>
                <MaterialDropzone
                  materials={materials}
                  isUploading={isUploading}
                  onUploadFile={handleUploadFile}
                  onUploadLink={handleUploadLink}
                  onDeleteMaterial={handleDeleteMaterial}
                />
              </Stack>
            </div>
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button
              variant="tertiary"
              iconBefore={RefreshIcon}
              onClick={handleReset}
              disabled={isStreaming || isApplying}
            >
              {intl.formatMessage(messages.resetButton)}
            </Button>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={onClose}>
              {intl.formatMessage(messages.closeButton)}
            </Button>
            <Button
              variant="primary"
              iconBefore={SparkleIcon}
              onClick={handleGenerate}
              disabled={!hasCourseJson || isApplying || isStreaming}
            >
              {isApplying && <Spinner animation="border" size="sm" className="mr-2" screenReaderText="loading" />}
              {isApplying ? intl.formatMessage(messages.generating) : intl.formatMessage(messages.generateButton)}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

export default AiCourseCreatorModal;
