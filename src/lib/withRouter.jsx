import { useLocation } from 'react-router-dom';

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const location = useLocation();
    
    return (
      <Component
        location={location}
        {...props}
        />
    );
  };
  
  return Wrapper;
};
