import React from 'react';
import HardwareDesktopWindows from '@material-ui/core/icons/desktop-windows';
import ContentReply from '@material-ui/core/icons/reply';
import AvMusicVideo from '@material-ui/core/icons/music-video';
import ContentCreate from '@material-ui/core/icons/create';
import MapsMap from '@material-ui/core/icons/map';
import ImagePalette from '@material-ui/core/icons/palette';
import ActionTouchApp from '@material-ui/core/icons/touch-app';
import FileFolderOpen from '@material-ui/core/icons/folder-open';
import ActionSettingsApplications from '@material-ui/core/icons/settings-applications';
import ActionCopyright from '@material-ui/core/icons/copyright';

export default [
  {
    name: 'MonitorCard',
    icon: <HardwareDesktopWindows />
  },
  {
    name: 'ShotCard',
    icon: <ContentReply />
  },
  {
    name: 'MediaCard',
    icon: <AvMusicVideo />
  },
  {
    name: 'EditorCard',
    icon: <ContentCreate />
  },
  {
    name: 'ReadmeCard',
    icon: <MapsMap />
  },
  {
    name: 'PaletteCard',
    icon: <ImagePalette />
  },
  {
    name: 'EnvCard',
    icon: <ActionTouchApp />
  },
  {
    name: 'HierarchyCard',
    icon: <FileFolderOpen />
  },
  {
    name: 'CustomizeCard',
    icon: <ActionSettingsApplications />
  },
  {
    name: 'CreditsCard',
    icon: <ActionCopyright />
  }
];
