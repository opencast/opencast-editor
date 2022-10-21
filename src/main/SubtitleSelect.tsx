import React, { useEffect } from "react";
import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle, disableButtonAnimation } from "../cssStyles";
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
import { makeStyles } from "@mui/styles";

/**
 * Displays buttons that allow the user to select the flavor/language they want to edit
 */
 const SubtitleSelect : React.FC<{}> = () => {

  const captionTracks = useSelector(selectCaptions) // track objects received from Opencast
  const subtitles = useSelector(selectSubtitles)    // parsed subtitles stored in redux

  const [displayFlavors, setDisplayFlavors] = useState<{subFlavor: string, title: string}[]>([])
  const [canBeAddedFlavors, setCanBeAddedFlavors] = useState<{subFlavor: string, title: string}[]>([])

  // Update the displayFlavors and canBeAddedFlavors
  useEffect(() => {
    let tempDisplayFlavors = []
    let tempCanBeAddedFlavors = []

    for (let lan in settings.subtitles.languages) {
      let found = false
      let subFlavor = lan // left side
      let name = settings.subtitles.languages[lan] // right side

      // Check if flavor already exists in the tracks from Opencast
      for (const cap of captionTracks) {
        if (cap.flavor.type+"/"+cap.flavor.subtype === subFlavor) {
          found = true
        }
      }

      // Need to check this in case of added/deleted subtitles
      // (aka changes) that are not yet published to Opencast
      for (const identifier in subtitles) {
        if (identifier === subFlavor) {
          found = true
        }
      }

      if (found) {
        tempDisplayFlavors.push({subFlavor: subFlavor, title: name})
      } else {
        tempCanBeAddedFlavors.push({subFlavor: subFlavor, title: name})
      }
    }

    setDisplayFlavors(tempDisplayFlavors)
    setCanBeAddedFlavors(tempCanBeAddedFlavors)
  }, [captionTracks, subtitles])

  // TODO: Make this function more robust
  const parseCountryCode = (parseString: string) => {
    return parseString.split("+").pop()?.slice(0, 2);
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

    for (let subFlavor of displayFlavors) {
      buttons.push(
        <SubtitleSelectButton
          title={subFlavor.title}
          iconIdentifier={parseCountryCode(subFlavor.subFlavor)}
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
  iconIdentifier: string | undefined,
  flavor: string,
}> = ({
  title,
  iconIdentifier,
  flavor
}) => {
  const { t } = useTranslation();
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()

  /**
   * Quick and dirty function to get a flag unicode character by country code
   * @param countryCode
   * @returns
   */
  function getFlagEmoji(countryCode: string) {
    var flag = countryCode.toUpperCase().replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
    const regexEscape = /[\u{1F1E6}-\u{1F1FF}]/u;
    if (regexEscape.test(flag)) {
      return flag
    }
  }

  const flagStyle = css({
    fontSize: '2em',
  });

  const titleStyle = css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  })

  return (
    <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
      role="button" tabIndex={0}
      title={t("subtitles.selectSubtitleButton-tooltip", {title: title})}
      aria-label={t("subtitles.selectSubtitleButton-tooltip-aria", {title: title})}
      onClick={ () => {
        dispatch(setIsDisplayEditView(true))
        dispatch(setSelectedSubtitleFlavor(flavor))
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        dispatch(setIsDisplayEditView(true))
        dispatch(setSelectedSubtitleFlavor(flavor))
      }}}>
      {iconIdentifier && getFlagEmoji(iconIdentifier) && <div css={flagStyle}>{getFlagEmoji(iconIdentifier)}</div>}
      <div css={titleStyle}>{title}</div>
    </div>
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

  const muiStyle = makeStyles({
    select: {
      color: `${theme.text}`,
      background: `${theme.element_bg}`,
      '& .MuiSelect-icon':{
        color: `${theme.indicator_color}`,
      },
    },
    list: {
      backgroundColor: `${theme.background}`,
      color: `${theme.text}`,
      "& li.Mui-selected":{
        backgroundColor: `${theme.selected} !important`,
        color: `${theme.selected_text}`,
      },
      "& li:hover":{
        backgroundColor: `${theme.focused} !important`,
        color: `${theme.focus_text} !important`,
        outline: 'none'
      }
    }
  });
  const styles = muiStyle()

  return (
    <div css={[basicButtonStyle(theme), tileButtonStyle(theme), !isPlusDisplay && disableButtonAnimation]}
      role="button" tabIndex={0}
      title={isPlusDisplay ? t("subtitles.createSubtitleButton-tooltip") : ""}
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

                <Select
                  className={`${styles.select}`}
                  MenuProps={{ classes: { list: styles.list } }}
                  label={t("subtitles.createSubtitleDropdown-label")}
                  name="languages"
                  data={selectData()}
                />

              <button css={[basicButtonStyle(theme), createButtonStyle]}
                type="submit"
                title={t("subtitles.createSubtitleButton-createButton-tooltip")}
                aria-label={t("subtitles.createSubtitleButton-createButton-tooltip")}
                disabled={submitting || pristine}>
                  {t("subtitles.createSubtitleButton-createButton")}
              </button>

          </form>
        )}
      />
    </div>
  );
}


export default SubtitleSelect;
