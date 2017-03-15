/* Constants representing where the monitor is to be displayed, in order of priority */
const MonitorTypes = {
  // If popout button is pressed
  Popout: Symbol('Popout'),
  // If monitor card is expanded and render large size
  FullScreen: Symbol('FullScreen'),
  // If monitor card is expanded
  Card: Symbol('Card'),
  // If editor is not shown
  // Default: Symbol('Default'),
  // Won't show
  // None: Symbol('None'),
};

export default MonitorTypes;

export function maxByPriority (...types) {

  const priority = [
    MonitorTypes.Popout,
    MonitorTypes.FullScreen,
    MonitorTypes.Card,
  ];

  for (const type of priority) {
    if (types.includes(type)) {
      return type;
    }
  }

  return MonitorTypes.Card;

};
