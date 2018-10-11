import React from 'react';
import HardwareDesktopWindows from '@material-ui/icons/DesktopWindows';
import ContentReply from '@material-ui/icons/Reply';
import AvMusicVideo from '@material-ui/icons/MusicVideo';
import ContentCreate from '@material-ui/icons/Create';
import MapsMap from '@material-ui/icons/Map';
import ImagePalette from '@material-ui/icons/Palette';
// import ActionTouchApp from '@material-ui/icons/TouchApp';
import FileFolderOpen from '@material-ui/icons/FolderOpen';
import ActionSettingsApplications from '@material-ui/icons/SettingsApplications';
import ActionCopyright from '@material-ui/icons/Copyright';

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
  // {
  //   name: 'EnvCard',
  //   icon: <ActionTouchApp />
  // },
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
