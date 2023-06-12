import React, { useEffect } from "react";
import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle, disableButtonAnimation, subtitleSelectStyle } from "../cssStyles";
import { settings } from '../config'
import { selectSubtitles, setSelectedSubtitleFlavor, setSubtitle } from "../redux/subtitleSlice";
import { useDispatch, useSelector } from "react-redux";
import { setIsDisplayEditView } from "../redux/subtitleSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-final-form";
import { Select } from "mui-rff";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { selectCaptions } from "../redux/videoSlice";
import { selectTheme } from "../redux/themeSlice";
import { ThemeProvider } from '@mui/material/styles';
import { ThemedTooltip } from "./Tooltip";

/**
 * Displays buttons that allow the user to select the flavor/language they want to edit
 */
const SubtitleSelect : React.FC<{}> = () => {

  const { t } = useTranslation();
  const captionTracks = useSelector(selectCaptions) // track objects received from Opencast
  const subtitles = useSelector(selectSubtitles)    // parsed subtitles stored in redux

  const [displayFlavors, setDisplayFlavors] = useState<{subFlavor: string, title: string}[]>([])
  const [canBeAddedFlavors, setCanBeAddedFlavors] = useState<{subFlavor: string, title: string}[]>([])

  // Update the displayFlavors and canBeAddedFlavors
  useEffect(() => {
    let languages = { ...settings.subtitles.languages };

    // Get flavors of already created tracks or existing subtitle tracks
    let subtitleFlavors = captionTracks
      .map(track => track.flavor.type + '/' + track.flavor.subtype)
      .filter(flavor => !subtitles[flavor])
      .concat(Object.keys(subtitles));
    let tempDisplayFlavors = []
    for (const flavor of subtitleFlavors) {
      const lang = flavor.replace(/^[^+]*/, '') || t('subtitles.generic');
      tempDisplayFlavors.push({
        subFlavor: flavor,
        title: languages[flavor] || lang});
      delete languages[flavor];
    }
    tempDisplayFlavors.sort((f1, f2) => f1.title.localeCompare(f2.title));

    // List of unused languages
    let tempCanBeAddedFlavors = Object.keys(languages)
      .map(flavor => ({subFlavor: flavor, title: languages[flavor]}))
      .sort((lang1, lang2) => lang1.title.localeCompare(lang2.title));

    setDisplayFlavors(tempDisplayFlavors)
    setCanBeAddedFlavors(tempCanBeAddedFlavors)
  }, [captionTracks, subtitles, t])

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

    for (let subFlavor of displayFlavors) {
      const icon = ((settings.subtitles || {}).icons || {})[subFlavor.subFlavor];
      buttons.push(
        <SubtitleSelectButton
          title={subFlavor.title}
          icon={icon}
          flavor={subFlavor.subFlavor}
          key={subFlavor.subFlavor}
        />
      )
    }
    return buttons
  }

  return (
    <div css={subtitleSelectStyle}>
      {renderButtons()}
      {/* TODO: Only show the add button when there are still languages to add*/}
      <SubtitleAddButton languages={canBeAddedFlavors} />
    </div>
  );
}

/**
 * A button that sets the flavor that should be edited
 */
const SubtitleSelectButton: React.FC<{
  title: string,
  icon: string | undefined,
  flavor: string,
}> = ({
  title,
  icon,
  flavor
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
    whiteSpace: 'nowrap',
    minWidth: 0,
  })

  return (
    <ThemedTooltip title={t("subtitles.selectSubtitleButton-tooltip", {title: title})}>
      <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
        role="button" tabIndex={0}
        aria-label={t("subtitles.selectSubtitleButton-tooltip-aria", {title: title})}
        onClick={ () => {
          dispatch(setIsDisplayEditView(true))
          dispatch(setSelectedSubtitleFlavor(flavor))
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          dispatch(setIsDisplayEditView(true))
          dispatch(setSelectedSubtitleFlavor(flavor))
        }}}>
        {icon && <div css={flagStyle}>{icon}</div>}
        <div css={titleStyle}>{title}</div>
      </div>
    </ThemedTooltip>
  );
};

/**
 * Actually not a button, but a container for a form that allows creating new flavors for editing
 */
const SubtitleAddButton: React.FC<{languages: {subFlavor: string, title: string}[]}> = ({languages}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  const dispatch = useDispatch()

  const [isPlusDisplay, setIsPlusDisplay] = useState(true)

  // Parse language data into a format the dropdown understands
  const selectData = () => {
    const data = []
    for (const lan of languages) {
      data.push({label: lan.title, value: lan.subFlavor})
    }
    return data
  }

  const onSubmit = (values: { languages: any; }) => {
    // Create new subtitle for the given flavor
    dispatch(setSubtitle({identifier: values.languages, subtitles: []}))

    // Reset
    setIsPlusDisplay(true)

    // Move to editor view
    dispatch(setIsDisplayEditView(true))
    dispatch(setSelectedSubtitleFlavor(values.languages))
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
        aria-label={isPlusDisplay ? t("subtitles.createSubtitleButton-tooltip") : t("subtitles.createSubtitleButton-clicked-tooltip-aria")}
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
                    label={t("subtitles.createSubtitleDropdown-label")}
                    name="languages"
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

export default SubtitleSelect;
