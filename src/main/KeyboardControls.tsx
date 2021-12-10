import { css } from "@emotion/react";
import React from "react";

import { getApplicationKeyMap, KeyMapDisplayOptions } from 'react-hotkeys';
import { useTranslation } from "react-i18next";
import { flexGapReplacementStyle } from "../cssStyles";

const Group: React.FC<{name: string, entries: KeyMapDisplayOptions[]}> = ({name, entries}) => {

  const groupStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    width: '500px'
  });

  const headingStyle = css({
    borderBottom: '1px solid #BBB',
  })

  return (
    <div css={groupStyle}>
      <h3 css={headingStyle}>{name}</h3>
      {entries.map((entry: KeyMapDisplayOptions, index: number) => (
        <Entry params={entry} key={index}></Entry>
      ))}
    </div>
  )
}

const Entry: React.FC<{params: KeyMapDisplayOptions}> = ({params}) => {

  const { t } = useTranslation();

  const entryStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    width: '100%',
    paddingBottom: '5px',
    paddingTop: '5px',
  });

  const labelStyle = css({
    alignSelf: 'center',
    width: '110px',
    height: '64px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordWrap: 'break-word',

    // Center text vertically
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  })

  const sequenceStyle = css({
    alignSelf: 'center',
    marginLeft: '15px',
    display: 'flex',
    flexDirection: 'row' as const,
    ...(flexGapReplacementStyle(10, true))
  })

  const singleKeyStyle = css({
    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'Gainsboro',
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)',
    padding: '10px',
  })

  const orStyle = css({
    alignSelf: 'center',
    lineHeight: '32px',
  })

  return (
    <div css={entryStyle}>
      <div css={labelStyle}>{params.name || t("keyboardControls.missingLabel")}</div>
      {params.sequences.map((sequence, index, arr) => (
        <div css={sequenceStyle} key={index}>
          {sequence.sequence.toString().split('+').map((singleKey, index) => (
            <div css={singleKeyStyle} key={index}>{singleKey}</div>
          ))}
          <div css={orStyle}>{arr.length - 1 !== index && t("keyboardControls.sequenceSeperator")}</div>
        </div>
      ))}
    </div>
  )
}


const KeyboardControls: React.FC<{}> = () => {

  const { t } = useTranslation();

  const keyMap = getApplicationKeyMap();

  const groupsStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap',
    justifyContent: 'center',
    ...(flexGapReplacementStyle(30, true)),
  })

  const render = () => {
    if (keyMap && Object.keys(keyMap).length > 0) {

      var obj: Record<string,Array<KeyMapDisplayOptions>> = {}
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
          groups.push(<Group name={key} entries={obj[key]} key={key}/>);
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
      <h2>
        {t("keyboardControls.header")}
      </h2>

      {render()}
    </div>
  );
};

export default KeyboardControls;
