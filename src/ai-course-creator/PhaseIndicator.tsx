import { Fragment } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

interface Props {
  currentPhase: number; // 1–4
}

const PHASES = [1, 2, 3, 4] as const;

const BRAND = '#0076BD';
const MUTED = '#adb5bd';
const SEPARATOR = '#dee2e6';

const PhaseIndicator = ({ currentPhase }: Props) => {
  const intl = useIntl();
  const phaseLabels = [
    intl.formatMessage(messages.phaseLabel1),
    intl.formatMessage(messages.phaseLabel2),
    intl.formatMessage(messages.phaseLabel3),
    intl.formatMessage(messages.phaseLabel4),
  ];

  return (
    <div className="d-flex align-items-start mb-3" style={{ userSelect: 'none' }}>
      {PHASES.map((phase, idx) => {
        const isCompleted = phase < currentPhase;
        const isActive = phase === currentPhase;
        const isLast = idx === PHASES.length - 1;

        const dotBg = isCompleted || isActive ? BRAND : '#fff';
        const dotBorder = isCompleted || isActive ? BRAND : MUTED;
        const dotColor = isCompleted || isActive ? '#fff' : MUTED;

        let labelColor = MUTED;
        if (isActive) {
          labelColor = BRAND;
        } else if (isCompleted) {
          labelColor = '#495057';
        }

        return (
          <Fragment key={phase}>
            <div className="d-flex flex-column align-items-center" style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: `2px solid ${dotBorder}`,
                  background: dotBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: dotColor,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                {isCompleted ? '✓' : phase}
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  marginTop: '0.3rem',
                  color: labelColor,
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                }}
              >
                {phaseLabels[idx]}
              </span>
            </div>
            {!isLast && (
              <div
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 2,
                  marginTop: 12,
                  background: isCompleted ? BRAND : SEPARATOR,
                  transition: 'background 0.2s',
                  minWidth: '1.5rem',
                }}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default PhaseIndicator;
