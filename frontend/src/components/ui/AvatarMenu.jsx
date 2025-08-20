// src/components/ui/AvatarMenu.jsx
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// expect a named export 'logout' in your authSlice.js
import { logout } from '@/store/authSlice.js';

export default function AvatarMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth || {});
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const initials =
    user?.name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={() => setOpen(true)}
        size="small"
        sx={{
          border: '1px solid #1A1F1D',
          backgroundColor: '#0F1412',
          '&:hover': { backgroundColor: '#111815' },
        }}
      >
        <Avatar
          sx={{ width: 36, height: 36, bgcolor: '#22C55E', color: '#06140B', fontWeight: 700 }}
          src={user?.avatarUrl || undefined}
          alt={user?.name || 'User'}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            mt: 1,
            bgcolor: '#0F1412',
            border: '1px solid #1A1F1D',
            color: '#E5E7EB',
            minWidth: 200,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            setOpen(false);
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: '#22C55E' }} />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/dashboard');
            setOpen(false);
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" sx={{ color: '#22C55E' }} />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/settings');
            setOpen(false);
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: '#22C55E' }} />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider sx={{ borderColor: '#1A1F1D' }} />
        <MenuItem
          onClick={() => {
            dispatch(logout());
            setOpen(false);
            navigate('/');
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
