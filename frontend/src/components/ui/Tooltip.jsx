// src/components/ui/Tooltip.jsx
import { Tooltip as MUITooltip } from '@mui/material';

export default function Tooltip({ title, children, placement = 'top', arrow = true }) {
  return (
    <MUITooltip title={title} placement={placement} arrow={arrow} enterDelay={300}>
      <span className="inline-flex">{children}</span>
    </MUITooltip>
  );
}
