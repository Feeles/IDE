import React from 'react';
import HardwareDesktopWindows from '@material-ui/core/svg-icons/hardware/desktop-windows';
import ContentReply from '@material-ui/core/svg-icons/content/reply';
import AvMusicVideo from '@material-ui/core/svg-icons/av/music-video';
import ContentCreate from '@material-ui/core/svg-icons/content/create';
import MapsMap from '@material-ui/core/svg-icons/maps/map';
import ImagePalette from '@material-ui/core/svg-icons/image/palette';
import ActionTouchApp from '@material-ui/core/svg-icons/action/touch-app';
import FileFolderOpen from '@material-ui/core/svg-icons/file/folder-open';
import ActionSettingsApplications from '@material-ui/core/svg-icons/action/settings-applications';
import ActionCopyright from '@material-ui/core/svg-icons/action/copyright';

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
