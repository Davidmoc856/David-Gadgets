declare module '@tawk.to/tawk-messenger-react' {
  import * as React from 'react';

  interface TawkMessengerReactProps {
    propertyId: string;
    widgetId: string;
    customStyle?: React.CSSProperties;
    onLoad?: () => void;
  }

  const TawkMessengerReact: React.ForwardRefExoticComponent<
    TawkMessengerReactProps & React.RefAttributes<{ maximize?: () => void }>
  >;

  export default TawkMessengerReact;
}
