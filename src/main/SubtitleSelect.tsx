import React, { useEffect } from "react";
import { css } from "@emotion/react";
import {
  basicButtonStyle,
  flexGapReplacementStyle,
  tileButtonStyle,
  disableButtonAnimation,
  subtitleSelectStyle,
} from "../cssStyles";
import { settings, subtitleTags } from "../config";
import { selectSubtitles, setSelectedSubtitleId, setSubtitle } from "../redux/subtitleSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { setIsDisplayEditView } from "../redux/subtitleSlice";
import { LuPlus } from "react-icons/lu";
import { Form } from "react-final-form";
import { Select } from "mui-rff";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { selectSubtitlesFromOpencast } from "../redux/videoSlice";
import { useTheme } from "../themes";
import { ThemeProvider } from "@mui/material/styles";
import { ThemedTooltip } from "./Tooltip";
import { languageCodeToName } from "../util/utilityFunctions";
import { v4 as uuidv4 } from "uuid";
import { TFunction } from "i18next";

/**
 * Displays buttons that allow the user to select the subtitle they want to edit
 */
const SubtitleSelect: React.FC = () => {

  const { t } = useTranslation();
  const subtitlesFromOpencast = useAppSelector(selectSubtitlesFromOpencast); // track objects received from Opencast
  const subtitles = useAppSelector(selectSubtitles);                         // parsed subtitles stored in redux

  const [displaySubtitles, setDisplaySubtitles] = useState<{ id: string, tags: string[]; }[]>([]);
  const [canBeAddedSubtitles, setCanBeAddedSubtitles] = useState<{ id: string, tags: string[]; }[]>([]);

  // Update the collections for the select and add buttons
  useEffect(() => {
    const languages = { ...settings.subtitles.languages };

    // Get ids of already created tracks or exisiting subtitle tracks
    let existingSubtitles = subtitlesFromOpencast
      .filter(track => !subtitles[track.id])
      .map(track => {
        return { id: track.id, tags: track.tags };
      });

    existingSubtitles = Object.entries(subtitles)
      .map(track => {
        return { id: track[0], tags: track[1].tags };
      })
      .concat(existingSubtitles);

    // Looks for languages in existing subtitles
    // so that those languages don"t show in the addSubtitles dropdown
    const subtitlesFromOpencastLangs = subtitlesFromOpencast
      .reduce((result: { id: string, lang: string; }[], track) => {
        const lang = track.tags.find(e => e.startsWith("lang:"));
        if (lang) {
          result.push({ id: track.id, lang: lang.split(":")[1].trim() });
        }
        return result;
      }, []);

    const subtitlesLangs = Object.entries(subtitles)
      .reduce((result: { id: string, lang: string; }[], track) => {
        const lang = track[1].tags.find(e => e.startsWith("lang:"));
        if (lang) {
          result.push({ id: track[0], lang: lang.split(":")[1].trim() });
        }
        return result;
      }, []);

    const existingLangs = subtitlesFromOpencastLangs.concat(subtitlesLangs);

    // Create list of subtitles that can be added
    const canBeAddedSubtitles = Object.entries(languages)
      .reduce((result: string[][], language) => {
        if (!existingLangs.find(e => e.lang === language[1]["lang"])) {
          result.push(convertTags(language[1]));
        } else {
          delete languages[language[0]];
        }
        return result;
      }, [])
      .map(tags => { return { id: uuidv4(), tags: tags }; });

    setDisplaySubtitles(existingSubtitles);
    setCanBeAddedSubtitles(canBeAddedSubtitles);
  }, [subtitlesFromOpencast, subtitles, t]);

  // Converts tags from the config file format to opencast format
  const convertTags = (tags: subtitleTags) => {
    return Object.entries(tags)
      .map(tag => `${tag[0]}:${tag[1]}`)
      .concat();
  };

  const subtitleSelectStyle = css({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    ...(flexGapReplacementStyle(30, false)),
  });

  const renderButtons = () => {
    const buttons: JSX.Element[] = [];
    if (settings.subtitles.languages === undefined) {
      return buttons;
    }

    for (const subtitle of displaySubtitles) {
      let lang = subtitle.tags.find(e => e.startsWith("lang:"));
      lang = lang ? lang.split(":")[1].trim() : undefined;
      const icon = lang ? ((settings.subtitles || {}).icons || {})[lang] : undefined;

      buttons.push(
        <SubtitleSelectButton
          id={subtitle.id}
          key={subtitle.id}
          title={generateButtonTitle(subtitle.tags, t)}
          icon={icon}
        />
      );
    }
    return buttons.sort((dat1, dat2) => dat1.props["title"].localeCompare(dat2.props["title"]));
  };

  return (
    <div css={subtitleSelectStyle}>
      {renderButtons()}
      {/* TODO: Only show the add button when there are still languages to add*/}
      <SubtitleAddButton subtitlesForDropdown={canBeAddedSubtitles} />
    </div>
  );
};

/**
 * A button that sets the subtitle that should be edited
 */
const SubtitleSelectButton: React.FC<{
  id: string,
  title: string,
  icon: string | undefined,
}> = ({
  id,
  title,
  icon,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const flagStyle = css({
    fontSize: "2.5em",
    overflow: "hidden",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `${theme.background_finish_menu_icon}`,
    color: `${theme.text}`,
    borderRadius: "50%",
    width: "90px",
    height: "90px",
  });

  const titleStyle = css({
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  });

  return (
    <ThemedTooltip title={t("subtitles.selectSubtitleButton-tooltip", { title: title })}>
      <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
        role="button" tabIndex={0}
        aria-label={t("subtitles.selectSubtitleButton-tooltip-aria", { title: title })}
        onClick={() => {
          dispatch(setIsDisplayEditView(true));
          dispatch(setSelectedSubtitleId(id));
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === " " || event.key === "Enter") {
            dispatch(setIsDisplayEditView(true));
            dispatch(setSelectedSubtitleId(id));
          }
        }}>
        {icon && <div css={flagStyle}>{icon}</div>}
        <div css={titleStyle}>{title ?? t("subtitles.generic") + " " + id}</div>
      </div>
    </ThemedTooltip>
  );
};

/**
 * Actually not a button, but a container for a form that allows creating new subtitles for editing
 */
const SubtitleAddButton: React.FC<{
  subtitlesForDropdown: { id: string, tags: string[]; }[];
}> = ({
  subtitlesForDropdown,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const dispatch = useAppDispatch();

  const [isPlusDisplay, setIsPlusDisplay] = useState(true);

  // Parse language data into a format the dropdown understands
  const selectData = () => {
    const data = [];
    for (const subtitle of subtitlesForDropdown) {
      const lang = generateButtonTitle(subtitle.tags, t);
      data.push({ label: lang ?? t("subtitles.generic") + " " + subtitle.id, value: subtitle.id });
    }
    data.sort((dat1, dat2) => dat1.label.localeCompare(dat2.label));
    return data;
  };

  const onSubmit = (values: { selectedSubtitle: any; }) => {
    // Create new subtitle for the given language
    const id = values.selectedSubtitle;
    const relatedSubtitle = subtitlesForDropdown.find(tag => tag.id === id);
    const tags = relatedSubtitle ? relatedSubtitle.tags : [];
    dispatch(setSubtitle({ identifier: id, subtitles: { cues: [], tags: tags } }));

    // Reset
    setIsPlusDisplay(true);

    // Move to editor view
    dispatch(setIsDisplayEditView(true));
    dispatch(setSelectedSubtitleId(id));
  };

  const plusIconStyle = css({
    display: isPlusDisplay ? "flex" : "none",
  });

  const subtitleAddFormStyle = css({
    display: !isPlusDisplay ? "flex" : "none",
    flexDirection: "column" as const,
    ...(flexGapReplacementStyle(30, false)),
    width: "80%",
    padding: "20px",
  });

  const createButtonStyle = css({
    padding: "10px 5px",
    width: "100%",
    boxShadow: "",
    border: `1px solid ${theme.text}`,
    backgroundColor: `${theme.background}`,
    color: `${theme.text}`,

    "&[disabled]": {
      opacity: "0.6",
      cursor: "not-allowed",
    },
  });

  return (
    <ThemedTooltip title={isPlusDisplay ? t("subtitles.createSubtitleButton-tooltip") : ""}>
      <div css={[basicButtonStyle(theme), tileButtonStyle(theme), !isPlusDisplay && disableButtonAnimation]}
        role="button" tabIndex={0}
        aria-label={isPlusDisplay ?
          t("subtitles.createSubtitleButton-tooltip") : t("subtitles.createSubtitleButton-clicked-tooltip-aria")}
        onClick={() => setIsPlusDisplay(false)}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === " " || event.key === "Enter") {
            setIsPlusDisplay(false);
          }
        }}
      >
        <LuPlus css={[plusIconStyle, { fontSize: 42 }]} />
        <Form
          onSubmit={onSubmit}
          subscription={{ submitting: true, pristine: true }} // Hopefully causes less rerenders
          render={({ handleSubmit, submitting, pristine }) => (
            <form onSubmit={event => {
              handleSubmit(event);
              // // Ugly fix for form not getting updated after submit. TODO: Find a better fix
              // form.reset()
            }} css={subtitleAddFormStyle}>
              {/* TODO: Fix the following warning, caused by removing items from data:
                MUI: You have provided an out-of-range value `undefined` for the select (name="languages") component.
              */}
              <ThemeProvider theme={subtitleSelectStyle(theme)}>
                <Select
                  css={{ backgroundColor: `${theme.background}` }}
                  label={t("subtitles.createSubtitleDropdown-label") ?? undefined}
                  name="selectedSubtitle"
                  data={selectData()}
                >
                </Select>
              </ThemeProvider>

              <ThemedTooltip title={submitting || pristine ?
                t("subtitles.createSubtitleButton-createButton-disabled-tooltip") :
                t("subtitles.createSubtitleButton-createButton-tooltip")
              }>
                <span>
                  <button css={[basicButtonStyle(theme), createButtonStyle]}
                    type="submit"
                    aria-label={t("subtitles.createSubtitleButton-createButton-tooltip")}
                    disabled={submitting || pristine}>
                    {t("subtitles.createSubtitleButton-createButton")}
                  </button>
                </span>
              </ThemedTooltip>

            </form>
          )}
        />
      </div>
    </ThemedTooltip>
  );
};

/**
 * Generates a title for the buttons from the tags
 */
export function generateButtonTitle(tags: string[], t: TFunction<"translation", undefined>) {
  let lang = tags.find(e => e.startsWith("lang:"));
  lang = lang ? lang.split(":")[1].trim() : undefined;
  lang = languageCodeToName(lang?.trim()) ?? lang;

  let cc = "";
  const type = tags.find(e => e.startsWith("type:"));
  const isCC = type ? type.split(":")[1].trim() === "closed-caption" : undefined;
  if (isCC) {
    cc = "[CC]";
  }

  let autoGen = "";
  const genType = tags.find(e => e.startsWith("generator-type:"));
  const isAutoGen = genType ? genType.split(":")[1].trim() === "auto" : undefined;
  if (isAutoGen) {
    autoGen = "(" + t("subtitles.autoGenerated") + ")";
  }

  return cc + " " + lang + " " + autoGen;
}

export default SubtitleSelect;
