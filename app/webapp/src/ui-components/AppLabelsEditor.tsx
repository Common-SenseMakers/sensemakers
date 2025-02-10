import { Box, Keyboard, Text } from 'grommet';
import { Edit } from 'grommet-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PostEditKeys } from '../i18n/i18n.edit.post';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { AppLabel, LabelColors } from './AppLabel';
import { useThemeContext } from './ThemedApp';
import useOutsideClick from './hooks/OutsideClickHook';

const DEBUG = false;

export const REF_LABELS_EDITOR_ID = 'ref-labels-editor';

export const AppLabelsEditor = (props: {
  labels: Array<string | JSX.Element>;
  placeholder: string;
  maxLabels?: number;
  options?: string[];
  addLabel?: (label: string) => void;
  removeLabel?: (label: string) => void;
  hashtag?: boolean;
  colors: LabelColors;
  editable?: boolean;
  onLabelClick?: (label: string) => void;
  onMoreClicked?: () => void;
  onNonLabelClick?: () => void;
  underline?: boolean;
}) => {
  const editable = props.editable !== undefined ? props.editable : false;
  const colors = props.colors;
  const hashtag = props.hashtag !== undefined ? props.hashtag : false;
  const onLabelClick = props.onLabelClick;
  const onMoreClicked = props.onMoreClicked;

  const { constants } = useThemeContext();
  const { t } = useTranslation();

  const keyBox = useRef<HTMLInputElement>(null);
  const keyInput = useRef<HTMLInputElement>(null);

  const [height, setHeight] = useState<number>();

  const [input, setInput] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);

  const onlyOptions = props.options !== undefined;
  const allOptions = useMemo(() => {
    if (!onlyOptions) return undefined;
    if (!input) return props.options;

    return props.options
      ? props.options.filter((e) => (e ? e.includes(input) : false))
      : [];
  }, [input, onlyOptions, props.options]);

  useEffect(() => {
    if (DEBUG) console.log('autofocusing input', { adding });
    if (adding && keyInput.current) {
      keyInput.current.focus();
    }
  }, [adding, keyInput]);

  const refreshHeight = () => {
    if (keyBox.current) {
      setHeight(keyBox.current.offsetHeight);
    }
  };

  useEffect(() => {
    refreshHeight();
  }, [props.labels, adding]);

  const reset = () => {
    if (DEBUG) console.log('reset');
    setInput('');
    setAdding(false);
  };

  useOutsideClick(keyBox, () => {
    if (adding) {
      reset();
    }
  });

  const removeLabel = (label: string) => {
    if (props.removeLabel) {
      props.removeLabel(label);
    }
  };

  const enterPressed = () => {
    if (!onlyOptions) {
      addLabel();
    }
  };

  const addLabel = (_label?: string) => {
    if (props.addLabel) {
      if (DEBUG) console.log('addLabel', { _label });
      const label = _label || input;

      props.addLabel(label);
      if (!onlyOptions) reset();
      else setInput('');
    }
  };

  const inputChanged = (input: string) => {
    setInput(input);
  };

  const handleInternalClick = (e: React.MouseEvent) => {
    let target = e.target as HTMLElement; // Narrowing the type to HTMLElement
    let isOnLabel = false;

    // filter clicks on labels
    while (target !== null) {
      if (target.dataset && target.dataset.marker === 'label') {
        isOnLabel = true;
      }

      target = target.parentNode as HTMLElement;
    }

    if (!isOnLabel && props.onNonLabelClick) {
      e.stopPropagation();
      if (props.onNonLabelClick) {
        props.onNonLabelClick();
      }
    }
  };

  const hasManyLabels =
    props.maxLabels !== undefined && props.labels.length >= props.maxLabels + 1;

  const visibleLables =
    props.maxLabels !== undefined
      ? props.labels.slice(0, props.maxLabels)
      : props.labels;

  const nonVisibleLabels =
    props.maxLabels !== undefined ? props.labels.slice(props.maxLabels) : [];

  const showCreator = !onlyOptions && input;
  const showOptions = onlyOptions && adding;

  const showSelector = showCreator || (onlyOptions && adding);
  const selector = (() => {
    if (showCreator) {
      return (
        <AppButton
          plain
          onClick={() => addLabel()}
          style={{ textTransform: 'none' }}>
          <Box direction="row" align="center">
            <AppLabel margin={{ right: 'small' }} colors={colors}>
              {input}
            </AppLabel>
            <Text
              style={{
                height: '16px',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '16px',
              }}
              color={constants.colors.primary}>
              {t(PostEditKeys.addKeyword)}
            </Text>
          </Box>
        </AppButton>
      );
    }

    if (showOptions && allOptions) {
      return (
        <Box style={{ display: 'block' }}>
          {allOptions.map((option, ix) => {
            const optionElement = (() => {
              return (
                <Box
                  style={{ display: 'block', float: 'left' }}
                  margin={{ right: 'small', bottom: 'xsmall' }}>
                  <AppLabel colors={colors}>{option}</AppLabel>
                </Box>
              );
            })();

            return (
              <AppButton
                plain
                key={ix}
                style={{ textTransform: 'none' }}
                onClick={() => addLabel(option)}>
                {optionElement}
              </AppButton>
            );
          })}
        </Box>
      );
    }
  })();

  return (
    <Box
      id={REF_LABELS_EDITOR_ID}
      ref={keyBox}
      width="100%"
      style={{
        backgroundColor: adding ? constants.colors.shade : 'transparent',
        position: 'relative',
      }}
      onClick={handleInternalClick}>
      <Box style={{ display: 'block' }}>
        {visibleLables.length === 0 && !adding && (
          <Box
            style={{
              display: 'block',
              float: 'left',
            }}>
            <Text
              style={{
                color: constants.colors.textLight2,
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '16px',
                textDecoration: 'none',
              }}>
              {props.placeholder}
            </Text>
          </Box>
        )}
        {visibleLables.map((label, ix) => {
          const marginRight = ix < visibleLables.length - 1 ? '4px' : '0';
          return (
            <Box
              data-marker="label"
              key={ix}
              style={{
                display: 'block',
                float: 'left',
                cursor: onLabelClick ? 'pointer' : 'inherit',
              }}
              onClick={() => {
                if (onLabelClick && !adding) {
                  if (typeof label === 'string') {
                    onLabelClick(label);
                  } else if (
                    label.props &&
                    (label.props as unknown as { children: any }).children
                  ) {
                    const spanText = (
                      label as React.ReactElement<{ children: [string, any] }>
                    ).props.children[0];
                    onLabelClick(spanText);
                  }
                }
              }}>
              <AppLabel
                underline={props.underline}
                colors={colors}
                showClose={adding}
                remove={() => removeLabel(label as string)}
                key={ix}
                margin={{ right: marginRight, bottom: '4px' }}>
                {`${hashtag ? '#' : ''}`}
                <span>{label}</span>
              </AppLabel>
            </Box>
          );
        })}
        {hasManyLabels && !adding ? (
          <Box style={{ display: 'block', float: 'left' }}>
            <AppButton plain onClick={() => onMoreClicked && onMoreClicked()}>
              <AppLabel colors={colors} margin={{ left: '4px', bottom: '4px' }}>
                {`+${nonVisibleLabels.length}`}
              </AppLabel>
            </AppButton>
          </Box>
        ) : (
          <></>
        )}
        <Box
          style={{
            display: 'block',
            float: 'left',
          }}>
          {adding ? (
            <Keyboard
              onEnter={() => enterPressed()}
              onEsc={() => setAdding(false)}>
              <Box margin={{ left: 'small' }}>
                <AppInput
                  style={{
                    color: constants.colors.text,
                  }}
                  plain
                  ref={keyInput}
                  value={input}
                  onChange={(event) =>
                    inputChanged(event.target.value)
                  }></AppInput>
              </Box>
            </Keyboard>
          ) : editable ? (
            <Box
              margin={{ left: 'small' }}
              style={{
                backgroundColor: '#E5E7EB',
                height: '24px',
                width: '24px',
                borderRadius: '12px',
              }}
              onClick={() => setAdding(true)}
              justify="center"
              align="center"
              pad={{ top: '2px' }}>
              <AppButton
                icon={
                  <Edit color={constants.colors.primary} size="12px"></Edit>
                }
                plain></AppButton>
            </Box>
          ) : (
            <></>
          )}
        </Box>
      </Box>

      {showSelector ? (
        <Box
          style={{
            position: 'absolute',
            backgroundColor: constants.colors.shade,
            width: '100%',
            padding: '12px 12px 12px 12px',
            top: `${height || 0}px`,
            borderRadius: '6px',
            border: `2px ${constants.colors.border} solid`,
            zIndex: 1,
          }}
          direction="row"
          align="center"
          justify="center"
          gap="small">
          {selector}
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};
