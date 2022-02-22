import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle, disableButtonAnimation } from "../cssStyles";
import { settings } from '../config'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-final-form";
import { Select } from "mui-rff";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
 const SubtitleSelect : React.FC<{displayEditView: (e: boolean) => void}> = (displayEditView) => {

  const subtitleSelectStyle = css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(20em, 1fr))',
    gridRowGap: '30px',
  })

  const parseCountryCode = (parseString: string) => {
    return parseString.split("_").pop();
  }

  const renderButtons = () => {
    let buttons : JSX.Element[] = []
    if (settings.subtitles.languages === undefined) {
      return buttons
    }

    // TODO: Only show buttons for languages with existing subtitles
    //  Can only complete this TODO after getting subtitles from Opencast works

    for (let lan in settings.subtitles.languages) {
      let key = lan // left side
      let value = settings.subtitles.languages[lan] // right side
      buttons.push(
        <SubtitleSelectButton title={key} iconIdentifier={parseCountryCode(value)} segmentNumber={0} key={key} displayEditView={displayEditView.displayEditView}/>
      )
    }
    return buttons
  }

  return (
    <div css={subtitleSelectStyle}>
      {renderButtons()}
      {/* TODO: Only show the add button when there are still languages to add*/}
      <SubtitleAddButton languages={settings.subtitles.languages} />
    </div>
  );
}

const SubtitleSelectButton: React.FC<{
  title: string, iconIdentifier: string | undefined, segmentNumber: number, displayEditView: (e: boolean) => void
}> = ({
  title, iconIdentifier, segmentNumber, displayEditView
}) => {

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
    <div css={[basicButtonStyle, tileButtonStyle]}
      role="button" tabIndex={0}
      onClick={ () => displayEditView(true) }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        displayEditView(true)
      }}}
      >
      {iconIdentifier && getFlagEmoji(iconIdentifier) && <div css={flagStyle}>{getFlagEmoji(iconIdentifier)}</div>}
      <div css={titleStyle}>{title}</div>
    </div>
  );
};

const SubtitleAddButton: React.FC<{languages: {[key: string]: string} | undefined}> = ({languages}) => {

  const { t } = useTranslation();

  const [isPlusDisplay, setIsPlusDisplay] = useState(true)

  // Parse language data into a format the dropdown understands
  const selectData = () => {
    const data = []
    for (let lan in languages) {
      data.push({label: lan, value: lan})
    }
    return data
  }

  const onSubmit = (values: { languages: any; }) => {
    // TODO: Create new subtitle in redux
    console.log(values.languages)
    setIsPlusDisplay(true)
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
    <div css={[basicButtonStyle, tileButtonStyle, !isPlusDisplay && disableButtonAnimation]}
      role="button" tabIndex={0}
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

              <Select // {...input}
                // styles={selectFieldTypeStyle}
                label={t("subtitles.createSubtitleDropdownLabel")}
                name="languages"
                data={selectData()}
              >
              </Select>

              <button css={[basicButtonStyle, createButtonStyle]}
                type="submit"
                title={t("subtitles.createSubtitleButtonTooltip")}
                aria-label={t("subtitles.createSubtitleButtonTooltip")}
                disabled={submitting || pristine}>
                  {t("subtitles.createSubtitleButton")}
              </button>

          </form>
        )}
      />
    </div>
  );
}


export default SubtitleSelect;
