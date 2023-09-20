import { css } from "@emotion/react";
import { ParseKeys } from "i18next";

import React from "react";

import { useTranslation, Trans} from "react-i18next";
import { flexGapReplacementStyle } from "../cssStyles";
import { getGroupName, KEYMAP } from "../globalKeys";
import { useTheme } from "../themes";
import { titleStyle, titleStyleBold } from '../cssStyles'

const Group: React.FC<{name: ParseKeys, entries: { [key: string]: string[][] }}> = ({name, entries}) => {

  const { t } = useTranslation();
  const theme = useTheme();

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
      {Object.entries(entries).map(([key, value], index) =>
        <Entry name={key} sequences={value} key={index} />
      )}
    </div>
  )
}

const Entry: React.FC<{name: string, sequences: string[][] }> = ({name, sequences}) => {

  const { t } = useTranslation();
  const theme = useTheme();

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
      <div css={labelStyle}><Trans>{name || t("keyboardControls.missingLabel")}</Trans></div>
      {sequences.map((sequence, index, arr) => (
        <div css={sequenceStyle} key={index}>
          {sequence.map((singleKey, index) => (
            <>
              <div css={singleKeyStyle} key={index}>{singleKey}</div>
              {sequence.length - 1 !== index && <div css={orStyle}>+</div>}
            </>
          ))}
          <div css={orStyle}><Trans>{arr.length - 1 !== index && t("keyboardControls.sequenceSeparator")}</Trans></div>
        </div>
      ))}
    </div>
  )
}


const KeyboardControls: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme()

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
      <div css={[titleStyle(theme), titleStyleBold(theme)]}>
        {t("keyboardControls.header")}
      </div>

      {render()}
    </div>
  );
};

export default KeyboardControls;
