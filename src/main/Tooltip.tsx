import React from 'react';
import { selectTheme } from '../redux/themeSlice';
import { useSelector } from 'react-redux';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

export const ThemedTooltip = ({ className, ...props }: TooltipProps) => {

  const theme = useSelector(selectTheme);

  const positionRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const areaRef = React.useRef<HTMLDivElement>(null);
  
  return (
    <Tooltip {...props} 
      classes={{ popper: className }}
      arrow
      enterDelay={500}
      enterNextDelay={500}
      leaveDelay={150}
      placement="top"
      ref={areaRef}

      /** onMouseOut: Workaround to hide tooltip after the mouse leaves the element.
        * Else the tooltip would appear for a second where the mousepointer leaves. */
      onMouseOut={() => positionRef.current = { x: -9999, y: -9999 }}
      onMouseMove={event => positionRef.current = { x: event.clientX, y: event.clientY }}
      
      PopperProps={{
        anchorEl: {
          getBoundingClientRect: () => {
            return new DOMRect(
              positionRef.current.x,
              areaRef.current!.getBoundingClientRect().y,
              0,
              positionRef.current.y,
            );
          },
        },
      }}

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
  );
}
