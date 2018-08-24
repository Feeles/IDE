import React from 'react';
import HardwareDesktopWindows from 'material-ui/svg-icons/hardware/desktop-windows';
import ContentReply from 'material-ui/svg-icons/content/reply';
import AvMusicVideo from 'material-ui/svg-icons/av/music-video';
import ContentCreate from 'material-ui/svg-icons/content/create';
import MapsMap from 'material-ui/svg-icons/maps/map';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import ActionTouchApp from 'material-ui/svg-icons/action/touch-app';
import FileFolderOpen from 'material-ui/svg-icons/file/folder-open';
import ActionSettingsApplications from 'material-ui/svg-icons/action/settings-applications';
import ActionCopyright from 'material-ui/svg-icons/action/copyright';

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
    name: 'ScreenShotCard',
    icon: <ImagePhotoCamera />
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
