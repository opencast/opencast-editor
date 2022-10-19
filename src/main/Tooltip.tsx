import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import { selectTheme } from '../redux/themeSlice';
import { useSelector } from 'react-redux';

export const ThemedTooltip = ({ className, ...props }: TooltipProps) => {
const theme = useSelector(selectTheme)

  return(
    <Tooltip {...props} 
      classes={{ popper: className }}
      arrow={true}
      enterDelay={500}
      enterNextDelay={500}

      componentsProps={{
        tooltip: {
          sx:{
            backgroundColor: `${theme.tooltip}`,
            outline: '2px solid transparent',
            color: `${theme.tooltip_text}`,
            fontSize: '16px',
            lineHeight: 'normal',
            fontFamily: 'Open Sans',
          }
        },
        arrow: {
          sx:{
            color: `${theme.tooltip}`,
          }
        }
      }}
    />
  )
}
