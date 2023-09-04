import { css } from "@emotion/react";
import { ParseKeys } from "i18next";

import React from "react";

import { useTranslation, Trans} from "react-i18next";
import { useSelector } from "react-redux";
import { flexGapReplacementStyle } from "../cssStyles";
import { getGroupName, KEYMAP } from "../globalKeys";
import { selectTheme } from "../redux/themeSlice";

const Group: React.FC<{name: ParseKeys, entries: { [key: string]: string[][] }}> = ({name, entries}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const groupStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    width: '460px',
    maxWidth: '50vw',
  });

  const headingStyle = css({
    borderBottom: `${theme.menuBorder}`
  })

  return (
    <div css={groupStyle}>
      <h3 css={headingStyle}>{t(name)}</h3>
      {Object.entries(entries).map(([key, value], index) =>
        <Entry name={key} sequences={value} key={index} />
      )}
    </div>
  )
}

const Entry: React.FC<{name: string, sequences: string[][] }> = ({name, sequences}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const entryStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    width: '100%',
    paddingBottom: '5px',
    paddingTop: '5px',
  });

  const labelStyle = css({
    alignSelf: 'center',
    minWidth: '130px',
    height: '5em',
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
    borderColor: `${theme.singleKey_border}`,
    background: `${theme.singleKey_bg}`,
    padding: '10px',
  })

  const orStyle = css({
    alignSelf: 'center',
    lineHeight: '32px',
  })

  return (
    <div css={entryStyle}>
      <div css={labelStyle}><Trans>{name || t("keyboardControls.missingLabel")}</Trans></div>
      {sequences.map((sequence, index, arr) => (
        <div css={sequenceStyle} key={index}>
          {sequence.map((singleKey, index) => (
            <div css={singleKeyStyle} key={index}>{singleKey}</div>
          ))}
          <div css={orStyle}><Trans>{arr.length - 1 !== index && t("keyboardControls.sequenceSeparator")}</Trans></div>
        </div>
      ))}
    </div>
  )
}


const KeyboardControls: React.FC = () => {

  const { t } = useTranslation();

  const groupsStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap',
    justifyContent: 'center',
    ...(flexGapReplacementStyle(30, true)),
  })

  const render = () => {
    if (KEYMAP && Object.keys(KEYMAP).length > 0) {

      const groups: JSX.Element[] = [];
      Object.entries(KEYMAP).forEach(([key, value], index) => {
        const entries : { [key: string]: string[][] } = {}
        Object.entries(value).forEach(([, value]) => {
          const sequences = value.key.split(",").map(item => item.trim())
          const lol: string[][] = []
          Object.entries(sequences).forEach(([, value]) => {
            const keys = value.split("+").map(item => item.trim())
            lol.push(keys)
          })
          entries[value.name] = lol
        })
        groups.push(<Group name={getGroupName(key)} entries={entries} key={index}/>)
      })

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
