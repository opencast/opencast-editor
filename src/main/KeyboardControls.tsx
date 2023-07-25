import { css } from "@emotion/react";
import { ParseKeys } from "i18next";

import React from "react";

import { KeyMapDisplayOptions } from 'react-hotkeys';
import { useTranslation, Trans} from "react-i18next";
import { useSelector } from "react-redux";
import { flexGapReplacementStyle } from "../cssStyles";
import { getAllHotkeys } from "../globalKeys";
import { selectTheme } from "../redux/themeSlice";
import { titleStyle, titleStyleBold } from '../cssStyles'

const Group: React.FC<{name: ParseKeys, entries: KeyMapDisplayOptions[]}> = ({name, entries}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const groupStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    width: '460px',
    maxWidth: '50vw',

    background: `${theme.menu_background}`,
    borderRadius: '5px',
    boxShadow: `${theme.boxShadow_tiles}`,
    boxSizing: "border-box",
    padding: '0px 20px 20px 20px',
  });

  const headingStyle = css({
    color: `${theme.text}`,
  })

  return (
    <div css={groupStyle}>
      <h3 css={headingStyle}>{t(name)}</h3>
      {entries.map((entry: KeyMapDisplayOptions, index: number) => (
        <Entry params={entry} key={index}></Entry>
      ))}
    </div>
  )
}

const Entry: React.FC<{params: KeyMapDisplayOptions}> = ({params}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const entryStyle = css({
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'left',
    width: '100%',
    padding: '10px 0px',
    ...(flexGapReplacementStyle(10, true))
  });

  const labelStyle = css({
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordWrap: 'break-word',
    color: `${theme.text}`,
  })

  const sequencesStyle = css({
    display: 'flex',
    flexDirection: 'row',
    ...(flexGapReplacementStyle(10, true))
  })

  const sequenceStyle = css({
    display: 'flex',
    flexDirection: 'row',
    ...(flexGapReplacementStyle(10, true))
  })

  const singleKeyStyle = css({
    borderRadius: '4px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: `${theme.singleKey_border}`,
    background: `${theme.singleKey_bg}`,
    boxShadow: `${theme.singleKey_boxShadow}`,
    padding: '10px',
    color: `${theme.text}`,
  })

  const orStyle = css({
    alignSelf: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  })

  return (
    <div css={entryStyle}>
      <div css={labelStyle}><Trans>{params.name || t("keyboardControls.missingLabel")}</Trans></div>
      <div css={sequencesStyle}>
        {params.sequences.map((sequence, index, arr) => (
          <div css={sequenceStyle} key={index}>
            {sequence.sequence.toString().split('+').map((singleKey, index, {length}) => (
              <>
                <div css={singleKeyStyle} key={index}>{singleKey}</div>
                {length - 1 !== index ? <div css={orStyle}>+</div> : ''}
              </>
            ))}
            <div css={orStyle}><Trans>{arr.length - 1 !== index && t("keyboardControls.sequenceSeparator")}</Trans></div>
          </div>
        ))}
      </div>
    </div>
  )
}


const KeyboardControls: React.FC = () => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  const keyMap = getAllHotkeys()

  const groupsStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap',
    justifyContent: 'center',
    ...(flexGapReplacementStyle(30, true)),
  })

  const render = () => {
    if (keyMap && Object.keys(keyMap).length > 0) {

      const obj: Record<string, Array<KeyMapDisplayOptions>> = {}
      obj[t("keyboardControls.defaultGroupName")] = []    // For keys without a group

      // Sort by group
      for (const [, value] of Object.entries(keyMap)) {
        if (value.group) {
          if (obj[value.group]) {
            obj[value.group].push(value)
          } else {
            obj[value.group] = [value]
          }
        } else {
          obj[t("keyboardControls.defaultGroupName")].push(value)
        }
      }

      const groups: JSX.Element[] = [];
      for (const key in obj) {
        if (obj[key].length > 0) {
          groups.push(<Group name={key as ParseKeys} entries={obj[key]} key={key}/>);
        }
      }

      return (
        <div css={groupsStyle}>
          {groups}
        </div>
      )
    }

    // No groups fallback
    return <div>{t("keyboardControls.genericError")}</div>
  }

  const keyboardControlsStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    width: '100%',
  });

  return (
    <div css={keyboardControlsStyle}>
      <div css={[titleStyle(theme), titleStyleBold(theme)]}>
        {t("keyboardControls.header")}
      </div>

      {render()}
    </div>
  );
};

export default KeyboardControls;
