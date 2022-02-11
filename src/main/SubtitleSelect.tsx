import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles";
import { settings } from '../config'

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
    </div>
  );
}

const SubtitleSelectButton: React.FC<{
  title: string, iconIdentifier: string | undefined, segmentNumber: number, displayEditView: (e: boolean) => void
}> = ({
  title, iconIdentifier, segmentNumber, displayEditView
}) => {

  // const { t } = useTranslation();

  const subtitleSelectButtonStyle = css({
    width: '250px',
    height: '220px',
    display: 'flex',
    flexDirection: 'column' as const,
    fontSize: "x-large",
    ...(flexGapReplacementStyle(30, false)),
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    alignItems: 'unset',  // overwrite from basicButtonStyle to allow for textOverflow to work
    placeSelf: 'center',
  });

  const flagStyle = css({
    fontSize: '2em',
  });

  const titleStyle = css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  })

  const infoStyle = css({
    fontSize: '0.75em',
  });

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


  return (
    <div css={[basicButtonStyle, subtitleSelectButtonStyle]}
      role="button" tabIndex={0}
      onClick={ () => displayEditView(true) }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        displayEditView(true)
      }}}
      >
      <div css={flagStyle}>{iconIdentifier && getFlagEmoji(iconIdentifier)}</div>
      <div css={titleStyle}>{title}</div>
      <div css={infoStyle}>{"Segments: " + segmentNumber}</div>
    </div>
  );
};


export default SubtitleSelect;
