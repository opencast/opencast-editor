import { css } from "@emotion/react";
import { ParseKeys } from "i18next";

import React from "react";

import { useTranslation, Trans } from "react-i18next";
import { getGroupName, KEYMAP, rewriteKeys } from "../globalKeys";
import { useTheme } from "../themes";
import { titleStyle, titleStyleBold } from "../cssStyles";

const Group: React.FC<{ name: ParseKeys, entries: { [key: string]: string[][]; }; }> = ({ name, entries }) => {

  const { t } = useTranslation();
  const theme = useTheme();

  const groupStyle = css({
    display: "flex",
    flexDirection: "column" as const,
    width: "460px",
    maxWidth: "50vw",

    background: `${theme.menu_background}`,
    borderRadius: "5px",
    boxShadow: `${theme.boxShadow_tiles}`,
    boxSizing: "border-box",
    padding: "0px 20px 20px 20px",
  });

  const headingStyle = css({
    color: `${theme.text}`,
  });

  return (
    <div css={groupStyle}>
      <h3 css={headingStyle}>{t(name)}</h3>
      {Object.entries(entries).map(([key, value], index) =>
        <Entry name={key} sequences={value} key={index} />
      )}
    </div>
  );
};

const Entry: React.FC<{ name: string, sequences: string[][]; }> = ({ name, sequences }) => {

  const { t } = useTranslation();
  const theme = useTheme();

  const entryStyle = css({
    display: "flex",
    flexFlow: "column nowrap",
    justifyContent: "left",
    width: "100%",
    padding: "10px 0px",
    gap: "10px",
  });

  const labelStyle = css({
    fontWeight: "bold",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordWrap: "break-word",
    color: `${theme.text}`,
  });

  const sequenceStyle = css({
    display: "flex",
    flexDirection: "row",
    gap: "10px",
  });

  const singleKeyStyle = css({
    borderRadius: "4px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: `${theme.singleKey_border}`,
    background: `${theme.singleKey_bg}`,
    boxShadow: `${theme.singleKey_boxShadow}`,
    padding: "10px",
    color: `${theme.text}`,
  });

  const orStyle = css({
    alignSelf: "center",
    fontSize: "20px",
    fontWeight: "bold",
  });

  return (
    <div css={entryStyle}>
      <div css={labelStyle}><Trans>{name || t("keyboardControls.missingLabel")}</Trans></div>
      {sequences.map((sequence, index, arr) => (
        <div css={sequenceStyle} key={index}>
          {sequence.map((singleKey, index) => (
            <div key={index} css={sequenceStyle}>
              <div css={singleKeyStyle}>
                {singleKey}
              </div>
              {sequence.length - 1 !== index &&
                <div css={orStyle}>+</div>
              }
            </div>
          ))}
          <div css={orStyle}><Trans>
            {arr.length - 1 !== index && t("keyboardControls.sequenceSeparator")}
          </Trans></div>
        </div>
      ))}
    </div>
  );
};


const KeyboardControls: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  const groupsStyle = css({
    display: "flex",
    flexDirection: "row" as const,
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "30px",
  });

  const render = () => {
    if (KEYMAP && Object.keys(KEYMAP).length > 0) {

      const groups: JSX.Element[] = [];
      Object.entries(KEYMAP).forEach(([groupName, group], index) => {
        const entries: { [groupName: string]: string[][]; } = {};
        Object.entries(group).forEach(([, action]) => {
          const sequences = action.key.split(",").map(item => item.trim());
          entries[action.name] = Object.entries(sequences).map(([, sequence]) => {
            return sequence.split("+").map(item => rewriteKeys(item.trim()));
          });
        });
        groups.push(<Group name={getGroupName(groupName)} entries={entries} key={index} />);
      });

      return (
        <div css={groupsStyle}>
          {groups}
        </div>
      );
    }

    // No groups fallback
    return <div>{t("keyboardControls.genericError")}</div>;
  };

  const keyboardControlsStyle = css({
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: "100%",
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
