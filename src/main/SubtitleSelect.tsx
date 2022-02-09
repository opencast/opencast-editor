import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
 const SubtitleSelect : React.FC<{}> = () => {

  // Some dummy data for testing. TBD.
  const fillerInfo: [string, string, number][] = [
    ["Deutsch", "DE", 50],
    ["Deutsch (Gehörlos)", "DE", 5],
    ["English", "US", 0],
    ["English", "GB", 5001],
    ["Deutsch", "DE", 5],
    ["Donaudampfschifffahrtsgesellschaft", "DE", 5],
    ["Deutsch", "DE", 5],
    ["Deutsch", "DE", 5],
    ["Deutsch", "DE", 5],
    ["🦝", "🦝", 0],
  ]

  const subtitleSelectStyle = css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={subtitleSelectStyle}>
      {fillerInfo.map(function(subtitle){
        return <SubtitleSelectButton title={subtitle[0]} iconIdentifier={subtitle[1]} segmentNumber={subtitle[2]}/>
      })}
    </div>
  );
}

const SubtitleSelectButton: React.FC<{title: string, iconIdentifier: string, segmentNumber: number}> = ({title, iconIdentifier, segmentNumber}) => {

  // const { t } = useTranslation();

  const subtitleSelectButtonStyle = css({
    width: '250px',
    height: '220px',
    flexDirection: 'column' as const,
    fontSize: "x-large",
    ...(flexGapReplacementStyle(30, false)),
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    wordWrap: 'break-word',
    display: 'flex'
  });

  const flagStyle = css({
    fontSize: '2em',
  });

  const titleStyle = css({

  })

  const infoStyle = css({
    fontSize: '0.75em',
  });

  /**
   * Quick and dirty function to get a flag unicode character by country code
   * Could use this package instead: https://www.npmjs.com/package/react-country-flag
   * @param countryCode
   * @returns
   */
  function getFlagEmoji(countryCode: string) {
    return countryCode.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
    );
  }


  return (
    <div css={[basicButtonStyle, subtitleSelectButtonStyle]}
      role="button" tabIndex={0}
      // onClick={ finish }
      // onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
      //   finish()
      // }}}
      >
      {/* <FontAwesomeIcon  icon={iconName} size="2x"/> */}
      <div css={flagStyle}>{getFlagEmoji(iconIdentifier)}</div>
      <div css={titleStyle}>{title}</div>
      <div css={infoStyle}>{"Segments: " + segmentNumber}</div>
    </div>
  );
};


export default SubtitleSelect;
