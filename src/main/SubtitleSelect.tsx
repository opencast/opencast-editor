import React, { useEffect } from "react";
import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle, disableButtonAnimation, subtitleSelectStyle } from "../cssStyles";
import { settings, subtitleTags } from '../config'
import { selectSubtitles, setSelectedSubtitleId, setSubtitle } from "../redux/subtitleSlice";
import { useDispatch, useSelector } from "react-redux";
import { setIsDisplayEditView } from "../redux/subtitleSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-final-form";
import { Select } from "mui-rff";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { selectSubtitlesFromOpencast } from "../redux/videoSlice";
import { selectTheme } from "../redux/themeSlice";
import { ThemeProvider } from '@mui/material/styles';
import { ThemedTooltip } from "./Tooltip";
import { languageCodeToName } from "../util/utilityFunctions";
import { v4 as uuidv4 } from 'uuid';

/**
 * Displays buttons that allow the user to select the subtitle they want to edit
 */
const SubtitleSelect : React.FC<{}> = () => {

  const { t } = useTranslation();
  const subtitlesFromOpencast = useSelector(selectSubtitlesFromOpencast) // track objects received from Opencast
  const subtitles = useSelector(selectSubtitles)                         // parsed subtitles stored in redux

  const [displaySubtitles, setDisplaySubtitles] = useState<{id: string, tags: string[]}[]>([])
  const [canBeAddedSubtitles, setCanBeAddedSubtitles] = useState<{id: string, tags: string[]}[]>([])

  // Update the collections for the select and add buttons
  useEffect(() => {
    let languages = { ...settings.subtitles.languages };

    // Get ids of already created tracks or exisiting subtitle tracks
    let existingSubtitles = subtitlesFromOpencast
      .filter(track => !subtitles[track.id])
      .map(track => {
        return { id: track.id, tags: track.tags }
      });

    existingSubtitles = Object.entries(subtitles)
      .map(track => {
        return { id: track[0], tags: track[1].tags }
      })
      .concat(existingSubtitles);

    // Looks for languages in existing subtitles
    // so that those languages don't show in the addSubtitles dropdown
    let subtitlesFromOpencastLangs = subtitlesFromOpencast
      .reduce((result: {id: string, lang: string}[], track) => {
        let lang = track.tags.find(e => e.startsWith('lang:'))
        if (lang) {
          result.push({id: track.id, lang: lang.split(':')[1].trim()})
        }
        return result;
      }, []);

    let subtitlesLangs = Object.entries(subtitles)
      .reduce((result: {id: string, lang: string}[], track) => {
        let lang = track[1].tags.find(e => e.startsWith('lang:'))
        if (lang) {
          result.push({id: track[0], lang: lang.split(':')[1].trim()})
        }
        return result;
      }, []);

    let existingLangs = subtitlesFromOpencastLangs.concat(subtitlesLangs);

    // Create list of subtitles that can be added
    let canBeAddedSubtitles = Object.entries(languages)
      .reduce((result: string[][], language) => {
        if (!existingLangs.find(e => e.lang === language[1]["lang"])) {
          result.push(convertTags(language[1]))
        } else {
          delete languages[language[0]]
        }
        return result;
      }, [])
      .map(tags => { return {id: uuidv4(), tags: tags} })

    setDisplaySubtitles(existingSubtitles)
    setCanBeAddedSubtitles(canBeAddedSubtitles)
  }, [subtitlesFromOpencast, subtitles, t])

  // Converts tags from the config file format to opencast format
  const convertTags = (tags: subtitleTags) => {
    return Object.entries(tags)
      .map(tag => `${tag[0]}: ${tag[1]}`)
      .concat()
  }

  const subtitleSelectStyle = css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(20em, 1fr))',
    gridRowGap: '30px',
  })

  const renderButtons = () => {
    let buttons : JSX.Element[] = []
    if (settings.subtitles.languages === undefined) {
      return buttons
    }

    for (let subtitle of displaySubtitles) {
      let lang = subtitle.tags.find(e => e.startsWith('lang:'))
      lang = lang ? lang.split(':')[1].trim(): undefined
      const icon = lang ? ((settings.subtitles || {}).icons || {})[lang] : undefined

      buttons.push(
        <SubtitleSelectButton
          id={subtitle.id}
          key={subtitle.id}
          title={generateButtonTitle(subtitle.tags, t)}
          icon={icon}
        />
      )
    }
    return buttons.sort((dat1, dat2) => dat1.props["title"].localeCompare(dat2.props["title"]))
  }

  return (
    <div css={subtitleSelectStyle}>
      {renderButtons()}
      {/* TODO: Only show the add button when there are still languages to add*/}
      <SubtitleAddButton subtitlesForDropdown={canBeAddedSubtitles} />
    </div>
  );
}

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
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()

  const flagStyle = css({
    fontSize: '2em',
    overflow: 'hidden'
  });

  const titleStyle = css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  })

  return (
    <ThemedTooltip title={t("subtitles.selectSubtitleButton-tooltip", {title: title})}>
      <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
        role="button" tabIndex={0}
        aria-label={t("subtitles.selectSubtitleButton-tooltip-aria", {title: title})}
        onClick={ () => {
          dispatch(setIsDisplayEditView(true))
          dispatch(setSelectedSubtitleId(id))
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          dispatch(setIsDisplayEditView(true))
          dispatch(setSelectedSubtitleId(id))
        }}}>
        {icon && <div css={flagStyle}>{icon}</div>}
        <div css={titleStyle}>{title ?? t('subtitles.generic') + " " + id}</div>
      </div>
    </ThemedTooltip>
  );
};

/**
 * Actually not a button, but a container for a form that allows creating new subtitles for editing
 */
const SubtitleAddButton: React.FC<{
  subtitlesForDropdown: {id: string, tags: string[]}[]
}> = ({
  subtitlesForDropdown
}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  const dispatch = useDispatch()

  const [isPlusDisplay, setIsPlusDisplay] = useState(true)

  // Parse language data into a format the dropdown understands
  const selectData = () => {
    const data = []
    for (const subtitle of subtitlesForDropdown) {
      let lang = generateButtonTitle(subtitle.tags, t)
      data.push({label: lang ?? t('subtitles.generic') + " " + subtitle.id, value: subtitle.id})
    }
    data.sort((dat1, dat2) => dat1.label.localeCompare(dat2.label))
    return data
  }

  const onSubmit = (values: { selectedSubtitle: any; }) => {
    // Create new subtitle for the given language
    const id = values.selectedSubtitle
    const relatedSubtitle = subtitlesForDropdown.find(tag => tag.id === id)
    const tags = relatedSubtitle ? relatedSubtitle.tags : []
    dispatch(setSubtitle({identifier: id, subtitles: { cues: [], tags: tags }}))

    // Reset
    setIsPlusDisplay(true)

    // Move to editor view
    dispatch(setIsDisplayEditView(true))
    dispatch(setSelectedSubtitleId(id))
  }

  const plusIconStyle = css({
    display: isPlusDisplay ? 'block' : 'none'
  });

  const subtitleAddFormStyle = css({
    display: !isPlusDisplay ? 'flex' : 'none',
    flexDirection: 'column' as const,
    ...(flexGapReplacementStyle(30, false)),
    padding: '20px',
  });

  const createButtonStyle = css({
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    fontSize: '0.75em',
    background: 'snow',
    border: '1px solid #ccc',

    "&[disabled]": {
      opacity: '0.6',
      cursor: 'not-allowed',
    },
  });

  return (
    <ThemedTooltip title={isPlusDisplay ? t("subtitles.createSubtitleButton-tooltip") : ""}>
      <div css={[basicButtonStyle(theme), tileButtonStyle(theme), !isPlusDisplay && disableButtonAnimation]}
        role="button" tabIndex={0}
        aria-label={isPlusDisplay ? t("subtitles.createSubtitleButton-tooltip") : t("createSubtitleButton-clicked-tooltip-aria")}
        onClick={ () => setIsPlusDisplay(false) }
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          setIsPlusDisplay(false)
        }}}
        >
        <FontAwesomeIcon icon={faPlus} size="2x" css={plusIconStyle}/>
        <Form
          onSubmit={onSubmit}
          subscription={{ submitting: true, pristine: true }} // Hopefully causes less rerenders
          render={({ handleSubmit, form, submitting, pristine, values}) => (
            <form onSubmit={event => {
              handleSubmit(event)
              // // Ugly fix for form not getting updated after submit. TODO: Find a better fix
              // form.reset()
            }} css={subtitleAddFormStyle}>
                {/* TODO: Fix the following warning, caused by removing items from data:
                  MUI: You have provided an out-of-range value `undefined` for the select (name="languages") component.
                */}
                <ThemeProvider theme={subtitleSelectStyle(theme)}>
                  <Select
                    label={t("subtitles.createSubtitleDropdown-label") ?? undefined}
                    name="selectedSubtitle"
                    data={selectData()}
                  >
                  </Select>
                </ThemeProvider>

                {/* "By default disabled elements like <button> do not trigger user interactions
                 * so a Tooltip will not activate on normal events like hover. To accommodate
                 * disabled elements, add a simple wrapper element, such as a span."
                 * see: https://mui.com/material-ui/react-tooltip/#disabled-elements */}
                <ThemedTooltip title={t("subtitles.createSubtitleButton-createButton-tooltip")}>
                  <span>
                    <button css={[basicButtonStyle(theme), createButtonStyle, { width:"100%" } ]}
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
}

/**
 * Generates a title for the buttons from the tags
 */
export function generateButtonTitle(tags: string[], t: any) {
  let lang = tags.find(e => e.startsWith('lang:'))
  lang = lang ? lang.split(':')[1].trim(): undefined
  lang = languageCodeToName(lang?.trim()) ?? lang

  let cc = ''
  let type = tags.find(e => e.startsWith('type:'))
  let isCC = type ? type.split(':')[1].trim() === 'closed-caption' : undefined
  if (isCC) {
    cc = '[CC]'
  }

  let autoGen = ''
  let genType = tags.find(e => e.startsWith('generator-type:'))
  let isAutoGen = genType ? genType.split(':')[1].trim() === 'auto' : undefined
  if (isAutoGen) {
    autoGen = "(" + t('subtitles.autoGenerated') + ")"
  }

  return cc + " " + lang + " " + autoGen
}

export default SubtitleSelect;
