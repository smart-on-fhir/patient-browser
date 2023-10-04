import { useParams } from 'react-router-dom';

export const withParams = (Component) => {
  const Wrapper = (props) => {
    const params = useParams();
    
    return (
      <Component
        params={params}
        {...props}
        />
    );
  };
  
  return Wrapper;
};
