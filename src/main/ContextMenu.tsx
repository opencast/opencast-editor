import { Menu, MenuItem } from "@mui/material";
import React, { MouseEventHandler } from "react";
import { IconType } from "react-icons";

import { useTheme } from "../themes";
import { customIconStyle } from "../cssStyles";

export interface ContextMenuItem {
  name: string,
  action: MouseEventHandler,
  ariaLabel: string,
  icon?: IconType | React.FunctionComponent,
  hotKey?: string,
}

/**
 * Context menu component
 *
 * @param menuItems Menu items
 * @param children Content between the opening and the closing tag where the context menu should be triggered
 */
export const ThemedContextMenu: React.FC<{
  menuItems: ContextMenuItem[],
  children: React.ReactNode,
}> = ({
  menuItems,
  children,
}) => {

  const theme = useTheme();

  // Init state variables
  const [contextMenuPosition, setContextMenuPosition] = React.useState<{
    left: number,
    top: number,
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    setContextMenuPosition(contextMenuPosition === null
      ? { left: e.clientX + 5, top: e.clientY }
      : null,  // Prevent relocation of context menu outside the element
    );
  };

  const handleClose = () => {
    setContextMenuPosition(null);
  };

  /**
   * Handles the click on a menu item
   *
   * @param e mouse event
   * @param action menu item action
   */
  const handleAction = (e: React.MouseEvent, action: MouseEventHandler) => {
    action(e);

    // Immediately close menu after action
    handleClose();
  };

  const renderMenuItems = () => {
    return menuItems.map((menuItem, i) => (
      <MenuItem
        key={i}
        onClick={e => handleAction(e, menuItem.action)}
        sx={{
          fontFamily: "inherit",
          gap: "15px",
        }}
        aria-label={menuItem.ariaLabel}
      >
        {menuItem.icon &&
          <menuItem.icon css={customIconStyle}/>
        }
        <div css={{ flexGrow: 1 }}>
          {menuItem.name}
        </div>
        {menuItem.hotKey &&
          <div css={{
            fontSize: "0.875em",
            opacity: 0.7,
          }}>
            {menuItem.hotKey}
          </div>
        }
      </MenuItem>
    ));
  };

  return (
    <div
      onContextMenu={handleContextMenu}
    >
      {children}

      <Menu
        open={contextMenuPosition !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenuPosition ?? undefined}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: `${theme.contextMenu}`,
              color: `${theme.text}`,
            },
          },
        }}
        transitionDuration={0}  // Allow quick re-opening of menu elsewhere by double-clicking the secondary button
      >
        { renderMenuItems() }
      </Menu>
    </div>
  );
};
