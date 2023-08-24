import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import Select from "react-select";
import { selectFieldStyle, titleStyle, titleStyleBold } from "../cssStyles";
import { css } from '@emotion/react'
import i18next from "i18next";

const LanguageSwitcher: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  const changeLanguage = (lng: string | undefined) => {
    i18next.changeLanguage(lng);
  }

  const languageNames = (language: string) => {
    return new Intl.DisplayNames([language], {
      type: 'language'
    }).of(language);
  }

  const resourcesArray: string[] | undefined = i18next.options.resources && Object.keys(i18next.options.resources);

  const languages = resourcesArray?.map(entry => {
    return { value: entry, label: languageNames(entry) }
  })

  const baseStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  })

  const dropdownStyle = css({
    outline: `${theme.element_outline}`,
    borderRadius: '5px',
    minWidth: '50vw',
  })

  return (
    <div css={baseStyle}>
      <div css={[titleStyle(theme), titleStyleBold(theme)]}>{t('language.language')}</div>
      <Select styles={selectFieldStyle(theme)}
        css={dropdownStyle}
        defaultValue = {{
          value: i18next.resolvedLanguage,
          label: languageNames(i18next.resolvedLanguage!)
        }}
        options={languages}
        onChange={lng => changeLanguage(lng!.value)}
        aria-label={t('theme.selectThemesLabel')}
      />
    </div>
  )
}

export default LanguageSwitcher;
